import { useState, useCallback, useMemo } from 'react';

export interface VirtualFile {
  id: string;
  name: string;
  content: string;
  type: 'file';
  language: string;
  parentId: string | null;
  path?: string;
}

export interface VirtualFolder {
  id: string;
  name: string;
  type: 'folder';
  parentId: string | null;
  isOpen?: boolean;
  path?: string;
}

export type VirtualNode = VirtualFile | VirtualFolder;

const DEFAULT_PROJECT_STRUCTURE: VirtualNode[] = [
  { id: 'src', name: 'src', type: 'folder', parentId: null, isOpen: true, path: '/src' },
  { id: 'src-components', name: 'components', type: 'folder', parentId: 'src', isOpen: false, path: '/src/components' },
  { id: 'src-hooks', name: 'hooks', type: 'folder', parentId: 'src', isOpen: false, path: '/src/hooks' },
  { id: 'src-pages', name: 'pages', type: 'folder', parentId: 'src', isOpen: false, path: '/src/pages' },
  { id: 'src-utils', name: 'utils', type: 'folder', parentId: 'src', isOpen: false, path: '/src/utils' },
  { id: 'src-styles', name: 'styles', type: 'folder', parentId: 'src', isOpen: false, path: '/src/styles' },
  { id: 'public', name: 'public', type: 'folder', parentId: null, isOpen: false, path: '/public' },
  { id: 'app-tsx', name: 'App.tsx', content: `import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <h1 className="text-2xl font-bold p-4">Hello World</h1>
    </div>
  );
}

export default App;`, type: 'file', language: 'typescript', parentId: 'src', path: '/src/App.tsx' },
  { id: 'main-tsx', name: 'main.tsx', content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`, type: 'file', language: 'typescript', parentId: 'src', path: '/src/main.tsx' },
  { id: 'index-css', name: 'index.css', content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}`, type: 'file', language: 'css', parentId: 'src-styles', path: '/src/styles/index.css' },
  { id: 'index-html', name: 'index.html', content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`, type: 'file', language: 'html', parentId: 'public', path: '/public/index.html' },
];

export function getLanguageFromFileName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'tsx':
    case 'ts':
      return 'typescript';
    case 'jsx':
    case 'js':
      return 'javascript';
    case 'css':
    case 'scss':
    case 'sass':
      return 'css';
    case 'html':
    case 'htm':
      return 'html';
    case 'json':
      return 'json';
    case 'md':
    case 'mdx':
      return 'markdown';
    case 'yaml':
    case 'yml':
      return 'yaml';
    default:
      return 'plaintext';
  }
}

export function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'tsx':
    case 'jsx':
      return 'react';
    case 'ts':
      return 'typescript';
    case 'js':
      return 'javascript';
    case 'css':
    case 'scss':
    case 'sass':
      return 'css';
    case 'html':
    case 'htm':
      return 'html';
    case 'json':
      return 'json';
    case 'md':
    case 'mdx':
      return 'markdown';
    case 'svg':
      return 'svg';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return 'image';
    default:
      return 'file';
  }
}

export function useVirtualFileSystem() {
  const [nodes, setNodes] = useState<VirtualNode[]>(DEFAULT_PROJECT_STRUCTURE);
  const [activeFileId, setActiveFileId] = useState<string>('app-tsx');
  const [openTabs, setOpenTabs] = useState<string[]>(['app-tsx']);

  const getNodePath = useCallback((nodeId: string, currentNodes: VirtualNode[]): string => {
    const node = currentNodes.find(n => n.id === nodeId);
    if (!node) return '';
    
    if (!node.parentId) return `/${node.name}`;
    
    const parentPath = getNodePath(node.parentId, currentNodes);
    return `${parentPath}/${node.name}`;
  }, []);

  const createFile = useCallback((name: string, parentId: string | null = 'src') => {
    const id = `file-${Date.now()}`;
    const language = getLanguageFromFileName(name);
    
    setNodes(prev => {
      const path = parentId ? `${getNodePath(parentId, prev)}/${name}` : `/${name}`;
      const newFile: VirtualFile = {
        id,
        name,
        content: '',
        type: 'file',
        language,
        parentId,
        path,
      };
      return [...prev, newFile];
    });
    
    setActiveFileId(id);
    setOpenTabs(prev => prev.includes(id) ? prev : [...prev, id]);
    return id;
  }, [getNodePath]);

  const createFolder = useCallback((name: string, parentId: string | null = 'src') => {
    const id = `folder-${Date.now()}`;
    
    setNodes(prev => {
      const path = parentId ? `${getNodePath(parentId, prev)}/${name}` : `/${name}`;
      const newFolder: VirtualFolder = {
        id,
        name,
        type: 'folder',
        parentId,
        isOpen: true,
        path,
      };
      return [...prev, newFolder];
    });
    return id;
  }, [getNodePath]);

  const deleteNode = useCallback((id: string) => {
    setNodes(prev => {
      const toDelete = new Set<string>([id]);
      const findChildren = (parentId: string) => {
        prev.forEach(node => {
          if (node.parentId === parentId) {
            toDelete.add(node.id);
            if (node.type === 'folder') {
              findChildren(node.id);
            }
          }
        });
      };
      findChildren(id);
      
      // Update open tabs
      setOpenTabs(tabs => tabs.filter(tabId => !toDelete.has(tabId)));
      
      // Update active file
      if (toDelete.has(activeFileId)) {
        const remainingFiles = prev.filter(n => n.type === 'file' && !toDelete.has(n.id));
        setActiveFileId(remainingFiles[0]?.id || '');
      }
      
      return prev.filter(n => !toDelete.has(n.id));
    });
  }, [activeFileId]);

  const renameNode = useCallback((id: string, newName: string) => {
    setNodes(prev => prev.map(node => {
      if (node.id === id) {
        const newPath = node.parentId 
          ? `${getNodePath(node.parentId, prev)}/${newName}`
          : `/${newName}`;
        
        if (node.type === 'file') {
          return { 
            ...node, 
            name: newName, 
            path: newPath,
            language: getLanguageFromFileName(newName)
          };
        }
        return { ...node, name: newName, path: newPath };
      }
      return node;
    }));
  }, [getNodePath]);

  const duplicateNode = useCallback((id: string) => {
    const node = nodes.find(n => n.id === id);
    if (!node) return;

    const newId = `${node.type}-${Date.now()}`;
    const nameMatch = node.name.match(/^(.+?)( \((\d+)\))?(\.[^.]+)?$/);
    const baseName = nameMatch?.[1] || node.name;
    const extension = nameMatch?.[4] || '';
    const newName = `${baseName} (copy)${extension}`;

    if (node.type === 'file') {
      const newFile: VirtualFile = {
        ...node,
        id: newId,
        name: newName,
        path: node.parentId ? `${getNodePath(node.parentId, nodes)}/${newName}` : `/${newName}`,
      };
      setNodes(prev => [...prev, newFile]);
      setActiveFileId(newId);
      setOpenTabs(prev => [...prev, newId]);
    } else {
      const newFolder: VirtualFolder = {
        ...node,
        id: newId,
        name: newName,
        path: node.parentId ? `${getNodePath(node.parentId, nodes)}/${newName}` : `/${newName}`,
      };
      setNodes(prev => [...prev, newFolder]);
    }
  }, [nodes, getNodePath]);

  const moveNode = useCallback((nodeId: string, newParentId: string | null) => {
    setNodes(prev => prev.map(node => {
      if (node.id === nodeId) {
        const newPath = newParentId 
          ? `${getNodePath(newParentId, prev)}/${node.name}`
          : `/${node.name}`;
        return { ...node, parentId: newParentId, path: newPath };
      }
      return node;
    }));
  }, [getNodePath]);

  const updateFileContent = useCallback((id: string, content: string) => {
    setNodes(prev => prev.map(node =>
      node.id === id && node.type === 'file' ? { ...node, content } : node
    ));
  }, []);

  const toggleFolder = useCallback((id: string) => {
    setNodes(prev => prev.map(node =>
      node.id === id && node.type === 'folder' 
        ? { ...node, isOpen: !node.isOpen } 
        : node
    ));
  }, []);

  const expandAll = useCallback(() => {
    setNodes(prev => prev.map(node =>
      node.type === 'folder' ? { ...node, isOpen: true } : node
    ));
  }, []);

  const collapseAll = useCallback(() => {
    setNodes(prev => prev.map(node =>
      node.type === 'folder' ? { ...node, isOpen: false } : node
    ));
  }, []);

  const getActiveFile = useCallback(() => {
    return nodes.find(n => n.id === activeFileId && n.type === 'file') as VirtualFile | undefined;
  }, [nodes, activeFileId]);

  const openFile = useCallback((id: string) => {
    const file = nodes.find(n => n.id === id && n.type === 'file');
    if (file) {
      setActiveFileId(id);
      setOpenTabs(prev => prev.includes(id) ? prev : [...prev, id]);
    }
  }, [nodes]);

  const closeTab = useCallback((id: string) => {
    setOpenTabs(prev => {
      const newTabs = prev.filter(tabId => tabId !== id);
      if (activeFileId === id && newTabs.length > 0) {
        setActiveFileId(newTabs[newTabs.length - 1]);
      } else if (newTabs.length === 0) {
        setActiveFileId('');
      }
      return newTabs;
    });
  }, [activeFileId]);

  const getOpenFiles = useCallback(() => {
    return openTabs
      .map(id => nodes.find(n => n.id === id && n.type === 'file') as VirtualFile)
      .filter(Boolean);
  }, [openTabs, nodes]);

  // Sort nodes: folders first, then files, alphabetically
  const sortedNodes = useMemo(() => {
    return [...nodes].sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [nodes]);

  return {
    nodes: sortedNodes,
    activeFileId,
    openTabs,
    setActiveFileId,
    createFile,
    createFolder,
    deleteNode,
    renameNode,
    duplicateNode,
    moveNode,
    updateFileContent,
    toggleFolder,
    expandAll,
    collapseAll,
    getActiveFile,
    openFile,
    closeTab,
    getOpenFiles,
    getNodePath,
  };
}
