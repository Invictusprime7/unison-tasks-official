/**
 * Semantic Prompt Parser
 * Intelligently understands user intent and translates to precise web components
 * Industry-leading AI intelligence for web design prompts
 */

export interface SemanticIntent {
  componentType: WebComponentType;
  properties: ComponentProperties;
  styling: StylingRequirements;
  behavior: BehaviorRequirements;
  confidence: number; // 0-100
  reasoning: string;
}

export type WebComponentType =
  | 'navigation'
  | 'hero'
  | 'card'
  | 'button'
  | 'form'
  | 'gallery'
  | 'modal'
  | 'footer'
  | 'sidebar'
  | 'section'
  | 'container';

export interface ComponentProperties {
  position?: 'fixed' | 'sticky' | 'absolute' | 'relative' | 'static';
  layout?: 'horizontal' | 'vertical' | 'grid' | 'flex';
  alignment?: 'left' | 'center' | 'right' | 'justify';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  spacing?: 'tight' | 'normal' | 'loose';
}

export interface StylingRequirements {
  colorScheme?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'custom';
  elevation?: 'flat' | 'raised' | 'floating';
  borders?: 'none' | 'subtle' | 'prominent' | 'rounded';
  background?: 'solid' | 'gradient' | 'transparent' | 'blur';
  animation?: 'none' | 'subtle' | 'smooth' | 'dynamic';
}

export interface BehaviorRequirements {
  interactive?: boolean;
  responsive?: boolean;
  scrollEffect?: 'none' | 'hide' | 'show' | 'shrink';
  hoverEffects?: boolean;
  accessibility?: 'basic' | 'enhanced' | 'full';
}

/**
 * Semantic understanding patterns for common web design terms
 */
const SEMANTIC_PATTERNS = {
  // Navigation patterns
  navigation: {
    keywords: [
      'nav', 'navigation', 'menu', 'navbar', 'header menu',
      'top bar', 'menu bar', 'site navigation'
    ],
    modifiers: {
      floating: { position: 'fixed', styling: { elevation: 'floating', background: 'blur' } },
      sticky: { position: 'sticky', styling: { elevation: 'raised' } },
      transparent: { styling: { background: 'transparent' } },
      dark: { styling: { colorScheme: 'neutral' } },
      hamburger: { behavior: { responsive: true } },
      dropdown: { behavior: { interactive: true } }
    }
  },

  // Hero patterns
  hero: {
    keywords: [
      'hero', 'banner', 'landing', 'header section', 'intro',
      'above the fold', 'splash', 'welcome section'
    ],
    modifiers: {
      fullscreen: { properties: { size: 'full' } },
      centered: { properties: { alignment: 'center' } },
      split: { properties: { layout: 'horizontal' } },
      video: { styling: { background: 'gradient' } },
      animated: { styling: { animation: 'dynamic' } }
    }
  },

  // Card patterns
  card: {
    keywords: [
      'card', 'tile', 'panel', 'box', 'item',
      'product card', 'feature card', 'content card'
    ],
    modifiers: {
      elevated: { styling: { elevation: 'raised' } },
      hover: { behavior: { hoverEffects: true } },
      rounded: { styling: { borders: 'rounded' } },
      outlined: { styling: { borders: 'prominent' } }
    }
  },

  // Button patterns
  button: {
    keywords: [
      'button', 'btn', 'cta', 'action button', 'link button',
      'call to action', 'submit button'
    ],
    modifiers: {
      primary: { styling: { colorScheme: 'primary' } },
      large: { properties: { size: 'lg' } },
      rounded: { styling: { borders: 'rounded' } },
      outlined: { styling: { background: 'transparent', borders: 'prominent' } },
      gradient: { styling: { background: 'gradient' } }
    }
  },

  // Form patterns
  form: {
    keywords: [
      'form', 'input', 'contact form', 'signup form', 'login',
      'registration', 'search', 'subscribe'
    ],
    modifiers: {
      inline: { properties: { layout: 'horizontal' } },
      stacked: { properties: { layout: 'vertical' } },
      floating: { styling: { elevation: 'floating' } },
      validated: { behavior: { interactive: true } }
    }
  },

  // Gallery patterns
  gallery: {
    keywords: [
      'gallery', 'grid', 'portfolio', 'image grid', 'masonry',
      'photo gallery', 'showcase'
    ],
    modifiers: {
      masonry: { properties: { layout: 'grid' } },
      carousel: { behavior: { interactive: true } },
      lightbox: { behavior: { interactive: true } }
    }
  },

  // Modal patterns
  modal: {
    keywords: [
      'modal', 'dialog', 'popup', 'overlay', 'lightbox',
      'alert', 'confirmation', 'popup window'
    ],
    modifiers: {
      centered: { properties: { alignment: 'center' } },
      fullscreen: { properties: { size: 'full' } },
      blur: { styling: { background: 'blur' } }
    }
  },

  // Footer patterns
  footer: {
    keywords: [
      'footer', 'bottom', 'site footer', 'page footer',
      'copyright', 'footer section'
    ],
    modifiers: {
      sticky: { position: 'sticky' },
      dark: { styling: { colorScheme: 'neutral' } },
      minimal: { properties: { spacing: 'tight' } }
    }
  }
};

