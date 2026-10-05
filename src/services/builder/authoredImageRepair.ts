/**
 * Deterministic repair of dead image hosts in AI-authored source, applied
 * before candidate gates so the committed revision never stores unreachable
 * placeholder images (via.placeholder.com is offline; Shopify placeholder
 * files 404). Replacements come from the curated contextual photo library.
 */
import { CONTEXTUAL_IMAGES, PORTRAIT_IMAGES } from '@/utils/sandpackFilePrep';

const DEAD_IMAGE_URL =
  /https?:\/\/(?:via\.placeholder\.com|placeholder\.com|placehold\.(?:it|co)|dummyimage\.com|fakeimg\.pl|source\.unsplash\.com|picsum\.photos|(?:www\.)?example\.com|cdn\.shopify\.com\/s\/files\/[^"'`\s)]*placeholder)[^"'`\s)]*/gi;
const AVATAR_URL = /https?:\/\/(?:randomuser\.me|i\.pravatar\.cc|ui-avatars\.com)[^"'`\s)]*/gi;

const INDUSTRY_HINTS: Array<[string, RegExp]> = [
  ['restaurant', /\b(menu|restaurant|dining|chef|cuisine|reservation|bistro|trattoria|cafe)\b/i],
  ['salon', /\b(salon|spa|stylist|hair|nail|beauty|barber)\b/i],
  ['fitness', /\b(gym|fitness|workout|trainer|yoga|pilates)\b/i],
  ['medical', /\b(clinic|patient|medical|dental|doctor|health care)\b/i],
  ['ecommerce', /\b(shop|cart|product|arrivals|collection|checkout|store)\b/i],
  ['contractor', /\b(contractor|plumb|roof|renovat|construction|hvac)\b/i],
  ['coaching', /\b(coach|coaching|mentor|session)\b/i],
  ['saas', /\b(saas|dashboard|platform|integration|api)\b/i],
  ['portfolio', /\b(portfolio|case stud|my work|designer)\b/i],
  ['agency', /\b(agency|studio|clients|campaign)\b/i],
];

function poolFor(code: string): string[] {
  for (const [key, re] of INDUSTRY_HINTS) if (re.test(code)) return CONTEXTUAL_IMAGES[key] ?? CONTEXTUAL_IMAGES.default;
  return CONTEXTUAL_IMAGES.default;
}

export function repairAuthoredImageSource(code: string): string {
  if (!DEAD_IMAGE_URL.test(code) && !AVATAR_URL.test(code)) return code;
  DEAD_IMAGE_URL.lastIndex = 0;
  AVATAR_URL.lastIndex = 0;
  const pool = poolFor(code);
  let i = 0;
  let p = 0;
  return code
    .replace(DEAD_IMAGE_URL, () => pool[i++ % pool.length])
    .replace(AVATAR_URL, () => PORTRAIT_IMAGES[p++ % PORTRAIT_IMAGES.length]);
}

export function repairAuthoredImages(files: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [path, content] of Object.entries(files)) {
    out[path] = /\.(?:[cm]?[jt]sx?|json)$/.test(path) && typeof content === 'string'
      ? repairAuthoredImageSource(content)
      : content;
  }
  return out;
}
