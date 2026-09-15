/** Supported font faces shared by compilation and theme-edit validation. */
export const THEME_FONT_WEIGHTS: Record<string, readonly number[]> = {
  Inter: [100,200,300,400,500,600,700,800,900],
  'DM Sans': [100,200,300,400,500,600,700,800,900],
  'Playfair Display': [400,500,600,700,800,900],
  'Source Serif 4': [200,300,400,500,600,700,800,900],
  'Space Grotesk': [300,400,500,600,700],
  'JetBrains Mono': [100,200,300,400,500,600,700,800],
  'Libre Baskerville': [400,700],
  Nunito: [200,300,400,500,600,700,800,900],
};
export function primaryFont(value: string): string {
  return value.split(',')[0].replace(/['"]/g, '').trim();
}
export function buildThemeFontImport(fonts: string[]): string {
  const families = [...new Set(fonts.map(primaryFont))].filter(f => THEME_FONT_WEIGHTS[f]);
  return "@import url('https://fonts.googleapis.com/css2?" + families.map(f =>
    'family=' + encodeURIComponent(f).replace(/%20/g, '+') + ':wght@' + THEME_FONT_WEIGHTS[f].join(';')
  ).join('&') + "&display=swap');";
}
