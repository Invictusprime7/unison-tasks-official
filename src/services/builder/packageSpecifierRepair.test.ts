import { describe, expect, it } from 'vitest';
import { repairPackageSpecifierTypos } from './aiCandidateChangeSet';

describe('repairPackageSpecifierTypos', () => {
  it('fixes underscore-mangled allowed packages and leaves others alone', () => {
    const out = repairPackageSpecifierTypos({
      '/src/a.tsx': `import { Link } from "react_router_dom";\nimport x from 'not_a_real_pkg';\nimport y from './local_file';`,
      '/src/b.css': `"react_router_dom"`,
    });
    expect(out['/src/a.tsx']).toContain('from "react-router-dom"');
    expect(out['/src/a.tsx']).toContain("'not_a_real_pkg'");
    expect(out['/src/a.tsx']).toContain("'./local_file'");
    expect(out['/src/b.css']).toBe(`"react_router_dom"`);
  });
});
