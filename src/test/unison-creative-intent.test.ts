import { describe, expect, test } from 'vitest';
import { partitionAuditGates, type Gate } from '@/sections/unison/runtime/promotion-audit';
import {
  interpretCreativeIntent, resolveCreativeDesignContext, validateOpenComposition, projectArtifactIssues,
  type ProjectArtifact,
} from '../sections/unison';

const brief = { projectName: 'Test', industry: 'agency', audience: ['clients'], goals: ['enquiries'], pageRoles: ['home'] };

const artifact = (over: Partial<ProjectArtifact> = {}): ProjectArtifact => ({
  id: 'orbit-timeline', family: 'features', sourceFile: 'src/components/OrbitTimeline.tsx', revision: 'r1', owner: 'project',
  businessPurpose: 'Show the studio process as a timeline', usage: ['home'], dependencies: [],
  editability: { level: 'text', fields: [
    { name: 'heading', location: { value: 'props.heading', proof: 'verified', evidence: 'OrbitTimeline.tsx:12' } },
    { name: 'stepCopy', location: { value: 'steps[].body?', proof: 'inferred' } },
  ] },
  hardLimits: { semanticHtml: true, keyboard: true, visibleFocus: true, reducedMotion: true, responsive: true },
  ...over,
});

describe('creative intent interpretation', () => {
  test('exact: dark cinematic film studio → cinematic-portfolio', () => {
    const r = interpretCreativeIntent('A dark, cinematic film studio');
    expect(r.mode).toBe('exact');
    expect(r.primaryPackId).toBe('cinematic-portfolio');
  });
  test('blended: warm but technical gives a main and a second style', () => {
    const r = interpretCreativeIntent('warm but technical');
    expect(r.mode).toBe('blended');
    expect(r.blendPackId).toBeDefined();
    expect(r.blendPackId).not.toBe(r.primaryPackId);
  });
  test('novel: unmatched brief gets a project overlay', () => {
    const ctx = resolveCreativeDesignContext(brief, 'a 1970s NASA manual meets a florist');
    expect(ctx.mode).toBe('novel');
    expect(ctx.overlay?.scope).toBe('project');
    expect(ctx.intent.references.length).toBeGreaterThan(0);
  });
  test('negative vocabulary excludes matching looks', () => {
    const r = interpretCreativeIntent('futuristic, no gradients, nothing cute');
    expect(r.intent.negativeVocabulary).toEqual(expect.arrayContaining(['gradients', 'cute']));
    const excluded = r.affinity.excludedPacks.map((p) => p.id);
    expect(excluded).toContain('glass-tech');
    expect(r.affinity.packs.map((p) => p.id)).not.toContain('glass-tech');
  });
  test('abstract adjectives still choose a style, deterministically', () => {
    const a = interpretCreativeIntent('elegant, calm, refined');
    expect(a.primaryPackId).toBe('luxury-minimal');
    expect(interpretCreativeIntent('elegant, calm, refined')).toEqual(a);
  });
});

describe('open composition', () => {
  const ctx = resolveCreativeDesignContext(brief, 'elegant, calm, refined');
  test('project-written section passes with a description', () => {
    const r = validateOpenComposition(ctx, { pages: { home: [{ family: 'features', artifact: artifact() }] } });
    expect(r.blocking).toEqual([]);
  });
  test('an unknown registry reference still needs a project-authored artifact', () => {
    const r = validateOpenComposition(ctx, { pages: { home: [{ family: 'hero', variantId: 'hero:not-real' as never }] } });
    expect(r.blocking.length).toBe(1);
  });
  test('registered variants with audit advice remain available for composition', () => {
    const r = validateOpenComposition(ctx, { pages: { home: [{ family: 'hero', variantId: 'hero:image-stream' }] } });
    expect(r.blocking).toEqual([]);
  });
  test('missing certification and creative compatibility evidence are advisory', () => {
    const gate = (id: Gate['id'], result: Gate['result']): Gate => ({ id, result, label: id, detail: id, safeRepair: false });
    const result = partitionAuditGates([
      gate('art-direction', 'fail'), gate('page-archetype', 'unproven'),
      gate('react-implementation', 'unproven'), gate('consumer-build', 'unproven'),
      gate('dependencies', 'fail'), gate('react-implementation', 'fail'),
    ]);
    expect(result.blockers.map(g => g.id)).toEqual(['dependencies', 'react-implementation']);
    expect(result.advisories).toHaveLength(4);
  });
  test('app screen on a marketing page is blocked', () => {
    const r = validateOpenComposition(ctx, { pages: { auth: [{ family: 'hero', artifact: artifact({ family: 'hero' }) }] } });
    expect(r.blocking.some((i) => i.includes('must never appear'))).toBe(true);
  });
  test('broken import is rejected', () => {
    expect(projectArtifactIssues(artifact({ brokenImports: ['./missing'] })).length).toBe(1);
  });
  test('editability needs a verified field; Builder editability needs a Unison-app owner', () => {
    const inferredOnly = artifact({ editability: { level: 'text', fields: [{ name: 'x', location: { value: '?', proof: 'inferred' } }] } });
    expect(projectArtifactIssues(inferredOnly).length).toBe(1);
    const builder = artifact({ editability: { ...artifact().editability, builderEditable: true } });
    expect(projectArtifactIssues(builder).length).toBe(1);
  });
});
