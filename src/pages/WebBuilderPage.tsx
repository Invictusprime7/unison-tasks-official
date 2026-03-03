import { Suspense, lazy } from "react";
import { VFSProvider } from "@/contexts/VFSContext";

const WebBuilder = lazy(() =>
  import("@/components/creatives/WebBuilder").then((m) => ({ default: m.WebBuilder }))
);

const WebBuilderPage = () => (
  <VFSProvider>
    <div className="h-screen w-full">
      <Suspense
        fallback={
          <div className="h-screen w-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading Web Builder...</p>
            </div>
          </div>
        }
      >
        <WebBuilder />
      </Suspense>
    </div>
  </VFSProvider>
);

export default WebBuilderPage;
