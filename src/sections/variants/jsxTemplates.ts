/**
 * Variant JSX Templates — Theme-Aware
 * 
 * JSX/TSX source string renderers for each variant layout.
 * These produce React JSX source code that replaces existing section blocks
 * in the VFS App.tsx, consistent with the SystemLauncher React pipeline.
 *
 * All templates reference the THEME global variable and style helpers
 * (hsl, primaryBtnStyle, outlineBtnStyle, headingStyle, bodyStyle, etc.)
 * that are already defined in composition template output — ensuring
 * swapped sections inherit the active theme.
 */

import type { ExtractedSectionContent } from './types';

// ============================================================================
// Helpers
// ============================================================================

function esc(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/{/g, '&#123;').replace(/}/g, '&#125;');
}

function renderThemedButtons(
  buttons: ExtractedSectionContent['ctaButtons'],
): string {
  if (!buttons?.length) return '';
  return buttons.map((btn, i) => {
    const styleRef = (i === 0 || btn.isPrimary) ? 'primaryBtnStyle' : 'outlineBtnStyle';
    return `              <a href="${btn.href}" style={${styleRef}}>${esc(btn.text)}</a>`;
  }).join('\n');
}

function renderThemedLinks(links: ExtractedSectionContent['navLinks']): string {
  if (!links?.length) return '';
  return links.map(link =>
    `              <a href="${link.href}" style={{ ...bodyStyle, fontSize: '0.9rem', textDecoration: 'none', transition: 'opacity 0.2s' }}>${esc(link.text)}</a>`
  ).join('\n');
}

// ============================================================================
// Hero Variants
// ============================================================================

export function heroCenteredJSX(c: ExtractedSectionContent): string {
  return `      <section style={{ ...sectionPad, paddingTop: '8rem', background: hsl(THEME.colors.background) }} data-variant="hero:centered">
        <div style={{ ...containerStyle, maxWidth: '56rem', textAlign: 'center' }}>
${c.badge ? `          <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: '500', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: hsla(THEME.colors.primary, 0.08), color: hsl(THEME.colors.primary), border: \`1px solid \${hsla(THEME.colors.primary, 0.15)}\` }}>${esc(c.badge)}</span>\n` : ''}\
${c.heading ? `          <h1 style={{ ...headingStyle, fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', marginBottom: '1.5rem', lineHeight: 1.1 }}>${esc(c.heading)}</h1>\n` : ''}\
${c.subheading ? `          <p style={{ ...bodyStyle, fontSize: '1.125rem', marginBottom: '2rem', maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>${esc(c.subheading)}</p>\n` : ''}\
${c.ctaButtons?.length ? `          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
${renderThemedButtons(c.ctaButtons)}
          </div>\n` : ''}\
