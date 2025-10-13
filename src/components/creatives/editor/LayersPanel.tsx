import { Canvas as FabricCanvas } from "fabric";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, EyeOff, Lock, Unlock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface LayersPanelProps {
  fabricCanvas: FabricCanvas | null;
  selectedObject: any;
}

export const LayersPanel = ({ fabricCanvas, selectedObject }: LayersPanelProps) => {
  const [objects, setObjects] = useState<any[]>([]);

  useEffect(() => {
    if (!fabricCanvas) return;

    const updateLayers = () => {
      setObjects(fabricCanvas.getObjects());
    };

    fabricCanvas.on("object:added", updateLayers);
    fabricCanvas.on("object:removed", updateLayers);
    fabricCanvas.on("object:modified", updateLayers);

    updateLayers();

    return () => {
      fabricCanvas.off("object:added", updateLayers);
      fabricCanvas.off("object:removed", updateLayers);
      fabricCanvas.off("object:modified", updateLayers);
    };
  }, [fabricCanvas]);

  const handleSelect = (obj: any) => {
    if (!fabricCanvas) return;
    fabricCanvas.setActiveObject(obj);
    fabricCanvas.renderAll();
  };

  const handleDelete = (obj: any) => {
    if (!fabricCanvas) return;
    fabricCanvas.remove(obj);
    fabricCanvas.renderAll();
  };

  const toggleVisibility = (obj: any) => {
    obj.visible = !obj.visible;
    fabricCanvas?.renderAll();
    setObjects([...objects]);
  };

  const toggleLock = (obj: any) => {
    obj.selectable = !obj.selectable;
    obj.evented = !obj.evented;
    fabricCanvas?.renderAll();
    setObjects([...objects]);
  };

  const getObjectName = (obj: any) => {
    if (obj.type === "i-text" || obj.type === "text") return "Text";
    if (obj.type === "rect") return "Rectangle";
    if (obj.type === "circle") return "Circle";
    if (obj.type === "line") return "Line";
    if (obj.type === "image") return "Image";
    return obj.type || "Object";
  };

  return (
    <div className="w-64 border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm">Layers</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {objects.length} {objects.length === 1 ? "object" : "objects"}
        </p>
      </div>

      {/* Layers List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {objects.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No objects yet. Add some elements to get started.
            </div>
          ) : (
            <div className="space-y-1">
              {objects.map((obj, index) => (
                <div
                  key={index}
                  onClick={() => handleSelect(obj)}
                  className={`p-2 rounded-md cursor-pointer transition-colors ${
                    selectedObject === obj
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex-1">
                      {getObjectName(obj)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVisibility(obj);
                        }}
                      >
                        {obj.visible !== false ? (
                          <Eye className="h-3 w-3" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLock(obj);
                        }}
                      >
                        {obj.selectable !== false ? (
                          <Unlock className="h-3 w-3" />
                        ) : (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(obj);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
