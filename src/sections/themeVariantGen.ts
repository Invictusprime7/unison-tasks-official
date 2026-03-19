/**
 * Theme-Variant Code Generators
 *
 * Deterministic layout selection per theme — each aesthetic produces a
 * visually distinct site structure, not just different colors.
 *
 * Generator functions return JavaScript source code strings that are
 * interpolated into the compositionToReactCode template literal.
 * All output references the THEME / hsl / hsla / headingStyle / bodyStyle /
 * containerStyle / sectionPad / primaryBtnStyle / outlineBtnStyle / cardStyle
 * globals already defined by the serializer.
 */

// ============================================================================
// Layout Profile
// ============================================================================

export interface ThemeLayoutProfile {
  hero: 'centered' | 'split-image' | 'full-bleed';
  navbar: 'standard' | 'centered-logo' | 'minimal-dark';
  cta: 'centered' | 'gradient-banner' | 'split-card';
  cardStyle: 'shadow' | 'bordered' | 'glass' | 'flat' | 'elevated' | 'soft';
  uppercaseHeadings: boolean;
  heroDecoration: 'gradient-orb' | 'none' | 'glow-ring';
}

export const THEME_VARIANT_MAP: Record<string, ThemeLayoutProfile> = {
  modern: {
    hero: 'split-image',
    navbar: 'standard',
    cta: 'gradient-banner',
    cardStyle: 'shadow',
    uppercaseHeadings: false,
    heroDecoration: 'gradient-orb',
  },
  editorial: {
    hero: 'centered',
    navbar: 'centered-logo',
    cta: 'split-card',
    cardStyle: 'bordered',
    uppercaseHeadings: false,
    heroDecoration: 'none',
  },
  futuristic: {
    hero: 'full-bleed',
    navbar: 'minimal-dark',
    cta: 'gradient-banner',
    cardStyle: 'glass',
    uppercaseHeadings: true,
    heroDecoration: 'glow-ring',
  },
  minimalist: {
    hero: 'centered',
    navbar: 'standard',
    cta: 'centered',
    cardStyle: 'flat',
    uppercaseHeadings: false,
    heroDecoration: 'none',
  },
  bold: {
    hero: 'full-bleed',
    navbar: 'minimal-dark',
    cta: 'split-card',
    cardStyle: 'elevated',
    uppercaseHeadings: true,
    heroDecoration: 'none',
  },
  organic: {
    hero: 'split-image',
    navbar: 'centered-logo',
    cta: 'centered',
    cardStyle: 'soft',
    uppercaseHeadings: false,
    heroDecoration: 'gradient-orb',
  },
};

export function getThemeLayoutProfile(themeId: string): ThemeLayoutProfile | undefined {
  return THEME_VARIANT_MAP[themeId];
}

// ============================================================================
// Card Style Generator
// ============================================================================

