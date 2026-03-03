import { VFSProvider } from "@/contexts/VFSContext";
import { WebBuilder } from "@/components/creatives/WebBuilder";

const WebBuilderPage = () => (
  <VFSProvider>
    <div className="h-screen w-full">
      <WebBuilder />
    </div>
  </VFSProvider>
);

export default WebBuilderPage;
