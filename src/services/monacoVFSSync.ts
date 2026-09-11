/**
 * Monaco VFS Sync — Multi-model synchronization between VFS and Monaco
 * 
 * Creates/updates Monaco editor models for all VFS files so that:
 * - Cross-file IntelliSense works (imports resolve)
 * - TypeScript diagnostics span the full project
 * - Go-to-definition navigates across files
 * - Rename symbol propagates across files
 * 
 * Usage:
 *   const sync = new MonacoVFSSync();
 *   sync.syncAll(files, monacoInstance);
 *   sync.updateFile('/src/App.tsx', newContent, monacoInstance);
 */

// ============================================================================
// Types
// ============================================================================

/** Minimal Monaco API surface needed */
export interface MonacoAPI {
  Uri: {
    parse: (uri: string) => MonacoUri;
  };
  editor: {
    getModel: (uri: MonacoUri) => MonacoModel | null;
    createModel: (value: string, language: string, uri: MonacoUri) => MonacoModel;
    getModels: () => MonacoModel[];
    setModelLanguage: (model: MonacoModel, language: string) => void;
  };
  languages: {
    typescript: {
      typescriptDefaults: {
        addExtraLib: (content: string, filePath: string) => { dispose: () => void };
        setCompilerOptions: (options: unknown) => void;
        setDiagnosticsOptions: (options: unknown) => void;
      };
      javascriptDefaults: {
        addExtraLib: (content: string, filePath: string) => { dispose: () => void };
      };
    };
  };
}

export interface MonacoUri {
  toString: () => string;
}

export interface MonacoModel {
  getValue: () => string;
  setValue: (value: string) => void;
  getLanguageId: () => string;
  uri: MonacoUri;
  dispose: () => void;
  onDidChangeContent: (listener: (e: unknown) => void) => { dispose: () => void };
}

export interface SyncStats {
  created: number;
  updated: number;
  removed: number;
  total: number;
  timeMs: number;
}

// ============================================================================
// Language Detection
// ============================================================================

const EXT_TO_LANGUAGE: Record<string, string> = {
  'tsx': 'typescript',
  'ts': 'typescript',
  'jsx': 'javascript',
  'js': 'javascript',
  'html': 'html',
  'htm': 'html',
  'css': 'css',
  'scss': 'scss',
  'json': 'json',
  'md': 'markdown',
  'svg': 'xml',
  'xml': 'xml',
};

function getLanguageForPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return EXT_TO_LANGUAGE[ext] || 'plaintext';
}

function pathToUri(path: string): string {
  // Monaco uses file:// URIs
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `file://${normalized}`;
}

// ============================================================================
// React/TS Type Declarations for IntelliSense
// ============================================================================

