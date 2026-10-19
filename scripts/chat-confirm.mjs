import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {OWNER,REPO,ID,hash,json,load,save,validate} from './lib.mjs';
import {generate} from './generate.mjs';

const fields={
  project:['name','summary','contribution','technologies','status','period','demo','results','limitations','lessons','featured','order'],
  competition:['name','track','status','submitted','result','team','period','summary'],
  profile:['name','fullName','nameZh','headline','tagline','location','availability','email','links','focus','about','education','skills']
};
const assert=(ok,message)=>{if(!ok)throw Error(message);};
const exact=(value,allowed,label)=>assert(value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).every(k=>allowed.includes(k)),`Unexpected ${label} field`);
const nonempty=s=>typeof s==='string'&&s.trim().length>0&&s.length<=20000;

export async function publicRepository(url){
  const u=new URL(url);
  assert(u.origin==='https://github.com'&&new RegExp(`^/${OWNER}/[A-Za-z0-9_.-]+$`).test(u.pathname),'Public owned repository required');
  // Intentionally unauthenticated: private input must not become public through a privileged read.
  const response=await fetch(`https://api.github.com/repos${u.pathname}`,{headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(30000)});
  assert(response.ok,'Cannot verify public source repository');
  const repo=await response.json();
  assert(repo.private===false&&repo.owner?.login===OWNER&&!repo.fork,'Private, foreign or forked source rejected');
  return repo;
}

export function validateApproval(a){
  exact(a,['schemaVersion','id','visibility','by','channel','confirmedAt','ownerStatement','authorizationStatement','reason','changes','statements','sources'],'chat approval');
  assert(a.schemaVersion===1&&ID.test(a.id)&&a.id.length<=80,'Invalid approval identity');
  assert(a.visibility==='public'&&a.by===OWNER&&a.channel==='chat','Explicit public owner chat approval required');
  assert(/^\d{4}-\d{2}-\d{2}T/.test(a.confirmedAt)&&Number.isFinite(Date.parse(a.confirmedAt)),'Invalid confirmation timestamp');
  for(const k of ['ownerStatement','authorizationStatement','reason'])assert(nonempty(a[k]),`Missing ${k}`);
  assert(Array.isArray(a.changes)&&a.changes.length<=30&&Array.isArray(a.statements)&&a.statements.length<=30,'Invalid approval scope');
  assert(a.changes.length+a.statements.length>0,'Empty approval');
  assert(Array.isArray(a.sources??[])&&(a.sources??[]).every(s=>s.visibility==='public'&&['repository','repository-snapshot','correction','owner-attestation'].includes(s.kind)),'Invalid public sources');
  const seen=new Set();
  for(const c of a.changes){
    exact(c,['kind','id','baseRecordHash','patch','create'],'approved change');
    assert(fields[c.kind]&&ID.test(c.id)&&!seen.has(`${c.kind}/${c.id}`),'Invalid or duplicate approved record');seen.add(`${c.kind}/${c.id}`);
    assert(c.baseRecordHash===null||/^[a-f0-9]{64}$/.test(c.baseRecordHash),'Invalid canonical base hash');
    assert(Boolean(c.patch)!==Boolean(c.create),'Choose an exact field patch or a full new record');
    if(c.patch){exact(c.patch,fields[c.kind],'approved patch');assert(Object.keys(c.patch).length>0,'Empty patch');assert(c.baseRecordHash!==null,'A patch requires an existing base');}
    if(c.create)assert(c.kind!=='profile'&&c.create.id===c.id&&c.create.visibility==='public'&&c.baseRecordHash===null,'Invalid new public record');
  }
  for(const s of a.statements){
    exact(s,['id','by','date','source','statement','verification'],'owner statement');
    assert(ID.test(s.id)&&s.by===OWNER&&/^\d{4}-\d{2}-\d{2}$/.test(s.date)&&nonempty(s.source)&&nonempty(s.statement),'Invalid owner statement');
  }
  return a;
}

