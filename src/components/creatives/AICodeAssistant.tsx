import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CodeViewer } from './CodeViewer';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, Loader2, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AICodeAssistantProps {
  className?: string;
  onCodeGenerated?: (code: string) => void;
  onSwitchToCanvasView?: () => void;
}

export const AICodeAssistant: React.FC<AICodeAssistantProps> = ({ 
  className, 
  onCodeGenerated, 
  onSwitchToCanvasView 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [codeViewerOpen, setCodeViewerOpen] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

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
            messages: [...messages, userMessage].map(m => ({ 
              role: m.role, 
              content: m.content 
            })),
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
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let assistantContent = '';
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
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                assistantContent += content;

                if (onCodeGenerated) {
                  const codeMatch = assistantContent.match(/```(?:html|jsx|tsx|javascript|css)?\n([\s\S]*?)```/);
                  if (codeMatch && codeMatch[1]) {
                    onCodeGenerated(codeMatch[1].trim());
                  }
                }

                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];

                  if (lastMessage?.role === 'assistant') {
                    newMessages[newMessages.length - 1] = {
                      role: 'assistant',
                      content: assistantContent,
                    };
                  } else {
                    newMessages.push({
                      role: 'assistant',
                      content: assistantContent,
                    });
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error streaming AI response:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate response. Please try again.',
        variant: 'destructive',
      });
      setMessages(prev => prev.filter(m => m.role !== 'assistant' || m.content));
    } finally {
      setIsLoading(false);
    }
  };

  const extractCode = (content: string): string | null => {
    const codeMatch = content.match(/```(?:html|jsx|tsx|javascript|css)?\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1].trim() : null;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Code copied to clipboard' });
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  return (
    <>
      <div className={cn("flex flex-col h-full bg-background border-l", className)}>
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">AI Code Assistant</h2>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium mb-2">AI Code Assistant</h3>
                <p className="text-sm">Ask me to generate HTML, CSS, or JavaScript code</p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 rounded-lg",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground ml-12"
                    : "bg-muted mr-12"
                )}
              >
                <div className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </div>

                {message.role === 'assistant' && extractCode(message.content) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const code = extractCode(message.content);
                        if (code) {
                          setCurrentCode(code);
                          setCodeViewerOpen(true);
                        }
                      }}
                    >
                      <Code className="w-3 h-3 mr-1" />
                      View Code
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const code = extractCode(message.content);
                        if (code) copyToClipboard(code);
                      }}
                    >
                      Copy
                    </Button>
                    {onSwitchToCanvasView && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const code = extractCode(message.content);
                          if (code && onCodeGenerated) {
                            onCodeGenerated(code);
                            onSwitchToCanvasView();
                          }
                        }}
                      >
                        Open in Canvas
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="p-4 rounded-lg bg-muted mr-12">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-card">
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
              placeholder="Ask me to generate code..."
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-[60px] w-[60px] shrink-0"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {codeViewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="relative w-[90vw] h-[85vh] bg-background rounded-lg shadow-lg border">
            <CodeViewer
              code={currentCode}
              onMigrateToCanvas={(code) => {
                if (onCodeGenerated) {
                  onCodeGenerated(code);
                }
                if (onSwitchToCanvasView) {
                  onSwitchToCanvasView();
                }
                setCodeViewerOpen(false);
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setCodeViewerOpen(false)}
            >
              ×
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
