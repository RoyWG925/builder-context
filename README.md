# Roy Identity OS

One evidence-backed source for Roy Wang’s profile, existing Astro portfolio, resume, hackathon record and AI agent context.

[AI context](AI_CONTEXT.md) · [Portfolio](https://roywg925.github.io/portfolio-astro/) · [Resume](https://roywg925.github.io/portfolio-astro/Roy_Wang_Resume.pdf) · [Introductions](generated/introductions.md) · [LinkedIn drafts](generated/linkedin.md)

## Hybrid maintenance

- **GitHub Actions**, daily: collect public repository evidence and open independent per-project/snapshot PRs. No model API calls, API key or running PC is needed.
- **Local Codex**, weekly Sunday 09:30 Taipei: use the existing ChatGPT subscription to analyse implementation, features, tests and milestones, then propose quoted fact updates. Claude Code can use the same skill and an optional subscription adapter.
- **Roy personally reviews and merges** fact proposals. The publisher checks merger, base hash and source visibility, records a receipt, then regenerates canonical exports. Agents never merge.
- **Profile and Astro**, hourly or manually: fetch a single immutable source commit, verify export hashes, sync README / JSON / HTML / agent context, regenerate PDF and deploy. Schedules are eventual and may be delayed by GitHub.
- **LinkedIn** remains a generated draft, with no account automation.

[Install local maintenance](docs/LOCAL_AGENTS.md) · [Operations](docs/OPERATIONS.md) · [Security and manual protection steps](docs/SECURITY.md)

## Canonical data

| Source | Purpose |
| --- | --- |
| `profile/public.json` | Published identity, skills, education and product direction |
| `profile/personas.json` | Four audience-specific introductions using the same facts |
| `projects/*.json` | Features, contribution, technology, results, limitations and evidence |
| `competitions/*.json` | Submission state, result and explicit unknowns |
| `evidence/` | Source commits, corrections and minimal owner statement receipts |
| `candidates/*.json` | Proposed facts, excluded from every public view |

`published-baseline` means migrated public material; `owner-attested` records an explicit statement supplied by Roy; `owner-confirmed` includes the personally merged PR and merge commit. These evidence levels are not interchangeable. VIRAL is completed and submitted according to Roy’s statement on 2026-10-19; results are pending. No award is asserted.

Private intake and application notes are in a separate private repository. Public jobs do not have credentials to read it. A private project’s public demo is not permission to disclose its source or personal attribution.

## Development and validation

Node 24; deterministic core uses built-in modules. No model key is required.

```sh
npm test
npm run generate
npm run check
# Real isolated promotion → README → Astro → rendered PDF integration:
# install portfolio dependencies, Puppeteer 24.40.0 and PyMuPDF first (see CI)
npm run e2e
```

`generated/export-manifest.json` binds every export to its SHA256. Consumers record source commit and revision; the live `identity-build.json` also records portfolio commit, Actions run and PDF hash. Generated portfolio snapshots are build artifacts rather than tracked stale data. Offline builds verify every local file and fail on drift.

The isolated integration test uses the actual consumers and real Astro/PDF builds. Its fake fact remains in a temporary directory and is never deployed. Actions CI repeats it on pushes and PRs with read-only permissions.

Read [AGENTS.md](AGENTS.md) before proposing a change. Use `scripts/proposals.mjs` / local maintenance to create schema-v2 candidates with evidence fingerprint and canonical base hash. Do not copy a canonical JSON directly into the old aggregate candidate format.
