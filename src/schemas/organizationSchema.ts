import { z } from 'zod';

// Organization Plan Schema
export const organizationPlanSchema = z.enum([
  'free',
  'starter',
  'professional',
  'enterprise',
  'custom'
]);

// Organization Status Schema
export const organizationStatusSchema = z.enum([
  'active',
  'suspended',
  'trial',
  'canceled',
  'deleted'
]);

// Organization Role Schema
export const organizationRoleSchema = z.enum([
  'owner',
  'admin',
  'manager',
  'member',
  'viewer',
  'billing'
]);

// Organization Permission Schema
export const organizationPermissionSchema = z.enum([
  'manage_organization',
  'manage_billing',
  'manage_members',
  'create_projects',
  'delete_projects',
  'manage_templates',
  'view_analytics',
  'export_data',
  'manage_integrations',
  'manage_security'
]);

// Organization Member Schema
export const organizationMemberSchema = z.object({
  userId: z.string(),
  role: organizationRoleSchema,
  permissions: z.array(organizationPermissionSchema).default([]),
  joinedAt: z.string().datetime(),
  invitedBy: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Organization Billing Schema
export const organizationBillingSchema = z.object({
  plan: organizationPlanSchema,
  seats: z.number().min(1),
  usedSeats: z.number().min(0),
  billingCycle: z.enum(['monthly', 'yearly']),
  
  // Subscription details
  subscriptionId: z.string().optional(),
  customerId: z.string().optional(),
  
  // Billing period
  currentPeriodStart: z.string().datetime(),
  currentPeriodEnd: z.string().datetime(),
  
  // Status
  status: z.enum(['active', 'past_due', 'canceled', 'incomplete', 'trialing']),
  trialEnd: z.string().datetime().optional(),
  
  // Payment
  nextPaymentDate: z.string().datetime().optional(),
  lastPaymentDate: z.string().datetime().optional(),
  
  // Usage tracking
  storageUsed: z.number().default(0), // in bytes
  storageLimit: z.number().default(0),
  projectsUsed: z.number().default(0),
  projectsLimit: z.number().default(0),
  templatesUsed: z.number().default(0),
  templatesLimit: z.number().default(0),
});

// Organization Settings Schema
export const organizationSettingsSchema = z.object({
  // General settings
  allowPublicProjects: z.boolean().default(false),
  requireApprovalForProjects: z.boolean().default(false),
  defaultProjectVisibility: z.enum(['private', 'team', 'public']).default('team'),
  
  // Security settings
  enforceSSO: z.boolean().default(false),
  requireTwoFactor: z.boolean().default(false),
  allowedDomains: z.array(z.string().regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)).default([]),
  sessionTimeout: z.number().min(15).max(43200).default(480), // minutes
  
  // File settings
  maxFileSize: z.number().default(100 * 1024 * 1024), // 100MB in bytes
  allowedFileTypes: z.array(z.string()).default(['image/*', 'video/*', 'audio/*', 'application/pdf']),
  autoDeleteFiles: z.boolean().default(false),
  autoDeleteDays: z.number().min(1).max(365).default(90),
  
  // Integration settings
  allowThirdPartyIntegrations: z.boolean().default(true),
  webhookUrl: z.string().url().optional(),
  
  // Branding
  customColors: z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  }).optional(),
  logo: z.string().url().optional(),
  favicon: z.string().url().optional(),
  
  // Feature flags
  features: z.object({
    aiAssistant: z.boolean().default(true),
    advancedAnalytics: z.boolean().default(false),
    customTemplates: z.boolean().default(true),
    apiAccess: z.boolean().default(false),
    whiteLabeling: z.boolean().default(false),
  }),
});

// Main Organization Schema
export const organizationSchema = z.object({
  id: z.string().optional(),
  
  // Basic information
  name: z.string().min(1, 'Organization name is required').max(100),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).optional(),
  
  // Contact information
  website: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  
  // Address
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  
  // Visual identity
  logo: z.string().url().optional(),
  avatar: z.string().url().optional(),
  
  // Status and plan
  status: organizationStatusSchema.default('active'),
  
  // Members and roles
  members: z.array(organizationMemberSchema).default([]),
  ownerId: z.string(),
  
  // Billing and subscription
  billing: organizationBillingSchema.optional(),
  
  // Settings and configuration
  settings: organizationSettingsSchema.optional(),
  
  // Metadata
  industry: z.string().optional(),
  size: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']).optional(),
  
  // Timestamps
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  
  // Statistics
  projectCount: z.number().default(0),
  memberCount: z.number().default(0),
  storageUsed: z.number().default(0),
});

