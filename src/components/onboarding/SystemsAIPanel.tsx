/**
 * SystemsAIPanel - Inline homepage component for Systems AI flow
 * 
 * Shows the "Describe your business → Get a working system" flow
 * directly on the homepage for better visibility and engagement.
 * 
 * Uses AI-powered edge functions for intelligent classification and
 * blueprint generation when LOVABLE_API_KEY is configured.
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { classifyPrompt, compileBlueprint, provisionProject, buildWebsite, type BusinessBlueprint } from "@/services/systemsAI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  ArrowRight,
  Check, 
  X,
  Loader2,
  FileText,
  Zap,
  Settings,
  Building2,
  Scissors,
  Utensils,
  ShoppingBag,
  Palette,
  Users,
  Home,
  Heart,
  Wrench,
  Send,
  ChevronRight,
  Rocket,
  LayoutGrid,
  Mail,
  Bot,
  Cpu
} from "lucide-react";
import { User } from "@supabase/supabase-js";

// Industry chip configurations with icons
const industryChips = [
  { id: "local_service", label: "Local Service", icon: Wrench, color: "bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20" },
  { id: "salon_spa", label: "Salon & Spa", icon: Scissors, color: "bg-pink-500/10 text-pink-600 border-pink-200 hover:bg-pink-500/20" },
  { id: "restaurant", label: "Restaurant", icon: Utensils, color: "bg-orange-500/10 text-orange-600 border-orange-200 hover:bg-orange-500/20" },
  { id: "ecommerce", label: "E-commerce", icon: ShoppingBag, color: "bg-purple-500/10 text-purple-600 border-purple-200 hover:bg-purple-500/20" },
  { id: "creator_portfolio", label: "Creator", icon: Palette, color: "bg-indigo-500/10 text-indigo-600 border-indigo-200 hover:bg-indigo-500/20" },
  { id: "coaching_consulting", label: "Coaching", icon: Users, color: "bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20" },
  { id: "real_estate", label: "Real Estate", icon: Home, color: "bg-cyan-500/10 text-cyan-600 border-cyan-200 hover:bg-cyan-500/20" },
  { id: "nonprofit", label: "Nonprofit", icon: Heart, color: "bg-rose-500/10 text-rose-600 border-rose-200 hover:bg-rose-500/20" },
];

interface ClarifyingQuestion {
  id: string;
  question: string;
  type: "boolean" | "text" | "select";
  default?: unknown;
  options?: string[];
}

interface ClassifyResponse {
  industry: string;
  business_model: string;
  confidence: number;
  clarifying_questions: ClarifyingQuestion[];
  extracted?: {
    business_name?: string;
    location?: string;
    services?: string[];
  };
}

interface PreviewSummary {
  pages: string[];
  intents: string[];
  automations: string[];
}

interface CompileResponse {
  blueprint: unknown;
  preview_summary: PreviewSummary;
}

type FlowStep = "input" | "clarify" | "preview" | "building" | "complete";

interface SystemsAIPanelProps {
  user: User | null;
  onAuthRequired?: () => void;
}

export function SystemsAIPanel({ user, onAuthRequired }: SystemsAIPanelProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Flow state
  const [step, setStep] = useState<FlowStep>("input");
  const [prompt, setPrompt] = useState("");
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usedAI, setUsedAI] = useState(false);
  
  // Classify response
  const [classifyResult, setClassifyResult] = useState<ClassifyResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  
  // Compile response
  const [blueprint, setBlueprint] = useState<unknown>(null);
  const [previewSummary, setPreviewSummary] = useState<PreviewSummary | null>(null);
  
  // Building progress
  const [buildProgress, setBuildProgress] = useState(0);
  const [projectId, setProjectId] = useState<string | null>(null);

  const resetFlow = useCallback(() => {
    setStep("input");
    setPrompt("");
    setSelectedChip(null);
    setClassifyResult(null);
    setAnswers({});
    setBlueprint(null);
    setPreviewSummary(null);
    setBuildProgress(0);
    setProjectId(null);
    setUsedAI(false);
  }, []);

  const handleChipClick = (chipId: string) => {
    const chip = industryChips.find(c => c.id === chipId);
    if (chip) {
      setSelectedChip(chipId);
      // Pre-fill prompt with industry suggestion
      const prompts: Record<string, string> = {
        local_service: "I run a mobile car detailing business in Chicago. I need online booking and quote requests.",
        salon_spa: "I own a hair salon. I need appointment booking, service menu, and client reminders.",
        restaurant: "I have a pizza restaurant. I need online ordering, menu display, and table reservations.",
        ecommerce: "I sell handmade jewelry online. I need a product catalog and shopping cart.",
        creator_portfolio: "I'm a freelance photographer. I need a portfolio site with contact form and booking.",
        coaching_consulting: "I'm a business coach. I need consultation booking and lead capture.",
        real_estate: "I'm a real estate agent. I need property listings and viewing scheduling.",
        nonprofit: "We're a local charity. I need donation forms and volunteer signup.",
      };
      setPrompt(prompts[chipId] || `I need a website for my ${chip.label.toLowerCase()} business`);
    }
  };

  const simulateClassify = (promptText: string): ClassifyResponse => {
    const lowerPrompt = promptText.toLowerCase();
    let industry = "other";
    
    if (/salon|spa|hair|nail|beauty|massage/.test(lowerPrompt)) industry = "salon_spa";
    else if (/restaurant|cafe|food|pizza|catering/.test(lowerPrompt)) industry = "restaurant";
    else if (/shop|store|sell|product|ecommerce/.test(lowerPrompt)) industry = "ecommerce";
    else if (/portfolio|photographer|designer|freelance/.test(lowerPrompt)) industry = "creator_portfolio";
    else if (/coach|consult|mentor|trainer/.test(lowerPrompt)) industry = "coaching_consulting";
    else if (/real estate|property|agent|realtor/.test(lowerPrompt)) industry = "real_estate";
    else if (/nonprofit|charity|donate|volunteer/.test(lowerPrompt)) industry = "nonprofit";
    else if (/plumb|electric|cleaning|repair|detailing|hvac/.test(lowerPrompt)) industry = "local_service";

    const businessNameMatch = promptText.match(/(?:called|named|run|own)\s+["']?([A-Z][A-Za-z\s&']+)/i);
    
    return {
      industry,
      business_model: "appointment_service",
      confidence: 0.85,
      clarifying_questions: [
        { id: "booking_required", question: "Do you need online booking?", type: "boolean", default: true },
        { id: "payments_required", question: "Will you accept payments online?", type: "boolean", default: false },
      ],
      extracted: {
        business_name: businessNameMatch?.[1] || "My Business",
      },
    };
  };

  const simulateCompile = (promptText: string, classify: ClassifyResponse | null, answersData: Record<string, unknown>) => {
    const industry = classify?.industry || "other";
    const businessName = classify?.extracted?.business_name || "My Business";
    
    let pagesList = ["Home", "Services", "About", "Contact"];
    let intentsList = ["lead.capture", "contact.submit"];
    const automationsList = ["Lead Follow-up"];
    
    if (answersData.booking_required) {
      pagesList.splice(2, 0, "Book Now");
      intentsList.push("booking.create");
      automationsList.push("Booking Confirmation", "Appointment Reminder");
    }
    
    if (answersData.payments_required) {
      intentsList.push("shop.checkout");
      automationsList.push("Payment Confirmation");
    }
    
    if (industry === "salon_spa") {
      pagesList = ["Home", "Services", "Pricing", "Book Appointment", "Contact"];
      intentsList = ["lead.capture", "booking.create", "call.now"];
    } else if (industry === "restaurant") {
      pagesList = ["Home", "Menu", "Reservations", "Contact"];
      intentsList = ["booking.create", "call.now"];
    } else if (industry === "ecommerce") {
      pagesList = ["Home", "Shop", "Cart", "About", "Contact"];
      intentsList = ["shop.add_to_cart", "shop.checkout", "newsletter.subscribe"];
    }

    // Industry-specific color palettes
    const palettes: Record<string, { primary: string; secondary: string; accent: string }> = {
      local_service: { primary: "#0EA5E9", secondary: "#22D3EE", accent: "#F59E0B" },
      restaurant: { primary: "#DC2626", secondary: "#F97316", accent: "#FCD34D" },
      salon_spa: { primary: "#D946EF", secondary: "#EC4899", accent: "#F9A8D4" },
      ecommerce: { primary: "#8B5CF6", secondary: "#6366F1", accent: "#F59E0B" },
      creator_portfolio: { primary: "#1E293B", secondary: "#475569", accent: "#F59E0B" },
      coaching_consulting: { primary: "#059669", secondary: "#10B981", accent: "#34D399" },
      real_estate: { primary: "#1E40AF", secondary: "#3B82F6", accent: "#FCD34D" },
      nonprofit: { primary: "#16A34A", secondary: "#4ADE80", accent: "#FCD34D" },
      other: { primary: "#6366F1", secondary: "#8B5CF6", accent: "#F59E0B" },
    };

    const palette = palettes[industry] || palettes.other;
    
    // Map page titles to valid page types
    const pageTypeMap: Record<string, BusinessBlueprint["site"]["pages"][0]["type"]> = {
      "Home": "home",
      "Services": "services",
      "About": "about",
      "Contact": "contact",
      "Book Now": "booking",
      "Book Appointment": "booking",
      "Pricing": "pricing",
      "Menu": "menu",
      "Reservations": "booking",
      "Shop": "shop",
      "Cart": "cart",
    };
    
    // Generate full blueprint structure
    const blueprint: BusinessBlueprint = {
      version: "1.0.0",
      identity: {
        industry: industry as BusinessBlueprint["identity"]["industry"],
        business_model: classify?.business_model || "lead_generation",
        primary_goal: answersData.booking_required ? "get_bookings" : "get_leads",
        locale: "en-US",
      },
      brand: {
        business_name: businessName,
        tagline: `Professional ${industry.replace(/_/g, " ")} services`,
        tone: "friendly",
        palette: {
          primary: palette.primary,
          secondary: palette.secondary,
          accent: palette.accent,
          background: "#FFFFFF",
          foreground: "#1E293B",
        },
        typography: {
          heading: "Inter",
          body: "Inter",
        },
        logo: {
          mode: "text",
          text_lockup: businessName,
        },
      },
      design: {
        layout: {
          hero_style: industry === "creator_portfolio" ? "centered" : "split",
          section_spacing: "normal",
          max_width: "normal",
          navigation_style: "fixed",
        },
        effects: {
          animations: true,
          scroll_animations: true,
          hover_effects: true,
          gradient_backgrounds: true,
          glassmorphism: industry === "salon_spa",
          shadows: "normal",
        },
        images: {
          style: industry === "real_estate" ? "sharp" : "rounded",
          aspect_ratio: "auto",
          placeholder_service: "unsplash",
          overlay_style: "gradient",
        },
        buttons: {
          style: industry === "ecommerce" ? "rounded" : "pill",
          size: "medium",
          hover_effect: "scale",
        },
        sections: {
          include_stats: true,
          include_testimonials: true,
          include_faq: true,
          include_cta_banner: true,
          include_newsletter: industry !== "restaurant",
          include_social_proof: true,
          use_counter_animations: true,
        },
        content: {
          density: industry === "ecommerce" ? "rich" : "balanced",
          use_icons: true,
          use_emojis: false,
          writing_style: industry === "coaching_consulting" ? "professional" : "conversational",
        },
      },
      site: {
        pages: pagesList.map((title, idx) => ({
          id: `page_${idx}`,
          type: pageTypeMap[title] || "home",
          title,
          path: idx === 0 ? "/" : `/${title.toLowerCase().replace(/\s+/g, "-")}`,
          sections: idx === 0 ? [
            { id: "hero", type: "hero", props: { headline: businessName, subheadline: `Professional ${industry.replace(/_/g, " ")} services` } },
            { id: "features", type: "features", props: { title: "Why Choose Us" } },
            { id: "cta", type: "cta", props: { title: "Ready to Get Started?" } },
          ] : [
            { id: "header", type: "page_header", props: { title } },
          ],
          required_capabilities: [] as string[],
        })),
        navigation: pagesList.map((title, idx) => ({
          label: title,
          path: idx === 0 ? "/" : `/${title.toLowerCase().replace(/\s+/g, "-")}`,
        })),
      },
      intents: intentsList.map(intent => ({
        intent: intent as BusinessBlueprint["intents"][0]["intent"],
        target: { kind: "edge_function", ref: intent.includes("booking") ? "create-booking" : "create-lead" },
        payload_schema: [
          { key: "name", label: "Name", type: "text", required: true },
          { key: "email", label: "Email", type: "email", required: true },
        ],
      })),
      crm: {
        objects: [{ name: "leads", fields: [{ key: "name", type: "text", required: true }] }],
        pipelines: [{ pipeline_id: "default", label: "Pipeline", stages: [{ id: "new", label: "New", order: 0 }] }],
      },
      automations: {
        provision_mode: "shadow_automations",
        rules: automationsList.map((name, idx) => ({
          id: `rule_${idx}`,
          name,
          trigger: "on.lead_created",
          conditions: [],
          actions: [{ type: "notify.email", params: { template: "notification" } }],
          enabled_by_default: true,
        })),
      },
      guarantees: {
        buttons_wired: true,
        automations_ready: true,
        forms_connected_to_crm: true,
      },
      file_plan: {
        files: [],
      },
    };
    
    return {
      blueprint,
      preview_summary: { pages: pagesList, intents: intentsList, automations: automationsList },
    };
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast({ title: "Please describe your business", variant: "destructive" });
      return;
    }

    // Require auth before proceeding
    if (!user) {
      onAuthRequired?.();
      toast({ title: "Please sign in to continue", description: "We'll save your progress" });
      return;
    }

    setIsLoading(true);
    
    try {
      let result: ClassifyResponse | null = null;
      let aiUsed = false;
      
      // Try edge function first if Supabase is configured
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await classifyPrompt(prompt, { locale: "en-US" });
          
          if (!error && data) {
            // Check if AI was used (from response metadata)
            const meta = (data as ClassifyResponse & { _meta?: { classification_method?: string } })._meta;
            aiUsed = meta?.classification_method === "ai";
            result = data;
          }
        } catch (err) {
          console.warn("Edge function failed, falling back to local:", err);
        }
      }
      
      // Fall back to local simulation if edge function failed or not configured
      if (!result) {
        result = simulateClassify(prompt);
        aiUsed = false;
      }
      
      setUsedAI(aiUsed);
      setClassifyResult(result);
      
      // Build default answers from clarifying questions
      const defaultAnswers: Record<string, unknown> = {};
      result.clarifying_questions.forEach(q => {
        if (q.default !== undefined) defaultAnswers[q.id] = q.default;
      });
      setAnswers(defaultAnswers);
      
      // If confidence is high or no questions, skip to compile
      if (result.confidence > 0.9 || result.clarifying_questions.length === 0) {
        await handleCompile(result, defaultAnswers);
      } else {
        setStep("clarify");
      }
    } catch (error) {
      console.error("Classification error:", error);
      toast({ title: "Failed to analyze", description: "Please try again", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompile = async (classifyData?: ClassifyResponse, answerData?: Record<string, unknown>) => {
    setIsLoading(true);
    
    const finalClassify = classifyData || classifyResult;
    const finalAnswers = answerData || answers;
    
    try {
      let compileResult: CompileResponse | null = null;
      
      // Try edge function first if Supabase is configured
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await compileBlueprint(prompt, finalAnswers);
          
          if (!error && data) {
            // Check if AI enhancements were applied
            const meta = (data as CompileResponse & { _meta?: { ai_enhanced?: boolean } })._meta;
            if (meta?.ai_enhanced) {
              setUsedAI(true);
            }
            compileResult = data;
          }
        } catch (err) {
          console.warn("Compile edge function failed, falling back to local:", err);
        }
      }
      
      // Fall back to local simulation
      if (!compileResult) {
        const mockCompile = simulateCompile(prompt, finalClassify, finalAnswers);
        compileResult = mockCompile;
      }
      
      setBlueprint(compileResult.blueprint);
      setPreviewSummary(compileResult.preview_summary);
      setStep("preview");
    } catch (error) {
      console.error("Compile error:", error);
      toast({ title: "Failed to generate", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Generate HTML from blueprint for direct WebBuilder loading
   */
  const generateHTMLFromBlueprint = (bp: BusinessBlueprint): string => {
    const brand = bp.brand;
    const identity = bp.identity;
    const pages = bp.site?.pages || [];
    const homePage = pages.find(p => p.type === "home") || pages[0];
    
    // Generate sections HTML
    const sectionsHtml = (homePage?.sections || []).map(section => {
      switch (section.type) {
        case "hero":
          return `
    <!-- Hero Section -->
    <section class="relative py-20 px-4 bg-gradient-to-br from-[${brand.palette?.primary || '#0EA5E9'}]/10 to-[${brand.palette?.secondary || '#22D3EE'}]/10">
      <div class="max-w-6xl mx-auto text-center">
        <h1 class="text-4xl md:text-6xl font-bold mb-6 text-gray-900">${section.props?.headline || brand.business_name}</h1>
        <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">${section.props?.subheadline || brand.tagline || "Welcome to our business"}</p>
        <div class="flex gap-4 justify-center flex-wrap">
          <button data-ut-intent="booking.create" class="px-8 py-3 bg-[${brand.palette?.primary || '#0EA5E9'}] text-white rounded-lg font-semibold hover:opacity-90 transition shadow-lg">
            ${section.props?.buttonText || "Book Now"}
          </button>
          <button data-ut-intent="lead.capture" class="px-8 py-3 border-2 border-[${brand.palette?.primary || '#0EA5E9'}] text-[${brand.palette?.primary || '#0EA5E9'}] rounded-lg font-semibold hover:bg-[${brand.palette?.primary || '#0EA5E9'}]/10 transition">
            Get Quote
          </button>
        </div>
      </div>
    </section>`;
        
        case "features":
          return `
    <!-- Features Section -->
    <section class="py-16 px-4 bg-white">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-12">${section.props?.title || "Why Choose Us"}</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center p-6 rounded-xl bg-gray-50 hover:shadow-lg transition">
            <div class="w-16 h-16 mx-auto mb-4 bg-[${brand.palette?.primary || '#0EA5E9'}]/10 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-[${brand.palette?.primary || '#0EA5E9'}]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Quality Service</h3>
            <p class="text-gray-600">We deliver excellence in everything we do.</p>
          </div>
          <div class="text-center p-6 rounded-xl bg-gray-50 hover:shadow-lg transition">
            <div class="w-16 h-16 mx-auto mb-4 bg-[${brand.palette?.primary || '#0EA5E9'}]/10 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-[${brand.palette?.primary || '#0EA5E9'}]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Fast Response</h3>
            <p class="text-gray-600">Quick turnaround on all requests.</p>
          </div>
          <div class="text-center p-6 rounded-xl bg-gray-50 hover:shadow-lg transition">
            <div class="w-16 h-16 mx-auto mb-4 bg-[${brand.palette?.primary || '#0EA5E9'}]/10 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-[${brand.palette?.primary || '#0EA5E9'}]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Expert Team</h3>
            <p class="text-gray-600">Skilled professionals at your service.</p>
          </div>
        </div>
      </div>
    </section>`;
        
        case "cta":
          return `
    <!-- CTA Section -->
    <section class="py-16 px-4 bg-[${brand.palette?.primary || '#0EA5E9'}]">
      <div class="max-w-4xl mx-auto text-center text-white">
        <h2 class="text-3xl font-bold mb-4">${section.props?.title || "Ready to Get Started?"}</h2>
        <p class="text-lg mb-8 opacity-90">Get in touch today and let us help you achieve your goals.</p>
        <button data-ut-intent="contact.submit" class="px-8 py-3 bg-white text-[${brand.palette?.primary || '#0EA5E9'}] rounded-lg font-semibold hover:opacity-90 transition shadow-lg">
          ${section.props?.buttonText || "Contact Us"}
        </button>
      </div>
    </section>`;
        
        case "services_grid":
          return `
    <!-- Services Section -->
    <section class="py-16 px-4 bg-white">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="p-6 border rounded-xl hover:shadow-lg transition">
            <h3 class="text-xl font-semibold mb-2">Service 1</h3>
            <p class="text-gray-600 mb-4">Professional service tailored to your needs.</p>
            <button data-ut-intent="lead.capture" class="text-[${brand.palette?.primary || '#0EA5E9'}] font-medium hover:underline">Learn More →</button>
          </div>
          <div class="p-6 border rounded-xl hover:shadow-lg transition">
            <h3 class="text-xl font-semibold mb-2">Service 2</h3>
            <p class="text-gray-600 mb-4">Quality solutions for every requirement.</p>
            <button data-ut-intent="lead.capture" class="text-[${brand.palette?.primary || '#0EA5E9'}] font-medium hover:underline">Learn More →</button>
          </div>
          <div class="p-6 border rounded-xl hover:shadow-lg transition">
            <h3 class="text-xl font-semibold mb-2">Service 3</h3>
            <p class="text-gray-600 mb-4">Expert assistance when you need it.</p>
            <button data-ut-intent="lead.capture" class="text-[${brand.palette?.primary || '#0EA5E9'}] font-medium hover:underline">Learn More →</button>
          </div>
        </div>
      </div>
    </section>`;

        case "contact_form":
          return `
    <!-- Contact Section -->
    <section class="py-16 px-4 bg-gray-50">
      <div class="max-w-2xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-8">Contact Us</h2>
        <form class="space-y-4" data-ut-form="contact.submit">
          <div class="grid md:grid-cols-2 gap-4">
            <input type="text" name="name" placeholder="Your Name" required class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[${brand.palette?.primary || '#0EA5E9'}] outline-none" />
            <input type="email" name="email" placeholder="Email Address" required class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[${brand.palette?.primary || '#0EA5E9'}] outline-none" />
          </div>
          <input type="tel" name="phone" placeholder="Phone Number" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[${brand.palette?.primary || '#0EA5E9'}] outline-none" />
          <textarea name="message" placeholder="Your Message" rows="4" required class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[${brand.palette?.primary || '#0EA5E9'}] outline-none"></textarea>
          <button type="submit" class="w-full px-8 py-3 bg-[${brand.palette?.primary || '#0EA5E9'}] text-white rounded-lg font-semibold hover:opacity-90 transition">
            Send Message
          </button>
        </form>
      </div>
    </section>`;
        
        default:
          return `
    <!-- ${section.type} Section -->
    <section class="py-16 px-4">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-8">${section.props?.title || section.type}</h2>
      </div>
    </section>`;
      }
    }).join('\n');

    // Generate footer with navigation
    const navLinks = (bp.site?.navigation || pages.map(p => ({ label: p.title, path: p.path })))
      .map(nav => `<a href="${nav.path}" class="hover:text-[${brand.palette?.primary || '#0EA5E9'}] transition">${nav.label}</a>`)
      .join('\n              ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${brand.business_name} - ${brand.tagline || identity.industry}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        html { scroll-behavior: smooth; }
    </style>
</head>
<body class="bg-white text-gray-900">
    <!-- Navigation -->
    <nav class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" class="text-xl font-bold text-[${brand.palette?.primary || '#0EA5E9'}]">${brand.business_name}</a>
        <div class="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          ${navLinks}
        </div>
        <button data-ut-intent="booking.create" class="px-4 py-2 bg-[${brand.palette?.primary || '#0EA5E9'}] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition">
          Book Now
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main>
${sectionsHtml || `
    <!-- Hero Section (Default) -->
    <section class="relative py-20 px-4 bg-gradient-to-br from-[${brand.palette?.primary || '#0EA5E9'}]/10 to-[${brand.palette?.secondary || '#22D3EE'}]/10">
      <div class="max-w-6xl mx-auto text-center">
        <h1 class="text-4xl md:text-6xl font-bold mb-6 text-gray-900">${brand.business_name}</h1>
        <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">${brand.tagline || "Welcome to our business"}</p>
        <div class="flex gap-4 justify-center flex-wrap">
          <button data-ut-intent="booking.create" class="px-8 py-3 bg-[${brand.palette?.primary || '#0EA5E9'}] text-white rounded-lg font-semibold hover:opacity-90 transition shadow-lg">Book Now</button>
          <button data-ut-intent="lead.capture" class="px-8 py-3 border-2 border-[${brand.palette?.primary || '#0EA5E9'}] text-[${brand.palette?.primary || '#0EA5E9'}] rounded-lg font-semibold hover:bg-[${brand.palette?.primary || '#0EA5E9'}]/10 transition">Get Quote</button>
        </div>
      </div>
    </section>
`}
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12 px-4">
      <div class="max-w-6xl mx-auto">
        <div class="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 class="text-xl font-bold mb-4">${brand.business_name}</h3>
            <p class="text-gray-400">${brand.tagline || "Quality service you can trust."}</p>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Quick Links</h4>
            <div class="flex flex-col gap-2 text-gray-400">
              ${navLinks}
            </div>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Contact</h4>
            <p class="text-gray-400">Get in touch with us today.</p>
            <button data-ut-intent="contact.submit" class="mt-4 px-4 py-2 bg-[${brand.palette?.primary || '#0EA5E9'}] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition">
              Contact Us
            </button>
          </div>
        </div>
        <div class="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          <p>© ${new Date().getFullYear()} ${brand.business_name}. All rights reserved.</p>
        </div>
      </div>
    </footer>

    <!-- Unison Tasks Intent Router -->
    <script>
      document.querySelectorAll('[data-ut-intent]').forEach(el => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          const intent = el.getAttribute('data-ut-intent');
          console.log('[UT Intent]', intent);
          // Intent will be handled by the Unison Tasks runtime
          window.dispatchEvent(new CustomEvent('ut:intent', { detail: { intent } }));
        });
      });
    </script>
