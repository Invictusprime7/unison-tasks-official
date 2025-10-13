import { useEffect, useRef, useState } from "react";
import { AICodeAssistant } from "./AICodeAssistant";
import { Canvas as FabricCanvas } from "fabric";
import { Button } from "@/components/ui/button";
import { 
  Plus, Layout, Type, Square, Eye, Play,
  Monitor, Tablet, Smartphone, ZoomIn, ZoomOut,
  Sparkles, Code, Undo2, Redo2, Save, Keyboard, Zap,
  ChevronsDown, ChevronsUp, ArrowDown, ArrowUp, FileCode, Copy, Maximize2
} from "lucide-react";
import { toast } from "sonner";
import MonacoEditor from './MonacoEditor';
import { Monaco } from '@monaco-editor/react';
import { LiveHTMLPreview } from './LiveHTMLPreview';
import { NavigationPanel } from "./web-builder/NavigationPanel";
import { WebPropertiesPanel } from "./web-builder/WebPropertiesPanel";
import { AIAssistantPanel } from "./web-builder/AIAssistantPanel";
import { CodePreviewDialog } from "./web-builder/CodePreviewDialog";
import { IntegrationsPanel } from "./design-studio/IntegrationsPanel";
import { ExportDialog } from "./design-studio/ExportDialog";
import { PerformancePanel } from "./web-builder/PerformancePanel";
import { DirectEditToolbar } from "./web-builder/DirectEditToolbar";
import { ArrangementTools } from "./web-builder/ArrangementTools";
import { HTMLElementPropertiesPanel } from "./web-builder/HTMLElementPropertiesPanel";
import { SecureIframePreview } from "@/components/SecureIframePreview";
import { useTemplateState } from "@/hooks/useTemplateState";
import { sanitizeHTML } from "@/utils/htmlSanitizer";
import { webBlocks } from "./web-builder/webBlocks";
import { useKeyboardShortcuts, defaultWebBuilderShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useCanvasHistory } from "@/hooks/useCanvasHistory";
import { ChevronLeft, ChevronRight, PanelLeftClose, PanelRightClose } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WebBuilderProps {
  initialHtml?: string;
  initialCss?: string;
  onSave?: (html: string, css: string) => void;
}

