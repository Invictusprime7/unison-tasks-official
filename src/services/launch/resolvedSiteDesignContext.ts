/**
 * ResolvedSiteDesignContext — AI Composer milestone, Phase 1.
 *
 * One deterministic compile that joins the three existing design authorities:
 *   • compileSiteDesignContract   (pack, archetypes, industry dialect)
 *   • resolveExperienceEnvelope   (experience profile)
 *   • listLegalImplementations    (certification legality)
 *
 * It adds no registry, resolver or writer — it is a projection. It separates
 * HARD LEGALITY (what may never be generated) from CREATIVE RECOMMENDATION
 * (preferred vocabulary the AI composer may exceed with local components).
 * No AI code is written from here yet.
 */

import type { SectionType } from '@/sections/types';
import type { BusinessModel } from '@/types/playground';
import {
  compileSiteDesignContract,
  type CompileSiteDesignContractInput,
  type SiteDesignContract,
} from '@/services/launch/siteDesignContract';
import {
  resolveExperienceEnvelope,
  type ExperienceEnvelope,
  type ExperienceEnvelopeInput,
} from '@/services/experienceCapabilityResolver';
import {
  listLegalImplementations,
  resolveLegalImplementation,
} from '@/platform/core/resolvedImplementationContract';
import { VARIANT_REGISTRY } from '@/sections/variants/registry';

export const RESOLVED_SITE_DESIGN_CONTEXT_VERSION = '1.0' as const;

export interface ResolvedSiteDesignContextInput extends CompileSiteDesignContractInput {
  /** Deterministic design seed (never wizardSeedId). */
  designSeed: string;
  businessModel: BusinessModel;
  experienceInput?: Omit<ExperienceEnvelopeInput, 'seed' | 'businessModel' | 'industry'>;
}

export interface ResolvedSiteDesignContext {
  version: typeof RESOLVED_SITE_DESIGN_CONTEXT_VERSION;
  designSeed: string;
  contract: SiteDesignContract;
  experience: ExperienceEnvelope;
  /** Ids that must never be generated (retired, uncertified, unregistered). */
  hardLegality: { forbiddenImplementations: Readonly<Partial<Record<SectionType, readonly string[]>>> };
  /** Preferred vocabulary — a quality floor, not a creative ceiling. */
  creativeRecommendation: {
    preferredImplementations: Readonly<Partial<Record<SectionType, readonly string[]>>>;
    localComponentsPermitted: true;
    guidance: string;
  };
  /** Stable fingerprint: identical inputs ⇒ identical value. */
  fingerprint: string;
}

const GUIDANCE =
  'Prefer these implementations when they strongly satisfy the composition. ' +
  'You may author project-local components when they do not. Never use forbidden implementations.';

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as object).sort()
      .map((k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

function fnv1a(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function compileResolvedSiteDesignContext(
  input: ResolvedSiteDesignContextInput,
): ResolvedSiteDesignContext {
  const contract = compileSiteDesignContract(input);
  const experience = resolveExperienceEnvelope({
    ...(input.experienceInput ?? {}),
    seed: input.designSeed,
    businessModel: input.businessModel,
    industry: contract.industry,
    immersiveRequested: input.experienceInput?.immersiveRequested ?? contract.experience === 'immersive',
  });

  const families = Object.keys(contract.familyAffinity) as SectionType[];
  const preferred: Partial<Record<SectionType, string[]>> = {};
  const forbidden: Partial<Record<SectionType, string[]>> = {};

  for (const family of families) {
    const inPack = new Set(contract.allowedImplementations[family] ?? []);
    const legal = listLegalImplementations(family, { industry: contract.industry }).map((c) => c.implementationId);
    const ranked = [...legal.filter((id) => inPack.has(id)), ...legal.filter((id) => !inPack.has(id))];
    if (ranked.length) preferred[family] = ranked;

    const illegal = (VARIANT_REGISTRY[family] ?? [])
      .map((variant) => variant.id)
      .filter((id) => !resolveLegalImplementation(id, 'fresh-generation').legal)
      .sort();
    if (illegal.length) forbidden[family] = illegal;
  }

  const body = {
    version: RESOLVED_SITE_DESIGN_CONTEXT_VERSION,
    designSeed: input.designSeed,
    contract,
    experience,
    hardLegality: { forbiddenImplementations: forbidden },
    creativeRecommendation: {
      preferredImplementations: preferred,
      localComponentsPermitted: true as const,
      guidance: GUIDANCE,
    },
  };
  return { ...body, fingerprint: fnv1a(stableStringify(body)) };
}
