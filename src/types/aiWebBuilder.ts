/**
 * AI Web Builder Type Definitions
 * Comprehensive type system for intelligent website generation
 */

// ============================================================================
// PROJECT REQUEST TYPES
// ============================================================================

export interface AIProjectRequest {
  brand: {
    name: string;
    industry: "restaurant" | "portfolio" | "contracting" | "creator" | "ad_campaign" | "saas" | "ecommerce" | "blog" | "agency" | string;
    tone?: "minimal" | "luxury" | "energetic" | "elegant" | "playful" | "techy" | "professional" | "creative";
    palette?: string[];
    logo?: string;
    tagline?: string;
  };
  goals: string[];
  features?: string[];
  animationLevel?: "none" | "subtle" | "immersive";
  styleUniqueness?: number; // 0–1 scale (0 = template-based, 1 = highly unique)
  layoutPreference?: "grid" | "freeform" | "split" | "parallax" | "carousel" | "masonry" | "bento";
  targetAudience?: string;
}

// ============================================================================
// LAYOUT PLANNING TYPES
// ============================================================================

export interface AILayoutPlan {
  gridSystem: "12-col" | "16-col" | "asymmetric" | "custom";
  rhythm: "balanced" | "compressed" | "spacious" | "dynamic";
  sections: AILayoutSection[];
  breakpoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  colorPalette: ColorPalette;
  typography: TypographySystem;
}

export interface AILayoutSection {
  id: string;
  component: AIComponentKey;
  variant: string;
  order: number;
  animation?: AnimationPattern;
  imageIntegration?: ImagePlan;
  contentStructure?: ContentStructure;
  spacing?: {
    paddingY: string;
    paddingX: string;
    marginY?: string;
  };
}

// ============================================================================
// COMPONENT TYPES
// ============================================================================

export type AIComponentKey =
  // Navigation
  | "StickyNav"
  | "GlassNav"
  | "MinimalNav"
  | "SidebarNav"
  
  // Hero Sections
  | "AnimatedHero"
  | "VideoHero"
  | "HeroSplit"
  | "ParallaxHero"
  | "GlassHero"
  | "FullScreenHero"
  
  // Content Sections
  | "FeatureShowcase"
  | "FeatureGrid"
  | "PortfolioGrid"
  | "Gallery"
  | "ProductCarousel"
  | "ScrollingNarrative"
  
  // Interactive Components
  | "InteractiveMenu"
  | "BookingForm"
  | "ContactForm"
  | "PricingTable"
  | "FAQAccordion"
  
  // Stats & Social Proof
  | "StatsCounter"
  | "TestimonialSlider"
  | "LogoCloud"
  | "SocialProof"
  
  // Media
  | "VideoEmbed"
  | "ImageFade"
  | "ImageGrid"
  | "MasonryGallery"
  
  // CTA & Conversion
  | "CTASection"
  | "NewsletterSignup"
  | "LeadCapture"
  
  // Footer
  | "FooterColumns"
  | "MinimalFooter"
  | "SocialFooter";

export interface ComponentVariant {
  key: string;
  name: string;
  description: string;
  props: ComponentProps;
  layout: "full-width" | "container" | "split" | "grid" | "flex";
  complexity: 1 | 2 | 3 | 4 | 5;
  useCases: string[];
}

export interface ComponentProps {
  [key: string]: unknown;
  className?: string;
  style?: React.CSSProperties;
  animation?: AnimationConfig;
}

// ============================================================================
// ANIMATION TYPES
// ============================================================================

export interface AnimationPattern {
  type: "fade" | "slide" | "zoom" | "rotate" | "parallax" | "stagger" | "morph";
  direction?: "up" | "down" | "left" | "right" | "in" | "out";
  duration?: number;
  delay?: number;
  easing?: "linear" | "easeIn" | "easeOut" | "easeInOut" | "spring" | "bounce";
  trigger?: "scroll" | "hover" | "click" | "load" | "viewport";
}

export interface AnimationConfig {
  initial?: MotionVariant;
  animate?: MotionVariant;
  whileHover?: MotionVariant;
  whileInView?: MotionVariant;
  transition?: TransitionConfig;
  viewport?: ViewportConfig;
}

export interface MotionVariant {
  opacity?: number;
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  [key: string]: number | string | undefined;
}

export interface TransitionConfig {
  duration?: number;
  delay?: number;
  ease?: string | number[];
  type?: "spring" | "tween" | "inertia";
  stiffness?: number;
  damping?: number;
  mass?: number;
}

export interface ViewportConfig {
  once?: boolean;
  amount?: number | "some" | "all";
  margin?: string;
}

// ============================================================================
// IMAGE & MEDIA TYPES
// ============================================================================

export interface ImagePlan {
  source: "pexels" | "unsplash" | "brand" | "ai-generated" | "placeholder";
  style: "photo" | "illustration" | "3d" | "gradient" | "video" | "abstract";
  aspectRatio: "16/9" | "1/1" | "4/3" | "21/9" | "9/16" | "3/4";
  treatment?: "blur" | "overlay" | "gradient-overlay" | "duotone" | "grayscale";
  query?: string; // For API-based image fetching
  alt?: string;
  loading?: "lazy" | "eager";
}

