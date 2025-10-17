import { useState } from 'react';
import { ChevronDown, ChevronRight, File, Folder, FolderOpen, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VirtualFile } from '@/hooks/useVirtualFileSystem';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface FileExplorerProps {
  files: VirtualFile[];
  activeFileId: string;
  onFileClick: (fileId: string) => void;
  onCreateFile: (parentId: string, name: string, isFolder: boolean) => void;
  onDeleteFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
}

export const FileExplorer = ({
  files,
  activeFileId,
  onFileClick,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
}: FileExplorerProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1']));
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleRename = (fileId: string) => {
    if (newName.trim()) {
      onRenameFile(fileId, newName.trim());
      setRenamingId(null);
      setNewName('');
    }
  };

  const renderFile = (file: VirtualFile, depth: number = 0) => {
    const isExpanded = expandedFolders.has(file.id);
    const isActive = file.id === activeFileId;
    const isRenaming = renamingId === file.id;

    return (
      <div key={file.id}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors ${
                isActive && !file.isFolder ? 'bg-muted text-primary' : ''
              }`}
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
              onClick={() => {
                if (file.isFolder) {
                  toggleFolder(file.id);
                } else {
                  onFileClick(file.id);
                }
              }}
            >
              {file.isFolder && (
                <span className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </span>
              )}
              
              {file.isFolder ? (
                isExpanded ? (
                  <FolderOpen className="h-4 w-4 text-primary flex-shrink-0" />
                ) : (
                  <Folder className="h-4 w-4 text-primary flex-shrink-0" />
                )
              ) : (
                <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}

              {isRenaming ? (
                <Input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={() => handleRename(file.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(file.id);
                    if (e.key === 'Escape') {
                      setRenamingId(null);
                      setNewName('');
                    }
                  }}
                  className="h-6 text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="text-sm truncate">{file.name}</span>
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            {file.isFolder && (
              <>
                <ContextMenuItem onClick={() => {
                  const name = prompt('Enter file name:');
                  if (name) onCreateFile(file.id, name, false);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  New File
                </ContextMenuItem>
                <ContextMenuItem onClick={() => {
                  const name = prompt('Enter folder name:');
                  if (name) onCreateFile(file.id, name, true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Folder
                </ContextMenuItem>
              </>
            )}
            <ContextMenuItem onClick={() => {
              setRenamingId(file.id);
              setNewName(file.name);
            }}>
              <Edit2 className="h-4 w-4 mr-2" />
              Rename
            </ContextMenuItem>
            {file.id !== '1' && (
              <ContextMenuItem onClick={() => onDeleteFile(file.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </ContextMenuItem>
            )}
          </ContextMenuContent>
        </ContextMenu>

        {file.isFolder && isExpanded && file.children && (
          <div>
            {file.children.map(child => renderFile(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col h-full">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-sm">Files</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              const name = prompt('Enter file name:');
              if (name) onCreateFile('1', name, false);
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        {files.map(file => renderFile(file))}
      </ScrollArea>
    </div>
  );
};