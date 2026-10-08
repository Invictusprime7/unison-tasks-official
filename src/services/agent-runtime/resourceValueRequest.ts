/**
 * Deterministic reading of "set this marked value" requests, e.g.
 * "change the price to 49", "make it 'Deep tissue massage'", "set to $35".
 * Returns the new value, or null when the request is anything richer
 * (restyle, rewrite, tone) — those go to the AI as usual.
 */
export function parseResourceValueRequest(prompt: string, field?: string | null): string | number | null {
  const text = prompt.trim();
  if (!text || text.length > 200) return null;
  if (/\b(style|color|colour|font|bigger|smaller|bold|spacing|layout|move|delete|remove|tone|formal|rewrite|shorter|longer)\b/i.test(text)) return null;
  const m = text.match(/^(?:please\s+)?(?:change|set|update|make|rename)\b.*?\b(?:to|as|=)\s*(.+)$/i)
    ?? text.match(/^(?:please\s+)?(?:make\s+it|rename\s+it)\s+(.+)$/i);
  if (!m) return null;
  let value = m[1].trim().replace(/[.!]+$/, '').trim();
  value = value.replace(/^["'“‘](.*)["'”’]$/s, '$1').trim();
  if (!value) return null;
  if (field && /price|amount|cost|rate|fee/i.test(field)) {
    const n = Number(value.replace(/[$€£,\s]/g, ''));
    return Number.isFinite(n) && n >= 0 ? n : null;
  }
  return value;
}
