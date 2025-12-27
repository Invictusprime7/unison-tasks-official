/**
 * ReactPreview - Sandpack-based React Preview Component
 * 
 * This component uses CodeSandbox's Sandpack to render React/TypeScript code
 * natively in the browser. It's the recommended way to preview React components
 * as it handles transpilation, bundling, and hot reloading automatically.
 */

import React, { useMemo, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { 
  SandpackProvider, 
  SandpackPreview as SandpackPreviewComponent,
  SandpackLayout,
  useSandpack
} from '@codesandbox/sandpack-react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface ReactPreviewProps {
  code?: string;
  files?: Record<string, string>;
  className?: string;
  onError?: (error: string) => void;
  onSuccess?: () => void;
  showNavigator?: boolean;
  entryFile?: string;
}

export interface ReactPreviewHandle {
  refresh: () => void;
}

// Status component that reads from Sandpack context
const SandpackStatus: React.FC<{ onError?: (error: string) => void; onSuccess?: () => void }> = ({ 
  onError, 
  onSuccess 
}) => {
  const { sandpack } = useSandpack();
  const { status, error } = sandpack;
  
  useEffect(() => {
    if (error && onError) {
      onError(error.message);
    }
    if (status === 'idle' && !error && onSuccess) {
      onSuccess();
    }
  }, [status, error, onError, onSuccess]);

  if (status === 'initial' || status === 'idle') {
    return (
      <div className="absolute top-2 right-2 z-10 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md border flex items-center gap-1.5 text-xs pointer-events-none">
        <CheckCircle2 className="w-3 h-3 text-green-500" />
        <span className="text-muted-foreground">Live</span>
      </div>
    );
  }

  if (status === 'running') {
    return (
      <div className="absolute top-2 right-2 z-10 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md border flex items-center gap-1.5 text-xs pointer-events-none">
        <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
        <span className="text-muted-foreground">Running...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute top-2 right-2 z-10 bg-destructive/10 backdrop-blur-sm px-2 py-1 rounded-md border border-destructive/20 flex items-center gap-1.5 text-xs max-w-xs pointer-events-none">
        <AlertCircle className="w-3 h-3 text-destructive flex-shrink-0" />
        <span className="text-destructive truncate">{error.message}</span>
      </div>
    );
  }

  return null;
};

// Inner component that can access Sandpack context
const SandpackInner: React.FC<{
  onError?: (error: string) => void;
  onSuccess?: () => void;
  showNavigator?: boolean;
}> = ({ onError, onSuccess, showNavigator }) => {
  return (
    <div className="relative w-full h-full">
      <SandpackStatus onError={onError} onSuccess={onSuccess} />
      <SandpackLayout className="!h-full !border-0 !rounded-none">
        <SandpackPreviewComponent 
          showNavigator={showNavigator}
          showRefreshButton={false}
          showOpenInCodeSandbox={false}
          className="!h-full"
        />
      </SandpackLayout>
    </div>
  );
};

/**
 * Detect if code is React/JSX or plain HTML
 */
function isReactCode(code: string): boolean {
  if (!code) return false;
  
  const reactIndicators = [
    'import React',
    'from "react"',
    "from 'react'",
    'useState',
    'useEffect',
    'useCallback',
    'useMemo',
    'useRef',
    'className=',
    'React.FC',
    '<React.Fragment>',
    'export default function',
    'export function',
    ': React.',
  ];
  
  return reactIndicators.some(indicator => code.includes(indicator));
}

/**
 * Extract or wrap code into a proper React component structure
 */
