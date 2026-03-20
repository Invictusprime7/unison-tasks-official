/**
 * Design Variation Generator — Theme-Aware
 *
 * Each of the 6 aesthetics (modern, editorial, futuristic, minimalist, bold, organic)
 * deterministically maps to specific layout, effects, button, image, and content
 * parameters. This ensures the generated site deeply embodies the chosen aesthetic
 * rather than relying on random parameters that conflict with the theme's identity.
 *
 * When no theme is selected, falls back to weighted-random generation.
 */

// ============================================================================
// Option types
// ============================================================================

type HeroStyle = "centered" | "split" | "image_left" | "image_right" | "fullscreen" | "minimal";
type SectionSpacing = "compact" | "normal" | "spacious";
type MaxWidth = "narrow" | "normal" | "wide" | "full";
type NavStyle = "fixed" | "sticky" | "static";
type ShadowLevel = "none" | "subtle" | "normal" | "dramatic";
type ImageStyle = "rounded" | "sharp" | "circular" | "organic";
type AspectRatio = "square" | "portrait" | "landscape" | "auto";
type OverlayStyle = "none" | "gradient" | "color" | "blur";
type ButtonStyle = "rounded" | "pill" | "sharp" | "outline";
type ButtonSize = "small" | "medium" | "large";
type HoverEffect = "scale" | "glow" | "lift" | "none";
type ContentDensity = "minimal" | "balanced" | "rich";
type WritingStyle = "professional" | "conversational" | "bold" | "minimal";

// ============================================================================
// Design Variation Interface
// ============================================================================

export interface DesignVariation {
  layout: {
    hero_style: HeroStyle;
    section_spacing: SectionSpacing;
    max_width: MaxWidth;
    navigation_style: NavStyle;
  };
  effects: {
    animations: boolean;
    scroll_animations: boolean;
    hover_effects: boolean;
    gradient_backgrounds: boolean;
    glassmorphism: boolean;
    shadows: ShadowLevel;
  };
  images: {
    style: ImageStyle;
    aspect_ratio: AspectRatio;
    placeholder_service: "unsplash";
    overlay_style: OverlayStyle;
  };
  buttons: {
    style: ButtonStyle;
    size: ButtonSize;
    hover_effect: HoverEffect;
  };
  sections: {
    include_stats: boolean;
    include_testimonials: boolean;
    include_faq: boolean;
    include_cta_banner: boolean;
    include_newsletter: boolean;
    include_social_proof: boolean;
    use_counter_animations: boolean;
  };
  content: {
    density: ContentDensity;
    use_icons: boolean;
    use_emojis: boolean;
    writing_style: WritingStyle;
  };
}

// ============================================================================
// Theme-Specific Design Profiles
// Each aesthetic has a deterministic design fingerprint
// ============================================================================

