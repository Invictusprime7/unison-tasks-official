import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Zap, RefreshCw, Send, Bot, Sparkles, Activity } from "lucide-react";
import { PluginStateDisplay } from "@/components/ai-agent/PluginStateDisplay";
import { AIEventTrigger } from "@/components/ai-agent/AIEventTrigger";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AIPluginsPanelProps {
  businessId?: string;
  pluginInstanceId?: string;
}

export const AIPluginsPanel = ({ businessId, pluginInstanceId }: AIPluginsPanelProps) => {
  const [activeTab, setActiveTab] = useState<"state" | "trigger">("state");

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-3 border-b border-border/20 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">AI Plugins</span>
          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
            Beta
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Embed AI agents in templates for lead scoring, booking, and automation.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "state" | "trigger")} className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-2 mt-2 h-8 shrink-0 bg-muted/50">
          <TabsTrigger value="state" className="text-[10px] h-6 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Activity className="h-3 w-3 mr-1" />
            State
          </TabsTrigger>
          <TabsTrigger value="trigger" className="text-[10px] h-6 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Zap className="h-3 w-3 mr-1" />
            Test
          </TabsTrigger>
        </TabsList>

        <TabsContent value="state" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-3">
              {pluginInstanceId ? (
                <PluginStateDisplay 
                  pluginInstanceId={pluginInstanceId} 
                  compact 
                />
              ) : (
                <Card className="bg-muted/30 border-dashed">
                  <CardContent className="p-4 text-center">
                    <Bot className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground mb-2">
                      No active plugin instance
                    </p>
                    <p className="text-[10px] text-muted-foreground/70">
                      Configure an AI plugin in your template to see real-time state updates here.
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-background/50">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-primary" />
                    Available Agents
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                        <Brain className="h-3 w-3 text-primary" />
                      </div>
                      <span>Lead Qualifier</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] h-4">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-accent/20 flex items-center justify-center">
                        <Zap className="h-3 w-3 text-accent-foreground" />
                      </div>
                      <span>Booking Agent</span>
                    </div>
                    <Badge variant="secondary" className="text-[9px] h-4">Coming</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="trigger" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-3">
              <AIEventTrigger 
                businessId={businessId}
                pluginInstanceId={pluginInstanceId}
              />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
