import { expect, test } from 'vitest';
import { repairAuthoredImageSource } from '@/services/builder/authoredImageRepair';
test('repairs', () => {
  const out = repairAuthoredImageSource(`const a='https://via.placeholder.com/1000x750/808080/ffffff?text=X'; const b='https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png?v=1'; // shop cart`);
  expect(out).not.toMatch(/placeholder/); expect(out).toMatch(/images\.unsplash\.com/);
});
