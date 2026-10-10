/**
 * Longform pages — deterministic page + button wiring for saved Articles and
 * Case studies (any industry). Pure: returns the files and route op that the
 * host commits through the canonical save path (commitBuilderFiles →
 * commitMutation). No AI round-trip, so it cannot time out or drift.
 */
import type { ResourceRecord } from './resourceTypes';

export type LongformKind = 'articles' | 'case-studies';

export interface LongformPlan {
  pageId: string;
  title: string;
  path: string;
  filePath: string;
  /** Files to write: the new page + any listing pages whose button was linked. */
  files: Record<string, string>;
  linkedFiles: string[];
}

const ARTICLE_BASES = ['/insights', '/journal', '/blog', '/articles', '/essays', '/news', '/stories'];
const CASE_BASES = ['/work', '/case-studies', '/portfolio', '/projects'];
const ARTICLE_INDUSTRIES = /agency|coach|consult|studio|creative|law|finance|saas|tech/;

export function slugifyLongform(s: string): string {
  return s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'entry';
}

/** Prefer a listing route the site already has; otherwise an industry default. */
export function longformBase(kind: LongformKind, existingPaths: string[], industry?: string | null): string {
  const bases = kind === 'articles' ? ARTICLE_BASES : CASE_BASES;
  const hit = bases.find((b) => existingPaths.some((p) => p === b));
  if (hit) return hit;
  if (kind === 'case-studies') return '/work';
  return ARTICLE_INDUSTRIES.test((industry ?? '').toLowerCase()) ? '/insights' : '/blog';
}

/** Mirrors routeNavigationService.deriveFilePath for non-home pages. */
export function filePathForRoute(route: string): string {
  const slug = route.replace(/^\//, '') || 'custom';
  const name = slug
    .replace(/[-_\s/]+(.)/g, (_: string, c: string) => c.toUpperCase())
    .replace(/^(.)/, (_: string, c: string) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '') || 'Page';
  return `/src/pages/${name}.tsx`;
}

function chromeImports(files: Record<string, string>): { lines: string[]; nav: string | null; footer: string | null } {
  const home = files['/src/pages/Home.tsx'] ?? Object.entries(files).find(([p]) => p.startsWith('/src/pages/'))?.[1] ?? '';
  const lines: string[] = [];
  let nav: string | null = null;
  let footer: string | null = null;
  for (const m of home.matchAll(/^import\s+(?:(\w+)|\{\s*(\w+)\s*\})\s+from\s+['"]([^'"]+)['"];?\s*$/gm)) {
    const name = m[1] || m[2];
    if (/Nav/.test(name) && !nav) { nav = name; lines.push(m[0].trim()); }
    else if (/Footer/.test(name) && !footer) { footer = name; lines.push(m[0].trim()); }
  }
  return { lines, nav, footer };
}

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));

