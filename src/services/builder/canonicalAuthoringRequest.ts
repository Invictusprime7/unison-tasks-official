import type { AIComposerRequest, AIComposerTask } from '@/contracts/aiComposerContract';
import {
  designKnowledgeManifest,
  selectDesignKnowledge,
} from '@/services/knowledge/designKnowledge';
import { selectSourceKnowledgeWithReport } from './sourceKnowledgeContext';
import {
  boundRegistryContext,
  collectValidImportPaths,
} from '@/services/builderRegistryContext';
import type { WizardAggregatedRegistryContext } from '@/services/launch/wizardRegistryAggregation';

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

export function shouldUseCanonicalComposer(input: {
  isReactProject: boolean;
  isLaunchPlanningRequest: boolean;
  isCatalogMutationRequest: boolean;
  hasAttachments: boolean;
  hasVfs: boolean;
}): boolean {
  return input.isReactProject
    && !input.isLaunchPlanningRequest
    && !input.isCatalogMutationRequest
    && !input.hasAttachments
    && input.hasVfs;
}

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

/** Resolve a Builder target against accepted topology without authoring it. */
export function resolveCanonicalAuthoringPage(
  files: Record<string, string>,
  targetFile?: string | null,
): AIComposerRequest['page'] {
  let pages: Array<{ pageId: string; title?: string; path?: string; filePath?: string; pageType?: string }> = [];
  try {
    const snapshot = JSON.parse(files['/.unison/site-bundle-snapshot.json'] ?? '{}') as {
      pageRegistry?: { pages?: Record<string, { title?: string; path?: string; filePath?: string; pageType?: string }> };
    };
    pages = Object.entries(snapshot.pageRegistry?.pages ?? {}).map(([pageId, page]) => ({ pageId, ...page }));
  } catch {
    pages = [];
  }
  const normalizedTarget = targetFile ? (targetFile.startsWith('/') ? targetFile : `/${targetFile}`) : null;
  const page = pages.find((item) => item.filePath === normalizedTarget)
    ?? pages.find((item) => item.path === '/')
    ?? pages[0];
  const filePath = normalizedTarget
    ?? page?.filePath
    ?? Object.keys(files).find((path) => /^\/src\/pages\/[^/]+\.(?:tsx|jsx)$/.test(path))
    ?? '/src/pages/Home.tsx';
  const fallbackTitle = filePath.split('/').pop()?.replace(/\.[^.]+$/, '') || 'Page';
  return {
    role: page?.pageType ?? (page?.path === '/' ? 'home' : 'page'),
    title: page?.title ?? fallbackTitle,
    route: page?.path ?? '/',
    filePath,
  };
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
  const rawRegistry = input.registryContext === undefined
    ? input.baseFiles['/.unison/wizard-registry-context.json']
    : input.registryContext;
  let registryValue: unknown = rawRegistry;
  if (typeof registryValue === 'string') {
    try { registryValue = JSON.parse(registryValue); } catch { registryValue = undefined; }
  }
  if (registryValue && typeof registryValue === 'object'
    && Array.isArray((registryValue as { sections?: unknown }).sections)
    && 'generatedAt' in registryValue) {
    registryValue = boundRegistryContext(registryValue as WizardAggregatedRegistryContext, {
      pageRole: input.page.role,
    });
  }
  if (registryValue && typeof registryValue === 'object') {
    registryValue = {
      ...(registryValue as Record<string, unknown>),
      validImportPaths: collectValidImportPaths(input.baseFiles),
    };
  }
  const boundedRegistry = registryValue === undefined ? undefined : stableJson(registryValue);
  if (boundedRegistry && boundedRegistry.length > 60000) {
    throw new Error('[CanonicalAuthoringRequest] bounded registry context exceeds 60000 characters.');
  }
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
