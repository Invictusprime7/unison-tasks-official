import { describe, expect, it } from 'vitest';
import {
  compileSiteDesignContract,
  describeSiteDesignContract,
  isAdditiveUnderContract,
  pageDensityIssues,
} from '@/services/launch/siteDesignContract';
import { INDUSTRY_CREATIVE_KEYS } from '@/sections/templates/industryCreativeVocabulary';
import { COMPOSITION_ROLES, isCreativelyAdditiveSection } from '@/sections/aiPageComposition';
import { ART_DIRECTION_PACKS } from '@/sections/variants/artDirectionPacks';

const ROLES = [...COMPOSITION_ROLES];

describe('compiled site design contract', () => {
  it('compiles a contract for every canonical industry with every page role covered', () => {
    for (const industry of INDUSTRY_CREATIVE_KEYS) {
      const contract = compileSiteDesignContract({ industry, roles: ROLES });
      expect(ART_DIRECTION_PACKS[contract.artDirectionPackId]).toBeTruthy();
      for (const role of ROLES) {
        const page = contract.pages[role];
        expect(page, `${industry}/${role}`).toBeTruthy();
        expect(page.densityBudget.min).toBeGreaterThanOrEqual(1);
        expect(page.densityBudget.max).toBeGreaterThanOrEqual(page.densityBudget.min);
        expect(page.densityBudget.target).toBeGreaterThanOrEqual(page.densityBudget.min);
        expect(page.densityBudget.target).toBeLessThanOrEqual(page.densityBudget.max);
        expect(page.requiredFamilies.every(family => !page.discouragedFamilies.includes(family))).toBe(true);
      }
    }
  });

  it('is deterministic for identical inputs', () => {
    const a = compileSiteDesignContract({ industry: 'salon', roles: ROLES });
    const b = compileSiteDesignContract({ industry: 'salon', roles: ROLES });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('honours an explicitly selected art direction pack and falls back to the industry preference', () => {
    expect(compileSiteDesignContract({ industry: 'salon', roles: ['home'], artDirectionPackId: 'swiss-grid' })
      .artDirectionPackId).toBe('swiss-grid');
    expect(compileSiteDesignContract({ industry: 'saas', roles: ['home'] }).artDirectionPackId).toBe('glass-tech');
  });

  it('enforces negative vocabulary in auto mode and keeps it advisory otherwise', () => {
    expect(compileSiteDesignContract({ industry: 'salon', roles: ['home'], mode: 'auto' })
      .negativeVocabularyEnforced).toBe(true);
    expect(compileSiteDesignContract({ industry: 'salon', roles: ['home'], mode: 'custom' })
      .negativeVocabularyEnforced).toBe(false);
  });

  it('compiles the motion budget from the experience preference', () => {
    expect(compileSiteDesignContract({ roles: ['home'], experience: 'immersive' }).motion.budget).toBe('immersive');
    expect(compileSiteDesignContract({ roles: ['home'], experience: 'motion-rich' }).motion.budget).toBe('motion');
    expect(compileSiteDesignContract({ roles: ['home'] }).motion.budget).toBe('static');
  });

  it('never treats chrome or the hero as additive and refuses forbidden families', () => {
    const contract = compileSiteDesignContract({ industry: 'salon', roles: ROLES });
    expect(isAdditiveUnderContract(contract, 'home', 'navbar')).toBe(false);
    expect(isAdditiveUnderContract(contract, 'home', 'hero')).toBe(false);
    expect(isAdditiveUnderContract(contract, 'checkout', 'gallery')).toBe(false);
    expect(isAdditiveUnderContract(contract, 'home', 'services')).toBe(true);
  });

  it('routes the composition additivity check through the contract when one is supplied', () => {
    const contract = compileSiteDesignContract({ industry: 'salon', roles: ROLES });
    expect(isCreativelyAdditiveSection('gallery', 'checkout', 'salon', contract)).toBe(false);
    expect(isCreativelyAdditiveSection('testimonials', 'home', 'salon', contract)).toBe(true);
    // Without a contract the page archetype still answers.
    expect(isCreativelyAdditiveSection('gallery', 'checkout', 'salon')).toBe(false);
  });

  it('validates required roles and density budgets per page', () => {
    const contract = compileSiteDesignContract({ industry: 'portfolio', roles: ROLES });
    expect(pageDensityIssues(contract, 'gallery', ['navbar', 'footer']).join(' ')).toContain('gallery role');
    const healthy = pageDensityIssues(contract, 'gallery', ['navbar', 'hero', 'gallery', 'cta', 'footer']);
    expect(healthy).toEqual([]);
    const bloated = pageDensityIssues(contract, 'checkout', ['navbar', 'contact', 'faq', 'cta', 'stats', 'gallery', 'team', 'footer']);
    expect(bloated.some(issue => issue.includes('at most'))).toBe(true);
  });

  it('renders a prompt block containing the site authority and every page budget', () => {
    const text = describeSiteDesignContract(compileSiteDesignContract({ industry: 'restaurant', roles: ['home', 'gallery'] }));
    expect(text).toContain('SITE DESIGN CONTRACT');
    expect(text).toContain('page "home"');
    expect(text).toContain('page "gallery"');
    expect(text).toContain('body sections');
  });
});
