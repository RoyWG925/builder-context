# Chat confirmation and direct publication

Roy chose this workflow on 2026-10-19: show proposed public changes, accept his explicit confirmation in the conversation, publish those changes and verify the outlets. Do not require a second approval in GitHub. PRs remain optional for collaboration.

## Interactive publisher

The agent must have observed a real owner statement and its publication context. General agreement about the workflow is not approval of a whole pending candidate. Capture minimal public wording only; never copy a full conversation, private notes or credentials into a receipt.

Prepare a schema-v1 approval JSON with id, visibility=public, by=RoyWG925, channel=chat, confirmedAt, ownerStatement, authorizationStatement, reason, changes and statements. Optional sources contain only explicitly approved public evidence. Each change names kind (project, competition or profile), id, baseRecordHash, and either an exact field patch or a fully reviewed create record. The base hash is scripts/lib.mjs hash(currentRecord); a new record uses null. The patch cannot change identity, repository, review or visibility. Changes to public contact information require the same explicit disclosure scope as any other field.

~~~sh
npm run confirm:chat -- --file local/approved-change.json
npm run confirm:chat -- --file local/approved-change.json --apply
npm test
npm run check
~~~

Default is a preview. Apply checks the whole batch before writing, verifies project repositories publicly without credentials, writes canonical data plus a SHA256-bound receipt in receipts/chat-<id>.json and generates every export. Reapplying the same approval is a no-op; reusing its id for different content is rejected. A stale canonical base stops publication. Commit all changed canonical sources, evidence, receipt and generated exports atomically, using a fast-forward update of the latest main commit. Do not force pushes.

The receipt records the original minimal statement, exact scope and before/after record hashes. owner-attested review.basis identifies the approved fields; unchanged fields keep their prior evidence rather than becoming newly verified accomplishments. A confirmed solo-authorship statement can enter evidence/owner-statements.json and AI_CONTEXT without approving an entire new project record or making it featured.

## Pending evidence

Cloud Actions and local Codex/Claude analysis write candidates/ files using scripts/proposals.mjs. The default does not create a branch or PR. Queue entries are independent and deduplicated by project, source fingerprint, engine and canonical base. Unconfirmed candidates never enter generated identity outputs. They are still publicly readable source files, so private inputs are prohibited.

An interactive agent reads these entries and explains the actual proposed change to Roy. Confirmed fields publish through the chat route; remaining candidate facts stay pending. Old PRs may be closed after moving their unconfirmed contents into the queue; do not merge them just to clear the list.

## Trust and automation limits

Chat receipts are honest agent attestations backed by Git history and content hashes, not cryptographic proof of the speaker's identity. GitHub also cannot distinguish a human from an agent sharing the owner's credentials. The trusted interactive agent must never fabricate approval. Weekly/CI model analysis has no confirmation operation and cannot self-publish new facts.

This system does not read other ChatGPT/Claude/Grok conversations automatically. An agent needs the current conversation or a supplied explicit approval, current canonical context and authorized GitHub access. The unattended computer/cloud collector keeps working independently. LinkedIn and applications remain drafts.
