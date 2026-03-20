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

// ============================================================================
// Features Variants
// ============================================================================

export function featuresGridJSX(c: ExtractedSectionContent): string {
  const items = c.listItems || [];
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.background) }} data-variant="features:grid">
        <div style={{ ...containerStyle }}>
${c.heading ? `          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>
${c.subheading ? `            <p style={{ ...bodyStyle, fontSize: '1rem', maxWidth: '32rem', margin: '0 auto' }}>${esc(c.subheading)}</p>\n` : ''}\
          </div>\n` : ''}\
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
${items.map((item, i) => `            <div style={{ padding: '1.5rem', background: hsl(THEME.colors.card), border: \`1px solid \${hsla(THEME.colors.border, 0.6)}\`, borderRadius: THEME.radius }}>
              <h3 style={{ ...headingStyle, fontSize: '1.125rem', marginBottom: '0.5rem' }}>${esc(item)}</h3>
            </div>`).join('\n')}
          </div>
        </div>
      </section>`;
}

export function featuresIconLeftJSX(c: ExtractedSectionContent): string {
  const items = c.listItems || [];
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.background) }} data-variant="features:icon-left">
        <div style={{ ...containerStyle }}>
${c.heading ? `          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>
${c.subheading ? `            <p style={{ ...bodyStyle, fontSize: '1rem', maxWidth: '32rem', margin: '0 auto' }}>${esc(c.subheading)}</p>\n` : ''}\
          </div>\n` : ''}\
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '48rem', margin: '0 auto' }}>
${items.map((item, i) => `            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0, width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.75rem', background: hsla(THEME.colors.primary, 0.1), color: hsl(THEME.colors.primary), fontSize: '1.25rem' }}>✦</div>
              <div>
                <h3 style={{ ...headingStyle, fontSize: '1.125rem', marginBottom: '0.25rem' }}>${esc(item)}</h3>
              </div>
            </div>`).join('\n')}
          </div>
        </div>
      </section>`;
}

export function featuresMinimalCenteredJSX(c: ExtractedSectionContent): string {
  const items = c.listItems || [];
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.muted) }} data-variant="features:minimal-centered">
        <div style={{ ...containerStyle }}>
${c.heading ? `          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>
${c.subheading ? `            <p style={{ ...bodyStyle, fontSize: '1rem', maxWidth: '32rem', margin: '0 auto' }}>${esc(c.subheading)}</p>\n` : ''}\
          </div>\n` : ''}\
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem', textAlign: 'center' }}>
${items.map((item, i) => `            <div>
              <div style={{ margin: '0 auto', width: '3.5rem', height: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', borderRadius: '9999px', marginBottom: '1rem', background: hsla(THEME.colors.primary, 0.08), color: hsl(THEME.colors.primary) }}>✦</div>
              <h3 style={{ ...headingStyle, fontSize: '1.125rem', marginBottom: '0.5rem' }}>${esc(item)}</h3>
            </div>`).join('\n')}
          </div>
        </div>
      </section>`;
}

// ============================================================================
// Services Variants
// ============================================================================

export function servicesCardGridJSX(c: ExtractedSectionContent): string {
  const items = c.listItems || [];
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.background) }} data-variant="services:card-grid">
        <div style={{ ...containerStyle }}>
${c.heading ? `          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>
${c.subheading ? `            <p style={{ ...bodyStyle, fontSize: '1rem', maxWidth: '32rem', margin: '0 auto' }}>${esc(c.subheading)}</p>\n` : ''}\
          </div>\n` : ''}\
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
${items.map((item, i) => `            <div style={{ padding: '1.5rem', background: hsl(THEME.colors.card), border: \`1px solid \${hsla(THEME.colors.border, 0.6)}\`, borderRadius: THEME.radius }}>
              <h3 style={{ ...headingStyle, fontSize: '1.125rem', marginBottom: '0.5rem' }}>${esc(item)}</h3>
            </div>`).join('\n')}
          </div>
        </div>
      </section>`;
}

export function servicesAlternatingJSX(c: ExtractedSectionContent): string {
  const items = c.listItems || [];
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.background) }} data-variant="services:alternating">
        <div style={{ ...containerStyle }}>
${c.heading ? `          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>
${c.subheading ? `            <p style={{ ...bodyStyle, fontSize: '1rem', maxWidth: '32rem', margin: '0 auto' }}>${esc(c.subheading)}</p>\n` : ''}\
          </div>\n` : ''}\
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
${items.map((item, i) => `            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center'${i % 2 !== 0 ? ", direction: 'rtl'" : ''} }}>
              <div${i % 2 !== 0 ? " style={{ direction: 'ltr' }}" : ''}>
                <h3 style={{ ...headingStyle, fontSize: '1.5rem', marginBottom: '0.75rem' }}>${esc(item)}</h3>
              </div>
              <div style={{${i % 2 !== 0 ? " direction: 'ltr'," : ''} aspectRatio: '4/3', borderRadius: THEME.radius, background: \`linear-gradient(135deg, \${hsla(THEME.colors.primary, 0.08)}, \${hsla(THEME.colors.secondary, 0.08)})\`, border: \`1px solid \${hsla(THEME.colors.border, 0.4)}\` }} />
            </div>`).join('\n')}
          </div>
        </div>
      </section>`;
}

export function servicesCompactListJSX(c: ExtractedSectionContent): string {
  const items = c.listItems || [];
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.muted) }} data-variant="services:compact-list">
        <div style={{ ...containerStyle, maxWidth: '56rem' }}>
${c.heading ? `          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>
${c.subheading ? `            <p style={{ ...bodyStyle, fontSize: '1rem', maxWidth: '32rem', margin: '0 auto' }}>${esc(c.subheading)}</p>\n` : ''}\
          </div>\n` : ''}\
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
${items.map((item, i) => `            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', background: hsl(THEME.colors.card), border: \`1px solid \${hsla(THEME.colors.border, 0.5)}\`, borderRadius: THEME.radius }}>
              <div style={{ flexShrink: 0, width: '2.75rem', height: '2.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.5rem', background: hsla(THEME.colors.primary, 0.1), color: hsl(THEME.colors.primary), fontSize: '1.125rem' }}>●</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ ...headingStyle, fontSize: '1rem', marginBottom: '0.125rem' }}>${esc(item)}</h3>
              </div>
            </div>`).join('\n')}
          </div>
        </div>
      </section>`;
}

// ============================================================================
// Contact Variants
// ============================================================================

