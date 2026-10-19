# Roy Identity OS - agent contract

Read AI_CONTEXT.md and canonical JSON before writing applications, bios, project summaries or resumes.

- Single public source: profile/public.json, projects/*.json, competitions/*.json, evidence/sources.json.
- Generated outputs are disposable projections. Run `npm run generate`; never hand-edit generated/ or AI_CONTEXT.md.
- Existing-publication migration is explicitly marked `published-baseline`, not falsely attributed to an owner confirmation.
- New facts go in candidates/<project-id>.json with `kind: project`, `record`, and `sources`. The record's review state must be `proposed`.
- A PR containing candidates becomes a confirmation only when merged by RoyWG925. The confirmation workflow promotes only candidate files changed in that PR and records the PR and merge commit.
- Do not invent roles, employment, proficiency, personal authorship, metrics, usage, awards, submission or acceptance. Repository ownership is not proof of individual contribution.
- Private material belongs in the separate private repository. Public scans use the public user-repositories endpoint only; never authenticate a private scan and then sanitize it into public output.
- LinkedIn is draft-only. This contract grants no authorization to post, message, operate accounts or submit applications.
- Read evidence in this order: current correction/errata, current project evidence, existing public material, old resume. Conflicts become proposals; keep caveats with numbers.
- Run `npm test`, `npm run validate`, and `npm run generate` after editing canonical data. CI checks generated drift, confirmation provenance, output escaping and private-data boundaries.
