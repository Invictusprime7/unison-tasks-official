import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'node:path';
import tailwindcss from 'tailwindcss';

const root = resolve('.artifacts/composition/browser');
export default defineConfig({
  root,
  plugins: [{
    name: 'composition-fixture-alias',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!source.startsWith('@/') || !importer) return;
      const normalized = importer.replace(/\\/g, '/');
      const match = normalized.match(/\/composition\/browser\/([^/]+)\//);
      if (match) return this.resolve(resolve(root, match[1], 'src', source.slice(2)), importer, { skipSelf: true });
    },
  }, react()],
  resolve: { dedupe: ['react', 'react-dom'] },
  css: { postcss: { plugins: [tailwindcss({
    content: [`${root.replace(/\\/g, '/')}/*/src/**/*.{ts,tsx}`, `${root.replace(/\\/g, '/')}/*/index.html`],
    theme: { extend: { colors: Object.fromEntries(['background', 'foreground', 'primary', 'secondary', 'accent', 'muted', 'card', 'border', 'input', 'ring'].flatMap(name => [[name, `hsl(var(--${name}))`], [`${name}-foreground`, `hsl(var(--${name}-foreground))`]])) } },
  })] } },
  server: { host: '127.0.0.1', port: 4187, strictPort: true },
});
