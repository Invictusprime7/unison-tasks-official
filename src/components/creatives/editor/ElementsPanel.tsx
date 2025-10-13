import { useState } from "react";
import { Canvas as FabricCanvas } from "fabric";
import { Input } from "@/components/ui/input";
import { Square, Circle, Type, Image, Triangle, Minus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ElementsPanelProps {
  fabricCanvas: FabricCanvas | null;
  onAddShape: (type: "rectangle" | "circle" | "text" | "image" | "line") => void;
}

export const ElementsPanel = ({ fabricCanvas, onAddShape }: ElementsPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const elements = [
    { id: "rectangle", label: "Rectangle", icon: Square },
    { id: "circle", label: "Circle", icon: Circle },
    { id: "text", label: "Text", icon: Type },
    { id: "line", label: "Line", icon: Minus },
  ];

  const filteredElements = elements.filter(el =>
    el.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm mb-3">Elements</h3>
        <Input
          type="text"
          placeholder="Search elements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      {/* Elements List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredElements.map((element) => {
            const Icon = element.icon;
            return (
              <button
                key={element.id}
                onClick={() => onAddShape(element.id as any)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">{element.label}</span>
              </button>
            );
          })}
        </div>

        {/* Templates Section */}
        <div className="p-4 border-t border-border">
          <h4 className="font-semibold text-sm mb-3 text-muted-foreground">Templates</h4>
          <div className="space-y-2">
            <div className="p-3 rounded-lg border border-border bg-muted/30 text-center text-sm text-muted-foreground">
              Templates coming soon
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
