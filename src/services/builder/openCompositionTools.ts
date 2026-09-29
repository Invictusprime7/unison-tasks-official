/**
 * Read-only tools available to open-composition authoring. They expose real
 * project/registry context and candidate validation without turning the
 * registry into a source whitelist or adding another writer.
 */
import { getComponentIntelligence } from '@/services/componentIntelligenceRegistry';
import { selectDesignKnowledge } from '@/services/knowledge/designKnowledge';
import { normalizeAuthoredPath } from './authoredSourcePreservation';
import { prepareAICandidate, type PreparedCandidate } from './aiCandidateGates';
import { selectSourceKnowledgeWithReport } from './sourceKnowledgeContext';

export interface OpenCompositionToolContext {
  files: Record<string, string>;
  revisionId?: string | null;
}

function assertRevision(expected: string | null | undefined, supplied?: string | null): void {
  if (expected && supplied && expected !== supplied) {
    throw new Error('Requested project context is stale; reload the accepted revision before authoring.');
  }
}

export function createOpenCompositionTools(context: OpenCompositionToolContext) {
  return {
    searchDesignKnowledge(query: string, maxCharacters?: number) {
      return selectDesignKnowledge(query, maxCharacters);
    },
    getRegistryComponent(sectionType: string) {
      // Registry metadata is advisory/contract context only. Undefined is a
      // valid outcome: authors may compose a project-local original component.
      return getComponentIntelligence(sectionType as never) ?? null;
    },
    readProjectFiles(paths: string[], baseRevisionId?: string | null, maxBytes?: number) {
      assertRevision(context.revisionId, baseRevisionId);
      const normalized = [...new Set(paths.map(normalizeAuthoredPath))];
      return selectSourceKnowledgeWithReport(context.files, normalized, maxBytes);
    },
    async validateCandidate(input: {
      files: Record<string, string>;
      deletions?: string[];
      baseRevisionId?: string | null;
      targetPages?: string[];
      intent?: string;
    }): Promise<PreparedCandidate> {
      assertRevision(context.revisionId, input.baseRevisionId);
      return prepareAICandidate({
        aiFiles: input.files,
        deletions: input.deletions,
        baseFiles: context.files,
        baseRevisionId: context.revisionId ?? undefined,
        targetPages: input.targetPages,
        origin: 'builder',
        intent: input.intent,
      });
    },
  };
}
