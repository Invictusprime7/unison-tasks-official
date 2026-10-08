import { describe, it, expect } from 'vitest';
import { planPageRename } from '@/services/terminalCommands';
const files = { '/src/pages/Home.tsx': '<a data-ut-intent="nav.goto" data-ut-path="/about">About</a>', '/src/App.tsx': '<Route path="/about"/>' };
describe('page rename', () => {
  it('renames the title freely', () => {
    const r = planPageRename(['page:/about', '"Our', 'Studio"'], files);
    expect(r).toMatchObject({ ok: true, op: { type: 'rename_page', route: '/about', newTitle: 'Our Studio' } });
  });
  it('refuses a new address while buttons point at the old one', () => {
    expect(planPageRename(['page:/about', 'Studio', '/studio'], files).ok).toBe(false);
    expect(planPageRename(['page:/contact', 'Reach us', '/reach'], files).ok).toBe(true);
  });
});
