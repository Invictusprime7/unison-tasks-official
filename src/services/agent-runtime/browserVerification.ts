/**
 * Browser verification (P0.11/P0.12) — read-only observer, never a writer.
 *
 * `BrowserProbeProvider` is the swap point the milestone requires: today the
 * only provider is the in-preview probe (postMessage into the live Sandpack
 * iframe). A hosted Playwright worker can register later without changing
 * callers. Client code must never import Playwright itself.
 */
import { runPreviewProbe, type ProbeCheck, type ProbeReport } from './previewProbe';
import { awaitPreviewVerification } from '@/services/builder/previewVerification';

/**
 * Provider-agnostic multi-step verifier. Local Playwright (scripts/verify-browser-local.mjs)
 * implements it on a developer machine; a hosted adapter can be added later.
 * The AI only ever talks to this interface.
 */
export interface BrowserVerifier {
  id: string;
  open(url: string): Promise<void>;
  click(target: string): Promise<void>;
  getText(target: string): Promise<string>;
  assertVisible(target: string): Promise<void>;
  screenshot?(): Promise<unknown>;
}

/** Always-usable verifier backed by the in-preview probe (read-only; no clicks). */
export const inPreviewVerifier: BrowserVerifier = {
  id: "in-preview",
  async open(url) { if (!url.startsWith("#") && !url.startsWith("/")) throw new Error("In-preview verifier can only open site routes."); },
  async click() { throw new Error("Clicking needs a browser provider (local Playwright)."); },
  async getText(target) { const r = await runPreviewProbe([{ kind: "selector", value: target }]); if (!r.reachable) throw new Error("Preview did not answer."); return r.results[0]?.ok ? target : ""; },
  async assertVisible(target) { const r = await runPreviewProbe([{ kind: "selector", value: target }]); if (!r.ok) throw new Error(`Not visible: ${target}`); },
};
let verifier: BrowserVerifier = inPreviewVerifier;
export function setBrowserVerifier(next: BrowserVerifier | null): void { verifier = next ?? inPreviewVerifier; }
export function getBrowserVerifier(): BrowserVerifier { return verifier; }

export interface BrowserProbeProvider {
  id: 'in-preview' | 'playwright-worker';
  probe(checks: ProbeCheck[], timeoutMs?: number): Promise<ProbeReport>;
}

const inPreviewProvider: BrowserProbeProvider = { id: 'in-preview', probe: runPreviewProbe };
let provider: BrowserProbeProvider = inPreviewProvider;

export function setBrowserProbeProvider(next: BrowserProbeProvider | null): void {
  provider = next ?? inPreviewProvider;
}
export function getBrowserProbeProvider(): BrowserProbeProvider {
  return provider;
}

const INTENT_ATTR = /data-ut-intent\s*=\s*["']([^"']+)["']/g;
function intentsIn(source: string): Set<string> {
  return new Set([...source.matchAll(INTENT_ATTR)].map((m) => m[1]));
}

/**
 * Derive post-commit checks from a committed change: every button action that
 * existed in a changed file before the save and still exists in its source
 * afterwards must still be painted. Pure — easy to test.
 */
export function deriveIntentChecks(
  before: Readonly<Record<string, string>>,
  after: Readonly<Record<string, string>>,
  changedPaths: string[],
): ProbeCheck[] {
  const wanted = new Set<string>();
  for (const path of changedPaths) {
    if (!/\.(t|j)sx$/.test(path) || after[path] === undefined) continue;
    const kept = intentsIn(after[path]);
    for (const intent of intentsIn(before[path] ?? '')) if (kept.has(intent)) wanted.add(intent);
  }
  return [...wanted].sort().map((value) => ({ kind: 'intent' as const, value }));
}

export interface PostCommitVerification {
  status: 'verified' | 'preview-error' | 'unconfirmed' | 'mismatch';
  message: string;
  report?: ProbeReport;
}

/**
 * Before a save: record which button actions in the files about to change are
 * actually painted right now. Buttons living on other pages, in closed menus or
 * in shared parts not shown on this route are then never reported as "missing".
 */
export async function captureIntentBaseline(
  before: Readonly<Record<string, string>>,
  changedPaths: string[],
): Promise<ProbeReport | null> {
  const checks = deriveIntentChecks(before, before, changedPaths);
  if (!checks.length) return null;
  try { const r = await provider.probe(checks, 1500); return r.reachable ? r : null; } catch { return null; }
}

/** After a canonical commit: wait for the preview to compile, then probe it. */
export async function verifyCommittedChange(checks: ProbeCheck[], baseline?: ProbeReport | null): Promise<PostCommitVerification> {
  if (baseline !== undefined) {
    // Only buttons that were visible on this same page before the save can go missing.
    const shown = new Set(baseline?.results.filter((r) => r.ok).map((r) => r.value) ?? []);
    checks = checks.filter((c) => shown.has(c.value));
  }
  const live = await awaitPreviewVerification({ timeoutMs: 15_000 });
  if (!live.verified) {
    return /did not confirm/.test(live.reason ?? '')
      ? { status: 'unconfirmed', message: 'Saved. The preview has not confirmed it yet.' }
      : { status: 'preview-error', message: `Saved, but the preview shows an error: ${live.reason}` };
  }
  if (!checks.length) return { status: 'verified', message: 'Saved and the preview loaded it.' };
  const report = await provider.probe(checks);
  if (baseline?.route && report.route && baseline.route !== report.route) {
    return { status: 'unconfirmed', message: `Saved. The preview moved to ${report.route}, so buttons were not re-checked.`, report };
  }
  if (!report.reachable) return { status: 'unconfirmed', message: 'Saved. The preview did not answer the check.', report };
  // The probe sees only the current page; missing intents may live on other pages.
  const missing = report.results.filter((r) => !r.ok).map((r) => r.value);
  return missing.length
    ? { status: 'mismatch', message: `Saved, but these buttons are not showing on ${report.route ?? 'this page'}: ${missing.join(', ')}`, report }
    : { status: 'verified', message: 'Saved, and every button on this page still shows.', report };
}
