/**
 * Build Output Panel — Integrated terminal showing preview build logs and errors
 * 
 * Displays:
 * - Build status (building, success, error)
 * - Vite HMR log messages
 * - TypeScript diagnostics
 * - Runtime errors from preview iframe
 * - Dependency installation status
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Terminal, X, Trash2, AlertCircle, CheckCircle, 
  Loader2, ChevronDown, ChevronUp, Filter, Copy,
  AlertTriangle, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { vfsEventBus, type BuildLogEvent, type VFSEvent } from '@/services/vfsEventBus';

// ============================================================================
// Types
// ============================================================================

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'success' | 'system';
  message: string;
  source?: string;
  file?: string;
  line?: number;
  column?: number;
}

export interface BuildOutputPanelProps {
  className?: string;
  maxHeight?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  /** External log entries to display */
  externalLogs?: LogEntry[];
}

// ============================================================================
// Log ID generator
// ============================================================================

let logIdCounter = 0;
function nextLogId(): string {
  return `log_${++logIdCounter}_${Date.now()}`;
}

// ============================================================================
// Component
// ============================================================================

export function BuildOutputPanel({
  className,
  maxHeight = '200px',
  isCollapsed = false,
  onToggleCollapse,
  externalLogs = [],
}: BuildOutputPanelProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterLevel, setFilterLevel] = useState<'all' | 'error' | 'warn'>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);

  // Subscribe to event bus
  useEffect(() => {
    const unsubs = [
      vfsEventBus.on<BuildLogEvent>('build:log', (event) => {
        addLog({
          level: event.payload.level,
          message: event.payload.message,
          source: event.payload.source,
          file: event.payload.file,
          line: event.payload.line,
          column: event.payload.column,
        });
      }),
      vfsEventBus.on('build:error', (event) => {
        const payload = event.payload as { message: string; file?: string };
        addLog({ level: 'error', message: payload.message, file: payload.file, source: 'build' });
      }),
      vfsEventBus.on('build:success', () => {
        addLog({ level: 'success', message: 'Build completed successfully', source: 'build' });
      }),
      vfsEventBus.on('deps:resolved', (event) => {
        const payload = event.payload as { newDeps: string[] };
        if (payload.newDeps.length > 0) {
          addLog({ level: 'info', message: `Dependencies resolved: ${payload.newDeps.join(', ')}`, source: 'deps' });
        }
      }),
      vfsEventBus.on('deps:error', (event) => {
        const payload = event.payload as { message: string };
        addLog({ level: 'error', message: `Dependency error: ${payload.message}`, source: 'deps' });
      }),
      vfsEventBus.on('ai:apply:start', () => {
        addLog({ level: 'system', message: '▶ AI code generation started...', source: 'ai' });
      }),
      vfsEventBus.on('ai:apply:complete', (event) => {
        const payload = event.payload as { filesWritten: string[] };
        addLog({ level: 'success', message: `AI applied ${payload.filesWritten.length} files`, source: 'ai' });
      }),
      vfsEventBus.on('ai:apply:error', (event) => {
        const payload = event.payload as { message: string };
        addLog({ level: 'error', message: `AI error: ${payload.message}`, source: 'ai' });
      }),
      vfsEventBus.on('preview:error', (event) => {
        const payload = event.payload as { message: string };
        addLog({ level: 'error', message: `Preview: ${payload.message}`, source: 'preview' });
      }),
    ];

    return () => unsubs.forEach(u => u());
  }, []);

  // Merge external logs
  useEffect(() => {
    if (externalLogs.length > 0) {
      setLogs(prev => [...prev, ...externalLogs].slice(-500));
    }
  }, [externalLogs]);

  const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newEntry: LogEntry = {
      ...entry,
      id: nextLogId(),
      timestamp: Date.now(),
    };
    setLogs(prev => [...prev, newEntry].slice(-500));

    // Auto-scroll
    if (autoScrollRef.current && scrollRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      });
    }
  }, []);

  const filteredLogs = useMemo(() => {
    if (filterLevel === 'all') return logs;
    if (filterLevel === 'error') return logs.filter(l => l.level === 'error');
    if (filterLevel === 'warn') return logs.filter(l => l.level === 'warn' || l.level === 'error');
    return logs;
  }, [logs, filterLevel]);

  const errorCount = useMemo(() => logs.filter(l => l.level === 'error').length, [logs]);
  const warnCount = useMemo(() => logs.filter(l => l.level === 'warn').length, [logs]);

  const clearLogs = useCallback(() => setLogs([]), []);

  const copyLogs = useCallback(() => {
    const text = filteredLogs.map(l => {
      const time = new Date(l.timestamp).toLocaleTimeString();
      return `[${time}] [${l.level.toUpperCase()}] ${l.message}`;
    }).join('\n');
    navigator.clipboard.writeText(text);
  }, [filteredLogs]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    autoScrollRef.current = scrollHeight - scrollTop - clientHeight < 40;
  }, []);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />;
      case 'warn': return <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />;
      case 'success': return <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />;
      case 'system': return <Info className="w-3 h-3 text-blue-400 flex-shrink-0" />;
      default: return <Terminal className="w-3 h-3 text-white/30 flex-shrink-0" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-300';
      case 'warn': return 'text-amber-300';
      case 'success': return 'text-emerald-300';
      case 'system': return 'text-blue-300';
      default: return 'text-white/60';
    }
  };

  return (
    <div className={cn('flex flex-col bg-[#0d0d17] border-t border-white/[0.06]', className)}>
      {/* Header */}
      <div
        className="h-8 flex items-center justify-between px-3 cursor-pointer select-none hover:bg-white/[0.02] transition-colors"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-white/40" />
          <span className="text-[11px] font-medium text-white/50 uppercase tracking-wider">Output</span>
          {errorCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400">
              {errorCount}
            </span>
          )}
          {warnCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400">
              {warnCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Filter */}
          <button
            onClick={(e) => { e.stopPropagation(); setFilterLevel(f => f === 'all' ? 'error' : f === 'error' ? 'warn' : 'all'); }}
            className={cn(
              'p-1 rounded transition-colors',
              filterLevel !== 'all' ? 'bg-white/[0.08] text-white/60' : 'text-white/25 hover:text-white/40'
            )}
          >
            <Filter className="w-3 h-3" />
          </button>
          {/* Copy */}
          <button onClick={(e) => { e.stopPropagation(); copyLogs(); }} className="p-1 rounded text-white/25 hover:text-white/40 transition-colors">
            <Copy className="w-3 h-3" />
          </button>
          {/* Clear */}
          <button onClick={(e) => { e.stopPropagation(); clearLogs(); }} className="p-1 rounded text-white/25 hover:text-white/40 transition-colors">
            <Trash2 className="w-3 h-3" />
          </button>
          {/* Collapse toggle */}
          {isCollapsed ? <ChevronUp className="w-3 h-3 text-white/30" /> : <ChevronDown className="w-3 h-3 text-white/30" />}
        </div>
      </div>

      {/* Log area */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: maxHeight, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="overflow-y-auto font-mono text-[12px] leading-[1.6] px-3 pb-2"
              style={{ maxHeight }}
            >
              {filteredLogs.length === 0 ? (
                <div className="py-6 text-center text-white/20 text-[11px]">
                  No output yet. Build logs and errors will appear here.
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                      'flex items-start gap-1.5 py-0.5 hover:bg-white/[0.02] rounded px-1 -mx-1',
                      log.level === 'error' && 'bg-red-500/[0.04]',
                    )}
                  >
                    {getLevelIcon(log.level)}
                    <span className="text-white/20 text-[10px] tabular-nums flex-shrink-0 mt-[1px]">
                      {new Date(log.timestamp).toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    {log.source && (
                      <span className="text-[10px] text-white/20 bg-white/[0.04] px-1 rounded flex-shrink-0 mt-[1px]">
                        {log.source}
                      </span>
                    )}
                    <span className={cn('break-all', getLevelColor(log.level))}>
                      {log.message}
                      {log.file && (
                        <span className="text-white/20 ml-1">
                          ({log.file}{log.line ? `:${log.line}` : ''}{log.column ? `:${log.column}` : ''})
                        </span>
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
