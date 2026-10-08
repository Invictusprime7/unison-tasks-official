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

/** After a canonical commit: wait for the preview to compile, then probe it. */
export async function verifyCommittedChange(checks: ProbeCheck[]): Promise<PostCommitVerification> {
  const live = await awaitPreviewVerification({ timeoutMs: 15_000 });
  if (!live.verified) {
    return /did not confirm/.test(live.reason ?? '')
      ? { status: 'unconfirmed', message: 'Saved. The preview has not confirmed it yet.' }
      : { status: 'preview-error', message: `Saved, but the preview shows an error: ${live.reason}` };
  }
  if (!checks.length) return { status: 'verified', message: 'Saved and the preview loaded it.' };
  const report = await provider.probe(checks);
  if (!report.reachable) return { status: 'unconfirmed', message: 'Saved. The preview did not answer the check.', report };
  // The probe sees only the current page; missing intents may live on other pages.
  const missing = report.results.filter((r) => !r.ok).map((r) => r.value);
  return missing.length
    ? { status: 'mismatch', message: `Saved, but these buttons are not showing on ${report.route ?? 'this page'}: ${missing.join(', ')}`, report }
    : { status: 'verified', message: 'Saved, and every button on this page still shows.', report };
}
