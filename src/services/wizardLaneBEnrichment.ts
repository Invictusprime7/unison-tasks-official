import { tryParse } from './aiSitePreflightRepair';
import { runBuilderTurn } from './builderBrainClient';
import { buildLaneBVfsContext, LANE_B_WALL_CLOCK_BUDGET_MS } from './laneBBatchPlanner';
import type { AIPageCompositionPlan } from '@/sections/aiPageComposition';
import { collectResolvedCompositions } from '@/platform/core/resolvedComposition';
/**
 * Lane B Canonical Enrichment — AI-authored candidate page-body patches.
 *
 * Guidebook contract (section 4 & 15):
 *   AI receives bounded canonical context and a deterministic page body.
 *   AI proposes a candidate enrichment (TSX page-body replacement).
 *   Candidate is validated against protected-path, registry, import, and
 *   canonical-merge rules. Only after validation and acceptance does the
 *   candidate become canonical via commitMutation.
 *
 * AI output is never immediately canonical. All candidates must survive
 * validation and canonical merge before commit.
 */

import type { SiteBundleSnapshot } from '@/platform/core/canonicalPipeline';
import type { WizardSelections } from '@/types/playground';
import type { WizardDesignIntervention } from '@/services/wizardDesignIntervention';
import { z } from 'zod';
import {
  buildGeneratedUiFoundationDirective,
  readGeneratedUiManifest,
  validateGeneratedUiContract,
  type GeneratedMotionExports,
} from '@/platform/core/generatedUiFoundation';
import { buildDesignVocabularyReport } from '@/services/designImplementationRegistry';
import {
  LANE_B_ALWAYS_ALLOWED_PACKAGES,
  LANE_B_GLOBAL_STYLE_PATTERN,
  LANE_B_LITERAL_STYLE_PATTERN,
  LANE_B_PALETTE_LITERAL_PATTERN,
  normalizeLaneBProposal,
  renderLaneBCanonicalContract,
} from '@/services/launch/laneBCanonicalContract';
import type { WizardAggregatedRegistryContext } from '@/services/launch/wizardRegistryAggregation';


/** The exact registry projection used by the production enrichment request. */
export function buildWizardLaneBRegistryContext(
  snapshot: Pick<SiteBundleSnapshot, 'vfsFiles' | 'meta'>,
  registry: Pick<WizardAggregatedRegistryContext, 'sections' | 'implementations' | 'assets' | 'runtimeDependencies' | 'primitiveFamilies' | 'capabilityRequirements'>,
) {
  const uiFoundationManifest = readGeneratedUiManifest(snapshot.vfsFiles);
  if (!uiFoundationManifest) throw new Error('Cannot enrich a snapshot without its UI foundation manifest.');
  const resolvedSections = Object.values(collectResolvedCompositions(snapshot.vfsFiles)).flatMap(page => page.sections);
  const resolvedTypes = new Set(resolvedSections.map(section => section.semanticType));
  const selectedIds = resolvedSections.length
    ? resolvedSections.flatMap(section => section.variantId ? [section.variantId] : [])
    : Object.values(snapshot.meta.designIntervention?.activeVariants ?? {});
  return {
    implementationContext: (registry.implementations ?? []).filter(implementation =>
      !resolvedTypes.size || resolvedTypes.has(implementation.sectionType)),
    assetContext: registry.assets ?? [],
    runtimeDependencies: registry.runtimeDependencies ?? {},
    primitiveFamilies: registry.primitiveFamilies ?? [],
    capabilityRequirements: registry.capabilityRequirements ?? [],
    uiFoundationManifest,
    uiFoundationDirective: buildGeneratedUiFoundationDirective(uiFoundationManifest),
    designVocabularyReport: buildDesignVocabularyReport({
      eligibleImplementationIds: registry.sections.flatMap((section) => section.allowedVariantIds),
      selectedImplementationIds: selectedIds,
    }),
  };
}

