/**
 * Theme Synthesis Service
 * Generates intelligent color palettes, typography, and spacing based on industry/tone
 */

import type {
  AIProjectRequest,
  ColorPalette,
  TypographySystem,
  AIThemeResponse
} from '@/types/aiWebBuilder';

// ============================================================================
// INDUSTRY COLOR PALETTES
// ============================================================================

const INDUSTRY_PALETTES: Record<string, ColorPalette[]> = {
  restaurant: [
    {
      name: 'Warm Bistro',
      primary: '#D97706', // amber-600
      secondary: '#DC2626', // red-600
      accent: '#F59E0B', // amber-500
      neutral: {
        50: '#FAF5F0',
        100: '#F5EBE0',
        200: '#E8D4BF',
        300: '#DBBEA0',
        400: '#CCA780',
        500: '#B8905F',
        600: '#967545',
        700: '#72582F',
        800: '#4E3B1E',
        900: '#2A1F0D',
        950: '#150F06'
      },
      background: '#FFFBF5',
      foreground: '#2A1F0D',
      muted: '#F5EBE0',
      border: '#E8D4BF',
      gradients: {
        primary: 'from-amber-600 via-amber-500 to-yellow-500',
        secondary: 'from-red-600 via-orange-600 to-amber-600',
        accent: 'from-amber-500 via-yellow-500 to-orange-400'
      }
    }
  ],
  portfolio: [
    {
      name: 'Minimal Studio',
      primary: '#111827', // gray-900
      secondary: '#6B7280', // gray-500
      accent: '#3B82F6', // blue-500
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
      border: '#E5E7EB',
      gradients: {
        primary: 'from-gray-900 via-gray-800 to-gray-700',
        secondary: 'from-gray-500 via-gray-400 to-gray-300',
        accent: 'from-blue-600 via-blue-500 to-cyan-500'
      }
    }
  ],
  contracting: [
    {
      name: 'Professional Build',
      primary: '#1E40AF', // blue-800
      secondary: '#059669', // emerald-600
      accent: '#F59E0B', // amber-500
      neutral: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
        700: '#334155',
        800: '#1E293B',
        900: '#0F172A',
        950: '#020617'
      },
      background: '#FFFFFF',
      foreground: '#0F172A',
      muted: '#F1F5F9',
      border: '#E2E8F0',
      gradients: {
        primary: 'from-blue-800 via-blue-700 to-blue-600',
        secondary: 'from-emerald-600 via-green-600 to-teal-600',
        accent: 'from-amber-500 via-orange-500 to-red-500'
      }
    }
  ],
  creator: [
    {
      name: 'Bold Creator',
      primary: '#8B5CF6', // violet-500
      secondary: '#EC4899', // pink-500
      accent: '#06B6D4', // cyan-500
      neutral: {
        50: '#FAF5FF',
        100: '#F3E8FF',
        200: '#E9D5FF',
        300: '#D8B4FE',
        400: '#C084FC',
        500: '#A855F7',
        600: '#9333EA',
        700: '#7E22CE',
        800: '#6B21A8',
        900: '#581C87',
        950: '#3B0764'
      },
      background: '#FFFFFF',
      foreground: '#1F2937',
      muted: '#F3E8FF',
      border: '#E9D5FF',
      gradients: {
        primary: 'from-violet-600 via-violet-500 to-purple-500',
        secondary: 'from-pink-600 via-pink-500 to-rose-500',
        accent: 'from-cyan-600 via-cyan-500 to-blue-500'
      }
    }
  ],
  ad_campaign: [
    {
      name: 'High Energy',
      primary: '#DC2626', // red-600
      secondary: '#EA580C', // orange-600
      accent: '#FACC15', // yellow-400
      neutral: {
        50: '#FEF2F2',
        100: '#FEE2E2',
        200: '#FECACA',
        300: '#FCA5A5',
        400: '#F87171',
        500: '#EF4444',
        600: '#DC2626',
        700: '#B91C1C',
        800: '#991B1B',
        900: '#7F1D1D',
        950: '#450A0A'
      },
      background: '#FFFBEB',
      foreground: '#1F2937',
      muted: '#FEE2E2',
      border: '#FECACA',
      gradients: {
        primary: 'from-red-600 via-orange-600 to-yellow-500',
        secondary: 'from-orange-600 via-amber-600 to-yellow-500',
        accent: 'from-yellow-400 via-amber-400 to-orange-400'
      }
    }
  ],
  saas: [
    {
      name: 'Modern Tech',
      primary: '#3B82F6', // blue-500
      secondary: '#8B5CF6', // violet-500
      accent: '#06B6D4', // cyan-500
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
      border: '#E5E7EB',
      gradients: {
        primary: 'from-blue-600 via-blue-500 to-cyan-500',
        secondary: 'from-violet-600 via-purple-500 to-pink-500',
        accent: 'from-cyan-500 via-teal-500 to-emerald-500'
      }
    }
  ],
  ecommerce: [
    {
      name: 'Clean Commerce',
      primary: '#059669', // emerald-600
      secondary: '#0891B2', // cyan-600
      accent: '#F59E0B', // amber-500
      neutral: {
        50: '#FAFAFA',
        100: '#F4F4F5',
        200: '#E4E4E7',
        300: '#D4D4D8',
        400: '#A1A1AA',
        500: '#71717A',
        600: '#52525B',
        700: '#3F3F46',
        800: '#27272A',
        900: '#18181B',
        950: '#09090B'
      },
      background: '#FFFFFF',
      foreground: '#18181B',
      muted: '#F4F4F5',
      border: '#E4E4E7',
      gradients: {
        primary: 'from-emerald-600 via-green-600 to-teal-600',
        secondary: 'from-cyan-600 via-blue-600 to-indigo-600',
        accent: 'from-amber-500 via-yellow-500 to-orange-500'
      }
    }
  ],
  agency: [
    {
      name: 'Creative Agency',
      primary: '#7C3AED', // violet-600
      secondary: '#EC4899', // pink-500
      accent: '#14B8A6', // teal-500
      neutral: {
        50: '#FAFAFA',
        100: '#F4F4F5',
        200: '#E4E4E7',
        300: '#D4D4D8',
        400: '#A1A1AA',
        500: '#71717A',
        600: '#52525B',
        700: '#3F3F46',
        800: '#27272A',
        900: '#18181B',
        950: '#09090B'
      },
      background: '#FFFFFF',
      foreground: '#18181B',
      muted: '#F4F4F5',
      border: '#E4E4E7',
      gradients: {
        primary: 'from-violet-600 via-purple-500 to-fuchsia-500',
        secondary: 'from-pink-600 via-rose-500 to-red-500',
        accent: 'from-teal-600 via-cyan-500 to-blue-500'
      }
    }
  ]
};

