import { describe, it, expect } from 'vitest';
import { parseProbeArgs, formatProbeReport } from '@/services/agent-runtime/previewProbe';
describe('preview probe', () => {
  it('parses checks', () => {
    expect(parseProbeArgs(['text', '"Book now"', 'intent', 'nav.goto', 'bogus', 'x'])).toEqual([
      { kind: 'text', value: 'Book now' }, { kind: 'intent', value: 'nav.goto' }]);
  });
  it('reports an unreachable preview plainly', () => {
    expect(formatProbeReport({ ok: false, reachable: false, results: [] })[0]).toMatch(/did not answer/);
  });
});
