import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { 
  Type, Palette, Box, Layout, Sparkles, X,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline
} from "lucide-react";

interface SelectedElement {
  tagName: string;
  textContent: string;
  styles: {
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
  attributes: Record<string, string>;
  selector: string;
}

interface HTMLElementPropertiesPanelProps {
  selectedElement: SelectedElement | null;
  onClose: () => void;
  onUpdateElement: (updates: Partial<SelectedElement>) => void;
}

const fontFamilies = [
  "Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana",
  "Courier New", "Trebuchet MS", "Impact", "Comic Sans MS",
  "Palatino", "Garamond", "Bookman", "Avant Garde", "Inter", "Roboto"
];

const fontSizes = ["10px", "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "42px", "48px", "56px", "64px", "72px"];

export const HTMLElementPropertiesPanel = ({ 
  selectedElement, 
  onClose, 
  onUpdateElement 
}: HTMLElementPropertiesPanelProps) => {
  const [localStyles, setLocalStyles] = useState(selectedElement?.styles || {});
  const [localText, setLocalText] = useState(selectedElement?.textContent || "");

  useEffect(() => {
    if (selectedElement) {
      setLocalStyles(selectedElement.styles);
      setLocalText(selectedElement.textContent);
    }
  }, [selectedElement]);

  if (!selectedElement) return null;

  const updateStyle = (property: string, value: string) => {
    const newStyles = { ...localStyles, [property]: value };
    setLocalStyles(newStyles);
    onUpdateElement({ styles: newStyles });
  };

  const updateText = (value: string) => {
    setLocalText(value);
    onUpdateElement({ textContent: value });
  };

  const isTextElement = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "span", "a", "button", "label"].includes(
    selectedElement.tagName.toLowerCase()
  );

  const parseNumericValue = (value: string | undefined): number => {
    if (!value) return 0;
    return parseFloat(value) || 0;
  };

  const formatSpacing = (value: string): string => {
    const num = parseFloat(value);
    return isNaN(num) ? "0px" : `${num}px`;
  };

  return (
    <div className="w-80 bg-background border-l flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Element Properties</h3>
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            {selectedElement.tagName.toLowerCase()}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Properties Tabs */}
      <Tabs defaultValue="content" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-4 bg-muted">
          <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
          <TabsTrigger value="text" className="text-xs">Text</TabsTrigger>
          <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
          <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Content Tab */}
          <TabsContent value="content" className="p-4 space-y-4 m-0">
            {isTextElement && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Text Content
                </Label>
                <Input
                  value={localText}
                  onChange={(e) => updateText(e.target.value)}
                  placeholder="Enter text..."
                  className="text-sm"
                />
              </div>
            )}

            {selectedElement.tagName.toLowerCase() === "img" && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Image Source
                </Label>
                <Input
                  value={selectedElement.attributes.src || ""}
                  onChange={(e) => onUpdateElement({ 
                    attributes: { ...selectedElement.attributes, src: e.target.value } 
                  })}
                  placeholder="Image URL..."
                  className="text-sm"
                />
              </div>
            )}

            {selectedElement.tagName.toLowerCase() === "a" && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Link URL
                </Label>
                <Input
                  value={selectedElement.attributes.href || ""}
                  onChange={(e) => onUpdateElement({ 
                    attributes: { ...selectedElement.attributes, href: e.target.value } 
                  })}
                  placeholder="https://..."
                  className="text-sm"
                />
              </div>
            )}
          </TabsContent>

          {/* Text Tab */}
          <TabsContent value="text" className="p-4 space-y-4 m-0">
            {/* Font Family */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Font Family
              </Label>
              <Select 
                value={localStyles.fontFamily || "Arial"} 
                onValueChange={(value) => updateStyle("fontFamily", value)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Font Size
              </Label>
              <Select 
                value={localStyles.fontSize || "16px"} 
                onValueChange={(value) => updateStyle("fontSize", value)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Text Formatting */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Format
              </Label>
              <div className="flex gap-2">
                <Button
                  variant={localStyles.fontWeight === "bold" ? "secondary" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => updateStyle("fontWeight", localStyles.fontWeight === "bold" ? "normal" : "bold")}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant={localStyles.fontStyle === "italic" ? "secondary" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => updateStyle("fontStyle", localStyles.fontStyle === "italic" ? "normal" : "italic")}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant={localStyles.textDecoration === "underline" ? "secondary" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => updateStyle("textDecoration", localStyles.textDecoration === "underline" ? "none" : "underline")}
                >
                  <Underline className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Text Alignment */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Alignment
              </Label>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant={localStyles.textAlign === "left" ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => updateStyle("textAlign", "left")}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant={localStyles.textAlign === "center" ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => updateStyle("textAlign", "center")}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant={localStyles.textAlign === "right" ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => updateStyle("textAlign", "right")}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
                <Button
                  variant={localStyles.textAlign === "justify" ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => updateStyle("textAlign", "justify")}
                >
                  <AlignJustify className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Text Color
              </Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={localStyles.color || "#000000"}
                  onChange={(e) => updateStyle("color", e.target.value)}
                  className="h-10 w-16 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={localStyles.color || "#000000"}
                  onChange={(e) => updateStyle("color", e.target.value)}
                  className="flex-1 text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="p-4 space-y-4 m-0">
            {/* Padding */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Padding (px)
              </Label>
              <Input
                type="number"
                value={parseNumericValue(localStyles.padding)}
                onChange={(e) => updateStyle("padding", formatSpacing(e.target.value))}
                className="text-sm"
                min="0"
              />
            </div>

            {/* Margin */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Margin (px)
              </Label>
              <Input
                type="number"
                value={parseNumericValue(localStyles.margin)}
                onChange={(e) => updateStyle("margin", formatSpacing(e.target.value))}
                className="text-sm"
              />
            </div>

            <Separator />

            {/* Width */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Width
              </Label>
              <Input
                type="text"
                value={localStyles.width || "auto"}
                onChange={(e) => updateStyle("width", e.target.value)}
                placeholder="auto, 100%, 200px"
                className="text-sm"
              />
            </div>

            {/* Height */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Height
              </Label>
              <Input
                type="text"
                value={localStyles.height || "auto"}
                onChange={(e) => updateStyle("height", e.target.value)}
                placeholder="auto, 100%, 200px"
                className="text-sm"
              />
            </div>

            <Separator />

            {/* Display */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Display
              </Label>
              <Select 
                value={localStyles.display || "block"} 
                onValueChange={(value) => updateStyle("display", value)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="block">Block</SelectItem>
                  <SelectItem value="inline">Inline</SelectItem>
                  <SelectItem value="inline-block">Inline Block</SelectItem>
                  <SelectItem value="flex">Flex</SelectItem>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Style Tab */}
          <TabsContent value="style" className="p-4 space-y-4 m-0">
            {/* Background Color */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Background Color
              </Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={localStyles.backgroundColor || "#ffffff"}
                  onChange={(e) => updateStyle("backgroundColor", e.target.value)}
                  className="h-10 w-16 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={localStyles.backgroundColor || "transparent"}
                  onChange={(e) => updateStyle("backgroundColor", e.target.value)}
                  className="flex-1 text-sm"
                  placeholder="transparent"
                />
              </div>
            </div>

            <Separator />

            {/* Border */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Border
              </Label>
              <Input
                type="text"
                value={localStyles.border || "none"}
                onChange={(e) => updateStyle("border", e.target.value)}
                placeholder="1px solid #000"
                className="text-sm"
              />
            </div>

            {/* Border Radius */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Border Radius (px)
              </Label>
              <Input
                type="number"
                value={parseNumericValue(localStyles.borderRadius)}
                onChange={(e) => updateStyle("borderRadius", formatSpacing(e.target.value))}
                className="text-sm"
                min="0"
              />
            </div>

            <Separator />

            {/* Opacity */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Opacity ({Math.round((parseFloat(localStyles.opacity || "1") * 100))}%)
              </Label>
              <Slider
                value={[parseFloat(localStyles.opacity || "1")]}
                onValueChange={([value]) => updateStyle("opacity", value.toString())}
                max={1}
                step={0.01}
                className="py-4"
              />
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Quick Actions */}
      <div className="p-4 border-t">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            toast.success("Element styles reset to defaults");
            setLocalStyles({});
            onUpdateElement({ styles: {} });
          }}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Reset Styles
        </Button>
      </div>
    </div>
  );
};