export function contactCenteredJSX(c: ExtractedSectionContent): string {
  const inputStr = `style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: THEME.radius, border: \`1px solid \${hsla(THEME.colors.border, 0.8)}\`, background: hsl(THEME.colors.card), color: hsl(THEME.colors.cardForeground), fontFamily: THEME.typography.bodyFont, fontSize: '0.875rem', outline: 'none' }}`;
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.muted) }} data-variant="contact:centered">
        <div style={{ ...containerStyle, maxWidth: '40rem' }}>
${c.heading ? `          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>
${c.subheading ? `            <p style={{ ...bodyStyle }}>${esc(c.subheading)}</p>\n` : ''}\
          </div>\n` : ''}\
          <form data-demo-form="true" data-intent="contact.submit" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input type="text" placeholder="Your name" ${inputStr} />
            <input type="email" placeholder="your@email.com" ${inputStr} />
            <textarea placeholder="How can we help?" rows={4} ${inputStr} />
            <button type="submit" style={{ width: '100%', padding: '0.75rem', border: 'none', borderRadius: THEME.radius, background: hsl(THEME.colors.primary), color: hsl(THEME.colors.primaryForeground), fontFamily: THEME.typography.bodyFont, fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer' }}>Send Message</button>
          </form>
        </div>
      </section>`;
}

export function contactSplitCardJSX(c: ExtractedSectionContent): string {
  const inputStr = `style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: THEME.radius, border: \`1px solid \${hsla(THEME.colors.border, 0.8)}\`, background: hsl(THEME.colors.background), color: hsl(THEME.colors.foreground), fontFamily: THEME.typography.bodyFont, fontSize: '0.875rem', outline: 'none' }}`;
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.background) }} data-variant="contact:split-card">
        <div style={{ ...containerStyle, maxWidth: '56rem' }}>
