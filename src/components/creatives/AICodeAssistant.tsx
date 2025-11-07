import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Canvas as FabricCanvas, Rect, Textbox } from 'fabric';
import { supabase } from "@/integrations/supabase/client";
// Lazy load Monaco Editor for better initial load time
const MonacoEditor = lazy(() => import('./MonacoEditor'));
import { executeCanvasCode, getCanvasCodeExample } from '@/utils/canvasCodeRunner';
import { parseComponentCode, renderComponentToCanvas, generateHTMLFile, generateReactComponent } from '@/utils/componentRenderer';
import { Button } from '@/components/ui/button';
import { CodeViewer } from './CodeViewer';
import { LiveCodePreview } from './LiveCodePreview';
// Removed: CanvasQuickStart - now using AIAssistantPanel in WebBuilder
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Send, 
  Code2, 
  Palette, 
  CheckCircle2, 
  Copy, 
  Download,
  Loader2,
  ChevronDown,
  ChevronUp,
  Eye,
  Layout,
  Maximize2,
  Code
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  detectDesignPattern, 
  type DesignPattern 
} from '@/services/designPatternService';
import {
  detectPatternFromSupabase,
  fetchDesignSchemas,
  type DesignSchema
} from '@/services/designSchemaService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasCode?: boolean;
  componentData?: any;
}

interface AICodeAssistantProps {
  className?: string;
  fabricCanvas?: FabricCanvas | null;
  onCodeGenerated?: (code: string) => void;
  onSwitchToCanvasView?: () => void;
}

