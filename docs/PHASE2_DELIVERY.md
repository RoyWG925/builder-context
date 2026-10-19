# Roy Identity OS — phase 2 delivery

Verified 2026-10-19. Phase 2 modifies the existing repositories; no replacement system or hosting service was created. No model API key, paid API or LinkedIn automation is used.

## Implemented repositories and files

| Repository | Files / behavior |
| --- | --- |
| builder-context | `scripts/evidence.mjs`, `scan.mjs`, `proposals.mjs`: public evidence packs, meaningful-content fingerprints, independent immutable proposals, all-state PR deduplication and suppression of redundant cloud proposals when AI review already covers the snapshot |
| builder-context | `confirm.mjs`, `validate.mjs`, `lib.mjs`: schema-v2 candidates, canonical base-hash guard, public-visibility recheck, owner-only merge event, accepted receipts and strict public-field validation |
| builder-context | `profile/public.json`, `profile/personas.json`, competition and owner-statement receipts: requested product direction, four audiences and explicitly owner-attested VIRAL submission with pending results; audience competition status derives from canonical data |
| builder-context | `generate.mjs`, export manifest, introductions and generated views: deterministic shared revision and exact per-file SHA256; LinkedIn draft only |
| builder-context | `local/*.ps1`, config example, analysis prompt, `scripts/local-agent.mjs`, `skills/roy-identity/SKILL.md`, `AGENTS.md`, `CLAUDE.md`: weekly/manual Codex subscription maintenance, optional Claude adapter and reusable external-agent instructions |
| builder-context | `tests/identity.test.mjs`, `scripts/e2e.mjs`, `verify-live.mjs`, CI workflows: core invariants, actual isolated consumer/Astro/PDF integration and reproducible live verification |
| portfolio-astro | `scripts/sync-identity.mjs`, `build-receipt.mjs`, `check-build.mjs`, deploy workflow: pinned/hash-verified imports, checked offline builds, PDF hash and deployment receipt |
| portfolio-astro | Removed tracked generated JSON/HTML/context/PDF snapshots; ignored runtime outputs. `index.astro` changes only the PDF link revision query; the original interaction script and global CSS are preserved. Journey shows results and distinguishes owner attestation from competition results |
| RoyWG925 | README sync adapter/workflow and `identity-source.json`: manifest-verified README with immutable source receipt; manual source-commit replay |
| Private intake repository | Separate project assessments, attribution, expected versus executed tests, disclosure questions and pending programs/applications; no private project facts copied into public exports |

