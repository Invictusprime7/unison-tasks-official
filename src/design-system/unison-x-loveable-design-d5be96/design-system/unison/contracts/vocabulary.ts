import type { ExperiencePrimitive } from './runtime';

export type VocabularyCategory = 'hero' | 'content' | 'media' | 'background' | 'commerce' | 'motion' | 'navigation';

export interface VocabularyEntry {
  category: VocabularyCategory;
  id: string;
  primitives: readonly ExperiencePrimitive[];
}

const entries: VocabularyEntry[] = [
  { category: 'media', id: 'depth-gallery', primitives: ['DepthGallery'] },
  { category: 'hero', id: 'immersive-hero', primitives: ['ImmersiveHero'] },
  { category: 'commerce', id: 'product-stage', primitives: ['ProductStage'] },
  { category: 'background', id: 'scene-background', primitives: ['SceneBackground'] },
];

export function getVocabularyEntry(category: VocabularyCategory, id: string): VocabularyEntry | undefined {
  return entries.find((entry) => entry.category === category && entry.id === id);
}
