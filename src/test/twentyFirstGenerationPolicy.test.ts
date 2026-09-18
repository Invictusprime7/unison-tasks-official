import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { getAllSections } from '@/sections/registry';
import { getGenerationVariantsForSection, getVariantById, ART_DIRECTION_PACKS } from '@/sections/variants';
import { COMPOSITION_ROLES, validateAIPageComposition } from '@/sections/aiPageComposition';
import type { SectionType } from '@/sections/types';
import { TWENTY_FIRST_INTAKE_MANIFEST } from '@/design/21st-intake/manifest';
import { registerVariants } from '../../scripts/unison-variant-register.mjs';
import recipes from '@/sections/recipes/stylexRecipes.generated.json';

describe('21st-only generation closure', () => {
 it('covers every section family in every art direction with a real 21st recipe', () => {
  for(const pack of Object.values(ART_DIRECTION_PACKS)) for(const type of Object.keys(getAllSections()) as SectionType[]) {
   const variants=getGenerationVariantsForSection(type,pack);
   expect(variants.length,pack.id+':'+type).toBeGreaterThan(0);
   for(const variant of variants) {
    expect(variant.source?.origin).toBe('21st'); expect(variant.source?.sourceUrl).toMatch(/^https:\/\/(?:news\.)?21st.dev\//);
    expect(['source-adaptation','visual-reference']).toContain(variant.source?.derivation);
    expect(variant.generationStatus).not.toBe('legacy'); expect(variant.vfs?.certification).toBe('approved');
    expect(recipes.families[type as keyof typeof recipes.families]).toContain(variant.id);
   }
  }
 });
 it('accepts only eligible advertised IDs for each planner role', () => {
  const pack=ART_DIRECTION_PACKS['soft-editorial'];
  for(const role of COMPOSITION_ROLES) for(const type of Object.keys(getAllSections()) as SectionType[]) {
   for(const variant of getGenerationVariantsForSection(type,pack,role)) {
    const plan={version:'1.0',pages:[{role,sectionOrder:[type],variants:{[type]:variant.id}}]};
    expect(validateAIPageComposition(plan,pack.id,[role]),role+':'+variant.id).not.toBeNull();
   }
  }
  for(const id of ['hero:centered','hero:prisma-cinematic','cta:signal-banner']) {
   expect(getVariantById(id as never)).toBeDefined();
   const type=id.split(':')[0];
   expect(validateAIPageComposition({version:'1.0',pages:[{role:'home',sectionOrder:[type],variants:{[type]:id}}]},pack.id,['home'])).toBeNull();
  }
 });
 it('closes all original promotion findings with explicit verified or retired dispositions', () => {
  const audit=registerVariants(process.cwd(),{auditOnly:true});
  expect(audit).toMatchObject({valid:true,specCount:8,retiredCount:5,issues:[]});
  for(const record of TWENTY_FIRST_INTAKE_MANIFEST.filter(record=>record.implementationId)) {
   if(record.status==='retired') {
    expect(getVariantById(record.implementationId as never)?.generationStatus).toBe('legacy');
   } else {
    expect(record.licenseReview?.status).toBe('verified'); expect(record.step).toBe(10);
    expect(fs.existsSync(record.archivePath!+'/source.tsx.txt')).toBe(true);
   }
  }
 });
 it('keeps the three active original reviews attached to the reviewed component bytes', () => {
  for(const file of fs.readdirSync('src/design/21st-intake/promotions')) {
   const spec=JSON.parse(fs.readFileSync('src/design/21st-intake/promotions/'+file,'utf8'));
   if(spec.retirement)continue;
   const record=JSON.parse(fs.readFileSync('src/design/21st-intake/imported/'+spec.recordSlug+'/record.json','utf8'));
   const source=fs.readFileSync('src/sections/variants/'+spec.componentPath.replace('./','')+'.tsx');
   expect(record.reviewEvidence.componentSha256).toBe(createHash('sha256').update(source).digest('hex'));
  }
 });
});
