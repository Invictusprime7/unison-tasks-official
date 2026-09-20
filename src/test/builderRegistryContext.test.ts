import { describe, it, expect } from 'vitest';
import {
  resolveBuilderRegistryContext,
  boundRegistryContext,
  readPersistedRegistryContext,
} from '@/services/builderRegistryContext';
import {
  buildWizardAggregatedRegistryContext,
  WIZARD_REGISTRY_CONTEXT_PATH,
} from '@/services/launch/wizardRegistryAggregation';

const canonical = () =>
  buildWizardAggregatedRegistryContext({
    industry: 'store',
    templateId: 'store-premium',
    themePresetId: 'commerce-editorial',
  });

describe('V4 M8 — both AI layers share one canonical registry projection', () => {
  it('reads the sealed projection persisted by the launcher', () => {
    const context = canonical();
    const vfsFiles = { [WIZARD_REGISTRY_CONTEXT_PATH]: JSON.stringify(context) };
    expect(readPersistedRegistryContext(vfsFiles)?.designRegistrySignature)
      .toBe(context.designRegistrySignature);
    expect(readPersistedRegistryContext({ '/src/App.tsx': 'x' })).toBeNull();
  });

  it('bounds the projection to registry vocabulary only — never source or credentials', () => {
    const bounded = boundRegistryContext(canonical());
    const serialized = JSON.stringify(bounded);
    expect(bounded.sections.length).toBeGreaterThan(0);
    expect(bounded.sections.every(section => section.allowedVariantIds.length <= 12)).toBe(true);
    expect(bounded.implementations.length).toBeLessThanOrEqual(80);
    expect(serialized).not.toContain('renderJSX');
    expect(serialized).not.toContain('supabase');
    expect(serialized).not.toMatch(/api[_-]?key/i);
  });

  it('exposes component-state contracts to the in-Builder lane', () => {
    const bounded = boundRegistryContext(canonical());
    const withStates = bounded.implementations.filter(entry => entry.componentStates?.supported?.length);
    expect(withStates.length).toBeGreaterThan(0);
    for (const entry of withStates) {
      expect(entry.componentStates!.responsive).toContain('reduced-motion');
    }
  });

  it('resolves from the draft VFS and matches the aggregated context', () => {
    const context = canonical();
    const fromVfs = resolveBuilderRegistryContext({
      vfsFiles: { [WIZARD_REGISTRY_CONTEXT_PATH]: JSON.stringify(context) },
    });
    const rebuilt = resolveBuilderRegistryContext({
      industry: 'store',
      templateId: 'store-premium',
      themePresetId: 'commerce-editorial',
    });
    expect(fromVfs?.sections.map(s => s.type)).toEqual(rebuilt?.sections.map(s => s.type));
    expect(fromVfs?.designRegistrySignature).toBe(rebuilt?.designRegistrySignature);
  });

  it('never throws for a legacy draft without registry context', () => {
    expect(resolveBuilderRegistryContext({ vfsFiles: {} })).toBeNull();
  });
});
