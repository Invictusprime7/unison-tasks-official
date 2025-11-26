/**
 * Design System Generator Service
 * Implements Phase 2 & 3: Canonical Data Contract + Layout Generation
 * Generates templates using atomic design hierarchy and design tokens
 */

import type {
  UserIntent,
  DesignTheme,
  DesignSystemTemplate,
  Page,
  Organism,
  Molecule,
  Atom,
  GridLayout,
  Breakpoints
} from '@/types/designSystem';
import type { AIGeneratedTemplate, TemplateSection, TemplateComponent } from '@/types/template';
import { getThemeByMood } from '@/utils/designTokens';

/**
 * Standard breakpoints (mobile-first)
 */
const BREAKPOINTS: Breakpoints = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
  ultrawide: 1536
};

/**
 * Design System Generator Service
 */
export class DesignSystemGeneratorService {
  
  /**
   * Generate template from user intent
   */
  static generateTemplate(intent: UserIntent): DesignSystemTemplate {
    // Select theme based on mood
    const theme = getThemeByMood(intent.style?.mood || 'corporate');
    
    // Build organisms from sections
    const organisms = intent.sections.map((sectionType, index) => 
      this.buildOrganism(sectionType, theme, index)
    );
    
    // Create grid layout
    const layout: GridLayout = {
      gridColumns: 12,
      gap: 4, // spacing units
      breakpoints: BREAKPOINTS,
      maxWidth: 1280,
      margin: theme.tokens.spacing.md,
      padding: theme.tokens.spacing.md
    };
    
    // Build template
    const template: Template = {
      id: `template-${Date.now()}`,
      name: `${intent.domain} Template`,
      description: `Professional ${intent.domain} website template`,
      category: intent.domain as Template['category'],
      organisms,
      layout,
      theme,
      version: '1.0.0',
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        author: 'AI Design System',
        tags: [intent.domain, theme.mood]
      }
    };
    
