import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Canvas as FabricCanvas, FabricImage } from 'fabric';
import { Sparkles, Loader2, Image as ImageIcon, Wand2, Plus } from 'lucide-react';

interface AIImagesQuickPanelProps {
  fabricCanvas: FabricCanvas | null;
}

export const AIImagesQuickPanel = ({ fabricCanvas }: AIImagesQuickPanelProps) => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const quickPrompts = [
    'Modern office workspace',
    'Abstract geometric pattern',
    'Nature landscape scene',
    'Minimalist product photo',
    'Colorful background texture',
    'Professional business person',
    'Technology concept art',
    'Creative design elements',
  ];

  const handleQuickGenerate = async (quickPrompt: string) => {
    setPrompt(quickPrompt);
    await generateImage(quickPrompt);
  };

  const generateImage = async (imagePrompt: string) => {
    if (!imagePrompt.trim()) {
      toast({
        title: 'Missing Prompt',
        description: 'Please enter a description for the image.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          prompt: imagePrompt + ' (high quality, professional)',
        }
      });

      if (error) {
        throw error;
      }

      const newImageUrl = data.imageUrl;
      setGeneratedImages(prev => [newImageUrl, ...prev.slice(0, 4)]); // Keep last 5 images
      
      toast({
        title: 'Image Generated!',
        description: 'Click the image to add it to your canvas.',
      });
    } catch (error: unknown) {
      console.error('Error generating image:', error);
      const errorMessage = (error as Error)?.message || 'Unknown error';
      
      if (errorMessage.includes('429')) {
        toast({
          title: 'Rate Limit Exceeded',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      } else if (errorMessage.includes('402')) {
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
      setLoading(false);
    }
  };

  const addImageToCanvas = async (imageUrl: string) => {
    if (!fabricCanvas) {
      toast({
        title: 'Error',
        description: 'Canvas not ready.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const imgElement = new Image();
      imgElement.crossOrigin = 'anonymous';
      
      imgElement.onload = () => {
        FabricImage.fromURL(imageUrl).then((fabricImg) => {
          const canvasWidth = fabricCanvas.width || 800;
          const canvasHeight = fabricCanvas.height || 600;
          const maxSize = Math.min(canvasWidth, canvasHeight) * 0.4;
          
          const scaleFactor = Math.min(
            maxSize / fabricImg.width!,
            maxSize / fabricImg.height!,
            1
          );

          fabricImg.set({
            left: Math.random() * (canvasWidth - fabricImg.width! * scaleFactor),
            top: Math.random() * (canvasHeight - fabricImg.height! * scaleFactor),
            scaleX: scaleFactor,
            scaleY: scaleFactor,
          });

          fabricCanvas.add(fabricImg);
          fabricCanvas.setActiveObject(fabricImg);
          fabricCanvas.renderAll();

          toast({
            title: 'Image Added!',
            description: 'AI image added to canvas.',
          });
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
          description: 'Failed to load image.',
          variant: 'destructive',
        });
      };

      imgElement.src = imageUrl;
    } catch (error) {
      console.error('Error adding image to canvas:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-3">
        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-purple-600" />
            Generate AI Image
          </Label>
          <Input
            placeholder="Describe your image..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="text-xs h-8"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                generateImage(prompt);
              }
            }}
          />
          <Button
            onClick={() => generateImage(prompt)}
            disabled={loading || !prompt.trim()}
            size="sm"
            className="w-full h-7 text-xs bg-purple-600 hover:bg-purple-500"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-3 w-3 mr-1" />
                Generate
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-600">Quick Ideas</Label>
          <div className="grid grid-cols-1 gap-1">
            {quickPrompts.map((quickPrompt, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => handleQuickGenerate(quickPrompt)}
                disabled={loading}
                className="justify-start h-6 text-[10px] text-gray-600 hover:text-purple-600 hover:bg-purple-50 px-2"
              >
                <Plus className="h-3 w-3 mr-1" />
                {quickPrompt}
              </Button>
            ))}
          </div>
        </div>

        {generatedImages.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-600">Recent Images</Label>
            <div className="grid grid-cols-2 gap-2">
              {generatedImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer border rounded overflow-hidden bg-gray-50"
                  onClick={() => addImageToCanvas(imageUrl)}
                >
                  <img
                    src={imageUrl}
                    alt={`Generated ${index + 1}`}
                    className="w-full h-16 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Plus className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};