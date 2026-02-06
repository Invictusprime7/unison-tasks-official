/**
 * SystemsAIPanel - AI Code Assistant panel for the homepage
 * 
 * Allows users to describe what they want to build and generates
 * production-ready code using the ai-code-assistant edge function.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  Loader2,
  Wrench,
  Scissors,
  Utensils,
  ShoppingBag,
  Palette,
  Users,
  Home,
  Heart,
  Code2
} from "lucide-react";
import { User } from "@supabase/supabase-js";

// Industry/business prompt chips for quick actions
const codePromptChips = [
  { id: "local_service", label: "Local Service", icon: Wrench, color: "bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20", prompt: "Create a professional website for a local service business like plumbing, HVAC, or electrical with service areas, booking form, testimonials, and emergency contact" },
  { id: "salon_spa", label: "Salon & Spa", icon: Scissors, color: "bg-pink-500/10 text-pink-600 border-pink-200 hover:bg-pink-500/20", prompt: "Create an elegant salon or spa website with service menu, appointment booking, stylist profiles, gallery, and gift card section" },
  { id: "restaurant", label: "Restaurant", icon: Utensils, color: "bg-orange-500/10 text-orange-600 border-orange-200 hover:bg-orange-500/20", prompt: "Create a restaurant website with menu display, online ordering, reservation system, location/hours, and photo gallery" },
  { id: "ecommerce", label: "E-commerce", icon: ShoppingBag, color: "bg-purple-500/10 text-purple-600 border-purple-200 hover:bg-purple-500/20", prompt: "Create an e-commerce storefront with product catalog, shopping cart, checkout flow, and customer reviews" },
  { id: "creator", label: "Creator", icon: Palette, color: "bg-indigo-500/10 text-indigo-600 border-indigo-200 hover:bg-indigo-500/20", prompt: "Create a creator portfolio website with project showcase, about section, client testimonials, and contact form" },
  { id: "coaching", label: "Coaching", icon: Users, color: "bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20", prompt: "Create a coaching or consulting website with services offered, booking calendar, client success stories, and free resource downloads" },
  { id: "real_estate", label: "Real Estate", icon: Home, color: "bg-cyan-500/10 text-cyan-600 border-cyan-200 hover:bg-cyan-500/20", prompt: "Create a real estate agent website with property listings, search filters, agent bio, market insights, and contact form" },
  { id: "nonprofit", label: "Nonprofit", icon: Heart, color: "bg-rose-500/10 text-rose-600 border-rose-200 hover:bg-rose-500/20", prompt: "Create a nonprofit organization website with mission statement, donation form, volunteer signup, events calendar, and impact stories" },
];

interface SystemsAIPanelProps {
  user: User | null;
  onAuthRequired?: () => void;
}

export function SystemsAIPanel({ user, onAuthRequired }: SystemsAIPanelProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Code Assistant state
  const [codePrompt, setCodePrompt] = useState("");
  const [selectedCodeChip, setSelectedCodeChip] = useState<string | null>(null);
  const [isCodeLoading, setIsCodeLoading] = useState(false);

  // Handler for code chip click
  const handleCodeChipClick = (chipId: string) => {
    const chip = codePromptChips.find(c => c.id === chipId);
    if (chip) {
      setSelectedCodeChip(chipId);
      setCodePrompt(chip.prompt);
    }
  };

  // Handler for code assistant submit - uses the ai-code-assistant edge function
  const handleCodeSubmit = async () => {
    if (!codePrompt.trim()) {
      toast({ title: "Please describe what you want to build", variant: "destructive" });
      return;
    }

    setIsCodeLoading(true);

    try {
      // Build an enhanced prompt that instructs the AI to create polished, content-rich templates
      // This matches the quality expectations of the in-builder AICodeAssistant
      const selectedChip = codePromptChips.find(c => c.id === selectedCodeChip);
      const industryContext = selectedChip ? `\n\nINDUSTRY CONTEXT: ${selectedChip.label} business` : '';
      
      const enhancedPrompt = `🚀 CREATE A COMPLETE, POLISHED, PRODUCTION-READY MULTI-PAGE WEBSITE

USER REQUEST: ${codePrompt}${industryContext}

📋 CRITICAL REQUIREMENTS - YOU MUST INCLUDE ALL OF THESE:

1. **COMPLETE HTML DOCUMENT** - Start with <!DOCTYPE html> and include full <html>, <head>, <body>
2. **TAILWIND CSS** - Include <script src="https://cdn.tailwindcss.com"></script>
3. **MULTI-SECTION LAYOUT** - Include AT MINIMUM:
   - Navigation header with logo and menu links
   - Hero section with compelling headline, subtext, and CTA button
   - Features/services section with 3-4 feature cards
   - Testimonials or social proof section
   - Contact/CTA section
   - Footer with links and copyright

4. **REAL, COMPELLING CONTENT** - NOT placeholder text:
   - Write actual headlines, descriptions, and body copy
   - Use realistic business names, services, pricing
   - Include real-sounding testimonials with names
   - Add compelling CTAs that match the business type

5. **POLISHED VISUAL DESIGN**:
   - Modern color scheme with gradients
   - Professional typography with proper hierarchy
   - Generous whitespace and padding
   - Hover effects on buttons and cards
   - Smooth transitions and micro-animations
   - Icons using inline SVG or Unicode symbols
   - Responsive design (mobile-first with md: and lg: breakpoints)

6. **INTERACTIVE ELEMENTS**:
   - Working navigation (anchor links to sections)
   - Hover states on all clickable elements
   - Form inputs with proper styling
   - Animated elements (fade-in, slide-in on scroll)

7. **MULTI-PAGE NAVIGATION WIRING** (CRITICAL FOR DYNAMIC PAGES):
   Navigation links MUST use data-ut-intent="nav.goto" with data-ut-path for internal pages:
   
   <a href="/about.html" data-ut-intent="nav.goto" data-ut-path="/about.html">About</a>
   <a href="/services.html" data-ut-intent="nav.goto" data-ut-path="/services.html">Services</a>
   <a href="/contact.html" data-ut-intent="nav.goto" data-ut-path="/contact.html">Contact</a>
   <a href="/checkout.html" data-ut-intent="nav.goto" data-ut-path="/checkout.html">Checkout</a>
   
   When users click these links, the system will AUTOMATICALLY generate those pages!

8. **BACKEND INTENT WIRING** - Add data attributes for working automations:
   - Booking: data-ut-intent="booking.create" data-ut-cta="cta.booking"
   - Contact: data-ut-intent="contact.submit" data-ut-cta="cta.contact"
   - Cart: data-ut-intent="cart.add" data-product-id="..." data-product-name="..."
   - Checkout: data-ut-intent="checkout.start" data-ut-cta="cta.checkout"
   - Auth: data-ut-intent="auth.signup" / data-ut-intent="auth.signin"
   - Newsletter: data-ut-intent="newsletter.subscribe"
   - Quote: data-ut-intent="quote.request"
   
   Also add data-intent for compatibility. These intents WORK automatically!

9. **UI CONTROLS WITHOUT INTENTS** - Add data-no-intent to:
   - Filter buttons, sort dropdowns, tabs
   - Quantity adjusters (+/- buttons)
   - Accordion toggles, carousel controls
   - Any UI that shouldn't trigger backend actions

10. **JAVASCRIPT ENHANCEMENTS** - Include in <script> tag:
    - Smooth scroll for anchor links
    - Scroll animations (IntersectionObserver)
    - Mobile menu toggle
    - Form validation (if applicable)

OUTPUT FORMAT:
- Return ONLY the complete HTML code
- NO markdown, NO explanations, NO comments outside the code
- Start with <!DOCTYPE html>
- Make it look like a real, professional business website
- Include navigation to other pages (About, Services, Contact, etc.) with proper data-ut-intent wiring`;

      // Call the ai-code-assistant edge function with full-control mode
      const { data, error } = await supabase.functions.invoke("ai-code-assistant", {
        body: {
          messages: [
            { role: "user", content: enhancedPrompt }
          ],
          mode: "code",
          templateAction: "full-control", // Give AI creative authority for polished output
          editMode: false,
        },
      });

      if (error) {
        // Handle specific error codes
        if (error.message?.includes('429')) {
          toast({ title: "Rate limit exceeded", description: "Please wait a moment before trying again.", variant: "destructive" });
          return;
        }
        if (error.message?.includes('402')) {
          toast({ title: "Credits required", description: "Please add credits to continue using AI features.", variant: "destructive" });
          return;
        }
        throw error;
      }

      // Extract code from response - ai-code-assistant returns { content: string }
      const content = data?.content || "";
      
      // Extract code block if present - match AICodeAssistant's extraction logic
      // Try to match code blocks with language specifiers first
      let codeMatch = content.match(/```(?:html|jsx|tsx|javascript|js|typescript|ts)\n([\s\S]*?)```/);
      
      // If no match, try without language specifier
      if (!codeMatch) {
        codeMatch = content.match(/```\n([\s\S]*?)```/);
      }
      
      // If still no match, try optional newline (lenient)
      if (!codeMatch) {
        codeMatch = content.match(/```(?:html|jsx|tsx|javascript|js|typescript|ts)?\n?([\s\S]*?)```/);
      }
      
      let generatedCode = codeMatch ? codeMatch[1].trim() : content.trim();
      
      // Clean markdown syntax that sometimes slips through (same as AICodeAssistant)
      if (generatedCode) {
        generatedCode = generatedCode
          // Remove markdown headers (###, ##, #)
          .replace(/^#{1,6}\s+.*$/gm, '')
          // Remove markdown code fences that appear in content
          .replace(/```[\w]*\n?/g, '')
          // Remove markdown arrows/symbols (<<<, >>>, ---)
          .replace(/^[<>-]{3,}.*$/gm, '')
          // Remove standalone markdown symbols
          .replace(/<<<|>>>|---/g, '')
          // Clean up any resulting empty lines (more than 2 consecutive)
          .replace(/\n{3,}/g, '\n\n')
          .trim();
      }

      if (generatedCode) {
        console.log('[SystemsAIPanel] Code extracted, length:', generatedCode.length);
        console.log('[SystemsAIPanel] Code preview:', generatedCode.substring(0, 200));
        
        // Store and navigate to web builder
        sessionStorage.setItem('ai_assistant_generated_code', generatedCode);
        navigate("/web-builder", {
          state: {
            generatedCode,
            templateName: "AI Generated",
            aesthetic: "modern",
            startInPreview: true, // Signal to start in canvas/preview mode
          },
        });
        
        toast({ title: "Code generated!", description: "Opening in Web Builder..." });
      } else {
        toast({ title: "No code generated", description: "Please try a different prompt", variant: "destructive" });
      }
    } catch (error) {
      console.error("Code generation error:", error);
      toast({ title: "Generation failed", description: "Please try again", variant: "destructive" });
    } finally {
      setIsCodeLoading(false);
    }
  };

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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-primary mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI Code Assistant</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Describe what you want to build
            </h2>
            <p className="text-lg text-muted-foreground">
              Tell the AI what you need and get production-ready code in seconds
            </p>
          </div>

          {/* Main Input Card */}
          <Card className="border-2 shadow-lg bg-card/80 backdrop-blur">
            <CardContent className="p-6">
              {/* Text Input */}
              <div className="relative mb-6">
                <textarea
                  placeholder="e.g., Create a modern landing page with a hero section, feature cards, testimonials carousel, and a contact form with email validation."
                  value={codePrompt}
                  onChange={(e) => setCodePrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleCodeSubmit();
                    }
                  }}
                  className="w-full min-h-[120px] p-4 pr-14 text-lg border-2 rounded-xl resize-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background"
                />
                <Button 
                  size="icon"
                  className="absolute right-3 bottom-3 h-10 w-10 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={handleCodeSubmit}
                  disabled={isCodeLoading || !codePrompt.trim()}
                >
                  {isCodeLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                </Button>
              </div>

              {/* Code Prompt Chips */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">Or choose a template type:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {codePromptChips.map((chip) => {
                    const Icon = chip.icon;
                    const isSelected = selectedCodeChip === chip.id;
                    return (
                      <button
                        key={chip.id}
                        onClick={() => handleCodeChipClick(chip.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all ${isSelected ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-600 scale-105 shadow-md" : chip.color}`}
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
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-sm font-medium">AI-powered code</p>
              <p className="text-xs text-muted-foreground">Smart generation</p>
            </div>
            <div className="p-4">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-green-500/10 flex items-center justify-center">
                <Code2 className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm font-medium">Clean HTML/CSS</p>
              <p className="text-xs text-muted-foreground">Tailwind, React...</p>
            </div>
            <div className="p-4">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Palette className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium">Open in builder</p>
              <p className="text-xs text-muted-foreground">Edit & customize</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SystemsAIPanel;
