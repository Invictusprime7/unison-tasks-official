import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  X, Send, Sparkles, Loader2, Hammer, Code, Palette, Wand2, 
  FileCode, Zap, Rocket, Briefcase, Calendar, Layout, Copy, Check
} from 'lucide-react';
import { Canvas as FabricCanvas } from 'fabric';
import { useAIWebBuilder } from '@/hooks/useAIWebBuilder';
import { toast } from 'sonner';
import type { AILayoutPlan } from '@/types/aiWebBuilder';
import { sanitizeHTMLClasses } from '@/utils/classSanitizer';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  layoutPlan?: AILayoutPlan;
  code?: {
    html: string;
    css: string;
    javascript: string;
  };
  type?: 'portfolio' | 'restaurant' | 'saas' | 'ecommerce' | 'agency' | 'booking' | 'creative' | 'code' | 'general';
  timestamp: number;
}

interface CodeResponse {
  html: string;
  css: string;
  javascript: string;
  explanation: string;
  features: string[];
}

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  fabricCanvas: FabricCanvas | null;
  onLayoutGenerated?: (layout: AILayoutPlan) => void;
  onCodeGenerated?: (code: string, type: 'html' | 'css' | 'javascript') => void;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ 
  isOpen, 
  onClose, 
  fabricCanvas, 
  onLayoutGenerated,
  onCodeGenerated 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 **Welcome to Elite AI Designer!**\n\nI specialize in creating stunning, modern web experiences. What would you like to build today?',
      type: 'general',
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { loading, generateWebsite, generateCode: generateCodeOnly } = useAIWebBuilder({
    onLayoutGenerated: (layout) => {
      if (onLayoutGenerated) {
        onLayoutGenerated(layout);
      }
    },
    onCodeGenerated: (code) => {
      // Code is already handled in message state
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const detectMessageType = (prompt: string): Message['type'] => {
    const lowerPrompt = prompt.toLowerCase();
    
    if (/\b(portfolio|resume|cv|showcase)\b/i.test(lowerPrompt)) return 'portfolio';
    if (/\b(restaurant|food|dining|menu)\b/i.test(lowerPrompt)) return 'restaurant';
    if (/\b(saas|software|platform|app)\b/i.test(lowerPrompt)) return 'saas';
    if (/\b(ecommerce|shop|store|product)\b/i.test(lowerPrompt)) return 'ecommerce';
    if (/\b(agency|consulting|services)\b/i.test(lowerPrompt)) return 'agency';
    return 'general';
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      type: detectMessageType(input),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const messageType = detectMessageType(input);
      const result = await generateWebsite(input);

      if (result) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: `Generated ${messageType} website with ${result.layoutPlan.sections.length} sections`,
          type: messageType,
          layoutPlan: result.layoutPlan,
          code: result.code,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Auto-apply layout to canvas if callback provided
        if (onLayoutGenerated) {
          onLayoutGenerated(result.layoutPlan);
        }
      }
    } catch (error) {
      console.error('Generation error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Failed to generate website. Please try again.',
        type: 'general',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleCopyCode = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(type);
    toast.success(`${type.toUpperCase()} copied!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApplyCode = (code: string, type: 'html' | 'css' | 'javascript') => {
    if (onCodeGenerated) {
      onCodeGenerated(code, type);
      toast.success(`${type.toUpperCase()} applied!`);
    }
  };

  const quickPrompts = [
    { icon: Briefcase, text: 'Portfolio website', type: 'portfolio' as const },
    { icon: Calendar, text: 'Booking platform', type: 'booking' as const },
    { icon: Rocket, text: 'Creative landing page', type: 'creative' as const },
    { icon: Layout, text: 'Modern dashboard', type: 'creative' as const },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-full md:w-[450px] bg-white opacity-100 shadow-2xl z-50 flex flex-col border-l">
      {/* Header */}
      <div className="relative overflow-hidden z-30">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="relative p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Elite AI Designer</h2>
              <p className="text-xs text-white/80">Powered by advanced AI</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="p-4 border-b bg-gradient-to-br from-gray-50 to-purple-50 relative z-20">
        <p className="text-xs font-semibold text-gray-700 mb-3">✨ Quick Start</p>
        <div className="grid grid-cols-2 gap-2">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => setInput(`Create a ${prompt.text}`)}
              className="flex items-center gap-2 p-2.5 bg-white border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all group text-left"
            >
              <prompt.icon className="w-4 h-4 text-gray-600 group-hover:text-purple-600" />
              <span className="text-xs font-medium text-gray-700 group-hover:text-purple-700">
                {prompt.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 relative z-10 bg-white overflow-hidden">
        <ScrollArea className="h-full w-full p-4" ref={scrollRef}>
          <div className="space-y-4 relative z-10">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Message bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gradient-to-br from-gray-100 to-gray-50 text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                
                {message.type && message.type !== 'general' && message.role === 'assistant' && (
                  <Badge 
                    className="mt-2" 
                    variant="secondary"
                  >
                    {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
                  </Badge>
                )}
              </div>

              {/* Code display and apply buttons for code messages */}
              {message.role === 'assistant' && message.code && (
                <div className="mt-3 w-full space-y-3">
                  {['html', 'css', 'javascript'].map((codeType) => {
                    const code = message.code![codeType as keyof typeof message.code];
                    if (!code) return null;

                    return (
                      <div key={codeType} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-xl">
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                          <div className="flex items-center gap-2">
                            <FileCode className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-semibold text-gray-300 uppercase">
                              {codeType}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopyCode(code, codeType)}
                              className="h-7 px-2 text-xs text-gray-300 hover:text-white hover:bg-gray-700"
                            >
                              {copiedCode === codeType ? (
                                <><Check className="w-3 h-3 mr-1" /> Copied</>
                              ) : (
                                <><Copy className="w-3 h-3 mr-1" /> Copy</>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleApplyCode(code, codeType as 'html' | 'css' | 'javascript')}
                              className="h-7 px-2 text-xs bg-purple-600 text-white hover:bg-purple-700"
                            >
                              <Zap className="w-3 h-3 mr-1" />
                              Apply
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 overflow-x-auto">
                          <pre className="text-xs leading-relaxed">
                            <code className={`
                              ${codeType === 'html' ? 'text-green-400' : ''}
                              ${codeType === 'css' ? 'text-blue-400' : ''}
                              ${codeType === 'javascript' ? 'text-yellow-400' : ''}
                            `}>
                              {code.length > 500 ? `${code.substring(0, 500)}...` : code}
                            </code>
                          </pre>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          {/* Loading State */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                <div>
                  <p className="text-sm font-semibold text-purple-700">Creating magic...</p>
                  <p className="text-xs text-purple-600">This may take a moment</p>
                </div>
              </div>
            </div>
          )}
        </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white relative z-20">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Describe your vision..."
            disabled={loading}
            className="flex-1 border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-xl"
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            size="icon"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl shadow-lg"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Press Enter to send
          </p>
          <p className="text-xs text-gray-400">
            Powered by AI
          </p>
        </div>
      </div>
    </div>
  );
};