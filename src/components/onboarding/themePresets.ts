// ============================================================================
// Theme Presets for SystemLauncher
// ============================================================================

export interface ThemePreset {
  id: string;
  label: string;
  description: string;
  icon: string;
  promptGuidance: string;
  palette: { bg: string; fg: string; accent: string; accent2?: string };
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "modern",
    label: "Modern",
    description: "Clean lines, vibrant gradients, contemporary energy",
    icon: "✦",
    promptGuidance:
      "Use a modern aesthetic: clean sans-serif typography (e.g. Inter, DM Sans), bold gradients, generous whitespace, card-based layouts, subtle shadows, and vibrant accent colors. Aim for a contemporary tech-forward look.",
    palette: { bg: "#0F172A", fg: "#F8FAFC", accent: "#3B82F6", accent2: "#8B5CF6" },
  },
  {
    id: "editorial",
    label: "Editorial",
    description: "Refined serifs, magazine layouts, quiet elegance",
    icon: "◈",
    promptGuidance:
      "Use an editorial aesthetic: elegant serif headings (e.g. Playfair Display, Cormorant Garamond), refined body text, magazine-style asymmetric layouts, muted elegant color palettes, generous typography scale, and editorial photography treatments.",
    palette: { bg: "#FDFCFA", fg: "#1A1A1A", accent: "#8B7355", accent2: "#C4A882" },
  },
  {
    id: "futuristic",
    label: "Futuristic",
    description: "Neon glow, dark panels, sci-fi atmosphere",
    icon: "◉",
    promptGuidance:
      "Use a futuristic/cyberpunk aesthetic: dark backgrounds (#0A0A0F), neon accent colors (cyan, magenta, electric blue), glassmorphism effects, monospace or geometric sans-serif fonts, grid-based layouts, subtle glow effects, and angular design elements.",
    palette: { bg: "#0A0A14", fg: "#E0E0FF", accent: "#00F0FF", accent2: "#FF00FF" },
  },
  {
    id: "minimalist",
    label: "Minimalist",
    description: "Maximum whitespace, monochrome precision",
    icon: "○",
    promptGuidance:
      "Use a minimalist aesthetic: maximum whitespace, monochromatic or two-tone color scheme, thin typography weights, minimal decoration, clean geometric shapes, subtle borders instead of shadows, and restrained use of color.",
    palette: { bg: "#FFFFFF", fg: "#111111", accent: "#555555", accent2: "#999999" },
  },
  {
    id: "bold",
    label: "Bold",
    description: "Oversized type, high contrast, raw power",
    icon: "■",
    promptGuidance:
      "Use a bold/brutalist aesthetic: oversized typography with heavy weights (900, 800), high contrast black-and-white with one vivid accent color, uppercase headings, large text sizes, unconventional grid breaks, and raw graphic energy.",
    palette: { bg: "#000000", fg: "#FFFFFF", accent: "#FF3333", accent2: "#FF6633" },
  },
  {
    id: "organic",
    label: "Organic",
    description: "Warm earth tones, soft shapes, natural comfort",
    icon: "◠",
    promptGuidance:
      "Use an organic/natural aesthetic: warm earth tones (terracotta, sage, cream, clay), rounded corners and soft shapes, handwritten or humanist fonts, natural imagery, gentle gradients, cozy spacing, and inviting warmth throughout.",
    palette: { bg: "#FAF5F0", fg: "#2D2418", accent: "#C4703F", accent2: "#7C9A5E" },
  },
];
