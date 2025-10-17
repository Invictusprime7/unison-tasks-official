import React from 'react';
import MonacoEditor from '@/components/creatives/MonacoEditor';
import { FileExplorer } from './FileExplorer';
import { EditorTabs } from './EditorTabs';
import { useVirtualFileSystem } from '@/hooks/useVirtualFileSystem';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

export function MultiFileEditor() {
  const {
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
  } = useVirtualFileSystem();

  const activeFile = getActiveFile();
  const openFiles = nodes.filter(n => n.type === 'file');

  return (
    <div className="h-full w-full bg-background">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
          <FileExplorer
            nodes={nodes}
            activeFileId={activeFileId}
            onFileSelect={setActiveFileId}
            onCreateFile={createFile}
            onCreateFolder={createFolder}
            onDelete={deleteNode}
            onRename={renameNode}
            onDuplicate={duplicateNode}
            onToggleFolder={toggleFolder}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={80}>
          <div className="h-full flex flex-col">
            <EditorTabs
              tabs={openFiles.map(f => ({ id: f.id, name: f.name }))}
              activeTabId={activeFileId}
              onTabSelect={setActiveFileId}
              onTabClose={deleteNode}
            />

            <div className="flex-1">
              {activeFile ? (
                <MonacoEditor
                  height="100%"
                  language={activeFile.language}
                  value={activeFile.content}
                  onChange={(value) => updateFileContent(activeFile.id, value || '')}
                  theme="vs-dark"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>Select a file to start editing</p>
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