export const AICodeAssistant: React.FC<AICodeAssistantProps> = ({ className, fabricCanvas, onCodeGenerated, onSwitchToCanvasView }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'code' | 'design' | 'review'>('code');
  const [isExpanded, setIsExpanded] = useState(false);
  const [codeViewerOpen, setCodeViewerOpen] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [detectedPattern, setDetectedPattern] = useState<DesignPattern | null>(null);
  const [showPatternGuide, setShowPatternGuide] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Prefetch design schemas on mount for faster pattern detection
  useEffect(() => {
    fetchDesignSchemas().catch(err => 
      console.error('[AICodeAssistant] Failed to prefetch schemas:', err)
    );
  }, []);

  // Clear messages when component unmounts or remounts to prevent stale context
  useEffect(() => {
    return () => {
      setMessages([]);
    };
  }, []);

  // REMOVED: Conversation loading/persistence and learning features
  // to ensure fresh iterations with new design pattern schemas

  const openCodeViewer = (code: string) => {
    console.log('[AICodeAssistant] Opening code viewer with code:', code.substring(0, 100));
    setCurrentCode(code);
    setCodeViewerOpen(true);
    toast({
      title: 'Code editor opened',
      description: 'Edit and render your code on the canvas',
    });
  };

  const handleCodeRender = async (code: string) => {
    if (!fabricCanvas) {
      throw new Error('Canvas not available');
    }

    console.log('[AICodeAssistant] Rendering code to canvas');
    
    // Detect code type and render accordingly
    if (code.includes('addRect') || code.includes('addCircle') || code.includes('addText')) {
      // Canvas API code
      await executeCanvasCode(
        code,
        fabricCanvas,
        () => {
          console.log('[AICodeAssistant] Canvas code executed successfully');
        },
        (error) => {
          console.error('[AICodeAssistant] Canvas code execution failed:', error);
          throw error;
        }
      );
    } else {
      // HTML/React component code
      const component = parseComponentCode(code);
      await renderComponentToCanvas(component, fabricCanvas);
      
      toast({
        title: 'Component rendered!',
        description: `${component.type} component added to canvas`,
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'Code copied successfully',
    });
  };

  const renderComponentData = (componentData: any) => {
    if (!fabricCanvas) {
      toast({
        title: 'Canvas not available',
        description: 'Please make sure the Web Builder canvas is ready.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('[AICodeAssistant] Rendering component:', componentData);
      const { elements, description } = componentData;

      if (!elements || elements.length === 0) {
        toast({
          title: 'No elements to render',
          description: 'The component has no visual elements.',
          variant: 'destructive',
        });
        return;
      }

      elements.forEach((element: any) => {
        if (element.type === 'rectangle') {
          const rect = new Rect({
            left: element.x || 100,
            top: element.y || 100,
            width: element.width || 200,
            height: element.height || 100,
            fill: element.fill || '#3b82f6',
            rx: element.rx || 0,
            ry: element.ry || 0,
            stroke: element.stroke,
            strokeWidth: element.strokeWidth || 0,
            selectable: true,
            hasControls: true,
            hasBorders: true,
          });
          fabricCanvas.add(rect);
        } else if (element.type === 'text') {
          const text = new Textbox(element.text || 'Text', {
            left: element.x || 100,
            top: element.y || 100,
            width: element.width || 300,
            fontSize: element.fontSize || 16,
            fill: element.fill || '#000000',
            fontWeight: element.fontWeight || 'normal',
            textAlign: element.textAlign || 'left',
            selectable: true,
            editable: true,
            hasControls: true,
            hasBorders: true,
          });
          fabricCanvas.add(text);
        }
      });

      fabricCanvas.renderAll();

      toast({
        title: 'Component rendered!',
        description: description || 'Component added to canvas successfully.',
      });

      // REMOVED: Pattern learning/caching to ensure fresh AI iterations with new design patterns
      // This was saving old patterns to the database that could interfere with new schema
      // if (learningEnabled) {
      //   saveCodePattern(
      //     JSON.stringify(componentData),
      //     'component',
      //     'Successfully rendered component from AI generation'
      //   );
      // }
    } catch (error) {
      console.error('[AICodeAssistant] Render error:', error);
      toast({
        title: 'Render failed',
        description: 'Could not render component to canvas.',
        variant: 'destructive',
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Detect pattern for user feedback only - don't constrain AI
    let supabaseSchema: DesignSchema | null = null;
    let pattern: DesignPattern | null = null;
    
    try {
      supabaseSchema = await detectPatternFromSupabase(input);
      if (supabaseSchema) {
        console.log('[AICodeAssistant] Pattern reference:', supabaseSchema.pattern_name);
        // Subtle notification - pattern is just a reference, not a constraint
        toast({
          title: `${supabaseSchema.pattern_name.charAt(0).toUpperCase() + supabaseSchema.pattern_name.slice(1)} Style Reference`,
          description: 'AI will use this as inspiration',
        });
      }
    } catch (error) {
      console.error('[AICodeAssistant] Pattern detection error:', error);
    }

    // Fallback to local detection
    if (!supabaseSchema) {
      pattern = detectDesignPattern(input);
      if (pattern) {
        setDetectedPattern(pattern);
        console.log('[AICodeAssistant] Style reference:', pattern);
      }
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send user's request directly without heavy schema enhancement
      // Let the AI be intelligent and creative naturally
      const messagesToSend = messages.map(m => ({ 
        role: m.role, 
        content: m.content 
      })).concat([
        { 
          role: userMessage.role, 
          content: userMessage.content // Pure user request, no schema bloat
        }
      ]);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-code-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: messagesToSend,
            mode,
            // Pass pattern metadata for reference, but don't pollute the prompt
            detectedPattern: supabaseSchema?.pattern_name || pattern || null,
            patternColors: supabaseSchema?.color_scheme || null,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: 'Rate limit exceeded',
            description: 'Please wait a moment before trying again.',
            variant: 'destructive',
          });
          return;
        }
        if (response.status === 402) {
          toast({
            title: 'Credits required',
            description: 'Please add credits to continue using AI features.',
            variant: 'destructive',
          });
          return;
        }
        throw new Error('Failed to get AI response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let toolCallData: any = null;
      let toolCallArgs = '';
      let updateCounter = 0;
      const UPDATE_INTERVAL = 5; // Update UI every N chunks for better performance

      if (reader) {
        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                
                // Handle tool calls - accumulate arguments
                if (parsed.choices?.[0]?.delta?.tool_calls) {
                  const toolCalls = parsed.choices[0].delta.tool_calls;
                  for (const toolCall of toolCalls) {
                    if (toolCall.function?.name === 'render_component') {
                      if (toolCall.function.arguments) {
                        toolCallArgs += toolCall.function.arguments;
                      }
                    }
                  }
                }
                
                // Handle finish reason - parse complete tool call
                if (parsed.choices?.[0]?.finish_reason === 'tool_calls' && toolCallArgs) {
                  try {
                    toolCallData = JSON.parse(toolCallArgs);
                    console.log('[AICodeAssistant] Parsed complete tool call:', toolCallData);
                  } catch (e) {
                    console.error('[AICodeAssistant] Failed to parse complete tool call:', e);
                  }
                }
                
                // Handle regular content
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  assistantContent += content;
                  updateCounter++;
                  
                  // Throttle UI updates for better performance
                  if (updateCounter % UPDATE_INTERVAL === 0 || parsed.choices?.[0]?.finish_reason) {
                    const hasCode = assistantContent.includes('```');
                    
                    // Extract code from markdown code blocks and send to parent
                    if (hasCode && onCodeGenerated) {
                      const codeMatch = assistantContent.match(/```(?:html|jsx|tsx|javascript)?\n([\s\S]*?)```/);
                      if (codeMatch && codeMatch[1]) {
                        onCodeGenerated(codeMatch[1].trim());
                      }
                    }
                    
                    setMessages(prev => {
                      const newMessages = [...prev];
                      const lastMessage = newMessages[newMessages.length - 1];
                      
                      if (lastMessage?.role === 'assistant') {
                        newMessages[newMessages.length - 1] = {
                          ...lastMessage,
                          content: assistantContent,
                          hasCode,
                          componentData: toolCallData,
                        };
                      } else {
                        newMessages.push({
                          role: 'assistant',
                          content: assistantContent,
                          timestamp: new Date(),
                          hasCode,
                          componentData: toolCallData,
                        });
                      }
                      return newMessages;
                    });
                  }
                }
              } catch (e) {
                console.error('[AICodeAssistant] Parse error:', e);
              }
            }
          }
        }

        // REMOVED: Assistant message persistence to ensure fresh AI iterations
        // Save the complete assistant message to database
        // if (assistantContent) {
        //   const assistantMessage: Message = {
        //     role: 'assistant',
        //     content: assistantContent,
        //     timestamp: new Date(),
        //     hasCode: assistantContent.includes('```'),
        //     componentData: toolCallData,
        //   };
        //   await saveMessage(assistantMessage);
        // }

        // Auto-render if we got component data and canvas is available
        if (toolCallData && fabricCanvas && mode === 'code') {
          console.log('[AICodeAssistant] Auto-rendering component to canvas');
          setTimeout(() => {
            renderComponentData(toolCallData);
          }, 500);
        } else {
          if (!toolCallData) console.log('[AICodeAssistant] No tool call data received');
          if (!fabricCanvas) console.log('[AICodeAssistant] Canvas not available');
          if (mode !== 'code') console.log('[AICodeAssistant] Not in code mode');
        }
      }
    } catch (error) {
      console.error('Error streaming AI response:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = {
    code: [
      'Create a material design dashboard with metric cards',
      'Build a creative portfolio with project gallery',
      'Generate an e-commerce product showcase page',
      'Design a landing page with hero and features',
    ],
    design: [
      'Apply material design elevation to my layout',
      'Add creative portfolio styling to my showcase',
      'Suggest workspace UI improvements',
    ],
    review: [
      'Review this React component',
      'Check for performance issues',
      'Suggest accessibility improvements',
    ],
  };

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out",
      isExpanded ? "h-[600px]" : "h-16",
      className
    )}>
      {/* Sleek Header Bar - Lovable AI Inspired */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative h-16 overflow-hidden backdrop-blur-xl bg-gradient-to-r from-purple-600/95 via-blue-600/95 to-indigo-600/95 flex items-center justify-between px-6 cursor-pointer group border-t-2 border-white/20 shadow-2xl"
      >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Flowing particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-32 h-32 bg-white/10 rounded-full blur-2xl -top-16 -left-16 animate-pulse" style={{animationDuration: '3s'}} />
          <div className="absolute w-24 h-24 bg-blue-300/10 rounded-full blur-xl top-4 right-1/4 animate-pulse" style={{animationDuration: '4s', animationDelay: '1s'}} />
          <div className="absolute w-20 h-20 bg-purple-300/10 rounded-full blur-lg bottom-2 right-1/3 animate-pulse" style={{animationDuration: '5s', animationDelay: '2s'}} />
        </div>
        
        <div className="relative flex items-center gap-4">
          {/* Animated Icon Container */}
          <div className="relative">
            <div className="absolute inset-0 bg-white/30 rounded-xl blur-md group-hover:bg-white/40 transition-all" />
            <div className="relative h-11 w-11 rounded-xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-6 h-6 text-white drop-shadow-lg animate-pulse" />
            </div>
          </div>
          
          <div className="flex flex-col">
            <h3 className="text-white font-bold text-lg tracking-tight drop-shadow-lg flex items-center gap-2">
              AI Web Designer
              <span className="text-xs font-normal bg-white/20 px-2 py-0.5 rounded-full">Pro</span>
            </h3>
            <p className="text-white/80 text-xs font-medium">
              {!isExpanded && messages.length > 0 
                ? `${messages.length} ${messages.length === 1 ? 'message' : 'messages'} • Click to expand`
                : "Industry-level templates with creative variance"
              }
            </p>
          </div>
          
          {detectedPattern && (
            <span className="text-xs bg-white/30 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-in slide-in-from-left border border-white/40 shadow-lg">
              🎨 <span className="font-semibold">{detectedPattern.charAt(0).toUpperCase() + detectedPattern.slice(1)}</span>
            </span>
          )}
        </div>
        
        <div className="relative flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowPatternGuide(!showPatternGuide);
            }}
            title="Design Pattern Guide"
            className="text-white hover:bg-white/20 hover:scale-110 transition-all h-9 px-3 rounded-lg backdrop-blur-sm"
          >
            <span className="text-lg">🎨</span>
            <span className="ml-1 text-xs font-medium hidden sm:inline">Patterns</span>
          </Button>
          <div className="h-9 w-9 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all border border-white/20">
            {isExpanded ? <ChevronDown className="w-5 h-5 text-white" /> : <ChevronUp className="w-5 h-5 text-white" />}
          </div>
        </div>
      </div>

      {/* Main Content - Figma/Lovable Inspired Fluid Layout */}
      {isExpanded && (
        <div className="h-[calc(100%-64px)] bg-gradient-to-br from-background via-muted/10 to-purple-50/30 dark:to-purple-950/10 border-t flex overflow-hidden">
          {/* Quick Start Sidebar - REMOVED: Now using AIAssistantPanel instead */}
          
          {/* Main chat area - WordPress/Lovable Fluid Design */}
          <div className="flex-1 flex flex-col min-w-0 relative">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50 pointer-events-none z-10" />
            
          {/* Mode Selector with Glassmorphism - Figma Inspired */}
          <div className="relative border-b border-border/50 backdrop-blur-sm bg-background/80">
            <div className="flex items-center justify-between px-4">
              <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)} className="flex-1">
                <TabsList className="w-full grid grid-cols-3 rounded-none h-14 bg-transparent border-0">
                  <TabsTrigger 
                    value="code" 
                    className="gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500/10 data-[state=active]:to-blue-500/10 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-t-lg transition-all duration-300"
                  >
                    <Code2 className="w-4 h-4" />
                    <span className="font-semibold">Generate Code</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="design" 
                    className="gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-500/10 data-[state=active]:to-orange-500/10 data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-t-lg transition-all duration-300"
                  >
                    <Palette className="w-4 h-4" />
                    <span className="font-semibold">Design Tips</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="review" 
                    className="gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-500/10 data-[state=active]:to-teal-500/10 data-[state=active]:border-b-2 data-[state=active]:border-green-500 rounded-t-lg transition-all duration-300"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-semibold">Code Review</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMessages([]);
                    setInput('');
                    setDetectedPattern(null);
                    toast({
                      title: 'Conversation cleared',
                      description: 'Starting fresh with a clean slate',
                    });
                  }}
                  className="ml-3 text-xs font-medium hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  Clear Chat
                </Button>
              )}
            </div>
          </div>

          {/* Quick Prompts - WordPress Style Dynamic Pills */}
          {messages.length === 0 && (
            <div className="p-4 border-b border-border/30 bg-gradient-to-r from-muted/40 via-muted/20 to-transparent backdrop-blur-sm">
              <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <span className="inline-block w-1 h-4 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
                Quick Start Templates:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts[mode].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(prompt)}
                    className="group relative text-xs px-4 py-2.5 bg-gradient-to-br from-background to-muted/50 border border-border/50 rounded-xl hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
                  >
                    <span className="relative z-10 font-medium">{prompt}</span>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/10 group-hover:to-blue-500/10 rounded-xl transition-all duration-300" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages - Lovable AI Chat Design with Variance */}
          <ScrollArea className="flex-1 p-6 relative z-20" ref={scrollRef}>
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.length === 0 && (
                <div className="text-center py-12 animate-in fade-in duration-700">
                  <div className="relative inline-block mb-6">
                    {/* Glowing orb effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                    <div className="relative w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {mode === 'code' && 'Professional Web Components'}
                    {mode === 'design' && 'Expert Design Guidance'}
                    {mode === 'review' && 'Code Quality Analysis'}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    {mode === 'code' && 'Create production-ready React components with Lovable AI quality, Figma precision, and WordPress flexibility'}
                    {mode === 'design' && 'Get industry-level design recommendations inspired by top design systems and modern web standards'}
                    {mode === 'review' && 'Receive comprehensive code reviews with performance, accessibility, and best practice insights'}
                  </p>
                  
                  {/* Design Pattern Showcase */}
                  {mode === 'code' && (
                    <div className="mt-8 space-y-4">
                      <p className="text-sm font-semibold text-muted-foreground mb-4">🎨 Design Patterns I Can Apply:</p>
                      <div className="grid grid-cols-3 gap-3 max-w-3xl mx-auto">
                        {/* Neomorphic */}
                        <div 
                          onClick={() => setInput('Create a neomorphic card with soft shadows and tactile design')}
                          className="p-3 rounded-lg border-2 border-dashed border-muted hover:border-primary cursor-pointer transition-all hover:scale-105"
                          style={{
                            background: '#e0e5ec',
                            boxShadow: '8px 8px 16px #b8bec7, -8px -8px 16px #ffffff'
                          }}
                        >
                          <div className="text-sm font-bold mb-1" style={{ color: '#4a5568' }}>Neomorphic</div>
                          <div className="text-xs" style={{ color: '#718096' }}>Soft UI, tactile</div>
                        </div>
                        
                        {/* Cyberpunk */}
                        <div 
                          onClick={() => setInput('Build a cyberpunk neon button with electric glow')}
                          className="p-3 rounded-lg border-2 border-dashed cursor-pointer transition-all hover:scale-105"
                          style={{
                            background: '#1a1f3a',
                            border: '2px solid #00ffff',
                            boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
                          }}
                        >
                          <div className="text-sm font-bold mb-1" style={{ color: '#00ffff' }}>Cyberpunk</div>
                          <div className="text-xs" style={{ color: '#ff00ff' }}>Neon, futuristic</div>
                        </div>
                        
                        {/* Gradient */}
                        <div 
                          onClick={() => setInput('Generate a gradient hero section with vibrant colors')}
                          className="p-3 rounded-lg border-2 border-dashed border-transparent hover:border-white cursor-pointer transition-all hover:scale-105"
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
                          }}
                        >
                          <div className="text-sm font-bold mb-1 text-white">Gradient</div>
                          <div className="text-xs text-white/80">Vibrant blends</div>
                        </div>
                        
                        {/* Glassmorphism */}
                        <div 
                          onClick={() => setInput('Create a glassmorphism card with frosted glass effect')}
                          className="p-3 rounded-lg border cursor-pointer transition-all hover:scale-105"
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.18)',
                            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
                          }}
                        >
                          <div className="text-sm font-bold mb-1 text-white">Glassmorphism</div>
                          <div className="text-xs text-white/70">Frosted glass</div>
                        </div>
                        
                        {/* Material Design */}
                        <div 
                          onClick={() => setInput('Create a material design dashboard with elevation')}
                          className="p-3 rounded-lg border cursor-pointer transition-all hover:scale-105"
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #E0E0E0',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.12)'
                          }}
                        >
                          <div className="text-sm font-bold mb-1" style={{ color: '#1976D2' }}>Material Design</div>
                          <div className="text-xs" style={{ color: '#757575' }}>Google style</div>
                        </div>
                        
                        {/* Creative Portfolio */}
                        <div 
                          onClick={() => setInput('Build a creative portfolio with artistic showcase')}
                          className="p-3 rounded-lg border cursor-pointer transition-all hover:scale-105"
                          style={{
                            background: 'linear-gradient(135deg, #7B68EE 0%, #9B8AFE 100%)',
                            border: '1px solid #9B8AFE',
                            boxShadow: '0 4px 12px rgba(123, 104, 238, 0.2)'
                          }}
                        >
                          <div className="text-sm font-bold mb-1 text-white">Portfolio</div>
                          <div className="text-xs text-white/80">Creative Canva</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-4 items-start animate-in fade-in slide-in-from-bottom-3 duration-500",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {/* Assistant Avatar with Fluid Animation */}
                  {message.role === "assistant" && (
                    <div className="relative flex-shrink-0 group">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                      <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-xl border-2 border-white/20 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                  
                  {/* Message Content with Variance */}
                  <div
                    className={cn(
                      "rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl max-w-[85%]",
                      message.role === "user"
                        ? "bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 text-white ml-auto border-2 border-white/10 px-6 py-4"
                        : "bg-gradient-to-br from-background to-muted/50 backdrop-blur-sm border-2 border-border/50"
                    )}
                  >
                    {/* Pattern Badge for User Messages */}
                    {message.role === 'user' && detectDesignPattern(message.content) && (
                      <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold border border-white/30">
                        <span className="text-lg">🎨</span>
                        {detectDesignPattern(message.content)?.toUpperCase()} STYLE
                      </div>
                    )}
                    
                    {message.content.includes('```') ? (
                      <div className="space-y-3">
                        {message.content.split('```').map((part, i) => {
                          if (i % 2 === 0) {
                            return part ? (
                              <div key={i} className="px-4 py-3">
                                <p className="whitespace-pre-wrap m-0 text-sm leading-relaxed">{part}</p>
                              </div>
                            ) : null;
                          }
                          const lines = part.split('\n');
                          const lang = lines[0].trim();
                          const codeContent = lines.slice(1).join('\n').trim();
                          
                          return (
                            <div key={i} className="relative group border-2 border-border/30 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all bg-background/50 backdrop-blur-sm">
                              {/* Code Header - Figma Style */}
                              <div className="flex items-center justify-between bg-gradient-to-r from-muted/80 to-muted/50 px-4 py-3 border-b border-border/30">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/30">
                                    <Code className="w-4 h-4 text-purple-600" />
                                  </div>
                                  <span className="text-xs font-bold text-foreground/80 uppercase tracking-wide">{lang || 'code'}</span>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openCodeViewer(codeContent)}
                                    className="h-8 px-3 hover:bg-purple-500/10 hover:text-purple-600 transition-all hover:scale-105 rounded-lg font-medium"
                                    title="Open in full editor"
                                  >
                                    <Maximize2 className="w-3.5 h-3.5 mr-1.5" />
                                    <span className="text-xs">Edit</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(codeContent)}
                                    className="h-8 px-3 hover:bg-blue-500/10 hover:text-blue-600 transition-all hover:scale-105 rounded-lg"
                                    title="Copy code"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                              <div className="max-h-[400px] overflow-auto">
                                <Suspense fallback={
                                  <div className="flex items-center justify-center p-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                                  </div>
                                }>
                                  <MonacoEditor
                                    height="auto"
                                    defaultLanguage={lang || 'typescript'}
                                    language={lang || 'typescript'}
                                    value={codeContent}
                                    theme="vs-dark"
                                    options={{
                                      readOnly: true,
                                      minimap: { enabled: false },
                                      fontSize: 13,
                                      lineNumbers: 'on',
                                      scrollBeyondLastLine: false,
                                      automaticLayout: true,
                                      wordWrap: 'on',
                                      padding: { top: 12, bottom: 12 },
                                      scrollbar: {
                                        vertical: 'auto',
                                        horizontal: 'auto',
                                      },
                                      renderLineHighlight: 'none',
                                      contextmenu: false,
                                    }}
                                    loading={null}
                                  />
                                </Suspense>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-4 py-3">
                        <p className="whitespace-pre-wrap m-0 text-sm leading-relaxed">{message.content}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* User Avatar with Gradient */}
                  {message.role === "user" && (
                    <div className="relative flex-shrink-0 group">
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-orange-500 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                      <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 flex items-center justify-center shadow-xl border-2 border-white/20 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-3">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl blur-md opacity-50 animate-pulse" />
                    <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-xl border-2 border-white/20">
                      <svg className="w-6 h-6 text-white drop-shadow-lg animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="rounded-2xl px-6 py-5 bg-gradient-to-br from-background to-muted/50 backdrop-blur-sm border-2 border-border/50 shadow-lg">
                    <div className="flex gap-3 items-center">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 animate-bounce shadow-sm" />
                        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 animate-bounce shadow-sm" style={{ animationDelay: '0.15s' }} />
                        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 animate-bounce shadow-sm" style={{ animationDelay: '0.3s' }} />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground ml-1">Crafting your design...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area - WordPress/Lovable Modern Input with Quick Actions */}
          <div className="p-6 border-t border-border/30 bg-gradient-to-br from-background via-background to-muted/10 backdrop-blur-xl relative z-20">
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Quick Action Pills - Figma Inspired */}
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setInput("Create a modern hero section with gradient and call-to-action")}
                  className="group px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500/10 to-purple-500/5 text-purple-700 dark:text-purple-300 hover:from-purple-500/20 hover:to-purple-500/10 transition-all hover:scale-105 border border-purple-500/20 hover:border-purple-500/40 shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <span className="text-base">🎨</span>
                  Hero Section
                </button>
                <button 
                  onClick={() => setInput("Design responsive pricing cards with hover effects")}
                  className="group px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/10 to-blue-500/5 text-blue-700 dark:text-blue-300 hover:from-blue-500/20 hover:to-blue-500/10 transition-all hover:scale-105 border border-blue-500/20 hover:border-blue-500/40 shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <span className="text-base">💎</span>
                  Pricing Cards
                </button>
                <button 
                  onClick={() => setInput("Build a testimonials section with avatar cards")}
                  className="group px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-500/10 to-pink-500/5 text-pink-700 dark:text-pink-300 hover:from-pink-500/20 hover:to-pink-500/10 transition-all hover:scale-105 border border-pink-500/20 hover:border-pink-500/40 shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <span className="text-base">⭐</span>
                  Testimonials
                </button>
                <button 
                  onClick={() => setInput("Create a sticky navigation with smooth scrolling")}
                  className="group px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500/10 to-green-500/5 text-green-700 dark:text-green-300 hover:from-green-500/20 hover:to-green-500/10 transition-all hover:scale-105 border border-green-500/20 hover:border-green-500/40 shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <span className="text-base">🧭</span>
                  Navigation
                </button>
              </div>
              
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative group">
                  {/* Floating label effect */}
                  <div className="absolute -top-2 left-4 px-2 bg-background text-xs font-medium text-muted-foreground opacity-0 group-focus-within:opacity-100 transition-opacity">
                    Describe your vision
                  </div>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Describe your design vision... (e.g., 'sleek landing page with smooth animations and modern gradients')"
                    disabled={isLoading}
                    className="min-h-[70px] max-h-[140px] resize-none px-6 py-4 rounded-2xl border-2 border-border/40 focus:border-purple-500/60 bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md focus:shadow-lg transition-all text-sm leading-relaxed"
                    autoFocus={false}
                  />
                  {/* Character hint */}
                  <div className="absolute bottom-3 right-4 text-xs text-muted-foreground/50">
                    {input.length > 0 && `${input.length} chars`}
                  </div>
                </div>
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="h-[70px] w-[70px] rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed border-2 border-white/10"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Send className="w-6 h-6" />
                  )}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-500/50" />
                  Powered by Lovable AI • Industry-level quality • Creative variance
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs">Enter</kbd> to send
                </p>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Code Viewer Dialog */}
      <Dialog open={codeViewerOpen} onOpenChange={setCodeViewerOpen}>
        <DialogContent className="max-w-6xl h-[80vh] p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Code Viewer & Editor
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <CodeViewer
              code={currentCode}
              language="typescript"
              onRender={handleCodeRender}
              onMigrateToCanvas={(code) => {
                console.log('[AICodeAssistant] Migrate to Canvas triggered');
                // Close the code viewer dialog
                setCodeViewerOpen(false);
                // Update the preview code
                onCodeGenerated?.(code);
                // Switch the main WebBuilder to Canvas view
                onSwitchToCanvasView?.();
                // Notify user
                toast({
                  title: 'Migrated to Canvas View',
                  description: 'View your live preview in the Canvas tab',
                });
              }}
              className="h-full"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Design Pattern Guide Dialog */}
      <Dialog open={showPatternGuide} onOpenChange={setShowPatternGuide}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🎨 Design Pattern Guide
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="mb-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-semibold">✨ Pattern Categories</p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                <div><strong>Style Patterns:</strong> Neomorphic, Cyberpunk, Gradient, Glass</div>
                <div><strong>Template Patterns:</strong> Material, Portfolio, E-commerce, Landing</div>
              </div>
            </div>

            {/* Neomorphic */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-lg" style={{
                  background: '#e0e5ec',
                  boxShadow: '8px 8px 16px #b8bec7, -8px -8px 16px #ffffff'
                }}></div>
                <div>
                  <h3 className="font-bold">Neomorphic</h3>
                  <p className="text-sm text-muted-foreground">Soft UI, tactile shadows</p>
                </div>
              </div>
              <p className="text-sm">Keywords: neomorphic, soft shadow, embossed, raised, inset, tactile</p>
              <div className="text-xs bg-muted p-2 rounded">
                Example: "Create a neomorphic card with soft shadows"
              </div>
            </div>

            {/* Cyberpunk */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-lg" style={{
                  background: '#1a1f3a',
                  border: '2px solid #00ffff',
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
                }}></div>
                <div>
                  <h3 className="font-bold">Cyberpunk</h3>
                  <p className="text-sm text-muted-foreground">Neon, futuristic glow</p>
                </div>
              </div>
              <p className="text-sm">Keywords: cyberpunk, neon, futuristic, glow, electric, sci-fi, digital</p>
              <div className="text-xs bg-muted p-2 rounded">
                Example: "Build a cyberpunk neon button with electric glow"
              </div>
            </div>

            {/* Gradient */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-lg" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
                }}></div>
                <div>
                  <h3 className="font-bold">Gradient</h3>
                  <p className="text-sm text-muted-foreground">Vibrant color blends</p>
                </div>
              </div>
              <p className="text-sm">Keywords: gradient, color blend, rainbow, spectrum, vibrant, colorful</p>
              <div className="text-xs bg-muted p-2 rounded">
                Example: "Generate a gradient hero section with vibrant colors"
              </div>
            </div>

            {/* Glassmorphism */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-lg" style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
                }}></div>
                <div>
                  <h3 className="font-bold">Glassmorphism</h3>
                  <p className="text-sm text-muted-foreground">Frosted glass, blur</p>
                </div>
              </div>
              <p className="text-sm">Keywords: glassmorphism, glass, frosted, translucent, blur, transparent</p>
              <div className="text-xs bg-muted p-2 rounded">
                Example: "Create a glassmorphism card with frosted glass effect"
              </div>
            </div>

            {/* Minimal */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-lg border" style={{
                  background: '#ffffff',
                  border: '1px solid #e5e5e5'
                }}></div>
                <div>
                  <h3 className="font-bold">Minimal</h3>
                  <p className="text-sm text-muted-foreground">Clean, simple design</p>
                </div>
              </div>
              <p className="text-sm">Keywords: minimal, minimalist, simple, clean, basic</p>
              <div className="text-xs bg-muted p-2 rounded">
                Example: "Design a minimal card with clean layout"
              </div>
            </div>

            {/* Modern */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-lg" style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
                }}></div>
                <div>
                  <h3 className="font-bold">Modern</h3>
                  <p className="text-sm text-muted-foreground">Professional, sleek</p>
                </div>
              </div>
              <p className="text-sm">Keywords: modern, contemporary, sleek, professional, elegant</p>
              <div className="text-xs bg-muted p-2 rounded">
                Example: "Create a modern dashboard with sleek design"
              </div>
            </div>

            <div className="border-t pt-6 mt-6">
              <h3 className="font-bold text-lg mb-4">🎯 Web Design Kit Patterns</h3>
              
              {/* Material Design */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-lg" style={{
                    background: '#FFFFFF',
                    border: '1px solid #E0E0E0',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.12)'
                  }}></div>
                  <div>
                    <h3 className="font-bold">Material Design</h3>
                    <p className="text-sm text-muted-foreground">Google Material UI</p>
                  </div>
                </div>
                <p className="text-sm">Keywords: material design, google design, elevation, paper, material dashboard</p>
                <div className="text-xs bg-muted p-2 rounded">
                  Example: "Create a material design dashboard with metric cards"
                </div>
              </div>

              {/* Workspace UI */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{
                    background: '#F8F9FA',
                    border: '1px solid #DADCE0'
                  }}>
                    <span style={{ color: '#4285F4', fontSize: '20px', fontWeight: 'bold' }}>D</span>
                  </div>
                  <div>
                    <h3 className="font-bold">Workspace UI</h3>
                    <p className="text-sm text-muted-foreground">Google Workspace style</p>
                  </div>
                </div>
                <p className="text-sm">Keywords: workspace, google workspace, docs, productivity app, collaborative</p>
                <div className="text-xs bg-muted p-2 rounded">
                  Example: "Build a workspace document interface like Google Docs"
                </div>
              </div>

              {/* Android Interface */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{
                    background: '#6200EE',
                    borderRadius: '50%',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.14)'
                  }}>
                    <span style={{ color: '#FFFFFF', fontSize: '20px' }}>+</span>
                  </div>
                  <div>
                    <h3 className="font-bold">Android Interface</h3>
                    <p className="text-sm text-muted-foreground">Material for Android</p>
                  </div>
                </div>
                <p className="text-sm">Keywords: android, mobile app, fab, floating action button, app bar</p>
                <div className="text-xs bg-muted p-2 rounded">
                  Example: "Design an Android app interface with FAB"
                </div>
              </div>

              {/* Creative Portfolio */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-lg" style={{
                    background: 'linear-gradient(135deg, #7B68EE 0%, #9B8AFE 100%)',
                    boxShadow: '0 4px 12px rgba(123, 104, 238, 0.2)'
                  }}></div>
                  <div>
                    <h3 className="font-bold">Creative Portfolio</h3>
                    <p className="text-sm text-muted-foreground">Canva creative style</p>
                  </div>
                </div>
                <p className="text-sm">Keywords: creative portfolio, portfolio, showcase, designer portfolio</p>
                <div className="text-xs bg-muted p-2 rounded">
                  Example: "Build a creative portfolio with project gallery"
                </div>
              </div>

              {/* E-commerce */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{
                    background: '#4ECDC4',
                    borderRadius: '50%'
                  }}>
                    <span style={{ fontSize: '20px' }}>🛒</span>
                  </div>
                  <div>
                    <h3 className="font-bold">E-commerce</h3>
                    <p className="text-sm text-muted-foreground">Canva store style</p>
                  </div>
                </div>
                <p className="text-sm">Keywords: ecommerce, shop, store, product showcase, online store</p>
                <div className="text-xs bg-muted p-2 rounded">
                  Example: "Create an e-commerce product showcase page"
                </div>
              </div>

              {/* Landing Page */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-lg" style={{
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
                    boxShadow: '0 4px 12px rgba(255, 107, 107, 0.2)'
                  }}></div>
                  <div>
                    <h3 className="font-bold">Landing Page</h3>
                    <p className="text-sm text-muted-foreground">Canva conversion style</p>
                  </div>
                </div>
                <p className="text-sm">Keywords: landing page, hero section, features grid, cta, marketing page</p>
                <div className="text-xs bg-muted p-2 rounded">
                  Example: "Generate a landing page with hero and features"
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-semibold mb-2">💡 Pro Tip:</p>
            <p className="text-sm text-muted-foreground">
              Just mention any of these keywords in your prompt, and I'll automatically apply the appropriate design pattern with all the right colors, shadows, effects, and layout structures from our Web Design Kit templates!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
