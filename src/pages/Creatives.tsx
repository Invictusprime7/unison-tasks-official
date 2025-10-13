import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Sparkles, Image, FileText, Video, Cloud, Home, Maximize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ImageEditor } from "@/components/creatives/ImageEditor";
import { VideoEditor } from "@/components/creatives/VideoEditor";
import { CreativeTaskSelector } from "@/components/creatives/CreativeTaskSelector";
import { VisualEditor } from "@/components/creatives/VisualEditor";

const Creatives = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectorOpen, setSelectorOpen] = useState(false);
  const {
    data: creativeTasks,
    isLoading
  } = useQuery({
    queryKey: ["creative-tasks", searchQuery],
    queryFn: async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      let query = supabase.from("tasks").select(`
          *,
          projects(name, id)
        `).in("status", ["todo", "in_progress"]).order("created_at", {
        ascending: false
      });
      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      return data;
    }
  });
  const categorizedTasks = {
    design: creativeTasks?.filter(t => t.title.toLowerCase().includes("design") || t.description?.toLowerCase().includes("design")) || [],
    content: creativeTasks?.filter(t => t.title.toLowerCase().includes("content") || t.title.toLowerCase().includes("write") || t.description?.toLowerCase().includes("content")) || [],
    media: creativeTasks?.filter(t => t.title.toLowerCase().includes("video") || t.title.toLowerCase().includes("image") || t.description?.toLowerCase().includes("media")) || []
  };
  return <div className="min-h-screen bg-slate-950">
      <div className="border-b bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-emerald-50 text-3xl font-bold">
                
                Creative Tasks
              </h1>
              <p className="mt-1 text-base text-slate-300">
                Manage your creative projects and ideas
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/")} className="text-base bg-slate-950 hover:bg-slate-800 text-slate-100">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button onClick={() => setSelectorOpen(true)} className="text-slate-100 bg-gray-950 hover:bg-gray-800">
                <Plus className="h-4 w-4 mr-2" />
                New Creative Task
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Content Cloud Section */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="bg-slate-950 rounded-none">
            <CardTitle className="flex items-center gap-2 text-2xl text-slate-300">
              <Cloud className="h-6 w-6 text-primary" />
              Content Cloud
            </CardTitle>
            <CardDescription>
              Access professional content creation tools with AI-powered features
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-slate-950 rounded-none">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ImageEditor />
              <Card className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50 bg-slate-950">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-100">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Design Studio
                    </span>
                    <Maximize2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardTitle>
                  <CardDescription className="text-slate-100">
                    Create stunning designs with professional tools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/design-studio")} className="w-full text-slate-50 bg-cyan-950 hover:bg-cyan-800">
                    Open Full Studio
                  </Button>
                </CardContent>
              </Card>
              <VideoEditor />
            </div>
          </CardContent>
        </Card>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search creative tasks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-slate-800" />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-950">
            <TabsTrigger value="all" className="text-slate-950 bg-gray-800 hover:bg-gray-700">All Tasks</TabsTrigger>
            <TabsTrigger value="design" className="text-gray-950 bg-gray-800 hover:bg-gray-700">
              <Image className="h-4 w-4 mr-2" />
              Design
            </TabsTrigger>
            <TabsTrigger value="content" className="text-gray-950 bg-gray-800 hover:bg-gray-700">
              <FileText className="h-4 w-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="media" className="text-slate-950 bg-gray-800 hover:bg-gray-700">
              <Video className="h-4 w-4 mr-2" />
              Media
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {isLoading ? <div className="text-center py-12">Loading...</div> : creativeTasks && creativeTasks.length > 0 ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {creativeTasks.map(task => <Card key={task.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/project/${task.project_id}`)}>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{task.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {task.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {task.projects?.name}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${task.status === "todo" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                          {task.status === "todo" ? "To Do" : "In Progress"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>)}
              </div> : <Card>
                <CardContent className="py-12 text-center bg-slate-100">
                  <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No creative tasks found</p>
                </CardContent>
              </Card>}
          </TabsContent>

          <TabsContent value="design" className="space-y-4 mt-6">
            {categorizedTasks.design.length > 0 ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categorizedTasks.design.map(task => <Card key={task.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/project/${task.project_id}`)}>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{task.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {task.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="text-sm text-muted-foreground">
                        {task.projects?.name}
                      </span>
                    </CardContent>
                  </Card>)}
              </div> : <Card>
                <CardContent className="py-12 text-center text-muted-foreground bg-slate-100">
                  No design tasks found
                </CardContent>
              </Card>}
          </TabsContent>

          <TabsContent value="content" className="space-y-4 mt-6">
            {categorizedTasks.content.length > 0 ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categorizedTasks.content.map(task => <Card key={task.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/project/${task.project_id}`)}>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{task.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {task.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="text-sm text-muted-foreground">
                        {task.projects?.name}
                      </span>
                    </CardContent>
                  </Card>)}
              </div> : <Card>
                <CardContent className="py-12 text-center text-muted-foreground bg-slate-100">
                  No content tasks found
                </CardContent>
              </Card>}
          </TabsContent>

          <TabsContent value="media" className="space-y-4 mt-6">
            {categorizedTasks.media.length > 0 ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categorizedTasks.media.map(task => <Card key={task.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/project/${task.project_id}`)}>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{task.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {task.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="text-sm text-muted-foreground">
                        {task.projects?.name}
                      </span>
                    </CardContent>
                  </Card>)}
              </div> : <Card>
                <CardContent className="py-12 text-center text-muted-foreground bg-slate-100">
                  No media tasks found
                </CardContent>
              </Card>}
          </TabsContent>
        </Tabs>
      </div>

      <CreativeTaskSelector open={selectorOpen} onOpenChange={setSelectorOpen} />
    </div>;
};
export default Creatives;