import React, { useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Edit3, MousePointer, Hand, Move, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface InteractiveModeToggleProps {
  isInteractiveMode: boolean;
  onToggle: (interactive: boolean) => void;
  className?: string;
}

export const InteractiveModeToggle: React.FC<InteractiveModeToggleProps> = ({
  isInteractiveMode,
  onToggle,
  className
}) => {
  const handleToggle = useCallback(() => {
    const newMode = !isInteractiveMode;
    onToggle(newMode);
    
    if (newMode) {
      toast.success('🖱️ Interactive Mode Enabled', {
        description: 'Click call-to-actions and links to test functionality. Press Shift+I to toggle back.',
        action: {
          label: 'Got it',
          onClick: () => {},
        },
      });
    } else {
      toast.success('✏️ Edit Mode Enabled', {
        description: 'Click elements to select and edit them. Press Shift+I to toggle back.',
        action: {
          label: 'Got it', 
          onClick: () => {},
        },
      });
    }
  }, [isInteractiveMode, onToggle]);

  // Keyboard shortcut: Shift + I to toggle interactive mode
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        handleToggle();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [handleToggle]);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center border border-white/10 rounded-lg p-1 bg-[#1a1a1a]">
        <Button
          variant={!isInteractiveMode ? "secondary" : "ghost"}
          size="sm"
          onClick={() => !isInteractiveMode ? null : handleToggle()}
          className={cn(
            "h-8 text-xs transition-all duration-200",
            !isInteractiveMode
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              : "text-white/70 hover:text-white hover:bg-white/10"
          )}
          title="Edit Mode - Click elements to select and modify them"
        >
          <Edit3 className="h-3 w-3 mr-1.5" />
          Edit
        </Button>
        <Button
          variant={isInteractiveMode ? "secondary" : "ghost"}
          size="sm"
          onClick={() => isInteractiveMode ? null : handleToggle()}
          className={cn(
            "h-8 text-xs transition-all duration-200",
            isInteractiveMode
              ? "bg-green-600 text-white hover:bg-green-700 shadow-sm"
              : "text-white/70 hover:text-white hover:bg-white/10"
          )}
          title="Interactive Mode - Click call-to-actions and links to test functionality"
        >
          <MousePointer className="h-3 w-3 mr-1.5" />
          Interactive
        </Button>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-white/50">
        {isInteractiveMode ? (
          <div className="flex items-center gap-1">
            <Hand className="h-3 w-3 text-green-400" />
            <span>Click buttons & links to test</span>
            <kbd className="px-1 py-0.5 bg-white/10 rounded text-[10px] font-mono">⇧I</kbd>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Move className="h-3 w-3 text-blue-400" />
            <span>Click elements to edit</span>
            <kbd className="px-1 py-0.5 bg-white/10 rounded text-[10px] font-mono">⇧I</kbd>
          </div>
        )}
      </div>
    </div>
  );
};