import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, Sparkles, Layout, Palette, Globe, Loader2, Eye, Hammer } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TemplateEditor } from "./TemplateEditor";
import { TemplateGeneratorService } from "@/services/templateGeneratorService";
import type { AIGeneratedTemplate } from "@/types/template";

interface WebDesignKitProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  onTemplateGenerated?: (template: AIGeneratedTemplate) => void;
  onCodeGenerated?: (code: string, name: string, aesthetic: string) => void;
}

export const WebDesignKit = ({ open, onOpenChange, onBack, onTemplateGenerated, onCodeGenerated }: WebDesignKitProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [generating, setGenerating] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<{
    name: string;
    aesthetic: string;
    code: string;
  } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AIGeneratedTemplate | null>(null);

  const templateCategories = {
    google: [
      { name: "Material Design Dashboard", aesthetic: "Modern, Clean", preview: "🎨" },
      { name: "Google Workspace UI", aesthetic: "Professional, Minimal", preview: "💼" },
      { name: "Android App Interface", aesthetic: "Mobile-First, Bold", preview: "📱" },
    ],
    canva: [
      { name: "Creative Portfolio", aesthetic: "Vibrant, Artistic", preview: "🎭" },
      { name: "E-commerce Store", aesthetic: "Modern, Conversion-Focused", preview: "🛍️" },
      { name: "Landing Page Pro", aesthetic: "Bold, Engaging", preview: "🚀" },
    ],
    ai: [
      { name: "Glassmorphism UI", aesthetic: "Frosted Glass, Modern", preview: "✨" },
      { name: "Neumorphic Design", aesthetic: "Soft UI, Subtle", preview: "🎯" },
      { name: "Cyberpunk Interface", aesthetic: "Neon, Futuristic", preview: "🌆" },
      { name: "Minimalist SaaS", aesthetic: "Clean, Professional", preview: "📊" },
      { name: "Dark Mode Premium", aesthetic: "Elegant, Sleek", preview: "🌙" },
      { name: "Gradient Mastery", aesthetic: "Colorful, Dynamic", preview: "🌈" },
    ],
  };

  const handleTemplateSelect = async (
    templateName: string,
    aesthetic: string,
    source: string,
    isAI: boolean
  ) => {
    if (!isAI) {
      // Generate predefined template using our service
      try {
        setGenerating(true);
        const template = TemplateGeneratorService.generateTemplate({
          name: templateName,
          aesthetic: aesthetic,
          source: source as 'Google' | 'Canva',
          templateType: templateName
        });

        if (onTemplateGenerated) {
          onTemplateGenerated(template);
          onOpenChange(false);
          toast.success(`${templateName} loaded to canvas!`);
        } else {
          setSelectedTemplate(template);
          setPreviewMode(true);
        }
      } catch (error) {
        console.error("Error generating template:", error);
        toast.error("Failed to generate template. Please try again.");
      } finally {
        setGenerating(false);
      }
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-template", {
        body: { templateName, aesthetic, source },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Pass the generated template to WebBuilder
      if (onCodeGenerated) {
        onCodeGenerated(data.code, templateName, aesthetic);
        onOpenChange(false);
        toast.success("Template loaded in Web Builder!");
      } else {
        setCurrentTemplate({
          name: templateName,
          aesthetic: aesthetic,
          code: data.code,
        });
        setEditorOpen(true);
        toast.success("Template generated successfully!");
      }
    } catch (error) {
      console.error("Error generating template:", error);
      toast.error("Failed to generate template. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleEditorBack = () => {
    setEditorOpen(false);
    setCurrentTemplate(null);
  };

  const handlePreviewBack = () => {
    setPreviewMode(false);
    setSelectedTemplate(null);
  };

  const handleBuildToCanvas = () => {
    if (selectedTemplate && onTemplateGenerated) {
      onTemplateGenerated(selectedTemplate);
      onOpenChange(false);
      toast.success("✨ Template built to canvas!");
    }
  };

  if (editorOpen && currentTemplate) {
    return (
      <TemplateEditor
        open={open}
        onOpenChange={onOpenChange}
        templateName={currentTemplate.name}
        aesthetic={currentTemplate.aesthetic}
        generatedCode={currentTemplate.code}
        onBack={handleEditorBack}
      />
    );
  }

  // Preview mode for predefined templates
  if (previewMode && selectedTemplate) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handlePreviewBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Eye className="h-6 w-6 text-primary" />
                  Template Preview
                </DialogTitle>
                <DialogDescription>
                  {selectedTemplate.name} - {selectedTemplate.description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            {/* Template Info */}
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <h3 className="font-semibold text-lg mb-2">{selectedTemplate.name}</h3>
              <p className="text-muted-foreground mb-3">{selectedTemplate.description}</p>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedTemplate.brandKit.primaryColor }}></div>
                  <span>Primary: {selectedTemplate.brandKit.primaryColor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedTemplate.brandKit.secondaryColor }}></div>
                  <span>Secondary: {selectedTemplate.brandKit.secondaryColor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedTemplate.brandKit.accentColor }}></div>
                  <span>Accent: {selectedTemplate.brandKit.accentColor}</span>
                </div>
              </div>
            </div>

            {/* Template Sections Preview */}
            <div className="space-y-4">
              <h4 className="font-semibold">Template Sections ({selectedTemplate.sections.length})</h4>
              <div className="grid gap-3">
                {selectedTemplate.sections.map((section, index) => (
                  <div key={section.id} className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{section.name}</h5>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {section.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {section.components.length} components • {section.constraints.flexDirection} layout
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handlePreviewBack} variant="outline" className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Templates
              </Button>
              <Button onClick={handleBuildToCanvas} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Hammer className="h-4 w-4 mr-2" />
                Build to Canvas
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Palette className="h-6 w-6 text-primary" />
                Web Design Kit
              </DialogTitle>
              <DialogDescription>
                Choose from integrated templates by Google, Canva, and AI-generated designs
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates by style, aesthetic, or purpose..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs defaultValue="ai" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="google">
              <Globe className="h-4 w-4 mr-2" />
              Google Templates
            </TabsTrigger>
            <TabsTrigger value="canva">
              <Layout className="h-4 w-4 mr-2" />
              Canva Designs
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Generated
            </TabsTrigger>
          </TabsList>

          <TabsContent value="google" className="mt-6">
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">Google Material Design</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Professional templates following Google's Material Design principles
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templateCategories.google.map((template, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow border-blue-200">
                  <CardHeader>
                    <div className="text-4xl mb-2">{template.preview}</div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.aesthetic}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const generatedTemplate = TemplateGeneratorService.generateTemplate({
                          name: template.name,
                          aesthetic: template.aesthetic,
                          source: 'Google',
                          templateType: template.name
                        });
                        setSelectedTemplate(generatedTemplate);
                        setPreviewMode(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Template
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() =>
                        handleTemplateSelect(template.name, template.aesthetic, "Google", false)
                      }
                      disabled={generating}
                    >
                      {generating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Building...
                        </>
                      ) : (
                        <>
                          <Hammer className="h-4 w-4 mr-2" />
                          Build to Canvas
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="canva" className="mt-6">
            <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-2">
                <Layout className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">Canva-Style Designs</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Creative and engaging templates with modern aesthetics and vibrant colors
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templateCategories.canva.map((template, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow border-purple-200">
                  <CardHeader>
                    <div className="text-4xl mb-2">{template.preview}</div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.aesthetic}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const generatedTemplate = TemplateGeneratorService.generateTemplate({
                          name: template.name,
                          aesthetic: template.aesthetic,
                          source: 'Canva',
                          templateType: template.name
                        });
                        setSelectedTemplate(generatedTemplate);
                        setPreviewMode(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Template
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() =>
                        handleTemplateSelect(template.name, template.aesthetic, "Canva", false)
                      }
                      disabled={generating}
                    >
                      {generating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Building...
                        </>
                      ) : (
                        <>
                          <Hammer className="h-4 w-4 mr-2" />
                          Build to Canvas
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ai" className="mt-6">
            <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">AI-Generated Templates</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    These templates are generated based on popular UI aesthetics and modern design trends
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templateCategories.ai.map((template, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow border-primary/20">
                  <CardHeader>
                    <div className="text-4xl mb-2">{template.preview}</div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.aesthetic}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      onClick={() =>
                        handleTemplateSelect(template.name, template.aesthetic, "AI", true)
                      }
                      disabled={generating}
                    >
                      {generating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        "Generate & Use"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
