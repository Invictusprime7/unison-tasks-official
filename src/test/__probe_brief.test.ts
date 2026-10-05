import { it } from 'vitest';
import { compileResolvedSiteDesignContext } from '@/services/launch/resolvedSiteDesignContext';
import { renderPageBrief } from '@/services/launch/siteAuthoringOrchestrator';
import { planSiteComposition, renderCompositionBrief } from '@/services/composition';
it('probe', () => {
  const roles = ['home','about','services','gallery','faq','contact','booking'];
  const ctx = compileResolvedSiteDesignContext({ industry: 'salon', roles, designSeed: 'x', businessModel: 'general' as never } as never);
  const plan = planSiteComposition('salon', roles.map(r=>({pageId:r, role:r})), ctx.fingerprint, { artDirection: ctx.contract.artDirectionPackId, businessTraits: [] });
  const page = { pageId:'home', role:'home', title:'Home', route:'/', filePath:'/src/pages/Home.tsx' };
  const b = renderPageBrief(ctx, page as never, 'ROYALE');
  const c = renderCompositionBrief(plan.pages[0], [], null);
  console.log('PAGE BRIEF LEN', b.length, 'COMPOSITION LEN', c.length, 'TOTAL', b.length + c.length + 2);
  for (const line of b.split('\n')) console.log(line.length, line.slice(0, 120));
  console.log('---COMP---\n' + c);
});
