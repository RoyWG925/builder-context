import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {save} from './lib.mjs';
const digest=v=>createHash('sha256').update(v).digest('hex');
const source='https://raw.githubusercontent.com/RoyWG925/builder-context';
const site='https://roywg925.github.io/portfolio-astro';
async function get(url,as='text'){const r=await fetch(url,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`${r.status}: ${url}`);return as==='json'?r.json():as==='bytes'?Buffer.from(await r.arrayBuffer()):r.text();}
const commit=(await get('https://api.github.com/repos/RoyWG925/builder-context/commits/main','json')).sha;
const manifest=await get(`${source}/${commit}/generated/export-manifest.json`,'json');
const profileHead=(await get('https://api.github.com/repos/RoyWG925/RoyWG925/git/ref/heads/main','json')).object.sha;
const published=path=>site+path+'?identity='+manifest.revision;
const [readme,profileReceipt,bundle,receipt,build,html,context,home,pdf]=await Promise.all([
 get(`https://raw.githubusercontent.com/RoyWG925/RoyWG925/${profileHead}/README.md`),get(`https://raw.githubusercontent.com/RoyWG925/RoyWG925/${profileHead}/identity-source.json`,'json'),get(published('/identity.json'),'json'),get(published('/identity-source.json'),'json'),get(published('/identity-build.json'),'json'),get(published('/resume.html')),get(published('/ai-context.md')),get(published('/')),get(published('/Roy_Wang_Resume.pdf'),'bytes')]);
for(const value of [profileReceipt,bundle,receipt,build])assert.equal(value.revision,manifest.revision,'Consumer has not converged to current canonical content');
assert.equal(digest(readme),manifest.files['generated/profile-readme.md']);assert.equal(profileReceipt.readmeHash,digest(readme));assert.equal(digest(html),manifest.files['generated/resume.html']);assert.equal(digest(context),manifest.files['AI_CONTEXT.md']);
const {revision,...payload}=bundle;assert.equal(digest(JSON.stringify(payload)),revision);assert.equal(digest(pdf),build.pdfSha256);assert.equal(pdf.subarray(0,5).toString(),'%PDF-');
for(const p of bundle.projects.filter(p=>p.featured))assert.ok(home.includes(p.name.replaceAll('&','&amp;')),p.id);
for(const body of [readme,JSON.stringify(bundle),html,context,home])assert.ok(!body.includes('ISOLATED_IDENTITY_E2E_'),'Fixture leaked into production');
assert.ok(home.includes('physics-canvas')&&home.includes('btn-xray-toggle')&&home.includes('btn-stress-test'));
const result={passed:true,revision,canonicalHead:commit,profileHead,profileSourceCommit:profileReceipt.commit,portfolioSourceCommit:receipt.commit,portfolioCommit:build.portfolioCommit,portfolioRun:build.run,pdfSha256:build.pdfSha256,cachePolicy:'Profile fetched by immutable head; Pages checked using revision query to avoid previous-deployment CDN cache.',checks:['README export hash','bundle content revision','HTML/context hashes','PDF hash','featured project names','original controls','no isolated fixture']};
await save('tmp/live-verification.json',result);console.log(JSON.stringify(result,null,2));
