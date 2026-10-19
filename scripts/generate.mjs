import { readFile } from 'node:fs/promises';
import { load, publicBundle, save, esc, md } from './lib.mjs';

export function render(data, template) {
  const b = publicBundle(data), p = b.profile;
  const projects = b.projects.filter(p=>p.featured);
  const linked = (label,url) => `[${md(label)}](${url})`;
  const head = `<!-- Generated from RoyWG925/builder-context. Edit canonical JSON, not this file. Revision: ${b.revision} -->\n`;
  const profile = head + `## Hi, I'm ${md(p.name)}\n\n${md(p.tagline)}\n\n### What I build\n${p.focus.map(s=>`- ${md(s)}`).join('\n')}\n\n### Featured work\n${projects.map(x=>`- **${linked(x.name,x.repository)}**${x.demo ? ' · '+linked('demo',x.demo) : ''}: ${md(x.summary)}`).join('\n')}\n\n### Hackathons\n${b.competitions.map(c=>`- ${md(c.name)} · ${md(c.track)}: ${md(c.summary)}`).join('\n')}\n\n### Stack\n${[...new Set(p.skills.flatMap(s=>s.items))].map(md).join(' · ')}\n\n### Contact\n${linked('Portfolio',p.links.portfolio)} · ${linked('LinkedIn',p.links.linkedin)} · ${p.email}\n\nAI agents: read ${linked('AI_CONTEXT.md',p.links.context+'/blob/main/AI_CONTEXT.md')} for verified facts, attribution limits and evidence.\n`;
  const evidenceLinks = x => x.evidence.map(id=>b.evidence.find(e=>e.id===id)).filter(Boolean).map(e=>linked(e.id,e.url)).join(' · ');
  const ai = head + `# Roy Identity OS - shared agent context\n\nSource: ${p.links.context}\nRevision: ${b.revision}\n\n## Read this first\n- Public canonical facts live in profile/, projects/, competitions/, and evidence/.\n- published-baseline = migrated existing public material; owner-confirmed = Roy merged a fact proposal. They are different evidence levels.\n- Never infer employment, proficiency, individual contribution, submission, acceptance, awards, production usage, or business results from repository ownership.\n- Unknown means unknown. Keep limitations attached to numbers and research conclusions.\n- Private material belongs in the separate private repository. Do not quote, copy, or link private repository names into public proposals.\n- Propose new project facts through candidates/<id>.json in a PR. Roy reviews and merges. Only an owner merge can promote those candidates.\n- LinkedIn outputs are drafts. No publishing, messaging, scraping, browser actions, or account mutation is authorized by this file.\n\n## Profile\n${p.fullName} (${p.nameZh})\n${p.headline}\n${p.tagline}\n${p.location}; ${p.availability}.\n\n${p.about.join('\n\n')}\n\n## Projects\n${b.projects.map(x=>`### ${x.name}\nStatus: ${x.status}; period: ${x.period}; last verified: ${x.lastVerified}; review: ${x.review.state}.\n${x.summary}\nContribution: ${x.contribution}\nTechnology: ${x.technologies.join(', ')}\nResults: ${x.results.join(' ')}\nLimitations: ${x.limitations.join(' ')}\nLessons: ${x.lessons.join(' ')}\nEvidence: ${evidenceLinks(x)}\n`).join('\n')}\n## Competitions\n${b.competitions.map(c=>`- ${c.name}, ${c.track}, ${c.period}. Status: ${c.status}. Submitted: ${c.submitted===null?'unknown':c.submitted}. Result: ${c.result??'unknown'}. ${c.summary}\n  Evidence: ${evidenceLinks(c)}`).join('\n')}\n\n## Skills already published\n${p.skills.map(s=>`${s.category}: ${s.items.join(', ')}`).join('\n')}\n\n## Education\n${p.education.map(e=>`${e.institution}; ${e.degree}; ${e.period}`).join('\n')}\n`;
  const resumeMd = head + `# ${p.fullName}\n${p.headline}\n\n${p.email} · ${p.links.github} · ${p.links.portfolio}\n\n## Education\n${p.education.map(e=>`${e.institution} - ${e.degree} (${e.period})`).join('\n')}\n\n## Projects and research\n${projects.map(x=>`### ${x.name} (${x.period})\n${x.repository}\n${x.summary}\n${x.contribution}\n${x.results.map(r=>'- '+r).join('\n')}\nLimitations: ${x.limitations.join(' ')}`).join('\n\n')}\n\n## Technical skills\n${p.skills.map(s=>`- ${s.category}: ${s.items.join(', ')}`).join('\n')}\n`;
  const body = `<header><h1>${esc(p.fullName)}</h1><div class="tagline">${esc(p.headline)} - ${esc(p.focus.join(', '))}</div><div class="contact"><a href="mailto:${esc(p.email)}">${esc(p.email)}</a><a href="${esc(p.links.github)}">github.com/${esc(p.github)}</a><a href="${esc(p.links.portfolio)}">Portfolio</a><a href="${esc(p.links.linkedin)}">LinkedIn</a></div></header>
<section><h2>Education</h2>${p.education.map(e=>`<div class="entry-header"><span class="edu-name">${esc(e.institution)}</span><span class="entry-date">${esc(e.period)}</span></div><div class="edu-deg">${esc(e.degree)}</div>`).join('')}</section>
<section><h2>Projects &amp; Research</h2>${projects.map(x=>`<div class="entry"><div class="entry-header"><a class="entry-title" href="${esc(x.repository)}">${esc(x.name)}</a><span class="entry-date">${esc(x.period)}</span></div><div class="entry-sub">${esc(x.technologies.join(' / '))}</div><ul><li>${esc(x.summary)}</li><li>${esc(x.contribution)}</li></ul></div>`).join('')}</section>
<section><h2>Technical Skills</h2><div class="skills-grid">${p.skills.map(s=>`<span class="skill-cat">${esc(s.category)}</span><span class="skill-val">${esc(s.items.join(', '))}</span>`).join('')}</div></section>
<p class="provenance">Evidence and limitations: <a href="${esc(p.links.context)}">github.com/${esc(p.github)}/builder-context</a> · ${esc(b.revision.slice(0,12))}</p>`;
  const html = template.replace('{{TITLE}}',`${esc(p.name)} - Resume`).replace('{{CONTENT}}',body);
  const linkedin = head + `# LinkedIn update drafts - manual publishing only\n\nStatus: DRAFT. Review wording before pasting. No LinkedIn API or browser automation exists in this project.\n\n## Headline\n${p.headline} | ${p.focus.join(' | ')}\n\n## About\n${p.about.join('\n\n')}\n\n## Featured projects\n${projects.map(x=>`### ${x.name}\n${x.summary}\n${x.repository}${x.demo?'\nDemo: '+x.demo:''}\nAttribution: ${x.contribution}\nKeep these qualifiers: ${x.limitations.join(' ')}\nEvidence: ${evidenceLinks(x)}`).join('\n\n')}\n\n## Post draft\nI have been building AI-powered tools and interactive experiences, and I now keep the public evidence for my work in one place.\n\nRecent project: ${projects[0]?.name??''}. ${projects[0]?.summary??''}\n\nProject details and limitations: ${projects[0]?.repository??p.links.portfolio}\nPortfolio: ${p.links.portfolio}\n\nDo not add a submission, award, job title, team role, benchmark, or user count without owner-confirmed evidence.\n`;
  return new Map([
    ['generated/public.json', JSON.stringify(b,null,2)+'\n'],
    ['generated/profile-readme.md',profile], ['AI_CONTEXT.md',ai],
    ['generated/resume.md',resumeMd], ['generated/resume.html',html], ['generated/linkedin.md',linkedin],
    ['generated/applications.json', JSON.stringify({schemaVersion:1,revision:b.revision,profile:p,projects:b.projects,competitions:b.competitions,policy:'Draft application material only; unknown contribution and outcomes must be confirmed.'},null,2)+'\n']
  ]);
}
export async function generate(root='.',check=false) {
  const outputs = render(await load(root),await readFile(`${root}/templates/resume.html`,'utf8'));
  for(const [path,content] of outputs) {
    if(check) {
      let actual; try { actual=await readFile(`${root}/${path}`,'utf8'); } catch {throw Error(`Missing generated file: ${path}`);}
      if(actual!==content) throw Error(`Stale generated file: ${path}. Run npm run generate.`);
    } else await save(`${root}/${path}`,content);
  }
  return outputs;
}
if(process.argv[1]?.endsWith('generate.mjs')) {
  await generate('.',process.argv.includes('--check'));
  console.log(process.argv.includes('--check')?'Generated outputs are current.':'Generated public bundle, agent context, profile, resume, applications and LinkedIn drafts.');
}