const REACT_TYPES = `
declare module 'react' {
  export interface FC<P = {}> { (props: P): JSX.Element | null; displayName?: string; }
  export function useState<S>(init: S | (() => S)): [S, (v: S | ((p: S) => S)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useRef<T>(init: T): { current: T };
  export function useCallback<T extends (...args: any[]) => any>(cb: T, deps: readonly any[]): T;
  export function useMemo<T>(factory: () => T, deps: readonly any[]): T;
  export function useContext<T>(ctx: React.Context<T>): T;
  export function useReducer<R extends React.Reducer<any, any>>(reducer: R, initialState: React.ReducerState<R>): [React.ReducerState<R>, React.Dispatch<React.ReducerAction<R>>];
  export function createContext<T>(defaultValue: T): React.Context<T>;
  export function forwardRef<T, P = {}>(render: (props: P, ref: React.Ref<T>) => JSX.Element | null): React.ForwardRefExoticComponent<P & React.RefAttributes<T>>;
  export function memo<P>(component: React.FC<P>): React.FC<P>;
  export function lazy<T extends React.ComponentType<any>>(factory: () => Promise<{ default: T }>): React.LazyExoticComponent<T>;
  export function Fragment(props: { children?: React.ReactNode }): JSX.Element;
  export type ReactNode = string | number | boolean | null | undefined | JSX.Element | ReactNode[];
  export type CSSProperties = { [key: string]: string | number | undefined };
  export type ChangeEvent<T = Element> = { target: T & { value: string; checked: boolean } };
  export type FormEvent<T = Element> = { preventDefault(): void; target: T };
  export type MouseEvent<T = Element> = { preventDefault(): void; stopPropagation(): void; target: T; clientX: number; clientY: number };
  export type KeyboardEvent<T = Element> = { key: string; code: string; preventDefault(): void };
  export interface Context<T> { Provider: React.FC<{ value: T; children?: ReactNode }>; Consumer: React.FC }
  export interface Ref<T> { current: T | null }
  export type Reducer<S, A> = (state: S, action: A) => S;
  export type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;
  export type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never;
  export type Dispatch<A> = (action: A) => void;
  export interface RefAttributes<T> { ref?: Ref<T> }
  export interface ForwardRefExoticComponent<P> extends React.FC<P> {}
  export interface LazyExoticComponent<T> extends React.FC {}
  export type ComponentType<P = {}> = React.FC<P>;
  export namespace JSX { interface Element {} interface IntrinsicElements { [e: string]: any; } }
  export default React;
}

declare module 'react-dom/client' {
  export function createRoot(container: Element): { render(element: any): void; unmount(): void; };
}

declare module 'react-router-dom' {
  export function BrowserRouter(props: { children?: React.ReactNode }): JSX.Element;
  export function Routes(props: { children?: React.ReactNode }): JSX.Element;
  export function Route(props: { path: string; element: React.ReactNode }): JSX.Element;
  export function Link(props: { to: string; children?: React.ReactNode; className?: string }): JSX.Element;
  export function NavLink(props: { to: string; children?: React.ReactNode; className?: string | ((props: { isActive: boolean }) => string) }): JSX.Element;
  export function useNavigate(): (to: string) => void;
  export function useParams<T extends Record<string, string>>(): T;
  export function useLocation(): { pathname: string; search: string; hash: string };
  export function useSearchParams(): [URLSearchParams, (params: URLSearchParams) => void];
  export function Outlet(): JSX.Element;
  export function Navigate(props: { to: string; replace?: boolean }): JSX.Element;
}

declare module 'framer-motion' {
  export const motion: { [key: string]: React.FC<any> };
  export function AnimatePresence(props: { children?: React.ReactNode; mode?: string }): JSX.Element;
  export function useAnimation(): any;
  export function useInView(ref: React.RefObject<Element>, options?: any): boolean;
}

declare module 'lucide-react' {
  const icons: Record<string, React.FC<{ className?: string; size?: number }>>;
  export = icons;
}

declare module 'sonner' {
  export function toast(message: string): void;
  export namespace toast {
    function success(message: string): void;
    function error(message: string): void;
    function info(message: string): void;
  }
  export function Toaster(props?: any): JSX.Element;
}

declare module 'clsx' {
  export type ClassValue = string | number | boolean | undefined | null | ClassValue[] | Record<string, boolean>;
  export default function clsx(...inputs: ClassValue[]): string;
}

declare module 'tailwind-merge' {
  export function twMerge(...inputs: string[]): string;
}
`;

// ============================================================================
// Monaco VFS Sync Class
// ============================================================================

export class MonacoVFSSync {
  private trackedModels = new Map<string, MonacoModel>();
  private disposables: { dispose: () => void }[] = [];
  private changeCallbacks: ((path: string, content: string) => void)[] = [];

  /** Register callback for when a model is changed in Monaco */
  onModelChange(callback: (path: string, content: string) => void): () => void {
    this.changeCallbacks.push(callback);
    return () => {
      const idx = this.changeCallbacks.indexOf(callback);
      if (idx !== -1) this.changeCallbacks.splice(idx, 1);
    };
  }

