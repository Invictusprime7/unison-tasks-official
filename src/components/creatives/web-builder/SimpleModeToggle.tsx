/**
 * Simple Mode Toggle - Clean, intuitive mode switcher
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MousePointer2, Eye, Trash2, Copy } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type SimpleBuilderMode = 'select' | 'preview';

interface SimpleModeToggleProps {
  currentMode: SimpleBuilderMode;
  onModeChange: (mode: SimpleBuilderMode) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  hasSelection?: boolean;
  className?: string;
}

export const SimpleModeToggle: React.FC<SimpleModeToggleProps> = ({
  currentMode,
  onModeChange,
  onDelete,
  onDuplicate,
  hasSelection = false,
  className,
}) => {
  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn(
        "flex items-center gap-1 p-1.5 bg-background/95 backdrop-blur-md border border-border/50 rounded-xl shadow-lg",
        className
      )}>
        {/* Mode Toggle - Select/Preview */}
        <div className="flex items-center bg-muted/50 rounded-lg p-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onModeChange('select')}
                className={cn(
                  "h-9 px-4 gap-2 rounded-md transition-all duration-200",
                  currentMode === 'select' 
                    ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <MousePointer2 className="h-4 w-4" />
                <span className="text-sm font-medium">Select</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="font-medium">Select Mode</p>
              <p className="text-xs text-muted-foreground">Click elements to edit properties</p>
              <kbd className="mt-1 px-1.5 py-0.5 text-xs bg-muted rounded">V</kbd>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onModeChange('preview')}
                className={cn(
                  "h-9 px-4 gap-2 rounded-md transition-all duration-200",
                  currentMode === 'preview' 
                    ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Eye className="h-4 w-4" />
                <span className="text-sm font-medium">Preview</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="font-medium">Preview Mode</p>
              <p className="text-xs text-muted-foreground">Test interactions & links</p>
              <kbd className="mt-1 px-1.5 py-0.5 text-xs bg-muted rounded">P</kbd>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Action Buttons - Only show when there's a selection */}
        {hasSelection && (
          <>
            <div className="w-px h-6 bg-border mx-1" />
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDuplicate}
                    className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">Duplicate</p>
                  <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">⌘D</kbd>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDelete}
                    className="h-9 w-9 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">Delete</p>
                  <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Del</kbd>
                </TooltipContent>
              </Tooltip>
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );
};

export default SimpleModeToggle;
