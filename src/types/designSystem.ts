/**
 * Design System Type Definitions
 * Implements industry-standard atomic design + design tokens approach
 * Following: atomicdesign.bradfrost.com & designsystem.digital.gov
 */

// ==================== DESIGN TOKENS ====================
// Reusable variables for style values (colors, fonts, spacing)

export interface TypographyToken {
  fontFamily: string;
  fontSize: number;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  lineHeight?: number;
  letterSpacing?: number;
}

export interface SpacingToken {
  value: 0 | 0.5 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24; // Discrete scale
  unit: 'rem' | 'px';
}

export interface ColorToken {
  name: string;
  value: string; // Hex or CSS color
  shade?: 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
}

export interface RadiusToken {
  value: 0 | 2 | 4 | 6 | 8 | 12 | 16 | 24 | 'full'; // Discrete scale
  unit: 'px' | 'rem';
}

export interface ShadowToken {
  name: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  value: string; // CSS box-shadow value
}

export interface Tokens {
  color?: ColorToken;
  backgroundColor?: ColorToken;
  borderColor?: ColorToken;
  spacing?: SpacingToken;
  typography?: TypographyToken;
  radius?: RadiusToken;
  shadow?: ShadowToken;
  opacity?: 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
}

// ==================== THEME SYSTEM ====================

export interface DesignTheme {
  name: string;
  description: string;
  tokens: {
    colors: {
      primary: ColorToken[];
      secondary: ColorToken[];
      neutral: ColorToken[];
      success: ColorToken[];
      warning: ColorToken[];
      error: ColorToken[];
    };
    typography: {
      heading: TypographyToken;
      subheading: TypographyToken;
      body: TypographyToken;
      caption: TypographyToken;
    };
    spacing: {
      xs: SpacingToken;
      sm: SpacingToken;
      md: SpacingToken;
      lg: SpacingToken;
      xl: SpacingToken;
    };
    radius: {
      none: RadiusToken;
      sm: RadiusToken;
      md: RadiusToken;
      lg: RadiusToken;
      full: RadiusToken;
    };
    shadows: {
      none: ShadowToken;
      sm: ShadowToken;
      md: ShadowToken;
      lg: ShadowToken;
      xl: ShadowToken;
    };
  };
  mood: 'corporate' | 'playful' | 'minimal' | 'bold' | 'elegant';
  colorScheme: 'light' | 'dark';
}

// ==================== ATOMIC DESIGN HIERARCHY ====================

export type AtomType = 
  | 'button' 
  | 'heading' 
  | 'paragraph' 
  | 'image' 
  | 'icon'
  | 'input'
  | 'link'
  | 'badge'
  | 'divider'
  | 'spacer';

export interface Atom {
  id: string;
  type: AtomType;
  content?: string;
  tokens: Tokens;
  props?: Record<string, string | number | boolean | null>;
  ariaLabel?: string; // Accessibility
  dataTestId?: string; // Testing
}

export interface Molecule {
  id: string;
  name: string;
  description?: string;
  atoms: Atom[];
  tokens?: Tokens;
  layout?: 'horizontal' | 'vertical' | 'grid';
  responsive?: {
    mobile: { layout: 'horizontal' | 'vertical' | 'grid' };
    tablet: { layout: 'horizontal' | 'vertical' | 'grid' };
    desktop: { layout: 'horizontal' | 'vertical' | 'grid' };
  };
}

export type OrganismType =
  | 'hero'
  | 'navigation'
  | 'footer'
  | 'gallery'
  | 'testimonials'
  | 'features'
  | 'pricing'
  | 'contact'
  | 'about'
  | 'team'
  | 'blog'
  | 'cta';

export interface Organism {
  id: string;
  name: string;
  type: OrganismType;
  description?: string;
  molecules: Molecule[];
  tokens?: Tokens;
  layout?: {
    type: 'flex' | 'grid' | 'stack';
    columns?: number;
    gap?: SpacingToken;
  };
  responsive?: {
    mobile: { columns: number; gap: SpacingToken };
    tablet: { columns: number; gap: SpacingToken };
    desktop: { columns: number; gap: SpacingToken };
  };
}

// ==================== LAYOUT & BREAKPOINTS ====================

