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
import { CanvasQuickStart } from './CanvasQuickStart';
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
      "fixed bottom-0 left-0 right-0 z-50 transition-all duration-300",
      isExpanded ? "h-[500px]" : "h-14",
      className
    )}>
      {/* Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-14 bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-between px-4 cursor-pointer hover:from-purple-700 hover:to-blue-700 transition-all"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-white" />
          <h3 className="text-white font-semibold">AI Code Assistant</h3>
          {!isExpanded && messages.length > 0 && (
            <span className="text-white/70 text-sm">
              ({messages.length} messages)
            </span>
          )}
          {detectedPattern && (
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
              🎨 {detectedPattern.charAt(0).toUpperCase() + detectedPattern.slice(1)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPatternGuide(!showPatternGuide)}
            title="Design Pattern Guide"
            className="text-white hover:bg-white/20"
          >
            🎨
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {isExpanded && (
        <div className="h-[calc(100%-56px)] bg-background border-t flex">
          {/* Quick Start Sidebar (only in code mode) */}
          {mode === 'code' && messages.length === 0 && (
            <div className="w-80 border-r flex-shrink-0">
              <CanvasQuickStart 
                onCodeSelect={(code) => {
                  setCurrentCode(code);
                  setCodeViewerOpen(true);
                }}
              />
            </div>
          )}
          
          {/* Main chat area */}
          <div className="flex-1 flex flex-col min-w-0">
          {/* Mode Selector with Clear Button */}
          <div className="border-b">
            <div className="flex items-center justify-between px-2">
              <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)} className="flex-1">
                <TabsList className="w-full grid grid-cols-3 rounded-none h-12">
                  <TabsTrigger value="code" className="gap-2">
                    <Code2 className="w-4 h-4" />
                    Generate Code
                  </TabsTrigger>
                  <TabsTrigger value="design" className="gap-2">
                    <Palette className="w-4 h-4" />
                    Design Tips
                  </TabsTrigger>
                  <TabsTrigger value="review" className="gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Code Review
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
                  className="ml-2 text-xs"
                >
                  Clear Chat
                </Button>
              )}
            </div>
          </div>

          {/* Quick Prompts */}
          {messages.length === 0 && (
            <div className="p-3 border-b bg-muted/30">
              <p className="text-xs text-muted-foreground mb-2">Quick prompts:</p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts[mode].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(prompt)}
                    className="text-xs px-3 py-1.5 bg-background border rounded-full hover:bg-accent hover:border-primary/50 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground mb-6">
                    {mode === 'code' && 'Ask me to generate any React component or web design'}
                    {mode === 'design' && 'Get expert design recommendations and tips'}
                    {mode === 'review' && 'Submit your code for a thorough review'}
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
                    "flex",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg",
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground p-3'
                        : 'bg-muted overflow-hidden'
                    )}
                  >
                    {/* Show pattern badge for user messages with detected patterns */}
                    {message.role === 'user' && detectDesignPattern(message.content) && (
                      <div className="mb-2 inline-flex items-center gap-1 px-2 py-1 bg-primary-foreground/10 rounded text-xs">
                        🎨 {detectDesignPattern(message.content)?.toUpperCase()} Pattern
                      </div>
                    )}
                    
                    {message.content.includes('```') ? (
                      <div className="space-y-2">
                        {message.content.split('```').map((part, i) => {
                          if (i % 2 === 0) {
                            return part ? (
                              <div key={i} className="px-3 py-2">
                                <p className="whitespace-pre-wrap m-0 text-sm">{part}</p>
                              </div>
                            ) : null;
                          }
                          const lines = part.split('\n');
                          const lang = lines[0].trim();
                          const codeContent = lines.slice(1).join('\n').trim();
                          
                          return (
                            <div key={i} className="relative group border border-border/50 rounded-lg overflow-hidden">
                              <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b border-border/50">
                                <div className="flex items-center gap-2">
                                  <Code className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="text-xs font-medium text-muted-foreground uppercase">{lang || 'code'}</span>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openCodeViewer(codeContent)}
                                    className="h-7 px-2 hover:bg-accent"
                                    title="Open in full editor"
                                  >
                                    <Maximize2 className="w-3.5 h-3.5 mr-1" />
                                    <span className="text-xs">Edit</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(codeContent)}
                                    className="h-7 px-2 hover:bg-accent"
                                    title="Copy code"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                              <div className="max-h-[400px] overflow-auto">
                                <Suspense fallback={
                                  <div className="flex items-center justify-center p-8">
                                    <Loader2 className="w-6 h-6 animate-spin" />
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
                      <div className="px-3 py-2">
                        <p className="whitespace-pre-wrap m-0 text-sm">{message.content}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  // Only prevent default for Enter without Shift
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                  // Allow all other keys including Backspace, Delete, etc.
                }}
                placeholder={
                  mode === 'code' 
                    ? "Describe the component you want to create..."
                    : mode === 'design'
                    ? "Describe what you want to improve..."
                    : "Paste your code for review..."
                }
                disabled={isLoading}
                className="min-h-[60px] max-h-[120px] resize-none"
                autoFocus={false}
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="h-[60px] w-[60px] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Powered by Lovable AI • Press Enter to send, Shift+Enter for new line
            </p>
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
