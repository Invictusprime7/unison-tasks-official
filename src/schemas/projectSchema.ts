import { z } from 'zod';

// Project Status Schema
export const projectStatusSchema = z.enum([
  'draft',
  'active',
  'on_hold',
  'completed',
  'archived',
  'cancelled'
]);

// Project Priority Schema
export const projectPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent',
  'critical'
]);

// Project Category Schema
export const projectCategorySchema = z.enum([
  'design',
  'development',
  'marketing',
  'research',
  'planning',
  'content',
  'other'
]);

// Team Member Role Schema
export const teamRoleSchema = z.enum([
  'owner',
  'admin',
  'editor',
  'viewer',
  'contributor'
]);

// Project Settings Schema
export const projectSettingsSchema = z.object({
  allowPublicView: z.boolean().default(false),
  requireApproval: z.boolean().default(false),
  autoAssign: z.boolean().default(true),
  notificationsEnabled: z.boolean().default(true),
  deadlineReminders: z.boolean().default(true),
  trackTime: z.boolean().default(false),
  customFields: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['text', 'number', 'date', 'select', 'boolean']),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(),
  })).default([]),
});

// Team Member Schema
export const teamMemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  projectId: z.string(),
  role: teamRoleSchema,
  joinedAt: z.string().datetime(),
  permissions: z.object({
    canEdit: z.boolean().default(false),
    canDelete: z.boolean().default(false),
    canInvite: z.boolean().default(false),
    canManageSettings: z.boolean().default(false),
    canExport: z.boolean().default(true),
  }).default({}),
});

// Project Timeline Event Schema
export const timelineEventSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  type: z.enum([
    'created',
    'updated',
    'task_added',
    'task_completed',
    'member_joined',
    'member_left',
    'milestone_reached',
    'deadline_missed',
    'status_changed',
    'comment_added'
  ]),
  description: z.string(),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.string().datetime(),
  createdBy: z.string(),
});

// Project Analytics Schema
export const projectAnalyticsSchema = z.object({
  totalTasks: z.number().default(0),
  completedTasks: z.number().default(0),
  overdueTasks: z.number().default(0),
  activeMembersCount: z.number().default(0),
  averageTaskDuration: z.number().default(0),
  completionRate: z.number().min(0).max(100).default(0),
  timeSpent: z.number().default(0),
  lastActivity: z.string().datetime().optional(),
});

// Main Project Schema
export const projectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Project name is required').max(200),
  description: z.string().max(2000).optional(),
  category: projectCategorySchema,
  status: projectStatusSchema.default('draft'),
  priority: projectPrioritySchema.default('medium'),
  
  // Dates
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  
  // User Management
  ownerId: z.string(),
  teamMembers: z.array(teamMemberSchema).default([]),
  
  // Configuration
  settings: projectSettingsSchema.default({}),
  
  // Progress Tracking
  progress: z.number().min(0).max(100).default(0),
  analytics: projectAnalyticsSchema.optional(),
  
  // Visual Elements
  coverImage: z.string().url().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3B82F6'),
  icon: z.string().optional(),
  
  // Content
  tags: z.array(z.string()).default([]),
  timeline: z.array(timelineEventSchema).default([]),
  
  // Metadata
  isTemplate: z.boolean().default(false),
  isPublic: z.boolean().default(false),
  isFavorite: z.boolean().default(false),
  isArchived: z.boolean().default(false),
});

// Project List Item Schema (for listings)
export const projectListItemSchema = projectSchema.pick({
  id: true,
  name: true,
  description: true,
  category: true,
  status: true,
  priority: true,
  progress: true,
  coverImage: true,
  color: true,
  icon: true,
  tags: true,
  createdAt: true,
  updatedAt: true,
  ownerId: true,
  isPublic: true,
  isFavorite: true,
}).extend({
  taskCount: z.number().default(0),
  memberCount: z.number().default(0),
  lastActivity: z.string().datetime().optional(),
});

// Project Creation Schema
export const createProjectSchema = projectSchema.pick({
  name: true,
  description: true,
  category: true,
  startDate: true,
  endDate: true,
  coverImage: true,
  color: true,
  icon: true,
  tags: true,
  isPublic: true,
}).partial().required({
  name: true,
  category: true,
});

// Project Update Schema
export const updateProjectSchema = projectSchema.partial().omit({
  id: true,
  ownerId: true,
  createdAt: true,
});

export type Project = z.infer<typeof projectSchema>;
export type ProjectListItem = z.infer<typeof projectListItemSchema>;
export type CreateProject = z.infer<typeof createProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type ProjectSettings = z.infer<typeof projectSettingsSchema>;
export type TimelineEvent = z.infer<typeof timelineEventSchema>;
export type ProjectAnalytics = z.infer<typeof projectAnalyticsSchema>;