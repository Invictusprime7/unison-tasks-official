import { Canvas as FabricCanvas } from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect, useCallback } from "react";
import { Lock, Unlock, X, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Type, Palette, Box, Sparkles, ChevronDown, ChevronRight, Trash2, Plus } from "lucide-react";
import { CopyRewritePanel } from "./CopyRewritePanel";
import { ImageOperationsPanel } from "./ImageOperationsPanel";
import { loadWebFont } from "@/utils/fontLoader";

interface SelectedHTMLElement {
  tagName: string;
  textContent: string;
  styles: Record<string, string>;
  attributes: Record<string, string>;
  selector: string;
}

interface PropertiesPanelProps {
  fabricCanvas: FabricCanvas | null;
  selectedObject?: any;
  selectedHTMLElement?: SelectedHTMLElement | null;
  onUpdateHTMLElement?: (updates: Partial<SelectedHTMLElement>) => void;
  onCloseHTMLElement?: () => void;
  showCopyPanel?: boolean;
  showImagePanel?: boolean;
  onUpdate?: () => void;
}

// Categorized font families
const fontCategories = {
  sansSerif: [
    "Arial", "Helvetica", "Inter", "Roboto", "Montserrat", 
    "Open Sans", "Lato", "Poppins", "Nunito"
  ],
  serif: [
    "Times New Roman", "Georgia", "Playfair Display", "Merriweather"
  ],
  monospace: [
    "Courier New", "Fira Code", "JetBrains Mono", "Source Code Pro"
  ]
};

const fontWeights = ["300", "400", "500", "600", "700", "800", "900"];
const lineHeights = ["1", "1.25", "1.5", "1.75", "2", "2.5"];

const colorPalette = [
  "#000000", "#FFFFFF", "#EF4444", "#F97316", "#F59E0B", "#EAB308", 
  "#84CC16", "#22C55E", "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9",
  "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7", "#D946EF", "#EC4899",
  "#F43F5E", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0", "#F1F5F9"
];

const gradientPresets = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)"
];

const SAVED_COLORS_KEY = "webbuilder_saved_colors";

