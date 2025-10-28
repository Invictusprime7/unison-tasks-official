import { supabase } from '@/integrations/supabase/client';
import type { ComponentDefinition } from '@/types/components';

export async function saveComponent(def: Omit<ComponentDefinition, 'id'|'createdAt'|'updatedAt'> & { thumbnail?: string | null }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const payload = {
    user_id: user.id,
    name: def.name,
    root_json: def.rootJson as never,
    thumbnail: def.thumbnail ?? null,
  };
  const { data, error } = await supabase
    .from('design_components')
    .insert(payload)
    .select('id, name, root_json, created_at, updated_at, thumbnail')
    .single();
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    rootJson: data.root_json,
    thumbnail: data.thumbnail ?? null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  } as ComponentDefinition;
}

export async function listComponents(): Promise<ComponentDefinition[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('design_components')
    .select('id, name, root_json, created_at, updated_at, thumbnail')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });
  if (error) return [];
  return (data || []).map((r) => ({ id: r.id, name: r.name, rootJson: r.root_json, thumbnail: r.thumbnail ?? null, createdAt: r.created_at, updatedAt: r.updated_at }));
}

export async function getComponent(id: string): Promise<ComponentDefinition | null> {
  const { data, error } = await supabase
    .from('design_components')
    .select('id, name, root_json, created_at, updated_at, thumbnail')
    .eq('id', id)
    .single();
  if (error) return null;
  return { id: data.id, name: data.name, rootJson: data.root_json, thumbnail: data.thumbnail ?? null, createdAt: data.created_at, updatedAt: data.updated_at };
}

export async function renameComponent(id: string, name: string) {
  const { error } = await supabase
    .from('design_components')
    .update({ name })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteComponent(id: string) {
  const { error } = await supabase
    .from('design_components')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
