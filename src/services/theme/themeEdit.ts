import { buildThemedIndexCss } from '@/components/onboarding/themePresetToIndexCss';
import { z } from 'zod';
import type { SiteBundleSnapshot } from '@/platform/core/canonicalPipeline';
import { THEME_PRESETS } from '@/components/onboarding/themePresets';
import { themePresetToThemeTokens } from '@/components/onboarding/themePresetToTokens';
import { resolveArtDirectionPackId } from '@/sections/variants/artDirectionPacks';
import { projectResolvedArtDirection, readSealedArtDirection } from '@/sections/variants/resolvedArtDirection';
import { readThemeContract, buildThemeContract, buildThemeContractFiles } from '@/platform/core/themeContract';
import { isEditableThemeToken, readCompiledTokenValues, validateThemeTypography, isLegalThemeTokenValue, readThemeOverrides, serializeThemeOverrides, THEME_OVERRIDES_PATH } from './themeTokenOverrides';

export const themeEditSchema = z.object({
  version: z.literal('1.0'), snapshotId: z.string().min(1), revisionId: z.string().nullable(),
  // The theme lane may explicitly return null when it is changing tokens
  // inside the current preset rather than selecting a different preset.
  presetId: z.enum(['modern', 'editorial', 'futuristic', 'minimalist', 'bold', 'organic']).nullable().optional(),
  set: z.record(z.string(), z.string()).default({}), reset: z.array(z.string()).default([]),
}).strict();
export type ThemeEdit = z.infer<typeof themeEditSchema>;

export function isThemeOnlyRequest(prompt: string): boolean {
  prompt = prompt.replace(/\b(?:keep|preserve|leave|without changing)\b[^.!?]*(?=[.!?]|$)/gi, '');
  if (/\b(add|remove|delete|reorder|rewrite|replace|move)\b.{0,30}\b(section|page|text|copy|heading|headline|image|photo|gallery|form|navigation)\b|\b(layout|grid|columns|booking|checkout)\b/i.test(prompt)) return false;
  return /\b(theme|palette|typography|font|typeface|appearance|aesthetic|style|headings?|colou?r|darker|lighter|contrast|rounder|corners|restyle)\b|\b(?:use|switch to|make it|make (?:the )?site)\s+(?:more\s+)?(?:bold|organic|modern|editorial|futuristic|minimal(?:ist)?)\b/i.test(prompt);
}

export function decodeThemeEdit(response: unknown): ThemeEdit {
  let value = response;
  if (value && typeof value === 'object' && 'content' in value) value = (value as { content: unknown }).content;
  if (typeof value === 'string') value = JSON.parse(value.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
  return themeEditSchema.parse(value);
}

export function prepareThemeEdit(files: Record<string, string>, snapshot: SiteBundleSnapshot, proposal: unknown, revisionId: string | null) {
  const edit = themeEditSchema.parse(proposal);
  if (edit.snapshotId !== snapshot.snapshotId || edit.revisionId !== revisionId) throw new Error('This theme proposal is stale. Request the change again from the current revision.');
  const presetId = edit.presetId ?? snapshot.meta.themePresetId;
  const preset = THEME_PRESETS.find((p) => p.id === presetId);
  if (!preset) throw new Error('The saved site has no recognized preset. Select a theme before restyling.');
  const packId = edit.presetId ? resolveArtDirectionPackId({ themePresetId: preset.id, seed: snapshot.meta.designIntervention?.seed ?? snapshot.meta.renderHash ?? preset.id }) : (readSealedArtDirection(snapshot.meta)?.storagePackId ?? snapshot.meta.artDirectionPackId);
  const contract = buildThemeContract({ themePresetId: preset.id, artDirectionPackId: packId });
  const overrides = edit.presetId ? {} : readThemeOverrides(files);
  for (const name of edit.reset) {
    if (!contract.tokenNames.includes(name) || !isEditableThemeToken(name)) throw new Error('Unknown theme token: ' + name);
    delete overrides[name];
  }
  for (const [name, value] of Object.entries(edit.set)) {
    if (!contract.tokenNames.includes(name) || !isLegalThemeTokenValue(name, value, contract)) throw new Error('Invalid theme value for ' + name + '. Use the supplied token type and bounds.');
    overrides[name] = value.trim();
  }
  validateThemeTypography({ ...readCompiledTokenValues(edit.presetId ? buildThemedIndexCss(preset) : files['/src/index.css'] ?? ''), ...overrides });
  const themeTokens = edit.presetId ? themePresetToThemeTokens(preset) : snapshot.themeTokens;
  const intervention = snapshot.meta.designIntervention ? { ...snapshot.meta.designIntervention, themePresetId: preset.id, artDirectionPackId: contract.artDirectionPackId } : undefined;
  const artDirection = projectResolvedArtDirection({ ...(intervention ?? {}), themePresetId: preset.id, artDirectionPackId: contract.artDirectionPackId });
  const next = { ...snapshot, themeTokens, ...(snapshot.appContext ? { appContext: { ...snapshot.appContext, themePresetId: preset.id } } : {}), meta: { ...snapshot.meta, themeStyleVersion: '2.0' as const, themePresetId: preset.id, selectedThemeId: preset.id, artDirectionPackId: contract.artDirectionPackId, artDirection, ...(intervention ? { designIntervention: intervention } : {}) } };
  const nextFiles = { ...files, ...buildThemeContractFiles({ themePresetId: preset.id, artDirectionPackId: contract.artDirectionPackId }), [THEME_OVERRIDES_PATH]: serializeThemeOverrides(overrides) };
  if (intervention) nextFiles['/.unison/design-intervention.json'] = JSON.stringify(intervention, null, 2);
  nextFiles['/.unison/site-bundle-snapshot.json'] = JSON.stringify(next, null, 2);
  return { snapshot: next, files: nextFiles };
}

export function prepareThemeCorrection(files: Record<string, string>, snapshot: SiteBundleSnapshot, revisionId: string | null) {
  if (snapshot.meta.themeStyleVersion === '2.0') return { snapshot, files };
  const presetId = snapshot.meta.themePresetId ?? snapshot.appContext?.themePresetId ?? readThemeContract(files)?.themePresetId;
  // Without a persisted selection there is no authority to infer a replacement theme.
  if (!THEME_PRESETS.some(p => p.id === presetId)) return { snapshot, files };
  const corrected = prepareThemeEdit(files, snapshot, { version: '1.0', snapshotId: snapshot.snapshotId, revisionId, presetId, set: readThemeOverrides(files), reset: [] }, revisionId);
  corrected.snapshot.meta.themeStyleVersion = '2.0';
  corrected.files['/.unison/site-bundle-snapshot.json'] = JSON.stringify(corrected.snapshot, null, 2);
  return corrected;
}
