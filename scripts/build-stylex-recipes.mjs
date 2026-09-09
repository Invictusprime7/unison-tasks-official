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
const registryPath = new URL('../src/sections/variants/registry.ts', import.meta.url);
const registryAst = transformSync(readFileSync(registryPath, 'utf8'), {
  filename: 'registry.ts', configFile: false, babelrc: false, ast: true, code: false,
  parserOpts: { plugins: ['typescript'] },
}).ast;
const declarations = registryAst.program.body;
const componentImports = new Map(declarations.filter(node => node.type === 'ImportDeclaration')
  .flatMap(node => node.specifiers.filter(specifier => specifier.type === 'ImportSpecifier')
    .map(specifier => [specifier.local.name, { source: node.source.value, name: specifier.imported.name }])));
const registry = declarations.filter(node => node.type === 'VariableDeclaration')
  .flatMap(node => node.declarations).find(node => node.id.name === 'VARIANT_REGISTRY')?.init;
if (registry?.type !== 'ObjectExpression') throw new Error('Cannot discover the Variant Registry.');
const property = (node, name) => node.properties.find(entry => (entry.key.name || entry.key.value) === name)?.value;
const families = {};
for (const family of registry.properties) {
  const portableVariants = family.value.elements.filter(variant => {
    const metadata = property(variant, 'vfs');
    return metadata && property(metadata, 'mode')?.value === 'portable-recipe';
  });
  if (!portableVariants.length) continue;
  const imports = [];
  const entries = [];
  const radixPrimitives = new Set();
  for (const variant of portableVariants) {
    for (const primitive of property(variant, 'radixPrimitives')?.elements || []) radixPrimitives.add(primitive.value);
    const id = property(variant, 'id').value;
    const component = property(variant, 'component').name;
    const imported = componentImports.get(component);
    if (!imported) throw new Error(`Missing registered component import for ${id}`);
    imports.push(`import { ${imported.name} as ${component} } from ${JSON.stringify(imported.source)};`);
    entries.push(`${JSON.stringify(id)}: ${component}`);
  }
  const compiled = buildSync({
    stdin: {
      contents: `${imports.join('\n')}\nexport const REGISTERED_VARIANTS = {${entries.join(',')}};`,
      loader: 'tsx', resolveDir: fileURLToPath(new URL('../src/sections/variants/', import.meta.url)),
    },
    bundle: true, write: false, format: 'esm', platform: 'browser',
    alias: {
      ...Object.fromEntries([...radixPrimitives].map(primitive => [`@radix-ui/react-${primitive}`, `@/unison/ui/radix/${primitive}`])),
      'lucide-react': '@/unison/ui/icons',
    },
    external: ['@/unison/ui/*'],
    packages: 'external', legalComments: 'none', metafile: true,
  });
  for (const output of Object.values(compiled.metafile.outputs)) {
    for (const dependency of output.imports) {
      const certified = dependency.path === 'react' || dependency.path === '@/unison/ui/icons'
        || [...radixPrimitives].some(primitive => dependency.path === `@/unison/ui/radix/${primitive}`);
      if (!certified) throw new Error(`Uncertified portable dependency: ${dependency.path}`);
    }
  }
  families[family.key.name || family.key.value] = compiled.outputFiles[0].text;
}
const output = JSON.stringify({
  ...modules,
  families,
  css: stylexPlugin.processStylexRules(rules),
}, null, 2) + '\n';

if (process.argv.includes('--check')) {
  if (readFileSync(outputPath, 'utf8') !== output) throw new Error('StyleX recipes are stale. Run npm run recipes:build.');
  console.log('StyleX recipes match their source.');
} else {
  writeFileSync(outputPath, output);
  console.log('Compiled StyleX recipes to portable JavaScript and CSS.');
}