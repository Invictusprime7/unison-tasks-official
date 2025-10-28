import { z } from 'zod';

// Task Status Schema
export const taskStatusSchema = z.enum([
  'todo',
  'in_progress',
  'in_review',
  'completed',
  'blocked',
  'cancelled'
]);

// Task Priority Schema
export const taskPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent',
  'critical'
]);

// Task Type Schema
export const taskTypeSchema = z.enum([
  'task',
  'bug',
  'feature',
  'improvement',
  'research',
  'design',
  'review',
  'testing',
  'documentation',
  'meeting'
]);

// Time Tracking Schema
export const timeTrackingSchema = z.object({
  estimated: z.number().min(0).default(0), // in minutes
  logged: z.number().min(0).default(0), // in minutes
  sessions: z.array(z.object({
    id: z.string(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime().optional(),
    duration: z.number().min(0), // in minutes
    description: z.string().optional(),
    userId: z.string(),
  })).default([]),
});

// Task Assignee Schema
export const taskAssigneeSchema = z.object({
  userId: z.string(),
  assignedAt: z.string().datetime(),
  assignedBy: z.string(),
  role: z.enum(['primary', 'secondary', 'reviewer']).default('primary'),
});

// Task Dependency Schema
export const taskDependencySchema = z.object({
  taskId: z.string(),
  type: z.enum(['blocks', 'blocked_by', 'related_to']),
  createdAt: z.string().datetime(),
});

// Task Comment Schema
export const taskCommentSchema = z.object({
  id: z.string(),
  content: z.string().min(1),
  authorId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  parentId: z.string().optional(), // for threaded comments
  attachments: z.array(z.string()).default([]),
  mentions: z.array(z.string()).default([]),
  isEdited: z.boolean().default(false),
  isDeleted: z.boolean().default(false),
});

// Task Attachment Schema
export const taskAttachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  type: z.string(),
  size: z.number(),
  uploadedBy: z.string(),
  uploadedAt: z.string().datetime(),
});

// Task Label Schema
export const taskLabelSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  description: z.string().optional(),
});

// Subtask Schema
export const subtaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  completed: z.boolean().default(false),
  completedAt: z.string().datetime().optional(),
  completedBy: z.string().optional(),
  createdAt: z.string().datetime(),
});

// Task Custom Field Schema
export const taskCustomFieldSchema = z.object({
  fieldId: z.string(),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
});

// Task History Entry Schema
export const taskHistorySchema = z.object({
  id: z.string(),
  field: z.string(),
  oldValue: z.unknown(),
  newValue: z.unknown(),
  changedBy: z.string(),
  changedAt: z.string().datetime(),
  reason: z.string().optional(),
});

// Main Task Schema
export const taskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Task title is required').max(500),
  description: z.string().max(5000).optional(),
  
  // Classification
  type: taskTypeSchema.default('task'),
  status: taskStatusSchema.default('todo'),
  priority: taskPrioritySchema.default('medium'),
  
  // Hierarchy
  projectId: z.string(),
  parentTaskId: z.string().optional(),
  subtasks: z.array(subtaskSchema).default([]),
  
  // Assignment
  assignees: z.array(taskAssigneeSchema).default([]),
  reporterId: z.string(),
  
  // Timing
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  
  // Time Management
  timeTracking: timeTrackingSchema.optional(),
  
  // Relationships
  dependencies: z.array(taskDependencySchema).default([]),
  
  // Content
  labels: z.array(taskLabelSchema).default([]),
  comments: z.array(taskCommentSchema).default([]),
  attachments: z.array(taskAttachmentSchema).default([]),
  customFields: z.array(taskCustomFieldSchema).default([]),
  
  // Progress
  progress: z.number().min(0).max(100).default(0),
  
  // Metadata
  isArchived: z.boolean().default(false),
  isTemplate: z.boolean().default(false),
  templateId: z.string().optional(),
  
  // Activity
  history: z.array(taskHistorySchema).default([]),
  
  // AI Enhancement
  aiSuggestions: z.array(z.object({
    type: z.enum(['priority', 'assignee', 'deadline', 'breakdown']),
    suggestion: z.string(),
    confidence: z.number().min(0).max(1),
    createdAt: z.string().datetime(),
  })).default([]),
});

// Task List Item Schema (for listings and cards)
export const taskListItemSchema = taskSchema.pick({
  id: true,
  title: true,
  description: true,
  type: true,
  status: true,
  priority: true,
  progress: true,
  dueDate: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  projectId: true,
  reporterId: true,
}).extend({
  assigneeCount: z.number().default(0),
  commentCount: z.number().default(0),
  subtaskCount: z.number().default(0),
  attachmentCount: z.number().default(0),
  isOverdue: z.boolean().default(false),
  labels: z.array(taskLabelSchema.pick({ id: true, name: true, color: true })).default([]),
});

// Task Creation Schema
export const createTaskSchema = taskSchema.pick({
  title: true,
  description: true,
  type: true,
  priority: true,
  projectId: true,
  parentTaskId: true,
  assignees: true,
  startDate: true,
  dueDate: true,
  labels: true,
}).partial().required({
  title: true,
  projectId: true,
});

// Task Update Schema
export const updateTaskSchema = taskSchema.partial().omit({
  id: true,
  createdAt: true,
  reporterId: true,
  history: true,
});

// Task Filter Schema
export const taskFilterSchema = z.object({
  status: z.array(taskStatusSchema).optional(),
  priority: z.array(taskPrioritySchema).optional(),
  type: z.array(taskTypeSchema).optional(),
  assigneeIds: z.array(z.string()).optional(),
  labelIds: z.array(z.string()).optional(),
  dueDateRange: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
  }).optional(),
  search: z.string().optional(),
  isOverdue: z.boolean().optional(),
  hasAttachments: z.boolean().optional(),
  projectIds: z.array(z.string()).optional(),
});

// Task Board Column Schema
export const taskBoardColumnSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: taskStatusSchema,
  position: z.number(),
  limit: z.number().min(0).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export type Task = z.infer<typeof taskSchema>;
export type TaskListItem = z.infer<typeof taskListItemSchema>;
export type CreateTask = z.infer<typeof createTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type TaskFilter = z.infer<typeof taskFilterSchema>;
export type TaskComment = z.infer<typeof taskCommentSchema>;
export type TaskAttachment = z.infer<typeof taskAttachmentSchema>;
export type TaskLabel = z.infer<typeof taskLabelSchema>;
export type Subtask = z.infer<typeof subtaskSchema>;
export type TimeTracking = z.infer<typeof timeTrackingSchema>;
export type TaskBoardColumn = z.infer<typeof taskBoardColumnSchema>;