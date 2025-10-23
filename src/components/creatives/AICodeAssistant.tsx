import React, { useState, useRef, useEffect } from 'react';
import { Canvas as FabricCanvas, Rect, Textbox } from 'fabric';
import { supabase } from "@/integrations/supabase/client";
import MonacoEditor from './MonacoEditor';
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
  const [learningEnabled, setLearningEnabled] = useState(true);
  const [codeViewerOpen, setCodeViewerOpen] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load or create conversation on mount (only if authenticated)
  useEffect(() => {
    loadOrCreateConversation();
  }, []);

  const loadOrCreateConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Not authenticated - use in-memory only mode
        console.log('[AICodeAssistant] Not authenticated - using in-memory chat');
        return;
      }

      // Try to get the most recent conversation for this mode
      const { data: existingConversations } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('mode', mode)
        .order('updated_at', { ascending: false })
        .limit(1);

      let convId: string;

      if (existingConversations && existingConversations.length > 0) {
        // Use existing conversation
        convId = existingConversations[0].id;
        await loadMessages(convId);
      } else {
        // Create new conversation
        const { data: newConv, error } = await supabase
          .from('chat_conversations')
          .insert({
            user_id: user.id,
            mode,
            title: `${mode.charAt(0).toUpperCase() + mode.slice(1)} Chat`,
          })
          .select()
          .single();

        if (error) throw error;
        convId = newConv.id;
      }

      setConversationId(convId);
      console.log('[AICodeAssistant] Conversation loaded:', convId);
    } catch (error) {
      console.error('Error loading conversation:', error);
      // Continue without persistence
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const { data: chatMessages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (chatMessages) {
        const loadedMessages: Message[] = chatMessages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.created_at),
          hasCode: msg.has_code || false,
          componentData: msg.component_data,
        }));
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const saveMessage = async (message: Message) => {
    if (!conversationId) {
      console.log('[AICodeAssistant] No conversation ID - skipping message save');
      return;
    }

    try {
      await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
        has_code: message.hasCode || false,
        component_data: message.componentData || null,
      });
      console.log('[AICodeAssistant] Message saved to database');
    } catch (error) {
      console.error('Error saving message:', error);
      // Continue without persistence
    }
  };

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

      // Save successful pattern to learning database
      if (learningEnabled) {
        saveCodePattern(
          JSON.stringify(componentData),
          'component',
          'Successfully rendered component from AI generation'
        );
      }
    } catch (error) {
      console.error('[AICodeAssistant] Render error:', error);
      toast({
        title: 'Render failed',
        description: 'Could not render component to canvas.',
        variant: 'destructive',
      });
    }
  };

  const saveCodePattern = async (code: string, patternType: string, description: string) => {
    try {
      const codeSnippet = code.substring(0, 5000); // Limit size
      await supabase.from('ai_code_patterns').insert({
        pattern_type: patternType,
        code_snippet: codeSnippet,
        description,
        tags: [mode, patternType],
        success_rate: 100,
        usage_count: 1
      });
      console.log('✅ Code pattern saved to learning database');
    } catch (error) {
      console.error('Failed to save pattern:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Save user message to database (if authenticated)
    await saveMessage(userMessage);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-code-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: messages.map(m => ({ role: m.role, content: m.content })).concat([
              { role: userMessage.role, content: userMessage.content }
            ]),
            mode,
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
                console.log('[AICodeAssistant] Parsed delta:', parsed);
                
                // Handle tool calls - accumulate arguments
                if (parsed.choices?.[0]?.delta?.tool_calls) {
                  const toolCalls = parsed.choices[0].delta.tool_calls;
                  for (const toolCall of toolCalls) {
                    if (toolCall.function?.name === 'render_component') {
                      console.log('[AICodeAssistant] Found render_component tool call');
                      if (toolCall.function.arguments) {
                        toolCallArgs += toolCall.function.arguments;
                        console.log('[AICodeAssistant] Accumulated args:', toolCallArgs);
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
                    console.error('[AICodeAssistant] Failed to parse complete tool call:', e, toolCallArgs);
                  }
                }
                
                // Handle regular content
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  assistantContent += content;
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
              } catch (e) {
                console.error('[AICodeAssistant] Parse error:', e);
              }
            }
          }
        }

        // Save the complete assistant message to database
        if (assistantContent) {
          const assistantMessage: Message = {
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date(),
            hasCode: assistantContent.includes('```'),
            componentData: toolCallData,
          };
          await saveMessage(assistantMessage);
        }

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
      'Create a modern hero section with gradient background',
      'Build a pricing card with three tiers',
      'Generate a contact form with validation',
    ],
    design: [
      'Review my color scheme',
      'Suggest improvements for this layout',
      'Make this design more modern',
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
          {learningEnabled && (
            <span className="text-xs bg-white/10 text-white px-2 py-1 rounded-full flex items-center gap-1">
              🧠 Learning
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLearningEnabled(!learningEnabled)}
            title={learningEnabled ? "Disable learning" : "Enable learning"}
            className="text-white hover:bg-white/20"
          >
            {learningEnabled ? "🧠" : "💤"}
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
          {/* Mode Selector */}
          <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)} className="border-b">
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
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    {mode === 'code' && 'Ask me to generate any React component or web design'}
                    {mode === 'design' && 'Get expert design recommendations and tips'}
                    {mode === 'review' && 'Submit your code for a thorough review'}
                  </p>
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
    </div>
  );
};
