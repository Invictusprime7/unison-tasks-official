import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

interface TemplateData {
  html: string;
  css?: string;
  previewCode?: string;
}

interface SavedTemplate {
  id: string;
  name: string;
  description: string | null;
  canvas_data: TemplateData;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  thumbnail_url: string | null;
}

export function useTemplateFiles() {
  const [loading, setLoading] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);

  const saveTemplate = useCallback(async (
    name: string,
    description: string,
    isPublic: boolean,
    code: string
  ): Promise<string | null> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to save templates");
        return null;
      }

      const canvasData = {
        html: code,
        previewCode: code,
      } as unknown as Json;

      const { data, error } = await supabase
        .from("design_templates")
        .insert({
          name,
          description: description || null,
          is_public: isPublic,
          user_id: user.id,
          canvas_data: canvasData,
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentTemplateId(data.id);
      toast.success("Template saved!", {
        description: `"${name}" has been saved successfully`,
      });
      
      return data.id;
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTemplate = useCallback(async (
    id: string,
    code: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const canvasData = {
        html: code,
        previewCode: code,
      } as unknown as Json;

      const { error } = await supabase
        .from("design_templates")
        .update({
          canvas_data: canvasData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Template updated!");
      return true;
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("Failed to update template");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTemplate = useCallback(async (id: string): Promise<SavedTemplate | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("design_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setCurrentTemplateId(data.id);
      
      // Cast canvas_data properly
      const template: SavedTemplate = {
        ...data,
        canvas_data: data.canvas_data as unknown as TemplateData,
      };
      
      return template;
    } catch (error) {
      console.error("Error loading template:", error);
      toast.error("Failed to load template");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const autoSave = useCallback(async (code: string): Promise<boolean> => {
    if (!currentTemplateId) return false;
    
    try {
      const canvasData = {
        html: code,
        previewCode: code,
      } as unknown as Json;

      const { error } = await supabase
        .from("design_templates")
        .update({
          canvas_data: canvasData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentTemplateId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Auto-save failed:", error);
      return false;
    }
  }, [currentTemplateId]);

  const clearCurrentTemplate = useCallback(() => {
    setCurrentTemplateId(null);
  }, []);

  return {
    loading,
    currentTemplateId,
    saveTemplate,
    updateTemplate,
    loadTemplate,
    autoSave,
    clearCurrentTemplate,
    setCurrentTemplateId,
  };
}
