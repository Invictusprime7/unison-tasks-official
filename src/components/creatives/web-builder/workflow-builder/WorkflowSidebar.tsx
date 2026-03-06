/**
 * WorkflowSidebar Component
 * 
 * Configuration panel for the selected workflow node.
 * Shows different options based on node type.
 */

import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type {
  WorkflowNode,
  NodeConfig,
  TriggerType,
  ActionType,
} from './types';
import {
  NODE_TEMPLATES,
  TRIGGER_OPTIONS,
  ACTION_OPTIONS,
  WAIT_PRESETS,
} from './types';

interface WorkflowSidebarProps {
  node: WorkflowNode | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  onDeleteNode: (nodeId: string) => void;
}

export function WorkflowSidebar({
  node,
  onClose,
  onUpdateNode,
  onDeleteNode,
}: WorkflowSidebarProps) {
  if (!node) {
    return (
      <div className="w-72 border-l bg-card p-4 flex items-center justify-center">
        <p className="text-sm text-muted-foreground text-center">
          Select a node to configure it
        </p>
      </div>
    );
  }

  const template = NODE_TEMPLATES[node.type];

  const updateConfig = (updates: Partial<NodeConfig>) => {
    onUpdateNode(node.id, {
      config: { ...node.config, ...updates },
    });
  };

  const updateLabel = (label: string) => {
    onUpdateNode(node.id, { label });
  };

  return (
    <div className="w-72 border-l bg-card flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: template.color + '15' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ backgroundColor: template.color }}
          >
            <span className="text-white text-xs font-bold">
              {template.label[0]}
            </span>
          </div>
          <span className="font-medium text-sm">{template.label} Node</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Node Label */}
          <div className="space-y-2">
            <Label htmlFor="node-label">Label</Label>
            <Input
              id="node-label"
              value={node.label}
              onChange={(e) => updateLabel(e.target.value)}
              placeholder="Enter step name"
            />
          </div>

          <Separator />

          {/* Type-specific configuration */}
          {node.type === 'trigger' && (
            <TriggerConfig
              config={node.config}
              onUpdate={updateConfig}
            />
          )}

          {node.type === 'action' && (
            <ActionConfig
              config={node.config}
              onUpdate={updateConfig}
            />
          )}

          {node.type === 'wait' && (
            <WaitConfig
              config={node.config}
              onUpdate={updateConfig}
            />
          )}

          {node.type === 'condition' && (
            <ConditionConfig
              config={node.config}
              onUpdate={updateConfig}
            />
          )}

          {node.type === 'goal' && (
            <GoalConfig
              config={node.config}
              onUpdate={updateConfig}
            />
          )}
        </div>
      </ScrollArea>

      {/* Delete button */}
      <div className="p-4 border-t">
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => onDeleteNode(node.id)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Node
        </Button>
      </div>
    </div>
  );
}

// ============ TYPE-SPECIFIC CONFIG COMPONENTS ============

