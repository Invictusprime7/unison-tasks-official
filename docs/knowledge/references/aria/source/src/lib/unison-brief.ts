/**
 * ARIA — sealed Unison project brief.
 *
 * Resolution mode: EXACT canonical match.
 * The creative brief (editorial, cinematic, image-led, spacious, tactile)
 * maps directly onto the cinematic-portfolio pack; no project overlay is
 * required yet. This pack is SEALED — later pages must not silently
 * re-interpret the Theme Family or replace it.
 */
export const unisonProjectBrief = {
  projectName: "ARIA",
  industry: "portfolio",
  themeFamily: "editorial",
  sealedArtDirectionPackId: "cinematic-portfolio",
  experience: "motion-rich",
  designSeed: "aria-001",
  audience: [
    "creative directors",
    "studios and agencies",
    "prospective clients",
    "collaborators",
    "curators",
  ],
  goals: ["qualified enquiries", "project exploration"],
  pageRoles: ["home", "work", "project", "contact"],
  primaryIntent: "contact.submit",
  secondaryIntents: ["project.view", "work.explore"],
  negativeVocabulary: [
    "generic SaaS structure",
    "repetitive three-card grids",
    "excessive rounded cards",
    "excessive pills",
    "gratuitous gradients",
    "gratuitous glassmorphism",
    "template-like portfolio layouts",
  ],
} as const;
