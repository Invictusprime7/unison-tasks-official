/**
 * Canonical promotion audit.
 *
 * Status is DERIVED here from registry source + checked-in certification
 * evidence. Nothing in the UI can set it. The only way to change a status is to
 * edit the registry / component source and re-run certification.
 */
import { ART_DIRECTION_PACKS, ART_DIRECTION_PACK_IDS, type ArtDirectionPackId } from '../../variants/artDirectionPacks';
import { componentStateContractIssues } from '../../variants/componentStates';
import { PAGE_ARCHETYPES } from '../../pageArchetypeContract';
import { ART_DIRECTION_FAMILY_REGISTRY, themeFamiliesForPack, type ThemeFamilyId } from '../contracts/theme-family';
import { familyForSection, getSectionTypesWithVariants, getVariantById, getVariantsForSection } from '../../variants/registry';
import { portableRecipeOnly } from '../../variants/portableRecipeOnly';
import type { SectionVariant, VariantId } from '../../variants/types';
import evidenceFile from '../certification/evidence.json';
import { PUBLIC_IMPLEMENTATIONS } from '../../variants/public';

export type GateResult = 'pass' | 'fail' | 'unproven';
export type ImplementationStatus = 'canonical' | 'experimental' | 'quarantined' | 'retired';
export type GateId =
  | 'identity' | 'react-implementation' | 'portable-recipe' | 'artifact' | 'slots' | 'intents' | 'states'
  | 'dependencies' | 'accessibility' | 'responsive' | 'reduced-motion' | 'theme-family' | 'art-direction'
  | 'page-archetype' | 'experience' | 'provenance' | 'consumer-build';

export interface Gate { id: GateId; label: string; result: GateResult; detail: string; safeRepair: boolean }

export interface EvidenceCheck { pass: boolean; detail: string }
export interface ImplementationEvidence {
  certifiedAt: string;
  sourceHash: string;
  checks: Partial<Record<'render' | 'slots' | 'intents' | 'accessibility' | 'responsive' | 'reduced-motion' | 'dependencies', EvidenceCheck>>;
  consumer?: EvidenceCheck & { at: string };
}

export interface PromotionAudit {
  id: VariantId;
  family: string;
  status: ImplementationStatus;
  registryState: { certification?: string; generationStatus?: string; recipeMode?: string };
  gates: Gate[];
  blockers: Gate[];
  themeFamilies: ThemeFamilyId[];
  packs: ArtDirectionPackId[];
  experiences: string[];
  evidence?: ImplementationEvidence;
}

const EVIDENCE = evidenceFile as Record<string, ImplementationEvidence>;
const SAFE: GateId[] = ['portable-recipe', 'artifact', 'dependencies'];

const fromEvidence = (ev: ImplementationEvidence | undefined, key: keyof ImplementationEvidence['checks'], label: string): Pick<Gate, 'result' | 'detail'> => {
  const check = ev?.checks[key];
  if (!check) return { result: 'unproven', detail: `No executable evidence for ${label}. Run certification.` };
  return { result: check.pass ? 'pass' : 'fail', detail: check.detail };
};

export function packsForImplementation(variant: SectionVariant): ArtDirectionPackId[] {
  return ART_DIRECTION_PACK_IDS.filter((id) => familyForSection(ART_DIRECTION_PACKS[id], variant.sectionType).includes(variant.id));
}

