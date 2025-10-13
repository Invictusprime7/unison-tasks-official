import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, Sparkles, Loader2, Hammer } from 'lucide-react';
import { Canvas as FabricCanvas } from 'fabric';
import { useWebBuilderAI } from '@/hooks/useWebBuilderAI';
import type { AIGeneratedTemplate } from '@/types/template';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  template?: AIGeneratedTemplate; // Attach template to AI responses
}

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  fabricCanvas: FabricCanvas | null;
  onTemplateGenerated?: (template: any) => void;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ isOpen, onClose, fabricCanvas, onTemplateGenerated }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I can help you create web designs. Try saying:\n\n• "Create a landing page for a SaaS product"\n• "Generate a portfolio website"\n• "Design a hero section"\n• "Create a pricing section"\n\nClick "Build to Canvas" to make any template editable!'
    }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pendingTemplates, setPendingTemplates] = useState<Map<number, AIGeneratedTemplate>>(new Map());
  const { loading, generateDesign, generateTemplate } = useWebBuilderAI(
    fabricCanvas
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');

    // Detect if user wants a full template or individual elements
    const isTemplateRequest = /\b(template|page|website|landing page|full design|complete design|entire page)\b/i.test(userInput);

    let response;
    if (isTemplateRequest) {
      response = await generateTemplate(userInput);
      
      if (response && response.template) {
        const messageIndex = messages.length + 1; // +1 for user message
        const assistantMessage: Message = {
          role: 'assistant',
          content: `✨ **Template Generated!**\n\n${response.explanation || 'Your template is ready'}\n\n📋 **Template Details:**\n• ${response.template.sections.length} sections\n• ${response.template.name}\n\nClick "Build to Canvas" below to add it as fully editable components!`,
          template: response.template
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Store template with message index for later building
        setPendingTemplates(prev => new Map(prev).set(messageIndex, response.template));
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: 'Sorry, I encountered an error creating that template. Please try again with a different prompt.'
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } else {
      response = await generateDesign(userInput);
      
      if (response) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.explanation || 'Design elements added to canvas!'
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: 'Sorry, I encountered an error creating that design. Please try again with a different prompt.'
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  const handleBuildToCanvas = async (messageIndex: number) => {
    const template = pendingTemplates.get(messageIndex);
    if (!template) {
      console.error('Template not found for message index:', messageIndex);
      return;
    }

    console.log('[AIAssistantPanel] Building template to canvas:', template);
    
    if (onTemplateGenerated) {
      await onTemplateGenerated(template);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    'Create a landing page for a SaaS product',
    'Generate a portfolio website template',
    'Add a hero section',
    'Design a pricing card',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 flex flex-col border-l">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-white" />
          <h2 className="font-semibold text-white">AI Design Assistant</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick Prompts */}
      <div className="p-3 border-b bg-gray-50">
        <p className="text-xs text-gray-600 mb-2">Quick actions:</p>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="text-xs px-2 py-1 bg-white border rounded-full hover:bg-purple-50 hover:border-purple-300 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              
              {/* Build to Canvas button for template messages */}
              {message.role === 'assistant' && message.template && (
                <Button
                  onClick={() => handleBuildToCanvas(index)}
                  className="mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  size="sm"
                >
                  <Hammer className="w-4 h-4 mr-2" />
                  Build to Canvas
                </Button>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p className="text-sm text-gray-600">Creating your design...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe what you want to create..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            size="icon"
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Powered by Lovable AI • Press Enter to send
        </p>
      </div>
    </div>
  );
};