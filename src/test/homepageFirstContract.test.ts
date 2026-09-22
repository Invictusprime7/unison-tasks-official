import { describe, expect, it } from 'vitest';
import {
  alignWithHomepageVisualLanguage,
  extractHomepageVisualLanguage,
  hasEstablishedVisualLanguage,
  orderHomepageFirst,
  renderHomepageInheritanceContract,
  validateHomepageInheritance,
  enforceSiteDesignContract,
} from '@/services/launch/homepageFirstContract';
import { planLaneBBatches } from '@/services/laneBBatchPlanner';
import { normalizeCompositionResponse } from '@/services/launch/compositionCanonicalContract';

const HOME_SOURCE = `
export default function Home() {
  return (
    <div>
      <nav data-ut-variant="navbar:floating-pill" />
      <section data-ut-variant="hero:prisma-cinematic" style={{ color: 'var(--ut-type-hero)' }}>
        <h1 className="ut-hero">Welcome</h1>
        <p className="ut-body">Copy</p>
      </section>
      <footer data-ut-variant="footer:dark-band" />
    </div>
  );
}
`;

describe('homepage-first visual language', () => {
  it('extracts the language the homepage established', () => {
    const language = extractHomepageVisualLanguage(HOME_SOURCE, 'home');
    expect(language.variants.navbar).toBe('navbar:floating-pill');
    expect(language.variants.hero).toBe('hero:prisma-cinematic');
    expect(language.tokens).toContain('--ut-type-hero');
    expect(language.typography).toEqual(expect.arrayContaining(['ut-hero', 'ut-body']));
    expect(hasEstablishedVisualLanguage(language)).toBe(true);
  });

  it('never throws and establishes nothing for an empty source', () => {
    const language = extractHomepageVisualLanguage(undefined, 'home');
    expect(hasEstablishedVisualLanguage(language)).toBe(false);
    expect(renderHomepageInheritanceContract(language)).toBe('');
    expect(validateHomepageInheritance({ path: '/src/pages/About.tsx', content: HOME_SOURCE, language })).toEqual([]);
  });

  it('renders the inheritance rules with the concrete established values', () => {
    const contract = renderHomepageInheritanceContract(extractHomepageVisualLanguage(HOME_SOURCE, 'home'));
    expect(contract).toContain('navbar: navbar:floating-pill');
    expect(contract).toContain('footer: footer:dark-band');
    expect(contract).toContain('--ut-type-hero');
    expect(contract).toContain('Homepage headings: Welcome');
    expect(contract).toContain('distinct role-appropriate body section order');
  });

  it('rejects drifting site chrome but allows a different body design', () => {
    const language = extractHomepageVisualLanguage(HOME_SOURCE, 'home');
    const drifted = '<nav data-ut-variant="navbar:standard" />';
    expect(validateHomepageInheritance({ path: '/src/pages/About.tsx', content: drifted, language })).toHaveLength(1);
    const body = '<section data-ut-variant="gallery:masonry" />';
    expect(validateHomepageInheritance({ path: '/src/pages/About.tsx', content: body, language })).toEqual([]);
  });

  it('repairs drifting chrome deterministically instead of discarding the page', () => {
    const language = extractHomepageVisualLanguage(HOME_SOURCE, 'home');
    const aligned = alignWithHomepageVisualLanguage(
      '<nav data-ut-variant="navbar:standard" /><h1>About us</h1>',
      language,
    );
    expect(aligned).toContain('data-ut-variant="navbar:floating-pill"');
    expect(aligned).toContain('About us');
    expect(validateHomepageInheritance({ path: '/src/pages/About.tsx', content: aligned, language })).toEqual([]);
  });

  it('orders the homepage first and authors it alone in the first batch', () => {
    expect(orderHomepageFirst(['/a', '/home', '/b'], p => p === '/home')).toEqual(['/home', '/a', '/b']);
    const plan = planLaneBBatches({
      pages: ['/src/pages/About.tsx', '/src/pages/Home.tsx', '/src/pages/Contact.tsx'],
      homeFirstPath: '/src/pages/Home.tsx',
      basePayloadBytes: 1000,
    });
    expect(plan.batches[0]).toEqual(['/src/pages/Home.tsx']);
    expect(plan.batches.slice(1).flat()).not.toContain('/src/pages/Home.tsx');
  });

  it('keeps secondary body compositions distinct from the homepage', () => {
    const brief = {
      roles: ['home', 'about'],
      variants: [
        { id: 'hero:prisma-cinematic', family: 'hero', pageRoles: ['home', 'about'] },
        { id: 'hero:centered', family: 'hero', pageRoles: ['about'] },
        { id: 'gallery:masonry', family: 'gallery', pageRoles: ['home'] },
        { id: 'gallery:lightbox-grid', family: 'gallery', pageRoles: ['about'] },
      ],
    };
    const normalized = normalizeCompositionResponse({
      version: '1.0',
      pages: [
        { role: 'home', sectionOrder: ['hero', 'gallery'], variants: { hero: 'hero:prisma-cinematic', gallery: 'gallery:masonry' } },
        { role: 'about', sectionOrder: ['hero', 'gallery'], variants: { hero: 'hero:centered', gallery: 'gallery:lightbox-grid' } },
      ],
    }, brief) as { pages: Array<{ role: string; variants: Record<string, string> }> };

    const about = normalized.pages.find(page => page.role === 'about');
    expect(about?.variants.hero).toBe('hero:centered');
    expect(about?.variants.gallery).toBe('gallery:lightbox-grid');
  });
});

