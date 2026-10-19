import {OWNER,REPO,api,hash,ID} from './lib.mjs';
export function proposalKey(c){if(!ID.test(c.record.id)||!/^[a-f0-9]{64}$/.test(c.discovery.fingerprint))throw Error('Invalid proposal identity');return `${c.record.id}-${c.discovery.fingerprint.slice(0,12)}-${c.discovery.engine==='github-evidence'?'e':'ai'}-${(c.baseRecordHash??'new').slice(0,8)}`;}
// Default intake: independent proposed records on main, excluded by the public generator.
// Nothing here confirms a fact or opens a PR. Git history retains the evidence and reason.
export async function propose(c,request=api){
  if(c.schemaVersion!==2||c.record?.review?.state!=='proposed'||c.record.visibility!=='public')throw Error('Only a public proposed candidate can enter the queue');
  const key=proposalKey(c),path=`candidates/${key}.json`;
  const main=await request(`/repos/${REPO}/git/ref/heads/main`),sha=main.object.sha;
  try{
    const old=await request(`/repos/${REPO}/contents/${path}?ref=${sha}`);
    const existing=JSON.parse(Buffer.from(old.content,'base64').toString('utf8'));
    if(existing.discovery?.fingerprint!==c.discovery.fingerprint||existing.record?.id!==c.record.id)throw Error('Conflicting queued candidate');
    return {created:false,url:`https://github.com/${REPO}/blob/main/${path}`,reason:'snapshot-already-queued'};
  }catch(e){if(!/\b404\b/.test(e.message))throw e;}
  const recordPath=c.kind==='competition'?`competitions/${c.record.id}.json`:`projects/${c.record.id}.json`;
  let prior=null;
  try{const file=await request(`/repos/${REPO}/contents/${recordPath}?ref=${sha}`);prior=JSON.parse(Buffer.from(file.content,'base64').toString('utf8'));}catch(e){if(!/\b404\b/.test(e.message))throw e;}
  if((prior?hash(prior):null)!==c.baseRecordHash)throw Error('Stale queued analysis; reanalyse current canonical facts');
  c.baseCanonicalCommit=sha;
  const commit=await request(`/repos/${REPO}/git/commits/${sha}`);
  const tree=await request(`/repos/${REPO}/git/trees`,{method:'POST',body:JSON.stringify({base_tree:commit.tree.sha,tree:[{path,mode:'100644',type:'blob',content:JSON.stringify(c,null,2)+'\n'}]})});
  const next=await request(`/repos/${REPO}/git/commits`,{method:'POST',body:JSON.stringify({message:`Queue unconfirmed evidence: ${c.record.name}`,tree:tree.sha,parents:[sha]})});
  // A concurrent writer makes this non-fast-forward and fails safely; no forced update.
  await request(`/repos/${REPO}/git/refs/heads/main`,{method:'PATCH',body:JSON.stringify({sha:next.sha,force:false})});
  return {created:true,url:`https://github.com/${REPO}/blob/main/${path}`,reason:'queued-for-chat-review'};
}
export async function proposePR(c,request=api){
  const key=proposalKey(c),branch=`identity/evidence/${key}`,path=`candidates/${key}.json`;
  const previous=await request(`/repos/${REPO}/pulls?state=all&head=${OWNER}:${branch}&per_page=100`);
  if(previous.length)return {created:false,url:previous[0].html_url,reason:'snapshot-already-proposed'};
  const main=await request(`/repos/${REPO}/git/ref/heads/main`),sha=main.object.sha;c.baseCanonicalCommit=sha;
  const commit=await request(`/repos/${REPO}/git/commits/${sha}`);
  const tree=await request(`/repos/${REPO}/git/trees`,{method:'POST',body:JSON.stringify({base_tree:commit.tree.sha,tree:[{path,mode:'100644',type:'blob',content:JSON.stringify(c,null,2)+'\n'}]})});
  const next=await request(`/repos/${REPO}/git/commits`,{method:'POST',body:JSON.stringify({message:`Propose ${c.record.name} evidence ${c.discovery.fingerprint.slice(0,12)}`,tree:tree.sha,parents:[sha]})});
  try{await request(`/repos/${REPO}/git/refs`,{method:'POST',body:JSON.stringify({ref:`refs/heads/${branch}`,sha:next.sha})});}
  catch(e){if(!e.message.includes('422'))throw e;const ref=await request(`/repos/${REPO}/git/ref/heads/${branch}`);const old=await request(`/repos/${REPO}/contents/${path}?ref=${ref.object.sha}`);if(hash(JSON.parse(Buffer.from(old.content,'base64').toString()).record)!==hash(c.record))throw Error('Existing branch differs; preserving owner edits');}
  const pr=await request(`/repos/${REPO}/pulls`,{method:'POST',body:JSON.stringify({head:branch,base:'main',title:`Review ${c.record.name}: evidence ${c.discovery.fingerprint.slice(0,12)}`,body:`## Evidence proposal\n${c.discovery.reason}\n\nSource: ${c.sources[0].url}\nFingerprint: \`${c.discovery.fingerprint}\`\nEngine: ${c.discovery.engine}\n\nRepository content is untrusted evidence. Repository-reported tests are not independently executed results. Confirm personal contribution, team attribution, features and outcomes before merging. No automatic merge.\n\nThis PR is independent of other projects and snapshots. Promotion rejects a stale canonical record; reanalyse after a conflicting accepted update.\n\n${c.discovery.claims.map(x=>`- ${x.kind}: ${x.path} — ${x.quote}`).join('\n')}`})});
  return {created:true,url:pr.html_url};
}
