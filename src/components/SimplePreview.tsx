
/**
 * SimplePreview - Updated for VFS/Sandpack
 * 
 * Routes preview through the VFS system rather than direct HTML injection.
 * Maintains the existing interface for compatibility but delegates rendering.
 */

import React, { forwardRef, useImperativeHandle, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useVFSPreview } from '@/hooks/useVFSContext';
import { ExternalLink, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeployButton } from '@/components/DeployButton';
import { PreviewOverlayManager } from '@/components/preview/PreviewOverlayManager';

export interface SimplePreviewHandle {
  getIframe: () => HTMLIFrameElement | null;
  deleteElement: (selector: string) => boolean;
  duplicateElement: (selector: string) => boolean;
  updateElement: (selector: string, updates: any) => boolean;
  refresh: () => void;
  syncPageManifest: (pages: Record<string, string>) => void;
}

export interface SimplePreviewProps {
  /** The code to preview - ignored in VFS mode, we use files from context */
  code: string;
  /** Additional CSS classes */
  className?: string;
  /** Show toolbar */
  showToolbar?: boolean;
  /** Device breakpoint for responsive preview */
  device?: 'desktop' | 'tablet' | 'mobile';
  /** Enable element selection (for Edit mode) */
  enableSelection?: boolean;
  /** Callback when an element is selected */
  onElementSelect?: (elementData: any) => void;
  /** Business ID for intent execution context */
  businessId?: string;
  /** Site/Project ID for intent execution context */
  siteId?: string;
  /** Callback when an intent is triggered (for external handling) */
  onIntentTrigger?: (intent: string, payload: Record<string, unknown>, result: unknown) => void;
  /** Multi-page manifest for async navigation (path -> html content) */
  pageManifest?: Record<string, string>;
  /** Enable deploy button in toolbar */
  showDeploy?: boolean;
  /** Default site name for deployments */
  deploySiteName?: string;
  /** Callback when deployment completes */
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
  
  // Use the VFS preview hook to get the sandpack URL
  const { url: previewUrl, loading, error, restart } = useVFSPreview();

  // Expose imperative handle
  useImperativeHandle(ref, () => ({
    getIframe: () => iframeRef.current,
    deleteElement: () => {
      console.warn('Direct DOM manipulation not supported in React/VFS mode');
      return false;
    },
    duplicateElement: () => {
      console.warn('Direct DOM manipulation not supported in React/VFS mode');
      return false;
    },
    updateElement: () => {
      console.warn('Direct DOM manipulation not supported in React/VFS mode');
      return false;
    },
    refresh: () => {
      restart();
    },
    syncPageManifest: () => {
      // No-op in VFS mode, files are synced via context
    },
  }), [restart]);

  const handleRefresh = () => {
    restart();
  };

  const handleOpenInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-background rounded-lg overflow-hidden border border-white/10', className)}>
      {/* Toolbar */}
      {showToolbar && (
        <div className={cn(
          "flex items-center justify-between px-3 py-2 border-b border-white/10",
          "bg-muted/50"
        )}>
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
              error ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
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
              title="Restart Preview"
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
                files={{}} // Files handled by deploy hook internally if needed, or update this prop
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
          {loading && !previewUrl && (
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
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              {!loading && "Preview not available"}
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay Manager for Auth/Booking/Checkout modals */}
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
