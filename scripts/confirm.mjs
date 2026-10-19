import {readFile} from 'node:fs/promises';
import {OWNER,REPO,api,json,save,load,validate,validateProject,validateCompetition,ID} from './lib.mjs';
import {generate} from './generate.mjs';

export function canConfirm(event) {
  const p=event?.pull_request;
  return event?.action==='closed' && p?.merged===true && p.merged_by?.login===OWNER && event.sender?.login===OWNER && p.base?.repo?.full_name===REPO && p.base?.ref==='main' && /^[a-f0-9]{40}$/.test(p.merge_commit_sha??'');
}
export async function promote(root,event,paths) {
  if(!canConfirm(event)) throw Error('Only an owner-merged PR into the canonical main branch confirms facts.');
  const files=paths.filter(f=>/^candidates\/[a-z0-9][a-z0-9-]{0,95}\.json$/.test(f));
  const data=await load(root);
  const evidence=await json(`${root}/evidence/sources.json`);
  let count=0;
  for(const file of files) {
    const c=await json(`${root}/${file}`);
    if(!['project','competition'].includes(c.kind) || !ID.test(c.record?.id) || file!==`candidates/${c.record.id}.json` || c.record.review.state!=='proposed') throw Error('Invalid proposal');
    // Check every source is a public GitHub snapshot of this exact public repository.
    for(const source of c.sources) {
      const sourceUrl=new URL(source.url),repoUrl=new URL(c.kind==='project'?c.record.repository:data.projects.find(p=>p.id===c.record.projectId)?.repository);
      if(source.visibility!=='public'||sourceUrl.origin!=='https://github.com'||!sourceUrl.pathname.startsWith(repoUrl.pathname+'/tree/')||!sourceUrl.pathname.endsWith(c.discovery.commit))throw Error('Mismatched source');
      const prior=evidence.sources.find(e=>e.id===source.id);
      if(prior&&JSON.stringify(prior)!==JSON.stringify(source))throw Error('Conflicting evidence id');
      if(!prior)evidence.sources.push(source);
    }
    const record=structuredClone(c.record);
    record.review={state:'owner-confirmed',by:OWNER,date:new Date(event.pull_request.merged_at).toISOString().slice(0,10),pr:event.pull_request.number,mergeCommit:event.pull_request.merge_commit_sha};
    const ids=new Set(evidence.sources.map(e=>e.id));
    if(c.kind==='project')validateProject(record,ids);
    else validateCompetition(record,ids,new Set(data.projects.map(p=>p.id)));
    await save(`${root}/${c.kind==='project'?'projects':'competitions'}/${record.id}.json`,record);
    // Keep an immutable accepted proposal receipt; the scanner will not replace it.
    c.record.review=record.review;
    c.confirmed=true;
    await save(`${root}/receipts/${record.id}-pr-${record.review.pr}.json`,c);
    await import('node:fs/promises').then(fs=>fs.unlink(`${root}/${file}`));
    count++;
  }
  if(count){await save(`${root}/evidence/sources.json`,evidence);validate(await load(root));await generate(root);}
  return count;
}
if(process.argv[1]?.endsWith('confirm.mjs')) {
  const event=JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH,'utf8'));
  if(!canConfirm(event)){console.log('No owner confirmation; nothing promoted.');process.exit(0);}
  const paths=[];
  for(let page=1;;page++) {
    const files=await api(`/repos/${REPO}/pulls/${event.pull_request.number}/files?per_page=100&page=${page}`);
    paths.push(...files.filter(f=>['added','modified'].includes(f.status)).map(f=>f.filename));
    if(files.length<100)break;
  }
  console.log(`Owner-confirmed ${await promote('.',event,paths)} project records.`);
}
