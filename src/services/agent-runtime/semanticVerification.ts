import type { EditableEntity } from './editableEntity';

export interface SemanticVerificationInput {
  beforeEntity: EditableEntity;
  afterEntity: EditableEntity;
  expectedChanges: Record<string, unknown>;
  actualValues: Record<string, unknown>;
}

export interface SemanticVerificationResult {
  ok: boolean;
  checks: Array<{ property: string; ok: boolean; message: string }>;
}

/** Pure verifier: a successful compiler/preflight result is not semantic success. */
export function verifyEditableEntityChange(input: SemanticVerificationInput): SemanticVerificationResult {
  const checks = Object.entries(input.expectedChanges).map(([property, expected]) => {
    const sameEntity = input.beforeEntity.id === input.afterEntity.id;
    const actual = input.actualValues[property];
    const ok = sameEntity && Object.is(actual, expected);
    return {
      property,
      ok,
      message: !sameEntity ? `Target identity changed while verifying ${property}`
        : ok ? `${property} changed as requested`
          : `${property} is ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`,
    };
  });
  return { ok: checks.length > 0 && checks.every((check) => check.ok), checks };
}
