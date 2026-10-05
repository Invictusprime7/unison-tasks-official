/**
 * Structural floor every App Builder page must clear before it is accepted:
 * shared site chrome (nav + footer), a real body composition, and imagery on
 * media-led pages. It inspects the page and the local components it renders
 * (one level deep), so chrome and sections authored as project components count.
 */

export interface PageStructureRequirement {
  role: string;
  /** Minimum rendered body sections (excluding nav/footer). */
  minSections: number;
  /** Whether this page must show real photography. */
  imageLed: boolean;
}

const IMAGE_LED_ROLES = new Set(['home', 'gallery', 'work', 'portfolio', 'about', 'shop', 'products', 'collection', 'menu']);

export function pageStructureRequirement(role: string, contractMinSections?: number): PageStructureRequirement {
  const floor = role === 'home' ? 3 : 2;
  return {
    role,
    minSections: Math.max(floor, Math.min(contractMinSections ?? floor, 4)),
    imageLed: IMAGE_LED_ROLES.has(role),
  };
}

const LOCAL_IMPORT = /import\s+(?:(\w+)\s*,?\s*)?(?:\{([^}]*)\})?\s*from\s*['"]((?:\.{1,2}\/|@\/)[^'"]+)['"]/g;
const IMAGE_SIGNAL = /<img\b|\bbackgroundImage\b|url\(\s*['"`]?https?:|['"`]https?:\/\/[^'"`\s]+\.(?:jpe?g|png|webp|avif)|['"`]https?:\/\/images\.unsplash\.com|\b(?:image|imageUrl|imageSrc|src|images|photo|photos|media|cover|poster)\s*[:=]\s*[{'"`[]/i;
const NAV_NAME = /(?:Nav|Navbar|Navigation|Header|Menu)\b/;
const FOOTER_NAME = /Footer\b/;

function resolveImport(specifier: string, from: string, files: Readonly<Record<string, string>>): string | undefined {
  let base: string;
  if (specifier.startsWith('@/')) base = `/src/${specifier.slice(2)}`;
  else {
    const parts = from.split('/').slice(0, -1);
    for (const seg of specifier.split('/')) {
      if (seg === '..') parts.pop();
      else if (seg !== '.') parts.push(seg);
    }
    base = parts.join('/');
  }
  base = base.replace(/\.(?:tsx|ts|jsx|js)$/, '');
  for (const ext of ['.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts']) {
    if (files[base + ext] !== undefined) return base + ext;
  }
  return undefined;
}

interface ImportedComponent { name: string; path?: string; specifier: string }

function importedComponents(path: string, source: string, files: Readonly<Record<string, string>>): ImportedComponent[] {
  const out: ImportedComponent[] = [];
  for (const match of source.matchAll(LOCAL_IMPORT)) {
    const resolved = resolveImport(match[3], path, files);
    const names = [
      ...(match[1] ? [match[1]] : []),
      ...(match[2] ?? '').split(',').map((n) => n.trim().split(/\s+as\s+/).pop()!.trim()).filter(Boolean),
    ].filter((n) => /^[A-Z]/.test(n));
    for (const name of names) out.push({ name, path: resolved, specifier: match[3] });
  }
  return out;
}

function rendered(source: string, name: string): boolean {
  return new RegExp(`<${name}(?=[\\s/>])`).test(source);
}

export function findPageStructureIssues(
  path: string,
  source: string,
  files: Readonly<Record<string, string>>,
  requirement: PageStructureRequirement,
): string[] {
  const issues: string[] = [];
  const used = importedComponents(path, source, files).filter((c) => rendered(source, c.name));
  const usedSources = used.map((c) => (c.path ? files[c.path] ?? '' : ''));

  const hasNav = /<(?:nav|header)\b/.test(source) || used.some((c) => NAV_NAME.test(c.name));
  const hasFooter = /<footer\b/.test(source) || used.some((c) => FOOTER_NAME.test(c.name));
  if (!hasNav) {
    issues.push(`${path} renders no site navigation. Render the shared site nav at the top of the page (one shared component, e.g. SiteNav in /src/project-components/site/, linking to every route) — chrome is NOT added automatically.`);
  }
  if (!hasFooter) {
    issues.push(`${path} renders no site footer. Render the shared site footer at the bottom of the page (one shared component, e.g. SiteFooter in /src/project-components/site/).`);
  }

  const bodyComponents = used.filter((c) => !NAV_NAME.test(c.name) && !FOOTER_NAME.test(c.name) && !/\/(?:components|unison)\/ui(?:\/|$)|\/lib\//.test(c.specifier));
  const sectionTags = (source.match(/<section\b/g) ?? []).length;
  const sections = sectionTags + bodyComponents.length;
  if (sections < requirement.minSections) {
    issues.push(`${path} has only ${sections} body section(s); the ${requirement.role} page needs at least ${requirement.minSections} distinct sections that follow its COMPOSITION TARGET (hero plus the suggested section order, using certified design sources or project-local components).`);
  }

  if (requirement.imageLed) {
    const hasImagery = IMAGE_SIGNAL.test(source) || usedSources.some((s) => IMAGE_SIGNAL.test(s))
      || used.some((c) => c.specifier.includes('/unison/design-sources/') && /Gallery|Hero(?!PageTitle|Underline|Centered)|AboutImage|Team|BeforeAfter/.test(c.name));
    if (!hasImagery) {
      issues.push(`${path} shows no photography. The ${requirement.role} page is image-led: use real business-appropriate photos (an image-led hero, gallery or media split), never a text-only page.`);
    }
  }
  return issues;
}
