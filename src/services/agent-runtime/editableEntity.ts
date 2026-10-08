import type { ResourceEntityRef } from '@/services/resources/resourceTypes';

/** Read-only canonical identity for one rendered, editable application item. */
export type EditableEntityKind = 'catalog' | 'content' | 'presentation' | 'topology' | 'behavior' | 'backend';
export type EditableMutationLane = 'dataOps' | 'fileOps' | 'presentationOps' | 'routeOps' | 'bindingOps' | 'backendOps';
export type EditableOwnerKind =
  | 'catalog-row'
  | 'source-file'
  | 'component-prop'
  | 'presentation'
  | 'topology'
  | 'intent-binding'
  | 'asset'
  | 'runtime-state'
  | 'backend-action'
  | 'resource-field';

export interface EditablePropertyOwner {
  kind: EditableOwnerKind;
  table?: string;
  rowId?: string;
  field?: string;
  bindingId?: string;
  sourcePath?: string;
  sourceRange?: { startLine: number; endLine: number };
  presentationKey?: string;
  componentProp?: string;
  pageId?: string;
  routeId?: string;
  intent?: string;
  backendActionId?: string;
  /** Set when the property is owned by a Resource Runtime record field. */
  resource?: ResourceEntityRef;
}

export interface EditableEntity {
  id: string;
  /** Entity class decides the only permitted mutation lane. */
  kind: EditableEntityKind;
  revisionId: string;
  projectId?: string;
  pageId?: string;
  pagePath?: string;
  sectionId?: string;
  sectionType?: string;
  componentInstanceId?: string;
  componentType?: string;
  artifactId?: string;
  elementId?: string;
  elementRole?: string;
  selector?: string;
  intents: string[];
  /** Resource + record + field this element renders, when resource-backed. */
  resource?: ResourceEntityRef;
  permissions: { readable: boolean; writable: boolean; destructive?: boolean };
  allowedMutationLanes: readonly EditableMutationLane[];
  provenance: { catalogSurface?: string; registryKey?: string; bindingId?: string; generatedBy?: string };
  /** Each property can have its own canonical owner. */
  owners: Record<string, EditablePropertyOwner>;
}
