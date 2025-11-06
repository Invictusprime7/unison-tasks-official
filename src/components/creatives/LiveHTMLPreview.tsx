import React, { useCallback, useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { bundleCode, extractImageSources, resolveAssetPath } from '@/utils/codeBundler';
import { getSelectedElementData, highlightElement, removeHighlight, updateElementInIframe } from '@/utils/htmlElementSelector';
import { sanitizeHTMLClasses } from '@/utils/classSanitizer';

interface ElementData {
  tagName: string;
  textContent: string;
  attributes: Record<string, string>;
  styles: Record<string, string>;
  selector: string;
  xpath: string;
}

interface ElementUpdates {
  textContent?: string;
  attributes?: Record<string, string>;
  styles?: Record<string, string>;
}

interface LiveHTMLPreviewProps {
  code: string;
  className?: string;
  autoRefresh?: boolean;
  onElementSelect?: (elementData: ElementData) => void;
  enableSelection?: boolean;
  isInteractiveMode?: boolean;
}

export interface LiveHTMLPreviewHandle {
  updateElement: (selector: string, updates: ElementUpdates) => boolean;
  getIframe: () => HTMLIFrameElement | null;
}

export const LiveHTMLPreview = forwardRef<LiveHTMLPreviewHandle, LiveHTMLPreviewProps>(({
  code,
  className,
  autoRefresh = true,
  onElementSelect,
  enableSelection = true,
  isInteractiveMode = false,
}, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const updateTimerRef = useRef<NodeJS.Timeout>();
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const selectedElementRef = useRef<HTMLElement | null>(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    updateElement: (selector: string, updates: ElementUpdates) => {
      if (!iframeRef.current) return false;
      const success = updateElementInIframe(iframeRef.current, selector, updates);
      if (success) {
        console.log('[LiveHTMLPreview] Element updated successfully:', selector);
      }
      return success;
    },
    getIframe: () => iframeRef.current,
  }));


  // Setup click handlers for element selection or interactive mode
  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    const handleMouseOver = (e: MouseEvent) => {
      // Only show hover effects in edit mode
      if (isInteractiveMode) return;
      
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
      // Only remove hover effects in edit mode
      if (isInteractiveMode) return;
      
      const target = e.target as HTMLElement;
      if (target && hoveredElement === target) {
        removeHighlight(target);
        setHoveredElement(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (isInteractiveMode) {
        // Interactive mode: Allow natural click behavior for CTAs, links, buttons
        if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
          // Let the natural click behavior happen for interactive elements
          console.log('[LiveHTMLPreview] Interactive mode: allowing natural click for', target.tagName);
          return;
        }
        // For non-interactive elements, prevent default to avoid unwanted behavior
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Edit mode: Prevent default and handle element selection
      e.preventDefault();
      e.stopPropagation();
      
      if (!enableSelection || !target || target === iframeDoc.body || target === iframeDoc.documentElement) {
        return;
      }
      
      // Remove previous selection highlight
      if (selectedElementRef.current && selectedElementRef.current !== target) {
        removeHighlight(selectedElementRef.current);
      }
      
      const elementData = getSelectedElementData(target);
      console.log('[LiveHTMLPreview] Element selected for editing:', elementData);
      onElementSelect?.(elementData);
      
      // Store reference to selected element and keep it highlighted
      selectedElementRef.current = target;
      highlightElement(target, '#10b981');
    };

    // Add event listeners to iframe document
    iframeDoc.addEventListener('mouseover', handleMouseOver);
    iframeDoc.addEventListener('mouseout', handleMouseOut);
    iframeDoc.addEventListener('click', handleClick);

    // Set cursor style based on mode
    if (iframeDoc.body) {
      iframeDoc.body.style.cursor = isInteractiveMode ? 'default' : 'pointer';
    }

    return () => {
      if (iframeDoc) {
        iframeDoc.removeEventListener('mouseover', handleMouseOver);
        iframeDoc.removeEventListener('mouseout', handleMouseOut);
        iframeDoc.removeEventListener('click', handleClick);
      }
    };
  }, [enableSelection, onElementSelect, hoveredElement, isInteractiveMode]);

  const renderPreview = useCallback(() => {
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
  }, [code]);

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
  }, [code, autoRefresh, renderPreview]);

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
            <span className="text-muted-foreground">
              {isInteractiveMode ? 'Interactive' : 'Live'}
            </span>
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
  const safeHtml = sanitizeHTMLClasses(html || '');
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
    button { 
      cursor: pointer; 
      font-family: inherit; 
      transition: all 0.2s ease;
      border: none;
      outline: none;
    }
    button:hover { 
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    button:active { 
      transform: translateY(0);
    }
    a { 
      transition: all 0.2s ease;
      text-decoration: none;
    }
    a:hover { 
      transform: translateY(-1px);
    }
    a[href="#"], a[href=""] {
      cursor: pointer;
    }
    .cta-button, .btn-primary, .btn, [class*="button"] {
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }
    .cta-button:hover, .btn-primary:hover, .btn:hover, [class*="button"]:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
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
      // Enhanced interactive behavior for CTAs and buttons
      document.querySelectorAll('a').forEach(function(link) {
        if (!link.href || link.href === '#') {
          link.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Call-to-action clicked:', link.textContent?.trim());
            // Show visual feedback for CTA clicks
            link.style.transform = 'scale(0.95)';
            setTimeout(() => link.style.transform = 'scale(1)', 150);
          });
        }
      });
      
      document.querySelectorAll('button').forEach(function(button) {
        button.addEventListener('click', function(e) {
          console.log('Button clicked:', button.textContent?.trim());
          // Show visual feedback for button clicks
          button.style.transform = 'scale(0.95)';
          setTimeout(() => button.style.transform = 'scale(1)', 150);
          
          // Add ripple effect for better UX
          const ripple = document.createElement('div');
          const rect = button.getBoundingClientRect();
          ripple.style.cssText = 'position:absolute;border-radius:50%;background:rgba(255,255,255,0.5);transform:scale(0);animation:ripple 0.6s linear;pointer-events:none;';
          ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + 'px';
          ripple.style.left = (e.clientX - rect.left - Math.max(rect.width, rect.height) / 2) + 'px';
          ripple.style.top = (e.clientY - rect.top - Math.max(rect.width, rect.height) / 2) + 'px';
          
          if (!document.querySelector('#ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = '@keyframes ripple { to { transform: scale(4); opacity: 0; } }';
            document.head.appendChild(style);
          }
          
          button.style.position = 'relative';
          button.style.overflow = 'hidden';
          button.appendChild(ripple);
          setTimeout(() => ripple.remove(), 600);
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
