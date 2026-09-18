/**
 * 21st Intake — Manifest of quarantined and promoted sources (M3).
 *
 * Development-time record only. Generated sites never import this file, and no
 * runtime code may resolve implementations through it — `VARIANT_REGISTRY`
 * remains the single runtime design authority.
 */

import type { TwentyFirstComponentRecord } from './provenance';

const records = import.meta.glob<TwentyFirstComponentRecord>('./imported/*/record.json', { eager: true, import: 'default' });
export const TWENTY_FIRST_INTAKE_MANIFEST: TwentyFirstComponentRecord[] = Object.values(records);

export function findIntakeRecord(sourceId: string): TwentyFirstComponentRecord | undefined {
  return TWENTY_FIRST_INTAKE_MANIFEST.find((r) => r.sourceId === sourceId);
}

/** Promoted sources must not keep an active quarantine duplicate (Step 10). */
export function activeDuplicates(): TwentyFirstComponentRecord[] {
  return TWENTY_FIRST_INTAKE_MANIFEST.filter((r) => r.status === 'promoted' && Boolean(r.implementationId) && (r.step ?? 0) < 10);
}
