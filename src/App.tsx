import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DirectionProvider } from "@radix-ui/react-direction";
import { Suspense, lazy } from "react";

// Static imports for lightweight pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import WebBuilderPage from "./pages/WebBuilderPage";

// Dynamic imports for heavy pages
const Pricing = lazy(() => import("./pages/Pricing"));
const Index = lazy(() => import("./pages/Index"));

// Dynamic imports for heavy pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Project = lazy(() => import("./pages/Project"));
const Files = lazy(() => import("./pages/Files"));
const Creatives = lazy(() => import("./pages/Creatives"));
const TaskPlanning = lazy(() => import("./pages/TaskPlanning"));
const DesignStudioPage = lazy(() => import("./pages/DesignStudioPage"));
const AIPageGenerator = lazy(() => import("./components/creatives/AIPageGenerator").then(m => ({ default: m.AIPageGenerator })));
const CRMDashboard = lazy(() => import("./pages/CRMDashboard"));
const BusinessSettings = lazy(() => import("./pages/BusinessSettings"));
const CloudDashboard = lazy(() => import("./pages/CloudDashboard"));
const InvestorDeck = lazy(() => import("./pages/InvestorDeck"));

const queryClient = new QueryClient();

// Loading component for better UX
const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DirectionProvider dir="ltr">
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pricing" element={
              <Suspense fallback={<PageLoader />}>
                <Pricing />
              </Suspense>
            } />
            <Route path="/home" element={
              <Suspense fallback={<PageLoader />}>
                <Index />
              </Suspense>
            } />
            <Route path="/dashboard" element={
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            } />
            <Route path="/project/:id" element={
              <Suspense fallback={<PageLoader />}>
                <Project />
              </Suspense>
            } />
            <Route path="/files" element={
              <Suspense fallback={<PageLoader />}>
                <Files />
              </Suspense>
            } />
            <Route path="/creatives" element={
              <Suspense fallback={<PageLoader />}>
                <Creatives />
              </Suspense>
            } />
            <Route path="/planning" element={
              <Suspense fallback={<PageLoader />}>
                <TaskPlanning />
              </Suspense>
            } />
            <Route path="/design-studio" element={
              <Suspense fallback={<PageLoader />}>
                <DesignStudioPage />
              </Suspense>
            } />
            <Route path="/web-builder" element={
              <Suspense fallback={<PageLoader />}>
                <WebBuilderPage />
              </Suspense>
            } />
            <Route path="/ai-generator" element={
              <Suspense fallback={<PageLoader />}>
                <AIPageGenerator />
              </Suspense>
            } />
            <Route path="/crm" element={
              <Suspense fallback={<PageLoader />}>
                <CRMDashboard />
              </Suspense>
            } />
            <Route path="/business-settings" element={
              <Suspense fallback={<PageLoader />}>
                <BusinessSettings />
              </Suspense>
            } />
            <Route path="/dashboard/leads" element={
              <Suspense fallback={<PageLoader />}>
                <CRMDashboard initialView="leads" />
              </Suspense>
            } />
            <Route path="/cloud" element={
              <Suspense fallback={<PageLoader />}>
                <CloudDashboard />
              </Suspense>
            } />
            <Route path="/investor-deck" element={
              <Suspense fallback={<PageLoader />}>
                <InvestorDeck />
              </Suspense>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </DirectionProvider>
  </QueryClientProvider>
);

export default App;