export const WebBuilder = ({ initialHtml, initialCss, onSave }: WebBuilderProps) => {
  const location = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [activeMode, setActiveMode] = useState<"insert" | "layout" | "text" | "vector">("insert");
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [zoom, setZoom] = useState(0.5);
  const [canvasHeight, setCanvasHeight] = useState(800);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [codePreviewOpen, setCodePreviewOpen] = useState(false);
  const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);
  const [integrationsPanelOpen, setIntegrationsPanelOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportHtml, setExportHtml] = useState("");
  const [exportCss, setExportCss] = useState("");
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [performancePanelOpen, setPerformancePanelOpen] = useState(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [showPreview, setShowPreview] = useState(false);
  const [viewMode, setViewMode] = useState<'canvas' | 'code' | 'split'>('canvas');
  const [editorCode, setEditorCode] = useState('<!-- AI-generated code will appear here -->\n<div style="padding: 40px; text-align: center;">\n  <h1>Welcome to AI Web Builder</h1>\n  <p>Use the AI Code Assistant to generate components</p>\n</div>');
  const [previewCode, setPreviewCode] = useState('<!-- AI-generated code will appear here -->\n<div style="padding: 40px; text-align: center;">\n  <h1>Welcome to AI Web Builder</h1>\n  <p>Use the AI Code Assistant to generate components</p>\n</div>');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [selectedHTMLElement, setSelectedHTMLElement] = useState<any>(null);
  const [htmlPropertiesPanelOpen, setHtmlPropertiesPanelOpen] = useState(false);
  const livePreviewRef = useRef<any>(null);

  // Configure Monaco for full React/JSX/TypeScript support
  const handleEditorWillMount = (monaco: Monaco) => {
    monacoRef.current = monaco;

    // Add React type definitions
    const reactTypes = `
declare module 'react' {
  export interface FC<P = {}> {
    (props: P): JSX.Element | null;
  }
  export function useState<T>(initialState: T | (() => T)): [T, (value: T) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export function useRef<T>(initialValue: T): { current: T };
  export function useContext<T>(context: React.Context<T>): T;
  export function useReducer<R extends React.Reducer<any, any>>(
    reducer: R,
    initialState: React.ReducerState<R>
  ): [React.ReducerState<R>, React.Dispatch<React.ReducerAction<R>>];
  export const Children: {
    map<T, C>(children: C | C[], fn: (child: C, index: number) => T): T[];
    forEach<C>(children: C | C[], fn: (child: C, index: number) => void): void;
    count(children: any): number;
    only<C>(children: C): C extends any[] ? never : C;
    toArray(children: any): any[];
  };
  export interface ReactNode {}
  export interface ReactElement<P = any> {
    type: any;
    props: P;
    key: string | null;
  }
  export interface CSSProperties {
    [key: string]: string | number;
  }
}

declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface IntrinsicElements {
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
      p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
      h1: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h2: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h3: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h4: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h5: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h6: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
      input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
      img: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
      a: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
      ul: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
      ol: React.DetailedHTMLProps<React.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
      li: React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
      form: React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
      label: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
      select: React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
      option: React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
      textarea: React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
      nav: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      header: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      footer: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      section: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      article: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      aside: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      main: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      svg: React.SVGProps<SVGSVGElement>;
      path: React.SVGProps<SVGPathElement>;
      [elemName: string]: any;
    }
  }
}
`;

    // Configure TypeScript/JSX compiler options
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      noEmit: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: 'React.createElement',
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types'],
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      noEmit: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: 'React.createElement',
      reactNamespace: 'React',
      allowJs: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
    });

    // Add React type definitions to the editor
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      reactTypes,
      'file:///node_modules/@types/react/index.d.ts'
    );

    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      reactTypes,
      'file:///node_modules/@types/react/index.d.ts'
    );

    // Enable advanced diagnostics
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: false,
    });

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: false,
    });

    // Configure editor features
    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  };

  // Load template from navigation state (from Web Design Kit)
  useEffect(() => {
    if (location.state?.generatedCode) {
      const { generatedCode, templateName, aesthetic } = location.state;
      setEditorCode(generatedCode);
      setPreviewCode(generatedCode);
      setViewMode('canvas'); // Start in canvas view for live preview
      toast(`${templateName} loaded!`, {
        description: `${aesthetic} - Edit in Monaco or view in Canvas`,
      });
      // Clear the state to prevent re-loading on subsequent renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Handle AI code generation
  const handleAICodeGenerated = (code: string) => {
    console.log('[WebBuilder] AI code received:', code.substring(0, 100));
    setEditorCode(code);
    setPreviewCode(code);
    setViewMode('code'); // Switch to code view to show the generated code
    toast('AI Code Generated!', {
      description: 'Edit in Monaco and render to canvas',
    });
  };

  // Render code from Monaco to Fabric.js canvas
  const handleRenderToCanvas = async () => {
    if (!fabricCanvas) {
      toast('Canvas not ready', {
        description: 'Please wait for canvas to initialize',
      });
      return;
    }

    try {
      toast('Rendering to canvas...', {
        description: 'Converting code to Fabric.js objects',
      });

      // Import the component renderer
      const { parseComponentCode, renderComponentToCanvas } = await import('@/utils/componentRenderer');
      
      const component = parseComponentCode(editorCode);
      await renderComponentToCanvas(component, fabricCanvas);
      
      setViewMode('canvas'); // Switch to canvas view to see the result
      
      toast('Rendered successfully!', {
        description: 'Your code is now on the Fabric.js canvas',
      });
    } catch (error) {
      console.error('[WebBuilder] Render error:', error);
      toast('Render failed', {
        description: error instanceof Error ? error.message : 'Failed to render to canvas',
      });
    }
  };

  // State management - template schema as source of truth
  const templateState = useTemplateState(fabricCanvas);

  // History management
  const history = useCanvasHistory(fabricCanvas);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvasElement = canvasRef.current;
    
    const canvas = new FabricCanvas(canvasElement, {
      width: 1280,
      height: canvasHeight,
      backgroundColor: "#ffffff", // Keep canvas background white to avoid black flashes on zoom
    });

    setFabricCanvas(canvas);

    const handleSelectionCreated = (e: any) => {
      setSelectedObject(e.selected?.[0]);
    };

    const handleSelectionUpdated = (e: any) => {
      setSelectedObject(e.selected?.[0]);
    };

    const handleSelectionCleared = () => {
      setSelectedObject(null);
    };

    canvas.on("selection:created", handleSelectionCreated);
    canvas.on("selection:updated", handleSelectionUpdated);
    canvas.on("selection:cleared", handleSelectionCleared);

    return () => {
      canvas.off("selection:created", handleSelectionCreated);
      canvas.off("selection:updated", handleSelectionUpdated);
      canvas.off("selection:cleared", handleSelectionCleared);
      canvas.clear();
      canvas.dispose();
      setFabricCanvas(null);
      setSelectedObject(null);
    };
  }, [canvasHeight]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      ...defaultWebBuilderShortcuts.undo,
      action: () => {
        if (history.canUndo) {
          history.undo();
          toast.success("Undone");
        }
      },
    },
    {
      ...defaultWebBuilderShortcuts.redo,
      action: () => {
        if (history.canRedo) {
          history.redo();
          toast.success("Redone");
        }
      },
    },
    {
      ...defaultWebBuilderShortcuts.redoAlt,
      action: () => {
        if (history.canRedo) {
          history.redo();
          toast.success("Redone");
        }
      },
    },
    {
      ...defaultWebBuilderShortcuts.delete,
      action: () => selectedObject && handleDelete(),
    },
    {
      ...defaultWebBuilderShortcuts.backspace,
      action: () => selectedObject && handleDelete(),
    },
    {
      ...defaultWebBuilderShortcuts.duplicate,
      action: () => selectedObject && handleDuplicate(),
    },
    {
      ...defaultWebBuilderShortcuts.save,
      action: () => {
        history.save();
        toast.success("Saved");
      },
    },
    {
      ...defaultWebBuilderShortcuts.toggleCode,
      action: () => setCodePreviewOpen(true),
    },
  ]);

  // Auto-adjust canvas height based on content
  const updateCanvasHeight = () => {
    if (!fabricCanvas) return;
    
    const objects = fabricCanvas.getObjects();
    if (objects.length === 0) {
      setCanvasHeight(800);
      return;
    }
    
    let maxBottom = 800; // Minimum height
    objects.forEach((obj: any) => {
      const objBottom = (obj.top || 0) + (obj.height || 0) * (obj.scaleY || 1);
      if (objBottom > maxBottom) {
        maxBottom = objBottom;
      }
    });
    
    // Add padding at the bottom
    const newHeight = Math.max(800, Math.ceil(maxBottom + 200));
    if (newHeight !== canvasHeight) {
      setCanvasHeight(newHeight);
    }
  };

  // Save to history when objects change
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleObjectModified = () => {
      updateCanvasHeight();
      setTimeout(() => history.save(), 100);
    };

    fabricCanvas.on("object:added", handleObjectModified);
    fabricCanvas.on("object:removed", handleObjectModified);
    fabricCanvas.on("object:modified", handleObjectModified);

    return () => {
      fabricCanvas.off("object:added", handleObjectModified);
      fabricCanvas.off("object:removed", handleObjectModified);
      fabricCanvas.off("object:modified", handleObjectModified);
    };
  }, [fabricCanvas, history, canvasHeight]);

  const handleDelete = () => {
    if (!fabricCanvas || !selectedObject) return;
    fabricCanvas.remove(selectedObject);
    fabricCanvas.renderAll();
    toast.success("Deleted");
  };

  const handleDuplicate = () => {
    if (!fabricCanvas || !selectedObject) return;
    selectedObject.clone((cloned: any) => {
      cloned.set({
        left: cloned.left + 10,
        top: cloned.top + 10,
      });
      fabricCanvas.add(cloned);
      fabricCanvas.setActiveObject(cloned);
      fabricCanvas.renderAll();
      toast.success("Duplicated");
    });
  };

  const addBlock = (blockId: string) => {
    if (!fabricCanvas) return;
    
    const block = webBlocks.find(b => b.id === blockId);
    if (!block) return;

    const component = block.create(fabricCanvas);
    if (component) {
      fabricCanvas.add(component);
      fabricCanvas.setActiveObject(component);
      fabricCanvas.renderAll();
      toast.success(`${block.label} added`);
    }
  };

  const handleZoomIn = () => {
    if (!fabricCanvas) return;
    const newZoom = Math.min(zoom * 1.2, 2);
    setZoom(newZoom);
    fabricCanvas.setZoom(newZoom);
    fabricCanvas.renderAll();
  };

  const handleZoomOut = () => {
    if (!fabricCanvas) return;
    const newZoom = Math.max(zoom / 1.2, 0.1);
    setZoom(newZoom);
    fabricCanvas.setZoom(newZoom);
    fabricCanvas.renderAll();
  };

  const getCanvasWidth = () => {
    switch (device) {
      case "tablet": return 768;
      case "mobile": return 375;
      default: return 1280;
    }
  };

  const getCanvasHeight = () => {
    switch (device) {
      case "tablet": return Math.max(1024, canvasHeight);
      case "mobile": return Math.max(667, canvasHeight);
      default: return canvasHeight;
    }
  };

  const handleExport = (format: string) => {
    if (!fabricCanvas) return;
    
    const objects = fabricCanvas.getObjects();
    let html = '<div class="web-page">\n';
    let css = '.web-page {\n  min-height: 100vh;\n  position: relative;\n  background: white;\n}\n\n';
    
    objects.forEach((obj: any, index: number) => {
      const className = `element-${index}`;
      
      // Generate HTML
      if (obj.type === 'text' || obj.type === 'textbox') {
        html += `  <div class="${className}">${obj.text}</div>\n`;
      } else if (obj.type === 'rect') {
        html += `  <div class="${className}"></div>\n`;
      } else if (obj.type === 'image') {
        html += `  <img class="${className}" src="${obj.getSrc()}" alt="" />\n`;
      }
      
      // Generate CSS
      css += `.${className} {\n`;
      css += `  position: absolute;\n`;
      css += `  left: ${obj.left}px;\n`;
      css += `  top: ${obj.top}px;\n`;
      css += `  width: ${obj.width * (obj.scaleX || 1)}px;\n`;
      css += `  height: ${obj.height * (obj.scaleY || 1)}px;\n`;
      
      if (obj.fill) {
        css += `  background-color: ${obj.fill};\n`;
      }
      if (obj.fontSize) {
        css += `  font-size: ${obj.fontSize}px;\n`;
      }
      if (obj.fontFamily) {
        css += `  font-family: ${obj.fontFamily};\n`;
      }
      if (obj.textAlign) {
        css += `  text-align: ${obj.textAlign};\n`;
      }
      css += `}\n\n`;
    });
    
    html += '</div>';
    
    setExportHtml(html);
    setExportCss(css);
    
    if (format === 'html') {
      setExportDialogOpen(true);
    } else if (format === 'react') {
      // Convert to React component
      const reactCode = `import React from 'react';\n\nconst GeneratedComponent = () => {\n  return (\n${html.split('\n').map(l => '    ' + l).join('\n')}\n  );\n};\n\nexport default GeneratedComponent;`;
      const blob = new Blob([reactCode], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'GeneratedComponent.jsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('React component exported');
    } else if (format === 'json') {
      const json = JSON.stringify(fabricCanvas.toJSON(), null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'design.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('JSON exported');
    }
  };

  const toggleFullscreen = async () => {
    if (!mainContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await mainContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
        toast.success('Entered fullscreen preview');
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        toast.success('Exited fullscreen');
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
      toast.error('Failed to toggle fullscreen');
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle mouse wheel zoom (Ctrl+scroll)
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Only zoom if Ctrl key is pressed
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.1, Math.min(2, zoom * delta));
        setZoom(newZoom);
        if (fabricCanvas) {
          fabricCanvas.setZoom(newZoom);
          fabricCanvas.renderAll();
        }
      }
      // If Ctrl is not pressed, allow normal scrolling (do nothing)
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [zoom, fabricCanvas]);

  // Handle panning with mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) { // Middle mouse or Alt+Left
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Scroll navigation functions
  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      toast.success('Scrolled to top');
    }
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
      toast.success('Scrolled to bottom');
    }
  };

  const scrollUp = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        top: -300,
        behavior: 'smooth'
      });
    }
  };

  const scrollDown = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        top: 300,
        behavior: 'smooth'
      });
    }
  };

  // Handle touch gestures for mobile
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    let initialDistance = 0;
    let initialZoom = zoom;
    let lastTouchCenter = { x: 0, y: 0 };
    let touchPanOffset = { x: 0, y: 0 };

    const getTouchDistance = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getTouchCenter = (touches: TouchList) => {
      return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2,
      };
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        initialDistance = getTouchDistance(e.touches);
        initialZoom = zoom;
        lastTouchCenter = getTouchCenter(e.touches);
        touchPanOffset = { ...panOffset };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        
        // Pinch zoom
        const currentDistance = getTouchDistance(e.touches);
        const scale = currentDistance / initialDistance;
        const newZoom = Math.max(0.1, Math.min(2, initialZoom * scale));
        setZoom(newZoom);
        if (fabricCanvas) {
          fabricCanvas.setZoom(newZoom);
          fabricCanvas.renderAll();
        }

        // Pan
        const currentCenter = getTouchCenter(e.touches);
        const dx = currentCenter.x - lastTouchCenter.x;
        const dy = currentCenter.y - lastTouchCenter.y;
        setPanOffset({
          x: touchPanOffset.x + dx,
          y: touchPanOffset.y + dy,
        });
      }
    };

    const handleTouchEnd = () => {
      initialDistance = 0;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [zoom, fabricCanvas, panOffset]);

  return (
    <div ref={mainContainerRef} className="flex flex-col h-screen bg-[#0a0a0a]">
      {/* Top Toolbar */}
      <div className="h-14 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button
            variant={activeMode === "insert" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveMode("insert")}
            className="text-white/70 hover:text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Insert
          </Button>
          <Button
            variant={activeMode === "layout" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveMode("layout")}
            className="text-white/70 hover:text-white"
          >
            <Layout className="h-4 w-4 mr-2" />
            Layout
          </Button>
          <Button
            variant={activeMode === "text" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveMode("text")}
            className="text-white/70 hover:text-white"
          >
            <Type className="h-4 w-4 mr-2" />
            Text
          </Button>
          <Button
            variant={activeMode === "vector" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveMode("vector")}
            className="text-white/70 hover:text-white"
          >
            <Square className="h-4 w-4 mr-2" />
            Vector
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-white/50">Web Builder</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPerformancePanelOpen(true)}
            className="text-white/70 hover:text-white"
          >
            <Zap className="h-4 w-4 mr-2" />
            Performance
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIntegrationsPanelOpen(true)}
            className="text-white/70 hover:text-white"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Export & Integrations
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShortcutsDialogOpen(true)}
            className="text-white/70 hover:text-white"
            title="Keyboard shortcuts"
          >
            <Keyboard className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={history.undo}
            disabled={!history.canUndo}
            className="text-white/70 hover:text-white disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={history.redo}
            disabled={!history.canRedo}
            className="text-white/70 hover:text-white disabled:opacity-30"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              history.save();
              toast.success("Saved");
            }}
            className="text-white/70 hover:text-white"
            title="Save (Ctrl+S)"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCodePreviewOpen(true)}
            className="text-white/70 hover:text-white"
          >
            <Code className="h-4 w-4 mr-2" />
            Code
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-white/70 hover:text-white"
          >
            <Eye className="h-4 w-4 mr-2" />
            {isFullscreen ? 'Exit Preview' : 'Preview'}
          </Button>
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => toast.success('Click Publish in the top right to deploy your website with a custom domain!')}
          >
            <Play className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Panel - Collapsible */}
        {!leftPanelCollapsed && <NavigationPanel />}
        
        {/* Left Panel Toggle */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-6 rounded-r-md rounded-l-none bg-[#1a1a1a] border-l-0 border border-white/10 text-white/70 hover:text-white hover:bg-[#252525]"
            title={leftPanelCollapsed ? "Show left panel" : "Hide left panel"}
          >
            {leftPanelCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Center Canvas Area */}
        <div className="flex-1 flex flex-col bg-[#0a0a0a]">
          {/* Direct Edit Toolbar - Typography and Quick Edits */}
          <DirectEditToolbar 
            fabricCanvas={fabricCanvas}
            selectedObject={selectedObject}
            onPropertyChange={() => history.save()}
          />
          
          {/* Arrangement Tools - Layer Order, Alignment, Actions */}
          <ArrangementTools 
            fabricCanvas={fabricCanvas}
            selectedObject={selectedObject}
          />

          {/* Device & Breakpoint Controls */}
          <div className="h-12 border-b border-white/10 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Button
                variant={device === "desktop" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setDevice("desktop")}
                className="text-white/70 hover:text-white"
              >
                <Monitor className="h-4 w-4 mr-2" />
                Desktop
              </Button>
              <Button
                variant={device === "tablet" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setDevice("tablet")}
                className="text-white/70 hover:text-white"
              >
                <Tablet className="h-4 w-4 mr-2" />
                Tablet
              </Button>
              <Button
                variant={device === "mobile" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setDevice("mobile")}
                className="text-white/70 hover:text-white"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile
              </Button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 border border-white/10 rounded-lg p-1">
              <Button
                variant={viewMode === "canvas" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("canvas")}
                className="text-white/70 hover:text-white h-8"
              >
                <Square className="h-4 w-4 mr-1" />
                Canvas
              </Button>
              <Button
                variant={viewMode === "code" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("code")}
                className="text-white/70 hover:text-white h-8"
              >
                <FileCode className="h-4 w-4 mr-1" />
                Code
              </Button>
              <Button
                variant={viewMode === "split" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("split")}
                className="text-white/70 hover:text-white h-8"
              >
                <Layout className="h-4 w-4 mr-1" />
                Split
              </Button>
            </div>

            <span className="text-sm text-white/50">{getCanvasWidth()}×{getCanvasHeight()}px (dynamic)</span>
          </div>

          {/* Main Content Area - Canvas/Code/Split View */}
          <div 
            ref={canvasContainerRef}
            className="flex-1 overflow-hidden p-4 flex items-start justify-center bg-[#0a0a0a] relative"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isPanning ? 'grabbing' : 'default' }}
          >
            {/* Scroll Navigation Controls - Only for Canvas/Split Mode */}
            {(viewMode === 'canvas' || viewMode === 'split') && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={scrollToTop}
                  className="h-10 w-10 bg-[#1a1a1a] border border-white/10 text-white/70 hover:text-white hover:bg-[#252525] shadow-lg"
                  title="Scroll to top"
                >
                  <ChevronsUp className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={scrollUp}
                  className="h-10 w-10 bg-[#1a1a1a] border border-white/10 text-white/70 hover:text-white hover:bg-[#252525] shadow-lg"
                  title="Scroll up"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={scrollDown}
                  className="h-10 w-10 bg-[#1a1a1a] border border-white/10 text-white/70 hover:text-white hover:bg-[#252525] shadow-lg"
                  title="Scroll down"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={scrollToBottom}
                  className="h-10 w-10 bg-[#1a1a1a] border border-white/10 text-white/70 hover:text-white hover:bg-[#252525] shadow-lg"
                  title="Scroll to bottom"
                >
                  <ChevronsDown className="h-5 w-5" />
                </Button>
              </div>
            )}
            
            {/* Canvas Mode - AI Live Preview Only */}
            {viewMode === 'canvas' && (
              <div className="w-full h-full flex flex-col bg-white rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                <div className="h-12 bg-muted border-b flex items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">AI Generated Live Preview</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewMode('code')}
                      className="h-8"
                    >
                      <FileCode className="w-3 h-3 mr-1" />
                      Edit Code
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewMode('split')}
                      className="h-8"
                    >
                      <Layout className="w-3 h-3 mr-1" />
                      Split View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(editorCode);
                        toast('Code copied to clipboard!');
                      }}
                      className="h-8"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy Code
                    </Button>
                  </div>
                </div>
                <div 
                  ref={scrollContainerRef}
                  className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
                >
                  <LiveHTMLPreview 
                    ref={livePreviewRef}
                    code={previewCode}
                    autoRefresh={true}
                    className="w-full h-full"
                    enableSelection={true}
                    onElementSelect={(elementData) => {
                      console.log('[WebBuilder] HTML Element selected:', elementData);
                      setSelectedHTMLElement(elementData);
                      setHtmlPropertiesPanelOpen(true);
                      toast.success('Element selected! Edit properties in the panel →');
                    }}
                  />
                </div>
              </div>
            )}

            {/* Code Mode - Full Monaco Editor Only */}
            {viewMode === 'code' && (
              <div className="w-full h-full bg-[#1e1e1e]">
                <MonacoEditor
                  height="100%"
                  defaultLanguage="typescript"
                  language="typescript"
                  value={editorCode}
                  onChange={(value) => {
                    setEditorCode(value || '');
                    setPreviewCode(value || '');
                  }}
                  beforeMount={handleEditorWillMount}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                    formatOnPaste: true,
                    formatOnType: true,
                    padding: { top: 16, bottom: 16 },
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: {
                      other: true,
                      comments: true,
                      strings: true,
                    },
                    parameterHints: { enabled: true },
                    acceptSuggestionOnCommitCharacter: true,
                    acceptSuggestionOnEnter: 'on',
                    autoClosingBrackets: 'always',
                    autoClosingQuotes: 'always',
                    autoIndent: 'full',
                    bracketPairColorization: { enabled: true },
                    colorDecorators: true,
                    contextmenu: true,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    smoothScrolling: true,
                    snippetSuggestions: 'inline',
                    folding: true,
                    foldingHighlight: true,
                    showFoldingControls: 'always',
                    suggest: {
                      showWords: true,
                      showMethods: true,
                      showFunctions: true,
                      showConstructors: true,
                      showFields: true,
                      showVariables: true,
                      showClasses: true,
                      showStructs: true,
                      showInterfaces: true,
                      showModules: true,
                      showProperties: true,
                      showEvents: true,
                      showOperators: true,
                      showUnits: true,
                      showValues: true,
                      showConstants: true,
                      showEnums: true,
                      showEnumMembers: true,
                      showKeywords: true,
                      showSnippets: true,
                    },
                  }}
                />
              </div>
            )}

            {/* Split Mode - Live Preview + Code Editor */}
            {viewMode === 'split' && (
              <div className="w-full h-full flex gap-4">
                {/* Live Preview - Main viewing area */}
                <div className="flex-1 bg-white rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                  <div className="h-10 bg-muted border-b flex items-center px-4">
                    <Eye className="w-4 h-4 text-muted-foreground mr-2" />
                    <span className="text-sm text-muted-foreground">Live Preview - AI Generated Template</span>
                  </div>
                  <div className="h-[calc(100%-40px)] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                    <LiveHTMLPreview 
                      ref={livePreviewRef}
                      code={previewCode}
                      autoRefresh={true}
                      className="w-full h-full"
                      enableSelection={true}
                      onElementSelect={(elementData) => {
                        console.log('[WebBuilder] HTML Element selected:', elementData);
                        setSelectedHTMLElement(elementData);
                        setHtmlPropertiesPanelOpen(true);
                        toast.success('Element selected! Edit properties in the panel →');
                      }}
                    />
                  </div>
                </div>

                {/* Code Editor Panel */}
                <div className="flex-1 flex flex-col gap-4">
                  {/* Monaco Editor */}
                  <div className="flex-1 bg-[#1e1e1e] rounded-lg overflow-hidden border border-white/10">
                    <div className="h-10 bg-[#2d2d2d] border-b border-white/10 flex items-center justify-between px-4">
                      <div className="flex items-center">
                        <FileCode className="w-4 h-4 text-white/70 mr-2" />
                        <span className="text-sm text-white/70">Monaco Editor</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setViewMode('canvas')}
                        className="h-7 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View in Canvas
                      </Button>
                    </div>
                    
                      <MonacoEditor
                        height="calc(100% - 40px)"
                        defaultLanguage="typescript"
                        language="typescript"
                        value={editorCode}
                        onChange={(value) => {
                          setEditorCode(value || '');
                          setPreviewCode(value || '');
                        }}
                        beforeMount={handleEditorWillMount}
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: true },
                          fontSize: 13,
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          tabSize: 2,
                          wordWrap: 'on',
                          suggestOnTriggerCharacters: true,
                          quickSuggestions: {
                            other: true,
                            comments: true,
                            strings: true,
                          },
                          parameterHints: { enabled: true },
                          acceptSuggestionOnCommitCharacter: true,
                          acceptSuggestionOnEnter: 'on',
                          autoClosingBrackets: 'always',
                          autoClosingQuotes: 'always',
                          formatOnPaste: true,
                          formatOnType: true,
                          suggest: {
                            showWords: true,
                            showMethods: true,
                            showFunctions: true,
                            showConstructors: true,
                            showVariables: true,
                            showProperties: true,
                            showSnippets: true,
                          },
                        }}
                      />
                  </div>

                  {/* Component Info & Actions */}
                  <div className="bg-[#1e1e1e] rounded-lg border border-white/10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/70">Quick Actions</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(editorCode);
                          toast('Code copied to clipboard!');
                        }}
                        className="flex-1 h-8 text-xs"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Code
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setViewMode('code');
                          toast('Switched to full code view');
                        }}
                        className="flex-1 h-8 text-xs"
                      >
                        <Maximize2 className="w-3 h-3 mr-1" />
                        Fullscreen
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Controls - Zoom and Pan Reset */}
          <div className="h-12 border-t border-white/10 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                className="text-white/70 hover:text-white h-8 w-8 p-0"
                title="Zoom out (or use scroll wheel)"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-white/50 min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                className="text-white/70 hover:text-white h-8 w-8 p-0"
                title="Zoom in (or use scroll wheel)"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setZoom(0.5);
                  setPanOffset({ x: 0, y: 0 });
                  if (fabricCanvas) {
                    fabricCanvas.setZoom(0.5);
                    fabricCanvas.renderAll();
                  }
                  toast.success("Reset view");
                }}
                className="text-white/70 hover:text-white text-xs"
                title="Reset zoom and pan"
              >
                Reset View
              </Button>
            </div>
          </div>
        </div>

        {/* Right Properties Panel - Collapsible */}
        {/* Right Panel Toggle */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-6 rounded-l-md rounded-r-none bg-[#1a1a1a] border-r-0 border border-white/10 text-white/70 hover:text-white hover:bg-[#252525]"
            title={rightPanelCollapsed ? "Show properties panel" : "Hide properties panel"}
          >
            {rightPanelCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* Show HTML Element Properties Panel when an HTML element is selected */}
        {htmlPropertiesPanelOpen && selectedHTMLElement ? (
          <HTMLElementPropertiesPanel
            selectedElement={selectedHTMLElement}
            onClose={() => {
              setHtmlPropertiesPanelOpen(false);
              setSelectedHTMLElement(null);
            }}
            onUpdateElement={(updates) => {
              console.log('[WebBuilder] Updating element via DOM:', updates);
              
              // Update element directly in the iframe DOM (no code modification)
              if (livePreviewRef.current) {
                const success = livePreviewRef.current.updateElement(
                  selectedHTMLElement.selector,
                  updates
                );
                
                if (success) {
                  // Update the selected element data for the properties panel
                  setSelectedHTMLElement({
                    ...selectedHTMLElement,
                    ...updates,
                  });
                  
                  toast.success('Element updated successfully');
                } else {
                  toast.error('Failed to update element', {
                    description: 'Element not found in preview'
                  });
                }
              }
            }}
          />
        ) : !rightPanelCollapsed ? (
          <WebPropertiesPanel 
            fabricCanvas={fabricCanvas}
            selectedObject={selectedObject}
            onUpdate={() => fabricCanvas?.renderAll()}
          />
        ) : null}
      </div>

      {/* AI Assistant Panel */}
      <AIAssistantPanel 
        isOpen={aiPanelOpen} 
        onClose={() => setAiPanelOpen(false)}
        fabricCanvas={fabricCanvas}
        onTemplateGenerated={async (template) => {
          try {
            console.log('[WebBuilder] Template received from AI:', template);
            
            // Ensure canvas is ready
            if (!fabricCanvas) {
              toast.error('Canvas not ready. Please wait a moment and try again.');
              return;
            }

            // Template state handles both canvas and HTML rendering
            await templateState.updateTemplate(template);
            
            console.log('[WebBuilder] ✅ Template successfully rendered');
            toast.success('✨ AI template rendered successfully!');
            
            // Show preview after successful render
            setShowPreview(true);
          } catch (error) {
            console.error('[WebBuilder] ❌ Failed to render template:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to render template');
          }
        }}
      />

      {/* Code Preview Dialog */}
      <CodePreviewDialog
        isOpen={codePreviewOpen}
        onClose={() => setCodePreviewOpen(false)}
        fabricCanvas={fabricCanvas}
      />

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        html={exportHtml}
        css={exportCss}
      />

      {/* Performance Panel as Sidebar */}
      {performancePanelOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-[#1a1a1a] border-l border-white/10 shadow-2xl z-50 flex flex-col">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold text-white">Performance</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPerformancePanelOpen(false)}
              className="text-white/70 hover:text-white"
            >
              ✕
            </Button>
          </div>
          <PerformancePanel 
            fabricCanvas={fabricCanvas}
            onAutoFix={() => {
              toast.success("Auto-fix applied! Optimizations complete.");
            }}
          />
        </div>
      )}

      {/* Integrations Panel as Sidebar */}
      {integrationsPanelOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 overflow-auto">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Export & Integrations</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIntegrationsPanelOpen(false)}
            >
              ✕
            </Button>
          </div>
          <IntegrationsPanel 
            onExport={handleExport}
            onIntegrationConnect={(integration, config) => {
              console.log('Integration connected:', integration, config);
              toast.success(`${integration} connected successfully!`);
            }}
          />
        </div>
      )}

      {/* Secure HTML Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl h-[90vh] bg-[#1a1a1a] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live HTML Preview
              </span>
              {templateState.isRendering && (
                <span className="text-xs text-white/50">Rendering...</span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <SecureIframePreview
              html={sanitizeHTML(templateState.html)}
              css={templateState.css}
              className="w-full h-full border border-white/10 rounded bg-white"
              onConsole={(type, args) => {
                console.log(`[Preview ${type}]:`, ...args);
              }}
              onError={(error) => {
                console.error('[Preview Error]:', error);
                toast.error('Preview error: ' + error.message);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={shortcutsDialogOpen} onOpenChange={setShortcutsDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {Object.entries(defaultWebBuilderShortcuts).map(([key, shortcut]) => {
              const parts = [];
              if ('ctrl' in shortcut && shortcut.ctrl) parts.push("Ctrl");
              if ('shift' in shortcut && shortcut.shift) parts.push("Shift");
              if ('alt' in shortcut && shortcut.alt) parts.push("Alt");
              parts.push(shortcut.key.toUpperCase());
              
              return (
                <div key={key} className="flex justify-between items-center text-sm">
                  <span className="text-white/70">{shortcut.description}</span>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-white/90 text-xs font-mono">
                    {parts.join("+")}
                  </kbd>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Code Assistant - Bottom Panel */}
      <AICodeAssistant 
        fabricCanvas={fabricCanvas}
        onCodeGenerated={handleAICodeGenerated}
        onSwitchToCanvasView={() => {
          console.log('[WebBuilder] Switching to Canvas view from AI Assistant');
          setViewMode('canvas');
          toast.success('Switched to Canvas View', {
            description: 'Your live preview is now showing in the Canvas tab',
          });
        }}
      />
    </div>
  );
};
