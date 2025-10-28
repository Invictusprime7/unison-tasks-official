import { z } from 'zod';

// User Role Schema
export const userRoleSchema = z.enum([
  'admin',
  'manager',
  'designer',
  'developer',
  'client',
  'viewer'
]);

// User Status Schema
export const userStatusSchema = z.enum([
  'active',
  'inactive',
  'pending',
  'suspended',
  'deleted'
]);

// User Subscription Schema
export const userSubscriptionSchema = z.object({
  plan: z.enum(['free', 'pro', 'team', 'enterprise']),
  status: z.enum(['active', 'canceled', 'past_due', 'trialing', 'incomplete']),
  currentPeriodStart: z.string().datetime(),
  currentPeriodEnd: z.string().datetime(),
  cancelAtPeriodEnd: z.boolean().default(false),
  trialEnd: z.string().datetime().optional(),
  customerId: z.string().optional(),
  subscriptionId: z.string().optional(),
});

// User Preferences Schema
export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).default('MM/DD/YYYY'),
  timeFormat: z.enum(['12h', '24h']).default('12h'),
  
  // Notification Preferences
  notifications: z.object({
    email: z.object({
      taskAssigned: z.boolean().default(true),
      taskCompleted: z.boolean().default(true),
      projectUpdates: z.boolean().default(true),
      teamInvitations: z.boolean().default(true),
      systemUpdates: z.boolean().default(false),
      marketing: z.boolean().default(false),
    }),
    push: z.object({
      taskAssigned: z.boolean().default(true),
      taskCompleted: z.boolean().default(false),
      projectUpdates: z.boolean().default(true),
      teamInvitations: z.boolean().default(true),
      systemUpdates: z.boolean().default(false),
    }),
    inApp: z.object({
      taskAssigned: z.boolean().default(true),
      taskCompleted: z.boolean().default(true),
      projectUpdates: z.boolean().default(true),
      teamInvitations: z.boolean().default(true),
      comments: z.boolean().default(true),
      mentions: z.boolean().default(true),
    }),
  }),
  
  // UI Preferences
  ui: z.object({
    sidebarCollapsed: z.boolean().default(false),
    compactMode: z.boolean().default(false),
    showAvatars: z.boolean().default(true),
    showTimestamps: z.boolean().default(true),
    autoSave: z.boolean().default(true),
    keyboardShortcuts: z.boolean().default(true),
  }),
  
  // Design Studio Preferences
  designStudio: z.object({
    defaultUnit: z.enum(['px', 'rem', 'em', '%']).default('px'),
    snapToGrid: z.boolean().default(true),
    gridSize: z.number().default(8),
    showRulers: z.boolean().default(true),
    showGuides: z.boolean().default(true),
    autoSaveInterval: z.number().default(30), // seconds
    recentColors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).max(10).default([]),
    recentFonts: z.array(z.string()).max(10).default([]),
  }),
  
  // Dashboard Preferences
  dashboard: z.object({
    defaultView: z.enum(['grid', 'list', 'kanban']).default('grid'),
    itemsPerPage: z.number().min(5).max(100).default(20),
    showCompleted: z.boolean().default(false),
    groupBy: z.enum(['project', 'priority', 'assignee', 'status', 'none']).default('project'),
    sortBy: z.enum(['created', 'updated', 'dueDate', 'priority', 'name']).default('updated'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

// User Social Links Schema
export const userSocialLinksSchema = z.object({
  website: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  twitter: z.string().url().optional(),
  github: z.string().url().optional(),
  dribbble: z.string().url().optional(),
  behance: z.string().url().optional(),
  instagram: z.string().url().optional(),
});

// User Activity Schema
export const userActivitySchema = z.object({
  lastLoginAt: z.string().datetime().optional(),
  lastActiveAt: z.string().datetime().optional(),
  loginCount: z.number().default(0),
  projectsCreated: z.number().default(0),
  tasksCompleted: z.number().default(0),
  templatesCreated: z.number().default(0),
  collaborations: z.number().default(0),
  totalTimeSpent: z.number().default(0), // in minutes
});

// User Skills Schema
export const userSkillSchema = z.object({
  name: z.string(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  endorsed: z.boolean().default(false),
  endorsements: z.array(z.string()).default([]), // user IDs
});

// Main User Schema
export const userSchema = z.object({
  id: z.string().optional(),
  
  // Basic Information
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens').optional(),
  
  // Profile Information
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  title: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  
  // Avatar & Media
  avatar: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  
  // Contact Information
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  
  // System Information
  role: userRoleSchema.default('viewer'),
  status: userStatusSchema.default('active'),
  
  // Account Settings
  isEmailVerified: z.boolean().default(false),
  isPhoneVerified: z.boolean().default(false),
  twoFactorEnabled: z.boolean().default(false),
  
  // Subscription & Billing
  subscription: userSubscriptionSchema.optional(),
  
  // Preferences & Settings
  preferences: userPreferencesSchema.optional(),
  
  // Social & Professional
  socialLinks: userSocialLinksSchema.optional(),
  skills: z.array(userSkillSchema).default([]),
  
  // Activity & Analytics
  activity: userActivitySchema.optional(),
  
  // Team & Collaboration
  teamIds: z.array(z.string()).default([]),
  projectIds: z.array(z.string()).default([]),
  
  // Timestamps
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  deletedAt: z.string().datetime().optional(),
  
  // Security
  lastPasswordChangeAt: z.string().datetime().optional(),
  failedLoginAttempts: z.number().default(0),
  lockedUntil: z.string().datetime().optional(),
});

// User Registration Schema
export const userRegistrationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  company: z.string().max(100).optional(),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
  marketingEmails: z.boolean().default(false),
});

// User Login Schema
export const userLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

// User Profile Update Schema
export const userProfileUpdateSchema = userSchema.pick({
  firstName: true,
  lastName: true,
  displayName: true,
  bio: true,
  title: true,
  company: true,
  location: true,
  phone: true,
  socialLinks: true,
  skills: true,
}).partial();

// User Settings Update Schema
export const userSettingsUpdateSchema = z.object({
  preferences: userPreferencesSchema.partial(),
  twoFactorEnabled: z.boolean().optional(),
});

// Password Reset Schema
export const passwordResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// Password Change Schema
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// User List Item Schema
export const userListItemSchema = userSchema.pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  displayName: true,
  avatar: true,
  title: true,
  company: true,
  role: true,
  status: true,
  lastActiveAt: true,
  createdAt: true,
}).extend({
  fullName: z.string().optional(),
  isOnline: z.boolean().default(false),
  projectCount: z.number().default(0),
  taskCount: z.number().default(0),
});

// User Team Member Schema
export const userTeamMemberSchema = z.object({
  userId: z.string(),
  role: z.enum(['owner', 'admin', 'member', 'viewer']),
  permissions: z.array(z.enum([
    'create_projects',
    'edit_projects', 
    'delete_projects',
    'manage_team',
    'view_analytics',
    'manage_billing'
  ])).default([]),
  joinedAt: z.string().datetime(),
  invitedBy: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>;
export type UserSettingsUpdate = z.infer<typeof userSettingsUpdateSchema>;
export type PasswordReset = z.infer<typeof passwordResetSchema>;
export type PasswordChange = z.infer<typeof passwordChangeSchema>;
export type UserListItem = z.infer<typeof userListItemSchema>;
export type UserTeamMember = z.infer<typeof userTeamMemberSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type UserActivity = z.infer<typeof userActivitySchema>;
export type UserSkill = z.infer<typeof userSkillSchema>;
export type UserSocialLinks = z.infer<typeof userSocialLinksSchema>;
export type UserSubscription = z.infer<typeof userSubscriptionSchema>;