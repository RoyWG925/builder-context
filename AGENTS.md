# Roy Identity OS - agent contract

Read AI_CONTEXT.md and canonical JSON before writing applications, bios, project summaries or resumes.

- Single public source: profile/public.json, projects/*.json, competitions/*.json, evidence/sources.json.
- Generated outputs are disposable projections. Run `npm run generate`; never hand-edit generated/ or AI_CONTEXT.md.
- Existing-publication migration is explicitly marked `published-baseline`, not falsely attributed to an owner confirmation.
- Use skills/roy-identity/SKILL.md and docs/LOCAL_AGENTS.md. New facts use schema-v2 candidates named by scripts/proposals.mjs, with pinned sources, content fingerprint, reason and canonical base hash. The review state must be proposed.
- After completing a significant project, check for an Identity OS update. Before applications/bios/resumes, fetch the latest AI_CONTEXT.md and select the audience from profile/personas.json. Never rely on an old local snapshot.
- A PR containing candidates becomes a confirmation only when merged by RoyWG925. The confirmation workflow promotes only candidate files changed in that PR and records the PR and merge commit.
- Agents must not merge fact-candidate PRs, even when authenticated as RoyWG925. An agent using the owner's credentials is not a human confirmation. Leave the review PR for Roy.
- Do not invent roles, employment, proficiency, personal authorship, metrics, usage, awards, submission or acceptance. Repository ownership is not proof of individual contribution.
- Private material belongs in the separate private repository. Public scans use the public user-repositories endpoint only; never authenticate a private scan and then sanitize it into public output.
- LinkedIn is draft-only. This contract grants no authorization to post, message, operate accounts or submit applications.
- Read evidence in this order: current correction/errata, current project evidence, existing public material, old resume. Conflicts become proposals; keep caveats with numbers.
- Run `npm test`, `npm run validate`, and `npm run generate` after editing canonical data. CI checks generated drift, confirmation provenance, output escaping and private-data boundaries.
