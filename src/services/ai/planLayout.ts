/**
 * AI Layout Planning Service
 * Analyzes brand/industry/goals and generates intelligent component sequences
 */

import type {
  AIProjectRequest,
  AILayoutPlan,
  AILayoutSection,
  AIComponentKey,
  AnimationPattern,
  ImagePlan,
  ContentStructure,
  AILayoutResponse
} from '@/types/aiWebBuilder';

// ============================================================================
// INDUSTRY-SPECIFIC LAYOUT PATTERNS
// ============================================================================

const INDUSTRY_PATTERNS: Record<string, {
  components: Array<{ component: AIComponentKey; variants: string[]; priority: number }>;
  rhythm: AILayoutPlan['rhythm'];
  animationLevel: 'subtle' | 'immersive';
}> = {
  restaurant: {
    rhythm: 'balanced',
    animationLevel: 'subtle',
    components: [
      { component: 'VideoHero', variants: ['dishes', 'ambiance'], priority: 10 },
      { component: 'InteractiveMenu', variants: ['accordion', 'tabs', 'grid'], priority: 10 },
      { component: 'Gallery', variants: ['masonry', 'grid', 'carousel'], priority: 9 },
      { component: 'BookingForm', variants: ['inline', 'modal'], priority: 10 },
      { component: 'TestimonialSlider', variants: ['cards', 'bubble'], priority: 7 },
      { component: 'FooterColumns', variants: ['contact', 'hours'], priority: 8 }
    ]
  },
  portfolio: {
    rhythm: 'spacious',
    animationLevel: 'immersive',
    components: [
      { component: 'AnimatedHero', variants: ['text-focus', 'minimal'], priority: 10 },
      { component: 'StickyNav', variants: ['glass', 'minimal'], priority: 9 },
      { component: 'PortfolioGrid', variants: ['masonry', 'bento', 'grid'], priority: 10 },
      { component: 'StatsCounter', variants: ['minimal', 'highlighted'], priority: 6 },
      { component: 'TestimonialSlider', variants: ['bubble', 'quote'], priority: 7 },
      { component: 'CTASection', variants: ['contrast', 'gradient'], priority: 8 },
      { component: 'MinimalFooter', variants: ['centered', 'split'], priority: 7 }
    ]
  },
  contracting: {
    rhythm: 'balanced',
    animationLevel: 'subtle',
    components: [
      { component: 'HeroSplit', variants: ['image-right', 'image-left'], priority: 10 },
      { component: 'StatsCounter', variants: ['projects', 'years'], priority: 9 },
      { component: 'FeatureShowcase', variants: ['cards', 'list'], priority: 9 },
      { component: 'Gallery', variants: ['carousel', 'grid'], priority: 8 },
      { component: 'TestimonialSlider', variants: ['cards', 'quote'], priority: 8 },
      { component: 'CTASection', variants: ['gradient', 'solid'], priority: 9 },
      { component: 'FooterColumns', variants: ['full', 'contact'], priority: 7 }
    ]
  },
  creator: {
    rhythm: 'dynamic',
    animationLevel: 'immersive',
    components: [
      { component: 'ParallaxHero', variants: ['bold', 'animated'], priority: 10 },
      { component: 'ScrollingNarrative', variants: ['story', 'highlights'], priority: 9 },
      { component: 'VideoEmbed', variants: ['autoplay', 'click-to-play'], priority: 9 },
      { component: 'SocialProof', variants: ['stats', 'followers'], priority: 7 },
      { component: 'NewsletterSignup', variants: ['inline', 'popup'], priority: 8 },
      { component: 'CTASection', variants: ['animated', 'pulse'], priority: 9 },
      { component: 'SocialFooter', variants: ['centered', 'grid'], priority: 8 }
    ]
  },
  ad_campaign: {
    rhythm: 'compressed',
    animationLevel: 'immersive',
    components: [
      { component: 'ParallaxHero', variants: ['title-focus', 'immersive'], priority: 10 },
      { component: 'ScrollingNarrative', variants: ['campaign'], priority: 10 },
      { component: 'VideoEmbed', variants: ['hero', 'featured'], priority: 10 },
      { component: 'CTASection', variants: ['animated', 'pulse', 'gradient'], priority: 10 },
      { component: 'MinimalFooter', variants: ['campaign'], priority: 6 }
    ]
  },
  saas: {
    rhythm: 'balanced',
    animationLevel: 'subtle',
    components: [
      { component: 'AnimatedHero', variants: ['gradient', 'glass'], priority: 10 },
      { component: 'FeatureGrid', variants: ['3-col', '4-col', 'bento'], priority: 10 },
      { component: 'ProductCarousel', variants: ['features', 'screenshots'], priority: 8 },
      { component: 'PricingTable', variants: ['tabs', 'cards', 'comparison'], priority: 9 },
      { component: 'TestimonialSlider', variants: ['cards', 'logo-cloud'], priority: 8 },
      { component: 'FAQAccordion', variants: ['simple', 'two-column'], priority: 7 },
      { component: 'CTASection', variants: ['gradient', 'glass'], priority: 9 },
      { component: 'FooterColumns', variants: ['full', 'links'], priority: 7 }
    ]
  },
  ecommerce: {
    rhythm: 'compressed',
    animationLevel: 'subtle',
    components: [
      { component: 'FullScreenHero', variants: ['product', 'collection'], priority: 10 },
      { component: 'ProductCarousel', variants: ['featured', 'bestsellers'], priority: 10 },
      { component: 'FeatureGrid', variants: ['benefits', 'usp'], priority: 8 },
      { component: 'Gallery', variants: ['grid', 'masonry'], priority: 9 },
      { component: 'TestimonialSlider', variants: ['reviews', 'ratings'], priority: 8 },
      { component: 'NewsletterSignup', variants: ['inline'], priority: 7 },
      { component: 'FooterColumns', variants: ['shop', 'full'], priority: 8 }
    ]
  },
  agency: {
    rhythm: 'spacious',
    animationLevel: 'immersive',
    components: [
      { component: 'GlassHero', variants: ['bold', 'minimal'], priority: 10 },
      { component: 'FeatureShowcase', variants: ['services'], priority: 9 },
      { component: 'PortfolioGrid', variants: ['case-studies', 'bento'], priority: 10 },
      { component: 'LogoCloud', variants: ['clients'], priority: 8 },
      { component: 'TestimonialSlider', variants: ['quote', 'video'], priority: 9 },
      { component: 'CTASection', variants: ['gradient', 'bold'], priority: 9 },
      { component: 'FooterColumns', variants: ['full'], priority: 7 }
    ]
  }
};

