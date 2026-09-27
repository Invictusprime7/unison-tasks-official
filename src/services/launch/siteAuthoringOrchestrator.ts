/**
 * Site authoring orchestrator (milestone §3, §18, §19, §30).
 *
 * Page-by-page AI authoring on top of the committed deterministic substrate:
 *
 *   for each page (Home first, then route order):
 *     build page brief from ResolvedSiteDesignContext
 *     composer repair loop (candidate + blocking gates, max 3)
 *     accepted -> caller commits through the single legal writer
 *     rejected -> page keeps its last-known-good committed version
 *
 * Owns no writer, no VFS, no snapshot. `commitPage` is supplied by the caller
 * (launch orchestrator / Builder) and must go through commitMutation.
 */

import type { ResolvedSiteDesignContext } from '@/services/launch/resolvedSiteDesignContext';
import { projectSiteDesignContract } from '@/services/launch/siteDesignContract';
import type { AIComposerRequest } from '@/contracts/aiComposerContract';
import { resolveLocalImport } from '@/services/builder/aiCandidateGates';
import { runComposerRepairLoop, type ComposerInvoke, type ComposerStopReason } from '@/services/builder/aiRepairLoop';

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
  signal?: AbortSignal;
  invoke?: ComposerInvoke;
  now?: () => number;
}

export interface SiteAuthoringResult {
  files: Record<string, string>;
  revisionId?: string | null;
  outcomes: PageAuthoringOutcome[];
}

const SHARED_CHROME_DIR = '/src/project-components/site/';
const CONTEXT_BUDGET = 120_000;

/** Deterministic order: home first, then by route. */
export function orderAuthoringPages(pages: AuthoringPage[], homePageId?: string): AuthoringPage[] {
  return [...pages].sort((a, b) => {
    const ah = a.pageId === homePageId || a.route === '/' ? 0 : 1;
    const bh = b.pageId === homePageId || b.route === '/' ? 0 : 1;
    return ah - bh || a.route.localeCompare(b.route) || a.pageId.localeCompare(b.pageId);
  });
}

export function renderPageBrief(ctx: ResolvedSiteDesignContext | null, page: AuthoringPage, businessName: string): string {
  const lines = [`BUSINESS: ${businessName}`, `PAGE ROLE: ${page.role}`];
  if (!ctx) return lines.join('\n');
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
    `DESIGN FINGERPRINT: ${ctx.fingerprint}`,
  );
  return lines.filter(Boolean).join('\n');
}

/** Target page + shared chrome + its direct local imports, within a size budget. */
export function selectPageContextFiles(files: Record<string, string>, page: AuthoringPage): Record<string, string> {
  const picked: Record<string, string> = {};
  let size = 0;
  const add = (path: string) => {
    if (picked[path] !== undefined || files[path] === undefined) return;
    if (size + files[path].length > CONTEXT_BUDGET) return;
    picked[path] = files[path];
    size += files[path].length;
  };
  add(page.filePath);
  Object.keys(files).filter((p) => p.startsWith(SHARED_CHROME_DIR)).sort().forEach(add);
  const re = /from\s*['"]([^'"]+)['"]/g;
  for (const m of (files[page.filePath] ?? '').matchAll(re)) {
    const hit = resolveLocalImport(page.filePath, m[1], files);
    if (hit && !hit.startsWith('/src/unison/')) add(hit);
  }
  return picked;
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

  for (const [index, page] of ordered.entries()) {
    if (paused || input.signal?.aborted) {
      outcomes.push({ page, status: 'skipped', reason: 'paused', attempts: 0, errors: [] });
      continue;
    }
    if (now() >= deadline) {
      outcomes.push({ page, status: 'kept-baseline', reason: 'budget', attempts: 0, errors: ['Time budget reached.'] });
      input.onProgress?.({ page, index, total: ordered.length, phase: 'kept-baseline' });
      continue;
    }
    input.onProgress?.({ page, index, total: ordered.length, phase: 'authoring' });
    const request: AIComposerRequest = {
      task: 'site_page_author',
      page: { role: page.role, title: page.title, route: page.route, filePath: page.filePath },
      brief: renderPageBrief(input.designContext, page, input.businessName).slice(0, 12000),
      files: selectPageContextFiles(files, page),
      routes,
      priorPages: priorPages.slice(-20),
    };
    const loop = await runComposerRepairLoop({
      request,
      baseFiles: files,
      baseRevisionId: revisionId ?? undefined,
      preflight: input.preflight,
      signal: input.signal,
      timeoutMs: Math.max(15_000, Math.min(130_000, deadline - now())),
      invoke: input.invoke,
    });
    if (loop.reason === 'credits' || loop.reason === 'denied') paused = loop.reason;

    if (!loop.ok || !loop.prepared) {
      outcomes.push({ page, status: 'kept-baseline', reason: loop.reason, attempts: loop.attempts, errors: loop.errors });
      input.onProgress?.({ page, index, total: ordered.length, phase: 'kept-baseline' });
      continue;
    }
    try {
      const committed = await input.commitPage(loop.prepared.nextFiles, page, files);
      files = committed.files;
      revisionId = committed.revisionId ?? revisionId;
      const summary = loop.response?.summary ?? '';
      priorPages.push({ role: page.role, summary: summary.slice(0, 2000) });
      outcomes.push({ page, status: 'authored', reason: 'accepted', attempts: loop.attempts, summary, errors: [], revisionId: committed.revisionId });
      input.onProgress?.({ page, index, total: ordered.length, phase: 'committed' });
    } catch (error) {
      outcomes.push({
        page, status: 'kept-baseline', reason: 'commit_failed', attempts: loop.attempts,
        errors: [error instanceof Error ? error.message : String(error)],
      });
      input.onProgress?.({ page, index, total: ordered.length, phase: 'kept-baseline' });
    }
  }
  return { files, revisionId, outcomes };
}
