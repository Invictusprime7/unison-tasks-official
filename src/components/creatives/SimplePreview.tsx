/**
 * SimplePreview - Reliable Preview Component with Fallback
 * 
 * A simplified preview component that uses Sandpack for React preview
 * with automatic fallback to static HTML preview when Sandpack times out.
 * 
 * Features:
 * - Direct VirtualFileSystem → Sandpack connection
 * - Pre-bundled common dependencies
 * - Tailwind CSS support via CDN
 * - Automatic import stripping for unsupported modules
 * - Fallback to HTML preview on timeout
 * - Reliable error handling
 */

import React, { useMemo, useState, forwardRef, useImperativeHandle, useCallback, useEffect, useRef } from 'react';
import { 
  SandpackProvider, 
  SandpackPreview,
  SandpackLayout,
  useSandpack,
  SandpackConsole
} from '@codesandbox/sandpack-react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Terminal, X, ChevronDown, ChevronUp, Code2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================================================
// Types
// ============================================================================

type PreviewMode = 'sandpack' | 'html' | 'loading';

interface SimplePreviewProps {
  /** Files from VirtualFileSystem - Record<path, content> */
  files: Record<string, string>;
  /** Active file path for initial focus */
  activeFile?: string;
  /** Additional CSS class */
  className?: string;
  /** Callback when preview loads successfully */
  onReady?: () => void;
  /** Callback when error occurs */
  onError?: (error: string) => void;
  /** Show console panel */
  showConsole?: boolean;
  /** Show file navigator in preview */
  showNavigator?: boolean;
}

export interface SimplePreviewHandle {
  refresh: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const SANDPACK_TIMEOUT_MS = 10000; // 10 seconds timeout for Sandpack

// Common dependencies that are always available
const BUNDLED_DEPENDENCIES = {
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "lucide-react": "latest",
  "clsx": "latest",
  "tailwind-merge": "latest",
  "class-variance-authority": "latest",
  "@radix-ui/react-slot": "latest",
  "framer-motion": "latest",
  "date-fns": "latest",
  "recharts": "latest",
};

// Modules that can be imported (won't be stripped)
const ALLOWED_IMPORTS = new Set([
  'react',
  'react-dom',
  'react-dom/client',
  'lucide-react',
  'clsx',
  'tailwind-merge',
  'class-variance-authority',
  '@radix-ui/react-slot',
  'framer-motion',
  'date-fns',
  'recharts',
]);

// CSS Variables for shadcn/ui theming
const BASE_CSS = `
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.75rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 48%;
}

* {
  border-color: hsl(var(--border));
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  margin: 0;
  padding: 0;
}
`;

// Default main.tsx entry point
const DEFAULT_MAIN = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

// Default empty app
const DEFAULT_APP = `import React from 'react';

export default function App() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <p className="text-muted-foreground">Start coding to see preview</p>
    </div>
  );
}
`;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Strip imports that Sandpack can't resolve
 */
function processCode(code: string, filePath: string): string {
  // Only process TypeScript/JavaScript files
  if (!/\.(tsx?|jsx?|mjs)$/.test(filePath)) {
    return code;
  }

  let processed = code;

  // Remove @/ path alias imports
  processed = processed.replace(
    /^import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s*,?\s*)*\s*from\s+['"]@\/[^'"]+['"];?\s*$/gm,
    (match) => `// [Preview] Stripped: ${match.trim()}`
  );

