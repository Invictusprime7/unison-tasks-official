# Vercel Auto-Deploy Script for Windows
# Automatically deploys changes to Vercel
# Usage: .\scripts\vercel-deploy.ps1 [-Watch] [-Production]

param(
    [switch]$Watch,
    [switch]$Production,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

function Write-ColorOutput($ForegroundColor, $Message) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $fc
}

function Test-VercelCLI {
    try {
        $null = vercel --version
        return $true
    } catch {
        return $false
    }
}

function Install-VercelCLI {
    Write-ColorOutput Yellow "Installing Vercel CLI..."
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput Red "Failed to install Vercel CLI"
        exit 1
    }
    Write-ColorOutput Green "Vercel CLI installed successfully"
}

function Publish-ToVercel {
    param([bool]$Prod = $false)
    
    Write-ColorOutput Cyan "`n========================================="
    Write-ColorOutput Cyan "  Deploying to Vercel..."
    Write-ColorOutput Cyan "=========================================`n"
    
    # Check for uncommitted changes
    $status = git status --porcelain
    if ($status -and -not $Force) {
        Write-ColorOutput Yellow "You have uncommitted changes:"
        Write-Output $status
        Write-ColorOutput Yellow "`nCommitting changes before deploy..."
        
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git add -A
        git commit -m "Auto-deploy: $timestamp"
        
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput Red "Git commit failed"
            return $false
        }
    }
    
    # Push to remote (triggers Vercel webhook if configured)
    Write-ColorOutput Yellow "Pushing to remote repository..."
    git push origin main 2>$null
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput Yellow "Git push failed or no remote configured. Deploying directly..."
    }
    
    # Direct Vercel deployment
    if ($Prod) {
        Write-ColorOutput Yellow "Deploying to PRODUCTION..."
        vercel --prod --yes
    } else {
        Write-ColorOutput Yellow "Deploying preview..."
        vercel --yes
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput Green "`n✓ Deployment successful!"
        
        # Get deployment URL
        $deployUrl = vercel inspect --json 2>$null | ConvertFrom-Json | Select-Object -ExpandProperty url -ErrorAction SilentlyContinue
        if ($deployUrl) {
            Write-ColorOutput Cyan "Deployment URL: https://$deployUrl"
        }
        return $true
    } else {
        Write-ColorOutput Red "✗ Deployment failed"
        return $false
    }
}

function Watch-AndDeploy {
    Write-ColorOutput Cyan "`n========================================="
    Write-ColorOutput Cyan "  Vercel Watch Mode"
    Write-ColorOutput Cyan "  Monitoring for changes..."
    Write-ColorOutput Cyan "  Press Ctrl+C to stop"
    Write-ColorOutput Cyan "=========================================`n"
    
    $lastDeploy = Get-Date
    $debounceSeconds = 30  # Minimum time between deploys
    
    while ($true) {
        Start-Sleep -Seconds 5
        
        # Check for file changes
        $status = git status --porcelain
        
        if ($status) {
            $now = Get-Date
            $elapsed = ($now - $lastDeploy).TotalSeconds
            
            if ($elapsed -ge $debounceSeconds) {
                Write-ColorOutput Yellow "`nChanges detected. Deploying in 5 seconds..."
                Write-ColorOutput Gray "(Press Ctrl+C to cancel)"
                Start-Sleep -Seconds 5
                
                # Re-check if still has changes (user might have cancelled)
                $status = git status --porcelain
                if ($status) {
                    $success = Publish-ToVercel -Prod:$Production
                    $lastDeploy = Get-Date
                    
                    if ($success) {
                        Write-ColorOutput Cyan "`nContinuing to watch for changes..."
                    }
                }
            } else {
                $remaining = [math]::Ceiling($debounceSeconds - $elapsed)
                Write-ColorOutput Gray "Changes detected. Debouncing... ($remaining seconds until next deploy window)"
            }
        }
    }
}

# Main execution
Write-ColorOutput Cyan @"
╔═══════════════════════════════════════╗
║     Unison Tasks Vercel Deployer     ║
╚═══════════════════════════════════════╝
"@

# Check Vercel CLI
if (-not (Test-VercelCLI)) {
    Write-ColorOutput Yellow "Vercel CLI not found."
    Install-VercelCLI
}

# Check if logged in to Vercel
Write-ColorOutput Yellow "Checking Vercel authentication..."
$whoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Yellow "Not logged in to Vercel. Running login..."
    vercel login
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput Red "Vercel login failed"
        exit 1
    }
}
Write-ColorOutput Green "Logged in as: $whoami"

# Link project if needed
$vercelDir = ".vercel"
if (-not (Test-Path $vercelDir)) {
    Write-ColorOutput Yellow "Project not linked to Vercel. Running link..."
    vercel link
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput Red "Vercel link failed"
        exit 1
    }
}

# Run in watch mode or single deploy
if ($Watch) {
    Watch-AndDeploy
} else {
    Publish-ToVercel -Prod:$Production
}
