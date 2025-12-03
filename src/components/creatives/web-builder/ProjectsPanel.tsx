import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FolderOpen, File, Save, Trash2, Clock, Search, Plus, MoreVertical, Edit2, Copy, HardDrive, Cloud, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useTemplateFiles } from '@/hooks/useTemplateFiles';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SavedTemplate {
  id: string;
  name: string;
  description: string | null;
  canvas_data: {
    html: string;
    css?: string;
    previewCode?: string;
  };
  is_public: boolean;
  created_at: string;
  updated_at: string;
  thumbnail_url: string | null;
}

interface ProjectsPanelProps {
  onLoadTemplate: (template: SavedTemplate) => void;
  onSaveTemplate: (name: string, description: string, isPublic?: boolean) => Promise<void>;
  currentCode: string;
}

const RECENT_TEMPLATES_KEY = 'webbuilder_recent_templates';
const MAX_RECENT = 5;

const getRecentTemplateIds = (): string[] => {
  try {
    const stored = localStorage.getItem(RECENT_TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const addToRecentTemplates = (id: string) => {
  const recent = getRecentTemplateIds().filter(r => r !== id);
  recent.unshift(id);
  localStorage.setItem(RECENT_TEMPLATES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
};

export const ProjectsPanel: React.FC<ProjectsPanelProps> = ({
  onLoadTemplate,
  onSaveTemplate,
  currentCode
}) => {
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [recentTemplates, setRecentTemplates] = useState<SavedTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDescription, setSaveDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const hasFetched = useRef(false);

  const { getAllTemplates, deleteTemplate, saveTemplate, currentTemplateId } = useTemplateFiles();

  const fetchTemplates = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const allTemplates = await getAllTemplates();
      setTemplates(allTemplates);
      
      // Get recent templates
      const recentIds = getRecentTemplateIds();
      const recent = recentIds
        .map(id => allTemplates.find(t => t.id === id))
        .filter((t): t is SavedTemplate => t !== undefined);
      setRecentTemplates(recent);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  }, [getAllTemplates]);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchTemplates();
    }
  }, [fetchTemplates]);

  const handleSave = async () => {
    if (!saveName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    setSaving(true);
    try {
      await onSaveTemplate(saveName, saveDescription);
      setSaveDialogOpen(false);
      setSaveName("");
      setSaveDescription("");
      hasFetched.current = false;
      fetchTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = (template: SavedTemplate) => {
    addToRecentTemplates(template.id);
    onLoadTemplate(template);
    // Update recent templates display
    const recentIds = getRecentTemplateIds();
    const recent = recentIds
      .map(id => templates.find(t => t.id === id))
      .filter((t): t is SavedTemplate => t !== undefined);
    setRecentTemplates(recent);
  };

  const handleDelete = async (template: SavedTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${template.name}"? This cannot be undone.`)) return;

    try {
      await deleteTemplate(template.id);
      hasFetched.current = false;
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLocalTemplate = (id: string) => id.startsWith("local-");

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Header with Save Button */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Projects</h3>
              <Button 
                size="sm" 
                onClick={() => setSaveDialogOpen(true)}
                className="h-7 text-xs"
              >
                <Save className="h-3 w-3 mr-1" />
                Save Current
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>

          {/* Recent Templates */}
          {recentTemplates.length > 0 && !searchQuery && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Clock className="h-3 w-3" />
                Recent
              </div>
              <div className="space-y-1">
                {recentTemplates.map((template) => (
                  <Card 
                    key={template.id}
                    className={cn(
                      "cursor-pointer hover:border-primary/50 transition-colors",
                      currentTemplateId === template.id && "border-primary bg-primary/5"
                    )}
                    onClick={() => handleLoad(template)}
                  >
                    <CardContent className="p-2.5 flex items-center gap-2">
                      <div className="p-1.5 rounded bg-muted">
                        <File className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{template.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(template.updated_at), "MMM d")}
                        </p>
                      </div>
                      {isLocalTemplate(template.id) ? (
                        <HardDrive className="h-3 w-3 text-amber-500 shrink-0" />
                      ) : (
                        <Cloud className="h-3 w-3 text-blue-500 shrink-0" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Templates */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <FolderOpen className="h-3 w-3" />
                All Templates ({filteredTemplates.length})
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  hasFetched.current = false;
                  fetchTemplates();
                }}
                disabled={loading}
              >
                <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
              </Button>
            </div>

            {loading && templates.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">
                  {searchQuery ? "No templates found" : "No saved templates"}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 h-7 text-xs"
                  onClick={() => setSaveDialogOpen(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Save First Template
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredTemplates.map((template) => (
                  <Card 
                    key={template.id}
                    className={cn(
                      "cursor-pointer group hover:border-primary/50 transition-colors",
                      currentTemplateId === template.id && "border-primary bg-primary/5"
                    )}
                    onClick={() => handleLoad(template)}
                  >
                    <CardContent className="p-2.5 flex items-center gap-2">
                      <div className="p-1.5 rounded bg-muted">
                        <File className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-medium truncate">{template.name}</p>
                          {currentTemplateId === template.id && (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">Open</Badge>
                          )}
                        </div>
                        {template.description && (
                          <p className="text-[10px] text-muted-foreground truncate">{template.description}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(template.updated_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {isLocalTemplate(template.id) ? (
                          <HardDrive className="h-3 w-3 text-amber-500" />
                        ) : (
                          <Cloud className="h-3 w-3 text-blue-500" />
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleLoad(template);
                            }}>
                              <FolderOpen className="h-3 w-3 mr-2" />
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => handleDelete(template, e)}
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
            <p className="font-medium mb-1">💡 Tip</p>
            <p>Templates are saved locally. Sign in to sync across devices.</p>
          </div>
        </div>
      </ScrollArea>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-base">Save Template</DialogTitle>
            <DialogDescription className="text-xs">
              Save your current work as a reusable template
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-3 py-3">
            <div className="grid gap-1.5">
              <Label htmlFor="name" className="text-xs">Name *</Label>
              <Input
                id="name"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="My Template"
                className="h-8 text-sm"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="description" className="text-xs">Description</Label>
              <Textarea
                id="description"
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                placeholder="Optional description..."
                rows={2}
                className="text-sm resize-none"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!saveName.trim() || saving}>
              {saving ? (
                <div className="animate-spin h-3 w-3 border-2 border-background border-t-transparent rounded-full mr-1" />
              ) : (
                <Save className="h-3 w-3 mr-1" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
