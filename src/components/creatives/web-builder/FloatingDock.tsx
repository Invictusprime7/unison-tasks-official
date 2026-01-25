import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cloud, FolderOpen, Layout, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LayoutTemplatesPanel } from "./LayoutTemplatesPanel";
import { ProjectsPanel } from "./ProjectsPanel";
import { CloudPanel } from "./CloudPanel";
import type { BusinessSystemType } from "@/data/templates/types";

interface SavedTemplate {
  id: string;
  name: string;
  description: string | null;
  canvas_data: {
    html: string;
    css?: string;
    js?: string;
    previewCode?: string;
  };
  is_public: boolean;
  created_at: string;
  updated_at: string;
  thumbnail_url: string | null;
}

interface FloatingDockProps {
  onSelectTemplate: (code: string, name: string, systemType?: BusinessSystemType, templateId?: string) => void;
  onLoadTemplate: (template: SavedTemplate) => void;
  onSaveTemplate: (name: string, description: string, isPublic?: boolean) => Promise<void>;
  currentCode: string;
  cloudState: {
    business: {
      id: string;
      name: string;
    };
  };
  onNavigateToCloud: () => void;
}

type DockPanel = "templates" | "projects" | "cloud" | null;

export const FloatingDock = ({
  onSelectTemplate,
  onLoadTemplate,
  onSaveTemplate,
  currentCode,
  cloudState,
  onNavigateToCloud,
}: FloatingDockProps) => {
  const [activePanel, setActivePanel] = useState<DockPanel>(null);

  const togglePanel = (panel: DockPanel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const dockItems = [
    { id: "templates" as const, label: "Templates", icon: Layout },
    { id: "projects" as const, label: "Projects", icon: FolderOpen },
    { id: "cloud" as const, label: "Cloud", icon: Cloud },
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
      {/* Dock Bar */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-card/95 backdrop-blur-md border border-border/40 rounded-full shadow-lg">
        {dockItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => togglePanel(item.id)}
              className={cn(
                "h-8 px-3 rounded-full text-xs font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-3.5 w-3.5 mr-1.5" />
              {item.label}
            </Button>
          );
        })}
      </div>

      {/* Expandable Panel */}
      {activePanel && (
        <div className="mt-2 w-[400px] max-h-[60vh] bg-card/98 backdrop-blur-lg border border-border/40 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-muted/30">
            <span className="text-sm font-medium text-foreground">
              {dockItems.find((d) => d.id === activePanel)?.label}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActivePanel(null)}
              className="h-6 w-6 rounded-full hover:bg-accent"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Panel Content */}
          <ScrollArea className="h-[calc(60vh-48px)]">
            {activePanel === "templates" && (
              <LayoutTemplatesPanel onSelectTemplate={onSelectTemplate} />
            )}
            {activePanel === "projects" && (
              <ProjectsPanel
                onLoadTemplate={onLoadTemplate}
                onSaveTemplate={onSaveTemplate}
                currentCode={currentCode}
              />
            )}
            {activePanel === "cloud" && (
              <CloudPanel
                businessId={cloudState.business.id}
                businessName={cloudState.business.name}
                onNavigateToCloud={onNavigateToCloud}
              />
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
