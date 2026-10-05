/**
 * Deterministic, rule-based brief interpreter. The same brief always gives the
 * same profile, affinity and mode. An optional AI step may add detail later but
 * must never change the mode chosen here.
 *
 * Confidence has three parts: pack strength, pack dominance, and coverage (how
 * much of the brief matched anything at all). When most of the brief matches
 * nothing, the mode is capped at `novel` — low-confidence interpretation must
 * never become a falsely precise canonical classification.
 */
import { ART_DIRECTION_PACK_IDS, type ArtDirectionPackId } from '../contracts/art-direction';
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
  luxur: { 'luxury-minimal': 2 }, elegan: { 'luxury-minimal': 2 }, refined: { 'luxury-minimal': 2 }, premium: { 'luxury-minimal': 1 }, sophisticat: { 'luxury-minimal': 1 }, expensive: { 'luxury-minimal': 1 },
  soft: { 'soft-editorial': 2 }, calm: { 'soft-editorial': 1, 'luxury-minimal': 1 }, gentle: { 'soft-editorial': 2 }, magazine: { 'soft-editorial': 1, 'print-serif': 1 }, editorial: { 'soft-editorial': 1, 'editorial-noir': 1 }, thoughtful: { 'soft-editorial': 1 },
  bold: { 'bold-commercial': 2 }, loud: { 'bold-commercial': 1, 'brutalist-poster': 1 }, energetic: { 'bold-commercial': 2 }, punchy: { 'bold-commercial': 2 }, alive: { 'bold-commercial': 1, 'organic-studio': 1 },
  techn: { 'glass-tech': 2, 'mono-terminal': 1 }, techy: { 'glass-tech': 2 }, futur: { 'glass-tech': 1, 'neon-grid': 2 }, sleek: { 'glass-tech': 1 }, saas: { 'glass-tech': 2 },
  organic: { 'organic-studio': 2 }, natur: { 'organic-studio': 2 }, earthy: { 'organic-studio': 2 }, botanic: { 'organic-studio': 2 },
  shop: { 'commerce-editorial': 2 }, store: { 'commerce-editorial': 2 }, product: { 'commerce-editorial': 1 },
  swiss: { 'swiss-grid': 3 }, grid: { 'swiss-grid': 1 }, precise: { 'swiss-grid': 2 }, rational: { 'swiss-grid': 2 }, structured: { 'swiss-grid': 2 }, clean: { 'swiss-grid': 1, 'luxury-minimal': 1 },
  serif: { 'print-serif': 1 }, print: { 'print-serif': 2 }, literary: { 'print-serif': 2 }, bookish: { 'print-serif': 2 },
  neon: { 'neon-grid': 3 }, cyber: { 'neon-grid': 2 }, synth: { 'neon-grid': 2 }, rave: { 'neon-grid': 2 }, crypto: { 'neon-grid': 1 },
  terminal: { 'mono-terminal': 3 }, developer: { 'mono-terminal': 2 }, code: { 'mono-terminal': 1 }, hacker: { 'mono-terminal': 2 },
  brutal: { 'brutalist-poster': 3 }, raw: { 'brutalist-poster': 1 }, poster: { 'brutalist-poster': 2 }, rebellious: { 'brutalist-poster': 2 },
  warm: { 'warm-craft': 2, 'organic-studio': 1 }, craft: { 'warm-craft': 2 }, handmade: { 'warm-craft': 2 }, cosy: { 'warm-craft': 2 }, cozy: { 'warm-craft': 2 }, homely: { 'warm-craft': 2 }, paper: { 'warm-craft': 2 }, tactile: { 'warm-craft': 1 },
};

