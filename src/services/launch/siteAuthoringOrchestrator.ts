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
import { selectSourceKnowledge } from '@/services/builder/sourceKnowledgeContext';
import { appendDesignKnowledge } from '@/services/knowledge/designKnowledge';
import { runComposerRepairLoop, type ComposerInvoke, type ComposerStopReason } from '@/services/builder/aiRepairLoop';
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
  files: Record<string, string>;
  revisionId?: string | null;
  commitPage: (nextFiles: Record<string, string>, page: AuthoringPage, beforeFiles: Record<string, string>) =>
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
  const compositionPlan = planSiteComposition(
    input.designContext?.contract.industry ?? 'generic',
    ordered.map((p) => ({ pageId: p.pageId, role: p.role })),
    input.designContext?.fingerprint ?? input.businessName,
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
    const buildRequest = (redundancy: RedundancyIssue | null): AIComposerRequest => ({
      task: 'site_page_author',
      page: { role: page.role, title: page.title, route: page.route, filePath: page.filePath },
      brief: appendDesignKnowledge([
        renderPageBrief(input.designContext, page, input.businessName, establishedLanguage),
        renderCompositionBrief(planned, visualMemory.entries(), redundancy),
      ].filter(Boolean).join('\n').slice(0, 6500), `${input.businessName} ${page.role} ${page.title} ${page.route}`),
      files: selectPageContextFiles(baseFiles, page),
      routes,
      priorPages: priorPages.slice(-20),
    });
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
    });
    let loop = await runLoop(buildRequest(null));
    // Redundancy check: one targeted recomposition when this page repeats another page's topology.
    if (loop.ok && loop.prepared && now() < deadline) {
      const issue = findRedundancy(page.pageId, extractCompositionSignature(loop.prepared.nextFiles[page.filePath]), visualMemory.entries());
      if (issue) {
        const retry = await runLoop(buildRequest(issue));
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
        // so pages authored in parallel never overwrite each other.
        const candidate = stampAuthoredPage(prepared.nextFiles, page, input.designContext?.fingerprint);
        const nextFiles: Record<string, string> = { ...files };
        for (const [path, content] of Object.entries(candidate)) {
          if (baseFiles[path] !== content) nextFiles[path] = content;
        }
        for (const path of Object.keys(baseFiles)) {
          if (!(path in candidate)) delete nextFiles[path];
        }
        const committed = await input.commitPage(nextFiles, page, files);
        files = committed.files;
        visualMemory.record(page.pageId, page.role, extractCompositionSignature(files[page.filePath]));
        if (page.pageId === input.homePageId || page.route === '/') {
          establishedLanguage = extractHomepageVisualLanguage(files[page.filePath], page.pageId);
        }
        revisionId = committed.revisionId ?? revisionId;
        const summary = loop.response?.summary ?? '';
        priorPages.push({ role: page.role, summary: summary.slice(0, 2000) });
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
