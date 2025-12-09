import { useEffect, useRef, useState, useCallback } from "react";
import TemplateFeedback from "./TemplateFeedback";
import { Canvas as FabricCanvas } from "fabric";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { 
  Plus, Layout, Type, Square, Eye, Play,
  Monitor, Tablet, Smartphone, ZoomIn, ZoomOut,
  Sparkles, Code, Undo2, Redo2, Save, Keyboard, Zap,
  ChevronsDown, ChevronsUp, ArrowDown, ArrowUp, FileCode, Copy, Maximize2, Trash2,
  FolderOpen, Cloud, CloudOff
} from "lucide-react";
import { toast } from "sonner";
import CodeMirrorEditor from './CodeMirrorEditor';
import { LiveHTMLPreview } from './LiveHTMLPreview';
import { WebPropertiesPanel } from "./web-builder/WebPropertiesPanel";
import { EnhancedPropertiesPanel } from "./web-builder/EnhancedPropertiesPanel";
import { CollapsiblePropertiesPanel } from "./web-builder/CollapsiblePropertiesPanel";
import { ElementsSidebar, WebElement } from "./ElementsSidebar";
import { CanvasDragDropService } from "@/services/canvasDragDropService";
import { CodePreviewDialog } from "./web-builder/CodePreviewDialog";
import { AICodeAssistant } from "./AICodeAssistant";
import { IntegrationsPanel } from "./design-studio/IntegrationsPanel";
import { ExportDialog } from "./design-studio/ExportDialog";
import { PerformancePanel } from "./web-builder/PerformancePanel";
import { DirectEditToolbar } from "./web-builder/DirectEditToolbar";
import { ArrangementTools } from "./web-builder/ArrangementTools";
import { SecureIframePreview } from "@/components/SecureIframePreview";
import { useTemplateState } from "@/hooks/useTemplateState";
import { sanitizeHTML } from "@/utils/htmlSanitizer";
import { webBlocks } from "./web-builder/webBlocks";
import { SimpleModeToggle, SimpleBuilderMode } from "./web-builder/SimpleModeToggle";
import { InteractiveElementHighlight } from "./web-builder/InteractiveElementHighlight";
import { InteractiveElementOverlay } from "./web-builder/InteractiveElementOverlay";
import { InteractiveModeUtils } from "./web-builder/InteractiveModeUtils";
import { InteractiveModeHelp } from "./web-builder/InteractiveModeHelp";
import { LiveHTMLPreviewHandle } from './LiveHTMLPreview';
import { TemplateFileManager } from "./web-builder/TemplateFileManager";
import { useTemplateFiles } from "@/hooks/useTemplateFiles";
import { FunctionalBlocksPanel } from "./web-builder/FunctionalBlocksPanel";
import { ProjectsPanel } from "./web-builder/ProjectsPanel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVirtualFileSystem, VirtualFile } from "@/hooks/useVirtualFileSystem";
import { FileExplorer } from "./code-editor/FileExplorer";
import { EditorTabs } from "./code-editor/EditorTabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

// Define SelectedElement interface to match HTMLElementPropertiesPanel expected type
interface SelectedElement {
  id?: string;
  className?: string;
  width?: number;
  height?: number;
  left?: number;
  top?: number;
  opacity?: number;
  fill?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  visible?: boolean;
  scaleX?: number;
  scaleY?: number;
  set?: (property: string, value: unknown) => void;
  clone?: (callback: (cloned: unknown) => void) => void;
  // HTML-specific properties
  tagName?: string;
  textContent?: string;
  styles?: {
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
  attributes?: Record<string, string>;
  selector?: string;
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
import { useCodeHistory } from "@/hooks/useCodeHistory";
import { ChevronLeft, ChevronRight, PanelLeftClose, PanelRightClose } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
  const [builderMode, setBuilderMode] = useState<SimpleBuilderMode>('select');
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
  const [exportJs, setExportJs] = useState("");
  const [exportProjectName, setExportProjectName] = useState("my-project");
  const [saveProjectDialogOpen, setSaveProjectDialogOpen] = useState(false);
  const [saveProjectName, setSaveProjectName] = useState("");
  const [saveProjectDescription, setSaveProjectDescription] = useState("");
  const [currentTemplateName, setCurrentTemplateName] = useState<string | null>(null);
  const [isSavingProject, setIsSavingProject] = useState(false);
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
  const livePreviewRef = useRef<LiveHTMLPreviewHandle | null>(null);
  
  // Template file management
  const [fileManagerOpen, setFileManagerOpen] = useState(false);
  const templateFiles = useTemplateFiles();
  
  // Virtual file system for code editor
  const virtualFS = useVirtualFileSystem();
  
  // Auto-save functionality
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedCodeRef = useRef<string>('');
  const AUTO_SAVE_KEY = 'webbuilder_autosave_draft';
  const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
  
  // Auto-save draft to localStorage
  const saveDraft = useCallback(() => {
    if (previewCode && previewCode !== lastSavedCodeRef.current) {
      setAutoSaveStatus('saving');
      try {
        const draft = {
          code: previewCode,
          editorCode: editorCode,
          savedAt: new Date().toISOString(),
          templateId: templateFiles.currentTemplateId || null,
        };
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(draft));
        lastSavedCodeRef.current = previewCode;
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('[AutoSave] Error saving draft:', error);
        setAutoSaveStatus('idle');
      }
    }
  }, [previewCode, editorCode, templateFiles.currentTemplateId]);
  
