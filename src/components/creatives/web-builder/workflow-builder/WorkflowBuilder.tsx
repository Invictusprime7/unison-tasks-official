/**
 * WorkflowBuilder Component
 * 
 * Main visual workflow builder with toolbar, canvas, and sidebar.
 * Allows users to create, edit, and manage automation workflows.
 */

import React, { useCallback, useState } from 'react';
import {
  Zap,
  Play,
  GitBranch,
  Clock,
  Target,
  Save,
  Undo,
  Redo,
  Plus,
  ChevronDown,
  FileUp,
  FileDown,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { WorkflowCanvas } from './WorkflowCanvas';
import { WorkflowSidebar } from './WorkflowSidebar';
import type {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  NodeType,
  Position,
} from './types';
import { NODE_TEMPLATES } from './types';

interface WorkflowBuilderProps {
  workflowId?: string;
  projectId?: string;
  industry?: string;
  onSave?: (workflow: Workflow) => Promise<void>;
  onClose?: () => void;
}

// Generate unique IDs
const generateId = () => `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const generateEdgeId = () => `edge_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// Create empty workflow
const createEmptyWorkflow = (projectId?: string, industry?: string): Workflow => ({
  id: `wf_${Date.now()}`,
  name: 'New Workflow',
  description: '',
  nodes: [],
  edges: [],
  isActive: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  projectId,
  industry,
});

export function WorkflowBuilder({
  workflowId,
  projectId,
  industry,
  onSave,
  onClose,
}: WorkflowBuilderProps) {
  // State
  const [workflow, setWorkflow] = useState<Workflow>(() =>
    createEmptyWorkflow(projectId, industry)
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<Workflow[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Save to history for undo/redo
  const saveToHistory = useCallback((newWorkflow: Workflow) => {
    setHistory(prev => [...prev.slice(0, historyIndex + 1), { ...workflow }]);
    setHistoryIndex(prev => prev + 1);
  }, [workflow, historyIndex]);

  // Update workflow with history tracking
  const updateWorkflow = useCallback((updates: Partial<Workflow>) => {
    setWorkflow(prev => {
      saveToHistory(prev);
      return { ...prev, ...updates, updatedAt: new Date().toISOString() };
    });
  }, [saveToHistory]);

  // Undo/Redo
  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = useCallback(() => {
    if (canUndo) {
      setWorkflow(history[historyIndex]);
      setHistoryIndex(prev => prev - 1);
    }
  }, [canUndo, history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      setHistoryIndex(prev => prev + 1);
      setWorkflow(history[historyIndex + 1]);
    }
  }, [canRedo, history, historyIndex]);

  // Add node
  const addNode = useCallback((type: NodeType) => {
    const template = NODE_TEMPLATES[type];
    
    // Calculate position for new node
    const existingNodes = workflow.nodes;
    const newX = existingNodes.length > 0
      ? Math.max(...existingNodes.map(n => n.position.x)) + 250
      : 100;
    const newY = 100;

    const newNode: WorkflowNode = {
      id: generateId(),
      type,
      label: `${template.label} ${existingNodes.filter(n => n.type === type).length + 1}`,
      position: { x: newX, y: newY },
      config: {},
      isStart: type === 'trigger' && !existingNodes.some(n => n.type === 'trigger'),
    };

    updateWorkflow({
      nodes: [...workflow.nodes, newNode],
    });

    // Auto-select new node
    setSelectedNodeId(newNode.id);
  }, [workflow.nodes, updateWorkflow]);

  // Update node
  const updateNode = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === nodeId
          ? { ...node, ...updates }
          : node
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Delete node
  const deleteNode = useCallback((nodeId: string) => {
    saveToHistory(workflow);
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      edges: prev.edges.filter(e => e.sourceId !== nodeId && e.targetId !== nodeId),
      updatedAt: new Date().toISOString(),
    }));
    setSelectedNodeId(null);
  }, [workflow, saveToHistory]);

  // Add edge
  const addEdge = useCallback((sourceId: string, targetId: string, sourceHandle?: 'true' | 'false') => {
    // Prevent duplicate edges
    const exists = workflow.edges.some(
      e => e.sourceId === sourceId && e.targetId === targetId
    );
    if (exists) return;

    // Prevent self-loops
    if (sourceId === targetId) return;

    const newEdge: WorkflowEdge = {
      id: generateEdgeId(),
      sourceId,
      targetId,
      sourceHandle,
    };

    updateWorkflow({
      edges: [...workflow.edges, newEdge],
    });
  }, [workflow.edges, updateWorkflow]);

  // Delete edge
  const deleteEdge = useCallback((edgeId: string) => {
    updateWorkflow({
      edges: workflow.edges.filter(e => e.id !== edgeId),
    });
  }, [workflow.edges, updateWorkflow]);

  // Save workflow
  const handleSave = useCallback(async () => {
    if (!onSave) {
      toast.info('Save not configured');
      return;
    }

    // Validate workflow has at least one trigger
    if (!workflow.nodes.some(n => n.type === 'trigger')) {
      toast.error('Workflow must have at least one trigger');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(workflow);
      toast.success('Workflow saved');
    } catch (error) {
      toast.error('Failed to save workflow');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [workflow, onSave]);

  // Toggle active
  const toggleActive = useCallback(() => {
    setWorkflow(prev => ({
      ...prev,
      isActive: !prev.isActive,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Export workflow
  const exportWorkflow = useCallback(() => {
    const json = JSON.stringify(workflow, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Workflow exported');
  }, [workflow]);

  // Import workflow
  const importWorkflow = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (imported.nodes && imported.edges) {
            saveToHistory(workflow);
            setWorkflow({
              ...imported,
              id: workflow.id, // Keep current ID
              projectId,
              industry,
              updatedAt: new Date().toISOString(),
            });
            toast.success('Workflow imported');
          } else {
            toast.error('Invalid workflow file');
          }
        } catch {
          toast.error('Failed to parse workflow file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [workflow, projectId, industry, saveToHistory]);

  // Clear workflow
  const clearWorkflow = useCallback(() => {
    saveToHistory(workflow);
    setWorkflow(createEmptyWorkflow(projectId, industry));
    setSelectedNodeId(null);
    toast.info('Workflow cleared');
  }, [workflow, projectId, industry, saveToHistory]);

  const selectedNode = workflow.nodes.find(n => n.id === selectedNodeId) || null;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
        <div className="flex items-center gap-3">
          {/* Workflow name */}
          <Input
            className="w-48 h-8 text-sm font-medium"
            value={workflow.name}
            onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Workflow name"
          />

          {/* Add node dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Step
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => addNode('trigger')}>
                <Zap className="w-4 h-4 mr-2 text-green-500" />
                Trigger
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode('action')}>
                <Play className="w-4 h-4 mr-2 text-blue-500" />
                Action
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode('condition')}>
                <GitBranch className="w-4 h-4 mr-2 text-amber-500" />
                Condition
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode('wait')}>
                <Clock className="w-4 h-4 mr-2 text-purple-500" />
                Wait
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode('goal')}>
                <Target className="w-4 h-4 mr-2 text-pink-500" />
                Goal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              disabled={!canUndo}
              onClick={handleUndo}
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              disabled={!canRedo}
              onClick={handleRedo}
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Import/Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <FileUp className="w-4 h-4 mr-1" />
                File
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={importWorkflow}>
                <FileDown className="w-4 h-4 mr-2" />
                Import
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportWorkflow}>
                <FileUp className="w-4 h-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearWorkflow} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Active toggle */}
          <div className="flex items-center gap-2">
            <Label htmlFor="active-toggle" className="text-sm">
              Active
            </Label>
            <Switch
              id="active-toggle"
              checked={workflow.isActive}
              onCheckedChange={toggleActive}
            />
          </div>

          {/* Save */}
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Canvas */}
        <WorkflowCanvas
          workflow={workflow}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onUpdateNode={updateNode}
          onAddEdge={addEdge}
          onDeleteEdge={deleteEdge}
          className="flex-1"
        />

        {/* Sidebar */}
        <WorkflowSidebar
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onUpdateNode={updateNode}
          onDeleteNode={deleteNode}
        />
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/50 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{workflow.nodes.length} nodes</span>
          <span>{workflow.edges.length} connections</span>
          <span>
            Triggers: {workflow.nodes.filter(n => n.type === 'trigger').length}
          </span>
          <span>
            Actions: {workflow.nodes.filter(n => n.type === 'action').length}
          </span>
        </div>
        <div>
          Last saved: {new Date(workflow.updatedAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
