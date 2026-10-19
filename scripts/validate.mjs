import {load,validate,json,validateProject,validateCompetition} from './lib.mjs';
import {readdir} from 'node:fs/promises';
const data = validate(await load());
for(const f of (await readdir('candidates')).filter(f=>f.endsWith('.json'))) {
  const c=await json(`candidates/${f}`);
  if(!['project','competition'].includes(c.kind) || c.record.review.state!=='proposed') throw Error('Candidates must be proposed facts');
  const ids=new Set([...data.evidence,...c.sources].map(e=>e.id));
  if(c.kind==='project')validateProject(c.record,ids,true);
  else validateCompetition(c.record,ids,new Set(data.projects.map(p=>p.id)),true);
  if(c.record.id+'.json'!==f) throw Error('Candidate filename/id mismatch');
}
console.log(`Validated public profile, ${data.projects.length} projects, ${data.competitions.length} competition records and candidate boundaries.`);
