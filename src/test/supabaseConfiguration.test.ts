import { beforeEach, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
const createClient = vi.hoisted(() => vi.fn(() => ({})));
vi.mock('@supabase/supabase-js', () => ({ createClient }));
beforeEach(() => { vi.resetModules(); createClient.mockClear(); });
it('uses the linked project for Auth and direct function calls without injected configuration', async () => {
  vi.stubEnv('VITE_SUPABASE_URL', ''); vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', ''); vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
  try {
    const env = await import('@/integrations/supabase/env');
    await import('@/integrations/supabase/client');
    const project = readFileSync('supabase/config.toml', 'utf8').match(/project_id = "([^"]+)"/)![1];
    expect(env.SUPABASE_URL).toBe('https://' + project + '.supabase.co');
    const claims = JSON.parse(atob(env.SUPABASE_PUBLISHABLE_KEY.split('.')[1]));
    expect(claims.ref).toBe(project); expect(claims.role).toBe('anon');
    expect(createClient).toHaveBeenCalledWith(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, expect.any(Object));
  } finally { vi.unstubAllEnvs(); }
});
it('shares sanitized injected configuration across both transports', async () => {
  vi.stubEnv('VITE_SUPABASE_URL', ' "https://override.supabase.co"\r\n');
  vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', ' "public-test-key"\r\n');
  try {
    const env = await import('@/integrations/supabase/env');
    await import('@/integrations/supabase/client');
    expect(env.SUPABASE_URL).toBe('https://override.supabase.co');
    expect(createClient).toHaveBeenCalledWith(env.SUPABASE_URL, 'public-test-key', expect.any(Object));
  } finally { vi.unstubAllEnvs(); }
});
