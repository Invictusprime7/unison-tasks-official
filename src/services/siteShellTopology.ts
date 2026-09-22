/**
 * Canonical SiteShell topology projection (P0.6).
 *
 * Route truth is owned by the PageRegistry alone. Design artifacts own how the
 * navbar and footer LOOK; the business runtime owns identity and CTA intents;
 * Lane B owns the page body. None of them own which routes exist.
 *
 * This module projects the registry into the one navigation shape every
 * consumer must use (generation brief, Lane B prompts, navbar/footer
 * renderers, router, published sitemap) and asserts closure between them, so
 * "Wizard selected pages = router routes = visible chrome" is checkable
 * instead of hoped for.
 *
 * It creates no new registry and no new writer — it is a pure projection of
 * the existing canonical PageRegistry.
 */

import type { PageRegistry, BuilderPage } from '@/types/pageRegistry';

export interface SiteShellRoute {
  pageId: string;
  /** Visitor-facing route path, e.g. "/about". */
  path: string;
  /** HashRouter href the page body must use, e.g. "#/about". */
  href: string;
  /** VFS module path, e.g. "/src/pages/About.tsx". */
  filePath: string;
  label: string;
  isHome: boolean;
  showInNav: boolean;
  navOrder: number;
}

export interface SiteShellTopology {
  home: SiteShellRoute | null;
  /** Every registered route, nav order. */
  routes: SiteShellRoute[];
  /** Links the primary navbar must render, in order. */
  primaryNav: SiteShellRoute[];
  /** Links the footer must render — every route, including hidden-from-nav utility pages is excluded. */
  footerNav: SiteShellRoute[];
}

export interface SiteShellClosureViolation {
  code:
    | 'stale-chrome-link'
    | 'missing-nav-link'
    | 'duplicate-primary-navbar'
    | 'duplicate-footer'
    | 'router-route-missing'
    | 'router-route-unknown';
  message: string;
  pageId?: string;
  path?: string;
}

const NAV_HIDDEN_PAGE_TYPES = new Set(['checkout', 'thankyou', 'confirmation']);

function toHref(path: string): string {
  if (!path) return '#/';
  if (path.startsWith('#')) return path;
  return `#${path.startsWith('/') ? path : `/${path}`}`;
}

