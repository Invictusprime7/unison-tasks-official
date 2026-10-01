/** Candidate-only, mutation-free site-wide closure checks for App Builder. */

import {
  findLocalJsxImportContractViolations,
  findUnresolvedLocalImports,
} from '@/services/laneBCompanionModules';
import {
  createSiteVisualMemory,
  extractCompositionSignature,
  findRedundancy,
} from '@/services/composition';
import { enforceSiteDesignContract } from '@/services/launch/homepageFirstContract';
import { assertSiteShellClosure, buildSiteShellTopology } from '@/services/siteShellTopology';
import type {
  AppBuildCandidateClosureIssue,
  AppBuildCandidateClosureReport,
  AppBuildContract,
} from './appBuilderContracts';

function stableSourceHash(files: Readonly<Record<string, string>>): string {
  let hash = 0x811c9dc5;
  for (const path of Object.keys(files).sort()) {
    const value = `${path}\0${files[path]}\0`;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
  }
  return `fnv1a:${hash.toString(16).padStart(8, '0')}`;
}

function isProtected(path: string, protectedPaths: readonly string[]): boolean {
  return protectedPaths.some((protectedPath) =>
    path === protectedPath || path.startsWith(`${protectedPath.replace(/\/$/, '')}/`));
}

export function validateAppBuildCandidate(input: {
  contract: AppBuildContract;
  files: Readonly<Record<string, string>>;
  initialFiles: Readonly<Record<string, string>>;
}): AppBuildCandidateClosureReport {
  const files = { ...input.files };
  const issues: AppBuildCandidateClosureIssue[] = [];
  const pages = input.contract.topology.sitePlan.pages;

  for (const page of pages) {
    if (!files[page.filePath]?.trim()) {
      issues.push({
        severity: 'blocker',
        code: 'page-body-missing',
        path: page.filePath,
        message: `${page.title} has no authored candidate source at ${page.filePath}.`,
      });
    }
  }

  const allPaths = new Set([...Object.keys(input.initialFiles), ...Object.keys(files)]);
  for (const path of allPaths) {
    if (!isProtected(path, input.contract.runtime.protectedPaths)) continue;
    if (input.initialFiles[path] !== files[path]) {
      issues.push({
        severity: 'blocker',
        code: 'protected-source-changed',
        path,
        message: `${path} is canonical infrastructure and changed inside the application candidate.`,
      });
    }
  }

  for (const unresolved of findUnresolvedLocalImports(files)) {
    issues.push({
      severity: 'blocker',
      code: 'module-closure-unresolved-import',
      path: unresolved.filePath,
      message: `${unresolved.filePath} imports unresolved module "${unresolved.importPath}".`,
    });
  }
  for (const violation of findLocalJsxImportContractViolations(files)) {
    issues.push({
      severity: 'blocker',
      code: `module-closure-${violation.kind}`,
      path: violation.filePath,
      message: `${violation.filePath} imports ${violation.symbol} from ${violation.importPath}, but that export is unavailable.`,
    });
  }

  const registry = input.contract.topology.pageRegistry;
  if (Object.keys(registry.pages).length > 0) {
    const pageSources = Object.fromEntries(
      pages.filter((page) => files[page.filePath]).map((page) => [page.filePath, files[page.filePath]]),
    );
    const routerSource = files['/src/App.tsx'] ?? '';
    const parsedRoutes = Array.from(routerSource.matchAll(/path=["']([^"']+)["']/g)).map((match) => match[1]);
    const shellIssues = assertSiteShellClosure(buildSiteShellTopology(registry), {
      pageSources,
      routerRoutes: parsedRoutes.length ? parsedRoutes : undefined,
    });
    for (const issue of shellIssues) {
      issues.push({
        severity: issue.code === 'missing-nav-link' ? 'advisory' : 'blocker',
        code: `site-shell-${issue.code}`,
        path: issue.path,
        message: issue.message,
      });
    }
  }

  const home = pages.find((page) => page.isHome || page.id === input.contract.topology.sitePlan.homePageId);
  const affinity = enforceSiteDesignContract({ files, homePath: home?.filePath });
  for (const message of affinity.violations) {
    issues.push({ severity: 'blocker', code: 'site-design-affinity', message });
  }
  for (const message of affinity.advisories) {
    issues.push({ severity: 'advisory', code: 'site-design-advisory', message });
  }

  const memory = createSiteVisualMemory();
  for (const page of pages) {
    const signature = extractCompositionSignature(files[page.filePath]);
    const redundant = findRedundancy(page.id, signature, memory.entries());
    if (redundant) {
      issues.push({
        severity: 'blocker',
        code: 'site-composition-redundant',
        path: page.filePath,
        message: redundant.reason,
      });
    }
    memory.record(page.id, page.role, signature);
  }

  return {
    version: '1.0',
    ok: !issues.some((issue) => issue.severity === 'blocker'),
    sourceHash: stableSourceHash(files),
    issues,
  };
}

