# WSL and Docker Setup Script
# Run this script as Administrator

Write-Host "=== WSL & Docker Setup ===" -ForegroundColor Cyan

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n[1/4] Enabling Windows Subsystem for Linux..." -ForegroundColor Yellow
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

Write-Host "`n[2/4] Enabling Virtual Machine Platform..." -ForegroundColor Yellow
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

Write-Host "`n[3/4] Setting WSL 2 as default version..." -ForegroundColor Yellow
# This may fail until after reboot, that's okay
wsl --set-default-version 2 2>$null

Write-Host "`n[4/4] Installing Ubuntu distribution..." -ForegroundColor Yellow
wsl --install -d Ubuntu 2>$null

Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
Write-Host @"

NEXT STEPS:
1. RESTART your computer to complete WSL installation
2. After restart, open PowerShell and run: wsl --status
3. If prompted, set up your Ubuntu username and password
4. Start Docker Desktop - it should now work with WSL 2

If Docker Desktop still has issues after restart:
- Open Docker Desktop Settings > General
- Ensure 'Use WSL 2 based engine' is checked
- Go to Resources > WSL Integration
- Enable integration with Ubuntu

"@ -ForegroundColor Cyan
