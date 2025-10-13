/**
 * Canvas Code Runner
 * Executes AI-generated code and renders it to Fabric.js canvas
 */

import { Canvas as FabricCanvas, Rect, Circle, IText, Textbox, Polygon, FabricImage } from 'fabric';

export interface CanvasRenderContext {
  canvas: FabricCanvas;
  addRect: (config: any) => void;
  addCircle: (config: any) => void;
  addText: (config: any) => void;
  addPolygon: (points: any[], config: any) => void;
  addImage: (url: string, config: any) => Promise<void>;
  clearCanvas: () => void;
  setBackground: (color: string) => void;
}

/**
 * Create a safe execution context with canvas API
 */
export function createCanvasContext(canvas: FabricCanvas): CanvasRenderContext {
  return {
    canvas,
    
    addRect: (config: any) => {
      const rect = new Rect({
        left: config.x || 100,
        top: config.y || 100,
        width: config.width || 200,
        height: config.height || 100,
        fill: config.fill || config.color || '#3b82f6',
        stroke: config.stroke || config.borderColor,
        strokeWidth: config.strokeWidth || config.borderWidth || 0,
        rx: config.rx || config.cornerRadius || 0,
        ry: config.ry || config.cornerRadius || 0,
        angle: config.angle || config.rotation || 0,
        opacity: config.opacity !== undefined ? config.opacity : 1,
        shadow: config.shadow,
        selectable: true,
        hasControls: true,
      });
      canvas.add(rect);
    },
    
    addCircle: (config: any) => {
      const circle = new Circle({
        left: config.x || 100,
        top: config.y || 100,
        radius: config.radius || 50,
        fill: config.fill || config.color || '#3b82f6',
        stroke: config.stroke || config.borderColor,
        strokeWidth: config.strokeWidth || config.borderWidth || 0,
        angle: config.angle || config.rotation || 0,
        opacity: config.opacity !== undefined ? config.opacity : 1,
        shadow: config.shadow,
        selectable: true,
        hasControls: true,
      });
      canvas.add(circle);
    },
    
    addText: (config: any) => {
      const text = new IText(config.text || config.content || 'Text', {
        left: config.x || 100,
        top: config.y || 100,
        width: config.width || 300,
        fontSize: config.fontSize || config.size || 24,
        fill: config.fill || config.color || '#000000',
        fontFamily: config.fontFamily || config.font || 'Arial',
        fontWeight: config.fontWeight || config.weight || 'normal',
        fontStyle: config.fontStyle || config.style || 'normal',
        textAlign: config.textAlign || config.align || 'left',
        angle: config.angle || config.rotation || 0,
        opacity: config.opacity !== undefined ? config.opacity : 1,
        shadow: config.shadow,
        selectable: true,
        editable: config.editable !== false,
        hasControls: true,
      });
      canvas.add(text);
    },
    
    addPolygon: (points: any[], config: any) => {
      const polygon = new Polygon(points, {
        left: config.x || 100,
        top: config.y || 100,
        fill: config.fill || config.color || '#3b82f6',
        stroke: config.stroke || config.borderColor,
        strokeWidth: config.strokeWidth || config.borderWidth || 0,
        angle: config.angle || config.rotation || 0,
        opacity: config.opacity !== undefined ? config.opacity : 1,
        shadow: config.shadow,
        selectable: true,
        hasControls: true,
      });
      canvas.add(polygon);
    },
    
    addImage: async (url: string, config: any) => {
      try {
        const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
        img.set({
          left: config.x || 100,
          top: config.y || 100,
          scaleX: config.scaleX || config.scale || 1,
          scaleY: config.scaleY || config.scale || 1,
          angle: config.angle || config.rotation || 0,
          opacity: config.opacity !== undefined ? config.opacity : 1,
          shadow: config.shadow,
          selectable: true,
          hasControls: true,
        });
        
        if (config.width || config.height) {
          const scaleX = config.width ? config.width / img.width! : 1;
          const scaleY = config.height ? config.height / img.height! : 1;
          img.scale(Math.min(scaleX, scaleY));
        }
        
        canvas.add(img);
      } catch (error) {
        console.error('Failed to load image:', error);
        throw error;
      }
    },
    
    clearCanvas: () => {
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      canvas.renderAll();
    },
    
    setBackground: (color: string) => {
      canvas.backgroundColor = color;
      canvas.renderAll();
    },
  };
}

