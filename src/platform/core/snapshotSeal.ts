/**
 * Pass 1 — Name the stages.
 *
 * The pipeline used to build "a SiteBundleSnapshot" in one place and then keep
 * amending it during merge, preflight, and runtime VFS injection. That made
 * "which revision is Preview showing?" genuinely ambiguous.
 *
 * Two explicitly named revisions now exist:
 *
 *   WizardCompileArtifact — Stage 4b output. Topology + resolved compositions +
 *   theme + baseline VFS + bindings. Deterministic and reproducible from
 *   WizardSelections alone. Frozen.
 *
 *   SiteBundleSnapshot — the final SEALED revision, produced by `sealSnapshot()`
 *   from the compile artifact + canonical preflight output. The only revision that
 *   Preview / Playground / Publish may read.
 *
 * INVARIANT: If it isn't in the current sealed SiteBundleSnapshot, it isn't
 * part of the site.
 */

import type { SiteBundleSnapshot, SiteBundleSnapshotMeta } from './canonicalPipeline';
import type { RuntimeAppContext } from '@/types/runtimeManifest';
import type { WizardInteractionManifest } from '@/services/wizardInteractionEnrichment';
import { readSealedArtDirection } from '@/sections/variants/resolvedArtDirection';

export const SNAPSHOT_SEAL_VERSION = '1.0' as const;
export const WIZARD_LAUNCH_AUTHORITY_PATH = '/.unison/wizard-launch-authority.json' as const;
export const WIZARD_LANE_A_PROTECTED_FILES = [
  '/src/App.tsx',
  '/src/index.css',
  '/src/unison/ui/**',
  '/.unison/**',
  '/.unison/compositions/**',
] as const;

export interface LegacyWizardLaunchAuthorityProof {
  version: '1.0';
  laneAArtifactId: string;
  registeredPageBodyAuthority: 'lane-b';
  registeredPageFiles: string[];
  laneAProtectedFiles: string[];
}

export interface WizardLaunchAuthorityProof {
  version: '2.0';
  compileArtifactId: string;
  registeredPageBodyAuthority: 'canonical-compiler';
  registeredPageFiles: string[];
  protectedFilePatterns: string[];
}

export interface AppBuilderLaunchAuthorityProof {
  version: '3.0';
  compileArtifactId: string;
  registeredPageBodyAuthority: 'app-builder';
  registeredPageFiles: string[];
  protectedFilePatterns: string[];
}

type ReadableWizardLaunchAuthorityProof =
  | LegacyWizardLaunchAuthorityProof
  | WizardLaunchAuthorityProof
  | AppBuilderLaunchAuthorityProof;

interface NormalizedWizardLaunchAuthorityProof {
  version: '1.0' | '2.0' | '3.0';
  compileArtifactId: string;
  pipeline: 'lane-a+lane-b+stage-4b' | 'canonical-compiler+stage-4b' | 'canonical-plan+app-builder+stage-4b';
  registeredPageBodyAuthority: 'lane-b' | 'canonical-compiler' | 'app-builder';
  registeredPageFiles: string[];
  protectedFilePatterns: string[];
}

/**
 * Stage 4b compile artifact — frozen and deterministic.
 * Never rendered directly; it is an input to `sealSnapshot()`.
 */
export interface WizardCompileArtifact {
  readonly kind: 'wizard-compile-artifact';
  readonly version: typeof SNAPSHOT_SEAL_VERSION;
  /** Stage 4b baseline snapshot shape (pre-seal). */
  readonly baseline: SiteBundleSnapshot;
  readonly compiledAt: string;
}

export function createWizardCompileArtifact(baseline: SiteBundleSnapshot): WizardCompileArtifact {
  return Object.freeze({
    kind: 'wizard-compile-artifact' as const,
    version: SNAPSHOT_SEAL_VERSION,
    baseline,
    compiledAt: new Date().toISOString(),
  });
}

export class SnapshotSealError extends Error {
  constructor(message: string) {
    super(`[snapshotSeal] ${message}`);
    this.name = 'SnapshotSealError';
  }
}

export interface SealSnapshotInput {
  /** Stage 4b artifact, or the baseline snapshot it wraps. */
  artifact: WizardCompileArtifact | SiteBundleSnapshot;
  /** Final VFS after deterministic compilation, preflight, and runtime injection. */
  vfsFiles: Record<string, string>;
  /** Runtime context stamped onto the sealed revision. */
  appContext: RuntimeAppContext;
  interactionManifest?: WizardInteractionManifest | null;
  visualQuality?: SiteBundleSnapshotMeta['visualQuality'];
  experiencePreflight?: SiteBundleSnapshotMeta['experiencePreflight'];
  runtimeCompatibility?: SiteBundleSnapshotMeta['runtimeCompatibility'];
  /** Which stage produced the final merge (traceability only). */
  sealedBy?: 'wizard-launch' | 'recompile' | 'builder-commit' | 'import';
  /**
   * How to handle registered pages with no file in the runtime VFS.
   * `throw` (default) is the strict wizard/builder path. `report` is used by
   * the deliberately-degradation-visible modes (canonical page fallback
   * blocked, canonical merge disabled) so the missing pages surface as seal
   * diagnostics instead of crashing artifact assembly.
   */
  missingPageFilePolicy?: 'throw' | 'report';
}


