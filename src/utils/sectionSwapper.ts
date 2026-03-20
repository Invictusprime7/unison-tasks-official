/**
 * Section Swapper Utility
 * 
 * Parses a compositionToReactCode-generated VFS file to:
 * 1. Identify which sections exist (from SECTIONS array or JSX tags)
 * 2. Extract content from a target section's props/JSX
 * 3. Swap the rendering for that section with a variant's JSX
 */

import type { SectionType } from '@/sections/types';
import type { ExtractedSectionContent } from '@/sections/variants/types';
import { getVariantById, VARIANT_REGISTRY } from '@/sections/variants/registry';
import { extractSectionContentFromJSX, findSectionBounds } from '@/sections/variants/contentExtractor';
import type { VariantId } from '@/sections/variants/types';

/** Detected section in current preview code */
export interface DetectedSection {
  id: string;
  type: SectionType;
  index: number; // position in SECTIONS array
  props: Record<string, any>;
  /** The HTML tag name used (section, header, nav, footer, main) — for JSX replacement */
  tagName?: string;
  /** Index of this tag among all tags of the same name — for findSectionBounds */
  tagIndex?: number;
}

/**
 * Parse the SECTIONS array from compositionToReactCode output.
 * Returns the detected sections with their types and props.
 */
export function detectSections(code: string): DetectedSection[] {
  // Strategy 1: Parse the JSON SECTIONS array (compositionToReactCode output)
  const jsonSections = parseJsonSectionsArray(code);
  if (jsonSections.length > 0) return jsonSections;

  // Strategy 2: Parse JSX tags (<section>, <header>, <nav>, <footer>)
  return parseJsxSectionTags(code);
}

/** Strategy 1: Find `const SECTIONS = [...]` and JSON.parse it */
function parseJsonSectionsArray(code: string): DetectedSection[] {
  const startMatch = code.match(/const\s+SECTIONS\s*=\s*\[/);
  if (!startMatch || startMatch.index === undefined) return [];

  const startIdx = startMatch.index + startMatch[0].length - 1;
  let depth = 0;
  let endIdx = -1;
  for (let i = startIdx; i < code.length; i++) {
    if (code[i] === '[') depth++;
    else if (code[i] === ']') {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }
  if (endIdx === -1) return [];

  const sectionsStr = code.slice(startIdx, endIdx + 1);

  try {
    const sections = JSON.parse(sectionsStr);
    if (!Array.isArray(sections)) return [];
    return sections.map((s: any, i: number) => ({
      id: s.id || `section-${i}`,
      type: s.type as SectionType,
      index: i,
      props: s.props || {},
    }));
  } catch {
    // Fallback: regex extraction from the JSON-like string
    const results: DetectedSection[] = [];
    const pattern = /"id"\s*:\s*"([^"]+)"\s*,\s*"type"\s*:\s*"([^"]+)"/g;
    let match: RegExpExecArray | null;
    let idx = 0;
    while ((match = pattern.exec(sectionsStr)) !== null) {
      results.push({ id: match[1], type: match[2] as SectionType, index: idx++, props: {} });
    }
    return results;
  }
}

/** Strategy 2: Parse JSX semantic tags and infer section type from id/class/tag */
function parseJsxSectionTags(code: string): DetectedSection[] {
  const results: DetectedSection[] = [];
  const tagRegex = /<(section|header|nav|footer|main)\b([^>]*?)>/gi;
  let match: RegExpExecArray | null;
  let idx = 0;

  // Track per-tagName index for findSectionBounds
  const tagCounts: Record<string, number> = {};

  while ((match = tagRegex.exec(code)) !== null) {
    const tagName = match[1].toLowerCase();
    const attrs = match[2];

    // Track tag index
    tagCounts[tagName] = (tagCounts[tagName] || 0);
    const tagIndex = tagCounts[tagName];
    tagCounts[tagName]++;

    // Extract id
    const idMatch = attrs.match(/\bid=["'{]([^"'}]+)["'}]/);
    const id = idMatch?.[1] || `${tagName}-${idx}`;

    // Extract className for type inference
    const classMatch = attrs.match(/className=["'{]([^"'}]+)["'}]/);
    const className = (classMatch?.[1] || '').toLowerCase();
    const lowerId = id.toLowerCase();

    // Also check data-variant attribute
    const dataVariantMatch = attrs.match(/data-variant=["']([^"']+)["']/);
    const dataVariant = dataVariantMatch?.[1] || '';

    // Infer SectionType from tag/id/class/data-variant
    let type: SectionType = inferSectionType(tagName, lowerId, className, dataVariant);

    // Also check the function name wrapping this tag
    const beforeTag = code.slice(Math.max(0, match.index - 500), match.index);
    const fnMatch = beforeTag.match(/function\s+(\w+)\s*\([^)]*\)\s*\{[^}]*$/);
    if (fnMatch) {
      const fnType = fnNameToSectionType(fnMatch[1]);
      if (fnType) type = fnType;
    }

    // Also check for const Component = () => pattern
    const arrowMatch = beforeTag.match(/(?:const|let)\s+(\w+)\s*=\s*(?:\([^)]*\)|)\s*=>\s*(?:\{[^}]*)?$/);
    if (arrowMatch) {
      const fnType = fnNameToSectionType(arrowMatch[1]);
      if (fnType) type = fnType;
    }

    results.push({ id, type, index: idx++, props: {}, tagName, tagIndex });
  }

  return results;
}