${c.heading ? `          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>
${c.subheading ? `            <p style={{ ...bodyStyle, maxWidth: '32rem', margin: '0 auto' }}>${esc(c.subheading)}</p>\n` : ''}\
          </div>\n` : ''}\
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
            <form data-demo-form="true" data-intent="contact.submit" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input type="text" placeholder="Your name" ${inputStr} />
              <input type="email" placeholder="your@email.com" ${inputStr} />
              <textarea placeholder="Your message..." rows={5} ${inputStr} />
              <button type="submit" style={{ width: '100%', padding: '0.75rem', border: 'none', borderRadius: THEME.radius, background: hsl(THEME.colors.primary), color: hsl(THEME.colors.primaryForeground), fontFamily: THEME.typography.bodyFont, fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer' }}>Send Message</button>
            </form>
            <div style={{ padding: '2rem', background: hsl(THEME.colors.card), border: \`1px solid \${hsla(THEME.colors.border, 0.6)}\`, borderRadius: THEME.radius, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ ...headingStyle, fontSize: '1.125rem' }}>Get in Touch</h3>
${c.listItems?.map(info => `              <p style={{ ...bodyStyle, fontSize: '0.875rem' }}>${esc(info)}</p>`).join('\n') || ''}
            </div>
          </div>
        </div>
      </section>`;
}

export function contactMinimalInlineJSX(c: ExtractedSectionContent): string {
  const inputStr = `style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: THEME.radius, border: \`1px solid \${hsla(THEME.colors.border, 0.8)}\`, background: hsl(THEME.colors.card), color: hsl(THEME.colors.cardForeground), fontFamily: THEME.typography.bodyFont, fontSize: '0.875rem', outline: 'none' }}`;
  return `      <section style={{ ...sectionPad, background: \`linear-gradient(135deg, \${hsla(THEME.colors.primary, 0.04)}, \${hsla(THEME.colors.secondary, 0.04)})\` }} data-variant="contact:minimal-inline">
        <div style={{ ...containerStyle, maxWidth: '48rem', textAlign: 'center' }}>
${c.heading ? `          <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>\n` : ''}\
${c.subheading ? `          <p style={{ ...bodyStyle, marginBottom: '2rem', maxWidth: '28rem', margin: '0 auto 2rem' }}>${esc(c.subheading)}</p>\n` : ''}\
          <form data-demo-form="true" data-intent="contact.submit" style={{ display: 'flex', gap: '0.75rem', maxWidth: '36rem', margin: '0 auto 1.5rem' }}>
            <input type="email" placeholder="your@email.com" ${inputStr} />
            <input type="text" placeholder="Message" ${inputStr} />
            <button type="submit" style={{ flexShrink: 0, padding: '0.65rem 1.5rem', border: 'none', borderRadius: THEME.radius, background: hsl(THEME.colors.primary), color: hsl(THEME.colors.primaryForeground), fontFamily: THEME.typography.bodyFont, fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer' }}>Send</button>
          </form>
${c.listItems?.length ? `          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
${c.listItems.map(info => `            <span style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', borderRadius: '9999px', background: hsl(THEME.colors.card), color: hsl(THEME.colors.mutedForeground), border: \`1px solid \${hsla(THEME.colors.border, 0.5)}\` }}>${esc(info)}</span>`).join('\n')}
          </div>\n` : ''}\
        </div>
      </section>`;
}

// ============================================================================
// Footer Variants
// ============================================================================

export function footerColumnsJSX(c: ExtractedSectionContent): string {
  const brand = c.brandName || 'Brand';
  const navLinks = c.navLinks || [];
  return `      <footer style={{ paddingTop: '3rem', paddingBottom: '1.5rem', background: hsl(THEME.colors.card), borderTop: \`1px solid \${hsla(THEME.colors.border, 0.5)}\` }} data-variant="footer:columns">
        <div style={{ ...containerStyle }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ ...headingStyle, fontSize: '1.125rem', marginBottom: '0.75rem' }}>${esc(brand)}</h3>
            </div>
            <div>
              <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600', color: hsl(THEME.colors.cardForeground), marginBottom: '0.75rem' }}>Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
${navLinks.map(link => `                <a href="${link.href}" style={{ ...bodyStyle, fontSize: '0.875rem', textDecoration: 'none', color: hsl(THEME.colors.mutedForeground) }}>${esc(link.text)}</a>`).join('\n')}
              </div>
            </div>
          </div>
          <div style={{ borderTop: \`1px solid \${hsla(THEME.colors.border, 0.3)}\`, paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: hsl(THEME.colors.mutedForeground) }}>© ${new Date().getFullYear()} ${esc(brand)}. All rights reserved.</p>
          </div>
        </div>
      </footer>`;
}

export function footerCenteredMinimalJSX(c: ExtractedSectionContent): string {
  const brand = c.brandName || 'Brand';
  const navLinks = c.navLinks || [];
  return `      <footer style={{ padding: '2.5rem 1rem', background: hsl(THEME.colors.background), borderTop: \`1px solid \${hsla(THEME.colors.border, 0.4)}\`, textAlign: 'center' }} data-variant="footer:centered-minimal">
        <div style={{ ...containerStyle }}>
          <h3 style={{ ...headingStyle, fontSize: '1.125rem', marginBottom: '1rem' }}>${esc(brand)}</h3>
${navLinks.length ? `          <nav style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
${navLinks.map(link => `            <a href="${link.href}" style={{ ...bodyStyle, fontSize: '0.875rem', textDecoration: 'none', color: hsl(THEME.colors.mutedForeground) }}>${esc(link.text)}</a>`).join('\n')}
          </nav>\n` : ''}\
          <p style={{ fontSize: '0.75rem', color: hsl(THEME.colors.mutedForeground) }}>© ${new Date().getFullYear()} ${esc(brand)}. All rights reserved.</p>
        </div>
      </footer>`;
}

export function footerDarkBandJSX(c: ExtractedSectionContent): string {
  const brand = c.brandName || 'Brand';
  const navLinks = c.navLinks || [];
  return `      <footer style={{ paddingTop: '3.5rem', paddingBottom: '1.5rem', background: hsl(THEME.colors.foreground), color: hsl(THEME.colors.background) }} data-variant="footer:dark-band">
        <div style={{ ...containerStyle }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
            <div>
              <h3 style={{ fontFamily: THEME.typography.headingFont, fontWeight: THEME.typography.headingWeight, fontSize: '1.25rem', marginBottom: '0.5rem' }}>${esc(brand)}</h3>
            </div>
            <div>
              <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: '0.75rem' }}>Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
${navLinks.map(link => `                <a href="${link.href}" style={{ fontFamily: THEME.typography.bodyFont, fontSize: '0.875rem', textDecoration: 'none', color: 'rgba(255,255,255,0.5)' }}>${esc(link.text)}</a>`).join('\n')}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>© ${new Date().getFullYear()} ${esc(brand)}. All rights reserved.</p>
          </div>
        </div>
      </footer>`;
}

// ============================================================================
// Pricing Variants
// ============================================================================

export function pricingColumnsJSX(c: ExtractedSectionContent): string {
  const tiers = c.tiers || [];
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.background) }} data-variant="pricing:columns">
        <div style={{ ...containerStyle }}>
${c.heading ? `          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>
${c.subheading ? `            <p style={{ ...bodyStyle, fontSize: '1rem', maxWidth: '32rem', margin: '0 auto' }}>${esc(c.subheading)}</p>\n` : ''}\
          </div>\n` : ''}\
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(${Math.min(tiers.length, 3)}, 1fr)', gap: '1.5rem' }}>
${tiers.map((tier, i) => `            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', background: ${tier.highlighted ? `hsl(THEME.colors.primary)` : `hsl(THEME.colors.card)`}, color: ${tier.highlighted ? `hsl(THEME.colors.primaryForeground)` : `hsl(THEME.colors.cardForeground)`}, border: \`1px solid \${hsla(THEME.colors.border, 0.6)}\`, borderRadius: THEME.radius, position: 'relative' }}>
${tier.badge ? `              <span style={{ position: 'absolute', top: '-0.75rem', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: hsl(THEME.colors.accent), color: hsl(THEME.colors.accentForeground) }}>${esc(tier.badge)}</span>\n` : ''}\
              <h3 style={{ ...headingStyle, fontSize: '1.25rem', marginBottom: '0.25rem' }}>${esc(tier.name)}</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', fontFamily: THEME.typography.headingFont, marginBottom: '0.25rem' }}>${esc(tier.price)}<span style={{ fontSize: '0.875rem', fontWeight: '400', opacity: 0.6 }}>${tier.period ? `/${esc(tier.period)}` : ''}</span></div>
              <ul style={{ margin: '1.5rem 0', flex: 1, listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
${tier.features.map(f => `                <li style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>✓</span>${esc(f)}</li>`).join('\n')}
              </ul>
              <a href="${tier.cta.href}" style={{ display: 'block', textAlign: 'center', padding: '0.625rem 1rem', borderRadius: THEME.radius, fontWeight: '500', fontSize: '0.875rem', textDecoration: 'none', background: ${tier.highlighted ? `hsl(THEME.colors.background)` : `hsl(THEME.colors.primary)`}, color: ${tier.highlighted ? `hsl(THEME.colors.foreground)` : `hsl(THEME.colors.primaryForeground)`} }}>${esc(tier.cta.text)}</a>
            </div>`).join('\n')}
          </div>
        </div>
      </section>`;
}

export function pricingTableJSX(c: ExtractedSectionContent): string {
  const tiers = c.tiers || [];
  const allFeatures = [...new Set(tiers.flatMap(t => t.features))];
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.muted) }} data-variant="pricing:table">
        <div style={{ ...containerStyle }}>
${c.heading ? `          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>
${c.subheading ? `            <p style={{ ...bodyStyle, fontSize: '1rem', maxWidth: '32rem', margin: '0 auto' }}>${esc(c.subheading)}</p>\n` : ''}\
          </div>\n` : ''}\
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: hsl(THEME.colors.card), borderRadius: THEME.radius, overflow: 'hidden' }}>
              <thead>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', borderBottom: \`1px solid \${hsla(THEME.colors.border, 0.5)}\`, ...headingStyle, fontSize: '0.875rem' }}>Feature</th>
${tiers.map(tier => `                  <th style={{ padding: '1rem 1.5rem', textAlign: 'center', borderBottom: \`1px solid \${hsla(THEME.colors.border, 0.5)}\`${tier.highlighted ? `, background: hsla(THEME.colors.primary, 0.05)` : ''} }}>
                    <div style={{ ...headingStyle, fontSize: '1.125rem' }}>${esc(tier.name)}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: hsl(THEME.colors.primary), marginTop: '0.25rem' }}>${esc(tier.price)}</div>
                  </th>`).join('\n')}
                </tr>
              </thead>
              <tbody>
${allFeatures.map(feature => `                <tr style={{ borderBottom: \`1px solid \${hsla(THEME.colors.border, 0.3)}\` }}>
                  <td style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', color: hsl(THEME.colors.cardForeground) }}>${esc(feature)}</td>
${tiers.map(tier => `                  <td style={{ padding: '0.75rem 1.5rem', textAlign: 'center'${tier.highlighted ? `, background: hsla(THEME.colors.primary, 0.03)` : ''} }}><span style={{ color: ${tier.features.includes(feature) ? `hsl(THEME.colors.primary)` : `hsl(THEME.colors.mutedForeground)`} }}>${tier.features.includes(feature) ? '✓' : '—'}</span></td>`).join('\n')}
                </tr>`).join('\n')}
              </tbody>
              <tfoot>
                <tr>
                  <td style={{ padding: '1rem 1.5rem' }}></td>
${tiers.map(tier => `                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center'${tier.highlighted ? `, background: hsla(THEME.colors.primary, 0.05)` : ''} }}>
                    <a href="${tier.cta.href}" style={{ ...primaryBtnStyle, fontSize: '0.875rem', padding: '0.5rem 1.5rem' }}>${esc(tier.cta.text)}</a>
                  </td>`).join('\n')}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>`;
}

export function pricingMinimalJSX(c: ExtractedSectionContent): string {
  const tiers = c.tiers || [];
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.background) }} data-variant="pricing:minimal">
        <div style={{ ...containerStyle, maxWidth: '52rem' }}>
${c.heading ? `          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>
${c.subheading ? `            <p style={{ ...bodyStyle, fontSize: '1rem', maxWidth: '32rem', margin: '0 auto' }}>${esc(c.subheading)}</p>\n` : ''}\
          </div>\n` : ''}\
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
${tiers.map(tier => `            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', border: \`1px solid \${${tier.highlighted ? `hsl(THEME.colors.primary)` : `hsla(THEME.colors.border, 0.5)`}}\`, borderRadius: THEME.radius${tier.highlighted ? `, background: hsla(THEME.colors.primary, 0.03)` : ''} }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ ...headingStyle, fontSize: '1.125rem' }}>${esc(tier.name)}</h3>
${tier.badge ? `                  <span style={{ fontSize: '0.75rem', fontWeight: '500', padding: '0.125rem 0.5rem', borderRadius: '9999px', background: hsla(THEME.colors.primary, 0.1), color: hsl(THEME.colors.primary) }}>${esc(tier.badge)}</span>\n` : ''}\
                </div>
                <p style={{ ...bodyStyle, fontSize: '0.875rem' }}>${tier.features.slice(0, 3).map(f => esc(f)).join(' · ')}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: THEME.typography.headingFont }}>${esc(tier.price)}</span>
                <a href="${tier.cta.href}" style={{ display: 'inline-block', padding: '0.5rem 1.25rem', borderRadius: THEME.radius, fontSize: '0.875rem', fontWeight: '500', textDecoration: 'none', background: ${tier.highlighted ? `hsl(THEME.colors.primary)` : 'transparent'}, color: ${tier.highlighted ? `hsl(THEME.colors.primaryForeground)` : `hsl(THEME.colors.primary)`}, border: \`1px solid \${hsl(THEME.colors.primary)}\` }}>${esc(tier.cta.text)}</a>
              </div>
            </div>`).join('\n')}
          </div>
        </div>
      </section>`;
}

// ============================================================================
// Testimonials Variants
// ============================================================================

export function testimonialsGridJSX(c: ExtractedSectionContent): string {
  const items = c.testimonials || [];
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.muted) }} data-variant="testimonials:grid">
        <div style={{ ...containerStyle }}>
${c.heading ? `          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>
${c.subheading ? `            <p style={{ ...bodyStyle, fontSize: '1rem', maxWidth: '32rem', margin: '0 auto' }}>${esc(c.subheading)}</p>\n` : ''}\
          </div>\n` : ''}\
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(${Math.min(items.length, 3)}, 1fr)', gap: '1.5rem' }}>
${items.map(item => `            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', background: hsl(THEME.colors.card), border: \`1px solid \${hsla(THEME.colors.border, 0.5)}\`, borderRadius: THEME.radius }}>
${item.rating ? `              <div style={{ color: hsl(THEME.colors.primary), marginBottom: '0.75rem' }}>${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}</div>\n` : ''}\
              <p style={{ fontStyle: 'italic', fontSize: '0.875rem', lineHeight: 1.6, flex: 1, marginBottom: '1rem', color: hsl(THEME.colors.cardForeground) }}>"${esc(item.quote)}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.75rem', borderTop: \`1px solid \${hsla(THEME.colors.border, 0.3)}\` }}>
