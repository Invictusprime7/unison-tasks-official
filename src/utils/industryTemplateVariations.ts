/**
 * Industry Template Variations - Provides unique, contextual template blends for each industry
 * 
 * This module prevents repetitive template layouts by:
 * 1. Defining industry-specific design patterns
 * 2. Providing randomized variation selection
 * 3. Enabling contextual blending based on user input
 * 
 * @module industryTemplateVariations
 */

// ============================================================================
// Types
// ============================================================================

export interface IndustryConfig {
  id: string;
  name: string;
  keywords: string[];
  colorSchemes: ColorScheme[];
  fontPairings: FontPairing[];
  heroVariants: HeroVariant[];
  sectionArrangements: string[][];
  visualEffects: VisualEffect[];
  iconSets: string[];
  imageCategories: string[];
}

export interface ColorScheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  cardBg: string;
  gradients: string[];
}

export interface FontPairing {
  id: string;
  heading: string;
  body: string;
  accent?: string;
  style: 'modern' | 'classic' | 'playful' | 'minimal' | 'bold';
}

export interface HeroVariant {
  id: string;
  name: string;
  layout: 'centered' | 'split-left' | 'split-right' | 'diagonal' | 'layered' | 'full-image';
  hasVideo: boolean;
  hasAnimation: boolean;
  ctaStyle: 'dual' | 'single' | 'floating';
  decorativeElements: string[];
}

export interface VisualEffect {
  id: string;
  cardStyle: string;
  hoverEffect: string;
  animationType: 'fade-up' | 'fade-in' | 'slide' | 'scale' | 'stagger';
  glassmorphism: boolean;
  gradientOverlay: boolean;
}

export interface TemplateVariation {
  industry: IndustryConfig;
  colorScheme: ColorScheme;
  fontPairing: FontPairing;
  heroVariant: HeroVariant;
  sectionOrder: string[];
  visualEffect: VisualEffect;
  seed: string;
}

// ============================================================================
// Industry Configurations
// ============================================================================

