import { Canvas as FabricCanvas } from "fabric";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface PropertiesPanelProps {
  fabricCanvas: FabricCanvas | null;
  selectedObject: any;
}

export const PropertiesPanel = ({ fabricCanvas, selectedObject }: PropertiesPanelProps) => {
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
      });
    }
  }, [selectedObject]);

  const updateProperty = (key: string, value: any) => {
    if (!selectedObject) return;
    
    selectedObject.set(key, value);
    fabricCanvas?.renderAll();
    
    setProperties((prev: any) => ({ ...prev, [key]: value }));
  };

  if (!selectedObject) {
    return (
      <div className="w-72 bg-[#1a1a1a] border-l border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white/90">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <p className="text-sm text-white/30">
            Select a component to view properties
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-[#1a1a1a] border-l border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h3 className="text-sm font-semibold text-white/90">Properties</h3>
        <p className="text-xs text-white/40 mt-1 capitalize">
          {selectedObject.blockData?.id || selectedObject.type || "Component"}
        </p>
      </div>

      {/* Properties Tabs */}
      <Tabs defaultValue="transform" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3 bg-[#252525] border-b border-white/10">
          <TabsTrigger value="transform" className="text-xs">Transform</TabsTrigger>
          <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
          <TabsTrigger value="advanced" className="text-xs">Advanced</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="transform" className="p-4 space-y-4 m-0">
            {/* Position */}
            <div className="space-y-2">
              <Label className="text-xs text-white/40 uppercase tracking-wider">Position</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-white/60">X</Label>
                  <Input
                    type="number"
                    value={properties.left}
                    onChange={(e) => updateProperty("left", Number(e.target.value))}
                    className="h-8 text-sm bg-white/5 border-white/10 text-white/90"
                  />
                </div>
                <div>
                  <Label className="text-xs text-white/60">Y</Label>
                  <Input
                    type="number"
                    value={properties.top}
                    onChange={(e) => updateProperty("top", Number(e.target.value))}
                    className="h-8 text-sm bg-white/5 border-white/10 text-white/90"
                  />
                </div>
              </div>
            </div>

            {/* Size */}
            {selectedObject.width && selectedObject.height && (
              <div className="space-y-2">
                <Label className="text-xs text-white/40 uppercase tracking-wider">Size</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-white/60">W</Label>
                    <Input
                      type="number"
                      value={properties.width}
                      onChange={(e) => {
                        const newWidth = Number(e.target.value);
                        selectedObject.set("width", newWidth / (selectedObject.scaleX || 1));
                        fabricCanvas?.renderAll();
                      }}
                      className="h-8 text-sm bg-white/5 border-white/10 text-white/90"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-white/60">H</Label>
                    <Input
                      type="number"
                      value={properties.height}
                      onChange={(e) => {
                        const newHeight = Number(e.target.value);
                        selectedObject.set("height", newHeight / (selectedObject.scaleY || 1));
                        fabricCanvas?.renderAll();
                      }}
                      className="h-8 text-sm bg-white/5 border-white/10 text-white/90"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Rotation */}
            <div className="space-y-2">
              <Label className="text-xs text-white/40 uppercase tracking-wider">Rotation</Label>
              <Input
                type="number"
                value={properties.angle}
                onChange={(e) => updateProperty("angle", Number(e.target.value))}
                className="h-8 text-sm bg-white/5 border-white/10 text-white/90"
              />
            </div>

            {/* Scale */}
            <div className="space-y-2">
              <Label className="text-xs text-white/40 uppercase tracking-wider">Scale</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-white/60">X</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={selectedObject.scaleX || 1}
                    onChange={(e) => updateProperty("scaleX", Number(e.target.value))}
                    className="h-8 text-sm bg-white/5 border-white/10 text-white/90"
                  />
                </div>
                <div>
                  <Label className="text-xs text-white/60">Y</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={selectedObject.scaleY || 1}
                    onChange={(e) => updateProperty("scaleY", Number(e.target.value))}
                    className="h-8 text-sm bg-white/5 border-white/10 text-white/90"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="style" className="p-4 space-y-4 m-0">
            {/* Fill Color */}
            {selectedObject.fill !== undefined && (
              <div className="space-y-2">
                <Label className="text-xs text-white/40 uppercase tracking-wider">Fill Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={typeof selectedObject.fill === "string" ? selectedObject.fill : "#000000"}
                    onChange={(e) => updateProperty("fill", e.target.value)}
                    className="h-10 w-16 p-1 cursor-pointer bg-white/5 border-white/10"
                  />
                  <Input
                    type="text"
                    value={typeof selectedObject.fill === "string" ? selectedObject.fill : "#000000"}
                    onChange={(e) => updateProperty("fill", e.target.value)}
                    className="h-10 flex-1 text-sm bg-white/5 border-white/10 text-white/90"
                    placeholder="#000000"
                  />
                </div>
              </div>
            )}

            {/* Stroke */}
            {selectedObject.stroke !== undefined && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs text-white/40 uppercase tracking-wider">Stroke Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={selectedObject.stroke || "#000000"}
                      onChange={(e) => updateProperty("stroke", e.target.value)}
                      className="h-10 w-16 p-1 cursor-pointer bg-white/5 border-white/10"
                    />
                    <Input
                      type="text"
                      value={selectedObject.stroke || "#000000"}
                      onChange={(e) => updateProperty("stroke", e.target.value)}
                      className="h-10 flex-1 text-sm bg-white/5 border-white/10 text-white/90"
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-white/40 uppercase tracking-wider">Stroke Width</Label>
                  <Input
                    type="number"
                    value={selectedObject.strokeWidth || 0}
                    onChange={(e) => updateProperty("strokeWidth", Number(e.target.value))}
                    className="h-8 text-sm bg-white/5 border-white/10 text-white/90"
                  />
                </div>
              </>
            )}

            {/* Opacity */}
            <div className="space-y-2">
              <Label className="text-xs text-white/40 uppercase tracking-wider">
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

            {/* Border Radius (for rectangles) */}
            {selectedObject.type === "rect" && (
              <div className="space-y-2">
                <Label className="text-xs text-white/40 uppercase tracking-wider">Border Radius</Label>
                <Input
                  type="number"
                  value={selectedObject.rx || 0}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    updateProperty("rx", value);
                    updateProperty("ry", value);
                  }}
                  className="h-8 text-sm bg-white/5 border-white/10 text-white/90"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="p-4 space-y-4 m-0">
            {/* Shadow */}
            <div className="space-y-2">
              <Label className="text-xs text-white/40 uppercase tracking-wider">Shadow</Label>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-white/5 border-white/10 text-white/90 hover:bg-white/10"
                onClick={() => {
                  if (selectedObject.shadow) {
                    updateProperty("shadow", null);
                  } else {
                    updateProperty("shadow", {
                      color: "rgba(0,0,0,0.3)",
                      blur: 10,
                      offsetX: 5,
                      offsetY: 5,
                    });
                  }
                }}
              >
                {selectedObject.shadow ? "Remove Shadow" : "Add Shadow"}
              </Button>
            </div>

            <Separator className="bg-white/10" />

            {/* Lock Controls */}
            <div className="space-y-2">
              <Label className="text-xs text-white/40 uppercase tracking-wider">Lock</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`text-xs ${selectedObject.lockMovementX ? "bg-white/20" : "bg-white/5"} border-white/10 text-white/90`}
                  onClick={() => {
                    updateProperty("lockMovementX", !selectedObject.lockMovementX);
                    updateProperty("lockMovementY", !selectedObject.lockMovementY);
                  }}
                >
                  {selectedObject.lockMovementX ? "Unlock Position" : "Lock Position"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`text-xs ${selectedObject.lockScalingX ? "bg-white/20" : "bg-white/5"} border-white/10 text-white/90`}
                  onClick={() => {
                    updateProperty("lockScalingX", !selectedObject.lockScalingX);
                    updateProperty("lockScalingY", !selectedObject.lockScalingY);
                  }}
                >
                  {selectedObject.lockScalingX ? "Unlock Scale" : "Lock Scale"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
