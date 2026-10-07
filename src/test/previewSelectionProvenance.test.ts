import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(path, 'utf8');

describe('preview selection provenance bridge', () => {
  it('stamps catalog, component, behavior, and revision identity into Sandpack selections', () => {
    const bridge = read('src/utils/sandpackFilePrep.ts');
    for (const attribute of [
      'data-ut-source-table', 'data-ut-row-id', 'data-ut-field',
      'data-ut-component-id', 'data-ut-component-instance-id',
      'data-ut-registry-key', 'data-ut-role', 'data-ut-entity',
    ]) {
      expect(bridge).toContain(attribute);
    }
    expect(bridge).toContain('revisionId,');
    expect(bridge).toContain("revisionId = typeof data.revisionId === 'string' ? data.revisionId : null;");
  });

  it('rejects a stale iframe selection before forwarding it to Builder AI', () => {
    const preview = read('src/components/VFSPreview.tsx');
    const builder = read('src/components/creatives/WebBuilder.tsx');
    const panel = read('src/components/creatives/web-builder/AIBuilderPanel.tsx');
    expect(preview).toContain("data.element.revisionId !== revisionId");
    expect(preview).toContain("revisionId }, '*'");
    expect(builder).toContain('revisionId: el.revisionId');
    expect(panel).toContain('revisionId: selectedTarget.revisionId');
  });
});
