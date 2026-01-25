/**
 * CLOUD PROFILE - Immersive user account management
 */

import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Calendar, Shield, Key, LogOut, Edit2, 
  Check, X, Crown, Zap, Clock, Activity, Settings,
  ChevronRight, Star, Award, TrendingUp, Camera, Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CloudProfileProps {
  user: any;
}

// Stat card component for profile stats
function ProfileStat({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  color: string;
}) {
  return (
    <div className="group relative p-4 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 hover:border-white/10 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", color)}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-lg font-semibold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function CloudProfile({ user }: CloudProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [twoFaDialogOpen, setTwoFaDialogOpen] = useState(false);
  const [preferencesDialogOpen, setPreferencesDialogOpen] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
      }

      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully.',
      });
      setEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const sendPasswordResetEmail = async () => {
    if (!user?.email) {
      toast({
        title: 'Error',
        description: 'No email address found.',
        variant: 'destructive',
      });
      return;
    }

    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: 'Password reset email sent',
        description: `Check ${user.email} for a password reset link.`,
      });
      setPasswordDialogOpen(false);
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send password reset email.',
        variant: 'destructive',
      });
    } finally {
      setSendingReset(false);
    }
  };

  const handleUpgrade = () => {
    // Navigate to pricing/subscription page or open Stripe checkout
    toast({
      title: 'Upgrade',
      description: 'Redirecting to subscription plans...',
    });
    // For now, navigate to a hypothetical pricing page
    navigate('/cloud?tab=subscription');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getInitials = () => {
    if (fullName) {
      return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Unknown';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-40 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Hero Card */}
      <div className="relative overflow-hidden rounded-2xl">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
        
        <div className="relative p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-500" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-2xl">
                {getInitials()}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-slate-800 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {editing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-slate-800/80 border-white/20 text-xl font-bold h-10 max-w-xs"
                      placeholder="Your name"
                      autoFocus
                    />
                    <Button size="sm" onClick={saveProfile} disabled={saving} className="bg-green-600 hover:bg-green-500">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-white">
                      {fullName || 'Set your name'}
                    </h2>
                    <button 
                      onClick={() => setEditing(true)}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4 text-slate-400" />
                    </button>
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Check className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </div>

            {/* Plan Badge */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                <Crown className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">Free Plan</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs border-white/10 text-slate-400 hover:text-white"
                onClick={handleUpgrade}
              >
                <Zap className="h-3 w-3 mr-1" />
                Upgrade
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ProfileStat 
          icon={Calendar} 
          label="Member Since" 
          value={memberSince}
          color="bg-blue-500/20 text-blue-400"
        />
        <ProfileStat 
          icon={Activity} 
          label="Last Active" 
          value={user?.last_sign_in_at ? 'Today' : 'Unknown'}
          color="bg-green-500/20 text-green-400"
        />
        <ProfileStat 
          icon={Star} 
          label="Projects" 
          value="0"
          color="bg-purple-500/20 text-purple-400"
        />
        <ProfileStat 
          icon={Award} 
          label="Templates" 
          value="0"
          color="bg-cyan-500/20 text-cyan-400"
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Account Settings</h3>
        <div className="grid gap-2">
          {/* Change Password */}
          <button 
            onClick={() => setPasswordDialogOpen(true)}
            className="group flex items-center gap-4 w-full p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 text-left"
          >
            <div className="p-2 rounded-lg bg-slate-800/50 group-hover:bg-slate-700/50 transition-colors">
              <Key className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">Change Password</p>
              <p className="text-sm text-slate-500">Update your security credentials</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </button>

          {/* Two-Factor Auth */}
          <button 
            onClick={() => setTwoFaDialogOpen(true)}
            className="group flex items-center gap-4 w-full p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 text-left"
          >
            <div className="p-2 rounded-lg bg-slate-800/50 group-hover:bg-slate-700/50 transition-colors">
              <Shield className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-white">Two-Factor Auth</p>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-green-400 border-green-500/30">
                  Recommended
                </Badge>
              </div>
              <p className="text-sm text-slate-500">Add an extra layer of security</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </button>

          {/* Preferences */}
          <button 
            onClick={() => setPreferencesDialogOpen(true)}
            className="group flex items-center gap-4 w-full p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 text-left"
          >
            <div className="p-2 rounded-lg bg-slate-800/50 group-hover:bg-slate-700/50 transition-colors">
              <Settings className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">Preferences</p>
              <p className="text-sm text-slate-500">Notification and display settings</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </button>
        </div>
      </div>

      {/* Password Reset Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-400" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              We'll send a password reset link to your email address.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-300">
                A password reset link will be sent to <strong>{user?.email}</strong>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendPasswordResetEmail} disabled={sendingReset}>
              {sendingReset ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Two-Factor Auth Dialog */}
      <Dialog open={twoFaDialogOpen} onOpenChange={setTwoFaDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Protect your account with an additional layer of security.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center">
            <div className="inline-block p-4 rounded-2xl bg-green-500/10 mb-4">
              <Shield className="h-12 w-12 text-green-400" />
            </div>
            <p className="text-slate-400 mb-4">
              Two-factor authentication adds an extra layer of security to your account by requiring a code from your authenticator app.
            </p>
            <Badge variant="outline" className="text-amber-400 border-amber-500/30">
              Coming Soon
            </Badge>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTwoFaDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preferences Dialog */}
      <Dialog open={preferencesDialogOpen} onOpenChange={setPreferencesDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-400" />
              Preferences
            </DialogTitle>
            <DialogDescription>
              Customize your notification and display settings.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-slate-400">
              For email notification preferences, visit the Email settings tab.
            </p>
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <p className="text-sm text-purple-300">
                Additional preferences will be available in a future update.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreferencesDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Danger Zone */}
      <div className="pt-6 border-t border-white/5">
        <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/20">
          <div>
            <p className="font-medium text-red-400">Sign Out</p>
            <p className="text-sm text-slate-500">End your current session</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
