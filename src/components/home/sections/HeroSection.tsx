import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AIAssistantCore, type QuickAction } from "@/components/ai/AIAssistantCore";


interface HeroSectionProps {
  user: User | null;
  onAuthRequired: () => void;
  onSiteConfirmed: (siteBrief: string) => void;
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

export function HeroSection({ user, onAuthRequired, onSiteConfirmed }: HeroSectionProps) {

  return (
    <section className="relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-cyan-500/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-fuchsia-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-lime-500/6 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 pt-16 pb-12 sm:pt-20 sm:pb-16 md:pt-28 md:pb-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Brand lockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-6"
          >
            <img
              src="/unison-logo-lockup.png"
              alt="Unison — Intent-Driven AI App Builder"
              width={532}
              height={480}
              className="mx-auto h-auto w-64 sm:w-72 md:w-80"
            />
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Badge className={cn(
              "mb-5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 text-xs font-medium px-4 py-1.5",
              "shadow-[0_0_20px_rgba(0,255,255,0.15)]"
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
            className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 leading-snug tracking-normal text-white/60"
          >
            Your business,{" "}
            <span className="text-cyan-400/80">live in 60 seconds</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-base sm:text-lg text-white/50 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Tell Unison what your business needs. We’ll shape a complete site with booking,
            CRM, automations, and a live backend — no dev work required.
          </motion.p>

          {/* Floating AI chat replaces the primary site-building CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="relative mx-auto mb-10 max-w-2xl text-left"
          >
            <div className="pointer-events-none absolute -inset-x-8 inset-y-8 -z-10 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-cyan-100/80">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              <span>What would you like to build?</span>
            </div>
            <AIAssistantCore
              appearance="unison"
              className="h-[250px] sm:h-[270px]"
              placeholder="Tell Unison about your idea..."
              quickActions={HOME_QUICK_ACTIONS}
              aiMode="site-discovery"
              onSiteConfirmed={onSiteConfirmed}
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
            <p className="mt-2 text-center text-xs text-white/40">
              Describe your idea or choose a starting point above
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