/**
 * Position/Layout keywords
 */
const POSITION_KEYWORDS = {
  fixed: ['fixed', 'pinned', 'anchored', 'locked'],
  sticky: ['sticky', 'stuck', 'persistent'],
  floating: ['floating', 'hovering', 'suspended', 'overlay'],
  absolute: ['absolute', 'positioned'],
  relative: ['relative']
};

/**
 * Styling keywords
 */
const STYLING_KEYWORDS = {
  transparent: ['transparent', 'clear', 'see-through', 'glass'],
  gradient: ['gradient', 'fade', 'blend'],
  rounded: ['rounded', 'curved', 'smooth corners', 'pill'],
  shadow: ['shadow', 'elevated', 'depth', 'raised'],
  blur: ['blur', 'frosted', 'glass morphism', 'backdrop']
};

/**
 * Semantic Prompt Parser Service
 */
export class SemanticPromptParser {
  
  /**
   * Parse user prompt and extract semantic intent
   */
  static parsePrompt(prompt: string): SemanticIntent {
    const normalized = prompt.toLowerCase().trim();
    
    // Step 1: Identify component type
    const componentType = this.identifyComponent(normalized);
    
    // Step 2: Extract properties
    const properties = this.extractProperties(normalized);
    
    // Step 3: Determine styling
    const styling = this.extractStyling(normalized);
    
    // Step 4: Identify behaviors
    const behavior = this.extractBehavior(normalized);
    
    // Step 5: Calculate confidence
    const confidence = this.calculateConfidence(normalized, componentType);
    
    // Step 6: Generate reasoning
    const reasoning = this.generateReasoning(normalized, componentType, properties, styling);
    
    return {
      componentType,
      properties,
      styling,
      behavior,
      confidence,
      reasoning
    };
  }

  /**
   * Identify the component type from prompt
   */
  private static identifyComponent(prompt: string): WebComponentType {
    let bestMatch: WebComponentType = 'section';
    let highestScore = 0;

    for (const [component, pattern] of Object.entries(SEMANTIC_PATTERNS)) {
      const score = this.calculatePatternScore(prompt, pattern.keywords);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = component as WebComponentType;
      }
    }

