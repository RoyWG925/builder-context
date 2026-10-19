import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

export const OWNER = 'RoyWG925';
export const REPO = `${OWNER}/builder-context`;
export const PUBLIC_STATES = new Set(['published-baseline', 'owner-confirmed']);
export const ID = /^[a-z0-9][a-z0-9-]{0,95}$/;
export const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
export const json = path => readFile(path, 'utf8').then(JSON.parse);
export async function save(path, value) {
  await mkdir(join(path, '..'), { recursive: true });
  await writeFile(path, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n');
}
export async function records(root, dir) {
  return Promise.all((await readdir(join(root, dir))).filter(f => f.endsWith('.json')).sort().map(f => json(join(root, dir, f))));
}
export async function load(root = '.') {
  const [profile, projects, competitions, evidence] = await Promise.all([
    json(join(root, 'profile/public.json')), records(root, 'projects'), records(root, 'competitions'), json(join(root, 'evidence/sources.json'))
  ]);
  return { schemaVersion: 1, profile, projects, competitions, evidence: evidence.sources };
}
function assert(test, message) { if (!test) throw new Error(message); }
function text(value, name, max = 5000) {
  assert(typeof value === 'string' && value.trim().length > 0 && value.length <= max && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value), `Invalid ${name}`);
}
export function safeUrl(value, name = 'URL') {
  const u = new URL(value);
  assert(u.protocol === 'https:' && !u.username && !u.password, `Unsafe ${name}`);
  assert(!/(^|\.)(localhost|local|internal)$/.test(u.hostname) && !/^[\d.:]+$/.test(u.hostname), `Unsafe ${name}`);
  return value;
}
export function strings(list, name) {
  assert(Array.isArray(list) && list.length <= 50, `Invalid ${name}`);
  list.forEach(v => text(v, name));
}
function keys(value,allowed,label) {assert(value&&Object.keys(value).every(k=>allowed.includes(k)),`Unexpected ${label} field; possible private data`);}
export function validateReview(review, allowProposed = false) {
  keys(review,['state','basis','date','evidence','by','pr','mergeCommit'],'review');
  assert(review && (PUBLIC_STATES.has(review.state) || (allowProposed && review.state === 'proposed')), 'Unconfirmed review state');
  assert(/^\d{4}-\d{2}-\d{2}$/.test(review.date), 'Invalid review date');
  if (review.state === 'owner-confirmed') {
    assert(review.by === OWNER && Number.isInteger(review.pr) && review.pr > 0 && /^[a-f0-9]{40}$/.test(review.mergeCommit), 'Owner confirmation requires PR and merge commit');
  }
  if (review.state === 'published-baseline') text(review.basis, 'publication basis');
}
export function validateProject(p, evidenceIds, allowProposed = false) {
  assert(p && ID.test(p.id), 'Invalid project id');
  assert(p.visibility === 'public', 'Private project rejected');
  for (const key of ['name','summary','contribution','status','period','lastVerified']) text(p[key], key);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(p.lastVerified), 'Invalid verification date');
  assert(new URL(safeUrl(p.repository)).origin === 'https://github.com' && new URL(p.repository).pathname.startsWith(`/${OWNER}/`), 'Repository must be owned by Roy');
  if (p.demo !== null) safeUrl(p.demo, 'demo');
  for (const key of ['technologies','results','limitations','lessons','evidence']) strings(p[key], key);
  assert(p.evidence.length > 0 && p.evidence.every(id => evidenceIds.has(id)), 'Missing or private evidence');
  assert(typeof p.featured === 'boolean' && Number.isInteger(p.order) && p.order >= 0, 'Invalid display order');
  validateReview(p.review, allowProposed);
  const allowed = new Set(['id','visibility','name','summary','contribution','technologies','status','period','repository','demo','results','limitations','lessons','evidence','lastVerified','featured','order','review']);
  assert(Object.keys(p).every(k => allowed.has(k)), 'Unexpected project field; possible private data');
}
export function validateCompetition(c,evidenceIds,projectIds,allowProposed=false) {
  keys(c,['id','visibility','name','track','projectId','status','submitted','result','team','period','summary','evidence','lastVerified','review'],'competition');
  assert(ID.test(c.id)&&c.visibility==='public'&&projectIds.has(c.projectId),'Invalid competition');
  for(const key of ['name','track','period','summary','lastVerified'])text(c[key],key);
  assert(['project-prepared','submitted','accepted','completed','awarded'].includes(c.status),'Invalid competition status');
  assert(c.submitted===null||typeof c.submitted==='boolean','Invalid submission status');
  assert(c.result===null||typeof c.result==='string','Invalid result');
  assert(c.team===null||typeof c.team==='string','Invalid team');
  assert(c.evidence.length&&c.evidence.every(id=>evidenceIds.has(id)),'Missing competition evidence');
  if(!allowProposed && ['submitted','accepted','completed','awarded'].includes(c.status))assert(c.submitted===true&&c.review.state==='owner-confirmed','Competition outcome requires owner confirmation');
  if(!allowProposed && c.result!==null)assert(c.review.state==='owner-confirmed','Unconfirmed competition result');
  validateReview(c.review,allowProposed);
}
export function validate(data) {
  assert(data.schemaVersion === 1, 'Unsupported schema');
  const { profile:p, projects, competitions, evidence } = data;
  assert(p.visibility === 'public' && p.github === OWNER, 'Profile must be public and owned by Roy');
  const allowed = new Set(['schemaVersion','visibility','name','fullName','nameZh','github','headline','tagline','location','availability','email','links','focus','about','education','skills','review']);
  assert(Object.keys(p).every(k=>allowed.has(k)), 'Unexpected profile field; possible private data');
  for(const key of ['name','fullName','nameZh','headline','tagline','location','availability','email']) text(p[key],key);
  assert(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email), 'Invalid email');
  keys(p.links,['github','portfolio','linkedin','context'],'profile links');
  Object.values(p.links).forEach(v=>safeUrl(v));
  strings(p.focus,'focus'); strings(p.about,'about');
  p.skills.forEach(s=>{ keys(s,['category','items'],'skills');text(s.category,'skill category'); strings(s.items,'skills'); });
  validateReview(p.review);
  const ids = new Set();
  for(const e of evidence) {
    keys(e,['id','visibility','url','kind','checkedAt','commit'],'evidence');
    assert(ID.test(e.id) && !ids.has(e.id) && e.visibility === 'public', 'Duplicate or private evidence');
    safeUrl(e.url); ids.add(e.id);
  }
  p.education.forEach(e=>{keys(e,['institution','degree','period','evidence'],'education');text(e.institution,'institution');text(e.degree,'degree');text(e.period,'period');assert(e.evidence.length && e.evidence.every(id=>ids.has(id)),'Missing education evidence');});
  const pids = new Set();
  projects.forEach(p=>{assert(!pids.has(p.id),'Duplicate project');pids.add(p.id);validateProject(p,ids);});
  const cids = new Set();
  competitions.forEach(c=>{
    validateCompetition(c,ids,pids);
    assert(ID.test(c.id) && !cids.has(c.id) && c.visibility==='public' && pids.has(c.projectId),'Invalid competition');cids.add(c.id);
    assert(['project-prepared','submitted','accepted','completed','awarded'].includes(c.status),'Invalid competition status');
    assert(c.evidence.length && c.evidence.every(id=>ids.has(id)),'Missing competition evidence');
    if(['submitted','accepted','completed','awarded'].includes(c.status)) assert(c.submitted===true && c.review.state==='owner-confirmed','Competition outcome requires owner confirmation');
    if(c.result!==null) assert(c.review.state==='owner-confirmed','Unconfirmed competition result');
    validateReview(c.review);
  });
  return data;
}
export function publishable(p) { return p.visibility === 'public' && PUBLIC_STATES.has(p.review?.state); }
// Explicit projection: arbitrary intake fields never reach the public bundle.
export function publicBundle(data) {
  validate(data);
  const clean = {
    schemaVersion: 1, profile: data.profile,
    projects: data.projects.filter(publishable).sort((a,b)=>a.order-b.order),
    competitions: data.competitions.filter(publishable), evidence: data.evidence
  };
  return { ...clean, revision: hash(clean) };
}
export const esc = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const md = value => String(value).replace(/[\[\]<>\\]/g, c=>'\\'+c).replace(/\r?\n/g,' ');
export async function api(path, options = {}) {
  assert(path.startsWith('/') && !path.startsWith('//'), 'Relative GitHub API path required');
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: { Accept:'application/vnd.github+json', 'X-GitHub-Api-Version':'2022-11-28', ...(process.env.GH_TOKEN ? {Authorization:`Bearer ${process.env.GH_TOKEN}`} : {}), ...options.headers },
    signal: AbortSignal.timeout(30000)
  });
  if(!response.ok) throw new Error(`GitHub ${response.status} ${path}`);
  return response.status===204 ? null : response.json();
}