${item.avatar ? `                <img src="${item.avatar}" alt="${esc(item.author)}" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', objectFit: 'cover' }} />\n` : `                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: '700', background: hsla(THEME.colors.primary, 0.1), color: hsl(THEME.colors.primary) }}>${esc(item.author?.[0] || '')}</div>\n`}\
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: hsl(THEME.colors.cardForeground) }}>${esc(item.author)}</div>
${item.role ? `                  <div style={{ fontSize: '0.75rem', color: hsl(THEME.colors.mutedForeground) }}>${esc(item.role)}</div>\n` : ''}\
                </div>
              </div>
            </div>`).join('\n')}
          </div>
        </div>
      </section>`;
}

export function testimonialsSpotlightJSX(c: ExtractedSectionContent): string {
  const items = c.testimonials || [];
  const featured = items[0];
  if (!featured) return '';
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.background) }} data-variant="testimonials:spotlight">
        <div style={{ ...containerStyle, maxWidth: '48rem', textAlign: 'center' }}>
${c.heading ? `          <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '2.5rem' }}>${esc(c.heading)}</h2>\n` : ''}\
          <div style={{ padding: '2.5rem', background: hsl(THEME.colors.card), border: \`1px solid \${hsla(THEME.colors.border, 0.5)}\`, borderRadius: \`calc(\${THEME.radius} * 2)\` }}>
            <span style={{ fontSize: '3rem', lineHeight: 1, display: 'block', marginBottom: '1rem', color: hsla(THEME.colors.primary, 0.2), fontFamily: 'serif' }}>"</span>
            <p style={{ fontSize: '1.25rem', lineHeight: 1.6, marginBottom: '1.5rem', color: hsl(THEME.colors.cardForeground) }}>${esc(featured.quote)}</p>
${featured.rating ? `            <div style={{ color: hsl(THEME.colors.primary), fontSize: '1.25rem', marginBottom: '1rem' }}>${'★'.repeat(featured.rating)}${'☆'.repeat(5 - featured.rating)}</div>\n` : ''}\
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
${featured.avatar ? `              <img src="${featured.avatar}" alt="${esc(featured.author)}" style={{ width: '3rem', height: '3rem', borderRadius: '9999px', objectFit: 'cover' }} />\n` : `              <div style={{ width: '3rem', height: '3rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: '700', background: hsla(THEME.colors.primary, 0.1), color: hsl(THEME.colors.primary) }}>${esc(featured.author?.[0] || '')}</div>\n`}\
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '600', color: hsl(THEME.colors.cardForeground) }}>${esc(featured.author)}</div>
${featured.role ? `                <div style={{ fontSize: '0.875rem', color: hsl(THEME.colors.mutedForeground) }}>${esc(featured.role)}</div>\n` : ''}\
              </div>
            </div>
          </div>
        </div>
      </section>`;
}

export function testimonialsMinimalJSX(c: ExtractedSectionContent): string {
  const items = c.testimonials || [];
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.background) }} data-variant="testimonials:minimal">
        <div style={{ ...containerStyle, maxWidth: '48rem' }}>
${c.heading ? `          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>
${c.subheading ? `            <p style={{ ...bodyStyle, fontSize: '1rem', maxWidth: '28rem', margin: '0 auto' }}>${esc(c.subheading)}</p>\n` : ''}\
          </div>\n` : ''}\
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
${items.map(item => `            <div style={{ paddingLeft: '1.5rem', borderLeft: \`3px solid \${hsla(THEME.colors.primary, 0.3)}\` }}>
              <p style={{ fontStyle: 'italic', fontSize: '1rem', lineHeight: 1.6, marginBottom: '0.75rem', color: hsl(THEME.colors.foreground) }}>"${esc(item.quote)}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: hsl(THEME.colors.foreground) }}>${esc(item.author)}</span>
${item.role ? `                <span style={{ fontSize: '0.875rem', color: hsl(THEME.colors.mutedForeground) }}>— ${esc(item.role)}</span>\n` : ''}\
              </div>
            </div>`).join('\n')}
          </div>
        </div>
      </section>`;
}

// ============================================================================
// Team Variants
// ============================================================================

export function teamGridJSX(c: ExtractedSectionContent): string {
  const members = c.teamMembers || [];
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.background) }} data-variant="team:grid">
        <div style={{ ...containerStyle }}>
${c.heading ? `          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>
${c.subheading ? `            <p style={{ ...bodyStyle, fontSize: '1rem', maxWidth: '32rem', margin: '0 auto' }}>${esc(c.subheading)}</p>\n` : ''}\
          </div>\n` : ''}\
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(${Math.min(members.length, 3)}, 1fr)', gap: '1.5rem' }}>
${members.map(m => `            <div style={{ textAlign: 'center', padding: '1.5rem', background: hsl(THEME.colors.card), border: \`1px solid \${hsla(THEME.colors.border, 0.5)}\`, borderRadius: THEME.radius }}>
${m.image ? `              <img src="${m.image}" alt="${esc(m.name)}" style={{ width: '6rem', height: '6rem', borderRadius: '9999px', objectFit: 'cover', margin: '0 auto 1rem' }} />\n` : `              <div style={{ width: '6rem', height: '6rem', borderRadius: '9999px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '700', background: hsla(THEME.colors.primary, 0.1), color: hsl(THEME.colors.primary) }}>${esc(m.name?.[0] || '')}</div>\n`}\
              <h3 style={{ ...headingStyle, fontSize: '1.125rem', marginBottom: '0.25rem' }}>${esc(m.name)}</h3>
              <p style={{ fontSize: '0.875rem', color: hsl(THEME.colors.primary), marginBottom: '0.5rem' }}>${esc(m.role)}</p>
${m.bio ? `              <p style={{ fontSize: '0.875rem', lineHeight: 1.5, color: hsl(THEME.colors.mutedForeground) }}>${esc(m.bio)}</p>\n` : ''}\
            </div>`).join('\n')}
          </div>
        </div>
      </section>`;
}

export function teamCompactJSX(c: ExtractedSectionContent): string {
  const members = c.teamMembers || [];
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.muted) }} data-variant="team:compact">
        <div style={{ ...containerStyle, maxWidth: '52rem' }}>
${c.heading ? `          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>
${c.subheading ? `            <p style={{ ...bodyStyle, fontSize: '1rem', maxWidth: '32rem', margin: '0 auto' }}>${esc(c.subheading)}</p>\n` : ''}\
          </div>\n` : ''}\
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
${members.map(m => `            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: hsl(THEME.colors.card), border: \`1px solid \${hsla(THEME.colors.border, 0.4)}\`, borderRadius: THEME.radius }}>
${m.image ? `              <img src="${m.image}" alt="${esc(m.name)}" style={{ width: '3rem', height: '3rem', borderRadius: '9999px', objectFit: 'cover', flexShrink: 0 }} />\n` : `              <div style={{ width: '3rem', height: '3rem', borderRadius: '9999px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: '700', background: hsla(THEME.colors.primary, 0.1), color: hsl(THEME.colors.primary) }}>${esc(m.name?.[0] || '')}</div>\n`}\
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '600', color: hsl(THEME.colors.cardForeground) }}>${esc(m.name)}</div>
                <div style={{ fontSize: '0.875rem', color: hsl(THEME.colors.mutedForeground) }}>${esc(m.role)}</div>
              </div>
            </div>`).join('\n')}
          </div>
        </div>
      </section>`;
}

export function teamShowcaseJSX(c: ExtractedSectionContent): string {
  const members = c.teamMembers || [];
  const featured = members[0];
  const rest = members.slice(1);
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.background) }} data-variant="team:showcase">
        <div style={{ ...containerStyle }}>
${c.heading ? `          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>
${c.subheading ? `            <p style={{ ...bodyStyle, fontSize: '1rem', maxWidth: '32rem', margin: '0 auto' }}>${esc(c.subheading)}</p>\n` : ''}\
          </div>\n` : ''}\
${featured ? `          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center', marginBottom: '2.5rem' }}>
${featured.image ? `            <img src="${featured.image}" alt="${esc(featured.name)}" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: THEME.radius }} />\n` : `            <div style={{ width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', fontWeight: '700', borderRadius: THEME.radius, background: hsla(THEME.colors.primary, 0.08), color: hsl(THEME.colors.primary) }}>${esc(featured.name?.[0] || '')}</div>\n`}\
            <div>
              <h3 style={{ ...headingStyle, fontSize: '1.5rem', marginBottom: '0.25rem' }}>${esc(featured.name)}</h3>
              <p style={{ color: hsl(THEME.colors.primary), marginBottom: '0.75rem' }}>${esc(featured.role)}</p>
${featured.bio ? `              <p style={{ ...bodyStyle, lineHeight: 1.6 }}>${esc(featured.bio)}</p>\n` : ''}\
            </div>
          </div>\n` : ''}\
${rest.length ? `          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(${Math.min(rest.length, 4)}, 1fr)', gap: '1.5rem' }}>
${rest.map(m => `            <div style={{ textAlign: 'center' }}>
${m.image ? `              <img src="${m.image}" alt="${esc(m.name)}" style={{ width: '4rem', height: '4rem', borderRadius: '9999px', objectFit: 'cover', margin: '0 auto 0.75rem' }} />\n` : `              <div style={{ width: '4rem', height: '4rem', borderRadius: '9999px', margin: '0 auto 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', fontWeight: '700', background: hsla(THEME.colors.primary, 0.1), color: hsl(THEME.colors.primary) }}>${esc(m.name?.[0] || '')}</div>\n`}\
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: hsl(THEME.colors.foreground) }}>${esc(m.name)}</div>
              <div style={{ fontSize: '0.75rem', color: hsl(THEME.colors.mutedForeground) }}>${esc(m.role)}</div>
            </div>`).join('\n')}
          </div>\n` : ''}\
        </div>
      </section>`;
}

// ============================================================================
// Gallery Variants
// ============================================================================

export function galleryMasonryJSX(c: ExtractedSectionContent): string {
  const items = c.galleryItems || [];
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.background) }} data-variant="gallery:masonry">
        <div style={{ ...containerStyle }}>
${c.heading ? `          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>
${c.subheading ? `            <p style={{ ...bodyStyle, fontSize: '1rem', maxWidth: '32rem', margin: '0 auto' }}>${esc(c.subheading)}</p>\n` : ''}\
          </div>\n` : ''}\
          <div style={{ columnCount: 3, columnGap: '1rem' }}>
${items.map(item => `            <div style={{ breakInside: 'avoid', marginBottom: '1rem', borderRadius: THEME.radius, overflow: 'hidden', position: 'relative' }}>
              <img src="${item.src}" alt="${esc(item.alt)}" style={{ width: '100%', display: 'block', borderRadius: THEME.radius }} />
${item.caption ? `              <div style={{ position: 'absolute', insetInline: 0, bottom: 0, padding: '0.75rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}><p style={{ color: '#fff', fontSize: '0.875rem' }}>${esc(item.caption)}</p></div>\n` : ''}\
            </div>`).join('\n')}
          </div>
        </div>
      </section>`;
}

export function galleryGridJSX(c: ExtractedSectionContent): string {
  const items = c.galleryItems || [];
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.muted) }} data-variant="gallery:grid">
        <div style={{ ...containerStyle }}>
${c.heading ? `          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>
${c.subheading ? `            <p style={{ ...bodyStyle, fontSize: '1rem', maxWidth: '32rem', margin: '0 auto' }}>${esc(c.subheading)}</p>\n` : ''}\
          </div>\n` : ''}\
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
${items.map(item => `            <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: THEME.radius, overflow: 'hidden' }}>
              <img src="${item.src}" alt="${esc(item.alt)}" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1rem', background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.6))' }}>
${item.caption ? `                <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: '500' }}>${esc(item.caption)}</p>\n` : ''}\
${item.category ? `                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>${esc(item.category)}</span>\n` : ''}\
              </div>
            </div>`).join('\n')}
          </div>
        </div>
      </section>`;
}

export function galleryMinimalJSX(c: ExtractedSectionContent): string {
  const items = c.galleryItems || [];
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.background) }} data-variant="gallery:minimal">
        <div style={{ ...containerStyle, maxWidth: '52rem' }}>
${c.heading ? `          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>
${c.subheading ? `            <p style={{ ...bodyStyle, fontSize: '1rem', maxWidth: '32rem', margin: '0 auto' }}>${esc(c.subheading)}</p>\n` : ''}\
          </div>\n` : ''}\
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
${items.map(item => `            <div style={{ borderRadius: THEME.radius, overflow: 'hidden', border: \`1px solid \${hsla(THEME.colors.border, 0.4)}\` }}>
              <img src="${item.src}" alt="${esc(item.alt)}" style={{ width: '100%', display: 'block', maxHeight: '24rem', objectFit: 'cover' }} />
${(item.caption || item.category) ? `              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: hsl(THEME.colors.card) }}>
${item.caption ? `                <p style={{ fontSize: '0.875rem', color: hsl(THEME.colors.cardForeground) }}>${esc(item.caption)}</p>\n` : ''}\
${item.category ? `                <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', background: hsla(THEME.colors.primary, 0.08), color: hsl(THEME.colors.primary) }}>${esc(item.category)}</span>\n` : ''}\
              </div>\n` : ''}\
            </div>`).join('\n')}
          </div>
        </div>
      </section>`;
}

// ============================================================================
// FAQ Variants
// ============================================================================

export function faqAccordionJSX(c: ExtractedSectionContent): string {
  const items = c.faqItems || [];
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.background) }} data-variant="faq:accordion">
        <div style={{ ...containerStyle, maxWidth: '48rem' }}>
${c.heading ? `          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>
${c.subheading ? `            <p style={{ ...bodyStyle, fontSize: '1rem', maxWidth: '32rem', margin: '0 auto' }}>${esc(c.subheading)}</p>\n` : ''}\
          </div>\n` : ''}\
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
${items.map(item => `            <details style={{ borderRadius: THEME.radius, border: \`1px solid \${hsla(THEME.colors.border, 0.5)}\`, overflow: 'hidden' }}>
              <summary style={{ cursor: 'pointer', padding: '1rem', fontFamily: THEME.typography.headingFont, fontWeight: '600', color: hsl(THEME.colors.foreground), background: hsl(THEME.colors.card), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>${esc(item.question)}<span style={{ color: hsl(THEME.colors.mutedForeground), fontSize: '0.875rem' }}>+</span></summary>
              <div style={{ padding: '1rem', paddingTop: 0, background: hsl(THEME.colors.card) }}>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: hsl(THEME.colors.mutedForeground) }}>${esc(item.answer)}</p>
              </div>
            </details>`).join('\n')}
          </div>
        </div>
      </section>`;
}

export function faqGridJSX(c: ExtractedSectionContent): string {
  const items = c.faqItems || [];
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.muted) }} data-variant="faq:grid">
        <div style={{ ...containerStyle }}>
${c.heading ? `          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>
${c.subheading ? `            <p style={{ ...bodyStyle, fontSize: '1rem', maxWidth: '32rem', margin: '0 auto' }}>${esc(c.subheading)}</p>\n` : ''}\
          </div>\n` : ''}\
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
${items.map(item => `            <div style={{ padding: '1.25rem', background: hsl(THEME.colors.card), border: \`1px solid \${hsla(THEME.colors.border, 0.5)}\`, borderRadius: THEME.radius }}>
              <h3 style={{ ...headingStyle, fontSize: '1rem', marginBottom: '0.5rem' }}>${esc(item.question)}</h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: hsl(THEME.colors.mutedForeground) }}>${esc(item.answer)}</p>
            </div>`).join('\n')}
          </div>
        </div>
      </section>`;
}

export function faqMinimalJSX(c: ExtractedSectionContent): string {
  const items = c.faqItems || [];
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.background) }} data-variant="faq:minimal">
        <div style={{ ...containerStyle, maxWidth: '40rem' }}>
${c.heading ? `          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>${esc(c.heading)}</h2>
${c.subheading ? `            <p style={{ ...bodyStyle }}>${esc(c.subheading)}</p>\n` : ''}\
          </div>\n` : ''}\
          <div>
${items.map((item, i) => `            <div style={{ paddingBlock: '1.25rem'${i < items.length - 1 ? `, borderBottom: \`1px solid \${hsla(THEME.colors.border, 0.3)}\`` : ''} }}>
              <h3 style={{ ...headingStyle, fontSize: '1rem', marginBottom: '0.5rem' }}>${esc(item.question)}</h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: hsl(THEME.colors.mutedForeground) }}>${esc(item.answer)}</p>
            </div>`).join('\n')}
          </div>
        </div>
      </section>`;
}

