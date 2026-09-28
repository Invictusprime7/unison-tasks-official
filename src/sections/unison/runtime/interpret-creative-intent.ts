/**
 * Deterministic, rule-based brief interpreter. The same brief always gives the
 * same profile, affinity and mode. An optional AI step may add detail later but
 * must never change the mode chosen here.
 */
import { ART_DIRECTION_PACK_IDS, type ArtDirectionPackId } from '../../variants/artDirectionPacks';
import {
  resolutionModeFor, type AffinityScore, type CreativeAffinity, type CreativeIntentProfile, type CreativeResolutionMode,
} from '../contracts/creative-intent';
import { ART_DIRECTION_FAMILY_REGISTRY, THEME_FAMILY_IDS, type ThemeFamilyId } from '../contracts/theme-family';

type Weights = Partial<Record<ArtDirectionPackId, number>>;

/** word stem → pack weights. Stems match the start of a word. */
const PACK_LEXICON: Record<string, Weights> = {
  cinematic: { 'cinematic-portfolio': 2 }, film: { 'cinematic-portfolio': 2 }, movie: { 'cinematic-portfolio': 2 }, reel: { 'cinematic-portfolio': 1 },
  dark: { 'editorial-noir': 1, 'noir-atelier': 1 }, noir: { 'editorial-noir': 2, 'noir-atelier': 1 }, moody: { 'noir-atelier': 2 }, dramatic: { 'editorial-noir': 1, 'cinematic-portfolio': 1 },
  atelier: { 'noir-atelier': 2 }, fashion: { 'noir-atelier': 1, 'luxury-minimal': 1 },
  luxur: { 'luxury-minimal': 2 }, elegan: { 'luxury-minimal': 2 }, refined: { 'luxury-minimal': 2 }, premium: { 'luxury-minimal': 1 }, sophisticat: { 'luxury-minimal': 1 },
  soft: { 'soft-editorial': 2 }, calm: { 'soft-editorial': 1, 'luxury-minimal': 1 }, gentle: { 'soft-editorial': 2 }, magazine: { 'soft-editorial': 1, 'print-serif': 1 }, editorial: { 'soft-editorial': 1, 'editorial-noir': 1 },
  bold: { 'bold-commercial': 2 }, loud: { 'bold-commercial': 1, 'brutalist-poster': 1 }, energetic: { 'bold-commercial': 2 }, punchy: { 'bold-commercial': 2 },
  techn: { 'glass-tech': 2, 'mono-terminal': 1 }, techy: { 'glass-tech': 2 }, futur: { 'glass-tech': 1, 'neon-grid': 1 }, sleek: { 'glass-tech': 1 }, saas: { 'glass-tech': 2 },
  organic: { 'organic-studio': 2 }, natur: { 'organic-studio': 2 }, earthy: { 'organic-studio': 2 }, botanic: { 'organic-studio': 2 },
  shop: { 'commerce-editorial': 2 }, store: { 'commerce-editorial': 2 }, product: { 'commerce-editorial': 1 },
  swiss: { 'swiss-grid': 3 }, grid: { 'swiss-grid': 1 }, precise: { 'swiss-grid': 2 }, rational: { 'swiss-grid': 2 },
  serif: { 'print-serif': 1 }, print: { 'print-serif': 2 }, literary: { 'print-serif': 2 }, bookish: { 'print-serif': 2 },
  neon: { 'neon-grid': 3 }, cyber: { 'neon-grid': 2 }, synth: { 'neon-grid': 2 }, rave: { 'neon-grid': 2 },
  terminal: { 'mono-terminal': 3 }, developer: { 'mono-terminal': 2 }, code: { 'mono-terminal': 1 }, hacker: { 'mono-terminal': 2 },
  brutal: { 'brutalist-poster': 3 }, raw: { 'brutalist-poster': 1 }, poster: { 'brutalist-poster': 2 }, rebellious: { 'brutalist-poster': 2 },
  warm: { 'warm-craft': 2, 'organic-studio': 1 }, craft: { 'warm-craft': 2 }, handmade: { 'warm-craft': 2 }, cosy: { 'warm-craft': 2 }, cozy: { 'warm-craft': 2 }, homely: { 'warm-craft': 2 },
};

/** Negated word stem → packs it excludes. */
const AVOID_LEXICON: Record<string, ArtDirectionPackId[]> = {
  gradient: ['glass-tech', 'neon-grid'], glass: ['glass-tech'], neon: ['neon-grid'], cute: ['warm-craft', 'soft-editorial'],
  dark: ['editorial-noir', 'noir-atelier'], corporate: ['bold-commercial', 'swiss-grid'], loud: ['bold-commercial', 'brutalist-poster', 'neon-grid'],
  serif: ['print-serif'], techy: ['glass-tech', 'mono-terminal'], busy: ['brutalist-poster'],
};

