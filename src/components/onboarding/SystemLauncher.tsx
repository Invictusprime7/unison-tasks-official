import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, ArrowLeft, Check, Zap, Layout, Eye, Database, Workflow, Shield, Sparkles, Loader2, Palette } from "lucide-react";
import { businessSystems, type BusinessSystemType, type LayoutTemplate, type LayoutCategory } from "@/data/templates/types";
import { getTemplatesByCategory } from "@/data/templates";
import { getTemplateManifest, getDefaultManifestForSystem } from "@/data/templates/manifest";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AICodeAssistant } from "@/components/creatives/AICodeAssistant";
import { buildPageStructureContext } from "@/utils/pageStructureContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateDesignVariation, randomFontPairing } from "@/utils/designVariation";

// ============================================================================
// Theme Presets — core set of 6 aesthetic directions
// ============================================================================

export interface ThemePreset {
  id: string;
  label: string;
  description: string;
  icon: string;
  /** AI prompt guidance for this theme */
  promptGuidance: string;
  /** Preview palette hints */
  palette: { bg: string; fg: string; accent: string };
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "modern",
    label: "Modern",
    description: "Clean lines, bold typography, vibrant gradients. Contemporary and fresh.",
    icon: "✦",
    promptGuidance: "Use a modern aesthetic: clean sans-serif typography (e.g. Inter, DM Sans), bold gradients, generous whitespace, card-based layouts, subtle shadows, and vibrant accent colors. Aim for a contemporary tech-forward look.",
    palette: { bg: "#0F172A", fg: "#F8FAFC", accent: "#3B82F6" },
  },
  {
    id: "editorial",
    label: "Editorial",
    description: "Sophisticated serif fonts, magazine-style layouts. Elegant and refined.",
    icon: "◈",
    promptGuidance: "Use an editorial aesthetic: elegant serif headings (e.g. Playfair Display, Cormorant Garamond), refined body text, magazine-style asymmetric layouts, muted elegant color palettes, generous typography scale, and editorial photography treatments.",
    palette: { bg: "#FDFCFA", fg: "#1A1A1A", accent: "#8B7355" },
  },
  {
    id: "futuristic",
    label: "Futuristic",
    description: "Neon accents, dark backgrounds, glassmorphism. Sci-fi inspired and bold.",
    icon: "◉",
    promptGuidance: "Use a futuristic/cyberpunk aesthetic: dark backgrounds (#0A0A0F), neon accent colors (cyan, magenta, electric blue), glassmorphism effects, monospace or geometric sans-serif fonts, grid-based layouts, subtle glow effects, and angular design elements.",
    palette: { bg: "#0A0A14", fg: "#E0E0FF", accent: "#00F0FF" },
  },
  {
    id: "minimalist",
    label: "Minimalist",
    description: "Maximum whitespace, monochromatic palette. Less is more.",
    icon: "○",
    promptGuidance: "Use a minimalist aesthetic: maximum whitespace, monochromatic or two-tone color scheme, thin typography weights, minimal decoration, clean geometric shapes, subtle borders instead of shadows, and restrained use of color.",
    palette: { bg: "#FFFFFF", fg: "#111111", accent: "#666666" },
  },
  {
    id: "bold",
    label: "Bold",
    description: "Heavy weights, oversized text, high contrast. Unapologetic and loud.",
    icon: "■",
    promptGuidance: "Use a bold/brutalist aesthetic: oversized typography with heavy weights (900, 800), high contrast black-and-white with one vivid accent color, uppercase headings, large text sizes, unconventional grid breaks, and raw graphic energy.",
    palette: { bg: "#000000", fg: "#FFFFFF", accent: "#FF3333" },
  },
  {
    id: "organic",
    label: "Organic",
    description: "Warm tones, rounded shapes, natural textures. Earthy and inviting.",
    icon: "◠",
    promptGuidance: "Use an organic/natural aesthetic: warm earth tones (terracotta, sage, cream, clay), rounded corners and soft shapes, handwritten or humanist fonts, natural imagery, gentle gradients, cozy spacing, and inviting warmth throughout.",
    palette: { bg: "#FAF5F0", fg: "#2D2418", accent: "#C4703F" },
  },
];

