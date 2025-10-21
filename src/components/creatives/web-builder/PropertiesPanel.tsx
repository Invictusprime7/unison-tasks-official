import { Canvas as FabricCanvas } from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Lock, Unlock, X, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import { CopyRewritePanel } from "./CopyRewritePanel";
import { ImageOperationsPanel } from "./ImageOperationsPanel";

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

const fontFamilies = ["Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana", "Courier New", "Inter", "Roboto"];
const fontSizes = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px"];

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

  const isHTMLElement = !!selectedHTMLElement;
  const isFabricObject = !!selectedObject && !isHTMLElement;

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

  useEffect(() => {
    if (selectedHTMLElement) {
      setHtmlStyles(selectedHTMLElement.styles || {});
      setHtmlText(selectedHTMLElement.textContent || "");
    }
  }, [selectedHTMLElement]);

  const updateProperty = (key: string, value: any) => {
    if (!selectedObject) return;
    selectedObject.set(key, value);
    fabricCanvas?.renderAll();
    onUpdate?.();
    setProperties((prev: any) => ({ ...prev, [key]: value }));
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
                <Label className="text-xs text-muted-foreground">Position</Label>
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
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Font Family</Label>
                <Select value={htmlStyles.fontFamily || "Arial"} onValueChange={(value) => updateHTMLStyle("fontFamily", value)}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{fontFamilies.map((font) => <SelectItem key={font} value={font}>{font}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </ScrollArea>
    </div>
  );
};
