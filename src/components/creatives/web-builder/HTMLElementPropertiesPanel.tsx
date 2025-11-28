/**
 * HTML Element Properties Panel
 * Edit properties of selected HTML elements in the canvas
 */

import React, { useState, useEffect } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Copy, Eye, EyeOff } from 'lucide-react';

interface HTMLElementPropertiesPanelProps {
  fabricCanvas: FabricCanvas | null;
  selectedElement: {
    id?: string;
    className?: string;
    width?: number;
    height?: number;
    left?: number;
    top?: number;
    opacity?: number;
    fill?: string;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    visible?: boolean;
    scaleX?: number;
    scaleY?: number;
    set?: (property: string, value: unknown) => void;
    clone?: (callback: (cloned: unknown) => void) => void;
  } | null;
  onUpdate: () => void;
}

export const HTMLElementPropertiesPanel: React.FC<HTMLElementPropertiesPanelProps> = ({
  fabricCanvas,
  selectedElement,
  onUpdate
}) => {
  // Track local edits separately from selected element props
  const [localEdits, setLocalEdits] = useState<Partial<typeof properties>>({});
  
  // Derive properties from selectedElement, with local edits taking precedence
  const properties = {
    id: localEdits.id ?? selectedElement?.id ?? '',
    className: localEdits.className ?? selectedElement?.className ?? '',
    width: localEdits.width ?? Math.round((selectedElement?.width || 0) * (selectedElement?.scaleX || 1)),
    height: localEdits.height ?? Math.round((selectedElement?.height || 0) * (selectedElement?.scaleY || 1)),
    left: localEdits.left ?? Math.round(selectedElement?.left || 0),
    top: localEdits.top ?? Math.round(selectedElement?.top || 0),
    opacity: localEdits.opacity ?? Math.round((selectedElement?.opacity || 1) * 100),
    backgroundColor: localEdits.backgroundColor ?? selectedElement?.fill ?? '#ffffff',
    text: localEdits.text ?? selectedElement?.text ?? '',
    fontSize: localEdits.fontSize ?? selectedElement?.fontSize ?? 16,
    fontFamily: localEdits.fontFamily ?? selectedElement?.fontFamily ?? 'Arial',
    visible: localEdits.visible ?? (selectedElement?.visible !== false)
  };

  const handlePropertyChange = (key: string, value: string | number | boolean) => {
    setLocalEdits(prev => ({ ...prev, [key]: value }));
  };

  const applyChanges = () => {
    if (!selectedElement || !fabricCanvas) {
      return;
    }

    if (selectedElement.set) {
      selectedElement.set('id', properties.id);
      selectedElement.set('className', properties.className);
      selectedElement.set('width', properties.width);
      selectedElement.set('height', properties.height);
      selectedElement.set('left', properties.left);
      selectedElement.set('top', properties.top);
      selectedElement.set('opacity', properties.opacity / 100);
      selectedElement.set('fill', properties.backgroundColor);
      selectedElement.set('text', properties.text);
      selectedElement.set('fontSize', properties.fontSize);
      selectedElement.set('fontFamily', properties.fontFamily);
      selectedElement.set('visible', properties.visible);
    }

    fabricCanvas.renderAll();
    onUpdate();
  };

  const duplicateElement = () => {
    if (!selectedElement || !fabricCanvas || !selectedElement.clone) {
      return;
    }

    selectedElement.clone((cloned: unknown) => {
      if (cloned && typeof cloned === 'object' && cloned !== null && 'set' in cloned) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const element = cloned as any;
        element.set('left', (element.left || 0) + 20);
        element.set('top', (element.top || 0) + 20);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (fabricCanvas as any).add(cloned);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (fabricCanvas as any).setActiveObject(cloned);
      fabricCanvas.renderAll();
      onUpdate();
    });
  };

  const deleteElement = () => {
    if (!selectedElement || !fabricCanvas) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fabricCanvas as any).remove(selectedElement);
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
    onUpdate();
  };

  const toggleVisibility = () => {
    if (!selectedElement || !fabricCanvas || !selectedElement.set) {
      return;
    }

    const newVisibility = !properties.visible;
    selectedElement.set('visible', newVisibility);
    setLocalEdits(prev => ({ ...prev, visible: newVisibility }));
    fabricCanvas.renderAll();
    onUpdate();
  };

  if (!selectedElement) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-sm">
        Select an element to edit properties
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-sm mb-3">Element Properties</h3>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="element-id" className="text-xs">ID</Label>
              <Input
                id="element-id"
                type="text"
                value={properties.id}
                onChange={(e) => handlePropertyChange('id', e.target.value)}
                onBlur={applyChanges}
                className="h-8 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="element-class" className="text-xs">Class</Label>
              <Input
                id="element-class"
                type="text"
                value={properties.className}
                onChange={(e) => handlePropertyChange('className', e.target.value)}
                onBlur={applyChanges}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-sm mb-3">Position & Size</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="element-left" className="text-xs">Left</Label>
              <Input
                id="element-left"
                type="number"
                value={properties.left}
                onChange={(e) => handlePropertyChange('left', parseInt(e.target.value))}
                onBlur={applyChanges}
                className="h-8 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="element-top" className="text-xs">Top</Label>
              <Input
                id="element-top"
                type="number"
                value={properties.top}
                onChange={(e) => handlePropertyChange('top', parseInt(e.target.value))}
                onBlur={applyChanges}
                className="h-8 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="element-width" className="text-xs">Width</Label>
              <Input
                id="element-width"
                type="number"
                value={properties.width}
                onChange={(e) => handlePropertyChange('width', parseInt(e.target.value))}
                onBlur={applyChanges}
                className="h-8 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="element-height" className="text-xs">Height</Label>
              <Input
                id="element-height"
                type="number"
                value={properties.height}
                onChange={(e) => handlePropertyChange('height', parseInt(e.target.value))}
                onBlur={applyChanges}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-sm mb-3">Style</h4>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="element-bg" className="text-xs">Background</Label>
              <div className="flex gap-2">
                <Input
                  id="element-bg"
                  type="color"
                  value={properties.backgroundColor}
                  onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
                  onBlur={applyChanges}
                  className="h-8 w-12 p-1"
                />
                <Input
                  type="text"
                  value={properties.backgroundColor}
                  onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
                  onBlur={applyChanges}
                  className="h-8 text-sm flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="element-opacity" className="text-xs">Opacity: {properties.opacity}%</Label>
              <Input
                id="element-opacity"
                type="range"
                min="0"
                max="100"
                value={properties.opacity}
                onChange={(e) => handlePropertyChange('opacity', parseInt(e.target.value))}
                onInput={applyChanges}
                className="h-8"
              />
            </div>
          </div>
        </div>

        {selectedElement.text && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold text-sm mb-3">Text</h4>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="element-text" className="text-xs">Content</Label>
                  <Input
                    id="element-text"
                    type="text"
                    value={properties.text}
                    onChange={(e) => handlePropertyChange('text', e.target.value)}
                    onBlur={applyChanges}
                    className="h-8 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="element-font-size" className="text-xs">Font Size</Label>
                    <Input
                      id="element-font-size"
                      type="number"
                      value={properties.fontSize}
                      onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
                      onBlur={applyChanges}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="element-font-family" className="text-xs">Font</Label>
                    <Input
                      id="element-font-family"
                      type="text"
                      value={properties.fontFamily}
                      onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
                      onBlur={applyChanges}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleVisibility}
            className="flex-1"
          >
            {properties.visible ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
            {properties.visible ? 'Hide' : 'Show'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={duplicateElement}
            className="flex-1"
          >
            <Copy className="w-4 h-4 mr-1" />
            Duplicate
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={deleteElement}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};
