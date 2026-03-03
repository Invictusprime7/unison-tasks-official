import { WebBuilder } from "@/components/creatives/WebBuilder";
import { VFSProvider } from "@/contexts/VFSContext";

const WebBuilderPage = () => {
  return (
    <VFSProvider>
      <div className="h-screen w-full">
        <WebBuilder />
      </div>
    </VFSProvider>
  );
};

export default WebBuilderPage;