/**
 * Execute code safely in canvas context
 */
export async function executeCanvasCode(
  code: string,
  canvas: FabricCanvas,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    // Create safe execution context
    const ctx = createCanvasContext(canvas);
    
    // Clean the code - remove imports, exports, and wrapping functions
    let cleanCode = code
      .replace(/import\s+.*?from\s+['"].*?['"]\s*;?/g, '')
      .replace(/export\s+(default\s+)?/g, '')
      .trim();
    
    // If code is a function, extract the body
    const functionMatch = cleanCode.match(/function\s+\w*\s*\([^)]*\)\s*\{([\s\S]*)\}/);
    if (functionMatch) {
      cleanCode = functionMatch[1];
    }
    
    // If code is an arrow function, extract the body
    const arrowMatch = cleanCode.match(/(?:const|let|var)?\s*\w*\s*=\s*\([^)]*\)\s*=>\s*\{([\s\S]*)\}/);
    if (arrowMatch) {
      cleanCode = arrowMatch[1];
    }
    
    // Create the execution function with context
    const executionFunction = new Function(
      'ctx',
      'canvas',
      'addRect',
      'addCircle', 
      'addText',
      'addPolygon',
      'addImage',
      'clearCanvas',
      'setBackground',
      `
      "use strict";
      ${cleanCode}
      `
    );
    
    // Execute with context
    await executionFunction(
      ctx,
      ctx.canvas,
      ctx.addRect,
      ctx.addCircle,
      ctx.addText,
      ctx.addPolygon,
      ctx.addImage,
      ctx.clearCanvas,
      ctx.setBackground
    );
    
    // Render the canvas
    canvas.renderAll();
    
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    console.error('[CanvasCodeRunner] Execution error:', error);
    if (onError) {
      onError(error as Error);
    }
    throw error;
  }
}

/**
 * Validate if code is canvas-compatible
 */
export function isCanvasCode(code: string): boolean {
  const canvasKeywords = [
    'addRect',
    'addCircle',
    'addText',
    'addPolygon',
    'addImage',
    'canvas',
    'ctx',
  ];
  
  return canvasKeywords.some(keyword => code.includes(keyword));
}

/**
 * Generate example canvas code
 */
export function getCanvasCodeExample(): string {
  return `// Canvas Rendering Example
// Available functions: addRect, addCircle, addText, addPolygon, addImage, clearCanvas, setBackground

// Set background color
setBackground('#f0f9ff');

// Add a gradient rectangle
addRect({
  x: 100,
  y: 100,
  width: 300,
  height: 200,
  fill: '#3b82f6',
  cornerRadius: 12,
  opacity: 0.9
});

// Add a circle
addCircle({
  x: 450,
  y: 150,
  radius: 60,
  fill: '#ec4899',
  borderColor: '#be185d',
  borderWidth: 3
});

// Add text
addText({
  text: 'Hello Canvas!',
  x: 150,
  y: 350,
  fontSize: 32,
  color: '#1e40af',
  fontWeight: 'bold',
  fontFamily: 'Arial'
});

// Add a triangle using polygon
addPolygon([
  { x: 0, y: -50 },
  { x: -50, y: 50 },
  { x: 50, y: 50 }
], {
  x: 600,
  y: 350,
  fill: '#10b981',
  borderColor: '#059669',
  borderWidth: 2
});`;
}
