import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Trash2, Download, Eye } from "lucide-react";
import { format } from "date-fns";

interface Template {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  canvas_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface TemplateLibraryPanelProps {
  onLoadTemplate: (canvasData: Record<string, unknown>) => void;
}

export const TemplateLibraryPanel = ({ onLoadTemplate }: TemplateLibraryPanelProps) => {
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["design-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("design_templates")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as Template[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from("design_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["design-templates"] });
      toast.success("Template deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete template");
      console.error(error);
    },
  });

  const handleLoad = (template: Template) => {
    onLoadTemplate(template.canvas_data);
    toast.success(`Loaded template: ${template.name}`);
  };

  const handleExport = (template: Template) => {
    const dataStr = JSON.stringify(template.canvas_data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${template.name.replace(/\s+/g, "-")}-template.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Template exported");
  };

  return (
    <div className="p-4">
      <ScrollArea className="h-[calc(100vh-180px)]">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : templates && templates.length > 0 ? (
          <div className="space-y-4">
            {templates.map((template) => (
              <Card key={template.id} className="w-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  {template.description && (
                    <CardDescription className="text-sm">{template.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-xs text-muted-foreground">
                    Last updated: {format(new Date(template.updated_at), "MMM d, yyyy")}
                  </p>
                </CardContent>
                <CardFooter className="flex gap-2 pt-0">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleLoad(template)}
                    className="flex-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Load
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExport(template)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(template.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No templates yet. Create your first template!</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};