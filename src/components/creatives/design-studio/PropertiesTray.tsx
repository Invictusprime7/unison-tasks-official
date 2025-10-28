import React, { useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertiesPanel } from "./PropertiesPanel";
import { FiltersPanel } from "./FiltersPanel";

interface SelectedObject {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  opacity?: number;
  strokeWidth?: number;
  fontSize?: number;
  fill?: string;
  stroke?: string;
  [key: string]: unknown;
}

interface PropertiesTrayProps {
  open: boolean;
  selectedObject: SelectedObject | null;
  onPropertyChange: (prop: string, value: unknown) => void;
  onStartCrop?: () => void;
  onRemoveBackground?: (tol: number) => void;
  onAlign?: (align: string) => void;
  onApplyGradient?: (g: { type: 'linear' | 'radial'; angle?: number; stops: { offset: number; color: string }[] }) => void;
  canvasEl?: HTMLCanvasElement | null;
  onApplyFilter?: (name: string, value: unknown) => void;
  onResetFilters?: () => void;
  onClose?: () => void;
}

export const PropertiesTray: React.FC<PropertiesTrayProps> = ({ open, selectedObject, onPropertyChange, onStartCrop, onRemoveBackground, onAlign, onApplyGradient, canvasEl, onApplyFilter, onResetFilters, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose?.(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity" />
        <Dialog.Content asChild>
          <div
            ref={ref}
            className={`fixed right-3 top-16 bottom-3 z-[var(--z-popover)] w-[320px] max-w-[90vw] transition-transform`}
            style={{
              transform: open ? 'translateX(0)' : 'translateX(140%)',
              transitionDuration: 'var(--duration-normal)',
              transitionTimingFunction: 'var(--ease-out)'
            }}
          >
            <div className="h-full bg-white border rounded-xl overflow-hidden flex flex-col" style={{ boxShadow: 'var(--shadow-nebula)' }}>
              <Tabs defaultValue="properties" className="flex flex-col h-full">
                <TabsList className="grid w-full grid-cols-2 bg-white border-b h-9">
                  <TabsTrigger value="properties" className="text-[10px]">Properties</TabsTrigger>
                  <TabsTrigger value="filters" className="text-[10px]">Filters</TabsTrigger>
                </TabsList>
                <TabsContent value="properties" className="flex-1 overflow-y-auto m-0 p-0">
                  <PropertiesPanel
                    selectedObject={selectedObject}
                    onPropertyChange={onPropertyChange}
                    onStartCrop={onStartCrop}
                    onRemoveBackground={onRemoveBackground}
                    onAlign={onAlign}
                    onApplyGradient={onApplyGradient}
                    canvasEl={canvasEl}
                    onClose={onClose}
                  />
                </TabsContent>
                <TabsContent value="filters" className="flex-1 overflow-y-auto m-0 p-0">
                  <FiltersPanel selectedObject={selectedObject} onApplyFilter={onApplyFilter} onResetFilters={onResetFilters} onClose={onClose} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