  // Set up auto-save interval
  useEffect(() => {
    autoSaveTimerRef.current = setInterval(saveDraft, AUTO_SAVE_INTERVAL);
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [saveDraft]);
  
  // Restore draft on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(AUTO_SAVE_KEY);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        const savedTime = new Date(draft.savedAt);
        const now = new Date();
        const hoursSinceLastSave = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);
        
        // Only restore if draft is less than 24 hours old
        if (hoursSinceLastSave < 24 && draft.code) {
          // Check if there's meaningful content (not just default)
          const isDefaultContent = draft.code.includes('AI-generated code will appear here');
          if (!isDefaultContent) {
            setPreviewCode(draft.code);
            if (draft.editorCode) {
              setEditorCode(draft.editorCode);
            }
            lastSavedCodeRef.current = draft.code;
            toast.info('Draft restored', {
              description: `Last saved ${format(savedTime, 'MMM d, h:mm a')}`,
              action: {
                label: 'Discard',
                onClick: () => {
                  localStorage.removeItem(AUTO_SAVE_KEY);
                  setPreviewCode('<!-- AI-generated code will appear here -->\n<div style="padding: 40px; text-align: center;">\n  <h1>Welcome to AI Web Builder</h1>\n  <p>Use the AI Code Assistant to generate components</p>\n</div>');
                },
              },
            });
          }
        }
      }
    } catch (error) {
      console.error('[AutoSave] Error restoring draft:', error);
    }
  }, []);
  
  // Clear draft when template is saved
  const clearDraft = useCallback(() => {
    localStorage.removeItem(AUTO_SAVE_KEY);
    lastSavedCodeRef.current = '';
  }, []);

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
    
    // Clear current template state
    templateFiles.clearCurrentTemplate();
    setCurrentTemplateName(null);
    setSaveProjectName("");
    setSaveProjectDescription("");
    
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

  // Helper to integrate CSS into HTML document
  const integrateCSSIntoHTML = useCallback((html: string, css: string): string => {
    if (!css || !css.trim()) return html;
    
    const styleTag = `<style>\n${css}\n</style>`;
    
    // Check if it's a full HTML document
    if (html.includes('</head>')) {
      // Insert CSS before </head>
      return html.replace('</head>', `${styleTag}\n</head>`);
    } else if (html.includes('<html') || html.includes('<!DOCTYPE')) {
      // Has HTML but no head - add before body or at start
      if (html.includes('<body')) {
        return html.replace('<body', `<head>${styleTag}</head>\n<body`);
      }
      return html.replace(/<html[^>]*>/i, (match) => `${match}\n<head>${styleTag}</head>`);
    } else {
      // Fragment - wrap in full document with CSS
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  ${styleTag}
</head>
<body>
${html}
</body>
</html>`;
    }
  }, []);

  // Handle loading a saved template
  const handleLoadTemplate = useCallback((template: {
    id: string;
    name: string;
    description?: string;
    canvas_data: { html?: string; css?: string; previewCode?: string; js?: string };
  }) => {
    // Get the base HTML - prefer previewCode as it's the most complete
    let code = template.canvas_data?.previewCode || template.canvas_data?.html || '';
    
    if (!code) {
      toast.error('Template has no content');
      return;
    }
    
    // If there's separate CSS that's not in previewCode, integrate it
    const separateCss = template.canvas_data?.css || '';
    if (separateCss && !code.includes(separateCss.substring(0, 50))) {
      code = integrateCSSIntoHTML(code, separateCss);
    }
    
    // If there's separate JS that's not in previewCode, integrate it
    const separateJs = template.canvas_data?.js || '';
    if (separateJs && !code.includes(separateJs.substring(0, 50))) {
      const scriptTag = `<script>\n${separateJs}\n</script>`;
      if (code.includes('</body>')) {
        code = code.replace('</body>', `${scriptTag}\n</body>`);
      } else {
        code = code + `\n${scriptTag}`;
      }
    }
    
    // Set the code in both editor and preview
    setEditorCode(code);
    setPreviewCode(code);
    
    // Track the current template ID and name for re-save
    templateFiles.setCurrentTemplateId(template.id);
    setCurrentTemplateName(template.name);
    setSaveProjectName(template.name);
    setSaveProjectDescription(template.description || '');
    
    // Switch to preview mode to show the loaded template
    setBuilderMode('preview');
    
    toast.success(`Opened "${template.name}"`, {
      description: 'Template loaded - you can continue editing',
    });
  }, [templateFiles, integrateCSSIntoHTML]);

  // Handle saving current template
  const handleSaveTemplate = useCallback(async (
    name: string,
    description: string,
    isPublic: boolean
  ) => {
    await templateFiles.saveTemplate(name, description, isPublic, previewCode);
  }, [templateFiles, previewCode]);

  // Handle quick save (update existing template)
  const handleQuickSave = useCallback(async () => {
    if (templateFiles.currentTemplateId) {
      await templateFiles.updateTemplate(templateFiles.currentTemplateId, previewCode);
    } else {
      setFileManagerOpen(true);
    }
  }, [templateFiles, previewCode]);

  // Handle save to projects from preview
  const handleSaveToProjects = useCallback(async (saveAsNew: boolean = false) => {
    if (!saveProjectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }
    
    setIsSavingProject(true);
    try {
      const isUpdating = templateFiles.currentTemplateId && !saveAsNew;
      
      if (isUpdating) {
        // Update existing template
        await templateFiles.updateTemplate(templateFiles.currentTemplateId, previewCode);
        toast.success(`Updated "${saveProjectName}"`);
      } else {
        // Save as new template
        await templateFiles.saveTemplate(saveProjectName, saveProjectDescription, false, previewCode);
        toast.success(`Saved "${saveProjectName}" to Projects`);
      }
      
      setSaveProjectDialogOpen(false);
      clearDraft(); // Clear auto-save draft after successful save
    } catch (error) {
      console.error("Error saving to projects:", error);
      toast.error("Failed to save template");
    } finally {
      setIsSavingProject(false);
    }
  }, [saveProjectName, saveProjectDescription, templateFiles, previewCode, clearDraft]);

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

  // History management - both canvas and code history
  const canvasHistory = useCanvasHistory(fabricCanvas);
  const codeHistory = useCodeHistory(100);

  // Track code changes for undo/redo
  useEffect(() => {
    if (previewCode && !previewCode.includes('AI-generated code will appear here')) {
      codeHistory.push(previewCode);
    }
  }, [previewCode]);

  // Unified undo handler
  const handleUndo = useCallback(() => {
    const previousCode = codeHistory.undo();
    if (previousCode) {
      setPreviewCode(previousCode);
      setEditorCode(previousCode);
      toast.success('Undo', { description: 'Previous state restored' });
    } else if (canvasHistory.canUndo) {
      canvasHistory.undo();
    }
  }, [codeHistory, canvasHistory]);

  // Unified redo handler
  const handleRedo = useCallback(() => {
    const nextCode = codeHistory.redo();
    if (nextCode) {
      setPreviewCode(nextCode);
      setEditorCode(nextCode);
      toast.success('Redo', { description: 'Next state restored' });
    } else if (canvasHistory.canRedo) {
      canvasHistory.redo();
    }
  }, [codeHistory, canvasHistory]);

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
      action: handleUndo,
    },
    {
      ...defaultWebBuilderShortcuts.redo,
      action: handleRedo,
    },
    {
      ...defaultWebBuilderShortcuts.redoAlt,
      action: handleRedo,
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
        canvasHistory.save();
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
    {
      key: 'v',
      description: 'Select mode',
      action: () => {
        setBuilderMode('select');
        setIsInteractiveMode(false);
      },
    },
    {
      key: 'p',
      description: 'Preview mode',
      action: () => {
        setBuilderMode('preview');
        setIsInteractiveMode(true);
      },
    },
    {
      key: 'Delete',
      description: 'Delete selected HTML element',
      action: () => {
        if (selectedHTMLElement?.selector) {
          handleDeleteHTMLElement();
        } else if (selectedObject) {
          handleDelete();
        }
      },
    },
    {
      key: 'Backspace',
      description: 'Delete selected HTML element',
      action: () => {
        if (selectedHTMLElement?.selector) {
          handleDeleteHTMLElement();
        } else if (selectedObject) {
          handleDelete();
        }
      },
    },
    {
      key: 'd',
      ctrl: true,
      description: 'Duplicate selected HTML element',
      action: () => {
        if (selectedHTMLElement?.selector) {
          handleDuplicateHTMLElement();
        } else if (selectedObject) {
          handleDuplicate();
        }
      },
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
      setTimeout(() => canvasHistory.save(), 100);
    };

    fabricCanvas.on("object:added", handleObjectModified);
    fabricCanvas.on("object:removed", handleObjectModified);
    fabricCanvas.on("object:modified", handleObjectModified);

    return () => {
      fabricCanvas.off("object:added", handleObjectModified);
      fabricCanvas.off("object:removed", handleObjectModified);
      fabricCanvas.off("object:modified", handleObjectModified);
    };
  }, [fabricCanvas, canvasHistory, canvasHeight, updateCanvasHeight]);

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
    const handleDropEvent = (data: unknown) => {
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
    };
    
    // Register the drop event handler
    service.on('drop', handleDropEvent);

    return () => {
      // Unregister the drop event handler
      service.off('drop', handleDropEvent);
      
      // Destroy canvas listeners
      containers.forEach(container => {
        service.destroyCanvas(container);
        console.log('[WebBuilder] 🧹 Drag-drop destroyed on:', container.dataset.dropZone);
      });
    };
  }, [viewMode, previewCode]);

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

  // Handle delete for HTML elements in the live preview
  const handleDeleteHTMLElement = useCallback(() => {
    if (!selectedHTMLElement?.selector || !livePreviewRef.current) return;
    
    const deleted = livePreviewRef.current.deleteElement(selectedHTMLElement.selector);
    if (deleted) {
      setSelectedHTMLElement(null);
      toast.success('Element deleted');
      
      // Update the code
      const iframe = document.querySelector('iframe');
      if (iframe?.contentDocument) {
        const newHtml = iframe.contentDocument.documentElement.outerHTML;
        setPreviewCode(newHtml);
        setEditorCode(newHtml);
      }
    }
  }, [selectedHTMLElement]);

  // Handle duplicate for HTML elements in the live preview
  const handleDuplicateHTMLElement = useCallback(() => {
    if (!selectedHTMLElement?.selector || !livePreviewRef.current) return;
    
    const duplicated = livePreviewRef.current.duplicateElement(selectedHTMLElement.selector);
    if (duplicated) {
      toast.success('Element duplicated');
      
      // Update the code
      const iframe = document.querySelector('iframe');
      if (iframe?.contentDocument) {
        const newHtml = iframe.contentDocument.documentElement.outerHTML;
        setPreviewCode(newHtml);
        setEditorCode(newHtml);
      }
    }
  }, [selectedHTMLElement]);

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
    // Prefer preview code if available (live HTML preview), otherwise use fabric canvas
    if (previewCode) {
      // Extract HTML body content
      const bodyMatch = previewCode.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const htmlContent = bodyMatch ? bodyMatch[1] : previewCode;
      
      // Extract CSS from style tags
      const styleMatches = previewCode.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
      const cssContent = styleMatches 
        ? styleMatches.map(s => s.replace(/<style[^>]*>|<\/style>/gi, '')).join('\n\n')
        : '';
      
      // Extract JavaScript from script tags
      const scriptMatches = previewCode.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
      const jsContent = scriptMatches 
        ? scriptMatches
            .map(s => s.replace(/<script[^>]*>|<\/script>/gi, ''))
            .filter(s => s.trim())
            .join('\n\n')
        : '';
      
      setExportHtml(htmlContent);
      setExportCss(cssContent);
      setExportJs(jsContent);
      setExportProjectName(currentTemplateName || 'my-project');
      setExportDialogOpen(true);
      return;
    }
    
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
    setExportJs('');
    setExportProjectName(currentTemplateName || 'my-project');
    
    if (format === 'html') {
      setExportDialogOpen(true);
    } else if (format === 'react') {
      setExportDialogOpen(true);
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
            onClick={handleUndo}
            disabled={!codeHistory.canUndo && !canvasHistory.canUndo}
            className="text-white/70 hover:text-white disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={!codeHistory.canRedo && !canvasHistory.canRedo}
            className="text-white/70 hover:text-white disabled:opacity-30"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFileManagerOpen(true)}
            className="text-white/70 hover:text-white"
            title="Open Files"
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Files
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleQuickSave}
            className="text-white/70 hover:text-white"
            title={templateFiles.currentTemplateId ? "Save (Ctrl+S)" : "Save As... (Ctrl+S)"}
          >
            <Save className="h-4 w-4" />
            {templateFiles.currentTemplateId && (
              <span className="ml-1 w-2 h-2 bg-green-500 rounded-full" title="Saved" />
            )}
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
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
            <Tabs defaultValue="elements" className="flex-1 flex flex-col min-h-0">
              <TabsList className="w-full justify-start rounded-none border-b px-2 h-10 shrink-0">
                <TabsTrigger value="elements" className="text-xs">Elements</TabsTrigger>
                <TabsTrigger value="functional" className="text-xs">Functional</TabsTrigger>
                <TabsTrigger value="projects" className="text-xs">Projects</TabsTrigger>
              </TabsList>
              <TabsContent value="elements" className="flex-1 m-0 min-h-0 overflow-hidden">
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
                // Insert AI-generated image with advanced styling and responsive features
                const timestamp = Date.now();
                const imageAlt = metadata?.prompt || 'AI Generated Image';
                
                // Parse current preview code
                const parser = new DOMParser();
                const doc = parser.parseFromString(previewCode || '<!DOCTYPE html><html><head></head><body></body></html>', 'text/html');
                const body = doc.body;
                
                // Create wrapper for the AI image
                const wrapper = doc.createElement('div');
                wrapper.setAttribute('data-element-id', `ai-image-${timestamp}`);
                wrapper.setAttribute('data-element-type', 'media');
                wrapper.setAttribute('draggable', 'true');
                wrapper.setAttribute('class', 'canvas-element');
                
                // Create figure element with advanced features
                const figure = doc.createElement('figure');
                figure.className = 'relative group overflow-hidden rounded-2xl shadow-2xl';
                
                const img = doc.createElement('img');
                img.src = imageUrl;
                img.alt = imageAlt as string;
                img.loading = 'lazy';
                img.className = 'w-full h-auto object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110';
                img.style.cssText = 'aspect-ratio: 16/9; max-width: 100%;';
                
                const figcaption = doc.createElement('figcaption');
                figcaption.className = 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300';
                figcaption.innerHTML = `<p class="text-sm font-medium">${imageAlt}</p>${metadata?.style ? `<span class="text-xs opacity-75">Style: ${metadata.style}</span>` : ''}`;
                
                figure.appendChild(img);
                figure.appendChild(figcaption);
                wrapper.appendChild(figure);
                body.appendChild(wrapper);
                
                // Ensure TailwindCSS is included
                if (!doc.head.querySelector('script[src*="tailwindcss"]')) {
                  const tailwindScript = doc.createElement('script');
                  tailwindScript.src = 'https://cdn.tailwindcss.com';
                  doc.head.appendChild(tailwindScript);
                }
                
                const newCode = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
                setPreviewCode(newCode);
                setEditorCode(newCode);
                
                toast('AI Image Added!', {
                  description: 'AI-generated image inserted into canvas'
                });
              }}
              onElementClick={(element: WebElement) => {
                // Insert element HTML into preview code on click
                const parser = new DOMParser();
                let doc = parser.parseFromString(previewCode || '<!DOCTYPE html><html><head></head><body></body></html>', 'text/html');
                
                // Ensure TailwindCSS is included
                if (!doc.head.querySelector('script[src*="tailwindcss"]')) {
                  const tailwindScript = doc.createElement('script');
                  tailwindScript.src = 'https://cdn.tailwindcss.com';
                  doc.head.appendChild(tailwindScript);
                }
                
                // Create a wrapper and insert element HTML
                const tempDiv = doc.createElement('div');
                tempDiv.innerHTML = element.htmlTemplate;
                
                // Append all children to body
                while (tempDiv.firstChild) {
                  doc.body.appendChild(tempDiv.firstChild);
                }
                
                // Get the new HTML
                const newCode = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
                setEditorCode(newCode);
                setPreviewCode(newCode);
                
                toast.success(`Added ${element.name}`, {
                  description: 'Element added to preview'
                });
              }}
            />
              </TabsContent>
              <TabsContent value="functional" className="flex-1 m-0 min-h-0 overflow-hidden">
                <FunctionalBlocksPanel 
                  onInsertBlock={(html) => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(previewCode || '<!DOCTYPE html><html><head></head><body></body></html>', 'text/html');
                    const tempDiv = doc.createElement('div');
                    tempDiv.innerHTML = html;
                    while (tempDiv.firstChild) {
                      doc.body.appendChild(tempDiv.firstChild);
                    }
                    const newCode = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
                    setEditorCode(newCode);
                    setPreviewCode(newCode);
                    toast.success('Functional block added');
                  }}
                />
              </TabsContent>
              <TabsContent value="projects" className="flex-1 m-0 min-h-0 overflow-hidden">
                <ProjectsPanel
                  onLoadTemplate={handleLoadTemplate}
                  onSaveTemplate={handleSaveTemplate}
                  currentCode={previewCode}
                />
              </TabsContent>
            </Tabs>
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
            onPropertyChange={() => canvasHistory.save()}
          />
          
          {/* Arrangement Tools - Layer Order, Alignment, Actions */}
          <ArrangementTools 
            fabricCanvas={fabricCanvas}
            selectedObject={selectedObject}
          />

          {/* Device & Mode Controls */}
          <div className="h-12 border-b border-white/10 flex items-center px-4 gap-4">
            {/* Device Breakpoints */}
            <div className="flex items-center gap-1 border-r border-white/10 pr-4">
              <Button
                variant={device === "desktop" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setDevice("desktop")}
                className="h-8 w-8 text-white/70 hover:text-white"
                title="Desktop"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={device === "tablet" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setDevice("tablet")}
                className="h-8 w-8 text-white/70 hover:text-white"
                title="Tablet"
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={device === "mobile" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setDevice("mobile")}
                className="h-8 w-8 text-white/70 hover:text-white"
                title="Mobile"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
              <Button
                variant={viewMode === "canvas" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("canvas")}
                className="text-white/70 hover:text-white h-7 px-2"
              >
                <Square className="h-3.5 w-3.5 mr-1" />
                Canvas
              </Button>
              <Button
                variant={viewMode === "code" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("code")}
                className="text-white/70 hover:text-white h-7 px-2"
              >
                <FileCode className="h-3.5 w-3.5 mr-1" />
                Code
              </Button>
              <Button
                variant={viewMode === "split" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("split")}
                className="text-white/70 hover:text-white h-7 px-2"
              >
                <Layout className="h-3.5 w-3.5 mr-1" />
                Split
              </Button>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Simple Mode Toggle */}
            <SimpleModeToggle
              currentMode={builderMode}
              onModeChange={(mode) => {
                setBuilderMode(mode);
                setIsInteractiveMode(mode === 'preview');
              }}
              hasSelection={!!selectedHTMLElement || !!selectedObject}
              onDelete={() => {
                if (selectedHTMLElement?.selector) {
                  handleDeleteHTMLElement();
                } else if (selectedObject) {
                  handleDelete();
                }
              }}
              onDuplicate={() => {
                if (selectedHTMLElement?.selector) {
                  handleDuplicateHTMLElement();
                } else if (selectedObject) {
                  handleDuplicate();
                }
              }}
            />

            {/* Actions */}
            <div className="flex items-center gap-1 border-l border-white/10 pl-4">
              {/* Current template indicator */}
              {currentTemplateName && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/20 rounded text-xs text-primary mr-2">
                  <Cloud className="h-3 w-3" />
                  <span className="max-w-[120px] truncate">{currentTemplateName}</span>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSaveProjectDialogOpen(true)}
                className="h-8 text-white/70 hover:text-white hover:bg-white/10 px-2"
                title={currentTemplateName ? `Update "${currentTemplateName}"` : "Save to Projects"}
              >
                <Save className="h-4 w-4 mr-1" />
                <span className="text-xs">{currentTemplateName ? 'Update' : 'Save'}</span>
              </Button>
              
              {/* Auto-save status indicator */}
              {autoSaveStatus !== 'idle' && (
                <div className="flex items-center gap-1 text-xs text-white/50 ml-1">
                  {autoSaveStatus === 'saving' ? (
                    <>
                      <div className="animate-spin h-3 w-3 border border-white/30 border-t-white/70 rounded-full" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Cloud className="h-3 w-3 text-green-400" />
                      <span className="text-green-400">Saved</span>
                    </>
                  )}
                </div>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearCanvas}
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                title="Clear Canvas"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <span className="text-xs text-white/40 ml-2">{getCanvasWidth()}×{getCanvasHeight()}</span>
            </div>
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
                <div className="h-10 bg-muted/50 border-b flex items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      builderMode === 'select' ? "bg-emerald-500" : "bg-blue-500"
                    )} />
                    <span className="text-xs font-medium text-muted-foreground">
                      {builderMode === 'select' ? 'Select Mode - Click elements to edit' : 'Preview Mode - Test interactions'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Del</kbd>
                    <span>Delete</span>
                    <span className="mx-1">·</span>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">⌘D</kbd>
                    <span>Duplicate</span>
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
                    enableSelection={builderMode === 'select'}
                    isInteractiveMode={isInteractiveMode}
                    onElementSelect={(elementData) => {
                      // Open properties panel when element is selected in edit mode
                      if (rightPanelCollapsed) {
                        setRightPanelCollapsed(false);
                      }
                      console.log('[WebBuilder] HTML Element selected:', elementData);
                      setSelectedHTMLElement(elementData);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Code Mode - Full Code Editor with Folder Structure */}
            {viewMode === 'code' && (
              <div className="w-full h-full bg-[#1e1e1e] rounded-lg overflow-hidden border border-white/10" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                <ResizablePanelGroup direction="horizontal" className="h-full">
                  {/* File Explorer */}
                  <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
                    <FileExplorer
                      nodes={virtualFS.nodes}
                      activeFileId={virtualFS.activeFileId}
                      onFileSelect={virtualFS.openFile}
                      onCreateFile={virtualFS.createFile}
                      onCreateFolder={virtualFS.createFolder}
                      onDelete={virtualFS.deleteNode}
                      onRename={virtualFS.renameNode}
                      onDuplicate={virtualFS.duplicateNode}
                      onToggleFolder={virtualFS.toggleFolder}
                      onExpandAll={virtualFS.expandAll}
                      onCollapseAll={virtualFS.collapseAll}
                    />
                  </ResizablePanel>

                  <ResizableHandle withHandle className="bg-white/5 hover:bg-white/10" />

                  {/* Editor Panel */}
                  <ResizablePanel defaultSize={80}>
                    <div className="h-full flex flex-col">
                      {/* Editor Tabs */}
                      <EditorTabs
                        tabs={virtualFS.getOpenFiles().map(f => ({ id: f.id, name: f.name }))}
                        activeTabId={virtualFS.activeFileId}
                        onTabSelect={virtualFS.openFile}
                        onTabClose={virtualFS.closeTab}
                      />

                      {/* Code Editor */}
                      <div className="flex-1">
                        {(() => {
                          const activeFile = virtualFS.getActiveFile();
                          if (activeFile) {
                            const lang = (['javascript', 'typescript', 'html', 'css', 'json'].includes(activeFile.language)
                              ? (activeFile.language === 'typescript' ? 'javascript' : activeFile.language)
                              : 'javascript') as 'javascript' | 'html' | 'css' | 'json';
                            return (
                              <CodeMirrorEditor
                                height="100%"
                                language={lang}
                                value={activeFile.content}
                                onChange={(value) => virtualFS.updateFileContent(activeFile.id, value)}
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
                                className="w-full h-full"
                              />
                            );
                          }
                          return (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-[#1a1a1a]">
                              <p className="text-lg font-medium">No file selected</p>
                              <p className="text-sm mt-1">Select a file from the explorer to start editing</p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            )}

            {/* Split Mode - Live Preview + Code Editor */}
            {viewMode === 'split' && (
              <div className="w-full h-full flex gap-4">
                {/* Live Preview - Main viewing area */}
                <div className="flex-1 bg-white rounded-lg overflow-hidden border border-white/10 shadow-2xl relative">
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
                        // Open properties panel when element is selected
                        if (rightPanelCollapsed) {
                          setRightPanelCollapsed(false);
                        }
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

        {/* Right Properties Panel - Collapsible with integrated toggle */}
        <CollapsiblePropertiesPanel 
          fabricCanvas={fabricCanvas}
          selectedObject={selectedObject}
          selectedHTMLElement={selectedHTMLElement}
          isCollapsed={rightPanelCollapsed}
          onToggleCollapse={() => setRightPanelCollapsed(!rightPanelCollapsed)}
          onUpdate={() => fabricCanvas?.renderAll()}
          onUpdateHTMLElement={(updates) => {
            if (livePreviewRef.current && selectedHTMLElement?.selector) {
              // Format the update object correctly for updateElementInIframe
              const formattedUpdates: { 
                styles?: Record<string, string>; 
                textContent?: string; 
                attributes?: Record<string, string>;
              } = {};
              
              if (updates.styles) {
                formattedUpdates.styles = updates.styles;
              }
              if (updates.textContent !== undefined) {
                formattedUpdates.textContent = updates.textContent;
              }
              if (updates.attributes) {
                formattedUpdates.attributes = updates.attributes;
              }
              
              console.log('[WebBuilder] Updating HTML element:', selectedHTMLElement.selector, formattedUpdates);
              
              const success = livePreviewRef.current.updateElement(
                selectedHTMLElement.selector,
                formattedUpdates
              );
              
              if (success) {
                // Update local state with merged styles
                const updatedElement = { 
                  ...selectedHTMLElement, 
                  styles: { ...selectedHTMLElement.styles, ...updates.styles },
                  textContent: updates.textContent ?? selectedHTMLElement.textContent 
                };
                setSelectedHTMLElement(updatedElement);
                console.log('[WebBuilder] Element updated successfully');
              } else {
                console.error('[WebBuilder] Failed to update element');
              }
            }
          }}
          onClearHTMLSelection={() => setSelectedHTMLElement(null)}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />
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
        js={exportJs}
        projectName={exportProjectName}
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
        currentCode={previewCode}
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

      {/* Template File Manager */}
      <TemplateFileManager
        isOpen={fileManagerOpen}
        onOpenChange={setFileManagerOpen}
        currentCode={previewCode}
        onLoadTemplate={handleLoadTemplate}
        onSaveTemplate={handleSaveTemplate}
      />

      {/* Save to Projects Dialog */}
      <Dialog open={saveProjectDialogOpen} onOpenChange={setSaveProjectDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-base">
              {templateFiles.currentTemplateId ? 'Update Template' : 'Save to Projects'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {templateFiles.currentTemplateId 
                ? `Updating "${currentTemplateName}" - or save as a new template`
                : 'Save your current template design to access it later'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-3 py-3">
            {templateFiles.currentTemplateId && (
              <div className="flex items-center gap-2 px-2 py-1.5 bg-primary/10 rounded-md text-xs text-primary">
                <Cloud className="h-3 w-3" />
                <span>Editing: {currentTemplateName}</span>
              </div>
            )}
            <div className="grid gap-1.5">
              <Label htmlFor="project-name" className="text-xs">Name *</Label>
              <Input
                id="project-name"
                value={saveProjectName}
                onChange={(e) => setSaveProjectName(e.target.value)}
                placeholder="My Template Design"
                className="h-8 text-sm"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="project-description" className="text-xs">Description</Label>
              <Textarea
                id="project-description"
                value={saveProjectDescription}
                onChange={(e) => setSaveProjectDescription(e.target.value)}
                placeholder="Optional description..."
                rows={2}
                className="text-sm resize-none"
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" size="sm" onClick={() => setSaveProjectDialogOpen(false)}>
              Cancel
            </Button>
            {templateFiles.currentTemplateId && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleSaveToProjects(true)} 
                disabled={!saveProjectName.trim() || isSavingProject}
              >
                <Plus className="h-3 w-3 mr-1" />
                Save as New
              </Button>
            )}
            <Button 
              size="sm" 
              onClick={() => handleSaveToProjects(false)} 
              disabled={!saveProjectName.trim() || isSavingProject}
            >
              {isSavingProject ? (
                <div className="animate-spin h-3 w-3 border-2 border-background border-t-transparent rounded-full mr-1" />
              ) : (
                <Save className="h-3 w-3 mr-1" />
              )}
              {templateFiles.currentTemplateId ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
