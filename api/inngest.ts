/**
 * Inngest API Route
 * 
 * Webhook endpoint for Inngest to invoke workflow functions.
 * Deploy to Vercel: /api/inngest
 * 
 * This endpoint:
 * 1. Receives events from the Intent Executor via inngest-event-bridge
 * 2. Routes them to the appropriate workflow functions
 * 3. Handles durable execution with automatic retries
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { serve } from "inngest/express";
import { inngest } from "../src/lib/inngest";
import { inngestFunctions } from "../src/lib/inngest-workflows";

// Create the Inngest serve handler using Express adapter (compatible with Vercel Node)
const inngestHandler = serve({
  client: inngest,
  functions: inngestFunctions,
});

// Export default handler for @vercel/node runtime
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Inngest-Signature');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Delegate to Inngest Express-style handler
  return inngestHandler(req, res);
}