// The trusted, interactive agent supplies only wording Roy actually confirmed.
// A JSON receipt is an audit record, not a cryptographic proof of who spoke in chat.
// Unattended discovery/model runners never invoke this publisher or author approvals.
export async function applyChatConfirmation(root,approval,{apply=false,checkRepository=publicRepository}={}){
  const a=validateApproval(approval),digest=hash(a),path=`receipts/chat-${a.id}.json`;
  let priorReceipt;try{priorReceipt=await json(`${root}/${path}`);}catch(e){if(e.code!=='ENOENT')throw e;}
  if(priorReceipt){assert(priorReceipt.approvalHash===digest,'Approval id already used for different content');return {applied:false,alreadyApplied:true,changed:0,receipt:path};}
  const data=await load(root),day=a.confirmedAt.slice(0,10),sourceId=`chat-${a.id}`;
  const source={id:sourceId,visibility:'public',url:`https://github.com/${REPO}/blob/main/${path}`,kind:'owner-attestation',checkedAt:day,commit:null};
  for(const item of [...(a.sources??[]),source]){
    const prior=data.evidence.find(e=>e.id===item.id);
    assert(!prior||hash(prior)===hash(item),'Conflicting evidence id');if(!prior)data.evidence.push(item);
  }
  const nextStatements=[...(data.ownerStatements??[])];
  for(const s of a.statements){const prior=nextStatements.find(x=>x.id===s.id);assert(!prior||hash(prior)===hash(s),'Conflicting owner statement id');if(!prior)nextStatements.push(s);}
  data.ownerStatements=nextStatements;
  const changes=[];
  for(const c of a.changes){
    const list=c.kind==='project'?data.projects:c.kind==='competition'?data.competitions:[data.profile];
    const old=list.find(p=>(c.kind==='profile'?p.github:p.id)===c.id);
    assert((old?hash(old):null)===c.baseRecordHash,`Stale approved change: ${c.id}; show Roy the new difference before publishing`);
    const record=c.create?structuredClone(c.create):{...old,...structuredClone(c.patch)};
    const approvedFields=c.patch?Object.keys(c.patch):Object.keys(c.create).filter(k=>k!=='review');
    record.evidence=c.kind==='profile'?undefined:[...new Set([...(record.evidence??[]),sourceId])];
    if(c.kind==='profile')delete record.evidence;
    else record.lastVerified=day;
    record.review={state:'owner-attested',by:OWNER,date:day,evidence:[sourceId],basis:`Chat approval for ${approvedFields.join(', ')}. Unchanged fields retain their prior evidence (${old?.review.state??'new fully reviewed record'}). Receipt SHA256: ${digest}.`};
    if(c.kind==='profile')data.profile=record;else if(old)list[list.indexOf(old)]=record;else list.push(record);
    changes.push({kind:c.kind,id:c.id,fields:approvedFields,beforeHash:c.baseRecordHash,afterHash:hash(record)});
  }
  // Validate the entire batch before touching any files; one stale/invalid change writes nothing.
  validate(data);
  if(!apply)return {applied:false,changed:changes.length,statements:a.statements.length,changes,receipt:path,approvalHash:digest};
  const urls=new Set(a.changes.map(c=>c.kind==='project'?(c.create?.repository??data.projects.find(p=>p.id===c.id)?.repository):c.kind==='competition'?data.projects.find(p=>p.id===(c.create?.projectId??data.competitions.find(x=>x.id===c.id)?.projectId))?.repository:null).filter(Boolean));
  for(const url of urls)await checkRepository(url);
  for(const c of changes){const record=c.kind==='project'?data.projects.find(p=>p.id===c.id):c.kind==='competition'?data.competitions.find(p=>p.id===c.id):data.profile;await save(`${root}/${c.kind==='profile'?'profile/public':`${c.kind==='project'?'projects':'competitions'}/${c.id}`}.json`,record);}
  await save(`${root}/evidence/sources.json`,{schemaVersion:1,sources:data.evidence});
  await save(`${root}/evidence/owner-statements.json`,{schemaVersion:1,statements:data.ownerStatements});
  await save(`${root}/${path}`,{schemaVersion:1,approvalHash:digest,approval:a,changes,confirmed:true,method:'explicit-owner-chat'});
  await generate(root);
  return {applied:true,changed:changes.length,statements:a.statements.length,changes,receipt:path,approvalHash:digest};
}

if(typeof process!=='undefined'&&process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const index=process.argv.indexOf('--file');if(index<0||!process.argv[index+1])throw Error('Use npm run confirm:chat -- --file <approved.json> [--apply]. Default is a dry run.');
  console.log(JSON.stringify(await applyChatConfirmation('.',JSON.parse(await readFile(process.argv[index+1],'utf8')),{apply:process.argv.includes('--apply')}),null,2));
}