const THEME_DESIGN_PROFILES: Record<string, DesignVariation> = {
  modern: {
    layout: {
      hero_style: "split",
      section_spacing: "spacious",
      max_width: "wide",
      navigation_style: "sticky",
    },
    effects: {
      animations: true,
      scroll_animations: true,
      hover_effects: true,
      gradient_backgrounds: true,
      glassmorphism: false,
      shadows: "normal",
    },
    images: {
      style: "rounded",
      aspect_ratio: "landscape",
      placeholder_service: "unsplash",
      overlay_style: "gradient",
    },
    buttons: {
      style: "pill",
      size: "large",
      hover_effect: "lift",
    },
    sections: {
      include_stats: true,
      include_testimonials: true,
      include_faq: true,
      include_cta_banner: true,
      include_newsletter: true,
      include_social_proof: true,
      use_counter_animations: true,
    },
    content: {
      density: "balanced",
      use_icons: true,
      use_emojis: false,
      writing_style: "professional",
    },
  },

  editorial: {
    layout: {
      hero_style: "centered",
      section_spacing: "spacious",
      max_width: "narrow",
      navigation_style: "static",
    },
    effects: {
      animations: true,
      scroll_animations: true,
      hover_effects: true,
      gradient_backgrounds: false,
      glassmorphism: false,
      shadows: "subtle",
    },
    images: {
      style: "sharp",
      aspect_ratio: "portrait",
      placeholder_service: "unsplash",
      overlay_style: "none",
    },
    buttons: {
      style: "sharp",
      size: "medium",
      hover_effect: "scale",
    },
    sections: {
      include_stats: false,
      include_testimonials: true,
      include_faq: true,
      include_cta_banner: true,
      include_newsletter: true,
      include_social_proof: false,
      use_counter_animations: false,
    },
    content: {
      density: "rich",
      use_icons: false,
      use_emojis: false,
      writing_style: "conversational",
    },
  },

  futuristic: {
    layout: {
      hero_style: "fullscreen",
      section_spacing: "compact",
      max_width: "full",
      navigation_style: "fixed",
    },
    effects: {
      animations: true,
      scroll_animations: true,
      hover_effects: true,
      gradient_backgrounds: true,
      glassmorphism: true,
      shadows: "dramatic",
    },
    images: {
      style: "sharp",
      aspect_ratio: "landscape",
      placeholder_service: "unsplash",
      overlay_style: "blur",
    },
    buttons: {
      style: "sharp",
      size: "large",
      hover_effect: "glow",
    },
    sections: {
      include_stats: true,
      include_testimonials: true,
      include_faq: false,
      include_cta_banner: true,
      include_newsletter: true,
      include_social_proof: true,
      use_counter_animations: true,
    },
    content: {
      density: "minimal",
      use_icons: true,
      use_emojis: false,
      writing_style: "bold",
    },
  },

  minimalist: {
    layout: {
      hero_style: "minimal",
      section_spacing: "spacious",
      max_width: "narrow",
      navigation_style: "static",
    },
    effects: {
      animations: true,
      scroll_animations: false,
      hover_effects: true,
      gradient_backgrounds: false,
      glassmorphism: false,
      shadows: "none",
    },
    images: {
      style: "sharp",
      aspect_ratio: "auto",
      placeholder_service: "unsplash",
      overlay_style: "none",
    },
    buttons: {
      style: "outline",
      size: "medium",
      hover_effect: "none",
    },
    sections: {
      include_stats: false,
      include_testimonials: true,
      include_faq: false,
      include_cta_banner: false,
      include_newsletter: false,
      include_social_proof: false,
      use_counter_animations: false,
    },
    content: {
      density: "minimal",
      use_icons: false,
      use_emojis: false,
      writing_style: "minimal",
    },
  },

  bold: {
    layout: {
      hero_style: "fullscreen",
      section_spacing: "compact",
      max_width: "full",
      navigation_style: "fixed",
    },
    effects: {
      animations: true,
      scroll_animations: true,
      hover_effects: true,
      gradient_backgrounds: true,
      glassmorphism: false,
      shadows: "dramatic",
    },
    images: {
      style: "sharp",
      aspect_ratio: "landscape",
      placeholder_service: "unsplash",
      overlay_style: "color",
    },
    buttons: {
      style: "sharp",
      size: "large",
      hover_effect: "scale",
    },
    sections: {
      include_stats: true,
      include_testimonials: true,
      include_faq: true,
      include_cta_banner: true,
      include_newsletter: false,
      include_social_proof: true,
      use_counter_animations: true,
    },
    content: {
      density: "balanced",
      use_icons: true,
      use_emojis: false,
      writing_style: "bold",
    },
  },

  organic: {
    layout: {
      hero_style: "image_right",
      section_spacing: "spacious",
      max_width: "normal",
      navigation_style: "sticky",
    },
    effects: {
      animations: true,
      scroll_animations: true,
      hover_effects: true,
      gradient_backgrounds: true,
      glassmorphism: false,
      shadows: "subtle",
    },
    images: {
      style: "organic",
      aspect_ratio: "auto",
      placeholder_service: "unsplash",
      overlay_style: "gradient",
    },
    buttons: {
      style: "rounded",
      size: "large",
      hover_effect: "lift",
    },
    sections: {
      include_stats: true,
      include_testimonials: true,
      include_faq: true,
      include_cta_banner: true,
      include_newsletter: true,
      include_social_proof: true,
      use_counter_animations: true,
    },
    content: {
      density: "rich",
      use_icons: true,
      use_emojis: false,
      writing_style: "conversational",
    },
  },
};

// ============================================================================
// Theme-Specific CSS Design System Directives
// These tell the AI exactly how to style index.css for each aesthetic
// ============================================================================