// ============================================================================
// TONE COLOR ADJUSTMENTS
// ============================================================================

const TONE_ADJUSTMENTS: Record<string, {
  saturation: number; // -1 to 1
  brightness: number; // -1 to 1
  contrast: number; // 0 to 2
}> = {
  minimal: { saturation: -0.3, brightness: 0.2, contrast: 0.8 },
  luxury: { saturation: -0.2, brightness: -0.1, contrast: 1.2 },
  energetic: { saturation: 0.3, brightness: 0.1, contrast: 1.3 },
  elegant: { saturation: -0.1, brightness: 0, contrast: 1.1 },
  playful: { saturation: 0.4, brightness: 0.2, contrast: 1.4 },
  techy: { saturation: 0.1, brightness: -0.2, contrast: 1.2 },
  professional: { saturation: -0.1, brightness: 0, contrast: 1.0 },
  creative: { saturation: 0.2, brightness: 0.1, contrast: 1.2 }
};

// ============================================================================
// TYPOGRAPHY SYSTEMS
// ============================================================================

const TYPOGRAPHY_SYSTEMS: Record<string, TypographySystem[]> = {
  minimal: [
    {
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
        tight: 1.1,
        normal: 1.5,
        relaxed: 1.75
      }
    }
  ],
  luxury: [
    {
      fontFamily: {
        heading: 'Playfair Display, Georgia, serif',
        body: 'Inter, system-ui, sans-serif',
        accent: 'Cormorant Garamond, serif'
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.375rem',
        '2xl': '1.625rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        '5xl': '3.25rem',
        '6xl': '4rem',
        '7xl': '5rem',
        '8xl': '6.5rem'
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
        tight: 1.2,
        normal: 1.6,
        relaxed: 1.8
      },
      letterSpacing: {
        tight: '-0.025em',
        normal: '0',
        wide: '0.05em'
      }
    }
  ],
  energetic: [
    {
      fontFamily: {
        heading: 'Outfit, Inter, sans-serif',
        body: 'Inter, system-ui, sans-serif'
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        '5xl': '3.5rem',
        '6xl': '4.5rem',
        '7xl': '5.5rem',
        '8xl': '7rem'
      },
      weight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 900
      },
      lineHeight: {
        tight: 1,
        normal: 1.4,
        relaxed: 1.6
      }
    }
  ],
  elegant: [
    {
      fontFamily: {
        heading: 'Cormorant Garamond, Georgia, serif',
        body: 'Lato, system-ui, sans-serif'
      },
      scale: {
        xs: '0.813rem',
        sm: '0.938rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.375rem',
        '2xl': '1.625rem',
        '3xl': '2.125rem',
        '4xl': '2.75rem',
        '5xl': '3.5rem',
        '6xl': '4.25rem',
        '7xl': '5rem',
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
        normal: 1.65,
        relaxed: 1.85
      }
    }
  ],
  playful: [
    {
      fontFamily: {
        heading: 'Fredoka, Rounded, sans-serif',
        body: 'Inter, system-ui, sans-serif'
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.75rem',
        '5xl': '3.75rem',
        '6xl': '4.75rem',
        '7xl': '6rem',
        '8xl': '8rem'
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
        tight: 1.15,
        normal: 1.5,
        relaxed: 1.7
      }
    }
  ],
  techy: [
    {
      fontFamily: {
        heading: 'Space Grotesk, monospace',
        body: 'Inter, system-ui, sans-serif',
        mono: 'JetBrains Mono, monospace'
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
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75
      }
    }
  ],
  professional: [
    {
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
    }
  ],
  creative: [
    {
      fontFamily: {
        heading: 'Outfit, sans-serif',
        body: 'Inter, system-ui, sans-serif'
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        '5xl': '3.5rem',
        '6xl': '4.5rem',
        '7xl': '5.5rem',
        '8xl': '7rem'
      },
      weight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 900
      },
      lineHeight: {
        tight: 1.1,
        normal: 1.5,
        relaxed: 1.7
      }
    }
  ]
};

