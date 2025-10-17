import { useVirtualFileSystem } from '@/hooks/useVirtualFileSystem';
import { FileExplorer } from './FileExplorer';
import { EditorTabs } from './EditorTabs';
import MonacoEditor from '../MonacoEditor';

export const MultiFileEditor = () => {
  const {
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
  } = useVirtualFileSystem();

  return (
    <div className="flex h-full w-full">
      <FileExplorer
        files={files}
        activeFileId={activeFileId}
        onFileClick={openFile}
        onCreateFile={createFile}
        onDeleteFile={deleteFile}
        onRenameFile={renameFile}
      />
      
      <div className="flex-1 flex flex-col">
        <EditorTabs
          openFiles={openFiles}
          activeFileId={activeFileId}
          findFileById={findFileById}
          onTabClick={setActiveFileId}
          onTabClose={closeFile}
        />
        
        <div className="flex-1">
          {activeFile && !activeFile.isFolder ? (
            <MonacoEditor
              height="100%"
              language={activeFile.language}
              value={activeFile.content}
              onChange={(value) => {
                if (value !== undefined) {
                  updateFileContent(activeFileId, value);
                }
              }}
              theme="vs-dark"
              path={activeFile.path}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">No file selected</p>
                <p className="text-sm">Select a file from the explorer to start editing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};