const AXES = {
  mood: ['calm', 'playful', 'serious', 'moody', 'joyful', 'dramatic', 'intimate', 'confident', 'quiet', 'energetic', 'nostalgic'],
  emotionalTraits: ['trustworthy', 'warm', 'bold', 'elegant', 'rebellious', 'friendly', 'premium', 'honest', 'refined', 'human'],
  typography: ['serif', 'sans', 'mono', 'display', 'handwritten', 'condensed'],
  colour: ['dark', 'light', 'warm', 'cool', 'monochrome', 'vivid', 'pastel', 'earthy', 'neon'],
  layout: ['grid', 'asymmetric', 'spacious', 'dense', 'minimal', 'editorial', 'full-bleed'],
  media: ['photo', 'video', 'illustration', 'film', 'product'],
} as const;

const NEGATORS = new Set(['no', 'not', 'nothing', 'without', 'avoid', 'never', 'none', 'non']);
const tokenize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ').split(/\s+/).filter(Boolean);

export interface CreativeInterpretation {
  intent: CreativeIntentProfile;
  affinity: CreativeAffinity;
  mode: CreativeResolutionMode;
  primaryPackId?: ArtDirectionPackId;
  blendPackId?: ArtDirectionPackId;
}

export function interpretCreativeIntent(sourcePrompt: string): CreativeInterpretation {
  const words = tokenize(sourcePrompt);
  const negated = new Set<number>();
  words.forEach((w, i) => { if (NEGATORS.has(w)) for (let j = i + 1; j < Math.min(words.length, i + 4) && !NEGATORS.has(words[j]); j++) negated.add(j); });
  const positive = words.filter((_, i) => !negated.has(i));
  const negative = words.filter((_, i) => negated.has(i));

  const scores = new Map<ArtDirectionPackId, AffinityScore<ArtDirectionPackId>>();
  for (const w of positive) for (const [stem, weights] of Object.entries(PACK_LEXICON)) {
    if (!w.startsWith(stem)) continue;
    for (const [id, weight] of Object.entries(weights) as [ArtDirectionPackId, number][]) {
      const s = scores.get(id) ?? { id, score: 0, evidence: [] };
      s.score += weight; s.evidence.push(`"${w}" +${weight}`); scores.set(id, s);
    }
  }
  const excluded = new Map<ArtDirectionPackId, AffinityScore<ArtDirectionPackId>>();
  for (const w of negative) for (const [stem, ids] of Object.entries(AVOID_LEXICON)) {
    if (!w.startsWith(stem)) continue;
    for (const id of ids) { const e = excluded.get(id) ?? { id, score: 0, evidence: [] }; e.evidence.push(`avoid "${w}"`); excluded.set(id, e); scores.delete(id); }
  }
  const packs = [...scores.values()].sort((a, b) => b.score - a.score || ART_DIRECTION_PACK_IDS.indexOf(a.id) - ART_DIRECTION_PACK_IDS.indexOf(b.id));

  const fam = new Map<ThemeFamilyId, AffinityScore<ThemeFamilyId>>(THEME_FAMILY_IDS.map((id) => [id, { id, score: 0, evidence: [] }]));
  for (const p of packs) {
    const entry = ART_DIRECTION_FAMILY_REGISTRY[p.id];
    const f = fam.get(entry.primaryFamily)!; f.score += p.score; f.evidence.push(`${p.id} (primary)`);
    for (const s of entry.secondaryFamilies) { const g = fam.get(s)!; g.score += p.score / 2; g.evidence.push(`${p.id} (secondary)`); }
  }
  const themeFamilies = [...fam.values()].filter((f) => f.score > 0).sort((a, b) => b.score - a.score);

  const s1 = packs[0]?.score ?? 0, s2 = packs[1]?.score ?? 0;
  const strength = Math.min(1, s1 / 2);
  const dominance = s1 ? (s1 - s2) / s1 : 0;
  const confidence = Math.round(strength * (0.55 + 0.45 * dominance) * 100) / 100;
  const mode = resolutionModeFor(confidence);

  const pick = (axis: readonly string[]) => axis.filter((t) => positive.some((w) => w.startsWith(t)));
  const expressive = positive.some((w) => /^(animat|motion|dynamic|kinetic|immersive|cinematic)/.test(w));
  const still = positive.some((w) => /^(still|static|quiet|calm)/.test(w)) || negative.some((w) => /^(animat|motion)/.test(w));
  const references = [...sourcePrompt.matchAll(/"([^"]+)"|\blike ([A-Z][\w\s]+?)(?=[,.;]|$)|\b(?:meets|inspired by) ([\w\s]+?)(?=[,.;]|$)/g)]
    .map((m) => (m[1] ?? m[2] ?? m[3]).trim()).filter(Boolean);

  const intent: CreativeIntentProfile = {
    sourcePrompt,
    mood: pick(AXES.mood), emotionalTraits: pick(AXES.emotionalTraits), typography: pick(AXES.typography),
    colour: pick(AXES.colour), layout: pick(AXES.layout), media: pick(AXES.media),
    motion: expressive ? 'expressive' : still ? 'still' : 'unspecified',
    references,
    negativeVocabulary: [...new Set(negative.filter((w) => w.length > 2))],
    confidence,
  };
  return {
    intent,
    affinity: { themeFamilies, packs, excludedPacks: [...excluded.values()] },
    mode,
    primaryPackId: packs[0]?.id,
    blendPackId: mode === 'blended' ? packs[1]?.id : undefined,
  };
}