// ============================================================================
// THEME SYNTHESIS ENGINE
// ============================================================================

export class ThemeSynthesisService {
  /**
   * Synthesize complete theme based on project request
   */
  async synthesizeTheme(request: AIProjectRequest): Promise<AIThemeResponse> {
    const { brand } = request;
    
    // Step 1: Select base palette from industry
    const basePalette = this.selectIndustryPalette(brand.industry);
    
    // Step 2: Apply tone adjustments
    const adjustedPalette = brand.tone 
      ? this.applyToneAdjustments(basePalette, brand.tone)
      : basePalette;
    
    // Step 3: Apply custom brand colors if provided
    const finalPalette = brand.palette && brand.palette.length > 0
      ? this.applyCustomColors(adjustedPalette, brand.palette)
      : adjustedPalette;
    
    // Step 4: Select typography system
    const typography = this.selectTypography(brand.tone, brand.industry);
    
    // Step 5: Generate reasoning
    const reasoning = this.generateReasoning(brand, finalPalette, typography);
    
    // Step 6: Determine mood tags
    const mood = this.determineMood(brand);
    
    return {
      colorPalette: finalPalette,
      typography,
      reasoning,
      mood,
      inspiration: this.getInspiration(brand.industry, brand.tone)
    };
  }
  
  /**
   * Select industry-appropriate palette
   */
  private selectIndustryPalette(industry: string): ColorPalette {
    const palettes = INDUSTRY_PALETTES[industry] || INDUSTRY_PALETTES.saas;
    return palettes[0]; // For now, use first palette. Later can add variety
  }
  
