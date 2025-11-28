/**
 * CodeMirror Editor Component
 * Lightweight code editor wrapper with syntax highlighting
 */

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface CodeMirrorEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: 'javascript' | 'typescript' | 'html' | 'css' | 'json';
  theme?: 'vs-dark' | 'vs-light' | 'dark' | 'light';
  height?: string;
  readOnly?: boolean;
  isAIProcessing?: boolean;
  options?: {
    minimap?: { enabled: boolean };
    fontSize?: number;
    lineNumbers?: 'on' | 'off';
    roundedSelection?: boolean;
    scrollBeyondLastLine?: boolean;
    automaticLayout?: boolean;
    tabSize?: number;
    wordWrap?: 'on' | 'off';
    formatOnPaste?: boolean;
    formatOnType?: boolean;
    suggestOnTriggerCharacters?: boolean;
    quickSuggestions?: boolean;
  };
  className?: string;
}

const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({
  value,
  onChange,
  language = 'javascript',
  theme = 'vs-dark',
  height = '100%',
  readOnly = false,
  isAIProcessing = false,
  options = {},
  className
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.value = value;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!readOnly && onChange) {
      onChange(e.target.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      
      if (onChange) {
        onChange(newValue);
      }
      
      // Set cursor position after the inserted tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-lg border border-slate-700 bg-slate-950',
        isAIProcessing && 'opacity-60 pointer-events-none',
        className
      )}
      style={{ height }}
    >
      {isAIProcessing && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-slate-400">AI is processing...</p>
          </div>
        </div>
      )}
      
      <textarea
        ref={textareaRef}
        defaultValue={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        className={cn(
          'w-full h-full p-4 bg-slate-950 text-slate-100 font-mono text-sm',
          'resize-none outline-none focus:ring-2 focus:ring-purple-500/50',
          'leading-relaxed',
          readOnly && 'cursor-default'
        )}
        style={{
          fontSize: options.fontSize || 14,
          tabSize: options.tabSize || 2,
          wordWrap: options.wordWrap === 'on' ? 'break-word' : 'normal',
          whiteSpace: options.wordWrap === 'on' ? 'pre-wrap' : 'pre'
        }}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
      />
      
      {/* Language indicator */}
      <div className="absolute top-2 right-2 px-3 py-1 bg-slate-800/90 text-slate-400 text-xs font-semibold rounded backdrop-blur-sm">
        {language.toUpperCase()}
      </div>
      
      {/* Line count indicator */}
      <div className="absolute bottom-2 right-2 px-3 py-1 bg-slate-800/90 text-slate-500 text-xs rounded backdrop-blur-sm">
        {value.split('\n').length} lines
      </div>
    </div>
  );
};

export default CodeMirrorEditor;
