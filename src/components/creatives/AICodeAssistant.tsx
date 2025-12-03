import React, { useState, useRef, useEffect, useCallback } from "react";
import { Canvas as FabricCanvas } from "fabric";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import CodeMirrorEditor from "./CodeMirrorEditor";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Send,
  Code2,
  Palette,
  CheckCircle2,
  Copy,
  Loader2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Code,
  Trash2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  hasCode?: boolean;
  componentData?: Json;
}

interface AICodeAssistantProps {
  className?: string;
  fabricCanvas?: FabricCanvas | null;
  onCodeGenerated?: (code: string) => void;
  onSwitchToCanvasView?: () => void;
  currentCode?: string; // Current template code for editing existing templates
}

export const AICodeAssistant: React.FC<AICodeAssistantProps> = ({
  className,
  fabricCanvas,
  onCodeGenerated,
  onSwitchToCanvasView,
  currentCode,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"code" | "design" | "review">("code");
  const [isExpanded, setIsExpanded] = useState(false);
  const [learningEnabled, setLearningEnabled] = useState(true);
  const [codeViewerOpen, setCodeViewerOpen] = useState(false);
  const [viewerCode, setViewerCode] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const loadOrCreateConversation = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("[AICodeAssistant] Not authenticated - using in-memory chat");
        return;
      }

      const { data: existingConversations } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("mode", mode)
        .order("updated_at", { ascending: false })
        .limit(1);

      let convId: string;

      if (existingConversations && existingConversations.length > 0) {
        convId = existingConversations[0].id;
        await loadMessages(convId);
      } else {
        const { data: newConv, error } = await supabase
          .from("chat_conversations")
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
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  }, [mode]);

  useEffect(() => {
    loadOrCreateConversation();
  }, [loadOrCreateConversation]);

  const loadMessages = async (convId: string) => {
    try {
      const { data: chatMessages, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (chatMessages) {
        const loadedMessages: Message[] = chatMessages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
          timestamp: new Date(msg.created_at),
          hasCode: msg.has_code || false,
          componentData: msg.component_data,
        }));
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const saveMessage = async (message: Message) => {
    if (!conversationId) return;

    try {
      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
        has_code: message.hasCode || false,
        component_data: message.componentData as Json || null,
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const clearConversationHistory = async () => {
    try {
      if (conversationId) {
        // Delete all messages for this conversation
        const { error } = await supabase
          .from("chat_messages")
          .delete()
          .eq("conversation_id", conversationId);

        if (error) throw error;
      }

      // Clear local state
      setMessages([]);
      
      toast({
        title: "Conversation cleared",
        description: "Chat history has been deleted",
      });
    } catch (error) {
      console.error("Error clearing conversation:", error);
      toast({
        title: "Error",
        description: "Failed to clear conversation history",
        variant: "destructive",
      });
    }
  };

  const openCodeViewer = (code: string) => {
    setViewerCode(code);
    setCodeViewerOpen(true);
    toast({
      title: "Code editor opened",
      description: "Edit and render your code on the canvas",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Code copied successfully",
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    await saveMessage(userMessage);

    try {
      // Check if we have current code and should be in edit mode
      const hasExistingTemplate = currentCode && 
        !currentCode.includes('AI-generated code will appear here') && 
        currentCode.trim().length > 100;
      
      const { data, error } = await supabase.functions.invoke('ai-code-assistant', {
        body: {
          messages: messages
            .map((m) => ({ role: m.role, content: m.content }))
            .concat([{ role: userMessage.role, content: userMessage.content }]),
          mode,
          currentCode: hasExistingTemplate ? currentCode : undefined,
          editMode: hasExistingTemplate,
        }
      });

      if (error) {
        if (error.message.includes('429')) {
          toast({
            title: "Rate limit exceeded",
            description: "Please wait a moment before trying again.",
            variant: "destructive",
          });
          return;
        }
        if (error.message.includes('402')) {
          toast({
            title: "Credits required",
            description: "Please add credits to continue using AI features.",
            variant: "destructive",
          });
          return;
        }
        throw new Error("Failed to get AI response: " + error.message);
      }

      const assistantContent = data?.content || "";
      const hasCode = assistantContent.includes("```");

      if (hasCode && onCodeGenerated) {
        // Try to match code blocks with language specifiers
        let codeMatch = assistantContent.match(/```(?:html|jsx|tsx|javascript|js|typescript|ts)\n([\s\S]*?)```/);
        
        // If no match, try without language specifier
        if (!codeMatch) {
          codeMatch = assistantContent.match(/```\n([\s\S]*?)```/);
        }
        
        if (codeMatch && codeMatch[1]) {
          let extractedCode = codeMatch[1].trim();
          
          // ALLOW vanilla JavaScript in DOMContentLoaded wrapper
          // Only remove inline event handlers for security
          extractedCode = extractedCode.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
          
          // Remove markdown syntax that sometimes slips through
          extractedCode = extractedCode
            // Remove markdown headers (###, ##, #)
            .replace(/^#{1,6}\s+.*$/gm, '')
            // Remove markdown code fences that appear in content
            .replace(/```[\w]*\n?/g, '')
            // Remove markdown arrows/symbols (<<<, >>>, ---)
            .replace(/^[<>-]{3,}.*$/gm, '')
            // Remove standalone markdown symbols
            .replace(/<<<|>>>|---/g, '')
            // Clean up any resulting empty lines (more than 2 consecutive)
            .replace(/\n{3,}/g, '\n\n');
                      
          console.log('[AICodeAssistant] Extracted HTML/CSS code with vanilla JavaScript allowed');
          console.log('[AICodeAssistant] Code length:', extractedCode.length, 'characters');
          onCodeGenerated(extractedCode);
        }
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
        hasCode,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      await saveMessage(assistantMessage);

    } catch (error) {
      console.error("Error getting AI response:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = {
    code: [
      "Create a modern hero section",
      "Build a pricing section with 3 tiers",
      "Generate a features showcase",
      "Create a contact form section",
      "Build a testimonials grid",
      "Design a services section",
    ],
    design: [
      "Review my layout hierarchy",
      "Suggest spacing improvements",
      "Improve visual flow",
      "Enhance color consistency",
    ],
    review: [
      "Check responsive design",
      "Review accessibility",
      "Suggest performance improvements",
    ],
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 transition-all duration-300",
        isExpanded ? "h-[500px]" : "h-14",
        className,
      )}
    >
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-14 bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-between px-4 cursor-pointer hover:from-purple-700 hover:to-blue-700 transition-all"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-white" />
          <h3 className="text-white font-semibold">AI Code Assistant</h3>
          {!isExpanded && messages.length > 0 && (
            <span className="text-white/70 text-sm">({messages.length} messages)</span>
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
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              clearConversationHistory();
            }}
            title="Clear conversation history"
            className="text-white hover:bg-white/20"
            disabled={messages.length === 0}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              setLearningEnabled(!learningEnabled);
            }}
            title={learningEnabled ? "Disable learning" : "Enable learning"}
            className="text-white hover:bg-white/20"
          >
            {learningEnabled ? "🧠" : "💤"}
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="h-[calc(100%-56px)] bg-background border-t flex">
          <div className="flex-1 flex flex-col min-w-0">
            <Tabs value={mode} onValueChange={(v: string) => setMode(v as typeof mode)} className="border-b">
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

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">
                      {mode === "code" && "Ask me to generate any web component or JavaScript code"}
                      {mode === "design" && "Get expert design recommendations and tips"}
                      {mode === "review" && "Submit your code for a thorough review"}
                    </p>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg",
                        message.role === "user" ? "bg-primary text-primary-foreground p-3" : "bg-muted overflow-hidden",
                      )}
                    >
                      {message.content.includes("```") ? (
                        <div className="space-y-2">
                          {message.content.split("```").map((part, i) => {
                            if (i % 2 === 0) {
                              return part ? (
                                <div key={i} className="px-3 py-2">
                                  <p className="whitespace-pre-wrap m-0 text-sm">{part}</p>
                                </div>
                              ) : null;
                            }
                            const lines = part.split("\n");
                            const lang = lines[0].trim();
                            const codeContent = lines.slice(1).join("\n").trim();

                            return (
                              <div
                                key={i}
                                className="relative group border border-border/50 rounded-lg overflow-hidden"
                              >
                                <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b border-border/50">
                                  <div className="flex items-center gap-2">
                                    <Code className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground uppercase">
                                      {lang || "code"}
                                    </span>
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
                                <div className="max-h-[400px] overflow-auto rounded-lg">
                                  <CodeMirrorEditor
                                    height="auto"
                                    language={(lang === "typescript" ? "javascript" : (lang as "javascript" | "html" | "css" | "json")) || "javascript"}
                                    value={codeContent}
                                    theme="vs-dark"
                                    readOnly={true}
                                    options={{
                                      lineNumbers: "on",
                                      wordWrap: "on",
                                    }}
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

            <div className="p-4 border-t bg-background">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    mode === "code"
                      ? "Describe the code you want to create..."
                      : mode === "design"
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
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Powered by AI • Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      )}

      <Dialog open={codeViewerOpen} onOpenChange={setCodeViewerOpen}>
        <DialogContent className="max-w-6xl h-[80vh] p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Code Viewer & Editor
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden p-4">
            <div className="h-full border rounded-lg overflow-hidden">
              <CodeMirrorEditor
                height="100%"
                language="javascript"
                value={viewerCode}
                onChange={(value) => setViewerCode(value || "")}
                theme="vs-dark"
                options={{
                  lineNumbers: "on",
                  wordWrap: "on",
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
