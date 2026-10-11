import type { VercelRequest, VercelResponse } from '@vercel/node';
import health from '../server/preview/health.js';
import start from '../server/preview/start.js';
import file from '../server/preview/[sessionId]/file.js';
import logs from '../server/preview/[sessionId]/logs.js';
import ping from '../server/preview/[sessionId]/ping.js';
import stop from '../server/preview/[sessionId]/stop.js';

// Keep the public preview URLs while sharing one deployment function.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  switch (req.query.route) {
    case 'health': return health(req, res);
    case 'start': return start(req, res);
    case 'file': return file(req, res);
    case 'logs': return logs(req, res);
    case 'ping': return ping(req, res);
    case 'stop': return stop(req, res);
    default: return res.status(404).json({ success: false, error: 'Unknown preview route' });
  }
}
