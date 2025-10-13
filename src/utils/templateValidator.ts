import type { 
  AIGeneratedTemplate, 
  TemplateComponent, 
  TemplateSection,
  LayoutConstraints,
  TemplateBrandKit,
  TemplateVariant 
} from '@/types/template';

/**
 * Pillar 1: Strict JSON Contract & Validation
 * Validates and normalizes AI-generated templates before rendering
 */
export class TemplateValidator {
  
  /**
   * Validate and auto-fix template structure
   */
  validateTemplate(template: any): AIGeneratedTemplate {
    if (!template || typeof template !== 'object') {
      throw new Error('Invalid template: must be an object');
    }

    return {
      id: this.validateString(template.id, 'template-' + Date.now()),
      name: this.validateString(template.name, 'Untitled Template'),
      description: this.validateString(template.description, ''),
      industry: this.validateString(template.industry),
      brandKit: this.validateBrandKit(template.brandKit),
      sections: this.validateSections(template.sections),
      variants: this.validateVariants(template.variants),
      data: this.validateObject(template.data, {}),
      createdAt: this.validateString(template.createdAt, new Date().toISOString()),
      updatedAt: this.validateString(template.updatedAt, new Date().toISOString()),
    };
  }

  private validateString(value: any, defaultValue: string = ''): string {
    return typeof value === 'string' ? value : defaultValue;
  }

  private validateNumber(value: any, defaultValue: number): number {
    const num = Number(value);
    return !isNaN(num) ? num : defaultValue;
  }

  private validateObject<T>(value: any, defaultValue: T): T {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : defaultValue;
  }

  private validateArray<T>(value: any, defaultValue: T[] = []): T[] {
    return Array.isArray(value) ? value : defaultValue;
  }

  private validateBrandKit(brandKit: any): TemplateBrandKit {
    const defaultBrandKit: TemplateBrandKit = {
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af',
      accentColor: '#06b6d4',
      fonts: {
        heading: 'Inter',
        body: 'Inter',
        accent: 'Inter',
      },
    };

    if (!brandKit || typeof brandKit !== 'object') {
      return defaultBrandKit;
    }

    return {
      primaryColor: this.validateColor(brandKit.primaryColor, defaultBrandKit.primaryColor),
      secondaryColor: this.validateColor(brandKit.secondaryColor, defaultBrandKit.secondaryColor),
      accentColor: this.validateColor(brandKit.accentColor, defaultBrandKit.accentColor),
      fonts: {
        heading: this.validateString(brandKit.fonts?.heading, defaultBrandKit.fonts.heading),
        body: this.validateString(brandKit.fonts?.body, defaultBrandKit.fonts.body),
        accent: this.validateString(brandKit.fonts?.accent, defaultBrandKit.fonts.accent),
      },
      logoUrl: brandKit.logoUrl ? this.validateString(brandKit.logoUrl) : undefined,
    };
  }

