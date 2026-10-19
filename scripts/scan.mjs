import {api,load,json,save,records} from './lib.mjs';
import {eligible,inventory,collect,normalize} from './evidence.mjs';
import {propose} from './proposals.mjs';
export {eligible,normalize};
export async function scan(request=api,root='.'){
  const data=await load(root),observed=await json(`${root}/evidence/observations.json`),results=[];
  const accepted=await records(root,'receipts').catch(e=>{if(e.code==='ENOENT')return [];throw e;});
  for(const repo of await inventory(request)){
    const pack=await collect(repo,request),existing=data.projects.find(p=>p.repository===repo.html_url);
    if(data.evidence.some(e=>e.commit===pack.commit&&existing?.evidence.includes(e.id))||observed.repositories[repo.name]?.fingerprint===pack.fingerprint||accepted.some(c=>c.record?.repository===repo.html_url&&c.discovery?.fingerprint===pack.fingerprint)){results.push({repository:repo.name,reason:'accepted-or-identical-content'});continue;}
    results.push({repository:repo.name,...await propose(normalize(repo,pack,existing),request)});
  }
  await save(`${root}/tmp/discovery-summary.json`,{mode:'github-evidence-only',results});return results;
}
if(process.argv[1]?.endsWith('scan.mjs'))console.log(JSON.stringify(await scan(),null,2));
