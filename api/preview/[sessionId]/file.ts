/**
 * Vercel API Route: Patch File in Preview Session
 * 
 * Accepts file content updates for HMR-like behavior.
 * If a Docker gateway is configured, proxies the patch there.
 * Otherwise, acknowledges the patch (client-side Sandpack handles the update).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.query;
  const body = req.body as { path?: string; content?: string } | undefined;

  if (!body?.path || typeof body.content !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing path or content' });
  }

  // Proxy to Docker gateway if available
  const gatewayUrl = process.env.VITE_PREVIEW_GATEWAY_URL;
  if (gatewayUrl) {
    try {
      const upstream = await fetch(
        `${gatewayUrl}/api/preview/${sessionId}/file`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(5000),
        }
      );
      const data = await upstream.json();
      return res.status(upstream.status).json(data);
    } catch {
      // Gateway unreachable — acknowledge locally
    }
  }

  // Vercel-native: acknowledge patch (Sandpack handles update client-side)
  return res.status(200).json({ success: true });
}
