import type { EditableEntity, EditablePropertyOwner } from './editableEntity';
import type { SystemGraph } from './systemGraph';

export interface EditableSelection {
  elementId?: string | null;
  selector?: string | null;
  pageId?: string | null;
  pagePath?: string | null;
  sectionId?: string | null;
  sectionType?: string | null;
  componentType?: string | null;
  componentInstanceId?: string | null;
  artifactId?: string | null;
  bindingId?: string | null;
  bindingKey?: string | null;
  sourceTable?: string | null;
  rowId?: string | null;
  field?: string | null;
  clickedTag?: string | null;
  targetPath?: string | null;
  intents?: string[];
  primaryIntent?: string | null;
  componentPath?: string | null;
  editableRange?: { startLine: number; endLine: number } | null;
}

export interface CatalogBindingReference {
  id: string;
  sourceTable: string;
  pagePath?: string | null;
  sectionId?: string | null;
}

export interface ResolveEditableEntityInput {
  selectedElement: EditableSelection;
  graph: SystemGraph;
  catalogBindings?: readonly CatalogBindingReference[];
}

function ownerId(parts: Array<string | null | undefined>): string {
  return parts.filter((part): part is string => Boolean(part)).join(':') || 'unknown';
}

/**
 * Resolves ownership by provenance first. Source ownership is deliberately
 * last so a live catalog field is never silently rewritten as JSX.
 */
export function resolveEditableEntity(input: ResolveEditableEntityInput): EditableEntity {
  const selected = input.selectedElement;
  const intents = Array.from(new Set([...(selected.intents ?? []), ...(selected.primaryIntent ? [selected.primaryIntent] : [])]));
  const entity: EditableEntity = {
    id: `entity:${ownerId([selected.sourceTable, selected.rowId, selected.elementId, selected.bindingKey, selected.sectionId, selected.pagePath])}`,
    revisionId: input.graph.revision.id,
    pageId: selected.pageId ?? undefined,
    pagePath: selected.pagePath ?? undefined,
    sectionId: selected.sectionId ?? undefined,
    sectionType: selected.sectionType ?? undefined,
    componentInstanceId: selected.componentInstanceId ?? undefined,
    componentType: selected.componentType ?? undefined,
    artifactId: selected.artifactId ?? undefined,
    elementId: selected.elementId ?? undefined,
    elementRole: selected.clickedTag ?? undefined,
    selector: selected.selector ?? undefined,
    intents,
    owners: {},
  };

  if (selected.sourceTable && selected.rowId) {
    const owner: EditablePropertyOwner = {
      kind: 'catalog-row', table: selected.sourceTable, rowId: selected.rowId,
      field: selected.field ?? undefined, bindingId: selected.bindingId ?? undefined,
    };
    entity.owners[selected.field ?? 'value'] = owner;
    if (intents.length) entity.owners.intent = { kind: 'intent-binding', intent: intents[0], bindingId: selected.bindingId ?? undefined };
    return entity;
  }

  const binding = selected.bindingId
    ? input.catalogBindings?.find((candidate) => candidate.id === selected.bindingId)
    : input.catalogBindings?.find((candidate) => candidate.pagePath === selected.pagePath && candidate.sectionId === selected.sectionId);
  if (binding) {
    entity.owners.data = { kind: 'catalog-row', table: binding.sourceTable, bindingId: binding.id };
  }

  const route = selected.clickedTag?.toLowerCase() === 'a' && selected.targetPath
    ? input.graph.routes.find((candidate) => candidate.path === selected.targetPath)
    : undefined;
  if (route) entity.owners.navigation = { kind: 'topology', pageId: route.pageId ?? undefined, routeId: route.id };
  if (intents.length) entity.owners.intent = { kind: 'intent-binding', intent: intents[0], bindingId: selected.bindingId ?? undefined };
  if (selected.sectionId) entity.owners.presentation = { kind: 'presentation', presentationKey: selected.sectionId };
  if (selected.componentPath) {
    entity.owners.source = {
      kind: 'source-file', sourcePath: selected.componentPath,
      sourceRange: selected.editableRange ?? undefined,
    };
  }
  if (Object.keys(entity.owners).length === 0) {
    entity.owners.source = { kind: 'source-file', sourcePath: selected.pagePath ?? undefined };
  }
  return entity;
}