describe('site-wide design contract enforcement', () => {
  const home = `
    <section data-ut-variant="navbar:aurora-rail" className="ut-section">
      <h1 className="ut-hero" style={{ color: 'var(--ut-ink)' }}>Northstar</h1>
    </section>
    <footer data-ut-variant="footer:rich-columns" className="ut-surface bg-background text-foreground" />
  `;

  it('repairs chrome drift and the reserved headline tier on other pages', () => {
    const report = enforceSiteDesignContract({
      files: {
        '/src/pages/Index.tsx': home,
        '/src/pages/About.tsx': `
          <section data-ut-variant="navbar:slab-bar" />
          <h2 className="ut-hero">About</h2>
          <footer data-ut-variant="footer:rich-columns" />
        `,
      },
      homePath: '/src/pages/Index.tsx',
    });

    expect(report.skipped).toBe(false);
    expect(report.files['/src/pages/About.tsx']).toContain('data-ut-variant="navbar:aurora-rail"');
    expect(report.files['/src/pages/About.tsx']).toContain('ut-display');
    expect(report.files['/src/pages/About.tsx']).not.toContain('ut-hero');
    expect(report.repairs).toHaveLength(2);
    expect(report.violations).toEqual([]);
    expect(report.files['/src/pages/Index.tsx']).toBe(home);
  });

  it('reports hardcoded palette escapes as contract violations', () => {
    const report = enforceSiteDesignContract({
      files: {
        '/src/pages/Index.tsx': home,
        '/src/pages/Contact.tsx': '<section className="bg-[#101014] text-white" />',
      },
      homePath: '/src/pages/Index.tsx',
    });

    expect(report.violations).toHaveLength(2);
    expect(report.violations.join(' ')).toContain('/src/pages/Contact.tsx');
    expect(report.violations.join(' ')).toContain('theme tokens');
  });

  it('is a no-op when the homepage has established nothing', () => {
    const files = { '/src/pages/Index.tsx': '<div />', '/src/pages/About.tsx': '<div className="text-white" />' };
    const report = enforceSiteDesignContract({ files, homePath: '/src/pages/Index.tsx' });
    expect(report.skipped).toBe(true);
    expect(report.violations).toEqual([]);
    expect(report.files).toBe(files);
  });
});
