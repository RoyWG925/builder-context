import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {realpathSync} from 'node:fs';
import {join} from 'node:path';
import {selectEvidenceFiles,collect,normalize} from '../scripts/evidence.mjs';
import {agentEnvironment,codexExecution,run,maintain,validateAnalysis} from '../scripts/local-agent.mjs';

test('bounded evidence includes core engine, API, UI and tests even with many UI files',()=>{
  const paths=['README.md','package.json','src/sim/engine.ts','src/sim/validate.ts','src/app/api/gemma/route.ts','lab/test-engine.ts','lab/test-validators.ts','.github/workflows/test.yml',...Array.from({length:100},(_,i)=>`src/town/A${i}.tsx`)];
  const files=paths.map(path=>({path,type:'blob',size:500}));
  const selected=selectEvidenceFiles(files).map(f=>f.path);
  for(const path of paths.slice(0,8))assert.ok(selected.includes(path),path);
  assert.equal(selected.length,18);
});

test('collector pins source reads and reports bounded public coverage without running code',async()=>{
  const commit='a'.repeat(40),calls=[],files=['README.md','package.json','src/sim/engine.ts','lab/test-engine.ts'].map((path,i)=>({path,type:'blob',size:500,sha:String(i).repeat(40)}));
  const request=async path=>{calls.push(path);if(path.includes('/commits?'))return [{sha:commit}];if(path.includes('/git/trees/'))return {tree:files};if(path.includes('/git/blobs/'))return {content:Buffer.from('Public test source, not executed.').toString('base64')};if(path.includes('/actions/runs?'))return {workflow_runs:[]};throw Error('Unexpected path '+path);};
  const pack=await collect({name:'example',full_name:'RoyWG925/example',html_url:'https://github.com/RoyWG925/example',private:false,fork:false,owner:{login:'RoyWG925'}},request,{maxDocuments:3});
  assert.equal(pack.commit,commit);assert.equal(pack.documents.length,3);assert.equal(pack.coverage.complete,false);
  assert.ok(calls.includes(`/repos/RoyWG925/example/git/trees/${commit}?recursive=1`));assert.ok(calls.every(p=>!p.includes('/user/')&&!p.includes('private')));
});

test('subscription subprocess strips paid-key overrides and nested app session identifiers',()=>{
  assert.deepEqual(agentEnvironment({PATH:'bin',CODEX_HOME:'auth-location',CODEX_API_KEY:'secret',CODEX_ACCESS_TOKEN:'secret',CODEX_THREAD_ID:'parent',CODEX_INTERNAL_ORIGINATOR_OVERRIDE:'desktop',OPENAI_FEDERATION_RULE_ID:'rule',OPENAI_IDENTITY_TOKEN_FILE:'secret-path',GH_TOKEN:'secret',GITHUB_TOKEN:'secret',OPENAI_API_KEY:'secret',ANTHROPIC_API_KEY:'secret',TOKENFACTORY_API_KEY:'secret',AMD_TOKENFACTORY_API_KEY:'secret',GEMINI_API_KEY:'secret',GOOGLE_APPLICATION_CREDENTIALS:'secret-file',AWS_ACCESS_KEY_ID:'secret',AWS_SECRET_ACCESS_KEY:'secret',NODE_OPTIONS:'--import=unexpected-hook'}),{PATH:'bin',CODEX_HOME:'auth-location'});
});

test('acceptance requires a completed model turn and rejects tool actions and failed turns',()=>{
  const started={type:'thread.started',thread_id:'acceptance-fixture'},completed={type:'turn.completed',usage:{input_tokens:120,output_tokens:40}};
  const events=rows=>rows.map(x=>JSON.stringify(x)).join('\n');
  assert.equal(codexExecution(events([started,completed])).usage.output_tokens,40);
  assert.throws(()=>codexExecution(events([started])),/completed model turn/);
  assert.throws(()=>codexExecution(events([{type:'turn.failed'},completed])),/completed model turn/);
  assert.throws(()=>codexExecution(events([{type:'item.completed',item:{type:'command_execution'}},completed])),/used a tool/);
});

test('process runner retains stdout and stderr through a real nonzero exit in a path with spaces',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'identity process logs ')),stdoutPath=join(dir,'events.jsonl'),stderrPath=join(dir,'stderr.log');
  await assert.rejects(run(process.execPath,['-e','process.stdout.write("event");process.stderr.write("failure evidence");process.exitCode=7'],{cwd:dir,stdoutPath,stderrPath}),/exited 7/);
  assert.equal(await readFile(stdoutPath,'utf8'),'event');assert.equal(await readFile(stderrPath,'utf8'),'failure evidence');
});

test('a second invocation cannot acquire the first run lock or make network requests',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'identity exclusive lock ')),config=join(dir,'config.json'),lock=join(dir,'run.lock');
  await writeFile(config,JSON.stringify({engine:'codex',stateDirectory:'.'}));await writeFile(lock,'existing active invocation');
  await assert.rejects(maintain(['--config',config]),/Another run/);assert.equal(await readFile(lock,'utf8'),'existing active invocation');
  await assert.rejects(access(join(dir,'last-run.json')),/ENOENT/);
});

test('source quotes cannot silently splice separate lines into one claim',()=>{
  const repo={name:'example',full_name:'RoyWG925/example',html_url:'https://github.com/RoyWG925/example'},pack={commit:'a'.repeat(40),fingerprint:'b'.repeat(64),documents:[{path:'package.json',content:'"next": "16.4.2",\n"postprocessing": "6",\n"react": "19.3.0"'}],checks:[]};
  const analysis={summary:null,contribution:null,technologies:['React'],results:null,limitations:null,reason:'Source evidence',claims:[{kind:'technology',path:'package.json',quote:'"next": "16.4.2",\n"react": "19.3.0"'}]};
  assert.throws(()=>normalize(repo,pack,null,undefined,analysis),/Unsupported AI claim/);
  analysis.claims[0].quote='"react": "19.3.0"';assert.equal(normalize(repo,pack,null,undefined,analysis).record.review.state,'proposed');
});

test('local assessments cannot substitute another repository or omit supplied coverage',()=>{
  const packs=[{repository:'RoyWG925/example'}],answer={updates:[],skipped:[{repository:packs[0].repository,reason:'No meaningful change'}],assessments:[]};
  assert.throws(()=>validateAnalysis(answer,packs),/Missing repository assessment/);
  answer.assessments=[{repository:'other/private',attribution:'unknown',existingFacts:[],newFindings:[],technicalDecisions:[],testEvidence:[],limitations:[]}];
  assert.throws(()=>validateAnalysis(answer,packs),/Invalid repository assessment/);
});

test('Windows scheduler path helper exposes the physical path for a real directory with spaces',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'identity native directory '));
  const physical=(await run(process.execPath,['scripts/native-path.mjs',dir])).trim();
  assert.equal(physical,realpathSync.native(dir));
});
