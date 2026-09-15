import * as Babel from '@babel/standalone';

/** Normalize image symbols at the authoring boundary, preserving all other source bytes. */
export function normalizeImageCompatibility(source: string, filePath: string): { code: string; issues: string[] } {
  if (!/next\/(?:legacy\/)?image|unison\/ui\/(?:media|image)|<Image(?:\s|\/|>)/.test(source)) return { code: source, issues: [] };
  const issues: string[] = [];
  const edits: Array<{ start: number; end: number; text: string }> = [];
  const packages = (Babel as any).packages;
  let ast: any;
  try { ast = packages.parser.parse(source, { sourceType: 'module', plugins: ['jsx', 'typescript'] }); }
  catch (err) { return { code: source, issues: [filePath + ': ' + (err instanceof Error ? err.message : String(err))] }; }
  const componentBindings = new Set<string>();
  const namespaceBindings = new Set<string>();
  const add = (node: any, text: string) => edits.push({ start: node.start, end: node.end, text });
  let implicitAlias: string | undefined;
  packages.traverse.default(ast, {
    ImportDeclaration(path: any) {
      const node = path.node, specifier = node.source.value;
      if (!/^(?:next\/(?:legacy\/)?image|@\/unison\/ui\/(?:image|media))$/.test(specifier)) return;
      const isNext = specifier.startsWith('next/');
      if (isNext || specifier.endsWith('/image')) add(node.source, "'@/unison/ui/media'");
      for (const item of node.specifiers) {
        if (item.type === 'ImportNamespaceSpecifier') namespaceBindings.add(item.local.name);
        else if (item.type === 'ImportDefaultSpecifier' || ['Image', 'default'].includes(item.imported?.name)) componentBindings.add(item.local.name);
        else if (isNext && !['ImageProps', 'StaticImageData'].includes(item.imported?.name)) issues.push(filePath + ': unsupported image import "' + item.imported?.name + '". Use Image, ImageProps or StaticImageData from @/unison/ui/media.');
      }
    },
  });
  packages.traverse.default(ast, {
    JSXIdentifier(path: any) {
      if (path.node.name !== 'Image' || !['JSXOpeningElement', 'JSXClosingElement'].includes(path.parent.type) || path.parent.name !== path.node || path.scope.hasBinding('Image')) return;
      implicitAlias ??= path.scope.getProgramParent().generateUidIdentifier('UnisonImage').name;
      add(path.node, implicitAlias);
    },
    NewExpression(path: any) {
      const callee = path.node.callee;
      const name = callee.type === 'Identifier' ? callee.name : callee.type === 'MemberExpression' && callee.object.type === 'Identifier' && callee.property.name === 'default' && namespaceBindings.has(callee.object.name) ? callee.object.name : undefined;
      if (!name || (!componentBindings.has(name) && !namespaceBindings.has(name))) return;
      const binding = path.scope.getBinding(name);
      if (binding?.kind === 'module') add(callee, 'globalThis.Image');
    },
  });
  if (issues.length) return { code: source, issues };
  let code = source;
  for (const edit of edits.sort((a, b) => b.start - a.start)) code = code.slice(0, edit.start) + edit.text + code.slice(edit.end);
  if (implicitAlias) code = "import { Image as " + implicitAlias + " } from '@/unison/ui/media';\n" + code;
  return { code, issues };
}