</body>
</html>`;
  };

  const handleBuild = async () => {
    setStep("building");
    setBuildProgress(0);
    
    const bp = blueprint as BusinessBlueprint;
    
    const steps = [
      { progress: 15, status: "Analyzing business..." },
      { progress: 30, status: "Generating design system..." },
      { progress: 50, status: "Building pages with AI..." },
      { progress: 70, status: "Wiring buttons & forms..." },
      { progress: 85, status: "Optimizing for mobile..." },
      { progress: 100, status: "Complete!" },
    ];

    try {
      // Start progress animation
      let currentStep = 0;
      const progressInterval = setInterval(() => {
        if (currentStep < steps.length - 1) {
          currentStep++;
          setBuildProgress(steps[currentStep].progress);
        }
      }, 800);

      // Generate website using AI edge function
      const { data: buildResult, error: buildError } = await buildWebsite(bp, prompt);
      
      clearInterval(progressInterval);
      
      let generatedHtml: string;
      
      if (buildError || !buildResult?.code) {
        console.warn("AI build failed, using fallback:", buildError?.message);
        // Fallback to local generation
        generatedHtml = generateHTMLFromBlueprint(bp);
        toast({ 
          title: "Using local generation", 
          description: "AI features unavailable, generated basic template",
        });
      } else {
        generatedHtml = buildResult.code;
        console.log("[SystemsAI] AI-generated website:", buildResult._meta);
      }
      
      setBuildProgress(100);
      
      // Store the generated code for handoff to web builder
      sessionStorage.setItem('systemsai_generated_code', generatedHtml);
      sessionStorage.setItem('systemsai_blueprint', JSON.stringify(bp));
      
      // Try to provision in the backend if configured (optional - won't block)
      let provisionedId: string | null = null;
      if (isSupabaseConfigured && user && blueprint) {
        try {
          const { data: result } = await provisionProject(user.id, bp, {
            create_demo_content: true,
            provision_mode: "shadow_automations",
          });
          provisionedId = result?.project_id || null;
        } catch (err) {
          console.warn("Backend provisioning failed, continuing with local build:", err);
        }
      }
      
      setProjectId(provisionedId || `local_${Date.now()}`);
      setStep("complete");
    } catch (error) {
      console.error("Build error:", error);
      toast({ title: "Build failed", variant: "destructive" });
      setStep("preview");
    }
  };

  const handleOpenBuilder = () => {
    const bp = blueprint as BusinessBlueprint;
    const generatedCode = sessionStorage.getItem('systemsai_generated_code') || generateHTMLFromBlueprint(bp);
    
    // Navigate to web builder with generated code in state
    navigate("/web-builder", {
      state: {
        generatedCode,
        templateName: bp?.brand?.business_name || "My Business",
        aesthetic: bp?.identity?.industry || "business",
        systemType: bp?.identity?.industry,
        systemName: bp?.brand?.business_name,
        blueprint: bp,
      },
    });
  };

  const formatIntent = (intent: string): string => {
    const map: Record<string, string> = {
      "lead.capture": "Get Quote",
      "booking.create": "Book Now",
      "contact.submit": "Contact Us",
      "call.now": "Call Now",
      "newsletter.subscribe": "Subscribe",
      "shop.add_to_cart": "Add to Cart",
      "shop.checkout": "Checkout",
    };
    return map[intent] || intent.replace(/[._]/g, " ");
  };

  // Input Step - The main prompt interface
  if (step === "input") {
    return (
      <section id="systems-ai" className="relative py-16 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                <Bot className="h-4 w-4" />
                <span className="text-sm font-medium">Systems AI</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Describe your business
              </h2>
              <p className="text-lg text-muted-foreground">
                Tell us what you need and we'll build a working system in minutes
              </p>
            </div>

            {/* Main Input Card */}
            <Card className="border-2 shadow-lg bg-card/80 backdrop-blur">
              <CardContent className="p-6">
                {/* Text Input */}
                <div className="relative mb-6">
                  <textarea
                    placeholder="e.g., I run a mobile car detailing business in Chicago. I need online booking, quote requests, and customer notifications."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    className="w-full min-h-[120px] p-4 pr-14 text-lg border-2 rounded-xl resize-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background"
                  />
                  <Button 
                    size="icon"
                    className="absolute right-3 bottom-3 h-10 w-10 rounded-full shadow-lg"
                    onClick={handleSubmit}
                    disabled={isLoading || !prompt.trim()}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                {/* Industry Chips */}
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">Or select your industry:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {industryChips.map((chip) => {
                      const Icon = chip.icon;
                      const isSelected = selectedChip === chip.id;
                      return (
                        <button
                          key={chip.id}
                          onClick={() => handleChipClick(chip.id)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all ${
                            isSelected 
                              ? "bg-primary text-primary-foreground border-primary scale-105 shadow-md" 
                              : chip.color
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{chip.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What you'll get */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-green-500/10 flex items-center justify-center">
                  <LayoutGrid className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm font-medium">Complete pages</p>
                <p className="text-xs text-muted-foreground">Home, Services, Booking...</p>
              </div>
              <div className="p-4">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-sm font-medium">Wired buttons</p>
                <p className="text-xs text-muted-foreground">Book Now, Get Quote...</p>
              </div>
              <div className="p-4">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-sm font-medium">Automations</p>
                <p className="text-xs text-muted-foreground">Notifications, CRM...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Clarify Step - Answer quick questions
  if (step === "clarify") {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 shadow-lg">
              <CardHeader className="text-center pb-2">
                <Badge variant="secondary" className="w-fit mx-auto mb-2">
                  <Building2 className="h-3 w-3 mr-1" />
                  {classifyResult?.extracted?.business_name || "Your Business"}
                </Badge>
                <CardTitle>Quick questions</CardTitle>
                <CardDescription>Help us customize your system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {classifyResult?.clarifying_questions.map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium">{q.question}</p>
                    {q.type === "boolean" && (
                      <div className="flex gap-2">
                        <Button
                          variant={answers[q.id] === true ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: true }))}
                        >
                          <Check className="h-4 w-4 mr-1" /> Yes
                        </Button>
                        <Button
                          variant={answers[q.id] === false ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: false }))}
                        >
                          <X className="h-4 w-4 mr-1" /> No
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={resetFlow} className="flex-1">
                    Start Over
                  </Button>
                  <Button onClick={() => handleCompile()} disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2" />
                    )}
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  // Preview Step - Show what will be built
  if (step === "preview") {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">Your system includes</h2>
                {usedAI && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
                    <Cpu className="h-3 w-3 mr-1" />
                    AI Enhanced
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">Review what we'll build for you</p>
            </div>
            
            <div className="grid gap-4 mb-6">
              {/* Pages */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Pages
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {previewSummary?.pages.map((page) => (
                      <Badge key={page} variant="secondary">{page}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Buttons */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Wired Buttons
                  </CardTitle>
                  <CardDescription className="text-xs">These work automatically</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {previewSummary?.intents.map((intent) => (
                      <Badge key={intent} className="bg-green-500/10 text-green-700 border-green-200">
                        {formatIntent(intent)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Automations */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Settings className="h-4 w-4 text-primary" />
                    Automations
                  </CardTitle>
                  <CardDescription className="text-xs">Running in shadow mode</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {previewSummary?.automations.map((auto) => (
                      <Badge key={auto} className="bg-blue-500/10 text-blue-700 border-blue-200">
                        {auto}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={resetFlow} className="flex-1">
                Start Over
              </Button>
              <Button size="lg" onClick={handleBuild} className="flex-1">
                <Rocket className="h-4 w-4 mr-2" />
                Build My System
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Building Step - Progress animation
  if (step === "building") {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-muted" />
              <div 
                className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"
                style={{ animationDuration: "1s" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Building your system</h2>
            <p className="text-muted-foreground mb-6">This takes about 30 seconds...</p>
            
            <Progress value={buildProgress} className="mb-6" />
            
            <div className="space-y-2 text-sm text-muted-foreground">
              {buildProgress >= 15 && <p className="flex items-center justify-center gap-2"><Check className="h-4 w-4 text-green-500" /> Business created</p>}
              {buildProgress >= 35 && <p className="flex items-center justify-center gap-2"><Check className="h-4 w-4 text-green-500" /> CRM configured</p>}
              {buildProgress >= 55 && <p className="flex items-center justify-center gap-2"><Check className="h-4 w-4 text-green-500" /> Pages generated</p>}
              {buildProgress >= 75 && <p className="flex items-center justify-center gap-2"><Check className="h-4 w-4 text-green-500" /> Buttons wired</p>}
              {buildProgress >= 90 && <p className="flex items-center justify-center gap-2"><Check className="h-4 w-4 text-green-500" /> Automations active</p>}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Complete Step - Success state
  if (step === "complete") {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-12 w-12 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Your system is ready!</h2>
            <p className="text-muted-foreground mb-6">
              Everything is set up and working. Open the builder to customize your site.
            </p>
            
            <div className="space-y-3">
              <Button size="lg" className="w-full" onClick={handleOpenBuilder}>
                Open in Builder
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" className="w-full" onClick={resetFlow}>
                Create Another
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return null;
}

export default SystemsAIPanel;
