import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface VirtualFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isFolder: boolean;
  children?: VirtualFile[];
  parentId?: string;
}

export const useVirtualFileSystem = () => {
  const [files, setFiles] = useState<VirtualFile[]>([
    {
      id: '1',
      name: 'src',
      path: '/src',
      content: '',
      language: '',
      isFolder: true,
      children: [
        {
          id: '2',
          name: 'App.tsx',
          path: '/src/App.tsx',
          content: `import React from 'react';\n\nfunction App() {\n  return (\n    <div className="min-h-screen flex items-center justify-center">\n      <h1 className="text-4xl font-bold">Hello World</h1>\n    </div>\n  );\n}\n\nexport default App;`,
          language: 'typescript',
          isFolder: false,
          parentId: '1',
        },
        {
          id: '3',
          name: 'components',
          path: '/src/components',
          content: '',
          language: '',
          isFolder: true,
          parentId: '1',
          children: [],
        },
      ],
    },
  ]);

  const [activeFileId, setActiveFileId] = useState<string>('2');
  const [openFiles, setOpenFiles] = useState<string[]>(['2']);

  const findFileById = useCallback((fileId: string, fileList: VirtualFile[] = files): VirtualFile | null => {
    for (const file of fileList) {
      if (file.id === fileId) return file;
      if (file.children) {
        const found = findFileById(fileId, file.children);
        if (found) return found;
      }
    }
    return null;
  }, [files]);

  const updateFileContent = useCallback((fileId: string, content: string) => {
    const updateRecursive = (fileList: VirtualFile[]): VirtualFile[] => {
      return fileList.map(file => {
        if (file.id === fileId) {
          return { ...file, content };
        }
        if (file.children) {
          return { ...file, children: updateRecursive(file.children) };
        }
        return file;
      });
    };

    setFiles(prev => updateRecursive(prev));
  }, []);

  const createFile = useCallback((parentId: string, name: string, isFolder: boolean = false) => {
    const newFile: VirtualFile = {
      id: Date.now().toString(),
      name,
      path: '',
      content: '',
      language: isFolder ? '' : name.endsWith('.tsx') || name.endsWith('.ts') ? 'typescript' : 
                name.endsWith('.jsx') || name.endsWith('.js') ? 'javascript' :
                name.endsWith('.css') ? 'css' :
                name.endsWith('.html') ? 'html' : 'plaintext',
      isFolder,
      parentId,
      children: isFolder ? [] : undefined,
    };

    const addFileRecursive = (fileList: VirtualFile[]): VirtualFile[] => {
      return fileList.map(file => {
        if (file.id === parentId && file.isFolder) {
          const children = file.children || [];
          newFile.path = `${file.path}/${name}`;
          return { ...file, children: [...children, newFile] };
        }
        if (file.children) {
          return { ...file, children: addFileRecursive(file.children) };
        }
        return file;
      });
    };

    setFiles(prev => addFileRecursive(prev));
    
    if (!isFolder) {
      setOpenFiles(prev => [...prev, newFile.id]);
      setActiveFileId(newFile.id);
    }
    
    toast.success(`${isFolder ? 'Folder' : 'File'} "${name}" created`);
  }, []);

  const deleteFile = useCallback((fileId: string) => {
    const deleteRecursive = (fileList: VirtualFile[]): VirtualFile[] => {
      return fileList.filter(file => {
        if (file.id === fileId) return false;
        if (file.children) {
          file.children = deleteRecursive(file.children);
        }
        return true;
      });
    };

    setFiles(prev => deleteRecursive(prev));
    setOpenFiles(prev => prev.filter(id => id !== fileId));
    
    if (activeFileId === fileId && openFiles.length > 0) {
      setActiveFileId(openFiles[0]);
    }
    
    toast.success('File deleted');
  }, [activeFileId, openFiles]);

  const renameFile = useCallback((fileId: string, newName: string) => {
    const renameRecursive = (fileList: VirtualFile[]): VirtualFile[] => {
      return fileList.map(file => {
        if (file.id === fileId) {
          const pathParts = file.path.split('/');
          pathParts[pathParts.length - 1] = newName;
          return { ...file, name: newName, path: pathParts.join('/') };
        }
        if (file.children) {
          return { ...file, children: renameRecursive(file.children) };
        }
        return file;
      });
    };

    setFiles(prev => renameRecursive(prev));
    toast.success('File renamed');
  }, []);

  const openFile = useCallback((fileId: string) => {
    const file = findFileById(fileId);
    if (file && !file.isFolder) {
      if (!openFiles.includes(fileId)) {
        setOpenFiles(prev => [...prev, fileId]);
      }
      setActiveFileId(fileId);
    }
  }, [findFileById, openFiles]);

  const closeFile = useCallback((fileId: string) => {
    setOpenFiles(prev => {
      const newOpenFiles = prev.filter(id => id !== fileId);
      if (activeFileId === fileId && newOpenFiles.length > 0) {
        setActiveFileId(newOpenFiles[0]);
      }
      return newOpenFiles;
    });
  }, [activeFileId]);

  const activeFile = findFileById(activeFileId);

  return {
    files,
    activeFile,
    activeFileId,
    openFiles,
    findFileById,
    updateFileContent,
    createFile,
    deleteFile,
    renameFile,
    openFile,
    closeFile,
    setActiveFileId,
  };
};