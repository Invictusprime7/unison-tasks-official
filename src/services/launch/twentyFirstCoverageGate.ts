/**
 * 21st Generation Coverage Gate (V4 Milestone 5)
 *
 * Runs during launch planning, before Stage 4b, and answers one question:
 * can every visual section of this launch resolve to a certified 21st-derived
 * implementation that is portable, theme-compatible, artifact-bindable,
 * intent-legal and state-documented?
 *
 * It never substitutes, renders or writes anything — it reports. The launch
 * orchestrator decides what to do with the report (degrade note in production,
 * loud failure in development), keeping Stage 4b mandatory per M1.
 */

import { getGenerationVariantsForSection, getVariantById } from '@/sections/variants';
import type { ArtDirectionPack } from '@/sections/variants/artDirectionPacks';
import { componentStateContractIssues, resolveComponentStateContract } from '@/sections/variants/componentStates';
import { getArtifact } from '@/platform/core/artifactRegistry';
import type { SectionType } from '@/sections/types';
import type { VariantId } from '@/sections/variants/types';

export interface CoverageSectionReport {
  sectionType: SectionType;
  role: string;
  eligibleIds: VariantId[];
  selectedId?: VariantId;
  artifactId: string | null;
  intents: readonly string[];
  states: string[];
}

export interface TwentyFirstCoverageReport {
  ok: boolean;
  issues: string[];
  sections: CoverageSectionReport[];
}

export interface TwentyFirstCoverageInput {
  /** Visual section types the launch will compile, per page role. */
  pages: Array<{ role: string; sectionTypes: readonly SectionType[] }>;
  artDirectionPack?: ArtDirectionPack;
  /** Optional explicit picks (AI composition or template defaults). */
  selectedVariants?: Partial<Record<string, VariantId>>;
}

export function validateTwentyFirstGenerationCoverage(
  input: TwentyFirstCoverageInput,
): TwentyFirstCoverageReport {
  const issues: string[] = [];
  const sections: CoverageSectionReport[] = [];

  for (const page of input.pages) {
    for (const sectionType of page.sectionTypes) {
      const key = `${page.role}:${sectionType}`;
      const eligible = getGenerationVariantsForSection(sectionType, input.artDirectionPack, page.role);
      const artifact = getArtifact(sectionType);
      const selectedId = input.selectedVariants?.[key] ?? input.selectedVariants?.[sectionType];

      if (!eligible.length) {
        issues.push(`${key}: no certified 21st implementation is eligible for this role`);
      }

      for (const variant of eligible) {
        if (variant.source?.origin !== '21st') issues.push(`${key}: ${variant.id} is not 21st-derived`);
        if (variant.vfs?.mode !== 'portable-recipe') issues.push(`${key}: ${variant.id} has no portable VFS recipe`);
        if (variant.vfs?.certification !== 'approved') issues.push(`${key}: ${variant.id} is not certified`);
        if (variant.generationStatus === 'legacy') issues.push(`${key}: ${variant.id} is legacy-only`);
        issues.push(...componentStateContractIssues(variant).map(issue => `${key}: ${issue}`));
      }

      if (selectedId) {
        const selected = getVariantById(selectedId);
        if (!selected) issues.push(`${key}: selected ${selectedId} is not registered`);
        else if (!eligible.some(variant => variant.id === selectedId)) {
          issues.push(`${key}: selected ${selectedId} is not eligible for this role and pack`);
        }
      }

      if (artifact && artifact.dataSource.kind !== 'static' && !artifact.dataSource.surfaceId) {
        issues.push(`${key}: artifact ${artifact.artifactId} declares no bindable data surface`);
      }

      const head = eligible[0];
      sections.push({
        sectionType,
        role: page.role,
        eligibleIds: eligible.map(variant => variant.id),
        selectedId,
        artifactId: artifact?.artifactId ?? null,
        intents: artifact?.intentBindings ?? [],
        states: head ? [...resolveComponentStateContract(head).supported] : [],
      });
    }
  }

  return { ok: issues.length === 0, issues: [...new Set(issues)], sections };
}

/** One-line summary suitable for a launch build note. */
export function summarizeCoverageReport(report: TwentyFirstCoverageReport): string {
  if (report.ok) return `21st coverage verified for ${report.sections.length} section slots.`;
  return `21st coverage incomplete: ${report.issues.slice(0, 3).join('; ')}` +
    (report.issues.length > 3 ? ` (+${report.issues.length - 3} more)` : '');
}
