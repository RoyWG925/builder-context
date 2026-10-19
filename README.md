# Roy Identity OS

Evidence-backed professional context for Roy Wang / 王語揚, shared across AI agents, GitHub Profile, the existing Astro portfolio, resume, hackathon records and LinkedIn drafts.

**[Read AI_CONTEXT.md](AI_CONTEXT.md)** · **[Portfolio](https://roywg925.github.io/portfolio-astro/)** · **[Profile](https://github.com/RoyWG925)** · **[Resume source](generated/resume.html)** · **[LinkedIn drafts](generated/linkedin.md)**

## One source, several outputs

| Edit here | Purpose |
| --- | --- |
| profile/public.json | Public identity, positioning, education, links and published skills |
| projects/*.json | Project, actual contribution, technology, status, results, limitations, lessons, evidence and verification date |
| competitions/*.json | Hackathon association and explicitly known/unknown submission and results |
| evidence/sources.json | Public evidence and corrections |
| candidates/*.json | Proposed changes; never included in generated public views |

`npm run generate` produces AI_CONTEXT.md, generated/public.json, Profile README, HTML/Markdown resume, application context and LinkedIn drafts from those inputs. It is deterministic and embeds a content revision. The public bundle never reads a private directory or a private repository.

## Daily operation

1. The daily **Discover evidence and propose facts** Action lists only public repositories owned by RoyWG925, compares HEAD/readme evidence and asks the configured OpenAI-compatible provider for a structured project proposal. The provider credential lives only in a GitHub Actions secret. If model access is unavailable, an explicitly labelled evidence-only proposal is still created; logs report that AI was unavailable.
2. The Action opens a PR with candidates and a source-commit trail. Reject, edit or merge that PR. Nothing is published from a candidate just because it was discovered.
3. **Roy merging the candidate PR is confirmation.** The confirmation Action checks the actual merger, reads the changed candidate paths, records the PR/merge commit, validates, and regenerates outputs. Other users and bots cannot confirm facts through this workflow.
4. The Profile Action pulls the public generated README hourly. The Astro deploy Action pulls a single immutable source revision hourly, regenerates the PDF, builds the existing site and deploys to GitHub Pages. Manual workflow runs are also available. GitHub may delay scheduled runs; synchronization is eventual, not instantaneous.
5. Open generated/linkedin.md and paste approved wording manually. No LinkedIn posting integration is installed.

The three repositories use their own scoped GITHUB_TOKEN. No cross-repository write token, PAT or private data is required for synchronization. AI suggestions require a provider API key configured as an Actions secret.

## Review and privacy

- `published-baseline` means an existing public statement was migrated with a source. It is not a new owner attestation.
- `owner-confirmed` includes the merger, PR, timestamp and exact merge commit.
- Private evidence, application notes, grades and private project intake live in a separate **private** repository. They are not dependencies of this repository or its workflows. Explicitly curate a public fact before copying anything across that boundary.
- VIRAL's public README establishes a hackathon project association. Submission, acceptance, awards and Roy's individual team role remain unknown.
- The older resume's BERT performance wording is superseded by the current repository's evaluation caveats. Do not reuse the old number without its data-overlap limitation.

## Development

Requires Node 22.12+ (Node 24 in Actions). The generator, validator, scanner and tests use Node built-ins.

```sh
npm test
npm run validate
npm run generate
npm run check
# Optional PDF; install the exact Puppeteer version used by the portfolio workflow
npm run pdf
```

For a new project proposal, copy a project JSON into candidates/<id>.json inside `{ "kind":"project", "record":{...}, "sources":[...] }`, set review.state to `proposed`, and attach public evidence. Never change generated files as the source of a fact.

GitHub Actions must be enabled. AI suggestions require the provider secret; GitHub Models was retired in July 2026. Creating automated PRs requires the repository's **Allow GitHub Actions to create and approve pull requests** setting. Approvals themselves are never automated. See [operations](docs/OPERATIONS.md) for recovery and checks.
