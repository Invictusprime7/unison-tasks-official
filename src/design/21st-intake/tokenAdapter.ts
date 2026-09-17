/**
 * 21st Intake — Theme normalization (M3, Step 5).
 *
 * Converts foreign color literals, radii, spacing and type scales into Stage 4b
 * semantic variables. Geometry is preserved; foreign theme authority is not.
 */

export interface TokenNormalizationResult {
  source: string;
  replacements: Array<{ from: string; to: string }>;
  remainingLiterals: string[];
}

/** Foreign utility → Stage 4b semantic utility. */
const SEMANTIC_MAP: Array<[RegExp, string]> = [
  [/\bbg-white\b/g, 'bg-background'],
  [/\bbg-black\b/g, 'bg-foreground'],
  [/\btext-white\b/g, 'text-primary-foreground'],
  [/\btext-black\b/g, 'text-foreground'],
  [/\bbg-(?:gray|zinc|slate|neutral)-(?:50|100)\b/g, 'bg-muted'],
  [/\bbg-(?:gray|zinc|slate|neutral)-(?:800|900|950)\b/g, 'bg-card'],
  [/\btext-(?:gray|zinc|slate|neutral)-(?:400|500|600)\b/g, 'text-muted-foreground'],
  [/\btext-(?:gray|zinc|slate|neutral)-(?:800|900)\b/g, 'text-foreground'],
  [/\bborder-(?:gray|zinc|slate|neutral)-(?:100|200|700|800)\b/g, 'border-border'],
  [/\bbg-(?:indigo|violet|blue|purple)-(?:500|600|700)\b/g, 'bg-primary'],
  [/\btext-(?:indigo|violet|blue|purple)-(?:500|600|700)\b/g, 'text-primary'],
  [/\bring-(?:indigo|violet|blue|purple)-(?:500|600)\b/g, 'ring-ring'],
  [/\brounded-(?:sm|md|xl|2xl|3xl)\b/g, 'rounded-lg'],
];

const ARBITRARY_COLOR = /(?:bg|text|border|from|via|to|ring|shadow|fill|stroke)-\[#[0-9a-fA-F]{3,8}\]/g;

export function normalizeTokens(input: string): TokenNormalizationResult {
  const replacements: Array<{ from: string; to: string }> = [];
  let source = input;

  for (const [pattern, replacement] of SEMANTIC_MAP) {
    source = source.replace(pattern, (match) => {
      if (match !== replacement) replacements.push({ from: match, to: replacement });
      return replacement;
    });
  }

  const remainingLiterals = Array.from(new Set(source.match(ARBITRARY_COLOR) ?? []));
  return { source, replacements, remainingLiterals };
}
