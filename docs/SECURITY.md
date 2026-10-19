# Publication and protection audit

## Trust boundary

The public scanner enumerates `/users/RoyWG925/repos`, requires `private === false`, the owner and a non-fork. Archived games are included. It reads fixed textual sources at immutable commits, does not execute project code, and never uses a model API. Each Actions job has only its own repository token. No public job can read `builder-context-private`. Public schema rejects unexpected fields at profile, project, competition, persona, review, education and evidence boundaries.

The local AI process receives bounded public packs. GitHub/API-key environment variables are removed from the model subprocess. Subscription login is required; no API billing fallback. Source quotes are checked against the pack, but provenance alone cannot prove a claim or its attribution. Roy must inspect the proposed public changes in the interactive conversation. Malicious README instructions remain untrusted data. Local read-only CLI sandbox is not a substitute for OS-level private-data isolation; do not grant it private inputs during public maintenance.

Chat-confirmed publication uses an exact field allowlist, a minimal public owner statement, canonical base hashes, an idempotent approval id and a hashed receipt. The unattended collector/model never authors approvals. Public repository visibility is checked before applying project facts. This is a trusted agent contract, not cryptographic speaker authentication: a writer sharing the owner's GitHub credentials could also manufacture a PR merge or receipt, so do not treat account identity alone as owner consent. Only the actual chat confirmation supplies consent. Unknown fields and private inputs remain rejected.

The optional legacy pull_request_target publisher still executes reviewed main only after a human owner merge, never an unmerged PR head. It retains source/base guards and does not grant blanket approval of other candidates.

Profile sync has contents:write only in the profile repository. Portfolio deployment has contents:read, pages:write and id-token:write. CI is read-only, including PR integration tests. Discovery has contents:write and pull-requests:read only in the canonical repository. There is no cross-repository PAT, approval bot, paid API, LinkedIn API or application submission automation.

## Current protection limitations

On 2026-10-19, builder-context had **no rulesets**. A minimal compatible ruleset was prepared (default branch, Active, Restrict deletions, Block force pushes, empty bypass list), but GitHub required owner reauthentication before saving. It was **not enabled** by this session. CODEOWNERS is advisory without enforced review rules.

Finish the prepared rule at https://github.com/RoyWG925/builder-context/settings/rules after authenticating yourself. Or New ruleset → New branch ruleset → name `Identity main safety` → Enforcement Active → Add target → Include default branch → select Restrict deletions and Block force pushes → leave bypass empty → Create. This protects history while allowing the existing publisher's fast-forward commits.

Apply the same compatible baseline to:

- https://github.com/RoyWG925/RoyWG925/settings/rules
- https://github.com/RoyWG925/portfolio-astro/settings/rules
- https://github.com/RoyWG925/builder-context-private/settings/rules (availability/enforcement depends on the account plan for private repositories; do not upgrade or change visibility automatically).

**Do not simply enable mandatory PRs/status checks on canonical main:** the post-review publisher currently pushes derived canonical files with GITHUB_TOKEN. A strict rule would block that commit and break automatic publication. One required approving review also cannot be satisfied by a sole author approving their own PR. To enforce independent reviews, Roy must choose a separate trusted reviewer and either a narrowly scoped GitHub App publisher with an explicitly approved bypass, or migrate promotion into the reviewed PR before enabling the strict rule. This session did not create credentials, add collaborators or expand bypass permissions.

Actions settings: https://github.com/RoyWG925/builder-context/settings/actions → General → Workflow permissions. Keep default read permissions; workflows explicitly request their minimal scopes. The default queue does not need the Actions PR-creation setting. It remains relevant only to the optional legacy PR proposer; no code approves PRs. Do not add model secrets. Review third-party Action updates; current actions are pinned to immutable SHAs.

## Observed dependency audit

The existing Astro lockfile's `npm ci` reported 12 dependency advisories (1 low, 10 high, 1 critical) during the phase-2 build on 2026-10-19. Identity synchronization uses Node built-ins and did not add those dependencies. The site is statically built, but advisory counts alone do not establish exploitability or absence of risk. A dependency-by-dependency remediation and regression audit remains outstanding; no blind major upgrade was applied to the existing design.

## Private disclosure

Private assessments and applications are maintained only in the private repository. To publish a private project, Roy must explicitly approve a selected public summary and attribution, not merely authorize the agent to read its private code. Public demos do not waive this gate. Unknown organizations/programs/application status remain private pending questions. No history, finance, grades, private contact or credentials are included in public exports.
