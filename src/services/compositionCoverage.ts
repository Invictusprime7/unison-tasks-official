import { collectResolvedCompositions } from '@/platform/core/resolvedComposition';
import { DESIGN_VOCABULARY } from '@/platform/core/designVocabulary';
import { COMPOSITION_ENHANCEMENTS } from '@/sections/compositionEnhancements';
import { collectReachableFiles } from '@/utils/dependencyExtractor';
import { getDesignImplementation, resolveImplementationId, vocabularyExecutabilityReport } from './designImplementationRegistry';

export interface BrowserInteractionCheck {
  pagePath: string;
  interaction: string;
  status: 'passed' | 'failed';
  evidence: string;
}

/** Source reachability is deliberately separate from observed browser behavior. */
export function buildCompositionCoverage(
  files: Record<string, string>,
  browserChecks: BrowserInteractionCheck[] = [],
) {
  const compositions = collectResolvedCompositions(files);
  const vocabulary = vocabularyExecutabilityReport();
  const adapters = new Set(COMPOSITION_ENHANCEMENTS.map(recipe => `${recipe.category}:${recipe.vocabularyId}`));
  const availableModules = Object.keys(files).filter(path => /^\/src\/unison\/ui\//.test(path)).sort();
  return {
    version: '1.0' as const,
    availableModules,
    unimplementedVocabulary: DESIGN_VOCABULARY
      .map(entry => `${entry.category}:${entry.id}`)
      .filter(id => vocabulary.unimplemented.includes(id) && !adapters.has(id)),
    pages: Object.values(compositions).map(composition => {
      const reachable = Object.keys(collectReachableFiles(files, [composition.pageFilePath])).sort();
      return {
        pagePath: composition.pageFilePath,
        templateName: composition.templateName,
        selectedImplementations: composition.sections.map(section => {
          const implementationId = resolveImplementationId(section.semanticType as Parameters<typeof resolveImplementationId>[0], section.variantId);
          const registered = getDesignImplementation(implementationId);
          return {
            sectionId: section.sectionId, variantId: section.variantId, primitiveId: section.primitiveId,
            implementationId, provenance: registered?.vfs ?? 'section-registry',
            radixPrimitives: registered?.radixPrimitives ?? [],
          };
        }),
        decisions: composition.activation?.decisions ?? [],
        reachableModules: reachable,
        unusedModules: availableModules.filter(path => !reachable.includes(path)),
        browserVerification: browserChecks.some(check => check.pagePath === composition.pageFilePath) ? 'recorded' : 'not-run',
        browserChecks: browserChecks.filter(check => check.pagePath === composition.pageFilePath),
      };
    }),
  };
}
