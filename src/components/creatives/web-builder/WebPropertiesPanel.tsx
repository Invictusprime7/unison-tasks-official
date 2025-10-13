import { Canvas as FabricCanvas } from "fabric";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { CopyRewritePanel } from "./CopyRewritePanel";
import { ImageOperationsPanel } from "./ImageOperationsPanel";

interface WebPropertiesPanelProps {
  fabricCanvas: FabricCanvas | null;
  selectedObject: any;
  onUpdate: () => void;
}

export const WebPropertiesPanel = ({ fabricCanvas, selectedObject, onUpdate }: WebPropertiesPanelProps) => {
  const [properties, setProperties] = useState<any>({});

  useEffect(() => {
    if (selectedObject) {
      setProperties({
        left: Math.round(selectedObject.left || 0),
        top: Math.round(selectedObject.top || 0),
        width: Math.round((selectedObject.width || 0) * (selectedObject.scaleX || 1)),
        height: Math.round((selectedObject.height || 0) * (selectedObject.scaleY || 1)),
        opacity: selectedObject.opacity || 1,
        angle: Math.round(selectedObject.angle || 0),
        fill: selectedObject.fill || "#000000",
        stroke: selectedObject.stroke || "transparent",
        strokeWidth: selectedObject.strokeWidth || 0,
        borderRadius: selectedObject.rx || 0,
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
            Select a component to view its properties
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm">Properties</h3>
        <p className="text-xs text-muted-foreground mt-1 capitalize">
          {selectedObject.blockData?.id || selectedObject.type || "Component"}
        </p>
      </div>

      {/* Properties */}
      <ScrollArea className="flex-1">
        <Tabs defaultValue="layout" className="w-full">
          <TabsList className="w-full grid grid-cols-5 h-9">
            <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
            <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
            <TabsTrigger value="effects" className="text-xs">Effects</TabsTrigger>
            <TabsTrigger value="copy" className="text-xs">Copy</TabsTrigger>
            <TabsTrigger value="image" className="text-xs">Image</TabsTrigger>
          </TabsList>

          <TabsContent value="layout" className="p-4 space-y-4">
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
              <Label className="text-xs text-muted-foreground">Rotation ({properties.angle}°)</Label>
              <Slider
                value={[properties.angle]}
                onValueChange={([value]) => updateProperty("angle", value)}
                max={360}
                step={1}
                className="py-4"
              />
            </div>
          </TabsContent>

          <TabsContent value="style" className="p-4 space-y-4">
            {/* Fill Color */}
            {selectedObject.fill !== undefined && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Fill Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={properties.fill}
                    onChange={(e) => updateProperty("fill", e.target.value)}
                    className="h-8 w-16"
                  />
                  <Input
                    type="text"
                    value={properties.fill}
                    onChange={(e) => updateProperty("fill", e.target.value)}
                    className="h-8 flex-1 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Stroke */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Stroke</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={properties.stroke === "transparent" ? "#000000" : properties.stroke}
                  onChange={(e) => updateProperty("stroke", e.target.value)}
                  className="h-8 w-16"
                />
                <Input
                  type="number"
                  value={properties.strokeWidth}
                  onChange={(e) => updateProperty("strokeWidth", Number(e.target.value))}
                  placeholder="Width"
                  className="h-8 flex-1 text-sm"
                />
              </div>
            </div>

            {/* Border Radius */}
            {selectedObject.type === "rect" && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Border Radius</Label>
                <Input
                  type="number"
                  value={properties.borderRadius}
                  onChange={(e) => {
                    const radius = Number(e.target.value);
                    selectedObject.set({ rx: radius, ry: radius });
                    fabricCanvas?.renderAll();
                    onUpdate();
                  }}
                  className="h-8 text-sm"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="effects" className="p-4 space-y-4">
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

            {/* Blend Mode */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Blend Mode</Label>
              <Select
                value={selectedObject.globalCompositeOperation || "source-over"}
                onValueChange={(value) => updateProperty("globalCompositeOperation", value)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="source-over">Normal</SelectItem>
                  <SelectItem value="multiply">Multiply</SelectItem>
                  <SelectItem value="screen">Screen</SelectItem>
                  <SelectItem value="overlay">Overlay</SelectItem>
                  <SelectItem value="darken">Darken</SelectItem>
                  <SelectItem value="lighten">Lighten</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="copy" className="p-0">
            <CopyRewritePanel
              selectedObject={selectedObject}
              onUpdate={(newText) => {
                if (selectedObject) {
                  selectedObject.set({ text: newText });
                  fabricCanvas?.renderAll();
                  onUpdate();
                }
              }}
            />
          </TabsContent>

          <TabsContent value="image" className="p-0">
            <ImageOperationsPanel
              selectedObject={selectedObject}
              fabricCanvas={fabricCanvas}
              onUpdate={onUpdate}
            />
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
};