  /**
   * Apply tone-based adjustments to palette
   */
  private applyToneAdjustments(palette: ColorPalette, tone: string): ColorPalette {
    const adjustment = TONE_ADJUSTMENTS[tone];
    if (!adjustment) return palette;
    
    // For now, return palette as-is
    // In production, this would adjust HSL values based on tone
    return {
      ...palette,
      name: `${palette.name} (${tone})`
    };
  }
  
  /**
   * Apply custom brand colors
   */
  private applyCustomColors(palette: ColorPalette, customColors: string[]): ColorPalette {
    return {
      ...palette,
      primary: customColors[0] || palette.primary,
      secondary: customColors[1] || palette.secondary,
      accent: customColors[2] || palette.accent,
      name: `${palette.name} (Custom)`
    };
  }
  
  /**
   * Select typography system based on tone
   */
  private selectTypography(tone?: string, industry?: string): TypographySystem {
    if (tone && TYPOGRAPHY_SYSTEMS[tone]) {
      return TYPOGRAPHY_SYSTEMS[tone][0];
    }
    
    // Fallback to industry-appropriate typography
    if (industry === 'luxury' || industry === 'portfolio') {
      return TYPOGRAPHY_SYSTEMS.elegant[0];
    }
    
    return TYPOGRAPHY_SYSTEMS.professional[0];
  }
  
  /**
   * Generate reasoning for theme choices
   */
  private generateReasoning(
    brand: AIProjectRequest['brand'],
    palette: ColorPalette,
    typography: TypographySystem
  ): string {
    let reasoning = `Selected "${palette.name}" palette for ${brand.industry} industry. `;
    
    if (brand.tone) {
      reasoning += `Applied ${brand.tone} tone with ${typography.fontFamily.heading} for headings. `;
    }
    
    reasoning += `Color scheme features ${palette.primary} as primary with ${palette.secondary} secondary tones.`;
    
    return reasoning;
  }
  
  /**
   * Determine mood tags for the theme
   */
  private determineMood(brand: AIProjectRequest['brand']): string[] {
    const moodTags: string[] = [];
    
    // Add tone as mood
    if (brand.tone) {
      moodTags.push(brand.tone);
    }
    
    // Add industry-specific moods
    const industryMoods: Record<string, string[]> = {
      restaurant: ['inviting', 'appetizing', 'warm'],
      portfolio: ['clean', 'sophisticated', 'artistic'],
      contracting: ['trustworthy', 'solid', 'professional'],
      creator: ['vibrant', 'expressive', 'dynamic'],
      ad_campaign: ['bold', 'attention-grabbing', 'impactful'],
      saas: ['modern', 'innovative', 'scalable'],
      ecommerce: ['trustworthy', 'clean', 'conversion-focused'],
      agency: ['creative', 'bold', 'professional']
    };
    
    const industryMoodSet = industryMoods[brand.industry] || [];
    moodTags.push(...industryMoodSet.slice(0, 2));
    
    return moodTags;
  }
  
  /**
   * Get design inspiration references
   */
  private getInspiration(industry?: string, tone?: string): string[] {
    const inspirations: string[] = [];
    
    if (industry) {
      const industryInspo: Record<string, string[]> = {
        restaurant: ['Eleven Madison Park', 'Noma'],
        portfolio: ['Awwwards winners', 'Behance featured'],
        contracting: ['Modern construction firms'],
        creator: ['YouTube channels', 'Patreon creators'],
        saas: ['Stripe', 'Linear', 'Vercel'],
        ecommerce: ['Shopify stores', 'Allbirds'],
        agency: ['Pentagram', 'IDEO']
      };
      
      inspirations.push(...(industryInspo[industry] || []));
    }
    
    return inspirations;
  }
}

// Export singleton instance
export const themeSynthesisService = new ThemeSynthesisService();
