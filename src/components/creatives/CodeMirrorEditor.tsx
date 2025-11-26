import React, { useCallback, useRef, useState, useMemo } from 'react';
import CodeMirror, { EditorView, ReactCodeMirrorRef, ViewUpdate } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { autocompletion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { linter, Diagnostic } from '@codemirror/lint';
import { html as beautifyHTML } from 'js-beautify';
import prettier from 'prettier/standalone';
import parserHTML from 'prettier/plugins/html';
import parserCSS from 'prettier/plugins/postcss';
import parserJS from 'prettier/plugins/babel';
import parserESTree from 'prettier/plugins/estree';

// Mock Monaco API types for compatibility
export interface MockMonacoEditor {
  getValue: () => string;
  setValue: (newValue: string) => void;
  getSelection: () => { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number } | null;
  getModel: () => { getValueInRange: (range: unknown) => string };
  addAction: (action: { id: string; label: string; keybindings?: number[]; run: (ed: MockMonacoEditor) => void }) => void;
  executeEdits: (source: string, edits: unknown[]) => void;
}

export interface MockMonacoAPI {
  editor: MockMonacoEditor;
  languages: {
    html: { htmlDefaults: { setOptions: (opts: unknown) => void } };
    css: { cssDefaults: { setOptions: (opts: unknown) => void } };
    typescript: {
      javascriptDefaults: {
        setCompilerOptions: (opts: unknown) => void;
        setDiagnosticsOptions: (opts: unknown) => void;
        addExtraLib: (content: string, filePath: string) => void;
      };
      typescriptDefaults: {
        setDiagnosticsOptions: (opts: unknown) => void;
      };
      ScriptTarget: { ESNext: number };
      ModuleResolutionKind: { Classic: number; NodeJs: number };
      ModuleKind: { None: number; ESNext: number };
    };
    registerCompletionItemProvider: (langs: string[], provider: unknown) => void;
    registerInlineCompletionsProvider: (lang: string, provider: unknown) => void;
    CompletionItemKind: { Property: number; Color: number };
  };
  KeyMod: { CtrlCmd: number; Shift: number };
  KeyCode: { KeyA: number };
}

// Monaco-compatible API types
export interface CodeMirrorEditorProps {
  value?: string;
  defaultValue?: string;
  language?: string;
  theme?: 'vs-dark' | 'light';
  height?: string;
  width?: string;
  options?: {
    minimap?: { enabled: boolean };
    fontSize?: number;
    lineNumbers?: 'on' | 'off';
    readOnly?: boolean;
    wordWrap?: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
    tabSize?: number;
    formatOnPaste?: boolean;
    formatOnType?: boolean;
    automaticLayout?: boolean;
    scrollBeyondLastLine?: boolean;
    roundedSelection?: boolean;
    suggestOnTriggerCharacters?: boolean;
    quickSuggestions?: boolean;
    inlineSuggest?: { enabled: boolean };
  };
  onChange?: (value: string | undefined, event: ViewUpdate) => void;
  onMount?: (editor: MockMonacoEditor, monaco: MockMonacoAPI) => void;
  beforeMount?: (monaco: MockMonacoAPI) => void;
  isAIProcessing?: boolean; // NEW: External AI processing indicator
}

// Enhanced CodeMirror Editor with Monaco-compatible API
const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({
  value,
  defaultValue,
  language = 'html',
  theme = 'vs-dark',
  height = '600px',
  width = '100%',
  options = {},
  onChange,
  onMount,
  beforeMount,
  isAIProcessing: externalAIProcessing = false,
}) => {
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const [internalAIProcessing, setInternalAIProcessing] = useState(false);
  
  // Use external AI processing state if provided, otherwise use internal
  const isAIProcessing = externalAIProcessing || internalAIProcessing;

  // Map Monaco language names to CodeMirror extensions
  const getLanguageExtension = useCallback(() => {
    const langMap: Record<string, () => ReturnType<typeof html | typeof javascript | typeof css>> = {
      'html': () => html(),
      'javascript': () => javascript({ jsx: false, typescript: false }),
      'typescript': () => javascript({ jsx: false, typescript: true }),
      'jsx': () => javascript({ jsx: true, typescript: false }),
      'tsx': () => javascript({ jsx: true, typescript: true }),
      'css': () => css(),
      'json': () => javascript(),
    };
    const langGetter = langMap[language.toLowerCase()];
    return langGetter ? langGetter() : html();
  }, [language]);

  // AI Template-specific autocomplete for common patterns
  const aiTemplateCompletions = useCallback((context: CompletionContext): CompletionResult | null => {
    const word = context.matchBefore(/[\w-]*/);
    if (!word || (word.from === word.to && !context.explicit)) return null;

    const aiTemplateClasses = [
      // Glass morphism patterns
      { label: 'glass-morphism', type: 'class', info: 'AI generated glass morphism effect with backdrop-blur-lg' },
      { label: 'glass-card', type: 'class', info: 'Glass card with backdrop blur and border' },
      { label: 'glass-button', type: 'class', info: 'Glass button with hover effects and transitions' },
      
      // Elite/Premium patterns
      { label: 'elite-portfolio', type: 'class', info: 'Professional portfolio section with grid layout' },
      { label: 'elite-booking-platform', type: 'class', info: 'Booking platform with calendar and form validation' },
      { label: 'elite-hero', type: 'class', info: 'Elite hero section with gradient and animations' },
      
      // Creative patterns
      { label: 'creative-landing', type: 'class', info: 'Creative landing page with parallax and gradients' },
      { label: 'creative-animation', type: 'class', info: 'Advanced CSS animations with keyframes' },
      { label: 'creative-gradient', type: 'class', info: 'Multi-color gradient backgrounds' },
      
      // Interactive elements
      { label: 'interactive-card', type: 'class', info: 'Card with hover/click interactions and transforms' },
      { label: 'immersive-section', type: 'class', info: 'Immersive full-screen section with scroll effects' },
      { label: 'cinematic-header', type: 'class', info: 'Cinematic header with parallax scrolling' },
      
      // Responsive utilities
      { label: 'responsive-grid', type: 'class', info: 'AI-optimized responsive grid (1/2/3/4 cols)' },
      { label: 'adaptive-layout', type: 'class', info: 'Adaptive layout for mobile/tablet/desktop' },
      
      // Tailwind CSS - Layout & Spacing (Common AI patterns)
      { label: 'flex items-center justify-center', type: 'class', info: 'Flexbox centered container' },
      { label: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3', type: 'class', info: 'Responsive grid layout' },
      { label: 'container mx-auto px-4', type: 'class', info: 'Centered container with padding' },
      { label: 'w-full h-screen', type: 'class', info: 'Full width and height viewport' },
      { label: 'max-w-7xl mx-auto', type: 'class', info: 'Max width container centered' },
      { label: 'space-y-4', type: 'class', info: 'Vertical spacing between children' },
      { label: 'gap-6', type: 'class', info: 'Gap spacing in grid/flex' },
      
      // Tailwind CSS - Typography
      { label: 'text-4xl font-bold text-gray-900', type: 'class', info: 'Large bold heading' },
      { label: 'text-lg text-gray-600 leading-relaxed', type: 'class', info: 'Paragraph text style' },
      { label: 'font-inter font-medium', type: 'class', info: 'Inter font medium weight' },
      
      // Tailwind CSS - Colors & Backgrounds
      { label: 'bg-gradient-to-r from-purple-600 to-blue-600', type: 'class', info: 'Purple to blue gradient' },
      { label: 'bg-white shadow-lg rounded-lg', type: 'class', info: 'White card with shadow' },
      { label: 'bg-gray-900 text-white', type: 'class', info: 'Dark background with white text' },
      { label: 'backdrop-blur-lg bg-white/30', type: 'class', info: 'Glass morphism effect' },
      
      // Tailwind CSS - Effects & Transitions
      { label: 'hover:scale-105 transition-transform duration-300', type: 'class', info: 'Hover scale effect' },
      { label: 'hover:shadow-xl transition-shadow', type: 'class', info: 'Hover shadow effect' },
      { label: 'animate-fade-in', type: 'class', info: 'Fade in animation' },
      { label: 'opacity-0 animate-slide-up', type: 'class', info: 'Slide up animation' },
      
      // Tailwind CSS - Buttons
      { label: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg', type: 'class', info: 'Primary button' },
      { label: 'border-2 border-gray-300 hover:border-gray-400 py-2 px-4 rounded', type: 'class', info: 'Outline button' },
      
      // Vanilla JavaScript - Common patterns
      { label: 'document.querySelector', type: 'function', info: 'Select single element by CSS selector' },
      { label: 'document.querySelectorAll', type: 'function', info: 'Select all elements by CSS selector' },
      { label: 'addEventListener', type: 'method', info: 'Attach event listener to element' },
      { label: 'classList.add', type: 'method', info: 'Add class to element' },
      { label: 'classList.remove', type: 'method', info: 'Remove class from element' },
      { label: 'classList.toggle', type: 'method', info: 'Toggle class on element' },
      { label: 'setTimeout', type: 'function', info: 'Execute function after delay' },
      { label: 'setInterval', type: 'function', info: 'Execute function repeatedly' },
      { label: 'fetch', type: 'function', info: 'Make HTTP request (Promise-based)' },
      { label: 'scrollIntoView', type: 'method', info: 'Scroll element into viewport' },
      { label: 'preventDefault', type: 'method', info: 'Prevent default event behavior' },
      { label: 'stopPropagation', type: 'method', info: 'Stop event bubbling' },
    ];

    return {
      from: word.from,
      options: aiTemplateClasses.map(item => ({
        label: item.label,
        type: item.type,
        detail: item.info,
        apply: item.label,
        boost: item.label.startsWith('bg-') || item.label.startsWith('text-') ? 10 : 
               item.label.includes('glass-') || item.label.includes('elite-') ? 20 : 0,
      })),
    };
  }, []);

  // AI Template validation linter
  const aiTemplateLinter = useCallback((view: EditorView): Diagnostic[] => {
    const diagnostics: Diagnostic[] = [];
    const doc = view.state.doc.toString();

    // Check for common AI generation issues
    
    // 1. Unclosed tags in HTML
    if (language.toLowerCase() === 'html') {
      const openTags = doc.match(/<(\w+)[^>]*>/g) || [];
      const closeTags = doc.match(/<\/(\w+)>/g) || [];
      
      const openTagNames = openTags.map(tag => tag.match(/<(\w+)/)?.[1]).filter(Boolean);
      const closeTagNames = closeTags.map(tag => tag.match(/<\/(\w+)>/)?.[1]).filter(Boolean);
      
      // Self-closing tags that don't need closing
      const selfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
      
      openTagNames.forEach((tagName) => {
        if (tagName && !selfClosing.includes(tagName.toLowerCase())) {
          const openCount = openTagNames.filter(t => t === tagName).length;
          const closeCount = closeTagNames.filter(t => t === tagName).length;
          
          if (openCount > closeCount) {
            // Find position of unclosed tag (approximate)
            const lastOpenIndex = doc.lastIndexOf(`<${tagName}`);
            if (lastOpenIndex !== -1) {
              diagnostics.push({
                from: lastOpenIndex,
                to: lastOpenIndex + tagName.length + 2,
                severity: 'warning',
                message: `Unclosed <${tagName}> tag detected`,
              });
            }
          }
        }
      });
    }

    // 2. Empty class attributes
    const emptyClasses = [...doc.matchAll(/class=["']\s*["']/g)];
    emptyClasses.forEach(match => {
      if (match.index !== undefined) {
        diagnostics.push({
          from: match.index,
          to: match.index + match[0].length,
          severity: 'info',
          message: 'Empty class attribute - consider removing',
        });
      }
    });

    // 3. Inline styles that could use utility classes
    const inlineStyles = [...doc.matchAll(/style=["'][^"']*["']/g)];
    if (inlineStyles.length > 3) {
      diagnostics.push({
        from: 0,
        to: 1,
        severity: 'info',
        message: `Found ${inlineStyles.length} inline styles - consider using CSS classes`,
      });
    }

    // 4. Missing alt attributes on images (accessibility)
    if (language.toLowerCase() === 'html') {
      const imgsWithoutAlt = [...doc.matchAll(/<img(?![^>]*alt=)[^>]*>/g)];
      imgsWithoutAlt.forEach(match => {
        if (match.index !== undefined) {
          diagnostics.push({
            from: match.index,
            to: match.index + match[0].length,
            severity: 'warning',
            message: 'Image missing alt attribute for accessibility',
          });
        }
      });
    }

    // 5. Tailwind CSS - Check for common mistakes
    if (language.toLowerCase() === 'html') {
      // Invalid Tailwind class patterns
      const invalidTailwindClasses = [
        { pattern: /class=["'][^"']*\b(margin|padding|color|background):\s*[^"']*["']/g, message: 'Use Tailwind classes (m-, p-, bg-, text-) instead of CSS properties in class attribute' },
        { pattern: /class=["'][^"']*\b\d+px\b[^"']*["']/g, message: 'Use Tailwind spacing units (4, 6, 8) instead of px values' },
        { pattern: /class=["'][^"']*#{1,6}[0-9A-Fa-f]{3,6}[^"']*["']/g, message: 'Use Tailwind color classes (bg-blue-600, text-gray-900) instead of hex colors' },
      ];

      invalidTailwindClasses.forEach(({ pattern, message }) => {
        const matches = [...doc.matchAll(pattern)];
        matches.forEach(match => {
          if (match.index !== undefined) {
            diagnostics.push({
              from: match.index,
              to: match.index + match[0].length,
              severity: 'info',
              message,
            });
          }
        });
      });

      // Check for responsive breakpoint order (should be sm: md: lg: xl: 2xl:)
      const breakpointPattern = /class=["'][^"']*\b(2xl|xl|lg|md|sm):[^"']*\b(sm|md|lg|xl|2xl):[^"']*["']/g;
      const breakpointMatches = [...doc.matchAll(breakpointPattern)];
      breakpointMatches.forEach(match => {
        if (match.index !== undefined) {
          const breakpoints = match[0].match(/\b(sm|md|lg|xl|2xl):/g) || [];
          const order = ['sm:', 'md:', 'lg:', 'xl:', '2xl:'];
          const indices = breakpoints.map(bp => order.indexOf(bp));
          const isSorted = indices.every((val, i, arr) => i === 0 || arr[i - 1] <= val);
          
          if (!isSorted) {
            diagnostics.push({
              from: match.index,
              to: match.index + match[0].length,
              severity: 'info',
              message: 'Tailwind breakpoints should be ordered: sm: md: lg: xl: 2xl:',
            });
          }
        }
      });
    }

    // 6. Vanilla JavaScript - Common mistakes
    if (language.toLowerCase() === 'javascript') {
      // Check for jQuery usage (should use vanilla JS)
      const jQueryUsage = [...doc.matchAll(/\$\(['"][^'"]+['"]\)|jQuery\(/g)];
      jQueryUsage.forEach(match => {
        if (match.index !== undefined) {
          diagnostics.push({
            from: match.index,
            to: match.index + match[0].length,
            severity: 'info',
            message: 'Use vanilla JavaScript (querySelector, querySelectorAll) instead of jQuery',
          });
        }
      });

      // Check for var usage (should use let/const)
      const varUsage = [...doc.matchAll(/\bvar\s+\w+/g)];
      varUsage.forEach(match => {
        if (match.index !== undefined) {
          diagnostics.push({
            from: match.index,
            to: match.index + 3,
            severity: 'warning',
            message: 'Use "let" or "const" instead of "var" in modern JavaScript',
          });
        }
      });

      // Check for missing event listener cleanup
      const addListenerPattern = /addEventListener\([^)]+\)/g;
      const removeListenerPattern = /removeEventListener\([^)]+\)/g;
      const addCount = (doc.match(addListenerPattern) || []).length;
      const removeCount = (doc.match(removeListenerPattern) || []).length;
      
      if (addCount > 0 && removeCount === 0 && addCount > 2) {
        diagnostics.push({
          from: 0,
          to: 1,
          severity: 'info',
          message: `${addCount} event listeners added but no removeEventListener found - consider cleanup for memory leaks`,
        });
      }

      // Check for inline event handlers in HTML context
      const inlineEventHandlers = [...doc.matchAll(/on(click|load|change|submit|keydown|keyup|mouseenter|mouseleave)=["'][^"']*["']/gi)];
      inlineEventHandlers.forEach(match => {
        if (match.index !== undefined) {
          diagnostics.push({
            from: match.index,
            to: match.index + match[0].length,
            severity: 'info',
            message: 'Use addEventListener instead of inline event handlers for better separation of concerns',
          });
        }
      });
    }

    return diagnostics;
  }, [language]);

  // CodeMirror extensions configuration
  const extensions = [
    getLanguageExtension(),
    autocompletion({
      activateOnTyping: true,
      maxRenderedOptions: 10,
      override: [aiTemplateCompletions],
    }),
    linter(aiTemplateLinter),
    EditorView.lineWrapping, // Word wrap support
  ];

  // Handle code changes
  const handleChange = useCallback((val: string, viewUpdate: ViewUpdate) => {
    if (onChange) {
      onChange(val, viewUpdate);
    }
  }, [onChange]);

  // Format code using prettier or js-beautify
  const formatCode = useCallback(async (code: string, lang: string): Promise<string> => {
    try {
      const langLower = lang.toLowerCase();
      
      if (langLower === 'html') {
        // Use prettier for HTML
        return await prettier.format(code, {
          parser: 'html',
          plugins: [parserHTML],
          printWidth: 120,
          tabWidth: 2,
          useTabs: false,
          htmlWhitespaceSensitivity: 'css',
        });
      } else if (langLower === 'css') {
        // Use prettier for CSS
        return await prettier.format(code, {
          parser: 'css',
          plugins: [parserCSS],
          printWidth: 120,
          tabWidth: 2,
          useTabs: false,
        });
      } else if (langLower === 'javascript' || langLower === 'jsx' || langLower === 'typescript' || langLower === 'tsx') {
        // Use prettier for JS/TS
        return await prettier.format(code, {
          parser: 'babel',
          plugins: [parserJS, parserESTree],
          printWidth: 120,
          tabWidth: 2,
          useTabs: false,
          semi: true,
          singleQuote: true,
          trailingComma: 'es5',
        });
      }
      
      // Fallback to original code if no formatter matches
      return code;
    } catch (error) {
      console.warn('Code formatting failed:', error);
      return code; // Return original code if formatting fails
    }
  }, []);

  // Auto-format when value changes from external source (AI generation)
  const [lastFormattedValue, setLastFormattedValue] = useState<string>('');
  React.useEffect(() => {
    if (value && value !== lastFormattedValue && value.length > 100) {
      // Only auto-format substantial code changes (likely AI-generated)
      formatCode(value, language).then(formatted => {
        if (formatted !== value && onChange) {
          setLastFormattedValue(formatted);
          // Note: Disabled auto-triggering onChange to prevent scroll interference
          // The formatted code is available but not automatically applied
          console.log('[CodeMirror] Code formatted but not auto-applied to preserve scroll position');
        }
      });
    }
  }, [value, language, formatCode, lastFormattedValue]);

  // CodeMirror editor configuration (Monaco-compatible options)
  const editorOptions = {
    indentWithTab: true,
    tabSize: options.tabSize || 2,
    lineNumbers: options.lineNumbers !== 'off',
    readOnly: options.readOnly || false,
  };

  // Mock Monaco API object for compatibility - memoized to prevent dependency issues
  const mockMonacoAPI: MockMonacoAPI = useMemo(() => ({
    editor: {
      getValue: () => editorRef.current?.view?.state.doc.toString() || '',
      setValue: (newValue: string) => {
        // CodeMirror doesn't have direct setValue - would need to trigger onChange
        console.log('setValue called with:', newValue);
      },
      getSelection: () => {
        const view = editorRef.current?.view;
        if (!view) return null;
        const selection = view.state.selection.main;
        return {
          startLineNumber: view.state.doc.lineAt(selection.from).number,
          startColumn: selection.from - view.state.doc.lineAt(selection.from).from,
          endLineNumber: view.state.doc.lineAt(selection.to).number,
          endColumn: selection.to - view.state.doc.lineAt(selection.to).from,
        };
      },
      getModel: () => ({
        getValueInRange: () => {
          return editorRef.current?.view?.state.doc.toString() || '';
        },
      }),
      addAction: (action: { id: string; label: string; keybindings?: number[]; run: (ed: MockMonacoEditor) => void }) => {
        console.log('Editor action registered:', action.label);
        // CodeMirror uses different keybinding system - simplified for now
      },
      executeEdits: (source: string, edits: unknown[]) => {
        console.log('Execute edits:', edits);
        // Would need to implement edit operations
      },
    },
    languages: {
      html: {
        htmlDefaults: {
          setOptions: (opts: unknown) => { /* Mock for Monaco compatibility - no-op */ },
        },
      },
      css: {
        cssDefaults: {
          setOptions: (opts: unknown) => { /* Mock for Monaco compatibility - no-op */ },
        },
      },
      typescript: {
        javascriptDefaults: {
          setCompilerOptions: (opts: unknown) => { /* Mock for Monaco compatibility - no-op */ },
          setDiagnosticsOptions: (opts: unknown) => { /* Mock for Monaco compatibility - no-op */ },
          addExtraLib: (content: string, filePath: string) => { /* Mock for Monaco compatibility - no-op */ },
        },
        typescriptDefaults: {
          setDiagnosticsOptions: (opts: unknown) => { /* Mock for Monaco compatibility - no-op */ },
        },
        ScriptTarget: { ESNext: 99 },
        ModuleResolutionKind: { Classic: 1, NodeJs: 2 },
        ModuleKind: { None: 0, ESNext: 99 },
      },
      registerCompletionItemProvider: (langs: string[], provider: unknown) => {
        /* Mock for Monaco compatibility - no-op */
      },
      registerInlineCompletionsProvider: (lang: string, provider: unknown) => {
        /* Mock for Monaco compatibility - no-op */
      },
      CompletionItemKind: {
        Property: 1,
        Color: 2,
      },
    },
    KeyMod: {
      CtrlCmd: 1,
      Shift: 2,
    },
    KeyCode: {
      KeyA: 65,
    },
  }), []);

  // Call beforeMount if provided (for Monaco config compatibility)
  React.useEffect(() => {
    if (beforeMount) {
      beforeMount(mockMonacoAPI);
    }
  }, [beforeMount, mockMonacoAPI]);

  // Call onMount if provided (for Monaco compatibility)
  React.useEffect(() => {
    if (onMount && editorRef.current) {
      onMount(mockMonacoAPI.editor, mockMonacoAPI);
    }
  }, [onMount, mockMonacoAPI]);

  return (
    <div style={{ width, height, position: 'relative', overflow: 'auto' }}>
      <CodeMirror
        ref={editorRef}
        value={value}
        defaultValue={defaultValue}
        height={height}
        width={width}
        theme={theme === 'vs-dark' ? oneDark : 'light'}
        extensions={extensions}
        onChange={handleChange}
        basicSetup={{
          lineNumbers: editorOptions.lineNumbers,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          history: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
        readOnly={editorOptions.readOnly}
      />
      {isAIProcessing && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            padding: '8px 12px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        >
          AI Processing...
        </div>
      )}
    </div>
  );
};

export default CodeMirrorEditor;

// Export Monaco types for compatibility
export type Monaco = MockMonacoAPI;
export type OnMount = (editor: MockMonacoEditor, monaco: Monaco) => void;
