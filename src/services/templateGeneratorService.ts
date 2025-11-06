import type { AIGeneratedTemplate, TemplateSection, TemplateComponent, TemplateVariant, TemplateBrandKit } from '@/types/template';

export interface TemplateGeneratorOptions {
  name: string;
  aesthetic: string;
  source: 'Google' | 'Canva';
  templateType: string;
}

/**
 * Template Generator Service
 * Creates AIGeneratedTemplate objects that can be rendered to canvas
 * Similar to AI generation but with predefined template structures
 */
export class TemplateGeneratorService {
  
  /**
   * Generate a template based on the source and type
   */
  static generateTemplate(options: TemplateGeneratorOptions): AIGeneratedTemplate {
    const { name, aesthetic, source, templateType } = options;
    
    const baseTemplate: Partial<AIGeneratedTemplate> = {
      id: `${source.toLowerCase()}-${Date.now()}`,
      name,
      description: `${source} template: ${aesthetic}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: {},
    };

    if (source === 'Google') {
      return this.generateGoogleTemplate(templateType, baseTemplate);
    } else if (source === 'Canva') {
      return this.generateCanvaTemplate(templateType, baseTemplate);
    }
    
    throw new Error(`Unsupported template source: ${source}`);
  }

  /**
   * Generate Google Material Design templates
   */
  private static generateGoogleTemplate(
    templateType: string, 
    baseTemplate: Partial<AIGeneratedTemplate>
  ): AIGeneratedTemplate {
    
    const googleBrandKit: TemplateBrandKit = {
      primaryColor: '#1976D2',
      secondaryColor: '#424242',
      accentColor: '#FF5722',
      fonts: {
        heading: 'Roboto',
        body: 'Roboto',
        accent: 'Roboto Mono'
      }
    };

    const variants: TemplateVariant[] = [
      {
        id: 'desktop',
        name: 'Desktop',
        size: { width: 1200, height: 800 },
        format: 'web'
      }
    ];

    let sections: TemplateSection[] = [];

    switch (templateType) {
      case 'Material Design Dashboard':
        sections = this.createMaterialDashboard();
        break;
      case 'Google Workspace UI':
        sections = this.createWorkspaceUI();
        break;
      case 'Android App Interface':
        sections = this.createAndroidInterface();
        break;
      default:
        sections = this.createMaterialDashboard();
    }

    return {
      ...baseTemplate,
      brandKit: googleBrandKit,
      sections,
      variants,
    } as AIGeneratedTemplate;
  }

  /**
   * Generate Canva-style templates
   */
  private static generateCanvaTemplate(
    templateType: string,
    baseTemplate: Partial<AIGeneratedTemplate>
  ): AIGeneratedTemplate {
    
    const canvaBrandKit: TemplateBrandKit = {
      primaryColor: '#7B68EE',
      secondaryColor: '#FF6B6B',
      accentColor: '#4ECDC4',
      fonts: {
        heading: 'Poppins',
        body: 'Inter',
        accent: 'Playfair Display'
      }
    };

    const variants: TemplateVariant[] = [
      {
        id: 'desktop',
        name: 'Desktop',
        size: { width: 1200, height: 800 },
        format: 'web'
      }
    ];

    let sections: TemplateSection[] = [];

    switch (templateType) {
      case 'Creative Portfolio':
        sections = this.createCreativePortfolio();
        break;
      case 'E-commerce Store':
        sections = this.createEcommerceStore();
        break;
      case 'Landing Page Pro':
        sections = this.createLandingPagePro();
        break;
      default:
        sections = this.createCreativePortfolio();
    }

    return {
      ...baseTemplate,
      brandKit: canvaBrandKit,
      sections,
      variants,
    } as AIGeneratedTemplate;
  }

  /**
   * Material Design Dashboard Template
   */
  private static createMaterialDashboard(): TemplateSection[] {
    return [
      {
        id: 'header',
        name: 'Material Header',
        type: 'hero',
        constraints: {
          width: { mode: 'fill' },
          height: { mode: 'fixed', value: 80 },
          padding: { top: 16, right: 24, bottom: 16, left: 24 },
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        },
        components: [
          {
            id: 'logo',
            type: 'text',
            name: 'App Logo',
            constraints: {
              width: { mode: 'hug' },
              height: { mode: 'hug' }
            },
            style: {
              backgroundColor: 'transparent'
            },
            fabricProps: {
              text: 'Material UI',
              fontSize: 24,
              fontFamily: 'Roboto',
              fill: '#FFFFFF',
              fontWeight: 500
            }
          },
          {
            id: 'nav-container',
            type: 'container',
            name: 'Navigation',
            constraints: {
              width: { mode: 'hug' },
              height: { mode: 'hug' },
              gap: 24,
              flexDirection: 'row',
              alignItems: 'center'
            },
            style: {
              backgroundColor: 'transparent'
            },
            children: [
              {
                id: 'nav-dashboard',
                type: 'button',
                name: 'Dashboard',
                constraints: {
                  width: { mode: 'hug' },
                  height: { mode: 'fixed', value: 36 },
                  padding: { top: 8, right: 16, bottom: 8, left: 16 }
                },
                style: {
                  backgroundColor: '#1976D2',
                  borderRadius: 4
                },
                fabricProps: {
                  text: 'Dashboard',
                  fontSize: 14,
                  fontFamily: 'Roboto',
                  fill: '#FFFFFF'
                }
              },
              {
                id: 'nav-analytics',
                type: 'button',
                name: 'Analytics',
                constraints: {
                  width: { mode: 'hug' },
                  height: { mode: 'fixed', value: 36 },
                  padding: { top: 8, right: 16, bottom: 8, left: 16 }
                },
                style: {
                  backgroundColor: 'transparent',
                  borderRadius: 4
                },
                fabricProps: {
                  text: 'Analytics',
                  fontSize: 14,
                  fontFamily: 'Roboto',
                  fill: '#FFFFFF'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'main-content',
        name: 'Dashboard Content',
        type: 'content',
        constraints: {
          width: { mode: 'fill' },
          height: { mode: 'fill' },
          padding: { top: 24, right: 24, bottom: 24, left: 24 },
          gap: 24,
          flexDirection: 'column'
        },
        components: [
          {
            id: 'title',
            type: 'text',
            name: 'Page Title',
            constraints: {
              width: { mode: 'fill' },
              height: { mode: 'hug' }
            },
            style: {
              backgroundColor: 'transparent'
            },
            fabricProps: {
              text: 'Dashboard Overview',
              fontSize: 32,
              fontFamily: 'Roboto',
              fill: '#212121',
              fontWeight: 400
            }
          },
          {
            id: 'cards-container',
            type: 'container',
            name: 'Metric Cards',
            constraints: {
              width: { mode: 'fill' },
              height: { mode: 'hug' },
              gap: 16,
              flexDirection: 'row'
            },
            style: {
              backgroundColor: 'transparent'
            },
            children: [
              {
                id: 'card-1',
                type: 'container',
                name: 'Revenue Card',
                constraints: {
                  width: { mode: 'fill' },
                  height: { mode: 'fixed', value: 120 },
                  padding: { top: 20, right: 20, bottom: 20, left: 20 }
                },
                style: {
                  backgroundColor: '#FFFFFF',
                  borderRadius: 8
                },
                children: [
                  {
                    id: 'card-1-title',
                    type: 'text',
                    name: 'Card Title',
                    constraints: {
                      width: { mode: 'fill' },
                      height: { mode: 'hug' }
                    },
                    style: {
                      backgroundColor: 'transparent'
                    },
                    fabricProps: {
                      text: 'Total Revenue',
                      fontSize: 14,
                      fontFamily: 'Roboto',
                      fill: '#757575'
                    }
                  },
                  {
                    id: 'card-1-value',
                    type: 'text',
                    name: 'Card Value',
                    constraints: {
                      width: { mode: 'fill' },
                      height: { mode: 'hug' }
                    },
                    style: {
                      backgroundColor: 'transparent'
                    },
                    fabricProps: {
                      text: '$24,500',
                      fontSize: 28,
                      fontFamily: 'Roboto',
                      fill: '#1976D2',
                      fontWeight: 500
                    }
                  }
                ]
              },
              {
                id: 'card-2',
                type: 'container',
                name: 'Users Card',
                constraints: {
                  width: { mode: 'fill' },
                  height: { mode: 'fixed', value: 120 },
                  padding: { top: 20, right: 20, bottom: 20, left: 20 }
                },
                style: {
                  backgroundColor: '#FFFFFF',
                  borderRadius: 8
                },
                children: [
                  {
                    id: 'card-2-title',
                    type: 'text',
                    name: 'Card Title',
                    constraints: {
                      width: { mode: 'fill' },
                      height: { mode: 'hug' }
                    },
                    style: {
                      backgroundColor: 'transparent'
                    },
                    fabricProps: {
                      text: 'Active Users',
                      fontSize: 14,
                      fontFamily: 'Roboto',
                      fill: '#757575'
                    }
                  },
                  {
                    id: 'card-2-value',
                    type: 'text',
                    name: 'Card Value',
                    constraints: {
                      width: { mode: 'fill' },
                      height: { mode: 'hug' }
                    },
                    style: {
                      backgroundColor: 'transparent'
                    },
                    fabricProps: {
                      text: '1,247',
                      fontSize: 28,
                      fontFamily: 'Roboto',
                      fill: '#4CAF50',
                      fontWeight: 500
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  /**
   * Google Workspace UI Template
   */
  private static createWorkspaceUI(): TemplateSection[] {
    return [
      {
        id: 'workspace-header',
        name: 'Workspace Header',
        type: 'hero',
        constraints: {
          width: { mode: 'fill' },
          height: { mode: 'fixed', value: 64 },
          padding: { top: 12, right: 20, bottom: 12, left: 20 },
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        },
        components: [
          {
            id: 'workspace-logo',
            type: 'text',
            name: 'Workspace Logo',
            constraints: {
              width: { mode: 'hug' },
              height: { mode: 'hug' }
            },
            style: {
              backgroundColor: 'transparent'
            },
            fabricProps: {
              text: 'Workspace',
              fontSize: 20,
              fontFamily: 'Roboto',
              fill: '#5F6368',
              fontWeight: 400
            }
          },
          {
            id: 'workspace-apps',
            type: 'container',
            name: 'App Grid',
            constraints: {
              width: { mode: 'hug' },
              height: { mode: 'hug' },
              gap: 16,
              flexDirection: 'row',
              alignItems: 'center'
            },
            style: {
              backgroundColor: 'transparent'
            },
            children: [
              {
                id: 'app-docs',
                type: 'button',
                name: 'Docs',
                constraints: {
                  width: { mode: 'fixed', value: 40 },
                  height: { mode: 'fixed', value: 40 }
                },
                style: {
                  backgroundColor: '#4285F4',
                  borderRadius: 8
                },
                fabricProps: {
                  text: 'D',
                  fontSize: 16,
                  fontFamily: 'Roboto',
                  fill: '#FFFFFF',
                  fontWeight: 500
                }
              },
              {
                id: 'app-sheets',
                type: 'button',
                name: 'Sheets',
                constraints: {
                  width: { mode: 'fixed', value: 40 },
                  height: { mode: 'fixed', value: 40 }
                },
                style: {
                  backgroundColor: '#34A853',
                  borderRadius: 8
                },
                fabricProps: {
                  text: 'S',
                  fontSize: 16,
                  fontFamily: 'Roboto',
                  fill: '#FFFFFF',
                  fontWeight: 500
                }
              }
            ]
          }
        ]
      },
      {
        id: 'workspace-content',
        name: 'Document Area',
        type: 'content',
        constraints: {
          width: { mode: 'fill' },
          height: { mode: 'fill' },
          padding: { top: 32, right: 48, bottom: 32, left: 48 }
        },
        components: [
          {
            id: 'document-title',
            type: 'text',
            name: 'Document Title',
            constraints: {
              width: { mode: 'fill' },
              height: { mode: 'hug' }
            },
            style: {
              backgroundColor: 'transparent'
            },
            fabricProps: {
              text: 'Untitled document',
              fontSize: 24,
              fontFamily: 'Roboto',
              fill: '#3C4043',
              fontWeight: 400
            }
          },
          {
            id: 'document-content',
            type: 'text',
            name: 'Document Content',
            constraints: {
              width: { mode: 'fill' },
              height: { mode: 'fill' },
              padding: { top: 24, right: 0, bottom: 0, left: 0 }
            },
            style: {
              backgroundColor: 'transparent'
            },
            fabricProps: {
              text: 'Start typing to add content to your document. Use the toolbar above to format your text and add elements.',
              fontSize: 16,
              fontFamily: 'Roboto',
              fill: '#5F6368',
              fontWeight: 400
            }
          }
        ]
      }
    ];
  }

  /**
   * Android App Interface Template
   */
  private static createAndroidInterface(): TemplateSection[] {
    return [
      {
        id: 'android-header',
        name: 'App Bar',
        type: 'hero',
        constraints: {
          width: { mode: 'fill' },
          height: { mode: 'fixed', value: 56 },
          padding: { top: 16, right: 16, bottom: 16, left: 16 },
          flexDirection: 'row',
          alignItems: 'center'
        },
        components: [
          {
            id: 'app-title',
            type: 'text',
            name: 'App Title',
            constraints: {
              width: { mode: 'hug' },
              height: { mode: 'hug' }
            },
            style: {
              backgroundColor: 'transparent'
            },
            fabricProps: {
              text: 'My App',
              fontSize: 20,
              fontFamily: 'Roboto',
              fill: '#FFFFFF',
              fontWeight: 500
            }
          }
        ]
      },
      {
        id: 'android-content',
        name: 'App Content',
        type: 'content',
        constraints: {
          width: { mode: 'fill' },
          height: { mode: 'fill' },
          padding: { top: 16, right: 16, bottom: 16, left: 16 },
          gap: 16,
          flexDirection: 'column'
        },
        components: [
          {
            id: 'fab',
            type: 'button',
            name: 'Floating Action Button',
            constraints: {
              width: { mode: 'fixed', value: 56 },
              height: { mode: 'fixed', value: 56 }
            },
            style: {
              backgroundColor: '#FF5722',
              borderRadius: 28
            },
            fabricProps: {
              text: '+',
              fontSize: 24,
              fontFamily: 'Roboto',
              fill: '#FFFFFF',
              fontWeight: 400
            }
          },
          {
            id: 'list-item',
            type: 'container',
            name: 'List Item',
            constraints: {
              width: { mode: 'fill' },
              height: { mode: 'fixed', value: 72 },
              padding: { top: 16, right: 16, bottom: 16, left: 16 },
              flexDirection: 'row',
              alignItems: 'center'
            },
            style: {
              backgroundColor: '#FFFFFF',
              borderRadius: 4
            },
            children: [
              {
                id: 'list-avatar',
                type: 'shape',
                name: 'Avatar',
                constraints: {
                  width: { mode: 'fixed', value: 40 },
                  height: { mode: 'fixed', value: 40 }
                },
                style: {
                  backgroundColor: '#E0E0E0',
                  borderRadius: 20
                }
              },
              {
                id: 'list-text',
                type: 'text',
                name: 'List Text',
                constraints: {
                  width: { mode: 'fill' },
                  height: { mode: 'hug' },
                  padding: { top: 0, right: 0, bottom: 0, left: 16 }
                },
                style: {
                  backgroundColor: 'transparent'
                },
                fabricProps: {
                  text: 'List item with supporting text',
                  fontSize: 16,
                  fontFamily: 'Roboto',
                  fill: '#212121'
                }
              }
            ]
          }
        ]
      }
    ];
  }

  /**
   * Creative Portfolio Template (Canva Style)
   */
  private static createCreativePortfolio(): TemplateSection[] {
    return [
      {
        id: 'portfolio-hero',
        name: 'Creative Hero',
        type: 'hero',
        constraints: {
          width: { mode: 'fill' },
          height: { mode: 'fixed', value: 400 },
          padding: { top: 40, right: 40, bottom: 40, left: 40 },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        },
        components: [
          {
            id: 'hero-title',
            type: 'text',
            name: 'Creative Title',
            constraints: {
              width: { mode: 'hug' },
              height: { mode: 'hug' }
            },
            style: {
              backgroundColor: 'transparent'
            },
            fabricProps: {
              text: 'Creative Designer',
              fontSize: 48,
              fontFamily: 'Playfair Display',
              fill: '#2D1B69',
              fontWeight: 700
            }
          },
          {
            id: 'hero-subtitle',
            type: 'text',
            name: 'Creative Subtitle',
            constraints: {
              width: { mode: 'hug' },
              height: { mode: 'hug' },
              padding: { top: 16, right: 0, bottom: 0, left: 0 }
            },
            style: {
              backgroundColor: 'transparent'
            },
            fabricProps: {
              text: 'Bringing ideas to life through design',
              fontSize: 18,
              fontFamily: 'Inter',
              fill: '#7B68EE',
              fontWeight: 400
            }
          },
          {
            id: 'hero-cta',
            type: 'button',
            name: 'Portfolio CTA',
            constraints: {
              width: { mode: 'hug' },
              height: { mode: 'fixed', value: 48 },
              padding: { top: 12, right: 32, bottom: 12, left: 32 },
              margin: { top: 32, right: 0, bottom: 0, left: 0 }
            },
            style: {
              backgroundColor: '#FF6B6B',
              borderRadius: 24
            },
            fabricProps: {
              text: 'View Portfolio',
              fontSize: 16,
              fontFamily: 'Poppins',
              fill: '#FFFFFF',
              fontWeight: 600
            }
          }
        ]
      },
      {
        id: 'portfolio-gallery',
        name: 'Project Gallery',
        type: 'gallery',
        constraints: {
          width: { mode: 'fill' },
          height: { mode: 'hug' },
          padding: { top: 40, right: 40, bottom: 40, left: 40 },
          gap: 24,
          flexDirection: 'column'
        },
        components: [
          {
            id: 'gallery-title',
            type: 'text',
            name: 'Gallery Title',
            constraints: {
              width: { mode: 'fill' },
              height: { mode: 'hug' }
            },
            style: {
              backgroundColor: 'transparent'
            },
            fabricProps: {
              text: 'Featured Projects',
              fontSize: 32,
              fontFamily: 'Poppins',
              fill: '#2D1B69',
              fontWeight: 600
            }
          },
          {
            id: 'project-grid',
            type: 'container',
            name: 'Project Grid',
            constraints: {
              width: { mode: 'fill' },
              height: { mode: 'hug' },
              gap: 20,
              flexDirection: 'row'
            },
            style: {
              backgroundColor: 'transparent'
            },
            children: [
              {
                id: 'project-1',
                type: 'container',
                name: 'Project Card 1',
                constraints: {
                  width: { mode: 'fill' },
                  height: { mode: 'fixed', value: 240 }
                },
                style: {
                  backgroundColor: '#F8F9FA',
                  borderRadius: 16
                },
                children: [
                  {
                    id: 'project-1-title',
                    type: 'text',
                    name: 'Project Title',
                    constraints: {
                      width: { mode: 'fill' },
                      height: { mode: 'hug' },
                      padding: { top: 20, right: 20, bottom: 0, left: 20 }
                    },
                    style: {
                      backgroundColor: 'transparent'
                    },
                    fabricProps: {
                      text: 'Brand Identity',
                      fontSize: 20,
                      fontFamily: 'Poppins',
                      fill: '#2D1B69',
                      fontWeight: 600
                    }
                  }
                ]
              },
              {
                id: 'project-2',
                type: 'container',
                name: 'Project Card 2',
                constraints: {
                  width: { mode: 'fill' },
                  height: { mode: 'fixed', value: 240 }
                },
                style: {
                  backgroundColor: '#F8F9FA',
                  borderRadius: 16
                },
                children: [
                  {
                    id: 'project-2-title',
                    type: 'text',
                    name: 'Project Title',
                    constraints: {
                      width: { mode: 'fill' },
                      height: { mode: 'hug' },
                      padding: { top: 20, right: 20, bottom: 0, left: 20 }
                    },
                    style: {
                      backgroundColor: 'transparent'
                    },
                    fabricProps: {
                      text: 'Web Design',
                      fontSize: 20,
                      fontFamily: 'Poppins',
                      fill: '#2D1B69',
                      fontWeight: 600
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  /**
   * E-commerce Store Template (Canva Style)
   */
  private static createEcommerceStore(): TemplateSection[] {
    return [
      {
        id: 'ecommerce-header',
        name: 'Store Header',
        type: 'hero',
        constraints: {
          width: { mode: 'fill' },
          height: { mode: 'fixed', value: 80 },
          padding: { top: 20, right: 40, bottom: 20, left: 40 },
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        },
        components: [
          {
            id: 'store-logo',
            type: 'text',
            name: 'Store Logo',
            constraints: {
              width: { mode: 'hug' },
              height: { mode: 'hug' }
            },
            style: {
              backgroundColor: 'transparent'
            },
            fabricProps: {
              text: 'STORE',
              fontSize: 24,
              fontFamily: 'Poppins',
              fill: '#2D1B69',
              fontWeight: 700
            }
          },
          {
            id: 'nav-menu',
            type: 'container',
            name: 'Navigation Menu',
            constraints: {
              width: { mode: 'hug' },
              height: { mode: 'hug' },
              gap: 32,
              flexDirection: 'row',
              alignItems: 'center'
            },
            style: {
              backgroundColor: 'transparent'
            },
            children: [
              {
                id: 'nav-shop',
                type: 'text',
                name: 'Shop Link',
                constraints: {
                  width: { mode: 'hug' },
                  height: { mode: 'hug' }
                },
                style: {
                  backgroundColor: 'transparent'
                },
                fabricProps: {
                  text: 'Shop',
                  fontSize: 16,
                  fontFamily: 'Inter',
                  fill: '#666666'
                }
              },
              {
                id: 'nav-about',
                type: 'text',
                name: 'About Link',
                constraints: {
                  width: { mode: 'hug' },
                  height: { mode: 'hug' }
                },
                style: {
                  backgroundColor: 'transparent'
                },
                fabricProps: {
                  text: 'About',
                  fontSize: 16,
                  fontFamily: 'Inter',
                  fill: '#666666'
                }
              },
              {
                id: 'cart-button',
                type: 'button',
                name: 'Cart Button',
                constraints: {
                  width: { mode: 'fixed', value: 40 },
                  height: { mode: 'fixed', value: 40 }
                },
                style: {
                  backgroundColor: '#4ECDC4',
                  borderRadius: 20
                },
                fabricProps: {
                  text: '🛒',
                  fontSize: 16,
                  fontFamily: 'Inter',
                  fill: '#FFFFFF'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'product-showcase',
        name: 'Product Showcase',
        type: 'content',
        constraints: {
          width: { mode: 'fill' },
          height: { mode: 'hug' },
          padding: { top: 40, right: 40, bottom: 40, left: 40 },
          gap: 32,
          flexDirection: 'column'
        },
        components: [
          {
            id: 'hero-product',
            type: 'container',
            name: 'Hero Product',
            constraints: {
              width: { mode: 'fill' },
              height: { mode: 'fixed', value: 300 },
              padding: { top: 40, right: 40, bottom: 40, left: 40 },
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            },
            style: {
              backgroundColor: '#F8F9FA',
              borderRadius: 20
            },
            children: [
              {
                id: 'product-info',
                type: 'container',
                name: 'Product Info',
                constraints: {
                  width: { mode: 'fill' },
                  height: { mode: 'hug' },
                  gap: 16,
                  flexDirection: 'column'
                },
                style: {
                  backgroundColor: 'transparent'
                },
                children: [
                  {
                    id: 'product-title',
                    type: 'text',
                    name: 'Product Title',
                    constraints: {
                      width: { mode: 'fill' },
                      height: { mode: 'hug' }
                    },
                    style: {
                      backgroundColor: 'transparent'
                    },
                    fabricProps: {
                      text: 'Premium Collection',
                      fontSize: 36,
                      fontFamily: 'Poppins',
                      fill: '#2D1B69',
                      fontWeight: 700
                    }
                  },
                  {
                    id: 'product-price',
                    type: 'text',
                    name: 'Product Price',
                    constraints: {
                      width: { mode: 'hug' },
                      height: { mode: 'hug' }
                    },
                    style: {
                      backgroundColor: 'transparent'
                    },
                    fabricProps: {
                      text: '$299',
                      fontSize: 24,
                      fontFamily: 'Poppins',
                      fill: '#FF6B6B',
                      fontWeight: 600
                    }
                  },
                  {
                    id: 'buy-button',
                    type: 'button',
                    name: 'Buy Button',
                    constraints: {
                      width: { mode: 'hug' },
                      height: { mode: 'fixed', value: 48 },
                      padding: { top: 12, right: 32, bottom: 12, left: 32 }
                    },
                    style: {
                      backgroundColor: '#4ECDC4',
                      borderRadius: 24
                    },
                    fabricProps: {
                      text: 'Shop Now',
                      fontSize: 16,
                      fontFamily: 'Poppins',
                      fill: '#FFFFFF',
                      fontWeight: 600
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  /**
   * Landing Page Pro Template (Canva Style)
   */
  private static createLandingPagePro(): TemplateSection[] {
    return [
      {
        id: 'landing-hero',
        name: 'Landing Hero',
        type: 'hero',
        constraints: {
          width: { mode: 'fill' },
          height: { mode: 'fixed', value: 500 },
          padding: { top: 60, right: 40, bottom: 60, left: 40 },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        },
        components: [
          {
            id: 'hero-headline',
            type: 'text',
            name: 'Hero Headline',
            constraints: {
              width: { mode: 'hug' },
              height: { mode: 'hug' }
            },
            style: {
              backgroundColor: 'transparent'
            },
            fabricProps: {
              text: 'Transform Your Business',
              fontSize: 56,
              fontFamily: 'Poppins',
              fill: '#2D1B69',
              fontWeight: 800
            }
          },
          {
            id: 'hero-subheadline',
            type: 'text',
            name: 'Hero Subheadline',
            constraints: {
              width: { mode: 'hug' },
              height: { mode: 'hug' },
              padding: { top: 20, right: 0, bottom: 0, left: 0 }
            },
            style: {
              backgroundColor: 'transparent'
            },
            fabricProps: {
              text: 'Get the tools you need to succeed in today\'s market',
              fontSize: 20,
              fontFamily: 'Inter',
              fill: '#666666',
              fontWeight: 400
            }
          },
          {
            id: 'cta-primary',
            type: 'button',
            name: 'Primary CTA',
            constraints: {
              width: { mode: 'hug' },
              height: { mode: 'fixed', value: 56 },
              padding: { top: 16, right: 40, bottom: 16, left: 40 },
              margin: { top: 40, right: 0, bottom: 0, left: 0 }
            },
            style: {
              backgroundColor: '#FF6B6B',
              borderRadius: 28
            },
            fabricProps: {
              text: 'Get Started Free',
              fontSize: 18,
              fontFamily: 'Poppins',
              fill: '#FFFFFF',
              fontWeight: 600
            }
          }
        ]
      },
      {
        id: 'features-section',
        name: 'Features Section',
        type: 'content',
        constraints: {
          width: { mode: 'fill' },
          height: { mode: 'hug' },
          padding: { top: 60, right: 40, bottom: 60, left: 40 },
          gap: 40,
          flexDirection: 'column'
        },
        components: [
          {
            id: 'features-title',
            type: 'text',
            name: 'Features Title',
            constraints: {
              width: { mode: 'fill' },
              height: { mode: 'hug' }
            },
            style: {
              backgroundColor: 'transparent'
            },
            fabricProps: {
              text: 'Everything You Need',
              fontSize: 40,
              fontFamily: 'Poppins',
              fill: '#2D1B69',
              fontWeight: 700
            }
          },
          {
            id: 'features-grid',
            type: 'container',
            name: 'Features Grid',
            constraints: {
              width: { mode: 'fill' },
              height: { mode: 'hug' },
              gap: 24,
              flexDirection: 'row'
            },
            style: {
              backgroundColor: 'transparent'
            },
            children: [
              {
                id: 'feature-1',
                type: 'container',
                name: 'Feature 1',
                constraints: {
                  width: { mode: 'fill' },
                  height: { mode: 'fixed', value: 200 },
                  padding: { top: 30, right: 30, bottom: 30, left: 30 },
                  flexDirection: 'column',
                  alignItems: 'center'
                },
                style: {
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16
                },
                children: [
                  {
                    id: 'feature-1-icon',
                    type: 'text',
                    name: 'Feature Icon',
                    constraints: {
                      width: { mode: 'hug' },
                      height: { mode: 'hug' }
                    },
                    style: {
                      backgroundColor: 'transparent'
                    },
                    fabricProps: {
                      text: '⚡',
                      fontSize: 32,
                      fontFamily: 'Inter'
                    }
                  },
                  {
                    id: 'feature-1-title',
                    type: 'text',
                    name: 'Feature Title',
                    constraints: {
                      width: { mode: 'fill' },
                      height: { mode: 'hug' },
                      padding: { top: 16, right: 0, bottom: 0, left: 0 }
                    },
                    style: {
                      backgroundColor: 'transparent'
                    },
                    fabricProps: {
                      text: 'Lightning Fast',
                      fontSize: 18,
                      fontFamily: 'Poppins',
                      fill: '#2D1B69',
                      fontWeight: 600
                    }
                  }
                ]
              },
              {
                id: 'feature-2',
                type: 'container',
                name: 'Feature 2',
                constraints: {
                  width: { mode: 'fill' },
                  height: { mode: 'fixed', value: 200 },
                  padding: { top: 30, right: 30, bottom: 30, left: 30 },
                  flexDirection: 'column',
                  alignItems: 'center'
                },
                style: {
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16
                },
                children: [
                  {
                    id: 'feature-2-icon',
                    type: 'text',
                    name: 'Feature Icon',
                    constraints: {
                      width: { mode: 'hug' },
                      height: { mode: 'hug' }
                    },
                    style: {
                      backgroundColor: 'transparent'
                    },
                    fabricProps: {
                      text: '🔒',
                      fontSize: 32,
                      fontFamily: 'Inter'
                    }
                  },
                  {
                    id: 'feature-2-title',
                    type: 'text',
                    name: 'Feature Title',
                    constraints: {
                      width: { mode: 'fill' },
                      height: { mode: 'hug' },
                      padding: { top: 16, right: 0, bottom: 0, left: 0 }
                    },
                    style: {
                      backgroundColor: 'transparent'
                    },
                    fabricProps: {
                      text: 'Secure & Safe',
                      fontSize: 18,
                      fontFamily: 'Poppins',
                      fill: '#2D1B69',
                      fontWeight: 600
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ];
  }
}