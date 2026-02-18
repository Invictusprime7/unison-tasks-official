import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SubscriptionBadge } from "@/components/SubscriptionBadge";
import { 
  CheckSquare, 
  Zap, 
  Shield, 
  Sparkles, 
  AlertCircle, 
  LogOut,
  Check, 
  ArrowRight,
  Star,
  Layers,
  Workflow,
  Bot,
  Cloud,
  FolderOpen,
  Clock,
  ExternalLink,
  Plus,
  Paintbrush,
  Menu,
  CreditCard,
  BarChart3,
  Webhook,
  Globe,
  Plug,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Link
} from "lucide-react";
import { RecentProjectCard } from "@/components/home/RecentProjectCard";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { businessSystems } from "@/data/templates/types";
import { getTemplatesByCategory, type LayoutTemplate } from "@/data/templates";
import { BusinessLauncher } from "@/components/onboarding/BusinessLauncher";
import { SystemsAIPanel } from "@/components/onboarding/SystemsAIPanel";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DocHelper } from "@/components/docs";
import { cn } from "@/lib/utils";

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Launch your first business system",
    features: [
      "1 live system",
      "10 AI generations/month",
      "Pre-built templates",
      "Community support",
      "All core features"
    ],
    limitations: [],
    cta: "Start Free",
    popular: false,
    variant: "outline" as const
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "Scale with unlimited systems",
    features: [
      "Unlimited systems",
      "500 AI generations/month",
      "Custom domains",
      "Priority support",
      "Advanced analytics",
      "Remove branding",
      "API access"
    ],
    limitations: [],
    cta: "Start Pro Trial",
    popular: true,
    variant: "default" as const
  },
  {
    name: "Business",
    price: "$99",
    period: "/month",
    description: "For agencies and teams",
    features: [
      "Everything in Pro",
      "Unlimited AI",
      "White-label",
      "Dedicated support",
      "Unlimited team",
      "SSO & security",
      "Custom integrations"
    ],
    limitations: [],
    cta: "Contact Sales",
    popular: false,
    variant: "outline" as const
  }
];

const platformFeatures = [
  {
    icon: Layers,
    title: "Ready-to-Run Systems",
    description: "Not just templates. Complete business systems with booking, payments, and CRM pre-wired."
  },
  {
    icon: Zap,
    title: "Buttons That Work",
    description: "Every button knows what it does. Forms submit, carts update, bookings confirm—automatically."
  },
  {
    icon: Bot,
    title: "AI That Understands Context",
    description: "Generate pages, copy, and features that understand your business type and goals."
  },
  {
    icon: Workflow,
    title: "Built-in Automation",
    description: "Lead capture, email notifications, and CRM updates happen without extra setup."
  },
  {
    icon: Shield,
    title: "Enterprise-Ready",
    description: "Secure infrastructure, custom domains, and SSO for growing teams."
  },
  {
    icon: Sparkles,
    title: "One-Click Launch",
    description: "From template to live website in minutes. No deployment headaches."
  }
];

const integrationsList = [
  {
    id: 'stripe',
    name: 'Stripe',
    icon: CreditCard,
    color: 'from-purple-500 to-indigo-600',
    description: 'Accept payments and manage subscriptions',
    apiKeyPlaceholder: 'sk_live_...',
    docsUrl: 'https://stripe.com/docs'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: CreditCard,
    color: 'from-blue-500 to-blue-700',
    description: 'Accept PayPal payments globally',
    apiKeyPlaceholder: 'Client ID',
    docsUrl: 'https://developer.paypal.com'
  },
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    icon: BarChart3,
    color: 'from-orange-500 to-yellow-500',
    description: 'Track website traffic and user behavior',
    apiKeyPlaceholder: 'G-XXXXXXXXXX',
    docsUrl: 'https://analytics.google.com'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: Bot,
    color: 'from-green-500 to-emerald-600',
    description: 'GPT-4, DALL-E, and Whisper APIs',
    apiKeyPlaceholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/docs'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: Bot,
    color: 'from-amber-500 to-orange-600',
    description: 'Claude AI assistant integration',
    apiKeyPlaceholder: 'sk-ant-...',
    docsUrl: 'https://docs.anthropic.com'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    icon: Zap,
    color: 'from-orange-400 to-red-500',
    description: 'Connect with 5000+ apps',
    apiKeyPlaceholder: 'Webhook URL',
    docsUrl: 'https://zapier.com/apps'
  },
  {
    id: 'make',
    name: 'Make',
    icon: Webhook,
    color: 'from-violet-500 to-purple-600',
    description: 'Visual automation platform',
    apiKeyPlaceholder: 'API Key',
    docsUrl: 'https://www.make.com/en/api-documentation'
  },
  {
    id: 'vercel',
    name: 'Vercel',
    icon: Globe,
    color: 'from-slate-600 to-slate-800',
    description: 'Deploy frontend applications',
    apiKeyPlaceholder: 'Bearer Token',
    docsUrl: 'https://vercel.com/docs'
  }
];

