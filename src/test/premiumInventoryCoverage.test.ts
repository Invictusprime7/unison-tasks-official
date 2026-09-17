/**
 * Phase 4 — Premium React Inventory certification.
 *
 * Every design implementation the compiler can select must resolve to a real
 * React component AND a JSX source renderer, and every editorially load-bearing
 * section family must offer real choice (>= 2 registered implementations).
 */

import { describe, it, expect } from 'vitest';
import {
  listDesignImplementations,
  listImplementationsForSection,
  resolveImplementationId,
} from '@/services/designImplementationRegistry';
import { VARIANT_REGISTRY, getVariantById, ART_DIRECTION_PACKS, familyForSection } from '@/sections/variants';
import { getAllSections } from '@/sections/registry';
import type { SectionType } from '@/sections/types';

/** Families that must present a premium choice set to the composer. */
const PREMIUM_FAMILIES: SectionType[] = [
  'hero',
  'navbar',
  'footer',
  'services',
  'features',
  'gallery',
  'testimonials',
  'pricing',
  'cta',
  'contact',
  'about',
  'faq',
  'stats',
  'team',
];

describe('premium inventory coverage', () => {
  it('every registered implementation renders through a real React component', () => {
    const missing = listDesignImplementations().filter((impl) => {
      const component = impl.variantId
        ? getVariantById(impl.variantId)?.component
        : getAllSections()[impl.sectionType]?.component;
      return typeof component !== 'function';
    });
    expect(missing.map((m) => m.implementationId)).toEqual([]);
  });

  it('every variant implementation can emit JSX source for the VFS', () => {
    const missing = Object.values(VARIANT_REGISTRY)
      .flatMap((variants) => variants ?? [])
      .filter((variant) => typeof variant.renderJSX !== 'function' || variant.renderJSX({}).trim().length < 40);
    expect(missing.map((v) => v.id)).toEqual([]);
  });

  it('every premium family offers at least three implementations', () => {
    const thin = PREMIUM_FAMILIES.filter((type) => listImplementationsForSection(type).length < 3);
    expect(thin).toEqual([]);
  });

  it('every premium family declares exactly one default implementation', () => {
    for (const type of PREMIUM_FAMILIES) {
      const defaults = listImplementationsForSection(type).filter((impl) => impl.isDefault);
      expect({ type, defaults: defaults.length }).toEqual({ type, defaults: 1 });
    }
  });

  it('art-direction packs only reference registered implementations', () => {
    for (const pack of Object.values(ART_DIRECTION_PACKS)) {
      for (const type of PREMIUM_FAMILIES) {
        const declared =
          type === 'navbar' ? pack.navbarFamily : type === 'footer' ? pack.footerFamily : pack.sectionFamilies[type];
        for (const id of declared ?? []) {
          expect({ pack: pack.id, id, registered: Boolean(getVariantById(id)) }).toEqual({
            pack: pack.id,
            id,
            registered: true,
          });
        }
        // filtered family must survive registration checks unchanged
        expect(familyForSection(pack, type)).toEqual(declared ?? []);
      }
    }
  });

  it('resolves unknown variant ids back into the registered family default', () => {
    for (const type of PREMIUM_FAMILIES) {
      const resolved = resolveImplementationId(type, `${type}:does-not-exist` as never);
      expect(listImplementationsForSection(type).some((impl) => impl.implementationId === resolved)).toBe(true);
    }
  });
});
