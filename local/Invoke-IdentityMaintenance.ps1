[CmdletBinding()]
param([string]$Config=(Join-Path $PSScriptRoot 'config.json'),[string]$Repository,[switch]$Publish,[switch]$Force)
$ErrorActionPreference='Stop'
$identityRepo=Split-Path $PSScriptRoot -Parent
if (!(Test-Path -LiteralPath $Config)) { throw 'Config missing. Run Install-IdentityMaintenance.ps1 first, or copy config.example.json to config.json.' }
$arguments=@((Join-Path $identityRepo 'scripts/local-agent.mjs'),'--config',(Resolve-Path -LiteralPath $Config).Path)
if ($Repository) { $arguments+=@('--repository',$Repository) }
if ($Publish) { $arguments+='--publish' }
if ($Force) { $arguments+='--force' }
& node @arguments
if ($LASTEXITCODE -ne 0) { throw "Identity maintenance failed ($LASTEXITCODE). No fact is automatically merged." }
