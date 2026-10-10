/** Which commands each editing surface may issue (§22 consumers). */
import type { EditorCommandSource, EditorCommandType } from './editorCommandTypes';

const ALL: EditorCommandType[] = [
  'set-text', 'set-style', 'set-attribute', 'set-link', 'replace-asset', 'resize', 'move', 'set-visibility',
  'duplicate', 'delete', 'update-resource-field', 'insert-component', 'create-component', 'create-page',
  'create-overlay', 'bind-intent',
];
const DIRECT: EditorCommandType[] = ['set-text', 'set-style', 'set-attribute', 'set-link', 'replace-asset', 'resize', 'move', 'set-visibility', 'duplicate', 'delete', 'update-resource-field', 'bind-intent'];

export const EDITOR_CAPABILITIES: Record<EditorCommandSource, ReadonlySet<EditorCommandType>> = {
  inline: new Set(['set-text', 'update-resource-field']),
  toolbar: new Set(DIRECT),
  inspector: new Set(DIRECT),
  ai: new Set(ALL),
  'command-palette': new Set(ALL),
};

export function canIssue(source: EditorCommandSource, type: EditorCommandType): boolean {
  return EDITOR_CAPABILITIES[source].has(type);
}
