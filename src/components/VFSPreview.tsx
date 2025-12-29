/**
 * VFSPreview - Docker-Only Preview Component
 * 
 * A streamlined preview component using Docker-based Vite for live HMR.
 * Falls back to static HTML rendering when Docker is unavailable.
 * 
 * Features:
 * - Docker-based Vite preview with true HMR
 * - Automatic file sync from VFS
 * - Static HTML fallback (no external dependencies)
 * - Toolbar with status, controls, and logs
 * - Open in new tab
 */

import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { 
  RefreshCw, 
  ExternalLink, 
  Wifi, 
  WifiOff, 
  Loader2,
  Server,
  FileCode,
  Terminal,
  ChevronDown,
  AlertCircle,
  Play,
  Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePreviewService } from '@/hooks/usePreviewService';
import type { VirtualNode, VirtualFile } from '@/hooks/useVirtualFileSystem';

// ============================================================================
// Types
// ============================================================================

type PreviewBackend = 'docker' | 'html' | 'loading' | 'none';

export interface VFSPreviewProps {
  /** VFS nodes for file content */
  nodes: VirtualNode[];
  /** Files map (alternative to nodes) */
  files?: Record<string, string>;
  /** Active file path */
  activeFile?: string;
  /** Additional CSS classes */
  className?: string;
  /** Show console panel */
  showConsole?: boolean;
  /** Show toolbar */
  showToolbar?: boolean;
  /** Auto-start Docker preview */
  autoStart?: boolean;
  /** Force a specific backend (kept for compatibility) */
  forceBackend?: 'docker' | 'sandpack';
  /** Callback when preview is ready */
  onReady?: () => void;
  /** Callback on error */
  onError?: (error: string) => void;
  /** Show backend indicator */
  showBackendIndicator?: boolean;
}

export interface VFSPreviewHandle {
  refresh: () => void;
  startDocker: () => Promise<void>;
  stopDocker: () => Promise<void>;
  getBackend: () => PreviewBackend;
  openInNewTab: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const BASE_CSS = `:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.75rem;
}
* { border-color: hsl(var(--border)); }
body { 
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
  margin: 0; 
}`;

// ============================================================================
// Helpers
// ============================================================================

function nodesToFileMap(nodes: VirtualNode[]): Record<string, string> {
  const files: Record<string, string> = {};
  
  for (const node of nodes) {
    if (node.type === 'file') {
      const file = node as VirtualFile;
      const path = file.path || `/${file.name}`;
      files[path] = file.content;
    }
  }
  
  return files;
}

/**
 * Generate a static HTML preview from VFS files
 * Used when Docker is unavailable
 */
function generateStaticHtmlPreview(files: Record<string, string>): string {
  const appContent = files['/src/App.tsx'] || files['/App.tsx'] || '';
  
  // Check if there's a standalone index.html
  if (files['/index.html'] && !files['/index.html'].includes('src="/src/main.tsx"')) {
    return files['/index.html'];
  }
  
  // Extract content from React component
  let bodyContent = '';
  
  // Look for dangerouslySetInnerHTML pattern (templates)
  const dangerousMatch = appContent.match(/dangerouslySetInnerHTML=\{\{\s*__html:\s*`([^`]*)`\s*\}\}/s);
  if (dangerousMatch) {
    bodyContent = dangerousMatch[1];
  } else {
    // Try to extract return statement JSX and convert to HTML
    const returnMatch = appContent.match(/return\s*\(\s*([\s\S]*?)\s*\);?\s*\}[\s\n]*$/);
    if (returnMatch) {
      bodyContent = returnMatch[1]
        .replace(/className=/g, 'class=')
        .replace(/htmlFor=/g, 'for=')
        .replace(/\{\/\*.*?\*\/\}/gs, '') // Remove JSX comments
        .replace(/\{`([^`]*)`\}/g, '$1'); // Remove template literals
    }
  }
  
