/**
 * CLOUD TEAMS - Immersive team and member management
 * 
 * Enterprise team management features:
 * - Team members list
 * - Invite members
 * - Role management
 * - Remove members
 * - Pending invitations
 * 
 * Wired with CloudContext for real-time team data.
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Crown,
  Shield,
  UserCog,
  User,
  Eye,
  CreditCard,
  MoreHorizontal,
  Trash2,
  Mail,
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  RefreshCw,
  ChevronDown,
  Building2,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Import Cloud context for wired data
import { useCloudTeam, useCloudOrganizations } from '@/contexts/CloudContext';

interface CloudTeamsProps {
  userId: string;
  organizationId?: string;
}

type TeamRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer' | 'billing';

interface TeamMember {
  id: string;
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: TeamRole;
  joinedAt: Date;
  lastActive: Date;
}

interface Invitation {
  id: string;
  email: string;
  role: TeamRole;
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'expired';
}

const ROLE_CONFIG: Record<TeamRole, { icon: React.ElementType; color: string; gradient: string; label: string; description: string }> = {
  owner: {
    icon: Crown,
    color: 'text-yellow-400',
    gradient: 'from-yellow-500 to-amber-500',
    label: 'Owner',
    description: 'Full access, can transfer ownership',
  },
  admin: {
    icon: Shield,
    color: 'text-blue-400',
    gradient: 'from-blue-500 to-cyan-500',
    label: 'Admin',
    description: 'Manage team, settings, all projects',
  },
  manager: {
    icon: UserCog,
    color: 'text-purple-400',
    gradient: 'from-purple-500 to-pink-500',
    label: 'Manager',
    description: 'Manage projects and workflows',
  },
  member: {
    icon: User,
    color: 'text-green-400',
    gradient: 'from-green-500 to-emerald-500',
    label: 'Member',
    description: 'Create and edit projects',
  },
  viewer: {
    icon: Eye,
    color: 'text-slate-400',
    gradient: 'from-slate-500 to-slate-600',
    label: 'Viewer',
    description: 'Read-only access',
  },
  billing: {
    icon: CreditCard,
    color: 'text-orange-400',
    gradient: 'from-orange-500 to-amber-500',
    label: 'Billing',
    description: 'View and manage billing',
  },
};

// Team stat card
function TeamStat({
  icon: Icon,
  label,
  value,
  gradient,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  gradient: string;
}) {
  return (
    <div className="group relative p-4 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 hover:border-white/10 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg bg-gradient-to-r', gradient)}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-lg font-semibold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Member card component
function MemberCard({
  member,
  currentUserId,
  canManage,
  onRoleChange,
  onRemove,
  onTransferOwnership,
}: {
  member: TeamMember;
  currentUserId: string;
  canManage: boolean;
  onRoleChange: (role: TeamRole) => void;
  onRemove: () => void;
  onTransferOwnership: () => void;
}) {
  const config = ROLE_CONFIG[member.role];
  const Icon = config.icon;
  const isCurrentUser = member.userId === currentUserId;
  const isOwner = member.role === 'owner';

  const getInitials = () => {
    if (member.fullName) {
      return member.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return member.email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="group p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-white/10">
              <AvatarImage src={member.avatarUrl || undefined} />
              <AvatarFallback className={cn('bg-gradient-to-br', config.gradient)}>
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            {isOwner && (
              <div className="absolute -top-1 -right-1 p-1 rounded-full bg-yellow-500">
                <Crown className="h-3 w-3 text-yellow-900" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-white truncate">
                {member.fullName || member.email.split('@')[0]}
              </p>
              {isCurrentUser && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                  You
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-400 truncate">{member.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                className={cn(
                  'border text-xs',
                  `bg-${config.color.split('-')[1]}-500/10 ${config.color} border-${config.color.split('-')[1]}-500/30`
                )}
              >
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
              <span className="text-xs text-slate-500">
                Joined {new Date(member.joinedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {canManage && !isCurrentUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
              {!isOwner && (
                <>
                  <DropdownMenuItem
                    onClick={() => onRoleChange('admin')}
                    className="text-slate-300 hover:text-white focus:text-white"
                  >
                    <Shield className="h-4 w-4 mr-2 text-blue-400" />
                    Make Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onRoleChange('member')}
                    className="text-slate-300 hover:text-white focus:text-white"
                  >
                    <User className="h-4 w-4 mr-2 text-green-400" />
                    Make Member
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onRoleChange('viewer')}
                    className="text-slate-300 hover:text-white focus:text-white"
                  >
                    <Eye className="h-4 w-4 mr-2 text-slate-400" />
                    Make Viewer
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={onTransferOwnership}
                className="text-slate-300 hover:text-white focus:text-white"
              >
                <Crown className="h-4 w-4 mr-2 text-yellow-400" />
                Transfer Ownership
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={onRemove}
                className="text-red-400 hover:text-red-300 focus:text-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove from Team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

// Invitation card component
function InvitationCard({
  invitation,
  onResend,
  onCancel,
  resending,
}: {
  invitation: Invitation;
  onResend: () => void;
  onCancel: () => void;
  resending: boolean;
}) {
  const config = ROLE_CONFIG[invitation.role];
  const Icon = config.icon;
  const isExpired = new Date(invitation.expiresAt) < new Date();

  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-all duration-300',
        isExpired
          ? 'bg-red-500/5 border-red-500/20'
          : 'bg-white/[0.02] border-white/5 hover:border-white/10'
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-white/[0.05]">
            <Mail className="h-5 w-5 text-slate-400" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-white truncate">{invitation.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                className={cn(
                  'border text-xs',
                  isExpired
                    ? 'bg-red-500/10 text-red-400 border-red-500/30'
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                )}
              >
                <Clock className="h-3 w-3 mr-1" />
                {isExpired ? 'Expired' : 'Pending'}
              </Badge>
              <Badge className="bg-white/5 text-slate-400 border-white/10 text-xs">
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Invited {new Date(invitation.invitedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onResend}
            disabled={resending}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
          >
            {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CloudTeams({ userId, organizationId }: CloudTeamsProps) {
  const { toast } = useToast();
  
  // Use CloudContext for wired team data
  const { 
    members: contextMembers, 
    invitations: contextInvitations, 
    currentUserRole: contextUserRole,
    inviteMember,
    removeMember: removeTeamMember,
    updateMemberRole,
    cancelInvitation,
    resendInvitation,
    refresh,
    isLoading,
    usageStats
  } = useCloudTeam();
  
  const { currentOrganization } = useCloudOrganizations();
  
  const [searchQuery, setSearchQuery] = useState('');

  // Invite dialog state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('member');
  const [inviting, setInviting] = useState(false);

  // Action dialogs
  const [removeMemberDialog, setRemoveMemberDialog] = useState<TeamMember | null>(null);
  const [transferTo, setTransferTo] = useState<TeamMember | null>(null);
  const [resendingInvite, setResendingInvite] = useState<string | null>(null);

  // Convert context data to local format
  const members: TeamMember[] = contextMembers.map(m => ({
    id: m.id,
    userId: m.userId,
    email: m.email,
    fullName: m.fullName,
    avatarUrl: m.avatarUrl,
    role: m.role as TeamRole,
    joinedAt: new Date(m.joinedAt),
    lastActive: m.lastActiveAt ? new Date(m.lastActiveAt) : new Date(),
  }));

  const invitations: Invitation[] = contextInvitations.map(inv => ({
    id: inv.id,
    email: inv.email,
    role: inv.role as TeamRole,
    invitedBy: inv.inviterName,
    invitedAt: new Date(inv.createdAt),
    expiresAt: new Date(inv.expiresAt),
    status: inv.status as 'pending' | 'expired',
  }));

  const currentUserRole = contextUserRole || 'member';
  const canManage = ['owner', 'admin'].includes(currentUserRole);

  const filteredMembers = members.filter((m) => {
    const query = searchQuery.toLowerCase();
    return (
      m.fullName?.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.role.includes(query)
    );
  });

  // Use context action for inviting
  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    setInviting(true);
    try {
      const success = await inviteMember(inviteEmail, inviteRole);
      if (success) {
        setInviteDialogOpen(false);
        setInviteEmail('');
        setInviteRole('member');
      }
    } finally {
      setInviting(false);
    }
  };

  // Use context action for role changes
  const handleRoleChange = async (memberId: string, newRole: TeamRole) => {
    await updateMemberRole(memberId, newRole);
  };

  // Use context action for removing members
  const handleRemoveMember = async () => {
    if (!removeMemberDialog) return;
    await removeTeamMember(removeMemberDialog.id);
    setRemoveMemberDialog(null);
  };

  // Transfer ownership - uses role change
  const handleTransferOwnership = async () => {
    if (!transferTo) return;
    // Note: Full ownership transfer requires additional backend logic
    // For now, promote to admin
    await updateMemberRole(transferTo.id, 'owner');
    setTransferTo(null);
  };

  // Use context action for resending invites
  const handleResendInvite = async (inviteId: string) => {
    setResendingInvite(inviteId);
    try {
      await resendInvitation(inviteId);
    } finally {
      setResendingInvite(null);
    }
  };

  // Use context action for cancelling invites
  const handleCancelInvite = async (inviteId: string) => {
    await cancelInvitation(inviteId);
  };

  // Check if no organization selected
  if (!currentOrganization) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Organization Selected</h3>
          <p className="text-slate-400 mb-4">
            Create or select an organization in the Businesses tab to manage your team.
          </p>
        </div>
      </div>
    );
  }

  const roleStats = {
    owners: members.filter((m) => m.role === 'owner').length,
    admins: members.filter((m) => m.role === 'admin').length,
    members: members.filter((m) => m.role === 'member').length,
    viewers: members.filter((m) => m.role === 'viewer').length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-40 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-800/30 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Team Overview Hero */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-rose-600/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />

        <div className="relative p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Team Management</h2>
                <p className="text-slate-400">Manage your team members and roles</p>
              </div>
            </div>

            {canManage && (
              <Button
                onClick={() => setInviteDialogOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            )}
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TeamStat
              icon={Users}
              label="Total Members"
              value={members.length}
              gradient="from-purple-500 to-pink-500"
            />
            <TeamStat
              icon={Crown}
              label="Owners"
              value={roleStats.owners}
              gradient="from-yellow-500 to-amber-500"
            />
            <TeamStat
              icon={Shield}
              label="Admins"
              value={roleStats.admins}
              gradient="from-blue-500 to-cyan-500"
            />
            <TeamStat
              icon={Mail}
              label="Pending Invites"
              value={invitations.filter((i) => i.status === 'pending').length}
              gradient="from-orange-500 to-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search members by name, email, or role..."
          className="pl-10 bg-white/[0.03] border-white/10 text-white placeholder:text-slate-500 h-12"
        />
      </div>

      {/* Members List */}
      <Card className="bg-white/[0.02] border-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" />
            Team Members ({filteredMembers.length})
          </CardTitle>
          <CardDescription>Active members of your team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                currentUserId={userId}
                canManage={canManage}
                onRoleChange={(role) => handleRoleChange(member.id, role)}
                onRemove={() => setRemoveMemberDialog(member)}
                onTransferOwnership={() => setTransferTo(member)}
              />
            ))}
            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No members found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card className="bg-white/[0.02] border-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-orange-400" />
              Pending Invitations ({invitations.length})
            </CardTitle>
            <CardDescription>Invitations waiting for response</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <InvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  onResend={() => handleResendInvite(invitation.id)}
                  onCancel={() => handleCancelInvite(invitation.id)}
                  resending={resendingInvite === invitation.id}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-purple-400" />
              Invite Team Member
            </DialogTitle>
            <DialogDescription>
              Send an invitation to join your team
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="bg-slate-800 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as TeamRole)}>
                <SelectTrigger className="bg-slate-800 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {(['admin', 'manager', 'member', 'viewer', 'billing'] as TeamRole[]).map((role) => {
                    const config = ROLE_CONFIG[role];
                    const Icon = config.icon;
                    return (
                      <SelectItem key={role} value={role}>
                        <div className="flex items-center gap-2">
                          <Icon className={cn('h-4 w-4', config.color)} />
                          <span>{config.label}</span>
                          <span className="text-xs text-slate-500">- {config.description}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!inviteEmail.trim() || inviting}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              {inviting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Send className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <AlertDialog open={!!removeMemberDialog} onOpenChange={() => setRemoveMemberDialog(null)}>
        <AlertDialogContent className="bg-slate-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {removeMemberDialog?.fullName || removeMemberDialog?.email} from
              the team? They will lose access to all team resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-red-500 hover:bg-red-600"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transfer Ownership Dialog */}
      <AlertDialog open={!!transferTo} onOpenChange={() => setTransferTo(null)}>
        <AlertDialogContent className="bg-slate-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              Transfer Ownership
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to transfer ownership to{' '}
              {transferTo?.fullName || transferTo?.email}? You will become an Admin of this team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTransferOwnership}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
            >
              <Crown className="h-4 w-4 mr-2" />
              Transfer Ownership
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
