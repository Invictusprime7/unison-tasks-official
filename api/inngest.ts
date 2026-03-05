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
 * 
 * Environment variables required:
 * - INNGEST_EVENT_KEY: API key for sending events
 * - INNGEST_SIGNING_KEY: Key for validating webhook signatures (production)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { serve } from "inngest/vercel";
import { inngest } from "../src/lib/inngest";
import { inngestFunctions } from "../src/lib/inngest-workflows";

// Create the Inngest serve handler with all workflow functions
// Using Vercel adapter - exports GET, POST, PUT directly
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: inngestFunctions,
});

// Also export as default for @vercel/node runtime compatibility
export default async function inngestHandler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Inngest-Signature, X-Inngest-Env, X-Inngest-Framework, X-Inngest-Req-Version, X-Inngest-SDK, X-Inngest-Server-Kind');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Convert VercelRequest to standard Request and use the appropriate method handler
  try {
    const url = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`);
    const request = new Request(url.toString(), {
      method: req.method,
      headers: req.headers as HeadersInit,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    let response: Response;
    if (req.method === 'GET') {
      response = await GET(request);
    } else if (req.method === 'POST') {
      response = await POST(request);
    } else if (req.method === 'PUT') {
      response = await PUT(request);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Convert Response back to Vercel format
    const body = await response.text();
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    return res.send(body);
  } catch (error) {
    console.error('Inngest handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

