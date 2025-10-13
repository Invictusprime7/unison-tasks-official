import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ElementsPanel } from './design-studio/ElementsPanel';
import { IntegrationsPanel } from './design-studio/IntegrationsPanel';
import { Button } from '@/components/ui/button';
import type { DesignElement } from './design-studio/ElementsPanel';

interface DesignSidebarProps {
  onElementSelect: (element: DesignElement) => void;
  onElementDragStart: (element: DesignElement) => void;
  onAddText: () => void;
  onAddRectangle: () => void;
  onAddCircle: () => void;
  onAddImage: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDelete: () => void;
  selectedObject: any;
  layers: any[];
  onLayerSelect: (obj: any) => void;
  isCropping: boolean;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
}

export const DesignSidebar = ({
  onElementSelect,
  onElementDragStart,
  onAddText,
  onAddRectangle,
  onAddCircle,
  onAddImage,
  onDuplicate,
  onBringForward,
  onSendBackward,
  onDelete,
  selectedObject,
  layers,
  onLayerSelect,
  isCropping,
  onApplyCrop,
  onCancelCrop,
}: DesignSidebarProps) => {
  return (
    <Tabs defaultValue="elements" className="w-full h-full flex flex-col">
      <TabsList className="w-full grid grid-cols-3 bg-white border-b-2 border-primary h-8 text-[10px]" style={{ boxShadow: 'var(--shadow-neon-blue)' }}>
        <TabsTrigger value="elements" className="text-[10px] py-1 text-gray-700">Design</TabsTrigger>
        <TabsTrigger value="layers" className="text-[10px] py-1 text-gray-700">Layers</TabsTrigger>
        <TabsTrigger value="export" className="text-[10px] py-1 text-gray-700">Export</TabsTrigger>
      </TabsList>

      <TabsContent value="elements" className="flex-1 m-0 overflow-hidden">
        <ElementsPanel
          onElementSelect={onElementSelect}
          onElementDragStart={onElementDragStart}
        />
      </TabsContent>

      <TabsContent value="export" className="flex-1 m-0 overflow-hidden">
        <IntegrationsPanel />
      </TabsContent>

      <TabsContent value="layers" className="flex-1 m-0 p-2 overflow-y-auto space-y-2">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">Quick Add</div>
          <div className="flex flex-col gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddText}
              className="justify-start bg-gray-100 hover:bg-gray-200 h-7 text-xs px-2 text-gray-900"
            >
              Text
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddRectangle}
              className="justify-start bg-gray-100 hover:bg-gray-200 h-7 text-xs px-2 text-gray-900"
            >
              Rectangle
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddCircle}
              className="justify-start bg-gray-100 hover:bg-gray-200 h-7 text-xs px-2 text-gray-900"
            >
              Circle
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddImage}
              className="justify-start bg-gray-100 hover:bg-gray-200 h-7 text-xs px-2 text-gray-900"
            >
              Upload Image
            </Button>
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">Layers</div>
          <div className="flex flex-col gap-1 max-h-48 overflow-auto pr-1">
            {layers.map((obj: any, idx: number) => (
              <button
                key={idx}
                className={`text-left px-1.5 py-1 rounded border-2 text-[10px] transition-all ${
                  selectedObject === obj
                    ? 'border-primary bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-primary'
                }`}
                style={selectedObject === obj ? { boxShadow: 'var(--shadow-neon-blue)' } : {}}
                onClick={() => onLayerSelect(obj)}
              >
                {idx + 1}. {obj.type || 'Object'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1.5">Actions</div>
          <div className="flex gap-1.5 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDuplicate}
              className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 hover:bg-gray-200 h-6 text-gray-900"
            >
              Duplicate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBringForward}
              className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 hover:bg-gray-200 h-6 text-gray-900"
            >
              Forward
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSendBackward}
              className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 hover:bg-gray-200 h-6 text-gray-900"
            >
              Backward
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="px-1.5 py-0.5 text-[10px] rounded bg-red-600 hover:bg-red-500 h-6 text-white"
            >
              Delete
            </Button>
          </div>
        </div>

        {isCropping && (
          <div className="p-1.5 bg-blue-50 border border-blue-300 rounded">
            <div className="text-[10px] text-blue-700 mb-1.5">Crop Mode Active</div>
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={onApplyCrop}
                className="flex-1 h-6 text-[10px] bg-blue-600 hover:bg-blue-500 text-white"
              >
                Apply
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancelCrop}
                className="flex-1 h-6 text-[10px] bg-gray-200 hover:bg-gray-300 text-gray-900"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
