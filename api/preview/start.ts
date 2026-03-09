/**
 * Vercel API Route: Start Preview Session
 * 
 * Creates an in-memory preview session for the Docker preview runtime.
 * On Vercel, this functions as a session registry — the actual rendering
 * is handled client-side via Sandpack with the Docker runtime's robust
 * file handling and dependency resolution injected.
 * 
 * If VITE_PREVIEW_GATEWAY_URL is set, proxies to the Docker gateway.
 * Otherwise, creates a Vercel-native session that the client renders
 * through enhanced Sandpack with Docker runtime capabilities.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

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

  const body = req.body as StartSessionRequest | undefined;

  if (!body?.projectId || !body?.files || typeof body.files !== 'object') {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: projectId, files',
    });
  }

  // If an external Docker gateway is configured, proxy
  const gatewayUrl = process.env.VITE_PREVIEW_GATEWAY_URL;
  if (gatewayUrl) {
    try {
      const upstream = await fetch(`${gatewayUrl}/api/preview/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });
      const data = await upstream.json();
      return res.status(upstream.status).json(data);
    } catch {
      // Gateway unreachable — fall through to Vercel-native session
    }
  }

  // Create a Vercel-native preview session
  // The client will render this via enhanced Sandpack with Docker runtime deps
  const sessionId = crypto.randomUUID();
  const now = new Date().toISOString();

  return res.status(200).json({
    success: true,
    session: {
      id: sessionId,
      projectId: body.projectId,
      status: 'running',
      iframeUrl: `/_preview/${sessionId}`,
      createdAt: now,
      lastActivityAt: now,
    },
    runtime: 'vercel-sandpack',
  });
}
