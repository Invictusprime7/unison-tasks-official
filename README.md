# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/16184d1a-4f96-4f26-972e-cece3891ea55

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/16184d1a-4f96-4f26-972e-cece3891ea55) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Set up your environment configuration
./scripts/setup-env.sh

# Step 4: Install the necessary dependencies (if not done by setup script).
npm i

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## 🔧 Environment Setup

This project uses environment variables for configuration. Several setup options are available:

### Quick Start (Recommended)

Use the interactive setup script:

```bash
./scripts/setup-env.sh
```

This script will guide you through setting up the appropriate environment for your needs.

### Manual Setup

#### For Development

1. Copy the development template:
   ```bash
   cp .env.development .env
   ```

2. Or copy from the local development example:
   ```bash
   cp .env.local.example .env.local
   ```

#### For Production

1. Copy the production template:
   ```bash
   cp .env.production.example .env.production
   ```

2. Update the values with your production credentials

### Environment Files Overview

- **`.env.example`** - Complete template with all available variables and documentation
- **`.env.local.example`** - Example for local development setup
- **`.env.production.example`** - Example for production deployment
- **`.env.development`** - Default development configuration (uses Lovable Cloud)

### Required Environment Variables

The following variables are required for the application to function:

```bash
# Supabase Configuration (required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

### Optional Environment Variables

```bash
# Feature flags
VITE_ENABLE_AI_ASSISTANT=true
VITE_ENABLE_WEB_BUILDER=true
VITE_ENABLE_DESIGN_STUDIO=true

# Development settings
VITE_PORT=8080
VITE_ENABLE_DEV_TOOLS=true

# Third-party integrations
VITE_LOVABLE_API_KEY=your-lovable-key
VITE_OPENAI_API_KEY=your-openai-key
```

### Using Local Supabase

If you want to use a local Supabase instance:

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Start local Supabase:
   ```bash
   supabase start
   ```

3. Update your `.env` file:
   ```bash
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_PUBLISHABLE_KEY=your-local-anon-key
   VITE_SUPABASE_PROJECT_ID=localhost
   ```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/16184d1a-4f96-4f26-972e-cece3891ea55) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
