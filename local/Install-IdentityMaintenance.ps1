[CmdletBinding()]
param([string]$InstallDirectory=(Join-Path $env:LOCALAPPDATA 'RoyIdentityOS'),[ValidateSet('codex','claude')][string]$Engine='codex',[switch]$RegisterWeeklyTask,[switch]$InstallAgentSkill)
$ErrorActionPreference='Stop'
foreach ($tool in @('node','git','gh')) { if (!(Get-Command $tool -ErrorAction SilentlyContinue)) { throw "Install $tool first; see docs/LOCAL_AGENTS.md." } }
& gh auth status -h github.com
if ($LASTEXITCODE -ne 0) { throw 'Run gh auth login -h github.com, then run this installer again.' }
$identityLogin=(& gh api user --jq .login).Trim()
if ($identityLogin -ne 'RoyWG925') { throw 'GitHub CLI must be authenticated as RoyWG925.' }
$identityInstall=[IO.Path]::GetFullPath($InstallDirectory)
New-Item -ItemType Directory -Path $identityInstall -Force | Out-Null
$identityCheckout=Join-Path $identityInstall 'builder-context'
if (!(Test-Path -LiteralPath $identityCheckout)) { & git clone https://github.com/RoyWG925/builder-context.git $identityCheckout; if ($LASTEXITCODE -ne 0) { throw 'Clone failed' } }
$identityRemote=(& git -C $identityCheckout remote get-url origin).Trim()
if ($identityRemote -notmatch 'github\.com[:/]RoyWG925/builder-context(?:\.git)?$') { throw 'Unexpected checkout remote; refusing to use it.' }
& git -C $identityCheckout pull --ff-only
if ($LASTEXITCODE -ne 0) { throw 'Checkout has divergent/local changes; resolve them before installing.' }
$identityConfig=Join-Path $identityCheckout 'local/config.json'
if (!(Test-Path -LiteralPath $identityConfig)) {
  $identitySettings=Get-Content -LiteralPath (Join-Path $identityCheckout 'local/config.example.json') -Raw | ConvertFrom-Json
  $identitySettings.engine=$Engine
  if ($Engine -eq 'codex') { $identitySettings.codexEntry=Join-Path $env:APPDATA 'npm/node_modules/@openai/codex/bin/codex.js'; if (!(Test-Path -LiteralPath $identitySettings.codexEntry)) { throw 'Install Codex CLI with npm install -g @openai/codex, then run codex login using ChatGPT.' } }
  $identitySettings | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $identityConfig -Encoding utf8
}
if ($InstallAgentSkill) {
  foreach ($identitySkillRoot in @((Join-Path $env:USERPROFILE '.agents/skills'),(Join-Path $env:USERPROFILE '.claude/skills'))) {
    $identitySkillTarget=Join-Path $identitySkillRoot 'roy-identity'
    New-Item -ItemType Directory -Path $identitySkillTarget -Force | Out-Null
    Copy-Item -LiteralPath (Join-Path $identityCheckout 'skills/roy-identity/SKILL.md') -Destination (Join-Path $identitySkillTarget 'SKILL.md') -Force
  }
}
if ($RegisterWeeklyTask) {
  if ((Get-TimeZone).Id -ne 'Taipei Standard Time') { throw 'Weekly task expects Taipei Standard Time. Configure your intended timezone or create a trigger manually.' }
  $identityPowerShell=(Get-Command powershell.exe).Source
  $identityRunner=Join-Path $identityCheckout 'local/Run-ScheduledMaintenance.ps1'
  $identityAction=New-ScheduledTaskAction -Execute $identityPowerShell -Argument ('-NoProfile -File "'+$identityRunner+'" -Config "'+$identityConfig+'"') -WorkingDirectory $identityCheckout
  $identityTrigger=New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At '09:30'
  $identityPrincipal=New-ScheduledTaskPrincipal -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Limited
  $identityTaskSettings=New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Hours 1)
  Register-ScheduledTask -TaskName 'Roy Identity OS Weekly' -Action $identityAction -Trigger $identityTrigger -Principal $identityPrincipal -Settings $identityTaskSettings -Description 'Local subscription AI analysis; evidence PRs only, no merges. Sunday 09:30 Taipei.' -Force | Out-Null
}
Write-Host "Installed: $identityCheckout"
Write-Host "Manual dry run: & `"$identityCheckout\local\Invoke-IdentityMaintenance.ps1`" -Config `"$identityConfig`""
Write-Host 'Add -Publish to create candidate PRs. No model API key is used.'
