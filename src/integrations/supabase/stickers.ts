import { supabase } from '@/integrations/supabase/client';

export interface StickerItem {
  name: string;
  path: string;
  url: string;
}

export async function listStickers(prefix = ''): Promise<StickerItem[]> {
  const { data, error } = await supabase.storage.from('stickers').list(prefix, { limit: 100 });
  if (error || !data) return [];
  return data
    .filter((f) => f.name && !f.name.endsWith('/'))
    .map((f) => {
      const { data: pub } = supabase.storage.from('stickers').getPublicUrl(`${prefix}${prefix && !prefix.endsWith('/') ? '/' : ''}${f.name}`);
      return { name: f.name, path: `${prefix}/${f.name}`.replace(/^\//, ''), url: pub.publicUrl };
    });
}

export async function uploadSticker(file: File, prefix = ''): Promise<StickerItem | null> {
  const path = `${prefix ? prefix.replace(/\/+$/, '') + '/' : ''}${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from('stickers').upload(path, file, { upsert: false, cacheControl: '3600' });
  if (error) return null;
  const { data } = supabase.storage.from('stickers').getPublicUrl(path);
  return { name: file.name, path, url: data.publicUrl };
}

