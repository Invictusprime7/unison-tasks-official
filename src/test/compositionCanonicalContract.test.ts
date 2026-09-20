import { describe, expect, it } from 'vitest';
import { normalizeCompositionResponse, renderCompositionCanonicalContract } from '@/services/launch/compositionCanonicalContract';
import { validateAIPageComposition } from '@/sections/aiPageComposition';
import { ART_DIRECTION_PACKS } from '@/sections/variants/artDirectionPacks';
import { VARIANT_REGISTRY, getGenerationVariantsForSection } from '@/sections/variants/registry';
import type { SectionType } from '@/sections/types';

const pack = ART_DIRECTION_PACKS['salon-premium'];
const roles = ['home', 'services'] as const;
const variants = [...new Map(Object.keys(VARIANT_REGISTRY).flatMap(type => roles.flatMap(role =>
  getGenerationVariantsForSection(type as SectionType, pack, role))).map(variant => [variant.id, variant])).values()]
  .map(variant => ({ id: variant.id, family: variant.sectionType,
    pageRoles: roles.filter(role => getGenerationVariantsForSection(variant.sectionType, pack, role).some(eligible => eligible.id === variant.id)) }));

const brief = { roles, variants };
const heroVariant = variants.find(variant => variant.family === 'hero')!;
const servicesVariant = variants.find(variant => variant.family === 'services')!;

describe('composition canonical contract', () => {
  it('states every machine-checked rule with the concrete allowed values', () => {
    const contract = renderCompositionCanonicalContract(brief);
    expect(contract).toContain('CANONICAL VALIDATION CONTRACT');
    expect(contract).toContain('home, services');
    expect(contract).toContain('"version":"1.0"');
    expect(contract).toContain('navbar and footer are compiler-owned');
    expect(contract).toContain(heroVariant.id);
    expect(contract).toContain('title max 140');
    expect(contract).toContain('question max 240');
    expect(contract).toContain('no duplicates');
  });

  it('lists only role-eligible variant IDs per role', () => {
    const contract = renderCompositionCanonicalContract({
      roles: ['home'],
      variants: [
        { id: 'hero:a', family: 'hero', pageRoles: ['home'] },
        { id: 'hero:b', family: 'hero', pageRoles: ['services'] },
      ],
    });
    expect(contract).toContain('hero:a');
    expect(contract).not.toContain('hero:b');
  });

  it('repairs mechanical envelope defects and yields a passing composition', () => {
    const messy = JSON.stringify({
      version: '1.0',
      pages: [
        { role: 'home', sectionOrder: ['navbar', 'hero', 'hero', 'services', 'footer'],
          variants: { navbar: 'navbar:should-be-stripped', hero: heroVariant.id, footer: 'footer:x', services: servicesVariant.id },
          copy: { footer: { headline: 'nope' }, hero: { headline: 'A real headline' } } },
        { role: 'home', sectionOrder: ['hero'], variants: { hero: heroVariant.id } },
        { role: 'checkout', sectionOrder: ['hero'], variants: { hero: heroVariant.id } },
        { role: 'services', sectionOrder: ['services'],
          variants: { services: servicesVariant.id } },
      ],
    });
    const wrapped = '```json\n' + messy + '\n```';
    const normalized = normalizeCompositionResponse({ content: wrapped }, brief);
    const plan = validateAIPageComposition(normalized, pack.id, roles);
    expect(plan).not.toBeNull();
    expect(plan!.pages.map(page => page.role)).toEqual(['home', 'services']);
    expect(plan!.pages[0].sectionOrder).toEqual(['navbar', 'hero', 'services', 'footer']);
    expect(plan!.pages[0].variants.navbar).toBeUndefined();
    expect(plan!.pages[0].variants.footer).toBeUndefined();
    expect(plan!.pages[0].copy?.footer).toBeUndefined();
    expect(plan!.pages[0].copy?.hero?.headline).toBe('A real headline');
  });

  it('still rejects genuine design violations after normalization', () => {
    const plan = {
      version: '1.0',
      pages: [
        { role: 'home', sectionOrder: ['hero'], variants: { hero: 'hero:invented-id' } },
        { role: 'services', sectionOrder: ['services'], variants: { services: servicesVariant.id } },
      ],
    };
    expect(validateAIPageComposition(normalizeCompositionResponse(plan, brief), pack.id, roles)).toBeNull();
  });

  it('leaves unparseable responses untouched for the validator to reject', () => {
    expect(normalizeCompositionResponse('not json at all', brief)).toBe('not json at all');
    expect(validateAIPageComposition(normalizeCompositionResponse('not json at all', brief), pack.id, roles)).toBeNull();
  });
});