export const PropertiesPanel = ({ 
  fabricCanvas, 
  selectedObject, 
  selectedHTMLElement,
  onUpdateHTMLElement,
  onCloseHTMLElement,
  showCopyPanel = false,
  showImagePanel = false,
  onUpdate
}: PropertiesPanelProps) => {
  const [properties, setProperties] = useState<any>({});
  const [htmlStyles, setHtmlStyles] = useState<Record<string, string>>({});
  const [htmlText, setHtmlText] = useState("");
  const [aspectLocked, setAspectLocked] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [typographyOpen, setTypographyOpen] = useState(true);
  const [savedColors, setSavedColors] = useState<{color: string; usageCount: number}[]>([]);
  const [customGradient, setCustomGradient] = useState("");

  // Load saved colors from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SAVED_COLORS_KEY);
    if (stored) {
      try {
        setSavedColors(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse saved colors");
      }
    }
  }, []);

  // Save color to localStorage
  const saveColor = useCallback((color: string) => {
    setSavedColors(prev => {
      const existing = prev.find(c => c.color === color);
      let updated;
      if (existing) {
        updated = prev.map(c => c.color === color ? { ...c, usageCount: c.usageCount + 1 } : c);
      } else {
        updated = [...prev, { color, usageCount: 1 }].slice(-12); // Keep last 12 colors
      }
      localStorage.setItem(SAVED_COLORS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeColor = useCallback((color: string) => {
    setSavedColors(prev => {
      const updated = prev.filter(c => c.color !== color);
      localStorage.setItem(SAVED_COLORS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isHTMLElement = !!selectedHTMLElement;
  const isFabricObject = !!selectedObject && !isHTMLElement;

  useEffect(() => {
    if (selectedObject) {
      const width = Math.round((selectedObject.width || 0) * (selectedObject.scaleX || 1));
      const height = Math.round((selectedObject.height || 0) * (selectedObject.scaleY || 1));
      
      setProperties({
        left: Math.round(selectedObject.left || 0),
        top: Math.round(selectedObject.top || 0),
        width,
        height,
        opacity: selectedObject.opacity || 1,
        angle: Math.round(selectedObject.angle || 0),
        fill: selectedObject.fill || "#000000",
        stroke: selectedObject.stroke || "transparent",
        strokeWidth: selectedObject.strokeWidth || 0,
        borderRadius: selectedObject.rx || 0,
        shadow: selectedObject.shadow || null,
      });
      
      if (width && height) {
        setAspectRatio(width / height);
      }
    }
  }, [selectedObject]);

  useEffect(() => {
    if (selectedHTMLElement) {
      setHtmlStyles(selectedHTMLElement.styles || {});
      setHtmlText(selectedHTMLElement.textContent || "");
    }
  }, [selectedHTMLElement]);

  const updateProperty = (key: string, value: any) => {
    if (!selectedObject) return;
    
    if (key === "width" && aspectLocked && properties.height) {
      const newHeight = Math.round(value / aspectRatio);
      selectedObject.set({ 
        scaleX: value / (selectedObject.width || 1),
        scaleY: newHeight / (selectedObject.height || 1)
      });
      setProperties((prev: any) => ({ ...prev, width: value, height: newHeight }));
    } else if (key === "height" && aspectLocked && properties.width) {
      const newWidth = Math.round(value * aspectRatio);
      selectedObject.set({ 
        scaleX: newWidth / (selectedObject.width || 1),
        scaleY: value / (selectedObject.height || 1)
      });
      setProperties((prev: any) => ({ ...prev, width: newWidth, height: value }));
    } else {
      selectedObject.set(key, value);
      setProperties((prev: any) => ({ ...prev, [key]: value }));
    }
    
    fabricCanvas?.renderAll();
    onUpdate?.();
  };

  const updateHTMLStyle = (property: string, value: string) => {
    if (!selectedHTMLElement || !onUpdateHTMLElement) return;
    const newStyles = { ...htmlStyles, [property]: value };
    setHtmlStyles(newStyles);
    onUpdateHTMLElement({ styles: newStyles });
  };

  const updateHTMLText = (value: string) => {
    if (!selectedHTMLElement || !onUpdateHTMLElement) return;
    setHtmlText(value);
    onUpdateHTMLElement({ textContent: value });
  };

  if (!isFabricObject && !isHTMLElement) {
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

  const isTextElement = selectedHTMLElement && ["p", "h1", "h2", "h3", "h4", "h5", "h6", "span", "a", "button", "label"].includes(selectedHTMLElement.tagName.toLowerCase());

  return (
    <div className="w-64 border-l border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Properties</h3>
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            {isHTMLElement ? `HTML: ${selectedHTMLElement?.tagName.toLowerCase()}` : 
             selectedObject?.blockData?.id || selectedObject?.type || "Component"}
          </p>
        </div>
        {isHTMLElement && onCloseHTMLElement && (
          <Button variant="ghost" size="icon" onClick={onCloseHTMLElement} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        {isFabricObject && (
          <Tabs defaultValue="layout" className="w-full">
            <TabsList className={`w-full grid h-9 ${showCopyPanel && showImagePanel ? 'grid-cols-5' : showCopyPanel || showImagePanel ? 'grid-cols-4' : 'grid-cols-3'}`}>
              <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
              <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
              <TabsTrigger value="effects" className="text-xs">Effects</TabsTrigger>
              {showCopyPanel && <TabsTrigger value="copy" className="text-xs">Copy</TabsTrigger>}
              {showImagePanel && <TabsTrigger value="image" className="text-xs">Image</TabsTrigger>}
            </TabsList>

            
            <TabsContent value="layout" className="p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <Box className="h-3 w-3" />
                  Position
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">X</Label>
                    <Input type="number" value={properties.left} onChange={(e) => updateProperty("left", Number(e.target.value))} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Y</Label>
                    <Input type="number" value={properties.top} onChange={(e) => updateProperty("top", Number(e.target.value))} className="h-8 text-sm" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Size</Label>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => setAspectLocked(!aspectLocked)}
                  >
                    {aspectLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Width</Label>
                    <Input type="number" value={properties.width} onChange={(e) => updateProperty("width", Number(e.target.value))} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Height</Label>
                    <Input type="number" value={properties.height} onChange={(e) => updateProperty("height", Number(e.target.value))} className="h-8 text-sm" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Rotation</Label>
                  <div className="flex items-center gap-2">
                    <Slider 
                      value={[properties.angle || 0]} 
                      min={0} 
                      max={360} 
                      step={1}
                      onValueChange={([value]) => updateProperty("angle", value)}
                      className="flex-1"
                    />
                    <Input 
                      type="number" 
                      value={properties.angle || 0} 
                      onChange={(e) => updateProperty("angle", Number(e.target.value))} 
                      className="h-8 w-16 text-sm" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Opacity</Label>
                  <div className="flex items-center gap-2">
                    <Slider 
                      value={[properties.opacity * 100 || 100]} 
                      min={0} 
                      max={100} 
                      step={1}
                      onValueChange={([value]) => updateProperty("opacity", value / 100)}
                      className="flex-1"
                    />
                    <Input 
                      type="number" 
                      value={Math.round(properties.opacity * 100) || 100} 
                      onChange={(e) => updateProperty("opacity", Number(e.target.value) / 100)} 
                      className="h-8 w-16 text-sm" 
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="style" className="p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <Palette className="h-3 w-3" />
                  Fill Color
                </Label>
                <div className="space-y-2">
                  <Input 
                    type="color" 
                    value={properties.fill || "#000000"} 
                    onChange={(e) => updateProperty("fill", e.target.value)} 
                    className="h-10 w-full cursor-pointer"
                  />
                  <div className="grid grid-cols-8 gap-1">
                    {colorPalette.map((color) => (
                      <button
                        key={color}
                        className="h-6 w-6 rounded border border-border hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => updateProperty("fill", color)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Border</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input 
                      type="color" 
                      value={properties.stroke || "#000000"} 
                      onChange={(e) => updateProperty("stroke", e.target.value)} 
                      className="h-8 w-20 cursor-pointer"
                    />
                    <Input 
                      type="number" 
                      value={properties.strokeWidth || 0} 
                      onChange={(e) => updateProperty("strokeWidth", Number(e.target.value))} 
                      placeholder="Width"
                      className="h-8 text-sm flex-1"
                    />
                  </div>
                  <div className="grid grid-cols-8 gap-1">
                    {colorPalette.slice(0, 8).map((color) => (
                      <button
                        key={color}
                        className="h-6 w-6 rounded border border-border hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => updateProperty("stroke", color)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Corner Radius</Label>
                <div className="flex items-center gap-2">
                  <Slider 
                    value={[properties.borderRadius || 0]} 
                    min={0} 
                    max={100} 
                    step={1}
                    onValueChange={([value]) => updateProperty("rx", value)}
                    className="flex-1"
                  />
                  <Input 
                    type="number" 
                    value={properties.borderRadius || 0} 
                    onChange={(e) => updateProperty("rx", Number(e.target.value))} 
                    className="h-8 w-16 text-sm" 
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="effects" className="p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-3 w-3" />
                  Shadow
                </Label>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => {
                      if (properties.shadow) {
                        selectedObject.set('shadow', null);
                        updateProperty('shadow', null);
                      } else {
                        const shadow = {
                          color: 'rgba(0,0,0,0.3)',
                          blur: 10,
                          offsetX: 5,
                          offsetY: 5
                        };
                        selectedObject.set('shadow', shadow);
                        updateProperty('shadow', shadow);
                      }
                    }}
                  >
                    {properties.shadow ? 'Remove Shadow' : 'Add Shadow'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {showCopyPanel && (
              <TabsContent value="copy" className="p-0">
                <CopyRewritePanel selectedObject={selectedObject} onUpdate={(newText) => { selectedObject?.set({ text: newText }); fabricCanvas?.renderAll(); onUpdate?.(); }} />
              </TabsContent>
            )}
            {showImagePanel && (
              <TabsContent value="image" className="p-0">
                <ImageOperationsPanel selectedObject={selectedObject} fabricCanvas={fabricCanvas} onUpdate={onUpdate || (() => {})} />
              </TabsContent>
            )}
          </Tabs>
        )}

        {isHTMLElement && selectedHTMLElement && (
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="w-full grid grid-cols-4 h-9">
              <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
              <TabsTrigger value="text" className="text-xs">Text</TabsTrigger>
              <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
              <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="p-4 space-y-4">
              {isTextElement && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Text Content</Label>
                  <Input value={htmlText} onChange={(e) => updateHTMLText(e.target.value)} placeholder="Enter text..." className="text-sm" />
                </div>
              )}
            </TabsContent>

            <TabsContent value="text" className="p-4 space-y-4">
              <Collapsible open={typographyOpen} onOpenChange={setTypographyOpen}>
                <CollapsibleTrigger className="flex items-center gap-2 w-full text-xs text-muted-foreground hover:text-foreground">
                  {typographyOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  <Type className="h-3 w-3" />
                  Typography
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-3">
                  {/* Font Family - Categorized Dropdown */}
                  <div className="space-y-2">
                    <Label className="text-xs">Font Family</Label>
                    <Select 
                      value={htmlStyles.fontFamily || "Arial"} 
                      onValueChange={(value) => {
                        loadWebFont(value);
                        updateHTMLStyle("fontFamily", value);
                      }}
                    >
                      <SelectTrigger className="text-sm h-8">
                        <SelectValue placeholder="Font Family" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectGroup>
                          <SelectLabel className="text-xs font-semibold text-muted-foreground">Sans Serif</SelectLabel>
                          {fontCategories.sansSerif.map((font) => (
                            <SelectItem key={font} value={font} className="text-sm" style={{ fontFamily: font }}>
                              {font}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-xs font-semibold text-muted-foreground">Serif</SelectLabel>
                          {fontCategories.serif.map((font) => (
                            <SelectItem key={font} value={font} className="text-sm" style={{ fontFamily: font }}>
                              {font}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-xs font-semibold text-muted-foreground">Monospace</SelectLabel>
                          {fontCategories.monospace.map((font) => (
                            <SelectItem key={font} value={font} className="text-sm" style={{ fontFamily: font }}>
                              {font}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Font Size - Slider with px indicator */}
                  <div className="space-y-2">
                    <Label className="text-xs">Font Size</Label>
                    <div className="flex items-center gap-2">
                      <Slider 
                        value={[parseInt(htmlStyles.fontSize?.replace('px', '') || "16")]} 
                        min={8} 
                        max={120} 
                        step={1}
                        onValueChange={([value]) => updateHTMLStyle("fontSize", `${value}px`)}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-1 min-w-[60px]">
                        <Input 
                          type="number" 
                          value={parseInt(htmlStyles.fontSize?.replace('px', '') || "16")} 
                          onChange={(e) => updateHTMLStyle("fontSize", `${e.target.value}px`)} 
                          className="h-7 w-12 text-xs text-center" 
                          min={8}
                          max={120}
                        />
                        <span className="text-xs text-muted-foreground">px</span>
                      </div>
                    </div>
                  </div>

                  {/* Font Weight */}
                  <div className="space-y-2">
                    <Label className="text-xs">Weight</Label>
                    <Select value={htmlStyles.fontWeight || "400"} onValueChange={(value) => updateHTMLStyle("fontWeight", value)}>
                      <SelectTrigger className="text-sm h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>{fontWeights.map((weight) => <SelectItem key={weight} value={weight}>{weight}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Line Height</Label>
                <Select value={htmlStyles.lineHeight || "1.5"} onValueChange={(value) => updateHTMLStyle("lineHeight", value)}>
                  <SelectTrigger className="text-sm h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>{lineHeights.map((height) => <SelectItem key={height} value={height}>{height}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Letter Spacing</Label>
                <div className="flex items-center gap-2">
                  <Slider 
                    value={[parseFloat(htmlStyles.letterSpacing || "0")]} 
                    min={-2} 
                    max={10} 
                    step={0.1}
                    onValueChange={([value]) => updateHTMLStyle("letterSpacing", `${value}px`)}
                    className="flex-1"
                  />
                  <Input 
                    type="number" 
                    value={parseFloat(htmlStyles.letterSpacing || "0")} 
                    onChange={(e) => updateHTMLStyle("letterSpacing", `${e.target.value}px`)} 
                    className="h-8 w-16 text-sm" 
                    step="0.1"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Text Style</Label>
                <ToggleGroup type="multiple" className="justify-start">
                  <ToggleGroupItem value="bold" size="sm" onClick={() => updateHTMLStyle("fontWeight", htmlStyles.fontWeight === "700" ? "400" : "700")}>
                    <Bold className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="italic" size="sm" onClick={() => updateHTMLStyle("fontStyle", htmlStyles.fontStyle === "italic" ? "normal" : "italic")}>
                    <Italic className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="underline" size="sm" onClick={() => updateHTMLStyle("textDecoration", htmlStyles.textDecoration === "underline" ? "none" : "underline")}>
                    <Underline className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Text Align</Label>
                <ToggleGroup type="single" value={htmlStyles.textAlign || "left"} onValueChange={(value) => value && updateHTMLStyle("textAlign", value)} className="justify-start">
                  <ToggleGroupItem value="left" size="sm">
                    <AlignLeft className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="center" size="sm">
                    <AlignCenter className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="right" size="sm">
                    <AlignRight className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="justify" size="sm">
                    <AlignJustify className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </TabsContent>

            <TabsContent value="layout" className="p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Spacing</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Padding</Label>
                    <Input 
                      value={htmlStyles.padding || "0"} 
                      onChange={(e) => updateHTMLStyle("padding", e.target.value)} 
                      placeholder="0px"
                      className="h-8 text-sm" 
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Margin</Label>
                    <Input 
                      value={htmlStyles.margin || "0"} 
                      onChange={(e) => updateHTMLStyle("margin", e.target.value)} 
                      placeholder="0px"
                      className="h-8 text-sm" 
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="style" className="p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <Palette className="h-3 w-3" />
                  Text Color
                </Label>
                <div className="space-y-2">
                  <Input 
                    type="color" 
                    value={htmlStyles.color || "#000000"} 
                    onChange={(e) => {
                      updateHTMLStyle("color", e.target.value);
                      saveColor(e.target.value);
                    }} 
                    className="h-10 w-full cursor-pointer"
                  />
                  <div className="grid grid-cols-8 gap-1">
                    {colorPalette.map((color) => (
                      <button
                        key={color}
                        className="h-6 w-6 rounded border border-border hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          updateHTMLStyle("color", color);
                          saveColor(color);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Background</Label>
                <div className="space-y-2">
                  <Input 
                    type="color" 
                    value={htmlStyles.backgroundColor?.startsWith("#") ? htmlStyles.backgroundColor : "#FFFFFF"} 
                    onChange={(e) => {
                      updateHTMLStyle("backgroundColor", e.target.value);
                      saveColor(e.target.value);
                    }} 
                    className="h-10 w-full cursor-pointer"
                  />
                  <div className="grid grid-cols-8 gap-1">
                    {colorPalette.map((color) => (
                      <button
                        key={color}
                        className="h-6 w-6 rounded border border-border hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          updateHTMLStyle("backgroundColor", color);
                          saveColor(color);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Gradient Presets */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Gradient Background</Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {gradientPresets.map((gradient, idx) => (
                    <button
                      key={idx}
                      className="h-8 w-full rounded border border-border hover:scale-105 transition-transform"
                      style={{ background: gradient }}
                      onClick={() => updateHTMLStyle("background", gradient)}
                      title="Apply gradient"
                    />
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input 
                    placeholder="Custom gradient..." 
                    value={customGradient}
                    onChange={(e) => setCustomGradient(e.target.value)}
                    className="h-8 text-xs flex-1"
                  />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 px-2"
                    onClick={() => {
                      if (customGradient) {
                        updateHTMLStyle("background", customGradient);
                      }
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Saved/Recent Colors */}
              {savedColors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Saved Colors</Label>
                    <span className="text-[10px] text-muted-foreground">Recently used</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {savedColors
                      .sort((a, b) => b.usageCount - a.usageCount)
                      .map((item) => (
                        <div key={item.color} className="relative group">
                          <button
                            className="h-7 w-7 rounded border border-border hover:scale-110 transition-transform"
                            style={{ backgroundColor: item.color }}
                            onClick={() => {
                              updateHTMLStyle("backgroundColor", item.color);
                              saveColor(item.color);
                            }}
                            title={`${item.color} (used ${item.usageCount}x)`}
                          />
                          <button
                            className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeColor(item.color);
                            }}
                          >
                            <X className="h-2 w-2" />
                          </button>
                          {item.usageCount > 1 && (
                            <span className="absolute -bottom-1 -right-1 text-[8px] bg-primary text-primary-foreground rounded-full px-1">
                              {item.usageCount}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}


              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Border Radius</Label>
                <div className="flex items-center gap-2">
                  <Slider 
                    value={[parseFloat(htmlStyles.borderRadius || "0")]} 
                    min={0} 
                    max={50} 
                    step={1}
                    onValueChange={([value]) => updateHTMLStyle("borderRadius", `${value}px`)}
                    className="flex-1"
                  />
                  <Input 
                    type="number" 
                    value={parseFloat(htmlStyles.borderRadius || "0")} 
                    onChange={(e) => updateHTMLStyle("borderRadius", `${e.target.value}px`)} 
                    className="h-8 w-16 text-sm" 
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </ScrollArea>
    </div>
  );
};