function TriggerConfig({
  config,
  onUpdate,
}: {
  config: NodeConfig;
  onUpdate: (updates: Partial<NodeConfig>) => void;
}) {
  // Group triggers by category
  const groupedTriggers = TRIGGER_OPTIONS.reduce((acc, trigger) => {
    if (!acc[trigger.category]) {
      acc[trigger.category] = [];
    }
    acc[trigger.category].push(trigger);
    return acc;
  }, {} as Record<string, typeof TRIGGER_OPTIONS>);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Trigger Event</Label>
        <Select
          value={config.triggerType || ''}
          onValueChange={(value) => onUpdate({ triggerType: value as TriggerType })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select trigger" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(groupedTriggers).map(([category, triggers]) => (
              <React.Fragment key={category}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  {category}
                </div>
                {triggers.map((trigger) => (
                  <SelectItem key={trigger.value} value={trigger.value}>
                    {trigger.label}
                  </SelectItem>
                ))}
              </React.Fragment>
            ))}
          </SelectContent>
        </Select>
      </div>

      {config.triggerType === 'deal.stage_changed' && (
        <div className="space-y-2">
          <Label>Stage (optional)</Label>
          <Input
            placeholder="e.g., 'Closed Won'"
            value={(config.triggerConditions?.stage as string) || ''}
            onChange={(e) =>
              onUpdate({
                triggerConditions: {
                  ...config.triggerConditions,
                  stage: e.target.value,
                },
              })
            }
          />
          <p className="text-xs text-muted-foreground">
            Only trigger when moved to this stage
          </p>
        </div>
      )}

      {config.triggerType === 'form.submitted' && (
        <div className="space-y-2">
          <Label>Form Name (optional)</Label>
          <Input
            placeholder="e.g., 'Contact Form'"
            value={(config.triggerConditions?.formName as string) || ''}
            onChange={(e) =>
              onUpdate({
                triggerConditions: {
                  ...config.triggerConditions,
                  formName: e.target.value,
                },
              })
            }
          />
        </div>
      )}
    </div>
  );
}