/** Infer SectionType from tag name, id, className, and data-variant */
function inferSectionType(tagName: string, lowerId: string, className: string, dataVariant: string): SectionType {
  // data-variant is most reliable: "hero:centered" -> "hero"
  if (dataVariant) {
    const dvType = dataVariant.split(':')[0] as SectionType;
    if (dvType) return dvType;
  }

  if (tagName === 'nav' || lowerId.includes('nav') || className.includes('nav')) return 'navbar';
  if (tagName === 'footer' || lowerId.includes('footer') || className.includes('footer')) return 'footer';
  if (tagName === 'header' && !lowerId.includes('hero')) return 'navbar';
  if (lowerId.includes('hero') || className.includes('hero')) return 'hero';
  if (lowerId.includes('cta') || className.includes('cta')) return 'cta';
  if (lowerId.includes('service') || className.includes('service')) return 'services';
  if (lowerId.includes('feature') || className.includes('feature')) return 'features';
  if (lowerId.includes('pricing') || className.includes('pricing')) return 'pricing';
  if (lowerId.includes('testimonial') || className.includes('testimonial')) return 'testimonials';
  if (lowerId.includes('team') || className.includes('team')) return 'team';
  if (lowerId.includes('gallery') || className.includes('gallery')) return 'gallery';
  if (lowerId.includes('faq') || className.includes('faq')) return 'faq';
  if (lowerId.includes('contact') || className.includes('contact')) return 'contact';
  if (lowerId.includes('stat') || className.includes('stat')) return 'stats';
  if (lowerId.includes('about') || className.includes('about')) return 'about';
  return 'hero'; // fallback
}

/** Map function/component names to section types */
function fnNameToSectionType(name: string): SectionType | null {
  const n = name.toLowerCase();
  const map: Record<string, SectionType> = {
    navbar: 'navbar', nav: 'navbar', navigation: 'navbar',
    hero: 'hero', herosection: 'hero', herobanner: 'hero',
    cta: 'cta', calltoaction: 'cta',
    footer: 'footer', footersection: 'footer',
    services: 'services', servicesection: 'services',
    features: 'features', featuresection: 'features',
    testimonials: 'testimonials', testimonialsection: 'testimonials',
    pricing: 'pricing', pricingsection: 'pricing',
    contact: 'contact', contactsection: 'contact',
    faq: 'faq', faqsection: 'faq',
    team: 'team', teamsection: 'team',
    stats: 'stats', statssection: 'stats',
    about: 'about', aboutsection: 'about',
    gallery: 'gallery', gallerysection: 'gallery',
  };
  return map[n] || null;
}

