/**
 * Project art-direction overlay — used for blended and novel briefs. It starts
 * from the closest released pack and adjusts within brand-safety limits. It is
 * project-scoped: it never edits or re-releases a Unison pack.
 */
import type { ArtDirectionPackId } from './art-direction';
import type { CreativeIntentProfile, CreativeResolutionMode } from './creative-intent';

export interface ProjectArtDirectionOverlay {
  scope: 'project';
  mode: Exclude<CreativeResolutionMode, 'exact'>;
  basePackId: ArtDirectionPackId;
  blendPackId?: ArtDirectionPackId;
  adjustments: {
    typography?: string;
    colourTemperature?: 'warm' | 'cool' | 'neutral';
    density?: 'airier' | 'tighter';
    motion?: 'still' | 'subtle' | 'expressive';
    surface?: string;
    texture?: string;
  };
  /** Limits no overlay may cross. */
  brandSafety: {
    minContrastRatio: 4.5;
    keepSemanticTokenRoles: true;
    keepReducedMotionFallback: true;
    keepFocusVisible: true;
  };
  rationale: string[];
}

const SAFETY: ProjectArtDirectionOverlay['brandSafety'] = {
  minContrastRatio: 4.5, keepSemanticTokenRoles: true, keepReducedMotionFallback: true, keepFocusVisible: true,
};

export function buildProjectOverlay(
  intent: CreativeIntentProfile,
  mode: Exclude<CreativeResolutionMode, 'exact'>,
  basePackId: ArtDirectionPackId,
  blendPackId?: ArtDirectionPackId,
): ProjectArtDirectionOverlay {
  const warmSignals = [...intent.mood, ...intent.emotionalTraits, ...intent.surface.character, ...intent.surface.texture];
  const temp = warmSignals.some((s) => /warm|earthy|paper|handmade/.test(s)) ? 'warm' : warmSignals.some((s) => /cool|glass/.test(s)) ? 'cool' : undefined;
  const density = intent.composition.density === 'low' ? 'airier' : intent.composition.density === 'high' ? 'tighter' : undefined;
  const motion = intent.motion.intensity === 'high' ? 'expressive' : intent.motion.intensity === 'low' ? 'still' : intent.motion.intensity === 'medium' ? 'subtle' : undefined;
  const rationale = [`Starts from ${basePackId}${blendPackId ? `, blended with ${blendPackId}` : ''}.`];
  if (mode === 'novel') rationale.push('Brief did not match a released pack closely; adjustments stay inside this project.');
  return {
    scope: 'project', mode, basePackId, blendPackId,
    adjustments: {
      typography: intent.typography.character[0],
      colourTemperature: temp,
      density,
      motion,
      surface: intent.surface.character[0],
      texture: intent.surface.texture[0],
    },
    brandSafety: SAFETY,
    rationale,
  };
}