    return template;
  }
  
  /**
   * Build organism from section type
   */
  private static buildOrganism(
    type: Organism['type'],
    theme: DesignTheme,
    index: number
  ): Organism {
    const buildMap: Record<Organism['type'], () => Organism> = {
      'hero': () => this.buildHeroOrganism(theme, index),
      'navigation': () => this.buildNavigationOrganism(theme, index),
      'footer': () => this.buildFooterOrganism(theme, index),
      'gallery': () => this.buildGalleryOrganism(theme, index),
      'testimonials': () => this.buildTestimonialsOrganism(theme, index),
      'features': () => this.buildFeaturesOrganism(theme, index),
      'pricing': () => this.buildPricingOrganism(theme, index),
      'contact': () => this.buildContactOrganism(theme, index),
      'about': () => this.buildAboutOrganism(theme, index),
      'team': () => this.buildTeamOrganism(theme, index),
      'blog': () => this.buildBlogOrganism(theme, index),
      'cta': () => this.buildCTAOrganism(theme, index)
    };
    
    return buildMap[type]();
  }
  
  /**
   * Build Hero Organism
   */
  private static buildHeroOrganism(theme: DesignTheme, index: number): Organism {
    const molecules: Molecule[] = [
      {
        id: `hero-content-${index}`,
        name: 'Hero Content',
        description: 'Main hero section content',
        atoms: [
          this.createAtom('heading', theme, 'Transform Your Business', index, 0),
          this.createAtom('paragraph', theme, 'Get the tools you need to succeed in today\'s market', index, 1),
          this.createAtom('button', theme, 'Get Started', index, 2)
        ],
        layout: 'vertical',
        responsive: {
          mobile: { layout: 'vertical' },
          tablet: { layout: 'vertical' },
          desktop: { layout: 'vertical' }
        }
      }
    ];
    
    return {
      id: `hero-${index}`,
      name: 'Hero Section',
      type: 'hero',
      description: 'Main hero banner with CTA',
      molecules,
      layout: {
        type: 'flex',
        columns: 1,
        gap: theme.tokens.spacing.lg
      },
      responsive: {
        mobile: { columns: 1, gap: theme.tokens.spacing.md },
        tablet: { columns: 1, gap: theme.tokens.spacing.lg },
        desktop: { columns: 1, gap: theme.tokens.spacing.xl }
      }
    };
  }
  
  /**
   * Build Features Organism
   */
  private static buildFeaturesOrganism(theme: DesignTheme, index: number): Organism {
    const molecules: Molecule[] = [];
    
    // Create 3 feature cards
    for (let i = 0; i < 3; i++) {
      molecules.push({
        id: `feature-card-${index}-${i}`,
        name: `Feature Card ${i + 1}`,
        atoms: [
          this.createAtom('icon', theme, '⚡', index, i * 3),
          this.createAtom('heading', theme, `Feature ${i + 1}`, index, i * 3 + 1),
          this.createAtom('paragraph', theme, 'Amazing feature description', index, i * 3 + 2)
        ],
        layout: 'vertical'
      });
    }
    
    return {
      id: `features-${index}`,
      name: 'Features Section',
      type: 'features',
      description: 'Product/service features grid',
      molecules,
      layout: {
        type: 'grid',
        columns: 3,
        gap: theme.tokens.spacing.lg
      },
      responsive: {
        mobile: { columns: 1, gap: theme.tokens.spacing.md },
        tablet: { columns: 2, gap: theme.tokens.spacing.md },
        desktop: { columns: 3, gap: theme.tokens.spacing.lg }
      }
    };
  }
  
  /**
   * Build Gallery Organism
   */
  private static buildGalleryOrganism(theme: DesignTheme, index: number): Organism {
    const molecules: Molecule[] = [];
    
    // Create 6 gallery items
    for (let i = 0; i < 6; i++) {
      molecules.push({
        id: `gallery-item-${index}-${i}`,
        name: `Gallery Item ${i + 1}`,
        atoms: [
          this.createAtom('image', theme, `Project ${i + 1}`, index, i * 2),
          this.createAtom('heading', theme, `Project ${i + 1}`, index, i * 2 + 1)
        ],
        layout: 'vertical'
      });
    }
    
    return {
      id: `gallery-${index}`,
      name: 'Gallery Section',
      type: 'gallery',
      description: 'Image gallery or portfolio',
      molecules,
      layout: {
        type: 'grid',
        columns: 3,
        gap: theme.tokens.spacing.md
      },
      responsive: {
        mobile: { columns: 1, gap: theme.tokens.spacing.sm },
        tablet: { columns: 2, gap: theme.tokens.spacing.md },
        desktop: { columns: 3, gap: theme.tokens.spacing.md }
      }
    };
  }
  
  /**
   * Build Testimonials Organism
   */
  private static buildTestimonialsOrganism(theme: DesignTheme, index: number): Organism {
    const molecules: Molecule[] = [];
    
    // Create 3 testimonial cards
    for (let i = 0; i < 3; i++) {
      molecules.push({
        id: `testimonial-${index}-${i}`,
        name: `Testimonial ${i + 1}`,
        atoms: [
          this.createAtom('paragraph', theme, '"Amazing service!"', index, i * 3),
          this.createAtom('heading', theme, `Customer ${i + 1}`, index, i * 3 + 1),
          this.createAtom('paragraph', theme, 'Company Name', index, i * 3 + 2)
        ],
        layout: 'vertical'
      });
    }
    
    return {
      id: `testimonials-${index}`,
      name: 'Testimonials Section',
      type: 'testimonials',
      description: 'Customer testimonials and reviews',
      molecules,
      layout: {
        type: 'grid',
        columns: 3,
        gap: theme.tokens.spacing.lg
      },
      responsive: {
        mobile: { columns: 1, gap: theme.tokens.spacing.md },
        tablet: { columns: 2, gap: theme.tokens.spacing.md },
        desktop: { columns: 3, gap: theme.tokens.spacing.lg }
      }
    };
  }
  
  /**
   * Build Pricing Organism
   */
  private static buildPricingOrganism(theme: DesignTheme, index: number): Organism {
    const molecules: Molecule[] = [];
    
    // Create 3 pricing tiers
    const tiers = ['Basic', 'Pro', 'Enterprise'];
    const prices = ['$9', '$29', '$99'];
    
    for (let i = 0; i < 3; i++) {
      molecules.push({
        id: `pricing-tier-${index}-${i}`,
        name: `${tiers[i]} Plan`,
        atoms: [
          this.createAtom('heading', theme, tiers[i], index, i * 3),
          this.createAtom('heading', theme, prices[i], index, i * 3 + 1),
          this.createAtom('button', theme, 'Choose Plan', index, i * 3 + 2)
        ],
        layout: 'vertical'
      });
    }
    
    return {
      id: `pricing-${index}`,
      name: 'Pricing Section',
      type: 'pricing',
      description: 'Pricing tiers and plans',
      molecules,
      layout: {
        type: 'grid',
        columns: 3,
        gap: theme.tokens.spacing.lg
      },
      responsive: {
        mobile: { columns: 1, gap: theme.tokens.spacing.md },
        tablet: { columns: 2, gap: theme.tokens.spacing.md },
        desktop: { columns: 3, gap: theme.tokens.spacing.lg }
      }
    };
  }
  
  /**
   * Build Contact Organism
   */
  private static buildContactOrganism(theme: DesignTheme, index: number): Organism {
    const molecules: Molecule[] = [
      {
        id: `contact-form-${index}`,
        name: 'Contact Form',
        atoms: [
          this.createAtom('heading', theme, 'Get In Touch', index, 0),
          this.createAtom('input', theme, 'Name', index, 1),
          this.createAtom('input', theme, 'Email', index, 2),
          this.createAtom('input', theme, 'Message', index, 3),
          this.createAtom('button', theme, 'Send Message', index, 4)
        ],
        layout: 'vertical'
      }
    ];
    
    return {
      id: `contact-${index}`,
      name: 'Contact Section',
      type: 'contact',
      description: 'Contact form and information',
      molecules,
      layout: {
        type: 'flex',
        columns: 1,
        gap: theme.tokens.spacing.md
      },
      responsive: {
        mobile: { columns: 1, gap: theme.tokens.spacing.sm },
        tablet: { columns: 1, gap: theme.tokens.spacing.md },
        desktop: { columns: 1, gap: theme.tokens.spacing.md }
      }
    };
  }
  
  /**
   * Build About Organism
   */
  private static buildAboutOrganism(theme: DesignTheme, index: number): Organism {
    const molecules: Molecule[] = [
      {
        id: `about-content-${index}`,
        name: 'About Content',
        atoms: [
          this.createAtom('heading', theme, 'About Us', index, 0),
          this.createAtom('paragraph', theme, 'We are passionate about delivering excellence', index, 1),
          this.createAtom('image', theme, 'Team photo', index, 2)
        ],
        layout: 'vertical'
      }
    ];
    
    return {
      id: `about-${index}`,
      name: 'About Section',
      type: 'about',
      description: 'About company/person information',
      molecules,
      layout: {
        type: 'flex',
        columns: 2,
        gap: theme.tokens.spacing.xl
      },
      responsive: {
        mobile: { columns: 1, gap: theme.tokens.spacing.md },
        tablet: { columns: 1, gap: theme.tokens.spacing.lg },
        desktop: { columns: 2, gap: theme.tokens.spacing.xl }
      }
    };
  }
  
  /**
   * Build Team Organism
   */
  private static buildTeamOrganism(theme: DesignTheme, index: number): Organism {
    const molecules: Molecule[] = [];
    
    // Create 4 team member cards
    for (let i = 0; i < 4; i++) {
      molecules.push({
        id: `team-member-${index}-${i}`,
        name: `Team Member ${i + 1}`,
        atoms: [
          this.createAtom('image', theme, `Team member ${i + 1}`, index, i * 3),
          this.createAtom('heading', theme, `Team Member ${i + 1}`, index, i * 3 + 1),
          this.createAtom('paragraph', theme, 'Position', index, i * 3 + 2)
        ],
        layout: 'vertical'
      });
    }
    
    return {
      id: `team-${index}`,
      name: 'Team Section',
      type: 'team',
      description: 'Team members showcase',
      molecules,
      layout: {
        type: 'grid',
        columns: 4,
        gap: theme.tokens.spacing.lg
      },
      responsive: {
        mobile: { columns: 1, gap: theme.tokens.spacing.md },
        tablet: { columns: 2, gap: theme.tokens.spacing.md },
        desktop: { columns: 4, gap: theme.tokens.spacing.lg }
      }
    };
  }
  
  /**
   * Build Blog Organism
   */
  private static buildBlogOrganism(theme: DesignTheme, index: number): Organism {
    const molecules: Molecule[] = [];
    
    // Create 3 blog post cards
    for (let i = 0; i < 3; i++) {
      molecules.push({
        id: `blog-post-${index}-${i}`,
        name: `Blog Post ${i + 1}`,
        atoms: [
          this.createAtom('image', theme, `Blog image ${i + 1}`, index, i * 3),
          this.createAtom('heading', theme, `Blog Post Title ${i + 1}`, index, i * 3 + 1),
          this.createAtom('paragraph', theme, 'Post excerpt...', index, i * 3 + 2)
        ],
        layout: 'vertical'
      });
    }
    
    return {
      id: `blog-${index}`,
      name: 'Blog Section',
      type: 'blog',
      description: 'Blog posts listing',
      molecules,
      layout: {
        type: 'grid',
        columns: 3,
        gap: theme.tokens.spacing.lg
      },
      responsive: {
        mobile: { columns: 1, gap: theme.tokens.spacing.md },
        tablet: { columns: 2, gap: theme.tokens.spacing.md },
        desktop: { columns: 3, gap: theme.tokens.spacing.lg }
      }
    };
  }
  
  /**
   * Build CTA Organism
   */
  private static buildCTAOrganism(theme: DesignTheme, index: number): Organism {
    const molecules: Molecule[] = [
      {
        id: `cta-content-${index}`,
        name: 'CTA Content',
        atoms: [
          this.createAtom('heading', theme, 'Ready to Get Started?', index, 0),
          this.createAtom('paragraph', theme, 'Join thousands of satisfied customers', index, 1),
          this.createAtom('button', theme, 'Start Free Trial', index, 2)
        ],
        layout: 'vertical'
      }
    ];
    
    return {
      id: `cta-${index}`,
      name: 'CTA Section',
      type: 'cta',
      description: 'Call-to-action banner',
      molecules,
      layout: {
        type: 'flex',
        columns: 1,
        gap: theme.tokens.spacing.md
      },
      responsive: {
        mobile: { columns: 1, gap: theme.tokens.spacing.md },
        tablet: { columns: 1, gap: theme.tokens.spacing.md },
        desktop: { columns: 1, gap: theme.tokens.spacing.lg }
      }
    };
  }
  
  /**
   * Build Navigation Organism
   */
  private static buildNavigationOrganism(theme: DesignTheme, index: number): Organism {
    const molecules: Molecule[] = [
      {
        id: `nav-content-${index}`,
        name: 'Navigation Content',
        atoms: [
          this.createAtom('heading', theme, 'Logo', index, 0),
          this.createAtom('link', theme, 'Home', index, 1),
          this.createAtom('link', theme, 'About', index, 2),
          this.createAtom('link', theme, 'Contact', index, 3),
          this.createAtom('button', theme, 'Get Started', index, 4)
        ],
        layout: 'horizontal'
      }
    ];
    
    return {
      id: `navigation-${index}`,
      name: 'Navigation Section',
      type: 'navigation',
      description: 'Main navigation menu',
      molecules,
      layout: {
        type: 'flex',
        columns: 1,
        gap: theme.tokens.spacing.md
      },
      responsive: {
        mobile: { columns: 1, gap: theme.tokens.spacing.sm },
        tablet: { columns: 1, gap: theme.tokens.spacing.md },
        desktop: { columns: 1, gap: theme.tokens.spacing.md }
      }
    };
  }
  
  /**
   * Build Footer Organism
   */
  private static buildFooterOrganism(theme: DesignTheme, index: number): Organism {
    const molecules: Molecule[] = [
      {
        id: `footer-content-${index}`,
        name: 'Footer Content',
        atoms: [
          this.createAtom('paragraph', theme, '© 2025 Company Name', index, 0),
          this.createAtom('link', theme, 'Privacy', index, 1),
          this.createAtom('link', theme, 'Terms', index, 2),
          this.createAtom('link', theme, 'Contact', index, 3)
        ],
        layout: 'horizontal'
      }
    ];
    
    return {
      id: `footer-${index}`,
      name: 'Footer Section',
      type: 'footer',
      description: 'Site footer with links',
      molecules,
      layout: {
        type: 'flex',
        columns: 1,
        gap: theme.tokens.spacing.md
      },
      responsive: {
        mobile: { columns: 1, gap: theme.tokens.spacing.sm },
        tablet: { columns: 1, gap: theme.tokens.spacing.md },
        desktop: { columns: 1, gap: theme.tokens.spacing.md }
      }
    };
  }
  
  /**
   * Create atom helper
   */
  private static createAtom(
    type: Atom['type'],
    theme: DesignTheme,
    content: string,
    sectionIndex: number,
    atomIndex: number
  ): Atom {
    return {
      id: `atom-${type}-${sectionIndex}-${atomIndex}`,
      type,
      content,
      tokens: {}, // Atoms inherit tokens from molecules/organisms
      ariaLabel: content,
      dataTestId: `${type}-${sectionIndex}-${atomIndex}`
    };
  }
  
  /**
   * Convert Template to AIGeneratedTemplate (for backwards compatibility)
   */
  static convertToLegacyFormat(template: Template): AIGeneratedTemplate {
    const typeMap: Record<Organism['type'], TemplateSection['type']> = {
      hero: 'hero',
      navigation: 'custom',
      footer: 'footer',
      gallery: 'gallery',
      testimonials: 'custom',
      features: 'content',
      pricing: 'custom',
      contact: 'content',
      about: 'content',
      team: 'content',
      blog: 'content',
      cta: 'cta'
    };
    
    const sections: TemplateSection[] = template.organisms.map(organism => ({
      id: organism.id,
      name: organism.name,
      type: typeMap[organism.type] || 'custom',
      constraints: {
        width: { mode: 'fill' as const },
        height: { mode: 'hug' as const },
        flexDirection: 'column' as const,
        alignItems: 'center' as const,
        padding: { top: 40, right: 40, bottom: 40, left: 40 }
      },
      components: []
    }));
    
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      industry: template.category,
      brandKit: {
        primaryColor: template.theme.tokens.colors.primary[5]?.value || '#3B82F6',
        secondaryColor: template.theme.tokens.colors.secondary[5]?.value || '#10B981',
        accentColor: template.theme.tokens.colors.primary[6]?.value || '#2563EB',
        fonts: {
          heading: template.theme.tokens.typography.heading.fontFamily,
          body: template.theme.tokens.typography.body.fontFamily,
          accent: template.theme.tokens.typography.heading.fontFamily
        }
      },
      sections,
      variants: [
        {
          id: 'desktop',
          name: 'Desktop',
          size: { width: 1200, height: 800 },
          format: 'web'
        }
      ],
      data: {},
      createdAt: template.metadata?.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: template.metadata?.updatedAt?.toISOString() || new Date().toISOString()
    };
  }
}
