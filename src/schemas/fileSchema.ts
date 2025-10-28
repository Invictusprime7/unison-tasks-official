import { z } from 'zod';

// File Type Schema
export const fileTypeSchema = z.enum([
  'image',
  'video',
  'audio',
  'document',
  'archive',
  'code',
  'font',
  'other'
]);

// File Status Schema
export const fileStatusSchema = z.enum([
  'uploading',
  'processing',
  'ready',
  'failed',
  'deleted'
]);

// File Permission Schema
export const filePermissionSchema = z.enum([
  'private',
  'team',
  'project',
  'public'
]);

// File Access Schema
export const fileAccessSchema = z.object({
  userId: z.string(),
  permission: z.enum(['read', 'write', 'delete', 'share']),
  grantedAt: z.string().datetime(),
  grantedBy: z.string(),
});

// File Version Schema
export const fileVersionSchema = z.object({
  id: z.string(),
  version: z.string(),
  size: z.number(),
  url: z.string().url(),
  uploadedBy: z.string(),
  uploadedAt: z.string().datetime(),
  changelog: z.string().optional(),
  isActive: z.boolean().default(false),
});

// File Metadata Schema
export const fileMetadataSchema = z.object({
  width: z.number().optional(),
  height: z.number().optional(),
  duration: z.number().optional(), // for video/audio in seconds
  pages: z.number().optional(), // for documents
  wordCount: z.number().optional(),
  encoding: z.string().optional(),
  colorProfile: z.string().optional(),
  camera: z.object({
    make: z.string(),
    model: z.string(),
    settings: z.record(z.string(), z.unknown()),
  }).optional(),
  geo: z.object({
    latitude: z.number(),
    longitude: z.number(),
    altitude: z.number().optional(),
  }).optional(),
});

// File Tag Schema
export const fileTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  category: z.enum(['project', 'type', 'status', 'custom']).default('custom'),
});

// File Comment Schema
export const fileCommentSchema = z.object({
  id: z.string(),
  content: z.string().min(1),
  authorId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  coordinates: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(), // for image annotations
  isResolved: z.boolean().default(false),
  resolvedBy: z.string().optional(),
  resolvedAt: z.string().datetime().optional(),
});

// Main File Schema
export const fileSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'File name is required').max(255),
  originalName: z.string(),
  description: z.string().max(1000).optional(),
  
  // File Properties
  type: fileTypeSchema,
  mimeType: z.string(),
  size: z.number().min(0),
  hash: z.string().optional(), // for deduplication
  
  // Storage
  url: z.string().url(),
  path: z.string(),
  bucket: z.string().default('files'),
  
  // Status & Permissions
  status: fileStatusSchema.default('ready'),
  permission: filePermissionSchema.default('private'),
  
  // Ownership
  ownerId: z.string(),
  projectId: z.string().optional(),
  folderId: z.string().optional(),
  
  // Versioning
  versions: z.array(fileVersionSchema).default([]),
  currentVersion: z.string().optional(),
  
  // Metadata
  metadata: fileMetadataSchema.optional(),
  
  // Organization
  tags: z.array(fileTagSchema).default([]),
  
  // Interaction
  comments: z.array(fileCommentSchema).default([]),
  access: z.array(fileAccessSchema).default([]),
  
  // Timestamps
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  lastAccessedAt: z.string().datetime().optional(),
  
  // Analytics
  downloadCount: z.number().default(0),
  viewCount: z.number().default(0),
  
  // Settings
  isPublic: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  isFavorite: z.boolean().default(false),
  
  // AI Enhancement
  aiAnalysis: z.object({
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    faces: z.array(z.object({
      name: z.string().optional(),
      confidence: z.number(),
      coordinates: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
      }),
    })).default([]),
    objects: z.array(z.object({
      name: z.string(),
      confidence: z.number(),
      coordinates: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
      }),
    })).default([]),
    text: z.string().optional(), // extracted text from OCR
    sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
  }).optional(),
});

// Folder Schema
export const folderSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Folder name is required').max(255),
  description: z.string().max(1000).optional(),
  
  // Hierarchy
  parentId: z.string().optional(),
  path: z.string(),
  depth: z.number().min(0).default(0),
  
  // Ownership
  ownerId: z.string(),
  projectId: z.string().optional(),
  
  // Permissions
  permission: filePermissionSchema.default('private'),
  access: z.array(fileAccessSchema).default([]),
  
  // Organization
  tags: z.array(fileTagSchema).default([]),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().optional(),
  
  // Timestamps
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  
  // Statistics
  fileCount: z.number().default(0),
  totalSize: z.number().default(0),
  
  // Settings
  isArchived: z.boolean().default(false),
  isFavorite: z.boolean().default(false),
});

// File Upload Schema
export const fileUploadSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string(),
  size: z.number().min(1),
  projectId: z.string().optional(),
  folderId: z.string().optional(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string()).default([]),
  permission: filePermissionSchema.default('private'),
});

// File List Item Schema
export const fileListItemSchema = fileSchema.pick({
  id: true,
  name: true,
  type: true,
  mimeType: true,
  size: true,
  url: true,
  status: true,
  permission: true,
  ownerId: true,
  projectId: true,
  folderId: true,
  createdAt: true,
  updatedAt: true,
  isPublic: true,
  isArchived: true,
  isFavorite: true,
}).extend({
  thumbnail: z.string().url().optional(),
  commentCount: z.number().default(0),
  tagCount: z.number().default(0),
  isShared: z.boolean().default(false),
});

// File Filter Schema
export const fileFilterSchema = z.object({
  types: z.array(fileTypeSchema).optional(),
  mimeTypes: z.array(z.string()).optional(),
  sizeRange: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  dateRange: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
  }).optional(),
  tagIds: z.array(z.string()).optional(),
  ownerIds: z.array(z.string()).optional(),
  projectIds: z.array(z.string()).optional(),
  folderIds: z.array(z.string()).optional(),
  permission: z.array(filePermissionSchema).optional(),
  search: z.string().optional(),
  isArchived: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  hasComments: z.boolean().optional(),
});

export type File = z.infer<typeof fileSchema>;
export type Folder = z.infer<typeof folderSchema>;
export type FileUpload = z.infer<typeof fileUploadSchema>;
export type FileListItem = z.infer<typeof fileListItemSchema>;
export type FileFilter = z.infer<typeof fileFilterSchema>;
export type FileTag = z.infer<typeof fileTagSchema>;
export type FileComment = z.infer<typeof fileCommentSchema>;
export type FileVersion = z.infer<typeof fileVersionSchema>;
export type FileMetadata = z.infer<typeof fileMetadataSchema>;
export type FileAccess = z.infer<typeof fileAccessSchema>;