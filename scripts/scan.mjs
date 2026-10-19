import {api,load,json,save,records,REPO} from './lib.mjs';
import {eligible,inventory,collect,normalize} from './evidence.mjs';
import {propose,proposalKey} from './proposals.mjs';
export {eligible,normalize};
export async function scan(request=api,root='.'){
  const data=await load(root),observed=await json(`${root}/evidence/observations.json`),results=[];
  const accepted=await records(root,'receipts').catch(e=>{if(e.code==='ENOENT')return [];throw e;});
  const open=[];for(let page=1;;page++){const prs=await request(`/repos/${REPO}/pulls?state=open&per_page=100&page=${page}`);open.push(...prs);if(prs.length<100)break;}
  for(const repo of await inventory(request)){
    const pack=await collect(repo,request),existing=data.projects.find(p=>p.repository===repo.html_url);
    if(data.evidence.some(e=>e.commit===pack.commit&&existing?.evidence.includes(e.id))||observed.repositories[repo.name]?.fingerprint===pack.fingerprint||accepted.some(c=>c.record?.repository===repo.html_url&&c.discovery?.fingerprint===pack.fingerprint)){results.push({repository:repo.name,reason:'accepted-or-identical-content'});continue;}
    const c=normalize(repo,pack,existing),aiKey=proposalKey({...c,discovery:{...c.discovery,engine:'local-subscription-agent'}});
    if(open.some(p=>p.head?.ref===`identity/evidence/${aiKey}`)){results.push({repository:repo.name,reason:'snapshot-covered-by-pending-ai-review'});continue;}
    results.push({repository:repo.name,...await propose(c,request)});
  }
  await save(`${root}/tmp/discovery-summary.json`,{mode:'github-evidence-only',results});return results;
}
if(process.argv[1]?.endsWith('scan.mjs'))console.log(JSON.stringify(await scan(),null,2));
