# Operations

Public source: `RoyWG925/builder-context` main. Cloud evidence scan: daily 01:17 UTC / 09:17 Taipei and workflow_dispatch. Local subscription analysis: weekly, independently configured on Windows. Profile sync: hourly minute 35. Astro deployment: hourly minute 45, pushes and manual runs. No model secret is used.

After Roy merges a candidate PR personally, the confirmation Action validates source visibility, current canonical base hash and provenance, promotes the changed candidate only, writes `receipts/`, regenerates exports and pushes a fast-forward commit. A bot or outsider merge does not confirm facts. Never merge a fact PR through an agent logged in as Roy.

Proposals have independent branches keyed by project, stable source fingerprint, engine and canonical base hash. An open PR for one project does not stop another project or later source snapshot. All PR states are checked to avoid reproposing an accepted/rejected snapshot. Cloud evidence and local AI analysis can have separate proposals; approving either makes conflicting proposals stale. Reanalyse stale candidates; never force old facts over newer owner-confirmed data. The legacy aggregate PR #1 must not be merged after phase 2.

Consumers resolve canonical main to one commit, download exports at that SHA and verify SHA256 manifest plus public states. A source docs-only commit can be newer than a deployed receipt without content drift: compare **revision**, then use the receipt’s immutable commit to reproduce the exact artifacts. Astro no longer commits generated snapshots. To build offline, first perform a valid sync; any tampered/missing generated file stops the build.

Manual cloud runs are available at:

- https://github.com/RoyWG925/builder-context/actions/workflows/discover.yml
- https://github.com/RoyWG925/RoyWG925/actions/workflows/sync-identity.yml
- https://github.com/RoyWG925/portfolio-astro/actions/workflows/deploy.yml

| Symptom | Recovery |
| --- | --- |
| Pending PR | Review that project; other snapshots continue independently |
| Stale candidate | Reanalyse against current canonical record; do not remove base-hash guard |
| PR creation 403 | Check Actions PR creation permission; no approval/merge automation is needed |
| GitHub CLI auth error | Run `gh auth login -h github.com` locally as RoyWG925 |
| Codex cannot start | Use normal local user environment; inspect CLI version/config and subscription login |
| Generated drift | Run `npm run generate`; commit source and exports together |
| Deployment shows old revision | Check source validation, consumer run conclusion and live `identity-build.json`; rerun sync/deploy |
| Hash mismatch | Stop; fetch a single immutable revision again, never silently use stale data |
| Force/deletion rules not enabled | Complete owner reauthentication and follow SECURITY.md |
| Private evidence | Keep it private; obtain explicit approval for a selected public summary |

The application/LinkedIn outputs are drafts. No automatic submissions, messages or posts exist. Public scans do not run untrusted project tests; independently rerun project tests only in an isolated environment, without live model calls or service credentials.
