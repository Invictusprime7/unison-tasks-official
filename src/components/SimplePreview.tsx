/**
 * SimplePreview - Hybrid VFS/Sandpack + srcdoc fallback
 * 
 * When a VFS preview URL is available (Sandpack/Docker), uses that.
 * Otherwise falls back to rendering the `code` prop via srcdoc for
 * lightweight HTML/React string preview.
 */

import React, { forwardRef, useImperativeHandle, useRef, useMemo, useContext } from 'react';
import { cn } from '@/lib/utils';
import { ExternalLink, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeployButton } from '@/components/DeployButton';
import { PreviewOverlayManager } from '@/components/preview/PreviewOverlayManager';
import VFSContext from '@/contexts/VFSContext';

/**
 * Safe VFS preview hook - returns null if no VFSProvider wraps this component.
 */
function useVFSPreviewSafe() {
  const ctx = useContext(VFSContext);
  if (!ctx) return null;
  return {
    url: ctx.previewSession?.iframeUrl || null,
    loading: ctx.previewLoading,
    error: ctx.previewError,
    restart: ctx.restartPreview,
  };
}

export interface SimplePreviewHandle {
  getIframe: () => HTMLIFrameElement | null;
  deleteElement: (selector: string) => boolean;
  duplicateElement: (selector: string) => boolean;
  updateElement: (selector: string, updates: any) => boolean;
  refresh: () => void;
  syncPageManifest: (pages: Record<string, string>) => void;
}

export interface SimplePreviewProps {
  code: string;
  className?: string;
  showToolbar?: boolean;
  device?: 'desktop' | 'tablet' | 'mobile';
  enableSelection?: boolean;
  onElementSelect?: (elementData: any) => void;
  businessId?: string;
  siteId?: string;
  onIntentTrigger?: (intent: string, payload: Record<string, unknown>, result: unknown) => void;
  pageManifest?: Record<string, string>;
  showDeploy?: boolean;
  deploySiteName?: string;
  onDeployComplete?: (url: string) => void;
}

