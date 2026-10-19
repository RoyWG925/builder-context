param([Parameter(Mandatory=$true)][string]$Config)
$ErrorActionPreference='Stop'
$identityCheckout=Split-Path $PSScriptRoot -Parent
$identityLogs=Join-Path (Split-Path $Config -Parent) 'local-state/logs'
New-Item -ItemType Directory -Path $identityLogs -Force | Out-Null
$identityLog=Join-Path $identityLogs ((Get-Date -Format 'yyyy-MM-dd-HHmmss')+'.log')
Start-Transcript -Path $identityLog | Out-Null
try {
  # Do not reset, stash or overwrite local edits.
  if ((& git -C $identityCheckout status --porcelain).Length -gt 0) { throw 'Checkout has local changes; scheduled update paused.' }
  & git -C $identityCheckout pull --ff-only
  if ($LASTEXITCODE -ne 0) { throw 'Unable to update trusted runner' }
  & (Join-Path $PSScriptRoot 'Invoke-IdentityMaintenance.ps1') -Config $Config -Publish
} finally { Stop-Transcript | Out-Null }
