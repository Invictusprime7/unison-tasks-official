/**
 * CLOUD BUSINESSES - Business entity management
 * 
 * A business is the top-level organizational entity.
 * Projects, assets, and integrations belong to businesses.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Users, Settings, Trash2, ExternalLink, Loader2, Paintbrush } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface CloudBusinessesProps {
  userId: string;
}

interface Business {
  id: string;
  name: string;
  slug?: string;
  industry?: string;
  website?: string;
  created_at: string;
  owner_id: string;
  notification_email?: string;
  notification_phone?: string;
  settings?: Record<string, any>;
}

export function CloudBusinesses({ userId }: CloudBusinessesProps) {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [newBusinessName, setNewBusinessName] = useState('');
  const [editName, setEditName] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editIndustry, setEditIndustry] = useState('');
  const [editNotificationEmail, setEditNotificationEmail] = useState('');
  const [editNotificationPhone, setEditNotificationPhone] = useState('');
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const openInBuilder = (business: Business) => {
    navigate('/web-builder', {
      state: {
        businessId: business.id,
        systemName: business.name,
      }
    });
  };

  useEffect(() => {
    if (userId) {
      loadBusinesses();
    }
  }, [userId]);

  const loadBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        // Table might not exist yet
        console.log('Businesses table not available:', error.message);
        setBusinesses([]);
      } else {
        setBusinesses(data || []);
      }
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBusiness = async () => {
    if (!newBusinessName.trim()) return;

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          name: newBusinessName.trim(),
          owner_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      setBusinesses([data, ...businesses]);
      setCreateOpen(false);
      setNewBusinessName('');

      toast({
        title: 'Business created',
        description: `${newBusinessName} has been created successfully.`,
      });
    } catch (error: any) {
      console.error('Error creating business:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create business.',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteBusiness = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBusinesses(businesses.filter(b => b.id !== id));
      toast({
        title: 'Business deleted',
        description: `${name} has been deleted.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete business.',
        variant: 'destructive',
      });
    }
  };

  const openManageDialog = (business: Business) => {
    setSelectedBusiness(business);
    setEditName(business.name);
    setEditWebsite(business.website || '');
    setEditIndustry(business.industry || '');
    setEditNotificationEmail(business.notification_email || '');
    setEditNotificationPhone(business.notification_phone || '');
    setManageOpen(true);
  };

  const updateBusiness = async () => {
    if (!selectedBusiness || !editName.trim()) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('businesses')
        .update({
          name: editName,
          notification_email: editNotificationEmail.trim() || null,
          notification_phone: editNotificationPhone.trim() || null,
        })
        .eq('id', selectedBusiness.id)
        .select()
        .single();

      if (error) throw error;

      setBusinesses(businesses.map(b => b.id === selectedBusiness.id ? data : b));
      setManageOpen(false);
      setSelectedBusiness(null);

      toast({
        title: 'Business updated',
        description: `${editName} has been updated successfully.`,
      });
    } catch (error: any) {
      console.error('Error updating business:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update business.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-900/50 border-white/10">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-700 rounded w-1/4"></div>
            <div className="h-20 bg-slate-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Businesses</h2>
          <p className="text-slate-400">Manage your business entities</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Business
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/10">
            <DialogHeader>
              <DialogTitle>Create Business</DialogTitle>
              <DialogDescription>
                Create a new business to organize your projects and assets.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={newBusinessName}
                  onChange={(e) => setNewBusinessName(e.target.value)}
                  placeholder="My Agency"
                  className="bg-slate-800/50"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createBusiness} disabled={creating || !newBusinessName.trim()}>
                {creating ? 'Creating...' : 'Create Business'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Business List */}
      {businesses.length === 0 ? (
        <Card className="bg-slate-900/50 border-white/10 border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No businesses yet</h3>
              <p className="text-slate-400 mb-4">
                Create your first business to start organizing projects.
              </p>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Business
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.map((business) => (
            <Card key={business.id} className="bg-slate-900/50 border-white/10 hover:border-blue-500/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{business.name}</CardTitle>
                    <CardDescription>/{business.slug}</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-green-400 border-green-500/30">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Users className="h-4 w-4" />
                    <span>1 member</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => openInBuilder(business)}
                    >
                      <Paintbrush className="h-4 w-4 mr-2" />
                      Open in Builder
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openManageDialog(business)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => deleteBusiness(business.id, business.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Manage Business Dialog */}
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="bg-slate-900 border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-400" />
              Manage Business
            </DialogTitle>
            <DialogDescription>
              Update your business settings and information.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="notifications" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>
            <TabsContent value="notifications" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editNotificationEmail">Notification Email</Label>
                <Input
                  id="editNotificationEmail"
                  type="email"
                  value={editNotificationEmail}
                  onChange={(e) => setEditNotificationEmail(e.target.value)}
                  placeholder="bookings@yourdomain.com"
                  className="bg-slate-800/50"
                />
                <p className="text-xs text-slate-400">
                  New leads, bookings, and form submissions will be sent here.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editNotificationPhone">Notification Phone (optional)</Label>
                <Input
                  id="editNotificationPhone"
                  type="tel"
                  value={editNotificationPhone}
                  onChange={(e) => setEditNotificationPhone(e.target.value)}
                  placeholder="+1 555 123 4567"
                  className="bg-slate-800/50"
                />
                <p className="text-xs text-slate-400">
                  SMS alerts for urgent notifications (requires Twilio setup).
                </p>
              </div>
              {selectedBusiness && !selectedBusiness.notification_email && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <p className="text-sm text-amber-400">
                    ⚠️ No notification email configured. Email alerts for new bookings and leads won't be sent.
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="general" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Business Name</Label>
                <Input
                  id="editName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="My Agency"
                  className="bg-slate-800/50"
                />
              </div>
            </TabsContent>
            <TabsContent value="team" className="py-4">
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Team Members</h3>
                <p className="text-slate-400 mb-4 text-sm">
                  Invite team members to collaborate on projects within this business.
                </p>
                <Badge variant="outline" className="text-amber-400 border-amber-500/30">
                  Coming Soon
                </Badge>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManageOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateBusiness} disabled={saving || !editName.trim()}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