// ============================================================================
// TONE-TO-ANIMATION MAPPING
// ============================================================================

const TONE_ANIMATIONS: Record<string, { level: 'none' | 'subtle' | 'immersive'; patterns: AnimationPattern['type'][] }> = {
  minimal: { level: 'subtle', patterns: ['fade', 'slide'] },
  luxury: { level: 'subtle', patterns: ['fade', 'parallax'] },
  energetic: { level: 'immersive', patterns: ['zoom', 'slide', 'rotate', 'stagger'] },
  elegant: { level: 'subtle', patterns: ['fade', 'parallax'] },
  playful: { level: 'immersive', patterns: ['zoom', 'rotate', 'stagger'] },
  techy: { level: 'immersive', patterns: ['slide', 'morph', 'stagger'] },
  professional: { level: 'subtle', patterns: ['fade', 'slide'] },
  creative: { level: 'immersive', patterns: ['parallax', 'morph', 'stagger'] }
};

// ============================================================================
// LAYOUT PLANNING ENGINE
// ============================================================================

export class LayoutPlanningService {
  /**
   * Generate intelligent layout plan based on project request
   */
  async planLayout(request: AIProjectRequest): Promise<AILayoutResponse> {
    const { brand, goals, features, animationLevel, styleUniqueness, layoutPreference } = request;
    
    // Step 1: Determine industry pattern
    const industryPattern = INDUSTRY_PATTERNS[brand.industry] || INDUSTRY_PATTERNS.saas;
    
    // Step 2: Determine rhythm based on tone
    let rhythm: AILayoutPlan['rhythm'] = industryPattern.rhythm;
    if (brand.tone === 'minimal' || brand.tone === 'elegant') rhythm = 'spacious';
    else if (brand.tone === 'energetic' || brand.tone === 'playful') rhythm = 'compressed';
    
    // Step 3: Determine animation level
    const finalAnimationLevel = animationLevel || 
      (brand.tone ? TONE_ANIMATIONS[brand.tone]?.level : industryPattern.animationLevel);
    
    // Step 4: Select components based on goals and features
    const selectedComponents = this.selectComponents(
      industryPattern.components,
      goals,
      features || []
    );
    
    // Step 5: Generate sections with variants and animations
    const sections = this.generateSections(
      selectedComponents,
      finalAnimationLevel,
      brand.tone,
      styleUniqueness || 0.5
    );
    
    // Step 6: Determine grid system
    const gridSystem = layoutPreference === 'bento' || layoutPreference === 'freeform' ? 'asymmetric' : 
                       layoutPreference === 'grid' ? '12-col' : 
                       '12-col';
    
    const plan: AILayoutPlan = {
      gridSystem,
      rhythm,
      sections,
      breakpoints: {
        mobile: 640,
        tablet: 768,
        desktop: 1024
      },
      colorPalette: this.getPlaceholderPalette(),
      typography: this.getPlaceholderTypography()
    };
    
    const reasoning = this.generateReasoning(request, plan);
    
    return {
      plan,
      reasoning,
      confidence: this.calculateConfidence(request, plan)
    };
  }
  
