import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Rect, IText, FabricImage, Triangle, Line } from "fabric";
import { Button } from "@/components/ui/button";
import { 
  MousePointer2, Square, Circle as CircleIcon, Type, Image as ImageIcon, 
  Download, Save, Trash2, ZoomIn, ZoomOut, Undo2, Redo2, 
  Layers, Settings2, Sparkles, FolderOpen
} from "lucide-react";
import { toast } from "sonner";
import { ElementsPanel } from "./editor/ElementsPanel";
import { LayersPanel } from "./editor/LayersPanel";
import { PropertiesPanel } from "./editor/PropertiesPanel";
import { SaveTemplateDialog } from "./design-studio/SaveTemplateDialog";
import { TemplateGallery } from "./design-studio/TemplateGallery";

export const VisualEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<"select" | "rectangle" | "circle" | "text" | "image" | "line">("select");
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [showLayers, setShowLayers] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth - 400,
      height: window.innerHeight - 120,
      backgroundColor: "#ffffff",
    });

    setFabricCanvas(canvas);

    // Selection events
    canvas.on("selection:created", (e) => {
      setSelectedObject(e.selected?.[0]);
    });

    canvas.on("selection:updated", (e) => {
      setSelectedObject(e.selected?.[0]);
    });

    canvas.on("selection:cleared", () => {
      setSelectedObject(null);
    });

    // Handle window resize
    const handleResize = () => {
      canvas.setWidth(window.innerWidth - 400);
      canvas.setHeight(window.innerHeight - 120);
      canvas.renderAll();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
    };
  }, []);

  const addShape = (type: typeof activeTool) => {
    if (!fabricCanvas) return;

    switch (type) {
      case "rectangle":
        const rect = new Rect({
          left: 100,
          top: 100,
          fill: "hsl(var(--primary))",
          width: 150,
          height: 100,
          cornerRadius: 8,
        });
        fabricCanvas.add(rect);
        fabricCanvas.setActiveObject(rect);
        break;

      case "circle":
        const circle = new Circle({
          left: 100,
          top: 100,
          fill: "hsl(var(--primary))",
          radius: 60,
        });
        fabricCanvas.add(circle);
        fabricCanvas.setActiveObject(circle);
        break;

      case "text":
        const text = new IText("Double click to edit", {
          left: 100,
          top: 100,
          fontSize: 24,
          fill: "hsl(var(--foreground))",
          fontFamily: "Inter, sans-serif",
        });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        break;

      case "line":
        const line = new Line([50, 50, 200, 50], {
          stroke: "hsl(var(--primary))",
          strokeWidth: 3,
        });
        fabricCanvas.add(line);
        fabricCanvas.setActiveObject(line);
        break;
    }

    fabricCanvas.renderAll();
    setActiveTool("select");
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();
    toast.success("Canvas cleared");
  };

  const handleDelete = () => {
    if (!fabricCanvas || !selectedObject) return;
    fabricCanvas.remove(selectedObject);
    fabricCanvas.renderAll();
    toast.success("Object deleted");
  };

  const handleZoomIn = () => {
    if (!fabricCanvas) return;
    const zoom = fabricCanvas.getZoom();
    fabricCanvas.setZoom(zoom * 1.1);
  };

  const handleZoomOut = () => {
    if (!fabricCanvas) return;
    const zoom = fabricCanvas.getZoom();
    fabricCanvas.setZoom(zoom / 1.1);
  };

  const handleExport = () => {
    if (!fabricCanvas) return;
    const dataURL = fabricCanvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
    });
    const link = document.createElement("a");
    link.download = "design.png";
    link.href = dataURL;
    link.click();
    toast.success("Design exported");
  };

  const handleSave = async () => {
    if (!fabricCanvas) return;
    const json = fabricCanvas.toJSON();
    // Save to local storage for now
    localStorage.setItem("fabric-design", JSON.stringify(json));
    toast.success("Design saved");
  };

  const tools = [
    { id: "select", icon: MousePointer2, label: "Select" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "circle", icon: CircleIcon, label: "Circle" },
    { id: "text", icon: Type, label: "Text" },
    { id: "image", icon: ImageIcon, label: "Image" },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Elements */}
      <ElementsPanel fabricCanvas={fabricCanvas} onAddShape={addShape} />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-16 border-b border-border bg-card flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.id}
                  variant={activeTool === tool.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setActiveTool(tool.id as any);
                    if (tool.id !== "select") {
                      addShape(tool.id as any);
                    }
                  }}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tool.label}</span>
                </Button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button variant="ghost" size="sm" onClick={() => setShowLayers(!showLayers)}>
              <Layers className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowProperties(!showProperties)}>
              <Settings2 className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button variant="ghost" size="sm" onClick={() => setGalleryOpen(true)}>
              <FolderOpen className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
            {selectedObject && (
              <Button variant="ghost" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-muted/30 p-8">
          <div className="bg-white shadow-lg mx-auto" style={{ width: "fit-content" }}>
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>

      {/* Right Panels */}
      {showLayers && (
        <LayersPanel fabricCanvas={fabricCanvas} selectedObject={selectedObject} />
      )}
      
      {showProperties && (
        <PropertiesPanel 
          fabricCanvas={fabricCanvas} 
          selectedObject={selectedObject}
          onUpdate={() => fabricCanvas?.renderAll()}
        />
      )}

      {/* Dialogs */}
      <SaveTemplateDialog 
        open={saveDialogOpen} 
        onOpenChange={setSaveDialogOpen}
        onSave={async (data) => {
          await handleSave();
          setSaveDialogOpen(false);
        }}
      />
      <TemplateGallery 
        open={galleryOpen} 
        onOpenChange={setGalleryOpen}
        onLoadTemplate={(template) => {
          // Load template logic
          setGalleryOpen(false);
        }}
      />
    </div>
  );
};
