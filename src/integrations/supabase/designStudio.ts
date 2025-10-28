import { supabase } from '@/integrations/supabase/client';

export interface CanvasStateRecord {
  id: string;
  user_id: string;
  project_id?: string | null;
  page_id?: string | null;
  data: unknown;
  updated_at: string;
}

export async function saveCanvasState(params: { projectId?: string; pageId?: string; data: unknown }): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const payload = {
      user_id: user.id,
      project_id: params.projectId ?? null,
      page_id: params.pageId ?? null,
      data: params.data as never,
      updated_at: new Date().toISOString(),
    };
    // Upsert by user+project+page composite key if available
    const { error } = await supabase
      .from('canvas_states')
      .upsert(payload, { onConflict: 'user_id,project_id,page_id' });
    if (error) {
      console.warn('[designStudio] saveCanvasState failed', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[designStudio] saveCanvasState exception', e);
    return false;
  }
}

export async function loadCanvasState(params: { projectId?: string; pageId?: string }) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('canvas_states')
      .select('data')
      .eq('user_id', user.id)
      .eq('project_id', params.projectId ?? null)
      .eq('page_id', params.pageId ?? null)
      .single();
    if (error) return null;
    return data?.data ?? null;
  } catch {
    return null;
  }
}

export async function saveSnapshot(params: { projectId?: string; pageId?: string; data: unknown; title?: string }) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload = {
      user_id: user.id,
      project_id: params.projectId ?? null,
      page_id: params.pageId ?? null,
      data: params.data as never,
      title: params.title ?? null,
      created_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('canvas_snapshots').insert(payload);
    if (error) console.warn('[designStudio] saveSnapshot failed', error.message);
  } catch (e) {
    console.warn('[designStudio] saveSnapshot exception', e);
  }
}
