import { describe, expect, it } from 'vitest';
import { verifyAuthoredSourcePreservation as verify } from '@/services/builder/authoredSourcePreservation';

const acceptedFiles = {
  '/src/hooks/useBooking.ts': 'const secretCustomerData = "never log source";',
  '/src/styles/custom.css': '.custom { color: red; }',
  '/public/logo.svg': '<svg/>',
  '/src/App.tsx': 'router before',
};
const base = { acceptedFiles, operations: [], compilerOwnedPaths: ['/src/App.tsx'], stage: 'finalized-before-persistence' };

describe('authored-source preservation primitive', () => {
  it('allows only declared compiler reconciliation and explicit edits including empty source', () => {
    expect(verify({ ...base, operations: [{ type: 'replace', path: '/src/hooks/useBooking.ts', contents: '' }],
      finalizedFiles: { ...acceptedFiles, '/src/App.tsx': 'router after', '/src/hooks/useBooking.ts': '' } })).toEqual([]);
  });
  it('detects arbitrary authored file changes, deletion and addition without logging contents', () => {
    const finalizedFiles = { ...acceptedFiles, '/src/hooks/useBooking.ts': 'overwritten', '/src/new.ts': 'surprise' };
    delete finalizedFiles['/public/logo.svg'];
    const result = verify({ ...base, finalizedFiles });
    expect(result.map(item => [item.path, item.kind])).toEqual([
      ['/public/logo.svg', 'missing'], ['/src/hooks/useBooking.ts', 'changed'], ['/src/new.ts', 'unexpected'],
    ]);
    expect(JSON.stringify(result)).not.toContain('secretCustomerData');
  });
  it('preserves explicit deletion and rename and rejects resurrection', () => {
    const operations = [{ type: 'delete' as const, path: '/public/logo.svg' }, { type: 'create' as const, path: '/public/brand.svg', contents: '<svg/>' }];
    const finalizedFiles = { ...acceptedFiles, '/public/brand.svg': '<svg/>' };
    delete finalizedFiles['/public/logo.svg'];
    expect(verify({ ...base, operations, finalizedFiles })).toEqual([]);
    expect(verify({ ...base, operations, finalizedFiles: { ...finalizedFiles, '/public/logo.svg': '<svg/>' } })[0].kind).toBe('unexpected');
  });
  it('normalizes path identity but rejects alias collisions, traversal and duplicate operations', () => {
    expect(verify({ ...base, acceptedFiles: { 'src\\custom.ts': 'a' }, finalizedFiles: { '/src/custom.ts': 'a' } })).toEqual([]);
    expect(() => verify({ ...base, finalizedFiles: { '/src/a.ts': 'a', 'src/a.ts': 'b' } })).toThrow('collision');
    expect(() => verify({ ...base, finalizedFiles: { '/src/../a.ts': 'a' } })).toThrow('Invalid');
    expect(() => verify({ ...base, finalizedFiles: acceptedFiles, operations: [
      { type: 'delete', path: '/public/logo.svg' }, { type: 'delete', path: 'public/logo.svg' },
    ] })).toThrow('Duplicate');
  });
  it('supports explicit compiler-owned directory contracts without exempting adjacent authored paths', () => {
    const finalizedFiles = { ...acceptedFiles, '/.unison/state.json': '{}', '/src/project-components/Card.tsx': 'changed' };
    const result = verify({ ...base, compilerOwnedPaths: ['/.unison/**'], finalizedFiles });
    expect(result).toEqual([{ path: '/src/project-components/Card.tsx', stage: 'finalized-before-persistence', kind: 'unexpected' }]);
  });
});