  private validateColor(value: any, defaultValue: string): string {
    if (typeof value !== 'string') return defaultValue;
    // Basic color validation (hex, rgb, rgba, hsl)
    const colorRegex = /^(#[0-9A-F]{3,8}|rgb|rgba|hsl|hsla)/i;
    return colorRegex.test(value) ? value : defaultValue;
  }

  private validateVariants(variants: any): TemplateVariant[] {
    const defaultVariant: TemplateVariant = {
      id: 'v1',
      name: 'Default',
      size: { width: 1200, height: 630 },
      format: 'web',
    };

    const validatedVariants = this.validateArray<any>(variants);
    
    if (validatedVariants.length === 0) {
      return [defaultVariant];
    }

    return validatedVariants.map((variant, index) => ({
      id: this.validateString(variant.id, `v${index + 1}`),
      name: this.validateString(variant.name, `Variant ${index + 1}`),
      size: {
        width: this.validateNumber(variant.size?.width, 1200),
        height: this.validateNumber(variant.size?.height, 630),
      },
      format: this.validateFormat(variant.format),
    }));
  }

  private validateFormat(format: any): TemplateVariant['format'] {
    const validFormats: TemplateVariant['format'][] = [
      'web', 'instagram-story', 'instagram-post', 'facebook-post', 
      'twitter', 'presentation', 'email'
    ];
    return validFormats.includes(format) ? format : 'web';
  }

  private validateSections(sections: any): TemplateSection[] {
    const validatedSections = this.validateArray<any>(sections);
    
    if (validatedSections.length === 0) {
      // Return a default section if none provided
      return [{
        id: 'section-1',
        name: 'Default Section',
        type: 'content',
        constraints: this.getDefaultConstraints(),
        components: [],
      }];
    }

    return validatedSections.map((section, index) => ({
      id: this.validateString(section.id, `section-${index + 1}`),
      name: this.validateString(section.name, `Section ${index + 1}`),
      type: this.validateSectionType(section.type),
      constraints: this.validateConstraints(section.constraints),
      components: this.validateComponents(section.components),
    }));
  }

  private validateSectionType(type: any): TemplateSection['type'] {
    const validTypes: TemplateSection['type'][] = [
      'hero', 'content', 'gallery', 'cta', 'footer', 'custom'
    ];
    return validTypes.includes(type) ? type : 'custom';
  }

  private validateConstraints(constraints: any): LayoutConstraints {
    if (!constraints || typeof constraints !== 'object') {
      return this.getDefaultConstraints();
    }

    return {
      width: this.validateDimension(constraints.width, { mode: 'fill' }),
      height: this.validateDimension(constraints.height, { mode: 'hug', value: 200 }),
      padding: this.validateSpacing(constraints.padding),
      margin: this.validateSpacing(constraints.margin),
      gap: constraints.gap !== undefined ? this.validateNumber(constraints.gap, 0) : undefined,
      flexDirection: this.validateFlexDirection(constraints.flexDirection),
      alignItems: this.validateAlignItems(constraints.alignItems),
      justifyContent: this.validateJustifyContent(constraints.justifyContent),
    };
  }

  private getDefaultConstraints(): LayoutConstraints {
    return {
      width: { mode: 'fill' },
      height: { mode: 'hug', value: 200 },
      padding: { top: 20, right: 20, bottom: 20, left: 20 },
      gap: 10,
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
    };
  }

  private validateDimension(dim: any, defaultDim: { mode: string; value?: number }): { mode: any; value?: number } {
    if (!dim || typeof dim !== 'object') return defaultDim;
    
    const validModes = ['fixed', 'hug', 'fill'];
    const mode = validModes.includes(dim.mode) ? dim.mode : defaultDim.mode;
    const value = dim.value !== undefined ? this.validateNumber(dim.value, 100) : defaultDim.value;
    
    return { mode, value };
  }

  private validateSpacing(spacing: any): { top: number; right: number; bottom: number; left: number } | undefined {
    if (!spacing || typeof spacing !== 'object') return undefined;
    
    return {
      top: this.validateNumber(spacing.top, 0),
      right: this.validateNumber(spacing.right, 0),
      bottom: this.validateNumber(spacing.bottom, 0),
      left: this.validateNumber(spacing.left, 0),
    };
  }

  private validateFlexDirection(dir: any): LayoutConstraints['flexDirection'] {
    return dir === 'row' || dir === 'column' ? dir : undefined;
  }

  private validateAlignItems(align: any): LayoutConstraints['alignItems'] {
    const validAligns = ['flex-start', 'center', 'flex-end', 'stretch'];
    return validAligns.includes(align) ? align : undefined;
  }

  private validateJustifyContent(justify: any): LayoutConstraints['justifyContent'] {
    const validJustify = ['flex-start', 'center', 'flex-end', 'space-between', 'space-around'];
    return validJustify.includes(justify) ? justify : undefined;
  }

  private validateComponents(components: any): TemplateComponent[] {
    const validatedComponents = this.validateArray<any>(components);
    return validatedComponents.map((comp, index) => this.validateComponent(comp, index));
  }

  private validateComponent(component: any, index: number): TemplateComponent {
    if (!component || typeof component !== 'object') {
      return this.getDefaultComponent(index);
    }

    return {
      id: this.validateString(component.id, `comp-${index + 1}`),
      type: this.validateComponentType(component.type),
      name: this.validateString(component.name, `Component ${index + 1}`),
      constraints: this.validateConstraints(component.constraints),
      dataBinding: component.dataBinding ? {
        field: this.validateString(component.dataBinding.field, ''),
        type: this.validateBindingType(component.dataBinding.type),
        defaultValue: component.dataBinding.defaultValue,
        format: component.dataBinding.format ? this.validateString(component.dataBinding.format) : undefined,
      } : undefined,
      style: {
        backgroundColor: component.style?.backgroundColor ? 
          this.validateColor(component.style.backgroundColor, '#cccccc') : undefined,
        borderRadius: component.style?.borderRadius !== undefined ? 
          this.validateNumber(component.style.borderRadius, 0) : undefined,
        opacity: component.style?.opacity !== undefined ? 
          Math.max(0, Math.min(1, this.validateNumber(component.style.opacity, 1))) : undefined,
        filters: this.validateArray<string>(component.style?.filters),
      },
      children: component.children ? this.validateComponents(component.children) : undefined,
      fabricProps: this.validateObject(component.fabricProps, {}),
    };
  }

  private getDefaultComponent(index: number): TemplateComponent {
    return {
      id: `comp-${index + 1}`,
      type: 'shape',
      name: `Component ${index + 1}`,
      constraints: {
        width: { mode: 'fixed', value: 100 },
        height: { mode: 'fixed', value: 100 },
      },
      style: {
        backgroundColor: '#cccccc',
      },
    };
  }

  private validateComponentType(type: any): TemplateComponent['type'] {
    const validTypes: TemplateComponent['type'][] = [
      'text', 'image', 'shape', 'container', 'button', 'video'
    ];
    return validTypes.includes(type) ? type : 'shape';
  }

  private validateBindingType(type: any): 'text' | 'image' | 'number' | 'color' | 'url' {
    const validTypes = ['text', 'image', 'number', 'color', 'url'];
    return validTypes.includes(type) ? type : 'text';
  }
}
