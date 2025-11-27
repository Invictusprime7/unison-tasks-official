import { useEffect, useRef, useState, useCallback } from "react";
import TemplateFeedback from "./TemplateFeedback";
import { Canvas as FabricCanvas } from "fabric";
import { Button } from "@/components/ui/button";
import { 
  Plus, Layout, Type, Square, Eye, Play,
  Monitor, Tablet, Smartphone, ZoomIn, ZoomOut,
  Sparkles, Code, Undo2, Redo2, Save, Keyboard, Zap,
  ChevronsDown, ChevronsUp, ArrowDown, ArrowUp, FileCode, Copy, Maximize2, Trash2
} from "lucide-react";
import { toast } from "sonner";
import CodeMirrorEditor from './CodeMirrorEditor';
import { LiveHTMLPreview } from './LiveHTMLPreview';
import { WebPropertiesPanel } from "./web-builder/WebPropertiesPanel";
import { ElementsSidebar } from "./ElementsSidebar";
import { CanvasDragDropService } from "@/services/canvasDragDropService";
import { CodePreviewDialog } from "./web-builder/CodePreviewDialog";
import { AICodeAssistant } from "./AICodeAssistant";
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
import { InteractiveModeToggle } from "./web-builder/InteractiveModeToggle";
import { InteractiveElementHighlight } from "./web-builder/InteractiveElementHighlight";
import { InteractiveElementOverlay } from "./web-builder/InteractiveElementOverlay";
import { InteractiveModeUtils } from "./web-builder/InteractiveModeUtils";
import { InteractiveModeHelp } from "./web-builder/InteractiveModeHelp";
import { LiveHTMLPreviewHandle } from './LiveHTMLPreview';

// Define SelectedElement interface to match HTMLElementPropertiesPanel
interface SelectedElement {
  tagName: string;
  textContent: string;
  styles: {
    color?: string;
    backgroundColor?: string;
    fontSize?: string;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    textAlign?: string;
    padding?: string;
    margin?: string;
    border?: string;
    borderRadius?: string;
    width?: string;
    height?: string;
    display?: string;
    opacity?: string;
  };
  attributes: Record<string, string>;
  selector: string;
}

// Define types for Fabric objects with their specific properties
type FabricTextObject = FabricCanvas['_objects'][0] & {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: string;
};

