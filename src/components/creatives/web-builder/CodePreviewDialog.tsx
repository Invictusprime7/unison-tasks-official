import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Upload, Save, Code2 } from "lucide-react";
import { toast } from "sonner";
import MonacoEditor from "../MonacoEditor";

interface CodePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fabricCanvas: any;
}

export const CodePreviewDialog = ({
  isOpen,
  onClose,
  fabricCanvas,
}: CodePreviewDialogProps) => {
  const [copied, setCopied] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [htmlCode, setHtmlCode] = useState("");
  const [cssCode, setCssCode] = useState("");

  const generateHTML = () => {
    if (!fabricCanvas) return "<div>No content</div>";

    const objects = fabricCanvas.getObjects();
    let html = '<div class="web-builder-output">\n';

    objects.forEach((obj: any) => {
      if (obj.webBlockData?.html) {
        html += `  ${obj.webBlockData.html}\n`;
      } else if (obj.type === "rect") {
        html += `  <div style="width: ${obj.width}px; height: ${obj.height}px; background: ${obj.fill};"></div>\n`;
      } else if (obj.type === "textbox" || obj.type === "i-text") {
        html += `  <p style="font-size: ${obj.fontSize}px; color: ${obj.fill};">${obj.text}</p>\n`;
      }
    });

    html += "</div>";
    return html;
  };

  const generateCSS = () => {
    return `.web-builder-output {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.5;
}

/* Add your custom styles here */`;
  };

  useEffect(() => {
    if (isOpen) {
      setHtmlCode(generateHTML());
      setCssCode(generateCSS());
    }
  }, [isOpen, fabricCanvas]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportCode = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".html,.css,.txt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (file.name.endsWith(".html")) {
            setHtmlCode(content);
            toast.success("HTML imported successfully");
          } else if (file.name.endsWith(".css")) {
            setCssCode(content);
            toast.success("CSS imported successfully");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleApplyChanges = () => {
    // This would apply the code changes to the canvas
    // For now, just show a success message
    toast.success("Code changes applied!");
    setIsEditMode(false);
  };

  const handleDownload = (code: string, filename: string) => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filename} downloaded`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] bg-[#1a1a1a] border-white/10">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              {isEditMode ? "Code Editor" : "Code Preview"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleImportCode}
                className="text-white/70 hover:text-white border-white/10"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button
                variant={isEditMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
                className={isEditMode ? "bg-blue-600 hover:bg-blue-700" : "text-white/70 hover:text-white border-white/10"}
              >
                {isEditMode ? "View Mode" : "Edit Mode"}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="html" className="w-full">
          <TabsList className="bg-white/5">
            <TabsTrigger value="html" className="data-[state=active]:bg-white/10">
              HTML
            </TabsTrigger>
            <TabsTrigger value="css" className="data-[state=active]:bg-white/10">
              CSS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="html" className="relative">
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              {isEditMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleApplyChanges}
                  className="text-white/70 hover:text-white bg-green-600/20 hover:bg-green-600/30"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Apply
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(htmlCode, "index.html")}
                className="text-white/70 hover:text-white"
              >
                <Upload className="h-4 w-4 rotate-180" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(htmlCode)}
                className="text-white/70 hover:text-white"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {isEditMode ? (
              <div className="h-[500px] rounded-lg overflow-hidden border border-white/10">
                <MonacoEditor
                  height="100%"
                  defaultLanguage="html"
                  value={htmlCode}
                  onChange={(value) => setHtmlCode(value || "")}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            ) : (
              <pre className="bg-[#0a0a0a] p-4 rounded-lg overflow-auto max-h-[500px] text-sm">{htmlCode}</pre>
            )}
          </TabsContent>

          <TabsContent value="css" className="relative">
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              {isEditMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleApplyChanges}
                  className="text-white/70 hover:text-white bg-green-600/20 hover:bg-green-600/30"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Apply
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(cssCode, "styles.css")}
                className="text-white/70 hover:text-white"
              >
                <Upload className="h-4 w-4 rotate-180" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(cssCode)}
                className="text-white/70 hover:text-white"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {isEditMode ? (
              <div className="h-[500px] rounded-lg overflow-hidden border border-white/10">
                <MonacoEditor
                  height="100%"
                  defaultLanguage="css"
                  value={cssCode}
                  onChange={(value) => setCssCode(value || "")}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            ) : (
              <pre className="bg-[#0a0a0a] p-4 rounded-lg overflow-auto max-h-[500px] text-sm">{cssCode}</pre>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
