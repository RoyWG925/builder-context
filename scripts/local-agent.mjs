import {readFile,mkdir,open,unlink} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {homedir} from 'node:os';
import {OWNER,REPO,hash,save,json} from './lib.mjs';
import {inventory,collect,normalize} from './evidence.mjs';
import {propose} from './proposals.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
export function run(command,args,{input='',cwd=root,env=process.env,timeout=60000}={}){return new Promise((resolve,reject)=>{
  const child=spawn(command,args,{cwd,env,windowsHide:true,stdio:['pipe','pipe','pipe'],shell:false});let stdout='',stderr='';
  const timer=setTimeout(()=>{child.kill();reject(Error('Command timed out; no proposal published'));},timeout);
  child.stdout.on('data',b=>{stdout+=b;if(stdout.length>4000000)child.kill();});child.stderr.on('data',b=>{stderr+=b;if(stderr.length>100000)stderr=stderr.slice(-100000);});
  child.on('error',e=>{clearTimeout(timer);reject(e);});child.on('close',code=>{clearTimeout(timer);code===0?resolve(stdout):reject(Error(`${command} exited ${code}: ${stderr.slice(-3000)}`));});child.stdin.on('error',()=>{});child.stdin.end(input);
});}
// The model subprocess never receives GitHub or model API credentials through its environment.
export function agentEnvironment(source=process.env){return Object.fromEntries(Object.entries(source).filter(([k])=>!/^(GH_TOKEN|GITHUB_TOKEN|OPENAI_API_KEY|OPENAI_BASE_URL|ANTHROPIC_API_KEY|ANTHROPIC_AUTH_TOKEN|ANTHROPIC_BASE_URL|CLAUDE_CODE_USE_BEDROCK|CLAUDE_CODE_USE_VERTEX|CLAUDE_CODE_USE_FOUNDRY|IDENTITY_AI_.*)$/i.test(k)));}
export async function ghRequest(path,options={}){
  if(!path.startsWith('/')||path.startsWith('//'))throw Error('Relative GitHub path required');
  const args=['api',path,'--method',options.method??'GET','-H','Accept: application/vnd.github+json'];if(options.body)args.push('--input','-');
  try{return JSON.parse(await run('gh',args,{input:options.body??''}));}catch(e){throw Error(`GitHub CLI request failed (${path}); run gh auth login -h github.com. ${e.message}`);}
}
export function analysisSchema(){
  const nullableText={type:['string','null']},nullableList={type:['array','null'],items:{type:'string'}};
  return {type:'object',additionalProperties:false,required:['updates','skipped'],properties:{updates:{type:'array',items:{type:'object',additionalProperties:false,required:['repository','reason','summary','contribution','technologies','results','limitations','claims'],properties:{repository:{type:'string'},reason:{type:'string'},summary:nullableText,contribution:nullableText,technologies:nullableList,results:nullableList,limitations:nullableList,claims:{type:'array',items:{type:'object',additionalProperties:false,required:['kind','path','quote'],properties:{kind:{type:'string',enum:['feature','technology','result','contribution','limitation']},path:{type:'string'},quote:{type:'string'}}}}}}},skipped:{type:'array',items:{type:'object',additionalProperties:false,required:['repository','reason'],properties:{repository:{type:'string'},reason:{type:'string'}}}}}};
}
export function validateAnalysis(answer,packs){
  if(!answer||Object.keys(answer).some(k=>!['updates','skipped'].includes(k))||!Array.isArray(answer.updates)||!Array.isArray(answer.skipped))throw Error('Invalid agent response');
  const seen=new Set();for(const row of [...answer.updates,...answer.skipped]){if(!packs.some(p=>p.repository===row.repository)||seen.has(row.repository)||typeof row.reason!=='string'||!row.reason.trim())throw Error('Unknown, duplicate or unexplained repository');seen.add(row.repository);}
  if(seen.size!==packs.length)throw Error('Agent must account for every supplied repository');
  for(const u of answer.updates){if(Object.keys(u).some(k=>!['repository','reason','summary','contribution','technologies','results','limitations','claims'].includes(k)))throw Error('Unexpected AI output field');for(const field of ['summary','contribution'])if(u[field]!==null&&typeof u[field]!=='string')throw Error('Invalid AI text');for(const field of ['technologies','results','limitations'])if(u[field]!==null&&(!Array.isArray(u[field])||u[field].some(v=>typeof v!=='string')))throw Error('Invalid AI list');}
  return answer;
}
export async function maintain(args=process.argv.slice(2)){
  const configPath=resolve(args.includes('--config')?args[args.indexOf('--config')+1]:join(root,'local/config.example.json'));
  const config=await json(configPath),stateDir=resolve(dirname(configPath),config.stateDirectory??'local-state');await mkdir(stateDir,{recursive:true});
  const lockPath=join(stateDir,'run.lock');let lock;try{lock=await open(lockPath,'wx');}catch{throw Error(`Another run or interrupted run lock exists: ${lockPath}. Check for active runs before removing it.`);}
  try{
    if((await ghRequest('/user')).login!==OWNER)throw Error(`GitHub CLI must be logged in as ${OWNER}`);
    // Fetch a single canonical commit, rather than trusting an old local checkout.
    const canonicalCommit=(await ghRequest(`/repos/${REPO}/commits/main`)).sha;
    async function source(path){const f=await ghRequest(`/repos/${REPO}/contents/${path}?ref=${canonicalCommit}`);return Buffer.from(f.content,'base64').toString('utf8');}
    const context=await source('AI_CONTEXT.md'),bundle=JSON.parse(await source('generated/public.json'));
    let state;try{state=await json(join(stateDir,'state.json'));}catch{state={analysed:{}};}
    const explicit=args.includes('--repository')?args[args.indexOf('--repository')+1]:null;
    const repos=(await inventory(ghRequest)).filter(r=>(!explicit||r.name===explicit)&&(!config.repositories?.length||config.repositories.includes(r.name)));
    if(explicit&&!repos.length)throw Error('Requested repository is not eligible/public');
    const packs=[];for(const repo of repos){const p=await collect(repo,ghRequest);p.current=bundle.projects.find(x=>x.repository===repo.html_url)??null;p.analysisKey=hash([p.fingerprint,p.current?hash(p.current):null,config.engine]);if(state.analysed[p.repository]!==p.analysisKey||args.includes('--force'))packs.push(p);if(packs.length>=(config.maxRepositories??6))break;}
    if(!packs.length){console.log('No new meaningful source snapshots to analyse.');return;}
    const dir=join(stateDir,new Date().toISOString().replace(/[:.]/g,'-'));await mkdir(dir,{recursive:true});
    await save(join(dir,'evidence.json'),{canonicalCommit,revision:bundle.revision,packs});
    const schemaPath=join(dir,'schema.json'),outputPath=join(dir,'analysis.json');await save(schemaPath,analysisSchema());
    const prompt=[await readFile(join(root,'skills/roy-identity/SKILL.md'),'utf8'),await readFile(join(root,'local/analysis-prompt.md'),'utf8'),'CANONICAL COMMIT: '+canonicalCommit,'AI_CONTEXT:\n'+context,'EVIDENCE DATA:\n'+JSON.stringify(packs)].join('\n\n');
    const env=agentEnvironment(),timeout=(config.timeoutMinutes??30)*60000;let answer;
    if(config.engine==='codex'){
      const entry=config.codexEntry??join(process.env.APPDATA??join(homedir(),'.local/lib'),'npm/node_modules/@openai/codex/bin/codex.js');
      await run(process.execPath,[entry,'--ask-for-approval','never','exec','--ignore-user-config','-c','forced_login_method="chatgpt"','-c','features.shell_tool=false','-c','web_search="disabled"','-c','project_doc_max_bytes=0','--sandbox','read-only','--skip-git-repo-check','--ephemeral','--output-schema',schemaPath,'--output-last-message',outputPath,'--cd',dir,'-'],{input:prompt,cwd:dir,env,timeout});answer=await json(outputPath);
    }else if(config.engine==='claude'){
      const command=config.claudeCommand??'claude';
      const auth=JSON.parse(await run(command,['auth','status','--json'],{env}));
      if(!auth.loggedIn||!['claude.ai','oauth'].includes(auth.authMethod))throw Error('Claude subscription login required; no API fallback');
      const raw=JSON.parse(await run(command,['-p','--restricted','--permission-mode','dontAsk','--permission-prompts','none','--tools','','--strict-mcp-config','--mcp-config','{"mcpServers":{}}','--no-session-persistence','--output-format','json','--json-schema',JSON.stringify(analysisSchema())],{input:prompt,cwd:dir,env,timeout}));answer=raw.structured_output??JSON.parse(raw.result);await save(outputPath,answer);
    }else throw Error('Only local codex or claude subscription engines are supported');
    validateAnalysis(answer,packs);const prepared=[];
    for(const update of answer.updates){const pack=packs.find(p=>p.repository===update.repository),repo=repos.find(r=>r.full_name===update.repository);const c=normalize(repo,pack,pack.current,undefined,update);await save(join(dir,c.record.id+'.candidate.json'),c);prepared.push(c);}
    const publish=args.includes('--publish');for(const c of prepared){if(publish){const live=await ghRequest(`/repos${new URL(c.record.repository).pathname}`);if(live.private||live.owner.login!==OWNER)throw Error('Repository became private or changed owner; publication refused');console.log(await propose(c,ghRequest));}else console.log(`Dry run: ${c.record.name}; candidate saved in ${dir}`);}
    if(publish){for(const pack of packs)state.analysed[pack.repository]=pack.analysisKey;await save(join(stateDir,'state.json'),state);}
    await save(join(dir,'receipt.json'),{canonicalCommit,revision:bundle.revision,engine:config.engine,publish,proposed:prepared.map(c=>c.record.id),skipped:answer.skipped});
  }finally{await lock.close();await unlink(lockPath);}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await maintain();