  /** Sync all VFS files to Monaco models */
  syncAll(files: Record<string, string>, monaco: MonacoAPI): SyncStats {
    const start = performance.now();
    let created = 0, updated = 0, removed = 0;

    const currentPaths = new Set(Object.keys(files));

    // Add type declarations first
    this.ensureTypeLibs(monaco);

    // Create or update models for each file
    for (const [path, content] of Object.entries(files)) {
      const uri = monaco.Uri.parse(pathToUri(path));
      const language = getLanguageForPath(path);
      let model = monaco.editor.getModel(uri);

      if (!model) {
        model = monaco.editor.createModel(content, language, uri);
        this.setupModelListener(path, model);
        this.trackedModels.set(path, model);
        created++;
      } else if (model.getValue() !== content) {
        model.setValue(content);
        updated++;
      }

      // Ensure correct language
      if (model.getLanguageId() !== language) {
        monaco.editor.setModelLanguage(model, language);
      }
    }

    // Remove models for deleted files
    for (const [path, model] of this.trackedModels) {
      if (!currentPaths.has(path)) {
        model.dispose();
        this.trackedModels.delete(path);
        removed++;
      }
    }

    const timeMs = performance.now() - start;
    console.log(`[MonacoVFSSync] Synced: +${created} ~${updated} -${removed} (${timeMs.toFixed(1)}ms)`);

    return {
      created,
      updated,
      removed,
      total: this.trackedModels.size,
      timeMs,
    };
  }

  /** Update a single file's model */
  updateFile(path: string, content: string, monaco: MonacoAPI): void {
    const uri = monaco.Uri.parse(pathToUri(path));
    let model = monaco.editor.getModel(uri);

    if (!model) {
      const language = getLanguageForPath(path);
      model = monaco.editor.createModel(content, language, uri);
      this.setupModelListener(path, model);
      this.trackedModels.set(path, model);
    } else if (model.getValue() !== content) {
      model.setValue(content);
    }
  }

  /** Remove a file's model */
  removeFile(path: string): void {
    const model = this.trackedModels.get(path);
    if (model) {
      model.dispose();
      this.trackedModels.delete(path);
    }
  }

  /** Get all tracked model paths */
  getTrackedPaths(): string[] {
    return [...this.trackedModels.keys()];
  }

  /** Dispose all models and listeners */
  dispose(): void {
    for (const model of this.trackedModels.values()) {
      model.dispose();
    }
    this.trackedModels.clear();
    for (const d of this.disposables) {
      d.dispose();
    }
    this.disposables = [];
    this.changeCallbacks = [];
  }

  // --- Private ---

  private setupModelListener(path: string, model: MonacoModel): void {
    const disposable = model.onDidChangeContent(() => {
      const newContent = model.getValue();
      for (const cb of this.changeCallbacks) {
        try {
          cb(path, newContent);
        } catch (err) {
          console.error('[MonacoVFSSync] Change callback error:', err);
        }
      }
    });
    this.disposables.push(disposable);
  }

  private ensureTypeLibs(monaco: MonacoAPI): void {
    // Only add once
    if ((this as any)._typesAdded) return;
    (this as any)._typesAdded = true;

    const d1 = monaco.languages.typescript.typescriptDefaults.addExtraLib(REACT_TYPES, 'ts:react-types.d.ts');
    const d2 = monaco.languages.typescript.javascriptDefaults.addExtraLib(REACT_TYPES, 'ts:react-types.d.ts');
    this.disposables.push(d1, d2);

    // Configure TypeScript compiler
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: 99, // ESNext
      allowNonTsExtensions: true,
      moduleResolution: 2, // NodeJs
      module: 99, // ESNext
      noEmit: true,
      esModuleInterop: true,
      jsx: 4, // ReactJSX
      reactNamespace: 'React',
      allowJs: true,
      strict: true,
      baseUrl: '.',
      paths: { '@/*': ['./src/*'] },
    });

    // Enable full diagnostics
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: false,
    });
  }
}

// ============================================================================
// Singleton
// ============================================================================

export const monacoVFSSync = new MonacoVFSSync();