/**
 * Convert section props (from the composition data model) to ExtractedSectionContent
 * for use with variant renderJSX functions.
 */
export function propsToExtractedContent(
  sectionType: SectionType,
  props: Record<string, any>
): ExtractedSectionContent {
  const content: ExtractedSectionContent = {};

  switch (sectionType) {
    case 'hero':
      content.heading = props.headline;
      content.subheading = props.subheadline || props.description;
      content.badge = props.badge;
      content.imageSrc = props.image || props.backgroundImage;
      if (props.ctas?.length) {
        content.ctaButtons = props.ctas.map((c: any, i: number) => ({
          text: c.label,
          href: c.href || (c.intent ? `#${c.intent}` : '#'),
          isPrimary: i === 0 || c.variant !== 'outline',
        }));
      }
      break;

    case 'navbar':
      content.brandName = props.brand;
      if (props.links?.length) {
        content.navLinks = props.links.map((l: any) => ({
          text: l.label,
          href: l.href,
        }));
      }
      if (props.cta) {
        content.ctaButtons = [{
          text: props.cta.label,
          href: props.cta.href || (props.cta.intent ? `#${props.cta.intent}` : '#'),
          isPrimary: true,
        }];
      }
      break;

    case 'cta':
      content.heading = props.headline;
      content.subheading = props.description;
      if (props.ctas?.length) {
        content.ctaButtons = props.ctas.map((c: any, i: number) => ({
          text: c.label,
          href: c.href || (c.intent ? `#${c.intent}` : '#'),
          isPrimary: i === 0 || c.variant !== 'outline',
        }));
      }
      break;

    case 'pricing':
      content.heading = props.headline;
      content.subheading = props.subheadline;
      if (props.tiers?.length) {
        content.tiers = props.tiers.map((t: any) => ({
          name: t.name,
          price: t.price,
          period: t.period,
          description: t.description,
          features: t.features || [],
          cta: { text: t.cta?.label || 'Get Started', href: t.cta?.href || '#' },
          highlighted: t.highlighted,
          badge: t.badge,
        }));
      }
      break;

    case 'testimonials':
      content.heading = props.headline;
      content.subheading = props.subheadline;
      if (props.items?.length) {
        content.testimonials = props.items.map((t: any) => ({
          quote: t.quote,
          author: t.author,
          role: t.role,
          avatar: t.avatar,
          rating: t.rating,
        }));
      }
      break;

    case 'team':
      content.heading = props.headline;
      content.subheading = props.subheadline;
      if (props.members?.length) {
        content.teamMembers = props.members.map((m: any) => ({
          name: m.name,
          role: m.role,
          bio: m.bio,
          image: m.image,
        }));
      }
      break;

    case 'gallery':
      content.heading = props.headline;
      content.subheading = props.subheadline;
      if (props.items?.length) {
        content.galleryItems = props.items.map((g: any) => ({
          src: g.src,
          alt: g.alt,
          caption: g.caption,
          category: g.category,
        }));
      }
      break;

    case 'faq':
      content.heading = props.headline;
      content.subheading = props.subheadline;
      if (props.items?.length) {
        content.faqItems = props.items.map((f: any) => ({
          question: f.question,
          answer: f.answer,
        }));
      }
      break;

    case 'stats':
      content.heading = props.headline;
      if (props.items?.length) {
        content.statItems = props.items.map((s: any) => ({
          value: s.value,
          label: s.label,
          icon: s.icon,
        }));
      }
      break;

    case 'about':
      content.heading = props.headline;
      content.description = props.description;
      content.imageSrc = props.image;
      content.layout = props.layout;
      if (props.cta) {
        content.ctaButtons = [{
          text: props.cta.label || 'Learn More',
          href: props.cta.href || '#',
          isPrimary: true,
        }];
      }
      break;

    case 'logo-cloud':
      content.heading = props.headline;
      if (props.logos?.length) {
        content.logos = props.logos.map((l: any) => ({
          name: l.name,
          src: l.src,
        }));
      }
      break;

    default:
      content.heading = props.headline || props.title;
      content.subheading = props.subheadline || props.description;
      break;
  }

  return content;
}

