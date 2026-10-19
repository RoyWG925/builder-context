import {load,validate,json,validateProject,validateCompetition,hash} from './lib.mjs';
import {readdir} from 'node:fs/promises';
import {proposalKey} from './proposals.mjs';
const data = validate(await load());
for(const f of (await readdir('candidates')).filter(f=>f.endsWith('.json'))) {
  const c=await json(`candidates/${f}`);
  if(!['project','competition'].includes(c.kind) || c.record.review.state!=='proposed') throw Error('Candidates must be proposed facts');
  const ids=new Set([...data.evidence,...c.sources].map(e=>e.id));
  if(c.kind==='project')validateProject(c.record,ids,true);
  else validateCompetition(c.record,ids,new Set(data.projects.map(p=>p.id)),true);
  if(c.schemaVersion!==2||proposalKey(c)+'.json'!==f) throw Error('Legacy or mismatched candidate; refresh using the current collector');
  const prior=(c.kind==='project'?data.projects:data.competitions).find(p=>p.id===c.record.id);
  if((prior?hash(prior):null)!==c.baseRecordHash)console.warn(`Pending candidate ${f} needs reanalysis against the current record; it remains excluded from exports.`);
}
console.log(`Validated public profile, ${data.projects.length} projects, ${data.competitions.length} competition records and candidate boundaries.`);
