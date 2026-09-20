import { describe, expect, it } from 'vitest';
import {
  buildGeneratedUiFoundation,
  buildGeneratedUiFoundationDirective,
  ensureGeneratedUiFoundation,
  GENERATED_BACKGROUND_PRIMITIVES,
  GENERATED_UI_BARREL_EXPORTS,
  GENERATED_UI_FOUNDATION_VERSION,
  getGeneratedUiFoundationPersistenceViolations,
  readGeneratedUiManifest,
  validateGeneratedUiContract,
} from '@/platform/core/generatedUiFoundation';
import { buildArtDirectionTokens, resolveArtDirectionPack } from '@/sections/variants/artDirectionPacks';
import { auditThemeContract } from '@/platform/core/themeContract';

/**
 * M5 — Generated UI Foundation expansion.
 * Canonical background primitives + hero/display/title/subtitle semantic
 * type tiers, token-driven and reduced-motion safe, owned by Stage 4b.
 */
describe('M5 generated UI foundation expansion', () => {
  const foundation = buildGeneratedUiFoundation({
    industry: 'salon',
    themePresetId: 'organic',
    needsBooking: true,
  });
  const backgrounds = foundation.files['/src/unison/ui/backgrounds.tsx'];

  it('emits all six canonical background primitives', () => {
    for (const name of GENERATED_BACKGROUND_PRIMITIVES) {
      expect(backgrounds).toContain(`export function ${name}`);
    }
    expect(GENERATED_BACKGROUND_PRIMITIVES).toEqual([
      'OrbitalBackdrop', 'GlowField', 'AnimatedGrid',
      'NoiseField', 'GradientOrbs', 'MediaCanvas',
    ]);
  });

  it('backgrounds are token-only, decorative and reduced-motion safe', () => {
    expect(backgrounds).toContain('useReducedMotion');
    expect(backgrounds).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(backgrounds).toContain('hsl(var(--primary)');
    expect(backgrounds).toContain('hsl(var(--accent)');
    expect(backgrounds).toContain('aria-hidden');
    expect(backgrounds).toContain('pointer-events-none');
    // Geometry references Stage 4b tokens, never raw unit literals.
    expect(backgrounds).toContain('var(--ut-hero-block)');
    expect(backgrounds).not.toMatch(/className="[^"]*\b(?:p|m|size|w|h)-\[\d/);
  });

  it('registers the backgrounds facade in the manifest, barrel and prompt directive', () => {
    expect(foundation.manifest.primitiveImports).toContain('@/unison/ui/backgrounds');
    expect(foundation.files['/src/unison/ui/index.ts']).toContain(
      "export { OrbitalBackdrop, GlowField, AnimatedGrid, NoiseField, GradientOrbs, MediaCanvas, type BackdropProps, type MediaCanvasProps } from './backgrounds';",
    );
    for (const name of GENERATED_BACKGROUND_PRIMITIVES) {
      expect(GENERATED_UI_BARREL_EXPORTS.has(name)).toBe(true);
    }
    const directive = buildGeneratedUiFoundationDirective(foundation.manifest);
    expect(directive).toContain('"@/unison/ui/backgrounds"');
    expect(directive).toContain('<OrbitalBackdrop>');
    expect(directive).toContain('<MediaCanvas src alt overlay?>');
  });

  it('accepts a page importing the backgrounds facade and rejects an invented export', () => {
    const accepted = validateGeneratedUiContract({
      '/src/pages/Home.tsx': `import { GlowField } from '@/unison/ui/backgrounds'; export default function Home(){ return <main><GlowField /></main>; }`,
    }, foundation.manifest);
    expect(accepted).toEqual({ valid: true, violations: [] });
  });

  it('treats backgrounds.tsx as part of the persisted foundation module set', () => {
    const incomplete = { ...foundation.files };
    delete incomplete['/src/unison/ui/backgrounds.tsx'];
    expect(getGeneratedUiFoundationPersistenceViolations(incomplete)).toContain(
      'missing /src/unison/ui/backgrounds.tsx',
    );
    const rehydrated = ensureGeneratedUiFoundation(incomplete, {
      industry: 'salon',
      themePresetId: 'organic',
    });
    expect(rehydrated.files['/src/unison/ui/backgrounds.tsx']).toContain('OrbitalBackdrop');
    expect(getGeneratedUiFoundationPersistenceViolations(rehydrated.files)).toEqual([]);
  });

  it('bumps the foundation version and keeps 1.9 snapshots readable', () => {
    expect(GENERATED_UI_FOUNDATION_VERSION).toBe('1.10');
    const legacy = { ...foundation.manifest, version: '1.9' } as Record<string, unknown>;
    const manifest = readGeneratedUiManifest({
      '/.unison/ui-manifest.json': JSON.stringify(legacy),
      '/src/unison/ui/motion.tsx': foundation.files['/src/unison/ui/motion.tsx'],
    });
    expect(manifest?.version).toBe('1.10');
    expect(manifest?.primitiveImports).toContain('@/unison/ui/backgrounds');
  });

  it('emits the hero semantic type tier through Stage 4b tokens', () => {
    const pack = resolveArtDirectionPack({ industry: 'store', themePresetId: 'obsidian', seed: '7' });
    const tokens = buildArtDirectionTokens(pack);
    expect(tokens['--ut-type-hero']).toMatch(/^clamp\(/);
    // Hero tier is exactly one modular step above display.
    expect(tokens['--ut-type-hero']).not.toBe(tokens['--ut-type-display']);
    // The token is documented in the theme contract for every pack.
    expect(auditThemeContract(pack.id)).toEqual([]);
  });

  it('exposes the hero size on the emitted Heading primitive', () => {
    const content = foundation.files['/src/unison/ui/content.tsx'];
    expect(content).toContain("export type HeadingSize = 'hero' | 'display' | 'title' | 'subtitle';");
    expect(content).toContain("hero: 'text-[length:var(--ut-type-hero)]");
  });
});