export function genCardStyleCode(variant?: string): string {
  switch (variant) {
    case 'shadow':
      return `const cardStyle = {
  background: hsl(THEME.colors.card), color: hsl(THEME.colors.cardForeground),
  borderRadius: THEME.radius, boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
  overflow: 'hidden', transition: 'all 0.3s ease',
};`;
    case 'bordered':
      return `const cardStyle = {
  background: hsl(THEME.colors.card), color: hsl(THEME.colors.cardForeground),
  borderRadius: THEME.radius, border: \`1px solid \${hsla(THEME.colors.border, 1)}\`,
  overflow: 'hidden', transition: 'all 0.2s ease',
};`;
    case 'glass':
      return `const cardStyle = {
  background: hsla(THEME.colors.card, 0.4), color: hsl(THEME.colors.cardForeground),
  borderRadius: THEME.radius, border: \`1px solid \${hsla(THEME.colors.primary, 0.18)}\`,
  backdropFilter: 'blur(16px)', boxShadow: \`0 0 24px \${hsla(THEME.colors.primary, 0.08)}\`,
  overflow: 'hidden', transition: 'all 0.3s ease',
};`;
    case 'flat':
      return `const cardStyle = {
  background: hsl(THEME.colors.muted), color: hsl(THEME.colors.cardForeground),
  borderRadius: '0', border: 'none',
  overflow: 'hidden', transition: 'all 0.2s ease',
};`;
    case 'elevated':
      return `const cardStyle = {
  background: hsl(THEME.colors.card), color: hsl(THEME.colors.cardForeground),
  borderRadius: '0', border: \`2px solid \${hsl(THEME.colors.foreground)}\`,
  boxShadow: \`6px 6px 0 \${hsl(THEME.colors.primary)}\`,
  overflow: 'hidden', transition: 'all 0.2s ease',
};`;
    case 'soft':
      return `const cardStyle = {
  background: hsl(THEME.colors.card), color: hsl(THEME.colors.cardForeground),
  borderRadius: \`calc(\${THEME.radius} * 2)\`, boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
  border: \`1px solid \${hsla(THEME.colors.border, 0.5)}\`,
  overflow: 'hidden', transition: 'all 0.3s ease',
};`;
    default:
      return `const cardStyle = {
  background: hsl(THEME.colors.card), color: hsl(THEME.colors.cardForeground),
  borderRadius: THEME.radius, border: \`1px solid \${hsla(THEME.colors.border, 1)}\`,
  overflow: 'hidden', transition: 'all 0.3s ease',
};`;
  }
}

// ============================================================================
// Navbar Variants
// ============================================================================

export function genNavbarCode(variant?: string): string {
  if (variant === 'centered-logo') {
    return `function Navbar({ props }) {
  const { brand, links = [], cta } = props;
  const half = Math.ceil(links.length / 2);
  const left = links.slice(0, half);
  const right = links.slice(half);
  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: hsla(THEME.colors.background, 0.95), borderBottom: \`1px solid \${hsla(THEME.colors.border, 0.3)}\` }}>
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '5rem', gap: '2rem' }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {left.map((l, i) => <a key={i} href={l.href} style={{ ...bodyStyle, fontSize: '0.9rem', textDecoration: 'none' }}>{l.label}</a>)}
        </nav>
        <a href="#" style={{ ...headingStyle, fontSize: '1.5rem', textDecoration: 'none', padding: '0 1rem' }}>{brand}</a>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {right.map((l, i) => <a key={i} href={l.href} style={{ ...bodyStyle, fontSize: '0.9rem', textDecoration: 'none' }}>{l.label}</a>)}
          {cta && <a href={cta.href || '#'} data-intent={cta.intent} style={{ ...primaryBtnStyle, fontSize: '0.875rem', padding: '0.5rem 1.25rem' }}>{cta.label}</a>}
        </nav>
      </div>
    </header>
  );
}`;
  }

  if (variant === 'minimal-dark') {
    return `function Navbar({ props }) {
  const { brand, links = [], cta } = props;
  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: hsl(THEME.colors.background), borderBottom: \`1px solid \${hsla(THEME.colors.border, 0.15)}\` }}>
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.5rem' }}>
        <a href="#" style={{ ...headingStyle, fontSize: '1.25rem', textDecoration: 'none', letterSpacing: '0.05em' }}>{brand}</a>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {links.map((l, i) => <a key={i} href={l.href} style={{ ...bodyStyle, fontSize: '0.85rem', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l.label}</a>)}
          {cta && <a href={cta.href || '#'} data-intent={cta.intent} style={{ ...primaryBtnStyle, fontSize: '0.8rem', padding: '0.5rem 1.5rem', borderRadius: '9999px' }}>{cta.label}</a>}
        </nav>
      </div>
    </header>
  );
}`;
  }

  // standard (default)
  return `function Navbar({ props }) {
  const { brand, links = [], cta } = props;
  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: hsla(THEME.colors.background, 0.85), backdropFilter: 'blur(12px)', borderBottom: \`1px solid \${hsla(THEME.colors.border, 0.5)}\` }}>
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '5rem' }}>
        <a href="#" style={{ ...headingStyle, fontSize: '1.5rem', textDecoration: 'none', background: \`linear-gradient(135deg, hsl(\${THEME.colors.primary}), hsl(\${THEME.colors.secondary}))\`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{brand}</a>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {links.map((l, i) => <a key={i} href={l.href} style={{ ...bodyStyle, fontSize: '0.9rem', textDecoration: 'none' }}>{l.label}</a>)}
          {cta && <a href={cta.href || '#'} data-intent={cta.intent} style={{ ...primaryBtnStyle, fontSize: '0.875rem', padding: '0.5rem 1.25rem' }}>{cta.label}</a>}
        </nav>
      </div>
    </header>
  );
}`;
}

