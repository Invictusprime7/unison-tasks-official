import type { AIComposerRequest, AIComposerTask } from '@/contracts/aiComposerContract';
import {
  designKnowledgeManifest,
  selectDesignKnowledge,
} from '@/services/knowledge/designKnowledge';
import { selectSourceKnowledgeWithReport } from './sourceKnowledgeContext';

export const CANONICAL_AUTHORING_OPERATIONS = [
  'create_source',
  'replace_source',
  'delete_source',
  'add_page',
  'remove_page',
  'rename_page',
  'set_home',
  'toggle_nav',
  'reorder_navigation',
] as const;

export interface CanonicalAuthorshipEvidence {
  protocolVersion: '1.0';
  baseRevisionId: string | null;
  sourceContextHash: string;
  sourcePaths: string[];
  sourceContextComplete: boolean;
  omittedSourcePaths: string[];
  unresolvedImports: string[];
  registryContextHash: string | null;
  knowledgeContextHash: string;
  knowledgePackageVersion: string;
  knowledgeEntryIds: string[];
  availableOperations: string[];
}

export interface CanonicalAuthoringRequestInput {
  task: AIComposerTask;
  page: AIComposerRequest['page'];
  brief: string;
  knowledgeQuery: string;
  baseFiles: Record<string, string>;
  baseRevisionId?: string | null;
  routes: AIComposerRequest['routes'];
  instruction?: string;
  priorPages?: AIComposerRequest['priorPages'];
  diagnostics?: string[];
  previousResponse?: string;
  registryContext?: unknown;
  runtimeContext?: string;
  sourceTargets?: string[];
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

async function hashText(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    return `sha256:${Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')}`;
  }
  let hash = 0x811c9dc5;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `fnv1a:${hash.toString(16).padStart(8, '0')}`;
}

/**
 * The one request assembler for Wizard authoring, initial Builder edits and
 * pre-acceptance repair. It selects complete source files and records the
 * exact knowledge/context identities used; it never treats registry metadata
 * as proof that an export exists.
 */
export async function assembleCanonicalAuthoringRequest(
  input: CanonicalAuthoringRequestInput,
): Promise<{ request: AIComposerRequest; evidence: CanonicalAuthorshipEvidence }> {
  const source = selectSourceKnowledgeWithReport(
    input.baseFiles,
    input.sourceTargets?.length ? input.sourceTargets : [input.page.filePath],
  );
  const knowledgeBudget = Math.min(5000, Math.max(0, 12000 - input.brief.length - 90));
  const knowledge = selectDesignKnowledge(input.knowledgeQuery, knowledgeBudget);
  const knowledgeManifest = await designKnowledgeManifest(knowledge);
  const registryJson = input.registryContext === undefined
    ? input.baseFiles['/.unison/wizard-registry-context.json']
    : stableJson(input.registryContext);
  const boundedRegistry = registryJson?.slice(0, 30000);
  const evidence: CanonicalAuthorshipEvidence = {
    protocolVersion: '1.0',
    baseRevisionId: input.baseRevisionId ?? null,
    sourceContextHash: await hashText(stableJson(source.files)),
    sourcePaths: Object.keys(source.files).sort(),
    sourceContextComplete: source.completeTargets && source.unresolvedImports.length === 0,
    omittedSourcePaths: source.omitted.map((item) => item.path).sort(),
    unresolvedImports: source.unresolvedImports.map((item) => `${item.path}:${item.specifier}`).sort(),
    registryContextHash: boundedRegistry ? await hashText(boundedRegistry) : null,
    knowledgeContextHash: `sha256:${knowledgeManifest.contextHash}`,
    knowledgePackageVersion: knowledgeManifest.packageVersion,
    knowledgeEntryIds: knowledgeManifest.entries.map((item) => `${item.id}@${item.version}`),
    availableOperations: [...CANONICAL_AUTHORING_OPERATIONS],
  };
  const brief = `${input.brief}\n\nCURATED DESIGN KNOWLEDGE (guidance; project source remains authoritative):\n${knowledge.text}`;
  let routes = input.routes;
  if (routes.length === 0) {
    try {
      const snapshot = JSON.parse(input.baseFiles['/.unison/site-bundle-snapshot.json'] ?? '{}') as {
        pageRegistry?: { pages?: Record<string, { title?: string; path?: string }> };
      };
      routes = Object.values(snapshot.pageRegistry?.pages ?? {})
        .filter((page) => typeof page.title === 'string' && typeof page.path === 'string')
        .map((page) => ({ title: page.title!, route: page.path! }));
    } catch {
      routes = [];
    }
  }

  return {
    request: {
      task: input.task,
      page: input.page,
      brief,
      instruction: input.instruction,
      files: source.files,
      routes,
      priorPages: input.priorPages,
      diagnostics: input.diagnostics,
      previousResponse: input.previousResponse,
      registryContext: boundedRegistry,
      runtimeContext: input.runtimeContext?.slice(0, 12000),
      evidence,
    },
    evidence,
  };
}
