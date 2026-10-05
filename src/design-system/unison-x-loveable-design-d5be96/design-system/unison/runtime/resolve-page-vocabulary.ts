import type { SiteDesignContract } from '../contracts/site-design-contract';

export function resolvePageVocabulary(contract: SiteDesignContract, role: string) {
  const page = contract.pages[role] ?? contract.pages.custom;
  if (!page) return undefined;
  return {
    role: page.role,
    requiredFamilies: page.requiredFamilies,
    preferredFamilies: page.recommendedFamilies.filter((family) => contract.familyAffinity[family] === 'preferred'),
    discouragedFamilies: page.discouragedFamilies,
    discouragedTags: page.discouragedTags,
    /** Empty list = nothing approved yet: the project may write its own (recorded as a ProjectArtifact). */
    recommendedImplementations: Object.fromEntries([...page.requiredFamilies, ...page.recommendedFamilies].map((family) => [family, contract.allowedImplementations[family] ?? []])),
    unapprovedFamilies: [...page.requiredFamilies, ...page.recommendedFamilies].filter((family) => !(contract.allowedImplementations[family] ?? []).length),
    legalImplementations: Object.fromEntries([...page.requiredFamilies, ...page.recommendedFamilies].map((family) => [family, contract.allowedImplementations[family] ?? []])),
  };
}
