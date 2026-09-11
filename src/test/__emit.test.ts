import { it } from 'vitest';
import { compositionToReactFileSet } from '@/sections/compositionToFileSet';
import { getCompositionById } from '@/sections/templates';
it('dump', () => {
  const files = compositionToReactFileSet(getCompositionById('salon-premium')!, '/src/pages/Home.tsx');
  console.log(Object.keys(files).join('\n'));
  for (const [k,v] of Object.entries(files)) {
    if (/Hero|Gallery|Pricing|Testimonials/.test(k)) console.log(k, ['HeroPageIntro','data-ut-variant','aria-modal','item.caption','tier.features',"rawLayout"].filter(t=>v.includes(t)));
  }
});
