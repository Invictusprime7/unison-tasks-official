import { describe, expect, it } from 'vitest';
import { buildGeneratedUiFoundation } from '@/platform/core/generatedUiFoundation';
import { evaluateVisualQuality } from '@/services/visualQualityEvaluation';
import { buildThemedIndexCss } from '@/components/onboarding/themePresetToIndexCss';
import { THEME_PRESETS } from '@/components/onboarding/themePresets';

describe('Phase 9 quality matrix contracts', () => {
  const foundation = buildGeneratedUiFoundation({
    industry: 'salon',
    templateId: 'salon-premium',
    themePresetId: 'editorial',
    needsBooking: true,
  });

  it('covers desktop, tablet, and mobile responsive behavior in the emitted foundation', () => {
    const css = buildThemedIndexCss(THEME_PRESETS.find((preset) => preset.id === 'editorial')!);

    expect(css).toContain('@media (max-width: 768px)');
    expect(css).toContain('.ut-hero { grid-template-columns: 1fr; }');
    expect(css).toContain('var(--ut-hero-media-ratio)');
    expect(foundation.files['/src/unison/ui/motion.tsx']).toContain('useReducedMotion');
  });

  it('keeps every expanded motion primitive behind reduced-motion guards', () => {
    const motion = foundation.files['/src/unison/ui/motion.tsx'];
    const primitives = [
      'MarqueeBand', 'HorizontalRail', 'HoverDepth', 'ImageReveal',
      'ParallaxMedia', 'MaskReveal', 'MotionImage',
    ];

    for (const primitive of primitives) {
      const start = motion.indexOf(`function ${primitive}`);
      expect(start, `${primitive} is emitted`).toBeGreaterThanOrEqual(0);
      const nextFunction = motion.indexOf('\nexport function ', start + 1);
      const source = motion.slice(start, nextFunction === -1 ? undefined : nextFunction);
      expect(source, `${primitive} honors reduced motion`).toContain('reduceMotion');
    }
  });

  it('reports quality findings without mutating representative page sources', () => {
    const desktopPage = [
      '<main><section><h1>Studio</h1><p>Lead</p><button data-ut-intent="contact.submit">Start</button></section>',
      '<section className="md:grid-cols-2"><img src="/studio.jpg" alt="Studio" /><h2>Work</h2></section>',
      '<section className="flex-col"><h2>Proof</h2><Reveal>Results</Reveal></section></main>',
    ].join('');
    const mobileRiskPage = '<main><section><h1>Overflow</h1><div className="w-[1200px]">Content</div></section></main>';
    const files = {
      '/src/pages/Home.tsx': desktopPage,
      '/src/pages/Contact.tsx': mobileRiskPage,
    };

    const report = evaluateVisualQuality(files, { technicalScore: 100 });

    expect(files['/src/pages/Home.tsx']).toBe(desktopPage);
    expect(report.pages).toHaveLength(2);
    expect(report.technicalScore).toBe(100);
    expect(report.pages.find((page) => page.path.endsWith('Contact.tsx'))?.findings)
      .toContain('MOBILE_OVERFLOW_RISK');
    expect(report.pages.find((page) => page.path.endsWith('Home.tsx'))?.findings)
      .not.toContain('MOBILE_OVERFLOW_RISK');
  });

  it('flags spacing, contrast, and heading drift across generated pages', () => {
    const report = evaluateVisualQuality({
      '/src/pages/About.tsx': '<main><section className="p-[19px] bg-[#000] text-white"><h1>About</h1><h1>Again</h1></section></main>',
    });

    expect(report.findings).toEqual(expect.arrayContaining([
      'SPACING_SYSTEM_DRIFT',
      'CONTRAST_ROLE_DRIFT',
      'INVALID_H1_COUNT',
    ]));
    expect(report.refinementDirective).toContain('shared spacing rhythm');
  });
});