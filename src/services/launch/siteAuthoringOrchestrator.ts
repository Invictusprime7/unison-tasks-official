/**
 * Site authoring orchestrator (milestone §3, §18, §19, §30).
 *
 * Page-by-page AI authoring on top of the committed deterministic substrate:
 *
 *   Home first, then remaining pages in parallel (bounded concurrency):
 *     build page brief from ResolvedSiteDesignContext
 *     composer repair loop (candidate + blocking gates, max 3)
 *     accepted -> caller commits through the single legal writer
 *     rejected -> page keeps its last-known-good committed version
 *
 * Owns no writer, no VFS, no snapshot. `commitPage` is supplied by the caller
 * (launch orchestrator / Builder) and must go through commitMutation.
 */

import { AI_AUTHORED_MARKER } from '@/contracts/aiComposerContract';
import type { ResolvedSiteDesignContext } from '@/services/launch/resolvedSiteDesignContext';
import { projectSiteDesignContract } from '@/services/launch/siteDesignContract';
import type { AIComposerRequest } from '@/contracts/aiComposerContract';
import { runComposerRepairLoop, type ComposerInvoke, type ComposerLoopResult, type ComposerStopReason } from '@/services/builder/aiRepairLoop';
import { buildAICandidateChangeSet, type AICandidateChangeSet } from '@/services/builder/aiCandidateChangeSet';
import { assembleCanonicalAuthoringRequest } from '@/services/builder/canonicalAuthoringRequest';
import { selectSourceKnowledge } from '@/services/builder/sourceKnowledgeContext';
import {
  extractHomepageVisualLanguage,
  renderHomepageInheritanceContract,
  type HomepageVisualLanguage,
} from '@/services/launch/homepageFirstContract';

import {
  createSiteVisualMemory,
  extractCompositionSignature,
  findRedundancy,
  planSiteComposition,
  renderCompositionBrief,
  type RedundancyIssue,
  type SiteCompositionPlan,
} from '@/services/composition';

export interface AuthoringPage {
  pageId: string;
  title: string;
  route: string;
  filePath: string;
  role: string;
}

export interface PageAuthoringOutcome {
  page: AuthoringPage;
  status: 'authored' | 'kept-baseline' | 'skipped';
  reason: ComposerStopReason | 'budget' | 'paused' | 'commit_failed';
  attempts: number;
  summary?: string;
  errors: string[];
  revisionId?: string | null;
}

export interface SiteAuthoringProgress {
  page: AuthoringPage;
  index: number;
  total: number;
  phase: 'authoring' | 'committed' | 'kept-baseline';
}

export interface SiteAuthoringInput {
  pages: AuthoringPage[];
  homePageId?: string;
  designContext: ResolvedSiteDesignContext | null;
  businessName: string;
  /** Owner's own description from the home-page planning chat. */
  visionBrief?: string;
  files: Record<string, string>;
  revisionId?: string | null;
  commitPage: (nextFiles: Record<string, string>, page: AuthoringPage, beforeFiles: Record<string, string>, candidate: AICandidateChangeSet) =>
    Promise<{ files: Record<string, string>; revisionId?: string | null }>;
  preflight?: (changed: Record<string, string>) => Record<string, string>;
  onProgress?: (event: SiteAuthoringProgress) => void;
  /** Total wall-clock budget; pages past it keep their baseline. */
  budgetMs?: number;
  maxPages?: number;
  /** Pages authored in parallel after Home (default 3). */
  concurrency?: number;
  signal?: AbortSignal;
  invoke?: ComposerInvoke;
  now?: () => number;
  /** Site-wide composition plan (hero patterns, geometry allocation, section order). */
  compositionPlan?: SiteCompositionPlan;
  /** Registry context for component availability (sections, variants). */
  registryContext?: unknown;
  /** Extra runtime facts for every page turn (e.g. certified design-source modules with prop contracts). */
  runtimeContext?: string;
  /** Per-page override of runtimeContext (trimmed to the modules that page can use). */
  runtimeContextForPage?: (pageId: string) => string;
  /** Per-page design-source check run inside each page's repair loop. */
  pageCheck?: (path: string, source: string) => string[];
  /** Reuse pages accepted by an earlier identical authoring run (default off). */
  reuseAcceptedPages?: boolean;
  /** false keeps /package.json untouched in authored candidates. */
  resolveDependencies?: boolean;
}

export interface AcceptedPageEntry {
  changed: Record<string, string>;
  deleted: string[];
  routeOps: unknown;
  evidence: unknown;
  summary: string;
}

/** Accepted-page cache: a retry with an identical page contract reuses the page instead of re-authoring. */
const acceptedPages = new Map<string, AcceptedPageEntry>();
const MAX_ACCEPTED_PAGES = 64;

