import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ToolMode =
  | 'select'
  | 'hand'
  | 'zoom'
  | 'rectangle'
  | 'ellipse'
  | 'text'
  | 'image'
  | 'pen';

interface ToolModeContextValue {
  tool: ToolMode;
  setTool: (t: ToolMode) => void;
}

const ToolModeContext = createContext<ToolModeContextValue | undefined>(undefined);

export const useToolMode = () => {
  const ctx = useContext(ToolModeContext);
  if (!ctx) throw new Error('useToolMode must be used within ToolModeProvider');
  return ctx;
};

export const ToolModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tool, setTool] = useState<ToolMode>('select');

  const setToolSafe = useCallback((t: ToolMode) => setTool(t), []);

  // Global shortcuts for tool switching; history shortcuts are handled in DesignStudio for now
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement)?.isContentEditable) {
        return; // ignore when typing
      }
      const k = e.key.toLowerCase();
      if (k === 'v') setTool('select');
      if (k === 'h') setTool('hand');
      if (k === 'z') setTool('zoom');
      if (k === 'r') setTool('rectangle');
      if (k === 'o') setTool('ellipse');
      if (k === 't') setTool('text');
      if (k === 'i') setTool('image');
      if (k === 'p') setTool('pen');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const value = useMemo(() => ({ tool, setTool: setToolSafe }), [tool, setToolSafe]);
  return <ToolModeContext.Provider value={value}>{children}</ToolModeContext.Provider>;
};

