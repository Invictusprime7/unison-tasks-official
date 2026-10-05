/** Font stylesheet for the typefaces Unison tokens reference (Inter, Lora, Space Mono). */
export const UNISON_FONT_STYLESHEET_HREF =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400..700&family=Lora:ital,wght@0,400..700;1,400..700&family=Space+Mono:wght@400;700&display=swap';

/** Head link descriptors — spread into a route head() `links` array. */
export const UNISON_FONT_LINKS = [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' as const },
  { rel: 'stylesheet', href: UNISON_FONT_STYLESHEET_HREF },
];
