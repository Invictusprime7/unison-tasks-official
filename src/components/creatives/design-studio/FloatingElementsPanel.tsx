import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Shapes,
  Type,
  Image,
  Sparkles,
  Grid3X3,
  X,
  Minimize2,
  Maximize2,
  Grip,
  Search,
  Star,
  Heart,
  Triangle,
  Hexagon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ElementData {
  [key: string]: unknown;
}

interface FloatingElementsPanelProps {
  onAddElement?: (elementType: string, elementData?: ElementData) => void;
  onAddText?: (text: string) => void;
  onAddShape?: (shapeType: string) => void;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface PanelPosition {
  x: number;
  y: number;
}

export const FloatingElementsPanel: React.FC<FloatingElementsPanelProps> = ({
  onAddElement,
  onAddText,
  onAddShape,
  className,
  isOpen,
  onClose
}) => {
  const [position, setPosition] = useState<PanelPosition>({ x: 300, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number; startX: number; startY: number }>({ x: 0, y: 0, startX: 0, startY: 0 });

  // Shapes data
  const shapes = [
    { id: 'rectangle', name: 'Rectangle', icon: '⬛', type: 'rect' },
    { id: 'circle', name: 'Circle', icon: '⚫', type: 'circle' },
    { id: 'triangle', name: 'Triangle', icon: '🔺', type: 'triangle' },
    { id: 'star', name: 'Star', icon: '⭐', type: 'star' },
    { id: 'heart', name: 'Heart', icon: '❤️', type: 'heart' },
    { id: 'hexagon', name: 'Hexagon', icon: '⬢', type: 'hexagon' },
  ];

  // Text presets
  const textPresets = [
    { id: 'heading', name: 'Heading', text: 'Add a heading', style: { fontSize: 48, fontWeight: 'bold' } },
    { id: 'subheading', name: 'Subheading', text: 'Add a subheading', style: { fontSize: 32, fontWeight: '600' } },
    { id: 'body', name: 'Body text', text: 'Add some body text', style: { fontSize: 16 } },
    { id: 'caption', name: 'Caption', text: 'Add a little bit of body text', style: { fontSize: 12, opacity: 0.7 } },
  ];

  // Design elements
  const designElements = [
    { id: 'line', name: 'Line', icon: '━', type: 'line' },
    { id: 'arrow', name: 'Arrow', icon: '→', type: 'arrow' },
    { id: 'frame', name: 'Frame', icon: '🖼️', type: 'frame' },
    { id: 'grid', name: 'Grid', icon: '⊞', type: 'grid' },
  ];

  // Handle drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === panelRef.current || (e.target as HTMLElement).classList.contains('panel-handle')) {
      setIsDragging(true);
      dragStartPos.current = {
        x: e.clientX,
        y: e.clientY,
        startX: position.x,
        startY: position.y
      };
      e.preventDefault();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;

      const newX = Math.max(0, Math.min(
        window.innerWidth - (panelRef.current?.offsetWidth || 0),
        dragStartPos.current.startX + deltaX
      ));

      const newY = Math.max(0, Math.min(
        window.innerHeight - (panelRef.current?.offsetHeight || 0),
        dragStartPos.current.startY + deltaY
      ));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Filter elements based on search
  const filteredShapes = shapes.filter(shape => 
    shape.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTextPresets = textPresets.filter(preset => 
    preset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredElements = designElements.filter(element => 
    element.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed z-50 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg transition-all duration-200",
        "w-80 min-h-96 max-h-[80vh] flex flex-col",
        "hover:shadow-xl hover:bg-white/98",
        isDragging && "shadow-2xl scale-105",
        isMinimized && "h-12 overflow-hidden",
        className
      )}
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Grip className="w-4 h-4 text-gray-400 panel-handle cursor-grab" />
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="font-medium text-gray-700">Elements</span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0"
            onClick={onClose}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Panel Content */}
      {!isMinimized && (
        <>
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search elements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="shapes" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 bg-gray-50 mx-3 mt-3">
              <TabsTrigger value="shapes" className="text-xs">Shapes</TabsTrigger>
              <TabsTrigger value="text" className="text-xs">Text</TabsTrigger>
              <TabsTrigger value="elements" className="text-xs">Elements</TabsTrigger>
            </TabsList>

            {/* Shapes Tab */}
            <TabsContent value="shapes" className="flex-1 m-0">
              <ScrollArea className="h-full p-3">
                <div className="grid grid-cols-2 gap-2">
                  {filteredShapes.map((shape) => (
                    <Button
                      key={shape.id}
                      variant="ghost"
                      className="h-20 flex flex-col items-center justify-center gap-2 border border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      onClick={() => onAddShape?.(shape.type)}
                    >
                      <span className="text-2xl">{shape.icon}</span>
                      <span className="text-xs text-gray-600">{shape.name}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Text Tab */}
            <TabsContent value="text" className="flex-1 m-0">
              <ScrollArea className="h-full p-3">
                <div className="space-y-2">
                  {filteredTextPresets.map((preset) => (
                    <Button
                      key={preset.id}
                      variant="ghost"
                      className="w-full h-16 flex flex-col items-start justify-center p-3 border border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-left"
                      onClick={() => onAddText?.(preset.text)}
                    >
                      <span className="font-medium text-gray-700">{preset.name}</span>
                      <span 
                        className="text-sm text-gray-500 truncate w-full"
                        style={{ fontSize: Math.min(preset.style.fontSize / 3, 14) }}
                      >
                        {preset.text}
                      </span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Elements Tab */}
            <TabsContent value="elements" className="flex-1 m-0">
              <ScrollArea className="h-full p-3">
                <div className="grid grid-cols-2 gap-2">
                  {filteredElements.map((element) => (
                    <Button
                      key={element.id}
                      variant="ghost"
                      className="h-20 flex flex-col items-center justify-center gap-2 border border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      onClick={() => onAddElement?.(element.type)}
                    >
                      <span className="text-2xl">{element.icon}</span>
                      <span className="text-xs text-gray-600">{element.name}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};