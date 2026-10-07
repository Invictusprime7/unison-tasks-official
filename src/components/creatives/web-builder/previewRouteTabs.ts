/**
 * Builder page tabs are a projection of the routes the Live Preview actually
 * renders: the `<Route path>` entries in the VFS `/src/App.tsx`. Registry
 * pages that the preview does not route are hidden, and every rendered route
 * gets a tab even if the registry lacks it, so the two can never disagree.
 */
import type { PageTab } from './PageNavigationBar';

export interface RegistryPageLike {
  pageId: string;
  path: string;
  title?: string;
  isHome?: boolean;
  navOrder?: number;
}

/** Prefix for tabs that map to a rendered route with no registry page. */
export const ROUTE_TAB_PREFIX = 'route:';

const normalizeRoute = (route: string) => {
  const trimmed = route.trim().replace(/[?#].*$/, '');
  if (!trimmed || trimmed === '/') return '/';
  return ('/' + trimmed.replace(/^\/+/, '')).replace(/\/+$/, '').toLowerCase();
};

/** Ordered, de-duplicated route paths rendered by App.tsx (excludes `*`). */
export function extractRenderedRoutes(appSource: string | undefined): string[] {
  if (!appSource) return [];
  const routes: string[] = [];
  const re = /<Route\b[^>]*?\bpath=\{?\s*["'`]([^"'`]+)["'`]/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(appSource))) {
    const raw = match[1];
    if (raw.includes('*') || raw.includes(':')) continue;
    const route = normalizeRoute(raw);
    if (!routes.includes(route)) routes.push(route);
  }
  return routes;
}

const labelFromRoute = (route: string) => {
  if (route === '/') return 'Home';
  const last = route.split('/').filter(Boolean).pop() ?? route;
  return last.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export function buildPreviewRouteTabs(
  pages: RegistryPageLike[],
  appSource: string | undefined,
): PageTab[] {
  const byRoute = new Map<string, RegistryPageLike>();
  for (const page of pages) {
    const key = page.isHome ? '/' : normalizeRoute(page.path);
    if (!byRoute.has(key)) byRoute.set(key, page);
  }
  const rendered = extractRenderedRoutes(appSource);

  // No router yet (first paint before App.tsx exists): fall back to registry order.
  if (rendered.length === 0) {
    return pages
      .slice()
      .sort((a, b) => (a.isHome ? -1 : b.isHome ? 1 : (a.navOrder ?? 0) - (b.navOrder ?? 0)))
      .map((p) => ({ path: p.pageId, label: p.title || labelFromRoute(normalizeRoute(p.path)), isMain: !!p.isHome }));
  }

  return rendered.map((route) => {
    const page = byRoute.get(route);
    return page
      ? { path: page.pageId, label: page.title || labelFromRoute(route), isMain: route === '/' }
      : { path: `${ROUTE_TAB_PREFIX}${route}`, label: labelFromRoute(route), isMain: route === '/' };
  });
}

const joinPath = (fromFile: string, spec: string): string => {
  const parts = fromFile.split('/').slice(0, -1);
  for (const seg of spec.split('/')) {
    if (!seg || seg === '.') continue;
    if (seg === '..') parts.pop();
    else parts.push(seg);
  }
  return parts.join('/') || '/';
};

const resolveSpecifier = (fromFile: string, spec: string, files: Record<string, unknown>): string | null => {
  const base = spec.startsWith('@/') ? `/src/${spec.slice(2)}` : spec.startsWith('.') ? joinPath(fromFile, spec) : null;
  if (!base) return null;
  const candidates = [base, `${base}.tsx`, `${base}.jsx`, `${base}.ts`, `${base}.js`, `${base}/index.tsx`];
  return candidates.find((candidate) => candidate in files) ?? null;
};

/**
 * Source file of the page the Live Preview renders at `route`, read from the
 * canonical router itself so the AI edits exactly the page the user sees.
 */
export function resolveRouteSourceFile(
  files: Record<string, string>,
  route: string | null | undefined,
  appPath = '/src/App.tsx',
): string | null {
  const appSource = files[appPath];
  if (!appSource || route == null) return null;
  const wanted = normalizeRoute(route);
  const re = /<Route\b[^>]*?\bpath=\{?\s*["'`]([^"'`]+)["'`][^>]*?\belement=\{\s*<\s*([A-Z][\w]*)/g;
  let match: RegExpExecArray | null;
  let component: string | null = null;
  while ((match = re.exec(appSource))) {
    if (normalizeRoute(match[1]) === wanted) { component = match[2]; break; }
  }
  if (!component) return null;
  const importRe = new RegExp(`import\\s+(?:${component}\\b[^'"]*|\\{[^}]*\\b${component}\\b[^}]*\\})\\s+from\\s+['"]([^'"]+)['"]`);
  const spec = appSource.match(importRe)?.[1];
  return spec ? resolveSpecifier(appPath, spec, files) : null;
}

/** Local files a page imports directly (shared nav, footer, sections). */
export function resolveLocalImports(files: Record<string, string>, fromFile: string): string[] {
  const source = files[fromFile];
  if (!source) return [];
  const out: string[] = [];
  const re = /import\s+[^'"]*?from\s+['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source))) {
    const resolved = resolveSpecifier(fromFile, match[1], files);
    if (resolved && !out.includes(resolved) && !resolved.includes('/unison/ui/')) out.push(resolved);
  }
  return out;
}