/** Negated word stem → packs it excludes. Explicit avoidance outranks weak positive affinity. */
const AVOID_LEXICON: Record<string, ArtDirectionPackId[]> = {
  gradient: ['glass-tech', 'neon-grid'], glass: ['glass-tech'], glassmorphism: ['glass-tech'], neon: ['neon-grid'], crypto: ['neon-grid'], cute: ['warm-craft', 'soft-editorial'],
  dark: ['editorial-noir', 'noir-atelier'], corporate: ['bold-commercial', 'swiss-grid'], sterile: ['swiss-grid', 'glass-tech'], loud: ['bold-commercial', 'brutalist-poster', 'neon-grid'],
  serif: ['print-serif'], techy: ['glass-tech', 'mono-terminal'], busy: ['brutalist-poster'],
};

const AXES = {
  mood: ['calm', 'playful', 'serious', 'moody', 'joyful', 'dramatic', 'intimate', 'confident', 'quiet', 'energetic', 'nostalgic'],
  emotionalTraits: ['trustworthy', 'warm', 'bold', 'elegant', 'rebellious', 'friendly', 'premium', 'honest', 'refined', 'human'],
  typography: ['serif', 'sans', 'mono', 'display', 'handwritten', 'condensed', 'lettering'],
  layout: ['grid', 'asymmetric', 'spacious', 'dense', 'minimal', 'editorial', 'full-bleed'],
  media: ['photo', 'photography', 'video', 'illustration', 'film', 'product'],
  surface: ['glass', 'flat', 'paper', 'matte', 'glossy'],
  texture: ['grain', 'paper', 'tactile', 'texture', 'handmade'],
} as const;

/** Words that carry no design signal; excluded from coverage. */
const STOP_WORDS = new Set(['i', 'want', 'it', 'to', 'feel', 'and', 'a', 'an', 'the', 'but', 'with', 'that', 'really', 'very', 'so', 'me', 'my', 'we', 'our', 'for', 'of', 'in', 'on', 'is', 'be', 'should', 'must', 'type', 'something', 'site', 'website', 'page']);

/** Trait aliases: words customers say → the trait they imply. */
const TRAIT_ALIASES: Record<string, string> = { expensive: 'premium', thoughtful: 'refined', alive: 'human', handmade: 'honest' };

const NEGATORS = new Set(['no', 'not', 'nothing', 'without', 'avoid', 'never', 'none', 'non']);
const tokenize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ').split(/\s+/).filter(Boolean);

export interface CreativeInterpretation {
  intent: CreativeIntentProfile;
  affinity: CreativeAffinity;
  mode: CreativeResolutionMode;
  primaryPackId?: ArtDirectionPackId;
  blendPackId?: ArtDirectionPackId;
}

const has = (words: string[], ...stems: string[]) => words.some((w) => stems.some((s) => w.startsWith(s)));

