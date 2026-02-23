/**
 * CLOUD PROJECTS - Unified Business & Project Management
 * 
 * Redesigned for a cleaner, less cluttered user experience with:
 * - Clean sidebar navigation
 * - Simplified project cards
 * - Easy project management
 */

import React, { useState, useEffect, Suspense } from 'react';
import { 
  FolderKanban, Plus, Globe, Settings, Trash2, ExternalLink,
  Sparkles, Rocket, Layout, Palette, Clock, ChevronRight,
  MoreVertical, Copy, Star, FileText, Home, Download,
  Building2, Users, Loader2, Paintbrush, ArrowLeft,
  BarChart3, Target, Kanban, Workflow, Zap, UserCircle,
  Search, Grid3X3, List, Edit3, Eye, ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { downloadMultiPageSite } from '@/utils/multiPageExporter';

// CRM Components
import { CRMContacts } from '@/components/crm/CRMContacts';
import { CRMLeads } from '@/components/crm/CRMLeads';
import { CRMPipeline } from '@/components/crm/CRMPipeline';
import { CRMWorkflows } from '@/components/crm/CRMWorkflows';
import { CRMAutomations } from '@/components/crm/CRMAutomations';
import { CRMFormSubmissions } from '@/components/crm/CRMFormSubmissions';
import { CRMOverview } from '@/components/crm/CRMOverview';
import { PrebuiltWorkflows } from '@/components/crm/PrebuiltWorkflows';
import { CloudAutomations } from './CloudAutomations';
import { CloudTeams } from './CloudTeams';

import type { Json } from '@/integrations/supabase/types';

interface CloudProjectsProps {
  userId: string;
  businessId?: string;
  onProjectSelect?: (project: Project) => void;
}

interface Project {
  id: string;
  name: string;
  slug?: string;
  status?: 'draft' | 'published' | 'archived';
  publish_status?: 'draft' | 'publishing' | 'published' | 'unpublished';
  template_type?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  published_at?: string;
  business_id?: string;
  owner_id?: string;
  user_id?: string;
  custom_domain?: string;
  settings?: Record<string, any>;
}

interface Business {
  id: string;
  name: string;
  slug?: string;
  industry?: string;
  website?: string;
  created_at?: string;
  owner_id?: string;
  notification_email?: string;
  notification_phone?: string;
  settings?: Json;
}

const transformBusiness = (data: Record<string, unknown>): Business => ({
  id: data.id as string,
  name: data.name as string,
  slug: data.slug as string | undefined,
  industry: data.industry as string | undefined,
  website: data.website as string | undefined,
  created_at: data.created_at as string | undefined,
  owner_id: data.owner_id as string | undefined,
  notification_email: data.notification_email as string | undefined,
  notification_phone: data.notification_phone as string | undefined,
  settings: data.settings as Json | undefined,
});

type ViewMode = 'grid' | 'list';
type BusinessSection = 'projects' | 'crm' | 'automations' | 'team' | 'settings';
type CRMSubTab = 'overview' | 'contacts' | 'leads' | 'pipeline' | 'workflows' | 'recipes' | 'automations' | 'forms';

export function CloudProjects({ userId, businessId: propBusinessId, onProjectSelect }: CloudProjectsProps) {
  // Core state
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [activeSection, setActiveSection] = useState<BusinessSection>('projects');
  const [crmSubTab, setCrmSubTab] = useState<CRMSubTab>('overview');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [createBusinessOpen, setCreateBusinessOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'business' | 'project'; item: Business | Project } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Form states
  const [newBusinessName, setNewBusinessName] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [creatingBusiness, setCreatingBusiness] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  // Load businesses on mount
  useEffect(() => {
    if (userId) loadBusinesses();
  }, [userId]);

  // Load projects when business selected
  useEffect(() => {
    if (selectedBusiness) loadProjects(selectedBusiness.id);
  }, [selectedBusiness]);

  // ==================== DATA OPERATIONS ====================

  const loadBusinesses = async () => {
    try {
      const { data: ownedBusinesses, error: ownedError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      const { data: memberBusinesses, error: memberError } = await supabase
        .from('business_members')
        .select('business:businesses(*)')
        .eq('user_id', userId);

      if (ownedError && memberError) {
        setBusinesses([]);
      } else {
        const owned = (ownedBusinesses || []).map(transformBusiness);
        const memberOf = (memberBusinesses || [])
          .map((m: any) => m.business)
          .filter(Boolean)
          .map(transformBusiness);
        
        const allBusinesses = [...owned];
        memberOf.forEach(b => {
          if (!allBusinesses.find(ob => ob.id === b.id)) {
            allBusinesses.push(b);
          }
        });
        
        setBusinesses(allBusinesses);
        
        // Auto-select first or provided business
        if (propBusinessId) {
          const found = allBusinesses.find(b => b.id === propBusinessId);
          if (found) setSelectedBusiness(found);
        } else if (allBusinesses.length > 0) {
          setSelectedBusiness(allBusinesses[0]);
        }
      }
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async (businessId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('business_id', businessId)
        .order('updated_at', { ascending: false });

      if (error) {
        // Fallback to owner_id
        const { data: fallbackData } = await supabase
          .from('projects')
          .select('*')
          .eq('owner_id', userId)
          .order('updated_at', { ascending: false });
        setProjects(fallbackData || []);
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const createBusiness = async () => {
    if (!newBusinessName.trim()) return;
    setCreatingBusiness(true);
    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert({ name: newBusinessName.trim(), owner_id: userId })
        .select()
        .single();

      if (error) throw error;

      const newBiz = transformBusiness(data);
      setBusinesses([newBiz, ...businesses]);
      setSelectedBusiness(newBiz);
      setCreateBusinessOpen(false);
      setNewBusinessName('');
      toast({ title: 'Business created', description: `${newBusinessName} is ready.` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create business.', variant: 'destructive' });
    } finally {
      setCreatingBusiness(false);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim() || !selectedBusiness) return;
    setCreatingProject(true);
    try {
      const slug = newProjectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').substring(0, 50);
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: newProjectName,
          description: newProjectDescription || null,
          slug,
          owner_id: userId,
          business_id: selectedBusiness.id,
          status: 'draft',
          publish_status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      setProjects([data, ...projects]);
      setCreateProjectOpen(false);
      setNewProjectName('');
      setNewProjectDescription('');
      toast({ title: 'Project created', description: `${newProjectName} is ready to edit.` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create project.', variant: 'destructive' });
    } finally {
      setCreatingProject(false);
    }
  };

  const confirmDelete = (type: 'business' | 'project', item: Business | Project) => {
    setItemToDelete({ type, item });
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    
    const { type, item } = itemToDelete;
    try {
      const { error } = await supabase
        .from(type === 'business' ? 'businesses' : 'projects')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      if (type === 'business') {
        const updated = businesses.filter(b => b.id !== item.id);
        setBusinesses(updated);
        if (selectedBusiness?.id === item.id) {
          setSelectedBusiness(updated[0] || null);
        }
      } else {
        setProjects(projects.filter(p => p.id !== item.id));
      }

      toast({ title: `${type === 'business' ? 'Business' : 'Project'} deleted` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete.', variant: 'destructive' });
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const duplicateProject = async (project: Project) => {
    try {
      const newSlug = `${project.slug || 'project'}-copy-${Date.now().toString(36)}`;
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: `${project.name} (Copy)`,
          description: project.description,
          slug: newSlug,
          owner_id: userId,
          business_id: project.business_id || selectedBusiness?.id,
          status: 'draft',
          publish_status: 'draft',
          settings: project.settings,
        })
        .select()
        .single();

      if (error) throw error;
      setProjects([data, ...projects]);
      toast({ title: 'Project duplicated' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const openInBuilder = (project: Project) => {
    navigate('/web-builder', {
      state: {
        projectId: project.id,
        businessId: project.business_id || selectedBusiness?.id,
        projectName: project.name,
        projectSlug: project.slug,
        publishStatus: project.publish_status || project.status,
      }
    });
  };

  // ==================== FILTERED DATA ====================

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // ==================== CRM CONTENT ====================

  const renderCRMContent = () => {
    switch (crmSubTab) {
      case 'contacts': return <CRMContacts />;
      case 'leads': return <CRMLeads />;
      case 'pipeline': return <CRMPipeline />;
      case 'workflows': return <CRMWorkflows />;
      case 'recipes': return <PrebuiltWorkflows />;
      case 'automations': return <CRMAutomations />;
      case 'forms': return <CRMFormSubmissions />;
      default: return <CRMOverview onNavigate={(v) => setCrmSubTab(v as CRMSubTab)} />;
    }
  };

  // ==================== LOADING ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // ==================== EMPTY STATE ====================

  if (businesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 mb-6">
          <Building2 className="h-12 w-12 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Create your first business</h2>
        <p className="text-slate-400 mb-6 max-w-md">
          Businesses help you organize projects, manage clients, and automate workflows.
        </p>
        <Button 
          onClick={() => setCreateBusinessOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Business
        </Button>

        {/* Create Business Dialog */}
        <Dialog open={createBusinessOpen} onOpenChange={setCreateBusinessOpen}>
          <DialogContent className="bg-slate-900 border-white/10 max-w-md">
            <DialogHeader>
              <DialogTitle>Create Business</DialogTitle>
              <DialogDescription>Give your business a name to get started.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="bizName">Business Name</Label>
              <Input
                id="bizName"
                value={newBusinessName}
                onChange={(e) => setNewBusinessName(e.target.value)}
                placeholder="My Agency"
                className="mt-2 bg-slate-800/50 border-white/10"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateBusinessOpen(false)}>Cancel</Button>
              <Button onClick={createBusiness} disabled={creatingBusiness || !newBusinessName.trim()}>
                {creatingBusiness ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ==================== MAIN LAYOUT ====================

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-6">
      {/* Left Sidebar - Business List */}
      <aside className="w-64 flex-shrink-0 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-slate-400 uppercase tracking-wide">Businesses</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0"
            onClick={() => setCreateBusinessOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1 -mx-2">
          <div className="px-2 space-y-1">
            {businesses.map((business) => (
              <button
                key={business.id}
                onClick={() => {
                  setSelectedBusiness(business);
                  setActiveSection('projects');
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group",
                  selectedBusiness?.id === business.id
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-md transition-colors",
                  selectedBusiness?.id === business.id
                    ? "bg-purple-500/30"
                    : "bg-slate-700/50 group-hover:bg-slate-700"
                )}>
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{business.name}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDelete('business', business);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-400 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {selectedBusiness ? (
          <>
            {/* Business Header & Navigation */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20">
                  <Building2 className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedBusiness.name}</h2>
                  <p className="text-sm text-slate-500">
                    {projects.length} project{projects.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/web-builder', { state: { businessId: selectedBusiness.id } })}
              >
                <Paintbrush className="h-4 w-4 mr-2" />
                Open Builder
              </Button>
            </div>

            {/* Section Tabs */}
            <div className="flex items-center gap-1 mb-6 border-b border-white/10 pb-px">
              {[
                { id: 'projects', label: 'Projects', icon: FolderKanban },
                { id: 'crm', label: 'CRM', icon: Users },
                { id: 'automations', label: 'Automations', icon: Zap },
                { id: 'team', label: 'Team', icon: Users },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as BusinessSection)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative",
                    activeSection === tab.id
                      ? "text-white bg-white/5"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {activeSection === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Section Content */}
            <div className="flex-1 overflow-auto">
              {activeSection === 'projects' && (
                <div className="space-y-4">
                  {/* Toolbar */}
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-slate-800/50 border-white/10 h-9"
                      />
                    </div>
                    <div className="flex items-center gap-1 border border-white/10 rounded-lg p-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn("h-7 px-2", viewMode === 'grid' && "bg-white/10")}
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn("h-7 px-2", viewMode === 'list' && "bg-white/10")}
                        onClick={() => setViewMode('list')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button onClick={() => setCreateProjectOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Project
                    </Button>
                  </div>

                  {/* Projects */}
                  {filteredProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="p-4 rounded-2xl bg-slate-800/50 mb-4">
                        <Rocket className="h-10 w-10 text-slate-500" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {searchQuery ? 'No projects found' : 'Create your first project'}
                      </h3>
                      <p className="text-slate-400 text-sm mb-4">
                        {searchQuery 
                          ? 'Try a different search term.' 
                          : 'Start building something amazing.'}
                      </p>
                      {!searchQuery && (
                        <Button onClick={() => setCreateProjectOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          New Project
                        </Button>
                      )}
                    </div>
                  ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredProjects.map((project) => (
                        <Card 
                          key={project.id}
                          className="bg-slate-900/50 border-white/10 hover:border-purple-500/30 transition-all group cursor-pointer"
                          onClick={() => openInBuilder(project)}
                        >
                          {/* Thumbnail */}
                          <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border-b border-white/5">
                            <Palette className="h-8 w-8 text-slate-600" />
                          </div>
                          
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold truncate group-hover:text-purple-300 transition-colors">
                                  {project.name}
                                </h4>
                                <p className="text-xs text-slate-500 font-mono">/{project.slug}</p>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs shrink-0",
                                  project.status === 'published' 
                                    ? "text-green-400 border-green-500/30" 
                                    : "text-amber-400 border-amber-500/30"
                                )}
                              >
                                {project.status === 'published' ? 'Live' : 'Draft'}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                              <Clock className="h-3 w-3" />
                              {new Date(project.updated_at || project.created_at).toLocaleDateString()}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
                              <Button 
                                size="sm" 
                                variant="secondary"
                                className="flex-1 h-8 text-xs"
                                onClick={() => openInBuilder(project)}
                              >
                                <Edit3 className="h-3 w-3 mr-1.5" />
                                Edit
                              </Button>
                              {project.status === 'published' && (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => window.open(`/preview/${project.slug}`, '_blank')}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 w-40">
                                  <DropdownMenuItem onSelect={() => duplicateProject(project)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => {
                                    setSelectedProject(project);
                                    setSettingsOpen(true);
                                  }}>
                                    <Settings className="h-4 w-4 mr-2" />
                                    Settings
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-white/10" />
                                  <DropdownMenuItem 
                                    className="text-red-400 focus:text-red-400"
                                    onSelect={() => confirmDelete('project', project)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    /* List View */
                    <div className="border border-white/10 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10 bg-slate-800/30">
                            <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">Name</th>
                            <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">Status</th>
                            <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">Updated</th>
                            <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredProjects.map((project) => (
                            <tr 
                              key={project.id} 
                              className="hover:bg-white/5 cursor-pointer"
                              onClick={() => openInBuilder(project)}
                            >
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium">{project.name}</p>
                                  <p className="text-xs text-slate-500 font-mono">/{project.slug}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs",
                                    project.status === 'published' 
                                      ? "text-green-400 border-green-500/30" 
                                      : "text-amber-400 border-amber-500/30"
                                  )}
                                >
                                  {project.status === 'published' ? 'Live' : 'Draft'}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-400">
                                {new Date(project.updated_at || project.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1">
                                  <Button size="sm" variant="ghost" className="h-7" onClick={() => openInBuilder(project)}>
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    onClick={() => confirmDelete('project', project)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'crm' && (
                <div className="flex gap-6">
                  <nav className="w-44 flex-shrink-0 space-y-1">
                    {[
                      { id: 'overview', label: 'Overview', icon: BarChart3 },
                      { id: 'contacts', label: 'Contacts', icon: UserCircle },
                      { id: 'leads', label: 'Leads', icon: Target },
                      { id: 'pipeline', label: 'Pipeline', icon: Kanban },
                      { id: 'workflows', label: 'Workflows', icon: Workflow },
                      { id: 'recipes', label: 'Prebuilt', icon: Sparkles },
                      { id: 'automations', label: 'Rules', icon: Zap },
                      { id: 'forms', label: 'Forms', icon: FileText },
                    ].map((tab) => (
                      <Button
                        key={tab.id}
                        variant={crmSubTab === tab.id ? 'secondary' : 'ghost'}
                        className={cn("w-full justify-start", crmSubTab === tab.id && "bg-white/10")}
                        onClick={() => setCrmSubTab(tab.id as CRMSubTab)}
                      >
                        <tab.icon className="h-4 w-4 mr-2" />
                        {tab.label}
                      </Button>
                    ))}
                  </nav>
                  <div className="flex-1 min-w-0">
                    <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
                      {renderCRMContent()}
                    </Suspense>
                  </div>
                </div>
              )}

              {activeSection === 'automations' && (
                <CloudAutomations userId={userId} />
              )}

              {activeSection === 'team' && (
                <CloudTeams userId={userId} organizationId={selectedBusiness.id} />
              )}

              {activeSection === 'settings' && (
                <Card className="bg-slate-900/50 border-white/10 max-w-2xl">
                  <CardHeader>
                    <CardTitle>Business Settings</CardTitle>
                    <CardDescription>Configure your business details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Business Name</Label>
                      <Input value={selectedBusiness.name} disabled className="bg-slate-800/50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Notification Email</Label>
                      <Input 
                        value={selectedBusiness.notification_email || ''} 
                        disabled 
                        placeholder="Not configured"
                        className="bg-slate-800/50" 
                      />
                    </div>
                    <div className="pt-4 border-t border-white/10">
                      <h4 className="text-red-400 font-semibold mb-3">Danger Zone</h4>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => confirmDelete('business', selectedBusiness)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Business
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            Select a business to manage
          </div>
        )}
      </main>

      {/* Dialogs */}
      <Dialog open={createBusinessOpen} onOpenChange={setCreateBusinessOpen}>
        <DialogContent className="bg-slate-900 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle>Create Business</DialogTitle>
            <DialogDescription>Give your business a name.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="newBizName">Business Name</Label>
            <Input
              id="newBizName"
              value={newBusinessName}
              onChange={(e) => setNewBusinessName(e.target.value)}
              placeholder="My Agency"
              className="mt-2 bg-slate-800/50 border-white/10"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateBusinessOpen(false)}>Cancel</Button>
            <Button onClick={createBusiness} disabled={creatingBusiness || !newBusinessName.trim()}>
              {creatingBusiness ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createProjectOpen} onOpenChange={setCreateProjectOpen}>
        <DialogContent className="bg-slate-900 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
            <DialogDescription>Create a new project in {selectedBusiness?.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="projName">Project Name</Label>
              <Input
                id="projName"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="My Website"
                className="mt-2 bg-slate-800/50 border-white/10"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="projDesc">Description (optional)</Label>
              <Input
                id="projDesc"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="A brief description..."
                className="mt-2 bg-slate-800/50 border-white/10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateProjectOpen(false)}>Cancel</Button>
            <Button onClick={createProject} disabled={creatingProject || !newProjectName.trim()}>
              {creatingProject ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-slate-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{itemToDelete?.item && 'name' in itemToDelete.item ? itemToDelete.item.name : ''}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="bg-slate-900 border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle>Project Settings</DialogTitle>
            <DialogDescription>{selectedProject?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400 text-xs">Status</Label>
                <p className="font-medium capitalize">{selectedProject?.status || 'draft'}</p>
              </div>
              <div>
                <Label className="text-slate-400 text-xs">Created</Label>
                <p className="font-medium">
                  {selectedProject?.created_at ? new Date(selectedProject.created_at).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <Label className="text-slate-400 text-xs">Slug</Label>
                <p className="font-medium font-mono">/{selectedProject?.slug}</p>
              </div>
              <div>
                <Label className="text-slate-400 text-xs">Domain</Label>
                <p className="font-medium">{selectedProject?.custom_domain || 'None'}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>Close</Button>
            {selectedProject && (
              <Button onClick={() => {
                setSettingsOpen(false);
                openInBuilder(selectedProject);
              }}>
                Open in Builder
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
