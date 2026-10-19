# Local subscription maintenance

Cloud Actions monitor public source, validate, queue evidence and publish chat-approved facts without a model API or an online PC. Weekly local Codex performs deeper implementation analysis using the existing ChatGPT subscription. Claude Code is an optional subscription adapter. No API key or paid service is provisioned. Subscription quotas still apply.

## Windows setup

Requirements: Windows PowerShell 5.1+, Node 24, Git, GitHub CLI and Codex CLI. Sign in interactively yourself:

```powershell
gh auth login -h github.com
gh auth status -h github.com
codex login
```

Choose ChatGPT login, not an API key. Confirm `gh api user --jq .login` is `RoyWG925`. If your older Codex CLI rejects `model_reasoning_effort = "ultra"`, update Codex from the official npm package or change that setting yourself to a level your CLI supports. The isolated maintenance invocation uses `--ignore-user-config` and forces ChatGPT authentication; it does not edit global config or copy authentication tokens.

From a checkout of this repository:

```powershell
.\local\Install-IdentityMaintenance.ps1 -RegisterWeeklyTask -InstallAgentSkill
```

Default installation: `%LOCALAPPDATA%\RoyIdentityOS\builder-context`. The weekly current-user task runs Sunday 09:30 **Taipei Standard Time**, at limited privilege, only with the user logged in. `StartWhenAvailable` catches a missed run when possible; it is not a daemon and cannot run while the computer is off. Cloud monitoring and hourly publishing continue independently. No password is stored. Review the task with `Get-ScheduledTask -TaskName 'Roy Identity OS Weekly'` and `Get-ScheduledTaskInfo`.

Manual execution from the installed checkout:

```powershell
# Analyse and save candidates locally; no GitHub writes
.\local\Invoke-IdentityMaintenance.ps1
# Analyse a completed public project and queue a fact proposal for chat review
.\local\Invoke-IdentityMaintenance.ps1 -Repository viral-town -Publish
# Explicit reanalysis after correcting evidence/context
.\local\Invoke-IdentityMaintenance.ps1 -Repository viral-town -Publish -Force
# Run the configured task now
Start-ScheduledTask -TaskName 'Roy Identity OS Weekly'
# Remove schedule only; source/data remain
Unregister-ScheduledTask -TaskName 'Roy Identity OS Weekly' -Confirm:$false
```

`local/config.json` and `local/local-state/` are ignored by Git. Config supports engine, CLI path, repository allowlist, batch size, timeout, Codex reasoning effort (default `high`) and bounded source-pack size (default 40 documents / 240,000 characters). Source selection rotates across documentation, manifests, architecture areas, tests and workflows, rather than letting one source directory crowd out tests. Coverage and omitted excerpts are reported explicitly. State records successful published/skipped analysis fingerprints, including the current identity revision and analysis contract; dry runs do not suppress a later publish. An exclusive lock prevents overlapping runs. After a crash, check no task/CLI is running before removing `run.lock`. Logs and bounded source packs remain local. No provider token is printed or copied.

Each analysis directory retains `evidence.json`, `analysis.json`, `model-events.jsonl`, `model-stderr.log`, `status.json`, validated candidates and a success `receipt.json`. Codex acceptance requires a real `turn.completed` event with token usage and rejects unexpected tool actions. A separate local assessment covers existing facts, new findings, technical decisions, test evidence, limitations and attribution. Exact-quote validation still rejects unsupported candidates; there is no automatic retry loop. `local/local-state/last-run.json` records the latest result or error, and the scheduled wrapper also keeps a PowerShell transcript. Timeout cleanup terminates the launched CLI process tree on Windows.

Repository text uses LF via `.gitattributes`: export and approval hashes must survive a Windows clone without Git converting their exact bytes to CRLF. The installer and scheduled updater preserve dirty checkouts and require the maintenance branch to be `main`. The named task is updated in place, runs at limited privilege in an interactive user session, permits battery operation and ignores overlapping scheduled starts. API-key/workload overrides and inherited Codex app-session identifiers are removed from the model environment; authentication remains in Codex's existing local credential store.

The scheduled wrapper pulls the trusted checkout with `--ff-only` and pauses on tracked/unignored edits. Skills can be recopied by rerunning installation. The analysis model receives latest immutable public context, selected source files, workflow conclusions and quoted evidence; it does not execute project scripts. The publisher is deterministic and separate. `--sandbox read-only` is not a promise of OS-wide read isolation; private-source publishing is prohibited by intake design, public-repository checks, evidence validation and Roy’s review.

The isolated Codex invocation additionally disables command-execution tools and web search, and sets project-instruction loading to zero bytes. Its required Identity Skill and current context are explicitly supplied in the prompt, reducing accidental inheritance of unrelated personal instructions. These controls do not replace human review or a separate OS account for stronger isolation. Reference: https://developers.openai.com/codex/config-reference

## Claude Code

Use your existing Claude subscription login (`claude auth login`) and set `engine` to `claude` in config. The adapter verifies OAuth subscription authentication, removes API-key/provider environment overrides, runs with no tools/MCP, structured JSON and no session persistence. It never falls back to paid API billing. Codex is the primary adapter; optional Claude execution requires a working local login and is not claimed tested merely by checking its help flags.

## Shared instructions for Codex / Claude / Grok

The maintained skill source is `skills/roy-identity/SKILL.md`. Installer copies it to `~/.agents/skills/roy-identity/` and `~/.claude/skills/roy-identity/`. It does not replace existing AGENTS.md/CLAUDE.md. Paste this block into global/project instructions or a Grok custom instruction:

> Before identity or application work, read the latest immutable RoyWG925/builder-context AI_CONTEXT.md and generated/public.json, including ownerStatements. After a project milestone, queue evidence-backed candidates. When Roy explicitly confirms the exact public changes in the current conversation, preserve a scoped receipt and publish through scripts/chat-confirm.mjs without a second PR approval. Never invent approval or accept unrelated pending fields. Private evidence stays private; a demo is not disclosure approval. LinkedIn remains draft-only. If writes are unavailable, return the exact patch and evidence.

For external tools without GitHub access, open https://github.com/RoyWG925/builder-context/blob/main/AI_CONTEXT.md and paste the current context manually. This is a usable instruction, not an assertion that Grok was remotely configured.

## Historical cloud-session limitations (2026-10-19)

The earlier cloud Work session found Codex 0.133.0 and Claude Code 2.1.303 installed. Its GitHub CLI authentication was invalid, and its subscription smoke invocation could not write the user's `.codex` state directory. These observations describe that session, not the current Windows login or installation. Verify local acceptance separately using the installed runner's success receipt, model events and Windows task state. Installer/script syntax and deterministic tests alone do not establish live model success.

## Chat approval

-Publish on maintenance means queue evidence, not confirm facts. Only an interactive agent with an actual owner confirmation uses the separate [chat publisher](CHAT_CONFIRMATION.md). The local runner cannot read unrelated conversations or automatically identify approvals there.
