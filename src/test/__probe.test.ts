import { describe, it } from 'vitest';
import { z } from 'zod';
import { VARIANT_REGISTRY, getGenerationVariantsForSection } from '@/sections/variants/registry';
import { ART_DIRECTION_PACKS } from '@/sections/variants/artDirectionPacks';
import { deriveImplementationVisualSignature } from '@/services/implementationVisualSignature';
import { briefSchema } from '../../supabase/functions/wizard-site-composer/contract';
describe('probe', () => { it('brief', () => {
  const pack: any = ART_DIRECTION_PACKS['glass-tech'];
  const roles = ['home','shop','about','contact'];
  const variants = [...new Map(Object.keys(VARIANT_REGISTRY).flatMap(type => roles.flatMap(role =>
    getGenerationVariantsForSection(type as any, pack, role))).map(v => [v.id, v])).values()]
    .map(v => ({ id: v.id, family: v.sectionType, description: v.description, tags: v.tags,
      pageRoles: roles, preferredSource: true, certification: v.vfs?.certification ?? 'approved',
      visualSignature: deriveImplementationVisualSignature(v) }));
  const res = briefSchema.safeParse({ businessName: 'x', industry: 'retail', launchSeed: 's', roles, pack: pack.id, variants });
  if (!res.success) console.log(JSON.stringify(res.error.issues.slice(0,6), null, 1));
  else console.log('brief OK', variants.length);
}); });
