/**
 * Enhanced Mode Toggle
 * Industry-level edit/preview mode switcher with visual feedback
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Edit3, Eye, MousePointer2, Hand, Move, 
  Layers, Code2, Palette
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type BuilderMode = 'select' | 'edit' | 'preview' | 'pan' | 'code';

interface EnhancedModeToggleProps {
  currentMode: BuilderMode;
  onModeChange: (mode: BuilderMode) => void;
  isInteractive?: boolean;
  onInteractiveToggle?: (interactive: boolean) => void;
  className?: string;
}

const modeConfig: Record<BuilderMode, { 
  icon: React.ElementType; 
  label: string; 
  description: string;
  shortcut?: string;
}> = {
  select: { 
    icon: MousePointer2, 
    label: 'Select', 
    description: 'Select and move elements',
    shortcut: 'V'
  },
  edit: { 
    icon: Edit3, 
    label: 'Edit', 
    description: 'Edit element properties',
    shortcut: 'E'
  },
  preview: { 
    icon: Eye, 
    label: 'Preview', 
    description: 'Preview interactive state',
    shortcut: 'P'
  },
  pan: { 
    icon: Hand, 
    label: 'Pan', 
    description: 'Pan around the canvas',
    shortcut: 'H'
  },
  code: { 
    icon: Code2, 
    label: 'Code', 
    description: 'View and edit code',
    shortcut: 'C'
  },
};

export const EnhancedModeToggle: React.FC<EnhancedModeToggleProps> = ({
  currentMode,
  onModeChange,
  isInteractive = false,
  onInteractiveToggle,
  className,
}) => {
  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn(
        "flex items-center gap-1 p-1 bg-[#0d0d18] rounded-lg shadow-[0_0_15px_rgba(255,0,255,0.2)]",
        className
      )}>
        {/* Primary Mode Buttons */}
        <div className="flex items-center gap-0.5">
          {(['select', 'edit', 'preview'] as BuilderMode[]).map((mode) => {
            const config = modeConfig[mode];
            const Icon = config.icon;
            const isActive = currentMode === mode;
            
            return (
              <Tooltip key={mode}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onModeChange(mode)}
                    className={cn(
                      "h-8 px-3 gap-1.5 transition-all duration-200",
                      isActive && "bg-fuchsia-500 text-black shadow-[0_0_10px_rgba(255,0,255,0.5)] hover:bg-fuchsia-400",
                      !isActive && "text-fuchsia-300 hover:bg-fuchsia-500/20 hover:text-fuchsia-200"
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4 transition-transform",
                      isActive && "scale-110"
                    )} />
                    <span className="text-xs font-bold hidden sm:inline">
                      {config.label}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="flex flex-col gap-0.5">
                  <span className="font-medium">{config.label}</span>
                  <span className="text-xs text-white/50">{config.description}</span>
                  {config.shortcut && (
                    <kbd className="mt-1 px-1.5 py-0.5 text-xs bg-muted rounded">{config.shortcut}</kbd>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* Secondary Tools */}
        <div className="flex items-center gap-0.5">
          {(['pan', 'code'] as BuilderMode[]).map((mode) => {
            const config = modeConfig[mode];
            const Icon = config.icon;
            const isActive = currentMode === mode;
            
            return (
              <Tooltip key={mode}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => onModeChange(mode)}
                    className={cn(
                      "h-8 w-8 transition-all duration-200",
                      isActive && "bg-white/[0.08]"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="flex flex-col gap-0.5">
                  <span className="font-medium">{config.label}</span>
                  <span className="text-xs text-white/50">{config.description}</span>
                  {config.shortcut && (
                    <kbd className="mt-1 px-1.5 py-0.5 text-xs bg-muted rounded">{config.shortcut}</kbd>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Interactive Mode Toggle */}
        {onInteractiveToggle && (
          <>
            <div className="w-px h-6 bg-border mx-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isInteractive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onInteractiveToggle(!isInteractive)}
                  className={cn(
                    "h-8 px-3 gap-1.5 transition-all duration-200",
                    isInteractive && "bg-primary text-primary-foreground"
                  )}
                >
                  <Layers className={cn(
                    "h-4 w-4",
                    isInteractive && "animate-pulse"
                  )} />
                  <span className="text-xs font-medium hidden sm:inline">
                    {isInteractive ? 'Live' : 'Static'}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <span className="font-medium">Interactive Mode</span>
                <p className="text-xs text-white/50">
                  {isInteractive ? 'Click elements to interact' : 'Click to enable interactions'}
                </p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </TooltipProvider>
  );
};

export default EnhancedModeToggle;