/** Every gate for one implementation. Pure function of source + evidence. */
export function auditImplementation(id: VariantId): PromotionAudit | undefined {
  const v = getVariantById(id);
  if (!v) return undefined;
  const ev = EVIDENCE[id];
  const packs = packsForImplementation(v);
  const themeFamilies = [...new Set(packs.flatMap((p) => themeFamiliesForPack(p)))];
  const experiences = [...new Set(packs.flatMap((p) => ART_DIRECTION_FAMILY_REGISTRY[p]?.experiences ?? []))];
  const stateIssues = componentStateContractIssues(v);
  const roles = v.pageRoles ?? [];
  const unknownRoles = roles.filter((r) => !(r in PAGE_ARCHETYPES));
  const g = (id: GateId, label: string, r: Pick<Gate, 'result' | 'detail'>): Gate => ({ id, label, ...r, safeRepair: SAFE.includes(id) && r.result !== 'pass' });

  const gates: Gate[] = [
    g('identity', 'Registered identity', v.id === `${v.sectionType}:${v.slug}` ? { result: 'pass', detail: `${v.id} = family:slug` } : { result: 'fail', detail: `id ${v.id} does not match ${v.sectionType}:${v.slug}` }),
    g('react-implementation', 'React implementation', typeof v.component === 'function' ? fromEvidence(ev, 'render', 'server render') : { result: 'fail', detail: 'No component bound' }),
    g('portable-recipe', 'Portable recipe', v.vfs?.mode !== 'portable-recipe' ? { result: 'fail', detail: `recipe mode is ${v.vfs?.mode ?? 'missing'}` }
      : v.renderJSX !== portableRecipeOnly ? { result: 'fail', detail: 'Still bound to a legacy JSX string renderer (renderJSX). Safe repair: link to portableRecipeOnly.' }
      : { result: 'pass', detail: 'portable-recipe, single React renderer' }),
    g('artifact', 'Artifact / public export', ev?.checks.render?.pass && isPubliclyExported(id) ? { result: 'pass', detail: 'Exported through the public barrel' } : { result: 'fail', detail: isPubliclyExported(id) ? 'Exported but not render-verified' : 'Not exported through PUBLIC_IMPLEMENTATIONS (applied on promotion)' }),
    g('slots', 'Editable slot coverage', fromEvidence(ev, 'slots', 'data-ut-slot coverage')),
    g('intents', 'Interaction intent coverage', fromEvidence(ev, 'intents', 'data-ut-intent coverage')),
    g('states', 'Component state contract', stateIssues.length ? { result: 'fail', detail: stateIssues.join('; ') } : { result: 'pass', detail: 'default/hover/focus + reduced-motion state derived' }),
    g('dependencies', 'Dependency closure', fromEvidence(ev, 'dependencies', 'import closure')),
    g('accessibility', 'Accessibility (rendered markup)', fromEvidence(ev, 'accessibility', 'accessibility')),
    g('responsive', 'Responsive behaviour', fromEvidence(ev, 'responsive', 'responsive')),
    g('reduced-motion', 'Reduced-motion behaviour', fromEvidence(ev, 'reduced-motion', 'reduced motion')),
    g('theme-family', 'Theme Family compatibility', themeFamilies.length ? { result: 'pass', detail: themeFamilies.join(', ') } : { result: 'fail', detail: 'No pack family admits this implementation' }),
    g('art-direction', 'Art Direction Pack eligibility', packs.length ? { result: 'pass', detail: `${packs.length} packs: ${packs.join(', ')}` } : { result: 'fail', detail: 'Declared by no Art Direction Pack family' }),
    g('page-archetype', 'Page Archetype compatibility', !roles.length ? { result: 'unproven', detail: 'No pageRoles declared — page-role fit is an authoring decision, not auto-claimed' } : unknownRoles.length ? { result: 'fail', detail: `Unknown roles: ${unknownRoles.join(', ')}` } : { result: 'pass', detail: roles.join(', ') }),
    g('experience', 'Experience compatibility', experiences.length ? { result: 'pass', detail: experiences.join(', ') } : { result: 'fail', detail: 'No experience profile via its packs' }),
    g('provenance', 'Provenance', !v.source?.origin ? { result: 'unproven', detail: 'No declared origin. Provenance must be authored, never inferred.' }
      : v.source.origin === '21st' && !v.source.sourceId ? { result: 'fail', detail: '21st origin without sourceId' }
      : { result: 'pass', detail: v.source.origin === '21st' ? `21st ${v.source.sourceId}${v.source.license ? ` (${v.source.license})` : ''}` : 'Unison-authored' }),
    g('consumer-build', 'Consumer-build verification', !ev?.consumer ? { result: 'unproven', detail: 'Consumer smoke test not run' } : { result: ev.consumer.pass ? 'pass' : 'fail', detail: ev.consumer.detail }),
  ];
  const blockers = gates.filter((gate) => gate.result !== 'pass');
  return {
    id, family: v.sectionType, status: deriveStatusFrom(v, blockers.length),
    registryState: { certification: v.vfs?.certification, generationStatus: v.generationStatus, recipeMode: v.vfs?.mode },
    gates, blockers, themeFamilies, packs, experiences, evidence: ev,
  };
}

function deriveStatusFrom(v: SectionVariant, blockerCount: number): ImplementationStatus {
  if (v.generationStatus === 'retired') return 'retired';
  const approved = v.vfs?.certification === 'approved' && v.vfs.mode === 'portable-recipe';
  if (approved && v.generationStatus === 'preferred' && blockerCount === 0) return 'canonical';
  if (approved && v.generationStatus === 'supported') return 'experimental';
  return 'quarantined';
}

export function deriveStatus(id: VariantId): ImplementationStatus {
  return auditImplementation(id)?.status ?? 'quarantined';
}

export function auditAll(): PromotionAudit[] {
  return getSectionTypesWithVariants().flatMap((f) => getVariantsForSection(f).map((v) => auditImplementation(v.id)!));
}

function isPubliclyExported(id: string) { return id in PUBLIC_IMPLEMENTATIONS; }