// ============================================================================
// Stats Variants
// ============================================================================

export function statsRowJSX(c: ExtractedSectionContent): string {
  const items = c.statItems || [];
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.background) }} data-variant="stats:row">
        <div style={{ ...containerStyle }}>
${c.heading ? `          <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', textAlign: 'center', marginBottom: '2.5rem' }}>${esc(c.heading)}</h2>\n` : ''}\
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '3rem' }}>
${items.map(stat => `            <div style={{ textAlign: 'center', padding: '0 1rem' }}>
${stat.icon ? `              <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>${esc(stat.icon)}</span>\n` : ''}\
              <div style={{ fontSize: '2.5rem', fontWeight: '700', fontFamily: THEME.typography.headingFont, color: hsl(THEME.colors.primary), marginBottom: '0.25rem' }}>${esc(stat.value)}</div>
              <div style={{ fontSize: '0.875rem', color: hsl(THEME.colors.mutedForeground) }}>${esc(stat.label)}</div>
            </div>`).join('\n')}
          </div>
        </div>
      </section>`;
}

export function statsCardsJSX(c: ExtractedSectionContent): string {
  const items = c.statItems || [];
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.muted) }} data-variant="stats:cards">
        <div style={{ ...containerStyle }}>
${c.heading ? `          <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', textAlign: 'center', marginBottom: '2.5rem' }}>${esc(c.heading)}</h2>\n` : ''}\
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(${Math.min(items.length, 4)}, 1fr)', gap: '1.25rem' }}>
${items.map(stat => `            <div style={{ padding: '1.5rem', textAlign: 'center', background: hsl(THEME.colors.card), border: \`1px solid \${hsla(THEME.colors.border, 0.5)}\`, borderRadius: THEME.radius }}>
${stat.icon ? `              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}>${esc(stat.icon)}</span>\n` : ''}\
              <div style={{ fontSize: '2rem', fontWeight: '700', fontFamily: THEME.typography.headingFont, color: hsl(THEME.colors.primary), marginBottom: '0.25rem' }}>${esc(stat.value)}</div>
              <div style={{ fontSize: '0.875rem', color: hsl(THEME.colors.mutedForeground) }}>${esc(stat.label)}</div>
            </div>`).join('\n')}
          </div>
        </div>
      </section>`;
}

export function statsMinimalJSX(c: ExtractedSectionContent): string {
  const items = c.statItems || [];
  return `      <section style={{ ...sectionPad, background: \`linear-gradient(135deg, \${hsla(THEME.colors.primary, 0.04)}, \${hsla(THEME.colors.secondary, 0.04)})\` }} data-variant="stats:minimal">
        <div style={{ ...containerStyle }}>
${c.heading ? `          <h2 style={{ ...headingStyle, fontSize: '1.25rem', textAlign: 'center', marginBottom: '2rem' }}>${esc(c.heading)}</h2>\n` : ''}\
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
${items.map((stat, i) => `${i > 0 ? `            <div style={{ width: '1px', height: '3rem', background: hsla(THEME.colors.border, 0.4), margin: '0 1.5rem' }} />\n` : ''}            <div style={{ textAlign: 'center', padding: '0.5rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', fontFamily: THEME.typography.headingFont, color: hsl(THEME.colors.foreground) }}>${esc(stat.value)}</div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem', color: hsl(THEME.colors.mutedForeground) }}>${esc(stat.label)}</div>
            </div>`).join('\n')}
          </div>
        </div>
      </section>`;
}

// ============================================================================
// About Variants
// ============================================================================

export function aboutSplitJSX(c: ExtractedSectionContent): string {
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.background) }} data-variant="about:split">
        <div style={{ ...containerStyle, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
          <div>
${c.heading ? `            <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '1rem' }}>${esc(c.heading)}</h2>\n` : ''}\
${c.description ? `            <p style={{ ...bodyStyle, lineHeight: 1.7, marginBottom: '1.5rem' }}>${esc(c.description)}</p>\n` : ''}\
${c.ctaButtons?.length ? `            <div style={{ display: 'flex', gap: '0.75rem' }}>
${renderThemedButtons(c.ctaButtons)}
            </div>\n` : ''}\
          </div>
          <div>
${c.imageSrc
    ? `            <img src="${c.imageSrc}" alt="${esc(c.imageAlt || '')}" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: THEME.radius }} />`
    : `            <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: THEME.radius, background: \`linear-gradient(135deg, \${hsla(THEME.colors.primary, 0.08)}, \${hsla(THEME.colors.secondary, 0.08)})\`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🏢</div>`}
          </div>
        </div>
      </section>`;
}

export function aboutCenteredJSX(c: ExtractedSectionContent): string {
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.muted) }} data-variant="about:centered">
        <div style={{ ...containerStyle, maxWidth: '48rem', textAlign: 'center' }}>
${c.imageSrc ? `          <img src="${c.imageSrc}" alt="${esc(c.imageAlt || '')}" style={{ width: '100%', maxHeight: '20rem', objectFit: 'cover', borderRadius: THEME.radius, marginBottom: '2rem' }} />\n` : ''}\
${c.heading ? `          <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '1rem' }}>${esc(c.heading)}</h2>\n` : ''}\
${c.description ? `          <p style={{ ...bodyStyle, lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: '40rem', marginInline: 'auto' }}>${esc(c.description)}</p>\n` : ''}\
${c.ctaButtons?.length ? `          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
${renderThemedButtons(c.ctaButtons)}
          </div>\n` : ''}\
        </div>
      </section>`;
}

