import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Workspace {
  id: string;
  name: string;
  owner_id: string;
}

interface CRMWorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  isLoading: boolean;
  setCurrentWorkspace: (workspace: Workspace) => void;
  createWorkspace: (name: string) => Promise<void>;
}

const CRMWorkspaceContext = createContext<CRMWorkspaceContextType | null>(null);

export function CRMWorkspaceProvider({ children }: { children: ReactNode }) {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadWorkspaces();
  }, []);

  async function loadWorkspaces() {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        setIsLoading(false);
        return;
      }
      
      if (!user) {
        console.log('No user logged in');
        setIsLoading(false);
        return;
      }

      // Load user's projects (workspaces)
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, name, owner_id')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Loaded workspaces:', projects);
      setWorkspaces(projects || []);
      
      // Auto-select first workspace if available
      if (projects && projects.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(projects[0]);
        localStorage.setItem('currentWorkspaceId', projects[0].id);
      } else if (!projects || projects.length === 0) {
        console.log('No workspaces found - user may need to create one');
      }
    } catch (error: any) {
      console.error('Error loading workspaces:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load workspaces',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function createWorkspace(name: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert({ name, owner_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setWorkspaces((prev: Workspace[]) => [data, ...prev]);
      setCurrentWorkspace(data);
      
      toast({
        title: 'Success',
        description: `Workspace "${name}" created`,
      });
    } catch (error: any) {
      console.error('Error creating workspace:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }

  return (
    <CRMWorkspaceContext.Provider
      value={{
        currentWorkspace,
        workspaces,
        isLoading,
        setCurrentWorkspace,
        createWorkspace,
      }}
    >
      {children}
    </CRMWorkspaceContext.Provider>
  );
}

export function useCRMWorkspace() {
  const context = useContext(CRMWorkspaceContext);
  if (!context) {
    throw new Error('useCRMWorkspace must be used within CRMWorkspaceProvider');
  }
  return context;
}