// ============================================================================
// Hero Variants
// ============================================================================

export function genHeroCode(variant?: string, decoration?: string): string {
  if (variant === 'split-image') {
    const decoCode = decoration === 'gradient-orb'
      ? `\n      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '500px', height: '500px', background: \`radial-gradient(circle, \${hsla(THEME.colors.primary, 0.06)} 0%, transparent 70%)\`, borderRadius: '50%', pointerEvents: 'none' }} />`
      : '';
    return `function Hero({ props }) {
  const { headline, subheadline, ctas = [], badge, stats } = props;
  return (
    <section style={{ ...sectionPad, paddingTop: '8rem', background: hsl(THEME.colors.background), position: 'relative', overflow: 'hidden' }}>${decoCode}
      <div style={{ ...containerStyle, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center', position: 'relative' }}>
        <div>
          {badge && <span style={{ display: 'inline-block', padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '600', background: hsla(THEME.colors.primary, 0.12), color: hsl(THEME.colors.primary), border: \`1px solid \${hsla(THEME.colors.primary, 0.25)}\`, marginBottom: '1.5rem' }}>{badge}</span>}
          <h1 style={{ ...headingStyle, fontSize: 'clamp(2rem, 4vw, 3.25rem)', lineHeight: 1.1, marginBottom: '1.5rem' }}>{headline}</h1>
          {subheadline && <p style={{ ...bodyStyle, fontSize: '1.15rem', lineHeight: 1.7, marginBottom: '2rem' }}>{subheadline}</p>}
          {ctas.length > 0 && <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>{ctas.map((c, i) => <a key={i} href={c.href||'#'} data-intent={c.intent} style={c.variant === 'outline' ? outlineBtnStyle : primaryBtnStyle}>{c.label}</a>)}</div>}
          {stats && stats.length > 0 && <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>{stats.map((s, i) => <div key={i}><div style={{ ...headingStyle, fontSize: '1.5rem', color: hsl(THEME.colors.primary) }}>{s.value}</div><div style={{ ...bodyStyle, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div></div>)}</div>}
        </div>
        <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: \`calc(\${THEME.radius} * 2)\`, background: \`linear-gradient(135deg, \${hsla(THEME.colors.primary, 0.12)}, \${hsla(THEME.colors.secondary, 0.12)})\`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
          <span style={{ fontSize: '3rem', opacity: 0.4 }}>🖼️</span>
        </div>
      </div>
    </section>
  );
}`;
  }

  if (variant === 'full-bleed') {
    const glowRing = decoration === 'glow-ring'
      ? `\n        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', borderRadius: '50%', border: \`1px solid \${hsla(THEME.colors.primary, 0.15)}\`, boxShadow: \`0 0 80px \${hsla(THEME.colors.primary, 0.08)}, inset 0 0 80px \${hsla(THEME.colors.primary, 0.04)}\`, pointerEvents: 'none' }} />`
      : '';
    return `function Hero({ props }) {
  const { headline, subheadline, ctas = [], badge } = props;
  return (
    <section style={{ position: 'relative', minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: \`linear-gradient(135deg, hsl(\${THEME.colors.primary}), hsl(\${THEME.colors.secondary}))\`, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.65))' }} />${glowRing}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '56rem', margin: '0 auto', padding: '5rem 1.5rem', textAlign: 'center' }}>
        {badge && <span style={{ display: 'inline-block', padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '500', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', marginBottom: '1.5rem', backdropFilter: 'blur(4px)' }}>{badge}</span>}
        <h1 style={{ fontFamily: THEME.typography.headingFont, fontWeight: THEME.typography.headingWeight, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.05, marginBottom: '1.5rem', color: '#fff', textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>{headline}</h1>
        {subheadline && <p style={{ fontFamily: THEME.typography.bodyFont, fontSize: '1.25rem', lineHeight: 1.6, maxWidth: '640px', margin: '0 auto 2rem', color: 'rgba(255,255,255,0.85)' }}>{subheadline}</p>}
        {ctas.length > 0 && <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>{ctas.map((c, i) => <a key={i} href={c.href||'#'} data-intent={c.intent} style={i === 0 && c.variant !== 'outline' ? { ...primaryBtnStyle, background: '#fff', color: hsl(THEME.colors.primary), boxShadow: '0 4px 20px rgba(0,0,0,0.2)' } : { ...outlineBtnStyle, borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>{c.label}</a>)}</div>}
      </div>
    </section>
  );
}`;
  }

  // centered (default)
  const decoOrb = decoration === 'gradient-orb'
    ? `\n      <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '600px', height: '600px', background: \`radial-gradient(circle, \${hsla(THEME.colors.primary, 0.08)} 0%, transparent 70%)\`, borderRadius: '50%', pointerEvents: 'none' }} />`
    : '';
  return `function Hero({ props }) {
  const { headline, subheadline, ctas = [], badge, stats } = props;
  return (
    <section style={{ ...sectionPad, paddingTop: '8rem', background: hsl(THEME.colors.background), position: 'relative', overflow: 'hidden' }}>${decoOrb}
      <div style={{ ...containerStyle, textAlign: 'center', position: 'relative' }}>
        {badge && <span style={{ display: 'inline-block', padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '600', background: hsla(THEME.colors.primary, 0.12), color: hsl(THEME.colors.primary), border: \`1px solid \${hsla(THEME.colors.primary, 0.25)}\`, marginBottom: '1.5rem' }}>{badge}</span>}
        <h1 style={{ ...headingStyle, fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1, marginBottom: '1.5rem' }}>{headline}</h1>
        {subheadline && <p style={{ ...bodyStyle, fontSize: '1.25rem', lineHeight: 1.6, maxWidth: '640px', margin: '0 auto', marginBottom: '2rem' }}>{subheadline}</p>}
        {ctas.length > 0 && <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>{ctas.map((c, i) => <a key={i} href={c.href||'#'} data-intent={c.intent} style={c.variant === 'outline' ? outlineBtnStyle : primaryBtnStyle}>{c.label}</a>)}</div>}
        {stats && stats.length > 0 && <div style={{ display: 'flex', gap: '2.5rem', marginTop: '3rem', justifyContent: 'center' }}>{stats.map((s, i) => <div key={i} style={{ textAlign: 'center' }}><div style={{ ...headingStyle, fontSize: '2rem', color: hsl(THEME.colors.primary) }}>{s.value}</div><div style={{ ...bodyStyle, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div></div>)}</div>}
      </div>
    </section>
  );
}`;
}

