/**
 * Automation Stats Panel
 * 
 * Shows automation execution stats, installed recipe packs,
 * and quick workflow management for the web builder.
 */

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Activity,
  Zap, 
  ChevronDown,
  CheckCircle2, 
  XCircle,
  Package,
  BarChart3,
  Clock,
  Download,
  Settings,
  Sparkles,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getExecutionStats } from "@/services/intentExecutionLogger";
import {
  getAvailableRecipePacks,
  getInstalledPacks,
  getRecipeToggles,
  installRecipePack,
  toggleRecipe,
  type RecipePack,
  type InstalledPack,
  type RecipeToggle,
} from "@/services/recipeManagerService";

// ============ TYPES ============

interface AutomationStatsPanelProps {
  businessId?: string | null;
  projectId?: string | null;
  industry?: string;
  onNavigateToSettings?: () => void;
}

interface ExecutionStats {
  total: number;
  success: number;
  error: number;
  byIntent: Record<string, number>;
  avgExecutionTimeMs: number;
}

// ============ COMPONENT ============

export function AutomationStatsPanel({
  businessId,
  projectId,
  industry,
  onNavigateToSettings,
}: AutomationStatsPanelProps) {
  const [stats, setStats] = useState<ExecutionStats | null>(null);
  const [availablePacks, setAvailablePacks] = useState<RecipePack[]>([]);
  const [installedPacks, setInstalledPacks] = useState<InstalledPack[]>([]);
  const [recipeToggles, setRecipeToggles] = useState<RecipeToggle[]>([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      if (!businessId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch execution stats
        const statsData = await getExecutionStats(businessId, 7);
        setStats(statsData);

        // Fetch recipe packs
        const [available, installed, toggles] = await Promise.all([
          getAvailableRecipePacks(businessId),
          getInstalledPacks(businessId),
          getRecipeToggles(businessId),
        ]);

        setAvailablePacks(available);
        setInstalledPacks(installed);
        setRecipeToggles(toggles);
      } catch (error) {
        console.error("Error fetching automation data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [businessId]);

  // Install a recipe pack
  async function handleInstallPack(packId: string) {
    if (!businessId) {
      toast.error("Business profile required");
      return;
    }

    setInstalling(packId);
    try {
      const result = await installRecipePack(businessId, packId, { enableAll: true });
      if (result.success) {
        toast.success("Recipe pack installed!");
        // Refresh installed packs
        const [installed, toggles] = await Promise.all([
          getInstalledPacks(businessId),
          getRecipeToggles(businessId),
        ]);
        setInstalledPacks(installed);
        setRecipeToggles(toggles);
      } else {
        toast.error(result.error || "Failed to install pack");
      }
    } catch (error) {
      toast.error("Failed to install pack");
    } finally {
      setInstalling(null);
    }
  }

  // Toggle a recipe
  async function handleToggleRecipe(recipeId: string, enabled: boolean) {
    if (!businessId) return;

    try {
      const result = await toggleRecipe(businessId, recipeId, enabled);
      if (result.success) {
        setRecipeToggles(prev =>
          prev.map(t => t.recipeId === recipeId ? { ...t, enabled } : t)
        );
      }
    } catch (error) {
      toast.error("Failed to toggle recipe");
    }
  }

  // Calculate success rate
  const successRate = stats && stats.total > 0
    ? Math.round((stats.success / stats.total) * 100)
    : 0;

  // Get top intents
  const topIntents = stats?.byIntent
    ? Object.entries(stats.byIntent)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : [];

  // Get packs not yet installed
  const notInstalledPacks = availablePacks.filter(
    pack => !installedPacks.some(ip => ip.packId === pack.id)
  );

  // Get recommended packs based on industry
  const recommendedPacks = notInstalledPacks.filter(
    pack => industry && pack.industry.toLowerCase() === industry.toLowerCase()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="h-5 w-5 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!businessId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <Zap className="h-12 w-12 text-gray-600 mb-4" />
        <h3 className="text-sm font-medium text-gray-400 mb-2">
          Business Profile Required
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Connect a business profile to enable automations
        </p>
        <Button
          variant="outline"
          size="sm"
          className="border-cyan-500/30"
          onClick={onNavigateToSettings}
        >
          <Settings className="h-3 w-3 mr-2" />
          Setup Business
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-4">
        {/* Stats Overview */}
        <Card className="bg-[#0a0a14] border-cyan-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-cyan-400">
              <Activity className="h-4 w-4" />
              7-Day Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Success Rate */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400">Success Rate</span>
                <span className={cn(
                  "font-medium",
                  successRate >= 90 ? "text-green-400" :
                  successRate >= 70 ? "text-yellow-400" : "text-red-400"
                )}>
                  {successRate}%
                </span>
              </div>
              <Progress 
                value={successRate} 
                className="h-1.5"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#0d0d18] rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-white">{stats?.total || 0}</div>
                <div className="text-[10px] text-gray-500">Executions</div>
              </div>
              <div className="bg-[#0d0d18] rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-green-400">{stats?.success || 0}</div>
                <div className="text-[10px] text-gray-500">Success</div>
              </div>
              <div className="bg-[#0d0d18] rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-red-400">{stats?.error || 0}</div>
                <div className="text-[10px] text-gray-500">Errors</div>
              </div>
            </div>

            {/* Avg Execution Time */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Avg Response Time
              </span>
              <span className="text-white">{stats?.avgExecutionTimeMs || 0}ms</span>
            </div>
          </CardContent>
        </Card>

        {/* Top Intents */}
        {topIntents.length > 0 && (
          <Card className="bg-[#0a0a14] border-cyan-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-purple-400">
                <BarChart3 className="h-4 w-4" />
                Top Intents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topIntents.map(([intent, count], idx) => (
                  <div key={intent} className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 w-4">{idx + 1}.</span>
                    <code className="text-xs text-cyan-400 flex-1 truncate">{intent}</code>
                    <Badge variant="outline" className="text-[10px] bg-cyan-500/10 border-cyan-500/20">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Installed Recipe Packs */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-[#0a0a14] rounded-lg border border-cyan-500/20 hover:bg-cyan-500/5">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-green-400" />
              <span className="text-sm text-white">Installed Packs</span>
              <Badge variant="outline" className="text-[10px]">
                {installedPacks.length}
              </Badge>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2">
            {installedPacks.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">
                No recipe packs installed yet
              </p>
            ) : (
              installedPacks.map(pack => (
                <div
                  key={pack.id}
                  className="flex items-center justify-between p-2 bg-[#0d0d18] rounded-lg"
                >
                  <div>
                    <div className="text-xs font-medium text-white">{pack.packName}</div>
                    <div className="text-[10px] text-gray-500 capitalize">{pack.industry}</div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px]",
                      pack.enabled ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-gray-500/10"
                    )}
                  >
                    {pack.enabled ? "Active" : "Disabled"}
                  </Badge>
                </div>
              ))
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Active Recipes */}
        {recipeToggles.length > 0 && (
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-[#0a0a14] rounded-lg border border-purple-500/20 hover:bg-purple-500/5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-white">Active Recipes</span>
                <Badge variant="outline" className="text-[10px]">
                  {recipeToggles.filter(t => t.enabled).length}/{recipeToggles.length}
                </Badge>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-1">
              {recipeToggles.map(toggle => (
                <div
                  key={toggle.recipeId}
                  className="flex items-center justify-between p-2 bg-[#0d0d18] rounded-lg"
                >
                  <span className="text-xs text-white truncate flex-1">{toggle.recipeName}</span>
                  <Switch
                    checked={toggle.enabled}
                    onCheckedChange={(checked) => handleToggleRecipe(toggle.recipeId, checked)}
                    className="scale-75"
                  />
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Recommended Packs */}
        {recommendedPacks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <TrendingUp className="h-3 w-3" />
              Recommended for {industry}
            </div>
            {recommendedPacks.map(pack => (
              <Card 
                key={pack.id} 
                className="bg-gradient-to-r from-[#0a0a14] to-[#0d0d18] border-cyan-500/20"
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-medium text-white">{pack.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">{pack.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant="outline" 
                          className="text-[9px]"
                          style={{ 
                            backgroundColor: pack.color ? `${pack.color}20` : undefined,
                            borderColor: pack.color ? `${pack.color}40` : undefined,
                            color: pack.color,
                          }}
                        >
                          {pack.recipes.length} recipes
                        </Badge>
                        <Badge variant="outline" className="text-[9px] capitalize">
                          {pack.tier}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-cyan-500/30 hover:bg-cyan-500/10"
                      onClick={() => handleInstallPack(pack.id)}
                      disabled={installing === pack.id}
                    >
                      {installing === pack.id ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Download className="h-3 w-3 mr-1" />
                          Install
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Browse All Packs */}
        {notInstalledPacks.length > recommendedPacks.length && (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-xs text-gray-400 hover:text-gray-300">
              <span>Browse All Packs ({notInstalledPacks.length} available)</span>
              <ChevronDown className="h-3 w-3" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {notInstalledPacks
                .filter(p => !recommendedPacks.includes(p))
                .map(pack => (
                  <div
                    key={pack.id}
                    className="flex items-center justify-between p-2 bg-[#0d0d18] rounded-lg"
                  >
                    <div>
                      <div className="text-xs text-white">{pack.name}</div>
                      <div className="text-[10px] text-gray-500 capitalize">{pack.industry}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px]"
                      onClick={() => handleInstallPack(pack.id)}
                      disabled={installing === pack.id}
                    >
                      {installing === pack.id ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        "Install"
                      )}
                    </Button>
                  </div>
                ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </ScrollArea>
  );
}

export default AutomationStatsPanel;
