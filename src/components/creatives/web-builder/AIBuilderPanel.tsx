/**
 * AIBuilderPanel - Enhanced AI interface for Web Builder
 * 
 * Features:
 * - Static left side panel (always visible when builder opens)
 * - Cascade output showing AI thinking process
 * - "View Edits" button to redirect to VFS changes
 * - Two tabs only: Code and Debug
 * - Debug tab for iframe error handling with Supabase access
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Code2,
  Bug,
  Send,
  Sparkles,
  Loader2,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Terminal,
  Database,
  FileCode,
  Trash2,
  Copy,
  Play,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { BusinessSystemType } from '@/data/templates/types';

// ============================================================================
// Types
// ============================================================================

interface ThinkingStep {
  id: string;
  type: 'analyzing' | 'planning' | 'generating' | 'validating' | 'complete' | 'error';
  message: string;
  timestamp: Date;
  details?: string;
  isExpanded?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  thinking?: ThinkingStep[];
  code?: string;
  edits?: VFSEdit[];
  error?: IframeError;
  isStreaming?: boolean;
}

export interface VFSEdit {
  path: string;
  type: 'create' | 'modify' | 'delete';
  linesChanged?: number;
  preview?: string;
}

export interface IframeError {
  type: 'runtime' | 'syntax' | 'network' | 'supabase';
  message: string;
  stack?: string;
  file?: string;
  line?: number;
  column?: number;
  timestamp: Date;
}

interface AIBuilderPanelProps {
  currentCode?: string;
  systemType?: BusinessSystemType | null;
  templateName?: string | null;
  onCodeGenerated?: (code: string) => void;
  onFilesPatch?: (files: Record<string, string>) => boolean;
  onViewEdits?: (edits: VFSEdit[]) => void;
  iframeErrors?: IframeError[];
  onClearErrors?: () => void;
  onClose?: () => void;
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ============================================================================
// Thinking Step Component
// ============================================================================

const ThinkingStepItem: React.FC<{
  step: ThinkingStep;
  isLast: boolean;
  onToggle: () => void;
}> = ({ step, isLast, onToggle }) => {
  const icons = {
    analyzing: <Sparkles className="w-3 h-3 text-lime-400 animate-pulse" />,
    planning: <FileCode className="w-3 h-3 text-cyan-400" />,
    generating: <Code2 className="w-3 h-3 text-lime-400 animate-pulse" />,
    validating: <CheckCircle2 className="w-3 h-3 text-cyan-400" />,
    complete: <CheckCircle2 className="w-3 h-3 text-lime-400" />,
    error: <XCircle className="w-3 h-3 text-red-400" />,
  };

  return (
    <div className="flex items-start gap-2 py-1">
      <div className="flex flex-col items-center">
        <div className="w-5 h-5 rounded-full bg-lime-500/10 border border-lime-500/20 flex items-center justify-center">
          {icons[step.type]}
        </div>
        {!isLast && <div className="w-px h-4 bg-lime-500/20" />}
      </div>
      <div className="flex-1 min-w-0">
        <button
          onClick={onToggle}
          className="flex items-center gap-1 text-xs text-lime-400/70 hover:text-lime-400 transition-colors w-full text-left"
        >
          {step.details && (
            step.isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
          )}
          <span className="truncate font-mono">{step.message}</span>
          <span className="text-lime-400/30 text-[10px] ml-auto font-mono">{formatTimestamp(step.timestamp)}</span>
        </button>
        {step.isExpanded && step.details && (
          <pre className="mt-1 p-2 bg-black/40 border border-lime-500/20 rounded text-[10px] text-lime-400/50 overflow-x-auto font-mono">
            {step.details}
          </pre>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Message Component with Cascade Thinking
// ============================================================================

const MessageItem: React.FC<{
  message: Message;
  onViewEdits?: (edits: VFSEdit[]) => void;
  onApplyCode?: (code: string) => void;
  onRetryError?: (error: IframeError) => void;
}> = ({ message, onViewEdits, onApplyCode, onRetryError }) => {
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>(message.thinking || []);
  const [showThinking, setShowThinking] = useState(false);

  const toggleStep = (stepId: string) => {
    setThinkingSteps(prev =>
      prev.map(s => s.id === stepId ? { ...s, isExpanded: !s.isExpanded } : s)
    );
  };

  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[85%] bg-cyan-500/20 border border-cyan-500/30 rounded-lg px-3 py-2">
          <p className="text-sm text-cyan-100">{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.role === 'system') {
    return (
      <div className="flex justify-center mb-3">
        <div className="bg-lime-500/10 border border-lime-500/20 rounded-full px-3 py-1">
          <p className="text-xs text-lime-400/70 font-mono">{message.content}</p>
        </div>
      </div>
    );
  }

  // Assistant message with cascade thinking
  return (
    <div className="mb-4">
      {/* Thinking Process (collapsible cascade) */}
      {thinkingSteps.length > 0 && (
        <div className="mb-2">
          <button
            onClick={() => setShowThinking(!showThinking)}
            className="flex items-center gap-1 text-xs text-lime-400/50 hover:text-lime-400/70 transition-colors mb-1 font-mono"
          >
            {showThinking ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <Sparkles className="w-3 h-3 text-lime-400" />
            <span>AI Thinking ({thinkingSteps.length} steps)</span>
          </button>
          {showThinking && (
            <div className="ml-2 pl-2 border-l border-lime-500/20">
              {thinkingSteps.map((step, i) => (
                <ThinkingStepItem
                  key={step.id}
                  step={step}
                  isLast={i === thinkingSteps.length - 1}
                  onToggle={() => toggleStep(step.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main message content */}
      <div className="bg-black/40 border border-lime-500/20 rounded-lg px-3 py-2">
        {message.isStreaming && (
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="w-3 h-3 animate-spin text-lime-400" />
            <span className="text-xs text-lime-400/50 font-mono">Generating...</span>
          </div>
        )}
        <p className="text-sm text-lime-100/90 whitespace-pre-wrap">{message.content}</p>

        {/* View Edits Button */}
        {message.edits && message.edits.length > 0 && onViewEdits && (
          <div className="mt-3 pt-2 border-t border-lime-500/20">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewEdits(message.edits!)}
              className="gap-2 bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_10px_rgba(0,255,255,0.3)]"
            >
              <Eye className="w-3 h-3" />
              View Edits ({message.edits.length} file{message.edits.length > 1 ? 's' : ''})
              <ExternalLink className="w-3 h-3" />
            </Button>
            <div className="mt-2 space-y-1">
              {message.edits.map((edit, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-lime-400/50 font-mono">
                  <Badge variant="outline" className={cn(
                    "text-[10px] px-1",
                    edit.type === 'create' && "border-lime-500/50 text-lime-400",
                    edit.type === 'modify' && "border-cyan-500/50 text-cyan-400",
                    edit.type === 'delete' && "border-red-500/50 text-red-400"
                  )}>
                    {edit.type}
                  </Badge>
                  <span className="truncate">{edit.path}</span>
                  {edit.linesChanged && (
                    <span className="text-lime-400/30">+{edit.linesChanged} lines</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Apply Code Button */}
        {message.code && onApplyCode && (
          <div className="mt-3 pt-2 border-t border-white/10 flex gap-2">
            <Button
              size="sm"
              onClick={() => onApplyCode(message.code!)}
              className="gap-2 bg-lime-500 hover:bg-lime-400 text-black font-semibold"
            >
              <Play className="w-3 h-3" />
              Apply Code
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                navigator.clipboard.writeText(message.code!);
                toast.success('Code copied to clipboard');
              }}
              className="gap-1 text-white/50 hover:text-white"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Error with retry */}
        {message.error && onRetryError && (
          <div className="mt-3 pt-2 border-t border-red-500/20">
            <div className="flex items-start gap-2 p-2 bg-red-500/10 rounded">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-red-300 font-medium">{message.error.type} error</p>
                <p className="text-xs text-red-400/80 truncate">{message.error.message}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRetryError(message.error!)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Debug Panel Component
// ============================================================================

const DebugPanel: React.FC<{
  errors: IframeError[];
  onFixError: (error: IframeError) => void;
  onClearErrors?: () => void;
  isFixing: boolean;
}> = ({ errors, onFixError, onClearErrors, isFixing }) => {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Debug Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-fuchsia-500/20 bg-[#0d0d18]">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-fuchsia-400 drop-shadow-[0_0_5px_rgba(255,0,255,0.5)]" />
          <span className="text-sm font-bold text-fuchsia-400 font-mono">
            {errors.length} Error{errors.length !== 1 ? 's' : ''}
          </span>
        </div>
        {errors.length > 0 && onClearErrors && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearErrors}
            className="h-7 text-xs text-fuchsia-400/50 hover:text-fuchsia-400 hover:bg-fuchsia-500/10"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Error List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {errors.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-8 h-8 text-lime-500/50 mx-auto mb-2 drop-shadow-[0_0_10px_rgba(0,255,0,0.3)]" />
              <p className="text-sm text-lime-400/60 font-mono">No errors detected</p>
              <p className="text-xs text-lime-400/30 mt-1 font-mono">Errors from the preview will appear here</p>
            </div>
          ) : (
            errors.map((error, i) => (
              <div
                key={`${error.timestamp.getTime()}-${i}`}
                className="p-3 bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded flex items-center justify-center shrink-0",
                    error.type === 'runtime' && "bg-red-500/20",
                    error.type === 'syntax' && "bg-orange-500/20",
                    error.type === 'network' && "bg-yellow-500/20",
                    error.type === 'supabase' && "bg-fuchsia-500/20"
                  )}>
                    {error.type === 'supabase' ? (
                      <Database className="w-3 h-3 text-fuchsia-400" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] border-fuchsia-500/30 text-fuchsia-400">
                        {error.type}
                      </Badge>
                      {error.file && (
                        <span className="text-[10px] text-fuchsia-400/40 font-mono truncate">
                          {error.file}
                          {error.line && `:${error.line}`}
                          {error.column && `:${error.column}`}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-fuchsia-100/80 mt-1">{error.message}</p>
                    {error.stack && (
                      <pre className="mt-2 p-2 bg-black/40 border border-fuchsia-500/10 rounded text-[10px] text-fuchsia-400/40 overflow-x-auto max-h-20 font-mono">
                        {error.stack}
                      </pre>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => onFixError(error)}
                    disabled={isFixing}
                    className="gap-2 bg-fuchsia-500 hover:bg-fuchsia-400 text-black font-bold shadow-[0_0_15px_rgba(255,0,255,0.4)] hover:shadow-[0_0_20px_rgba(255,0,255,0.6)] transition-all duration-200"
                  >
                    {isFixing ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    Auto-Fix with AI
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Supabase CLI Access Info */}
      <div className="px-3 py-2 border-t border-lime-500/20 bg-[#0d0d18]">
        <div className="flex items-center gap-2 text-xs text-lime-400/40 font-mono">
          <Database className="w-3 h-3" />
          <span>Supabase CLI access enabled</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const AIBuilderPanel: React.FC<AIBuilderPanelProps> = ({
  currentCode,
  systemType,
  templateName,
  onCodeGenerated,
  onFilesPatch,
  onViewEdits,
  iframeErrors = [],
  onClearErrors,
  onClose,
  className,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'debug'>('code');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: generateId(),
        role: 'assistant',
        content: `👋 Welcome to the AI Builder!\n\nI can help you:\n• Generate and modify code\n• Fix errors in your preview\n• Debug Supabase integrations\n\nJust describe what you want to build or switch to Debug tab to fix errors.`,
        timestamp: new Date(),
        thinking: [
          { id: '1', type: 'complete', message: 'Ready to assist', timestamp: new Date() }
        ],
      }]);
    }
  }, [messages.length]);

  // Simulate thinking steps for AI response
  const simulateThinking = useCallback(async (userPrompt: string): Promise<ThinkingStep[]> => {
    const steps: ThinkingStep[] = [];
    
    steps.push({
      id: generateId(),
      type: 'analyzing',
      message: 'Analyzing request...',
      timestamp: new Date(),
      details: `User prompt: "${userPrompt.substring(0, 100)}${userPrompt.length > 100 ? '...' : ''}"`,
    });

    await new Promise(r => setTimeout(r, 300));
    
    steps.push({
      id: generateId(),
      type: 'planning',
      message: 'Planning changes...',
      timestamp: new Date(),
      details: currentCode ? `Current template: ${currentCode.length} chars` : 'No existing template',
    });

    await new Promise(r => setTimeout(r, 400));
    
    steps.push({
      id: generateId(),
      type: 'generating',
      message: 'Generating code...',
      timestamp: new Date(),
    });

    return steps;
  }, [currentCode]);

  // Send message to AI
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Simulate thinking process
      const thinkingSteps = await simulateThinking(input);
      
      // Add streaming message
      const streamingId = generateId();
      setMessages(prev => [...prev, {
        id: streamingId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        thinking: thinkingSteps,
        isStreaming: true,
      }]);

      // Call AI service with retry logic
      const MAX_RETRIES = 2;
      let response = null;
      let lastError = null;
      
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          if (attempt > 0) {
            // Update thinking to show retry
            thinkingSteps.push({
              id: generateId(),
              type: 'analyzing',
              message: `Retrying (attempt ${attempt + 1}/${MAX_RETRIES + 1})...`,
              timestamp: new Date(),
            });
            setMessages(prev => prev.map(m =>
              m.id === streamingId ? { ...m, thinking: [...thinkingSteps] } : m
            ));
            // Exponential backoff: 1s, 2s
            await new Promise(r => setTimeout(r, attempt * 1000));
          }
          
          // Truncate currentCode to stay within edge function limits
          const MAX_CODE_LENGTH = 180_000;
          const truncatedCode = currentCode && currentCode.length > MAX_CODE_LENGTH
            ? currentCode.substring(0, MAX_CODE_LENGTH) + '\n<!-- ... truncated for AI processing -->'
            : currentCode;

          response = await supabase.functions.invoke('ai-code-assistant', {
            body: {
              messages: [{ role: 'user', content: input }],
              mode: 'code',
              currentCode: truncatedCode,
              editMode: !!currentCode,
              systemType,
              templateName,
            },
          });
          
          // Check for retryable errors
          if (response.error) {
            const errorMsg = response.error.message || '';
            const isRetryable = errorMsg.includes('non-2xx') || 
                               errorMsg.includes('timeout') ||
                               errorMsg.includes('temporarily unavailable');
            
            if (isRetryable && attempt < MAX_RETRIES) {
              console.log(`[AIBuilderPanel] Retryable error, attempt ${attempt + 1}:`, errorMsg);
              lastError = response.error;
              continue;
            }
            throw response.error;
          }
          
          // Success
          break;
        } catch (err) {
          lastError = err;
          if (attempt >= MAX_RETRIES) throw err;
        }
      }
      
      if (!response || response.error) {
        throw lastError || new Error('AI service failed after retries');
      }

      // The edge function returns { content, generatedImage?, imagePlacement? }
      const aiContent = response.data?.content || 'I processed your request but have no specific output to show.';
      
      // Extract code from content - AI may return full HTML in content
      let generatedCode = null;
      if (aiContent) {
        // Check if content contains HTML code (starts with <!DOCTYPE or <html or contains full HTML structure)
        const hasHtmlStructure = aiContent.includes('<!DOCTYPE') || 
                                  aiContent.includes('<html') || 
                                  (aiContent.includes('<head') && aiContent.includes('<body'));
        if (hasHtmlStructure) {
          generatedCode = aiContent;
        }
      }

      // Determine VFS edits from response
      const edits: VFSEdit[] = [];
      if (generatedCode) {
        edits.push({
          path: '/index.html',
          type: currentCode ? 'modify' : 'create',
          linesChanged: generatedCode.split('\n').length,
          preview: generatedCode.substring(0, 200),
        });
      }

      // Add final thinking step
      thinkingSteps.push({
        id: generateId(),
        type: 'complete',
        message: 'Generation complete',
        timestamp: new Date(),
      });

      // Update message with final content
      setMessages(prev => prev.map(m =>
        m.id === streamingId
          ? {
              ...m,
              content: aiContent,
              thinking: thinkingSteps,
              code: generatedCode,
              edits: edits.length > 0 ? edits : undefined,
              isStreaming: false,
            }
          : m
      ));

      // Auto-apply generated code to preview
      if (generatedCode && onCodeGenerated) {
        onCodeGenerated(generatedCode);
        toast.success('Code applied to preview');
      }

    } catch (error) {
      console.error('[AIBuilderPanel] Error:', error);
      
      // Extract more descriptive error message
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Parse edge function errors for better messaging
        if (errorMessage.includes('non-2xx status code')) {
          errorMessage = 'AI service temporarily unavailable. Please try again in a moment.';
        } else if (errorMessage.includes('Rate limit')) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (errorMessage.includes('timeout') || errorMessage.includes('AbortError')) {
          errorMessage = 'Request timed out. Try a shorter prompt or try again.';
        } else if (errorMessage.includes('Payment required')) {
          errorMessage = 'AI credits needed. Please check your subscription.';
        }
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase FunctionsHttpError
        const err = error as { message?: string; context?: { body?: string } };
        errorMessage = err.message || 'Edge function error';
        if (err.context?.body) {
          try {
            const body = JSON.parse(err.context.body);
            if (body.error) errorMessage = body.error;
            if (body.details) errorMessage += ` (${JSON.stringify(body.details)})`;
          } catch {
            // Ignore parse errors
          }
        }
      }
      
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again or simplify your request.`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fix iframe error with AI
  const handleFixError = async (error: IframeError) => {
    setIsFixing(true);
    setActiveTab('code'); // Switch to code tab to show the fix

    const errorPrompt = `Fix this ${error.type} error:\n\nError: ${error.message}${error.stack ? `\n\nStack trace:\n${error.stack}` : ''}${error.file ? `\n\nFile: ${error.file}:${error.line}:${error.column}` : ''}`;

    const userMessage: Message = {
      id: generateId(),
      role: 'system',
      content: `🔧 Auto-fixing ${error.type} error...`,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await supabase.functions.invoke('ai-code-assistant', {
        body: {
          messages: [{ role: 'user', content: errorPrompt }],
          mode: 'debug',
          currentCode,
          editMode: true,
          systemType,
          templateName,
        },
      });

      if (response.error) throw response.error;

      const fix = response.data?.code || response.data?.response;
      
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: response.data?.response || '✅ Fix generated! Review and apply the changes below.',
        timestamp: new Date(),
        code: fix,
        error,
        thinking: [
          { id: '1', type: 'analyzing', message: 'Analyzing error...', timestamp: new Date() },
          { id: '2', type: 'planning', message: 'Determining fix strategy...', timestamp: new Date() },
          { id: '3', type: 'generating', message: 'Generating fix...', timestamp: new Date() },
          { id: '4', type: 'validating', message: 'Validating solution...', timestamp: new Date() },
          { id: '5', type: 'complete', message: 'Fix ready', timestamp: new Date() },
        ],
      }]);

    } catch (err) {
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: `Failed to auto-fix: ${err instanceof Error ? err.message : 'Unknown error'}. Try describing the issue manually.`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsFixing(false);
    }
  };

  // Handle applying generated code
  const handleApplyCode = (code: string) => {
    if (onCodeGenerated) {
      onCodeGenerated(code);
      toast.success('Code applied to preview');
    }
  };

  // Handle viewing edits
  const handleViewEdits = (edits: VFSEdit[]) => {
    if (onViewEdits) {
      onViewEdits(edits);
    } else {
      toast.info('VFS file explorer will open with changes highlighted');
    }
  };

  // Quick prompts for code tab
  const quickPrompts = [
    'Add a hero section',
    'Make it mobile responsive',
    'Add smooth animations',
    'Wire up the contact form',
  ];

  return (
    <div className={cn(
      "flex flex-col h-full bg-[#0a0a12] border-r border-lime-500/20",
      "shadow-[inset_0_0_30px_rgba(0,255,0,0.03)]",
      className
    )}>
      {/* Retro Header with Lime Glow */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-lime-500/30 bg-[#0d0d18]">
        <div className="p-1.5 rounded-lg bg-lime-500 shadow-[0_0_15px_rgba(0,255,0,0.5)]">
          <Sparkles className="w-4 h-4 text-black" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-lime-400 drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]">
            🤖 AI Builder
          </h2>
          <p className="text-[10px] text-lime-300/50 truncate font-mono">
            {templateName || 'New Project'} • {systemType || 'General'}
          </p>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-lime-400/50 hover:text-lime-400 hover:bg-lime-500/10 rounded transition-all duration-200"
            title="Close AI Panel"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Retro Tabs with Glow Effects */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'code' | 'debug')} className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full grid grid-cols-2 rounded-none h-10 bg-[#0a0a14] border-b border-lime-500/20">
          <TabsTrigger
            value="code"
            className="text-xs gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-lime-400 data-[state=active]:text-lime-400 data-[state=active]:bg-lime-500/10 data-[state=active]:shadow-[0_0_10px_rgba(0,255,0,0.3)] text-lime-400/50 hover:text-lime-400/70 transition-all duration-200"
          >
            <Code2 className="w-3.5 h-3.5" />
            Code
          </TabsTrigger>
          <TabsTrigger
            value="debug"
            className="text-xs gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-fuchsia-400 data-[state=active]:text-fuchsia-400 data-[state=active]:bg-fuchsia-500/10 data-[state=active]:shadow-[0_0_10px_rgba(255,0,255,0.3)] text-fuchsia-400/50 hover:text-fuchsia-400/70 transition-all duration-200"
          >
            <Bug className="w-3.5 h-3.5" />
            Debug
            {iframeErrors.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center animate-pulse">
                {iframeErrors.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Code Tab */}
        <TabsContent value="code" className="flex-1 flex flex-col m-0 min-h-0 data-[state=inactive]:hidden">
          {/* Messages */}
          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="py-3 px-3">
              {messages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  onViewEdits={handleViewEdits}
                  onApplyCode={handleApplyCode}
                  onRetryError={handleFixError}
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex items-center gap-2 text-lime-400/50 text-sm py-2 font-mono">
                  <Loader2 className="w-4 h-4 animate-spin text-lime-400" />
                  <span>▸ Processing...</span>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Prompts with Retro Style */}
          {messages.length <= 1 && (
            <div className="flex-shrink-0 px-3 pb-2">
              <p className="text-[10px] text-lime-400/40 mb-1.5 font-mono">▸ Quick start:</p>
              <div className="flex flex-wrap gap-1">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="text-[10px] px-2 py-1 bg-lime-500/10 hover:bg-lime-500/20 rounded border border-lime-500/20 hover:border-lime-500/40 text-lime-400/70 hover:text-lime-400 transition-all duration-200 hover:shadow-[0_0_8px_rgba(0,255,0,0.2)]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input with Retro Styling */}
          <div className="flex-shrink-0 mt-auto p-3 border-t border-lime-500/20 bg-[#0d0d18]">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Describe what you want to build..."
                className="min-h-[60px] max-h-[120px] bg-black/40 border-lime-500/30 text-sm resize-none text-lime-100 placeholder:text-lime-400/30 focus:border-lime-400 focus:ring-lime-400/20"
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-lime-400/30 font-mono">
                Enter → send • Shift+Enter → new line
              </span>
              <Button
                size="sm"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="gap-1.5 bg-lime-500 hover:bg-lime-400 text-black font-bold shadow-[0_0_15px_rgba(0,255,0,0.4)] hover:shadow-[0_0_20px_rgba(0,255,0,0.6)] transition-all duration-200"
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
                Send
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Debug Tab */}
        <TabsContent value="debug" className="flex-1 flex flex-col m-0 min-h-0 data-[state=inactive]:hidden">
          <DebugPanel
            errors={iframeErrors}
            onFixError={handleFixError}
            onClearErrors={onClearErrors}
            isFixing={isFixing}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIBuilderPanel;
