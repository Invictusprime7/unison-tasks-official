import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  Loader2,
  Settings,
  Scissors,
  Utensils,
  ShoppingBag,
  Palette,
  Users,
  Home,
  Heart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getTemplatesByCategory } from "@/data/templates";
import type { BusinessSystemType, LayoutCategory } from "@/data/templates/types";

// Industry chip configurations
const industryChips = [
  { id: "local_service", label: "Local Service", icon: Settings, examples: "Plumber, Electrician, Cleaner" },
  { id: "salon_spa", label: "Salon & Spa", icon: Scissors, examples: "Hair, Nails, Massage" },
  { id: "restaurant", label: "Restaurant", icon: Utensils, examples: "Cafe, Bakery, Food Truck" },
  { id: "ecommerce", label: "E-commerce", icon: ShoppingBag, examples: "Online Store, Boutique" },
  { id: "creator_portfolio", label: "Creator", icon: Palette, examples: "Designer, Photographer" },
  { id: "coaching_consulting", label: "Coaching", icon: Users, examples: "Coach, Consultant, Trainer" },
  { id: "real_estate", label: "Real Estate", icon: Home, examples: "Agent, Property Manager" },
  { id: "nonprofit", label: "Nonprofit", icon: Heart, examples: "Charity, Foundation" },
];

// Map chip IDs to BusinessSystemType for template lookup
const CHIP_TO_SYSTEM: Record<string, BusinessSystemType> = {
  local_service: "booking",
  salon_spa: "booking",
  restaurant: "booking",
  ecommerce: "store",
  creator_portfolio: "portfolio",
  coaching_consulting: "booking",
  real_estate: "agency",
  nonprofit: "content",
};

// Map chip IDs to LayoutCategory for direct template lookup
const CHIP_TO_CATEGORY: Record<string, LayoutCategory> = {
  local_service: "contractor",
  salon_spa: "salon",
  restaurant: "restaurant",
  ecommerce: "store",
  creator_portfolio: "portfolio",
  coaching_consulting: "coaching",
  real_estate: "realestate",
  nonprofit: "nonprofit",
};

// Map chip IDs to industry string for the blueprint
const CHIP_TO_INDUSTRY: Record<string, string> = {
  local_service: "local_service",
  salon_spa: "salon_spa",
  restaurant: "restaurant",
  ecommerce: "ecommerce",
  creator_portfolio: "creator_portfolio",
  coaching_consulting: "coaching_consulting",
  real_estate: "real_estate",
  nonprofit: "nonprofit",
};

// Industry-specific defaults for palette and intents
const INDUSTRY_DEFAULTS: Record<string, { palette: Record<string, string>; intents: string[] }> = {
  salon_spa: { palette: { primary: "#D4A574", secondary: "#8B6F4E", accent: "#E8D5C4", background: "#1A1A2E", foreground: "#F5F5F5" }, intents: ["booking.create", "contact.submit", "newsletter.subscribe"] },
  restaurant: { palette: { primary: "#D4A574", secondary: "#8B4513", accent: "#FFD700", background: "#1A1A1A", foreground: "#FFFFFF" }, intents: ["booking.create", "contact.submit", "newsletter.subscribe"] },
  local_service: { palette: { primary: "#0EA5E9", secondary: "#22D3EE", accent: "#F59E0B", background: "#0F172A", foreground: "#F8FAFC" }, intents: ["quote.request", "contact.submit", "booking.create"] },
  ecommerce: { palette: { primary: "#8B5CF6", secondary: "#A78BFA", accent: "#F59E0B", background: "#0F0F0F", foreground: "#FFFFFF" }, intents: ["newsletter.subscribe", "contact.submit"] },
  creator_portfolio: { palette: { primary: "#6366F1", secondary: "#818CF8", accent: "#F472B6", background: "#0A0A0A", foreground: "#FAFAFA" }, intents: ["contact.submit", "quote.request"] },
  coaching_consulting: { palette: { primary: "#10B981", secondary: "#34D399", accent: "#F59E0B", background: "#0F172A", foreground: "#F8FAFC" }, intents: ["booking.create", "contact.submit", "newsletter.subscribe", "quote.request"] },
  real_estate: { palette: { primary: "#D4AF37", secondary: "#C9B037", accent: "#1E3A5F", background: "#0A0A0A", foreground: "#FFFFFF" }, intents: ["contact.submit", "quote.request", "newsletter.subscribe"] },
  nonprofit: { palette: { primary: "#E11D48", secondary: "#FB7185", accent: "#F59E0B", background: "#FFFFFF", foreground: "#1E293B" }, intents: ["contact.submit", "newsletter.subscribe"] },
};