/**
 * Apply a section variant swap to the current code.
 * 
 * Two strategies:
 *   1. Composition templates: inject override function + modify SECTION_MAP render
 *   2. AI-generated templates: find section JSX boundaries + replace with variant JSX
 * 
 * Returns the modified code string.
 */
export function swapSectionVariant(
  code: string,
  sectionId: string,
  variantId: VariantId,
): string {
  const variant = getVariantById(variantId);
  if (!variant) {
    console.warn(`[SectionSwapper] Variant not found: ${variantId}`);
    return code;
  }

  // Detect sections to find the target
  const sections = detectSections(code);
  const targetSection = sections.find(s => s.id === sectionId);
  if (!targetSection) {
    console.warn(`[SectionSwapper] Section not found: ${sectionId}`);
    return code;
  }

  // Strategy 1: Composition-based templates (has SECTION_MAP)
  const hasSectionMap = code.includes('SECTION_MAP') || code.includes('// Section Map');
  if (hasSectionMap) {
    return swapCompositionSection(code, sectionId, targetSection, variant);
  }

  // Strategy 2: Direct JSX replacement for AI-generated templates
  return swapJsxSection(code, targetSection, variant);
}

/** Strategy 1: Composition template swap (inject override function) */
function swapCompositionSection(
  code: string,
  sectionId: string,
  targetSection: DetectedSection,
  variant: import('@/sections/variants/types').SectionVariant,
): string {
  const content = propsToExtractedContent(targetSection.type, targetSection.props);
  const variantJSX = variant.renderJSX(content);

  const overrideFnName = `__Variant_${sectionId.replace(/[^a-zA-Z0-9]/g, '_')}`;
  
  const sectionMapMarker = '// Section Map';
  const altMarker = 'const SECTION_MAP';
  const insertPoint = code.indexOf(sectionMapMarker) !== -1 
    ? code.indexOf(sectionMapMarker)
    : code.indexOf(altMarker);
  
  if (insertPoint === -1) return code;

  const overrideFn = `
// Variant override: ${variant.id} for section "${sectionId}"
function ${overrideFnName}() {
  return (
${variantJSX}
  );
}

`;

  let modifiedCode = code.slice(0, insertPoint) + overrideFn + code.slice(insertPoint);

  const renderPattern = /\{SECTIONS\.filter\(s => !s\.hidden\)\.map\(s => \{[\s\S]*?return <C key=\{s\.id\} props=\{s\.props\} \/>;[\s\S]*?\}\)\}/;
  
  modifiedCode = modifiedCode.replace(renderPattern, (match) => {
    return match.replace(
      'return <C key={s.id} props={s.props} />;',
      `if (s.id === '${sectionId}') return <${overrideFnName} key={s.id} />;
        return <C key={s.id} props={s.props} />;`
    );
  });

  return modifiedCode;
}