// ============================================================================
// Component
// ============================================================================

interface SystemLauncherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type WizardStep = "industry" | "theme" | "templates";

export const SystemLauncher = ({ open, onOpenChange }: SystemLauncherProps) => {
  const navigate = useNavigate();
  const [selectedSystem, setSelectedSystem] = useState<BusinessSystemType | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<LayoutTemplate | null>(null);
  const [step, setStep] = useState<WizardStep>("industry");
  const [isLaunching, setIsLaunching] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<LayoutCategory | "all">("all");

  // Prompt input for custom instructions (merged from SystemsAIPanel)
  const [customPrompt, setCustomPrompt] = useState("");

  // Pre-launch edits (AI patch plan)
  const [aiEditOpen, setAiEditOpen] = useState(false);
  const [editedTemplateCode, setEditedTemplateCode] = useState<string | null>(null);
  const [editedTemplateFiles, setEditedTemplateFiles] = useState<Record<string, string> | null>(null);

  // Load user's saved templates
  const [userSavedTemplates, setUserSavedTemplates] = useState<LayoutTemplate[]>([]);
  useEffect(() => {
    const loadUserTemplates = async () => {
      const { data } = await supabase
        .from('design_templates')
        .select('id, name, description, canvas_data')
        .order('updated_at', { ascending: false })
        .limit(12);
      if (data) {
        const mapped: LayoutTemplate[] = data
          .filter(t => {
            const cd = t.canvas_data as Record<string, unknown> | null;
            return cd && (typeof cd === 'object') && ('code' in cd || 'html' in cd || 'previewHtml' in cd);
          })
          .map(t => {
            const cd = t.canvas_data as Record<string, string>;
            return {
              id: `saved-${t.id}`,
              name: t.name,
              description: t.description || 'Your saved template',
              category: 'saved' as LayoutCategory,
              code: cd.code || cd.html || cd.previewHtml || '',
              tags: ['saved'],
            };
          });
        setUserSavedTemplates(mapped);
      }
    };
    if (open) loadUserTemplates();
  }, [open]);

  // Templates for selected system
  const systemTemplates = useMemo(() => {
    if (!selectedSystem) return [];
    const system = businessSystems.find(s => s.id === selectedSystem);
    if (!system) return [];
    return system.templateCategories.flatMap(cat => getTemplatesByCategory(cat));
  }, [selectedSystem]);

  const allTemplates = useMemo(() => [...systemTemplates, ...userSavedTemplates], [systemTemplates, userSavedTemplates]);

  const availableCategories = useMemo(() => {
    const cats = new Set<LayoutCategory>();
    allTemplates.forEach(t => cats.add(t.category));
    return Array.from(cats);
  }, [allTemplates]);

  const visibleTemplates = useMemo(() => {
    if (categoryFilter === "all") return allTemplates;
    return allTemplates.filter(t => t.category === categoryFilter);
  }, [allTemplates, categoryFilter]);

  const selectedManifest = useMemo(() => {
    if (!selectedTemplate || !selectedSystem) return null;
    return getTemplateManifest(selectedTemplate.id) || getDefaultManifestForSystem(selectedSystem);
  }, [selectedTemplate, selectedSystem]);

  const selectedSystemData = selectedSystem ? businessSystems.find(s => s.id === selectedSystem) : null;
  const effectiveTemplateCode = selectedTemplate ? (editedTemplateCode ?? selectedTemplate.code) : null;

  // ---- Handlers ----

  const handleSystemSelect = (systemId: BusinessSystemType) => {
    setSelectedSystem(systemId);
    setSelectedTemplate(null);
    setCategoryFilter("all");
    setStep("theme");
  };

  const handleThemeSelect = (theme: ThemePreset) => {
    setSelectedTheme(theme);
  };

  const handleThemeContinue = () => {
    setStep("templates");
  };

  const handleTemplateSelect = (template: LayoutTemplate) => {
    setSelectedTemplate(template);
    setEditedTemplateCode(null);
    setEditedTemplateFiles(null);
  };

  const handleLaunch = async () => {
    if (!selectedSystem || !selectedTemplate) return;
    const system = businessSystems.find(s => s.id === selectedSystem);
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
      let effectiveCode = editedTemplateCode ?? selectedTemplate.code;

      // Apply selected theme via AI if one was chosen
      if (selectedTheme && !editedTemplateFiles) {
        try {
          toast("Applying theme…", { description: selectedTheme.label });
          const { data: aiData, error: aiError } = await supabase.functions.invoke("ai-code-assistant", {
            body: {
              messages: [{
                role: "user",
                content:
                  `Apply the "${selectedTheme.label}" theme to this template.\n\n` +
                  `${selectedTheme.promptGuidance}\n\n` +
                  `STRICT RULES:\n` +
                  `1. ONLY modify: font families, font sizes, font weights, colors, color schemes, text styling, backgrounds\n` +
                  `2. DO NOT change: layout structure, section order, images, icons, button positions, navigation structure\n` +
                  `3. PRESERVE ALL: data-ut-intent, data-intent, data-ut-cta, data-no-intent attributes exactly as-is\n` +
                  `4. PRESERVE ALL: form inputs, interactive elements, and their functionality\n\n` +
                  `Output ONLY the complete updated code. No markdown, no explanations.`,
              }],
              mode: "design",
              currentCode: effectiveCode.length > 20_000 ? effectiveCode.slice(0, 20_000) : effectiveCode,
              editMode: true,
              templateAction: "apply-design-preset",
              aesthetic: selectedTheme.id,
            },
          });
          if (!aiError && aiData?.content) {
            effectiveCode = aiData.content;
          }
        } catch (e) {
          console.warn("[SystemLauncher] theme application failed", e);
        }
      }

      const { data, error } = await supabase.functions.invoke("install-system", {
        body: {
          systemType: selectedSystem,
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          businessName: `${system.name} Business`,
          templateCategory: selectedTemplate.category,
          designPreset: selectedTheme?.id || null,
        },
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || "Install failed");
      }

      const businessId = data.data.businessId as string;

      navigate("/web-builder", {
        state: {
          generatedCode: effectiveCode,
          vfsFiles: editedTemplateFiles,
          templateName: selectedTemplate.name,
          aesthetic: selectedTheme?.id,
          designPreset: selectedTheme?.id,
          templateCategory: selectedTemplate.category,
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

  /**
   * Generate a unique AI variation with theme context baked into the prompt.
   */
  const handleAIGenerate = async () => {
    if (!selectedSystem || !selectedTemplate) return;
    const system = businessSystems.find(s => s.id === selectedSystem);
    if (!system) return;

    setIsAIGenerating(true);
    try {
      const industry = selectedTemplate.category;
      const fonts = randomFontPairing();
      const design = generateDesignVariation();

      // Inject theme guidance into the blueprint
      const blueprint = {
        version: "1.0",
        identity: { industry, primary_goal: "Generate leads and grow the business" },
        brand: {
          business_name: `${system.name} Business`,
          tagline: `Professional ${system.name.toLowerCase()} services you can trust`,
          tone: selectedTheme ? selectedTheme.label.toLowerCase() : "professional and friendly",
          typography: fonts,
        },
        design,
        intents: system.intents.map(i => ({ intent: i })),
      };

      // Build user prompt with theme + custom instructions
      const themeInstruction = selectedTheme
        ? `\n\n🎨 THEME DIRECTION: ${selectedTheme.label}\n${selectedTheme.promptGuidance}\n`
        : "";
      const customInstruction = customPrompt.trim()
        ? `\n\nADDITIONAL INSTRUCTIONS: ${customPrompt.trim()}\n`
        : "";

      const userPrompt = `Create a unique, premium ${system.name.toLowerCase()} website inspired by but NOT identical to the reference template. Use different color schemes, layout variations, and original copy while maintaining the same quality level.${themeInstruction}${customInstruction}`;

      const { data, error } = await supabase.functions.invoke("systems-build", {
        body: {
          blueprint,
          userPrompt,
          enhanceWithAI: true,
          templateId: selectedTemplate.id,
          templateHtml: selectedTemplate.code,
          variantMode: true,
          variationSeed: `v${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        },
      });

      if (error) {
        if (error.message?.includes('429')) { toast.error("Rate limit exceeded. Please try again shortly."); return; }
        if (error.message?.includes('402')) { toast.error("Credits required. Please add credits to continue."); return; }
        throw error;
      }

      const generatedCode = data?.code;
      if (!generatedCode || generatedCode.length < 100) {
        toast.error("AI generation produced no output. Try again.");
        return;
      }

      navigate("/web-builder", {
        state: {
          generatedCode,
          templateName: `AI ${selectedTemplate.name}`,
          aesthetic: selectedTheme?.id,
          templateCategory: selectedTemplate.category,
          systemType: selectedSystem,
          systemName: system.name,
          preloadedIntents: system.intents,
          startInPreview: true,
        },
      });

      onOpenChange(false);
      resetState();
      toast.success("AI website generated! Opening in builder…");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI generation failed";
      console.error("[SystemLauncher] AI generation error", e);
      toast.error(msg);
    } finally {
      setIsAIGenerating(false);
    }
  };

  const resetState = () => {
    setStep("industry");
    setSelectedSystem(null);
    setSelectedTheme(null);
    setSelectedTemplate(null);
    setAiEditOpen(false);
    setEditedTemplateCode(null);
    setEditedTemplateFiles(null);
    setCategoryFilter("all");
    setCustomPrompt("");
    setIsAIGenerating(false);
  };

  const handleBack = () => {
    if (step === "templates") {
      setStep("theme");
      setSelectedTemplate(null);
      setEditedTemplateCode(null);
      setEditedTemplateFiles(null);
      setCategoryFilter("all");
    } else if (step === "theme") {
      setStep("industry");
      setSelectedSystem(null);
      setSelectedTheme(null);
    }
  };

  const categoryLabels: Record<string, string> = {
    salon: "Salon & Spa", landing: "Landing Pages", portfolio: "Portfolio",
    restaurant: "Restaurant", store: "E-Commerce", contractor: "Local Service",
    coaching: "Coaching", realestate: "Real Estate", nonprofit: "Nonprofit",
    agency: "Agency", content: "Content", saas: "SaaS", saved: "My Designs",
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) resetState(); }}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-background border-border max-h-[90vh]">
        <DialogHeader className="sr-only">
          <DialogTitle>Launch Your Website</DialogTitle>
          <DialogDescription>
            Choose your industry, pick an aesthetic theme, then select a template to start building.
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="px-8 pt-6 pb-2">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            {(["industry", "theme", "templates"] as WizardStep[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className="w-8 h-px bg-border" />}
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors",
                  step === s ? "bg-primary text-primary-foreground font-medium" :
                    (["industry", "theme", "templates"].indexOf(step) > i ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")
                )}>
                  <span className="text-[10px]">{i + 1}</span>
                  <span className="capitalize">{s}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ─── Step 1: Industry ─── */}
          {step === "industry" && (
            <motion.div key="industry" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 pt-4">
              <div className="text-center mb-8">
                <Badge variant="secondary" className="mb-4"><Zap className="h-3 w-3 mr-1" />Quick Launch</Badge>
                <h2 className="text-3xl font-bold mb-2 text-foreground">What are you launching?</h2>
                <p className="text-muted-foreground">Choose your business type to get started.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {businessSystems.map((system) => (
                  <motion.button
                    key={system.id}
                    onClick={() => handleSystemSelect(system.id)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "relative p-6 rounded-xl border-2 text-left transition-all",
                      "hover:border-primary hover:shadow-lg bg-card border-border",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    )}
                  >
                    <div className="text-4xl mb-3">{system.icon}</div>
                    <h3 className="font-semibold text-lg mb-1 text-foreground">{system.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{system.tagline}</p>
                  </motion.button>
                ))}
              </div>
              <div className="text-center mt-8">
                <Button variant="ghost" onClick={() => { navigate("/web-builder"); onOpenChange(false); }} className="text-muted-foreground">
                  Skip and start from scratch <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─── Step 2: Theme ─── */}
          {step === "theme" && selectedSystemData && (
            <motion.div key="theme" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={handleBack} className="shrink-0">
                    <ArrowLeft className="h-4 w-4 mr-1" />Back
                  </Button>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Palette className="h-6 w-6 text-primary" />
                      <div>
                        <h2 className="text-xl font-bold text-foreground">Choose Your Aesthetic</h2>
                        <p className="text-sm text-muted-foreground">
                          Set the visual direction for your {selectedSystemData.name.toLowerCase()} site
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 max-h-[50vh] p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {THEME_PRESETS.map((theme) => (
                    <motion.button
                      key={theme.id}
                      onClick={() => handleThemeSelect(theme)}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "relative p-5 rounded-xl border-2 text-left transition-all",
                        "hover:shadow-lg",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                        selectedTheme?.id === theme.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {/* Color preview strip */}
                      <div className="flex gap-1.5 mb-3">
                        <div className="w-8 h-8 rounded-lg border border-border/50" style={{ backgroundColor: theme.palette.bg }} />
                        <div className="w-8 h-8 rounded-lg border border-border/50" style={{ backgroundColor: theme.palette.accent }} />
                        <div className="w-8 h-8 rounded-lg border border-border/50" style={{ backgroundColor: theme.palette.fg }} />
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{theme.icon}</span>
                        <h3 className="font-semibold text-foreground">{theme.label}</h3>
                        {selectedTheme?.id === theme.id && (
                          <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-snug">{theme.description}</p>
                    </motion.button>
                  ))}
                </div>

                {/* Custom prompt input */}
                <div className="mt-6">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Custom instructions (optional)
                  </label>
                  <textarea
                    placeholder="e.g., Use dark navy background, add a booking form, include testimonials from local customers…"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full min-h-[80px] p-3 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                  />
                </div>
              </ScrollArea>

              <div className="p-6 border-t border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {selectedTheme ? (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{selectedTheme.icon}</span>
                        <div>
                          <p className="font-medium text-sm text-foreground">{selectedTheme.label} theme selected</p>
                          <p className="text-xs text-muted-foreground">Applied during generation and available for restyling after</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Select a theme or skip to use the default style</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={handleThemeContinue}>
                      Skip theme
                    </Button>
                    <Button onClick={handleThemeContinue} disabled={!selectedTheme}>
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Step 3: Templates ─── */}
          {step === "templates" && selectedSystemData && (
            <motion.div key="templates" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col h-full">
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={handleBack} className="shrink-0">
                    <ArrowLeft className="h-4 w-4 mr-1" />Back
                  </Button>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{selectedSystemData.icon}</span>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">
                          Choose a {selectedSystemData.name} Template
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {systemTemplates.length} templates available
                          {selectedTheme && <span className="ml-1">• <span className="text-primary">{selectedTheme.label}</span> theme</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 max-h-[50vh] p-6">
                {/* Category filter */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
                  <div className="text-sm text-muted-foreground">Filter by category</div>
                  <div className="w-full sm:w-[260px]">
                    <Select value={categoryFilter} onValueChange={(v) => {
                      const next = v as LayoutCategory | "all";
                      setCategoryFilter(next);
                      if (selectedTemplate && next !== "all" && selectedTemplate.category !== next) setSelectedTemplate(null);
                    }}>
                      <SelectTrigger><SelectValue placeholder="All categories" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {availableCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{categoryLabels[cat] || cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleTemplates.map((template) => (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTemplateSelect(template)}
                      className={cn(
                        "relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all bg-card hover:shadow-lg",
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
                              __html: (template.id === selectedTemplate?.id ? (effectiveTemplateCode ?? template.code) : template.code)
                                .replace(/<script[\s\S]*?<\/script>/gi, '')
                            }}
                          />
                        </div>
                        <div className="absolute inset-0 bg-primary/0 hover:bg-primary/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                          <Eye className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-sm text-foreground line-clamp-1">{template.name}</h3>
                          {selectedTemplate?.id === template.id && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{template.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] px-2 py-0">{categoryLabels[template.category] || template.category}</Badge>
                          {template.tags?.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-[10px] px-2 py-0 text-muted-foreground">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="p-6 border-t border-border bg-muted/30">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    {selectedTemplate ? (
                      <div className="flex items-center gap-3">
                        <Layout className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm text-foreground">{selectedTemplate.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedTheme ? `${selectedTheme.label} theme • ` : ''}Installs backend + opens builder
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Select a template to get started</p>
                    )}
                  </div>

                  <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground">
                    {selectedManifest && (
                      <>
                        <div className="flex items-center gap-1"><Database className="h-3 w-3 text-primary" /><span>{selectedManifest.tables.length} tables</span></div>
                        <div className="flex items-center gap-1"><Workflow className="h-3 w-3 text-primary" /><span>{selectedManifest.workflows.length} workflows</span></div>
                        <div className="flex items-center gap-1"><Shield className="h-3 w-3 text-primary" /><span>{selectedManifest.intents.length} intents</span></div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="lg" onClick={() => setAiEditOpen(true)} disabled={!selectedTemplate || isAIGenerating}>
                      <Zap className="mr-2 h-4 w-4" />AI edit
                    </Button>
                    <Button variant="secondary" size="lg" onClick={handleAIGenerate} disabled={!selectedTemplate || isAIGenerating || isLaunching} className="min-w-[160px]">
                      {isAIGenerating ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating…</>
                      ) : (
                        <><Sparkles className="mr-2 h-4 w-4" />Generate with AI</>
                      )}
                    </Button>
                    <Button size="lg" onClick={handleLaunch} disabled={!selectedTemplate || isLaunching || isAIGenerating} className="min-w-[180px]">
                      <Zap className="mr-2 h-4 w-4" />
                      {isLaunching ? "Installing…" : "Start Building"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI edit dialog */}
        <Dialog open={aiEditOpen} onOpenChange={setAiEditOpen}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>AI edit: {selectedTemplate?.name}</DialogTitle>
              <DialogDescription>Propose a multi-file patch plan and apply it before opening the full builder.</DialogDescription>
            </DialogHeader>
            {selectedTemplate && selectedSystem ? (
              <AICodeAssistant
                currentCode={effectiveTemplateCode ?? selectedTemplate.code}
                systemType={selectedSystem}
                templateName={selectedTemplate.name}
                pageStructureContext={buildPageStructureContext(effectiveTemplateCode ?? selectedTemplate.code)}
                backendStateContext={selectedManifest ? `- tables: ${selectedManifest.tables.length}\n- workflows: ${selectedManifest.workflows.length}\n- intents: ${selectedManifest.intents.length}` : null}
                businessDataContext={"- (not installed yet; business data will be available after install)"}
                onCodeGenerated={(code) => { setEditedTemplateCode(code); setEditedTemplateFiles(null); }}
                onFilesPatch={(files) => {
                  setEditedTemplateFiles(files);
                  const entry = files["/index.html"] || files["/src/App.tsx"] || files["/App.tsx"];
                  if (entry) setEditedTemplateCode(entry);
                  return true;
                }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Select a template first.</p>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default SystemLauncher;
