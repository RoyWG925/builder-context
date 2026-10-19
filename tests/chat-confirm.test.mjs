import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {load,hash,json,save,publicBundle} from '../scripts/lib.mjs';
import {applyChatConfirmation,validateApproval} from '../scripts/chat-confirm.mjs';
import {propose,proposalKey} from '../scripts/proposals.mjs';
import {normalize} from '../scripts/evidence.mjs';
const assertPublic=async()=>({private:false,owner:{login:'RoyWG925'}});
async function fixture(){const root=await mkdtemp(join(tmpdir(),'roy-chat-unit-'));for(const dir of ['profile','projects','competitions','evidence','templates'])await cp(dir,join(root,dir),{recursive:true});return root;}
async function approval(root){const record=(await load(root)).projects.find(p=>p.id==='viral-town');return {schemaVersion:1,id:'isolated-chat-test',visibility:'public',by:'RoyWG925',channel:'chat',confirmedAt:'2026-10-19T13:32:21Z',ownerStatement:'ISOLATED confirmed contribution',authorizationStatement:'Publish this exact contribution.',reason:'Owner clarified their role',changes:[{kind:'project',id:record.id,baseRecordHash:hash(record),patch:{contribution:'ISOLATED confirmed contribution'}}],statements:[]};}

test('chat confirmation needs no PR and changes only explicitly approved fields',async()=>{
  const root=await fixture(),before=await load(root),a=await approval(root);
  const result=await applyChatConfirmation(root,a,{apply:true,checkRepository:assertPublic});
  assert.equal(result.applied,true);const after=await load(root),old=before.projects.find(p=>p.id==='viral-town'),record=after.projects.find(p=>p.id===old.id);
  assert.equal(record.contribution,a.changes[0].patch.contribution);assert.equal(record.review.state,'owner-attested');
  for(const field of ['summary','technologies','results','featured','status'])assert.deepEqual(record[field],old[field]);
  assert.equal(record.review.pr,undefined);assert.equal((await json(join(root,result.receipt))).approvalHash,hash(a));
  assert.equal(JSON.parse(await import('node:fs/promises').then(fs=>fs.readFile(join(root,'generated/public.json'),'utf8'))).revision,publicBundle(after).revision);
});
test('dry-run previews exact scope and does not write canonical facts or a receipt',async()=>{
  const root=await fixture(),a=await approval(root),before=hash(await load(root));
  assert.equal((await applyChatConfirmation(root,a)).applied,false);assert.equal(hash(await load(root)),before);
  await assert.rejects(readdir(join(root,'receipts')),/ENOENT/);
});
test('stale or invalid batch fails before any write, including unrelated earlier changes',async()=>{
  const root=await fixture(),a=await approval(root),before=hash(await load(root));
  const second=(await load(root)).projects.find(p=>p.id!=='viral-town');
  a.changes.push({kind:'project',id:second.id,baseRecordHash:'0'.repeat(64),patch:{summary:'ISOLATED stale'}});
  await assert.rejects(applyChatConfirmation(root,a,{apply:true,checkRepository:assertPublic}),/Stale/);assert.equal(hash(await load(root)),before);
});
test('blank approvals, outsider identity, private scope and unapproved fields fail closed',async()=>{
  const root=await fixture();for(const mutate of [a=>a.by='outsider',a=>a.visibility='private',a=>a.ownerStatement='',a=>a.authorizationStatement='',a=>a.changes[0].patch.review={state:'owner-confirmed'},a=>a.changes[0].patch.privateNotes='secret',a=>a.statements.push({id:'private',by:'RoyWG925',date:'2026-10-19',source:'chat',statement:'x',privateNotes:'secret'})]){const a=await approval(root);mutate(a);assert.throws(()=>validateApproval(a));}
});
test('same approval is idempotent and cannot be reused with different content',async()=>{
  const root=await fixture(),a=await approval(root);await applyChatConfirmation(root,a,{apply:true,checkRepository:assertPublic});const before=hash(await load(root));
  assert.equal((await applyChatConfirmation(root,a,{apply:true,checkRepository:assertPublic})).alreadyApplied,true);assert.equal(hash(await load(root)),before);
  a.reason='Changed';await assert.rejects(applyChatConfirmation(root,a,{apply:true,checkRepository:assertPublic}),/already used/);
});
test('public source verification failure prevents all writes',async()=>{
  const root=await fixture(),a=await approval(root),before=hash(await load(root));
  await assert.rejects(applyChatConfirmation(root,a,{apply:true,checkRepository:async()=>{throw Error('Private source');}}),/Private/);assert.equal(hash(await load(root)),before);
});
test('invalid award and unknown evidence remain rejected through the chat path',async()=>{
  const root=await fixture(),a=await approval(root),competition=(await load(root)).competitions[0];
  a.changes=[{kind:'competition',id:competition.id,baseRecordHash:hash(competition),patch:{status:'awarded',result:null}}];
  await assert.rejects(applyChatConfirmation(root,a,{apply:true,checkRepository:assertPublic}),/Award/);
});
test('a fully reviewed new public project can be created without PR metadata',async()=>{
  const root=await fixture(),a=await approval(root),base=(await load(root)).projects[0];
  a.changes=[{kind:'project',id:'isolated-new-project',baseRecordHash:null,create:{...base,id:'isolated-new-project',name:'ISOLATED new project',repository:'https://github.com/RoyWG925/isolated-new-project',featured:false}}];
  await applyChatConfirmation(root,a,{apply:true,checkRepository:assertPublic});assert.ok((await load(root)).projects.some(p=>p.id==='isolated-new-project'));
});
test('confirmed statements enter shared context without accepting an entire pending project',async()=>{
  const root=await fixture(),a=await approval(root),before=(await load(root)).projects.length;
  a.changes=[];a.statements=[{id:'isolated-solo',by:'RoyWG925',date:'2026-10-19',source:'Explicit owner chat',statement:'ISOLATED solo authorship only'}];
  await applyChatConfirmation(root,a,{apply:true,checkRepository:assertPublic});const after=await load(root);assert.equal(after.projects.length,before);assert.ok(publicBundle(after).ownerStatements.some(s=>s.id==='isolated-solo'));
});
test('pending queue is independent, deduplicates and never creates or merges a PR',async()=>{
  const files=new Map(),calls=[];
  async function request(path,options={}){calls.push([path,options.method??'GET']);if(path.endsWith('/git/ref/heads/main'))return {object:{sha:'a'.repeat(40)}};
    if(path.includes('/contents/')){const p=path.split('/contents/')[1].split('?')[0];if(files.has(p))return {content:Buffer.from(files.get(p)).toString('base64')};throw Error('GitHub 404');}
    if(path.includes('/git/commits/')&&!options.method)return {tree:{sha:'b'.repeat(40)}};
    if(path.endsWith('/git/trees')){for(const item of JSON.parse(options.body).tree)files.set(item.path,item.content);}
    return {sha:'c'.repeat(40)};}
  const repo=n=>({name:n,html_url:`https://github.com/RoyWG925/${n}`,full_name:`RoyWG925/${n}`,owner:{login:'RoyWG925'},private:false,fork:false});
  const pack={commit:'b'.repeat(40),fingerprint:'d'.repeat(64),checks:[],warning:'isolated'};
  const one=normalize(repo('isolated-one'),pack,null),two=normalize(repo('isolated-two'),pack,null);
  assert.equal((await propose(one,request)).created,true);assert.equal((await propose(two,request)).created,true);assert.equal((await propose(one,request)).created,false);
  assert.equal(files.size,2);assert.equal(JSON.parse(files.get(`candidates/${proposalKey(one)}.json`)).record.review.state,'proposed');
  assert.ok(calls.every(([path])=>!path.includes('/pulls')));
});