export function aboutTimelineJSX(c: ExtractedSectionContent): string {
  const sentences = (c.description || '').split(/\.\s+/).filter(s => s.trim()).map(s => s.endsWith('.') ? s : s + '.');
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.background) }} data-variant="about:timeline">
        <div style={{ ...containerStyle, maxWidth: '48rem' }}>
${c.heading ? `          <h2 style={{ ...headingStyle, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', textAlign: 'center', marginBottom: '2.5rem' }}>${esc(c.heading)}</h2>\n` : ''}\
          <div style={{ position: 'relative', paddingLeft: '2rem' }}>
            <div style={{ position: 'absolute', left: '0.75rem', top: 0, bottom: 0, width: '1px', background: hsla(THEME.colors.primary, 0.2) }} />
${sentences.map(s => `            <div style={{ position: 'relative', marginBottom: '2rem', paddingLeft: '1.5rem' }}>
              <div style={{ position: 'absolute', left: '-0.75rem', top: '0.375rem', width: '0.75rem', height: '0.75rem', borderRadius: '9999px', background: hsl(THEME.colors.primary), border: \`2px solid \${hsl(THEME.colors.background)}\` }} />
              <p style={{ ...bodyStyle, lineHeight: 1.6 }}>${esc(s)}</p>
            </div>`).join('\n')}
          </div>