    return bestMatch;
  }

  /**
   * Calculate pattern matching score
   */
  private static calculatePatternScore(prompt: string, keywords: string[]): number {
    let score = 0;
    
    for (const keyword of keywords) {
      if (prompt.includes(keyword)) {
        // Exact match gets higher score
        if (prompt === keyword) {
          score += 10;
        } else if (prompt.startsWith(keyword) || prompt.endsWith(keyword)) {
          score += 7;
        } else {
          score += 5;
        }
      }
    }
    
    return score;
  }

  /**
   * Extract component properties from prompt
   */
  private static extractProperties(prompt: string): ComponentProperties {
    const properties: ComponentProperties = {};

    // Detect position
    for (const [position, keywords] of Object.entries(POSITION_KEYWORDS)) {
      if (keywords.some(kw => prompt.includes(kw))) {
        properties.position = position as ComponentProperties['position'];
        break;
      }
    }

    // Detect layout
    if (prompt.includes('horizontal') || prompt.includes('row')) {
      properties.layout = 'horizontal';
    } else if (prompt.includes('vertical') || prompt.includes('column') || prompt.includes('stacked')) {
      properties.layout = 'vertical';
    } else if (prompt.includes('grid') || prompt.includes('masonry')) {
      properties.layout = 'grid';
    }

    // Detect alignment
    if (prompt.includes('center') || prompt.includes('centered')) {
      properties.alignment = 'center';
    } else if (prompt.includes('left')) {
      properties.alignment = 'left';
    } else if (prompt.includes('right')) {
      properties.alignment = 'right';
    }

    // Detect size
    if (prompt.includes('small') || prompt.includes('compact')) {
      properties.size = 'sm';
    } else if (prompt.includes('large') || prompt.includes('big')) {
      properties.size = 'lg';
    } else if (prompt.includes('full') || prompt.includes('fullscreen') || prompt.includes('full-screen')) {
      properties.size = 'full';
    } else {
      properties.size = 'md';
    }

    return properties;
  }

  /**
   * Extract styling requirements from prompt
   */
  private static extractStyling(prompt: string): StylingRequirements {
    const styling: StylingRequirements = {};

    // Detect background
    if (STYLING_KEYWORDS.transparent.some(kw => prompt.includes(kw))) {
      styling.background = 'transparent';
    } else if (STYLING_KEYWORDS.gradient.some(kw => prompt.includes(kw))) {
      styling.background = 'gradient';
    } else if (STYLING_KEYWORDS.blur.some(kw => prompt.includes(kw))) {
      styling.background = 'blur';
    } else {
      styling.background = 'solid';
    }

    // Detect elevation
    if (STYLING_KEYWORDS.shadow.some(kw => prompt.includes(kw)) || prompt.includes('floating')) {
      styling.elevation = 'floating';
    } else if (prompt.includes('raised') || prompt.includes('card')) {
      styling.elevation = 'raised';
    } else {
      styling.elevation = 'flat';
    }

    // Detect borders
    if (STYLING_KEYWORDS.rounded.some(kw => prompt.includes(kw))) {
      styling.borders = 'rounded';
    } else if (prompt.includes('outlined') || prompt.includes('border')) {
      styling.borders = 'prominent';
    } else if (prompt.includes('borderless') || prompt.includes('no border')) {
      styling.borders = 'none';
    } else {
      styling.borders = 'subtle';
    }

    // Detect color scheme
    if (prompt.includes('primary') || prompt.includes('brand')) {
      styling.colorScheme = 'primary';
    } else if (prompt.includes('secondary')) {
      styling.colorScheme = 'secondary';
    } else if (prompt.includes('accent')) {
      styling.colorScheme = 'accent';
    } else if (prompt.includes('dark') || prompt.includes('black')) {
      styling.colorScheme = 'neutral';
    }

    // Detect animation
    if (prompt.includes('animated') || prompt.includes('dynamic')) {
      styling.animation = 'dynamic';
    } else if (prompt.includes('smooth') || prompt.includes('transition')) {
      styling.animation = 'smooth';
    } else {
      styling.animation = 'subtle';
    }

    return styling;
  }

  /**
   * Extract behavior requirements from prompt
   */
  private static extractBehavior(prompt: string): BehaviorRequirements {
    const behavior: BehaviorRequirements = {
      interactive: false,
      responsive: true, // Default to responsive
      scrollEffect: 'none',
      hoverEffects: false,
      accessibility: 'enhanced'
    };

    // Detect interactivity
    if (prompt.includes('interactive') || prompt.includes('clickable') || prompt.includes('dropdown')) {
      behavior.interactive = true;
    }

    // Detect scroll effects
    if (prompt.includes('hide on scroll') || prompt.includes('auto-hide')) {
      behavior.scrollEffect = 'hide';
    } else if (prompt.includes('show on scroll')) {
      behavior.scrollEffect = 'show';
    } else if (prompt.includes('shrink on scroll')) {
      behavior.scrollEffect = 'shrink';
    }

    // Detect hover effects
    if (prompt.includes('hover') || prompt.includes('on hover')) {
      behavior.hoverEffects = true;
    }

    return behavior;
  }

  /**
   * Calculate confidence score
   */
  private static calculateConfidence(prompt: string, componentType: WebComponentType): number {
    let confidence = 50; // Base confidence

    // Check if component keywords are explicitly mentioned
    const pattern = SEMANTIC_PATTERNS[componentType as keyof typeof SEMANTIC_PATTERNS];
    if (pattern) {
      const hasExactKeyword = pattern.keywords.some(kw => prompt.includes(kw));
      if (hasExactKeyword) {
        confidence += 30;
      }
    }

    // Increase confidence for specific modifiers
    const wordCount = prompt.split(' ').length;
    if (wordCount >= 3) {
      confidence += 10; // More detailed prompts are clearer
    }

    // Cap at 100
    return Math.min(confidence, 100);
  }

  /**
   * Generate reasoning for the interpretation
   */
  private static generateReasoning(
    prompt: string,
    componentType: WebComponentType,
    properties: ComponentProperties,
    styling: StylingRequirements
  ): string {
    const parts: string[] = [];

    parts.push(`Identified as "${componentType}" component`);

    if (properties.position) {
      parts.push(`with ${properties.position} positioning`);
    }

    if (styling.elevation === 'floating') {
      parts.push(`featuring floating/elevated design`);
    }

    if (styling.background === 'blur' || styling.background === 'transparent') {
      parts.push(`using ${styling.background} background`);
    }

    if (properties.layout) {
      parts.push(`in ${properties.layout} layout`);
    }

    return parts.join(', ');
  }

  /**
   * Convert semantic intent to HTML generation instructions
   */
  static generateHTMLInstructions(intent: SemanticIntent): string {
    const instructions: string[] = [];

    // Component-specific instructions
    switch (intent.componentType) {
      case 'navigation':
        instructions.push('Generate a semantic <nav> element');
        if (intent.properties.position === 'fixed') {
          instructions.push('with fixed positioning (class="fixed top-0 left-0 right-0 z-50")');
        }
        if (intent.styling.background === 'blur') {
          instructions.push('using backdrop-blur effect (class="backdrop-blur-md bg-white/90")');
        }
        if (intent.styling.elevation === 'floating') {
          instructions.push('with shadow elevation (class="shadow-lg")');
        }
        instructions.push('Include responsive mobile menu with hamburger icon');
        instructions.push('Add smooth scroll behavior for anchor links');
        break;

      case 'hero':
        instructions.push('Generate a <section> element for hero');
        if (intent.properties.size === 'full') {
          instructions.push('with full viewport height (class="min-h-screen")');
        }
        if (intent.properties.alignment === 'center') {
          instructions.push('centered content (class="flex items-center justify-center")');
        }
        instructions.push('Include compelling headline, subheading, and CTA buttons');
        break;

      case 'card':
        instructions.push('Generate a card container <div>');
        if (intent.styling.elevation === 'raised') {
          instructions.push('with raised elevation (class="shadow-xl")');
        }
        if (intent.styling.borders === 'rounded') {
          instructions.push('rounded corners (class="rounded-2xl")');
        }
        if (intent.behavior.hoverEffects) {
          instructions.push('hover effects (class="hover:scale-105 transition-transform")');
        }
        break;

      default:
        instructions.push(`Generate a semantic ${intent.componentType} component`);
    }

    return instructions.join('. ');
  }

  /**
   * Generate example output for testing
   */
  static getExampleHTML(intent: SemanticIntent, brandColor: string = '#3B82F6'): string {
    switch (intent.componentType) {
      case 'navigation':
        return this.generateNavigationHTML(intent, brandColor);
      case 'hero':
        return this.generateHeroHTML(intent, brandColor);
      case 'card':
        return this.generateCardHTML(intent, brandColor);
      default:
        return `<!-- ${intent.componentType} component -->\n<div>Generated ${intent.componentType}</div>`;
    }
  }

  /**
   * Generate professional navigation HTML
   */
  private static generateNavigationHTML(intent: SemanticIntent, brandColor: string): string {
    const positionClass = intent.properties.position === 'fixed' 
      ? 'fixed top-0 left-0 right-0 z-50' 
      : 'relative';
    
    const bgClass = intent.styling.background === 'blur'
      ? 'backdrop-blur-md bg-white/90 dark:bg-gray-900/90'
      : intent.styling.background === 'transparent'
      ? 'bg-transparent'
      : 'bg-white dark:bg-gray-900';
    
    const shadowClass = intent.styling.elevation === 'floating'
      ? 'shadow-lg'
      : 'border-b border-gray-200 dark:border-gray-800';

    return `<!-- Navigation: ${intent.reasoning} -->
<nav class="${positionClass} ${bgClass} ${shadowClass} transition-all duration-300">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
    <div class="flex items-center justify-between h-16 sm:h-20">
      
      <!-- Logo -->
      <div class="flex-shrink-0">
        <a href="#" class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white hover:opacity-80 transition-opacity">
          YourBrand
        </a>
      </div>
      
      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center space-x-8">
        <a href="#features" class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Features</a>
        <a href="#about" class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">About</a>
        <a href="#pricing" class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Pricing</a>
        <a href="#contact" class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Contact</a>
        <button class="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Get Started
        </button>
      </div>
      
      <!-- Mobile Menu Button -->
      <button id="mobile-menu-btn" class="md:hidden p-2 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
      
    </div>
  </div>
  
  <!-- Mobile Menu -->
  <div id="mobile-menu" class="hidden md:hidden border-t border-gray-200 dark:border-gray-800">
    <div class="container mx-auto px-4 py-4 space-y-2">
      <a href="#features" class="block py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Features</a>
      <a href="#about" class="block py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">About</a>
      <a href="#pricing" class="block py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</a>
      <a href="#contact" class="block py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Contact</a>
      <button class="w-full mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
        Get Started
      </button>
    </div>
  </div>
</nav>

${intent.properties.position === 'fixed' ? '<!-- Spacer to prevent content overlap -->\n<div class="h-16 sm:h-20"></div>' : ''}

<script>
document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const menuBtn = document.querySelector('#mobile-menu-btn');
  const menu = document.querySelector('#mobile-menu');
  
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });
    
    // Close menu on link click
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.add('hidden');
      });
    });
  }
  
  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
</script>`;
  }

  /**
   * Generate professional hero HTML
   */
  private static generateHeroHTML(intent: SemanticIntent, brandColor: string): string {
    const sizeClass = intent.properties.size === 'full' ? 'min-h-screen' : 'py-16 sm:py-24';
    const alignClass = intent.properties.alignment === 'center' 
      ? 'flex items-center justify-center text-center'
      : 'flex items-start justify-start';

    return `<!-- Hero: ${intent.reasoning} -->
<section class="relative w-full ${sizeClass} ${alignClass} bg-gradient-to-br from-blue-600 to-purple-600 overflow-hidden">
  <!-- Background Decoration -->
  <div class="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent pointer-events-none"></div>
  
  <!-- Content Container -->
  <div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
    <div class="max-w-4xl ${intent.properties.alignment === 'center' ? 'mx-auto' : ''} space-y-8">
      
      <!-- Headline -->
      <h1 class="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
        Transform Your Digital Presence
      </h1>
      
      <!-- Subheading -->
      <p class="text-white opacity-90 text-lg sm:text-xl md:text-2xl leading-relaxed">
        Professional solutions designed for modern businesses. Built with precision and care.
      </p>
      
      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 sm:gap-6 ${intent.properties.alignment === 'center' ? 'justify-center' : ''}">
        <button class="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
          Get Started
        </button>
        <button class="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300">
          Learn More
        </button>
      </div>
      
    </div>
  </div>
</section>`;
  }

  /**
   * Generate professional card HTML
   */
  private static generateCardHTML(intent: SemanticIntent, brandColor: string): string {
    const shadowClass = intent.styling.elevation === 'raised' ? 'shadow-xl' : 'shadow-md';
    const borderClass = intent.styling.borders === 'rounded' ? 'rounded-2xl' : 'rounded-lg';
    const hoverClass = intent.behavior.hoverEffects 
      ? 'hover:scale-105 hover:shadow-2xl transition-all duration-300'
      : 'transition-shadow duration-300';

    return `<!-- Card: ${intent.reasoning} -->
<div class="bg-white dark:bg-gray-800 ${borderClass} ${shadowClass} ${hoverClass} p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
  
  <!-- Icon/Image -->
  <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6">
    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
    </svg>
  </div>
  
  <!-- Title -->
  <h3 class="text-gray-900 dark:text-white text-xl sm:text-2xl font-bold mb-4">
    Feature Title
  </h3>
  
  <!-- Description -->
  <p class="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
    Compelling description of this feature explaining its benefits and value proposition.
  </p>
  
</div>`;
  }
}