/** Strategy 2: Direct JSX replacement for AI-generated templates */
function swapJsxSection(
  code: string,
  targetSection: DetectedSection,
  variant: import('@/sections/variants/types').SectionVariant,
): string {
  const tagName = targetSection.tagName;
  const tagIndex = targetSection.tagIndex;

  if (!tagName || tagIndex === undefined) {
    console.warn('[SectionSwapper] No tagName/tagIndex for JSX swap');
    return code;
  }

  // Find the JSX boundaries of this section
  const bounds = findSectionBounds(code, tagName, tagIndex);
  if (!bounds) {
    console.warn(`[SectionSwapper] Could not find bounds for <${tagName}> index=${tagIndex}`);
    return code;
  }

  // Extract the old section's source code
  const oldSectionSource = code.slice(bounds.start, bounds.end);

  // Extract content from the old section for content preservation
  const content = extractSectionContentFromJSX(oldSectionSource);

  // If composition props are available, merge them in
  if (Object.keys(targetSection.props).length > 0) {
    const propsContent = propsToExtractedContent(targetSection.type, targetSection.props);
    if (!content.heading && propsContent.heading) content.heading = propsContent.heading;
    if (!content.subheading && propsContent.subheading) content.subheading = propsContent.subheading;
    if (!content.brandName && propsContent.brandName) content.brandName = propsContent.brandName;
    if (!content.ctaButtons?.length && propsContent.ctaButtons?.length) content.ctaButtons = propsContent.ctaButtons;
    if (!content.navLinks?.length && propsContent.navLinks?.length) content.navLinks = propsContent.navLinks;
    if (!content.imageSrc && propsContent.imageSrc) content.imageSrc = propsContent.imageSrc;
    if (!content.badge && propsContent.badge) content.badge = propsContent.badge;
  }

  // Generate the new variant JSX
  const variantJSX = variant.renderJSX(content);

  // Replace the old section with the new variant JSX
  let modifiedCode = code.slice(0, bounds.start) + variantJSX + code.slice(bounds.end);

  // Ensure THEME helpers exist — if the code doesn't have a THEME constant,
  // inject a fallback theme + helpers so the variant JSX renders correctly
  if (!code.includes('const THEME') && !code.includes('const THEME =')) {
    modifiedCode = injectThemeHelpers(modifiedCode);
  }

  return modifiedCode;
}

/**
 * Inject a fallback THEME object and style helpers into AI-generated code
 * that doesn't already have them. Extracts colors from existing Tailwind
 * classes where possible, otherwise uses a neutral palette.
 */