/**
 * Get template reference for systems-build from chip selection
 */
function getTemplateReference(chipId: string): { templateId: string; templateHtml: string; systemType: BusinessSystemType } | null {
  const systemType = CHIP_TO_SYSTEM[chipId];
  const category = CHIP_TO_CATEGORY[chipId];
  if (!systemType || !category) return null;
  
  const templates = getTemplatesByCategory(category);
  if (!templates.length) return null;
  
  const bestTemplate = templates[0];
  if (!bestTemplate.code || bestTemplate.code.length < 100) return null;
  
  return {
    templateId: bestTemplate.id,
    templateHtml: bestTemplate.code,
    systemType,
  };
}

/**
 * Build a BusinessBlueprint from chip selection and prompt for systems-build
 */
function buildBlueprintFromChip(chipId: string, prompt: string, businessName?: string) {
  const chip = industryChips.find(c => c.id === chipId);
  const industry = CHIP_TO_INDUSTRY[chipId] || "other";
  const defaults = INDUSTRY_DEFAULTS[chipId] || { palette: { primary: "#0EA5E9" }, intents: ["contact.submit"] };

  return {
    version: "1.0",
    identity: {
      industry: industry,
      primary_goal: "Generate leads and grow the business",
    },
    brand: {
      business_name: businessName || chip?.label || "My Business",
      tagline: `Professional ${chip?.label || "business"} services you can trust`,
      tone: "professional and friendly",
      palette: defaults.palette,
      typography: { heading: "Plus Jakarta Sans", body: "Inter" },
    },
    design: {
      layout: { hero_style: "split" as const, section_spacing: "spacious" as const, navigation_style: "fixed" as const },
      effects: { animations: true, scroll_animations: true, hover_effects: true, gradient_backgrounds: true, glassmorphism: true, shadows: "dramatic" as const },
      sections: { include_stats: true, include_testimonials: true, include_faq: true, include_cta_banner: true, include_newsletter: true, include_social_proof: true },
    },
    intents: defaults.intents.map(i => ({ intent: i })),
  };
}

interface ClarifyingQuestion {
  id: string;
  question: string;
  type: "boolean" | "text" | "select";
  default?: unknown;
  options?: string[];
}

type FlowStep = "prompt" | "building" | "complete";

