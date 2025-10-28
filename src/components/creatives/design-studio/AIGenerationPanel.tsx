import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Canvas as FabricCanvas, FabricImage } from 'fabric';
import { Sparkles, Loader2, Image as ImageIcon, Layout, Wand2 } from 'lucide-react';
import { useAITemplate } from '@/hooks/useAITemplate';
import type { AITemplatePrompt, AIGeneratedTemplate } from '@/types/template';

interface AIGenerationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateGenerated: (template: AIGeneratedTemplate) => void;
  fabricCanvas: FabricCanvas | null;
}

export const AIGenerationPanel = ({
  open,
  onOpenChange,
  onTemplateGenerated,
  fabricCanvas,
}: AIGenerationPanelProps) => {
  const { toast } = useToast();
  const { loading: templateLoading, generateTemplate } = useAITemplate();
  
  // Template generation state
  const [templateData, setTemplateData] = useState<Partial<AITemplatePrompt>>({
    industry: '',
    goal: '',
    format: 'web',
    preferredStyle: 'modern',
  });

  // Image generation state
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('photorealistic');
  const [imageLoading, setImageLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // Chat-like left panel state
  type ChatMsg = { role: 'user' | 'assistant'; content: string };
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', content: 'Tell me what you want to create. Choose a style on the right and press Generate.' },
  ]);
  const [mode, setMode] = useState<'image' | 'template'>('image');

  const handleTemplateGenerate = async () => {
    if (!templateData.industry || !templateData.goal) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in industry and goal fields.',
        variant: 'destructive',
      });
      return;
    }

    const template = await generateTemplate(templateData as AITemplatePrompt);
    if (template && onTemplateGenerated) {
      onTemplateGenerated(template);
      onOpenChange(false);
    }
  };

  const handleImageGenerate = async () => {
    if (!imagePrompt.trim()) {
      toast({
        title: 'Missing Prompt',
        description: 'Please enter a description for the image.',
        variant: 'destructive',
      });
      return;
    }

    setImageLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          prompt: `${imagePrompt} (${imageStyle} style)`,
          style: imageStyle 
        }
      });

      if (error) {
        throw error;
      }

      setGeneratedImageUrl(data.imageUrl);
      toast({
        title: 'Image Generated!',
        description: 'Your AI-generated image is ready. Click "Add to Canvas" to use it.',
      });
      setMessages((m) => [...m, { role: 'user', content: imagePrompt }, { role: 'assistant', content: 'Image generated. Preview on the right.' }]);
    } catch (error: unknown) {
      console.error('Error generating image:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage?.includes('429')) {
        toast({
          title: 'Rate Limit Exceeded',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      } else if (errorMessage?.includes('402')) {
        toast({
          title: 'Payment Required',
          description: 'Please add credits to your workspace.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Generation Failed',
          description: 'Failed to generate image. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (mode === 'image') {
      await handleImageGenerate();
    } else {
      await handleTemplateGenerate();
    }
  };

  const handleAddImageToCanvas = async () => {
    if (!generatedImageUrl || !fabricCanvas) {
      toast({
        title: 'Error',
        description: 'No image to add or canvas not ready.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create image element and load it
      const imgElement = new Image();
      imgElement.crossOrigin = 'anonymous';
      
      imgElement.onload = () => {
        FabricImage.fromURL(generatedImageUrl).then((fabricImg) => {
          // Calculate optimal size and position
          const canvasWidth = fabricCanvas.width || 800;
          const canvasHeight = fabricCanvas.height || 600;
          const maxSize = Math.min(canvasWidth, canvasHeight) * 0.6;
          
          const scaleFactor = Math.min(
            maxSize / fabricImg.width!,
            maxSize / fabricImg.height!,
            1
          );

          fabricImg.set({
            left: (canvasWidth - fabricImg.width! * scaleFactor) / 2,
            top: (canvasHeight - fabricImg.height! * scaleFactor) / 2,
            scaleX: scaleFactor,
            scaleY: scaleFactor,
          });

          fabricCanvas.add(fabricImg);
          fabricCanvas.setActiveObject(fabricImg);
          fabricCanvas.renderAll();

          toast({
            title: 'Image Added!',
            description: 'AI-generated image has been added to your canvas.',
          });

          // Clear the generated image
          setGeneratedImageUrl(null);
          setImagePrompt('');
        }).catch((error) => {
          console.error('Error creating fabric image:', error);
          toast({
            title: 'Error',
            description: 'Failed to add image to canvas.',
            variant: 'destructive',
          });
        });
      };

      imgElement.onerror = () => {
        toast({
          title: 'Error',
          description: 'Failed to load the generated image.',
          variant: 'destructive',
        });
      };

      imgElement.src = generatedImageUrl;
    } catch (error) {
      console.error('Error adding image to canvas:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const imageStyles = [
    { value: 'photorealistic', label: 'Photorealistic' },
    { value: 'digital-art', label: 'Digital Art' },
    { value: 'illustration', label: 'Illustration' },
    { value: 'painting', label: 'Oil Painting' },
    { value: 'watercolor', label: 'Watercolor' },
    { value: 'sketch', label: 'Sketch' },
    { value: 'cartoon', label: 'Cartoon' },
    { value: 'abstract', label: 'Abstract' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'vintage', label: 'Vintage' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="h-full grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-3">
          {/* Left: chat + prompt */}
          <div className="flex flex-col min-h-0">
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2 text-sm font-medium"><Sparkles className="h-4 w-4 text-primary" /> AI Studio</div>
              <div className="flex gap-1">
                <Button size="sm" variant={mode==='image'?'default':'outline'} onClick={()=>setMode('image')}>Image</Button>
                <Button size="sm" variant={mode==='template'?'default':'outline'} onClick={()=>setMode('template')}>Template</Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto rounded border p-2 bg-muted/30">
              {messages.map((m, i) => (
                <div key={i} className={`text-sm p-2 my-1 rounded ${m.role==='user'?'bg-white':'bg-transparent text-gray-600'}`}>{m.content}</div>
              ))}
            </div>
            <div className="mt-2 space-y-2">
              {mode==='template' ? (
                <div className="grid grid-cols-1 gap-2">
                  <Input placeholder="Industry *" value={templateData.industry || ''} onChange={(e)=>setTemplateData({ ...templateData, industry: e.target.value })} />
                  <Input placeholder="Goal *" value={templateData.goal || ''} onChange={(e)=>setTemplateData({ ...templateData, goal: e.target.value })} />
                  <Textarea rows={3} placeholder="Additional details (optional)" value={templateData.targetAudience || ''} onChange={(e)=>setTemplateData({ ...templateData, targetAudience: e.target.value })} />
                </div>
              ) : (
                <Textarea rows={3} placeholder="Describe the image you want to generate..." value={imagePrompt} onChange={(e)=>setImagePrompt(e.target.value)} />
              )}
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleSubmit} disabled={mode==='image' ? (imageLoading || !imagePrompt.trim()) : (templateLoading || !templateData.industry || !templateData.goal)}>
                  {mode==='image' ? (imageLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating…</>) : (<><ImageIcon className="mr-2 h-4 w-4" />Generate</>)) : (templateLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating…</>) : (<><Layout className="mr-2 h-4 w-4" />Generate</>))}
                </Button>
                <Button variant="outline" onClick={()=>onOpenChange(false)}>Close</Button>
              </div>
            </div>
          </div>

          {/* Right: styles + live preview */}
          <div className="flex flex-col min-h-0">
            <div>
              <div className="text-xs text-gray-600 mb-1">Art Styles</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {imageStyles.map((style) => (
                  <Button key={style.value} variant={imageStyle === style.value ? 'default' : 'outline'} size="sm" onClick={() => setImageStyle(style.value)} className="text-xs">
                    {style.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="mt-3 flex-1 overflow-auto rounded border bg-white p-2 flex items-center justify-center">
              {generatedImageUrl ? (
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">Preview</div>
                    <Button size="sm" className="bg-green-600 hover:bg-green-500" onClick={handleAddImageToCanvas}><Wand2 className="h-4 w-4 mr-1" />Add to Canvas</Button>
                  </div>
                  <img src={generatedImageUrl} alt="Generated" className="w-full max-h-[360px] object-contain bg-white rounded" />
                </div>
              ) : (
                <div className="text-sm text-gray-500">No preview yet. Generate an image or a template.</div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
