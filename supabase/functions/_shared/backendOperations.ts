/** Reviewable backend proposals. No raw SQL, destructive operations, or browser DDL. */
export type BackendColumnType = 'uuid' | 'text' | 'boolean' | 'integer' | 'numeric' | 'timestamptz' | 'jsonb';
export interface BackendColumnDefinition {
  name: string;
  dataType: BackendColumnType;
  nullable: boolean;
}

export type SchemaBackendOp = (
  | { type: 'createTable'; table: { name: string; rlsEnabled: true; columns: BackendColumnDefinition[] } }
  | { type: 'addColumn'; table: string; column: BackendColumnDefinition & { nullable: true } }
  | { type: 'createIndex'; table: string; name: string; columns: string[] }
  | { type: 'createRlsPolicy'; table: string; name: string; command: 'select' | 'insert' | 'update' | 'delete'; role: 'authenticated'; predicate: { type: 'owner'; column: string } }
) & { operationId: string };

export type CapabilityBackendOp = {
  type: 'requireCapability' | 'seedCapability';
  capability: string;
  payload?: Record<string, unknown>;
  operationId?: string;
};

export type BackendOp = CapabilityBackendOp | SchemaBackendOp;

const IDENTIFIER = /^[a-z][a-z0-9_]{0,62}$/;
const COLUMN_TYPES = new Set(['uuid', 'text', 'boolean', 'integer', 'numeric', 'timestamptz', 'jsonb']);
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const identifier = (value: unknown) => typeof value === 'string' && IDENTIFIER.test(value);
const identity = (value: unknown) => typeof value === 'string' && !!value.trim() && value.length <= 160;
const column = (value: unknown): boolean => record(value) && identifier(value.name)
  && typeof value.dataType === 'string' && COLUMN_TYPES.has(value.dataType) && typeof value.nullable === 'boolean'
  && Object.keys(value).every((key) => ['name', 'dataType', 'nullable'].includes(key));

/** Validate the entire batch before side effects, including stable operation identities. */
export function assertBackendOps(ops: unknown, context = 'backendOps'): asserts ops is BackendOp[] {
  if (!Array.isArray(ops)) throw new Error(`[${context}] invalid BackendOp: expected an array`);
  const ids = new Set<string>();
  for (const op of ops) {
    let valid = false;
    if (record(op)) {
      switch (op.type) {
        case 'requireCapability':
        case 'seedCapability':
          valid = identity(op.capability) && (op.payload === undefined || record(op.payload));
          break;
        case 'createTable':
          valid = record(op.table) && identifier(op.table.name) && op.table.rlsEnabled === true
            && Array.isArray(op.table.columns) && op.table.columns.length > 0 && op.table.columns.every(column)
            && new Set(op.table.columns.map((entry) => entry.name)).size === op.table.columns.length
            && Object.keys(op.table).every((key) => ['name', 'rlsEnabled', 'columns'].includes(key));
          break;
        case 'addColumn':
          valid = identifier(op.table) && column(op.column) && record(op.column) && op.column.nullable === true;
          break;
        case 'createIndex':
          valid = identifier(op.table) && identifier(op.name) && Array.isArray(op.columns)
            && op.columns.length > 0 && op.columns.every(identifier) && new Set(op.columns).size === op.columns.length;
          break;
        case 'createRlsPolicy':
          valid = identifier(op.table) && identifier(op.name) && op.role === 'authenticated'
            && ['select', 'insert', 'update', 'delete'].includes(String(op.command))
            && record(op.predicate) && op.predicate.type === 'owner' && identifier(op.predicate.column)
            && Object.keys(op.predicate).every((key) => ['type', 'column'].includes(key));
          break;
      }
      const capabilityOp = op.type === 'requireCapability' || op.type === 'seedCapability';
      const keys: Record<string, string[]> = {
        requireCapability: ['type', 'capability', 'payload', 'operationId'],
        seedCapability: ['type', 'capability', 'payload', 'operationId'],
        createTable: ['type', 'table', 'operationId'],
        addColumn: ['type', 'table', 'column', 'operationId'],
        createIndex: ['type', 'table', 'name', 'columns', 'operationId'],
        createRlsPolicy: ['type', 'table', 'name', 'command', 'role', 'predicate', 'operationId'],
      };
      if (!Object.keys(op).every((key) => keys[String(op.type)]?.includes(key))) valid = false;
      if (!capabilityOp || op.operationId !== undefined) {
        if (!identity(op.operationId) || ids.has(String(op.operationId))) valid = false;
        else ids.add(String(op.operationId));
      }
    }
    if (!valid) throw new Error(`[${context}] invalid BackendOp: unsupported or unsafe typed proposal`);
  }
}
