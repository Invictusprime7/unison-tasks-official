import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, Sparkles, Zap } from "lucide-react";
import { businessSystems, type BusinessSystemType } from "@/data/templates/types";
import { layoutTemplates, getTemplatesByCategory } from "@/data/templates";
import { cn } from "@/lib/utils";

interface SystemLauncherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SystemLauncher = ({ open, onOpenChange }: SystemLauncherProps) => {
  const navigate = useNavigate();
  const [selectedSystem, setSelectedSystem] = useState<BusinessSystemType | null>(null);
  const [step, setStep] = useState<"select" | "confirm">("select");

  const handleSystemSelect = (systemId: BusinessSystemType) => {
    setSelectedSystem(systemId);
    setStep("confirm");
  };

  const handleLaunch = () => {
    if (!selectedSystem) return;
    
    const system = businessSystems.find(s => s.id === selectedSystem);
    if (!system) return;

    // Get templates for this system
    const templates = system.templateCategories.flatMap(cat => 
      getTemplatesByCategory(cat)
    );
    
    // Pick the first template (or random for variety)
    const template = templates[0];
    
    if (template) {
      // Navigate to web builder with pre-loaded template and system context
      navigate("/web-builder", {
        state: {
          generatedCode: template.code,
          templateName: template.name,
          systemType: selectedSystem,
          systemName: system.name,
          preloadedIntents: system.intents,
        },
      });
    } else {
      // No template, just go to builder with system context
      navigate("/web-builder", {
        state: {
          systemType: selectedSystem,
          systemName: system.name,
          preloadedIntents: system.intents,
        },
      });
    }
    
    onOpenChange(false);
    setStep("select");
    setSelectedSystem(null);
  };

  const handleBack = () => {
    setStep("select");
    setSelectedSystem(null);
  };

  const selectedSystemData = selectedSystem 
    ? businessSystems.find(s => s.id === selectedSystem) 
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background border-border">
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
                  Choose your business type. We'll set everything up automatically.
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
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-8"
            >
              {selectedSystemData && (
                <>
                  {/* Back button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="mb-6"
                  >
                    ← Back to systems
                  </Button>

                  {/* System Details */}
                  <div className="flex items-start gap-6 mb-8">
                    <div className={cn(
                      "w-20 h-20 rounded-2xl flex items-center justify-center text-5xl",
                      selectedSystemData.color.replace("bg-", "bg-") + "/20"
                    )}>
                      {selectedSystemData.icon}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2 text-foreground">
                        {selectedSystemData.name}
                      </h2>
                      <p className="text-muted-foreground">
                        {selectedSystemData.description}
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-8">
                    <h3 className="font-semibold mb-4 text-foreground">
                      Included in your system:
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedSystemData.features.map((feature, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pre-wired Intents Badge */}
                  <div className="bg-muted/50 rounded-xl p-4 mb-8">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm text-foreground">Auto-Wired Actions</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Buttons and forms are automatically connected to backend actions:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSystemData.intents.map((intent) => (
                        <Badge key={intent} variant="secondary" className="text-xs">
                          {intent}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Launch Button */}
                  <Button
                    size="lg"
                    onClick={handleLaunch}
                    className="w-full text-lg h-14"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Launch {selectedSystemData.name}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
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
