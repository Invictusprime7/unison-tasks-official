import { Suspense, lazy } from 'react';

// Dynamic import for heavy Monaco editor component
const MultiFileEditor = lazy(() => import('@/components/creatives/code-editor/MultiFileEditor').then(m => ({ default: m.MultiFileEditor })));

const CodeEditorPage = () => {
  return (
    <div className="h-screen w-full">
      <Suspense fallback={<div className="flex items-center justify-center h-full">Loading Code Editor...</div>}>
        <MultiFileEditor />
      </Suspense>
    </div>
  );
};

export default CodeEditorPage;
