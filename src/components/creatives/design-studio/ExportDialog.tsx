import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileCode, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  html: string;
  css: string;
}

export const ExportDialog = ({
  open,
  onOpenChange,
  html,
  css,
}: ExportDialogProps) => {
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedCss, setCopiedCss] = useState(false);

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const downloadHTML = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Design</title>
    <style>
${css}
    </style>
</head>
<body>
${html}
</body>
</html>`;
    downloadFile(fullHtml, 'design.html', 'text/html');
  };

  const downloadCSS = () => {
    downloadFile(css, 'styles.css', 'text/css');
  };

  const downloadBoth = () => {
    downloadHTML();
    setTimeout(() => downloadCSS(), 300);
  };

  const copyToClipboard = async (text: string, type: 'html' | 'css') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'html') {
        setCopiedHtml(true);
        setTimeout(() => setCopiedHtml(false), 2000);
      } else {
        setCopiedCss(true);
        setTimeout(() => setCopiedCss(false), 2000);
      }
      toast.success(`${type.toUpperCase()} copied to clipboard`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Export Design</DialogTitle>
          <DialogDescription>
            Download your design as HTML/CSS files or copy the code
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="flex gap-2">
            <Button onClick={downloadBoth} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download All Files
            </Button>
            <Button onClick={downloadHTML} variant="outline">
              <FileCode className="mr-2 h-4 w-4" />
              HTML
            </Button>
            <Button onClick={downloadCSS} variant="outline">
              <FileCode className="mr-2 h-4 w-4" />
              CSS
            </Button>
          </div>

          <Tabs defaultValue="html" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="css">CSS</TabsTrigger>
            </TabsList>

            <TabsContent value="html" className="mt-4">
              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute right-2 top-2 z-10"
                  onClick={() => copyToClipboard(html, 'html')}
                >
                  {copiedHtml ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <ScrollArea className="h-[300px] w-full rounded-md border bg-muted p-4">
                  <pre className="text-sm">
                    <code>{html}</code>
                  </pre>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="css" className="mt-4">
              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute right-2 top-2 z-10"
                  onClick={() => copyToClipboard(css, 'css')}
                >
                  {copiedCss ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <ScrollArea className="h-[300px] w-full rounded-md border bg-muted p-4">
                  <pre className="text-sm">
                    <code>{css}</code>
                  </pre>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
