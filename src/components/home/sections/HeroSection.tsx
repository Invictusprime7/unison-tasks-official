import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowRight } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { SystemsAIPanel } from "@/components/onboarding/SystemsAIPanel";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface HeroSectionProps {
  user: User | null;
  onStartLauncher: () => void;
  onAuthRequired: () => void;
}

export function HeroSection({ user, onStartLauncher, onAuthRequired }: HeroSectionProps) {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" />
      </div>
      <div className="relative container mx-auto px-4 py-8 md:py-12">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
        <Badge className={cn(
          "mb-3 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
          "shadow-[0_0_15px_rgba(255,255,0,0.2)]"
        )}>
          <Zap className="h-3 w-3 mr-1" />
          Installable systems · real backend included
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white leading-tight">
          Launch-ready business systems
          <span className="block text-cyan-400 drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]">that ship with working logic</span>
        </h1>
        <p className="text-base text-gray-400 mb-4 max-w-2xl mx-auto">
          Pick a system, choose a contract-ready starter, and we'll install the backend packs
          (data, workflows, intents) automatically.
        </p>
        
        {/* Systems AI Panel - Inline in hero */}
        <div className="mb-4">
          <SystemsAIPanel 
            user={user} 
            onAuthRequired={onAuthRequired} 
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            variant="ghost"
            onClick={() => navigate("/web-builder")}
            className={cn(
              "text-lg px-8 h-14 border border-fuchsia-500/40 text-fuchsia-400",
              "hover:bg-fuchsia-500/20 hover:border-fuchsia-500/60",
              "hover:shadow-[0_0_20px_rgba(255,0,255,0.3)]",
              "transition-all duration-200"
            )}
          >
            Explore Builder
          </Button>
        </div>
        {!user && (
          <p className="mt-4 text-sm text-gray-500">
            No credit card required · You'll sign in when you install
          </p>
        )}
        </div>
      </div>
    </section>
  );
}
