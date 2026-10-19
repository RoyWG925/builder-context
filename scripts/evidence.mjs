import {OWNER, ID, api, hash, validateProject} from './lib.mjs';
const EXCLUDE=new Set(['builder-context','builder-context-private','RoyWG925','portfolio-astro','RoyWG925.github.io']);
export function eligible(r){return r.owner?.login===OWNER&&r.private===false&&!r.fork&&!EXCLUDE.has(r.name);}
export const projectId=name=>name.toLowerCase().replace(/[^a-z0-9-]/g,'-');
export function relevant(path){return !/(^|\/)(node_modules|dist|build|generated|\.git|vendor|coverage|addons\/gut)(\/|$)/i.test(path)&&!/(lock\.(json|yaml)|package-lock\.json|yarn\.lock|\.png|\.jpe?g|\.gif|\.svg|\.pdf|\.mp[34]|\.woff2?)$/i.test(path);}
export function fingerprint(files){return hash(files.filter(f=>f.type==='blob'&&relevant(f.path)).map(f=>[f.path,f.sha]).sort((a,b)=>a[0].localeCompare(b[0])));}
export async function collect(repo,request=api){
  if(!eligible(repo))throw Error('Public owned non-fork repository required');
  const commit=(await request(`/repos/${repo.full_name}/commits?per_page=1`))[0]?.sha;
  if(!/^[a-f0-9]{40}$/.test(commit))throw Error('Invalid source commit');
  const tree=await request(`/repos/${repo.full_name}/git/trees/${commit}?recursive=1`);
  if(tree.truncated)throw Error('Truncated evidence tree; manual inspection required');
  const files=tree.tree.filter(f=>f.type==='blob'&&relevant(f.path));
  const ranked=files.filter(f=>f.size<250000&&(/(^|\/)(readme[^/]*|package\.json|project\.godot|pyproject\.toml|requirements\.txt|index\.html)$/i.test(f.path)||/^(src|app|lab|game|test|tests|\.github\/workflows)\/.*\.(ts|tsx|js|mjs|py|yml|yaml|gd)$/.test(f.path)));
  const rank=p=>/^readme/i.test(p)?0:/(package\.json|project\.godot|index\.html)$/.test(p)?1:/test/.test(p)?3:2;
  ranked.sort((a,b)=>rank(a.path)-rank(b.path)||a.path.localeCompare(b.path));
  const documents=[];let budget=100000;
  for(const file of ranked.slice(0,18)){
    const blob=await request(`/repos/${repo.full_name}/git/blobs/${file.sha}`);
    const full=Buffer.from(blob.content,'base64').toString('utf8'),limit=Math.min(16000,budget);
    const content=full.length<=limit?full:full.slice(0,Math.floor(limit/2))+'\n[bounded excerpt; middle omitted]\n'+full.slice(-Math.floor(limit/2));
    if(content.includes('\u0000'))continue;
    documents.push({path:file.path,blob:file.sha,content});budget-=content.length;if(budget<=0)break;
  }
  let checks=[];
  try{checks=(await request(`/repos/${repo.full_name}/actions/runs?head_sha=${commit}&per_page=20`)).workflow_runs.map(r=>({name:r.name,status:r.status,conclusion:r.conclusion,url:r.html_url,commit:r.head_sha}));}catch(e){if(!e.message.includes('404'))throw e;}
  return {schemaVersion:1,visibility:'public',repository:repo.full_name,url:repo.html_url,description:repo.description,archived:repo.archived,commit,fingerprint:fingerprint(tree.tree),files:files.map(f=>({path:f.path,sha:f.sha})),documents,checks,warning:'Untrusted repository content; claims are repository-reported unless explicitly rerun. Ownership does not establish personal contribution.'};
}
export function normalize(repo,pack,existing,today=new Date().toISOString().slice(0,10),analysis=null){
  const id=projectId(repo.name);if(!ID.test(id))throw Error('Unsafe project id');
  const sourceId=`scan-${id}-${pack.commit.slice(0,12)}`;
  const sources=[{id:sourceId,visibility:'public',url:`https://github.com/${repo.full_name}/tree/${pack.commit}`,kind:'repository-snapshot',checkedAt:today,commit:pack.commit}];
  const record=existing?structuredClone(existing):{id,visibility:'public',name:repo.name,summary:repo.description?.slice(0,1500)||`Public project repository: ${repo.name}.`,contribution:'Repository ownership verified. Individual contribution and team attribution await Roy’s confirmation.',technologies:[],status:repo.archived?'archived-repository':'repository-published',period:today.slice(0,4),repository:repo.html_url,demo:null,results:[],limitations:['Features, maturity and personal contribution require review against the pinned source.'],lessons:[],evidence:[],lastVerified:today,featured:false,order:100};
  if(analysis){
    const claims=analysis.claims??[];
    if(!claims.length)throw Error('AI update requires quoted evidence');
    for(const c of claims)if(!['feature','technology','result','contribution','limitation'].includes(c.kind)||typeof c.quote!=='string'||c.quote.length<8||!pack.documents.some(d=>d.path===c.path&&d.content.includes(c.quote)))throw Error('Unsupported AI claim or quote');
    for(const field of ['summary','contribution'])if(analysis[field]!==null&&analysis[field]!==undefined)record[field]=analysis[field];
    for(const field of ['technologies','results','limitations'])if(analysis[field]!==null&&analysis[field]!==undefined)record[field]=analysis[field];
  }
  record.evidence=[...new Set([...record.evidence,sourceId])];record.lastVerified=today;record.review={state:'proposed',date:today};
  const candidate={schemaVersion:2,kind:'project',record,sources,baseRecordHash:existing?hash(existing):null,discovery:{commit:pack.commit,fingerprint:pack.fingerprint,engine:analysis?'local-subscription-agent':'github-evidence',reason:analysis?.reason??'Public source changed; inspect pinned evidence before accepting facts.',claims:analysis?.claims??[],checks:pack.checks,notes:pack.warning}};
  validateProject(record,new Set([...(existing?.evidence??[]),sourceId]),true);return candidate;
}
export async function inventory(request=api){let all=[];for(let page=1;;page++){const list=await request(`/users/${OWNER}/repos?type=owner&per_page=100&page=${page}`);all.push(...list.filter(eligible));if(list.length<100)return all.sort((a,b)=>a.name.localeCompare(b.name));}}
