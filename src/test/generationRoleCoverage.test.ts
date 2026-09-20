import { describe, expect, it } from 'vitest';
import { getGenerationVariantsForSection, getVariantsForSection } from '@/sections/variants';
import type { SectionType } from '@/sections/types';

/**
 * Certification is the hard gate for generation. Page role and art-direction
 * pack are preferences — a section type that has certified implementations must
 * never resolve to an empty set for a page role, which is what produced the
 * spurious "21st coverage incomplete" launch notes.
 */
const ROLES = [
  'home', 'about', 'services', 'shop', 'gallery', 'contact',
  'pricing', 'blog', 'booking', 'faq', 'testimonials', 'team', 'careers',
];

const SECTION_TYPES: SectionType[] = [
  'hero', 'about', 'services', 'features', 'gallery', 'footer', 'team',
  'logo-cloud', 'blog-preview', 'before-after', 'pricing', 'testimonials',
  'faq', 'cta', 'navbar', 'stats', 'contact',
] as SectionType[];

describe('generation coverage across page roles', () => {
  it('never returns an empty set for a section type that has certified implementations', () => {
    const gaps: string[] = [];
    for (const sectionType of SECTION_TYPES) {
      if (!getVariantsForSection(sectionType).length) continue;
      const baseline = getGenerationVariantsForSection(sectionType);
      if (!baseline.length) continue;
      for (const role of ROLES) {
        if (!getGenerationVariantsForSection(sectionType, undefined, role).length) {
          gaps.push(`${role}:${sectionType}`);
        }
      }
    }
    expect(gaps).toEqual([]);
  });

  it('still prefers role-declared variants when they exist', () => {
    const all = getGenerationVariantsForSection('gallery' as SectionType);
    const forGallery = getGenerationVariantsForSection('gallery' as SectionType, undefined, 'gallery');
    expect(forGallery.length).toBeGreaterThan(0);
    expect(forGallery.every(variant => all.some(candidate => candidate.id === variant.id))).toBe(true);
  });
});
