import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MousePointer, 
  Edit3, 
  Zap, 
  Hand, 
  Eye, 
  Keyboard,
  CheckCircle,
  Info
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface InteractiveModeHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InteractiveModeHelp: React.FC<InteractiveModeHelpProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Interactive Mode Guide
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                What is Interactive Mode?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interactive Mode allows you to seamlessly switch between editing elements and testing their functionality. 
                Perfect for testing call-to-actions, buttons, links, and other interactive components in your generated webpages.
              </p>
            </CardContent>
          </Card>

          {/* Two Modes */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-blue-500" />
                  Edit Mode
                  <Badge variant="secondary">Default</Badge>
                </CardTitle>
                <CardDescription>Click elements to select and modify them</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Element selection & editing</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Properties panel access</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Visual element highlighting</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Design modifications</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="h-4 w-4 text-green-500" />
                  Interactive Mode
                  <Badge variant="outline">Test</Badge>
                </CardTitle>
                <CardDescription>Click buttons and links to test functionality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Natural click behavior</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>CTA functionality testing</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Visual click feedback</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Interactive element highlighting</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How to Use */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hand className="h-4 w-4" />
                How to Use
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <span className="bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span>
                      Toggle Mode
                    </h4>
                    <p className="text-sm text-muted-foreground pl-7">
                      Use the Edit/Interactive toggle in the toolbar or press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Shift+I</kbd>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <span className="bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span>
                      Test Elements
                    </h4>
                    <p className="text-sm text-muted-foreground pl-7">
                      Click buttons, links, and CTAs to see their natural behavior and get visual feedback
                    </p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <span className="bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">3</span>
                      View Interactive Elements
                    </h4>
                    <p className="text-sm text-muted-foreground pl-7">
                      Use the "Show Interactive" button to see all clickable elements highlighted
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <span className="bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">4</span>
                      Switch Back
                    </h4>
                    <p className="text-sm text-muted-foreground pl-7">
                      Return to Edit mode to continue modifying your design
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Keyboard Shortcuts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Keyboard Shortcuts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Toggle Interactive Mode</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Shift + I</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Show/Hide Help</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">F1</kbd>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Switch to Canvas View</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl + 1</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Switch to Split View</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl + 2</kbd>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Elements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Supported Interactive Elements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Buttons</h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>• Primary CTAs</div>
                    <div>• Secondary buttons</div>
                    <div>• Form submit buttons</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Links</h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>• Navigation links</div>
                    <div>• External links</div>
                    <div>• Anchor links</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Custom Elements</h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>• onclick handlers</div>
                    <div>• role="button"</div>
                    <div>• Custom CTAs</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Close Button */}
          <div className="flex justify-end">
            <Button onClick={onClose}>
              Got it!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};