interface BusinessLauncherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BusinessLauncher({ open, onOpenChange }: BusinessLauncherProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Flow state
  const [step, setStep] = useState<FlowStep>("prompt");
  const [prompt, setPrompt] = useState("");
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Building progress
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildStatus, setBuildStatus] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const resetFlow = useCallback(() => {
    setStep("prompt");
    setPrompt("");
    setSelectedChip(null);
    setBuildProgress(0);
    setBuildStatus("");
    setGeneratedCode(null);
  }, []);

  const handleClose = useCallback(() => {
    resetFlow();
    onOpenChange(false);
  }, [resetFlow, onOpenChange]);

  const handleChipClick = (chipId: string) => {
    setSelectedChip(chipId);
    const chip = industryChips.find(c => c.id === chipId);
    if (chip) {
      setPrompt(prev => prev ? `${prev} (${chip.label})` : `I need a website for my ${chip.label.toLowerCase()} business`);
    }
  };

  /**
   * Extract business name from prompt
   */
  const extractBusinessName = (text: string): string | undefined => {
    const quotedMatch = text.match(/["']([^"']+)["']/);
    const calledMatch = text.match(/called\s+([A-Z][A-Za-z\s&']+)/i);
    const namedMatch = text.match(/(?:named|for)\s+([A-Z][A-Za-z\s&']+)/i);
    return quotedMatch?.[1] || calledMatch?.[1] || namedMatch?.[1];
  };

  /**
   * Main handler - uses systems-build edge function
   */
  const handleBuild = async () => {
    if (!prompt.trim() && !selectedChip) {
      toast({ title: "Please describe your business or select a category", variant: "destructive" });
      return;
    }

    setStep("building");
    setBuildProgress(0);
    setBuildStatus("Initializing...");
    setIsLoading(true);

    try {
      // Progress: Preparing
      setBuildProgress(10);
      setBuildStatus("Analyzing your business...");
      await new Promise(r => setTimeout(r, 400));

      // Determine chip to use
      const chipId = selectedChip || detectChipFromPrompt(prompt);
      const businessName = extractBusinessName(prompt);
      
      // Build blueprint for systems-build
      const blueprint = chipId 
        ? buildBlueprintFromChip(chipId, prompt, businessName)
        : buildGenericBlueprint(prompt, businessName);
      
      // Get template reference for quality baseline
      const ref = chipId ? getTemplateReference(chipId) : null;

      setBuildProgress(25);
      setBuildStatus("Generating your website...");

      console.log(`[BusinessLauncher] Using systems-build with${ref ? ` template: ${ref.templateId}` : 'out template'}`);

      // Call systems-build edge function
      const { data, error } = await supabase.functions.invoke("systems-build", {
        body: {
          blueprint,
          userPrompt: prompt,
          enhanceWithAI: true,
          templateId: ref?.templateId,
          templateHtml: ref?.templateHtml,
          variantMode: true,
          variationSeed: `v${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        },
      });

      if (error) {
        const msg = error.message || '';
        if (msg.includes('429')) {
          toast({ title: "Rate limit exceeded", description: "Please wait a moment before trying again.", variant: "destructive" });
          setStep("prompt");
          return;
        }
        if (msg.includes('402')) {
          toast({ title: "Credits required", description: "Please add credits to continue.", variant: "destructive" });
          setStep("prompt");
          return;
        }
        throw error;
      }

      setBuildProgress(70);
      setBuildStatus("Finalizing pages...");
      await new Promise(r => setTimeout(r, 300));

      const code = data?.code || "";
      if (!code || code.length < 50) {
        throw new Error("Failed to generate website code");
      }

      setGeneratedCode(code);
      
      setBuildProgress(90);
      setBuildStatus("Preparing builder...");
      await new Promise(r => setTimeout(r, 300));

      setBuildProgress(100);
      setBuildStatus("Complete!");
      setStep("complete");

    } catch (error) {
      console.error("Build error:", error);
      toast({ title: "Failed to generate website", description: "Please try again", variant: "destructive" });
      setStep("prompt");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Detect best chip from prompt text
   */
  const detectChipFromPrompt = (text: string): string | null => {
    const lower = text.toLowerCase();
    if (/salon|spa|hair|barber|nail|beauty|massage/.test(lower)) return "salon_spa";
    if (/restaurant|cafe|coffee|bakery|pizza|food/.test(lower)) return "restaurant";
    if (/shop|store|sell|ecommerce|retail|boutique/.test(lower)) return "ecommerce";
    if (/coach|consult|mentor|trainer/.test(lower)) return "coaching_consulting";
    if (/portfolio|creative|designer|photographer|artist/.test(lower)) return "creator_portfolio";
    if (/real estate|realtor|property/.test(lower)) return "real_estate";
    if (/nonprofit|charity|foundation|donate/.test(lower)) return "nonprofit";
    if (/plumb|electric|hvac|clean|repair|contractor|service/.test(lower)) return "local_service";
    return null;
  };

  /**
   * Build generic blueprint for free-form prompts
   */
  const buildGenericBlueprint = (text: string, businessName?: string) => {
    return {
      version: "1.0",
      identity: {
        industry: "other",
        primary_goal: "Generate leads and grow the business",
      },
      brand: {
        business_name: businessName || "My Business",
        tagline: "Professional services you can trust",
        tone: "professional and friendly",
        palette: { primary: "#0EA5E9", secondary: "#22D3EE", accent: "#F59E0B", background: "#0F172A", foreground: "#F8FAFC" },
        typography: { heading: "Plus Jakarta Sans", body: "Inter" },
      },
      design: {
        layout: { hero_style: "split" as const, section_spacing: "spacious" as const, navigation_style: "fixed" as const },
        effects: { animations: true, scroll_animations: true, hover_effects: true, gradient_backgrounds: true, glassmorphism: true, shadows: "dramatic" as const },
        sections: { include_stats: true, include_testimonials: true, include_faq: true, include_cta_banner: true, include_newsletter: true },
      },
      intents: [{ intent: "contact.submit" }, { intent: "quote.request" }],
    };
  };

  const handleOpenBuilder = async () => {
    if (generatedCode) {
      // Parse multi-page output if present
      const { hasMultiPageMarkers, parseMultiPageOutput, generateMultiPageVFS } = await import('@/utils/redirectPageGenerator');
      let vfsFiles: Record<string, string> | undefined;
      
      if (hasMultiPageMarkers(generatedCode)) {
        const parsed = parseMultiPageOutput(generatedCode);
        vfsFiles = generateMultiPageVFS(parsed);
      }
      
      sessionStorage.setItem('ai_assistant_generated_code', generatedCode);
      navigate("/web-builder", {
        state: {
          generatedCode: vfsFiles ? undefined : generatedCode,
          vfsFiles: vfsFiles,
          templateName: `AI ${selectedChip ? industryChips.find(c => c.id === selectedChip)?.label : "Generated"}`,
          aesthetic: "modern",
          startInPreview: true,
        },
      });
      handleClose();
    }
  };

  const renderPromptStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Describe your business</h2>
        <p className="text-muted-foreground">Tell us about your business and we'll build a working system for you.</p>
      </div>
      
      <div className="relative">
        <Input
          placeholder="e.g., Mobile car detailing in Chicago. I want booking and quotes."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isLoading && handleBuild()}
          className="pr-12 py-6 text-lg"
        />
        <Button 
          size="icon" 
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={handleBuild}
          disabled={isLoading || (!prompt.trim() && !selectedChip)}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground text-center">Or choose a category:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {industryChips.map((chip) => {
            const Icon = chip.icon;
            return (
              <button
                key={chip.id}
                onClick={() => handleChipClick(chip.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full border transition-all",
                  selectedChip === chip.id 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-background hover:bg-muted border-border hover:border-primary/50"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{chip.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderBuildingStep = () => (
    <div className="space-y-6 text-center py-8">
      <div className="relative w-20 h-20 mx-auto">
        <div className="absolute inset-0 rounded-full border-4 border-muted" />
        <div 
          className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"
          style={{ animationDuration: '1s' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-2">Building your system</h2>
        <p className="text-muted-foreground">{buildStatus}</p>
      </div>
      
      <Progress value={buildProgress} className="w-full" />
      
      <div className="text-sm text-muted-foreground space-y-1">
        {buildProgress >= 15 && <p className="flex items-center justify-center gap-2"><Check className="h-4 w-4 text-green-500" /> Business created</p>}
        {buildProgress >= 30 && <p className="flex items-center justify-center gap-2"><Check className="h-4 w-4 text-green-500" /> CRM configured</p>}
        {buildProgress >= 50 && <p className="flex items-center justify-center gap-2"><Check className="h-4 w-4 text-green-500" /> Pages generated</p>}
        {buildProgress >= 70 && <p className="flex items-center justify-center gap-2"><Check className="h-4 w-4 text-green-500" /> Buttons wired</p>}
        {buildProgress >= 85 && <p className="flex items-center justify-center gap-2"><Check className="h-4 w-4 text-green-500" /> Automations active</p>}
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6 text-center py-8">
      <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
        <Check className="h-10 w-10 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-2">Your system is ready!</h2>
        <p className="text-muted-foreground">Everything is set up and working. Open the builder to customize your site.</p>
      </div>
      
      <div className="space-y-3">
        <Button className="w-full" size="lg" onClick={handleOpenBuilder}>
          Open in Builder
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        <Button variant="outline" className="w-full" onClick={handleClose}>
          Close
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Launch Your Business</DialogTitle>
          <DialogDescription>Create a working business system in minutes</DialogDescription>
        </DialogHeader>
        
        {step === "prompt" && renderPromptStep()}
        {step === "building" && renderBuildingStep()}
        {step === "complete" && renderCompleteStep()}
      </DialogContent>
    </Dialog>
  );
}

export default BusinessLauncher;