  // Remove relative imports that reference project-specific files
  // Keep: react, react-dom, lucide-react, and allowed packages
  processed = processed.replace(
    /^import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s*,?\s*)*\s*from\s+['"]([^'"]+)['"];?\s*$/gm,
    (match, modulePath) => {
      // Check if it's an allowed module
      const baseModule = modulePath.split('/')[0];
      if (ALLOWED_IMPORTS.has(modulePath) || ALLOWED_IMPORTS.has(baseModule)) {
        return match;
      }
      
      // Keep CSS imports
      if (/\.(css|scss|less)$/.test(modulePath)) {
        return match;
      }
      
      // Keep relative imports within src (might be user-created components)
      if (modulePath.startsWith('./') && !modulePath.includes('hooks/')) {
        return match;
      }
      
      // Strip everything else
      if (modulePath.startsWith('@/') || modulePath.startsWith('../')) {
        return `// [Preview] Stripped: ${match.trim()}`;
      }
      
      return match;
    }
  );

  // Remove hook calls that would break (useAssetRegistry, etc.)
  const unsupportedHooks = [
    'useAssetRegistry',
    'useTemplateState',
    'useGoHighLevelCRM',
    'useSupabaseClient',
  ];
  
  for (const hook of unsupportedHooks) {
    // Remove destructured hook results
    processed = processed.replace(
      new RegExp(`const\\s+\\{[^}]*\\}\\s*=\\s*${hook}\\([^)]*\\);?`, 'g'),
      `// [Preview] Stripped ${hook} call`
    );
    // Remove simple hook results
    processed = processed.replace(
      new RegExp(`const\\s+\\w+\\s*=\\s*${hook}\\([^)]*\\);?`, 'g'),
      `// [Preview] Stripped ${hook} call`
    );
    // Replace any remaining calls with empty object
    processed = processed.replace(
      new RegExp(`${hook}\\([^)]*\\)`, 'g'),
      '{}'
    );
  }

  // Clean up multiple blank lines
  processed = processed.replace(/\n{3,}/g, '\n\n');

  return processed;
}

/**
 * Convert VFS files to Sandpack format
 */
function prepareFiles(files: Record<string, string>): Record<string, string> {
  const sandpackFiles: Record<string, string> = {};
  let hasApp = false;
  let hasMain = false;
  let hasCSS = false;

  // Process each file
  for (const [path, content] of Object.entries(files)) {
    // Normalize path to start with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // Skip node_modules, hidden files, etc.
    if (normalizedPath.includes('node_modules') || normalizedPath.includes('/.')) {
      continue;
    }

    // Process code files
    const processedContent = processCode(content, normalizedPath);
    sandpackFiles[normalizedPath] = processedContent;

    // Track what we have
    if (normalizedPath.includes('App.tsx') || normalizedPath.includes('App.jsx')) {
      hasApp = true;
    }
    if (normalizedPath.includes('main.tsx') || normalizedPath.includes('main.jsx') || normalizedPath.includes('index.tsx')) {
      hasMain = true;
    }
    if (normalizedPath.includes('.css')) {
      hasCSS = true;
    }
  }

  // Add missing essential files
  if (!hasCSS) {
    sandpackFiles['/index.css'] = BASE_CSS;
  }

  if (!hasApp) {
    sandpackFiles['/App.tsx'] = DEFAULT_APP;
  }

  if (!hasMain) {
    sandpackFiles['/main.tsx'] = DEFAULT_MAIN;
  }

  return sandpackFiles;
}

// ============================================================================
// Status Component (uses Sandpack context)
// ============================================================================

const PreviewStatus: React.FC<{
  onReady?: () => void;
  onError?: (error: string) => void;
}> = ({ onReady, onError }) => {
  const { sandpack } = useSandpack();
  const { status, error } = sandpack;
  const [hasNotifiedReady, setHasNotifiedReady] = useState(false);

  useEffect(() => {
    if (error && onError) {
      onError(error.message);
    }
    if (status === 'idle' && !error && onReady && !hasNotifiedReady) {
      onReady();
      setHasNotifiedReady(true);
    }
  }, [status, error, onReady, onError, hasNotifiedReady]);

  // Reset ready notification when status changes away from idle
  useEffect(() => {
    if (status !== 'idle') {
      setHasNotifiedReady(false);
    }
  }, [status]);

  const getStatusDisplay = () => {
    if (error) {
      return {
        icon: <AlertCircle className="w-3 h-3 text-destructive" />,
        text: 'Error',
        className: 'bg-destructive/10 border-destructive/20 text-destructive'
      };
    }
    
    switch (status) {
      case 'running':
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin text-blue-500" />,
          text: 'Compiling...',
          className: 'bg-blue-50 border-blue-200'
        };
      case 'idle':
        return {
          icon: <CheckCircle2 className="w-3 h-3 text-green-500" />,
          text: 'Live',
          className: 'bg-green-50 border-green-200'
        };
      default:
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />,
          text: 'Loading...',
          className: 'bg-muted'
        };
    }
  };

  const display = getStatusDisplay();

  return (
    <div className={cn(
      "absolute top-2 right-2 z-10 px-2 py-1 rounded-md border flex items-center gap-1.5 text-xs backdrop-blur-sm",
      display.className
    )}>
      {display.icon}
      <span>{display.text}</span>
    </div>
  );
};

