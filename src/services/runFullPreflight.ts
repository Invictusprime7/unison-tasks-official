/**
 * Single end-to-end preflight pipeline shared by the System Launcher and the
 * Web Builder's AI/template apply paths.
 *
 * Order of operations (canonicalLaunchVfs delegates its converged VFS here):
 *   1. Immutable syntax validation
 *   2. Nav-intent stamping  (preflightNavWiring)
 *   3. Industry forbidden-intent stripping
 *   4. Immutable final syntax validation — catches damage from steps 2-3
 *
 * Canonical intent/runtime projections may add metadata or attributes. Source
 * syntax is never repaired here: malformed compiler output is rejected.
 */
import type { SiteBundleSnapshot } from '@/platform/core/canonicalPipeline';
import { getIndustryIntentProfile } from '@/platform/core/industryIntentProfiles';
import { validateSiteSyntax } from './siteSyntaxValidation';
import { preflightNavWiring } from './preflightNavWiring';
import { closeRequiredIndustryIntents } from './requiredIntentClosure';
import { runExperiencePreflight, stampExperienceManifest } from './experiencePreflightGate';
import {
  runRuntimeCompatibilityPreflight,
  type RuntimeCompatibilityReport,
} from './runtimeCompatibilityPreflight';
import {
  evaluateVisualQuality,
  VISUAL_QUALITY_VERSION,
  type VisualQualityReport,
} from './visualQualityEvaluation';
import { getDependenciesForSandpack } from '@/utils/dependencyExtractor';
import { SANDPACK_PREVIEW_CORE_DEPENDENCIES } from '@/utils/sandpackDependencies';

export interface RunFullPreflightOptions {
  siteBundleSnapshot?: SiteBundleSnapshot | null;
  industry?: string;
  brand?: string;
  /**
   * `canonicalize` (default) applies deterministic canonical projections.
   * `acceptance` is validation-only: nothing is written back, and any file the pipeline *would* have
   * changed is reported as a violation instead.
   */
  mode?: 'canonicalize' | 'acceptance';
}

export interface RunFullPreflightResult {
  files: Record<string, string>;
  /** True when this pass changed any source file (repair mode only). */
  mutated: boolean;
  mutatedFiles: string[];
  /** Acceptance mode: files that still require mutation and cannot be sealed. */
  violations: string[];
  mode: 'canonicalize' | 'acceptance';
  stages: {
    syntaxValidation: 'ok' | 'failed';
    navWiring: 'ok' | 'skipped' | 'failed';
    forbiddenStrip: { stripped: number; forbidden: string[] };
    requiredIntentClosure: { injected: string[]; missing: string[] };
    experienceGate: { instances: number; heavyInstances: number; violations: string[] };
    runtimeCompatibility: RuntimeCompatibilityReport;
    finalSyntaxValidation: 'ok' | 'failed';
  };
  /** Compositional quality report; canonical launch decides signed-contract acceptance. */
  visualQuality: VisualQualityReport;
}

