import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const digest = value => value === null ? null : createHash('sha256').update(value).digest('hex');
const journalName = '.unison-promotion-transaction.json';
function target(root, relative) {
  if (!/^(src\/sections\/variants\/registry\.ts|public\/variants\/[a-z0-9-]+\.svg|src\/design\/21st-intake\/imported\/[a-z0-9-]+\/record\.json)$/.test(relative)) throw new Error('Invalid promotion transaction path');
  const file = path.resolve(root, relative);
  if (!file.startsWith(path.resolve(root) + path.sep)) throw new Error('Promotion transaction escapes workspace');
  return file;
}
export function assertNoPendingPromotion(root) {
  if (fs.existsSync(path.join(root, journalName))) throw new Error('Interrupted promotion detected. Run unison-variant-register.mjs --recover before registration.');
}
/** Restores only files whose current bytes match recorded before/after state. */
export function recoverPromotion(root) {
  const journal = path.join(root, journalName);
  if (!fs.existsSync(journal)) return false;
  const data = JSON.parse(fs.readFileSync(journal, 'utf8'));
  if (data.version !== 1 || !Array.isArray(data.entries)) throw new Error('Invalid promotion journal');
  const entries = data.entries.map(entry => {
    const file = target(root, entry.path);
    const before = entry.before === null ? null : Buffer.from(entry.before, 'base64');
    const current = fs.existsSync(file) ? fs.readFileSync(file) : null;
    if (digest(before) !== entry.beforeHash || ![entry.beforeHash, entry.afterHash].includes(digest(current))) throw new Error('Promotion recovery conflict: ' + entry.path);
    return { file, before };
  });
  for (const {file,before} of entries.reverse()) {
    if (before === null) fs.rmSync(file, {force:true});
    else fs.writeFileSync(file,before);
  }
  fs.unlinkSync(journal);
  return true;
}
export function commitPromotion(root, writes, fileSystem = fs) {
  assertNoPendingPromotion(root);
  if (!writes.size) return;
  const entries = [...writes].map(([file,content]) => {
    const relative = path.relative(root,file).replaceAll(path.sep,'/');
    target(root,relative);
    const before = fs.existsSync(file) ? fs.readFileSync(file) : null;
    return {path:relative,before:before?.toString('base64') ?? null,beforeHash:digest(before),afterHash:digest(Buffer.from(content))};
  });
  const journal = path.join(root,journalName);
  // Persist originals before the first mutation; a later process can recover.
  const descriptor = fs.openSync(journal,'wx');
  try { fs.writeFileSync(descriptor,JSON.stringify({version:1,entries})); fs.fsyncSync(descriptor); } finally { fs.closeSync(descriptor); }
  try {
    for (const [file,content] of writes) {
      fileSystem.mkdirSync(path.dirname(file),{recursive:true});
      fileSystem.writeFileSync(file,content);
    }
    fs.unlinkSync(journal);
  } catch (error) {
    try { recoverPromotion(root); } catch (recoveryError) {
      throw new AggregateError([error,recoveryError],'Promotion failed; journal retained for recovery');
    }
    throw error;
  }
}
