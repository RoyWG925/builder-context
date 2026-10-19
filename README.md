# Roy Identity OS

One evidence-backed source for Roy Wang's profile, existing Astro portfolio, resume, hackathon record and shared agent context.

[AI context](AI_CONTEXT.md) | [Portfolio](https://roywg925.github.io/portfolio-astro/) | [Resume](https://roywg925.github.io/portfolio-astro/Roy_Wang_Resume.pdf) | [Introductions](generated/introductions.md) | [LinkedIn drafts](generated/linkedin.md)

## Confirmation without a PR

AI collects public evidence and shows meaningful proposed changes. Roy confirms exact public wording in the conversation. The interactive agent records a scoped, hashed receipt, applies only the approved fields, validates and publishes. No second PR approval is required. Unknown facts stay pending; agreement to this workflow does not approve the entire backlog.

[Chat confirmation and receipt format](docs/CHAT_CONFIRMATION.md) | [Local subscription maintenance](docs/LOCAL_AGENTS.md) | [Operations](docs/OPERATIONS.md) | [Security](docs/SECURITY.md)

## Hybrid maintenance

- GitHub Actions collect evidence daily without a model API or an online PC. Independent candidates are stored in candidates/ without opening PRs.
- Local Codex runs weekly using the ChatGPT subscription to analyse implementation, tests and milestones. Claude Code can use the same maintained skill. The analysis model cannot author approvals.
- Roy's actual chat confirmation is recorded with its scope, exact patches, source and base hashes. Legacy personally merged PRs remain supported as an optional route.
- Profile and Astro consume one immutable source commit, verify the export manifest, sync README/portfolio/context, generate the PDF and deploy hourly or manually.
- LinkedIn remains draft-only. No paid API or extra service is configured.

## Canonical data

| Source | Purpose |
| --- | --- |
| profile/ | Public identity, skills, education and audience-specific emphasis |
| projects/ and competitions/ | Project facts, roles, limitations and competition status |
| evidence/ | Public sources, corrections and explicit owner statements |
| receipts/ | Hashed chat approvals and optional legacy PR provenance |
| candidates/ | Pending public-source proposals, excluded from generated identity outputs |

The public repository's candidate files are publicly readable; they are not a private inbox. Private intake remains in the separate private repository. Only an explicitly approved public summary may cross that boundary.

published-baseline means migrated public material. owner-attested records an explicit scoped owner statement, including chat confirmation. owner-confirmed denotes the legacy personally merged PR route. VIRAL is submitted with results pending; no award is claimed.

## Validation

Node 24; core uses built-in modules.

~~~sh
npm test
npm run generate
npm run check
npm run e2e
~~~

The isolated E2E exercises chat confirmation, the actual README consumer, Astro build and real Resume PDF. Fixture facts remain temporary and never deploy. Export SHA256s, content revision and deployment source commits make every output traceable. Historical phase-2 reports describe the previous PR-based flow; this README and CHAT_CONFIRMATION.md describe the current behavior.
