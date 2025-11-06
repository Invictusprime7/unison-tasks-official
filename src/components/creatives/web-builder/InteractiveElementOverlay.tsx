import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LiveHTMLPreviewHandle } from '../LiveHTMLPreview';

interface InteractiveElementOverlayProps {
  isInteractiveMode: boolean;
  livePreviewRef: React.RefObject<LiveHTMLPreviewHandle>;
  className?: string;
}

export const InteractiveElementOverlay: React.FC<InteractiveElementOverlayProps> = ({
  isInteractiveMode,
  livePreviewRef,
  className
}) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [interactiveElements, setInteractiveElements] = useState<Array<{
    rect: DOMRect;
    text: string;
    type: string;
  }>>([]);

  useEffect(() => {
    if (!isInteractiveMode || !livePreviewRef.current || !showOverlay) {
      setInteractiveElements([]);
      return;
    }

    const iframe = livePreviewRef.current.getIframe();
    if (!iframe) return;
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    const findInteractiveElements = () => {
      const elements: Array<{ rect: DOMRect; text: string; type: string }> = [];
      
      // Find all interactive elements
      const selectors = [
        'button',
        'a[href]',
        '[onclick]',
        '[role="button"]',
        'input[type="submit"]',
        'input[type="button"]',
        '.btn',
        '.button',
        '.cta',
        '[class*="button"]'
      ];

      selectors.forEach(selector => {
        const elementList = iframeDoc.querySelectorAll(selector);
        elementList.forEach((el: Element) => {
          const htmlEl = el as HTMLElement;
          const rect = htmlEl.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            elements.push({
              rect,
              text: htmlEl.textContent?.trim() || htmlEl.tagName.toLowerCase(),
              type: htmlEl.tagName.toLowerCase()
            });
          }
        });
      });

      setInteractiveElements(elements);
    };

    findInteractiveElements();

    // Re-scan when iframe content changes
    const observer = new MutationObserver(findInteractiveElements);
    observer.observe(iframeDoc.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [isInteractiveMode, livePreviewRef, showOverlay]);

  if (!isInteractiveMode) return null;

  return (
    <div className={cn('absolute top-2 left-2 z-20', className)}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setShowOverlay(!showOverlay)}
        className="bg-[#1a1a1a] border border-white/10 text-white/70 hover:text-white hover:bg-[#252525] shadow-lg"
        title={showOverlay ? 'Hide interactive elements overlay' : 'Show interactive elements overlay'}
      >
        {showOverlay ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
        <Zap className="h-4 w-4 mr-1" />
        {showOverlay ? 'Hide' : 'Show'} Interactive
      </Button>

      {showOverlay && interactiveElements.length > 0 && (
        <div className="mt-2 p-2 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-lg max-w-xs">
          <div className="text-xs text-white/70 mb-2 font-medium">
            Interactive Elements ({interactiveElements.length})
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {interactiveElements.map((element, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-1 rounded bg-white/5 text-xs text-white/60"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                <span className="truncate">
                  {element.type.toUpperCase()}: {element.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};