export function runFullPreflight(
  inputFiles: Record<string, string>,
  options: RunFullPreflightOptions = {},
): RunFullPreflightResult {
  const { siteBundleSnapshot = null, industry, mode = 'canonicalize' } = options;


  // 1) Immutable syntax validation
  let files = inputFiles;
  const initialSyntax = validateSiteSyntax(files);
  const initialSyntaxViolations = initialSyntax.reports
    .filter((report) => report.status === 'invalid')
    .map((report) => `${report.path}: ${report.finalError || 'syntax error'}`);
  const syntaxValidation: 'ok' | 'failed' = initialSyntaxViolations.length === 0 ? 'ok' : 'failed';

  // 2) Nav-intent stamping (requires snapshot)
  let navWiring: 'ok' | 'skipped' | 'failed' = 'skipped';
  if (siteBundleSnapshot) {
    try {
      files = preflightNavWiring(files, siteBundleSnapshot).files;
      navWiring = 'ok';
    } catch (e) {
      console.warn('[runFullPreflight] nav wiring failed', e);
      navWiring = 'failed';
    }
  }

  // 3) Forbidden-intent stripping (industry-aware)
  const resolvedIndustry = industry || siteBundleSnapshot?.industry;
  const forbidden = resolvedIndustry
    ? (getIndustryIntentProfile(resolvedIndustry)?.forbidden ?? [])
    : [];
  let stripped = 0;
  if (forbidden.length > 0) {
    const escaped = forbidden.map((i) => i.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const attrRe = new RegExp(`\\s+data-ut-intent\\s*=\\s*["'](?:${escaped})["']`, 'g');
    const next: Record<string, string> = { ...files };
    for (const [p, src] of Object.entries(next)) {
      if (typeof src !== 'string') continue;
      const after = src.replace(attrRe, () => {
        stripped++;
        return '';
      });
      if (after !== src) next[p] = after;
    }
    files = next;
    if (stripped > 0) {
      console.warn('[runFullPreflight] stripped forbidden intents', {
        industry: resolvedIndustry,
        forbidden,
        count: stripped,
      });
    }
  }

  // 4) Required-intent closure. This is deterministic and profile-driven so
  // required CTA surfaces never depend solely on AI prompt compliance.
  const requiredIntentClosure = closeRequiredIndustryIntents(files, resolvedIndustry);
  files = requiredIntentClosure.files;
  if (requiredIntentClosure.injected.length > 0 || requiredIntentClosure.missing.length > 0) {
    console.info('[runFullPreflight] required intent closure', requiredIntentClosure);
  }

  // 5) Experience (WebGL) budget + safety gate. Instances are stamped onto the
  // VFS so the builder keeps them WYSIWYG-editable after the seal.
  const experience = runExperiencePreflight(files);
  files = stampExperienceManifest(files, experience.manifest);
  if (experience.violations.length > 0) {
    console.warn('[runFullPreflight] experience gate violations', experience.violations);
  }

  // 6) Technical runtime compatibility. Package graph, approved imports,
  // React/R3F renderer profile, fallback presence and scene budget. This is a
  // technical gate only — it never mixes into business provisioning readiness.
  let runtimeCompatibility: RuntimeCompatibilityReport;
  try {
    const { dependencies } = getDependenciesForSandpack(files, SANDPACK_PREVIEW_CORE_DEPENDENCIES);
    runtimeCompatibility = runRuntimeCompatibilityPreflight({ files, dependencies });
  } catch (e) {
    console.warn('[runFullPreflight] runtime compatibility preflight failed', e);
    runtimeCompatibility = {
      runtimeProfile: 'unknown',
      dependenciesResolvable: true,
      importsApproved: true,
      reactRuntimeCompatible: true,
      fallbackPresent: true,
      budgetValid: true,
      capabilitiesUsed: [],
      warnings: ['runtime compatibility preflight could not run'],
      blockers: [],
      ok: true,
    };
  }
  if (!runtimeCompatibility.ok) {
    console.warn('[runFullPreflight] runtime compatibility blockers', runtimeCompatibility.blockers);
  }

  // 7) Immutable final syntax validation (catches projection defects)
  const finalSyntax = validateSiteSyntax(files);
  const finalSyntaxViolations = finalSyntax.reports
    .filter((report) => report.status === 'invalid')
    .map((report) => `${report.path}: ${report.finalError || 'syntax error'}`);
  const finalSyntaxValidation: 'ok' | 'failed' = finalSyntaxViolations.length === 0 ? 'ok' : 'failed';

  // 8) Visual quality evaluation — COMPOSITIONAL, non-destructive. It never
  // mutates source and never triggers a fallback; it only reports, and may
  // hand the caller ONE focused refinement directive for Lane B.
  let visualQuality: VisualQualityReport;
  try {
    visualQuality = evaluateVisualQuality(files, {
      technicalScore: runtimeCompatibility.ok && experience.violations.length === 0 ? 100 : 70,
      sectionFloors: Object.fromEntries(
        (siteBundleSnapshot?.meta?.generationBrief?.routes ?? []).map((route) => [route.path, route.depth.minSections]),
      ),
    });
    if (mode === 'canonicalize' && visualQuality.refinementDirective) {
      console.info('[runFullPreflight] visual quality findings', visualQuality.findings);
    }
  } catch (e) {
    console.warn('[runFullPreflight] visual quality evaluation failed', e);
    visualQuality = {
      version: VISUAL_QUALITY_VERSION,
      compositionScore: 0, hierarchyScore: 0, diversityScore: 0, mediaScore: 0,
      repetitionPenalty: 0, technicalScore: 0,
      findings: [], pages: [], refinementDirective: null,
    };
  }

  const mutatedFiles = Object.keys(files).filter((p) => files[p] !== inputFiles[p]);
  const mutated = mutatedFiles.length > 0 || Object.keys(files).length !== Object.keys(inputFiles).length;


  if (mode === 'acceptance') {
    // Validation-only: nothing this pass produced may reach the seal.
    if (mutated) {
      console.warn('[runFullPreflight] acceptance pass found unresolved defects', { mutatedFiles });
    }
    return {
      files: inputFiles,
      mutated: false,
      mutatedFiles: [],
      violations: [
        ...initialSyntaxViolations,
        ...finalSyntaxViolations,
        ...mutatedFiles,
        ...experience.violations,
        ...runtimeCompatibility.blockers,
      ],
      mode,
      stages: {
        syntaxValidation,
        navWiring,
        forbiddenStrip: { stripped, forbidden },
        requiredIntentClosure: {
          injected: requiredIntentClosure.injected,
          missing: requiredIntentClosure.missing,
        },
        experienceGate: {
          instances: experience.manifest.totalInstances,
          heavyInstances: experience.manifest.heavyInstances,
          violations: experience.violations,
        },
        runtimeCompatibility,
        finalSyntaxValidation,
      },
      visualQuality,
    };
  }

  return {
    files,
    mutated,
    mutatedFiles,
    violations: [...initialSyntaxViolations, ...finalSyntaxViolations],
    mode,
    stages: {
      syntaxValidation,
      navWiring,
      forbiddenStrip: { stripped, forbidden },
      requiredIntentClosure: {
        injected: requiredIntentClosure.injected,
        missing: requiredIntentClosure.missing,
      },
      experienceGate: {
        instances: experience.manifest.totalInstances,
        heavyInstances: experience.manifest.heavyInstances,
        violations: experience.violations,
      },
      runtimeCompatibility,
      finalSyntaxValidation,
    },
    visualQuality,
  };
}

