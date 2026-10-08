/**
 * Typed section actions over node addresses. Pure: each returns the new owner
 * file contents (or an error); callers commit them through the canonical
 * writer. Buttons inside a moved section keep their destinations because the
 * markup is moved byte-for-byte.
 */
import { resolveMutableNode } from './nodeAddress';

export type SectionActionResult =
  | { ok: true; path: string; contents: string; summary: string }
  | { ok: false; error: string };

interface Span { id: string; start: number; end: number }

const ATTR = (attrs: string, name: string) => new RegExp(`\\b${name}=["']([^"']+)["']`).exec(attrs)?.[1];

/** Top-level <section> spans (nested sections stay inside their parent). */
export function sectionSpans(source: string): Span[] {
  const re = /<section\b([^>]*)>|<\/section\s*>/g;
  const spans: Span[] = [];
  let depth = 0; let open: { start: number; attrs: string } | null = null; let index = 0;
  for (const m of source.matchAll(re)) {
    if (m[0].startsWith('</')) {
      depth -= 1;
      if (depth === 0 && open) {
        index += 1;
        const id = ATTR(open.attrs, 'data-ut-section-id') ?? ATTR(open.attrs, 'id') ?? ATTR(open.attrs, 'aria-label') ?? `section-${index}`;
        spans.push({ id, start: open.start, end: (m.index ?? 0) + m[0].length });
        open = null;
      }
    } else if (!m[0].endsWith('/>')) {
      if (depth === 0) open = { start: m.index ?? 0, attrs: m[1] };
      depth += 1;
    }
  }
  return spans;
}

function locate(address: string, files: Record<string, string>) {
  const r = resolveMutableNode(address, files);
  if (r.ok === false) return { error: r.error } as const;
  if (r.address.kind !== 'section') return { error: 'Expected a section address, e.g. section:/about#hero' } as const;
  const source = files[r.ownerPath] ?? '';
  const spans = sectionSpans(source);
  const i = spans.findIndex((s) => s.id.toLowerCase() === r.address.fragment!.toLowerCase());
  if (i < 0) return { error: `Section "${r.address.fragment}" is not a top-level section in ${r.ownerPath}` } as const;
  return { path: r.ownerPath, source, spans, i } as const;
}

export function removeSection(address: string, files: Record<string, string>): SectionActionResult {
  const l = locate(address, files);
  if ('error' in l) return { ok: false, error: l.error! };
  const s = l.spans[l.i];
  const contents = l.source.slice(0, s.start) + l.source.slice(s.end).replace(/^[ \t]*\r?\n/, '');
  return { ok: true, path: l.path, contents, summary: `Removed section ${s.id}` };
}

export function moveSection(address: string, direction: 'up' | 'down', files: Record<string, string>): SectionActionResult {
  const l = locate(address, files);
  if ('error' in l) return { ok: false, error: l.error! };
  const j = direction === 'up' ? l.i - 1 : l.i + 1;
  if (j < 0 || j >= l.spans.length) return { ok: false, error: `Section is already at the ${direction === 'up' ? 'top' : 'bottom'}` };
  const [a, b] = l.i < j ? [l.spans[l.i], l.spans[j]] : [l.spans[j], l.spans[l.i]];
  const src = l.source;
  const contents = src.slice(0, a.start) + src.slice(b.start, b.end) + src.slice(a.end, b.start) + src.slice(a.start, a.end) + src.slice(b.end);
  return { ok: true, path: l.path, contents, summary: `Moved section ${l.spans[l.i].id} ${direction}` };
}

/**
 * Swap a section's style: replaces only the className on the section's
 * opening tag. Content, wording and button destinations are untouched.
 */
