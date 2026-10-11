import { afterEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../api/preview';

afterEach(() => vi.unstubAllEnvs());

describe('consolidated Vercel preview routes', () => {
  it.each([
    ['health', 'GET', {}, 200],
    ['start', 'POST', {}, 410],
    ['logs', 'GET', {}, 200],
    ['ping', 'POST', {}, 200],
    ['stop', 'POST', {}, 200],
    ['file', 'PATCH', { path: 'src/App.tsx', content: 'export default null;' }, 200],
    ['health', 'POST', {}, 405],
    ['unknown', 'GET', {}, 404],
  ])('dispatches %s with %s', async (route, method, body, status) => {
    vi.stubEnv('PREVIEW_GATEWAY_URL', '');
    vi.stubEnv('VITE_PREVIEW_GATEWAY_URL', '');
    const req = { method, headers: {}, query: { route, sessionId: 'session-123' }, body } as unknown as VercelRequest;
    const res = { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn(), end: vi.fn() };
    await handler(req, res as unknown as VercelResponse);
    expect(res.status).toHaveBeenCalledWith(status);
  });

  it('preserves session validation', async () => {
    const req = { method: 'POST', headers: {}, query: { route: 'ping', sessionId: '../invalid' } } as unknown as VercelRequest;
    const res = { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn(), end: vi.fn() };
    await handler(req, res as unknown as VercelResponse);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
