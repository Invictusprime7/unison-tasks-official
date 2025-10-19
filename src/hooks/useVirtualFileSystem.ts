import { useState, useCallback } from 'react';

export interface VirtualFile {
  id: string;
  name: string;
  content: string;
  type: 'file';
  language: string;
  parentId: string | null;
}

export interface VirtualFolder {
  id: string;
  name: string;
  type: 'folder';
  parentId: string | null;
  isOpen?: boolean;
}

export type VirtualNode = VirtualFile | VirtualFolder;

export function useVirtualFileSystem() {
  const [nodes, setNodes] = useState<VirtualNode[]>([
    { id: 'root', name: 'src', type: 'folder', parentId: null, isOpen: true },
    { id: '1', name: 'App.tsx', content: '// Start coding...', type: 'file', language: 'typescript', parentId: 'root' },
  ]);
  const [activeFileId, setActiveFileId] = useState<string>('1');

  const createFile = useCallback((name: string, parentId: string | null = 'root') => {
    const id = Date.now().toString();
    const language = name.endsWith('.tsx') || name.endsWith('.ts') ? 'typescript' :
                     name.endsWith('.jsx') || name.endsWith('.js') ? 'javascript' :
                     name.endsWith('.css') ? 'css' :
                     name.endsWith('.html') ? 'html' : 'plaintext';
    
    const newFile: VirtualFile = {
      id,
      name,
      content: '',
      type: 'file',
      language,
      parentId,
    };
    setNodes(prev => [...prev, newFile]);
    setActiveFileId(id);
    return id;
  }, []);

  const createFolder = useCallback((name: string, parentId: string | null = 'root') => {
    const id = Date.now().toString();
    const newFolder: VirtualFolder = {
      id,
      name,
      type: 'folder',
      parentId,
      isOpen: true,
    };
    setNodes(prev => [...prev, newFolder]);
    return id;
  }, []);

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
      
      if (activeFileId && toDelete.has(activeFileId)) {
        const firstFile = prev.find(n => n.type === 'file' && !toDelete.has(n.id)) as VirtualFile;
        setActiveFileId(firstFile?.id || '');
      }
      
      return prev.filter(n => !toDelete.has(n.id));
    });
  }, [activeFileId]);

  const renameNode = useCallback((id: string, newName: string) => {
    setNodes(prev => prev.map(node => 
      node.id === id ? { ...node, name: newName } : node
    ));
  }, []);

  const duplicateNode = useCallback((id: string) => {
    const node = nodes.find(n => n.id === id);
    if (!node) return;

    const newId = Date.now().toString();
    const nameMatch = node.name.match(/^(.+?)( \((\d+)\))?(\.[^.]+)?$/);
    const baseName = nameMatch?.[1] || node.name;
    const extension = nameMatch?.[4] || '';
    const newName = `${baseName} (copy)${extension}`;

    if (node.type === 'file') {
      const newFile: VirtualFile = {
        ...node,
        id: newId,
        name: newName,
      };
      setNodes(prev => [...prev, newFile]);
      setActiveFileId(newId);
    } else {
      const newFolder: VirtualFolder = {
        ...node,
        id: newId,
        name: newName,
      };
      setNodes(prev => [...prev, newFolder]);
    }
  }, [nodes]);

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

  const getActiveFile = useCallback(() => {
    return nodes.find(n => n.id === activeFileId && n.type === 'file') as VirtualFile | undefined;
  }, [nodes, activeFileId]);

  return {
    nodes,
    activeFileId,
    setActiveFileId,
    createFile,
    createFolder,
    deleteNode,
    renameNode,
    duplicateNode,
    updateFileContent,
    toggleFolder,
    getActiveFile,
  };
}
