/**
 * AI Image Generator Dialog
 * Integrated image generation modal for web builder
 * Allows users to generate AI images and insert them into canvas
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Wand2,
  Sparkles,
  Download,
  Copy,
  Check,
  Loader2,
  ImageIcon,
  RefreshCw
} from 'lucide-react';
import {
  aiImageService,
  ImageGenerationOptions,
  GeneratedImage,
  ImageGenerationProgress
} from '@/services/aiImageGenerationService';

interface AIImageGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageGenerated?: (imageUrl: string, metadata?: Record<string, unknown>) => void;
  defaultPrompt?: string;
  context?: {
    brandColors?: string[];
    brandStyle?: string;
    websiteTheme?: string;
  };
}

export const AIImageGeneratorDialog: React.FC<AIImageGeneratorDialogProps> = ({
  open,
  onOpenChange,
  onImageGenerated,
  defaultPrompt = '',
  context
}) => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [style, setStyle] = useState<string>('digital-art');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [quality, setQuality] = useState<string>('high');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [progress, setProgress] = useState<ImageGenerationProgress | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please describe the image you want to generate',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setProgress(null);

    try {
      const options: ImageGenerationOptions = {
        prompt: prompt.trim(),
        negativePrompt: negativePrompt.trim() || undefined,
        style: style as ImageGenerationOptions['style'],
        aspectRatio: aspectRatio as ImageGenerationOptions['aspectRatio'],
        quality: quality as ImageGenerationOptions['quality']
      };

      const image = await aiImageService.generateImage(options, (progressUpdate) => {
        setProgress(progressUpdate);
      });

      setGeneratedImage(image);
      
      toast({
        title: 'Image Generated! ✨',
        description: 'Your AI image is ready to use'
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Image generation error:', error);
      toast({
        title: 'Generation Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsertToCanvas = () => {
    if (generatedImage && onImageGenerated) {
      onImageGenerated(generatedImage.url, generatedImage.metadata);
      toast({
        title: 'Image Inserted! 🎨',
        description: 'AI-generated image added to canvas'
      });
      onOpenChange(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage.url;
      link.download = `ai-image-${Date.now()}.png`;
      link.click();
      
      toast({
        title: 'Downloaded!',
        description: 'Image saved to your downloads'
      });
    }
  };

  const handleCopyUrl = async () => {
    if (generatedImage) {
      await navigator.clipboard.writeText(generatedImage.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: 'URL Copied!',
        description: 'Image URL copied to clipboard'
      });
    }
  };

  const handleSaveToFiles = async () => {
    if (generatedImage) {
      try {
        const { url } = await aiImageService.saveToFiles(generatedImage);
        toast({
          title: 'Saved to Files! 📁',
          description: 'Image saved to your file library'
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast({
          title: 'Save Failed',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    }
  };

  const styleOptions = [
    { value: 'digital-art', label: 'Digital Art', icon: '🎨' },
    { value: 'realistic', label: 'Realistic', icon: '📷' },
    { value: 'artistic', label: 'Artistic', icon: '🖼️' },
    { value: 'photography', label: 'Photography', icon: '📸' },
    { value: 'illustration', label: 'Illustration', icon: '✏️' },
    { value: 'anime', label: 'Anime', icon: '🎌' },
    { value: '3d-render', label: '3D Render', icon: '🎲' }
  ];

  const aspectRatios = [
    { value: '1:1', label: 'Square (1:1)', icon: '⬜' },
    { value: '16:9', label: 'Landscape (16:9)', icon: '🖼️' },
    { value: '9:16', label: 'Portrait (9:16)', icon: '📱' },
    { value: '4:3', label: 'Classic (4:3)', icon: '🖥️' },
    { value: '3:4', label: 'Photo (3:4)', icon: '📷' }
  ];

  const qualityOptions = [
    { value: 'standard', label: 'Standard', desc: 'Fast generation' },
    { value: 'high', label: 'High', desc: 'Best quality' },
    { value: 'ultra', label: 'Ultra', desc: 'Maximum detail' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-950 text-slate-100 border-slate-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-purple-500" />
            AI Image Generator
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Generate professional images using AI for your web designs
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Left Panel - Controls */}
          <div className="space-y-4">
            {/* Prompt */}
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-slate-200 font-semibold">
                Describe Your Image
              </Label>
              <Textarea
                id="prompt"
                placeholder="e.g., Modern office workspace with minimalist design, natural lighting, plants..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="bg-slate-900 border-slate-700 text-slate-100 focus:border-purple-500"
              />
              {context && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {context.brandStyle && (
                    <Badge variant="secondary" className="bg-purple-900/30 text-purple-300">
                      Style: {context.brandStyle}
                    </Badge>
                  )}
                  {context.websiteTheme && (
                    <Badge variant="secondary" className="bg-blue-900/30 text-blue-300">
                      Theme: {context.websiteTheme}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Negative Prompt */}
            <div className="space-y-2">
              <Label htmlFor="negativePrompt" className="text-slate-200 text-sm">
                Negative Prompt (Optional)
              </Label>
              <Input
                id="negativePrompt"
                placeholder="e.g., blurry, low quality, distorted..."
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="bg-slate-900 border-slate-700 text-slate-100"
              />
            </div>

            {/* Style Selection */}
            <div className="space-y-2">
              <Label className="text-slate-200 font-semibold">Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {styleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-slate-100">
                      {option.icon} {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <Label className="text-slate-200 font-semibold">Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {aspectRatios.map((ratio) => (
                    <SelectItem key={ratio.value} value={ratio.value} className="text-slate-100">
                      {ratio.icon} {ratio.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quality */}
            <div className="space-y-2">
              <Label className="text-slate-200 font-semibold">Quality</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {qualityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-slate-100">
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-slate-400">{option.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-6"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate Image
                </>
              )}
            </Button>

            {/* Progress */}
            {progress && (
              <div className="space-y-2 p-4 bg-slate-900 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{progress.message}</span>
                  <span className="text-purple-400 font-semibold">{progress.progress}%</span>
                </div>
                <Progress value={progress.progress} className="h-2" />
                {progress.estimatedTimeRemaining && (
                  <p className="text-xs text-slate-400">
                    ~{progress.estimatedTimeRemaining}s remaining
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-4">
            <Label className="text-slate-200 font-semibold">Preview</Label>
            <div className="aspect-video bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center overflow-hidden">
              {generatedImage ? (
                <img
                  src={generatedImage.url}
                  alt="Generated"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-500 p-8">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Your generated image will appear here</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {generatedImage && (
              <div className="space-y-2">
                <Button
                  onClick={handleInsertToCanvas}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Insert to Canvas
                </Button>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  
                  <Button
                    onClick={handleCopyUrl}
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy URL
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleSaveToFiles}
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>

                <Button
                  onClick={() => setGeneratedImage(null)}
                  variant="ghost"
                  className="w-full text-slate-400 hover:text-slate-200"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate New Image
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