export interface Breakpoints {
  mobile: number;    // 640px
  tablet: number;    // 768px
  desktop: number;   // 1024px
  wide: number;      // 1280px
  ultrawide: number; // 1536px
}

export interface GridLayout {
  gridColumns: number;
  gap: number;
  breakpoints: Breakpoints;
  maxWidth?: number; // Container max width
  margin?: SpacingToken;
  padding?: SpacingToken;
}

// ==================== TEMPLATE & PAGE ====================
// Note: Primary template types are in @/types/template.ts (AIGeneratedTemplate)
// This DesignSystemTemplate is for legacy design system organism-based templates

export interface DesignSystemTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'portfolio' | 'ecommerce' | 'blog' | 'landing' | 'corporate' | 'creative';
  organisms: Organism[];
  layout: GridLayout;
  tokens?: Tokens;
  theme: DesignTheme;
  version: string;
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
    author?: string;
    tags?: string[];
  };
}

export interface PageMeta {
  title: string;
  description: string;
  slug: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

export interface Page {
  id: string;
  meta: PageMeta;
  template: DesignSystemTemplate; // Legacy organism-based template
  accessibility?: {
    wcagLevel: 'A' | 'AA' | 'AAA';
    screenReaderOptimized: boolean;
    keyboardNavigable: boolean;
  };
  performance?: {
    cssBudget: number; // KB
    jsBudget: number;  // KB
    imageBudget: number; // KB
    lazyLoadImages: boolean;
  };
}

// ==================== REQUIREMENTS ANALYSIS ====================

export interface UserIntent {
  domain: 'portfolio' | 'ecommerce' | 'blog' | 'landing' | 'corporate' | 'creative' | 'other';
  sections: OrganismType[];
  style?: {
    colorPalette?: string[];
    typography?: string;
    mood?: 'corporate' | 'playful' | 'minimal' | 'bold' | 'elegant';
    references?: string[]; // URLs to inspiration
  };
  accessibility?: {
    wcagTarget: 'A' | 'AA' | 'AAA';
  };
  performance?: {
    targetLoadTime: number; // milliseconds
    targetBundleSize: number; // KB
  };
}

export interface DomainPattern {
  domain: string;
  description: string;
  defaultSections: OrganismType[];
  suggestedMood: string;
  keywords: string[];
}

// ==================== GENERATION & EVALUATION ====================

export interface EvaluationScores {
  clarity: number;        // 0-100
  consistency: number;    // 0-100
  responsiveness: number; // 0-100
  accessibility: number;  // 0-100
  performance: number;    // 0-100
  aesthetics: number;     // 0-100
  overall: number;        // Weighted average
}

export interface GenerationCandidate {
  id: string;
  page: Page;
  scores: EvaluationScores;
  warnings: string[];
  errors: string[];
  generatedAt: Date;
}

export interface EvaluationCriteria {
  clarity: {
    weight: number;
    checks: string[];
  };
  consistency: {
    weight: number;
    checks: string[];
  };
  responsiveness: {
    weight: number;
    checks: string[];
  };
  accessibility: {
    weight: number;
    checks: string[];
  };
  performance: {
    weight: number;
    checks: string[];
  };
  aesthetics: {
    weight: number;
    checks: string[];
  };
}

// ==================== FEEDBACK & VERSIONING ====================

export interface UserFeedback {
  candidateId: string;
  userId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comments?: string;
  selectedForUse: boolean;
  modifications?: {
    type: 'color' | 'layout' | 'content' | 'spacing' | 'typography';
    description: string;
  }[];
  timestamp: Date;
}

export interface TemplateVersion {
  version: string; // Semantic versioning (e.g., "1.0.0")
  template: Template;
  changelog: string;
  previousVersion?: string;
  approved: boolean;
  approvedBy?: string;
  createdAt: Date;
}

// ==================== AI TRANSPARENCY ====================

export interface AIDecisionLog {
  decision: string;
  reasoning: string;
  confidence: number; // 0-1
  alternatives?: string[];
  timestamp: Date;
}

export interface AIGenerationMetadata {
  prompt: string;
  model: string;
  temperature: number;
  tokens: number;
  decisions: AIDecisionLog[];
  warnings: string[];
  suggestedReviews: string[];
}