function ActionConfig({
  config,
  onUpdate,
}: {
  config: NodeConfig;
  onUpdate: (updates: Partial<NodeConfig>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Action Type</Label>
        <Select
          value={config.actionType || ''}
          onValueChange={(value) => onUpdate({ actionType: value as ActionType })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select action" />
          </SelectTrigger>
          <SelectContent>
            {ACTION_OPTIONS.map((action) => (
              <SelectItem key={action.value} value={action.value}>
                {action.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Email config */}
      {config.actionType === 'send_email' && (
        <>
          <div className="space-y-2">
            <Label>Recipient</Label>
            <Input
              placeholder="{{contact.email}}"
              value={config.recipient || ''}
              onChange={(e) => onUpdate({ recipient: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Use {'{{contact.email}}'} for dynamic recipient
            </p>
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              placeholder="Email subject"
              value={config.subject || ''}
              onChange={(e) => onUpdate({ subject: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Template</Label>
            <Select
              value={config.template || ''}
              onValueChange={(value) => onUpdate({ template: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="booking_confirm_email">Booking Confirmation</SelectItem>
                <SelectItem value="reminder_email">Reminder</SelectItem>
                <SelectItem value="follow_up_email">Follow Up</SelectItem>
                <SelectItem value="thank_you_email">Thank You</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {config.template === 'custom' && (
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea
                placeholder="Email body"
                value={config.body || ''}
                onChange={(e) => onUpdate({ body: e.target.value })}
                rows={4}
              />
            </div>
          )}
        </>
      )}

      {/* SMS config */}
      {config.actionType === 'send_sms' && (
        <>
          <div className="space-y-2">
            <Label>Recipient</Label>
            <Input
              placeholder="{{contact.phone}}"
              value={config.recipient || ''}
              onChange={(e) => onUpdate({ recipient: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Template</Label>
            <Select
              value={config.template || ''}
              onValueChange={(value) => onUpdate({ template: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="booking_confirm">Booking Confirmation</SelectItem>
                <SelectItem value="reminder_24h">24-Hour Reminder</SelectItem>
                <SelectItem value="review_request">Review Request</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {config.template === 'custom' && (
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="SMS message"
                value={config.body || ''}
                onChange={(e) => onUpdate({ body: e.target.value })}
                rows={3}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground">
                {160 - (config.body?.length || 0)} characters remaining
              </p>
            </div>
          )}
        </>
      )}

      {/* Create task config */}
      {config.actionType === 'create_task' && (
        <div className="space-y-2">
          <Label>Task Title</Label>
          <Input
            placeholder="Follow up with {{contact.name}}"
            value={config.taskTitle || ''}
            onChange={(e) => onUpdate({ taskTitle: e.target.value })}
          />
        </div>
      )}

      {/* Webhook config */}
      {config.actionType === 'trigger_webhook' && (
        <div className="space-y-2">
          <Label>Webhook URL</Label>
          <Input
            placeholder="https://..."
            value={config.webhookUrl || ''}
            onChange={(e) => onUpdate({ webhookUrl: e.target.value })}
          />
        </div>
      )}

      {/* Update field config */}
      {config.actionType === 'update_field' && (
        <>
          <div className="space-y-2">
            <Label>Field Name</Label>
            <Input
              placeholder="e.g., status"
              value={config.fieldName || ''}
              onChange={(e) => onUpdate({ fieldName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>New Value</Label>
            <Input
              placeholder="e.g., contacted"
              value={config.fieldValue || ''}
              onChange={(e) => onUpdate({ fieldValue: e.target.value })}
            />
          </div>
        </>
      )}

      {/* Tag config */}
      {(config.actionType === 'add_tag' || config.actionType === 'remove_tag') && (
        <div className="space-y-2">
          <Label>Tag Name</Label>
          <Input
            placeholder="e.g., VIP"
            value={config.tagName || ''}
            onChange={(e) => onUpdate({ tagName: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}

function WaitConfig({
  config,
  onUpdate,
}: {
  config: NodeConfig;
  onUpdate: (updates: Partial<NodeConfig>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Wait Duration</Label>
        <Select
          value={config.waitDuration || ''}
          onValueChange={(value) => onUpdate({ waitDuration: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            {WAIT_PRESETS.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Calculate From</Label>
        <Select
          value={config.waitCalculateFrom || 'trigger'}
          onValueChange={(value) => onUpdate({ waitCalculateFrom: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trigger">Trigger time</SelectItem>
            <SelectItem value="booking.scheduledAt">Booking date</SelectItem>
            <SelectItem value="deal.expectedCloseDate">Expected close date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Direction</Label>
        <Select
          value={config.waitDirection || 'after'}
          onValueChange={(value) => onUpdate({ waitDirection: value as 'before' | 'after' })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="after">After</SelectItem>
            <SelectItem value="before">Before</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Wait until {config.waitDuration || '...'} {config.waitDirection || 'after'} {config.waitCalculateFrom || 'trigger'}
        </p>
      </div>
    </div>
  );
}

function ConditionConfig({
  config,
  onUpdate,
}: {
  config: NodeConfig;
  onUpdate: (updates: Partial<NodeConfig>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Field to Check</Label>
        <Input
          placeholder="e.g., deal.value"
          value={config.conditionField || ''}
          onChange={(e) => onUpdate({ conditionField: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Operator</Label>
        <Select
          value={config.conditionOperator || ''}
          onValueChange={(value) =>
            onUpdate({ conditionOperator: value as NodeConfig['conditionOperator'] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equals">Equals</SelectItem>
            <SelectItem value="not_equals">Not Equals</SelectItem>
            <SelectItem value="contains">Contains</SelectItem>
            <SelectItem value="greater_than">Greater Than</SelectItem>
            <SelectItem value="less_than">Less Than</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Value</Label>
        <Input
          placeholder="e.g., 1000"
          value={config.conditionValue || ''}
          onChange={(e) => onUpdate({ conditionValue: e.target.value })}
        />
      </div>

      <div className="text-xs text-muted-foreground bg-muted rounded p-2">
        <strong>True path:</strong> Green output (left)
        <br />
        <strong>False path:</strong> Red output (right)
      </div>
    </div>
  );
}

function GoalConfig({
  config,
  onUpdate,
}: {
  config: NodeConfig;
  onUpdate: (updates: Partial<NodeConfig>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Goal Description</Label>
        <Textarea
          placeholder="e.g., Customer completes purchase"
          value={config.goalDescription || ''}
          onChange={(e) => onUpdate({ goalDescription: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Goal Metric (optional)</Label>
        <Input
          placeholder="e.g., conversion_rate"
          value={config.goalMetric || ''}
          onChange={(e) => onUpdate({ goalMetric: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Track this metric when the goal is reached
        </p>
      </div>
    </div>
  );
}
