import {readFile} from 'node:fs/promises';
import {api,json,REPO,OWNER} from './lib.mjs';

const summary=await json('tmp/discovery-summary.json');
if(!summary.changed) {console.log('No changes; no PR required.');process.exit(0);}
const branch='identity/discovery';
const title=`Review ${summary.changed} project evidence update${summary.changed===1?'':'s'}`;
const body=`## Evidence review\n\n${summary.changed} public repositories changed. ${summary.aiCount} proposals include AI suggestions; ${summary.aiConfigured?'the configured model was attempted':'AI credentials are not configured, so these are explicitly evidence-only proposals'}.\n\nReview candidates/*.json and the exact source commits. Candidates are excluded from public output.\n\n**RoyWG925 merging this PR confirms the candidate records as written.** Edit or reject unsupported claims before merging. The confirmation workflow records the actual merger, PR and merge SHA and then regenerates all public views.\n\nNo private repositories were scanned. No LinkedIn publication or competition submission is performed.\n`;
const prs=await api(`/repos/${REPO}/pulls?state=open&head=${OWNER}:${branch}`);
let pr;
if(prs.length) pr=await api(`/repos/${REPO}/pulls/${prs[0].number}`,{method:'PATCH',body:JSON.stringify({title,body})});
else pr=await api(`/repos/${REPO}/pulls`,{method:'POST',body:JSON.stringify({title,body,head:branch,base:'main'})});
console.log(`Proposal PR: ${pr.html_url}`);
if(process.env.GITHUB_STEP_SUMMARY) await import('node:fs/promises').then(fs=>fs.appendFile(process.env.GITHUB_STEP_SUMMARY,`${body}\nPR: ${pr.html_url}\n`));
