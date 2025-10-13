import { Canvas as FabricCanvas, Rect, Circle, IText, FabricImage } from 'fabric';
import type { AIGeneratedTemplate, TemplateComponent } from '@/types/template';
import { LayoutEngine, type LayoutResult } from './layoutEngine';
import { TemplateValidator } from './templateValidator';
import { AssetPreloader } from './assetPreloader';

/**
 * Pillar 2 & 3: Deterministic Layout + Safe Adapter
 * Renders validated templates with preloaded assets
 */
export class TemplateRenderer {
  private canvas: FabricCanvas;
  private layoutEngine: LayoutEngine;
  private validator: TemplateValidator;
  private preloader: AssetPreloader;
  private preloadedImages: Map<string, HTMLImageElement> = new Map();

  constructor(canvas: FabricCanvas) {
    this.canvas = canvas;
    this.layoutEngine = new LayoutEngine();
    this.validator = new TemplateValidator();
    this.preloader = new AssetPreloader();
  }

  /**
   * Render AI-generated template to Fabric canvas
   * Implements all 5 pillars of reliable rendering
   */
  async renderTemplate(template: any, data?: Record<string, any>) {
    try {
      // Pillar 1: Validate and normalize template
      const validatedTemplate = this.validator.validateTemplate(template);
      console.log('[TemplateRenderer] Template validated:', validatedTemplate);

      // Pillar 4: Preload assets
      const assets = this.preloader.extractAssetUrls(validatedTemplate);
      console.log('[TemplateRenderer] Preloading assets:', assets);
      
      await this.preloader.preloadFonts(assets.fonts);
      this.preloadedImages = await this.preloader.preloadImages(assets.images, (loaded, total) => {
        console.log(`[TemplateRenderer] Loading images: ${loaded}/${total}`);
      });

      // Merge data with defaults
      const mergedData = { ...validatedTemplate.data, ...data };
      
      // Clear canvas
      this.canvas.clear();

      // Set canvas size based on first variant (guaranteed to exist after validation)
      const variant = validatedTemplate.variants[0];
      this.canvas.setWidth(variant.size.width);
      this.canvas.setHeight(variant.size.height);
      this.canvas.backgroundColor = '#ffffff';

      // Pillar 2: Deterministic layout pass
      let currentY = 0;
      for (const section of validatedTemplate.sections) {
        // Calculate layout
        const layout = this.layoutEngine.applyLayout(section);
        console.log(`[TemplateRenderer] Section "${section.name}" layout:`, layout);
        
        // Pillar 3: Safe adapter - render with error isolation
        await this.renderSection(section, layout, mergedData, 0, currentY);
        
        currentY += layout.height;
      }

      this.canvas.renderAll();
      console.log('[TemplateRenderer] Rendering complete');
      
    } catch (error) {
      // Pillar 5: Error isolation
      console.error('[TemplateRenderer] Render failed:', error);
      this.renderErrorState(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private async renderSection(
    section: any,
    layout: LayoutResult,
    data: Record<string, any>,
    offsetX: number,
    offsetY: number
  ) {
    for (const component of section.components) {
      const componentLayout = layout.components.find((l) => l.id === component.id);
      if (!componentLayout) continue;

      const x = offsetX + componentLayout.x;
      const y = offsetY + componentLayout.y;

      await this.renderComponent(component, data, x, y, componentLayout.width, componentLayout.height);
    }
  }

  private async renderComponent(
    component: TemplateComponent,
    data: Record<string, any>,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    // Get data value if bound
    let value = component.dataBinding?.defaultValue || '';
    if (component.dataBinding && data[component.dataBinding.field] !== undefined) {
      value = data[component.dataBinding.field];
    }

    switch (component.type) {
      case 'shape': {
        const shape = new Rect({
          left: x,
          top: y,
          width,
          height,
          fill: component.style.backgroundColor || '#cccccc',
          rx: component.style.borderRadius || 0,
          ry: component.style.borderRadius || 0,
          opacity: component.style.opacity ?? 1,
          selectable: true, // Make fully editable
          hasControls: true, // Show resize controls
          hasBorders: true, // Show selection borders
          lockScalingFlip: false, // Allow flipping
          ...component.fabricProps,
        });
        shape.set('name', component.name); // Add name for identification
        this.canvas.add(shape);
        break;
      }

      case 'text': {
        const text = new IText(String(value), {
          left: x,
          top: y,
          fontSize: component.fabricProps?.fontSize || 16,
          fontFamily: component.fabricProps?.fontFamily || 'Arial',
          fill: component.fabricProps?.fill || '#000000',
          fontWeight: component.fabricProps?.fontWeight || 'normal',
          opacity: component.style.opacity ?? 1,
          selectable: true, // Make fully editable
          editable: true, // Allow text editing
          hasControls: true, // Show resize controls
          hasBorders: true, // Show selection borders
          ...component.fabricProps,
        });
        text.set('name', component.name); // Add name for identification
        this.canvas.add(text);
        break;
      }

      case 'image': {
        if (value && typeof value === 'string') {
          try {
            const img = await FabricImage.fromURL(value);
            img.set({
              left: x,
              top: y,
              scaleX: width / (img.width || 1),
              scaleY: height / (img.height || 1),
              opacity: component.style.opacity ?? 1,
              selectable: true, // Make fully editable
              hasControls: true, // Show resize controls
              hasBorders: true, // Show selection borders
              lockScalingFlip: false, // Allow flipping
            });
            img.set('name', component.name); // Add name for identification
            this.canvas.add(img);
          } catch (error) {
            console.error('Error loading image:', error);
          }
        }
        break;
      }

      case 'button': {
        // Render as rectangle + text (both individually editable)
        const button = new Rect({
          left: x,
          top: y,
          width,
          height,
          fill: component.style.backgroundColor || '#007bff',
          rx: component.style.borderRadius || 4,
          ry: component.style.borderRadius || 4,
          opacity: component.style.opacity ?? 1,
          selectable: true, // Make fully editable
          hasControls: true, // Show resize controls
          hasBorders: true, // Show selection borders
        });
        button.set('name', `${component.name} Background`);
        this.canvas.add(button);

        const buttonText = new IText(String(value), {
          left: x + width / 2,
          top: y + height / 2,
          fontSize: component.fabricProps?.fontSize || 16,
          fontFamily: component.fabricProps?.fontFamily || 'Arial',
          fill: component.fabricProps?.fill || '#ffffff',
          originX: 'center',
          originY: 'center',
          selectable: true, // Make text independently editable
          editable: true, // Allow text editing
          hasControls: true,
          hasBorders: true,
        });
        buttonText.set('name', `${component.name} Text`);
        this.canvas.add(buttonText);
        break;
      }

      case 'container': {
        // Containers are just layout containers, render children
        if (component.children) {
          for (const child of component.children) {
            await this.renderComponent(child, data, x, y, width, height);
          }
        }
        break;
      }
    }
  }

  /**
   * Pillar 5: Error isolation - render error state
   */
  private renderErrorState(errorMessage: string): void {
    this.canvas.clear();
    this.canvas.backgroundColor = '#fee2e2';

    const errorText = new IText('Failed to render template', {
      left: this.canvas.width! / 2,
      top: this.canvas.height! / 2 - 20,
      fontSize: 20,
      fontFamily: 'Inter, sans-serif',
      fill: '#991b1b',
      originX: 'center',
      originY: 'center',
      fontWeight: 'bold',
    });
    this.canvas.add(errorText);

    const detailText = new IText(errorMessage, {
      left: this.canvas.width! / 2,
      top: this.canvas.height! / 2 + 20,
      fontSize: 14,
      fontFamily: 'Inter, sans-serif',
      fill: '#7f1d1d',
      originX: 'center',
      originY: 'center',
    });
    this.canvas.add(detailText);

    this.canvas.renderAll();
  }
}