export const INDUSTRIES: Record<string, IndustryConfig> = {
  restaurant: {
    id: 'restaurant',
    name: 'Restaurant & Dining',
    keywords: ['restaurant', 'cafe', 'bistro', 'dining', 'food', 'culinary', 'eatery', 'bar', 'pub', 'bakery'],
    colorSchemes: [
      {
        id: 'warm-earth',
        name: 'Warm Earth',
        primary: '#b45309',
        secondary: '#78350f',
        accent: '#fbbf24',
        background: '#fffbeb',
        foreground: '#1c1917',
        muted: '#78716c',
        cardBg: '#fef3c7',
        gradients: ['from-amber-900 via-orange-800 to-yellow-700', 'from-stone-900 to-amber-950']
      },
      {
        id: 'elegant-dark',
        name: 'Elegant Dark',
        primary: '#dc2626',
        secondary: '#450a0a',
        accent: '#fcd34d',
        background: '#0c0a09',
        foreground: '#fafaf9',
        muted: '#a8a29e',
        cardBg: '#1c1917',
        gradients: ['from-red-950 via-stone-950 to-black', 'from-amber-950 to-red-950']
      },
      {
        id: 'fresh-modern',
        name: 'Fresh Modern',
        primary: '#16a34a',
        secondary: '#166534',
        accent: '#f97316',
        background: '#f0fdf4',
        foreground: '#052e16',
        muted: '#6b7280',
        cardBg: '#dcfce7',
        gradients: ['from-green-900 to-emerald-800', 'from-orange-500 to-amber-500']
      }
    ],
    fontPairings: [
      { id: 'fp1', heading: 'Playfair Display', body: 'Lato', accent: 'Cormorant Garamond', style: 'classic' },
      { id: 'fp2', heading: 'Josefin Sans', body: 'Open Sans', style: 'modern' },
      { id: 'fp3', heading: 'Abril Fatface', body: 'Poppins', style: 'bold' }
    ],
    heroVariants: [
      { id: 'h1', name: 'Full Image Overlay', layout: 'full-image', hasVideo: false, hasAnimation: true, ctaStyle: 'dual', decorativeElements: ['blur-orb', 'badge'] },
      { id: 'h2', name: 'Split Menu Preview', layout: 'split-right', hasVideo: false, hasAnimation: true, ctaStyle: 'dual', decorativeElements: ['dish-image', 'rating-badge'] },
      { id: 'h3', name: 'Video Background', layout: 'centered', hasVideo: true, hasAnimation: false, ctaStyle: 'single', decorativeElements: ['scroll-indicator'] }
    ],
    sectionArrangements: [
      ['hero', 'features', 'menu', 'about', 'testimonials', 'gallery', 'cta', 'footer'],
      ['hero', 'stats', 'menu', 'chef', 'gallery', 'testimonials', 'booking', 'footer'],
      ['hero', 'about', 'features', 'menu', 'gallery', 'faq', 'cta', 'footer']
    ],
    visualEffects: [
      { id: 've1', cardStyle: 'rounded-2xl shadow-xl', hoverEffect: 'hover:-translate-y-2 hover:shadow-2xl', animationType: 'fade-up', glassmorphism: false, gradientOverlay: true },
      { id: 've2', cardStyle: 'rounded-lg border border-amber-200/20', hoverEffect: 'hover:border-primary/50', animationType: 'stagger', glassmorphism: true, gradientOverlay: true }
    ],
    iconSets: ['utensils', 'chef-hat', 'wine', 'coffee', 'cake', 'pizza', 'salad', 'cooking-pot', 'clock', 'map-pin', 'phone', 'calendar'],
    imageCategories: ['food-plating', 'restaurant-interior', 'chef-cooking', 'dining-experience']
  },

  salon: {
    id: 'salon',
    name: 'Salon & Beauty',
    keywords: ['salon', 'spa', 'beauty', 'hair', 'nails', 'skincare', 'wellness', 'cosmetics', 'barber', 'aesthetics'],
    colorSchemes: [
      {
        id: 'soft-rose',
        name: 'Soft Rose',
        primary: '#db2777',
        secondary: '#9d174d',
        accent: '#fbbf24',
        background: '#fdf2f8',
        foreground: '#1f2937',
        muted: '#9ca3af',
        cardBg: '#fce7f3',
        gradients: ['from-pink-600 via-rose-500 to-pink-400', 'from-rose-900 to-pink-800']
      },
      {
        id: 'luxury-gold',
        name: 'Luxury Gold',
        primary: '#d97706',
        secondary: '#92400e',
        accent: '#ec4899',
        background: '#0a0a0a',
        foreground: '#fafafa',
        muted: '#a1a1aa',
        cardBg: '#18181b',
        gradients: ['from-amber-500 via-yellow-500 to-amber-400', 'from-zinc-900 to-neutral-950']
      },
      {
        id: 'serene-lavender',
        name: 'Serene Lavender',
        primary: '#8b5cf6',
        secondary: '#6d28d9',
        accent: '#f472b6',
        background: '#faf5ff',
        foreground: '#1e1b4b',
        muted: '#7c7c8a',
        cardBg: '#f3e8ff',
        gradients: ['from-violet-600 to-purple-500', 'from-fuchsia-500 to-pink-500']
      }
    ],
    fontPairings: [
      { id: 'fp1', heading: 'Cormorant Garamond', body: 'Montserrat', style: 'classic' },
      { id: 'fp2', heading: 'Tenor Sans', body: 'Nunito', style: 'minimal' },
      { id: 'fp3', heading: 'Italiana', body: 'Quicksand', accent: 'Great Vibes', style: 'classic' }
    ],
    heroVariants: [
      { id: 'h1', name: 'Glamour Split', layout: 'split-left', hasVideo: false, hasAnimation: true, ctaStyle: 'dual', decorativeElements: ['sparkle-icon', 'badge'] },
      { id: 'h2', name: 'Centered Elegance', layout: 'centered', hasVideo: false, hasAnimation: true, ctaStyle: 'dual', decorativeElements: ['blur-orb', 'decorative-line'] },
      { id: 'h3', name: 'Diagonal Drama', layout: 'diagonal', hasVideo: false, hasAnimation: true, ctaStyle: 'single', decorativeElements: ['geometric-shape'] }
    ],
    sectionArrangements: [
      ['hero', 'services', 'about', 'team', 'gallery', 'testimonials', 'booking', 'footer'],
      ['hero', 'stats', 'services', 'pricing', 'gallery', 'faq', 'cta', 'footer'],
      ['hero', 'features', 'services', 'about', 'testimonials', 'gallery', 'cta', 'footer']
    ],
    visualEffects: [
      { id: 've1', cardStyle: 'rounded-3xl shadow-lg shadow-pink-500/10', hoverEffect: 'hover:shadow-pink-500/20 hover:-translate-y-1', animationType: 'fade-up', glassmorphism: true, gradientOverlay: true },
      { id: 've2', cardStyle: 'rounded-xl border-2 border-pink-200/30', hoverEffect: 'hover:border-primary', animationType: 'scale', glassmorphism: false, gradientOverlay: false }
    ],
    iconSets: ['scissors', 'sparkles', 'gem', 'palette', 'crown', 'bath', 'spray-can', 'flower-2', 'heart', 'star'],
    imageCategories: ['beauty-treatment', 'salon-interior', 'hair-styling', 'spa-relaxation']
  },

  realestate: {
    id: 'realestate',
    name: 'Real Estate',
    keywords: ['real estate', 'property', 'homes', 'apartments', 'realtor', 'broker', 'housing', 'mortgage', 'listings', 'investment'],
    colorSchemes: [
      {
        id: 'corporate-navy',
        name: 'Corporate Navy',
        primary: '#1e40af',
        secondary: '#1e3a8a',
        accent: '#3b82f6',
        background: '#f8fafc',
        foreground: '#0f172a',
        muted: '#64748b',
        cardBg: '#ffffff',
        gradients: ['from-blue-900 via-indigo-900 to-slate-900', 'from-slate-800 to-blue-900']
      },
      {
        id: 'luxury-dark',
        name: 'Luxury Dark',
        primary: '#c9a962',
        secondary: '#8b7355',
        accent: '#ffffff',
        background: '#0a0a0a',
        foreground: '#fafafa',
        muted: '#a1a1aa',
        cardBg: '#171717',
        gradients: ['from-amber-600 via-yellow-700 to-amber-800', 'from-neutral-900 to-stone-950']
      },
      {
        id: 'fresh-green',
        name: 'Fresh Green',
        primary: '#059669',
        secondary: '#047857',
        accent: '#10b981',
        background: '#f0fdf4',
        foreground: '#022c22',
        muted: '#6b7280',
        cardBg: '#ecfdf5',
        gradients: ['from-emerald-800 to-teal-700', 'from-green-900 to-emerald-900']
      }
    ],
    fontPairings: [
      { id: 'fp1', heading: 'Playfair Display', body: 'Source Sans Pro', style: 'classic' },
      { id: 'fp2', heading: 'Montserrat', body: 'Open Sans', style: 'modern' },
      { id: 'fp3', heading: 'Libre Baskerville', body: 'Lato', style: 'classic' }
    ],
    heroVariants: [
      { id: 'h1', name: 'Property Showcase', layout: 'full-image', hasVideo: false, hasAnimation: true, ctaStyle: 'dual', decorativeElements: ['search-bar', 'badge'] },
      { id: 'h2', name: 'Split Featured', layout: 'split-right', hasVideo: false, hasAnimation: true, ctaStyle: 'dual', decorativeElements: ['property-card', 'stats-mini'] },
      { id: 'h3', name: 'Video Tour', layout: 'centered', hasVideo: true, hasAnimation: false, ctaStyle: 'dual', decorativeElements: ['play-button'] }
    ],
    sectionArrangements: [
      ['hero', 'search', 'featured', 'stats', 'services', 'testimonials', 'cta', 'footer'],
      ['hero', 'stats', 'listings', 'about', 'team', 'testimonials', 'faq', 'footer'],
      ['hero', 'features', 'listings', 'neighborhoods', 'about', 'gallery', 'cta', 'footer']
    ],
    visualEffects: [
      { id: 've1', cardStyle: 'rounded-xl shadow-md hover:shadow-xl', hoverEffect: 'hover:-translate-y-2', animationType: 'fade-up', glassmorphism: false, gradientOverlay: true },
      { id: 've2', cardStyle: 'rounded-2xl border border-gray-200', hoverEffect: 'hover:border-primary hover:shadow-lg', animationType: 'stagger', glassmorphism: false, gradientOverlay: false }
    ],
    iconSets: ['home', 'building', 'key', 'door-open', 'bed-double', 'sofa', 'trees', 'ruler', 'map-pin', 'phone', 'mail', 'check-circle'],
    imageCategories: ['luxury-home', 'modern-apartment', 'real-estate-agent', 'neighborhood']
  },

  consulting: {
    id: 'consulting',
    name: 'Consulting & Business',
    keywords: ['consulting', 'business', 'advisory', 'coaching', 'strategy', 'management', 'corporate', 'executive', 'professional'],
    colorSchemes: [
      {
        id: 'professional-blue',
        name: 'Professional Blue',
        primary: '#2563eb',
        secondary: '#1d4ed8',
        accent: '#06b6d4',
        background: '#ffffff',
        foreground: '#111827',
        muted: '#6b7280',
        cardBg: '#f9fafb',
        gradients: ['from-blue-600 via-indigo-600 to-blue-700', 'from-slate-900 to-blue-950']
      },
      {
        id: 'executive-dark',
        name: 'Executive Dark',
        primary: '#3b82f6',
        secondary: '#1e40af',
        accent: '#22d3ee',
        background: '#030712',
        foreground: '#f9fafb',
        muted: '#9ca3af',
        cardBg: '#111827',
        gradients: ['from-gray-900 via-slate-900 to-zinc-900', 'from-blue-950 to-indigo-950']
      },
      {
        id: 'growth-green',
        name: 'Growth Green',
        primary: '#10b981',
        secondary: '#059669',
        accent: '#3b82f6',
        background: '#f8fafc',
        foreground: '#0f172a',
        muted: '#64748b',
        cardBg: '#ffffff',
        gradients: ['from-emerald-600 to-teal-600', 'from-teal-800 to-cyan-800']
      }
    ],
    fontPairings: [
      { id: 'fp1', heading: 'Plus Jakarta Sans', body: 'Inter', style: 'modern' },
      { id: 'fp2', heading: 'DM Sans', body: 'Source Sans Pro', style: 'modern' },
      { id: 'fp3', heading: 'Manrope', body: 'Nunito Sans', style: 'minimal' }
    ],
    heroVariants: [
      { id: 'h1', name: 'Bold Statement', layout: 'centered', hasVideo: false, hasAnimation: true, ctaStyle: 'dual', decorativeElements: ['gradient-text', 'blur-orb', 'badge'] },
      { id: 'h2', name: 'Data-Driven', layout: 'split-left', hasVideo: false, hasAnimation: true, ctaStyle: 'dual', decorativeElements: ['chart-graphic', 'stats-mini'] },
      { id: 'h3', name: 'Trust Builder', layout: 'split-right', hasVideo: false, hasAnimation: true, ctaStyle: 'single', decorativeElements: ['client-logos', 'badge'] }
    ],
    sectionArrangements: [
      ['hero', 'logos', 'services', 'about', 'process', 'testimonials', 'cta', 'footer'],
      ['hero', 'stats', 'services', 'case-studies', 'team', 'faq', 'contact', 'footer'],
      ['hero', 'features', 'process', 'about', 'testimonials', 'pricing', 'cta', 'footer']
    ],
    visualEffects: [
      { id: 've1', cardStyle: 'rounded-xl bg-white shadow-lg border border-gray-100', hoverEffect: 'hover:shadow-xl hover:-translate-y-1', animationType: 'fade-up', glassmorphism: false, gradientOverlay: true },
      { id: 've2', cardStyle: 'rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200/50', hoverEffect: 'hover:border-primary/30', animationType: 'stagger', glassmorphism: true, gradientOverlay: false }
    ],
    iconSets: ['briefcase', 'trending-up', 'bar-chart-3', 'target', 'lightbulb', 'users', 'award', 'rocket', 'shield-check', 'check-circle'],
    imageCategories: ['business-meeting', 'professional-team', 'office-modern', 'strategy-planning']
  },

  ecommerce: {
    id: 'ecommerce',
    name: 'E-commerce & Retail',
    keywords: ['ecommerce', 'shop', 'store', 'retail', 'boutique', 'fashion', 'products', 'marketplace', 'shopping', 'apparel'],
    colorSchemes: [
      {
        id: 'minimal-mono',
        name: 'Minimal Mono',
        primary: '#000000',
        secondary: '#171717',
        accent: '#f97316',
        background: '#ffffff',
        foreground: '#0a0a0a',
        muted: '#737373',
        cardBg: '#fafafa',
        gradients: ['from-neutral-900 to-stone-900', 'from-gray-800 to-neutral-900']
      },
      {
        id: 'vibrant-fashion',
        name: 'Vibrant Fashion',
        primary: '#ec4899',
        secondary: '#be185d',
        accent: '#8b5cf6',
        background: '#fafafa',
        foreground: '#18181b',
        muted: '#71717a',
        cardBg: '#ffffff',
        gradients: ['from-pink-500 via-rose-500 to-red-500', 'from-purple-600 to-pink-600']
      },
      {
        id: 'luxury-black',
        name: 'Luxury Black',
        primary: '#c9a962',
        secondary: '#a68a4b',
        accent: '#ffffff',
        background: '#000000',
        foreground: '#ffffff',
        muted: '#a1a1aa',
        cardBg: '#0a0a0a',
        gradients: ['from-amber-500 to-yellow-600', 'from-zinc-900 to-black']
      }
    ],
    fontPairings: [
      { id: 'fp1', heading: 'Bebas Neue', body: 'Lato', style: 'bold' },
      { id: 'fp2', heading: 'Italiana', body: 'Montserrat', style: 'classic' },
      { id: 'fp3', heading: 'Space Grotesk', body: 'Inter', style: 'modern' }
    ],
    heroVariants: [
      { id: 'h1', name: 'Product Focus', layout: 'split-right', hasVideo: false, hasAnimation: true, ctaStyle: 'dual', decorativeElements: ['product-image', 'sale-badge'] },
      { id: 'h2', name: 'Full Collection', layout: 'full-image', hasVideo: false, hasAnimation: true, ctaStyle: 'dual', decorativeElements: ['category-pills', 'scroll-indicator'] },
      { id: 'h3', name: 'Lifestyle Shot', layout: 'layered', hasVideo: true, hasAnimation: false, ctaStyle: 'single', decorativeElements: ['floating-products'] }
    ],
    sectionArrangements: [
      ['hero', 'categories', 'featured', 'sale', 'about', 'testimonials', 'newsletter', 'footer'],
      ['hero', 'products', 'bestsellers', 'features', 'instagram', 'faq', 'cta', 'footer'],
      ['hero', 'trending', 'categories', 'lookbook', 'reviews', 'newsletter', 'footer']
    ],
    visualEffects: [
      { id: 've1', cardStyle: 'rounded-lg overflow-hidden group', hoverEffect: 'hover:shadow-lg', animationType: 'fade-in', glassmorphism: false, gradientOverlay: false },
      { id: 've2', cardStyle: 'rounded-xl shadow-sm border border-gray-100', hoverEffect: 'hover:-translate-y-2 hover:shadow-xl', animationType: 'stagger', glassmorphism: false, gradientOverlay: false }
    ],
    iconSets: ['shopping-bag', 'heart', 'star', 'truck', 'shield-check', 'rotate-ccw', 'tag', 'credit-card', 'package', 'gift'],
    imageCategories: ['fashion-model', 'product-photography', 'lifestyle-shopping', 'clothing-display']
  },

  fitness: {
    id: 'fitness',
    name: 'Fitness & Gym',
    keywords: ['fitness', 'gym', 'workout', 'training', 'health', 'exercise', 'sports', 'yoga', 'crossfit', 'personal trainer'],
    colorSchemes: [
      {
        id: 'energy-orange',
        name: 'Energy Orange',
        primary: '#f97316',
        secondary: '#ea580c',
        accent: '#facc15',
        background: '#0a0a0a',
        foreground: '#fafafa',
        muted: '#a1a1aa',
        cardBg: '#171717',
        gradients: ['from-orange-600 via-red-600 to-orange-500', 'from-amber-500 to-orange-600']
      },
      {
        id: 'power-red',
        name: 'Power Red',
        primary: '#dc2626',
        secondary: '#b91c1c',
        accent: '#fbbf24',
        background: '#18181b',
        foreground: '#ffffff',
        muted: '#a1a1aa',
        cardBg: '#27272a',
        gradients: ['from-red-600 to-rose-600', 'from-red-900 to-black']
      },
      {
        id: 'zen-green',
        name: 'Zen Green',
        primary: '#22c55e',
        secondary: '#16a34a',
        accent: '#06b6d4',
        background: '#f0fdf4',
        foreground: '#052e16',
        muted: '#6b7280',
        cardBg: '#dcfce7',
        gradients: ['from-green-600 to-emerald-500', 'from-teal-600 to-cyan-500']
      }
    ],
    fontPairings: [
      { id: 'fp1', heading: 'Oswald', body: 'Open Sans', style: 'bold' },
      { id: 'fp2', heading: 'Anton', body: 'Roboto', style: 'bold' },
      { id: 'fp3', heading: 'Chakra Petch', body: 'Nunito', style: 'modern' }
    ],
    heroVariants: [
      { id: 'h1', name: 'Action Shot', layout: 'full-image', hasVideo: false, hasAnimation: true, ctaStyle: 'dual', decorativeElements: ['stats-overlay', 'badge'] },
      { id: 'h2', name: 'Video Motivation', layout: 'centered', hasVideo: true, hasAnimation: false, ctaStyle: 'dual', decorativeElements: ['play-button', 'testimonial-mini'] },
      { id: 'h3', name: 'Trainer Focus', layout: 'split-left', hasVideo: false, hasAnimation: true, ctaStyle: 'single', decorativeElements: ['trainer-image', 'certification-badges'] }
    ],
    sectionArrangements: [
      ['hero', 'stats', 'programs', 'trainers', 'schedule', 'testimonials', 'pricing', 'footer'],
      ['hero', 'features', 'classes', 'about', 'gallery', 'faq', 'cta', 'footer'],
      ['hero', 'transformation', 'programs', 'pricing', 'trainers', 'testimonials', 'contact', 'footer']
    ],
    visualEffects: [
      { id: 've1', cardStyle: 'rounded-xl bg-zinc-900 border border-zinc-800', hoverEffect: 'hover:border-primary hover:shadow-primary/20 hover:shadow-lg', animationType: 'fade-up', glassmorphism: false, gradientOverlay: true },
      { id: 've2', cardStyle: 'rounded-2xl overflow-hidden', hoverEffect: 'hover:scale-[1.02]', animationType: 'scale', glassmorphism: true, gradientOverlay: true }
    ],
    iconSets: ['dumbbell', 'heart-pulse', 'timer', 'flame', 'target', 'trophy', 'users', 'calendar', 'play-circle', 'zap'],
    imageCategories: ['gym-workout', 'fitness-training', 'yoga-meditation', 'sports-action']
  },

  healthcare: {
    id: 'healthcare',
    name: 'Healthcare & Medical',
    keywords: ['healthcare', 'medical', 'clinic', 'hospital', 'doctor', 'dental', 'therapy', 'wellness', 'pharmacy', 'care'],
    colorSchemes: [
      {
        id: 'trust-blue',
        name: 'Trust Blue',
        primary: '#0ea5e9',
        secondary: '#0284c7',
        accent: '#22d3ee',
        background: '#f0f9ff',
        foreground: '#0c4a6e',
        muted: '#64748b',
        cardBg: '#e0f2fe',
        gradients: ['from-sky-600 to-cyan-500', 'from-blue-700 to-sky-600']
      },
      {
        id: 'calming-teal',
        name: 'Calming Teal',
        primary: '#14b8a6',
        secondary: '#0d9488',
        accent: '#2dd4bf',
        background: '#f0fdfa',
        foreground: '#134e4a',
        muted: '#6b7280',
        cardBg: '#ccfbf1',
        gradients: ['from-teal-600 to-emerald-500', 'from-cyan-700 to-teal-600']
      },
      {
        id: 'clean-white',
        name: 'Clean White',
        primary: '#3b82f6',
        secondary: '#2563eb',
        accent: '#10b981',
        background: '#ffffff',
        foreground: '#1e293b',
        muted: '#64748b',
        cardBg: '#f8fafc',
        gradients: ['from-blue-600 to-indigo-600', 'from-slate-700 to-blue-800']
      }
    ],
    fontPairings: [
      { id: 'fp1', heading: 'DM Sans', body: 'Inter', style: 'modern' },
      { id: 'fp2', heading: 'Nunito', body: 'Open Sans', style: 'minimal' },
      { id: 'fp3', heading: 'Poppins', body: 'Source Sans Pro', style: 'modern' }
    ],
    heroVariants: [
      { id: 'h1', name: 'Trust & Care', layout: 'split-right', hasVideo: false, hasAnimation: true, ctaStyle: 'dual', decorativeElements: ['doctor-image', 'trust-badges'] },
      { id: 'h2', name: 'Clean Centered', layout: 'centered', hasVideo: false, hasAnimation: true, ctaStyle: 'dual', decorativeElements: ['medical-icons', 'badge'] },
      { id: 'h3', name: 'Modern Facility', layout: 'full-image', hasVideo: false, hasAnimation: true, ctaStyle: 'single', decorativeElements: ['stats-overlay', 'scroll-indicator'] }
    ],
    sectionArrangements: [
      ['hero', 'services', 'about', 'team', 'testimonials', 'faq', 'appointment', 'footer'],
      ['hero', 'stats', 'services', 'process', 'team', 'testimonials', 'contact', 'footer'],
      ['hero', 'features', 'services', 'about', 'gallery', 'faq', 'cta', 'footer']
    ],
    visualEffects: [
      { id: 've1', cardStyle: 'rounded-2xl bg-white shadow-sm border border-blue-100', hoverEffect: 'hover:shadow-md hover:border-primary/30', animationType: 'fade-up', glassmorphism: false, gradientOverlay: false },
      { id: 've2', cardStyle: 'rounded-xl bg-gradient-to-br from-white to-sky-50', hoverEffect: 'hover:-translate-y-1 hover:shadow-lg', animationType: 'stagger', glassmorphism: false, gradientOverlay: false }
    ],
    iconSets: ['heart-pulse', 'stethoscope', 'activity', 'pill', 'syringe', 'users', 'calendar', 'clock', 'shield-check', 'phone'],
    imageCategories: ['medical-professional', 'healthcare-facility', 'patient-care', 'medical-technology']
  },

  technology: {
    id: 'technology',
    name: 'Technology & SaaS',
    keywords: ['technology', 'saas', 'software', 'app', 'startup', 'tech', 'digital', 'platform', 'ai', 'cloud'],
    colorSchemes: [
      {
        id: 'cyber-purple',
        name: 'Cyber Purple',
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        accent: '#22d3ee',
        background: '#030712',
        foreground: '#f9fafb',
        muted: '#9ca3af',
        cardBg: '#111827',
        gradients: ['from-violet-600 via-purple-600 to-indigo-600', 'from-purple-900 to-indigo-950']
      },
      {
        id: 'neon-blue',
        name: 'Neon Blue',
        primary: '#3b82f6',
        secondary: '#2563eb',
        accent: '#06b6d4',
        background: '#0a0a0a',
        foreground: '#ffffff',
        muted: '#a1a1aa',
        cardBg: '#171717',
        gradients: ['from-blue-600 to-cyan-500', 'from-blue-900 to-slate-950']
      },
      {
        id: 'clean-modern',
        name: 'Clean Modern',
        primary: '#6366f1',
        secondary: '#4f46e5',
        accent: '#10b981',
        background: '#ffffff',
        foreground: '#111827',
        muted: '#6b7280',
        cardBg: '#f9fafb',
        gradients: ['from-indigo-600 to-purple-600', 'from-slate-800 to-indigo-900']
      }
    ],
    fontPairings: [
      { id: 'fp1', heading: 'Space Grotesk', body: 'Inter', style: 'modern' },
      { id: 'fp2', heading: 'Syne', body: 'DM Sans', style: 'bold' },
      { id: 'fp3', heading: 'Outfit', body: 'Nunito Sans', style: 'modern' }
    ],
    heroVariants: [
      { id: 'h1', name: 'Product Demo', layout: 'split-right', hasVideo: false, hasAnimation: true, ctaStyle: 'dual', decorativeElements: ['app-screenshot', 'floating-ui', 'badge'] },
      { id: 'h2', name: 'Gradient Statement', layout: 'centered', hasVideo: false, hasAnimation: true, ctaStyle: 'dual', decorativeElements: ['gradient-text', 'blur-orbs', 'grid-pattern'] },
      { id: 'h3', name: 'Video Showcase', layout: 'centered', hasVideo: true, hasAnimation: false, ctaStyle: 'dual', decorativeElements: ['play-button', 'logos-mini'] }
    ],
    sectionArrangements: [
      ['hero', 'logos', 'features', 'product', 'pricing', 'testimonials', 'faq', 'cta', 'footer'],
      ['hero', 'stats', 'features', 'how-it-works', 'integrations', 'pricing', 'testimonials', 'footer'],
      ['hero', 'benefits', 'product', 'features', 'case-studies', 'pricing', 'cta', 'footer']
    ],
    visualEffects: [
      { id: 've1', cardStyle: 'rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm', hoverEffect: 'hover:border-primary/50 hover:shadow-primary/10 hover:shadow-xl', animationType: 'fade-up', glassmorphism: true, gradientOverlay: true },
      { id: 've2', cardStyle: 'rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700', hoverEffect: 'hover:-translate-y-1 hover:border-primary', animationType: 'stagger', glassmorphism: false, gradientOverlay: true }
    ],
    iconSets: ['zap', 'rocket', 'code', 'cloud', 'database', 'shield-check', 'cpu', 'globe', 'layers', 'sparkles'],
    imageCategories: ['tech-abstract', 'software-interface', 'startup-team', 'digital-innovation']
  }
};

