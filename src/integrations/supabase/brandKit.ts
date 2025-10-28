import { supabase } from '@/integrations/supabase/client';

export interface BrandKit {
  colors: string[];
  fonts: string[];
}

export async function getBrandKit(): Promise<BrandKit | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('brand_kits').select('colors, fonts').eq('user_id', user.id).maybeSingle();
  if (!data) return { colors: [], fonts: [] };
  return { colors: (data.colors as string[]) ?? [], fonts: (data.fonts as string[]) ?? [] };
}

export async function saveBrandKit(kit: BrandKit): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase.from('brand_kits').upsert({ user_id: user.id, colors: kit.colors as never, fonts: kit.fonts as never, updated_at: new Date().toISOString() });
  return !error;
}

