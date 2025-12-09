import { useState } from 'react';
import { useCRMWorkspace } from './CRMWorkspaceProvider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

export function WorkspaceSelector() {
  const { currentWorkspace, workspaces, setCurrentWorkspace, createWorkspace } = useCRMWorkspace();
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  async function handleCreate() {
    if (!newWorkspaceName.trim()) return;
    
    await createWorkspace(newWorkspaceName);
    setNewWorkspaceName('');
    setIsCreating(false);
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentWorkspace?.id}
        onValueChange={(id: string) => {
          const workspace = workspaces.find((w: any) => w.id === id);
          if (workspace) setCurrentWorkspace(workspace);
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select workspace" />
        </SelectTrigger>
        <SelectContent>
          {workspaces.map((workspace: any) => (
            <SelectItem key={workspace.id} value={workspace.id}>
              {workspace.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Workspace name"
              value={newWorkspaceName}
              onChange={(e: any) => setNewWorkspaceName(e.target.value)}
              onKeyDown={(e: any) => e.key === 'Enter' && handleCreate()}
            />
            <Button onClick={handleCreate} className="w-full">
              Create Workspace
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
