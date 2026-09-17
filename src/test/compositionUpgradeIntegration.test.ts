import { describe, expect, it } from 'vitest';
import { commitToPipeline } from '@/platform/core/commitToPipeline';
import { compositionToReactFileSet } from '@/sections/compositionToFileSet';
import { collectResolvedCompositions } from '@/platform/core/resolvedComposition';
import { getCompositionById } from '@/sections/templates';
import { buildCanonicalLaunchArtifacts } from '@/services/canonicalLaunchVfs';
import { prepareCompositionUpgrade } from '@/services/compositionUpgrade';
import { THEME_PRESETS } from '@/components/onboarding/themePresets';
import { themePresetToThemeTokens } from '@/components/onboarding/themePresetToTokens';
import type { SectionEntry } from '@/sections/types';
import { compilePlayground } from '@/services/playgroundCompiler';
import { getVariantsForSection } from '@/sections/variants';

describe('composition upgrade canonical integration', () => {
  it('validates a real legacy project upgrade without replacing custom content', async () => {
    const template = getCompositionById('salon-premium')!;
    const preset = THEME_PRESETS.find(item => item.id === 'editorial')!;
    const launched = commitToPipeline({ selections: {
      businessName: 'Custom Studio', businessModel: 'appointment_service', industryOverlay: 'salon',
      primaryGoal: 'showcase', secondaryGoals: [], requestedPages: ['gallery'],
      templateId: template.id, themePresetId: preset.id, themeTokens: themePresetToThemeTokens(preset),
    } }, 'wizard-launch');
    const snapshot = launched.siteBundleSnapshot;
    const legacyDesign = { ...snapshot.meta.designIntervention!, compositionPolicy: undefined };
    let files = { ...snapshot.vfsFiles };
    for (const composition of Object.values(collectResolvedCompositions(files))) {
      const page = files[composition.pageFilePath];
      const sections = JSON.parse(page.match(/const SECTIONS = ([\s\S]*?);\nconst HYDRATABLE/)![1]) as SectionEntry[];
      files = { ...files, ...compositionToReactFileSet({ ...template, name: composition.templateName!, sections }, composition.pageFilePath) };
    }
    const legacy = { ...snapshot, meta: { ...snapshot.meta, designIntervention: legacyDesign }, vfsFiles: files };
    files['/.unison/design-intervention.json'] = JSON.stringify(legacyDesign, null, 2);
    const identity = {
      userId: '11111111-1111-4111-8111-111111111111', businessId: '22222222-2222-4222-8222-222222222222',
      projectId: '33333333-3333-4333-8333-333333333333', draftId: '44444444-4444-4444-8444-444444444444',
      revisionId: '55555555-5555-4555-8555-555555555555', sessionId: 'composition-test',
    };
    const artifact = buildCanonicalLaunchArtifacts({
      generatedFiles: files, siteBundleSnapshot: legacy, canonicalPlayground: launched.playground,
      preferredEntryPoint: '/src/App.tsx', templateId: template.id, themePresetId: preset.id,
      businessId: identity.businessId, projectId: identity.projectId, industry: snapshot.industry,
      approvedExperienceCapabilities: [],
    });
    const proposal = await prepareCompositionUpgrade({
      identity, current: { vfsFiles: artifact.files, siteBundleSnapshot: artifact.siteBundleSnapshot, playground: launched.playground },
      options: { themePresetId: preset.id, themeTokens: snapshot.themeTokens },
    });
    expect(proposal.affected.length).toBeGreaterThan(0);
    expect(proposal.candidate.status).toBe('committed');
    expect(proposal.candidate.persistedRevisionId).toBeNull();
    expect(proposal.files['/src/index.css']).toBe(artifact.files['/src/index.css']);
    expect(proposal.files['/src/components/Hero.tsx']).toBe(artifact.files['/src/components/Hero.tsx']);
    const pagePath = proposal.affected[0].pagePath;
    const data = proposal.files[pagePath].match(/const SECTIONS = ([\s\S]*?);\r?\nconst HYDRATABLE/)!;
    const editedSections = JSON.parse(data[1]) as SectionEntry[];
    const hero = editedSections.find(section => section.type === 'hero')!;
    hero.props = { ...hero.props, headline: 'The owner edited this headline' };
    const edited = { ...proposal.files,
      [pagePath]: proposal.files[pagePath].replace(data[0], `const SECTIONS = ${JSON.stringify(editedSections, null, 2)};\nconst HYDRATABLE`),
      '/src/components/Hero.tsx': proposal.files['/src/components/Hero.tsx'] + '\n// Owner customization',
    };
    const options = { selectedTemplateId: template.id, themePresetId: preset.id, stage4bCss: edited['/src/index.css'], designIntervention: legacyDesign };
    const recompiled = compilePlayground(launched.playground, edited, 'Custom Studio', options);
    expect(recompiled.vfsFiles[pagePath]).toBe(edited[pagePath]);
    expect(recompiled.vfsFiles['/src/components/Hero.tsx']).toBe(edited['/src/components/Hero.tsx']);
    const nextVariant = getVariantsForSection('hero').find(variant => variant.id !== hero.variantId)!;
    const changedVariant = compilePlayground(launched.playground, edited, 'Custom Studio', {
      ...options, designIntervention: { ...legacyDesign, activeVariants: { ...legacyDesign.activeVariants, [hero.id]: nextVariant.id } },
    });
    expect(changedVariant.vfsFiles[pagePath]).toContain('The owner edited this headline');
    expect(changedVariant.vfsFiles[pagePath]).toContain(nextVariant.id);
    expect(changedVariant.vfsFiles['/src/components/Hero.tsx']).toBe(edited['/src/components/Hero.tsx']);
  }, 30000);
});
