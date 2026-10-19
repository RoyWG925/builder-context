import {readFile,mkdir,open,unlink} from 'node:fs/promises';
import {createWriteStream} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {homedir} from 'node:os';
import {OWNER,REPO,hash,save,json} from './lib.mjs';
import {inventory,collect,normalize} from './evidence.mjs';
import {propose} from './proposals.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
export function run(command,args,{input='',cwd=root,env=process.env,timeout=60000,stdoutPath,stderrPath}={}){return new Promise((resolve,reject)=>{
  const child=spawn(command,args,{cwd,env,windowsHide:true,stdio:['pipe','pipe','pipe'],shell:false});let stdout='',stderr='';
  const out=stdoutPath?createWriteStream(stdoutPath):null,err=stderrPath?createWriteStream(stderrPath):null;let failure;
  const stop=message=>{failure??=Error(message);if(child.pid&&process.platform==='win32')spawn('taskkill.exe',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'}).on('error',()=>child.kill());else child.kill('SIGKILL');};
  for(const stream of [out,err])stream?.on('error',e=>stop('Unable to retain execution log: '+e.message));
  const timer=setTimeout(()=>stop('Command timed out; no proposal published'),timeout);
  child.stdout.on('data',b=>{stdout+=b;out?.write(b);if(stdout.length>4000000)stop('Command output exceeded limit; no proposal published');});child.stderr.on('data',b=>{err?.write(b);stderr+=b;if(stderr.length>100000)stderr=stderr.slice(-100000);});
  child.on('error',e=>{failure??=e;});child.on('close',async code=>{clearTimeout(timer);await Promise.all([out,err].filter(Boolean).map(s=>new Promise(r=>s.end(r))));failure?reject(failure):code===0?resolve(stdout):reject(Error(`${command} exited ${code}: ${stderr.slice(-3000)}`));});child.stdin.on('error',()=>{});child.stdin.end(input);
});}
// The model subprocess never receives GitHub or model API credentials through its environment.
export function agentEnvironment(source=process.env){return Object.fromEntries(Object.entries(source).filter(([k])=>!/(^|_)(API_KEY|API_TOKEN|ACCESS_TOKEN|AUTH_TOKEN|SECRET|TOKEN|PASSWORD|CREDENTIALS)$/i.test(k)&&!/^(AWS_.*|CODEX_THREAD_ID|CODEX_INTERNAL_.*|NODE_OPTIONS|OPENAI_BASE_URL|OPENAI_FEDERATION_RULE_ID|OPENAI_IDENTITY_TOKEN_FILE|OPENAI_WORKLOAD_IDENTITY_CONTEXT|ANTHROPIC_BASE_URL|CLAUDE_CODE_USE_BEDROCK|CLAUDE_CODE_USE_VERTEX|CLAUDE_CODE_USE_FOUNDRY|IDENTITY_AI_.*)$/i.test(k)));}
export function codexExecution(events){
  const rows=events.trim().split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line));
  const completed=rows.findLast(row=>row.type==='turn.completed');
  if(!completed||!completed.usage||rows.some(row=>['turn.failed','error'].includes(row.type)))throw Error('Codex did not report a completed model turn');
  const forbidden=rows.filter(row=>row.type==='item.completed'&&row.item&&!['agent_message','reasoning'].includes(row.item.type));
  if(forbidden.length)throw Error('Analysis unexpectedly used a tool; refusing to queue');
  return {completed:true,authentication:'chatgpt',threadId:rows.find(row=>row.type==='thread.started')?.thread_id??null,usage:completed.usage};
}
export async function ghRequest(path,options={}){
  if(!path.startsWith('/')||path.startsWith('//'))throw Error('Relative GitHub path required');
  const args=['api',path,'--method',options.method??'GET','-H','Accept: application/vnd.github+json'];if(options.body)args.push('--input','-');
  try{return JSON.parse(await run('gh',args,{input:options.body??''}));}catch(e){throw Error(`GitHub CLI request failed (${path}); run gh auth login -h github.com. ${e.message}`);}
}
export function analysisSchema(){
  const nullableText={type:['string','null']},nullableList={type:['array','null'],items:{type:'string'}};
  const texts={type:'array',items:{type:'string'}};
  const assessment={type:'object',additionalProperties:false,required:['repository','existingFacts','newFindings','technicalDecisions','testEvidence','limitations','attribution'],properties:{repository:{type:'string'},existingFacts:texts,newFindings:texts,technicalDecisions:texts,testEvidence:texts,limitations:texts,attribution:{type:'string'}}};
  return {type:'object',additionalProperties:false,required:['updates','skipped','assessments'],properties:{assessments:{type:'array',items:assessment},updates:{type:'array',items:{type:'object',additionalProperties:false,required:['repository','reason','summary','contribution','technologies','results','limitations','claims'],properties:{repository:{type:'string'},reason:{type:'string'},summary:nullableText,contribution:nullableText,technologies:nullableList,results:nullableList,limitations:nullableList,claims:{type:'array',items:{type:'object',additionalProperties:false,required:['kind','path','quote'],properties:{kind:{type:'string',enum:['feature','technology','result','contribution','limitation']},path:{type:'string'},quote:{type:'string'}}}}}}},skipped:{type:'array',items:{type:'object',additionalProperties:false,required:['repository','reason'],properties:{repository:{type:'string'},reason:{type:'string'}}}}}};
}
export function validateAnalysis(answer,packs){
  if(!answer||Object.keys(answer).some(k=>!['updates','skipped','assessments'].includes(k))||!Array.isArray(answer.updates)||!Array.isArray(answer.skipped))throw Error('Invalid agent response');
  const seen=new Set();for(const row of [...answer.updates,...answer.skipped]){if(!packs.some(p=>p.repository===row.repository)||seen.has(row.repository)||typeof row.reason!=='string'||!row.reason.trim())throw Error('Unknown, duplicate or unexplained repository');seen.add(row.repository);}
  if(seen.size!==packs.length)throw Error('Agent must account for every supplied repository');
  if(answer.assessments!==undefined){const assessed=new Set();if(!Array.isArray(answer.assessments))throw Error('Invalid assessments');for(const a of answer.assessments){if(!seen.has(a.repository)||assessed.has(a.repository)||typeof a.attribution!=='string'||['existingFacts','newFindings','technicalDecisions','testEvidence','limitations'].some(k=>!Array.isArray(a[k])||a[k].some(x=>typeof x!=='string')))throw Error('Invalid repository assessment');assessed.add(a.repository);}if(assessed.size!==packs.length)throw Error('Missing repository assessment');}
  for(const u of answer.updates){if(Object.keys(u).some(k=>!['repository','reason','summary','contribution','technologies','results','limitations','claims'].includes(k)))throw Error('Unexpected AI output field');for(const field of ['summary','contribution'])if(u[field]!==null&&typeof u[field]!=='string')throw Error('Invalid AI text');for(const field of ['technologies','results','limitations'])if(u[field]!==null&&(!Array.isArray(u[field])||u[field].some(v=>typeof v!=='string')))throw Error('Invalid AI list');}
  return answer;
}
export async function maintain(args=process.argv.slice(2)){
  const configPath=resolve(args.includes('--config')?args[args.indexOf('--config')+1]:join(root,'local/config.example.json'));
  const config=await json(configPath),stateDir=resolve(dirname(configPath),config.stateDirectory??'local-state');await mkdir(stateDir,{recursive:true});
  const lockPath=join(stateDir,'run.lock');let lock;try{lock=await open(lockPath,'wx');}catch{throw Error(`Another run or interrupted run lock exists: ${lockPath}. Check for active runs before removing it.`);}
  const status={startedAt:new Date().toISOString(),pid:process.pid,engine:config.engine,publish:args.includes('--publish'),status:'running'};
  await lock.writeFile(JSON.stringify({pid:process.pid,startedAt:status.startedAt}));
  try{
    await save(join(stateDir,'last-run.json'),status);
    if((await ghRequest('/user')).login!==OWNER)throw Error(`GitHub CLI must be logged in as ${OWNER}`);
    // Fetch a single canonical commit, rather than trusting an old local checkout.
    const canonicalCommit=(await ghRequest(`/repos/${REPO}/commits/main`)).sha;
    async function source(path){const f=await ghRequest(`/repos/${REPO}/contents/${path}?ref=${canonicalCommit}`);return Buffer.from(f.content,'base64').toString('utf8');}
    const context=await source('AI_CONTEXT.md'),bundle=JSON.parse(await source('generated/public.json'));
    const skill=await readFile(join(root,'skills/roy-identity/SKILL.md'),'utf8'),instructions=await readFile(join(root,'local/analysis-prompt.md'),'utf8');
    const contract=hash([skill.replace(/\r\n/g,'\n'),instructions.replace(/\r\n/g,'\n'),analysisSchema(),config.sourcePack??{}]);
    let state;try{state=await json(join(stateDir,'state.json'));}catch{state={analysed:{}};}
    const explicit=args.includes('--repository')?args[args.indexOf('--repository')+1]:null;
    const repos=(await inventory(ghRequest)).filter(r=>(!explicit||r.name===explicit)&&(!config.repositories?.length||config.repositories.includes(r.name)));
    if(explicit&&!repos.length)throw Error('Requested repository is not eligible/public');
    const packs=[];let promptCharacters=skill.length+instructions.length+context.length+1000;
    const maxPromptCharacters=config.maxPromptCharacters??600000;
    for(const repo of repos){
      const p=await collect(repo,ghRequest,config.sourcePack);p.current=bundle.projects.find(x=>x.repository===repo.html_url)??null;p.analysisKey=hash([p.fingerprint,p.current?hash(p.current):null,config.engine,bundle.revision,contract]);
      if(state.analysed[p.repository]!==p.analysisKey||args.includes('--force')){
        const size=JSON.stringify(p).length;
        if(promptCharacters+size>maxPromptCharacters){if(packs.length)break;throw Error('One evidence pack exceeds the prompt budget; reduce sourcePack limits before retrying');}
        packs.push(p);promptCharacters+=size;
      }
      if(packs.length>=(config.maxRepositories??6))break;
    }
    status.canonicalCommit=canonicalCommit;status.revision=bundle.revision;
    if(!packs.length){console.log('No new meaningful source snapshots to analyse.');status.status='unchanged';return;}
    const dir=join(stateDir,new Date().toISOString().replace(/[:.]/g,'-'));await mkdir(dir,{recursive:true});
    status.directory=dir;console.log(`Evidence and model logs: ${dir}`);
    await save(join(dir,'evidence.json'),{canonicalCommit,revision:bundle.revision,packs});
    const schemaPath=join(dir,'schema.json'),outputPath=join(dir,'analysis.json');await save(schemaPath,analysisSchema());
    const prompt=[skill,instructions,'CANONICAL COMMIT: '+canonicalCommit,'AI_CONTEXT:\n'+context,'EVIDENCE DATA:\n'+JSON.stringify(packs)].join('\n\n');
    const env=agentEnvironment(),timeout=(config.timeoutMinutes??30)*60000;let answer,execution;
    if(config.engine==='codex'){
      const entry=config.codexEntry??join(process.env.APPDATA??join(homedir(),'.local/lib'),'npm/node_modules/@openai/codex/bin/codex.js');
      const version=(await run(process.execPath,[entry,'--version'],{env})).trim();
      const effort=config.reasoningEffort??'high';if(!['low','medium','high','xhigh'].includes(effort))throw Error('Unsupported maintenance reasoning effort');
      const events=await run(process.execPath,[entry,'--ask-for-approval','never','exec','--ignore-user-config','-c','forced_login_method="chatgpt"','-c',`model_reasoning_effort="${effort}"`,'-c','features.shell_tool=false','-c','web_search="disabled"','-c','project_doc_max_bytes=0','--sandbox','read-only','--skip-git-repo-check','--ephemeral','--json','--output-schema',schemaPath,'--output-last-message',outputPath,'--cd',dir,'-'],{input:prompt,cwd:dir,env,timeout,stdoutPath:join(dir,'model-events.jsonl'),stderrPath:join(dir,'model-stderr.log')});execution={...codexExecution(events),cliVersion:version,reasoningEffort:effort};answer=await json(outputPath);
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
    await save(join(dir,'receipt.json'),{canonicalCommit,revision:bundle.revision,engine:config.engine,execution,publish,proposed:prepared.map(c=>c.record.id),skipped:answer.skipped});
    status.status='succeeded';status.execution=execution;status.proposed=prepared.map(c=>c.record.id);
  }catch(error){status.status='failed';status.error=error.stack??error.message;throw error;}
  finally{status.finishedAt=new Date().toISOString();try{await save(join(stateDir,'last-run.json'),status);if(status.directory)await save(join(status.directory,'status.json'),status);}finally{await lock.close();await unlink(lockPath);}}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await maintain();