function hashKey(value: string): string {
  let h = 5381;
  for (let i = 0; i < value.length; i += 1) h = ((h * 33) ^ value.charCodeAt(i)) >>> 0;
  return h.toString(36) + ':' + value.length;
}

export function clearAcceptedPageCache(): void {
  acceptedPages.clear();
}

export interface SiteAuthoringResult {
  files: Record<string, string>;
  revisionId?: string | null;
  outcomes: PageAuthoringOutcome[];
}


/** Deterministic order: home first, then by route. */
export function orderAuthoringPages(pages: AuthoringPage[], homePageId?: string): AuthoringPage[] {
  return [...pages].sort((a, b) => {
    const ah = a.pageId === homePageId || a.route === '/' ? 0 : 1;
    const bh = b.pageId === homePageId || b.route === '/' ? 0 : 1;
    return ah - bh || a.route.localeCompare(b.route) || a.pageId.localeCompare(b.pageId);
  });
}

export function renderPageBrief(
  ctx: ResolvedSiteDesignContext | null,
  page: AuthoringPage,
  businessName: string,
  establishedLanguage?: HomepageVisualLanguage,
): string {
  const lines = [`BUSINESS: ${businessName}`, `PAGE ROLE: ${page.role}`];
  if (!ctx) return [...lines, renderHomepageInheritanceContract(establishedLanguage)].filter(Boolean).join('\n');
  const projection = projectSiteDesignContract(ctx.contract);
  const preferred = Object.entries(ctx.creativeRecommendation.preferredImplementations)
    .map(([family, ids]) => `${family}: ${(ids ?? []).slice(0, 4).join(', ')}`);
  const forbidden = Object.entries(ctx.hardLegality.forbiddenImplementations)
    .map(([family, ids]) => `${family}: ${(ids ?? []).join(', ')}`);
  lines.push(
    `INDUSTRY: ${ctx.contract.industry}`,
    `ART DIRECTION PACK: ${ctx.contract.artDirectionPackId}`,
    `EXPERIENCE: ${ctx.contract.experience}`,
    `DESIGN CONTRACT:\n${projection.summary}`,
    preferred.length ? `PREFERRED CANONICAL VOCABULARY:\n${preferred.join('\n')}` : '',
    forbidden.length ? `FORBIDDEN IMPLEMENTATIONS (never use):\n${forbidden.join('\n')}` : '',
    `CREATIVE AUTHORITY: ${ctx.creativeRecommendation.guidance}`,
    `AFFINITY INVARIANTS: Preserve pack ${ctx.affinity.invariants.artDirectionPackId}; its typography, geometry, spacing cadence, media treatment, motion character, and shared chrome identity are site-wide.`,
    `PAGE-LOCAL VARIANTS: ${ctx.affinity.looseFit.guidance}`,
    ctx.affinity.variants[page.role]
      ? `PAGE INTENT FIT: ${ctx.affinity.variants[page.role].purpose} Rhythm ${ctx.affinity.variants[page.role].rhythm}; density ${ctx.affinity.variants[page.role].density}; variation remains open for ${ctx.affinity.variants[page.role].allowedVariation.join(', ')}.`
      : `LOOSE-FIT PAGE INTENT: Treat "${page.role}" as ${ctx.affinity.looseFit.fallbackRole}; preserve invariants and choose any legal, purpose-fit variants.`,
    renderHomepageInheritanceContract(establishedLanguage),
    `DESIGN FINGERPRINT: ${ctx.fingerprint}`,
  );
  return lines.filter(Boolean).join('\n');
}

/** Target page, theme, shared chrome and transitive component APIs. */
export function selectPageContextFiles(files: Record<string, string>, page: AuthoringPage): Record<string, string> {
  return selectSourceKnowledge(files, [page.filePath]);
}

