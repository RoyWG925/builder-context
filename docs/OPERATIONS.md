# Operations

Public source: `RoyWG925/builder-context` main. Cloud evidence scan: daily 01:17 UTC / 09:17 Taipei and workflow_dispatch. Local subscription analysis: weekly, independently configured on Windows. Profile sync: hourly minute 35. Astro deployment: hourly minute 45, pushes and manual runs. No model secret is used.

The primary confirmation channel is the owner's interactive chat. Follow CHAT_CONFIRMATION.md: record exact approved fields and original wording, validate base hashes, publish canonical data plus exports and verify the content revision. No PR or repeat approval is required. Legacy human-merged candidate PRs remain optional.

Default discovery writes independent proposed files to candidates/ on main. Existing candidates are deduplicated; a pending or stale item cannot block another confirmed update. Approval still rejects stale bases. Close migrated legacy PRs without merging unconfirmed facts.

Consumers resolve canonical main to one commit, download exports at that SHA and verify SHA256 manifest plus public states. A source docs-only commit can be newer than a deployed receipt without content drift: compare **revision**, then use the receipt’s immutable commit to reproduce the exact artifacts. Astro no longer commits generated snapshots. To build offline, first perform a valid sync; any tampered/missing generated file stops the build.

Manual cloud runs are available at:

- https://github.com/RoyWG925/builder-context/actions/workflows/discover.yml
- https://github.com/RoyWG925/RoyWG925/actions/workflows/sync-identity.yml
- https://github.com/RoyWG925/portfolio-astro/actions/workflows/deploy.yml

| Symptom | Recovery |
| --- | --- |
| Pending candidate | Show the exact proposed changes in chat; apply only the confirmed scope |
| Stale candidate | Reanalyse against current canonical record; do not remove base-hash guard |
| Queue write conflict | Retry against fresh main; never force-update or overwrite a changed base |
| GitHub CLI auth error | Run `gh auth login -h github.com` locally as RoyWG925 |
| Codex cannot start | Use normal local user environment; inspect CLI version/config and subscription login |
| Generated drift | Run `npm run generate`; commit source and exports together |
| Deployment shows old revision | Check source validation, consumer run conclusion and live `identity-build.json`; rerun sync/deploy |
| Hash mismatch | Stop; fetch a single immutable revision again, never silently use stale data |
| Force/deletion rules not enabled | Complete owner reauthentication and follow SECURITY.md |
| Private evidence | Keep it private; obtain explicit approval for a selected public summary |

The application/LinkedIn outputs are drafts. No automatic submissions, messages or posts exist. Public scans do not run untrusted project tests; independently rerun project tests only in an isolated environment, without live model calls or service credentials.