function baselineOf(artifact: SealSnapshotInput['artifact']): SiteBundleSnapshot {
  return 'kind' in artifact && artifact.kind === 'wizard-compile-artifact'
    ? artifact.baseline
    : (artifact as SiteBundleSnapshot);
}

function normalizeVfsPath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function equalStringArrays(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

/**
 * Stable byte fingerprint for source authority records. The algorithm label is
 * persisted with each value so a future SHA migration can coexist with old
 * sealed revisions without reinterpreting their historical proof.
 */
function sourceHash(contents: string): string {
  const bytes = new TextEncoder().encode(contents);
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (const byte of bytes) hash = (hash ^ BigInt(byte)) * prime & mask;
  return `fnv1a64:${hash.toString(16).padStart(16, '0')}`;
}

function createFileAuthority(
  files: Record<string, string>,
  authoringOrigin: NonNullable<SealSnapshotInput['sealedBy']>,
): NonNullable<SiteBundleSnapshotMeta['seal']>['fileAuthority'] {
  return Object.fromEntries(
    Object.entries(files)
      .map(([path, contents]) => [normalizeVfsPath(path), {
        sourceHash: sourceHash(contents),
        authoringOrigin,
      }] as const)
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

/** Validates the exact runtime bytes against a per-file authority ledger. */
export function verifySealedSourceAuthority(snapshot: SiteBundleSnapshot): string[] {
  const authority = snapshot.meta?.seal?.fileAuthority;
  // Legacy sealed revisions remain readable; new seals always carry a ledger.
  if (!authority) return [];
  // `/.unison/*` is sidecar metadata re-emitted during handoff. It is not
  // runtime source and is intentionally excluded by sealSnapshot(), so it
  // must never be compared against the runtime authority ledger on reopen.
  const runtimeFiles = Object.fromEntries(
    Object.entries(snapshot.vfsFiles).filter(([path]) => !normalizeVfsPath(path).startsWith('/.unison/')),
  );
  const runtimePaths = Object.keys(runtimeFiles).map(normalizeVfsPath).sort();
  const authorityPaths = Object.keys(authority).map(normalizeVfsPath).sort();
  const violations: string[] = [];
  if (!equalStringArrays(runtimePaths, authorityPaths)) {
    const allPaths = new Set([...runtimePaths, ...authorityPaths]);
    for (const path of [...allPaths].sort()) {
      if (!(path in authority)) violations.push(`missing authority record: ${path}`);
      else if (!(path in snapshot.vfsFiles) && !(path.slice(1) in snapshot.vfsFiles)) violations.push(`missing sealed file: ${path}`);
    }
  }
  for (const [rawPath, contents] of Object.entries(runtimeFiles)) {
    const path = normalizeVfsPath(rawPath);
    const recorded = authority[path];
    if (!recorded) continue;
    if (recorded.sourceHash !== sourceHash(contents)) violations.push(`source hash mismatch: ${path}`);
  }
  return violations;
}

/**
 * Updates byte authority only after a canonical candidate has completed all
 * transforms. It does not regenerate source or infer a component whitelist.
 */
export function restampSealedSourceAuthority(
  snapshot: SiteBundleSnapshot,
  files: Record<string, string>,
  authoringOrigin: NonNullable<SealSnapshotInput['sealedBy']> = 'builder-commit',
): SiteBundleSnapshot {
  if (!isSealedSnapshot(snapshot)) return snapshot;
  const runtimeVfsFiles = Object.fromEntries(
    Object.entries(files).filter(([path]) => !path.startsWith('/.unison/')),
  );
  return {
    ...snapshot,
    vfsFiles: runtimeVfsFiles,
    routerFile: {
      path: snapshot.routerFile.path,
      content: runtimeVfsFiles[snapshot.routerFile.path] ?? runtimeVfsFiles['/src/App.tsx'] ?? snapshot.routerFile.content,
    },
    meta: {
      ...snapshot.meta,
      seal: {
        ...snapshot.meta.seal!,
        fileCount: Object.keys(runtimeVfsFiles).length,
        fileAuthority: createFileAuthority(runtimeVfsFiles, authoringOrigin),
      },
    },
  };
}

function readWizardLaunchAuthorityProof(
  files: Record<string, string>,
  artifact: WizardCompileArtifact,
): NormalizedWizardLaunchAuthorityProof {
  const raw = files[WIZARD_LAUNCH_AUTHORITY_PATH];
  if (!raw) {
    throw new SnapshotSealError(`wizard-launch is missing ${WIZARD_LAUNCH_AUTHORITY_PATH}.`);
  }

  let proof: ReadableWizardLaunchAuthorityProof;
  try {
    proof = JSON.parse(raw) as ReadableWizardLaunchAuthorityProof;
  } catch {
    throw new SnapshotSealError('wizard-launch ownership proof is not valid JSON.');
  }

  const expectedPages = sortedUnique(
    Object.values(artifact.baseline.pageRegistry?.pages || {})
      .map((page) => (page as { filePath?: string }).filePath)
      .filter((path): path is string => Boolean(path))
      .map(normalizeVfsPath),
  );
  const proofPages = Array.isArray(proof.registeredPageFiles)
    ? sortedUnique(proof.registeredPageFiles.map(normalizeVfsPath))
    : [];
  const expectedProtected = sortedUnique(WIZARD_LANE_A_PROTECTED_FILES);
  const proofArtifactId = proof.version === '2.0' || proof.version === '3.0'
    ? proof.compileArtifactId
    : proof.laneAArtifactId;
  const proofProtectedSource = proof.version === '2.0' || proof.version === '3.0'
    ? proof.protectedFilePatterns
    : proof.laneAProtectedFiles;
  const proofProtected = Array.isArray(proofProtectedSource)
    ? sortedUnique(proofProtectedSource)
    : [];

  if (proof.version !== '1.0' && proof.version !== '2.0' && proof.version !== '3.0') {
    throw new SnapshotSealError('wizard-launch ownership proof version is invalid.');
  }
  if (proofArtifactId !== artifact.baseline.snapshotId) {
    throw new SnapshotSealError('wizard-launch ownership proof does not match the compile artifact.');
  }
  const expectedAuthority = proof.version === '3.0'
    ? 'app-builder'
    : proof.version === '2.0'
      ? 'canonical-compiler'
      : 'lane-b';
  if (proof.registeredPageBodyAuthority !== expectedAuthority) {
    throw new SnapshotSealError(
      `wizard-launch registered page body authority must be ${expectedAuthority}.`,
    );
  }
  if (!equalStringArrays(proofPages, expectedPages)) {
    throw new SnapshotSealError('wizard-launch ownership proof page files do not match the Lane A registry.');
  }
  if (!equalStringArrays(proofProtected, expectedProtected)) {
    throw new SnapshotSealError('wizard-launch ownership proof does not identify every protected Lane A file group.');
  }
  const missingProofPages = expectedPages.filter((path) => !files[path]);
  if (missingProofPages.length > 0) {
    throw new SnapshotSealError(
      `wizard-launch ownership proof references missing registered pages: ${missingProofPages.join(', ')}.`,
    );
  }

  return {
    version: proof.version,
    compileArtifactId: proofArtifactId,
    pipeline: proof.version === '3.0'
      ? 'canonical-plan+app-builder+stage-4b'
      : proof.version === '2.0'
        ? 'canonical-compiler+stage-4b'
        : 'lane-a+lane-b+stage-4b',
    registeredPageBodyAuthority: proof.registeredPageBodyAuthority,
    registeredPageFiles: expectedPages,
    protectedFilePatterns: expectedProtected,
  };
}

/**
 * The single seal point. Converts a Stage 4b artifact plus the converged VFS
 * into the authoritative SiteBundleSnapshot. Every invariant that Preview
 * depends on is asserted here — after this returns, no layer may amend the
 * page bodies of the returned revision.
 */
export function sealSnapshot(input: SealSnapshotInput): SiteBundleSnapshot {
  const baseline = baselineOf(input.artifact);
  if (!baseline) {
    throw new SnapshotSealError('cannot seal without a Stage 4b compile artifact.');
  }

  const wizardCompileArtifact =
    'kind' in input.artifact && input.artifact.kind === 'wizard-compile-artifact'
      ? input.artifact
      : null;
  const requiresCompilerProof = !input.sealedBy || input.sealedBy === 'wizard-launch' || input.sealedBy === 'recompile';
  const authorityProof = wizardCompileArtifact && requiresCompilerProof
    ? readWizardLaunchAuthorityProof(input.vfsFiles, wizardCompileArtifact)
    : null;

  // Runtime VFS excludes platform metadata sidecars (`/.unison/*`); those are
  // re-emitted from the sealed revision, never read back into it.
  const runtimeVfsFiles = Object.fromEntries(
    Object.entries(input.vfsFiles).filter(([path]) => !path.startsWith('/.unison/')),
  );

  if (!runtimeVfsFiles['/src/App.tsx']) {
    throw new SnapshotSealError('sealed revision is missing the deterministic /src/App.tsx router.');
  }
  if (!runtimeVfsFiles['/src/index.css']) {
    throw new SnapshotSealError('sealed revision is missing the Stage 4b themed /src/index.css.');
  }

  const registeredPages = Object.values(baseline.pageRegistry?.pages || {}) as Array<{
    filePath?: string;
    path?: string;
  }>;
  const missingPageFiles = registeredPages
    .map((page) => page.filePath)
    .filter((filePath): filePath is string => Boolean(filePath))
    .filter((filePath) => !runtimeVfsFiles[filePath]);
  if (missingPageFiles.length > 0 && (input.missingPageFilePolicy || 'throw') === 'throw') {
    throw new SnapshotSealError(
      `sealed revision is missing files for registered pages: ${missingPageFiles.join(', ')}.`,
    );
  }


  const meta: SiteBundleSnapshotMeta = {
    ...(baseline.meta || ({} as SiteBundleSnapshotMeta)),
    source: baseline.meta?.source || 'wizard',
    systemId: baseline.meta?.systemId || input.appContext.systemType || null,
    themePresetId: input.appContext.themePresetId || baseline.meta?.themePresetId,
    templateId: input.appContext.templateId || baseline.meta?.templateId,
    // The art-direction pack is sealed exactly as Stage 4b resolved it —
    // sealing must never re-derive it, or the aesthetic drifts on recompile.
    artDirectionPackId:
      baseline.meta?.artDirection?.storagePackId ??
      baseline.meta?.artDirectionPackId ??
      baseline.meta?.designIntervention?.artDirectionPackId ??
      null,
    // Phase E: the resolved Art Direction record is sealed with the revision so
    // Preview, autosave, recompile and publish read one answer instead of
    // re-deriving a family. Legacy revisions are projected from the sealed pack.
    artDirection: readSealedArtDirection({
      artDirection: baseline.meta?.artDirection,
      artDirectionPackId:
        baseline.meta?.artDirectionPackId ?? baseline.meta?.designIntervention?.artDirectionPackId ?? null,
      themePresetId: input.appContext.themePresetId || baseline.meta?.themePresetId || null,
      designIntervention: baseline.meta?.designIntervention,
    }),
    designSelection: baseline.meta?.designSelection,
    industry: input.appContext.industry || baseline.meta?.industry || baseline.industry,
    verticalContractId: baseline.meta?.verticalContractId || input.appContext.systemType || null,
    // The generation seed is sealed exactly as Stage 4b resolved it — sealing
    // must never re-derive or drop it, or the site stops being reproducible.
    generationSeed: baseline.meta?.generationSeed || baseline.meta?.designIntervention?.seed,
    interactionManifest: input.interactionManifest || baseline.meta?.interactionManifest,
    visualQuality: input.visualQuality || baseline.meta?.visualQuality,
    experiencePreflight: input.experiencePreflight || baseline.meta?.experiencePreflight,
    runtimeCompatibility: input.runtimeCompatibility || baseline.meta?.runtimeCompatibility,
    themeInjection: {
      version: '1.0',
      stage: '4b',
      presetId: input.appContext.themePresetId || baseline.meta?.themePresetId || null,
      cssPath: '/src/index.css',
    },
    seal: {
      version: SNAPSHOT_SEAL_VERSION,
      sealedAt: new Date().toISOString(),
      sealedBy: input.sealedBy || 'wizard-launch',
      compileArtifactId: baseline.snapshotId,
      fileCount: Object.keys(runtimeVfsFiles).length,
      fileAuthority: createFileAuthority(runtimeVfsFiles, input.sealedBy || 'wizard-launch'),
      ...(authorityProof
        ? {
            pipeline: authorityProof.pipeline,
            authorityProofVersion: authorityProof.version,
            registeredPageBodyAuthority: authorityProof.registeredPageBodyAuthority,
            registeredPageFiles: authorityProof.registeredPageFiles,
            protectedFilePatterns: authorityProof.protectedFilePatterns,
            ...(authorityProof.version === '1.0'
              ? { laneAProtectedFiles: authorityProof.protectedFilePatterns }
              : {}),
          }
        : {}),
      ...(missingPageFiles.length > 0 ? { missingPageFiles } : {}),
    },

  };

  return {
    ...baseline,
    appContext: input.appContext,
    vfsFiles: runtimeVfsFiles,
    routerFile: {
      path: baseline.routerFile.path,
      content: runtimeVfsFiles[baseline.routerFile.path] ?? runtimeVfsFiles['/src/App.tsx'],
    },
    meta,
  };
}

/** True when a snapshot has passed through `sealSnapshot()`. */
export function isSealedSnapshot(snapshot?: SiteBundleSnapshot | null): boolean {
  return Boolean(snapshot?.meta?.seal?.version);
}