export async function authorSitePages(input: SiteAuthoringInput): Promise<SiteAuthoringResult> {
  const now = input.now ?? (() => Date.now());
  const deadline = now() + (input.budgetMs ?? 240_000);
  const ordered = orderAuthoringPages(input.pages, input.homePageId).slice(0, input.maxPages ?? Infinity);
  const routes = ordered.map((p) => ({ title: p.title, route: p.route }));
  let files = input.files;
  let revisionId = input.revisionId;
  const outcomes: PageAuthoringOutcome[] = [];
  const priorPages: Array<{ role: string; summary: string }> = [];
  let paused: ComposerStopReason | null = null;
  let establishedLanguage: HomepageVisualLanguage | undefined;
  // One universal planner assigns each page a distinct narrative + topology job.
  // A sealed plan from the AppBuildContract is authoritative; replanning here would fork the design.
  const compositionPlan = input.compositionPlan ?? planSiteComposition(
    input.designContext?.contract.industry ?? 'generic',
    ordered.map((p) => ({ pageId: p.pageId, role: p.role })),
    input.designContext?.fingerprint ?? input.businessName,
    {
      artDirection: input.designContext?.contract.artDirectionPackId,
      businessTraits: input.designContext
        ? [input.designContext.contract.experience, input.designContext.contract.mode]
        : [],
    },
  );
  const visualMemory = createSiteVisualMemory();

  const outcomeSlots: Array<PageAuthoringOutcome | undefined> = new Array(ordered.length);
  // Commits are serialized so each page lands on the latest committed files.
  let commitChain: Promise<void> = Promise.resolve();

  const authorOne = async (page: AuthoringPage, index: number): Promise<void> => {
    if (paused || input.signal?.aborted) {
      outcomeSlots[index] = { page, status: 'skipped', reason: 'paused', attempts: 0, errors: [] };
      return;
    }
    if (now() >= deadline) {
      outcomeSlots[index] = { page, status: 'kept-baseline', reason: 'budget', attempts: 0, errors: ['Time budget reached.'] };
      input.onProgress?.({ page, index, total: ordered.length, phase: 'kept-baseline' });
      return;
    }
    input.onProgress?.({ page, index, total: ordered.length, phase: 'authoring' });
    const baseFiles = files;
    const planned = compositionPlan.pages.find((p) => p.pageId === page.pageId);
    const buildRequest = async (redundancy: RedundancyIssue | null): Promise<AIComposerRequest> => (await assembleCanonicalAuthoringRequest({
      task: 'site_page_author',
      page: { role: page.role, title: page.title, route: page.route, filePath: page.filePath },
      brief: [
        input.visionBrief ? `OWNER VISION (from the planning chat; honour its content, never its styling over the sealed design): ${input.visionBrief.slice(0, 1200)}` : '',
        renderPageBrief(input.designContext, page, input.businessName, establishedLanguage),
        renderCompositionBrief(planned, visualMemory.entries(), redundancy),
      ].filter(Boolean).join('\n').slice(0, 6500),
      knowledgeQuery: `${input.businessName} ${page.role} ${page.title} ${page.route}`,
      baseFiles,
      baseRevisionId: revisionId,
      sourceTargets: [page.filePath],
      routes,
      priorPages: priorPages.slice(-20),
      registryContext: input.registryContext,
      runtimeContext: [
        input.designContext
          ? `Industry ${input.designContext.contract.industry}; experience ${input.designContext.contract.experience}; forbidden implementations ${JSON.stringify(input.designContext.hardLegality.forbiddenImplementations)}.`
          : '',
        input.runtimeContextForPage?.(page.pageId) ?? input.runtimeContext ?? '',
      ].filter(Boolean).join('\n').slice(0, 12000) || undefined,
    })).request;
    const runLoop = (request: AIComposerRequest) => runComposerRepairLoop({
      request,
      baseFiles,
      baseRevisionId: revisionId ?? undefined,
      preflight: input.preflight,
      signal: input.signal,
      timeoutMs: Math.max(15_000, Math.min(130_000, deadline - now())),
      invoke: input.invoke,
      affinity: {
        language: establishedLanguage,
        forbiddenImplementations: input.designContext?.hardLegality.forbiddenImplementations,
      },
      candidateOrigin: 'wizard',
      candidateIntent: `author:${page.role}`,
      resolveDependencies: input.resolveDependencies,
      pageCheck: input.pageCheck,
    });
    const firstRequest = await buildRequest(null);
    const cacheKey = input.reuseAcceptedPages
      ? hashKey(JSON.stringify([page, input.businessName, input.designContext?.fingerprint, firstRequest.brief, firstRequest.runtimeContext, firstRequest.files, firstRequest.routes]))
      : undefined;
    const cached = cacheKey ? acceptedPages.get(cacheKey) : undefined;
    let loop: ComposerLoopResult;
    if (cached) {
      const reused: Record<string, string> = { ...baseFiles, ...cached.changed };
      for (const path of cached.deleted) delete reused[path];
      loop = {
        ok: true,
        reason: 'accepted',
        attempts: 0,
        response: { summary: cached.summary } as ComposerLoopResult['response'],
        prepared: {
          ok: true,
          nextFiles: reused,
          errors: [],
          build: { changeSet: { routeOps: cached.routeOps, provenance: { evidence: cached.evidence } } },
          gates: { passed: true, failures: [], advisories: [] },
        } as unknown as ComposerLoopResult['prepared'],
        errors: [],
      };
    } else {
      loop = await runLoop(firstRequest);
    }
    // Redundancy check: one targeted recomposition when this page repeats another page's topology.
    if (!cached && loop.ok && loop.prepared && now() < deadline) {
      const issue = findRedundancy(page.pageId, extractCompositionSignature(loop.prepared.nextFiles[page.filePath]), visualMemory.entries());
      if (issue) {
        const retry = await runLoop(await buildRequest(issue));
        if (retry.ok && retry.prepared) loop = retry;
      }
    }
    if (loop.reason === 'credits' || loop.reason === 'denied') paused = loop.reason;

    if (!loop.ok || !loop.prepared) {
      outcomeSlots[index] = { page, status: 'kept-baseline', reason: loop.reason, attempts: loop.attempts, errors: loop.errors };
      input.onProgress?.({ page, index, total: ordered.length, phase: 'kept-baseline' });
      return;
    }
    const prepared = loop.prepared;
    const run = commitChain.then(async () => {
      try {
        // Rebase only the keys this candidate changed onto the latest commit,
        // preserving newer shared-file edits made by pages authored in parallel.
        const candidate = stampAuthoredPage(prepared.nextFiles, page, input.designContext?.fingerprint);
        const nextFiles: Record<string, string> = { ...files };
        for (const [path, content] of Object.entries(candidate)) {
          if (baseFiles[path] === content) continue;
          if (path === page.filePath || baseFiles[path] === files[path] || files[path] === content) {
            nextFiles[path] = content;
          }
        }
        for (const path of Object.keys(baseFiles)) {
          if (!(path in candidate) && baseFiles[path] === files[path]) delete nextFiles[path];
        }
        // Rebuild after the authorship stamp so the committed operation record
        // describes the exact bytes handed to the canonical writer.
        const finalCandidate = buildAICandidateChangeSet({
          aiFiles: nextFiles,
          baseFiles: files,
          baseRevisionId: revisionId ?? undefined,
          targetPages: [page.filePath],
          resolveDependencies: false,
          origin: 'wizard',
          intent: `author:${page.role}`,
          routeOps: prepared.build.changeSet.routeOps,
          evidence: prepared.build.changeSet.provenance.evidence,
        }).changeSet;
        const committed = await input.commitPage(nextFiles, page, files, finalCandidate);
        files = committed.files;
        visualMemory.record(page.pageId, page.role, extractCompositionSignature(files[page.filePath]));
        if (page.pageId === input.homePageId || page.route === '/') {
          establishedLanguage = extractHomepageVisualLanguage(files[page.filePath], page.pageId);
        }
        revisionId = committed.revisionId ?? revisionId;
        const summary = loop.response?.summary ?? '';
        priorPages.push({ role: page.role, summary: summary.slice(0, 2000) });
        if (cacheKey && !cached) {
          const changed: Record<string, string> = {};
          for (const [path, content] of Object.entries(candidate)) if (baseFiles[path] !== content) changed[path] = content;
          if (acceptedPages.size >= MAX_ACCEPTED_PAGES) acceptedPages.delete(acceptedPages.keys().next().value as string);
          acceptedPages.set(cacheKey, {
            changed,
            deleted: Object.keys(baseFiles).filter((path) => !(path in candidate)),
            routeOps: prepared.build.changeSet.routeOps,
            evidence: prepared.build.changeSet.provenance.evidence,
            summary,
          });
        }
        outcomeSlots[index] = { page, status: 'authored', reason: 'accepted', attempts: loop.attempts, summary, errors: [], revisionId: committed.revisionId };
        input.onProgress?.({ page, index, total: ordered.length, phase: 'committed' });
      } catch (error) {
        outcomeSlots[index] = {
          page, status: 'kept-baseline', reason: 'commit_failed', attempts: loop.attempts,
          errors: [error instanceof Error ? error.message : String(error)],
        };
        input.onProgress?.({ page, index, total: ordered.length, phase: 'kept-baseline' });
      }
    });
    commitChain = run;
    await run;
  };

  // Home first (it establishes the site's visual language), then the rest
  // in parallel with bounded concurrency.
  if (ordered.length > 0) await authorOne(ordered[0], 0);
  const concurrency = Math.max(1, input.concurrency ?? 3);
  let cursor = 1;
  const worker = async () => {
    while (cursor < ordered.length) {
      const index = cursor++;
      await authorOne(ordered[index], index);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(0, ordered.length - 1)) }, worker));
  outcomes.push(...outcomeSlots.filter((o): o is PageAuthoringOutcome => Boolean(o)));
  return { files, revisionId, outcomes };
}

/** Provenance: the committed page carries a verifiable AI-authorship header. */
export function stampAuthoredPage(
  files: Record<string, string>,
  page: { filePath: string; role: string },
  fingerprint: string | undefined,
): Record<string, string> {
  const source = files[page.filePath];
  if (typeof source !== 'string') return files;
  const body = source.replace(/^\/\/ @unison-ai-authored[^\n]*\n/, '');
  const header = `${AI_AUTHORED_MARKER} role=${page.role} design=${fingerprint ?? 'unknown'}\n`;
  return { ...files, [page.filePath]: header + body };
}
