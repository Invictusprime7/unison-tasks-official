/**
 * Semantic verification for canonical mutations.
 *
 * Syntax and import checks answer whether a site can compile. These checks
 * answer whether a requested runtime behavior is actually present in the
 * accepted snapshot and the VFS that preview will render.
 */

import type { SiteBundleSnapshot } from '@/platform/core/canonicalPipeline';
import type { PlaygroundBinding } from '@/platform/core/playground';

export interface BindingProjectionVerificationInput {
  snapshot: SiteBundleSnapshot | null | undefined;
  files: Record<string, string>;
  boundBindingIds: readonly string[];
  unboundBindings: readonly PlaygroundBinding[];
}

export interface SemanticVerificationResult {
  ok: boolean;
  checked: string[];
  failures: string[];
}

function hasRuntimeBinding(files: Record<string, string>, bindingId: string, intent: string): boolean {
  const bindingPattern = new RegExp(`data-ut-binding-id=(['"])${escapeRegex(bindingId)}\\1`);
  const intentPattern = new RegExp(`data-ut-intent=(['"])${escapeRegex(intent)}\\1`);
  return Object.values(files).some((source) => bindingPattern.test(source) && intentPattern.test(source));
}

function hasBindingId(files: Record<string, string>, bindingId: string): boolean {
  const pattern = new RegExp(`data-ut-binding-id=(['"])${escapeRegex(bindingId)}\\1`);
  return Object.values(files).some((source) => pattern.test(source));
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Verify only the binding operations accepted by the current transaction. */
export function verifyBindingProjection(input: BindingProjectionVerificationInput): SemanticVerificationResult {
  const checked: string[] = [];
  const failures: string[] = [];
  const bindings = input.snapshot?.bindings ?? {};

  for (const bindingId of input.boundBindingIds) {
    checked.push(`binding:${bindingId}`);
    const binding = bindings[bindingId];
    if (!binding) {
      failures.push(`Canonical binding ${bindingId} is missing from the accepted snapshot.`);
      continue;
    }
    const intent = binding.coreIntent ?? binding.intent;
    if (!intent || !hasRuntimeBinding(input.files, bindingId, intent)) {
      failures.push(`Canonical binding ${bindingId} is not projected into the accepted preview runtime.`);
    }
  }

  for (const binding of input.unboundBindings) {
    checked.push(`unbind:${binding.bindingId}`);
    if (bindings[binding.bindingId]) {
      failures.push(`Removed binding ${binding.bindingId} remains in the accepted snapshot.`);
    }
    if (hasBindingId(input.files, binding.bindingId)) {
      failures.push(`Removed binding ${binding.bindingId} remains in the accepted preview runtime.`);
    }
  }

  return { ok: failures.length === 0, checked, failures };
}
