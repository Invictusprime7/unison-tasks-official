/**
 * Requirements Analysis Service
 * Implements Phase 1: Requirements Analysis & Prompt Parsing
 * Transforms user prompts into structured UserIntent objects
 */

import type { 
  UserIntent, 
  DomainPattern,
  OrganismType,
  DesignTheme 
} from '@/types/designSystem';
import type { AITemplatePrompt } from '@/types/template';
import { getThemeByMood } from '@/utils/designTokens';

/**
 * Domain Pattern Library
 * Predefined patterns for common website types
 */
export const DOMAIN_PATTERNS: DomainPattern[] = [
  {
    domain: 'portfolio',
    description: 'Personal or creative portfolio websites showcasing work',
    defaultSections: ['hero', 'gallery', 'about', 'testimonials', 'contact'],
    suggestedMood: 'bold',
    keywords: ['portfolio', 'showcase', 'work', 'creative', 'designer', 'developer', 'artist']
  },
  {
    domain: 'ecommerce',
    description: 'Online stores and product catalogs',
    defaultSections: ['hero', 'features', 'pricing', 'testimonials', 'cta'],
    suggestedMood: 'corporate',
    keywords: ['shop', 'store', 'ecommerce', 'product', 'buy', 'sell', 'commerce']
  },
  {
    domain: 'blog',
    description: 'Content-focused websites with articles and posts',
    defaultSections: ['hero', 'blog', 'about', 'contact'],
    suggestedMood: 'elegant',
    keywords: ['blog', 'article', 'content', 'writing', 'news', 'magazine']
  },
  {
    domain: 'landing',
    description: 'Single-page marketing or promotional sites',
    defaultSections: ['hero', 'features', 'pricing', 'cta'],
    suggestedMood: 'bold',
    keywords: ['landing', 'promotion', 'campaign', 'launch', 'marketing', 'convert']
  },
  {
    domain: 'corporate',
    description: 'Business and professional websites',
    defaultSections: ['hero', 'about', 'features', 'team', 'contact'],
    suggestedMood: 'corporate',
    keywords: ['business', 'company', 'corporate', 'professional', 'enterprise', 'saas']
  },
  {
    domain: 'creative',
    description: 'Bold, artistic, and experimental designs',
    defaultSections: ['hero', 'gallery', 'about', 'cta'],
    suggestedMood: 'playful',
    keywords: ['creative', 'art', 'experimental', 'bold', 'unique', 'vibrant']
  }
];

/**
 * Section Keywords Mapping
 * Maps user-mentioned sections to OrganismType
 */
const SECTION_KEYWORDS: Record<string, OrganismType> = {
  'hero': 'hero',
  'banner': 'hero',
  'header': 'navigation',
  'nav': 'navigation',
  'navigation': 'navigation',
  'menu': 'navigation',
  'footer': 'footer',
  'gallery': 'gallery',
  'portfolio': 'gallery',
  'showcase': 'gallery',
  'testimonials': 'testimonials',
  'reviews': 'testimonials',
  'features': 'features',
  'benefits': 'features',
  'services': 'features',
  'pricing': 'pricing',
  'plans': 'pricing',
  'contact': 'contact',
  'form': 'contact',
  'about': 'about',
  'team': 'team',
  'staff': 'team',
  'blog': 'blog',
  'articles': 'blog',
  'news': 'blog',
  'cta': 'cta',
  'call-to-action': 'cta'
};

/**
 * Requirements Analysis Service
 */
export class RequirementsAnalysisService {
  
  /**
   * Parse user prompt into structured UserIntent
   */
  static parseUserIntent(prompt: AITemplatePrompt): UserIntent {
    const description = this.buildDescription(prompt);
    
    // Detect domain
    const domain = this.detectDomain(description);
    
    // Extract sections
    const sections = this.extractSections(description, domain);
    
    // Detect mood/style
    const mood = this.detectMood(prompt.preferredStyle, domain);
    
    // Build style preferences
    const style = {
      mood,
      colorPalette: this.extractColors(prompt),
      typography: this.extractTypography(domain, mood),
      references: []
    };
    
    // Set accessibility requirements
    const accessibility = {
      wcagTarget: 'AA' as const,
      screenReaderOptimized: true,
      keyboardNavigable: true
    };
    
    // Set performance budgets
    const performance = {
      targetLoadTime: 3000, // 3 seconds
      targetBundleSize: 100 * 1024, // 100KB
      lazyLoadImages: true
    };
    
    return {
      domain,
      sections,
      style,
      accessibility,
      performance
    };
  }
  
