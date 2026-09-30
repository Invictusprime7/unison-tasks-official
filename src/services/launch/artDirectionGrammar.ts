import type { ArtDirectionPack } from '@/sections/variants/artDirectionPacks';

/** Executable design knowledge projected from one sealed ArtDirectionPack. */
export interface ArtDirectionGrammar {
  typographyStrategies: string[];
  spatialStrategies: string[];
  compositionFamilies: string[];
  imageTreatments: string[];
  surfaceTreatments: string[];
  motionBehaviors: string[];
  heroFamilies: string[];
  sectionTransitions: string[];
  densityRules: string[];
  rhythmRules: string[];
  allowedContrasts: string[];
}

const unique = (values: readonly string[]): string[] => [...new Set(values.filter(Boolean))];

/**
 * Compile the pack's registered variants and token-level behavior into the
 * bounded grammar consumed by Wizard generation and Builder AI context.
 * This is a projection only: the ArtDirectionPack remains the authority.
 */
export function compileArtDirectionGrammar(pack: ArtDirectionPack): ArtDirectionGrammar {
  const compositionFamilies = unique([
    ...pack.navbarFamily,
    ...Object.values(pack.sectionFamilies).flatMap((variants) => variants ?? []),
    ...pack.footerFamily,
  ]);

  return {
    typographyStrategies: unique([
      `display-stack:${pack.signature.typography.displayStack}`,
      `body-stack:${pack.signature.typography.bodyStack}`,
      `display-weight:${pack.signature.typography.displayWeight}`,
      `body-weight:${pack.signature.typography.bodyWeight}`,
      `type-scale:${pack.design.typeScaleRatio}`,
      `heading-tracking:${pack.design.headingTracking}`,
      `heading-transform:${pack.design.headingTransform}`,
      `eyebrow:${pack.signature.typography.eyebrowTransform}/${pack.signature.typography.eyebrowTracking}`,
    ]),
    spatialStrategies: unique([
      `hero-layout:${pack.signature.hero.layout}`,
      `hero-align:${pack.signature.hero.align}`,
      `hero-height:${pack.signature.hero.minHeight}`,
      `hero-media-ratio:${pack.signature.hero.mediaRatio}`,
      `content-measure:${pack.design.measure}`,
    ]),
    compositionFamilies,
    imageTreatments: unique([
      `media:${pack.design.mediaTreatment}`,
      `gradient:${pack.signature.gradient}`,
      `accent:${pack.design.accentPolicy}`,
      `ratio:${pack.signature.hero.mediaRatio}`,
    ]),
    surfaceTreatments: unique([
      `surface:${pack.design.surface}`,
      `radius:${pack.design.radius}`,
      `border:${pack.design.borderWeight}`,
      `pill:${pack.signature.pill}`,
    ]),
    motionBehaviors: unique([
      `profile:${pack.motionProfile}`,
      `interaction:${pack.interactionProfile}`,
      `entrance:${pack.signature.entrance}`,
      `duration:${pack.design.motionDuration}`,
      `ease:${pack.design.motionEase}`,
      `distance:${pack.design.motionDistance}`,
    ]),
    heroFamilies: [...(pack.sectionFamilies.hero ?? [])],
    sectionTransitions: unique([
      `entrance:${pack.signature.entrance}`,
      `divider:${pack.signature.gradient}`,
      `motion:${pack.motionProfile}`,
    ]),
    densityRules: unique([
      `density:${pack.signature.density}`,
      `measure:${pack.design.measure}`,
      `surface:${pack.design.surface}`,
    ]),
    rhythmRules: unique([
      `rhythm:${pack.design.rhythm}`,
      `entrance:${pack.signature.entrance}`,
      `duration:${pack.design.motionDuration}`,
    ]),
    allowedContrasts: unique([
      `accent:${pack.design.accentPolicy}`,
      `surface:${pack.design.surface}`,
      `border:${pack.design.borderWeight}`,
      `heading-transform:${pack.design.headingTransform}`,
    ]),
  };
}