// ============================================================================
// Variation Generation
// ============================================================================

/**
 * Generate a unique seed for deterministic randomization
 * Uses timestamp + random string for guaranteed uniqueness
 */
function generateSeed(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Mulberry32-based seeded random number generator
 * Uses FNV-1a hash + Mulberry32 for high-quality distribution
 */
function seededRandom(seed: string, index: number = 0): number {
  // Create a numeric hash from the string seed + index using FNV-1a
  let h = 0x811c9dc5; // FNV offset basis
  const combined = seed + String(index);
  for (let i = 0; i < combined.length; i++) {
    h ^= combined.charCodeAt(i);
    h = Math.imul(h, 0x01000193); // FNV prime
  }
  // Mulberry32 step for better distribution
  let t = (h >>> 0) + 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Pick a random item from array using seed
 */
function pickRandom<T>(array: T[], seed: string, index: number = 0): T {
  const randomIndex = Math.floor(seededRandom(seed, index) * array.length);
  return array[randomIndex];
}

/**
 * Detect industry from user prompt/description
 */
export function detectIndustry(prompt: string): IndustryConfig {
  const lowerPrompt = prompt.toLowerCase();
  
  for (const [, config] of Object.entries(INDUSTRIES)) {
    for (const keyword of config.keywords) {
      if (lowerPrompt.includes(keyword)) {
        return config;
      }
    }
  }
  
  // Default to consulting/business for generic prompts
  return INDUSTRIES.consulting;
}

/**
 * Generate a unique template variation based on industry and optional seed
 */
export function generateVariation(prompt: string, providedSeed?: string): TemplateVariation {
  const seed = providedSeed || generateSeed();
  const industry = detectIndustry(prompt);
  
  return {
    industry,
    colorScheme: pickRandom(industry.colorSchemes, seed, 1),
    fontPairing: pickRandom(industry.fontPairings, seed, 2),
    heroVariant: pickRandom(industry.heroVariants, seed, 3),
    sectionOrder: pickRandom(industry.sectionArrangements, seed, 4),
    visualEffect: pickRandom(industry.visualEffects, seed, 5),
    seed
  };
}

/**
 * Generate multiple distinct variations for the same prompt (for A/B testing or selection)
 */
export function generateMultipleVariations(prompt: string, count: number = 3): TemplateVariation[] {
  const variations: TemplateVariation[] = [];
  const usedSchemes = new Set<string>();
  const usedHeroes = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    const seed = generateSeed();
    let variation = generateVariation(prompt, seed);
    
    // Ensure diversity - try to avoid repeating color schemes and hero variants
    let attempts = 0;
    while (attempts < 5 && (usedSchemes.has(variation.colorScheme.id) || usedHeroes.has(variation.heroVariant.id))) {
      variation = generateVariation(prompt, generateSeed());
      attempts++;
    }
    
    usedSchemes.add(variation.colorScheme.id);
    usedHeroes.add(variation.heroVariant.id);
    variations.push(variation);
  }
  
  return variations;
}

/**
 * Convert variation to system prompt additions for AI template generation
 */
export function variationToPromptContext(variation: TemplateVariation): string {
  const { colorScheme, fontPairing, heroVariant, sectionOrder, visualEffect, industry } = variation;
  
  return `
**INDUSTRY-SPECIFIC DESIGN DIRECTION (${industry.name}):**

**Color Palette (USE THESE EXACT COLORS):**
- Primary: ${colorScheme.primary}
- Secondary: ${colorScheme.secondary}  
- Accent: ${colorScheme.accent}
- Background: ${colorScheme.background}
- Foreground: ${colorScheme.foreground}
- Muted Text: ${colorScheme.muted}
- Card Background: ${colorScheme.cardBg}
- Gradient: ${colorScheme.gradients[0]}

**Typography (REQUIRED FONT PAIRING):**
- Heading Font: ${fontPairing.heading}
- Body Font: ${fontPairing.body}
${fontPairing.accent ? `- Accent Font: ${fontPairing.accent}` : ''}
- Style Direction: ${fontPairing.style}

**Hero Section Layout: ${heroVariant.name}**
- Layout Type: ${heroVariant.layout}
- CTA Style: ${heroVariant.ctaStyle} buttons
${heroVariant.hasVideo ? '- Include video background' : ''}
- Decorative Elements: ${heroVariant.decorativeElements.join(', ')}

**Section Order (FOLLOW THIS EXACT ORDER):**
${sectionOrder.map((section, i) => `${i + 1}. ${section.charAt(0).toUpperCase() + section.slice(1)}`).join('\n')}

**Visual Treatment:**
- Card Style: ${visualEffect.cardStyle}
- Hover Effect: ${visualEffect.hoverEffect}
- Animation: ${visualEffect.animationType}
${visualEffect.glassmorphism ? '- Apply glassmorphism effects' : ''}
${visualEffect.gradientOverlay ? '- Use gradient overlays on hero/CTA sections' : ''}

**Industry Icons to Use:**
${industry.iconSets.slice(0, 8).join(', ')}

**Image Categories:**
${industry.imageCategories.join(', ')}
`;
}

// ============================================================================
// Hex to HSL Conversion (for CSS Variables)
// ============================================================================

/**
 * Convert hex color to HSL format for CSS variables
 */
export function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// ============================================================================
// Template Variation Application
// ============================================================================

/**
 * Apply a variation to an HTML template - CONSERVATIVE approach
 * Only modifies accent colors and fonts while preserving template structure
 * Does NOT touch text colors, backgrounds, or contrast-critical elements
 */
export function applyVariationToTemplate(
  templateHtml: string, 
  variation: TemplateVariation
): string {
  const { colorScheme, fontPairing, heroVariant } = variation;
  
  let modified = templateHtml;
  
  // Build variation CSS - ONLY accent/primary colors, not backgrounds or text
  // This preserves the template's contrast and visibility
  const variationCSS = `
    /* === VARIATION: ${variation.seed} === */
    /* Color Scheme: ${colorScheme.name} | Fonts: ${fontPairing.heading}/${fontPairing.body} */
    
    /* Import variation fonts */
    @import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontPairing.heading).replace(/%20/g, '+')}:wght@400;500;600;700;800&family=${encodeURIComponent(fontPairing.body).replace(/%20/g, '+')}:wght@300;400;500;600&display=swap');
    
    /* Apply fonts - headings and body */
    h1, h2, h3, h4, h5, h6, .heading-font { 
      font-family: '${fontPairing.heading}', sans-serif !important; 
    }
    .body-font, .body-text { 
      font-family: '${fontPairing.body}', sans-serif; 
    }
    
    /* Override accent colors ONLY (buttons, links, highlights) */
    /* Preserve all text and background colors from original template */
    
    /* Primary button gradient override */
    .btn-primary, 
    button[class*="primary"],
    [class*="btn-primary"] { 
      background: linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary}) !important;
      color: white !important;
    }
    
    /* Gradient text override */
    .gradient-text,
    [class*="gradient-text"] { 
      background: linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.accent}) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
    }
    
    /* Accent text color */
    .text-accent,
    [class*="text-accent"] { 
      color: ${colorScheme.primary} !important; 
    }
    
    /* Badge accent */
    .badge-primary,
    [class*="badge-primary"] { 
      background: ${colorScheme.primary}20 !important;
      border-color: ${colorScheme.primary}40 !important;
      color: ${colorScheme.primary} !important;
    }
    
    /* Card highlight accent */
    .card-highlight::before { 
      background: linear-gradient(135deg, ${colorScheme.primary}15, ${colorScheme.secondary}15) !important; 
    }
    
    /* Service card hover accent */
    .service-card::after { 
      background: linear-gradient(180deg, transparent 50%, ${colorScheme.primary}15 100%) !important; 
    }
    
    /* Ring/focus color */
    *:focus { 
      --tw-ring-color: ${colorScheme.primary} !important; 
    }
    
    /* Link hover states */
    a:hover, .nav-link:hover { 
      color: ${colorScheme.primary} !important; 
    }
    
    /* Secondary button hover */
    .btn-secondary:hover,
    button[class*="secondary"]:hover { 
      background: ${colorScheme.primary}10 !important;
      border-color: ${colorScheme.primary} !important;
    }
  `;
  
  // Find the LAST </style> tag to inject our overrides at the end (highest specificity)
  const lastStyleIndex = modified.lastIndexOf('</style>');
  if (lastStyleIndex !== -1) {
    modified = modified.slice(0, lastStyleIndex) + variationCSS + '\n</style>' + modified.slice(lastStyleIndex + 8);
  } else if (modified.includes('</head>')) {
    // No existing style tag, add new one
    modified = modified.replace('</head>', `<style>${variationCSS}</style>\n</head>`);
  } else {
    // No head tag, prepend style
    modified = `<style>${variationCSS}</style>\n` + modified;
  }
  
  // Add variation metadata as HTML comment (for debugging)
  const metaComment = `<!-- VARIATION: ${variation.seed} | ${variation.industry.name} | ${colorScheme.name} | ${fontPairing.heading}/${fontPairing.body} | ${heroVariant.name} -->`;
  modified = metaComment + '\n' + modified;
  
  return modified;
}

/**
 * Generate CSS variables block from variation
 */
export function variationToCSSVariables(variation: TemplateVariation): string {
  const { colorScheme } = variation;
  return `:root {
  --primary: ${hexToHsl(colorScheme.primary)};
  --primary-foreground: 0 0% 100%;
  --secondary: ${hexToHsl(colorScheme.secondary)};
  --secondary-foreground: 0 0% 100%;
  --accent: ${hexToHsl(colorScheme.accent)};
  --accent-foreground: 0 0% 100%;
  --background: ${hexToHsl(colorScheme.background)};
  --foreground: ${hexToHsl(colorScheme.foreground)};
  --muted: ${hexToHsl(colorScheme.muted)};
  --muted-foreground: ${hexToHsl(colorScheme.muted)};
  --card: ${hexToHsl(colorScheme.cardBg)};
  --card-foreground: ${hexToHsl(colorScheme.foreground)};
  --border: ${hexToHsl(colorScheme.muted)};
  --input: ${hexToHsl(colorScheme.muted)};
  --ring: ${hexToHsl(colorScheme.primary)};
  --radius: 0.75rem;
}`;
}

export default {
  INDUSTRIES,
  detectIndustry,
  generateVariation,
  generateMultipleVariations,
  variationToPromptContext,
  applyVariationToTemplate,
  variationToCSSVariables,
  hexToHsl
};
