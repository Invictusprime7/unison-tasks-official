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

interface FabricObjectProperties {
  left: number;
  top: number;
  width: number;
  height: number;
  opacity: number;
  angle: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius: number;
}

interface SelectedFabricObject {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  opacity?: number;
  angle?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rx?: number;
  ry?: number;
  padding?: number;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  textAlign?: string;
  shadow?: { toString: () => string };
  globalCompositeOperation?: string;
  skewX?: number;
  skewY?: number;
  type?: string;
  blockData?: { id?: string };
  set: (key: string | Record<string, unknown>, value?: string | number) => void;
  bringForward?: () => void;
  sendBackwards?: () => void;
}

interface WebPropertiesPanelProps {
  fabricCanvas: FabricCanvas | null;
  selectedObject: SelectedFabricObject | null;
  onUpdate: () => void;
}

export const WebPropertiesPanel = ({ fabricCanvas, selectedObject, onUpdate }: WebPropertiesPanelProps) => {
  // Initialize properties directly from selectedObject to avoid cascading renders
  const getPropertiesFromObject = (obj: SelectedFabricObject): FabricObjectProperties => ({
    left: Math.round(obj?.left || 0),
    top: Math.round(obj?.top || 0),
    width: Math.round((obj?.width || 0) * (obj?.scaleX || 1)),
    height: Math.round((obj?.height || 0) * (obj?.scaleY || 1)),
    opacity: obj?.opacity || 1,
    angle: Math.round(obj?.angle || 0),
    fill: obj?.fill || "#000000",
    stroke: obj?.stroke || "transparent",
    strokeWidth: obj?.strokeWidth || 0,
    borderRadius: obj?.rx || 0,
  });

  const [properties, setProperties] = useState<FabricObjectProperties>(() => 
    selectedObject ? getPropertiesFromObject(selectedObject) : {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      opacity: 1,
      angle: 0,
      fill: "#000000",
      stroke: "transparent",
      strokeWidth: 0,
      borderRadius: 0,
    }
  );

  // Update properties when selectedObject changes
  if (selectedObject && properties.left !== Math.round(selectedObject.left || 0)) {
    setProperties(getPropertiesFromObject(selectedObject));
  }

  const updateProperty = (key: string, value: string | number) => {
    if (!selectedObject) return;
    
    selectedObject.set(key, value);
    fabricCanvas?.renderAll();
    onUpdate();
    
    setProperties((prev) => ({ ...prev, [key]: value }));
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

            {/* Spacing/Padding (for templates) */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Padding</Label>
              <Input
                type="number"
                value={selectedObject.padding || 0}
                onChange={(e) => updateProperty("padding", Number(e.target.value))}
                className="h-8 text-sm"
                placeholder="0"
                min="0"
              />
            </div>

            {/* Layer Order */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Layer Order</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    selectedObject.bringForward();
                    fabricCanvas?.renderAll();
                    onUpdate();
                  }}
                  className="h-8 px-3 text-xs border rounded hover:bg-accent"
                >
                  Bring Forward
                </button>
                <button
                  onClick={() => {
                    selectedObject.sendBackwards();
                    fabricCanvas?.renderAll();
                    onUpdate();
                  }}
                  className="h-8 px-3 text-xs border rounded hover:bg-accent"
                >
                  Send Backward
                </button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="style" className="p-4 space-y-4">
            {/* Text Content for Text Objects */}
            {(selectedObject.type === "text" || selectedObject.type === "i-text" || selectedObject.type === "textbox") && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Text Content</Label>
                <Input
                  type="text"
                  value={selectedObject.text || ""}
                  onChange={(e) => updateProperty("text", e.target.value)}
                  className="h-8 text-sm"
                  placeholder="Enter text..."
                />
              </div>
            )}

            {/* Typography Controls for Text */}
            {(selectedObject.type === "text" || selectedObject.type === "i-text" || selectedObject.type === "textbox") && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Font Family</Label>
                  <Select
                    value={selectedObject.fontFamily || "Arial"}
                    onValueChange={(value) => updateProperty("fontFamily", value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Verdana">Verdana</SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Font Size</Label>
                  <Input
                    type="number"
                    value={selectedObject.fontSize || 16}
                    onChange={(e) => updateProperty("fontSize", Number(e.target.value))}
                    className="h-8 text-sm"
                    min="8"
                    max="200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Font Weight</Label>
                  <Select
                    value={String(selectedObject.fontWeight || "normal")}
                    onValueChange={(value) => updateProperty("fontWeight", value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="100">Thin (100)</SelectItem>
                      <SelectItem value="300">Light (300)</SelectItem>
                      <SelectItem value="500">Medium (500)</SelectItem>
                      <SelectItem value="600">Semi Bold (600)</SelectItem>
                      <SelectItem value="700">Bold (700)</SelectItem>
                      <SelectItem value="900">Black (900)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Text Align</Label>
                  <Select
                    value={selectedObject.textAlign || "left"}
                    onValueChange={(value) => updateProperty("textAlign", value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="justify">Justify</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

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

            {/* Shadow */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Shadow</Label>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="e.g., 0 4px 6px rgba(0,0,0,0.1)"
                  value={selectedObject.shadow?.toString() || ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      updateProperty("shadow", e.target.value);
                    } else {
                      updateProperty("shadow", null);
                    }
                  }}
                  className="h-8 text-sm"
                />
              </div>
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
                  <SelectItem value="color-dodge">Color Dodge</SelectItem>
                  <SelectItem value="color-burn">Color Burn</SelectItem>
                  <SelectItem value="hard-light">Hard Light</SelectItem>
                  <SelectItem value="soft-light">Soft Light</SelectItem>
                  <SelectItem value="difference">Difference</SelectItem>
                  <SelectItem value="exclusion">Exclusion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Skew */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Skew X ({selectedObject.skewX || 0}°)</Label>
              <Slider
                value={[selectedObject.skewX || 0]}
                onValueChange={([value]) => updateProperty("skewX", value)}
                min={-45}
                max={45}
                step={1}
                className="py-4"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Skew Y ({selectedObject.skewY || 0}°)</Label>
              <Slider
                value={[selectedObject.skewY || 0]}
                onValueChange={([value]) => updateProperty("skewY", value)}
                min={-45}
                max={45}
                step={1}
                className="py-4"
              />
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
