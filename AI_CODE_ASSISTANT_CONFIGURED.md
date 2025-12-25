# AI Code Assistant Configuration Complete

## Changes Made

### 1. Environment Configuration
- Created .env file with proper Supabase configuration
- Added support for both PUBLISHABLE_KEY (client-side) and SERVICE_ROLE_KEY (server-side)
- **IMPORTANT**: Replace your_service_role_key_here with your actual Supabase service role key

### 2. New AI Client Module
- Created src/integrations/supabase/ai-client.ts
- Dedicated Supabase client for AI operations
- Helper function invokeAIFunction() for simplified edge function calls
- Proper error handling and logging

### 3. Updated AICodeAssistant Component
- Imported new AI client utilities
- Uses supabaseAI for AI-specific operations
- Regular supabase client for auth and database operations
- Better separation of concerns

## How to Get Your Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to **Settings**  **API**
3. Under **Project API keys**, find the **service_role** key
4. Copy it and add to .env:
   \\\
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your_actual_key_here
   \\\

## Security Notes

 **NEVER** commit the service role key to version control!
- Service role key bypasses Row Level Security (RLS)  
- Only use it in secure, server-side operations
- Edge functions can safely use it via Supabase secrets
- Client-side code should use the publishable key

## AI Assistant Features

The AI Code Assistant now properly:
-  Loads and functions correctly
-  Uses appropriate keys for different operations
-  Handles authentication gracefully
-  Saves conversation history (when authenticated)
-  Supports code generation, design tips, and code review
-  Integrates with Fabric.js canvas
-  Provides code viewer and preview

## Testing the AI Assistant

1. Update your .env with the service role key
2. Restart the dev server: \
pm run dev\
3. Navigate to the Web Builder or Creative pages
4. Click on the AI Code Assistant panel (bottom of screen)
5. Try generating code with prompts like:
   - "Create a purple button component"
   - "Generate a hero section with gradient background"
   - "Design a card with hover effects"

## Edge Functions

The AI Code Assistant calls these edge functions:
- i-code-assistant - Main AI code generation
- i-web-assistant - Web-specific templates and code

Make sure these are deployed to your Supabase project.

## Troubleshooting

### AI Assistant not loading?
- Check browser console for errors
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env
- Ensure dev server restarted after .env changes

### Edge function errors?
- Verify edge functions are deployed: \supabase functions list\
- Check Supabase dashboard  Edge Functions  Logs
- Ensure any API keys (OpenAI, etc.) are set in Supabase secrets

### Authentication issues?
- AI Assistant works without auth (in-memory mode)
- With auth, it saves conversation history to database
- Check RLS policies allow authenticated users to access tables

Created: 2025-11-17 20:59:22