export const SimplePreview = forwardRef<SimplePreviewHandle, SimplePreviewProps>(({
  code,
  className,
  showToolbar = true,
  device = 'desktop',
  enableSelection = false,
  onElementSelect,
  businessId,
  siteId,
  onIntentTrigger,
  showDeploy = false,
  deploySiteName,
  onDeployComplete,
}, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Try VFS preview - returns null if no VFSProvider
  const vfsPreview = useVFSPreviewSafe();
  const previewUrl = vfsPreview?.url ?? null;
  const loading = vfsPreview?.loading ?? false;
  const error = vfsPreview?.error ?? null;

  // Build srcdoc from code prop when no VFS URL
  const srcdoc = useMemo(() => {
    if (previewUrl || !code) return undefined;
    // If it looks like a full HTML doc, use as-is
    if (code.trim().startsWith('<!') || code.trim().startsWith('<html')) {
      return code;
    }
    // Wrap in minimal HTML shell
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>${code}</body>
</html>`;
  }, [code, previewUrl]);

  const hasSomethingToShow = !!previewUrl || !!srcdoc;

  useImperativeHandle(ref, () => ({
    getIframe: () => iframeRef.current,
    deleteElement: (selector: string) => {
      const doc = iframeRef.current?.contentDocument;
      if (!doc) return false;
      const el = doc.querySelector(selector);
      if (el) { el.remove(); return true; }
      return false;
    },
    duplicateElement: (selector: string) => {
      const doc = iframeRef.current?.contentDocument;
      if (!doc) return false;
      const el = doc.querySelector(selector);
      if (el?.parentNode) { el.parentNode.insertBefore(el.cloneNode(true), el.nextSibling); return true; }
      return false;
    },
    updateElement: (selector: string, updates: any) => {
      const doc = iframeRef.current?.contentDocument;
      if (!doc) return false;
      const el = doc.querySelector(selector) as HTMLElement | null;
      if (!el) return false;
      if (updates.textContent !== undefined) el.textContent = updates.textContent;
      if (updates.innerHTML !== undefined) el.innerHTML = updates.innerHTML;
      if (updates.style) Object.assign(el.style, updates.style);
      if (updates.attributes) {
        for (const [k, v] of Object.entries(updates.attributes)) {
          el.setAttribute(k, String(v));
        }
      }
      return true;
    },
    refresh: () => {
      if (vfsPreview?.restart) {
        vfsPreview.restart();
      } else if (iframeRef.current) {
        // Force srcdoc refresh
        const cur = iframeRef.current.srcdoc;
        iframeRef.current.srcdoc = '';
        requestAnimationFrame(() => {
          if (iframeRef.current) iframeRef.current.srcdoc = cur;
        });
      }
    },
    syncPageManifest: (pages: Record<string, string>) => {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) return;
      iframe.contentWindow.postMessage({ type: 'SYNC_PAGE_MANIFEST', pages }, '*');
    },
  }), [vfsPreview]);

  const handleRefresh = () => {
    if (vfsPreview?.restart) {
      vfsPreview.restart();
    } else if (iframeRef.current && srcdoc) {
      iframeRef.current.srcdoc = '';
      requestAnimationFrame(() => {
        if (iframeRef.current) iframeRef.current.srcdoc = srcdoc;
      });
    }
  };

  const handleOpenInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-background rounded-lg overflow-hidden border border-white/10', className)}>
      {showToolbar && (
        <div className={cn(
          "flex items-center justify-between px-3 py-2 border-b border-white/10",
          "bg-muted/50"
        )}>
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
              error ? "bg-destructive/20 text-destructive" : "bg-emerald-500/20 text-emerald-400"
            )}>
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : error ? (
                <AlertTriangle className="h-3 w-3" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
              {loading ? 'Building...' : error ? 'Build Error' : 'Live Preview'}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              className="h-7 w-7 p-0"
              title="Refresh Preview"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleOpenInNewTab}
              className="h-7 w-7 p-0"
              title="Open in new tab"
              disabled={!previewUrl}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            {showDeploy && (
              <DeployButton
                files={{}}
                defaultSiteName={deploySiteName}
                onDeployComplete={onDeployComplete}
                variant="ghost"
                size="sm"
                showProviderSelect={true}
              />
            )}
          </div>
        </div>
      )}
      
      {/* Preview Container */}
      <div className="flex-1 relative min-h-0 flex items-start justify-center bg-zinc-100 dark:bg-zinc-900">
        <div 
          className="h-full bg-white dark:bg-zinc-950 shadow-lg transition-all duration-300 relative"
          style={{
            width: device === 'mobile' ? '375px' : device === 'tablet' ? '768px' : '100%',
            maxWidth: '100%',
          }}
        >
          {loading && !hasSomethingToShow && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-medium">Starting preview environment...</p>
              </div>
            </div>
          )}
          
          {previewUrl ? (
            <iframe
              ref={iframeRef}
              src={previewUrl}
              className="w-full h-full border-0 bg-white dark:bg-zinc-950"
              title="Code Preview"
              allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write; web-share"
              sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-downloads allow-pointer-lock"
            />
          ) : srcdoc ? (
            <iframe
              ref={iframeRef}
              srcDoc={srcdoc}
              className="w-full h-full border-0 bg-white dark:bg-zinc-950"
              title="Code Preview"
              sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-downloads allow-pointer-lock"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              {!loading && "No content to preview"}
            </div>
          )}
        </div>
      </div>
      
      <PreviewOverlayManager
        activeOverlay={null} 
        onClose={() => {}}
        businessId={businessId}
        siteId={siteId}
      />
    </div>
  );
});

SimplePreview.displayName = 'SimplePreview';

export default SimplePreview;
