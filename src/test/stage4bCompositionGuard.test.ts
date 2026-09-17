import { describe, expect, it } from 'vitest';
import {
  assertStage4bCompositionPreserved,
  findStage4bCompositionViolations,
} from '@/platform/core/stage4bCompositionGuard';

const pagePath = '/src/pages/Home.tsx';
const baseline = `const SECTIONS = [
  {"id":"home-hero","type":"hero"},
  {"id":"home-services","type":"services"},
  {"id":"home-contact","type":"contact"}
];
const HYDRATABLE = new Set([]);
export default function Home() { return <main><section className="bg-card"><h1>Northstar</h1></section><section><img src="/studio.jpg" /></section><section><button data-ut-intent="contact.submit">Contact</button></section></main>; }`;

describe('Stage 4b composition guard', () => {
  it('permits a theme-only class change to a Lane B composition', () => {
    const themed = baseline.replace('bg-card', 'bg-muted');
    expect(findStage4bCompositionViolations({ [pagePath]: baseline }, { [pagePath]: themed })).toEqual([]);
  });

  it('rejects a reordered declared section sequence even when all counts match', () => {
    const reordered = baseline.replace('"home-services","type":"services"},\n  {"id":"home-contact"', '"home-contact","type":"contact"},\n  {"id":"home-services"');
    const violations = findStage4bCompositionViolations({ [pagePath]: baseline }, { [pagePath]: reordered });
    expect(violations).toContainEqual(expect.objectContaining({ field: 'sectionOrder', before: 3, after: 3 }));
    expect(() => assertStage4bCompositionPreserved({ [pagePath]: baseline }, { [pagePath]: reordered }, 'test')).toThrow(/sectionOrder/);
  });
});