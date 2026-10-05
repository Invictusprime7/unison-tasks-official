import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SubscriptionBadge } from "@/components/SubscriptionBadge";
import { DocHelper } from "@/components/docs";
import { 
  Menu, 
  LayoutDashboard,
  LogOut, 
  Zap,
  Users,
  Cloud,
  X,
} from "lucide-react";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface NavigationBarProps {
  user: User | null;
  docsOpen: boolean;
  onDocsOpenChange: (open: boolean) => void;
  onSignOut: () => void;
  onStartLauncher: () => void;
}

export function NavigationBar({ 
  user, 
  docsOpen, 
  onDocsOpenChange, 
  onSignOut, 
  onStartLauncher 
}: NavigationBarProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left: docs trigger + logo */}
        <div className="flex items-center gap-3">
          <Sheet open={docsOpen} onOpenChange={onDocsOpenChange}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-muted-foreground hover:bg-muted">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open documentation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-[450px] p-0 overflow-hidden bg-card border-border">
              <DocHelper embedded className="h-full" />
            </SheetContent>
          </Sheet>
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 group"
          >
            <img src="/unison-icon.png" alt="" className="h-7 w-7" />
            <span className="text-base font-bold text-foreground">Unison</span>
          </button>
        </div>

        {/* Center: Desktop nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <a href="#systems"   className="text-muted-foreground hover:text-foreground transition-colors">Systems</a>
          <a href="#features"  className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#pricing"   className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
        </div>

        {/* Right: Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          {user && <SubscriptionBadge />}
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="text-muted-foreground hover:text-foreground hover:bg-muted gap-1.5"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/cloud")}
                className="text-muted-foreground hover:text-primary hover:bg-muted gap-1.5"
              >
                <Cloud className="h-3.5 w-3.5" />
                Cloud
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/team")}
                className="text-muted-foreground hover:text-foreground hover:bg-muted gap-1.5"
              >
                <Users className="h-3.5 w-3.5" />
                Team
              </Button>
              <Button
                onClick={onStartLauncher}
                size="sm"
                className="gap-1.5"
              >
                <Zap className="h-3.5 w-3.5" />
                Build Your Site
              </Button>
              <Button 
                variant="ghost"
                size="icon"
                onClick={onSignOut}
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => navigate("/auth")}
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                Sign In
              </Button>
              <Button 
                size="sm"
                onClick={onStartLauncher}
                className="gap-1.5"
              >
                <Zap className="h-3.5 w-3.5" />
                Get Started Free
              </Button>
            </>
          )}
        </div>

        {/* Mobile: CTA + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {user && <SubscriptionBadge />}
          <Button
            size="sm"
            onClick={onStartLauncher}
            className="gap-1"
          >
            <Zap className="h-3 w-3" />
            {user ? "Build" : "Start Free"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
            <a href="#systems"  onClick={() => setMobileMenuOpen(false)} className="py-2.5 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted text-sm transition-colors">Systems</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-2.5 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted text-sm transition-colors">Features</a>
            <a href="#pricing"  onClick={() => setMobileMenuOpen(false)} className="py-2.5 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted text-sm transition-colors">Pricing</a>

            <div className="border-t border-border my-2" />

            {user ? (
              <>
                <Button variant="ghost" onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} className="justify-start h-10 text-muted-foreground hover:text-foreground hover:bg-muted gap-2">
                  <LayoutDashboard className="h-4 w-4" />Dashboard
                </Button>
                <Button variant="ghost" onClick={() => { navigate("/cloud"); setMobileMenuOpen(false); }} className="justify-start h-10 text-muted-foreground hover:text-primary hover:bg-muted gap-2">
                  <Cloud className="h-4 w-4" />Cloud
                </Button>
                <Button variant="ghost" onClick={() => { navigate("/team"); setMobileMenuOpen(false); }} className="justify-start h-10 text-muted-foreground hover:text-foreground hover:bg-muted gap-2">
                  <Users className="h-4 w-4" />Team
                </Button>
                <Button onClick={() => { onStartLauncher(); setMobileMenuOpen(false); }} className="justify-start gap-2">
                  <Zap className="h-4 w-4" />Build Your Site
                </Button>
                <Button variant="ghost" onClick={() => { onSignOut(); setMobileMenuOpen(false); }} className="justify-start h-10 text-destructive hover:text-destructive hover:bg-destructive/10 gap-2">
                  <LogOut className="h-4 w-4" />Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }} className="justify-start h-10 text-muted-foreground hover:text-foreground hover:bg-muted">
                  Sign In
                </Button>
                <Button onClick={() => { onStartLauncher(); setMobileMenuOpen(false); }} className="justify-start gap-2">
                  <Zap className="h-4 w-4" />Get Started Free
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
