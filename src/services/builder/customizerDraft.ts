import type { ImageInfo, SectionInfo } from '@/hooks/useTemplateCustomizer';

export function hexToHslChannels(hex: string): string {
  const value = hex.replace(/^#/, '');
  const full = value.length === 3 ? [...value].map(c => c + c).join('') : value;
  if (!/^[a-f\d]{6}$/i.test(full)) throw new Error('Enter a valid hex color.');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min, l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  const h = d === 0 ? 0 : max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return `${Math.round(h * 60)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const SECTION_DATA = /const\s+SECTIONS\s*=\s*([\s\S]*?);\s*\r?\nconst\s+HYDRATABLE\b/;
export function readCustomizerSectionData(source: string): Array<Record<string, unknown>> | null {
  const match = source.match(SECTION_DATA);
  if (!match) return null;
  try { const value = JSON.parse(match[1]); return Array.isArray(value) ? value : null; } catch { return null; }
}

export function collectCustomizerImages(source: string): ImageInfo[] {
  const sections = readCustomizerSectionData(source);
  if (!sections) return [];
  const images: ImageInfo[] = [];
  function visit(value: unknown, path: string[]) {
    if (!value || typeof value !== 'object') return;
    for (const [key, entry] of Object.entries(value)) {
      if (path.length === 2 && key === 'image' && sections?.[Number(path[0])]?.variantId === 'hero:full-bleed' && (value as Record<string, unknown>).backgroundImage) continue;
      const next = [...path, key];
      if (typeof entry === 'string' && (/^(src|image|imageUrl|backgroundImage|photo|before|after|beforeImage|afterImage|avatar|avatarUrl|logo|cover|coverImage|thumbnail|thumbnailUrl)$/i.test(key) || (Array.isArray(value) && /^(images|photos)$/.test(path[path.length - 1]))) && entry) {
        images.push({ id: `data:${JSON.stringify(next)}`, src: entry,
          alt: String((value as Record<string, unknown>).alt ?? ''), selector: '', width: 'auto', height: 'auto' });
      } else visit(entry, next);
    }
  }
  sections.forEach((section, index) => visit(section.props, [String(index), 'props']));
  return images;
}

export function applyCustomizerSectionData(source: string, sections: SectionInfo[], images: ImageInfo[]): string {
  const data = readCustomizerSectionData(source);
  if (!data) return source;
  for (const image of images) {
    if (!image.id.startsWith('data:')) continue;
    const path = JSON.parse(image.id.slice(5)) as string[];
    let target: unknown = data;
    for (const key of path.slice(0, -1)) target = target && typeof target === 'object' ? (target as Record<string, unknown>)[key] : null;
    if (target && typeof target === 'object') {
      const record = target as Record<string, unknown>;
      const key = path[path.length - 1];
      const previous = record[key];
      record[key] = image.src;
      const section = data[Number(path[0])];
      if (path.length === 3 && section?.type === 'hero' && image.src !== previous) {
        if (key === 'image' && (section.variantId === 'hero:full-bleed' || record.backgroundImage === previous)) record.backgroundImage = image.src;
        if (key === 'backgroundImage' && record.image === previous) record.image = image.src;
      }
      if ('alt' in record || path[path.length - 1] === 'src') record.alt = image.alt;
    }
  }
  const order = new Map(sections.map(section => [section.id, section]));
  for (const entry of data) {
    const edited = order.get(String(entry.id));
    if (edited) entry.hidden = !edited.visible;
  }
  data.sort((a, b) => (order.get(String(a.id))?.order ?? 0) - (order.get(String(b.id))?.order ?? 0));
  return source.replace(SECTION_DATA, () => `const SECTIONS = ${JSON.stringify(data, null, 2)};\nconst HYDRATABLE`);
}

/** One file patch is shared by scratch compilation and Apply. Never mutates the live VFS. */
export function customizerFileChanges(files: Record<string, string>, pagePath: string, source: string, css: string) {
  if (!files[pagePath]) throw new Error('The selected page is no longer available.');
  const cssPath = pagePath.replace(/\.[^.]+$/, '.customizer.css');
  const fileName = cssPath.slice(cssPath.lastIndexOf('/') + 1);
  const cssImport = `import './${fileName}';`;
  const next = source.includes(cssImport) ? source : `${cssImport}\n${source}`;
  return { [pagePath]: next, [cssPath]: css };
}

/** Only serialized section data and the adjacent stylesheet import may change. */
export function isCustomizerPageEdit(before: string, after: string, pagePath: string): boolean {
  const name = pagePath.replace(/\.[^.]+$/, '.customizer.css').split('/').pop();
  const strip = (source: string) => source.replace(`import './${name}';\n`, '').replace(SECTION_DATA, 'const SECTIONS = [];\nconst HYDRATABLE');
  const original = readCustomizerSectionData(before), edited = readCustomizerSectionData(after);
  if (!original || !edited || original.length !== edited.length || strip(before) !== strip(after)) return false;
  const ids = new Set(edited.map(s => s.id));
  return ids.size === original.length && original.every(section => {
    const next = edited.find(s => s.id === section.id);
    if (!next) return false;
    const stable = ({ props: _props, hidden: _hidden, ...rest }: Record<string, unknown>) => rest;
    return JSON.stringify(stable(section)) === JSON.stringify(stable(next));
  });
}
