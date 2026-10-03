import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, ShieldCheck } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export type AIEditPermissionCategory = 'behavioral' | 'surgical' | 'ui' | 'backend';

export interface AIEditPermissions {
  behavioral: boolean;
  surgical: boolean;
  ui: boolean;
  backend: boolean;
}

export const AI_EDIT_PERMISSION_STORAGE_KEY = 'unison:ai-builder-permissions:v1';

// Review-first keeps a new workspace reversible while retaining per-category control.
export const DEFAULT_AI_EDIT_PERMISSIONS: AIEditPermissions = {
  behavioral: false,
  surgical: false,
  ui: false,
  backend: false,
};

export function loadAIEditPermissions(): AIEditPermissions {
  if (typeof window === 'undefined') return DEFAULT_AI_EDIT_PERMISSIONS;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(AI_EDIT_PERMISSION_STORAGE_KEY) || 'null') as Partial<AIEditPermissions> | null;
    return {
      behavioral: parsed?.behavioral === true,
      surgical: parsed?.surgical === true,
      ui: parsed?.ui === true,
      backend: parsed?.backend === true,
    };
  } catch {
    return DEFAULT_AI_EDIT_PERMISSIONS;
  }
}

const CATEGORY_META: Array<{ key: AIEditPermissionCategory; label: string; detail: string }> = [
  { key: 'behavioral', label: 'Behavioral edits', detail: 'State, handlers, routes, and interactions' },
  { key: 'surgical', label: 'Surgical edits', detail: 'Small scoped changes to existing source' },
  { key: 'ui', label: 'UI edits', detail: 'Layout, styling, content, and components' },
  { key: 'backend', label: 'Backend edits', detail: 'Capabilities, bindings, and data changes' },
];

interface AIPermissionControlProps {
  permissions: AIEditPermissions;
  onChange: (permissions: AIEditPermissions) => void;
}

export const AIPermissionControl: React.FC<AIPermissionControlProps> = ({ permissions, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const enabledCount = Object.values(permissions).filter(Boolean).length;
  const status = enabledCount === 0 ? 'Review' : enabledCount === 4 ? 'Auto' : 'Mixed';

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const setAll = (value: boolean) => {
    onChange({ behavioral: value, surgical: value, ui: value, backend: value });
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-label="AI edit permissions"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex h-7 items-center gap-1.5 px-1.5 text-[11px] transition-colors',
          open ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>{status}</span>
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-1rem)] rounded-md border border-border/80 bg-popover p-3 text-popover-foreground shadow-lg">
          <div className="flex items-start justify-between gap-3 pb-3">
            <div>
              <p className="text-xs font-semibold">AI edit permissions</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">Choose which changes can write automatically.</p>
            </div>
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
          </div>

          <div className="flex gap-3 border-b border-border/70 py-2.5">
            <button
              type="button"
              onClick={() => setAll(true)}
              className={cn('px-0.5 text-[10px] font-medium transition-colors', enabledCount === 4 ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}
            >
              Auto-apply all
            </button>
            <button
              type="button"
              onClick={() => setAll(false)}
              className={cn('px-0.5 text-[10px] font-medium transition-colors', enabledCount === 0 ? 'text-amber-700 dark:text-amber-300' : 'text-muted-foreground hover:text-foreground')}
            >
              Review all
            </button>
          </div>

          <div className="divide-y divide-border/60 pt-1">
            {CATEGORY_META.map((category) => (
              <label key={category.key} className="flex cursor-pointer items-center gap-2 px-1 py-2 first:pt-1.5 hover:bg-muted/40">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium">{category.label}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{category.detail}</p>
                </div>
                <Switch
                  className="!h-4 !w-7 !min-h-4 !min-w-7 rounded-sm border border-transparent data-[state=unchecked]:bg-muted-foreground/25 [&>span]:h-3 [&>span]:w-3 [&>span]:rounded-sm [&>span]:shadow-none [&>span[data-state=checked]]:translate-x-3"
                  checked={permissions[category.key]}
                  onCheckedChange={(checked) => onChange({ ...permissions, [category.key]: checked })}
                  aria-label={`Auto-apply ${category.label.toLowerCase()}`}
                >
                  <span className="sr-only">{permissions[category.key] ? 'Auto-apply enabled' : 'Review required'}</span>
                </Switch>
              </label>
            ))}
          </div>

          <div className="mt-2 flex items-center gap-1.5 pt-1 text-[10px] text-muted-foreground">
            <Check className="h-3 w-3 text-primary" />
            Changes that need review stay in the panel until you approve them.
          </div>
        </div>
      )}
    </div>
  );
};
