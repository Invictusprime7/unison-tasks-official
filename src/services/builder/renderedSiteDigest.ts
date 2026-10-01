/**
 * renderedSiteDigest — compact, size-budgeted description of the site as it
 * actually renders, handed to the AI Builder with every request.
 *
 *  - The current route is read from the live preview DOM (sections, headings,
 *    buttons/links with their data-ut-intent targets, menu, theme tokens).
 *  - Every route the user has viewed this session keeps its last DOM digest
 *    (cached per route + VFS signature) so the AI sees those pages too.
 *  - Pages never rendered yet fall back to a digest extracted from source.
 */

const ROUTE_CACHE = new Map<string, { signature: string; digest: string }>();
const MAX_TOTAL = 9_000;
const MAX_PER_ROUTE = 1_800;

const clip = (value: string, n: number) => {
  const flat = value.replace(/\s+/g, ' ').trim();
  return flat.length > n ? `${flat.slice(0, n - 1)}…` : flat;
};

export function digestDocument(doc: Document, route: string): string {
  const lines: string[] = [`## Route ${route} (rendered)`];
  const nav = Array.from(doc.querySelectorAll('nav a, nav button'))
    .map((el) => clip((el as HTMLElement).innerText || el.textContent || '', 24))
    .filter(Boolean);
  if (nav.length) lines.push(`Menu: ${Array.from(new Set(nav)).slice(0, 12).join(' | ')}`);

  const blocks = Array.from(doc.querySelectorAll('header, section, main > div, footer, [data-component]')).slice(0, 18);
  for (const el of blocks) {
    const tag = el.tagName.toLowerCase();
    const dc = el.getAttribute('data-component') || el.id || '';
    const heading = el.querySelector('h1, h2, h3');
    const headingText = heading ? clip((heading as HTMLElement).innerText || heading.textContent || '', 70) : '';
    lines.push(`- <${tag}${dc ? ` ${dc}` : ''}> ${headingText ? `"${headingText}"` : clip((el as HTMLElement).innerText || el.textContent || '', 60)}`);
  }

  const ctas = Array.from(doc.querySelectorAll('button, a[href], [data-ut-intent]'))
    .map((el) => {
      const text = clip((el as HTMLElement).innerText || el.textContent || el.getAttribute('aria-label') || '', 28);
      const intent = el.getAttribute('data-ut-intent');
      const target = el.getAttribute('data-ut-target') || el.getAttribute('data-ut-path') || el.getAttribute('href') || '';
      return text ? `${text}${intent ? ` [${intent}${target ? ` → ${target}` : ''}]` : target ? ` → ${target}` : ''}` : '';
    })
    .filter(Boolean);
  if (ctas.length) lines.push(`Actions: ${Array.from(new Set(ctas)).slice(0, 16).join('; ')}`);

  try {
    const style = doc.defaultView?.getComputedStyle(doc.documentElement);
    if (style) {
      const tokens = ['--background', '--foreground', '--primary', '--accent', '--font-heading', '--font-body']
        .map((t) => [t, style.getPropertyValue(t).trim()] as const)
        .filter(([, v]) => v)
        .map(([t, v]) => `${t}: ${clip(v, 40)}`);
      if (tokens.length) lines.push(`Theme: ${tokens.join('; ')}`);
    }
  } catch { /* cross-origin or detached */ }

  return clip(lines.join('\n'), MAX_PER_ROUTE * 4).slice(0, MAX_PER_ROUTE);
}

function digestSource(path: string, source: string): string {
  const headings = Array.from(source.matchAll(/<h[1-3][^>]*>([^<{]{3,80})</g)).map((m) => clip(m[1], 60)).slice(0, 6);
  const buttons = Array.from(source.matchAll(/<(?:button|a|Link)[^>]*>([^<{]{2,40})</g)).map((m) => clip(m[1], 24)).slice(0, 8);
  const intents = Array.from(source.matchAll(/data-ut-intent=["']([^"']+)["']/g)).map((m) => m[1]).slice(0, 8);
  const sections = (source.match(/<section\b/g) ?? []).length;
  return [
    `## ${path} (source, not yet rendered this session)`,
    `Sections: ${sections}`,
    headings.length ? `Headings: ${headings.join(' | ')}` : '',
    buttons.length ? `Buttons: ${buttons.join(' | ')}` : '',
    intents.length ? `Intents: ${Array.from(new Set(intents)).join(', ')}` : '',
  ].filter(Boolean).join('\n');
}

export function buildRenderedSiteDigest(args: {
  doc: Document | null | undefined;
  route: string;
  vfsFiles: Record<string, string>;
  signature: string;
  runtimeErrors?: string[];
}): string {
  const route = args.route || '/';
  if (args.doc?.body) {
    ROUTE_CACHE.set(route, { signature: args.signature, digest: digestDocument(args.doc, route) });
  }
  const parts: string[] = ['[Rendered site context]'];
  const current = ROUTE_CACHE.get(route);
  if (current) parts.push(current.digest);
  for (const [cachedRoute, entry] of ROUTE_CACHE) {
    if (cachedRoute === route) continue;
    const stale = entry.signature !== args.signature ? ' (may be outdated)' : '';
    parts.push(entry.digest.replace(/\(rendered\)/, `(rendered earlier${stale})`));
  }
  const pages = Object.keys(args.vfsFiles).filter((p) => /^\/src\/pages\/.+\.(t|j)sx$/.test(p)).sort();
  for (const page of pages) {
    const already = parts.some((part) => part.includes(page));
    if (!already) parts.push(digestSource(page, args.vfsFiles[page] ?? ''));
  }
  if (args.runtimeErrors?.length) parts.push(`Preview errors: ${args.runtimeErrors.slice(0, 3).map((e) => clip(e, 160)).join(' | ')}`);
  let out = '';
  for (const part of parts) {
    if (out.length + part.length + 2 > MAX_TOTAL) break;
    out += `${part}\n\n`;
  }
  return out.trim();
}

export function __resetRenderedSiteDigestForTests(): void {
  ROUTE_CACHE.clear();
}
