/**
 * Workflow Builder Types
 * 
 * Type definitions for the visual workflow DAG editor.
 */

export type NodeType = 'trigger' | 'action' | 'condition' | 'wait' | 'goal';

export interface Position {
  x: number;
  y: number;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  position: Position;
  config: NodeConfig;
  isStart?: boolean;
  isEnd?: boolean;
}

export interface NodeConfig {
  // Trigger config
  triggerType?: TriggerType;
  triggerConditions?: Record<string, unknown>;

  // Action config
  actionType?: ActionType;
  template?: string;
  recipient?: string;
  subject?: string;
  body?: string;
  webhookUrl?: string;
  taskTitle?: string;
  fieldName?: string;
  fieldValue?: string;
  tagName?: string;

  // Wait config
  waitDuration?: string; // '1h', '24h', '7d'
  waitCalculateFrom?: string;
  waitDirection?: 'before' | 'after';

  // Condition config
  conditionField?: string;
  conditionOperator?: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  conditionValue?: string;

  // Goal config
  goalDescription?: string;
  goalMetric?: string;
}

export type TriggerType =
  | 'booking.create'
  | 'booking.confirmed'
  | 'booking.cancelled'
  | 'lead.capture'
  | 'lead.status_changed'
  | 'deal.created'
  | 'deal.stage_changed'
  | 'deal.won'
  | 'deal.lost'
  | 'form.submitted'
  | 'job.completed'
  | 'payment.received'
  | 'contact.created'
  | 'contact.updated'
  | 'manual';

export type ActionType =
  | 'send_email'
  | 'send_sms'
  | 'create_task'
  | 'update_field'
  | 'add_tag'
  | 'remove_tag'
  | 'trigger_webhook'
  | 'create_deal'
  | 'update_deal_stage'
  | 'assign_user'
  | 'add_note';

export interface WorkflowEdge {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle?: 'true' | 'false'; // For condition nodes
  label?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  projectId?: string;
  industry?: string;
}

// UI State
export interface WorkflowBuilderState {
  workflow: Workflow | null;
  selectedNodeId: string | null;
  isDragging: boolean;
  dragOffset: Position;
  zoom: number;
  panOffset: Position;
  isConnecting: boolean;
  connectingFrom: string | null;
}

// Node Templates for Quick Add
export const NODE_TEMPLATES: Record<NodeType, { label: string; icon: string; color: string }> = {
  trigger: { label: 'Trigger', icon: 'Zap', color: '#10b981' },
  action: { label: 'Action', icon: 'Play', color: '#3b82f6' },
  condition: { label: 'Condition', icon: 'GitBranch', color: '#f59e0b' },
  wait: { label: 'Wait', icon: 'Clock', color: '#8b5cf6' },
  goal: { label: 'Goal', icon: 'Target', color: '#ec4899' },
};

export const TRIGGER_OPTIONS: { value: TriggerType; label: string; category: string }[] = [
  { value: 'booking.create', label: 'Booking Created', category: 'Booking' },
  { value: 'booking.confirmed', label: 'Booking Confirmed', category: 'Booking' },
  { value: 'booking.cancelled', label: 'Booking Cancelled', category: 'Booking' },
  { value: 'lead.capture', label: 'New Lead Captured', category: 'Lead' },
  { value: 'lead.status_changed', label: 'Lead Status Changed', category: 'Lead' },
  { value: 'deal.created', label: 'Deal Created', category: 'Deal' },
  { value: 'deal.stage_changed', label: 'Deal Stage Changed', category: 'Deal' },
  { value: 'deal.won', label: 'Deal Won', category: 'Deal' },
  { value: 'deal.lost', label: 'Deal Lost', category: 'Deal' },
  { value: 'form.submitted', label: 'Form Submitted', category: 'Form' },
  { value: 'job.completed', label: 'Job Completed', category: 'Job' },
  { value: 'payment.received', label: 'Payment Received', category: 'Payment' },
  { value: 'contact.created', label: 'Contact Created', category: 'Contact' },
  { value: 'contact.updated', label: 'Contact Updated', category: 'Contact' },
  { value: 'manual', label: 'Manual Trigger', category: 'Other' },
];

export const ACTION_OPTIONS: { value: ActionType; label: string; icon: string }[] = [
  { value: 'send_email', label: 'Send Email', icon: 'Mail' },
  { value: 'send_sms', label: 'Send SMS', icon: 'MessageSquare' },
  { value: 'create_task', label: 'Create Task', icon: 'CheckSquare' },
  { value: 'update_field', label: 'Update Field', icon: 'Edit' },
  { value: 'add_tag', label: 'Add Tag', icon: 'Tag' },
  { value: 'remove_tag', label: 'Remove Tag', icon: 'X' },
  { value: 'trigger_webhook', label: 'Trigger Webhook', icon: 'Globe' },
  { value: 'create_deal', label: 'Create Deal', icon: 'DollarSign' },
  { value: 'update_deal_stage', label: 'Update Deal Stage', icon: 'ArrowRight' },
  { value: 'assign_user', label: 'Assign User', icon: 'User' },
  { value: 'add_note', label: 'Add Note', icon: 'FileText' },
];

export const WAIT_PRESETS = [
  { value: '5m', label: '5 minutes' },
  { value: '30m', label: '30 minutes' },
  { value: '1h', label: '1 hour' },
  { value: '4h', label: '4 hours' },
  { value: '24h', label: '24 hours' },
  { value: '48h', label: '48 hours' },
  { value: '7d', label: '7 days' },
  { value: '14d', label: '14 days' },
  { value: '30d', label: '30 days' },
];
