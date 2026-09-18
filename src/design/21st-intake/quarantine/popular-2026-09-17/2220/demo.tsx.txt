import { FaBolt } from "react-icons/fa";
import { SpotlightCard } from "@/components/ui/spotlight-card";

const DemoOne = () => {
  return (
    <div className="flex w-full h-screen justify-center items-center">
      <SpotlightCard
        className="magic-card flex flex-col gap-4 max-w-[30rem] rounded-4xl bg-white   border border-primary/10 shadow-2xl/10"
        spotlightColor="#ff006630"
      >
        <div className="text-2xl font-bold flex items-center gap-2">
          <FaBolt className="text-yellow-500" />
          <span>Lighting Fast</span>
        </div>
        <div className="text-muted-foreground">
          Optimized for performance with minimal bundle size. Build fast, responsive
          websites without compromise.
        </div>
      </SpotlightCard>
    </div>
  );
};

export { DemoOne };
