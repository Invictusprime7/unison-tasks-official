/**
 * Property-level ownership (guidebook §23–24). Extends EditableEntity.owners —
 * no second ownership model. A resource mark always wins over source, so a
 * saved field is never silently rewritten as JSX.
 */
import { parseResourceProvenance } from '@/services/resources/resourceRuntime';
import type { EditorCommand, EditorOwnerLane } from './editorCommandTypes';

const PRESENTATION: ReadonlySet<EditorCommand['type']> = new Set(['set-style', 'resize', 'set-visibility']);
const ROUTE: ReadonlySet<EditorCommand['type']> = new Set(['set-link', 'create-page']);

/** Fields a resource-backed element may change through its record. */
const RESOURCE_COMMANDS: ReadonlySet<EditorCommand['type']> = new Set(['set-text', 'replace-asset', 'update-resource-field']);

export function resolvePropertyOwner(command: EditorCommand): EditorOwnerLane {
  if (command.type === 'update-resource-field') return 'resource';
  const ref = parseResourceProvenance(command.target.resourceMark);
  if (ref && RESOURCE_COMMANDS.has(command.type)) return 'resource';
  if (command.type === 'bind-intent') return 'binding';
  if (ROUTE.has(command.type)) return 'route';
  if (PRESENTATION.has(command.type)) return 'presentation';
  return 'source';
}
