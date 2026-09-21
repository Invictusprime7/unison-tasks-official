/**
 * Server-side mirror of `src/platform/core/businessCapabilityVocabulary.ts`.
 *
 * Deno edge functions cannot import from `src/`, so the closed capability
 * vocabulary is mirrored here. `src/test/builderRequestOntology.test.ts`
 * asserts both lists stay identical, so drift fails CI.
 *
 * Only values resolvable here may reach capability-pack verification.
 */

export const BUSINESS_CAPABILITY_IDS: string[] = [
  "business_profile",
  "catalog.services",
  "catalog.products",
  "catalog.menu",
  "crm.leads",
  "crm.contacts",
  "booking.appointments",
  "commerce.cart",
  "commerce.checkout",
  "forms.contact",
  "forms.quote",
  "auth.customer",
  "portal.customer",
  "automation.follow_up",
  "notifications.email",
];

const CAPABILITY_SET = new Set(BUSINESS_CAPABILITY_IDS);

/** true when the value is a canonical business capability id. */
export function isBusinessCapabilityId(raw: unknown): boolean {
  const v = String(raw ?? "").trim().toLowerCase();
  if (!v) return false;
  return CAPABILITY_SET.has(v) || CAPABILITY_SET.has(v.replace(/[\s-]+/g, "_"));
}

/** Keep only canonical capability ids; everything else is another domain. */
export function filterBusinessCapabilityIds(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const out: string[] = [];
  for (const raw of values) {
    const v = String(raw ?? "").trim().toLowerCase();
    if (!v) continue;
    const canonical = CAPABILITY_SET.has(v)
      ? v
      : CAPABILITY_SET.has(v.replace(/[\s-]+/g, "_"))
        ? v.replace(/[\s-]+/g, "_")
        : null;
    if (canonical && !out.includes(canonical)) out.push(canonical);
  }
  return out;
}
