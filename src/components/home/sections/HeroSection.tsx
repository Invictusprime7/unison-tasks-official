import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AIAssistantCore, type QuickAction } from "@/components/ai/AIAssistantCore";
import { LauncherWizard } from "@/components/onboarding/wizard/LauncherWizard";


interface HeroSectionProps {
  user: User | null;
  onAuthRequired: () => void;
  onSiteConfirmed: (siteBrief: string) => void;
  launcherOpen: boolean;
  launchBrief: string | null;
  onLauncherOpenChange: (open: boolean) => void;
}

const HOME_QUICK_ACTIONS: QuickAction[] = [
  {
    id: "business-site",
    label: "Business website",
    prompt: "Help me create a professional website for my business.",
  },
  {
    id: "booking-site",
    label: "Booking site",
    prompt: "Help me create a website where customers can book my services.",
  },
  {
    id: "online-store",
    label: "Online store",
    prompt: "Help me create an online store to sell my products.",
  },
];

export function HeroSection({ user, onAuthRequired, onSiteConfirmed, launcherOpen, launchBrief, onLauncherOpenChange }: HeroSectionProps) {

  return (
    <section className="relative overflow-hidden">
      <div className="relative container mx-auto px-4 pt-16 pb-12 sm:pt-20 sm:pb-16 md:pt-28 md:pb-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Brand lockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-6"
          >
            <div className="relative mx-auto w-64 sm:w-72 md:w-80">
              <img
                src="/unison-logo-lockup.png"
                alt="Unison — Intent-Driven AI App Builder"
                width={532}
                height={480}
                className="h-auto w-full"
              />
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 532 480"
                focusable="false"
              >
                <style>
                  {`@media (prefers-reduced-motion: reduce) { .unison-logo-orb-motion { display: none; } }`}
                </style>
                <defs>
                  <radialGradient id="unison-logo-orb-gradient">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="42%" stopColor="#bffaff" />
                    <stop offset="100%" stopColor="#21baff" />
                  </radialGradient>
                  <filter id="unison-logo-orb-glow" x="-150%" y="-150%" width="400%" height="400%">
                    <feGaussianBlur stdDeviation="6" result="glow" />
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <circle
                  className="unison-logo-orb-motion"
                  r="14"
                  fill="url(#unison-logo-orb-gradient)"
                  filter="url(#unison-logo-orb-glow)"
                >
                  <animateMotion
                    dur="7s"
                    repeatCount="indefinite"
                    path="M 163 32 L 163 236 C 163 286 202 313 266 313 C 330 313 369 286 369 236 L 369 32 C 369 -12 163 -12 163 32"
                  />
                </circle>
              </svg>
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Badge className={cn(
              "mb-5 bg-primary/10 text-primary border border-primary/25 text-xs font-medium px-4 py-1.5",
              ""
            )}>
              <Sparkles className="h-3 w-3 mr-1.5" />
              AI-powered wizard · CRM + automation included
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight tracking-normal text-foreground font-display"
          >
            Your business,{" "}
            <span className="text-primary">live in 60 seconds</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Tell Unison what your business needs. We’ll shape a complete site with booking,
            CRM, automations, and a live backend — no dev work required.
          </motion.p>

          {/* Floating AI chat replaces the primary site-building CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="relative mx-auto mb-10 max-w-3xl text-left"
            id="home-ai-chat"
          >
            <div className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>What would you like to build?</span>
            </div>
            <AIAssistantCore
              appearance="unison"
              className={cn("transition-[height] duration-500 motion-reduce:transition-none", launcherOpen ? "h-[min(740px,85dvh)]" : "h-[250px] sm:h-[270px]")}
              placeholder="Tell Unison about your idea..."
              quickActions={HOME_QUICK_ACTIONS}
              aiMode="site-discovery"
              onSiteConfirmed={onSiteConfirmed}
              selectionActive={launcherOpen}
              conversationContent={launcherOpen ? <LauncherWizard
                open
                presentation="chat"
                initialVisionPrompt={launchBrief}
                onOpenChange={onLauncherOpenChange}
              /> : undefined}
              onBeforeSend={() => {
                if (user) return true;
                onAuthRequired();
                return false;
              }}
              systemType="website"
              businessName="Unison site planning"
              showFileUpload={false}
              allowClearHistory={false}
              hideHeader
            />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {launcherOpen ? "Refine each choice at your own pace. Create your site when you're ready." : "Describe your idea or choose a starting point above"}
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