Code anchors: source data/export commit [b92601c](https://github.com/RoyWG925/builder-context/commit/b92601c47bee6b168597540e01e1ad93423e7dd1); portfolio [bd82a2c](https://github.com/RoyWG925/portfolio-astro/commit/bd82a2c2124f2bb53ef8e55d2cf437b216917f19); profile workflow [0ea5bfa](https://github.com/RoyWG925/RoyWG925/commit/0ea5bfae8c0112e0e72b028bb24e627b427e4aea). Later documentation/local-runner commits may be newer without changing the public content revision.

## Tests and live versions

Local core suite: **21 passed**. PowerShell files parsed successfully. Skill frontmatter validator passed (Python UTF-8 mode). Cloud validation and real isolated E2E succeeded at [39247485075](https://github.com/RoyWG925/builder-context/actions/runs/39247485075); [latest source CI](https://github.com/RoyWG925/builder-context/actions/workflows/ci.yml) covers subsequent code/report commits.

The E2E test copies canonical data into a temporary workspace, simulates an owner-confirmed candidate, generates actual exports, calls the real Profile and Astro consumers, performs a real Astro build and Puppeteer PDF render, extracts PDF text, checks revision/source receipts, verifies original controls and rejects a tampered offline file. The fixture is never committed as a fact or deployed. A production human merge was not performed by this agent.

Final published content revision:

`1426d56864527c2a23ef63065d0b02c14aef25c987f04de4b02ad73a8fb4b58f`

| Outlet | Result / reproducible version |
| --- | --- |
| Canonical generated exports | revision above; source `b92601c47bee6b168597540e01e1ad93423e7dd1` |
| Profile README | exact export SHA256 verified; profile commit `6ed91231db806b7bb6bdf321b206130e1d7484da`; same source/revision |
| Astro homepage / public JSON | same source/revision; portfolio commit `bd82a2c2124f2bb53ef8e55d2cf437b216917f19` |
| HTML resume / AI context | exact export hashes verified; same revision |
| Resume PDF | same revision in extracted text; one page; submission says results pending; no fixture text |
| Persona / application / LinkedIn drafts | generated from the same revision; competition status has one canonical source |

PDF SHA256: `6e15a0c88c01ae3e517caed2475f1c4c46fa505d4fb1e1f331d0bdf1181a2650`.

[Live build receipt](https://roywg925.github.io/portfolio-astro/identity-build.json) records the exact source commit, portfolio commit, Actions run and PDF hash. GitHub Raw caches mutable branch URLs for about 5 minutes and Pages responses for about 10 minutes. Live verification resolves Profile main to an immutable SHA and checks Pages with a revision query; the website’s PDF download links also carry the revision.

Successful operational runs:

- [Public evidence scan 39246362404](https://github.com/RoyWG925/builder-context/actions/runs/39246362404): six public project repositories inspected with three pending PRs; four accepted/identical snapshots skipped, two covered by existing AI review; no duplicate PR generated.
- [Profile sync 39247608360](https://github.com/RoyWG925/RoyWG925/actions/runs/39247608360): success.
- [Astro/PDF deployment 39247656422](https://github.com/RoyWG925/portfolio-astro/actions/runs/39247656422): success.
- Initial rollout run 39245504372 attempt 1 failed because consumers started before the new manifest was available. It stopped rather than serving an old snapshot; attempt 2 succeeded. This failure was diagnosed, not hidden.
- Closing the unmerged legacy PR produced an expected **skipped** confirmation job; no new fact was confirmed.

Recheck with `npm run verify:live`. Offline E2E dependencies and commands are in CI and [operations](OPERATIONS.md).

## Review proposals

[PR #1](https://github.com/RoyWG925/builder-context/pull/1) was closed without merging as superseded. Independent, CI-passing proposals remain for [BallCrawl #2](https://github.com/RoyWG925/builder-context/pull/2), [T-MINUS #3](https://github.com/RoyWG925/builder-context/pull/3), and [VIRAL #4](https://github.com/RoyWG925/builder-context/pull/4). No agent merged them. Feature claims, attribution, dates and outcomes remain reviewable.

For a new project, Roy can select `record.featured` in that single canonical proposal to include it in the Profile/homepage/default resume. Every accepted project appears in public structured context and the evidence journey. There is no need to edit each outlet separately.

## Local installation and remaining human actions

Follow [LOCAL_AGENTS.md](LOCAL_AGENTS.md). From the existing checkout:

```powershell
gh auth login -h github.com
codex login
.\local\Install-IdentityMaintenance.ps1 -RegisterWeeklyTask -InstallAgentSkill
# Manual public-project proposal; without -Publish it is a local dry run
.\local\Invoke-IdentityMaintenance.ps1 -Repository viral-town -Publish
```

Installed default checkout is `%LOCALAPPDATA%\RoyIdentityOS\builder-context`; manual commands after installation should run there. The current-user limited task runs Sunday 09:30 Taipei, with missed-run recovery when available. It uses no stored password and needs the user logged in. Cloud monitoring/publishing continues while the PC is off.

Remaining items are explicit:

1. **Local authentication/installation:** this Work session found invalid GitHub CLI authentication and cannot write the user’s Codex state directory. A real CLI smoke run failed at state initialization. Therefore no Windows task/global Skill was installed and live subscription AI analysis is not claimed complete. Run the installer locally after signing in. The existing incompatible `ultra` CLI setting may need a CLI update or your own correction for interactive login; the scheduled invocation ignores user config.
2. **Claude / Grok:** the optional Claude adapter is implemented but not exercised with a live subscription. Paste the supplied instructions into external agents that cannot be configured remotely. Do not assume this session changed their settings.
3. **Fact review and disclosure:** review PRs #2–#4 and private intake questions. Official submission receipt and individual/team attribution are still optional evidence to collect; no award or usage/revenue is invented. Private program/application status remains pending.
4. **Protection rules:** all three public repositories currently report `protected: false` and no rulesets. GitHub demanded owner reauthentication when saving the prepared history-protection rule. Finish the exact linked steps in [SECURITY.md](SECURITY.md). Mandatory PR/status enforcement additionally requires a compatible publisher/reviewer design; blindly enabling it would block the current post-review publisher. No credentials, collaborators or bypass privileges were added.
5. **Dependency remediation:** the existing Astro lockfile reported 12 advisories (including 1 critical) in npm’s audit. Dependency-specific remediation/exploitability review remains outstanding; preserving the current site was prioritized over an unverified broad dependency change. See the precise audit limitation in SECURITY.md.
6. **Existing desktop checkout:** generated snapshots are now build-time artifacts, but an older local checkout still needs an ordinary clean `git status` check followed by `git pull --ff-only`. No local changes were reset. The original desktop resume folder was not overwritten.

The code/cloud pipeline is deployed and verified. The remaining local login/task setup, personal fact approval and protection reauthentication require Roy’s own local/account interaction.
