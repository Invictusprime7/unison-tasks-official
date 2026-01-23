import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, ArrowLeft, Check, Zap, Layout, Eye, Database, Workflow, Shield } from "lucide-react";
import { businessSystems, type BusinessSystemType, type LayoutTemplate } from "@/data/templates/types";
import { getTemplatesByCategory } from "@/data/templates";
import { getTemplateManifest, getDefaultManifestForSystem } from "@/data/templates/manifest";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SystemLauncherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SystemLauncher = ({ open, onOpenChange }: SystemLauncherProps) => {
  const navigate = useNavigate();
  const [selectedSystem, setSelectedSystem] = useState<BusinessSystemType | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<LayoutTemplate | null>(null);
  const [step, setStep] = useState<"select" | "templates">("select");
  const [templateFilter, setTemplateFilter] = useState<'all' | 'editorial'>('all');
  const [isLaunching, setIsLaunching] = useState(false);

  // Get templates for the selected system
  const systemTemplates = useMemo(() => {
    if (!selectedSystem) return [];
    const system = businessSystems.find(s => s.id === selectedSystem);
    if (!system) return [];
    return system.templateCategories.flatMap(cat => getTemplatesByCategory(cat));
  }, [selectedSystem]);

  const editorialTemplates = useMemo(() => {
    return systemTemplates.filter((t) => (t.tags || []).includes('editorial'));
  }, [systemTemplates]);

  const visibleTemplates = useMemo(() => {
    if (templateFilter === 'editorial') return editorialTemplates;
    return systemTemplates;
  }, [templateFilter, editorialTemplates, systemTemplates]);

  // Get manifest for selected template to show backend info
  const selectedManifest = useMemo(() => {
    if (!selectedTemplate || !selectedSystem) return null;
    return getTemplateManifest(selectedTemplate.id) || getDefaultManifestForSystem(selectedSystem);
  }, [selectedTemplate, selectedSystem]);

  const handleSystemSelect = (systemId: BusinessSystemType) => {
    setSelectedSystem(systemId);
    setSelectedTemplate(null);
    setTemplateFilter('all');
    setStep("templates");
  };

  const handleTemplateSelect = (template: LayoutTemplate) => {
    setSelectedTemplate(template);
  };

  const handleLaunch = async () => {
    if (!selectedSystem || !selectedTemplate) return;

    const system = businessSystems.find((s) => s.id === selectedSystem);
    if (!system) return;

    setIsLaunching(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("Please sign in to install this system");
        navigate("/auth");
        return;
      }

      const manifest = getTemplateManifest(selectedTemplate.id) || getDefaultManifestForSystem(selectedSystem);

      const { data, error } = await supabase.functions.invoke("install-system", {
        body: {
          systemType: selectedSystem,
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          businessName: `${system.name} Business`,
        },
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || "Install failed");
      }

      const businessId = data.data.businessId as string;
      console.log("[SystemLauncher] Installed system:", selectedSystem, "businessId:", businessId);

      navigate("/web-builder", {
        state: {
          generatedCode: selectedTemplate.code,
          templateName: selectedTemplate.name,
          systemType: selectedSystem,
          systemName: system.name,
          preloadedIntents: system.intents,
          businessId,
          manifestId: manifest.id,
          isProvisioned: true,
        },
      });

      onOpenChange(false);
      resetState();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Install failed";
      console.error("[SystemLauncher] install error", e);
      toast.error(msg);
    } finally {
      setIsLaunching(false);
    }
  };

  const resetState = () => {
    setStep("select");
    setSelectedSystem(null);
    setSelectedTemplate(null);
  };

  const handleBack = () => {
    if (step === "templates") {
      setStep("select");
      setSelectedSystem(null);
      setSelectedTemplate(null);
      setTemplateFilter('all');
    }
  };

  const selectedSystemData = selectedSystem 
    ? businessSystems.find(s => s.id === selectedSystem) 
    : null;

  // Category display names
  const categoryLabels: Record<string, string> = {
    landing: "Landing Pages",
    portfolio: "Portfolio",
    restaurant: "Restaurant",
    ecommerce: "E-Commerce",
    blog: "Blog",
    contractor: "Contractor",
    agency: "Agency",
    startup: "Startup",
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetState();
    }}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-background border-border max-h-[90vh]">
        <AnimatePresence mode="wait">
          {step === "select" ? (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <Badge variant="secondary" className="mb-4">
                  <Zap className="h-3 w-3 mr-1" />
                  Quick Launch
                </Badge>
                <h2 className="text-3xl font-bold mb-2 text-foreground">
                  What are you launching?
                </h2>
                <p className="text-muted-foreground">
                  Choose your business type. We'll show you ready-made templates.
                </p>
              </div>

              {/* System Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {businessSystems.map((system) => (
                  <motion.button
                    key={system.id}
                    onClick={() => handleSystemSelect(system.id)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "relative p-6 rounded-xl border-2 text-left transition-all",
                      "hover:border-primary hover:shadow-lg",
                      "bg-card border-border",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    )}
                  >
                    <div className="text-4xl mb-3">{system.icon}</div>
                    <h3 className="font-semibold text-lg mb-1 text-foreground">
                      {system.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {system.tagline}
                    </p>
                  </motion.button>
                ))}
              </div>

              {/* Skip option */}
              <div className="text-center mt-8">
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate("/web-builder");
                    onOpenChange(false);
                  }}
                  className="text-muted-foreground"
                >
                  Skip and start from scratch
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="templates"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col h-full"
            >
              {selectedSystemData && (
                <>
                  {/* Header with back button */}
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBack}
                        className="shrink-0"
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                      </Button>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{selectedSystemData.icon}</span>
                          <div>
                            <h2 className="text-xl font-bold text-foreground">
                              Choose a {selectedSystemData.name} Template
                            </h2>
                            <p className="text-sm text-muted-foreground">
                              {systemTemplates.length} ready-to-use templates available
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick filters */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={templateFilter === 'all' ? 'default' : 'outline'}
                        onClick={() => setTemplateFilter('all')}
                        className="h-7 text-xs"
                      >
                        All
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={templateFilter === 'editorial' ? 'default' : 'outline'}
                        onClick={() => setTemplateFilter('editorial')}
                        className="h-7 text-xs"
                        disabled={editorialTemplates.length === 0}
                      >
                        Editorial (new)
                        <Badge variant="secondary" className="ml-2 text-[10px] px-1 py-0 h-4">
                          {editorialTemplates.length}
                        </Badge>
                      </Button>
                    </div>
                  </div>

                  {/* Template Grid */}
                  <ScrollArea className="flex-1 max-h-[50vh] p-6">
                    {/* Featured Editorial row (only when browsing All) */}
                    {templateFilter === 'all' && editorialTemplates.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px]">
                              Featured
                            </Badge>
                            <h3 className="text-sm font-semibold text-foreground">
                              Editorial starters
                            </h3>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => setTemplateFilter('editorial')}
                          >
                            View all
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {editorialTemplates.slice(0, 3).map((template) => (
                            <motion.div
                              key={template.id}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleTemplateSelect(template)}
                              className={cn(
                                "relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all",
                                "bg-card hover:shadow-lg",
                                selectedTemplate?.id === template.id
                                  ? "border-primary ring-2 ring-primary/20"
                                  : "border-border hover:border-primary/50"
                              )}
                            >
                              <div className="aspect-video bg-muted/50 relative overflow-hidden">
                                <div className="absolute inset-0 p-2 overflow-hidden">
                                  <div
                                    className="w-full h-full rounded bg-white transform scale-[0.25] origin-top-left"
                                    style={{ width: '400%', height: '400%', pointerEvents: 'none' }}
                                    dangerouslySetInnerHTML={{
                                      __html: template.code.replace(/<script[\s\S]*?<\/script>/gi, ''),
                                    }}
                                  />
                                </div>
                                <div className="absolute inset-0 bg-primary/0 hover:bg-primary/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                                  <Eye className="h-6 w-6 text-primary" />
                                </div>
                              </div>
                              <div className="p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h3 className="font-semibold text-sm text-foreground line-clamp-1">
                                    {template.name}
                                  </h3>
                                  {selectedTemplate?.id === template.id && (
                                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                                      <Check className="h-3 w-3 text-primary-foreground" />
                                    </div>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                  {template.description}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-[10px] px-2 py-0">
                                    {categoryLabels[template.category] || template.category}
                                  </Badge>
                                  <Badge variant="outline" className="text-[10px] px-2 py-0 text-muted-foreground">
                                    editorial
                                  </Badge>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {visibleTemplates.map((template) => (
                        <motion.div
                          key={template.id}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleTemplateSelect(template)}
                          className={cn(
                            "relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all",
                            "bg-card hover:shadow-lg",
                            selectedTemplate?.id === template.id
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          {/* Template Preview */}
                          <div className="aspect-video bg-muted/50 relative overflow-hidden">
                            {/* Mini preview of template code */}
                            <div className="absolute inset-0 p-2 overflow-hidden">
                              <div 
                                className="w-full h-full rounded bg-white transform scale-[0.25] origin-top-left"
                                style={{ 
                                  width: '400%', 
                                  height: '400%',
                                  pointerEvents: 'none'
                                }}
                                dangerouslySetInnerHTML={{ 
                                  __html: template.code.replace(/<script[\s\S]*?<\/script>/gi, '') 
                                }}
                              />
                            </div>
                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-primary/0 hover:bg-primary/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                              <Eye className="h-6 w-6 text-primary" />
                            </div>
                          </div>
                          
                          {/* Template Info */}
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-semibold text-sm text-foreground line-clamp-1">
                                {template.name}
                              </h3>
                              {selectedTemplate?.id === template.id && (
                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                                  <Check className="h-3 w-3 text-primary-foreground" />
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-[10px] px-2 py-0">
                                {categoryLabels[template.category] || template.category}
                              </Badge>
                              {template.tags?.slice(0, 2).map((tag) => (
                                <Badge 
                                  key={tag} 
                                  variant="outline" 
                                  className="text-[10px] px-2 py-0 text-muted-foreground"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Footer with Launch Button */}
                  <div className="p-6 border-t border-border bg-muted/30">
                    <div className="flex items-center justify-between gap-4">
                      {/* Selected template info */}
                      <div className="flex-1">
                        {selectedTemplate ? (
                          <div className="flex items-center gap-3">
                            <Layout className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium text-sm text-foreground">
                                {selectedTemplate.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Ready to customize
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Select a template to get started
                          </p>
                        )}
                      </div>
                      
                      {/* Backend features hint */}
                      <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground">
                        {selectedManifest && (
                          <>
                            <div className="flex items-center gap-1">
                              <Database className="h-3 w-3 text-primary" />
                              <span>{selectedManifest.tables.length} tables</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Workflow className="h-3 w-3 text-primary" />
                              <span>{selectedManifest.workflows.length} workflows</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Shield className="h-3 w-3 text-primary" />
                              <span>{selectedManifest.intents.length} intents</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Launch button */}
                      <Button
                        size="lg"
                        onClick={handleLaunch}
                        disabled={!selectedTemplate || isLaunching}
                        className="min-w-[180px]"
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        {isLaunching ? "Installing…" : "Start Building"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default SystemLauncher;
