import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

const source = ts.createSourceFile(
  'WebBuilder.tsx', readFileSync('src/components/creatives/WebBuilder.tsx', 'utf8'),
  ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX,
);

function runDirtyEffect(files: Record<string, string>, savedFiles: Record<string, string>, previewCode: string, savedCode = '') {
  const effects: ts.CallExpression[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node) && node.expression.getText(source) === 'useEffect'
      && node.arguments[0]?.getText(source).includes('setHasUnsavedChanges(codeChanged || vfsChanged)')) effects.push(node);
    ts.forEachChild(node, visit);
  };
  visit(source);
  expect(effects).toHaveLength(1);
  const setHasUnsavedChanges = vi.fn();
  const signature = (values: Record<string, string>) => Object.keys(values).length ? JSON.stringify(values) : '';
  const dependencies = {
    useEffect: (effect: () => void) => effect(), previewCode,
    virtualFS: { nodes: [] }, virtualFSRef: { current: { getSandpackFiles: () => files } },
    lastSavedCodeRef: { current: savedCode }, initialCodeRef: { current: 'mount placeholder' },
    lastSavedVfsSignatureRef: { current: signature(savedFiles) },
    computeVfsSignature: signature, setHasUnsavedChanges,
  };
  const compiled = ts.transpileModule(effects[0].getText(source), {
    compilerOptions: { target: ts.ScriptTarget.ES2020 },
  }).outputText;
  new Function(...Object.keys(dependencies), compiled)(...Object.values(dependencies));
  const calls = setHasUnsavedChanges.mock.calls;
  return calls[calls.length - 1]?.[0];
}

describe('WebBuilder canonical dirty state', () => {
  it('ignores page selection and preview source changes when committed VFS is unchanged', () => {
    const files = { '/src/App.tsx': 'router', '/src/pages/Gallery.tsx': 'gallery' };
    expect(runDirtyEffect(files, files, 'selected gallery code')).toBe(false);
  });

  it('detects real VFS edits', () => {
    expect(runDirtyEffect({ '/src/App.tsx': 'edited' }, { '/src/App.tsx': 'saved' }, 'preview')).toBe(true);
  });

  it('uses the saved source baseline for code-only drafts', () => {
    expect(runDirtyEffect({}, {}, 'saved', 'saved')).toBe(false);
    expect(runDirtyEffect({}, {}, 'edited', 'saved')).toBe(true);
  });
});