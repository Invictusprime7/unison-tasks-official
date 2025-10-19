import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, MoreVertical } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { VirtualNode } from '@/hooks/useVirtualFileSystem';
import { cn } from '@/lib/utils';

interface FileExplorerProps {
  nodes: VirtualNode[];
  activeFileId: string;
  onFileSelect: (id: string) => void;
  onCreateFile: (name: string, parentId: string | null) => void;
  onCreateFolder: (name: string, parentId: string | null) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onDuplicate: (id: string) => void;
  onToggleFolder: (id: string) => void;
}

export function FileExplorer({
  nodes,
  activeFileId,
  onFileSelect,
  onCreateFile,
  onCreateFolder,
  onDelete,
  onRename,
  onDuplicate,
  onToggleFolder,
}: FileExplorerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingValue(currentName);
  };

  const commitRename = () => {
    if (editingId && editingValue.trim()) {
      onRename(editingId, editingValue.trim());
    }
    setEditingId(null);
  };

  const renderNode = (node: VirtualNode, depth: number = 0): React.ReactNode => {
    const isEditing = editingId === node.id;
    const isActive = node.type === 'file' && activeFileId === node.id;

    return (
      <div key={node.id}>
        <div
          className={cn(
            "group flex items-center gap-1 px-2 py-1 hover:bg-accent cursor-pointer text-sm",
            isActive && "bg-accent text-accent-foreground font-medium"
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {node.type === 'folder' && (
            <button
              onClick={() => onToggleFolder(node.id)}
              className="hover:bg-muted rounded p-0.5"
            >
              {node.isOpen ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}

          <div
            className="flex items-center gap-1.5 flex-1 min-w-0"
            onClick={() => node.type === 'file' && onFileSelect(node.id)}
          >
            {node.type === 'folder' ? (
              node.isOpen ? (
                <FolderOpen className="h-4 w-4 text-primary flex-shrink-0" />
              ) : (
                <Folder className="h-4 w-4 text-primary flex-shrink-0" />
              )
            ) : (
              <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}

            {isEditing ? (
              <Input
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename();
                  if (e.key === 'Escape') setEditingId(null);
                }}
                className="h-6 px-1 text-xs"
                autoFocus
              />
            ) : (
              <span className="truncate">{node.name}</span>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="opacity-0 group-hover:opacity-100 hover:bg-muted rounded p-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {node.type === 'folder' && (
                <>
                  <DropdownMenuItem onClick={() => {
                    const name = prompt('File name:');
                    if (name) onCreateFile(name, node.id);
                  }}>
                    New File
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const name = prompt('Folder name:');
                    if (name) onCreateFolder(name, node.id);
                  }}>
                    New Folder
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => handleRename(node.id, node.name)}>
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(node.id)}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(node.id)}
                className="text-destructive focus:text-destructive"
              >
                Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => navigator.clipboard.writeText(node.name)}
                className="text-xs text-muted-foreground"
              >
                Copy Name
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {node.type === 'folder' && node.isOpen && (
          <div>
            {nodes
              .filter(n => n.parentId === node.id)
              .map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col border-r bg-background">
      <div className="flex items-center justify-between p-2 border-b">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Files
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hover:bg-muted rounded p-1">
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {
              const name = prompt('File name:');
              if (name) onCreateFile(name, 'root');
            }}>
              New File
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              const name = prompt('Folder name:');
              if (name) onCreateFolder(name, 'root');
            }}>
              New Folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="flex-1">
        <div className="py-1">
          {nodes
            .filter(n => n.parentId === null)
            .map(node => renderNode(node, 0))}
        </div>
      </ScrollArea>
    </div>
  );
}