// ============================================================================
// Console Panel
// ============================================================================

const ConsolePanel: React.FC<{
  isOpen: boolean;
  onToggle: () => void;
}> = ({ isOpen, onToggle }) => {
  return (
    <div className="border-t bg-slate-900 text-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-800 hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Console</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {isOpen && (
        <div className="h-32 overflow-auto">
          <SandpackConsole 
            showHeader={false}
            className="!bg-slate-900 !border-0"
          />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Inner Preview Component (has Sandpack context)
// ============================================================================

const PreviewInner: React.FC<{
  onReady?: () => void;
  onError?: (error: string) => void;
  onTimeout?: () => void;
  showNavigator?: boolean;
  showConsole?: boolean;
}> = ({ onReady, onError, onTimeout, showNavigator, showConsole }) => {
  const [consoleOpen, setConsoleOpen] = useState(false);
  const { sandpack } = useSandpack();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasTimedOut = useRef(false);

  // Set up timeout detection
  useEffect(() => {
    hasTimedOut.current = false;
    
    timeoutRef.current = setTimeout(() => {
      // Check if still not ready after timeout
      if (sandpack.status !== 'idle') {
        hasTimedOut.current = true;
        onTimeout?.();
      }
    }, SANDPACK_TIMEOUT_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [sandpack.status, onTimeout]);

  // Clear timeout when ready
  useEffect(() => {
    if (sandpack.status === 'idle' && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [sandpack.status]);

  return (
    <div className="relative w-full h-full min-h-0 flex flex-col bg-white">
      <PreviewStatus onReady={onReady} onError={onError} />
      
      <div className="flex-1 min-h-0">
        <SandpackLayout className="!flex-1 !min-h-0 !border-0 !rounded-none !bg-transparent">
          <SandpackPreview
            showNavigator={showNavigator}
            showRefreshButton={false}
            showOpenInCodeSandbox={false}
            style={{ height: '100%', minHeight: 0 }}
          />
        </SandpackLayout>
      </div>

      {showConsole && (
        <ConsolePanel isOpen={consoleOpen} onToggle={() => setConsoleOpen(!consoleOpen)} />
      )}
    </div>
  );
};

// ============================================================================
// HTML Fallback Preview
// ============================================================================

/**
 * Convert React JSX to static HTML for fallback preview
 */
function convertToStaticHTML(files: Record<string, string>): string {
  // Find the main App file
  const appFile = Object.entries(files).find(([path]) => 
    path.includes('App.tsx') || path.includes('App.jsx')
  );
  
  const appContent = appFile?.[1] || '';
  
  // Extract JSX from the return statement
  const returnMatch = appContent.match(/return\s*\(\s*([\s\S]*?)\s*\);?\s*\}?\s*$/);
  let jsx = returnMatch?.[1] || '<div>Preview unavailable</div>';
  
  // Clean up JSX for HTML
  // Convert className to class
  jsx = jsx.replace(/className=/g, 'class=');
  
  // Remove React-specific attributes
  jsx = jsx.replace(/\s(onClick|onChange|onSubmit|onFocus|onBlur|ref)=\{[^}]+\}/g, '');
  
  // Convert self-closing tags to HTML
  jsx = jsx.replace(/<(\w+)([^>]*)\s*\/>/g, '<$1$2></$1>');
  
  // Remove {expressions} - replace with placeholder or remove
  jsx = jsx.replace(/\{[^}]+\}/g, '');
  
  // Find CSS content
  const cssFile = Object.entries(files).find(([path]) => path.includes('.css'));
  const cssContent = cssFile?.[1] || '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${cssContent}
    
    :root {
      --background: 0 0% 100%;
      --foreground: 222.2 84% 4.9%;
      --card: 0 0% 100%;
      --card-foreground: 222.2 84% 4.9%;
      --primary: 221.2 83.2% 53.3%;
      --primary-foreground: 210 40% 98%;
      --secondary: 210 40% 96.1%;
      --secondary-foreground: 222.2 47.4% 11.2%;
      --muted: 210 40% 96.1%;
      --muted-foreground: 215.4 16.3% 46.9%;
      --destructive: 0 84.2% 60.2%;
      --border: 214.3 31.8% 91.4%;
      --radius: 0.75rem;
    }
    
    * { border-color: hsl(var(--border)); }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: hsl(var(--background));
      color: hsl(var(--foreground));
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <div id="root">
    ${jsx}
  </div>
</body>
</html>`;
}

const HTMLFallbackPreview: React.FC<{
  files: Record<string, string>;
  onRetry: () => void;
}> = ({ files, onRetry }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const htmlContent = useMemo(() => convertToStaticHTML(files), [files]);

  useEffect(() => {
    if (iframeRef.current) {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;
      
      return () => URL.revokeObjectURL(url);
    }
  }, [htmlContent]);

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Fallback banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-800">
          <Globe className="w-4 h-4" />
          <span className="text-xs font-medium">Static HTML Preview (Sandpack unavailable)</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRetry}
          className="h-6 px-2 text-xs text-amber-700 hover:text-amber-900"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Retry Sandpack
        </Button>
      </div>
      
      <iframe
        ref={iframeRef}
        className="flex-1 w-full border-0 bg-white"
        sandbox="allow-scripts allow-same-origin"
        title="HTML Preview"
      />
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const SimplePreview = forwardRef<SimplePreviewHandle, SimplePreviewProps>(({
  files,
  activeFile = '/src/App.tsx',
  className,
  onReady,
  onError,
  showConsole = false,
  showNavigator = false,
}, ref) => {
  const [key, setKey] = useState(0);
  const [mode, setMode] = useState<PreviewMode>('sandpack');
  const [hasError, setHasError] = useState(false);

  // Expose refresh method
  useImperativeHandle(ref, () => ({
    refresh: () => {
      setHasError(false);
      setMode('sandpack');
      setKey(k => k + 1);
    }
  }));

  // Prepare files for Sandpack
  const sandpackFiles = useMemo(() => {
    return prepareFiles(files);
  }, [files]);

  // Determine entry file
  const entryFile = useMemo(() => {
    // Check if activeFile exists in processed files
    if (sandpackFiles[activeFile]) return activeFile;
    
    // Try common entry points
    const candidates = ['/src/App.tsx', '/App.tsx', '/src/App.jsx', '/App.jsx'];
    for (const candidate of candidates) {
      if (sandpackFiles[candidate]) return candidate;
    }
    
    // Fallback to first TSX/JSX file
    const firstCode = Object.keys(sandpackFiles).find(p => /\.(tsx?|jsx?)$/.test(p));
    return firstCode || '/App.tsx';
  }, [sandpackFiles, activeFile]);

  const handleError = useCallback((error: string) => {
    setHasError(true);
    onError?.(error);
  }, [onError]);

  const handleTimeout = useCallback(() => {
    console.warn('[SimplePreview] Sandpack timeout - falling back to HTML preview');
    setMode('html');
  }, []);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setMode('sandpack');
    setKey(k => k + 1);
  }, []);

  // HTML fallback mode
  if (mode === 'html') {
    return (
      <div className={cn('w-full h-full flex flex-col min-h-0 bg-background', className)}>
        <HTMLFallbackPreview files={sandpackFiles} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className={cn('w-full h-full flex flex-col min-h-0 bg-background', className)} key={key}>
      {hasError && (
        <div className="absolute top-10 left-2 right-2 z-20 bg-destructive/10 border border-destructive/20 rounded-md p-2 flex items-center justify-between">
          <span className="text-xs text-destructive">Preview encountered an error</span>
          <Button variant="ghost" size="sm" onClick={handleRetry} className="h-6 px-2 text-xs">
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        </div>
      )}

      <SandpackProvider
        template="react-ts"
        files={sandpackFiles}
        theme="light"
        options={{
          externalResources: ['https://cdn.tailwindcss.com'],
          activeFile: entryFile,
          visibleFiles: [entryFile],
          autorun: true,
          autoReload: true,
          recompileMode: 'delayed',
          recompileDelay: 300,
        }}
        customSetup={{
          dependencies: BUNDLED_DEPENDENCIES,
        }}
      >
        <PreviewInner
          onReady={onReady}
          onError={handleError}
          onTimeout={handleTimeout}
          showNavigator={showNavigator}
          showConsole={showConsole}
        />
      </SandpackProvider>
    </div>
  );
});

SimplePreview.displayName = 'SimplePreview';

export default SimplePreview;
