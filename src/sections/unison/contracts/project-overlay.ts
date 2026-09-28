/**
 * Project art-direction overlay — used for blended and novel briefs. It starts
 * from the closest released pack and adjusts within brand-safety limits. It is
 * project-scoped: it never edits or re-releases a Unison pack.
 */
import type { ArtDirectionPackId } from '../../variants/artDirectionPacks';
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
    motion?: CreativeIntentProfile['motion'];
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
  const temp = intent.colour.includes('warm') ? 'warm' : intent.colour.includes('cool') ? 'cool' : undefined;
  const density = intent.layout.includes('spacious') ? 'airier' : intent.layout.includes('dense') ? 'tighter' : undefined;
  const rationale = [`Starts from ${basePackId}${blendPackId ? `, blended with ${blendPackId}` : ''}.`];
  if (mode === 'novel') rationale.push('Brief did not match a released pack closely; adjustments stay inside this project.');
  return {
    scope: 'project', mode, basePackId, blendPackId,
    adjustments: {
      typography: intent.typography[0],
      colourTemperature: temp,
      density,
      motion: intent.motion === 'unspecified' ? undefined : intent.motion,
    },
    brandSafety: SAFETY,
    rationale,
  };
}
