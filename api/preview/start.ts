/**
 * Vercel API Route: Start Preview Session
 * 
 * DEPRECATED: The CodeSandbox Container Sandbox (SSE) API has been discontinued.
 * Preview is now handled client-side via Sandpack (@codesandbox/sandpack-react),
 * which runs entirely in the browser without requiring a server-side API.
 * 
 * This route is kept for backward compatibility with existing Docker gateway
 * sessions (local development). For production previews, the client uses
 * Sandpack directly — see VFSPreview.tsx and SimplePreview.tsx.
 * 
 * If a Docker gateway URL is provided (local dev), it proxies to that.
 * Otherwise, it returns a deprecation notice.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface StartSessionRequest {
  projectId: string;
  files: Record<string, string>;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CodeSandbox SSE API is discontinued — inform client to use Sandpack
  return res.status(410).json({
    success: false,
    error: 'CodeSandbox Container Sandbox (SSE) API has been discontinued. Use Sandpack in-browser preview instead.',
    deprecated: true,
    migration: 'sandpack',
  });
}