  /**
   * Build description from prompt
   */
  private static buildDescription(prompt: AITemplatePrompt): string {
    let description = `Create a ${prompt.format} template for ${prompt.industry}. `;
    description += `Goal: ${prompt.goal}. `;
    
    if (prompt.targetAudience) {
      description += `Target Audience: ${prompt.targetAudience}. `;
    }
    
    if (prompt.keyMessages?.length) {
      description += `Key Messages: ${prompt.keyMessages.join(', ')}. `;
    }
    
    if (prompt.preferredStyle) {
      description += `Style: ${prompt.preferredStyle}. `;
    }
    
    return description.toLowerCase();
  }
  
  /**
   * Detect domain from description
   */
  private static detectDomain(description: string): UserIntent['domain'] {
    const lowerDesc = description.toLowerCase();
    
    // Check each domain pattern
    for (const pattern of DOMAIN_PATTERNS) {
      for (const keyword of pattern.keywords) {
        if (lowerDesc.includes(keyword)) {
          return pattern.domain as UserIntent['domain'];
        }
      }
    }
    
    // Default to 'other' if no match
    return 'other';
  }
  
  /**
   * Extract sections from description
   */
  private static extractSections(
    description: string, 
    domain: UserIntent['domain']
  ): OrganismType[] {
    const lowerDesc = description.toLowerCase();
    const foundSections = new Set<OrganismType>();
    
    // Check for explicit section mentions
    for (const [keyword, section] of Object.entries(SECTION_KEYWORDS)) {
      if (lowerDesc.includes(keyword)) {
        foundSections.add(section);
      }
    }
    
    // If no sections found, use default pattern
    if (foundSections.size === 0) {
      const pattern = DOMAIN_PATTERNS.find(p => p.domain === domain);
      if (pattern) {
        return pattern.defaultSections as OrganismType[];
      }
    }
    
    // Ensure hero is always first
    const sections = Array.from(foundSections);
    if (sections.includes('hero')) {
      sections.sort((a, b) => {
        if (a === 'hero') return -1;
        if (b === 'hero') return 1;
        return 0;
      });
    } else {
      sections.unshift('hero');
    }
    
    return sections;
  }
  
  /**
   * Detect mood/style preference
   */
  private static detectMood(
    preferredStyle?: string,
    domain?: UserIntent['domain']
  ): DesignTheme['mood'] {
    // Use explicit style if provided
    if (preferredStyle) {
      const styleMap: Record<string, DesignTheme['mood']> = {
        'modern': 'corporate',
        'classic': 'elegant',
        'minimal': 'minimal',
        'bold': 'bold',
        'playful': 'playful'
      };
      
      const mood = styleMap[preferredStyle.toLowerCase()];
      if (mood) return mood;
    }
    
    // Use domain pattern suggestion
    if (domain) {
      const pattern = DOMAIN_PATTERNS.find(p => p.domain === domain);
      if (pattern) {
        return pattern.suggestedMood as DesignTheme['mood'];
      }
    }
    
    // Default to corporate
    return 'corporate';
  }
  
  /**
   * Extract color preferences
   */
  private static extractColors(prompt: AITemplatePrompt): string[] {
    const colors: string[] = [];
    
    if (prompt.brandKit?.primaryColor) {
      colors.push(prompt.brandKit.primaryColor);
    }
    
    if (prompt.brandKit?.secondaryColor) {
      colors.push(prompt.brandKit.secondaryColor);
    }
    
    return colors;
  }
  
  /**
   * Extract typography preferences
   */
  private static extractTypography(
    domain: UserIntent['domain'],
    mood: DesignTheme['mood']
  ): string {
    // Serif for elegant/blog domains
    if (mood === 'elegant' || domain === 'blog') {
      return 'serif';
    }
    
    // Sans-serif for everything else
    return 'sans-serif';
  }
  
  /**
   * Get domain pattern by domain type
   */
  static getDomainPattern(domain: UserIntent['domain']): DomainPattern | undefined {
    return DOMAIN_PATTERNS.find(p => p.domain === domain);
  }
  
  /**
   * Get suggested theme for user intent
   */
  static getSuggestedTheme(intent: UserIntent): DesignTheme {
    const mood = intent.style?.mood || 'corporate';
    return getThemeByMood(mood);
  }
  
  /**
   * Validate user intent
   */
  static validateIntent(intent: UserIntent): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check required fields
    if (!intent.domain) {
      errors.push('Domain is required');
    }
    
    if (!intent.sections || intent.sections.length === 0) {
      errors.push('At least one section is required');
    }
    
    // Check for hero section
    if (intent.sections && !intent.sections.includes('hero')) {
      warnings.push('Hero section is recommended for better user engagement');
    }
    
    // Check accessibility
    if (!intent.accessibility?.wcagTarget) {
      warnings.push('WCAG compliance level not specified, defaulting to AA');
    }
    
    // Check performance
    if (!intent.performance?.targetLoadTime) {
      warnings.push('Performance budget not specified, using defaults');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}
