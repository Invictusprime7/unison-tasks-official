// Export all schema modules for easy importing
export * from './templateSchema';
export * from './projectSchema';
export * from './taskSchema';
export * from './fileSchema';
export * from './userSchema';
export * from './notificationSchema';
export * from './organizationSchema';
export * from './layoutSchema';

// Re-export commonly used types for convenience
export type {
  // Template types
  Template,
  Layer,
  Frame,
} from './templateSchema';

export type {
  // Project types
  Project,
  TeamMember,
} from './projectSchema';

export type {
  // Task types
  Task,
  TaskComment,
} from './taskSchema';

export type {
  // File types
  File,
  Folder,
  FileUpload,
  FileTag,
} from './fileSchema';

export type {
  // User types
  User,
  UserRegistration,
  UserLogin,
  UserPreferences,
} from './userSchema';

export type {
  // Notification types
  Notification,
  NotificationPreference,
  NotificationGroup,
} from './notificationSchema';

export type {
  // Organization types
  Organization,
  OrganizationMember,
  OrganizationSettings,
  AppSettings,
} from './organizationSchema';

export type {
  // Layout types
  PageLayout,
  LayoutComponent,
  LayoutTemplate,
} from './layoutSchema';