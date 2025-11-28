import React, { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeMirrorEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: 'javascript' | 'html' | 'css' | 'typescript';
  theme?: 'light' | 'dark';
  height?: string;
  readOnly?: boolean;
  className?: string;
}

const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({
  value,
  onChange,
  language = 'javascript',
  theme = 'dark',
  height = '100%',
  readOnly = false,
  className = '',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const languageConf = useRef(new Compartment());

  useEffect(() => {
    if (!editorRef.current) return;

    // Get language extension
    const getLanguageExtension = () => {
      switch (language) {
        case 'html':
          return html();
        case 'css':
          return css();
        case 'javascript':
        case 'typescript':
        default:
          return javascript({ jsx: true, typescript: language === 'typescript' });
      }
    };

    // Create editor state
    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        languageConf.current.of(getLanguageExtension()),
        theme === 'dark' ? oneDark : [],
        EditorView.updateListener.of((update) => {
          if (update.docChanged && onChange) {
            onChange(update.state.doc.toString());
          }
        }),
        EditorView.editable.of(!readOnly),
        EditorState.readOnly.of(readOnly),
        EditorView.theme({
          '&': { height: height },
          '.cm-scroller': { overflow: 'auto' },
        }),
      ],
    });

    // Create editor view
    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []); // Only create once

  // Update value when it changes externally
  useEffect(() => {
    if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
      const transaction = viewRef.current.state.update({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value,
        },
      });
      viewRef.current.dispatch(transaction);
    }
  }, [value]);

  // Update language when it changes
  useEffect(() => {
    if (viewRef.current) {
      const getLanguageExtension = () => {
        switch (language) {
          case 'html':
            return html();
          case 'css':
            return css();
          case 'javascript':
          case 'typescript':
          default:
            return javascript({ jsx: true, typescript: language === 'typescript' });
        }
      };

      viewRef.current.dispatch({
        effects: languageConf.current.reconfigure(getLanguageExtension()),
      });
    }
  }, [language]);

  return <div ref={editorRef} className={className} />;
};

export default CodeMirrorEditor;
