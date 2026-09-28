import type { SectionVariant, VocabularyRef } from '../../variants/types';

export function getImplementationVocabularyRefs(variant: SectionVariant): VocabularyRef[] {
  const refs = [...(variant.vocabularyRefs ?? [])];
  if (variant.vocabulary && !refs.some((ref) => ref.category === variant.vocabulary?.category && ref.id === variant.vocabulary?.id)) {
    refs.push(variant.vocabulary);
  }
  return refs;
}