// ============================================================================
// CTA Variants
// ============================================================================

export function genCTACode(variant?: string): string {
  if (variant === 'gradient-banner') {
    return `function CTA({ props }) {
  const { headline, description, ctas = [] } = props;
  return (
    <section style={{ ...sectionPad, background: \`linear-gradient(135deg, hsl(\${THEME.colors.primary}), hsl(\${THEME.colors.secondary}))\` }}>
      <div style={{ ...containerStyle, maxWidth: '48rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: THEME.typography.headingFont, fontWeight: THEME.typography.headingWeight, fontSize: '2.5rem', color: hsl(THEME.colors.primaryForeground), marginBottom: '1rem', textShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>{headline}</h2>
        {description && <p style={{ fontFamily: THEME.typography.bodyFont, fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto 2rem', color: hsla(THEME.colors.primaryForeground, 0.85), lineHeight: 1.7 }}>{description}</p>}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>{ctas.map((c, i) => <a key={i} href={c.href||'#'} data-intent={c.intent} style={i === 0 && c.variant !== 'outline' ? { display: 'inline-block', padding: '0.75rem 2rem', borderRadius: THEME.radius, background: '#fff', color: hsl(THEME.colors.primary), fontWeight: '600', textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', transition: 'all 0.2s ease' } : { display: 'inline-block', padding: '0.75rem 2rem', borderRadius: THEME.radius, border: '2px solid rgba(255,255,255,0.4)', color: hsl(THEME.colors.primaryForeground), fontWeight: '500', textDecoration: 'none', transition: 'all 0.2s ease' }}>{c.label}</a>)}</div>
      </div>
    </section>
  );
}`;
  }

  if (variant === 'split-card') {
    return `function CTA({ props }) {
  const { headline, description, ctas = [] } = props;
  return (
    <section style={{ ...sectionPad, background: hsl(THEME.colors.background) }}>
      <div style={{ ...containerStyle, maxWidth: '64rem' }}>
        <div style={{ background: \`linear-gradient(135deg, hsl(\${THEME.colors.primary}), hsl(\${THEME.colors.secondary}))\`, borderRadius: \`calc(\${THEME.radius} * 2)\`, padding: '3rem', display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem', alignItems: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
          <div>
            <h2 style={{ fontFamily: THEME.typography.headingFont, fontWeight: THEME.typography.headingWeight, fontSize: 'clamp(1.25rem, 2.5vw, 2rem)', color: hsl(THEME.colors.primaryForeground), marginBottom: '0.75rem' }}>{headline}</h2>
            {description && <p style={{ fontFamily: THEME.typography.bodyFont, color: hsla(THEME.colors.primaryForeground, 0.75), lineHeight: 1.6 }}>{description}</p>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
            {ctas.map((c, i) => <a key={i} href={c.href||'#'} data-intent={c.intent} style={i === 0 && c.variant !== 'outline' ? { display: 'inline-block', padding: '0.75rem 2rem', borderRadius: THEME.radius, background: '#fff', color: hsl(THEME.colors.primary), fontWeight: '600', textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', textAlign: 'center', transition: 'all 0.2s ease' } : { display: 'inline-block', padding: '0.75rem 2rem', borderRadius: THEME.radius, border: '1px solid rgba(255,255,255,0.3)', color: hsl(THEME.colors.primaryForeground), fontWeight: '500', textDecoration: 'none', textAlign: 'center', transition: 'all 0.2s ease' }}>{c.label}</a>)}
          </div>
        </div>
      </div>
    </section>
  );
}`;
  }

  // centered (default)
  return `function CTA({ props }) {
  const { headline, description, ctas = [] } = props;
  return (
    <section style={{ ...sectionPad, background: \`linear-gradient(135deg, \${hsla(THEME.colors.primary, 0.1)}, \${hsla(THEME.colors.secondary, 0.1)})\`, textAlign: 'center', borderTop: \`1px solid \${hsla(THEME.colors.primary, 0.15)}\`, borderBottom: \`1px solid \${hsla(THEME.colors.primary, 0.15)}\` }}>
      <div style={containerStyle}>
        <h2 style={{ ...headingStyle, fontSize: '2.5rem', marginBottom: '1rem' }}>{headline}</h2>
        {description && <p style={{ ...bodyStyle, fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto 2rem' }}>{description}</p>}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>{ctas.map((c, i) => <a key={i} href={c.href||'#'} data-intent={c.intent} style={c.variant === 'outline' ? outlineBtnStyle : primaryBtnStyle}>{c.label}</a>)}</div>
      </div>
    </section>
  );
}`;
}