${c.ctaButtons?.length ? `          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
${renderThemedButtons(c.ctaButtons)}
          </div>\n` : ''}\
        </div>
      </section>`;
}

// ============================================================================
// Logo Cloud Variants
// ============================================================================

export function logoCloudGridJSX(c: ExtractedSectionContent): string {
  const logos = c.logos || [];
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.muted) }} data-variant="logo-cloud:grid">
        <div style={{ ...containerStyle }}>
${c.heading ? `          <h2 style={{ fontSize: '1.25rem', textAlign: 'center', marginBottom: '2rem', fontFamily: THEME.typography.headingFont, fontWeight: THEME.typography.headingWeight, color: hsl(THEME.colors.mutedForeground) }}>${esc(c.heading)}</h2>\n` : ''}\
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(${Math.min(logos.length, 5)}, 1fr)', gap: '1.5rem', alignItems: 'center', justifyItems: 'center' }}>
${logos.map(logo => `            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', width: '100%', minHeight: '5rem', background: hsl(THEME.colors.card), border: \`1px solid \${hsla(THEME.colors.border, 0.4)}\`, borderRadius: THEME.radius }}>
${logo.src ? `              <img src="${logo.src}" alt="${esc(logo.name)}" style={{ maxHeight: '2.5rem', maxWidth: '100%', objectFit: 'contain', filter: 'grayscale(100%)', opacity: 0.7 }} />\n` : `              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: hsl(THEME.colors.mutedForeground) }}>${esc(logo.name)}</span>\n`}\
            </div>`).join('\n')}
          </div>
        </div>
      </section>`;
}