export function buildLongformPageSource(args: {
  record: ResourceRecord;
  kind: LongformKind;
  resourceKey: string;
  path: string;
  backPath: string;
  files: Record<string, string>;
}): string {
  const { record: r, kind, resourceKey, path, backPath } = args;
  const chrome = chromeImports(args.files);
  const mark = (f: string) => `${resourceKey}#${r.id}.${f}`;
  const data = {
    name: str(r.name || r.title),
    category: str(r.category),
    date: str(r.published_on),
    author: str(r.author),
    readTime: str(r.read_time),
    client: str(r.client),
    excerpt: str(r.excerpt),
    results: str(r.results),
    image: str(r.image_url),
    body: str(r.body),
  };
  const component = filePathForRoute(path).replace(/^.*\/|\.tsx$/g, '');
  const backLabel = kind === 'articles' ? 'All articles' : 'All work';
  return `import React from 'react';
${chrome.lines.join('\n')}

// Generated from the saved ${kind === 'articles' ? 'article' : 'case study'} "${data.name.replace(/[*/]/g, '')}".
const ENTRY = ${JSON.stringify(data, null, 2)};

function renderBody(text: string) {
  return text.split(/\\n{2,}/).map((block, i) => {
    const t = block.trim();
    if (!t) return null;
    if (t.startsWith('### ')) return <h3 key={i} className="mt-10 mb-3 text-xl font-semibold">{t.slice(4)}</h3>;
    if (t.startsWith('## ')) return <h2 key={i} className="mt-12 mb-4 text-2xl font-semibold">{t.slice(3)}</h2>;
    if (t.startsWith('> ')) return <blockquote key={i} className="my-8 border-l-2 border-primary pl-5 italic text-muted-foreground">{t.replace(/^>\\s?/gm, '')}</blockquote>;
    return <p key={i} className="mb-5 leading-relaxed text-foreground/90">{t.replace(/\\*\\*(.+?)\\*\\*/g, '$1')}</p>;
  });
}

export const ${component} = () => {
  const meta = [ENTRY.client, ENTRY.category, ENTRY.date, ENTRY.author, ENTRY.readTime].filter(Boolean);
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" data-ut-page-role="${kind === 'articles' ? 'article' : 'case-study'}">
      ${chrome.nav ? `<${chrome.nav} currentPath="${backPath}" />` : ''}
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-20">
          <a href="#${backPath}" data-ut-intent="nav.goto" data-ut-path="${backPath}" className="text-sm text-muted-foreground hover:text-foreground">← ${backLabel}</a>
          {meta.length > 0 && <p className="mt-8 text-xs uppercase tracking-widest text-muted-foreground" data-ut-resource="${mark('category')}">{meta.join(' · ')}</p>}
          <h1 className="mt-4 text-4xl md:text-5xl font-semibold leading-tight" data-ut-resource="${mark('name')}">{ENTRY.name}</h1>
          {ENTRY.excerpt && <p className="mt-6 text-lg text-muted-foreground" data-ut-resource="${mark('excerpt')}">{ENTRY.excerpt}</p>}
          {ENTRY.image && <img src={ENTRY.image} alt={ENTRY.name} className="mt-10 w-full rounded-lg object-cover aspect-[16/9]" data-ut-resource="${mark('image_url')}" />}
          {ENTRY.results && <p className="mt-10 border-y border-border py-6 text-lg font-medium" data-ut-resource="${mark('results')}">{ENTRY.results}</p>}
          <div className="mt-10" data-ut-resource="${mark('body')}">
            {ENTRY.body ? renderBody(ENTRY.body) : <p className="text-muted-foreground">Full text coming soon.</p>}
          </div>
        </article>
      </main>
      ${chrome.footer ? `<${chrome.footer} />` : ''}
    </div>
  );
};

export default ${component};
`;
}

const READ_LABEL = /(Read(?:\s+the)?\s+(?:essay|more|article|story|case\s+study|full\s+story|post)|View\s+(?:case\s+study|project|story)|Continue\s+reading|Learn\s+more)/i;

/**
 * Wires the read/view control that follows `title` in listing pages to `href`.
 * Touches only that one control per page; leaves other destinations alone.
 */
export function linkReadButtons(files: Record<string, string>, title: string, href: string, pageId: string, skip: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!title.trim()) return out;
  const esc = title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  const titleRe = new RegExp(esc, 'i');
  for (const [path, src] of Object.entries(files)) {
    if (path === skip || !/^\/src\/(pages|project-components)\/.*\.tsx$/.test(path)) continue;
    // Data-driven listings: entries live in an array (title/slug) and cards
    // render {item.title}; link each read control to base/{item.slug}.
    const dataEntry = src.search(new RegExp(`title\\s*:\\s*['"\`]${esc}`, 'i'));
    if (dataEntry >= 0 && /\bslug\s*:/.test(src)) {
      const base = href.replace(/\/[^/]+$/, '');
      const next = linkDataDrivenReads(src, base);
      if (next !== src) out[path] = next;
      continue;
    }
    const at = src.search(titleRe);
    if (at < 0) continue;
    const window = src.slice(at, at + 2500);
    const label = window.search(READ_LABEL);
    if (label < 0) continue;
    const labelAbs = at + label;
    const open = Math.max(src.lastIndexOf('<a', labelAbs), src.lastIndexOf('<Link', labelAbs), src.lastIndexOf('<button', labelAbs));
    if (open < at) continue;
    const close = src.indexOf('>', open);
    if (close < 0 || close > labelAbs) continue;
    let tag = src.slice(open, close + 1);
    if (tag.includes('data-ut-path="' + href + '"')) continue;
    tag = tag
      .replace(/\s(?:href|to)=(?:"[^"]*"|\{[^}]*\})/g, '')
      .replace(/\sdata-ut-(?:intent|path|target-page-id)="[^"]*"/g, '')
      .replace(/\sonClick=\{[^}]*\}/g, '');
    const selfClose = tag.endsWith('/>');
    const head = tag.replace(/\s*\/?>$/, '');
    const isLink = head.startsWith('<Link');
    const attrs = `${isLink ? ` to="${href}"` : head.startsWith('<a') ? ` href="#${href}"` : ''} data-ut-intent="nav.goto" data-ut-path="${href}" data-ut-target-page-id="${pageId}"`;
    out[path] = src.slice(0, open) + head + attrs + (selfClose ? ' />' : '>') + src.slice(close + 1);
  }
  return out;
}