  if (!bodyContent) {
    bodyContent = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0f172a; color: white;">
        <div style="text-align: center; max-width: 400px; padding: 40px;">
          <div style="font-size: 48px; margin-bottom: 16px;">🐳</div>
          <h2 style="margin: 0 0 12px 0; font-size: 24px;">Docker Preview Required</h2>
          <p style="margin: 0 0 20px 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
            Start the Docker preview service for live React rendering with HMR.
          </p>
          <p style="margin: 0; color: #64748b; font-size: 12px;">
            Run: <code style="background: #1e293b; padding: 2px 8px; border-radius: 4px;">docker-compose up</code>
          </p>
        </div>
      </div>
    `;
  }
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VFS Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>${BASE_CSS}</style>
</head>
<body class="bg-slate-950 text-white">
  ${bodyContent}
</body>
</html>`;
}

// ============================================================================
// Main Component
// ============================================================================

export const VFSPreview = forwardRef<VFSPreviewHandle, VFSPreviewProps>(({
  nodes,
  files: propFiles,
  activeFile,
  className,
  showConsole = false,
  showToolbar = true,
  autoStart = true,
  forceBackend,
  onReady,
  onError,
  showBackendIndicator = true,
}, ref) => {
  // State
  const [backend, setBackend] = useState<PreviewBackend>('loading');
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [htmlPreviewSrc, setHtmlPreviewSrc] = useState<string | null>(null);
  
  // Docker preview service
  const dockerService = usePreviewService();
  
  // Check if Docker gateway is configured
  const dockerConfigured = !!import.meta.env.VITE_PREVIEW_GATEWAY_URL;
  
  // Convert nodes to files
  const files = useMemo(() => {
    return propFiles || nodesToFileMap(nodes);
  }, [nodes, propFiles]);
  
  // Generate HTML preview for fallback
  const htmlPreview = useMemo(() => {
    const html = generateStaticHtmlPreview(files);
    const blob = new Blob([html], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }, [files]);
  
  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (htmlPreviewSrc) URL.revokeObjectURL(htmlPreviewSrc);
    };
  }, [htmlPreviewSrc]);
  
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(htmlPreview);
    };
  }, [htmlPreview]);
  
  // Initialize backend
  useEffect(() => {
    if (dockerService.session?.status === 'running') {
      setBackend('docker');
      onReady?.();
    } else if (dockerService.loading) {
      setBackend('loading');
    } else if (dockerConfigured && autoStart && !dockerService.session) {
      // Auto-start Docker
      setBackend('loading');
      dockerService.startSession(nodes).then(() => {
        setBackend('docker');
        onReady?.();
      }).catch((err) => {
        console.warn('[VFSPreview] Docker failed, using HTML fallback:', err);
        setBackend('html');
        onError?.('Docker preview unavailable');
      });
    } else if (!dockerConfigured) {
      // No Docker configured, use HTML
      setBackend('html');
    } else {
      setBackend('html');
    }
  }, [dockerService.session, dockerService.loading, dockerConfigured, autoStart]);
  
  // Sync file changes to Docker
  useEffect(() => {
    if (backend !== 'docker' || !dockerService.session || dockerService.session.status !== 'running') return;
    
    for (const [path, content] of Object.entries(files)) {
      dockerService.patchFile(path, content);
    }
  }, [files, backend, dockerService.session]);
  
  // Handlers
  const handleStartDocker = useCallback(async () => {
    if (!dockerConfigured) {
      onError?.('Docker gateway not configured. Set VITE_PREVIEW_GATEWAY_URL');
      return;
    }
    
    setBackend('loading');
    try {
      await dockerService.startSession(nodes);
      setBackend('docker');
      onReady?.();
    } catch (err) {
      console.error('[VFSPreview] Failed to start Docker:', err);
      setBackend('html');
      onError?.('Failed to start Docker preview');
    }
  }, [dockerConfigured, dockerService, nodes, onReady, onError]);
  
  const handleStopDocker = useCallback(async () => {
    await dockerService.stopSession();
    setBackend('html');
  }, [dockerService]);
  
  const handleRestart = useCallback(() => {
    if (backend === 'docker') {
      dockerService.patchFile('/src/App.tsx', files['/src/App.tsx'] || '');
    } else {
      // Regenerate HTML preview
      const html = generateStaticHtmlPreview(files);
      const blob = new Blob([html], { type: 'text/html' });
      if (htmlPreviewSrc) URL.revokeObjectURL(htmlPreviewSrc);
      setHtmlPreviewSrc(URL.createObjectURL(blob));
    }
  }, [backend, dockerService, files, htmlPreviewSrc]);
  
  const handleOpenInNewTab = useCallback(() => {
    if (backend === 'docker' && dockerService.session?.iframeUrl) {
      window.open(dockerService.session.iframeUrl, '_blank');
    } else {
      window.open(htmlPreview, '_blank');
    }
  }, [backend, dockerService.session, htmlPreview]);
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    refresh: handleRestart,
    startDocker: handleStartDocker,
    stopDocker: handleStopDocker,
    getBackend: () => backend,
    openInNewTab: handleOpenInNewTab,
  }), [handleRestart, handleStartDocker, handleStopDocker, backend, handleOpenInNewTab]);
  
  // Determine preview URL
  const previewUrl = backend === 'docker' && dockerService.session?.iframeUrl
    ? dockerService.session.iframeUrl
    : htmlPreviewSrc || htmlPreview;
  
  return (
    <div className={cn('flex flex-col h-full bg-background rounded-lg overflow-hidden border border-white/10', className)}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-white/10">
          <div className="flex items-center gap-2">
            {/* Backend Badge */}
            {showBackendIndicator && (
              <div className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
                backend === 'docker' && 'bg-green-500/20 text-green-400',
                backend === 'html' && 'bg-amber-500/20 text-amber-400',
                backend === 'loading' && 'bg-blue-500/20 text-blue-400',
              )}>
                {backend === 'docker' && <><Server className="h-3 w-3" /> Docker HMR</>}
                {backend === 'html' && <><FileCode className="h-3 w-3" /> Static</>}
                {backend === 'loading' && <><Loader2 className="h-3 w-3 animate-spin" /> Starting...</>}
              </div>
            )}
            
            {/* Connection Status */}
            {backend === 'docker' && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {dockerService.connected ? (
                  <><Wifi className="h-3 w-3 text-green-500" /> Connected</>
                ) : (
                  <><WifiOff className="h-3 w-3 text-yellow-500" /> Connecting...</>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {/* Start/Stop Docker */}
            {dockerConfigured && (
              <>
                {backend === 'docker' ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleStopDocker}
                    className="h-7 px-2 gap-1 text-xs"
                    title="Stop Docker preview"
                  >
                    <Square className="h-3 w-3" />
                    Stop
                  </Button>
                ) : backend !== 'loading' && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleStartDocker}
                    className="h-7 px-2 gap-1 text-xs bg-green-600 hover:bg-green-700"
                    title="Start Docker preview with HMR"
                  >
                    <Play className="h-3 w-3" />
                    Start Docker
                  </Button>
                )}
              </>
            )}
            
            {/* Refresh */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRestart}
              disabled={backend === 'loading'}
              className="h-7 w-7 p-0"
              title="Refresh preview"
            >
              <RefreshCw className={cn('h-4 w-4', backend === 'loading' && 'animate-spin')} />
            </Button>
            
            {/* Logs Toggle (Docker only) */}
            {backend === 'docker' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowLogs(!showLogs)}
                className={cn('h-7 px-2 gap-1 text-xs', showLogs && 'bg-white/10')}
              >
                <Terminal className="h-3 w-3" />
                Logs
              </Button>
            )}
            
            {/* Open in new tab */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleOpenInNewTab}
              className="h-7 w-7 p-0"
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Error display */}
      {dockerService.error && (
        <div className="px-3 py-2 bg-destructive/10 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {dockerService.error}
        </div>
      )}
      
      {/* Preview Content */}
      <div className="flex-1 relative min-h-0">
        {/* Loading State */}
        {backend === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">Starting Docker preview...</p>
            </div>
          </div>
        )}
        
        {/* Preview Iframe */}
        {(backend === 'docker' || backend === 'html') && previewUrl && (
          <iframe
            src={previewUrl}
            className="w-full h-full border-0 bg-white"
            title="VFS Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        )}
        
        {/* Logs Panel */}
        {showLogs && backend === 'docker' && (
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-black/95 text-green-400 font-mono text-xs overflow-hidden flex flex-col border-t border-white/10">
            <div className="flex items-center justify-between px-3 py-1.5 bg-white/5">
              <span className="text-white/70">Container Logs</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowLogs(false)}
                className="h-5 w-5 p-0"
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {logs.length === 0 ? (
                <span className="text-gray-500">No logs yet...</span>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="whitespace-pre-wrap">{log}</div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

VFSPreview.displayName = 'VFSPreview';

export default VFSPreview;
