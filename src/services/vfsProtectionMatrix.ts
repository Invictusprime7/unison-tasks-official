import type { PatchSource } from '@/types/patchPlan';
import { normalizeAuthoredPath } from '@/services/builder/authoredSourcePreservation';

export type VfsProtectionClass =
  | 'immutable-infrastructure'
  | 'system-generated-replaceable'
  | 'builder-authorable'
  | 'capability-sensitive'
  | 'user-content-data-owned';

export interface VfsProtectionDecision {
  classification: VfsProtectionClass;
  directMutation: 'denied' | 'builder-only';
  rationale: string;
}

const AUTHORING_SOURCES = new Set<PatchSource>([
  'ai-builder', 'playground-edit', 'layout-fast-path', 'preview-toolbar',
]);

function matches(path: string, pattern: string): boolean {
  const normalized = normalizeAuthoredPath(pattern);
  return normalized.endsWith('/**')
    ? path.startsWith(normalized.slice(0, -2))
    : path === normalized;
}

/** The canonical post-launch path audit. It classifies ownership; it never mutates source. */
export function classifyVfsProtection(input: {
  path: string;
  registeredPagePaths?: readonly string[];
  compilerGeneratedPaths?: readonly string[];
  /** False only for legacy single-file drafts where App.tsx is the page body, not a generated router. */
  canonicalRouterActive?: boolean;
}): VfsProtectionDecision {
  const path = normalizeAuthoredPath(input.path);
  if ((path === '/src/App.tsx' && input.canonicalRouterActive !== false)
    || path.startsWith('/.unison/') || path.startsWith('/src/unison/')) {
    return {
      classification: 'immutable-infrastructure', directMutation: 'denied',
      rationale: 'Canonical routing, revision metadata, and runtime facades change only through typed platform operations.',
    };
  }
  if (path.startsWith('/src/integrations/')) {
    return {
      classification: 'capability-sensitive', directMutation: 'denied',
      rationale: 'Integration adapters require capability and security validation rather than presentation authorship.',
    };
  }
  if ((input.registeredPagePaths ?? []).some((candidate) => matches(path, candidate))) {
    return {
      classification: 'builder-authorable', directMutation: 'builder-only',
      rationale: 'Accepted page presentation becomes Builder-authored after the launch handoff.',
    };
  }
  if ((input.compilerGeneratedPaths ?? []).some((candidate) => matches(path, candidate))
    || path.startsWith('/src/components/recipes/')
    || ['/src/components/theme.ts', '/src/components/SiteLayout.tsx', '/src/components/SectionMap.ts'].includes(path)) {
    return {
      classification: 'system-generated-replaceable', directMutation: 'builder-only',
      rationale: 'The Wizard generated this presentation source, but its launch recipe is provenance rather than permanent ownership.',
    };
  }
  if (path.startsWith('/public/') || path.startsWith('/src/content/') || path.startsWith('/src/data/')) {
    return {
      classification: 'user-content-data-owned', directMutation: 'builder-only',
      rationale: 'Project content and assets remain owned by the project author.',
    };
  }
  return {
    classification: 'builder-authorable', directMutation: 'builder-only',
    rationale: 'Project-local TSX, CSS, and presentation modules are authorable and remain subject to canonical validation.',
  };
}

export function canDirectlyAuthorVfsPath(
  decision: VfsProtectionDecision,
  source: PatchSource,
  builderAuthorityActive: boolean,
): boolean {
  return builderAuthorityActive
    && decision.directMutation === 'builder-only'
    && AUTHORING_SOURCES.has(source);
}