export function planLongformPage(args: {
  record: ResourceRecord;
  kind: LongformKind;
  resourceKey: string;
  files: Record<string, string>;
  existingPaths: string[];
  industry?: string | null;
}): LongformPlan {
  const title = str(args.record.name || args.record.title) || 'Untitled';
  const slug = str(args.record.slug) || slugifyLongform(title);
  const base = longformBase(args.kind, args.existingPaths, args.industry);
  const path = `${base}/${slug}`;
  const filePath = filePathForRoute(path);
  const pageId = `${args.kind === 'articles' ? 'article' : 'case'}-${slug}`;
  const page = buildLongformPageSource({ record: args.record, kind: args.kind, resourceKey: args.resourceKey, path, backPath: base, files: args.files });
  const linked = linkReadButtons(args.files, title, path, pageId, filePath);
  return { pageId, title, path, filePath, files: { [filePath]: page, ...linked }, linkedFiles: Object.keys(linked) };
}

export interface FoundLongform { kind: LongformKind; title: string; slug?: string; author?: string; excerpt?: string; category?: string; date?: string; readTime?: string; file: string }

const lastMatch = (re: RegExp, s: string) => { let m: RegExpExecArray | null; let last: RegExpExecArray | null = null; const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'); while ((m = g.exec(s))) last = m; return last; };
const clean = (t: string) => t.replace(/\s+/g, ' ').trim();

/**
 * Finds articles / case studies a page already shows by their read controls
 * (e.g. "Read Essay", "View case study"). Source-based, so it works for any
 * industry and for sites generated before content was saved.
 */
export function extractLongformFromSource(files: Record<string, string>): FoundLongform[] {
  const out: FoundLongform[] = [];
  const seen = new Set<string>();
  for (const [file, src] of Object.entries(files)) {
    if (!/^\/src\/pages\/.*\.tsx$/.test(file)) continue;
    const readMatch = src.match(new RegExp(READ_LABEL.source, 'i'));
    if (readMatch && !/learn\s+more/i.test(readMatch[0]) && /\bslug\s*:/.test(src)) {
      // Data-driven listing: read entries from the array literal.
      const kind: LongformKind = /case\s+study|project|story/i.test(readMatch[0]) || /\/(Work|CaseStudies|Portfolio|Projects)\.tsx$/.test(file) ? 'case-studies' : 'articles';
      const field = (chunk: string, k: string) => chunk.match(new RegExp(`\\b${k}\\s*:\\s*['"\`]([^'"\`]+)['"\`]`))?.[1];
      const parts = src.split(/\btitle\s*:\s*(?=['"`])/).slice(1);
      for (const part of parts) {
        const title = clean(part.match(/^['"`]([^'"`]{6,200})['"`]/)?.[1] ?? '');
        if (!title || seen.has(title.toLowerCase())) continue;
        const chunk = part.slice(0, 1500).split(/\n\s*\},?\s*\n\s*\{/)[0];
        if (!field(chunk, 'slug')) continue;
        seen.add(title.toLowerCase());
        out.push({
          kind, title, file,
          slug: field(chunk, 'slug'),
          excerpt: field(chunk, 'excerpt') ?? field(chunk, 'summary') ?? field(chunk, 'description'),
          category: field(chunk, 'category'),
          date: field(chunk, 'publishedDate') ?? field(chunk, 'date'),
          readTime: field(chunk, 'readTime'),
          author: field(chunk, 'name'),
        });
      }
      if (out.some((f) => f.file === file)) continue;
    }
    const re = new RegExp(READ_LABEL.source, 'gi');
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      if (/learn\s+more/i.test(m[0])) continue;
      const before = src.slice(Math.max(0, m.index - 3000), m.index);
      const h = lastMatch(/<h[1-4][^>]*>\s*([^<{]{6,200}?)\s*<\/h[1-4]>/, before);
      const d = lastMatch(/\btitle\s*:\s*['"`]([^'"`]{6,200})['"`]/, before);
      const pick = h && d ? (h.index > d.index ? h : d) : h ?? d;
      if (!pick) continue;
      const title = clean(pick[1]);
      if (seen.has(title.toLowerCase())) continue;
      seen.add(title.toLowerCase());
      const tail = before.slice(pick.index);
      const near = before.slice(Math.max(0, pick.index - 600));
      const kind: LongformKind = /case\s+study|project|story/i.test(m[0]) || /\/(Work|CaseStudies|Portfolio|Projects)\.tsx$/.test(file) ? 'case-studies' : 'articles';
      out.push({
        kind, title, file,
        excerpt: clean(tail.match(/<p[^>]*>\s*([^<{]{30,600}?)\s*<\/p>/)?.[1] ?? tail.match(/\b(?:excerpt|summary|description)\s*:\s*['"`]([^'"`]{30,600})['"`]/)?.[1] ?? '') || undefined,
        date: near.match(/\b([A-Z][a-z]{2,8}\.? \d{1,2}, \d{4})\b/)?.[1],
        readTime: near.match(/\b(\d+\s*min(?:ute)?s?\s*read)\b/i)?.[1],
        category: clean(near.match(/<span[^>]*>\s*([A-Z][A-Za-z &]{2,30})\s*<\/span>/)?.[1] ?? '') || undefined,
      });
    }
  }
  return out;
}

/** Turns each data-driven read control into a Link to `${base}/${var.slug}`. */
export function linkDataDrivenReads(src: string, base: string): string {
  const re = new RegExp(READ_LABEL.source, 'gi');
  let out = src;
  let offset = 0;
  let m: RegExpExecArray | null;
  const original = src;
  while ((m = re.exec(original))) {
    if (/learn\s+more/i.test(m[0])) continue;
    const labelAbs = m.index + offset;
    const before = out.slice(Math.max(0, labelAbs - 4000), labelAbs);
    const v = lastMatch(/\{\s*(\w+)\.title\s*\}/, before)?.[1];
    if (!v) continue;
    const tags = ['<Link', '<a', '<button', '<div', '<span'];
    const open = Math.max(...tags.map((t) => out.lastIndexOf(t, labelAbs)));
    const close = out.indexOf('>', open);
    if (open < 0 || close < 0 || close > labelAbs) continue;
    let start = open;
    let tagName = out.slice(open + 1).match(/^\w+/)?.[0] ?? '';
    // A bare <span> wrapping only the label: link its parent control instead.
    if (tagName === 'span') {
      const parent = Math.max(...['<Link', '<a', '<button', '<div'].map((t) => out.lastIndexOf(t, open - 1)));
      const parentClose = out.indexOf('>', parent);
      if (parent < 0 || parentClose > open || out.slice(parentClose + 1, open).trim()) continue;
      start = parent;
      tagName = out.slice(parent + 1).match(/^\w+/)?.[0] ?? '';
    }
    const res = replaceTag(out, start, tagName, v, base);
    if (!res) continue;
    offset += res.length - out.length;
    out = res;
  }
  return out;
}

function replaceTag(out: string, open: number, tagName: string, v: string, base: string): string | null {
  const close = out.indexOf('>', open);
  const tag = out.slice(open, close + 1);
  if (tag.includes('data-ut-intent="nav.goto"')) return null;
  const attrs = tag
    .replace(/^<\w+/, '')
    .replace(/\s*\/?>$/, '')
    .replace(/\s(?:href|to)=(?:"[^"]*"|\{[^}]*\})/g, '')
    .replace(/\sonClick=\{[^}]*\}/g, '');
  const target = `{\`${base}/\${${v}.slug}\`}`;
  const link = `<Link to=${target} data-ut-intent="nav.goto" data-ut-path=${target}${attrs}>`;
  if (tagName === 'Link') return out.slice(0, open) + link + out.slice(close + 1);
  // Rename the matching close tag (first one after open with no nested same tag).
  const endTag = `</${tagName}>`;
  const end = out.indexOf(endTag, close);
  const nested = out.slice(close + 1, end).includes(`<${tagName}`);
  if (end < 0 || nested) return null;
  let next = out.slice(0, open) + link + out.slice(close + 1, end) + '</Link>' + out.slice(end + endTag.length);
  if (!/import\s*\{[^}]*\bLink\b[^}]*\}\s*from\s*['"]react-router-dom['"]/.test(next)) next = `import { Link } from 'react-router-dom';\n` + next;
  return next;
}