function prepareReactCode(code: string): { appCode: string; cssCode: string } {
  let appCode = code.trim();
  let cssCode = `
@tailwind base;
@tailwind components;
@tailwind utilities;

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
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.75rem;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 20px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}
`;

  // If it's HTML, convert to React component
  if (!isReactCode(appCode)) {
    // Extract any CSS from HTML
    const styleMatch = appCode.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (styleMatch) {
      styleMatch.forEach(style => {
        cssCode += '\n' + style.replace(/<\/?style[^>]*>/gi, '');
        appCode = appCode.replace(style, '');
      });
    }
    
    // Extract body content if it's a full HTML document
    const bodyMatch = appCode.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const htmlContent = bodyMatch ? bodyMatch[1] : appCode;
    
    // Clean up HTML for dangerouslySetInnerHTML
    const cleanHtml = htmlContent
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .replace(/<\/?html[^>]*>/gi, '')
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
      .replace(/<\/?body[^>]*>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$')
      .trim();

    appCode = `import React from 'react';
import './styles.css';

export default function App() {
  return (
    <div 
      className="w-full min-h-screen"
      dangerouslySetInnerHTML={{ __html: \`${cleanHtml}\` }}
    />
  );
}`;
  } else {
    // Ensure React import and proper export
    if (!appCode.includes('import React')) {
      appCode = `import React from 'react';\n` + appCode;
    }
    
    // Add CSS import if not present
    if (!appCode.includes("import './styles.css'") && !appCode.includes('import "./styles.css"')) {
      appCode = appCode.replace(
        /import React/,
        `import React`
      );
      // Add after React import
      const reactImportMatch = appCode.match(/import React[^;]*;?\n?/);
      if (reactImportMatch) {
        appCode = appCode.replace(
          reactImportMatch[0],
          `${reactImportMatch[0]}import './styles.css';\n`
        );
      }
    }
    
    // Ensure default export
    if (!appCode.includes('export default')) {
      // Find component name
      const componentMatch = appCode.match(/(?:function|const)\s+(\w+)/);
      const componentName = componentMatch ? componentMatch[1] : 'App';
      
      // Check if there's already an export
      if (!appCode.includes(`export ${componentName}`) && !appCode.includes('export function')) {
        appCode += `\n\nexport default ${componentName};`;
      }
    }
  }

  return { appCode, cssCode };
}

export const ReactPreview = forwardRef<ReactPreviewHandle, ReactPreviewProps>(({
  code,
  files: externalFiles,
  className,
  onError,
  onSuccess,
  showNavigator = false,
  entryFile = '/src/App.tsx'
}, ref) => {
  const [key, setKey] = useState(0);

  useImperativeHandle(ref, () => ({
    refresh: () => setKey(k => k + 1)
  }));

  const files = useMemo(() => {
    // If external files are provided (from VFS), use them
    if (externalFiles && Object.keys(externalFiles).length > 0) {
      const sandpackFiles: Record<string, string> = {};
      
      // Convert VFS paths to Sandpack format
      Object.entries(externalFiles).forEach(([path, content]) => {
        // Sandpack needs paths starting with /
        const sandpackPath = path.startsWith('/') ? path : `/${path}`;
        sandpackFiles[sandpackPath] = content;
      });
      
      // Ensure we have essential files
      if (!sandpackFiles['/src/styles/index.css'] && !sandpackFiles['/styles.css']) {
        sandpackFiles['/styles.css'] = `
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
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
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}`;
      }
      
      return sandpackFiles;
    }
    
    // Fallback: single code string mode
    if (!code?.trim()) {
      return {
        '/App.tsx': `import React from 'react';
import './styles.css';

export default function App() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">No content to preview</p>
    </div>
  );
}`,
        '/styles.css': `
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}`
      };
    }

    const { appCode, cssCode } = prepareReactCode(code);

    return {
      '/App.tsx': appCode,
      '/styles.css': cssCode
    };
  }, [code, externalFiles]);

  // Determine entry file for Sandpack
  const activeFile = useMemo(() => {
    if (files[entryFile]) return entryFile;
    if (files['/src/App.tsx']) return '/src/App.tsx';
    if (files['/App.tsx']) return '/App.tsx';
    return Object.keys(files)[0] || '/App.tsx';
  }, [files, entryFile]);

  return (
    <div className={cn('w-full h-full', className)} key={key}>
      <SandpackProvider
        template="react-ts"
        files={files}
        theme="light"
        options={{
          externalResources: [
            'https://cdn.tailwindcss.com'
          ],
          activeFile,
          autorun: true,
          autoReload: true,
          recompileMode: 'delayed',
          recompileDelay: 500
        }}
        customSetup={{
          dependencies: {
            "lucide-react": "latest",
            "clsx": "latest",
            "tailwind-merge": "latest"
          }
        }}
      >
        <SandpackInner 
          onError={onError} 
          onSuccess={onSuccess}
          showNavigator={showNavigator}
        />
      </SandpackProvider>
    </div>
  );
});

ReactPreview.displayName = 'ReactPreview';
