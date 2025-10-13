import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { bundleCode, extractImageSources, resolveAssetPath } from '@/utils/codeBundler';
import { getSelectedElementData, highlightElement, removeHighlight, updateElementInIframe } from '@/utils/htmlElementSelector';

interface LiveHTMLPreviewProps {
  code: string;
  className?: string;
  autoRefresh?: boolean;
  onElementSelect?: (elementData: any) => void;
  enableSelection?: boolean;
}

export interface LiveHTMLPreviewHandle {
  updateElement: (selector: string, updates: any) => boolean;
  getIframe: () => HTMLIFrameElement | null;
}

export const LiveHTMLPreview = forwardRef<LiveHTMLPreviewHandle, LiveHTMLPreviewProps>(({
  code,
  className,
  autoRefresh = true,
  onElementSelect,
  enableSelection = true,
}, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const updateTimerRef = useRef<NodeJS.Timeout>();
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const selectedElementRef = useRef<HTMLElement | null>(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    updateElement: (selector: string, updates: any) => {
      if (!iframeRef.current) return false;
      const success = updateElementInIframe(iframeRef.current, selector, updates);
      if (success) {
        console.log('[LiveHTMLPreview] Element updated successfully:', selector);
      }
      return success;
    },
    getIframe: () => iframeRef.current,
  }));


  // Setup click handlers for element selection
  useEffect(() => {
    if (!enableSelection || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target !== iframeDoc.body && target !== iframeDoc.documentElement) {
        if (hoveredElement && hoveredElement !== target) {
          removeHighlight(hoveredElement);
        }
        highlightElement(target, '#3b82f6');
        setHoveredElement(target);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && hoveredElement === target) {
        removeHighlight(target);
        setHoveredElement(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.target as HTMLElement;
      if (target && target !== iframeDoc.body && target !== iframeDoc.documentElement) {
        // Remove previous selection highlight
        if (selectedElementRef.current && selectedElementRef.current !== target) {
          removeHighlight(selectedElementRef.current);
        }
        
        const elementData = getSelectedElementData(target);
        console.log('[LiveHTMLPreview] Element selected:', elementData);
        onElementSelect?.(elementData);
        
        // Store reference to selected element and keep it highlighted
        selectedElementRef.current = target;
        highlightElement(target, '#10b981');
      }
    };

    // Add event listeners to iframe document
    iframeDoc.addEventListener('mouseover', handleMouseOver);
    iframeDoc.addEventListener('mouseout', handleMouseOut);
    iframeDoc.addEventListener('click', handleClick);

    return () => {
      if (iframeDoc) {
        iframeDoc.removeEventListener('mouseover', handleMouseOver);
        iframeDoc.removeEventListener('mouseout', handleMouseOut);
        iframeDoc.removeEventListener('click', handleClick);
      }
    };
  }, [enableSelection, onElementSelect, hoveredElement]);

  const renderPreview = () => {
    // Guard against undefined or empty code
    if (!iframeRef.current || !code || typeof code !== 'string' || !code.trim()) {
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

      if (!iframeDoc) {
        throw new Error('Cannot access iframe document');
      }

      // Bundle the code (handles TS/JS/HTML/React)
      const bundled = bundleCode(code);
      console.log('[LiveHTMLPreview] Bundled code:', bundled);

      // Build complete HTML document
      const completeHTML = buildHTMLDocument(
        bundled.html || code,
        bundled.css,
        bundled.javascript
      );

      // Write to iframe
      iframeDoc.open();
      iframeDoc.write(completeHTML);
      iframeDoc.close();

      // Set up error listener in iframe
      if (iframe.contentWindow) {
        iframe.contentWindow.addEventListener('error', (e) => {
          console.error('Preview runtime error:', e);
          setStatus('error');
          setErrorMessage(e.error?.message || e.message || 'Runtime error');
        });
      }

      setTimeout(() => setStatus('success'), 300);
    } catch (err) {
      console.error('Preview render error:', err);
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to render');
    }
  };

  useEffect(() => {
    // Guard against undefined or invalid code
    if (!autoRefresh || !code || typeof code !== 'string' || !code.trim()) {
      return;
    }

    // Debounce updates
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }

    updateTimerRef.current = setTimeout(() => {
      renderPreview();
    }, 300);

    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, [code, autoRefresh]);

  return (
    <div className={cn('relative w-full h-full', className)}>
      {/* Status indicator */}
      <div className="absolute top-2 right-2 z-10 pointer-events-none">
        {status === 'loading' && (
          <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md border flex items-center gap-1.5 text-xs">
            <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
            <span className="text-muted-foreground">Rendering...</span>
          </div>
        )}
        {status === 'success' && (
          <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md border flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span className="text-muted-foreground">Live</span>
          </div>
        )}
        {status === 'error' && (
          <div className="bg-destructive/10 backdrop-blur-sm px-2 py-1 rounded-md border border-destructive/20 flex items-center gap-1.5 text-xs max-w-xs">
            <AlertCircle className="w-3 h-3 text-destructive flex-shrink-0" />
            <span className="text-destructive truncate">{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Preview iframe */}
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0 bg-white"
        title="Live Preview"
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
      />
    </div>
    );
});

LiveHTMLPreview.displayName = 'LiveHTMLPreview';

function buildHTMLDocument(html: string, css: string, javascript: string): string {
  // Guard against undefined values
  const safeHtml = html || '';
  const safeCss = css || '';
  const safeJs = javascript || '';
  
  let bodyContent = safeHtml.trim();
  
  if (bodyContent.toLowerCase().includes('<!doctype') || bodyContent.toLowerCase().includes('<html')) {
    const existingStyles = bodyContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
    const allStyles = existingStyles.map(s => s.replace(/<\/?style[^>]*>/gi, '')).join('\n') + '\n' + safeCss;
    bodyContent = bodyContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    bodyContent = bodyContent.replace('</head>', '<style>' + allStyles + '</style>\n</head>');
    if (safeJs) {
      bodyContent = bodyContent.replace('</body>', '<script>\n' + safeJs + '\n</script>\n</body>');
    }
    return bodyContent;
  }

  const doc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '#3b82f6',
            secondary: '#8b5cf6',
          }
        }
      }
    }
  </script>
  <!-- React & ReactDOM from CDN -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: #ffffff;
      padding: 20px;
    }
    img { max-width: 100%; height: auto; }
    button { cursor: pointer; font-family: inherit; }
    #root { width: 100%; min-height: 100vh; }
    ${safeCss}
  </style>
  <script>
    window.addEventListener('error', function(e) {
      console.error('Preview Error:', e.error || e.message);
      const div = document.createElement('div');
      div.style.cssText = 'position:fixed;top:10px;left:10px;right:10px;background:#fee;border:2px solid #fcc;padding:16px;border-radius:8px;color:#c33;z-index:999999;font-family:monospace;font-size:12px;max-height:200px;overflow:auto;';
      div.innerHTML = '<strong>⚠️ JavaScript Error:</strong><br>' + 
        (e.error?.message || e.message) + 
        (e.error?.stack ? '<br><br><small>' + e.error.stack.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</small>' : '');
      document.body.insertBefore(div, document.body.firstChild);
    });
    document.addEventListener('DOMContentLoaded', function() {
      document.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function(e) {
          if (!link.href || link.href === '#') e.preventDefault();
        });
      });
    });
  </script>
</head>
<body>
  <div id="root">${bodyContent}</div>
  ${safeJs ? '<script>\ntry {\n(function() {\n' + safeJs + '\n})();\n} catch(e) { console.error("Script execution error:", e); throw e; }\n</script>' : ''}
</body>
</html>`;

  return doc;
}
