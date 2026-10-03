const IMPORT_PATTERN = /^\s*import\s[\s\S]*?;?$/gm;
const COMPONENT_DECLARATION_PATTERN = /(?:function|const)\s+([A-Z][A-Za-z0-9_]*)/g;
const JSX_TAG_PATTERN = /<\s*([A-Za-z][A-Za-z0-9_.-]*)\b/g;

const SIDE_EFFECT_TAGS = new Set([
  'form', 'input', 'textarea', 'select', 'option', 'button', 'dialog',
  'nav', 'header', 'footer', 'section', 'article', 'aside', 'table',
  'video', 'audio', 'iframe',
]);

function collectMatches(content: string, pattern: RegExp): Set<string> {
  const matches = new Set<string>();
  for (const match of content.matchAll(pattern)) matches.add(match[1]);
  return matches;
}

function addedValues(before: Set<string>, after: Set<string>): string[] {
  return [...after].filter((value) => !before.has(value));
}

function promptAllows(prompt: string, token: string): boolean {
  const lower = prompt.toLowerCase();
  if (token === 'form' || token === 'input' || token === 'textarea' || token === 'select' || token === 'option') {
    return /\b(form|contact|signup|sign up|register|checkout|booking|appointment|submit|field|input|textarea|select)\b/.test(lower);
  }
  if (token === 'button') return /\b(button|cta|call to action|submit|action|form|contact|signup|checkout|booking)\b/.test(lower);
  if (/^[A-Z]/.test(token)) {
    return /\b(add|create|introduce|new|component|form|widget|section|block)\b/.test(lower);
  }
  return false;
}

/**
 * Detect UI structures introduced by a scoped candidate that the prompt did
 * not request. This is deliberately conservative: copy/style edits must not
 * silently become new forms, controls, sections, or component composition.
 */
export function findUnrequestedScopedSideEffects(
  original: string,
  candidate: string,
  prompt: string,
): string[] {
  const reasons: string[] = [];
  const originalImports = new Set([...original.matchAll(IMPORT_PATTERN)].map((match) => match[0].trim()));
  const candidateImports = new Set([...candidate.matchAll(IMPORT_PATTERN)].map((match) => match[0].trim()));
  const addedImports = addedValues(originalImports, candidateImports);
  if (addedImports.length > 0 && !/\b(add|create|introduce|import|use|icon|motion|animate|form|button|component)\b/i.test(prompt)) {
    reasons.push(`new imports (${addedImports.length})`);
  }

  const originalTags = collectMatches(original, JSX_TAG_PATTERN);
  const candidateTags = collectMatches(candidate, JSX_TAG_PATTERN);
  for (const tag of addedValues(originalTags, candidateTags)) {
    const normalizedTag = tag.toLowerCase();
    if ((SIDE_EFFECT_TAGS.has(normalizedTag) || /^[A-Z]/.test(tag)) && !promptAllows(prompt, tag)) {
      reasons.push(`new <${tag}> element`);
    }
  }

  const originalDeclarations = collectMatches(original, COMPONENT_DECLARATION_PATTERN);
  const candidateDeclarations = collectMatches(candidate, COMPONENT_DECLARATION_PATTERN);
  for (const name of addedValues(originalDeclarations, candidateDeclarations)) {
    if (!promptAllows(prompt, name)) reasons.push(`new ${name} component`);
  }

  return [...new Set(reasons)];
}
