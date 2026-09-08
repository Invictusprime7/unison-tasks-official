import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { transformSync } from '@babel/core';
import stylexPlugin from '@stylexjs/babel-plugin';
import { buildSync } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
const outputPath = new URL('../src/sections/recipes/stylexRecipes.generated.json', import.meta.url);
const modules = {};
const rules = [];
for (const [key, filename] of [['faqModule', 'FaqAccordion.jsx'], ['mobileNavigationModule', 'MobileNavigation.jsx']]) {
const sourcePath = new URL(`../src/sections/recipes/${filename}`, import.meta.url);
const transformed = transformSync(readFileSync(sourcePath, 'utf8'), {
  filename: `src/sections/recipes/${filename}`,
  configFile: false,
  babelrc: false,
  parserOpts: { plugins: ['jsx'] },
  plugins: [[stylexPlugin, { dev: false, runtimeInjection: false, classNamePrefix: 'utx' }]],
});
const compiled = buildSync({
  stdin: { contents: transformed.code, loader: 'jsx', resolveDir: root, sourcefile: filename },
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'browser',
  external: ['react', '@/unison/ui/*'],
  legalComments: 'none',
});
modules[key] = transformSync(compiled.outputFiles[0].text, {
  configFile: false,
  babelrc: false,
  plugins: [({ types }) => ({ visitor: {
    ExportNamedDeclaration(path) {
      const defaultExport = path.node.specifiers.find(specifier => specifier.exported?.name === 'default');
      if (!defaultExport) return;
      const remaining = path.node.specifiers.filter(specifier => specifier !== defaultExport);
      path.replaceWithMultiple([
        ...(remaining.length ? [types.exportNamedDeclaration(null, remaining)] : []),
        types.exportDefaultDeclaration(defaultExport.local),
      ]);
    },
  } })],
}).code;
rules.push(...transformed.metadata.stylex);
}
const output = JSON.stringify({
  ...modules,
  css: stylexPlugin.processStylexRules(rules),
}, null, 2) + '\n';

if (process.argv.includes('--check')) {
  if (readFileSync(outputPath, 'utf8') !== output) throw new Error('StyleX recipes are stale. Run npm run recipes:build.');
  console.log('StyleX recipes match their source.');
} else {
  writeFileSync(outputPath, output);
  console.log('Compiled StyleX recipes to portable JavaScript and CSS.');
}