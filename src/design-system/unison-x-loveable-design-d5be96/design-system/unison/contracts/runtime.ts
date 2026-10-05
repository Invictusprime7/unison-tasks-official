export const RADIX_PRIMITIVES = [
  'accordion', 'alert-dialog', 'aspect-ratio', 'avatar', 'checkbox', 'collapsible',
  'context-menu', 'dialog', 'dropdown-menu', 'hover-card', 'label', 'menubar',
  'navigation-menu', 'popover', 'progress', 'radio-group', 'scroll-area', 'select',
  'separator', 'slider', 'slot', 'switch', 'tabs', 'toast', 'toggle', 'toggle-group',
  'tooltip',
] as const;

export type RadixPrimitiveId = (typeof RADIX_PRIMITIVES)[number];
export const EXPERIENCE_PRIMITIVES = [
  'ImmersiveHero', 'ProductStage', 'FloatingMedia', 'ParticleField', 'DepthGallery',
  'ModelViewer', 'SceneBackground', 'LightRig',
] as const;
export type ExperiencePrimitive = (typeof EXPERIENCE_PRIMITIVES)[number];
export const EXPERIENCE_CAPABILITY_ID = 'experience-3d';
