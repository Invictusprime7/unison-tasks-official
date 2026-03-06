/**
 * WorkflowNode Component
 * 
 * Draggable node representing a step in the workflow.
 * Supports: trigger, action, condition, wait, goal types.
 */

import React from 'react';
import {
  Zap,
  Play,
  GitBranch,
  Clock,
  Target,
  Mail,
  MessageSquare,
  CheckSquare,
  Edit,
  Tag,
  Globe,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkflowNode as WorkflowNodeType, NodeType, ActionType } from './types';
import { NODE_TEMPLATES } from './types';

interface WorkflowNodeProps {
  node: WorkflowNodeType;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onDragStart: (nodeId: string, e: React.MouseEvent) => void;
  onConnect: (nodeId: string) => void;
  scale?: number;
}

const NODE_ICONS: Record<NodeType, React.ComponentType<{ className?: string }>> = {
  trigger: Zap,
  action: Play,
  condition: GitBranch,
  wait: Clock,
  goal: Target,
};

const ACTION_ICONS: Record<ActionType, React.ComponentType<{ className?: string }>> = {
  send_email: Mail,
  send_sms: MessageSquare,
  create_task: CheckSquare,
  update_field: Edit,
  add_tag: Tag,
  remove_tag: Tag,
  trigger_webhook: Globe,
  create_deal: CheckSquare,
  update_deal_stage: Play,
  assign_user: CheckSquare,
  add_note: Edit,
};

export function WorkflowNode({
  node,
  isSelected,
  onSelect,
  onDragStart,
  onConnect,
  scale = 1,
}: WorkflowNodeProps) {
  const template = NODE_TEMPLATES[node.type];
  const Icon = NODE_ICONS[node.type];
  
  // Get specific action icon if this is an action node
  const ActionIcon = node.type === 'action' && node.config.actionType
    ? ACTION_ICONS[node.config.actionType]
    : null;

  const getNodeDescription = () => {
    switch (node.type) {
      case 'trigger':
        return node.config.triggerType?.replace(/[._]/g, ' ') || 'Select trigger';
      case 'action':
        return node.config.actionType?.replace(/_/g, ' ') || 'Select action';
      case 'wait':
        return node.config.waitDuration || 'Set duration';
      case 'condition':
        return node.config.conditionField || 'Set condition';
      case 'goal':
        return node.config.goalDescription || 'Set goal';
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(
        'absolute flex flex-col rounded-lg border-2 bg-card shadow-lg cursor-pointer transition-all select-none',
        'min-w-[180px] max-w-[220px]',
        isSelected
          ? 'border-primary ring-2 ring-primary/30 shadow-xl'
          : 'border-border hover:border-primary/50 hover:shadow-xl'
      )}
      style={{
        left: node.position.x * scale,
        top: node.position.y * scale,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-t-md cursor-grab active:cursor-grabbing"
        style={{ backgroundColor: template.color + '20' }}
        onMouseDown={(e) => onDragStart(node.id, e)}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
        <div
          className="flex items-center justify-center w-6 h-6 rounded"
          style={{ backgroundColor: template.color }}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {template.label}
        </span>
      </div>

      {/* Body */}
      <div className="px-3 py-3 space-y-1">
        <div className="font-medium text-sm text-foreground truncate">
          {node.label}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {ActionIcon && <ActionIcon className="w-3 h-3" />}
          <span className="truncate capitalize">{getNodeDescription()}</span>
        </div>
      </div>

      {/* Connection Points */}
      {/* Input connector (top) - not shown for triggers */}
      {node.type !== 'trigger' && (
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-muted border-2 border-border hover:bg-primary hover:border-primary cursor-pointer transition-colors"
          title="Input"
        />
      )}

      {/* Output connector(s) (bottom) */}
      {node.type === 'condition' ? (
        // Condition has two outputs: true and false
        <>
          <div
            className="absolute -bottom-2 left-1/4 -translate-x-1/2 w-4 h-4 rounded-full bg-green-500 border-2 border-green-600 hover:scale-110 cursor-pointer transition-transform"
            title="True"
            onClick={(e) => {
              e.stopPropagation();
              onConnect(node.id);
            }}
          />
          <div
            className="absolute -bottom-2 left-3/4 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 border-2 border-red-600 hover:scale-110 cursor-pointer transition-transform"
            title="False"
            onClick={(e) => {
              e.stopPropagation();
              onConnect(node.id);
            }}
          />
        </>
      ) : node.type !== 'goal' ? (
        // Regular single output
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-muted border-2 border-border hover:bg-primary hover:border-primary cursor-pointer transition-colors"
          title="Output"
          onClick={(e) => {
            e.stopPropagation();
            onConnect(node.id);
          }}
        />
      ) : null}

      {/* Start/End badges */}
      {node.isStart && (
        <div className="absolute -top-3 -right-3 px-1.5 py-0.5 text-[10px] font-bold uppercase bg-green-500 text-white rounded">
          Start
        </div>
      )}
      {node.isEnd && (
        <div className="absolute -top-3 -right-3 px-1.5 py-0.5 text-[10px] font-bold uppercase bg-red-500 text-white rounded">
          End
        </div>
      )}
    </div>
  );
}
