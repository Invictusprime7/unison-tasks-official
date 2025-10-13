import React, { useState } from 'react';
import MonacoEditor from './MonacoEditor';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, Play, Code2, Eye, Monitor, Maximize2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { LiveCodePreview } from './LiveCodePreview';
import { HTMLComponentPreview } from './HTMLComponentPreview';
import { LiveHTMLPreview } from './LiveHTMLPreview';
import { parseComponentCode } from '@/utils/componentRenderer';

interface CodeViewerProps {
  code: string;
  language?: string;
  onRender?: (code: string) => Promise<void>;
  onMigrateToCanvas?: (code: string) => void;
  className?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code: initialCode,
  language = 'typescript',
  onRender,
  onMigrateToCanvas,
  className,
}) => {
  const [code, setCode] = useState(initialCode || '');
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'live' | 'component'>('code');
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const { toast } = useToast();

  // Parse component for preview
  const [componentData, setComponentData] = useState(() => {
    const safeCode = initialCode || '';
    return parseComponentCode(safeCode);
  });

  // Update code when initialCode changes
  React.useEffect(() => {
    const safeCode = initialCode || '';
    setCode(safeCode);
    setComponentData(parseComponentCode(safeCode));
    console.log('[CodeViewer] Code updated:', safeCode.substring(0, 100));
  }, [initialCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied to clipboard',
      description: 'Code copied successfully',
    });
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `component.${language === 'typescript' ? 'tsx' : language}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: 'Downloaded',
      description: 'Code file downloaded successfully',
    });
  };

  const handleMigrateToCanvas = () => {
    console.log('[CodeViewer] Migrating to Canvas view - exiting panel');
    
    if (onMigrateToCanvas) {
      // Notify parent to close dialog and switch to Canvas view
      onMigrateToCanvas(code);
    } else {
      // Fallback: just switch tabs within the viewer
      setActiveTab('preview');
      toast({
        title: 'Switched to Canvas View',
        description: 'Full live preview now showing in iframe',
      });
    }
  };

  const handleRender = async () => {
    console.log('[CodeViewer] Rendering code to canvas:', code.substring(0, 100));
    if (!onRender) {
      console.warn('[CodeViewer] No onRender callback provided');
      toast({
        title: 'Cannot render',
        description: 'Canvas connection not available',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Show loading toast
      toast({
        title: 'Migrating to canvas...',
        description: 'Converting live preview to Fabric.js canvas objects',
      });

      await onRender(code);
      
      // Switch to canvas view after successful render
      setActiveTab('preview');
      
      toast({
        title: 'Rendered successfully!',
        description: 'Live preview migrated to canvas - view it in the Canvas tab',
      });
    } catch (error) {
      console.error('[CodeViewer] Render error:', error);
      toast({
        title: 'Render failed',
        description: error instanceof Error ? error.message : 'Failed to migrate to canvas',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-background border rounded-lg overflow-hidden', className)}>
      {/* Header with actions */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Code Editor</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-2"
          >
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-8 px-2"
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleMigrateToCanvas}
            className="h-8 px-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Play className="w-4 h-4 mr-1" />
            Migrate to Canvas
          </Button>
        </div>
      </div>

      {/* Editor with tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-4 rounded-none h-10 border-b">
          <TabsTrigger value="code" className="gap-2">
            <Code2 className="w-4 h-4" />
            Code
          </TabsTrigger>
          <TabsTrigger value="component" className="gap-2">
            <Eye className="w-4 h-4" />
            Component
          </TabsTrigger>
          <TabsTrigger value="live" className="gap-2">
            <Monitor className="w-4 h-4" />
            Live Preview
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Play className="w-4 h-4" />
            Canvas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="flex-1 m-0 p-0 data-[state=active]:flex">
          <MonacoEditor
            height="100%"
            defaultLanguage={language}
            language={language}
            value={code}
            onChange={(value) => {
              const newCode = value || '';
              setCode(newCode);
              setComponentData(parseComponentCode(newCode));
            }}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              formatOnPaste: true,
              formatOnType: true,
              padding: { top: 16, bottom: 16 },
            }}
            loading={
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading editor...</p>
                </div>
              </div>
            }
          />
        </TabsContent>


        <TabsContent value="component" className="flex-1 m-0 p-0 data-[state=active]:flex">
          <LiveHTMLPreview 
            code={code}
            autoRefresh={true}
            className="w-full h-full"
          />
        </TabsContent>

        <TabsContent value="live" className="flex-1 m-0 p-0 data-[state=active]:flex flex-col">
          <div className="flex items-center justify-end px-4 py-2 border-b bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreviewExpanded(true)}
              className="h-8 px-2"
            >
              <Maximize2 className="w-4 h-4 mr-1" />
              Expand
            </Button>
          </div>
          <div className="flex-1">
            <LiveHTMLPreview 
              code={code}
              autoRefresh={true}
              className="w-full h-full"
            />
          </div>
        </TabsContent>

        <TabsContent value="preview" className="flex-1 m-0 p-0 data-[state=active]:flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Canvas - Full Live Preview</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreviewExpanded(true)}
              className="h-8 px-2"
            >
              <Maximize2 className="w-4 h-4 mr-1" />
              Expand
            </Button>
          </div>
          <div className="flex-1 bg-white">
            <LiveHTMLPreview 
              code={code}
              autoRefresh={true}
              className="w-full h-full"
              enableSelection={true}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Expanded Preview Dialog */}
      <Dialog open={isPreviewExpanded} onOpenChange={setIsPreviewExpanded}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] h-[95vh] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Live Preview - Expanded View
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreviewExpanded(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <LiveHTMLPreview 
              code={code}
              autoRefresh={true}
              className="w-full h-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
