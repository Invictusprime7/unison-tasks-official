# GitHub Actions Configuration Guide

This repository includes a two-stage CI/CD pipeline:
- **CI Workflow** (`ci.yml`): Runs on all pushes and pull requests - linting, type checking, building, and security audit
- **Deploy Workflow** (`deploy.yml`): Runs only on main branch after CI passes - production deployment

## Workflow Structure

### Repository Variables (Public Configuration)
Go to your repository settings → Secrets and variables → Actions → Variables tab:

- `VITE_SUPABASE_URL` - Your Supabase project URL (e.g., `https://your-project.supabase.co`)
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase publishable/anon key
- `VITE_SUPABASE_PROJECT_ID` - Your Supabase project ID

### Repository Secrets (Private Configuration)
Go to your repository settings → Secrets and variables → Actions → Secrets tab:

#### For Vercel Deployment (Optional)
- `VERCEL_TOKEN` - Your Vercel authentication token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID

#### For Netlify Deployment (Optional)
- `NETLIFY_AUTH_TOKEN` - Your Netlify authentication token
- `NETLIFY_SITE_ID` - Your Netlify site ID

#### For Docker Hub Deployment (Optional)
- `DOCKERHUB_USERNAME` - Your Docker Hub username
- `DOCKERHUB_TOKEN` - Your Docker Hub access token

## Workflow Behavior

### CI Workflow (Always runs)
- **Triggers**: On every push and pull request to main, master, develop, feature branches
- **Actions**: ESLint linting, TypeScript checking, Vite build, npm security audit
- **Build**: Uses dummy environment variables for validation - no real secrets needed

### Deploy Workflow (Production only)
- **Triggers**: Only after CI workflow completes successfully on main branch, or manually via workflow_dispatch
- **Actions**: Production build and deployment (when configured)
- **Environment**: Uses real production environment variables and secrets

## Getting Started

1. **Minimum Setup**: Configure the Supabase variables to enable building
2. **Choose Deployment Platform(s)**: Configure secrets for your preferred deployment method(s)
3. **Test**: Push to main branch to trigger the full workflow

## Environment Setup Commands

```bash
# Set Supabase variables (replace with your actual values)
gh variable set VITE_SUPABASE_URL --body "https://your-project.supabase.co"
gh variable set VITE_SUPABASE_PUBLISHABLE_KEY --body "your_publishable_key"
gh variable set VITE_SUPABASE_PROJECT_ID --body "your_project_id"

# Set Vercel secrets (optional)
gh secret set VERCEL_TOKEN --body "your_vercel_token"
gh secret set VERCEL_ORG_ID --body "your_vercel_org_id" 
gh secret set VERCEL_PROJECT_ID --body "your_vercel_project_id"

# Set Netlify secrets (optional)
gh secret set NETLIFY_AUTH_TOKEN --body "your_netlify_token"
gh secret set NETLIFY_SITE_ID --body "your_netlify_site_id"

# Set Docker Hub secrets (optional)
gh secret set DOCKERHUB_USERNAME --body "your_dockerhub_username"
gh secret set DOCKERHUB_TOKEN --body "your_dockerhub_token"
```

## Troubleshooting

- If builds fail due to missing Supabase configuration, set the repository variables
- If deployments are skipped, check that the required secrets are configured
- For deployment-specific issues, check the platform's documentation and ensure your tokens have the correct permissions