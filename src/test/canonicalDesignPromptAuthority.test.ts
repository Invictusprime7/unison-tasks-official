import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { generateCanonicalDesignPrompt, resolveIndustryKey } from '@/sections/promptContext/canonicalDesignPrompt';
import { VARIANT_REGISTRY } from '@/sections/variants/registry';
import type { SectionType } from '@/sections/types';

const SRC = path.resolve(__dirname, '..');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe('M2 — canonical design prompt authority', () => {
  it('no application source imports the retired site elements library', () => {
    const offenders = walk(SRC).filter((file) => {
      if (file.includes(`${path.sep}data${path.sep}siteElementsLibrary${path.sep}`)) return false;
      if (file.includes(`${path.sep}test${path.sep}`)) return false;
      return /from ['"][^'"]*siteElementsLibrary['"]/.test(fs.readFileSync(file, 'utf8'));
    });
    expect(offenders).toEqual([]);
  });

  it('lists registered variant ids for the requested industry', () => {
    const prompt = generateCanonicalDesignPrompt({ systemType: 'salon', userPrompt: 'improve the hero' });
    const heroVariants = (VARIANT_REGISTRY['hero' as SectionType] || []).map((v) => v.id);
    expect(heroVariants.length).toBeGreaterThan(0);
    for (const id of heroVariants) expect(prompt).toContain(id);
    expect(prompt).toContain('CANONICAL SECTION REGISTRY');
    expect(prompt).toContain('CANONICAL INTENT VOCABULARY');
  });

  it('marks certified portable-recipe variants', () => {
    const prompt = generateCanonicalDesignPrompt({ userPrompt: 'faq section' });
    expect(prompt).toMatch(/faq:accordion — .*certified/);
  });

  it('excludes intents forbidden for the industry', () => {
    const prompt = generateCanonicalDesignPrompt({ systemType: 'nonprofit' });
    expect(prompt).toContain('donation.start');
    expect(prompt).toContain('INDUSTRY PROFILE: nonprofit');
  });

  it('maps builder system types onto canonical industry keys', () => {
    expect(resolveIndustryKey('booking')).toBe('salon');
    expect(resolveIndustryKey('store')).toBe('ecommerce');
    expect(resolveIndustryKey('unknown-type')).toBeUndefined();
  });
});
