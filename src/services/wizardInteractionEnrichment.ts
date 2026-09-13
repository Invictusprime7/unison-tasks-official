import type { TemplateLayoutContract } from './templateLayoutContract';

export const WIZARD_INTERACTION_MANIFEST_PATH = '/.unison/interaction-manifest.json' as const;

export type WizardInteractionEffect =
  | 'hover-lift'
  | 'hover-glow'
  | 'reveal'
  | 'stagger-reveal'
  | 'click-feedback';

export type WizardInteractionTargetKind = 'template-root' | 'interactive' | 'intent';

export interface WizardInteractionRule {
  target: { kind: WizardInteractionTargetKind; value?: string };
  effect: WizardInteractionEffect;
}

export interface WizardInteractionManifest {
  version: '1.0';
  source: 'baseline' | 'ai';
  templateId: string;
  layoutSignature: string;
  industry: string;
  interactions: WizardInteractionRule[];
}

export function createBaselineInteractionManifest(
  _files: Record<string, string>,
  contract: TemplateLayoutContract,
): WizardInteractionManifest {
  return {
    version: '1.0',
    source: 'baseline',
    templateId: contract.templateId,
    layoutSignature: contract.signature,
    industry: contract.industry,
    interactions: [],
  };
}

export function parseWizardInteractionManifest(
  payload: unknown,
  fallback: WizardInteractionManifest,
): WizardInteractionManifest {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return fallback;
  const candidate = payload as Partial<WizardInteractionManifest>;
  if (
    candidate.version !== '1.0' ||
    (candidate.source !== 'baseline' && candidate.source !== 'ai') ||
    typeof candidate.templateId !== 'string' ||
    typeof candidate.layoutSignature !== 'string' ||
    typeof candidate.industry !== 'string' ||
    !Array.isArray(candidate.interactions)
  ) return fallback;

  const interactions = candidate.interactions.filter((rule): rule is WizardInteractionRule => (
    Boolean(rule) &&
    typeof rule === 'object' &&
    (rule.effect === 'hover-lift' ||
      rule.effect === 'hover-glow' ||
      rule.effect === 'reveal' ||
      rule.effect === 'stagger-reveal' ||
      rule.effect === 'click-feedback') &&
    Boolean(rule.target) &&
    typeof rule.target === 'object' &&
    (rule.target.kind === 'template-root' ||
      rule.target.kind === 'interactive' ||
      rule.target.kind === 'intent') &&
    (rule.target.value === undefined || typeof rule.target.value === 'string')
  ));

  return interactions.length === candidate.interactions.length
    ? {
        version: '1.0',
        source: candidate.source,
        templateId: candidate.templateId,
        layoutSignature: candidate.layoutSignature,
        industry: candidate.industry,
        interactions,
      }
    : fallback;
}

export function buildWizardInteractionPlannerPrompt(_args: {
  contract: TemplateLayoutContract;
  industry: string;
  intents: string[];
}): string {
  const { contract, industry, intents } = _args;
  return [
    'Return raw JSON only for a declarative WizardInteractionManifest.',
    'Version must be "1.0" and source must be "ai".',
    `templateId must be "${contract.templateId}" and layoutSignature must be "${contract.signature}".`,
    `industry must be "${industry}". Available intents: ${intents.join(', ') || 'none'}.`,
    'Use only effects: hover-lift, hover-glow, reveal, stagger-reveal, click-feedback.',
    'Use only target kinds: template-root, interactive, intent.',
    'Do not add routes, files, imports, dependencies, CSS, geometry, or page sections.',
    'Schema: {"version":"1.0","source":"ai","templateId":"...","layoutSignature":"...","industry":"...","interactions":[{"target":{"kind":"intent","value":"contact.submit"},"effect":"click-feedback"}]}',
  ].join('\n');
}

export function compileWizardInteractionManifest(
  files: Record<string, string>,
  manifest: WizardInteractionManifest,
): { files: Record<string, string>; mountedPages: string[] } {
  const nextFiles = {
    ...files,
    [WIZARD_INTERACTION_MANIFEST_PATH]: JSON.stringify(manifest, null, 2),
  };
  const mountedPages = Object.keys(files)
    .filter((path) => /^\/src\/pages\/[^/]+\.(?:tsx|ts|jsx|js)$/.test(path))
    .sort();
  return { files: nextFiles, mountedPages };
}

export function readWizardInteractionManifest(
  files: Record<string, string>,
): WizardInteractionManifest | null {
  const raw = files[WIZARD_INTERACTION_MANIFEST_PATH];
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<WizardInteractionManifest>;
    const fallback = createFallbackManifest(parsed);
    const manifest = parseWizardInteractionManifest(parsed, fallback);
    return manifest === fallback ? null : manifest;
  } catch {
    return null;
  }
}

export function applyCanonicalInteractionEnrichment(
  files: Record<string, string>,
  manifest?: WizardInteractionManifest | null,
): { files: Record<string, string>; manifest: WizardInteractionManifest | null; mountedPages: string[] } {
  const resolved = manifest ?? readWizardInteractionManifest(files);
  if (!resolved) return { files: { ...files }, manifest: null, mountedPages: [] };
  const compiled = compileWizardInteractionManifest(files, resolved);
  return { ...compiled, manifest: resolved };
}

function createFallbackManifest(payload: Partial<WizardInteractionManifest>): WizardInteractionManifest {
  return {
    version: '1.0',
    source: payload.source === 'ai' ? 'ai' : 'baseline',
    templateId: typeof payload.templateId === 'string' ? payload.templateId : '',
    layoutSignature: typeof payload.layoutSignature === 'string' ? payload.layoutSignature : '',
    industry: typeof payload.industry === 'string' ? payload.industry : '',
    interactions: [],
  };
}