// Application Settings Schema
export const appSettingsSchema = z.object({
  // System settings
  maintenance: z.object({
    enabled: z.boolean().default(false),
    message: z.string().optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
  }),
  
  // Registration settings
  registration: z.object({
    enabled: z.boolean().default(true),
    requireInvitation: z.boolean().default(false),
    allowedDomains: z.array(z.string()).default([]),
    autoApprove: z.boolean().default(true),
  }),
  
  // Email settings
  email: z.object({
    enabled: z.boolean().default(true),
    provider: z.enum(['smtp', 'sendgrid', 'ses', 'mailgun']).default('smtp'),
    fromAddress: z.string().email().optional(),
    fromName: z.string().optional(),
    replyTo: z.string().email().optional(),
  }),
  
  // Storage settings
  storage: z.object({
    provider: z.enum(['local', 's3', 'gcs', 'azure']).default('local'),
    maxFileSize: z.number().default(100 * 1024 * 1024),
    allowedTypes: z.array(z.string()).default(['image/*', 'video/*', 'audio/*']),
    compression: z.object({
      enabled: z.boolean().default(true),
      quality: z.number().min(1).max(100).default(80),
    }),
  }),
  
  // AI settings
  ai: z.object({
    enabled: z.boolean().default(true),
    provider: z.enum(['openai', 'anthropic', 'azure', 'local']).default('openai'),
    model: z.string().default('gpt-4'),
    maxTokens: z.number().default(4000),
    temperature: z.number().min(0).max(2).default(0.7),
    rateLimits: z.object({
      requestsPerMinute: z.number().default(60),
      requestsPerHour: z.number().default(1000),
      requestsPerDay: z.number().default(10000),
    }),
  }),
  
  // Security settings
  security: z.object({
    jwtSecret: z.string().optional(),
    jwtExpiration: z.string().default('7d'),
    bcryptRounds: z.number().min(10).max(15).default(12),
    corsOrigins: z.array(z.string()).default(['*']),
    rateLimiting: z.object({
      enabled: z.boolean().default(true),
      windowMs: z.number().default(900000), // 15 minutes
      maxRequests: z.number().default(100),
    }),
  }),
  
  // Analytics settings
  analytics: z.object({
    enabled: z.boolean().default(true),
    provider: z.enum(['internal', 'google', 'mixpanel', 'amplitude']).default('internal'),
    trackingId: z.string().optional(),
    anonymizeIp: z.boolean().default(true),
  }),
  
  // Feature flags
  features: z.object({
    registration: z.boolean().default(true),
    socialLogin: z.boolean().default(false),
    twoFactorAuth: z.boolean().default(true),
    apiAccess: z.boolean().default(true),
    webhooks: z.boolean().default(false),
    realtime: z.boolean().default(true),
  }),
});

// Integration Settings Schema
export const integrationSettingsSchema = z.object({
  // Third-party integrations
  google: z.object({
    enabled: z.boolean().default(false),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    scopes: z.array(z.string()).default([]),
  }).optional(),
  
  slack: z.object({
    enabled: z.boolean().default(false),
    botToken: z.string().optional(),
    signingSecret: z.string().optional(),
    defaultChannel: z.string().optional(),
  }).optional(),
  
  github: z.object({
    enabled: z.boolean().default(false),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    webhookSecret: z.string().optional(),
  }).optional(),
  
  figma: z.object({
    enabled: z.boolean().default(false),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
  }).optional(),
  
  zapier: z.object({
    enabled: z.boolean().default(false),
    apiKey: z.string().optional(),
  }).optional(),
  
  webhooks: z.object({
    enabled: z.boolean().default(false),
    urls: z.array(z.object({
      url: z.string().url(),
      events: z.array(z.string()).default([]),
      secret: z.string().optional(),
    })).default([]),
  }),
});

// Organization Invitation Schema
export const organizationInvitationSchema = z.object({
  id: z.string().optional(),
  organizationId: z.string(),
  email: z.string().email(),
  role: organizationRoleSchema,
  permissions: z.array(organizationPermissionSchema).default([]),
  invitedBy: z.string(),
  message: z.string().optional(),
  
  // Status
  status: z.enum(['pending', 'accepted', 'declined', 'expired']).default('pending'),
  
  // Timestamps
  createdAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime(),
  acceptedAt: z.string().datetime().optional(),
  declinedAt: z.string().datetime().optional(),
});

export type Organization = z.infer<typeof organizationSchema>;
export type OrganizationMember = z.infer<typeof organizationMemberSchema>;
export type OrganizationBilling = z.infer<typeof organizationBillingSchema>;
export type OrganizationSettings = z.infer<typeof organizationSettingsSchema>;
export type OrganizationInvitation = z.infer<typeof organizationInvitationSchema>;
export type AppSettings = z.infer<typeof appSettingsSchema>;
export type IntegrationSettings = z.infer<typeof integrationSettingsSchema>;