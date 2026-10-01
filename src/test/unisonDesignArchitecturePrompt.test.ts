import { describe, expect, it } from 'vitest';
import {
  buildCanonicalPipelineDirective,
  buildComposerCanonicalRules,
  buildUnisonDesignArchitectureDirective,
} from '../../supabase/functions/_shared/canonicalPipelinePrompt';

describe('Unison design architecture prompt context', () => {
  it('full level carries layers, design-source usage and required-array rule', () => {
    const full = buildUnisonDesignArchitectureDirective('full');
    for (const needle of ['L1', 'L5', '@/unison/design-sources/', 'REGISTERED_VARIANTS', 'required arrays']) expect(full).toContain(needle);
  });
  it('is included in builder and composer prompts, and brief level stays small', () => {
    expect(buildCanonicalPipelineDirective()).toContain('UNISON DESIGN ARCHITECTURE');
    expect(buildComposerCanonicalRules()).toContain('CERTIFIED DESIGN-SOURCE MODULES');
    expect(buildUnisonDesignArchitectureDirective('brief').length).toBeLessThan(1200);
  });
});
