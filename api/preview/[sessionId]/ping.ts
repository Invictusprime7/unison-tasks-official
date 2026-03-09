/**
 * Vercel API Route: Ping Preview Session
 * 
 * Keeps the preview session alive. Proxies to Docker gateway if available.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { sessionId } = req.query;
  const gatewayUrl = process.env.VITE_PREVIEW_GATEWAY_URL;

  if (gatewayUrl) {
    try {
      await fetch(`${gatewayUrl}/api/preview/${sessionId}/ping`, {
        method: 'POST',
        signal: AbortSignal.timeout(3000),
      });
    } catch {
      // Gateway unreachable — acknowledge locally
    }
  }

  res.status(200).json({ success: true });
}
