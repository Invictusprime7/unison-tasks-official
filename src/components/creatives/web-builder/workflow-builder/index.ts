/**
 * Workflow Builder Module
 * 
 * Visual DAG editor for automation workflows.
 */

export { WorkflowBuilder } from './WorkflowBuilder';
export { WorkflowCanvas } from './WorkflowCanvas';
export { WorkflowNode } from './WorkflowNode';
export { WorkflowSidebar } from './WorkflowSidebar';

export type {
  Workflow,
  WorkflowNode as WorkflowNodeType,
  WorkflowEdge,
  NodeType,
  NodeConfig,
  TriggerType,
  ActionType,
  Position,
} from './types';

export {
  NODE_TEMPLATES,
  TRIGGER_OPTIONS,
  ACTION_OPTIONS,
  WAIT_PRESETS,
} from './types';
