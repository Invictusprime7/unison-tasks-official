/**
 * Enhanced Web Builder with Drag & Drop Elements Sidebar
 * Integrates ElementsSidebar with canvas for visual web building
 */

import React, { useEffect, useRef, useState } from 'react';
import { WebElement, ElementsSidebar } from './ElementsSidebar';
import { CanvasDragDropService } from '@/services/canvasDragDropService';
import { Button } from '@/components/ui/button';
import { 
  Code, 
  Eye, 
  Monitor, 
  Tablet, 
  Smartphone,
  ZoomIn,
  ZoomOut,
  Download,
  Trash2,
  Undo,
  Redo,
  Save,
  Play
} from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedWebBuilderProps {
  initialHtml?: string;
  onSave?: (html: string) => void;
}

export const EnhancedWebBuilder: React.FC<EnhancedWebBuilderProps> = ({
  initialHtml = '',
  onSave
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragDropService = useRef<CanvasDragDropService>(CanvasDragDropService.getInstance());
  
  const [viewMode, setViewMode] = useState<'canvas' | 'code' | 'preview'>('canvas');
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [zoom, setZoom] = useState(100);
  const [canvasHtml, setCanvasHtml] = useState(initialHtml);
  const [elementCount, setElementCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize drag-drop on canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const service = dragDropService.current;
    
    service.initializeCanvas(canvas);

    // Subscribe to drag-drop events
    service.on('dragStart', () => {
      setIsDragging(true);
    });

    service.on('dragEnd', () => {
      setIsDragging(false);
    });

    service.on('drop', (data: unknown) => {
      const dropData = data as { element: WebElement };
      toast.success(`Added ${dropData.element.name}`, {
        description: `${dropData.element.category} element added to canvas`
      });
      updateCanvasState();
    });

    return () => {
      service.destroyCanvas(canvas);
    };
  }, []);

  // Load initial HTML
  useEffect(() => {
    if (canvasRef.current && initialHtml) {
      canvasRef.current.innerHTML = initialHtml;
      updateCanvasState();
    }
  }, [initialHtml]);

  const updateCanvasState = () => {
    if (!canvasRef.current) return;
    
    const html = dragDropService.current.exportCanvasHTML(canvasRef.current);
    setCanvasHtml(html);
    setElementCount(dragDropService.current.getElementCount(canvasRef.current));
  };

  const handleElementDragStart = (element: WebElement) => {
    dragDropService.current.onDragStart(element);
  };

  const handleElementDragEnd = () => {
    dragDropService.current.onDragEnd();
  };

  const handleClearCanvas = () => {
    if (!canvasRef.current) return;
    
    if (confirm('Clear all elements from canvas?')) {
      dragDropService.current.clearCanvas(canvasRef.current);
      updateCanvasState();
      toast.success('Canvas cleared');
    }
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    
    const html = dragDropService.current.exportCanvasHTML(canvasRef.current);
    onSave?.(html);
    toast.success('Saved successfully');
  };

  const handleExport = () => {
    if (!canvasRef.current) return;
    
    const html = dragDropService.current.exportCanvasHTML(canvasRef.current);
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Web Builder Export</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    html { scroll-behavior: smooth; }
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
${html}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'page.html';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Exported page.html');
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(200, prev + 10));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(50, prev - 10));
  };

  const getDeviceWidth = () => {
    switch (device) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      default:
        return '100%';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-gray-900">Web Builder</h1>
          <div className="h-6 w-px bg-gray-300" />
          <span className="text-sm text-gray-600">{elementCount} elements</span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('canvas')}
              className={`px-4 py-2 text-sm font-medium transition ${
                viewMode === 'canvas'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Monitor className="w-4 h-4 inline mr-2" />
              Canvas
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-4 py-2 text-sm font-medium transition border-l border-gray-300 ${
                viewMode === 'code'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Code className="w-4 h-4 inline mr-2" />
              Code
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-4 py-2 text-sm font-medium transition border-l border-gray-300 ${
                viewMode === 'preview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Preview
            </button>
          </div>

          <div className="h-6 w-px bg-gray-300" />

          {/* Device Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-2 transition ${
                device === 'desktop'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-2 transition border-l border-gray-300 ${
                device === 'tablet'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              title="Tablet"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-2 transition border-l border-gray-300 ${
                device === 'mobile'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              title="Mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <div className="h-6 w-px bg-gray-300" />

          {/* Zoom */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 w-12 text-center">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="h-6 w-px bg-gray-300" />

          {/* Actions */}
          <Button
            onClick={handleClearCanvas}
            variant="outline"
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>

          <Button
            onClick={handleSave}
            variant="outline"
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>

          <Button
            onClick={handleExport}
            variant="default"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Elements Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200">
          <ElementsSidebar
            onElementDragStart={handleElementDragStart}
            onElementDragEnd={handleElementDragEnd}
          />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {viewMode === 'canvas' && (
            <div className="flex-1 overflow-auto bg-gray-100 p-8">
              <div
                className="mx-auto bg-white shadow-2xl transition-all duration-300"
                style={{
                  width: getDeviceWidth(),
                  minHeight: '600px',
                  transform: `scale(${zoom / 100})`
                }}
              >
                <div
                  ref={canvasRef}
                  data-drop-zone="true"
                  className={`min-h-full ${isDragging ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}`}
                  style={{
                    minHeight: '600px'
                  }}
                >
                  {elementCount === 0 && !isDragging && (
                    <div className="h-full flex items-center justify-center text-gray-400 p-12 text-center">
                      <div>
                        <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">Drag & Drop to Build</h3>
                        <p className="text-sm">Drag elements from the sidebar to start building your page</p>
                      </div>
                    </div>
                  )}
                  {isDragging && elementCount === 0 && (
                    <div className="h-full flex items-center justify-center text-blue-600 p-12 text-center">
                      <div>
                        <div className="w-16 h-16 mx-auto mb-4 border-4 border-dashed border-blue-600 rounded-lg animate-pulse" />
                        <h3 className="text-xl font-semibold mb-2">Drop Here</h3>
                        <p className="text-sm">Release to add element to canvas</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {viewMode === 'code' && (
            <div className="flex-1 overflow-auto bg-gray-900 p-4">
              <pre className="text-gray-100 text-sm font-mono">
                <code>{canvasHtml || '<!-- Empty canvas -->'}</code>
              </pre>
            </div>
          )}

          {viewMode === 'preview' && (
            <div className="flex-1 overflow-auto">
              <iframe
                srcDoc={`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    html { scroll-behavior: smooth; }
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
${canvasHtml}
</body>
</html>`}
                className="w-full h-full border-0"
                title="Preview"
              />
            </div>
          )}

        </div>

      </div>

      {/* Add global styles for inserted elements */}
      <style>{`
        .element-inserted {
          animation: elementInsert 0.3s ease-out;
        }

        @keyframes elementInsert {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .canvas-element-wrapper:hover {
          outline: 2px solid #3B82F6;
          outline-offset: 2px;
        }

        .insertion-preview {
          animation: insertionPulse 1s ease-in-out infinite;
        }

        @keyframes insertionPulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>

    </div>
  );
};

export default EnhancedWebBuilder;
