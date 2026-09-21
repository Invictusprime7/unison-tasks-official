import { describe, expect, it } from 'vitest';
import { ALL_COMPOSITIONS } from '@/sections/templates';
import { generateTopologyPlaceholderFiles } from '@/utils/topologyVFSScaffolder';
import type { GeneratedSitePlan, PageRouteNode } from '@/platform/core/siteTopologyPlanner';
import { normalizeLauncherFiles, prepareSandpackFiles } from '@/utils/sandpackFilePrep';
import { SANDPACK_DEPENDENCIES } from '@/utils/sandpackDependencies';

const ROLES: PageRouteNode['role'][] = ['home', 'about', 'services', 'contact', 'gallery', 'pricing', 'faq', 'immersive'] as PageRouteNode['role'][];

function page(role: string): PageRouteNode {
  return {
    id: `${role}-page`, name: role, title: role, route: role === 'home' ? '/' : `/${role}`,
    role: role as PageRouteNode['role'], filePath: role === 'home' ? '/src/pages/Home.tsx' : `/src/pages/${role}.tsx`,
    visibleInNav: true, isHome: role === 'home', generatedBy: 'wizard',
  };
}

function plan(templateId: string, industry: string, node: PageRouteNode): GeneratedSitePlan {
  return {
    siteId: `probe-${templateId}`, industry, businessName: 'Probe Studio', homePageId: 'home-page',
    pages: [node], navItems: [node.id], funnels: [], redirects: [],
    generatedAt: '2026-09-21T00:00:00.000Z', selectedTemplateId: templateId,
  };
}

function resolveRelative(fromPath: string, spec: string, files: Record<string, string>): boolean {
  const base = fromPath.split('/').slice(0, -1);
  for (const part of spec.split('/')) {
    if (part === '.' || part === '') continue;
    if (part === '..') base.pop(); else base.push(part);
  }
  const target = base.join('/');
  return [target, `${target}.ts`, `${target}.tsx`, `${target}.js`, `${target}.jsx`, `${target}.css`,
    `${target}/index.ts`, `${target}/index.tsx`].some((c) => c in files);
}

describe('preview module resolution', () => {
  it('resolves imports and renders declared variants for every role of every composition', async () => {
    const problems: string[] = [];
    for (const template of ALL_COMPOSITIONS) {
      for (const role of ROLES) {
        const node = page(String(role));
        let source: Record<string, string>;
        try {
          source = generateTopologyPlaceholderFiles(node, plan(template.id, template.industry, node), template);
        } catch (error) {
          problems.push(`${template.id}/${role}: scaffold threw ${(error as Error).message}`);
          continue;
        }
        let prepared: Record<string, string>;
        try {
          prepared = prepareSandpackFiles(normalizeLauncherFiles(source, { entryPoint: node.filePath }), {});
        } catch (error) {
          problems.push(`${template.id}/${role}: prepare threw ${(error as Error).message}`);
          continue;
        }
        // (a) imports resolve
        for (const [path, content] of Object.entries(prepared)) {
          if (!/\.(tsx?|jsx?)$/.test(path)) continue;
          for (const match of content.matchAll(/(?:from|import)\s*['"]([^'"]+)['"]/g)) {
            const spec = match[1];
            if (spec.startsWith('@/')) { problems.push(`${template.id}/${role}: ${path} -> ${spec} (unrewritten alias)`); continue; }
            if (spec.startsWith('.')) {
              if (!resolveRelative(path, spec, prepared)) problems.push(`${template.id}/${role}: ${path} -> ${spec} (missing module)`);
              continue;
            }
            if (spec.startsWith('/')) {
              if (!(spec in prepared)) problems.push(`${template.id}/${role}: ${path} -> ${spec} (missing absolute module)`);
              continue;
            }
            const pkg = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
            if (pkg === 'react' || pkg === 'react-dom') continue;
            if (!(pkg in SANDPACK_DEPENDENCIES)) problems.push(`${template.id}/${role}: ${path} -> ${spec} (unpinned package)`);
          }
        }
        // (b) every declared variant exists in its compiled recipe module
        const pagePath = node.filePath.replace('/src/', '/');
        const sectionsMatch = prepared[pagePath]?.match(/const SECTIONS = ([\s\S]*?);\nconst HYDRATABLE/);
        if (!sectionsMatch) continue;
        const sections = JSON.parse(sectionsMatch[1]) as Array<{ type: string; variantId?: string }>;
        for (const section of sections) {
          if (!section.variantId) continue;
          const recipe = Object.entries(prepared).find(([p]) => p.startsWith('/components/recipes/'))
            && Object.entries(prepared).filter(([p]) => p.startsWith('/components/recipes/'))
              .map(([, c]) => c).join('\n');
          if (recipe && !recipe.includes(JSON.stringify(section.variantId))) {
            problems.push(`${template.id}/${role}: variant ${section.variantId} absent from compiled recipes`);
          }
        }
      }
    }
    expect([...new Set(problems)].slice(0, 40)).toEqual([]);
  }, 120000);
});
