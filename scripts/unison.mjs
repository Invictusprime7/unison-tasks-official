import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const [command, ...args] = process.argv.slice(2);
if (!['audit', 'certify', 'promote', 'repair', 'retire'].includes(command)) {
  console.error('Usage: node scripts/unison.mjs <audit|certify|promote|repair|retire> [arguments]');
  process.exit(1);
}
const root = fileURLToPath(new URL('../', import.meta.url));
process.chdir(root);
const output = path.join(root, '.artifacts', 'unison', `${command}-${process.pid}.mjs`);
await mkdir(path.dirname(output), { recursive: true });
const result = await build({
  entryPoints: [path.join(root, 'scripts', `unison-${command}.ts`)],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'esm',
  packages: 'external',
});
await writeFile(output, result.outputFiles[0].text);
process.argv = [process.execPath, output, ...args];
await import(pathToFileURL(output).href);
