import type { TemplateLayoutContract } from './templateLayoutContract';

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
  _payload: unknown,
  fallback: WizardInteractionManifest,
): WizardInteractionManifest {
  return fallback;
}

export function buildWizardInteractionPlannerPrompt(_args: {
  contract: TemplateLayoutContract;
  industry: string;
  intents: string[];
}): string {
  return '';
}

export function compileWizardInteractionManifest(
  files: Record<string, string>,
  _manifest: WizardInteractionManifest,
): { files: Record<string, string>; mountedPages: string[] } {
  return { files: { ...files }, mountedPages: [] };
}

export function readWizardInteractionManifest(
  _files: Record<string, string>,
): WizardInteractionManifest | null {
  return null;
}

export function applyCanonicalInteractionEnrichment(
  files: Record<string, string>,
  _manifest?: WizardInteractionManifest | null,
): { files: Record<string, string>; manifest: WizardInteractionManifest | null; mountedPages: string[] } {
  return { files, manifest: null, mountedPages: [] };
}