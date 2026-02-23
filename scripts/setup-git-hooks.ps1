# Setup Git Hooks for Auto-Deploy
# Run this once to enable automatic deployment on git push

param(
    [switch]$Remove
)

$hookDir = ".git/hooks"
$postPushHook = "$hookDir/post-push"
$preCommitHook = "$hookDir/pre-commit"

if (-not (Test-Path ".git")) {
    Write-Host "Error: This is not a git repository" -ForegroundColor Red
    exit 1
}

if ($Remove) {
    Write-Host "Removing git hooks..." -ForegroundColor Yellow
    
    if (Test-Path $postPushHook) {
        Remove-Item $postPushHook -Force
        Write-Host "Removed post-push hook" -ForegroundColor Green
    }
    
    Write-Host "Git hooks removed." -ForegroundColor Green
    exit 0
}

Write-Host @"
╔═══════════════════════════════════════╗
║   Setting up Auto-Deploy Git Hooks    ║
╚═══════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Create hooks directory if needed
if (-not (Test-Path $hookDir)) {
    New-Item -ItemType Directory -Path $hookDir -Force | Out-Null
}

# Create post-commit hook that will trigger Vercel deploy
$postCommitHook = "$hookDir/post-commit"
$postCommitContent = @'
#!/bin/sh
# Auto-deploy to Vercel after commit

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║   Auto-deploying to Vercel...         ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# Check if on main branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "master" ]; then
    echo "Not on main/master branch. Skipping production deploy."
    echo "Branch: $BRANCH"
    exit 0
fi

# Push to trigger Vercel webhook
echo "Pushing to origin..."
git push origin $BRANCH 2>/dev/null

# If push fails, deploy directly
if [ $? -ne 0 ]; then
    echo "Push failed or no remote. Deploying directly..."
    vercel --prod --yes
fi

echo ""
echo "✓ Deployment triggered!"
'@

Set-Content -Path $postCommitHook -Value $postCommitContent -Force -NoNewline
Write-Host "Created post-commit hook" -ForegroundColor Green

# Make executable (for Git Bash/WSL)
try {
    icacls $postCommitHook /grant Everyone:RX | Out-Null
} catch {}

Write-Host @"

✓ Auto-deploy hooks installed!

How it works:
1. Make changes to your code
2. Commit your changes: git commit -am "Your message"
3. The hook automatically pushes and triggers Vercel deployment

To remove hooks:
  .\scripts\setup-git-hooks.ps1 -Remove

"@ -ForegroundColor Cyan
