import { describe, expect, it } from 'vitest';
import { buildCanonicalPipelineDirective, buildComposerCanonicalRules } from '../../supabase/functions/_shared/canonicalPipelinePrompt';
import { BASE_PROMPT } from '../../supabase/functions/ai-code-assistant/composerLane';
import { buildTemplateActionContext, buildEditModeContext, buildSurgicalEditReinforcement } from '../../supabase/functions/ai-code-assistant/prompts/editPrompts';
import { buildCodeModePrompt } from '../../supabase/functions/ai-code-assistant/prompts/codePrompt';
import { buildRegistryContextBlock } from '../../supabase/functions/ai-code-assistant/contextBuilders';

const RAW_PALETTE = /\b(?:bg|text|border|from|to|via)-(?:gray|slate|zinc|neutral|blue|cyan|purple|amber)-\d{2,3}\b|\btext-white\b/;
const outsideDirective = (prompt: string) => prompt.split('## CANONICAL PIPELINE COMPATIBILITY')[0];

describe('canonical pipeline prompt compatibility', () => {
  it('states the gate-backed rules in the shared directive', () => {
    const directive = buildCanonicalPipelineDirective();
    for (const phrase of [
      '/src/pages/', '/src/project-components/', '/src/App.tsx', 'ROUTE_OPS',
      'VALID IMPORT PATHS', 'data-ut-variant', '21st.dev', 'semantic tokens', 'ut-display', '--ut-',
      'recipes', 'composition signature', 'exactly one primary navbar', 'registered routes',
    ]) expect(directive).toContain(phrase);
  });

  it('feeds the composer lane the closure, registry and design-system rules', () => {
    for (const phrase of ['VERIFIED IMPORTS', 'DESIGN SYSTEM', 'PORTABLE RECIPES', 'SHELL & NAVIGATION CLOSURE']) {
      expect(BASE_PROMPT).toContain(phrase);
      expect(buildComposerCanonicalRules()).toContain(phrase);
    }
  });

  it('no longer instructs editing protected files or hardcoding palette colors', () => {
    const actions = ['add', 'full-control', 'apply-design-preset', 'modify'].map(buildTemplateActionContext).join('\n');
    expect(actions).not.toMatch(/"src\/App\.tsx"/);
    expect(actions).not.toMatch(/index\.css for custom animations/);
    expect(actions).not.toMatch(RAW_PALETTE);

    const code = outsideDirective(buildCodeModePrompt({ editModeContext: '', learnedPatterns: '' }));
    expect(code).not.toMatch(/"src\/App\.tsx"/);
    expect(code).not.toMatch(/keyframes in index\.css/);
    expect(code).not.toMatch(RAW_PALETTE);
  });

  it('attaches the directive to edit mode and keeps surgical edits within canonical limits', () => {
    expect(buildEditModeContext(true, 'export default function A(){return null}', '', '')).toContain('CANONICAL PIPELINE COMPATIBILITY');
    expect(buildCodeModePrompt({ editModeContext: '', learnedPatterns: '' })).toContain('CANONICAL PIPELINE COMPATIBILITY');
    expect(buildSurgicalEditReinforcement(true, '')).toContain('CANONICAL LIMITS');
  });

  it('surfaces verified import paths, recipes and variant markers in the registry block', () => {
    const block = buildRegistryContextBlock({
      industry: 'salon',
      sections: [{ type: 'hero', allowedVariantIds: ['hero:split-editorial'] }],
      validImportPaths: ['@/components/ui/button', '@/project-components/site/SiteNav'],
      portableRecipeIds: ['hero:split-editorial'],
      motionPrimitives: ['FadeIn'],
      motionProfile: 'calm',
    });
    expect(block).toContain('VALID IMPORT PATHS');
    expect(block).toContain('@/project-components/site/SiteNav');
    expect(block).toContain('Portable recipes');
    expect(block).toContain('data-ut-variant="section:variant"');
    expect(block).toContain('never import or fetch 21st.dev');
  });
});
