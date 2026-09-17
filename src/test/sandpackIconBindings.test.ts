import { describe, expect, it } from 'vitest';
import * as Babel from '@babel/standalone';
import { prepareSandpackFiles, processCode } from '@/utils/sandpackFilePrep';
import { buildGeneratedUiFoundation } from '@/platform/core/generatedUiFoundation';

function assertCompiles(source: string) {
  expect(() => Babel.transform(source, {
    filename: 'Social.tsx',
    presets: [['react', { runtime: 'classic' }], ['typescript', { isTSX: true, allExtensions: true }]],
  })).not.toThrow();
}

describe('Sandpack social icon binding preservation', () => {
  it('compiles multiline social imports through the complete Wizard preview preparation', () => {
    const foundation = buildGeneratedUiFoundation({ themePresetId: 'modern' });
    const files = {
      ...foundation.files,
      '/src/App.tsx': "import Social from './pages/Social'; export default function App(){ return <Social />; }",
      '/src/pages/Social.tsx': "import {\nInstagram, Facebook, Twitter, Youtube\n} from '@/unison/ui/icons'; export default function Social(){ return <footer><Instagram /><Facebook /><Twitter /><Youtube /></footer>; }",
      '/src/index.css': ':root { --primary: 0 0% 10%; }',
    };
    const prepared = prepareSandpackFiles(files, { strict: true, entryPoint: '/src/App.tsx' });
    assertCompiles(prepared['/pages/Social.tsx']);
    expect(prepared['/pages/Social.tsx']).not.toMatch(/const (Instagram|Facebook|Twitter|Youtube)\s*=/);
  });
  it('preserves multiline foundation imports without injecting duplicate social icons', () => {
    const source = `import React from 'react';
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
} from '@/unison/ui/icons';
export default function Social() { return <footer><Instagram /><Facebook /><Twitter /><Youtube /></footer>; }`;
    const prepared = processCode(source, '/src/pages/Social.tsx');
    assertCompiles(prepared);
    expect(prepared).not.toMatch(/const (Instagram|Facebook|Twitter|Youtube)\s*=/);
    assertCompiles(processCode(prepared, '/src/pages/Social.tsx'));
  });

  it('recognizes aliased bindings in indented mixed default and named imports', () => {
    const source = `import React from 'react';
  import Icons, {
    Instagram as PhotoIcon,
    Facebook,
  } from './brand-icons';
export default function Social() { return <footer><PhotoIcon /><Facebook /></footer>; }`;
    const prepared = processCode(source, '/src/pages/Social.tsx');
    assertCompiles(prepared);
    expect(prepared).not.toMatch(/const Facebook\s*=/);
  });

  it('still supplies genuinely missing icon bindings once', () => {
    const source = `import React from 'react';
export default function Social() { return <footer><Instagram /></footer>; }`;
    const once = processCode(source, '/src/pages/Social.tsx');
    const twice = processCode(once, '/src/pages/Social.tsx');
    assertCompiles(twice);
    expect(twice.match(/const Instagram\s*=/g)).toHaveLength(1);
  });

  it('removes stale generated lookups when a real facade import supplies the icon', () => {
    const source = `import React from 'react';
import { Instagram } from '@/unison/ui/icons';
import * as __LucideIcons from 'lucide-react';
const __LucideFallback = (props) => React.createElement('svg', props);
const Instagram = __LucideIcons['Instagram'] || __LucideFallback;
export default function Social() { return <Instagram />; }`;
    const prepared = processCode(source, '/src/pages/Social.tsx');
    assertCompiles(prepared);
    expect(prepared).toMatch(/import \{ Instagram \} from ['"][^'"]*unison\/ui\/icons['"]/);
    expect(prepared).not.toMatch(/const Instagram\s*=/);
  });
});