  /**
   * Select components based on goals and features
   */
  private selectComponents(
    availableComponents: Array<{ component: AIComponentKey; variants: string[]; priority: number }>,
    goals: string[],
    features: string[]
  ): Array<{ component: AIComponentKey; variants: string[]; priority: number }> {
    const selected = [...availableComponents];
    
    // Boost priority for components matching goals
    for (const component of selected) {
      // Check if goals mention component-related keywords
      const componentKeywords = this.getComponentKeywords(component.component);
      const matchesGoal = goals.some(goal => 
        componentKeywords.some(keyword => goal.toLowerCase().includes(keyword))
      );
      
      if (matchesGoal) {
        component.priority += 2;
      }
      
      // Check if features require this component
      const matchesFeature = features.some(feature => 
        componentKeywords.some(keyword => feature.toLowerCase().includes(keyword))
      );
      
      if (matchesFeature) {
        component.priority += 3;
      }
    }
    
    // Sort by priority and select top components
    return selected
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 7); // Max 7 sections for good UX
  }
  
  /**
   * Generate sections with animations and image plans
   */
  private generateSections(
    components: Array<{ component: AIComponentKey; variants: string[]; priority: number }>,
    animationLevel: 'none' | 'subtle' | 'immersive',
    tone?: string,
    uniqueness: number = 0.5
  ): AILayoutSection[] {
    const sections: AILayoutSection[] = [];
    
    components.forEach((comp, index) => {
      // Select variant (randomize based on uniqueness)
      const variant = uniqueness > 0.7 
        ? comp.variants[Math.floor(Math.random() * comp.variants.length)]
        : comp.variants[0];
      
      // Determine animation
      const animation = animationLevel !== 'none'
        ? this.selectAnimation(comp.component, animationLevel, tone)
        : undefined;
      
      // Determine image integration
      const imageIntegration = this.needsImage(comp.component)
        ? this.createImagePlan(comp.component)
        : undefined;
      
      sections.push({
        id: `section-${index + 1}`,
        component: comp.component,
        variant,
        order: index,
        animation,
        imageIntegration,
        spacing: this.getSpacing(comp.component)
      });
    });
    
    return sections;
  }
  
  /**
   * Select appropriate animation for component
   */
  private selectAnimation(
    component: AIComponentKey,
    level: 'subtle' | 'immersive',
    tone?: string
  ): AnimationPattern {
    const tonePatterns = tone ? TONE_ANIMATIONS[tone]?.patterns : undefined;
    
    // Hero sections get special treatment
    if (component.includes('Hero')) {
      return level === 'immersive'
        ? { type: 'parallax', trigger: 'scroll', duration: 1200, easing: 'easeOut' }
        : { type: 'fade', direction: 'up', trigger: 'load', duration: 800, easing: 'easeOut' };
    }
    
    // Grid/Gallery components
    if (component.includes('Grid') || component.includes('Gallery') || component === 'PortfolioGrid') {
      return level === 'immersive'
        ? { type: 'stagger', trigger: 'viewport', duration: 600, delay: 100, easing: 'spring' }
        : { type: 'fade', direction: 'up', trigger: 'viewport', duration: 500, easing: 'easeOut' };
    }
    
    // Interactive components
    if (component.includes('Form') || component.includes('Menu')) {
      return { type: 'fade', direction: 'up', trigger: 'viewport', duration: 500, easing: 'easeOut' };
    }
    
    // Default
    const patternType = tonePatterns?.[0] || 'fade';
    return {
      type: patternType,
      direction: 'up',
      trigger: 'viewport',
      duration: level === 'immersive' ? 800 : 500,
      easing: level === 'immersive' ? 'spring' : 'easeOut'
    };
  }
  
  /**
   * Create image plan for component
   */
  private createImagePlan(component: AIComponentKey): ImagePlan {
    const imagePlanMap: Record<string, ImagePlan> = {
      VideoHero: {
        source: 'brand',
        style: 'video',
        aspectRatio: '16/9',
        treatment: 'overlay',
        loading: 'eager'
      },
      AnimatedHero: {
        source: 'unsplash',
        style: 'photo',
        aspectRatio: '16/9',
        treatment: 'gradient-overlay',
        loading: 'eager'
      },
      HeroSplit: {
        source: 'unsplash',
        style: 'photo',
        aspectRatio: '4/3',
        loading: 'eager'
      },
      Gallery: {
        source: 'unsplash',
        style: 'photo',
        aspectRatio: '1/1',
        loading: 'lazy'
      },
      PortfolioGrid: {
        source: 'brand',
        style: 'photo',
        aspectRatio: '16/9',
        loading: 'lazy'
      }
    };
    
    return imagePlanMap[component] || {
      source: 'unsplash',
      style: 'photo',
      aspectRatio: '16/9',
      loading: 'lazy'
    };
  }
  
  /**
   * Check if component needs images
   */
  private needsImage(component: AIComponentKey): boolean {
    const imageComponents: AIComponentKey[] = [
      'VideoHero', 'AnimatedHero', 'HeroSplit', 'ParallaxHero', 'GlassHero', 'FullScreenHero',
      'Gallery', 'PortfolioGrid', 'ProductCarousel', 'ImageGrid', 'MasonryGallery'
    ];
    
    return imageComponents.includes(component);
  }
  
  /**
   * Get spacing for component
   */
  private getSpacing(component: AIComponentKey): { paddingY: string; paddingX: string } {
    // Hero components get minimal padding
    if (component.includes('Hero')) {
      return { paddingY: 'py-0', paddingX: 'px-0' };
    }
    
    // Footer gets less padding
    if (component.includes('Footer')) {
      return { paddingY: 'py-12', paddingX: 'px-6' };
    }
    
    // Default spacing
    return { paddingY: 'py-20', paddingX: 'px-6' };
  }
  
  /**
   * Get component keywords for matching with goals
   */
  private getComponentKeywords(component: AIComponentKey): string[] {
    const keywordMap: Record<AIComponentKey, string[]> = {
      // Navigation
      StickyNav: ['navigation', 'menu', 'nav'],
      GlassNav: ['navigation', 'menu', 'modern'],
      MinimalNav: ['navigation', 'simple'],
      SidebarNav: ['navigation', 'sidebar'],
      
      // Heroes
      AnimatedHero: ['hero', 'landing', 'animated'],
      VideoHero: ['video', 'hero', 'visual'],
      HeroSplit: ['hero', 'split', 'image'],
      ParallaxHero: ['hero', 'parallax', 'scroll'],
      GlassHero: ['hero', 'modern', 'glass'],
      FullScreenHero: ['hero', 'fullscreen'],
      
      // Content
      FeatureShowcase: ['features', 'showcase', 'highlight'],
      FeatureGrid: ['features', 'grid', 'benefits'],
      PortfolioGrid: ['portfolio', 'work', 'projects', 'grid'],
      Gallery: ['gallery', 'images', 'photos'],
      ProductCarousel: ['products', 'carousel', 'showcase'],
      ScrollingNarrative: ['story', 'narrative', 'scrolling'],
      
      // Interactive
      InteractiveMenu: ['menu', 'food', 'interactive'],
      BookingForm: ['booking', 'reservation', 'form'],
      ContactForm: ['contact', 'form', 'reach'],
      PricingTable: ['pricing', 'plans', 'subscription'],
      FAQAccordion: ['faq', 'questions', 'help'],
      
      // Stats
      StatsCounter: ['stats', 'numbers', 'metrics', 'achievements'],
      TestimonialSlider: ['testimonials', 'reviews', 'feedback'],
      LogoCloud: ['clients', 'partners', 'brands'],
      SocialProof: ['social', 'proof', 'trust'],
      
      // Media
      VideoEmbed: ['video', 'media'],
      ImageFade: ['image', 'photo'],
      ImageGrid: ['images', 'grid'],
      MasonryGallery: ['gallery', 'masonry'],
      
      // CTA
      CTASection: ['cta', 'action', 'conversion'],
      NewsletterSignup: ['newsletter', 'signup', 'subscribe'],
      LeadCapture: ['lead', 'capture', 'conversion'],
      
      // Footer
      FooterColumns: ['footer', 'links'],
      MinimalFooter: ['footer', 'minimal'],
      SocialFooter: ['footer', 'social']
    };
    
    return keywordMap[component] || [];
  }
  
  /**
   * Calculate confidence score for the layout plan
   */
  private calculateConfidence(request: AIProjectRequest, plan: AILayoutPlan): number {
    let confidence = 0.7; // Base confidence
    
    // Boost if industry pattern is available
    if (INDUSTRY_PATTERNS[request.brand.industry]) {
      confidence += 0.15;
    }
    
    // Boost if tone is specified
    if (request.brand.tone) {
      confidence += 0.1;
    }
    
    // Boost if goals are specific
    if (request.goals.length >= 3) {
      confidence += 0.05;
    }
    
    return Math.min(confidence, 0.95);
  }
  
  /**
   * Generate reasoning explanation
   */
  private generateReasoning(request: AIProjectRequest, plan: AILayoutPlan): string {
    const { brand, goals } = request;
    const sectionCount = plan.sections.length;
    
    let reasoning = `Generated ${sectionCount}-section layout for ${brand.industry} industry. `;
    reasoning += `Selected "${plan.rhythm}" rhythm and "${plan.gridSystem}" grid system `;
    reasoning += `to match the ${brand.tone || 'professional'} tone. `;
    
    // Highlight key sections
    const heroSection = plan.sections.find(s => s.component.includes('Hero'));
    if (heroSection) {
      reasoning += `Using ${heroSection.component} with "${heroSection.variant}" variant for maximum impact. `;
    }
    
    // Mention goal alignment
    if (goals.length > 0) {
      reasoning += `Layout optimized for: ${goals.slice(0, 2).join(', ')}.`;
    }
    
    return reasoning;
  }
  
  /**
   * Placeholder color palette (will be replaced by synthesizeTheme service)
   */
  private getPlaceholderPalette() {
    return {
      name: 'Default',
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#EC4899',
      neutral: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
        950: '#030712'
      },
      background: '#FFFFFF',
      foreground: '#111827',
      muted: '#F3F4F6',
      border: '#E5E7EB'
    };
  }
  
  /**
   * Placeholder typography (will be replaced by synthesizeTheme service)
   */
  private getPlaceholderTypography() {
    return {
      fontFamily: {
        heading: 'Inter, system-ui, sans-serif',
        body: 'Inter, system-ui, sans-serif'
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem'
      },
      weight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    };
  }
}

// Export singleton instance
export const layoutPlanningService = new LayoutPlanningService();
