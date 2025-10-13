import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckSquare, Users, Zap, Shield, Sparkles, CalendarDays } from "lucide-react";
const Index = () => {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (session) {
        navigate("/creatives");
      }
    });
  }, [navigate]);
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 bg-slate-950">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center rounded-none bg-slate-950">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-slate-50">Unison Tasks</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/creatives")} className="text-base text-slate-100 bg-gray-950 hover:bg-gray-800">
            Creatives
          </Button>
          <Button variant="ghost" onClick={() => navigate("/planning")} className="text-slate-100 bg-slate-950 hover:bg-slate-800">
            Planning
          </Button>
          <Button variant="ghost" onClick={() => navigate("/files")} className="text-slate-100 bg-slate-950 hover:bg-slate-800">
            Files
          </Button>
          <Button onClick={() => navigate("/auth")} className="bg-emerald-50 text-gray-950">Get Started</Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-20 bg-slate-950">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-slate-400">
            Collaborative Task Management for Modern Teams
          </h1>
          <p className="text-xl mb-8 text-slate-400">
            Create projects, assign tasks, collaborate in real-time, and track progress with analytics. 
            Built for distributed teams that need to stay in sync.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="bg-emerald-50 text-gray-950">
            Start Free Trial
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16 bg-gray-950">
          <div onClick={() => navigate("/creatives")} className="text-center p-6 rounded-lg border hover:shadow-lg transition-shadow cursor-pointer bg-emerald-50">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Creatives</h3>
            <p className="text-muted-foreground">
              Manage design, content, and media creative tasks in one place.
            </p>
          </div>

          <div onClick={() => navigate("/planning")} className="text-center p-6 rounded-lg border hover:shadow-lg transition-shadow cursor-pointer bg-emerald-50">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Task Planning</h3>
            <p className="text-muted-foreground">
              Schedule and plan your tasks with calendar views and timelines.
            </p>
          </div>

          <div onClick={() => navigate("/files")} className="text-center p-6 rounded-lg border hover:shadow-lg transition-shadow cursor-pointer bg-emerald-50">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">File Manager</h3>
            <p className="text-muted-foreground">
              Store and organize files with sharing, preview, and version control.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-6">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-400">Team Collaboration</h3>
            <p className="text-muted-foreground">
              Invite team members, assign tasks, and work together seamlessly with real-time updates.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-400">Real-Time Updates</h3>
            <p className="text-muted-foreground">
              See changes instantly as your team updates tasks, comments, and project status.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-400">Secure & Private</h3>
            <p className="text-muted-foreground">
              Enterprise-grade security with row-level access control and encrypted data storage.
            </p>
          </div>
        </div>
      </main>
    </div>;
};
export default Index;