export function restyleSection(address: string, className: string, files: Record<string, string>): SectionActionResult {
  const l = locate(address, files);
  if ('error' in l) return { ok: false, error: l.error! };
  const cls = className.trim();
  if (!cls || /["'{}<>`]/.test(cls)) return { ok: false, error: 'Give plain style classes, e.g. "bg-muted py-24"' };
  const s = l.spans[l.i];
  const tagEnd = l.source.indexOf('>', s.start) + 1;
  const tag = l.source.slice(s.start, tagEnd);
  const next = /\bclassName=(["'])[^"']*\1/.test(tag)
    ? tag.replace(/\bclassName=(["'])[^"']*\1/, `className="${cls}"`)
    : /\bclassName=\{/.test(tag)
      ? null
      : tag.replace(/^<section\b/, `<section className="${cls}"`);
  if (next === null) return { ok: false, error: 'This section builds its style in code; ask the AI to restyle it instead' };
  const contents = l.source.slice(0, s.start) + next + l.source.slice(tagEnd);
  return { ok: true, path: l.path, contents, summary: `Restyled section ${s.id}` };
}

/** Unison section families; a variant swap must stay inside one family. */
const FAMILIES = ['About', 'BeforeAfter', 'BlogPreview', 'CTA', 'Contact', 'FAQ', 'Features', 'Footer', 'Gallery', 'Hero', 'LogoCloud', 'Navbar', 'Pricing', 'Services', 'Stats', 'Team', 'Testimonials'];
export const familyOf = (name: string) =>
  FAMILIES.filter((f) => name.startsWith(f) && /^[A-Z]/.test(name.slice(f.length))).sort((a, b) => b.length - a.length)[0];

/**
 * Swap a section's design variant (e.g. ServicesCardGrid → ServicesEditorialRows).
 * Only the component name changes: every prop — wording, catalog data, button
 * intents — is kept byte-for-byte, and the import is renamed in place.
 */
export function swapVariant(address: string, toName: string, files: Record<string, string>): SectionActionResult {
  const target = toName.trim();
  const toFamily = familyOf(target);
  if (!toFamily) return { ok: false, error: `"${target}" is not a Unison section design (e.g. ServicesEditorialRows)` };
  let path: string; let source: string; let from: string | undefined; let start = 0; let end: number;
  if (address.startsWith('component:')) {
    const r = resolveMutableNode(address, files);
    if (r.ok === false) return { ok: false, error: r.error };
    path = r.ownerPath; source = files[path] ?? ''; from = address.slice('component:'.length); end = source.length;
  } else {
    const l = locate(address, files);
    if ('error' in l) return { ok: false, error: l.error! };
    path = l.path; source = l.source; ({ start, end } = l.spans[l.i]);
    from = [...source.slice(start, end).matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)].map((m) => m[1]).find((n) => familyOf(n));
    if (!from) return { ok: false, error: 'This section has no Unison design to swap; ask the AI to redesign it instead' };
  }
  if (familyOf(from) !== toFamily) return { ok: false, error: `${target} is a ${toFamily} design, but this section is ${familyOf(from) ?? from}. Pick a ${familyOf(from) ?? 'matching'} design.` };
  if (from === target) return { ok: false, error: `Already uses ${target}` };
  const tagRe = new RegExp(`(<\\/?)${from}\\b`, 'g');
  const scope = source.slice(start, end);
  if (!tagRe.test(scope)) return { ok: false, error: `${from} is not used in ${path}` };
  let contents = source.slice(0, start) + scope.replace(tagRe, `$1${target}`) + source.slice(end);
  // Keep the import correct: rename it when no other use of the old design remains.
  const stillUsed = new RegExp(`<${from}\\b`).test(contents);
  const importRe = new RegExp(`(import\\s*\\{[^}]*?)\\b${from}\\b([^}]*\\}\\s*from\\s*['"][^'"]*design-system[^'"]*['"])`);
  if (!new RegExp(`\\b${target}\\b[^;]*from\\s*['"][^'"]*design-system`).test(contents)) {
    contents = stillUsed
      ? contents.replace(importRe, (_m, a, b) => `${a}${from}, ${target}${b}`)
      : contents.replace(importRe, `$1${target}$2`);
  } else if (!stillUsed) {
    contents = contents.replace(importRe, (_m, a: string, b: string) => `${a}${b}`.replace(/,\s*,/, ',').replace(/\{\s*,/, '{').replace(/,\s*\}/, ' }'));
  }
  return { ok: true, path, contents, summary: `Swapped ${from} for ${target}` };
}
