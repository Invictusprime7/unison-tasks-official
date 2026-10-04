import { expect, test } from 'vitest';
import { repairAuthoredImages, repairAuthoredImageSource } from '@/services/builder/authoredImageRepair';
import { prepareAICandidate } from '@/services/builder/aiCandidateGates';
test('repairs', () => {
  const out = repairAuthoredImageSource(`const a='https://via.placeholder.com/1000x750/808080/ffffff?text=X'; const b='https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png?v=1'; // shop cart`);
  expect(out).not.toMatch(/placeholder/); expect(out).toMatch(/images\.unsplash\.com/);
});

const FAKE = 'https://images.unsplash.com/photo-1599999999abc-fakehero?w=1600&q=80';
const REAL = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80';

test('replaces invented unsplash photo ids and keeps verified ones', () => {
  const out = repairAuthoredImageSource(`<Image src="${FAKE}" /><Image src="${REAL}" /> fashion boutique`);
  expect(out).not.toContain('fakehero');
  expect(out).toContain(REAL);
  expect(out).toMatch(/images\.unsplash\.com\/photo-/);
});

test('keeps ids already present in base files (user-chosen images)', () => {
  const base = { '/src/pages/Home.tsx': `const a = "${FAKE}";` };
  const out = repairAuthoredImages({ '/src/pages/Shop.tsx': `<img src="${FAKE}" />` }, base);
  expect(out['/src/pages/Shop.tsx']).toContain(FAKE);
  expect(repairAuthoredImages({ '/src/pages/Shop.tsx': `<img src="${FAKE}" />` })['/src/pages/Shop.tsx']).not.toContain(FAKE);
});

test('repairs fabricated image ids introduced by candidate preflight', async () => {
  const baseFiles = {
    '/src/pages/Home.tsx': 'export default function Home(){return <main>Base</main>}',
  };
  const candidate = await prepareAICandidate({
    aiFiles: {
      '/src/pages/Home.tsx': 'export default function Home(){return <main>Authored</main>}',
    },
    baseFiles,
    preflight: (changed) => ({
      '/src/pages/Home.tsx': changed['/src/pages/Home.tsx'].replace(
        'Authored',
        `<img src="${FAKE}" />`,
      ),
    }),
  });

  expect(candidate.ok).toBe(true);
  expect(candidate.nextFiles['/src/pages/Home.tsx']).not.toContain('fakehero');
});
