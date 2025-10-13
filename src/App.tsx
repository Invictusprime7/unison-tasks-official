import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DirectionProvider } from "@radix-ui/react-direction";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Project from "./pages/Project";
import Files from "./pages/Files";
import Creatives from "./pages/Creatives";
import TaskPlanning from "./pages/TaskPlanning";
import DesignStudioPage from "./pages/DesignStudioPage";
import WebBuilderPage from "./pages/WebBuilderPage";
import NotFound from "./pages/NotFound";
import { AIPageGenerator } from "./components/creatives/AIPageGenerator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DirectionProvider dir="ltr">
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/project/:id" element={<Project />} />
            <Route path="/files" element={<Files />} />
            <Route path="/creatives" element={<Creatives />} />
            <Route path="/planning" element={<TaskPlanning />} />
            <Route path="/design-studio" element={<DesignStudioPage />} />
            <Route path="/web-builder" element={<WebBuilderPage />} />
            <Route path="/ai-generator" element={<AIPageGenerator />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </DirectionProvider>
  </QueryClientProvider>
);

export default App;