function derivedFilePath(page: BuilderPage): string {
  if (page.filePath) return page.filePath;
  const slug = (page.path || '/').replace(/^\//, '') || 'home';
  const name = slug
    .split(/[-/]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') || 'Home';
  return `/src/pages/${page.isHome ? 'Home' : name}.tsx`;
}

/** Project the canonical PageRegistry into the site shell navigation model. */
export function buildSiteShellTopology(registry: PageRegistry): SiteShellTopology {
  const routes: SiteShellRoute[] = Object.values(registry.pages ?? {})
    .map((page) => ({
      pageId: page.pageId,
      path: page.path,
      href: toHref(page.path),
      filePath: derivedFilePath(page),
      label: page.title || page.path,
      isHome: Boolean(page.isHome),
      showInNav: page.showInNav !== false && !NAV_HIDDEN_PAGE_TYPES.has(String(page.pageType)),
      navOrder: typeof page.navOrder === 'number' ? page.navOrder : 0,
    }))
    .sort((left, right) => left.navOrder - right.navOrder || left.path.localeCompare(right.path));

  return {
    home: routes.find((route) => route.isHome) ?? null,
    routes,
    primaryNav: routes.filter((route) => route.showInNav),
    footerNav: routes.filter((route) => route.showInNav),
  };
}

const INTERNAL_HREF = /href=["'](#?\/[^"'#?]*)["']/g;

function normalizeLinkPath(raw: string): string {
  const withoutHash = raw.startsWith('#') ? raw.slice(1) : raw;
  const trimmed = withoutHash.split('?')[0].replace(/\/+$/, '');
  return trimmed || '/';
}

function countMatches(source: string, patterns: RegExp[]): number {
  return patterns.reduce((total, pattern) => total + (source.match(pattern)?.length ?? 0), 0);
}

/**
 * Deterministic closure assertion: page chrome links, router routes and the
 * registry projection must describe exactly the same site.
 */
export function assertSiteShellClosure(
  topology: SiteShellTopology,
  input: {
    /** Authored page sources keyed by VFS path. */
    pageSources?: Record<string, string>;
    /** Route paths the generated router actually renders. */
    routerRoutes?: readonly string[];
  } = {},
): SiteShellClosureViolation[] {
  const violations: SiteShellClosureViolation[] = [];
  const known = new Set(topology.routes.map((route) => normalizeLinkPath(route.path)));
  known.add('/');

  for (const [filePath, source] of Object.entries(input.pageSources ?? {})) {
    if (!source) continue;
    const route = topology.routes.find((candidate) => candidate.filePath === filePath);

    const linked = new Set<string>();
    for (const match of source.matchAll(INTERNAL_HREF)) {
      const linkPath = normalizeLinkPath(match[1]);
      linked.add(linkPath);
      if (!known.has(linkPath)) {
        violations.push({
          code: 'stale-chrome-link',
          message: `${filePath} links to "${match[1]}", which is not a registered route.`,
          pageId: route?.pageId,
          path: linkPath,
        });
      }
    }

    for (const navRoute of topology.primaryNav) {
      const navPath = normalizeLinkPath(navRoute.path);
      if (navPath === '/' || linked.has(navPath)) continue;
      violations.push({
        code: 'missing-nav-link',
        message: `${filePath} chrome omits the registered nav route "${navRoute.path}" (${navRoute.label}).`,
        pageId: navRoute.pageId,
        path: navRoute.path,
      });
    }

    const navbarCount = countMatches(source, [/<header\b/g, /<FloatingNavbar\b/g]);
    if (navbarCount > 1) {
      violations.push({
        code: 'duplicate-primary-navbar',
        message: `${filePath} renders ${navbarCount} competing primary nav bars.`,
        pageId: route?.pageId,
      });
    }
    const footerCount = countMatches(source, [/<footer\b/g]);
    if (footerCount > 1) {
      violations.push({
        code: 'duplicate-footer',
        message: `${filePath} renders ${footerCount} footers.`,
        pageId: route?.pageId,
      });
    }
  }

  if (input.routerRoutes) {
    const routerSet = new Set(input.routerRoutes.map(normalizeLinkPath));
    for (const route of topology.routes) {
      if (!routerSet.has(normalizeLinkPath(route.path))) {
        violations.push({
          code: 'router-route-missing',
          message: `Router does not render the registered route "${route.path}" (${route.label}).`,
          pageId: route.pageId,
          path: route.path,
        });
      }
    }
    for (const routerRoute of routerSet) {
      if (routerRoute !== '/' && routerRoute !== '*' && !known.has(routerRoute)) {
        violations.push({
          code: 'router-route-unknown',
          message: `Router renders "${routerRoute}", which is not in the PageRegistry.`,
          path: routerRoute,
        });
      }
    }
  }

  return violations;
}

/** Human/AI-readable navigation contract line used by every generation lane. */
export function describeSiteShellNavigation(topology: SiteShellTopology): string {
  const primary = topology.primaryNav.map((route) => `${route.label} → ${route.href}`).join(' | ') || 'none';
  const hidden = topology.routes
    .filter((route) => !route.showInNav)
    .map((route) => `${route.label} → ${route.href}`)
    .join(' | ');
  return [
    `Primary navigation (PageRegistry order, exact labels and hrefs): ${primary}.`,
    hidden ? `Hidden from nav (reachable only from in-page CTAs): ${hidden}.` : '',
    'These links are route truth. Never invent, rename, drop, reorder or re-point them; design freedom applies to the presentation only.',
  ]
    .filter(Boolean)
    .join(' ');
}
