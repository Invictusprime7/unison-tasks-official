import { describe, expect, it } from 'vitest';
import { buildWizardGenerationBrief } from '@/services/wizardGenerationBrief';
import { createBuilderPage, createEmptyPageRegistry } from '@/types/pageRegistry';
import { evaluateVisualQuality } from '@/services/visualQualityEvaluation';
import { getCompositionById } from '@/sections/templates';
import { generateTopologyPlaceholderFiles } from '@/utils/topologyVFSScaffolder';
import type { GeneratedSitePlan } from '@/platform/core/siteTopologyPlanner';

function registry() {
  const reg = createEmptyPageRegistry();
  const home = createBuilderPage('home', 'Home', '/', 'home', {
    isHome: true, showInNav: true, navOrder: 0, filePath: '/src/pages/Home.tsx',
  });
  const about = createBuilderPage('about', 'About', '/about', 'about', {
    showInNav: true, navOrder: 1, filePath: '/src/pages/About.tsx',
  });
  const contact = createBuilderPage('contact', 'Contact', '/contact', 'contact', {
    showInNav: true, navOrder: 2, filePath: '/src/pages/Contact.tsx',
  });
  reg.pages = { home, about, contact };
  reg.homePageId = home.pageId;
  return reg;
}

const input = {
  pageRegistry: registry(),
  vfsFiles: {} as Record<string, string>,
  themePresetId: 'midnight-editorial',
  industry: 'salon',
  seed: 'seed-a',
};

describe('per-page hero architecture', () => {
  it('gives every route a complete hero contract', () => {
    const brief = buildWizardGenerationBrief(input);
    for (const route of brief.routes) {
      const hero = route.hero.geometry;
      expect(hero.archetype).toBeTruthy();
      expect(hero.requiredParts.length).toBeGreaterThanOrEqual(5);
      expect(hero.mediaDirection.length).toBeGreaterThan(20);
    }
  });

  it('does not clone the home hero onto inner pages', () => {
    const brief = buildWizardGenerationBrief(input);
    const home = brief.routes.find((route) => route.role === 'home')!;
    const inner = brief.routes.filter((route) => route.role !== 'home');
    for (const route of inner) {
      expect(route.hero.geometry.archetype).not.toBe(home.hero.geometry.archetype);
      expect(route.hero.mustDifferFromHome).toBe(true);
    }
  });

  it('orders sections as a narrative arc without repeating a family back to back', () => {
    const brief = buildWizardGenerationBrief(input);
    for (const route of brief.routes) {
      const order = route.signature.sectionOrder;
      expect(order[0]).toBe('hero');
      expect(order[order.length - 1]).toBe('cta');
      expect(new Set(order).size).toBe(order.length);
      expect(route.signature.narrative.length).toBe(order.length);
      expect(route.signature.narrative[0]).toBe('open');
    }
  });
});

describe('hero quality findings', () => {
  const thinHero = `export default function Page(){return(<main><section className="ut-hero"><h1>Contact</h1></section></main>);}`;
  const fullHero = `export default function Page(){return(<main><section className="ut-hero" data-ut-hero="editorial-split">
    <div><span className="ut-eyebrow">Studio</span><h1>Book a session</h1><p className="ut-lead">Portrait and wedding photography in Chicago.</p>
    <a data-ut-intent="booking.create" href="#book">Book</a><a data-ut-intent="nav.goto" href="/work">See work</a></div>
    <figure className="ut-hero-media is-top"><img src="/a.jpg" alt="Studio" /></figure></section></main>);}`;

  it('flags an incomplete hero', () => {
    const report = evaluateVisualQuality({ '/src/pages/Contact.tsx': thinHero });
    expect(report.findings).toContain('INCOMPLETE_HERO');
    expect(report.refinementDirective).toBeTruthy();
  });

  it('accepts a complete framed hero', () => {
    const report = evaluateVisualQuality({ '/src/pages/Home.tsx': fullHero });
    expect(report.findings).not.toContain('INCOMPLETE_HERO');
    expect(report.findings).not.toContain('CROPPED_HERO_MEDIA');
  });

  it('flags a cropped hero image band', () => {
    const banded = `export default function Page(){return(<main><section className="ut-hero">
      <img className="h-48 w-full object-cover" src="/a.jpg" alt="" />
      <span className="ut-eyebrow">Studio</span><h1>Contact</h1><p>Say hello.</p>
      <a data-ut-intent="contact.submit" href="#">Send</a><a data-ut-intent="nav.goto" href="/">Home</a></section></main>);}`;
    const report = evaluateVisualQuality({ '/src/pages/Contact.tsx': banded });
    expect(report.findings).toContain('CROPPED_HERO_MEDIA');
  });

  it('accepts a canonical componentized hero using serialized page data', () => {
    const page = `import Hero from '@/components/Hero'; const SECTIONS = [{ "type": "hero", "props": { "headline": "Studio", "subheadline": "Care designed around you", "badge": "Welcome", "image": "/studio.jpg", "ctas": [{ "label": "Book", "intent": "booking.create" }, { "label": "Explore", "intent": "nav.goto" }] } }]; export default function Page(){ return <Hero props={SECTIONS[0].props} />; }`;
    const hero = `export default function Hero({ props }) { const { headline, subheadline, description, ctas = [], badge, stats, image } = props; return <section data-ut-variant="hero:centered"><div>{badge && <span className="ut-eyebrow">{badge}</span>}<h1>{headline}</h1>{subheadline && <p className="ut-lead">{subheadline}</p>}{description && <p>{description}</p>}{ctas.length > 0 && <div className="ut-hero-actions">{ctas.map((cta, index) => <a key={index} data-ut-intent={cta.intent}>{cta.label}</a>)}</div>}{image && <div className="ut-hero-media"><img src={image} alt="" className="object-contain" /></div>}{stats && <div className="ut-hero-stats" />}</div></section>; }`;
    const report = evaluateVisualQuality({
      '/src/pages/Home.tsx': page,
      '/src/components/Hero.tsx': hero,
    });
    expect(report.findings).not.toContain('INCOMPLETE_HERO');
    expect(report.findings).not.toContain('CROPPED_HERO_MEDIA');
  });

  it('accepts the full salon route set compiled from its sealed generation brief', () => {
    const pageRegistry = registry();
    const brief = buildWizardGenerationBrief({ ...input, pageRegistry });
    const template = getCompositionById('salon-premium');
    if (!template) throw new Error('Missing salon-premium composition');
    const pages = Object.values(pageRegistry.pages);
    const plan: GeneratedSitePlan = {
      siteId: 'hero-quality-site', industry: 'salon', businessName: 'Canonical Salon Test',
      homePageId: pageRegistry.homePageId, pages: pages.map((page) => ({
        id: page.pageId, name: page.name, title: page.name, route: page.route,
        role: page.role, filePath: page.filePath, visibleInNav: page.showInNav,
        isHome: page.isHome, generatedBy: 'wizard',
      })),
      navItems: pages.filter((page) => page.showInNav).map((page) => page.pageId),
      funnels: [], redirects: [], generatedAt: '2026-09-10T00:00:00.000Z',
      selectedTemplateId: template.id, selectedThemePresetId: input.themePresetId,
    };
    const files = Object.assign({}, ...plan.pages.map((page) => generateTopologyPlaceholderFiles(
      page, plan, template, { generationBrief: brief },
    )));
    const report = evaluateVisualQuality(files);
    expect(report.findings).not.toContain('INCOMPLETE_HERO');
    expect(report.findings).not.toContain('CROPPED_HERO_MEDIA');
  });
});