${c.imageSrc ? `          <div style={{ marginTop: '3rem' }}><img src="${c.imageSrc}" alt="${esc(c.imageAlt || '')}" style={{ width: '100%', maxWidth: '48rem', margin: '0 auto', borderRadius: THEME.radius, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }} /></div>\n` : ''}\
        </div>
      </section>`;
}

export function heroSplitImageJSX(c: ExtractedSectionContent): string {
  return `      <section style={{ ...sectionPad, paddingTop: '8rem', background: hsl(THEME.colors.background) }} data-variant="hero:split-image">
        <div style={{ ...containerStyle, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
${c.badge ? `            <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: '500', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: hsla(THEME.colors.primary, 0.08), color: hsl(THEME.colors.primary), border: \`1px solid \${hsla(THEME.colors.primary, 0.15)}\` }}>${esc(c.badge)}</span>\n` : ''}\
${c.heading ? `            <h1 style={{ ...headingStyle, fontSize: 'clamp(1.875rem, 4vw, 3rem)', marginBottom: '1.5rem', lineHeight: 1.1 }}>${esc(c.heading)}</h1>\n` : ''}\
${c.subheading ? `            <p style={{ ...bodyStyle, fontSize: '1.125rem', marginBottom: '2rem', lineHeight: 1.7 }}>${esc(c.subheading)}</p>\n` : ''}\
${c.ctaButtons?.length ? `            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
${renderThemedButtons(c.ctaButtons)}
            </div>\n` : ''}\
          </div>
          <div>
${c.imageSrc
    ? `            <img src="${c.imageSrc}" alt="${esc(c.imageAlt || '')}" style={{ width: '100%', borderRadius: THEME.radius, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', objectFit: 'cover', aspectRatio: '4/3' }} />`
    : `            <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: THEME.radius, background: \`linear-gradient(135deg, \${hsla(THEME.colors.primary, 0.1)}, \${hsla(THEME.colors.secondary, 0.1)})\`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '2.5rem' }}>🖼️</span></div>`
}
          </div>
        </div>
      </section>`;
}

export function heroFullBleedJSX(c: ExtractedSectionContent): string {
  const bgStyle = c.imageSrc
    ? `backgroundImage: "url('${c.imageSrc}')", backgroundSize: "cover", backgroundPosition: "center"`
    : `background: \`linear-gradient(135deg, hsl(\${THEME.colors.primary}), hsl(\${THEME.colors.secondary}))\``;
  return `      <section style={{ position: 'relative', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', ${bgStyle} }} data-variant="hero:full-bleed">
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5))' }} />
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '56rem', margin: '0 auto', padding: '5rem 1rem', textAlign: 'center' }}>
${c.badge ? `          <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: '500', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>${esc(c.badge)}</span>\n` : ''}\
${c.heading ? `          <h1 style={{ fontFamily: THEME.typography.headingFont, fontWeight: THEME.typography.headingWeight, fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', color: '#fff', marginBottom: '1.5rem', lineHeight: 1.1, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>${esc(c.heading)}</h1>\n` : ''}\
${c.subheading ? `          <p style={{ fontFamily: THEME.typography.bodyFont, fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', maxWidth: '42rem', margin: '0 auto 2rem', lineHeight: 1.7 }}>${esc(c.subheading)}</p>\n` : ''}\
${c.ctaButtons?.length ? `          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
${c.ctaButtons.map((btn, i) => {
    if (i === 0 || btn.isPrimary) {
      return `              <a href="${btn.href}" style={{ ...primaryBtnStyle, background: '#fff', color: hsl(THEME.colors.primary), boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>${esc(btn.text)}</a>`;
    }
    return `              <a href="${btn.href}" style={{ ...outlineBtnStyle, borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>${esc(btn.text)}</a>`;
  }).join('\n')}
          </div>\n` : ''}\
        </div>
      </section>`;
}

// ============================================================================
// CTA Variants
// ============================================================================

export function ctaCenteredJSX(c: ExtractedSectionContent): string {
  return `      <section style={{ ...sectionPad, background: hsla(THEME.colors.primary, 0.04), borderTop: \`1px solid \${hsla(THEME.colors.border, 0.4)}\`, borderBottom: \`1px solid \${hsla(THEME.colors.border, 0.4)}\` }} data-variant="cta:centered">
        <div style={{ ...containerStyle, maxWidth: '48rem', textAlign: 'center' }}>
${c.heading ? `          <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '1rem' }}>${esc(c.heading)}</h2>\n` : ''}\
${c.subheading ? `          <p style={{ ...bodyStyle, fontSize: '1.125rem', marginBottom: '2rem', lineHeight: 1.7 }}>${esc(c.subheading)}</p>\n` : ''}\
${c.ctaButtons?.length ? `          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
${renderThemedButtons(c.ctaButtons)}
          </div>\n` : ''}\
        </div>
      </section>`;
}

export function ctaGradientBannerJSX(c: ExtractedSectionContent): string {
  return `      <section style={{ ...sectionPad, background: \`linear-gradient(135deg, hsl(\${THEME.colors.primary}), hsl(\${THEME.colors.secondary}))\` }} data-variant="cta:gradient-banner">
        <div style={{ ...containerStyle, maxWidth: '56rem', textAlign: 'center' }}>
${c.heading ? `          <h2 style={{ fontFamily: THEME.typography.headingFont, fontWeight: THEME.typography.headingWeight, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: hsl(THEME.colors.primaryForeground), marginBottom: '1rem', textShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>${esc(c.heading)}</h2>\n` : ''}\
${c.subheading ? `          <p style={{ fontFamily: THEME.typography.bodyFont, fontSize: '1.125rem', color: hsla(THEME.colors.primaryForeground, 0.85), marginBottom: '2rem', maxWidth: '42rem', margin: '0 auto 2rem', lineHeight: 1.7 }}>${esc(c.subheading)}</p>\n` : ''}\
${c.ctaButtons?.length ? `          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
${c.ctaButtons.map((btn, i) => {
    if (i === 0 || btn.isPrimary) {
      return `              <a href="${btn.href}" style={{ display: 'inline-block', padding: '0.75rem 2rem', borderRadius: THEME.radius, background: '#fff', color: hsl(THEME.colors.primary), fontWeight: '600', textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', transition: 'all 0.2s ease' }}>${esc(btn.text)}</a>`;
    }
    return `              <a href="${btn.href}" style={{ display: 'inline-block', padding: '0.75rem 2rem', borderRadius: THEME.radius, border: '2px solid rgba(255,255,255,0.4)', color: hsl(THEME.colors.primaryForeground), fontWeight: '500', textDecoration: 'none', transition: 'all 0.2s ease' }}>${esc(btn.text)}</a>`;
  }).join('\n')}
          </div>\n` : ''}\
        </div>
      </section>`;
}

export function ctaSplitCardJSX(c: ExtractedSectionContent): string {
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.background) }} data-variant="cta:split-card">
        <div style={{ ...containerStyle, maxWidth: '64rem' }}>
          <div style={{ background: \`linear-gradient(135deg, hsl(\${THEME.colors.primary}), hsl(\${THEME.colors.secondary}))\`, borderRadius: \`calc(\${THEME.radius} * 2)\`, padding: '3rem', display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem', alignItems: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div>
${c.heading ? `              <h2 style={{ fontFamily: THEME.typography.headingFont, fontWeight: THEME.typography.headingWeight, fontSize: 'clamp(1.25rem, 2.5vw, 1.875rem)', color: hsl(THEME.colors.primaryForeground), marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>\n` : ''}\
${c.subheading ? `              <p style={{ fontFamily: THEME.typography.bodyFont, color: hsla(THEME.colors.primaryForeground, 0.7), lineHeight: 1.6 }}>${esc(c.subheading)}</p>\n` : ''}\
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
${c.ctaButtons?.length ? c.ctaButtons.map((btn, i) => {
    if (i === 0 || btn.isPrimary) {
      return `              <a href="${btn.href}" style={{ display: 'inline-block', padding: '0.75rem 2rem', borderRadius: THEME.radius, background: '#fff', color: hsl(THEME.colors.primary), fontWeight: '600', textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', textAlign: 'center', transition: 'all 0.2s ease' }}>${esc(btn.text)}</a>`;
    }
    return `              <a href="${btn.href}" style={{ display: 'inline-block', padding: '0.75rem 2rem', borderRadius: THEME.radius, border: '1px solid rgba(255,255,255,0.3)', color: hsl(THEME.colors.primaryForeground), fontWeight: '500', textDecoration: 'none', textAlign: 'center', transition: 'all 0.2s ease' }}>${esc(btn.text)}</a>`;
  }).join('\n') : ''}
            </div>
          </div>
        </div>
      </section>`;
}

// ============================================================================
// Navbar Variants
// ============================================================================

export function navbarStandardJSX(c: ExtractedSectionContent): string {
  const brand = c.brandName || 'Brand';
  const navLinks = c.navLinks || [];
  const ctaButton = c.ctaButtons?.[0];

  return `      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: hsla(THEME.colors.background, 0.85), backdropFilter: 'blur(12px)', borderBottom: \`1px solid \${hsla(THEME.colors.border, 0.5)}\` }} data-variant="navbar:standard">
        <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '5rem' }}>
          <a href="/" style={{ ...headingStyle, fontSize: '1.5rem', textDecoration: 'none', background: \`linear-gradient(135deg, hsl(\${THEME.colors.primary}), hsl(\${THEME.colors.secondary}))\`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>${esc(brand)}</a>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
${renderThemedLinks(navLinks)}
${ctaButton ? `            <a href="${ctaButton.href}" style={{ ...primaryBtnStyle, fontSize: '0.875rem', padding: '0.5rem 1.25rem' }}>${esc(ctaButton.text)}</a>\n` : ''}\
          </nav>
        </div>
      </header>`;
}

export function navbarCenteredLogoJSX(c: ExtractedSectionContent): string {
  const brand = c.brandName || 'Brand';
  const navLinks = c.navLinks || [];
  const half = Math.ceil(navLinks.length / 2);
  const leftLinks = navLinks.slice(0, half);
  const rightLinks = navLinks.slice(half);

  return `      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: hsla(THEME.colors.background, 0.95), borderBottom: \`1px solid \${hsla(THEME.colors.border, 0.3)}\` }} data-variant="navbar:centered-logo">
        <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '5rem', gap: '2rem' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
${renderThemedLinks(leftLinks)}
          </nav>
          <a href="/" style={{ ...headingStyle, fontSize: '1.5rem', textDecoration: 'none', padding: '0 1rem' }}>${esc(brand)}</a>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
${renderThemedLinks(rightLinks)}
          </nav>
        </div>
      </header>`;
}

export function navbarMinimalDarkJSX(c: ExtractedSectionContent): string {
  const brand = c.brandName || 'Brand';
  const navLinks = c.navLinks || [];
  const ctaButton = c.ctaButtons?.[0];

  return `      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: hsl(THEME.colors.card), backdropFilter: 'blur(12px)' }} data-variant="navbar:minimal-dark">
        <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '5rem' }}>
          <a href="/" style={{ fontFamily: THEME.typography.headingFont, fontWeight: THEME.typography.headingWeight, fontSize: '1.5rem', textDecoration: 'none', color: hsl(THEME.colors.cardForeground) }}>${esc(brand)}</a>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
${navLinks.map(link =>
    `            <a href="${link.href}" style={{ fontFamily: THEME.typography.bodyFont, fontSize: '0.875rem', textDecoration: 'none', color: hsl(THEME.colors.mutedForeground), transition: 'color 0.2s' }}>${esc(link.text)}</a>`
  ).join('\n')}
${ctaButton ? `            <a href="${ctaButton.href}" style={{ display: 'inline-block', padding: '0.375rem 1rem', borderRadius: '9999px', background: hsl(THEME.colors.primary), color: hsl(THEME.colors.primaryForeground), fontSize: '0.875rem', fontWeight: '500', textDecoration: 'none', transition: 'opacity 0.2s' }}>${esc(ctaButton.text)}</a>\n` : ''}\
          </nav>
        </div>
      </header>`;
}