export const THEME_CSS_DIRECTIVES: Record<string, string> = {
  modern: `/* MODERN DESIGN SYSTEM */
:root {
  --radius: 0.75rem;
}

/* Card treatment: clean shadows, rounded corners, subtle borders */
.card { border-radius: var(--radius); box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04); border: 1px solid hsl(var(--border)); }
.card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); transform: translateY(-2px); }

/* Buttons: gradient primary, clean outlines */
.btn-gradient { background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary))); border-radius: 9999px; font-weight: 600; }
.btn-gradient:hover { opacity: 0.9; transform: translateY(-1px); }

/* Section backgrounds: alternating with subtle gradients */
.section-alt { background: linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted)/0.3) 100%); }

/* Typography: clean hierarchy, generous line-height */
h1, h2, h3 { letter-spacing: -0.025em; line-height: 1.2; }
`,

  editorial: `/* EDITORIAL DESIGN SYSTEM */
:root {
  --radius: 0;
}

/* Refined, print-inspired typography */
h1, h2, h3 { letter-spacing: -0.02em; line-height: 1.15; }
h1 { font-size: clamp(2.5rem, 5vw, 4.5rem); }
p.lead { font-size: 1.25rem; line-height: 1.8; max-width: 42ch; }

/* Minimal card treatment: borders, no shadows */
.card { border: 1px solid hsl(var(--border)); transition: border-color 0.3s; }
.card:hover { border-color: hsl(var(--primary)); }

/* Horizontal rules as section separators */
.section-divider { border-top: 1px solid hsl(var(--border)); margin: 4rem auto; max-width: 120px; }

/* Pull quotes */
.pullquote { font-size: 1.5rem; font-style: italic; border-left: 3px solid hsl(var(--primary)); padding-left: 1.5rem; }
`,

  futuristic: `/* FUTURISTIC DESIGN SYSTEM */
:root {
  --radius: 0.5rem;
}

/* Glassmorphism cards */
.glass-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 1rem;
  box-shadow: 0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08);
}

/* Neon glow effects */
.neon-glow { box-shadow: 0 0 20px hsl(var(--primary)/0.4), 0 0 60px hsl(var(--primary)/0.15); }
.neon-text { text-shadow: 0 0 20px hsl(var(--primary)/0.5), 0 0 40px hsl(var(--primary)/0.2); }

/* Grid backgrounds */
.grid-bg { background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 60px 60px; }

/* Nav: frosted glass */
.nav-glass { background: rgba(10,10,20,0.85); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,0.08); }
`,

  minimalist: `/* MINIMALIST DESIGN SYSTEM */
:root {
  --radius: 0;
}

/* Ultra-clean: no shadows, fine borders */
.card { border: 1px solid hsl(var(--border)); }
.card:hover { border-color: hsl(var(--foreground)); }

/* Typography-driven: large type, tight tracking */
h1 { font-size: clamp(3rem, 6vw, 6rem); font-weight: 400; letter-spacing: -0.04em; line-height: 1.05; }
h2 { font-size: clamp(1.75rem, 3vw, 2.5rem); font-weight: 400; letter-spacing: -0.02em; }

/* Generous whitespace */
section { padding: 6rem 0; }

/* Minimal buttons: outlined, no fills */
.btn-minimal { border: 1.5px solid hsl(var(--foreground)); color: hsl(var(--foreground)); background: transparent; padding: 0.75rem 2rem; transition: all 0.2s; }
.btn-minimal:hover { background: hsl(var(--foreground)); color: hsl(var(--background)); }
`,

  bold: `/* BOLD DESIGN SYSTEM */
:root {
  --radius: 0;
}

/* Massive typography */
h1 { font-size: clamp(3.5rem, 8vw, 8rem); font-weight: 900; text-transform: uppercase; letter-spacing: -0.04em; line-height: 0.95; }
h2 { font-size: clamp(2rem, 4vw, 3.5rem); font-weight: 800; text-transform: uppercase; letter-spacing: -0.02em; }

/* High-contrast cards */
.card { background: hsl(var(--foreground)); color: hsl(var(--background)); }
.card:hover { transform: scale(1.02); }

/* Sharp buttons: no rounding, bold weight */
.btn-bold { background: hsl(var(--primary)); color: white; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding: 1rem 2.5rem; transition: all 0.15s; }
.btn-bold:hover { transform: scale(1.05); }

/* Full-bleed sections */
.full-bleed { margin-left: calc(-50vw + 50%); margin-right: calc(-50vw + 50%); padding: 6rem 2rem; }
`,

  organic: `/* ORGANIC DESIGN SYSTEM */
:root {
  --radius: 1.25rem;
}

/* Soft, warm card treatment */
.card { border-radius: 1.5rem; background: hsl(var(--card)); box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid hsl(var(--border)/0.5); }
.card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); transform: translateY(-4px); }

/* Warm gradient backgrounds */
.warm-gradient { background: linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 50%, hsl(var(--accent)/0.1) 100%); }

/* Rounded buttons */
.btn-warm { background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); border-radius: 9999px; font-weight: 600; padding: 0.875rem 2rem; }
.btn-warm:hover { filter: brightness(1.1); transform: translateY(-2px); }

/* Typography: humanist, warm */
h1, h2 { line-height: 1.25; }
p { line-height: 1.75; }

/* Blob shapes for visual interest */
.blob { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
`,
};

// ============================================================================
// Font pairings
// ============================================================================