/** Decode the shared Builder response before validating its candidate proposal. */
export function decodeWizardLaneBProposal(response: unknown): WizardLaneBEnrichmentProposal | null {
  let candidate = response;
  if (candidate && typeof candidate === 'object' && 'content' in candidate) {
    candidate = (candidate as { content: unknown }).content;
  }
  if (typeof candidate === 'string') {
    try {
      candidate = JSON.parse(candidate.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
    } catch { return null; }
  }
  const parsed = laneBProposalSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

const laneBProposalSchema = z.object({
  version: z.literal('1.0'),
  wizardSeedId: z.string().min(1),
  snapshotId: z.string().min(1),
  designRegistrySignature: z.string().min(1),
  fileOps: z.array(z.object({
    type: z.literal('replace'),
    path: z.string().min(1),
    content: z.string().min(1),
  })).min(1),
  metadata: z.object({
    designApproach: z.string().optional(),
    motionStrategy: z.string().optional(),
    geometryReasoning: z.string().optional(),
  }).optional(),
});

/**
 * Enumerated Lane B enrichment status.
 */
export type LaneBEnrichmentStatus =
  | 'idle'
  | 'requesting'
  | 'received'
  | 'validating'
  | 'valid'
  | 'invalid'
  | 'accepted'
  | 'failed'
  | 'timeout';

/**
 * A single file operation in a Lane B proposal. Initially supports replace-only
 * on registered page paths. Future phases may add create/delete under an
 * explicit generated namespace.
 */
export interface LaneBFileOp {
  type: 'replace';
  /** Absolute path matching a registered page file in the snapshot. */
  path: string;
  /** New TSX content. Must be parseable and meet canonical contracts. */
  content: string;
}

/**
 * The request sent to Lane B (AI enrichment mode) from launchOrchestrator.
 *
 * Includes canonical context: wizard identity, design intervention, current
 * stage 4b snapshot, registry inventory, UI foundation contract, and binding guide.
 * Excludes direct business logic or persistence state.
 */
export interface WizardLaneBEnrichmentRequest {
  /** Validated planner decisions; bounded context, never VFS authority. */
  compositionPlan?: AIPageCompositionPlan;
  version: '1.0';

  /** Wizard/launch identity. */
  wizardSeedId: string;
  businessName: string;
  industryOverlay: string;
  primaryGoal: string;
  selectedPages: string[];
  selectedTemplateId: string;
  selectedThemeId: string;

  /** Canonical snapshot identity and registry state. */
  snapshotId: string;
  designRegistrySignature: string;

  /** The Design Contract V2 object with active variants, budget, brief, etc. */
  designIntervention: WizardDesignIntervention;

  /** Current canonical page registry with file paths and required intents. */
  pageRegistry: Array<{
    id: string;
    filePath: string;
    route: string;
    title: string;
    requiredIntents: string[];
  }>;

  /** Current Stage 4b page sources — Lane B enriches these, not the template. */
  currentPageSources: Record<
    string,
    {
      filePath: string;
      content: string;
    }
  >;

  /** The manifest-derived UI foundation contract — exact imports + requirements. */
  uiFoundationDirective: string;
  themeContractDirective?: string;

  /** Design vocabulary and implementation registry status. */
  implementationContext?: WizardAggregatedRegistryContext['implementations'];
  assetContext?: WizardAggregatedRegistryContext['assets'];
  runtimeDependencies?: WizardAggregatedRegistryContext['runtimeDependencies'];
  primitiveFamilies?: WizardAggregatedRegistryContext['primitiveFamilies'];
  capabilityRequirements?: WizardAggregatedRegistryContext['capabilityRequirements'];
  designVocabularyReport: {
    executableIds: string[];
    unimplementedIds: string[];
    globalExecutableIds?: string[];
    selectedIds?: string[];
  };

  /** Intent and binding guidance. */
  intentBindingGuide: string;

  /**
   * The canonical validation contract rendered from the same constants the
   * validator asserts. Injected per batch by enrichWizardPageBatch so the model
   * and the validator can never disagree about the rules.
   */
  canonicalContract?: string;
}


/**
 * The response from Lane B — a candidate enrichment proposal that must survive
 * validation before canonical acceptance.
 */
export interface WizardLaneBEnrichmentProposal {
  version: '1.0';

  /** Must match request identity exactly. */
  wizardSeedId: string;
  snapshotId: string;
  designRegistrySignature: string;

  /** One or more candidate file replacements. Initially page-body only. */
  fileOps: LaneBFileOp[];

  /** Optional metadata from enrichment reasoning. */
  metadata?: {
    designApproach?: string;
    motionStrategy?: string;
    geometryReasoning?: string;
  };
}

/**
 * Validation result for a Lane B proposal. Failure reasons are enumerated
 * for deterministic debugging.
 */
export interface LaneBEnrichmentValidationResult {
  valid: boolean;
  violations: string[];
  details?: Record<string, unknown>;
}

/**
 * Protected file paths that Lane B may never target. These paths are canonical
 * infrastructure and must always win in canonical merge.
 */
export const WIZARD_LANE_B_PROTECTED_PATHS = new Set([
  '/src/App.tsx',
  '/src/main.tsx',
  '/src/index.css',
  '/src/index.tsx',
  '/src/vite-env.d.ts',
  '/.unison',
  '/src/unison',
  '/package.json',
  '/vite.config.ts',
  '/tsconfig.json',
  '/tsconfig.app.json',
  '/tailwind.config.ts',
  '/postcss.config.js',
  '/eslint.config.js',
  '/vitest.config.ts',
]);

/**
 * Validate a Lane B enrichment proposal against the canonical contract.
 *
 * Checks in order (section 15):
 * 1. schema/version
 * 2. wizard seed ID equality
 * 3. snapshot ID equality
 * 4. registry signature equality
 * 5. only registered page file paths targeted
 * 6. no protected file path
 * 7. exactly one replacement per targeted page
 * 8. parseable TSX
 * 9. import contract satisfied
 * 10. theme token compliance
 * 11. required page identity remains intact
 * 12. required intents remain reachable
 * 13. one H1 per page
 * 14. canonical merge safety (protected files win)
 * 15. strict final preflight
 *
 * Returns a full validation result; caller decides whether to accept or discard.
 */
export function validateWizardLaneBProposal(options: {
  proposal: unknown;
  request: WizardLaneBEnrichmentRequest;
  uiFoundationManifest: {
    primitiveImports: readonly string[];
    requirements: readonly string[];
    motionExports?: GeneratedMotionExports;
  };
}): LaneBEnrichmentValidationResult {
  const violations: string[] = [];

  // Validate untrusted provider output before inspecting identities or file ops.
  const parsed = laneBProposalSchema.safeParse(options.proposal);
  if (!parsed.success) {
    return {
      valid: false,
      violations: parsed.error.issues.map((issue) =>
        `Invalid proposal at ${issue.path.join('.') || 'root'}: ${issue.message}`),
    };
  }
  const proposal = parsed.data;

  // 2. Wizard seed ID equality
  if (proposal.wizardSeedId !== options.request.wizardSeedId) {
    violations.push(
      `Wizard seed mismatch: proposal has ${proposal.wizardSeedId}, expected ${options.request.wizardSeedId}.`,
    );
  }

  // 3. Snapshot ID equality
  if (proposal.snapshotId !== options.request.snapshotId) {
    violations.push(
      `Snapshot mismatch: proposal has ${proposal.snapshotId}, expected ${options.request.snapshotId}.`,
    );
  }

  // 4. Registry signature equality
  if (proposal.designRegistrySignature !== options.request.designRegistrySignature) {
    violations.push(
      `Registry signature mismatch: proposal was built against a different design registry state.`,
    );
  }

  // Build allowed target paths from request registry
  const allowedPagePaths = new Set(
    options.request.pageRegistry.map((p) => p.filePath),
  );

  // 5, 6, 7: Path validation and protected file check
  const filePathCounts = new Map<string, number>();
  for (const op of proposal.fileOps) {
    const count = filePathCounts.get(op.path) || 0;
    filePathCounts.set(op.path, count + 1);

    // Check protected paths
    if (
      WIZARD_LANE_B_PROTECTED_PATHS.has(op.path) ||
      WIZARD_LANE_B_PROTECTED_PATHS.has(op.path.split('/').slice(0, -1).join('/')) ||
      op.path.startsWith('/.unison') ||
      op.path.startsWith('/src/unison')
    ) {
      violations.push(
        `Cannot target protected path: ${op.path}. Lane B may only enrich registered page files.`,
      );
    }

    // Check registered page paths
    if (!allowedPagePaths.has(op.path)) {
      violations.push(
        `Path ${op.path} is not a registered page file. Allowed: ${Array.from(allowedPagePaths).join(', ')}.`,
      );
    }

    // Check for duplicate replacements
    if (count > 0) {
      violations.push(
        `Duplicate file operation for ${op.path}. Lane B may not replace the same file twice.`,
      );
    }
  }

  // Reuse canonical preflight parsing; modern JSX does not require a React import.
  for (const op of proposal.fileOps) {
    const parsedSource = tryParse(op.content);
    if (parsedSource.ok === false) violations.push('File ' + op.path + ' is not valid TSX: ' + parsedSource.error);
  }

  // 9. Import contract check
  const foundationCheck = validateGeneratedUiContract(
    Object.fromEntries(proposal.fileOps.map((op) => [op.path, op.content])),
    {
      importRoot: '@/unison/ui',
      primitiveImports: [...options.uiFoundationManifest.primitiveImports],
      motionExports: options.uiFoundationManifest.motionExports,
    },
  );
  violations.push(...foundationCheck.violations);
  const allowedImports = new Set(options.uiFoundationManifest.primitiveImports);
  for (const op of proposal.fileOps) {
    // Extract import statements
    const importMatches = op.content.matchAll(/import\s+(?:[^'"\n]*)\s+from\s+['"]([^'"]+)['"]/g);
    for (const match of importMatches) {
      const importPath = match[1];
      // Allow exact matches or subpaths of allowed imports
      const isAllowed =
        allowedImports.has(importPath) ||
        Array.from(allowedImports).some(
          (allowed) =>
            allowed.startsWith('@/unison/ui/radix/') &&
            importPath === allowed,
        );

      if (!isAllowed && importPath.startsWith('@/unison/ui')) {
        violations.push(
          `File ${op.path} imports non-existent path ${importPath}. Allowed @/unison/ui paths: ${Array.from(allowedImports)
            .filter((p) => p.startsWith('@/unison'))
            .join(', ')}.`,
        );
      }
    }
  }

  // 9b. Runtime dependency contract (V4 M9): bare package imports must appear in
  // the canonical registry's allowed runtime dependency list. Generated sites
  // never carry a dependency the launcher did not certify and install.
  const allowedPackages = new Set(Object.keys(options.request.runtimeDependencies ?? {}));
  if (allowedPackages.size) {
    for (const op of proposal.fileOps) {
      for (const match of op.content.matchAll(/(?:^|\n)\s*import\s+(?:[^'"\n]*from\s*)?['"]([^'"]+)['"]/g)) {
        const specifier = match[1];
        if (specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('@/')) continue;
        const packageName = specifier.startsWith('@')
          ? specifier.split('/').slice(0, 2).join('/')
          : specifier.split('/')[0];
        if ((LANE_B_ALWAYS_ALLOWED_PACKAGES as readonly string[]).includes(packageName) || allowedPackages.has(packageName)) continue;
        violations.push(
          `File ${op.path} imports runtime dependency "${packageName}", which is not in the canonical allow-list: ${Array.from(allowedPackages).join(', ')}.`,
        );
      }
    }
  }

  // 9c. Canonical 21st identity contract (M8): an enriched page may restyle a
  // certified section, but it may not invent a variant identity outside the
  // eligible registry vocabulary, and it may not drop the canonical section
  // identities Stage 4b compiled into the page.
  const vocabulary = options.request.designVocabularyReport;
  const eligibleVariantIds = new Set<string>([
    ...(vocabulary?.executableIds ?? []),
    ...(vocabulary?.globalExecutableIds ?? []),
    ...(vocabulary?.selectedIds ?? []),
  ]);
  const readAttribute = (source: string, attribute: string) => new Set(
    Array.from(source.matchAll(new RegExp(`${attribute}="([^"]+)"`, 'g')), match => match[1]),
  );
  for (const op of proposal.fileOps) {
    if (eligibleVariantIds.size) {
      for (const variantId of readAttribute(op.content, 'data-ut-variant')) {
        if (!eligibleVariantIds.has(variantId)) {
          violations.push(
            `File ${op.path} declares variant identity "${variantId}", which is not a certified registry implementation for this launch.`,
          );
        }
      }
    }
    const currentSource = Object.values(options.request.currentPageSources ?? {})
      .find(entry => entry?.filePath === op.path)?.content;
    if (currentSource) {
      const proposedSectionIds = readAttribute(op.content, 'data-ut-section-id');
      for (const sectionId of readAttribute(currentSource, 'data-ut-section-id')) {
        if (!proposedSectionIds.has(sectionId)) {
          violations.push(
            `File ${op.path} drops canonical section identity "${sectionId}". Enrichment may restyle a section but must preserve data-ut-section-id.`,
          );
        }
      }
    }
  }


  // 10. Theme token compliance — the exact patterns published to the model in
  // the canonical contract block (single source of truth, never a prose copy).
  for (const op of proposal.fileOps) {
    if (LANE_B_LITERAL_STYLE_PATTERN.test(op.content)) {
      violations.push('File ' + op.path + ' overrides the selected preset with literal color or font-family styles. Use semantic colors and the supplied font-family tokens; Tailwind weight and scale utilities remain available for page hierarchy.');
    }
    // Local geometry is permitted; palette and global theme ownership remain Stage 4b.
    const hardcodedValues = op.content.match(new RegExp(LANE_B_PALETTE_LITERAL_PATTERN.source, 'g'));
    if (hardcodedValues) {
      violations.push(
        `File ${op.path} contains literal palette values: ${hardcodedValues.join(', ')}. Use Stage 4b tokens (var(--ut-*), --radius) or Tailwind classes instead.`,
      );
    }
  }

  for (const op of proposal.fileOps) {
    if (LANE_B_GLOBAL_STYLE_PATTERN.test(op.content)) {
      violations.push('File ' + op.path + ' declares global theme or document styles. Stage 4b owns these values.');
    }
  }


  // 11. Page identity check
  for (const op of proposal.fileOps) {
    const page = options.request.pageRegistry.find((p) => p.filePath === op.path);
    if (page) {
      // Check that page-level identity markers are preserved
      if (!op.content.includes(`export default`) && !op.content.includes(`export function`)) {
        violations.push(
          `File ${op.path} must export a React component as default for page rendering.`,
        );
      }
    }
  }

  // 12. Intent preservation check
  for (const op of proposal.fileOps) {
    const page = options.request.pageRegistry.find((p) => p.filePath === op.path);
    if (page && page.requiredIntents.length > 0) {
      // Heuristic: check for data-ut-intent attributes
      const intentsInContent = op.content.match(/data-ut-intent="([^"]+)"/g) || [];
      const usedIntents = new Set(
        intentsInContent.map((m) => m.match(/"([^"]+)"/)?.[1]).filter(Boolean),
      );

      for (const intent of page.requiredIntents) {
        if (!usedIntents.has(intent)) {
          violations.push(
            `File ${op.path} is missing required intent binding: ${intent}. Use data-ut-intent="${intent}" on a control.`,
          );
        }
      }
    }
  }

  // 13. Single H1 per page
  for (const op of proposal.fileOps) {
    const h1Count = (op.content.match(/<h1/gi) || []).length;
    if (h1Count !== 1) {
      violations.push(
        `File ${op.path} must have exactly one <h1> element; found ${h1Count}.`,
      );
    }
  }

  // 14, 15: Merge and preflight safety is handled by canonical merge + preflight
  // gates. This validator confirms structural readiness; final approval happens
  // during canonical merge and strict preflight in buildCanonicalLaunchArtifactsAsync.

  return {
    valid: violations.length === 0,
    violations,
    details: violations.length > 0 ? { fileOperationCount: proposal.fileOps.length } : undefined,
  };
}

/**
 * Merge a validated Lane B proposal into the current VFS, preserving canonical
 * infrastructure. This is a safe merge that canonicalLaunchVfs.ts later seals.
 *
 * Protected paths always win; Lane B replacements are applied only to allowed
 * page files.
 */
export function mergeLaneBProposalWithSnapshot(
  snapshot: Record<string, string>,
  proposal: WizardLaneBEnrichmentProposal,
): Record<string, string> {
  const merged = { ...snapshot };

  for (const op of proposal.fileOps) {
    // Double-check: never overwrite protected paths
    if (
      WIZARD_LANE_B_PROTECTED_PATHS.has(op.path) ||
      WIZARD_LANE_B_PROTECTED_PATHS.has(op.path.split('/').slice(0, -1).join('/')) ||
      op.path.startsWith('/.unison') ||
      op.path.startsWith('/src/unison')
    ) {
      continue; // Skip, protected path wins
    }

    if (op.type === 'replace' && op.path in merged) {
      merged[op.path] = op.content;
    }
  }

  return merged;
}

/** One independently accepted batch. Rejection never mutates the compiled baseline. */
export async function enrichWizardPageBatch(options: {
  request: WizardLaneBEnrichmentRequest;
  files: Record<string, string>;
  uiFoundationManifest: Parameters<typeof validateWizardLaneBProposal>[0]['uiFoundationManifest'];
  signal: AbortSignal;
  enabled?: boolean;
  onDegrade?: (code: string, message: string) => void;
}, invoke = runBuilderTurn) {
  const unchanged = { files: options.files, acceptedPaths: [] as string[] };
  options.signal.throwIfAborted();
  if (options.enabled === false) return unchanged;
  const reject = (code: string, message: string) => { options.onDegrade?.(code, message); return unchanged; };
  // The model receives the canonical rule set rendered from the very constants
  // the validator asserts, so a compliant response cannot fail a rule it never saw.
  const request: WizardLaneBEnrichmentRequest = {
    ...options.request,
    canonicalContract: renderLaneBCanonicalContract({
      request: options.request,
      uiFoundationManifest: options.uiFoundationManifest,
      protectedPaths: WIZARD_LANE_B_PROTECTED_PATHS,
    }),
  };
  /** Mechanical envelope defects are repaired deterministically, never rejected. */
  const normalize = (candidate: WizardLaneBEnrichmentProposal) =>
    normalizeLaneBProposal(candidate, options.request, WIZARD_LANE_B_PROTECTED_PATHS);
  try {
    const response = await invoke({
      mode: 'wizard-canonical-enrichment',
      messages: [{ role: 'user', content: JSON.stringify(request) }],
      wizardSeed: { id: options.request.wizardSeedId },
      vfsFiles: buildLaneBVfsContext(options.files),
    }, { timeoutMs: LANE_B_WALL_CLOCK_BUDGET_MS + 5000, signal: options.signal });
    options.signal.throwIfAborted();
    if (response.error || !response.data) {
      const context = (response.error as { context?: { status?: number; body?: string } } | null)?.context;
      let errorType = '';
      try { const body = response.data ?? JSON.parse(context?.body || '{}'); const candidate = (body as { errorType?: unknown }).errorType; if (typeof candidate === 'string' && /^[a-z_]{1,80}$/.test(candidate)) errorType = candidate; } catch { /* Never expose raw response bodies. */ }
      const status = context?.status;
      const reason = status === 401 || status === 403 ? 'authentication' : status === 429 ? 'rate_limited' : status === 400 || status === 413 ? 'request_rejected' : errorType === 'enrichment_contract' || errorType === 'enrichment_identity' ? 'invalid_response' : 'provider';
      return reject('enrich.' + reason, 'AI enrichment failed: ' + reason.replace(/_/g, ' ') + (status ? ' (HTTP ' + status + ')' : '') + (errorType ? ' [' + errorType + ']' : '') + '; the compiled pages were preserved.');
    }
    const decoded = decodeWizardLaneBProposal(response.data);
    if (!decoded) return reject('enrich.invalid_response', 'AI returned an invalid design proposal; the compiled pages were preserved.');
    const proposal = normalize(decoded);
    if (!proposal.fileOps.length) return reject('enrich.invalid_response', 'AI returned no usable page designs; the compiled pages were preserved.');

    /** Validate a single op against the canonical contract; duplicates are never acceptable. */
    const screen = (candidateProposal: WizardLaneBEnrichmentProposal, op: WizardLaneBEnrichmentProposal['fileOps'][number]) => {
      if (candidateProposal.fileOps.filter(other => other.path === op.path).length !== 1) {
        return { valid: false, violations: ['Duplicate file operation for ' + op.path + '.'] };
      }
      return validateWizardLaneBProposal({
        proposal: { ...candidateProposal, fileOps: [op] },
        request: options.request,
        uiFoundationManifest: options.uiFoundationManifest,
      });
    };

    const acceptedOps: WizardLaneBEnrichmentProposal['fileOps'] = [];
    const failures: { path: string; violations: string[] }[] = [];
    for (const op of proposal.fileOps) {
      const verdict = screen(proposal, op);
      if (verdict.valid) acceptedOps.push(op);
      else failures.push({ path: op.path, violations: verdict.violations.slice(0, 6) });
    }

    // One targeted repair round-trip: the model sees the exact canonical
    // violations for the pages it lost and may re-author only those files.
    if (failures.length) {
      options.signal.throwIfAborted();
      try {
        const repairResponse = await invoke({
          mode: 'wizard-canonical-enrichment',
          messages: [
            { role: 'user', content: JSON.stringify(request) },
            { role: 'assistant', content: JSON.stringify(proposal) },
            {
              role: 'user',
              content: JSON.stringify({
                repair: true,
                instruction: 'Your previous proposal failed canonical validation. Return the same proposal envelope with fileOps for ONLY the listed paths, fixing every violation listed below against the CANONICAL VALIDATION CONTRACT in the context record. Keep identity fields (wizardSeedId, snapshotId, designRegistrySignature) unchanged.',
                issues: failures,
              }),
            },
          ],
          wizardSeed: { id: options.request.wizardSeedId },
          vfsFiles: buildLaneBVfsContext(options.files),
        }, { timeoutMs: LANE_B_WALL_CLOCK_BUDGET_MS + 5000, signal: options.signal });
        options.signal.throwIfAborted();
        const repaired = repairResponse.data ? decodeWizardLaneBProposal(repairResponse.data) : null;
        if (repaired) {
          const stillFailing: typeof failures = [];
          const failedPaths = new Set(failures.map(failure => failure.path));
          const acceptedPaths = new Set(acceptedOps.map(op => op.path));
          for (const failure of failures) {
            const op = repaired.fileOps.find(candidate => candidate.path === failure.path);
            if (!op || acceptedPaths.has(failure.path) || !failedPaths.has(failure.path)) { stillFailing.push(failure); continue; }
            const verdict = screen(repaired, op);
            if (verdict.valid) { acceptedOps.push(op); acceptedPaths.add(op.path); }
            else stillFailing.push({ path: failure.path, violations: verdict.violations.slice(0, 6) });
          }
          failures.length = 0;
          failures.push(...stillFailing);
        }
      } catch (repairError) {
        options.signal.throwIfAborted();
        void repairError; // A failed repair simply leaves the compiled page in place.
      }
    }

    if (failures.length) {
      options.onDegrade?.('enrich.rejected',
        'AI design failed canonical validation for ' + failures.map(failure => failure.path).join(', ')
        + ' (' + (failures[0].violations[0] || 'contract violation') + '); those compiled pages were preserved.');
    }
    if (!acceptedOps.length) return unchanged;
    return { files: mergeLaneBProposalWithSnapshot(options.files, { ...proposal, fileOps: acceptedOps }), acceptedPaths: acceptedOps.map(op => op.path) };
  } catch (error) {
    options.signal.throwIfAborted();
    const timedOut = error instanceof Error && (error.name === 'TimeoutError' || /timed? ?out/i.test(error.message));
    return reject(timedOut ? 'enrich.timeout' : 'enrich.transport', 'AI enrichment ' + (timedOut ? 'timed out' : 'lost its connection') + '; the compiled pages were preserved.');
  }
}
