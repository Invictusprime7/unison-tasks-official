import React from 'react';
import CodeMirrorEditor from '@/components/creatives/CodeMirrorEditor';
import { FileExplorer } from './FileExplorer';
import { EditorTabs } from './EditorTabs';
import { useVirtualFileSystem } from '@/hooks/useVirtualFileSystem';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

export function MultiFileEditor() {
  const {
    nodes,
    activeFileId,
    openFile,
    closeTab,
    createFile,
    createFolder,
    deleteNode,
    renameNode,
    duplicateNode,
    updateFileContent,
    toggleFolder,
    expandAll,
    collapseAll,
    getActiveFile,
    getOpenFiles,
  } = useVirtualFileSystem();

  const activeFile = getActiveFile();
  const openFiles = getOpenFiles();

  return (
    <div className="h-full w-full bg-background">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
          <FileExplorer
            nodes={nodes}
            activeFileId={activeFileId}
            onFileSelect={openFile}
            onCreateFile={createFile}
            onCreateFolder={createFolder}
            onDelete={deleteNode}
            onRename={renameNode}
            onDuplicate={duplicateNode}
            onToggleFolder={toggleFolder}
            onExpandAll={expandAll}
            onCollapseAll={collapseAll}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={80}>
          <div className="h-full flex flex-col">
            <EditorTabs
              tabs={openFiles.map(f => ({ id: f.id, name: f.name }))}
              activeTabId={activeFileId}
              onTabSelect={openFile}
              onTabClose={closeTab}
            />

            <div className="flex-1">
              {activeFile ? (
                <CodeMirrorEditor
                  height="100%"
                  language={(['javascript', 'typescript', 'html', 'css', 'json'].includes(activeFile.language) 
                    ? (activeFile.language === 'typescript' ? 'javascript' : activeFile.language) 
                    : 'javascript') as 'javascript' | 'typescript' | 'html' | 'css' | 'json'}
                  theme="dark"
                  value={activeFile.content}
                  onChange={(value) => updateFileContent(activeFile.id, value)}
                  readOnly={false}
                  className="w-full h-full"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                  <p className="text-lg font-medium">No file selected</p>
                  <p className="text-sm mt-1">Select a file from the explorer to start editing</p>
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
