import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  MousePointer, 
  Square, 
  Circle, 
  Type, 
  Image, 
  Upload, 
  Palette, 
  Settings, 
  Move3D,
  Grip,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FloatingDockProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  onImageUpload?: () => void;
  onOpenProperties?: () => void;
  onOpenElements?: () => void;
  className?: string;
}

interface DockPosition {
  x: number;
  y: number;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({
  activeTool,
  onToolChange,
  onImageUpload,
  onOpenProperties,
  onOpenElements,
  className
}) => {
  const [position, setPosition] = useState<DockPosition>({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number; startX: number; startY: number }>({ x: 0, y: 0, startX: 0, startY: 0 });

  // Dock tools configuration
  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select', hotkey: 'V' },
    { id: 'rectangle', icon: Square, label: 'Rectangle', hotkey: 'R' },
    { id: 'circle', icon: Circle, label: 'Circle', hotkey: 'C' },
    { id: 'text', icon: Type, label: 'Text', hotkey: 'T' },
    { id: 'image', icon: Image, label: 'Image', hotkey: 'I' },
  ];

  const actions = [
    { id: 'upload', icon: Upload, label: 'Upload', onClick: onImageUpload },
    { id: 'elements', icon: Palette, label: 'Elements', onClick: onOpenElements },
    { id: 'properties', icon: Settings, label: 'Properties', onClick: onOpenProperties },
  ];

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === dockRef.current || (e.target as HTMLElement).classList.contains('dock-handle')) {
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

  // Handle drag move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;

      const newX = Math.max(0, Math.min(
        window.innerWidth - (dockRef.current?.offsetWidth || 0),
        dragStartPos.current.startX + deltaX
      ));

      const newY = Math.max(0, Math.min(
        window.innerHeight - (dockRef.current?.offsetHeight || 0),
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const toolsMap = {
        'v': 'select',
        'r': 'rectangle', 
        'c': 'circle',
        't': 'text',
        'i': 'image'
      };

      const toolId = toolsMap[e.key.toLowerCase() as keyof typeof toolsMap];
      if (toolId) {
        onToolChange(toolId);
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onToolChange]);

  return (
    <TooltipProvider>
      <div
        ref={dockRef}
        className={cn(
          "fixed z-50 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg transition-all duration-200",
          "hover:shadow-xl hover:bg-white/98",
          isDragging && "shadow-2xl scale-105",
          isMinimized && "w-12 h-12",
          className
        )}
        style={{
          left: position.x,
          top: position.y,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Dock Header */}
        <div className={cn(
          "flex items-center justify-between p-2 border-b border-gray-100",
          isMinimized && "hidden"
        )}>
          <div className="flex items-center gap-1">
            <Grip className="w-3 h-3 text-gray-400 dock-handle cursor-grab" />
            <span className="text-xs font-medium text-gray-600">Tools</span>
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
          </div>
        </div>

        {/* Tools Grid */}
        <div className={cn(
          "p-3 space-y-3",
          isMinimized && "hidden"
        )}>
          {/* Primary Tools */}
          <div className="grid grid-cols-3 gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeTool === tool.id ? "default" : "ghost"}
                      size="sm"
                      className="w-10 h-10 p-0 relative group"
                      onClick={() => onToolChange(tool.id)}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="absolute -top-1 -right-1 text-[10px] bg-gray-100 text-gray-600 rounded px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {tool.hotkey}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{tool.label} ({tool.hotkey})</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Action Tools */}
          <div className="flex flex-col gap-2">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Tooltip key={action.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 px-2 py-1.5 h-8"
                      onClick={action.onClick}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{action.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Minimized State */}
        {isMinimized && (
          <div className="p-2 flex items-center justify-center">
            <Move3D className="w-6 h-6 text-gray-400" />
          </div>
        )}

        {/* Hover indicator when minimized */}
        {isMinimized && isHovered && (
          <div className="absolute left-full top-0 ml-2 bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Design Tools
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};