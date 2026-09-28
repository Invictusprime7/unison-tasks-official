/**
 * Project artifact — the description a project records for a component it wrote
 * itself (when no recommended Unison design fits). Every fact is marked verified
 * (proven from source) or inferred (best guess). Artifacts stay project-owned;
 * only Unison-app projects may claim Builder editability.
 */
import type { SectionType } from '../../types';

export type FactProof = 'verified' | 'inferred';
export interface ArtifactFact<T> { value: T; proof: FactProof; evidence?: string }

export type EditabilityLevel = 'none' | 'text' | 'props' | 'semantic';

export interface ProjectArtifact {
  id: string;
  family: SectionType;
  sourceFile: string;
  revision: string;
  owner: 'project' | 'unison-app';
  businessPurpose: string;
  usage: string[];
  dependencies: string[];
  brokenImports?: string[];
  editability: {
    level: EditabilityLevel;
    builderEditable?: boolean;
    fields: { name: string; location: ArtifactFact<string> }[];
  };
  hardLimits: {
    semanticHtml: boolean;
    keyboard: boolean;
    visibleFocus: boolean;
    reducedMotion: boolean;
    responsive: boolean;
  };
}

/** Blocking problems with an artifact description. */
export function projectArtifactIssues(a: ProjectArtifact): string[] {
  const issues: string[] = [];
  if (!a.sourceFile || !a.revision || !a.businessPurpose.trim()) issues.push(`${a.id}: description needs sourceFile, revision and businessPurpose`);
  for (const [limit, ok] of Object.entries(a.hardLimits)) if (!ok) issues.push(`${a.id}: breaks hard limit "${limit}"`);
  if (a.brokenImports?.length) issues.push(`${a.id}: broken imports ${a.brokenImports.join(', ')} — keep the last good revision`);
  if (a.editability.level !== 'none' && !a.editability.fields.some((f) => f.location.proof === 'verified')) {
    issues.push(`${a.id}: editability "${a.editability.level}" needs at least one verified field`);
  }
  if (a.editability.builderEditable && a.owner !== 'unison-app') issues.push(`${a.id}: only Unison-app projects may claim Builder editability`);
  return issues;
}
