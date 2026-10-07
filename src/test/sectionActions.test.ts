import { describe, it, expect } from 'vitest';
import { removeSection, moveSection, sectionSpans } from '@/services/agent-runtime/sectionActions';

const page = `export default () => <main>
<section id="hero"><a data-ut-intent="nav.goto" data-ut-path="/contact">Book</a></section>
<section id="work"><section id="inner">x</section></section>
<section id="cta">c</section>
</main>;`;
const files = { '/src/pages/About.tsx': page };

describe('section actions', () => {
  it('finds top-level sections only', () => {
    expect(sectionSpans(page).map((s) => s.id)).toEqual(['hero', 'work', 'cta']);
  });
  it('removes a section with its nested content', () => {
    const r = removeSection('section:/about#work', files);
    expect(r.ok && r.contents.includes('inner')).toBe(false);
    expect(r.ok && r.contents.includes('id="cta"')).toBe(true);
  });
  it('moves a section and keeps button destinations byte-for-byte', () => {
    const r = moveSection('section:/about#hero', 'down', files);
    if (!r.ok) throw new Error(r.error);
    expect(sectionSpans(r.contents).map((s) => s.id)).toEqual(['work', 'hero', 'cta']);
    expect(r.contents).toContain('data-ut-path="/contact">Book');
  });
  it('refuses moving past the edge', () => {
    expect(moveSection('section:/about#hero', 'up', files).ok).toBe(false);
  });
});
