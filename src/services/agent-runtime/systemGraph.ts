/**
 * SystemGraph — a pure, read-only projection of the saved site source:
 * Page → Section → Button (intent → destination). It is an index, never a
 * second source of truth; rebuild it from files whenever files change.
 */

export interface GraphIntent { intent: string; label: string; target: string | null }
export interface GraphSection { id: string; intents: GraphIntent[] }
export interface GraphPage { path: string; name: string; sections: GraphSection[]; intents: GraphIntent[] }
export interface SystemGraph { pages: GraphPage[]; intentCount: number }

const SECTION_RE = /<section\b([^>]*)>/g;
const INTENT_RE = /<([A-Za-z][\w.]*)\b([^<>]*?data-ut-intent=["']([^"']+)["'][^<>]*?)>([^<]{0,80})/g;
const TARGET_RE = /data-ut-(?:target-page-id|path|target)=["']([^"']+)["']|\bhref=["']([^"']+)["']|\bto=["']([^"']+)["']/;
const ATTR = (attrs: string, name: string) => new RegExp(`${name}=["']([^"']+)["']`).exec(attrs)?.[1];

function intentsIn(src: string): GraphIntent[] {
  const out: GraphIntent[] = [];
  for (const m of src.matchAll(INTENT_RE)) {
    const t = TARGET_RE.exec(m[2]);
    out.push({
      intent: m[3],
      label: (m[4] || ATTR(m[2], 'aria-label') || '').trim().slice(0, 40),
      target: t ? (t[1] ?? t[2] ?? t[3]) : null,
    });
  }
  return out;
}

export function buildSystemGraph(files: Record<string, string>): SystemGraph {
  const pages: GraphPage[] = [];
  let intentCount = 0;
  for (const path of Object.keys(files).sort()) {
    if (!/^\/src\/pages\/.+\.(t|j)sx$/.test(path)) continue;
    const src = files[path] ?? '';
    const starts = [...src.matchAll(SECTION_RE)];
    const sections: GraphSection[] = starts.map((m, i) => {
      const end = starts[i + 1]?.index ?? src.length;
      const id = ATTR(m[1], 'data-ut-section-id') ?? ATTR(m[1], 'id') ?? ATTR(m[1], 'aria-label') ?? `section-${i + 1}`;
      return { id, intents: intentsIn(src.slice(m.index ?? 0, end)) };
    });
    const intents = intentsIn(src);
    intentCount += intents.length;
    pages.push({ path, name: path.split('/').pop()!.replace(/\.(t|j)sx$/, ''), sections, intents });
  }
  return { pages, intentCount };
}

/** Compact text form for the AI context (size-capped). */
export function renderSystemGraphForPrompt(graph: SystemGraph, maxChars = 3000): string {
  if (graph.pages.length === 0) return '';
  const lines = ['SITE MAP (read-only; button destinations are invariant during design edits):'];
  for (const p of graph.pages) {
    lines.push(`- ${p.name} (${p.path}): ${p.sections.length} sections`);
    for (const i of p.intents.slice(0, 8)) lines.push(`    • "${i.label || i.intent}" → ${i.intent}${i.target ? ` → ${i.target}` : ''}`);
  }
  const text = lines.join('\n');
  return text.length > maxChars ? `${text.slice(0, maxChars)}\n…` : text;
}
