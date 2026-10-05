import * as Babel from '@babel/standalone';

/** Rewrite real module literals, preserving bindings, comments and other strings. */
export function rewritePreviewModuleSpecifiers(
  code: string,
  resolveSpecifier: (specifier: string) => string,
): string {
  if (!code.includes('@/') && !code.includes('/src/')) return code;
  const packages = (Babel as any).packages;
  let ast: any;
  try {
    ast = packages.parser.parse(code, {
      sourceType: 'module', plugins: ['jsx', 'typescript'],
      errorRecovery: true, createImportExpressions: false,
    });
  } catch {
    // Existing syntax repair/validation owns malformed source. Do not replace it.
    return code;
  }
  const edits: Array<{ start: number; end: number; text: string }> = [];
  const rewrite = (node: any) => {
    if (node?.type !== 'StringLiteral') return;
    const next = resolveSpecifier(node.value);
    if (next === node.value) return;
    const text = code[node.start] === "'"
      ? `'${JSON.stringify(next).slice(1, -1).replace(/'/g, "\\'")}'`
      : JSON.stringify(next);
    edits.push({ start: node.start, end: node.end, text });
  };
  packages.traverse.default(ast, {
    ImportDeclaration: (path: any) => rewrite(path.node.source),
    ExportNamedDeclaration: (path: any) => rewrite(path.node.source),
    ExportAllDeclaration: (path: any) => rewrite(path.node.source),
    CallExpression(path: any) {
      const { callee, arguments: args } = path.node;
      if (callee.type === 'Import' ||
        (callee.type === 'Identifier' && callee.name === 'require' && !path.scope.hasBinding('require'))) {
        rewrite(args[0]);
      }
    },
  });
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    code = code.slice(0, edit.start) + edit.text + code.slice(edit.end);
  }
  return code;
}
