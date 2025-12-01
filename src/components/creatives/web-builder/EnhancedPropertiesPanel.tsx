/**
 * Enhanced Properties Panel
 * Industry-level property editing with advanced controls
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import {
  Lock, Unlock, X, ChevronDown, ChevronRight,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Type, Palette, Box, Sparkles, Layers, Move, RotateCw,
  Eye, EyeOff, Copy, Trash2, FlipHorizontal, FlipVertical,
  Link2, Unlink, Grid3X3, Maximize2, CornerUpRight
} from 'lucide-react';

interface SelectedElement {
  id?: string;
  className?: string;
  width?: number;
  height?: number;
  left?: number;
  top?: number;
  opacity?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  angle?: number;
  scaleX?: number;
  scaleY?: number;
  visible?: boolean;
  type?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: string;
  rx?: number;
  ry?: number;
  shadow?: any;
  set?: (key: string | Record<string, any>, value?: any) => void;
}

interface EnhancedPropertiesPanelProps {
  fabricCanvas: FabricCanvas | null;
  selectedObject: any | null;
  onUpdate?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

const fontFamilies = [
  'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia',
  'Verdana', 'Roboto', 'Montserrat', 'Open Sans', 'Lato', 'Poppins'
];

const colorPresets = [
  '#000000', '#FFFFFF', '#EF4444', '#F97316', '#F59E0B', '#22C55E',
  '#14B8A6', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#64748B'
];

const PropertySection: React.FC<{
  title: string;
  icon?: React.ElementType;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, icon: Icon, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-1 hover:bg-muted/50 rounded transition-colors">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
          <span className="text-xs font-medium">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pb-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

const NumberInput: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}> = ({ label, value, onChange, min, max, step = 1, unit }) => (
  <div className="space-y-1">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <div className="relative">
      <Input
        type="number"
        value={Math.round(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="h-8 text-xs pr-8"
      />
      {unit && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {unit}
        </span>
      )}
    </div>
  </div>
);

const ColorInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPresets?: boolean;
}> = ({ label, value, onChange, showPresets = true }) => (
  <div className="space-y-2">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <div className="flex items-center gap-2">
      <div className="relative">
        <Input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-12 p-1 cursor-pointer"
        />
      </div>
      <Input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="h-8 text-xs flex-1 font-mono"
      />
    </div>
    {showPresets && (
      <div className="flex flex-wrap gap-1">
        {colorPresets.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={cn(
              "h-5 w-5 rounded border transition-transform hover:scale-110",
              value === color && "ring-2 ring-primary ring-offset-1"
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    )}
  </div>
);

export const EnhancedPropertiesPanel: React.FC<EnhancedPropertiesPanelProps> = ({
  fabricCanvas,
  selectedObject,
  onUpdate,
  onDelete,
  onDuplicate,
}) => {
  const [properties, setProperties] = useState<Record<string, any>>({});
  const [aspectLocked, setAspectLocked] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);

  // Sync properties from selected object
  useEffect(() => {
    if (!selectedObject) {
      setProperties({});
      return;
    }

    const width = Math.round((selectedObject.width || 0) * (selectedObject.scaleX || 1));
    const height = Math.round((selectedObject.height || 0) * (selectedObject.scaleY || 1));

    setProperties({
      left: Math.round(selectedObject.left || 0),
      top: Math.round(selectedObject.top || 0),
      width,
      height,
      angle: Math.round(selectedObject.angle || 0),
      opacity: (selectedObject.opacity ?? 1) * 100,
      fill: selectedObject.fill || '#000000',
      stroke: selectedObject.stroke || 'transparent',
      strokeWidth: selectedObject.strokeWidth || 0,
      rx: selectedObject.rx || 0,
      visible: selectedObject.visible !== false,
      text: selectedObject.text || '',
      fontSize: selectedObject.fontSize || 16,
      fontFamily: selectedObject.fontFamily || 'Inter',
      fontWeight: selectedObject.fontWeight || '400',
      textAlign: selectedObject.textAlign || 'left',
    });

    if (width && height) {
      setAspectRatio(width / height);
    }
  }, [selectedObject]);

  const updateProperty = useCallback((key: string, value: any) => {
    if (!selectedObject || !selectedObject.set) return;

    // Handle linked width/height
    if (key === 'width' && aspectLocked && properties.height) {
      const newHeight = Math.round(value / aspectRatio);
      selectedObject.set({
        scaleX: value / (selectedObject.width || 1),
        scaleY: newHeight / ((selectedObject.height || 1) * (selectedObject.scaleY || 1)) * (selectedObject.scaleY || 1),
      });
      setProperties(prev => ({ ...prev, width: value, height: newHeight }));
    } else if (key === 'height' && aspectLocked && properties.width) {
      const newWidth = Math.round(value * aspectRatio);
      selectedObject.set({
        scaleX: newWidth / ((selectedObject.width || 1) * (selectedObject.scaleX || 1)) * (selectedObject.scaleX || 1),
        scaleY: value / (selectedObject.height || 1),
      });
      setProperties(prev => ({ ...prev, width: newWidth, height: value }));
    } else if (key === 'opacity') {
      selectedObject.set('opacity', value / 100);
      setProperties(prev => ({ ...prev, opacity: value }));
    } else if (key === 'rx') {
      selectedObject.set({ rx: value, ry: value });
      setProperties(prev => ({ ...prev, rx: value }));
    } else {
      selectedObject.set(key, value);
      setProperties(prev => ({ ...prev, [key]: value }));
    }

    fabricCanvas?.renderAll();
    onUpdate?.();
  }, [selectedObject, fabricCanvas, aspectLocked, aspectRatio, properties, onUpdate]);

  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    if (!selectedObject?.set) return;
    
    if (direction === 'horizontal') {
      selectedObject.set('flipX', !(selectedObject as any).flipX);
    } else {
      selectedObject.set('flipY', !(selectedObject as any).flipY);
    }
    fabricCanvas?.renderAll();
    onUpdate?.();
  };

  const handleToggleVisibility = () => {
    if (!selectedObject?.set) return;
    selectedObject.set('visible', !selectedObject.visible);
    setProperties(prev => ({ ...prev, visible: !prev.visible }));
    fabricCanvas?.renderAll();
    onUpdate?.();
  };

  // No selection state
  if (!selectedObject) {
    return (
      <div className="w-72 border-l border-border bg-card/95 backdrop-blur-sm flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm">Properties</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <MousePointer2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">No element selected</p>
          <p className="text-xs text-muted-foreground/70">
            Click an element on the canvas to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const isText = selectedObject.type === 'textbox' || selectedObject.type === 'text' || selectedObject.type === 'i-text';

  return (
    <div className="w-72 border-l border-border bg-card/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs capitalize">
              {selectedObject.type || 'Element'}
            </Badge>
            {!properties.visible && (
              <Badge variant="outline" className="text-xs">Hidden</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={handleToggleVisibility}
            >
              {properties.visible ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={onDuplicate}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {/* Transform Section */}
          <PropertySection title="Transform" icon={Move} defaultOpen={true}>
            <div className="grid grid-cols-2 gap-2">
              <NumberInput
                label="X"
                value={properties.left || 0}
                onChange={(v) => updateProperty('left', v)}
                unit="px"
              />
              <NumberInput
                label="Y"
                value={properties.top || 0}
                onChange={(v) => updateProperty('top', v)}
                unit="px"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Size</Label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setAspectLocked(!aspectLocked)}
                >
                  {aspectLocked ? (
                    <Link2 className="h-3 w-3" />
                  ) : (
                    <Unlink className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <NumberInput
                  label="Width"
                  value={properties.width || 0}
                  onChange={(v) => updateProperty('width', v)}
                  min={1}
                  unit="px"
                />
                <NumberInput
                  label="Height"
                  value={properties.height || 0}
                  onChange={(v) => updateProperty('height', v)}
                  min={1}
                  unit="px"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <NumberInput
                  label="Rotation"
                  value={properties.angle || 0}
                  onChange={(v) => updateProperty('angle', v)}
                  min={0}
                  max={360}
                  unit="°"
                />
              </div>
              <div className="flex items-center gap-1 pt-5">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFlip('horizontal')}
                >
                  <FlipHorizontal className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFlip('vertical')}
                >
                  <FlipVertical className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </PropertySection>

          <Separator />

          {/* Appearance Section */}
          <PropertySection title="Appearance" icon={Palette}>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Opacity</Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[properties.opacity || 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([v]) => updateProperty('opacity', v)}
                  className="flex-1"
                />
                <span className="text-xs w-8 text-right tabular-nums">
                  {Math.round(properties.opacity || 100)}%
                </span>
              </div>
            </div>

            <ColorInput
              label="Fill"
              value={properties.fill || '#000000'}
              onChange={(v) => updateProperty('fill', v)}
            />

            <ColorInput
              label="Stroke"
              value={properties.stroke || 'transparent'}
              onChange={(v) => updateProperty('stroke', v)}
            />

            <NumberInput
              label="Stroke Width"
              value={properties.strokeWidth || 0}
              onChange={(v) => updateProperty('strokeWidth', v)}
              min={0}
              unit="px"
            />

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Corner Radius</Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[properties.rx || 0]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([v]) => updateProperty('rx', v)}
                  className="flex-1"
                />
                <span className="text-xs w-8 text-right tabular-nums">
                  {properties.rx || 0}px
                </span>
              </div>
            </div>
          </PropertySection>

          {/* Text Section - Only for text elements */}
          {isText && (
            <>
              <Separator />
              <PropertySection title="Typography" icon={Type}>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Font Family</Label>
                  <Select
                    value={properties.fontFamily || 'Inter'}
                    onValueChange={(v) => updateProperty('fontFamily', v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map((font) => (
                        <SelectItem key={font} value={font} className="text-xs">
                          <span style={{ fontFamily: font }}>{font}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <NumberInput
                    label="Size"
                    value={properties.fontSize || 16}
                    onChange={(v) => updateProperty('fontSize', v)}
                    min={8}
                    max={200}
                    unit="px"
                  />
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Weight</Label>
                    <Select
                      value={properties.fontWeight || '400'}
                      onValueChange={(v) => updateProperty('fontWeight', v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['300', '400', '500', '600', '700', '800'].map((w) => (
                          <SelectItem key={w} value={w} className="text-xs">
                            {w}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Alignment</Label>
                  <div className="flex items-center gap-1">
                    {[
                      { value: 'left', icon: AlignLeft },
                      { value: 'center', icon: AlignCenter },
                      { value: 'right', icon: AlignRight },
                    ].map(({ value, icon: Icon }) => (
                      <Button
                        key={value}
                        variant={properties.textAlign === value ? 'secondary' : 'outline'}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateProperty('textAlign', value)}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </Button>
                    ))}
                  </div>
                </div>
              </PropertySection>
            </>
          )}

          <Separator />

          {/* Effects Section */}
          <PropertySection title="Effects" icon={Sparkles} defaultOpen={false}>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                if (!selectedObject?.set) return;
                if (properties.shadow) {
                  selectedObject.set('shadow', null);
                  setProperties(prev => ({ ...prev, shadow: null }));
                } else {
                  const shadow = {
                    color: 'rgba(0,0,0,0.25)',
                    blur: 15,
                    offsetX: 0,
                    offsetY: 4,
                  };
                  selectedObject.set('shadow', shadow);
                  setProperties(prev => ({ ...prev, shadow }));
                }
                fabricCanvas?.renderAll();
                onUpdate?.();
              }}
            >
              {properties.shadow ? 'Remove Shadow' : 'Add Drop Shadow'}
            </Button>
          </PropertySection>
        </div>
      </ScrollArea>
    </div>
  );
};

// Import for MousePointer2 icon used in empty state
import { MousePointer2 } from 'lucide-react';

export default EnhancedPropertiesPanel;
