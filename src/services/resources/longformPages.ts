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
  for (const m of home.matchAll(/^import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?\s*$/gm)) {
    if (/Nav/.test(m[1]) && !nav) { nav = m[1]; lines.push(m[0].trim()); }
    else if (/Footer/.test(m[1]) && !footer) { footer = m[1]; lines.push(m[0].trim()); }
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
