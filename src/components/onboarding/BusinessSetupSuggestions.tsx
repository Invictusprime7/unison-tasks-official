/**
 * BusinessSetupSuggestions — compact projection of the canonical launch
 * tasks (src/services/playground/launchReadiness.ts). Progress reflects real
 * system state; there is no local "mark complete". Each task opens the
 * Playground section that owns it.
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ChevronRight, Rocket, ArrowRight, Loader2, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BusinessSystemType } from '@/data/templates/types';
import {
  deriveLaunchTasks,
  summarizeLaunchTasks,
  type LaunchReadinessInput,
  type LaunchTask,
} from '@/services/playground/launchReadiness';
import { loadLaunchReadinessInput } from '@/services/playground/playgroundService';

interface BusinessSetupSuggestionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  systemType?: BusinessSystemType | null;
  templateName?: string | null;
  projectId?: string | null;
  businessId?: string | null;
  siteId?: string | null;
  industry?: string | null;
  vfsFiles?: Record<string, string>;
  notificationEmail?: string | null;
  customDomain?: string | null;
  publishBlockers?: number;
  /** Opens the Playground section that owns a task. */
  onOpenTask?: (task: LaunchTask) => void;
  onOpenSetupWizard?: () => void;
  onSkip?: () => void;
}

const STATUS_LABEL: Record<LaunchTask['status'], string> = {
  ready: 'Ready',
  needs_action: 'Set up',
  pending_verification: 'Check',
  blocked: 'Blocked',
};

export function BusinessSetupSuggestions({
  open,
  onOpenChange,
  systemType,
  templateName,
  projectId,
  businessId,
  siteId,
  industry,
  vfsFiles,
  notificationEmail,
  customDomain,
  publishBlockers,
  onOpenTask,
  onOpenSetupWizard,
  onSkip,
}: BusinessSetupSuggestionsProps) {
  const [loaded, setLoaded] = useState<LaunchReadinessInput | null>(null);

  useEffect(() => {
    if (!open || !businessId) return;
    let alive = true;
    loadLaunchReadinessInput({ businessId, projectId, siteId, industry, vfsFiles })
      .then((r) => alive && setLoaded(r))
      .catch(() => alive && setLoaded({}));
    return () => { alive = false; };
    // vfsFiles identity changes per render; reload only when opened or scope changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, businessId, projectId, siteId, industry]);

  const tasks = useMemo(
    () => deriveLaunchTasks({ ...(loaded ?? {}), systemType, notificationEmail, customDomain, publishBlockers }),
    [loaded, systemType, notificationEmail, customDomain, publishBlockers],
  );
  const summary = summarizeLaunchTasks(tasks);
  const open_ = tasks.filter((t) => t.status !== 'ready');
  const done = tasks.filter((t) => t.status === 'ready');
  const loading = Boolean(businessId) && loaded === null;

  const openTask = (task: LaunchTask) => {
    onOpenChange(false);
    if (onOpenTask) onOpenTask(task);
    else onOpenSetupWizard?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden">
        <div className="p-6 pb-4 border-b">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Rocket className="w-5 h-5 text-primary" />
              <div>
                <DialogTitle className="text-xl">Launch Your {templateName || 'Site'}</DialogTitle>
                <DialogDescription className="mt-1">
                  Based on what your site actually shows and what's already set up
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Launch readiness</span>
              <span className="text-sm font-medium">
                {loading ? 'Checking…' : `${summary.ready}/${summary.total} ready`}
              </span>
            </div>
            <Progress value={loading ? 0 : summary.percent} className="h-2" />
          </div>
        </div>

        <ScrollArea className="flex-1 max-h-[50vh]">
          <div className="p-6 space-y-2">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Checking your site…
              </div>
            ) : (
              <>
                {open_.map((t) => <TaskRow key={t.id} task={t} onOpen={() => openTask(t)} />)}
                {done.map((t) => <TaskRow key={t.id} task={t} onOpen={() => openTask(t)} />)}
              </>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t flex items-center justify-between">
          <Button variant="ghost" onClick={() => { onSkip?.(); onOpenChange(false); }}>
            Skip for now
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => { onOpenChange(false); onOpenSetupWizard?.(); }}>
              Open Launch in Playground
            </Button>
            <Button onClick={() => onOpenChange(false)} className="gap-2">
              Continue Editing <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TaskRow({ task, onOpen }: { task: LaunchTask; onOpen: () => void }) {
  const Icon = task.status === 'ready' ? CheckCircle2 : task.status === 'pending_verification' ? Clock : AlertCircle;
  return (
    <div className={cn('flex items-start gap-3 p-3 rounded-lg border', task.status === 'ready' && 'opacity-60')}>
      <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', task.status === 'ready' ? 'text-primary' : task.status === 'blocked' ? 'text-destructive' : 'text-muted-foreground')} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium">{task.title}</h4>
          {task.priority !== 'optional' && task.status !== 'ready' && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{task.priority}</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{task.description}</p>
      </div>
      {task.status !== 'ready' && (
        <Button variant="ghost" size="sm" onClick={onOpen} className="shrink-0 h-8 text-xs gap-1">
          {STATUS_LABEL[task.status]} <ChevronRight className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}

export default BusinessSetupSuggestions;
