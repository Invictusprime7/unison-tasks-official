import * as Babel from '@babel/standalone';
import type { CapabilityIntentBinding } from '@/services/businessCapabilityPlanner';

export interface ResolvedCapabilityIntentBinding {
  symbolicTarget: string;
  filePath: string;
  slot: string;
  intent: string;
}

export interface CapabilityIntentBindingResolution {
  resolved: ResolvedCapabilityIntentBinding[];
  files: Record<string, string>;
  unresolved: CapabilityIntentBinding[];
}

function replaceIntent(openingTag: string, intent: string): string {
  if (/\bdata-ut-intent\s*=/.test(openingTag)) {
    return openingTag.replace(/\bdata-ut-intent\s*=\s*(?:"[^"]*"|'[^']*'|\{\s*"[^"]*"\s*\}|\{\s*'[^']*'\s*\})/, `data-ut-intent="${intent}"`);
  }
  return openingTag.replace(/\s*(\/?>)$/, ` data-ut-intent="${intent}"$1`);
}

function resolveInFile(
  filePath: string,
  source: string,
  binding: CapabilityIntentBinding,
): { source: string; resolved: ResolvedCapabilityIntentBinding } | null {
  // Resolve authored intent controls even when App Builder did not stamp the
  // recipe's symbolic slot. AST ranges protect JSX handlers containing ">".
  try {
    const packages = (Babel as any).packages;
    const ast = packages.parser.parse(source, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    const candidates: Array<{ node: any; exactSlot: boolean }> = [];
    packages.traverse.default(ast, {
      JSXOpeningElement(path: any) {
        const node = path.node;
        if (!['a', 'button', 'form', 'input', 'Button', 'Link', 'NavLink'].includes(node.name?.name)) return;
        const literal = (name: string) => {
          const attr = node.attributes.find((entry: any) => entry.type === 'JSXAttribute' && entry.name?.name === name);
          const value = attr?.value?.type === 'JSXExpressionContainer' ? attr.value.expression : attr?.value;
          return value?.type === 'StringLiteral' ? value.value : undefined;
        };
        const slot = literal('data-ut-slot');
        if (slot === binding.target) candidates.push({ node, exactSlot: true });
        else if (!slot && literal('data-ut-intent') === binding.intent) candidates.push({ node, exactSlot: false });
      },
    });
    const match = candidates.find(candidate => candidate.exactSlot) ?? candidates[0];
    if (match) {
      const { node } = match;
      let tag = replaceIntent(source.slice(node.start, node.end), binding.intent);
      if (!match.exactSlot) tag = tag.replace(/\s*(\/?>)$/, ` data-ut-slot="${binding.target}"$1`);
      return {
        source: source.slice(0, node.start) + tag + source.slice(node.end),
        resolved: { symbolicTarget: binding.target, filePath, slot: binding.target, intent: binding.intent },
      };
    }
  } catch { return null; }

  if (binding.target !== 'service-card.primary-action' || !/(service|treatment)/i.test(filePath + source)) {
    return null;
  }

  const actionPattern = /<(?:button|a)\b[^>]*?(?:data-ut-cta=["']cta\.primary["']|className?=[^>]*?(?:button|btn|cta))[^>]*>/i;
  const action = source.match(actionPattern);
  if (!action?.[0] || action.index === undefined) return null;
  const slottedTag = replaceIntent(action[0], binding.intent)
    .replace(/\s*(\/?>)$/, ` data-ut-slot="${binding.target}"$1`);
  return {
    source: source.slice(0, action.index) + slottedTag + source.slice(action.index + action[0].length),
    resolved: { symbolicTarget: binding.target, filePath, slot: binding.target, intent: binding.intent },
  };
}

/**
 * Resolves symbolic business-plan targets to stable VFS slots. Any unresolved
 * target remains explicit so callers can block approval rather than install an
 * unbound backend capability.
 */
export function resolveCapabilityIntentBindings(
  bindings: CapabilityIntentBinding[],
  vfsFiles: Record<string, string>,
): CapabilityIntentBindingResolution {
  const files = { ...vfsFiles };
  const resolved: ResolvedCapabilityIntentBinding[] = [];
  const unresolved: CapabilityIntentBinding[] = [];

  for (const binding of bindings) {
    let result: ReturnType<typeof resolveInFile> = null;
    for (const [filePath, source] of Object.entries(files)) {
      result = resolveInFile(filePath, source, binding);
      if (result) {
        files[filePath] = result.source;
        resolved.push(result.resolved);
        break;
      }
    }
    if (!result) unresolved.push(binding);
  }

  return { resolved, files, unresolved };
}