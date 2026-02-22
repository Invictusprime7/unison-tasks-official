import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { platformFeatures } from "./constants";

export function FeaturesSection() {
  return (
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
  );
}
