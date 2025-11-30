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
  isInteractiveMode?: boolean;
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
  isInteractiveMode = false,
}, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    
    /* Resizable image styles */
    .resizable-image {
      position: relative;
      display: inline-block;
      cursor: move;
    }
    .resizable-image img {
      max-width: 100%;
      height: auto;
      display: block;
    }
    .resizable-image:hover {
      outline: 2px dashed #3b82f6;
      outline-offset: 2px;
    }
    .resizable-image.selected {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }
    .resize-handle {
      position: absolute;
      width: 12px;
      height: 12px;
      background: #3b82f6;
      border: 2px solid white;
      border-radius: 2px;
      cursor: se-resize;
      bottom: -6px;
      right: -6px;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .resizable-image:hover .resize-handle,
    .resizable-image.selected .resize-handle {
      opacity: 1;
    }
    .resize-handle.nw { cursor: nw-resize; top: -6px; left: -6px; bottom: auto; right: auto; }
    .resize-handle.ne { cursor: ne-resize; top: -6px; right: -6px; bottom: auto; left: auto; }
    .resize-handle.sw { cursor: sw-resize; bottom: -6px; left: -6px; top: auto; right: auto; }
    .resize-handle.se { cursor: se-resize; bottom: -6px; right: -6px; top: auto; left: auto; }
    
    /* AI-placed image container */
    .ai-image-container {
      position: relative;
      display: inline-block;
    }
    .ai-image-container.draggable {
      cursor: move;
    }
    .ai-image-container:hover::after {
      content: 'Drag to move • Corner handles to resize';
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      white-space: nowrap;
      pointer-events: none;
    }
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
    
    // Image resize and drag functionality
    document.addEventListener('DOMContentLoaded', function() {
      document.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function(e) {
          if (!link.href || link.href === '#') e.preventDefault();
        });
      });
      
      // Make images resizable and draggable
      initResizableImages();
    });
    
    function initResizableImages() {
      document.querySelectorAll('img:not(.no-resize)').forEach(function(img) {
        if (img.closest('.resizable-image')) return;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'resizable-image ai-image-container';
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        
        // Add resize handles
        ['nw', 'ne', 'sw', 'se'].forEach(function(pos) {
          const handle = document.createElement('div');
          handle.className = 'resize-handle ' + pos;
          wrapper.appendChild(handle);
        });
        
        // Resize functionality
        let isResizing = false;
        let isDragging = false;
        let startX, startY, startWidth, startHeight, startLeft, startTop;
        let currentHandle = null;
        
        wrapper.querySelectorAll('.resize-handle').forEach(function(handle) {
          handle.addEventListener('mousedown', function(e) {
            e.preventDefault();
            e.stopPropagation();
            isResizing = true;
            currentHandle = handle.className.includes('nw') ? 'nw' : 
                           handle.className.includes('ne') ? 'ne' : 
                           handle.className.includes('sw') ? 'sw' : 'se';
            startX = e.clientX;
            startY = e.clientY;
            startWidth = img.offsetWidth;
            startHeight = img.offsetHeight;
            wrapper.classList.add('selected');
          });
        });
        
        // Drag functionality
        wrapper.addEventListener('mousedown', function(e) {
          if (isResizing) return;
          if (e.target.classList.contains('resize-handle')) return;
          
          isDragging = true;
          startX = e.clientX;
          startY = e.clientY;
          const rect = wrapper.getBoundingClientRect();
          startLeft = rect.left;
          startTop = rect.top;
          wrapper.classList.add('selected');
          wrapper.style.position = 'absolute';
          wrapper.style.zIndex = '1000';
        });
        
        document.addEventListener('mousemove', function(e) {
          if (isResizing) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            let newWidth = startWidth;
            let newHeight = startHeight;
            
            if (currentHandle === 'se') {
              newWidth = Math.max(50, startWidth + dx);
              newHeight = Math.max(50, startHeight + dy);
            } else if (currentHandle === 'sw') {
              newWidth = Math.max(50, startWidth - dx);
              newHeight = Math.max(50, startHeight + dy);
            } else if (currentHandle === 'ne') {
              newWidth = Math.max(50, startWidth + dx);
              newHeight = Math.max(50, startHeight - dy);
            } else if (currentHandle === 'nw') {
              newWidth = Math.max(50, startWidth - dx);
              newHeight = Math.max(50, startHeight - dy);
            }
            
            // Maintain aspect ratio with shift key
            if (e.shiftKey) {
              const ratio = startWidth / startHeight;
              if (Math.abs(dx) > Math.abs(dy)) {
                newHeight = newWidth / ratio;
              } else {
                newWidth = newHeight * ratio;
              }
            }
            
            img.style.width = newWidth + 'px';
            img.style.height = newHeight + 'px';
          }
          
          if (isDragging) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            wrapper.style.left = (startLeft + dx) + 'px';
            wrapper.style.top = (startTop + dy) + 'px';
          }
        });
        
        document.addEventListener('mouseup', function() {
          isResizing = false;
          isDragging = false;
          currentHandle = null;
        });
        
        // Click to select
        wrapper.addEventListener('click', function(e) {
          e.stopPropagation();
          document.querySelectorAll('.resizable-image.selected').forEach(function(el) {
            if (el !== wrapper) el.classList.remove('selected');
          });
          wrapper.classList.add('selected');
        });
      });
      
      // Deselect on click outside
      document.addEventListener('click', function(e) {
        if (!e.target.closest('.resizable-image')) {
          document.querySelectorAll('.resizable-image.selected').forEach(function(el) {
            el.classList.remove('selected');
          });
        }
      });
    }
  </script>
</head>
<body>
  <div id="root">${bodyContent}</div>
  ${safeJs ? '<script>\ntry {\n(function() {\n' + safeJs + '\ninitResizableImages();\n})();\n} catch(e) { console.error("Script execution error:", e); throw e; }\n</script>' : ''}
</body>
</html>`;

  return doc;
}
