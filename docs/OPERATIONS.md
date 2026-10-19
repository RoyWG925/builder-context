# Operations

## Published source and consumers

- Source: RoyWG925/builder-context, main.
- Profile consumer: RoyWG925/RoyWG925, `Sync Roy Identity OS` Action at minute 35 every hour.
- Portfolio consumer: RoyWG925/portfolio-astro, `Deploy to GitHub Pages` Action at minute 45 every hour, on push, and manually.
- Discovery: 01:17 UTC / 09:17 Asia/Taipei every day, or manually.
- Confirmation: only a candidate PR merged by RoyWG925. Other users cannot trigger confirmation by changing a label or by writing a comment.

Consumers first resolve main to a commit SHA and fetch the generated bundle at that SHA. The portfolio verifies the bundle content hash before changing files. Downloaded HTML, JSON and README are data, not downloaded executable code.

## AI setup

GitHub Models was retired on 2026-07-30; this project does not call its retired endpoint.

Set `IDENTITY_AI_API_KEY` as an Actions repository secret. Optionally set `IDENTITY_AI_BASE_URL` and `IDENTITY_AI_MODEL` repository variables for an OpenAI-compatible Chat Completions provider. Default endpoint is https://api.openai.com/v1. Do not place API keys in JSON, issues, prompts, logs or git. AI input contains only public repository evidence.

Without this secret, evidence discovery, review PRs, confirmation, profile synchronization and deployment still run. PRs and Action logs explicitly say `evidence-only`. This is degraded mode; it is not represented as an AI review. Provider failures also fall back visibly to evidence-only proposals.

Personal repositories cannot rely on the organization-only Copilot GITHUB_TOKEN billing flow. An existing consumer ChatGPT subscription is not an API credential. Configure the provider directly in GitHub's secret UI; do not paste a key into a chat or a PR.

## First-run settings

Enable Actions and **Allow GitHub Actions to create and approve pull requests** for builder-context. This permits creation, but the system never automatically approves or merges PRs. Keep main and canonical JSON changes under owner review; CODEOWNERS alone is not branch protection.

The portfolio uses the existing GitHub Pages source and project base path. The old design, physics, portals, X-ray and stress-test controls remain in the existing Astro components.

## Common recovery

| Symptom | Check |
| --- | --- |
| No AI wording in proposals | Configure the provider secret; inspect the explicit AI status in the run |
| PR creation returns 403 | Enable the repository Actions PR creation setting |
| Consumers show older content | Run source validation and the consumer's manual sync/deploy Action; schedules can be delayed by GitHub |
| Changed input but stale generated files | Run `npm run generate`, commit canonical data and outputs together |
| Confirmation rejected | Verify the actual merger was RoyWG925, not an auto-merge bot; inspect canonical source and candidate evidence |
| Stale discovery branch | Close or finish the current review PR before rerunning; proposals are held together on identity/discovery |
| Private detail found in a public proposal | Do not merge. Remove it and inspect the source; a public fact must be deliberately curated first |

Private data are maintained in a separate private repository with no public publishing workflow. No public job has credentials to fetch it.
