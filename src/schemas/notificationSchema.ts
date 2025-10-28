import { z } from 'zod';

// Notification Type Schema
export const notificationTypeSchema = z.enum([
  'task_assigned',
  'task_completed',
  'task_overdue',
  'task_comment',
  'project_created',
  'project_updated',
  'project_deleted',
  'team_invitation',
  'team_member_added',
  'team_member_removed',
  'file_uploaded',
  'file_shared',
  'template_shared',
  'system_update',
  'billing_update',
  'security_alert',
  'mention',
  'like',
  'follow',
  'custom'
]);

// Notification Priority Schema
export const notificationPrioritySchema = z.enum([
  'low',
  'medium', 
  'high',
  'critical'
]);

// Notification Status Schema
export const notificationStatusSchema = z.enum([
  'unread',
  'read',
  'archived',
  'deleted'
]);

// Notification Channel Schema
export const notificationChannelSchema = z.enum([
  'in_app',
  'email',
  'push',
  'sms',
  'webhook'
]);

// Notification Action Schema
export const notificationActionSchema = z.object({
  label: z.string(),
  type: z.enum(['primary', 'secondary', 'danger']),
  action: z.string(), // URL or action identifier
  data: z.record(z.string(), z.unknown()).optional(),
});

// Notification Metadata Schema
export const notificationMetadataSchema = z.object({
  taskId: z.string().optional(),
  projectId: z.string().optional(),
  teamId: z.string().optional(),
  fileId: z.string().optional(),
  templateId: z.string().optional(),
  commentId: z.string().optional(),
  userId: z.string().optional(),
  
  // Additional context data
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  changes: z.record(z.string(), z.unknown()).optional(),
  
  // UI specific data
  icon: z.string().optional(),
  image: z.string().url().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  
  // Rich content
  preview: z.string().optional(),
  thumbnail: z.string().url().optional(),
});

// Main Notification Schema
export const notificationSchema = z.object({
  id: z.string().optional(),
  
  // Content
  title: z.string().min(1, 'Title is required').max(200),
  message: z.string().max(1000).optional(),
  
  // Classification
  type: notificationTypeSchema,
  priority: notificationPrioritySchema.default('medium'),
  category: z.string().optional(), // Custom category for grouping
  
  // Recipients
  userId: z.string(), // Primary recipient
  senderId: z.string().optional(), // Who triggered the notification
  
  // Status & State
  status: notificationStatusSchema.default('unread'),
  channels: z.array(notificationChannelSchema).default(['in_app']),
  
  // Metadata & Context
  metadata: notificationMetadataSchema.optional(),
  
  // Interaction
  actions: z.array(notificationActionSchema).default([]),
  
  // Delivery
  scheduledFor: z.string().datetime().optional(),
  deliveredAt: z.record(notificationChannelSchema, z.string().datetime()).optional(),
  
  // Engagement
  readAt: z.string().datetime().optional(),
  clickedAt: z.string().datetime().optional(),
  archivedAt: z.string().datetime().optional(),
  
  // Timestamps
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  
  // Settings
  isGroupable: z.boolean().default(true), // Can be grouped with similar notifications
  isActionable: z.boolean().default(false), // Has interactive actions
  requiresConfirmation: z.boolean().default(false), // Needs explicit acknowledgment
});

