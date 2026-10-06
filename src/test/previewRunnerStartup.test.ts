import { describe, expect, it } from 'vitest';
import { projectPreviewPackageJson } from '@/utils/previewArtifacts';

describe('preview runner install graph', () => {
  it('installs only the computed browser graph instead of saved build and unused packages', () => {
    const dependencies = { react: '18.3.1', 'lucide-react': '0.468.0' };
    const manifest = JSON.parse(projectPreviewPackageJson(JSON.stringify({
      name: 'saved-project', scripts: { start: 'vite' },
      dependencies: { react: 'latest', three: 'latest', recharts: 'latest' },
      devDependencies: { vite: 'latest', typescript: 'latest' },
    }), dependencies));
    expect(manifest.dependencies).toEqual(dependencies);
    expect(manifest.devDependencies).toBeUndefined();
    expect(manifest.name).toBe('saved-project');
  });
});
