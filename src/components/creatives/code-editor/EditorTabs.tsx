import { X } from 'lucide-react';
import { VirtualFile } from '@/hooks/useVirtualFileSystem';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EditorTabsProps {
  openFiles: string[];
  activeFileId: string;
  findFileById: (id: string) => VirtualFile | null;
  onTabClick: (fileId: string) => void;
  onTabClose: (fileId: string) => void;
}

export const EditorTabs = ({
  openFiles,
  activeFileId,
  findFileById,
  onTabClick,
  onTabClose,
}: EditorTabsProps) => {
  if (openFiles.length === 0) return null;

  return (
    <div className="border-b border-border bg-muted/30">
      <ScrollArea className="w-full">
        <div className="flex items-center overflow-x-auto">
          {openFiles.map(fileId => {
            const file = findFileById(fileId);
            if (!file) return null;

            const isActive = fileId === activeFileId;

            return (
              <div
                key={fileId}
                className={`group flex items-center gap-2 px-4 py-2.5 border-r border-border cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-background text-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
                onClick={() => onTabClick(fileId)}
              >
                <span className="text-sm font-medium whitespace-nowrap">{file.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(fileId);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};