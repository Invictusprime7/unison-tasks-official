import { afterEach, describe, expect, it } from 'vitest';
import ts from 'typescript';
import {
  buildGeneratedUiFoundation,
  GENERATED_MOTION_PRIMITIVES,
} from '@/platform/core/generatedUiFoundation';
import { buildWizardAggregatedRegistryContext } from '@/services/launch/wizardRegistryAggregation';
import {
  getDesignImplementation,
  getImplementationVocabularyRefs,
  listImplementationsForVocabulary,
  resetDesignImplementationIndex,
  vocabularyExecutabilityReport,
} from '@/services/designImplementationRegistry';
import { ART_DIRECTION_PACKS, VARIANT_REGISTRY } from '@/sections/variants';

afterEach(resetDesignImplementationIndex);

describe('registry integrity expansion', () => {
  it('advertises exactly the runtime components exported by the emitted motion module', () => {
    const foundation = buildGeneratedUiFoundation({ themePresetId: 'modern' });
    const compiled = ts.transpileModule(foundation.files['/src/unison/ui/motion.tsx'], {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React },
      reportDiagnostics: true,
    });
    expect(compiled.diagnostics?.filter((entry) => entry.category === ts.DiagnosticCategory.Error)).toEqual([]);
    const exports: Record<string, unknown> = {};
    // Link the emitted module with inert facades: this tests its actual export
    // surface, not animation behavior or browser rendering.
    new Function('exports', 'require', compiled.outputText)(exports, () => ({}));
    const exportedComponents = Object.keys(exports).filter((name) => typeof exports[name] === 'function').sort();
    expect([...GENERATED_MOTION_PRIMITIVES].sort()).toEqual(exportedComponents);
    const context = buildWizardAggregatedRegistryContext({
      industry: 'saas', templateId: 'saas-dark', themePresetId: 'futuristic',
    });
    expect([...context.motionPrimitives].sort()).toEqual(exportedComponents);
    context.motionPrimitives.pop();
    expect(GENERATED_MOTION_PRIMITIVES).toHaveLength(exportedComponents.length);
  });

  it.each(['hero:centered', 'hero:split-image'])(
    'unions legacy and additional vocabulary without duplicate matches for %s', (variantId) => {
    const variant = VARIANT_REGISTRY.hero!.find((entry) => entry.id === variantId)!;
    const original = variant.vocabularyRefs;
    const legacy = variant.vocabulary;
    const additional = { category: 'background' as const, id: 'animated-grid' };
    try {
      variant.vocabularyRefs = [...(legacy ? [legacy] : []), additional, additional];
      resetDesignImplementationIndex();
      const implementation = getDesignImplementation(variant.id)!;
      expect(implementation.vocabulary).toEqual(legacy);
      expect(getImplementationVocabularyRefs(implementation)).toEqual([
        ...(legacy ? [legacy] : []), additional,
      ]);
      expect(listImplementationsForVocabulary(additional).filter((entry) => entry.implementationId === variant.id)).toHaveLength(1);
      expect(vocabularyExecutabilityReport().executable).toContain('background:animated-grid');
      expect(vocabularyExecutabilityReport().unimplemented).not.toContain('background:animated-grid');
    } finally {
      if (original === undefined) delete variant.vocabularyRefs;
      else variant.vocabularyRefs = original;
      resetDesignImplementationIndex();
    }
  });

  it('keeps category-qualified vocabulary keys distinct and copies declarations', () => {
    const refs = [{ category: 'hero' as const, id: 'split' }, { category: 'navigation' as const, id: 'split' }];
    const result = getImplementationVocabularyRefs({ vocabularyRefs: refs });
    expect(result).toEqual(refs);
    expect(result[0]).not.toBe(refs[0]);
    expect(getImplementationVocabularyRefs({})).toEqual([]);
  });

  it('resolves every pack reference through the canonical implementation registry', () => {
    for (const pack of Object.values(ART_DIRECTION_PACKS)) {
      for (const id of [...pack.navbarFamily, ...pack.footerFamily, ...Object.values(pack.sectionFamilies).flat()]) {
        expect(getDesignImplementation(id), `${pack.id}: ${id}`).toBeDefined();
      }
    }
  });
});
