import { describe, it, expect } from 'vitest';
import {
  getBuilderVariantsForSection,
  getGenerationVariantsForSection,
  getVariantsForSection,
} from '@/sections/variants/registry';

describe('builder variant choices', () => {
  it('offers the generation-eligible set by default', () => {
    const builder = getBuilderVariantsForSection('hero').map(v => v.id);
    const generation = getGenerationVariantsForSection('hero').map(v => v.id);
    expect(builder).toEqual(generation);
  });

  it('keeps the current layout selectable even when it is not generation-eligible', () => {
    const all = getVariantsForSection('team');
    const generation = new Set(getGenerationVariantsForSection('team').map(v => v.id));
    const legacy = all.find(variant => !generation.has(variant.id));
    if (!legacy) return; // every team variant is certified — nothing to prove
    const builder = getBuilderVariantsForSection('team', legacy.id).map(v => v.id);
    expect(builder).toContain(legacy.id);
    for (const id of generation) expect(builder).toContain(id);
  });

  it('never duplicates a current variant that is already eligible', () => {
    const generation = getGenerationVariantsForSection('hero');
    const current = generation[0];
    expect(current).toBeTruthy();
    const builder = getBuilderVariantsForSection('hero', current.id).map(v => v.id);
    expect(builder.filter(id => id === current.id)).toHaveLength(1);
  });

  it('ignores an unregistered current variant id', () => {
    const builder = getBuilderVariantsForSection('hero', 'hero:does-not-exist').map(v => v.id);
    expect(builder).toEqual(getGenerationVariantsForSection('hero').map(v => v.id));
  });
});