type FabricImageObject = FabricCanvas['_objects'][0] & {
  getSrc(): string;
};
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
  const [selectedObject, setSelectedObject] = useState<FabricCanvas['_objects'][0] | null>(null);
  const [activeMode, setActiveMode] = useState<"insert" | "layout" | "text" | "vector">("insert");
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [zoom, setZoom] = useState(0.5);
  const [canvasHeight, setCanvasHeight] = useState(800);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [lastGenerationId, setLastGenerationId] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>(''); // This would come from auth
  const [codePreviewOpen, setCodePreviewOpen] = useState(false);
  const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);
  const [integrationsPanelOpen, setIntegrationsPanelOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportHtml, setExportHtml] = useState("");
  const [exportCss, setExportCss] = useState("");
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const dragDropServiceRef = useRef<CanvasDragDropService>(CanvasDragDropService.getInstance());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [performancePanelOpen, setPerformancePanelOpen] = useState(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [showPreview, setShowPreview] = useState(false);
  const [viewMode, setViewMode] = useState<'canvas' | 'code' | 'split'>('canvas');
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);
  const [isInteractiveModeHelpOpen, setIsInteractiveModeHelpOpen] = useState(false);
  const [editorCode, setEditorCode] = useState('// AI Web Builder - JavaScript Mode\n// Use vanilla JavaScript to create interactive web experiences\n\n// Example: Create a simple interactive button\nconst createButton = () => {\n  const button = document.createElement("button");\n  button.textContent = "Click Me!";\n  button.style.padding = "12px 24px";\n  button.style.fontSize = "16px";\n  button.style.cursor = "pointer";\n  \n  button.onclick = () => {\n    alert("Hello from Web Builder!");\n  };\n  \n  return button;\n};\n\n// Usage: Uncomment to test\n// document.body.appendChild(createButton());');
  const [previewCode, setPreviewCode] = useState('<!-- AI-generated code will appear here -->\n<div style="padding: 40px; text-align: center;">\n  <h1>Welcome to AI Web Builder</h1>\n  <p>Use the AI Code Assistant to generate components</p>\n</div>');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const splitViewDropZoneRef = useRef<HTMLDivElement>(null);
  const [selectedHTMLElement, setSelectedHTMLElement] = useState<SelectedElement | null>(null);
  const [htmlPropertiesPanelOpen, setHtmlPropertiesPanelOpen] = useState(false);
  const livePreviewRef = useRef<LiveHTMLPreviewHandle | null>(null);

  // Add console log to confirm component is rendering
  console.log('[WebBuilder] Component rendering with CodeMirror...');

  // Load template from navigation state (from Web Design Kit)
  useEffect(() => {
    if (location.state?.generatedCode) {
      const { generatedCode, templateName, aesthetic } = location.state;
      console.log('[WebBuilder] Loading template code from Web Design Kit:', templateName);
      setEditorCode(generatedCode);
      setPreviewCode(generatedCode);
      setViewMode('code'); // Start in code view to show the template in CodeMirror
      toast(`${templateName} loaded!`, {
        description: `${aesthetic} - View and edit in Code Editor`,
      });
      // Clear the state to prevent re-loading on subsequent renders
      window.history.replaceState({}, document.title);
    } else if (location.state?.generatedTemplate) {
      const { generatedTemplate, templateName, aesthetic } = location.state;
      console.log('[WebBuilder] Loading template from Web Design Kit:', templateName);
      
      // Convert template to HTML code
      const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${generatedTemplate.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Template: ${generatedTemplate.name} */
        /* Colors: Primary ${generatedTemplate.brandKit.primaryColor}, Secondary ${generatedTemplate.brandKit.secondaryColor} */
        
        html {
            scroll-behavior: smooth;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .fade-in {
            animation: fadeIn 0.6s ease-out;
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Generated Template: ${generatedTemplate.name} -->
    <!-- ${generatedTemplate.description} -->
    
    ${generatedTemplate.sections.map(section => `
    <!-- Section: ${section.name} (${section.type}) -->
    <section class="py-16 px-6">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-4xl font-bold mb-8">${section.name}</h2>
            <div class="grid gap-6 md:grid-cols-${section.components.length > 2 ? '3' : '2'}">
                ${section.components.map(comp => `
                <div class="p-6 bg-white rounded-lg shadow-lg">
                    <h3 class="text-2xl font-semibold mb-4">${comp.props.title || 'Component'}</h3>
                    <p class="text-gray-600">${comp.props.description || 'Component content'}</p>
                </div>
                `).join('\n                ')}
            </div>
        </div>
    </section>
    `).join('\n    ')}
</body>
</html>`;
      
      setEditorCode(htmlCode);
      setPreviewCode(htmlCode);
      setViewMode('code'); // Start in code view to show the template in CodeMirror
      toast(`${templateName || generatedTemplate.name} loaded!`, {
        description: `${aesthetic || generatedTemplate.description} - View and edit in Code Editor`,
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
    setViewMode('canvas'); // Switch to canvas view to show the generated template preview
    toast('AI Template Generated!', {
      description: 'Glass UI template is ready for preview',
    });
  };

  // Clear canvas and reset to initial state
  const handleClearCanvas = () => {
    const defaultCode = '// AI Web Builder - JavaScript Mode\n// Use vanilla JavaScript to create interactive web experiences\n\n// Example: Create a simple interactive button\nconst createButton = () => {\n  const button = document.createElement("button");\n  button.textContent = "Click Me!";\n  button.style.padding = "12px 24px";\n  button.style.fontSize = "16px";\n  button.style.cursor = "pointer";\n  \n  button.onclick = () => {\n    alert("Hello from Web Builder!");\n  };\n  \n  return button;\n};\n\n// Usage: Uncomment to test\n// document.body.appendChild(createButton());';
    
    const defaultPreview = '<!-- AI-generated code will appear here -->\n<div style="padding: 40px; text-align: center;">\n  <h1>Welcome to AI Web Builder</h1>\n  <p>Use the AI Code Assistant to generate components</p>\n</div>';
    
    setEditorCode(defaultCode);
    setPreviewCode(defaultPreview);
    
    // Clear fabric canvas if it exists
    if (fabricCanvas) {
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = '#ffffff';
      fabricCanvas.renderAll();
    }
    
    toast('Canvas Cleared!', {
      description: 'Starting fresh with a clean slate',
    });
  };

  // Render code from Code Editor to Fabric.js canvas
  const handleRenderToCanvas = async () => {
    if (!fabricCanvas) {
      console.warn('[WebBuilder] Canvas not ready yet');
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

    const handleSelectionCreated = (e: { selected?: FabricCanvas['_objects'] }) => {
      setSelectedObject(e.selected?.[0] || null);
    };

    const handleSelectionUpdated = (e: { selected?: FabricCanvas['_objects'] }) => {
      setSelectedObject(e.selected?.[0] || null);
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
        }
      },
    },
    {
      ...defaultWebBuilderShortcuts.redo,
      action: () => {
        if (history.canRedo) {
          history.redo();
        }
      },
    },
    {
      ...defaultWebBuilderShortcuts.redoAlt,
      action: () => {
        if (history.canRedo) {
          history.redo();
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
      },
    },
    {
      ...defaultWebBuilderShortcuts.toggleCode,
      action: () => setCodePreviewOpen(true),
    },
    {
      key: 'F1',
      description: 'Show Interactive Mode Help',
      action: () => setIsInteractiveModeHelpOpen(true),
    },
  ]);

  // Handle generated templates from navigation state (Web Design Kit)
  useEffect(() => {
    if (location.state?.generatedTemplate) {
      const { generatedTemplate, templateName } = location.state;
      console.log('[WebBuilder] Template received from route state:', generatedTemplate);
      
      // Ensure canvas is ready
      if (!fabricCanvas) {
        console.log('[WebBuilder] Canvas not ready, will process template when canvas is available');
        return;
      }

      // Use template state to render the template
      templateState.updateTemplate(generatedTemplate).then(() => {
        console.log('[WebBuilder] ✅ Template successfully rendered from route state');
        setShowPreview(true);
        // Clear the state to prevent re-loading
        window.history.replaceState({}, document.title);
      }).catch((error) => {
        console.error('[WebBuilder] ❌ Failed to render template from route state:', error);
        toast.error('Failed to render template: ' + (error instanceof Error ? error.message : 'Unknown error'));
      });
    }
  }, [location.state, fabricCanvas, templateState]);

  // Auto-adjust canvas height based on content
  const updateCanvasHeight = useCallback(() => {
    if (!fabricCanvas) return;
    
    const objects = fabricCanvas.getObjects();
    if (objects.length === 0) {
      setCanvasHeight(800);
      return;
    }
    
    let maxBottom = 800; // Minimum height
    objects.forEach((obj: FabricCanvas['_objects'][0]) => {
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
  }, [fabricCanvas, canvasHeight]);

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
  }, [fabricCanvas, history, canvasHeight, updateCanvasHeight]);

  // Initialize drag-drop service on preview containers
  useEffect(() => {
    const service = dragDropServiceRef.current;
    const containers: HTMLElement[] = [];
    
    // Collect all active drop zones
    if (scrollContainerRef.current) {
      containers.push(scrollContainerRef.current);
    }
    if (splitViewDropZoneRef.current) {
      containers.push(splitViewDropZoneRef.current);
    }
    
    if (containers.length === 0) {
      console.log('[WebBuilder] No drop zone containers found yet');
      return;
    }
    
    // Initialize drag-drop on all drop zones
    containers.forEach(container => {
      service.initializeCanvas(container);
      console.log('[WebBuilder] ✅ Drag-drop initialized on:', container.dataset.dropZone);
    });

    // Handle drop events - render elements with smart positioning
    service.on('drop', (data: unknown) => {
      const dropData = data as { 
        element: { 
          name: string; 
          htmlTemplate: string; 
          category: string;
          id: string;
        };
        context: {
          position: 'append' | 'prepend' | 'before' | 'after';
          targetElement?: HTMLElement;
        }
      };
      
      const { element, context } = dropData;
      
      // Parse the current HTML to insert at the right position
      const parser = new DOMParser();
      const doc = parser.parseFromString(previewCode || '<body></body>', 'text/html');
      const body = doc.body;
      
      // Create wrapper for the new element with data attributes for reordering
      const wrapper = doc.createElement('div');
      wrapper.setAttribute('data-element-id', `element-${Date.now()}`);
      wrapper.setAttribute('data-element-type', element.category);
      wrapper.setAttribute('draggable', 'true');
      wrapper.setAttribute('class', 'canvas-element');
      wrapper.innerHTML = element.htmlTemplate;
      
      // Smart positioning based on drop context
      if (context.position === 'prepend') {
        body.insertBefore(wrapper, body.firstChild);
      } else if (context.position === 'append' || !body.children.length) {
        body.appendChild(wrapper);
      } else {
        // Insert at a specific position based on drop location
        const children = Array.from(body.children);
        const middleIndex = Math.floor(children.length / 2);
        const referenceNode = children[middleIndex];
        body.insertBefore(wrapper, referenceNode);
      }
      
      // Get the updated HTML with proper formatting
      const newCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .canvas-element {
      position: relative;
      cursor: move;
      transition: opacity 0.3s, transform 0.3s;
    }
    .canvas-element:hover {
      opacity: 0.95;
    }
    .canvas-element.dragging {
      opacity: 0.5;
    }
    .canvas-element.drag-over-top::before {
      content: '';
      position: absolute;
      top: -2px;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #3B82F6, #8B5CF6);
      border-radius: 2px;
    }
    .canvas-element.drag-over-bottom::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #3B82F6, #8B5CF6);
      border-radius: 2px;
    }
  </style>
</head>
<body>
${body.innerHTML}
<script>
  // Enable reordering of elements via drag and drop
  (function() {
    let draggedElement = null;
    let dragOverElement = null;
    
    function handleDragStart(e) {
      draggedElement = e.currentTarget;
      draggedElement.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', draggedElement.innerHTML);
    }
    
    function handleDragOver(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      
      if (!draggedElement || e.currentTarget === draggedElement) return;
      
      const afterElement = getDragAfterElement(e.currentTarget, e.clientY);
      dragOverElement = e.currentTarget;
      
      // Remove previous indicators
      document.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach(el => {
        el.classList.remove('drag-over-top', 'drag-over-bottom');
      });
      
      // Add indicator
      if (afterElement) {
        dragOverElement.classList.add('drag-over-bottom');
      } else {
        dragOverElement.classList.add('drag-over-top');
      }
    }
    
    function handleDragLeave(e) {
      e.currentTarget.classList.remove('drag-over-top', 'drag-over-bottom');
    }
    
    function handleDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      
      if (!draggedElement || !dragOverElement || draggedElement === dragOverElement) return;
      
      const afterElement = getDragAfterElement(dragOverElement, e.clientY);
      
      if (afterElement) {
        dragOverElement.parentNode.insertBefore(draggedElement, dragOverElement.nextSibling);
      } else {
        dragOverElement.parentNode.insertBefore(draggedElement, dragOverElement);
      }
      
      dragOverElement.classList.remove('drag-over-top', 'drag-over-bottom');
    }
    
    function handleDragEnd(e) {
      e.currentTarget.classList.remove('dragging');
      document.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach(el => {
        el.classList.remove('drag-over-top', 'drag-over-bottom');
      });
      draggedElement = null;
      dragOverElement = null;
    }
    
    function getDragAfterElement(container, y) {
      const box = container.getBoundingClientRect();
      const offset = y - box.top;
      return offset > box.height / 2;
    }
    
    // Attach event listeners to all canvas elements
    function initDragAndDrop() {
      document.querySelectorAll('.canvas-element').forEach(element => {
        element.addEventListener('dragstart', handleDragStart);
        element.addEventListener('dragover', handleDragOver);
        element.addEventListener('dragleave', handleDragLeave);
        element.addEventListener('drop', handleDrop);
        element.addEventListener('dragend', handleDragEnd);
      });
    }
    
    // Initialize on load and when new elements are added
    initDragAndDrop();
    
    // Observe for new elements
    const observer = new MutationObserver(() => {
      initDragAndDrop();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  })();
</script>
</body>
</html>`;
      
      setPreviewCode(newCode);
      setEditorCode(newCode);
      
      toast.success(`Added ${element.name}`, {
        description: `${element.category} element added. Drag to reorder!`,
        duration: 3000
      });
    });

    return () => {
      containers.forEach(container => {
        service.destroyCanvas(container);
        console.log('[WebBuilder] 🧹 Drag-drop destroyed on:', container.dataset.dropZone);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const handleDelete = () => {
    if (!fabricCanvas || !selectedObject) return;
    fabricCanvas.remove(selectedObject);
    fabricCanvas.renderAll();
  };

  const handleDuplicate = async () => {
    if (!fabricCanvas || !selectedObject) return;
    const cloned = await selectedObject.clone();
    cloned.set({
      left: (cloned.left || 0) + 10,
      top: (cloned.top || 0) + 10,
    });
    fabricCanvas.add(cloned);
    fabricCanvas.setActiveObject(cloned);
    fabricCanvas.renderAll();
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
    
    objects.forEach((obj: FabricCanvas['_objects'][0], index: number) => {
      const className = `element-${index}`;
      
      // Generate HTML
      if (obj.type === 'text' || obj.type === 'textbox') {
        html += `  <div class="${className}">${(obj as FabricTextObject).text}</div>\n`;
      } else if (obj.type === 'rect') {
        html += `  <div class="${className}"></div>\n`;
      } else if (obj.type === 'image') {
        html += `  <img class="${className}" src="${(obj as FabricImageObject).getSrc()}" alt="" />\n`;
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
      const textObj = obj as FabricTextObject;
      if (textObj.fontSize) {
        css += `  font-size: ${textObj.fontSize}px;\n`;
      }
      if (textObj.fontFamily) {
        css += `  font-family: ${textObj.fontFamily};\n`;
      }
      if (textObj.textAlign) {
        css += `  text-align: ${textObj.textAlign};\n`;
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
    }
  };

  const toggleFullscreen = async () => {
    if (!mainContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await mainContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
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
    }
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
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

  console.log('[WebBuilder] About to return JSX...');

  return (
    <div ref={mainContainerRef} className="flex flex-col h-screen bg-[#0a0a0a]">
      {/* Interactive Element Highlighting Styles */}
      <InteractiveElementHighlight isInteractiveMode={isInteractiveMode} />
      
      {/* Interactive Mode Global Utils */}
      <InteractiveModeUtils isInteractiveMode={isInteractiveMode} />
      
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
            onClick={() => console.log('[WebBuilder] Publish clicked')}
          >
            <Play className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Elements Sidebar */}
        {!leftPanelCollapsed && (
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <ElementsSidebar
              onElementDragStart={(element) => {
                dragDropServiceRef.current.onDragStart(element);
                toast(`Dragging ${element.name}`, {
                  description: 'Drop onto preview area to add element'
                });
              }}
              onElementDragEnd={() => {
                dragDropServiceRef.current.onDragEnd();
              }}
              onAIImageGenerated={(imageUrl, metadata) => {
                // Insert AI-generated image into the canvas
                const imageElement = `
                  <div data-element-id="ai-image-${Date.now()}" data-element-type="media" draggable="true" class="canvas-element">
                    <img src="${imageUrl}" alt="AI Generated Image" class="w-full h-auto rounded-2xl shadow-lg" />
                  </div>
                `;
                
                // Parse current preview code
                const parser = new DOMParser();
                const doc = parser.parseFromString(previewCode || '<!DOCTYPE html><html><head></head><body></body></html>', 'text/html');
                const body = doc.body;
                
                // Create wrapper for the AI image
                const wrapper = doc.createElement('div');
                wrapper.setAttribute('data-element-id', `ai-image-${Date.now()}`);
                wrapper.setAttribute('data-element-type', 'media');
                wrapper.setAttribute('draggable', 'true');
                wrapper.setAttribute('class', 'canvas-element');
                wrapper.innerHTML = `<img src="${imageUrl}" alt="AI Generated Image" class="w-full h-auto rounded-2xl shadow-lg" />`;
                
                // Append to body
                body.appendChild(wrapper);
                
                // Generate full HTML with reordering system
                const newCode = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .canvas-element {
      cursor: move;
      transition: all 0.2s;
      position: relative;
    }
    .canvas-element:hover {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }
    .dragging {
      opacity: 0.5;
    }
    .drag-over-top::before,
    .drag-over-bottom::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      z-index: 1000;
    }
    .drag-over-top::before {
      top: -2px;
    }
    .drag-over-bottom::after {
      bottom: -2px;
    }
  </style>
</head>
<body>
${body.innerHTML}
</body>
</html>`;
                
                setPreviewCode(newCode);
                setEditorCode(newCode);
                
                toast('AI Image Added! 🎨', {
                  description: 'AI-generated image inserted into canvas'
                });
              }}
            />
          </div>
        )}
        
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

            {/* Interactive Mode Toggle - Only show for preview modes */}
            {(viewMode === 'canvas' || viewMode === 'split') && (
              <div className="flex items-center gap-2">
                <InteractiveModeToggle
                  isInteractiveMode={isInteractiveMode}
                  onToggle={setIsInteractiveMode}
                  className="flex-shrink-0"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsInteractiveModeHelpOpen(true)}
                  className="h-8 text-white/70 hover:text-white hover:bg-white/10"
                  title="Show Interactive Mode Help (F1)"
                >
                  <Zap className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Clear Canvas Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCanvas}
              className="h-8 text-white/70 hover:text-white hover:bg-white/10"
              title="Clear Canvas and Start Over"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>

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
              <div className="w-full h-full flex flex-col bg-white rounded-lg overflow-hidden border border-white/10 shadow-2xl relative">
                {/* Interactive Elements Overlay */}
                <InteractiveElementOverlay
                  isInteractiveMode={isInteractiveMode}
                  livePreviewRef={livePreviewRef}
                />
                
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
                  data-drop-zone="true"
                  className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
                >
                  <LiveHTMLPreview 
                    ref={livePreviewRef}
                    code={previewCode}
                    autoRefresh={true}
                    className="w-full h-full"
                    enableSelection={true}
                    isInteractiveMode={isInteractiveMode}
                    onElementSelect={(elementData) => {
                      console.log('[WebBuilder] HTML Element selected:', elementData);
                      setSelectedHTMLElement(elementData);
                      setHtmlPropertiesPanelOpen(true);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Code Mode - Full Code Editor */}
            {viewMode === 'code' && (
              <div className="w-full h-full bg-[#1e1e1e] rounded-lg overflow-hidden" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                <CodeMirrorEditor
                  height="100%"
                  language="javascript"
                  value={editorCode}
                  onChange={(value) => {
                    setEditorCode(value || '');
                    setPreviewCode(value || '');
                  }}
                  theme="vs-dark"
                  isAIProcessing={templateState.isRendering}
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
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                  }}
                />
              </div>
            )}

            {/* Split Mode - Live Preview + Code Editor */}
            {viewMode === 'split' && (
              <div className="w-full h-full flex gap-4">
                {/* Live Preview - Main viewing area */}
                <div className="flex-1 bg-white rounded-lg overflow-hidden border border-white/10 shadow-2xl relative">
                  {/* Interactive Elements Overlay */}
                  <InteractiveElementOverlay
                    isInteractiveMode={isInteractiveMode}
                    livePreviewRef={livePreviewRef}
                  />
                  
                  <div className="h-10 bg-muted border-b flex items-center px-4">
                    <Eye className="w-4 h-4 text-muted-foreground mr-2" />
                    <span className="text-sm text-muted-foreground">Live Preview - AI Generated Template</span>
                  </div>
                  <div 
                    ref={splitViewDropZoneRef}
                    data-drop-zone="true"
                    className="h-[calc(100%-40px)] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
                  >
                    <LiveHTMLPreview 
                      ref={livePreviewRef}
                      code={previewCode}
                      autoRefresh={true}
                      className="w-full h-full"
                      enableSelection={true}
                      isInteractiveMode={isInteractiveMode}
                      onElementSelect={(elementData) => {
                        console.log('[WebBuilder] HTML Element selected:', elementData);
                        setSelectedHTMLElement(elementData);
                        setHtmlPropertiesPanelOpen(true);
                      }}
                    />
                  </div>
                </div>

                {/* Code Editor Panel */}
                <div className="flex-1 flex flex-col gap-4">
                  {/* Code Editor */}
                  <div className="flex-1 bg-[#1e1e1e] rounded-lg overflow-hidden border border-white/10 flex flex-col">
                    <div className="h-10 bg-[#2d2d2d] border-b border-white/10 flex items-center justify-between px-4">
                      <div className="flex items-center">
                        <FileCode className="w-4 h-4 text-white/70 mr-2" />
                        <span className="text-sm text-white/70">Code Editor</span>
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
                    
                    <div className="flex-1">
                      <CodeMirrorEditor
                        height="100%"
                        language="javascript"
                        value={editorCode}
                        onChange={(value) => {
                          setEditorCode(value || '');
                          setPreviewCode(value || '');
                        }}
                        theme="vs-dark"
                        isAIProcessing={templateState.isRendering}
                        options={{
                          minimap: { enabled: true },
                          fontSize: 13,
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          tabSize: 2,
                          wordWrap: 'on',
                          suggestOnTriggerCharacters: true,
                          quickSuggestions: true,
                          formatOnPaste: true,
                          formatOnType: true,
                        }}
                      />
                    </div>
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
              console.log('[WebBuilder] Auto-fix applied');
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

      {/* AI Code Assistant */}
      <AICodeAssistant
        fabricCanvas={fabricCanvas}
        onCodeGenerated={(code) => {
          console.log('[WebBuilder] Code generated from AI:', code.length, 'chars');
          setEditorCode(code);
          setPreviewCode(code);
        }}
        onSwitchToCanvasView={() => {
          setViewMode('canvas');
        }}
      />

      {/* Interactive Mode Help Dialog */}
      <InteractiveModeHelp
        isOpen={isInteractiveModeHelpOpen}
        onClose={() => setIsInteractiveModeHelpOpen(false)}
      />

      {/* Template Feedback Dialog */}
      {feedbackOpen && lastGenerationId && (
        <TemplateFeedback
          generationId={lastGenerationId}
          userId={currentUserId || 'demo-user'} // In real app, get from auth
          templateCode={editorCode}
          onFeedbackSubmitted={() => {
            console.log('[WebBuilder] Feedback submitted for generation:', lastGenerationId);
            // Could refresh recommendations here
          }}
          onClose={() => {
            setFeedbackOpen(false);
            setLastGenerationId('');
          }}
        />
      )}
    </div>
  );
};
