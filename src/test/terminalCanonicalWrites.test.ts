import { describe, it, expect, beforeEach } from 'vitest';
import { processCommand, __resetTerminalStaging, type CommandContext, type TerminalFileOp } from '@/services/terminalCommands';

function ctx(files: Record<string, string>, sink: Array<{ ops: TerminalFileOp[]; summary: string }>): CommandContext {
  const nodes = Object.entries(files).map(([path, content]) => ({
    id: path, name: path.split('/').pop()!, type: 'file' as const, path, content, parentId: null,
  }));
  return { nodes: nodes as never, currentDeps: {}, onAddDep: () => {}, onRemoveDep: () => {}, onPatch: (ops, summary) => sink.push({ ops, summary }) };
}

describe('terminal writes go through onPatch only', () => {
  beforeEach(() => __resetTerminalStaging());

  it('write, mv, cp, rm, touch each emit one patch', () => {
    const sink: Array<{ ops: TerminalFileOp[]; summary: string }> = [];
    const c = ctx({ '/src/a.ts': 'A' }, sink);
    processCommand('write /src/b.ts hello', c);
    processCommand('mv /src/a.ts /src/c.ts', c);
    processCommand('cp /src/a.ts /src/d.ts', c);
    processCommand('rm /src/a.ts', c);
    processCommand('touch /src/e.ts', c);
    expect(sink).toHaveLength(5);
    expect(sink[1].ops).toEqual([{ type: 'create', path: '/src/c.ts', contents: 'A' }, { type: 'delete', path: '/src/a.ts' }]);
    expect(sink[3].ops).toEqual([{ type: 'delete', path: '/src/a.ts' }]);
  });

  it('staged mode commits once', () => {
    const sink: Array<{ ops: TerminalFileOp[]; summary: string }> = [];
    const c = ctx({ '/src/a.ts': 'A' }, sink);
    processCommand('begin', c);
    processCommand('write /src/a.ts B', c);
    processCommand('touch /src/z.ts', c);
    expect(sink).toHaveLength(0);
    processCommand('commit', c);
    expect(sink).toHaveLength(1);
    expect(sink[0].ops.map((o) => o.path)).toEqual(['/src/a.ts', '/src/z.ts']);
  });

  it('abort discards and bare rm still uninstalls', () => {
    const sink: Array<{ ops: TerminalFileOp[]; summary: string }> = [];
    const removed: string[] = [];
    const c = { ...ctx({}, sink), onRemoveDep: (p: string) => removed.push(p), currentDeps: { lodash: '1' } };
    processCommand('begin', c); processCommand('touch /x.ts', c); processCommand('abort', c);
    processCommand('rm lodash', c);
    expect(sink).toHaveLength(0);
    expect(removed).toEqual(['lodash']);
  });
});
