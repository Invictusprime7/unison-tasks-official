/**
 * UnifiedPreview - Intelligent Preview Component
 * 
 * Automatically detects code type and uses the appropriate preview method:
 * - React/TypeScript → Sandpack (full React runtime)
 * - Vanilla HTML/CSS/JS → LiveHTMLPreview (iframe-based)
 * 
 * This solves the "Unexpected token 'function'" error by routing React code
 * to a proper React runtime instead of trying to execute it in a vanilla iframe.
 */

import React, { useState, useCallback, useRef, forwardRef, useImperativeHandle, useMemo, lazy, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { LiveHTMLPreview, LiveHTMLPreviewHandle } from './LiveHTMLPreview';
import { Button } from '@/components/ui/button';
import { reactToVanillaConverter } from '@/utils/reactToVanillaConverter';

// Lazy load ReactPreview since Sandpack is heavy
const ReactPreview = lazy(() => import('./ReactPreview').then(m => ({ default: m.ReactPreview })));

type PreviewMode = 'auto' | 'react' | 'html';

interface UnifiedPreviewProps {
  code: string;
  className?: string;
  autoRefresh?: boolean;
  onElementSelect?: (elementData: any) => void;
  enableSelection?: boolean;
  isInteractiveMode?: boolean;
  preferredMode?: PreviewMode;
  showModeToggle?: boolean;
}

export interface UnifiedPreviewHandle {
  updateElement: (selector: string, updates: any) => boolean;
  deleteElement: (selector: string) => boolean;
  duplicateElement: (selector: string) => boolean;
  getIframe: () => HTMLIFrameElement | null;
  refresh: () => void;
  setMode: (mode: PreviewMode) => void;
  getMode: () => PreviewMode;
}

/**
 * Detect if code is React/JSX or plain HTML
 */
function detectCodeType(code: string): 'react' | 'html' {
  if (!code?.trim()) return 'html';
  
  const reactIndicators = [
    'import React',
    'from "react"',
    "from 'react'",
    'useState(',
    'useEffect(',
    'useCallback(',
    'useMemo(',
    'useRef(',
    'React.FC',
    'React.Component',
    '<React.Fragment>',
    'React.createElement',
    ': React.',
    'JSX.Element',
  ];
  
  const strongReactIndicators = [
    'useState(',
    'useEffect(',
    'import React',
    'React.FC',
  ];
  
  // Check for strong React indicators first
  if (strongReactIndicators.some(indicator => code.includes(indicator))) {
    return 'react';
  }
  
  // Check for className= with JSX context (not just in HTML)
  const hasJSXClassName = /className=\{/.test(code) || 
    (/className="/.test(code) && /(?:function|const|export)\s+\w+/.test(code));
  
  // Check for JSX arrow functions or component definitions
  const hasComponentDef = /(?:function|const)\s+\w+.*?(?:=>|return)\s*\(?\s*</.test(code);
  
  if (hasJSXClassName || hasComponentDef) {
    return 'react';
  }
  
  // Check other React indicators
  if (reactIndicators.some(indicator => code.includes(indicator))) {
    return 'react';
  }
  
  return 'html';
}

/**
 * Convert React code to vanilla HTML/JS for HTML preview mode
 */
async function convertToHTML(code: string): Promise<string> {
  try {
    const result = await reactToVanillaConverter.convertReactToVanilla(code);
    if (result.success) {
      return result.html;
    }
    // Fallback: return as-is
    return code;
  } catch (error) {
    console.warn('[UnifiedPreview] Conversion failed:', error);
    return code;
  }
}

export const UnifiedPreview = forwardRef<UnifiedPreviewHandle, UnifiedPreviewProps>(({
  code,
  className,
  autoRefresh = true,
  onElementSelect,
  enableSelection = true,
  isInteractiveMode = false,
  preferredMode = 'auto',
  showModeToggle = true
}, ref) => {
  const [mode, setMode] = useState<PreviewMode>(preferredMode);
  const [convertedCode, setConvertedCode] = useState<string>(code);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const htmlPreviewRef = useRef<LiveHTMLPreviewHandle>(null);
  const reactPreviewRef = useRef<{ refresh: () => void } | null>(null);

  // Determine actual mode based on 'auto' detection
  const actualMode = useMemo(() => {
    if (mode === 'auto') {
      return detectCodeType(code);
    }
    return mode === 'react' ? 'react' : 'html';
  }, [mode, code]);

  // Convert code when switching to HTML mode for React code
  const handleModeSwitch = useCallback(async () => {
    const newMode = actualMode === 'react' ? 'html' : 'react';
    
    if (newMode === 'html' && detectCodeType(code) === 'react') {
      setIsConverting(true);
      try {
        const converted = await convertToHTML(code);
        setConvertedCode(converted);
      } catch (err) {
        console.error('[UnifiedPreview] Conversion error:', err);
        setError('Failed to convert React to HTML');
      } finally {
        setIsConverting(false);
      }
    } else {
      setConvertedCode(code);
    }
    
    setMode(newMode);
  }, [actualMode, code]);

  // Update converted code when source code changes
  React.useEffect(() => {
    if (mode === 'html' && detectCodeType(code) === 'react') {
      convertToHTML(code).then(setConvertedCode);
    } else {
      setConvertedCode(code);
    }
  }, [code, mode]);

  useImperativeHandle(ref, () => ({
    updateElement: (selector: string, updates: any) => {
      if (htmlPreviewRef.current) {
        return htmlPreviewRef.current.updateElement(selector, updates);
      }
      return false;
    },
    deleteElement: (selector: string) => {
      if (htmlPreviewRef.current) {
        return htmlPreviewRef.current.deleteElement(selector);
      }
      return false;
    },
    duplicateElement: (selector: string) => {
      if (htmlPreviewRef.current) {
        return htmlPreviewRef.current.duplicateElement(selector);
      }
      return false;
    },
    getIframe: () => {
      if (htmlPreviewRef.current) {
        return htmlPreviewRef.current.getIframe();
      }
      return null;
    },
    refresh: () => {
      if (actualMode === 'react' && reactPreviewRef.current) {
        reactPreviewRef.current.refresh();
      }
    },
    setMode: (newMode: PreviewMode) => setMode(newMode),
    getMode: () => mode
  }));

  return (
    <div className={cn('relative w-full h-full', className)}>
      {/* Mode toggle */}
      {showModeToggle && (
        <div className="absolute top-2 left-2 z-20 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleModeSwitch}
            disabled={isConverting}
            className="h-7 px-2 text-xs bg-background/90 backdrop-blur-sm"
          >
            {isConverting ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : actualMode === 'react' ? (
              <ToggleRight className="w-3 h-3 mr-1" />
            ) : (
              <ToggleLeft className="w-3 h-3 mr-1" />
            )}
            {actualMode === 'react' ? 'React' : 'HTML'}
          </Button>
          <span className="text-xs text-muted-foreground bg-background/90 backdrop-blur-sm px-2 py-1 rounded">
            {mode === 'auto' ? '(auto)' : '(manual)'}
          </span>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="absolute top-12 left-2 right-2 z-20 bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2 text-xs text-destructive">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* React Preview (Sandpack) */}
      {actualMode === 'react' && (
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading React runtime...</span>
            </div>
          </div>
        }>
          <ReactPreview 
            ref={reactPreviewRef}
            code={code}
            className="w-full h-full"
            onError={(err) => setError(err)}
            onSuccess={() => setError(null)}
          />
        </Suspense>
      )}

      {/* HTML Preview (iframe) */}
      {actualMode === 'html' && (
        <LiveHTMLPreview
          ref={htmlPreviewRef}
          code={convertedCode}
          autoRefresh={autoRefresh}
          onElementSelect={onElementSelect}
          enableSelection={enableSelection}
          isInteractiveMode={isInteractiveMode}
          className="w-full h-full"
        />
      )}
    </div>
  );
});

UnifiedPreview.displayName = 'UnifiedPreview';

export default UnifiedPreview;