type IntegrationItem = typeof integrationsList[number];

// Interface for recent projects from design_templates table
interface RecentProject {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  updated_at: string;
  created_at: string;
  canvas_data: any;
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  
  // Integration connection state
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationItem | null>(null);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [connectingIntegration, setConnectingIntegration] = useState(false);
  const [connectedIntegrations, setConnectedIntegrations] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    if (!isSupabaseConfigured) {
      console.warn('⚠️ Backend is not properly configured. Some features may not work.');
    }

    return () => subscription.unsubscribe();
  }, []);

  // Load recent projects when user is authenticated
  useEffect(() => {
    const loadRecentProjects = async () => {
      if (!user || !isSupabaseConfigured) return;
      
      setLoadingProjects(true);
      try {
        const { data, error } = await supabase
          .from('design_templates')
          .select('id, name, description, is_public, updated_at, created_at, canvas_data')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(4);

        if (error) {
          console.error('Error loading recent projects:', error);
        } else {
          setRecentProjects(data || []);
        }
      } catch (err) {
        console.error('Failed to load recent projects:', err);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadRecentProjects();
  }, [user]);

  // Load connected integrations when user is authenticated
  useEffect(() => {
    const loadConnectedIntegrations = async () => {
      if (!user || !isSupabaseConfigured) return;
      
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('settings')
          .eq('user_id', user.id)
          .single();

        if (data?.settings) {
          const settings = typeof data.settings === 'string' 
            ? JSON.parse(data.settings) 
            : data.settings;
            
          if (settings.integrations) {
            const connected: Record<string, boolean> = {};
            Object.keys(settings.integrations).forEach(key => {
              connected[key] = settings.integrations[key]?.connected || false;
            });
            setConnectedIntegrations(connected);
          }
        }
      } catch (error) {
        console.error('Error loading connected integrations:', error);
      }
    };

    loadConnectedIntegrations();
  }, [user]);

  const handleIntegrationClick = (integration: IntegrationItem) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setSelectedIntegration(integration);
    setApiKey('');
    setShowApiKey(false);
    setConnectDialogOpen(true);
  };

  const handleConnectIntegration = async () => {
    if (!selectedIntegration || !apiKey.trim() || !user) {
      toast({
        title: 'Error',
        description: 'Please enter an API key or credentials.',
        variant: 'destructive',
      });
      return;
    }

    setConnectingIntegration(true);
    
    try {
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', user.id)
        .single();

      const currentSettings = existingSettings?.settings 
        ? (typeof existingSettings.settings === 'string' 
            ? JSON.parse(existingSettings.settings) 
            : existingSettings.settings)
        : {};

      const newSettings = {
        ...currentSettings,
        integrations: {
          ...(currentSettings.integrations || {}),
          [selectedIntegration.id]: {
            connected: true,
            connectedAt: new Date().toISOString(),
          },
        },
      };

      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: newSettings,
        });

      setConnectedIntegrations(prev => ({
        ...prev,
        [selectedIntegration.id]: true
      }));

      setConnectDialogOpen(false);
      setSelectedIntegration(null);
      setApiKey('');
      
      toast({
        title: 'Connected!',
        description: `${selectedIntegration.name} has been connected successfully.`,
      });
    } catch (error) {
      console.error('Error connecting integration:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect integration.',
        variant: 'destructive',
      });
    } finally {
      setConnectingIntegration(false);
    }
  };

  const handleDisconnectIntegration = async () => {
    if (!selectedIntegration || !user) return;

    setConnectingIntegration(true);
    
    try {
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', user.id)
        .single();

      const currentSettings = existingSettings?.settings 
        ? (typeof existingSettings.settings === 'string' 
            ? JSON.parse(existingSettings.settings) 
            : existingSettings.settings)
        : {};

      const newIntegrations = { ...(currentSettings.integrations || {}) };
      delete newIntegrations[selectedIntegration.id];

      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: {
            ...currentSettings,
            integrations: newIntegrations,
          },
        });

      setConnectedIntegrations(prev => {
        const updated = { ...prev };
        delete updated[selectedIntegration.id];
        return updated;
      });

      setConnectDialogOpen(false);
      setSelectedIntegration(null);
      
      toast({
        title: 'Disconnected',
        description: `${selectedIntegration.name} has been disconnected.`,
      });
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect integration.',
        variant: 'destructive',
      });
    } finally {
      setConnectingIntegration(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  const handleStartLauncher = () => {
    if (user) {
      setLauncherOpen(true);
    } else {
      // For non-authenticated users, still show launcher (they'll auth after)
      setLauncherOpen(true);
    }
  };

  const isNewTemplate = (t: LayoutTemplate) => {
    const tags = t.tags || [];
    return tags.includes("editorial") || /data-ut-(cta|intent)\s*=/.test(t.code);
  };

  const launchableSystems = businessSystems.filter((system) =>
    system.templateCategories
      .flatMap((cat) => getTemplatesByCategory(cat))
      .some(isNewTemplate)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="text-center">
          <Zap className="h-10 w-10 text-cyan-400 animate-pulse mx-auto mb-4 drop-shadow-[0_0_15px_rgba(0,255,255,0.6)]" />
          <p className="text-cyan-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] relative">
      {/* Pixelated grid background - entire page */}
      <div 
        className="fixed inset-0 opacity-20 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2300ffff' fill-opacity='0.15'%3E%3Crect x='0' y='0' width='4' height='4'/%3E%3Crect x='20' y='0' width='4' height='4'/%3E%3Crect x='0' y='20' width='4' height='4'/%3E%3Crect x='20' y='20' width='4' height='4'/%3E%3Crect x='10' y='10' width='4' height='4'/%3E%3Crect x='30' y='10' width='4' height='4'/%3E%3Crect x='10' y='30' width='4' height='4'/%3E%3Crect x='30' y='30' width='4' height='4'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }}
      />
      {/* Scanline effect - entire page */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)',
        }}
      />
      {/* Configuration Warning */}
      {!isSupabaseConfigured && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3">
          <div className="container mx-auto flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">
              <strong>Configuration Warning:</strong> Backend environment variables are not properly set.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-[#0d0d18]/95 backdrop-blur-sm border-b border-cyan-500/20 shadow-[0_4px_20px_rgba(0,255,255,0.1)] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Sheet open={docsOpen} onOpenChange={setDocsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-500/20">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open documentation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[400px] sm:w-[450px] p-0 overflow-hidden bg-[#0d0d18] border-cyan-500/20">
                <DocHelper embedded className="h-full" />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-8 w-8 text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.6)]" />
              <span className="text-2xl font-bold text-cyan-400 drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">Unison Tasks</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#systems" className="text-gray-400 hover:text-cyan-400 transition-colors">Systems</a>
            <a href="#features" className="text-gray-400 hover:text-lime-400 transition-colors">Features</a>
            <a href="#pricing" className="text-gray-400 hover:text-fuchsia-400 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            {user && <SubscriptionBadge />}
            <Button 
              variant="ghost" 
              onClick={() => navigate("/cloud")} 
              className={cn(
                "border border-blue-500/30 text-blue-400",
                "hover:bg-blue-500/20 hover:border-blue-500/50",
                "hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]",
                "transition-all duration-200"
              )}
            >
              <Cloud className="h-4 w-4 mr-2" />
              Cloud
            </Button>
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/dashboard")}
                  className="text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-500/20"
                >
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut}
                  className={cn(
                    "border border-red-500/30 text-red-400",
                    "hover:bg-red-500/20 hover:border-red-500/50",
                    "transition-all duration-200"
                  )}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/auth")}
                  className="text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-500/20"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={handleStartLauncher}
                  className={cn(
                    "bg-lime-400 text-black font-bold",
                    "shadow-[0_0_15px_rgba(0,255,0,0.4)]",
                    "hover:bg-lime-300 hover:shadow-[0_0_25px_rgba(0,255,0,0.6)]",
                    "active:scale-95 transition-all duration-200"
                  )}
                >
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - New Positioning */}
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
            Pick a system, choose a contract-ready starter, and we’ll install the backend packs
            (data, workflows, intents) automatically.
          </p>
          
          {/* Systems AI Panel - Inline in hero */}
          <div className="mb-4">
            <SystemsAIPanel 
              user={user} 
              onAuthRequired={() => navigate("/auth")} 
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
              No credit card required · You’ll sign in when you install
            </p>
          )}
          </div>
        </div>
      </section>

      {/* Recent Projects Section - Only visible for authenticated users */}
      {user && (
        <section className="container mx-auto px-4 py-12 border-b border-cyan-500/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-6 w-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Your Recent Projects</h2>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/cloud")}
              className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10"
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          {loadingProjects ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400 mr-3"></div>
              Loading projects...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentProjects.map((project) => {
                const canvasData = project.canvas_data as { html?: string; previewCode?: string; css?: string } | null;
                const previewHtml = canvasData?.previewCode || canvasData?.html || null;
                return (
                  <RecentProjectCard
                    key={project.id}
                    id={project.id}
                    name={project.name}
                    description={project.description}
                    isPublic={project.is_public}
                    updatedAt={project.updated_at}
                    previewHtml={previewHtml}
                    onClick={() => navigate(`/web-builder?id=${project.id}`)}
                  />
                );
              })}
              
              {/* Quick Add New Project Card */}
              <button
                onClick={handleStartLauncher}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border border-dashed border-lime-500/30 bg-[#12121e] min-h-[200px] cursor-pointer",
                  "hover:shadow-[0_0_20px_rgba(132,204,22,0.2)] hover:border-lime-500/60 transition-all text-gray-500 hover:text-lime-400"
                )}
              >
                <Plus className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">New Project</span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* The Difference Section */}
      <section className="bg-[#0d0d18] py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-purple-500/20 text-purple-400 border border-purple-500/30">Why Unison Tasks</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Templates are dead. <span className="text-lime-400 drop-shadow-[0_0_20px_rgba(132,204,22,0.5)]">Systems are alive.</span>
              </h2>
              <p className="text-lg text-gray-400">
                Other tools give you static pages. We give you running businesses.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Old Way */}
              <Card className="border-red-500/30 bg-red-500/5">
                <CardHeader>
                  <CardTitle className="text-lg text-red-400">❌ Static Templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-400">
                  <p>• Buttons don't do anything</p>
                  <p>• Forms need manual wiring</p>
                  <p>• Payments require integration</p>
                  <p>• Booking needs separate app</p>
                  <p>• Weeks of development work</p>
                </CardContent>
              </Card>

              {/* New Way */}
              <Card className="border-lime-500/50 bg-lime-500/5 shadow-[0_0_20px_rgba(132,204,22,0.1)]">
                <CardHeader>
                  <CardTitle className="text-lg text-lime-400">✓ Unison Systems</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-400">
                  <p>• Buttons pre-wired to actions</p>
                  <p>• Forms auto-submit to CRM</p>
                  <p>• Payments work out of box</p>
                  <p>• Booking calendar included</p>
                  <p>• Backend packs installed automatically</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-20 bg-[#0a0a12]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30">
              <Plug className="h-3 w-3 mr-1" />
              Connect Anything
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Powerful <span className="text-fuchsia-400 drop-shadow-[0_0_20px_rgba(255,0,255,0.5)]">integrations</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Connect your favorite tools. Payments, analytics, AI, and automation — all pre-wired.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {integrationsList.map((integration) => {
              const IconComponent = integration.icon;
              const isConnected = connectedIntegrations[integration.id];
              return (
                <Card 
                  key={integration.id}
                  onClick={() => handleIntegrationClick(integration)}
                  className={cn(
                    "group relative border bg-[#12121e] overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer",
                    isConnected 
                      ? "border-lime-500/50 shadow-[0_0_15px_rgba(132,204,22,0.2)]" 
                      : "border-white/10 hover:border-fuchsia-500/50 hover:shadow-[0_0_25px_rgba(255,0,255,0.2)]"
                  )}
                >
                  {isConnected && (
                    <div className="absolute top-2 right-2 z-10">
                      <CheckCircle2 className="h-5 w-5 text-lime-400 drop-shadow-[0_0_8px_rgba(132,204,22,0.6)]" />
                    </div>
                  )}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                    integration.color
                  )} />
                  <CardContent className="p-6 text-center relative">
                    <div className={cn(
                      "w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br shadow-lg",
                      integration.color
                    )}>
                      <IconComponent className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="font-semibold text-white mb-1">{integration.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{integration.description}</p>
                    <div className="mt-3">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          isConnected 
                            ? "border-lime-500/50 text-lime-400 bg-lime-500/10" 
                            : "border-fuchsia-500/30 text-fuchsia-400 bg-fuchsia-500/10"
                        )}
                      >
                        {isConnected ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Connected
                          </>
                        ) : (
                          <>
                            <Link className="h-3 w-3 mr-1" />
                            Connect
                          </>
                        )}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <Button 
              variant="ghost"
              onClick={() => navigate("/cloud")}
              className="text-fuchsia-400 border border-fuchsia-500/30 hover:bg-fuchsia-500/20 hover:border-fuchsia-500/50"
            >
              View All Integrations
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Integration Connect Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent className="bg-[#12121e] border-fuchsia-500/30 text-white max-w-md">
          {selectedIntegration && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg",
                    selectedIntegration.color
                  )}>
                    <selectedIntegration.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedIntegration.name}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      {selectedIntegration.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {connectedIntegrations[selectedIntegration.id] ? (
                  <div className="text-center py-4">
                    <CheckCircle2 className="h-12 w-12 text-lime-400 mx-auto mb-3 drop-shadow-[0_0_15px_rgba(132,204,22,0.5)]" />
                    <p className="text-lime-400 font-medium mb-1">Integration Connected</p>
                    <p className="text-sm text-gray-400">
                      {selectedIntegration.name} is connected and ready to use.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="apiKey" className="text-gray-300">
                        API Key / Credentials
                      </Label>
                      <div className="relative">
                        <Input
                          id="apiKey"
                          type={showApiKey ? "text" : "password"}
                          placeholder={selectedIntegration.apiKeyPlaceholder}
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          className="bg-[#0a0a12] border-fuchsia-500/30 text-white pr-10 focus:border-fuchsia-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Your API key is encrypted and stored securely. 
                      <a 
                        href={selectedIntegration.docsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-fuchsia-400 hover:text-fuchsia-300 ml-1"
                      >
                        Get your API key →
                      </a>
                    </p>
                  </>
                )}
              </div>

              <DialogFooter className="gap-2">
                {connectedIntegrations[selectedIntegration.id] ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setConnectDialogOpen(false)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Close
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDisconnectIntegration}
                      disabled={connectingIntegration}
                      className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                    >
                      {connectingIntegration ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Disconnecting...
                        </>
                      ) : (
                        'Disconnect'
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setConnectDialogOpen(false)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConnectIntegration}
                      disabled={connectingIntegration || !apiKey.trim()}
                      className={cn(
                        "bg-fuchsia-500 text-white hover:bg-fuchsia-400",
                        "shadow-[0_0_15px_rgba(255,0,255,0.3)] hover:shadow-[0_0_20px_rgba(255,0,255,0.5)]"
                      )}
                    >
                      {connectingIntegration ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Plug className="h-4 w-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#0a0a12]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Everything is <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]">connected</span></h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              No plugins. No integrations. Just launch.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {platformFeatures.map((feature, i) => {
              const colors = ['cyan', 'lime', 'fuchsia'];
              const color = colors[i % colors.length];
              return (
              <Card key={i} className={cn(
                "border bg-[#12121e] transition-all duration-200 hover:scale-105",
                color === 'cyan' && "border-cyan-500/30 hover:shadow-[0_0_20px_rgba(0,255,255,0.15)]",
                color === 'lime' && "border-lime-500/30 hover:shadow-[0_0_20px_rgba(132,204,22,0.15)]",
                color === 'fuchsia' && "border-fuchsia-500/30 hover:shadow-[0_0_20px_rgba(255,0,255,0.15)]"
              )}>
                <CardHeader>
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                    color === 'cyan' && "bg-cyan-500/10",
                    color === 'lime' && "bg-lime-500/10",
                    color === 'fuchsia' && "bg-fuchsia-500/10"
                  )}>
                    <feature.icon className={cn(
                      "h-6 w-6",
                      color === 'cyan' && "text-cyan-400",
                      color === 'lime' && "text-lime-400",
                      color === 'fuchsia' && "text-fuchsia-400"
                    )} />
                  </div>
                  <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-[#0d0d18] py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Simple <span className="text-lime-400 drop-shadow-[0_0_20px_rgba(132,204,22,0.5)]">pricing</span></h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Start free. Upgrade when you grow.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, i) => {
              const colors = ['lime', 'cyan', 'fuchsia'];
              const color = colors[i % colors.length];
              return (
              <Card 
                key={i} 
                className={cn(
                  "relative border-2 bg-[#12121e] transition-all duration-200",
                  tier.popular && "scale-105",
                  color === 'lime' && "border-lime-500/30",
                  color === 'cyan' && "border-cyan-500/50 shadow-[0_0_25px_rgba(0,255,255,0.2)]",
                  color === 'fuchsia' && "border-fuchsia-500/30"
                )}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,255,255,0.5)]">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl text-white">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className={cn(
                      "text-4xl font-bold",
                      color === 'lime' && "text-lime-400",
                      color === 'cyan' && "text-cyan-400",
                      color === 'fuchsia' && "text-fuchsia-400"
                    )}>{tier.price}</span>
                    <span className="text-gray-400">{tier.period}</span>
                  </div>
                  <CardDescription className="mt-2 text-gray-400">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3">
                    {tier.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <Check className={cn(
                          "h-5 w-5 flex-shrink-0",
                          color === 'lime' && "text-lime-400",
                          color === 'cyan' && "text-cyan-400",
                          color === 'fuchsia' && "text-fuchsia-400"
                        )} />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={cn(
                      "w-full font-bold transition-all duration-200",
                      color === 'lime' && "bg-lime-500 text-black hover:bg-lime-400 shadow-[0_0_15px_rgba(132,204,22,0.3)] hover:shadow-[0_0_20px_rgba(132,204,22,0.5)]",
                      color === 'cyan' && "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_20px_rgba(0,255,255,0.5)]",
                      color === 'fuchsia' && "bg-fuchsia-500 text-black hover:bg-fuchsia-400 shadow-[0_0_15px_rgba(255,0,255,0.3)] hover:shadow-[0_0_20px_rgba(255,0,255,0.5)]"
                    )}
                    onClick={handleStartLauncher}
                  >
                    {tier.cta}
                  </Button>
                </CardFooter>
              </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0a0a12]">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-cyan-500/20 via-fuchsia-500/20 to-lime-500/20 border border-cyan-500/30 shadow-[0_0_40px_rgba(0,255,255,0.2)]">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]">launch?</span></h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Pick a business type. We'll handle the rest.
              </p>
              <Button 
                size="lg" 
                onClick={handleStartLauncher}
                className={cn(
                  "text-lg px-8 h-14 bg-cyan-500 text-black font-bold",
                  "shadow-[0_0_25px_rgba(0,255,255,0.5)]",
                  "hover:bg-cyan-400 hover:shadow-[0_0_35px_rgba(0,255,255,0.7)]",
                  "active:scale-95 transition-all duration-200"
                )}
              >
                <Zap className="mr-2 h-5 w-5" />
                Launch Your System
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 py-12 bg-[#0a0a12]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-6 w-6 text-cyan-400" />
              <span className="text-lg font-bold text-white">Unison Tasks</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Support</a>
            </div>
            <p className="text-sm text-gray-500">
              © 2025 Unison Tasks. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Business Launcher Dialog - New Flow */}
      <BusinessLauncher open={launcherOpen} onOpenChange={setLauncherOpen} />
    </div>
  );
};

export default Index;