// ============================================================================
// COLOR & THEME TYPES
// ============================================================================

export interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  background: string;
  foreground: string;
  muted: string;
  border: string;
  gradients?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface TypographySystem {
  fontFamily: {
    heading: string;
    body: string;
    mono?: string;
    accent?: string;
  };
  scale: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
    "4xl": string;
    "5xl": string;
    "6xl": string;
    "7xl": string;
    "8xl": string;
  };
  weight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  letterSpacing?: {
    tight: string;
    normal: string;
    wide: string;
  };
}

// ============================================================================
// CONTENT STRUCTURE TYPES
// ============================================================================

export interface ContentStructure {
  heading?: {
    text: string;
    level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    style?: string;
  };
  subheading?: string;
  body?: string[];
  cta?: {
    text: string;
    href?: string;
    variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  }[];
  media?: ImagePlan[];
  items?: ContentItem[];
}

export interface ContentItem {
  id: string;
  title?: string;
  description?: string;
  image?: ImagePlan;
  icon?: string;
  metadata?: {
    [key: string]: string | number | boolean | undefined;
  };
}

// ============================================================================
// LAYOUT TREE TYPES
// ============================================================================

export interface LayoutTree {
  root: "Page";
  children: LayoutNode[];
  constraints?: LayoutConstraints;
}

export interface LayoutNode {
  type: AIComponentKey | "Section" | "Page";
  variant?: string;
  repeat?: number;
  children?: LayoutNode[];
  condition?: string; // For conditional rendering
  data?: Record<string, unknown>;
}

export interface LayoutConstraints {
  minSections?: number;
  maxSections?: number;
  componentDiversity?: boolean;
  requiredComponents?: AIComponentKey[];
  excludedComponents?: AIComponentKey[];
  sectionOrder?: "strict" | "flexible" | "ai-optimized";
}

// ============================================================================
// MOTION PRESETS
// ============================================================================

export interface MotionPresets {
  fadeUp: AnimationConfig;
  fadeDown: AnimationConfig;
  fadeLeft: AnimationConfig;
  fadeRight: AnimationConfig;
  slideLeft: AnimationConfig;
  slideRight: AnimationConfig;
  slideUp: AnimationConfig;
  slideDown: AnimationConfig;
  zoomIn: AnimationConfig;
  zoomOut: AnimationConfig;
  staggeredZoom: AnimationConfig;
  parallax: AnimationConfig;
  float: AnimationConfig;
  pulse: AnimationConfig;
  bounce: AnimationConfig;
  rotate: AnimationConfig;
}

// ============================================================================
// INDUSTRY TEMPLATES
// ============================================================================

export interface IndustryTemplate {
  id: string;
  name: string;
  industry: AIProjectRequest["brand"]["industry"];
  description: string;
  defaultTone: AIProjectRequest["brand"]["tone"];
  recommendedComponents: {
    component: AIComponentKey;
    variants: string[];
    priority: "required" | "recommended" | "optional";
  }[];
  colorPalettes: ColorPalette[];
  typographySystems: TypographySystem[];
  layoutPatterns: LayoutPattern[];
  contentGuidelines: {
    heroMessage: string[];
    valueProps: string[];
    ctaVariants: string[];
  };
}

export interface LayoutPattern {
  name: string;
  description: string;
  structure: AILayoutSection[];
  suitableFor: string[];
  complexity: 1 | 2 | 3 | 4 | 5;
}

// ============================================================================
// CODE GENERATION TYPES
// ============================================================================

export interface GeneratedComponent {
  name: string;
  code: string;
  language: "tsx" | "jsx" | "html" | "vue";
  imports: string[];
  exports: string[];
  dependencies?: string[];
}

export interface GeneratedPage {
  components: GeneratedComponent[];
  entryPoint: string;
  styles?: string;
  metadata: {
    title: string;
    description: string;
    industry: string;
    generatedAt: string;
  };
}

// ============================================================================
// NOVELTY ANALYSIS TYPES
// ============================================================================

export interface NoveltyAnalysis {
  score: number; // 0-1, higher = more unique
  comparedAgainst: string[]; // IDs of templates compared
  uniqueElements: string[];
  similarElements: string[];
  recommendations?: string[];
}

// ============================================================================
// COMPONENT REGISTRY
// ============================================================================

export interface ComponentRegistry {
  [key: string]: {
    component: AIComponentKey;
    variants: ComponentVariant[];
    defaultVariant: string;
    category: "navigation" | "hero" | "content" | "interactive" | "media" | "cta" | "footer" | "stats";
    tags: string[];
    previewImage?: string;
  };
}

// ============================================================================
// AI SERVICE RESPONSE TYPES
// ============================================================================

export interface AILayoutResponse {
  plan: AILayoutPlan;
  reasoning: string;
  alternatives?: AILayoutPlan[];
  confidence: number;
}

export interface AIThemeResponse {
  colorPalette: ColorPalette;
  typography: TypographySystem;
  reasoning: string;
  mood: string[];
  inspiration?: string[];
}

export interface AICodeResponse {
  code: GeneratedPage;
  preview?: string;
  reasoning: string;
  optimizations?: string[];
}
