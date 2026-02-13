/**
 * Cloud Context Definition
 * 
 * Contains the context object and type definitions.
 * Separated for Fast Refresh compatibility.
 */

import { createContext } from 'react';
import { User } from '@supabase/supabase-js';
import { type UserProfile } from '@/services/profileService';
import { type TeamMember, type TeamInvitation } from '@/services/teamService';

// Types for cloud state
export interface CloudOrganization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  industry: string | null;
  size: string | null;
  ownerId: string;
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  memberCount: number;
  projectCount: number;
  storageUsed: number;
  status: 'active' | 'suspended' | 'trial' | 'canceled';
  createdAt: string;
  updatedAt: string;
}

export interface CloudSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: Date;
  isCurrent: boolean;
  userAgent: string;
}

export interface CloudLoginEvent {
  id: string;
  type: 'success' | 'failed' | 'blocked';
  device: string;
  location: string;
  ipAddress: string;
  timestamp: Date;
  reason?: string;
}

export interface CloudUsageStats {
  members: { current: number; limit: number };
  projects: { current: number; limit: number };
  storage: { current: number; limit: number };
  apiCalls: { current: number; limit: number };
}

export interface CloudSecurityStatus {
  passwordStrength: 'weak' | 'fair' | 'good' | 'strong';
  twoFactorEnabled: boolean;
  lastPasswordChange: Date | null;
  activeSessions: number;
  recentFailedLogins: number;
}

export interface CloudContextType {
  // User state
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  
  // Organization state
  organizations: CloudOrganization[];
  currentOrganization: CloudOrganization | null;
  setCurrentOrganization: (org: CloudOrganization | null) => void;
  
  // Team state
  teamMembers: TeamMember[];
  invitations: TeamInvitation[];
  currentUserRole: 'owner' | 'admin' | 'manager' | 'member' | 'viewer' | 'billing' | null;
  
  // Security state
  sessions: CloudSession[];
  loginHistory: CloudLoginEvent[];
  securityStatus: CloudSecurityStatus | null;
  
  // Usage state
  usageStats: CloudUsageStats | null;
  
  // Actions
  refreshProfile: () => Promise<void>;
  refreshOrganizations: () => Promise<void>;
  refreshTeam: () => Promise<void>;
  refreshSecurity: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Organization actions
  createOrganization: (name: string, slug: string) => Promise<CloudOrganization | null>;
  updateOrganization: (id: string, updates: Partial<CloudOrganization>) => Promise<boolean>;
  deleteOrganization: (id: string) => Promise<boolean>;
  
  // Team actions
  inviteMember: (email: string, role: TeamMember['role']) => Promise<boolean>;
  removeMember: (memberId: string) => Promise<boolean>;
  updateMemberRole: (memberId: string, role: TeamMember['role']) => Promise<boolean>;
  cancelInvitation: (invitationId: string) => Promise<boolean>;
  resendInvitation: (invitationId: string) => Promise<boolean>;
  
  // Security actions
  revokeSession: (sessionId: string) => Promise<boolean>;
  revokeAllOtherSessions: () => Promise<boolean>;
  enableTwoFactor: () => Promise<{ qrCode: string; secret: string } | null>;
  disableTwoFactor: () => Promise<boolean>;
}

export const CloudContext = createContext<CloudContextType | null>(null);