export function interpretCreativeIntent(sourcePrompt: string): CreativeInterpretation {
  const words = tokenize(sourcePrompt);
  const negated = new Set<number>();
  words.forEach((w, i) => { if (NEGATORS.has(w)) for (let j = i + 1; j < Math.min(words.length, i + 4) && !NEGATORS.has(words[j]); j++) negated.add(j); });
  const positive = words.filter((_, i) => !negated.has(i));
  const negative = words.filter((_, i) => negated.has(i));

  const scores = new Map<ArtDirectionPackId, AffinityScore<ArtDirectionPackId>>();
  const firstMention = new Map<ArtDirectionPackId, number>();
  const matched = new Set<string>();
  positive.forEach((w, wi) => {
    for (const [stem, weights] of Object.entries(PACK_LEXICON)) {
      if (!w.startsWith(stem)) continue;
      matched.add(w);
      for (const [id, weight] of Object.entries(weights) as [ArtDirectionPackId, number][]) {
        const s = scores.get(id) ?? { id, score: 0, evidence: [] };
        s.score += weight; s.evidence.push(`"${w}" +${weight}`); scores.set(id, s);
        if (!firstMention.has(id)) firstMention.set(id, wi);
      }
    }
  });
  const excluded = new Map<ArtDirectionPackId, AffinityScore<ArtDirectionPackId>>();
  for (const w of negative) for (const [stem, ids] of Object.entries(AVOID_LEXICON)) {
    if (!w.startsWith(stem)) continue;
    for (const id of ids) { const e = excluded.get(id) ?? { id, score: 0, evidence: [] }; e.evidence.push(`avoid "${w}"`); excluded.set(id, e); }
  }
  // Pack recommendations drop excluded packs; family affinity keeps their signal
  // (a brief can be clearly Futuristic even when its futuristic packs are avoided).
  // Ties break toward the pack the customer mentioned first.
  const packs = [...scores.values()].filter((p) => !excluded.has(p.id)).sort((a, b) =>
    b.score - a.score || (firstMention.get(a.id) ?? 99) - (firstMention.get(b.id) ?? 99) || ART_DIRECTION_PACK_IDS.indexOf(a.id) - ART_DIRECTION_PACK_IDS.indexOf(b.id));

  const fam = new Map<ThemeFamilyId, AffinityScore<ThemeFamilyId>>(THEME_FAMILY_IDS.map((id) => [id, { id, score: 0, evidence: [] }]));
  for (const p of scores.values()) {
    const entry = ART_DIRECTION_FAMILY_REGISTRY[p.id];
    const f = fam.get(entry.primaryFamily)!; f.score += p.score; f.evidence.push(`${p.id} (primary)`);
    for (const s of entry.secondaryFamilies) { const g = fam.get(s)!; g.score += p.score / 2; g.evidence.push(`${p.id} (secondary)`); }
  }
  const themeFamilies = [...fam.values()].filter((f) => f.score > 0).sort((a, b) => b.score - a.score);

  // Structured axes
  const pick = (axis: readonly string[]) => axis.filter((t) => positive.some((w) => w.startsWith(t)));
  for (const axis of Object.values(AXES)) for (const t of pick(axis)) matched.add(t);
  const mood = pick(AXES.mood);
  for (const m of mood) matched.add(m);
  const emotionalTraits = [...new Set([...pick(AXES.emotionalTraits), ...positive.map((w) => TRAIT_ALIASES[w]).filter(Boolean)])];
  for (const w of positive) if (TRAIT_ALIASES[w]) matched.add(w);

  const typCharacter = pick(AXES.typography);
  const expressiveMotion = has(positive, 'animat', 'motion', 'dynamic', 'kinetic', 'immersive', 'cinematic', 'stop-motion');
  const stillMotion = has(positive, 'still', 'static', 'quiet', 'calm') || has(negative, 'animat', 'motion');
  for (const w of positive) if (/^(animat|motion|dynamic|kinetic|immersive|stop-motion|still|static)/.test(w)) matched.add(w);
  if (has(positive, 'oversized', 'big', 'dramatic')) for (const w of positive) if (/^(oversized|big|dramatic)/.test(w)) matched.add(w);
  if (has(positive, 'playful', 'imperfect', 'cut', 'collage', 'layered', 'asymmetric', 'spacious', 'dense', 'minimal', 'rounded', 'grain', 'matte', 'flat', 'full-bleed', 'oversized'))
    for (const w of positive) if (/^(playful|imperfect|cut|collage|layered|asymmetric|spacious|dense|minimal|rounded|grain|matte|flat|full-bleed|oversized)/.test(w)) matched.add(w);

  const references = [...sourcePrompt.matchAll(/"([^"]+)"|\blike ([A-Z][\w\s]+?)(?=[,.;]|$)|\b(?:meets|inspired by) ([\w\s]+?)(?=[,.;]|$)/g)]
    .map((m) => (m[1] ?? m[2] ?? m[3]).trim()).filter(Boolean);

  // Coverage: how much of the brief's content matched anything at all.
  const contentWords = positive.filter((w) => !STOP_WORDS.has(w));
  const coverage = contentWords.length ? matched.size / contentWords.length : 0;

  const s1 = packs[0]?.score ?? 0, s2 = packs[1]?.score ?? 0;
  const strength = Math.min(1, s1 / 2);
  const dominance = s1 ? (s1 - s2) / s1 : 0;
  const packConfidence = strength * (0.55 + 0.45 * dominance);
  // Confidence can never exceed coverage: a brief is only as certain as the share of it we understood.
  const overall = Math.round(Math.min(packConfidence * (0.4 + 0.6 * coverage), coverage) * 100) / 100;
  const familyConfidence = Math.round(Math.min(1, (themeFamilies[0]?.score ?? 0) / 3) * 100) / 100;
  // Low coverage means most of the brief matched nothing — never dress that up as precise.
  const mode: CreativeResolutionMode = coverage < 0.75 ? 'novel' : resolutionModeFor(overall);

  const intent: CreativeIntentProfile = {
    sourcePrompt,
    mood,
    emotionalTraits,
    typography: {
      character: typCharacter,
      expression: has(positive, 'editorial', 'magazine', 'serif') ? 'editorial'
        : has(positive, 'techn', 'terminal', 'code') ? 'technical'
        : has(positive, 'playful') ? 'playful'
        : has(positive, 'luxur', 'elegan', 'premium', 'expensive') ? 'luxury'
        : has(positive, 'bold', 'loud', 'energetic') ? 'expressive'
        : typCharacter.length ? 'restrained' : undefined,
      scale: has(positive, 'oversized', 'big', 'dramatic', 'display') ? 'dramatic' : has(positive, 'quiet', 'subtle') ? 'quiet' : typCharacter.length ? 'balanced' : undefined,
      contrast: has(positive, 'bold', 'dramatic', 'brutal') ? 'high' : has(positive, 'soft', 'quiet', 'gentle') ? 'low' : undefined,
    },
    composition: {
      density: has(positive, 'dense') ? 'high' : has(positive, 'spacious', 'minimal', 'airy') ? 'low' : undefined,
      asymmetry: has(positive, 'asymmetric') ? 0.7 : undefined,
      whitespace: has(positive, 'spacious', 'minimal') ? 0.8 : has(positive, 'dense') ? 0.2 : undefined,
      layering: has(positive, 'layered', 'collage') ? 0.7 : undefined,
      modularity: has(positive, 'grid', 'swiss', 'structured', 'modular') ? 0.8 : undefined,
      visualTension: has(positive, 'brutal', 'rebellious', 'raw') ? 0.7 : undefined,
    },
    geometry: {
      softness: has(positive, 'soft', 'rounded', 'organic', 'gentle') ? 0.7 : undefined,
      precision: has(positive, 'precise', 'swiss', 'structured', 'grid') ? 0.8 : undefined,
      irregularity: has(positive, 'imperfect', 'handmade', 'raw', 'cut') ? 0.7 : undefined,
    },
    media: {
      dominance: has(positive, 'cinematic', 'photography', 'photo', 'video', 'film', 'full-bleed') ? 0.8 : undefined,
      treatment: pick(AXES.media),
      tactileQualities: pick(AXES.texture),
    },
    motion: {
      intensity: expressiveMotion ? 'high' : stillMotion ? 'low' : 'unspecified',
      character: positive.filter((w) => /^(animat|motion|dynamic|kinetic|immersive|stop-motion|still|static)/.test(w)),
    },
    surface: {
      character: pick(AXES.surface),
      texture: pick(AXES.texture),
      depth: has(positive, 'immersive') ? 'immersive' : has(positive, 'layered', 'collage') ? 'layered' : has(positive, 'flat') ? 'flat' : undefined,
    },
    referenceSignals: references,
    negativeVocabulary: [...new Set(negative.filter((w) => w.length > 2))],
    explicitPreferences: [...new Set([...matched].filter((w) => !STOP_WORDS.has(w)))],
    explicitAvoidances: [...new Set(negative.filter((w) => w.length > 2))],
    confidence: { overall, themeFamily: familyConfidence, artDirectionPack: Math.round(packConfidence * 100) / 100 },
  };
  return {
    intent,
    affinity: { themeFamilies, packs, excludedPacks: [...excluded.values()] },
    mode,
    primaryPackId: packs[0]?.id,
    blendPackId: mode === 'blended' ? packs[1]?.id : undefined,
  };
}