export function logoCloudScrollJSX(c: ExtractedSectionContent): string {
  const logos = c.logos || [];
  return `      <section style={{ ...sectionPad, background: hsl(THEME.colors.background), overflow: 'hidden' }} data-variant="logo-cloud:scroll">
        <div style={{ ...containerStyle }}>
${c.heading ? `          <h2 style={{ fontSize: '1.25rem', textAlign: 'center', marginBottom: '2rem', fontFamily: THEME.typography.headingFont, fontWeight: THEME.typography.headingWeight, color: hsl(THEME.colors.mutedForeground) }}>${esc(c.heading)}</h2>\n` : ''}\
          <div style={{ position: 'relative', overflow: 'hidden', maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)' }}>
            <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', animation: 'scroll 20s linear infinite', width: 'max-content' }}>
${[...logos, ...logos].map(logo => `              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '0 1rem', minWidth: '8rem' }}>
${logo.src ? `                <img src="${logo.src}" alt="${esc(logo.name)}" style={{ maxHeight: '2rem', maxWidth: '100%', objectFit: 'contain', filter: 'grayscale(100%)', opacity: 0.6 }} />\n` : `                <span style={{ fontSize: '0.875rem', fontWeight: '600', whiteSpace: 'nowrap', color: hsl(THEME.colors.mutedForeground) }}>${esc(logo.name)}</span>\n`}\
              </div>`).join('\n')}
            </div>
          </div>
          <style>{\`@keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }\`}</style>
        </div>
      </section>`;
}

export function logoCloudMinimalJSX(c: ExtractedSectionContent): string {
  const logos = c.logos || [];
  return `      <section style={{ padding: '2.5rem 1rem', background: hsl(THEME.colors.background), borderTop: \`1px solid \${hsla(THEME.colors.border, 0.3)}\`, borderBottom: \`1px solid \${hsla(THEME.colors.border, 0.3)}\` }} data-variant="logo-cloud:minimal">
        <div style={{ ...containerStyle }}>
${c.heading ? `          <p style={{ fontSize: '0.75rem', textAlign: 'center', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: hsl(THEME.colors.mutedForeground) }}>${esc(c.heading)}</p>\n` : ''}\
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '2rem' }}>
${logos.map(logo => `            <div style={{ display: 'flex', alignItems: 'center' }}>
${logo.src ? `              <img src="${logo.src}" alt="${esc(logo.name)}" style={{ maxHeight: '1.75rem', maxWidth: '100%', objectFit: 'contain', filter: 'grayscale(100%)', opacity: 0.5 }} />\n` : `              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: hsla(THEME.colors.mutedForeground, 0.5) }}>${esc(logo.name)}</span>\n`}\
            </div>`).join('\n')}
          </div>
        </div>
      </section>`;
}
