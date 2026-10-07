/**
 * In-preview browser probe (Phase 4A). Asks the live preview iframe what is
 * actually painted — read-only, no writes. A save is not proof the change
 * rendered; this is.
 */
export type ProbeCheck = { kind: 'text' | 'selector' | 'intent'; value: string };
export interface ProbeCheckResult extends ProbeCheck { ok: boolean; count?: number; error?: string }
export interface ProbeReport { ok: boolean; reachable: boolean; route?: string; results: ProbeCheckResult[] }

let seq = 0;

function previewFrames(): Window[] {
  if (typeof document === 'undefined') return [];
  return Array.from(document.querySelectorAll('iframe'))
    .map((f) => f.contentWindow)
    .filter((w): w is Window => !!w);
}

export function runPreviewProbe(checks: ProbeCheck[], timeoutMs = 3000): Promise<ProbeReport> {
  const frames = previewFrames();
  if (!frames.length || !checks.length) return Promise.resolve({ ok: false, reachable: false, results: [] });
  const probeId = `probe-${Date.now()}-${++seq}`;
  return new Promise((resolve) => {
    const done = (report: ProbeReport) => { window.removeEventListener('message', onMessage); clearTimeout(timer); resolve(report); };
    const onMessage = (event: MessageEvent) => {
      const d = event.data;
      if (!d || d.type !== 'UT_PROBE_RESULT' || d.probeId !== probeId) return;
      const results = (d.results ?? []) as ProbeCheckResult[];
      done({ ok: results.length > 0 && results.every((r) => r.ok), reachable: true, route: d.route, results });
    };
    const timer = setTimeout(() => done({ ok: false, reachable: false, results: [] }), timeoutMs);
    window.addEventListener('message', onMessage);
    for (const w of frames) w.postMessage({ type: 'UT_PROBE', probeId, checks }, '*');
  });
}

/** Parses terminal args like: text "Book now"  selector h1  intent nav.goto */
export function parseProbeArgs(args: string[]): ProbeCheck[] {
  const checks: ProbeCheck[] = [];
  for (let i = 0; i < args.length; i += 2) {
    const kind = args[i] as ProbeCheck['kind'];
    const value = (args[i + 1] ?? '').replace(/^["']|["']$/g, '');
    if (['text', 'selector', 'intent'].includes(kind) && value) checks.push({ kind, value });
  }
  return checks;
}

export function formatProbeReport(r: ProbeReport): string[] {
  if (!r.reachable) return ['Preview did not answer — open the preview and try again.'];
  return [
    `Preview route ${r.route ?? '/'}:`,
    ...r.results.map((c) => `${c.ok ? '✓' : '✗'} ${c.kind} "${c.value}"${c.count != null ? ` (${c.count})` : ''}${c.error ? ` — ${c.error}` : ''}`),
  ];
}
