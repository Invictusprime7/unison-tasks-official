import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubscriptionBadge } from "@/components/SubscriptionBadge";
import { 
  CheckSquare, 
  Users, 
  Zap, 
  Shield, 
  Sparkles, 
  CalendarDays, 
  AlertCircle, 
  Workflow, 
  LogOut,
  Check, 
  ArrowRight,
  Star,
  Globe,
  BarChart3,
  Palette,
  FileText,
  Bot
} from "lucide-react";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out Unison Tasks",
    features: [
      "1 project",
      "10 AI generations/month",
      "Basic templates",
      "Community support",
      "1 team member"
    ],
    limitations: [
      "Limited storage (100MB)",
      "No custom domains",
      "Unison branding"
    ],
    cta: "Get Started Free",
    popular: false,
    variant: "outline" as const
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For professionals and growing teams",
    features: [
      "Unlimited projects",
      "500 AI generations/month",
      "All premium templates",
      "Priority support",
      "5 team members",
      "Custom domains",
      "Remove branding",
      "Advanced analytics",
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
    description: "For agencies and large teams",
    features: [
      "Everything in Pro",
      "Unlimited AI generations",
      "White-label solution",
      "Dedicated support",
      "Unlimited team members",
      "SSO & advanced security",
      "Custom integrations",
      "SLA guarantee",
      "Priority feature requests"
    ],
    limitations: [],
    cta: "Contact Sales",
    popular: false,
    variant: "outline" as const
  }
];

const features = [
  {
    icon: Palette,
    title: "AI Web Builder",
    description: "Create stunning websites with AI-powered design assistance. Drag-and-drop components, templates, and one-click publishing."
  },
  {
    icon: Workflow,
    title: "CRM & Workflows",
    description: "Manage contacts, leads, and automate workflows with powerful triggers and actions. Connect forms, bookings, and payments."
  },
  {
    icon: Bot,
    title: "AI Generations",
    description: "Generate templates, images, copy, and code with state-of-the-art AI. Save hours of design and development time."
  },
  {
    icon: Globe,
    title: "One-Click Publish",
    description: "Deploy your sites instantly to Netlify or Vercel. Custom domains, SSL certificates, and global CDN included."
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Track visitor behavior, form submissions, and conversion rates. Make data-driven decisions."
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 compliant infrastructure, SSO integration, role-based access control, and encrypted data storage."
  }
];

const testimonials = [
  {
    quote: "Unison Tasks replaced 5 different tools for our agency. The AI builder is incredibly fast.",
    author: "Sarah Chen",
    role: "Founder, PixelPerfect Agency",
    avatar: "SC"
  },
  {
    quote: "We went from idea to live website in under 2 hours. The CRM integration is seamless.",
    author: "Marcus Johnson",
    role: "Marketing Director, TechFlow",
    avatar: "MJ"
  },
  {
    quote: "Best investment for our team. The workflow automation saves us 20+ hours per week.",
    author: "Emily Rodriguez",
    role: "Operations Lead, ScaleUp Inc",
    avatar: "ER"
  }
];

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase is not properly configured. Some features may not work.');
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Configuration Warning */}
      {!isSupabaseConfigured && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3">
          <div className="container mx-auto flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">
              <strong>Configuration Warning:</strong> Supabase environment variables are not properly set.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Unison Tasks</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            {user && <SubscriptionBadge />}
            {user ? (
              <>
                <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth")}>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6">
            <Sparkles className="h-3 w-3 mr-1" />
            Now with AI-powered web building
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
            Build, Manage & Scale
            <span className="block text-primary">Your Digital Presence</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The all-in-one platform for creating websites, managing clients, and automating workflows. 
            Powered by AI, designed for teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button size="lg" onClick={() => navigate("/creatives")} className="text-lg px-8">
                Go to Web Builder
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
            <Button size="lg" variant="outline" onClick={() => navigate("/creatives")} className="text-lg px-8">
              View Demo
            </Button>
          </div>
          {!user && (
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required · Free tier available
            </p>
          )}
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { icon: Sparkles, title: "Web Builder", desc: "AI-powered design", path: "/creatives" },
            { icon: Workflow, title: "CRM", desc: "Contacts & automation", path: "/crm" },
            { icon: CalendarDays, title: "Planning", desc: "Tasks & scheduling", path: "/planning" },
            { icon: FileText, title: "Files", desc: "Storage & sharing", path: "/files" }
          ].map((item, i) => (
            <Card 
              key={i} 
              className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-border/50"
              onClick={() => navigate(item.path)}
            >
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to succeed</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From website creation to client management, we've got you covered.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <Card key={i} className="border-border/50 bg-background">
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you need more power.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, i) => (
              <Card 
                key={i} 
                className={`relative border-2 ${tier.popular ? 'border-primary shadow-lg scale-105' : 'border-border/50'}`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                  <CardDescription className="mt-2">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3">
                    {tier.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={tier.variant}
                    onClick={() => navigate(user ? "/pricing" : "/auth")}
                  >
                    {tier.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by teams worldwide</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our customers have to say about Unison Tasks.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="border-border/50 bg-background">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto bg-primary text-primary-foreground border-0">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your workflow?</h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join thousands of teams using Unison Tasks to build faster and smarter.
              </p>
              <Button 
                size="lg" 
                variant="secondary" 
                onClick={() => navigate(user ? "/creatives" : "/auth")}
                className="text-lg px-8"
              >
                {user ? "Go to Web Builder" : "Start Your Free Trial"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Unison Tasks</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Unison Tasks. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