// Notification Group Schema
export const notificationGroupSchema = z.object({
  id: z.string().optional(),
  type: notificationTypeSchema,
  title: z.string(),
  summary: z.string(), // e.g., "5 new comments on your project"
  count: z.number().min(1),
  userId: z.string(),
  notificationIds: z.array(z.string()),
  
  // Latest notification data
  latestAt: z.string().datetime(),
  latestSender: z.string().optional(),
  
  // Status
  status: notificationStatusSchema.default('unread'),
  
  // Metadata from the group
  metadata: notificationMetadataSchema.optional(),
  
  // Timestamps
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Notification Preference Schema
export const notificationPreferenceSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  type: notificationTypeSchema,
  
  // Channel preferences
  inApp: z.boolean().default(true),
  email: z.boolean().default(true),
  push: z.boolean().default(false),
  sms: z.boolean().default(false),
  
  // Timing preferences
  immediate: z.boolean().default(true),
  digest: z.boolean().default(false),
  digestFrequency: z.enum(['hourly', 'daily', 'weekly']).default('daily'),
  
  // Quiet hours
  quietHoursEnabled: z.boolean().default(false),
  quietHoursStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).default('22:00'), // HH:MM format
  quietHoursEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).default('08:00'),
  
  // Filtering
  priority: z.array(notificationPrioritySchema).default(['medium', 'high', 'critical']),
  
  // Timestamps
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Notification Template Schema
export const notificationTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  type: notificationTypeSchema,
  
  // Template content
  title: z.string(),
  message: z.string().optional(),
  
  // Template variables
  variables: z.array(z.object({
    name: z.string(),
    type: z.enum(['string', 'number', 'date', 'url', 'user', 'project', 'task']),
    required: z.boolean().default(false),
    description: z.string().optional(),
  })).default([]),
  
  // Channel specific templates
  channels: z.object({
    inApp: z.object({
      title: z.string().optional(),
      message: z.string().optional(),
      actions: z.array(notificationActionSchema).default([]),
    }).optional(),
    email: z.object({
      subject: z.string().optional(),
      html: z.string().optional(),
      text: z.string().optional(),
    }).optional(),
    push: z.object({
      title: z.string().optional(),
      body: z.string().optional(),
      badge: z.number().optional(),
    }).optional(),
  }).optional(),
  
  // Settings
  priority: notificationPrioritySchema.default('medium'),
  isActive: z.boolean().default(true),
  
  // Timestamps
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Notification Subscription Schema
export const notificationSubscriptionSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  
  // Subscription details
  endpoint: z.string().url(),
  p256dh: z.string(),
  auth: z.string(),
  
  // Device info
  userAgent: z.string().optional(),
  deviceType: z.enum(['desktop', 'mobile', 'tablet']).optional(),
  
  // Status
  isActive: z.boolean().default(true),
  
  // Timestamps
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  lastUsedAt: z.string().datetime().optional(),
});

// Notification List Item Schema
export const notificationListItemSchema = notificationSchema.pick({
  id: true,
  title: true,
  message: true,
  type: true,
  priority: true,
  status: true,
  senderId: true,
  readAt: true,
  createdAt: true,
}).extend({
  senderName: z.string().optional(),
  senderAvatar: z.string().url().optional(),
  isGrouped: z.boolean().default(false),
  groupCount: z.number().optional(),
  timeAgo: z.string().optional(),
});

// Notification Filter Schema
export const notificationFilterSchema = z.object({
  types: z.array(notificationTypeSchema).optional(),
  priorities: z.array(notificationPrioritySchema).optional(),
  statuses: z.array(notificationStatusSchema).optional(),
  senderIds: z.array(z.string()).optional(),
  dateRange: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
  }).optional(),
  search: z.string().optional(),
  hasActions: z.boolean().optional(),
  projectIds: z.array(z.string()).optional(),
  taskIds: z.array(z.string()).optional(),
});

// Bulk Notification Action Schema
export const bulkNotificationActionSchema = z.object({
  notificationIds: z.array(z.string()).min(1),
  action: z.enum(['mark_read', 'mark_unread', 'archive', 'delete']),
});

export type Notification = z.infer<typeof notificationSchema>;
export type NotificationGroup = z.infer<typeof notificationGroupSchema>;
export type NotificationPreference = z.infer<typeof notificationPreferenceSchema>;
export type NotificationTemplate = z.infer<typeof notificationTemplateSchema>;
export type NotificationSubscription = z.infer<typeof notificationSubscriptionSchema>;
export type NotificationListItem = z.infer<typeof notificationListItemSchema>;
export type NotificationFilter = z.infer<typeof notificationFilterSchema>;
export type BulkNotificationAction = z.infer<typeof bulkNotificationActionSchema>;
export type NotificationAction = z.infer<typeof notificationActionSchema>;
export type NotificationMetadata = z.infer<typeof notificationMetadataSchema>;