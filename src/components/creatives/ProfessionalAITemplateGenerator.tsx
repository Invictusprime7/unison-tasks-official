/**
 * Professional AI Template Generator Component
 * Integrates advanced design theory and comprehensive prompt interface
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useProfessionalAITemplate } from '@/hooks/useProfessionalAITemplate';
import { Sparkles, Loader2, Palette, Layout, Type, Zap } from 'lucide-react';
import type { ProfessionalAIPrompt } from '@/schemas/professionalTemplateSchema';

interface ProfessionalAITemplateGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateGenerated?: (template: any) => void;
}

export const ProfessionalAITemplateGenerator = ({
  open,
  onOpenChange,
  onTemplateGenerated,
}: ProfessionalAITemplateGeneratorProps) => {
  const { loading, progress, generateTemplate } = useProfessionalAITemplate();
  
  const [formData, setFormData] = useState<Partial<ProfessionalAIPrompt>>({
    designStyle: 'modern',
    colorHarmony: 'complementary',
    brandPersonality: 'trustworthy',
    targetEmotion: 'professional',
    industryContext: 'saas',
  });

  const handleGenerate = async () => {
    if (!formData.industryContext) {
      return;
    }

    const template = await generateTemplate(formData as ProfessionalAIPrompt, {
      useLocalEngine: true,
      saveToDatabase: false,
    });

    if (template && onTemplateGenerated) {
      onTemplateGenerated(template);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Professional AI Template Generator
          </DialogTitle>
          <DialogDescription>
            Generate professional-grade templates with advanced design theory, WCAG AAA compliance,
            and modern design trends. Powered by CIELAB color science and industry-specific patterns.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Generating your professional template... {progress}%
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Industry & Context */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Layout className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Industry & Context</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industryContext">Industry *</Label>
                <Select
                  value={formData.industryContext}
                  onValueChange={(value: any) => 
                    setFormData({ ...formData, industryContext: value })
                  }
                >
                  <SelectTrigger id="industryContext">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="e-commerce">E-Commerce</SelectItem>
                    <SelectItem value="saas">SaaS</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="portfolio">Portfolio</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="documentation">Documentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  placeholder="e.g., Young professionals, Enterprise clients"
                  value={formData.targetAudience || ''}
                  onChange={(e) => 
                    setFormData({ ...formData, targetAudience: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Design Style & Aesthetics */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Design Style & Aesthetics</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="designStyle">Design Style</Label>
                <Select
                  value={formData.designStyle}
                  onValueChange={(value: any) => 
                    setFormData({ ...formData, designStyle: value })
                  }
                >
                  <SelectTrigger id="designStyle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimalist">
                      <div className="flex items-center gap-2">
                        <span>Minimalist</span>
                        <Badge variant="outline">Clean</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="maximalist">Maximalist</SelectItem>
                    <SelectItem value="brutalist">Brutalist</SelectItem>
                    <SelectItem value="glassmorphism">
                      <div className="flex items-center gap-2">
                        <span>Glassmorphism</span>
                        <Badge variant="outline">Trending</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="neumorphism">Neumorphism</SelectItem>
                    <SelectItem value="classic">Classic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="colorHarmony">Color Harmony</Label>
                <Select
                  value={formData.colorHarmony}
                  onValueChange={(value: any) => 
                    setFormData({ ...formData, colorHarmony: value })
                  }
                >
                  <SelectTrigger id="colorHarmony">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monochromatic">Monochromatic</SelectItem>
                    <SelectItem value="analogous">Analogous</SelectItem>
                    <SelectItem value="complementary">Complementary</SelectItem>
                    <SelectItem value="triadic">Triadic</SelectItem>
                    <SelectItem value="split-complementary">Split-Complementary</SelectItem>
                    <SelectItem value="tetradic">Tetradic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Brand Personality & Emotion */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Brand Personality & Emotion</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brandPersonality">Brand Personality</Label>
                <Select
                  value={formData.brandPersonality}
                  onValueChange={(value: any) => 
                    setFormData({ ...formData, brandPersonality: value })
                  }
                >
                  <SelectTrigger id="brandPersonality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trustworthy">Trustworthy (Blue)</SelectItem>
                    <SelectItem value="innovative">Innovative (Purple)</SelectItem>
                    <SelectItem value="luxurious">Luxurious (Dark)</SelectItem>
                    <SelectItem value="playful">Playful (Orange)</SelectItem>
                    <SelectItem value="authoritative">Authoritative (Navy)</SelectItem>
                    <SelectItem value="energetic">Energetic (Red)</SelectItem>
                    <SelectItem value="calm">Calm (Green)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="targetEmotion">Target Emotion</Label>
                <Select
                  value={formData.targetEmotion}
                  onValueChange={(value: any) => 
                    setFormData({ ...formData, targetEmotion: value })
                  }
                >
                  <SelectTrigger id="targetEmotion">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calm">Calm</SelectItem>
                    <SelectItem value="energetic">Energetic</SelectItem>
                    <SelectItem value="confident">Confident</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Type className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Advanced Options</h3>
            </div>

            <div>
              <Label htmlFor="customRequirements">Custom Requirements</Label>
              <Textarea
                id="customRequirements"
                placeholder="Any specific requirements, features, or constraints..."
                value={formData.customRequirements || ''}
                onChange={(e) => 
                  setFormData({ ...formData, customRequirements: e.target.value })
                }
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="keyMessages">Key Messages (comma-separated)</Label>
              <Input
                id="keyMessages"
                placeholder="e.g., Fast, Reliable, Secure"
                value={formData.keyMessages?.join(', ') || ''}
                onChange={(e) => 
                  setFormData({ 
                    ...formData, 
                    keyMessages: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })
                }
              />
            </div>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg">
            <Badge variant="secondary">WCAG AAA Compliant</Badge>
            <Badge variant="secondary">CIELAB Color Science</Badge>
            <Badge variant="secondary">Golden Ratio Spacing</Badge>
            <Badge variant="secondary">Fluid Typography</Badge>
            <Badge variant="secondary">Material Design 3.0</Badge>
            <Badge variant="secondary">Industry Patterns</Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={loading || !formData.industryContext}
              className="min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Professional Template
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
