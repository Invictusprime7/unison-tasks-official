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
import { useWebBuilderAI } from '@/hooks/useWebBuilderAI';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AIGeneratedTemplate } from '@/types/template';
import { sanitizeHTMLClasses } from '@/utils/classSanitizer';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  template?: AIGeneratedTemplate;
  code?: {
    html: string;
    css: string;
    javascript: string;
  };
  type?: 'portfolio' | 'booking' | 'creative' | 'code' | 'general';
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
  onTemplateGenerated?: (template: AIGeneratedTemplate) => void;
  onCodeGenerated?: (code: string, type: 'html' | 'css' | 'javascript') => void;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ 
  isOpen, 
  onClose, 
  fabricCanvas, 
  onTemplateGenerated,
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
  const { loading, generateTemplate } = useWebBuilderAI(fabricCanvas);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const detectMessageType = (prompt: string): Message['type'] => {
    const lowerPrompt = prompt.toLowerCase();
    
    const portfolioKeywords = ['portfolio', 'resume', 'cv', 'personal site', 'showcase', 'professional'];
    const bookingKeywords = ['booking', 'calendar', 'appointment', 'reservation', 'schedule'];
    const creativeKeywords = ['immersive', 'creative', 'stunning', 'modern', 'glass', 'animation'];
    
    if (portfolioKeywords.some(k => lowerPrompt.includes(k))) return 'portfolio';
    if (bookingKeywords.some(k => lowerPrompt.includes(k))) return 'booking';
    if (creativeKeywords.some(k => lowerPrompt.includes(k))) return 'creative';
    if (/\b(code|typescript|javascript|html|css|convert)\b/i.test(prompt)) return 'code';
    return 'general';
  };

  const generateCode = async (prompt: string, type: Message['type']): Promise<CodeResponse | null> => {
    try {
      const { data, error} = await supabase.functions.invoke('ai-web-assistant', {
        body: { 
          prompt,
          codeType: type === 'portfolio' ? 'elite-portfolio' : 
                    type === 'booking' ? 'elite-booking-platform' : 
                    'immersive-web-experience',
          style: type === 'portfolio' ? 'professional-portfolio' : 
                 type === 'booking' ? 'booking-platform' : 
                 'creative-glass-morphism',
          features: type === 'portfolio' 
            ? ['portfolio', 'professional', 'responsive', 'showcase']
            : type === 'booking'
            ? ['booking', 'calendar', 'forms', 'interactive']
            : ['creative', 'animations', 'glass-morphism', 'premium']
        }
      });

      if (error) throw error;
      return data as CodeResponse;
    } catch (error) {
      console.error('Code generation error:', error);
      toast.error('Failed to generate code');
      return null;
    }
  };

  // Advanced code generation with TypeScript to JavaScript conversion
  const generateAdvancedCode = async (prompt: string): Promise<CodeResponse | null> => {
    try {
      // Detect request types
      const isPortfolioPrompt = /\b(portfolio|resume|cv|personal site|personal website|showcase|profile|about me|my work|developer portfolio|designer portfolio|professional|career|experience|skills|projects|work samples)\b/i.test(prompt);
      const isBookingPrompt = /\b(booking|book|appointment|calendar|schedule|reservation|platform|travel|hotel|flight|event|tickets|availability|reserve|date picker|booking system)\b/i.test(prompt);
      
      let enhancedPrompt;
      let requestType;
      
      if (isPortfolioPrompt) {
        enhancedPrompt = `💼 **ELITE PORTFOLIO DESIGN REQUEST** 💼
        
        Create a sleek, professional, and uniquely adaptive portfolio website: ${prompt}
        
        🎨 **PORTFOLIO DESIGN INSPIRATION** (Based on high-end professional portfolios):
        - Deep teal/dark professional background with excellent contrast (#1e3a3a or similar)
        - Clean asymmetrical layout with focus areas and strategic white space
        - Professional typography hierarchy with modern sans-serif fonts
        - Subtle glass morphism effects on featured sections and cards
        - High-quality project showcase with clean card-based presentations
        - Clear contact integration with professional call-to-action buttons
        - Skills/focus areas displayed in organized, visually appealing panels
        
        🚀 **PORTFOLIO-SPECIFIC REQUIREMENTS:**
        - Professional hero section with name, title, and compelling description
        - Skills/expertise showcase with modern visual representation
        - Project portfolio grid with hover effects and detailed descriptions
        - About section with professional narrative and personality
        - Contact section with multiple connection methods
        - Responsive design optimized for recruiters and clients
        - Fast loading with optimized images and smooth scrolling
        - Professional color palette that conveys expertise and trust
        - Strategic use of negative space for clean, uncluttered feel
        - Accessibility-first design for professional environments
        
        🎯 **PORTFOLIO ADAPTATION INTELLIGENCE:**
        - Automatically adapt layout based on profession (developer, designer, etc.)
        - Smart content suggestions based on industry standards
        - Flexible sections that can showcase different types of work
        - Professional tone while maintaining personality and uniqueness
        - Modern design trends without sacrificing professionalism
        - Mobile-first responsive design for all viewing scenarios`;
        
        requestType = 'elite-portfolio';
      } else if (isBookingPrompt) {
        enhancedPrompt = `📅 **ELITE BOOKING PLATFORM DESIGN REQUEST** 📅
        
        Create a professional, intuitive, and user-friendly booking platform: ${prompt}
        
        🎯 **BOOKING PLATFORM INSPIRATION** (Based on BookEase excellence):
        - Seamless booking experiences that reduce friction and increase conversions
        - Dynamic calendar interfaces with intuitive date selection
        - Professional indigo/blue color schemes (#4f46e5) for trust and reliability
        - Hero sections with compelling imagery and clear call-to-action buttons
        - Interactive maps with location markers and booking integration
        - Animated background elements (floating bubbles, particles) for engagement
        
        🚀 **BOOKING-SPECIFIC REQUIREMENTS:**
        - Interactive calendar component with hover states and selection feedback
        - Form validation with real-time feedback and error handling
        - Step-by-step booking flows with progress indicators
        - Service selection with descriptions and pricing display
        - Contact information collection with proper validation
        - Modal systems for sign-up, login, and booking confirmation
        - Mobile-responsive navigation with hamburger menus
        
        📋 **FUNCTIONAL EXCELLENCE:**
        - Calendar date selection with disabled past dates and availability indicators
        - Smooth scrolling and section navigation between booking steps
        - Map integration using Leaflet.js for location-based services
        - Tailwind CSS framework for rapid, consistent styling
        - Card-based layouts for services, testimonials, and features
        - Professional typography with clear hierarchy and accessibility
        - Performance optimization with lazy loading and efficient code
        
        🎨 **BOOKING FLOW DESIGN:**
        - Trust-building elements: testimonials, security badges, clear policies
        - Visual feedback for all user interactions and form submissions
        - Loading states and confirmation messages for booking completion
        - Integration points for payment processing and email confirmations
        - Responsive design optimized for mobile booking scenarios
        - Error handling with helpful messages and recovery suggestions`;
        
        requestType = 'elite-booking-platform';
      } else {
        enhancedPrompt = `🎨 **ELITE CREATIVE DESIGN REQUEST** 🎨
        
        Create an immersive, visually stunning, and highly creative web experience: ${prompt}
        
        🚀 **IMMERSIVE REQUIREMENTS:**
        - Stunning glass morphism effects with deep blur and transparency layers
        - Dynamic gradient backgrounds with animated color shifts
        - Advanced GSAP animations with timeline sequences and parallax effects
        - Interactive particle systems and micro-interactions
        - Cinematic transitions and scroll-triggered animations
        - Premium typography with custom font stacks and dynamic sizing
        - Creative layouts with asymmetric grids and floating elements
        - Immersive hover effects with 3D transforms and shadow play
        - Advanced CSS techniques: masks, filters, backdrop-blur, mix-blend-mode
        - Responsive design with fluid typography and adaptive layouts
        - Creative use of CSS custom properties for theming and animation
        - Modern JavaScript with intersection observers and performance optimization
        - Accessibility features integrated seamlessly
        - Mobile-first approach with touch-friendly interactions
        
        🎯 **CREATIVE GOALS:**
        - Push the boundaries of modern web design
        - Create memorable, engaging user experiences
        - Use cutting-edge CSS and JavaScript techniques
        - Implement smooth, buttery animations at 60fps
        - Design for emotional impact and user delight
        - Incorporate storytelling through visual design`;
        
        requestType = 'immersive-web-experience';
      }

      const { data, error } = await supabase.functions.invoke('ai-web-assistant', {
        body: { 
          prompt: enhancedPrompt,
          codeType: requestType,
          style: isPortfolioPrompt ? 'professional-portfolio' : 
                 isBookingPrompt ? 'booking-platform' : 'creative-glass-morphism',
          features: isPortfolioPrompt 
            ? ['portfolio', 'professional', 'adaptive', 'showcase', 'contact', 'responsive']
            : isBookingPrompt
            ? ['booking', 'calendar', 'forms', 'maps', 'responsive', 'interactive', 'validation']
            : ['immersive', 'creative', 'advanced-animations', 'interactive', 'cinematic', 'premium-effects']
        }
      });

      if (error) {
        console.error('Code generation error:', error);
        toast.error('Failed to generate code: ' + error.message);
        return null;
      }

      return data as CodeResponse;
    } catch (error) {
      console.error('Error in code generation:', error);
      toast.error('An unexpected error occurred during code generation');
      return null;
    }
  };

  // TypeScript to JavaScript conversion utility
  const convertTypeScriptToJavaScript = (tsCode: string): string => {
    // Basic TypeScript to JavaScript conversion
    return tsCode
      // Remove type annotations
      .replace(/:\s*\w+(\[\])?(\s*\||\s*&|\s*=|\s*,|\s*\)|\s*;|\s*{)/g, '$1')
      // Remove interface/type definitions
      .replace(/interface\s+\w+\s*{[^}]*}/g, '')
      .replace(/type\s+\w+\s*=\s*[^;]+;/g, '')
      // Remove generic type parameters
      .replace(/<[^>]*>/g, '')
      // Remove as assertions
      .replace(/\s+as\s+\w+/g, '')
      // Convert arrow functions with types
      .replace(/\(\s*(\w+):\s*\w+\s*\)/g, '($1)')
      // Remove explicit return types
      .replace(/\):\s*\w+\s*=>/g, ') =>')
      // Clean up extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');

    const messageType = detectMessageType(userInput);
    const isTemplateRequest = /\b(template|page|website|landing|design|create|build)\b/i.test(userInput);

    if (isTemplateRequest && messageType !== 'code') {
      // Generate template
      const response = await generateTemplate(userInput);
      
      if (response?.template) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: `✨ **${messageType.charAt(0).toUpperCase() + messageType.slice(1)} Template Ready!**\n\n${response.explanation || 'Your template has been generated'}\n\n� **Features:**\n• ${response.template.sections.length} sections\n• Responsive design\n• Modern styling\n• Interactive elements`,
          template: response.template,
          type: messageType,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '❌ Sorry, I couldn\'t generate that template. Please try again with more details.',
          type: 'general',
          timestamp: Date.now(),
        }]);
      }
    } else {
      // Generate code
      const response = await generateCode(userInput, messageType);
      
      if (response) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: `💎 **Code Generated Successfully!**\n\n${response.explanation}\n\n🔥 **Features:**\n${response.features.map(f => `• ${f}`).join('\n')}`,
          code: {
            html: sanitizeHTMLClasses(response.html),
            css: response.css,
            javascript: response.javascript
          },
          type: messageType,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '❌ Sorry, I couldn\'t generate that code. Please try again.',
          type: 'general',
          timestamp: Date.now(),
        }]);
      }
    }
  };

  const handleBuildTemplate = (template: AIGeneratedTemplate) => {
    if (onTemplateGenerated) {
      onTemplateGenerated(template);
      toast.success('✨ Template built to canvas!');
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
    <div className="fixed right-0 top-0 bottom-0 w-full md:w-[450px] bg-white shadow-2xl z-50 flex flex-col border-l">
      {/* Header */}
      <div className="relative overflow-hidden">
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
      <div className="p-4 border-b bg-gradient-to-br from-gray-50 to-purple-50">
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
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
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
              
              {/* Build to Canvas button for template messages */}
              {message.role === 'assistant' && message.template && (
                <Button
                  onClick={() => handleBuildTemplate(message.template!)}
                  className="mt-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                  size="sm"
                >
                  <Hammer className="w-4 h-4 mr-2" />
                  Build to Canvas
                </Button>
              )}

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

      {/* Input */}
      <div className="p-4 border-t bg-white">
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