const FONT_PAIRINGS: Array<{ heading: string; body: string }> = [
  { heading: "Plus Jakarta Sans", body: "Inter" },
  { heading: "Space Grotesk", body: "DM Sans" },
  { heading: "Manrope", body: "Inter" },
  { heading: "Outfit", body: "Nunito" },
  { heading: "Sora", body: "Inter" },
  { heading: "Clash Display", body: "DM Sans" },
  { heading: "Poppins", body: "Inter" },
  { heading: "Raleway", body: "Lato" },
  { heading: "Montserrat", body: "Open Sans" },
  { heading: "Playfair Display", body: "Source Sans 3" },
];

// ============================================================================
// Helpers
// ============================================================================

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function coinFlip(probability = 0.5): boolean {
  return Math.random() < probability;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Generate a design variation.
 * If a themeId is provided, returns the deterministic profile for that aesthetic.
 * Otherwise, falls back to weighted-random generation.
 */
export function generateDesignVariation(themeId?: string): DesignVariation {
  if (themeId && THEME_DESIGN_PROFILES[themeId]) {
    return THEME_DESIGN_PROFILES[themeId];
  }

  // Fallback: random generation for unthemed builds
  const HERO_STYLES: HeroStyle[] = ["centered", "split", "image_left", "image_right", "fullscreen", "minimal"];
  const SECTION_SPACINGS: SectionSpacing[] = ["compact", "normal", "spacious"];
  const MAX_WIDTHS: MaxWidth[] = ["narrow", "normal", "wide", "full"];
  const NAV_STYLES: NavStyle[] = ["fixed", "sticky", "static"];
  const SHADOW_LEVELS: ShadowLevel[] = ["none", "subtle", "normal", "dramatic"];
  const IMAGE_STYLES: ImageStyle[] = ["rounded", "sharp", "circular", "organic"];
  const ASPECT_RATIOS: AspectRatio[] = ["square", "portrait", "landscape", "auto"];
  const OVERLAY_STYLES: OverlayStyle[] = ["none", "gradient", "color", "blur"];
  const BUTTON_STYLES: ButtonStyle[] = ["rounded", "pill", "sharp", "outline"];
  const BUTTON_SIZES: ButtonSize[] = ["small", "medium", "large"];
  const HOVER_EFFECTS: HoverEffect[] = ["scale", "glow", "lift", "none"];
  const CONTENT_DENSITIES: ContentDensity[] = ["minimal", "balanced", "rich"];
  const WRITING_STYLES: WritingStyle[] = ["professional", "conversational", "bold", "minimal"];

  return {
    layout: {
      hero_style: pick(HERO_STYLES),
      section_spacing: pick(SECTION_SPACINGS),
      max_width: pick(MAX_WIDTHS),
      navigation_style: pick(NAV_STYLES),
    },
    effects: {
      animations: coinFlip(0.85),
      scroll_animations: coinFlip(0.8),
      hover_effects: coinFlip(0.9),
      gradient_backgrounds: coinFlip(0.7),
      glassmorphism: coinFlip(0.3),
      shadows: pick(SHADOW_LEVELS),
    },
    images: {
      style: pick(IMAGE_STYLES),
      aspect_ratio: pick(ASPECT_RATIOS),
      placeholder_service: "unsplash",
      overlay_style: pick(OVERLAY_STYLES),
    },
    buttons: {
      style: pick(BUTTON_STYLES),
      size: pick(BUTTON_SIZES),
      hover_effect: pick(HOVER_EFFECTS),
    },
    sections: {
      include_stats: coinFlip(0.7),
      include_testimonials: coinFlip(0.85),
      include_faq: coinFlip(0.65),
      include_cta_banner: coinFlip(0.8),
      include_newsletter: coinFlip(0.6),
      include_social_proof: coinFlip(0.75),
      use_counter_animations: coinFlip(0.6),
    },
    content: {
      density: pick(CONTENT_DENSITIES),
      use_icons: coinFlip(0.9),
      use_emojis: coinFlip(0.15),
      writing_style: pick(WRITING_STYLES),
    },
  };
}

/**
 * Get CSS design system directive for a theme.
 * Returns the theme-specific CSS patterns the AI should inject into index.css.
 */
export function getThemeCSSDirective(themeId: string): string {
  return THEME_CSS_DIRECTIVES[themeId] || '';
}

/**
 * Pick a random font pairing different from the given current fonts.
 */
export function randomFontPairing(currentHeading?: string): { heading: string; body: string } {
  const candidates = currentHeading
    ? FONT_PAIRINGS.filter(p => p.heading !== currentHeading)
    : FONT_PAIRINGS;
  return pick(candidates.length > 0 ? candidates : FONT_PAIRINGS);
}
