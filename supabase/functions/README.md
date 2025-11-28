# Supabase Edge Functions

This directory contains Deno-based Edge Functions for serverless execution.

## TypeScript Errors in VS Code

**Note:** You will see TypeScript errors in VS Code for these files. This is **expected and normal** because:

1. These files run in **Deno runtime**, not Node.js
2. VS Code uses the Node.js TypeScript compiler by default
3. Deno has different module resolution (uses URLs like `https://deno.land/...`)
4. The errors don't affect deployment or runtime functionality

## Development Workflow

### Local Testing
```bash
supabase functions serve generate-image --no-verify-jwt
```

### Deployment
```bash
supabase functions deploy generate-image --no-verify-jwt
```

### Setting Secrets
```bash
supabase secrets set OPENAI_API_KEY=your-key-here
```

## Available Functions

### generate-image
Generates AI images using OpenAI DALL-E 3

**Endpoint:** `/functions/v1/generate-image`

**Request:**
```json
{
  "prompt": "A beautiful sunset over mountains",
  "style": "digital-art",
  "quality": "high",
  "width": 1024,
  "height": 1024
}
```

**Response:**
```json
{
  "imageUrl": "https://...",
  "url": "https://...",
  "seed": 123456
}
```

## Environment Variables

Required secrets (set via `supabase secrets set`):
- `OPENAI_API_KEY` - Your OpenAI API key

## Troubleshooting

### TypeScript Errors
- **Ignore them** - they don't affect functionality
- The functions deploy and run perfectly despite VS Code errors
- Deno CLI validates the code during deployment

### Testing
- Use `curl` or Postman to test deployed functions
- Check Supabase dashboard for logs and errors
- Use `supabase functions serve` for local development
