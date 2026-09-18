import { validateSourceProvenance } from './provenanceValidation.mjs';
/**
 * 21st Intake — Provenance record (M3).
 *
 * Development-time only. The runtime never needs this object to render a site:
 * it exists for provenance, audit, adaptation, debugging, licensing
 * traceability and registry generation.
 */

export type TwentyFirstSourceType =
  | 'component'
  | 'block'
  | 'template'
  | 'effect'
  | 'background'
  | 'navigation';

export interface TwentyFirstCapabilities {
  motion: boolean;
  threeD: boolean;
  media: boolean;
  forms: boolean;
  carousel: boolean;
}

export interface TwentyFirstCompatibility {
  react19: boolean;
  tailwind3: boolean;
  vite: boolean;
  clientOnly: boolean;
}

export interface TwentyFirstAdaptation {
  tokensNormalized: boolean;
  importsNormalized: boolean;
  reducedMotionSupported: boolean;
  responsiveVerified: boolean;
  canonicalSlotsAdded: boolean;
  intentReady: boolean;
  portableRecipeCertified: boolean;
}

export interface TwentyFirstComponentRecord {
  sourceId: string;
  status?: 'promoted' | 'retired';
  archivePath?: string;

  name: string;
  author?: string;
  sourceUrl?: string;

  sourceType: TwentyFirstSourceType;

  dependencies: string[];
  registryDependencies: string[];

  license?: string;
  licenseReview?: {
    status: 'unverified' | 'verified' | 'rejected';
    license?: string;
    source?: string;
    verifiedAt?: string;
    notes?: string;
  };
  attribution?: string;

  designTags: string[];

  capabilities: TwentyFirstCapabilities;
  compatibility: TwentyFirstCompatibility;
  adaptation: TwentyFirstAdaptation;

  /** Set once promoted into `VARIANT_REGISTRY`. */
  implementationId?: string;

  /** Lifecycle step the source has reached (1..10). */
  step?: number;
}

/** Visual source metadata attached to a promoted canonical implementation. */
export interface VisualSourceMetadata {
  origin: 'unison' | '21st';
  /** Distinguishes an original implementation informed by a preview from copied source. */
  derivation?: 'source-adaptation' | 'visual-reference';
  sourceId?: string;
  sourceUrl?: string;
  author?: string;
  license?: string;
  importedAt?: string;
  adaptationVersion?: string;
}

export const EMPTY_ADAPTATION: TwentyFirstAdaptation = {
  tokensNormalized: false,
  importsNormalized: false,
  reducedMotionSupported: false,
  responsiveVerified: false,
  canonicalSlotsAdded: false,
  intentReady: false,
  portableRecipeCertified: false,
};

export function createIntakeRecord(
  input: Pick<TwentyFirstComponentRecord, 'sourceId' | 'name' | 'sourceType'> &
    Partial<TwentyFirstComponentRecord>,
): TwentyFirstComponentRecord {
  return {
    dependencies: [],
    registryDependencies: [],
    designTags: [],
    capabilities: { motion: false, threeD: false, media: false, forms: false, carousel: false },
    compatibility: { react19: false, tailwind3: false, vite: false, clientOnly: false },
    adaptation: { ...EMPTY_ADAPTATION },
    step: 2,
    licenseReview: { status: 'unverified' },
    ...input,
  };
}

/** A record is only usable as provenance when source identity is complete. */
export function assertProvenance(record: TwentyFirstComponentRecord): string[] {
  return validateSourceProvenance(record);
}

export function toVisualSourceMetadata(
  record: TwentyFirstComponentRecord,
  adaptationVersion = '1',
): VisualSourceMetadata {
  return {
    origin: '21st',
    sourceId: record.sourceId,
    sourceUrl: record.sourceUrl,
    author: record.author,
    license: record.license,
    importedAt: new Date().toISOString(),
    adaptationVersion,
  };
}
