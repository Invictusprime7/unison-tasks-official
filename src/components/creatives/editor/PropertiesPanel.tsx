import { Canvas as FabricCanvas } from "fabric";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";

interface PropertiesPanelProps {
  fabricCanvas: FabricCanvas | null;
  selectedObject: any;
  onUpdate: () => void;
}

export const PropertiesPanel = ({ fabricCanvas, selectedObject, onUpdate }: PropertiesPanelProps) => {
  const [properties, setProperties] = useState<any>({});

  useEffect(() => {
    if (selectedObject) {
      setProperties({
        fill: selectedObject.fill || "#000000",
        stroke: selectedObject.stroke || "",
        strokeWidth: selectedObject.strokeWidth || 0,
        opacity: selectedObject.opacity || 1,
        left: Math.round(selectedObject.left || 0),
        top: Math.round(selectedObject.top || 0),
        width: Math.round(selectedObject.width * (selectedObject.scaleX || 1)),
        height: Math.round(selectedObject.height * (selectedObject.scaleY || 1)),
        angle: Math.round(selectedObject.angle || 0),
      });
    }
  }, [selectedObject]);

  const updateProperty = (key: string, value: any) => {
    if (!selectedObject) return;
    
    selectedObject.set(key, value);
    fabricCanvas?.renderAll();
    onUpdate();
    
    setProperties((prev: any) => ({ ...prev, [key]: value }));
  };

  if (!selectedObject) {
    return (
      <div className="w-64 border-l border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Select an object to view its properties
          </p>
        </div>
      </div>
    );
  }

  const isText = selectedObject.type === "i-text" || selectedObject.type === "text";

  return (
    <div className="w-64 border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm">Properties</h3>
        <p className="text-xs text-muted-foreground mt-1 capitalize">
          {selectedObject.type || "Object"}
        </p>
      </div>

      {/* Properties */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Position */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Position</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">X</Label>
                <Input
                  type="number"
                  value={properties.left}
                  onChange={(e) => updateProperty("left", Number(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Y</Label>
                <Input
                  type="number"
                  value={properties.top}
                  onChange={(e) => updateProperty("top", Number(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Size */}
          {selectedObject.width && selectedObject.height && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Size</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">W</Label>
                  <Input
                    type="number"
                    value={properties.width}
                    onChange={(e) => {
                      const newWidth = Number(e.target.value);
                      selectedObject.set("width", newWidth / (selectedObject.scaleX || 1));
                      fabricCanvas?.renderAll();
                      onUpdate();
                    }}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">H</Label>
                  <Input
                    type="number"
                    value={properties.height}
                    onChange={(e) => {
                      const newHeight = Number(e.target.value);
                      selectedObject.set("height", newHeight / (selectedObject.scaleY || 1));
                      fabricCanvas?.renderAll();
                      onUpdate();
                    }}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Rotation */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Rotation</Label>
            <Input
              type="number"
              value={properties.angle}
              onChange={(e) => updateProperty("angle", Number(e.target.value))}
              className="h-8 text-sm"
            />
          </div>

          {/* Fill Color */}
          {selectedObject.fill && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Fill Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={typeof properties.fill === 'string' ? properties.fill : '#000000'}
                  onChange={(e) => updateProperty("fill", e.target.value)}
                  className="h-8 w-16 p-1"
                />
                <Input
                  type="text"
                  value={typeof properties.fill === 'string' ? properties.fill : '#000000'}
                  onChange={(e) => updateProperty("fill", e.target.value)}
                  className="h-8 text-sm flex-1"
                />
              </div>
            </div>
          )}

          {/* Stroke */}
          {selectedObject.stroke !== undefined && (
            <>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Stroke Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={properties.stroke || "#000000"}
                    onChange={(e) => updateProperty("stroke", e.target.value)}
                    className="h-8 w-16 p-1"
                  />
                  <Input
                    type="text"
                    value={properties.stroke || ""}
                    onChange={(e) => updateProperty("stroke", e.target.value)}
                    className="h-8 text-sm flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Stroke Width</Label>
                <Slider
                  value={[properties.strokeWidth]}
                  onValueChange={([value]) => updateProperty("strokeWidth", value)}
                  max={20}
                  step={1}
                  className="py-4"
                />
              </div>
            </>
          )}

          {/* Opacity */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Opacity ({Math.round(properties.opacity * 100)}%)
            </Label>
            <Slider
              value={[properties.opacity]}
              onValueChange={([value]) => updateProperty("opacity", value)}
              max={1}
              step={0.01}
              className="py-4"
            />
          </div>

          {/* Text specific properties */}
          {isText && (
            <>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Font Size</Label>
                <Input
                  type="number"
                  value={selectedObject.fontSize || 16}
                  onChange={(e) => updateProperty("fontSize", Number(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