function injectThemeHelpers(code: string): string {
  // Extract primary color from existing Tailwind classes if possible
  const primaryColorMatch = code.match(/(?:bg|text|border)-(?:blue|indigo|violet|purple|pink|rose|emerald|teal|cyan|amber|orange|red|green|sky)-(\d{3})/);
  const colorFamily = primaryColorMatch ? primaryColorMatch[0].split('-')[1] : 'blue';
  
  // Map Tailwind color families to HSL
  const colorToHSL: Record<string, { primary: string; secondary: string }> = {
    blue: { primary: '217 91% 60%', secondary: '221 83% 53%' },
    indigo: { primary: '239 84% 67%', secondary: '243 75% 59%' },
    violet: { primary: '258 90% 66%', secondary: '262 83% 58%' },
    purple: { primary: '271 91% 65%', secondary: '275 84% 57%' },
    pink: { primary: '330 81% 60%', secondary: '336 80% 58%' },
    rose: { primary: '350 89% 60%', secondary: '347 77% 50%' },
    emerald: { primary: '160 84% 39%', secondary: '162 93% 24%' },
    teal: { primary: '173 80% 40%', secondary: '175 77% 26%' },
    cyan: { primary: '189 94% 43%', secondary: '192 91% 36%' },
    amber: { primary: '38 92% 50%', secondary: '32 95% 44%' },
    orange: { primary: '25 95% 53%', secondary: '21 90% 48%' },
    red: { primary: '0 84% 60%', secondary: '0 72% 51%' },
    green: { primary: '142 71% 45%', secondary: '142 76% 36%' },
    sky: { primary: '199 89% 48%', secondary: '200 98% 39%' },
  };

  const colors = colorToHSL[colorFamily] || colorToHSL.blue;

  // Detect if it's a dark theme (look for dark bg classes)
  const isDark = /bg-(?:gray|slate|zinc|neutral|stone)-(?:8|9)\d{2}|bg-black|bg-\[#[0-2]/.test(code);

  const themeBlock = `
// ============================================================================
// Theme (auto-injected for variant compatibility)
// ============================================================================
const THEME = {
  colors: {
    primary: '${colors.primary}',
    primaryForeground: '${isDark ? '0 0% 100%' : '0 0% 100%'}',
    secondary: '${colors.secondary}',
    secondaryForeground: '0 0% 100%',
    accent: '${colors.primary}',
    accentForeground: '0 0% 100%',
    background: '${isDark ? '222 47% 6%' : '0 0% 100%'}',
    foreground: '${isDark ? '210 40% 98%' : '222 47% 11%'}',
    muted: '${isDark ? '217 33% 17%' : '210 40% 96%'}',
    mutedForeground: '${isDark ? '215 20% 65%' : '215 16% 47%'}',
    card: '${isDark ? '222 47% 8%' : '0 0% 100%'}',
    cardForeground: '${isDark ? '210 40% 98%' : '222 47% 11%'}',
    border: '${isDark ? '217 33% 17%' : '214 32% 91%'}',
  },
  typography: {
    headingFont: "'Inter', system-ui, sans-serif",
    bodyFont: "'Inter', system-ui, sans-serif",
    headingWeight: '700',
    bodyWeight: '400',
  },
  radius: '0.5rem',
  sectionPadding: '5rem 1rem',
  containerWidth: '1200px',
};

const hsl = (t) => \`hsl(\${t})\`;
const hsla = (t, a) => \`hsla(\${t}, \${a})\`;
const headingStyle = { fontFamily: THEME.typography.headingFont, fontWeight: THEME.typography.headingWeight, color: hsl(THEME.colors.foreground) };
const bodyStyle = { fontFamily: THEME.typography.bodyFont, fontWeight: THEME.typography.bodyWeight, color: hsl(THEME.colors.mutedForeground) };
const containerStyle = { maxWidth: THEME.containerWidth, margin: '0 auto', padding: '0 1rem' };
const sectionPad = { padding: THEME.sectionPadding };
const primaryBtnStyle = {
  background: \`linear-gradient(135deg, hsl(\${THEME.colors.primary}), hsl(\${THEME.colors.secondary}))\`,
  color: hsl(THEME.colors.primaryForeground), padding: '0.75rem 2rem',
  borderRadius: THEME.radius, fontWeight: '600', border: 'none', cursor: 'pointer',
  fontFamily: THEME.typography.bodyFont, transition: 'all 0.2s ease', textDecoration: 'none', display: 'inline-block',
};
const outlineBtnStyle = {
  background: 'transparent', color: hsl(THEME.colors.foreground),
  padding: '0.75rem 2rem', borderRadius: THEME.radius, fontWeight: '600',
  border: \`1px solid \${hsla(THEME.colors.border, 1)}\`, cursor: 'pointer',
  fontFamily: THEME.typography.bodyFont, transition: 'all 0.2s ease', textDecoration: 'none', display: 'inline-block',
};

`;

  // Inject after imports (find the last import statement)
  const lastImportIdx = code.lastIndexOf('import ');
  if (lastImportIdx !== -1) {
    const lineEnd = code.indexOf('\n', lastImportIdx);
    if (lineEnd !== -1) {
      return code.slice(0, lineEnd + 1) + themeBlock + code.slice(lineEnd + 1);
    }
  }

  // Fallback: inject at top after any initial comments
  const firstCodeLine = code.match(/^(?:\/\*[\s\S]*?\*\/|\/\/[^\n]*\n)*/);
  const insertAt = firstCodeLine ? firstCodeLine[0].length : 0;
  return code.slice(0, insertAt) + themeBlock + code.slice(insertAt);
}

/**
 * Get available variant options for detected sections in the current code.
 */
export function getSwappableOptions(code: string) {
  const sections = detectSections(code);
  
  return sections
    .filter(s => VARIANT_REGISTRY[s.type]?.length > 1)
    .map(s => ({
      section: s,
      variants: VARIANT_REGISTRY[s.type] || [],
    }));
}
