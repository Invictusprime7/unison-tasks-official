import { describe, it, expect } from 'vitest';
import { restyleSection, removeSection, moveSection, sectionSpans } from '@/services/agent-runtime/sectionActions';

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
    if (r.ok === false) throw new Error(r.error);
    expect(sectionSpans(r.contents).map((s) => s.id)).toEqual(['work', 'hero', 'cta']);
    expect(r.contents).toContain('data-ut-path="/contact">Book');
  });
  it('refuses moving past the edge', () => {
    expect(moveSection('section:/about#hero', 'up', files).ok).toBe(false);
  });
  it('restyles only the section tag, keeping content and buttons', () => {
    const r = restyleSection('section:/about#hero', 'bg-muted py-24', files);
    if (r.ok === false) throw new Error(r.error);
    expect(r.contents).toContain('className="bg-muted py-24"');
    expect(r.contents).toContain('data-ut-path="/contact">Book');
    expect(restyleSection('section:/about#hero', '"}evil', files).ok).toBe(false);
  });
});

describe('variant swap', () => {
  const src = `import { ServicesCardGrid, HeroCentered } from '@/design-system/unison-x-loveable-design-d5be96';
export default () => <main>
<section id="services"><ServicesCardGrid items={catalog} cta={{ intent: 'nav.goto', path: '/contact' }} /></section>
<section id="hero"><HeroCentered title="Hi" /></section>
</main>;`;
  const f = { '/src/pages/Home.tsx': src };
  it('swaps the design and keeps every prop and the import', async () => {
    const { swapVariant } = await import('@/services/agent-runtime/sectionActions');
    const r = swapVariant('section:/home#services', 'ServicesEditorialRows', f);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.contents).toContain(`<ServicesEditorialRows items={catalog} cta={{ intent: 'nav.goto', path: '/contact' }} />`);
    expect(r.contents).toMatch(/import \{ ServicesEditorialRows, HeroCentered \}/);
    expect(r.contents).not.toContain('ServicesCardGrid');
  });
  it('refuses a design from another family', async () => {
    const { swapVariant } = await import('@/services/agent-runtime/sectionActions');
    const r = swapVariant('section:/home#services', 'HeroFullBleed', f);
    expect(r.ok).toBe(false);
  });
});
