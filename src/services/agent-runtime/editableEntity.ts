/** Read-only canonical identity for one rendered, editable application item. */
export type EditableOwnerKind =
  | 'catalog-row'
  | 'source-file'
  | 'component-prop'
  | 'presentation'
  | 'topology'
  | 'intent-binding'
  | 'asset'
  | 'runtime-state'
  | 'backend-action';

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
}

export interface EditableEntity {
  id: string;
  revisionId: string;
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
  /** Each property can have its own canonical owner. */
  owners: Record<string, EditablePropertyOwner>;
}
