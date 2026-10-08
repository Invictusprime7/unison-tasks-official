import { describe, it, expect } from 'vitest';
import { parseResourceValueRequest as p } from '@/services/agent-runtime/resourceValueRequest';

describe('parseResourceValueRequest', () => {
  it('reads prices', () => {
    expect(p('change the price to $49', 'price')).toBe(49);
    expect(p('set to 12.50', 'price')).toBe(12.5);
    expect(p('change price to cheap', 'price')).toBeNull();
  });
  it('reads text values', () => {
    expect(p('rename it "Deep Tissue"', 'name')).toBe('Deep Tissue');
    expect(p('change this to Signature Facial.', 'name')).toBe('Signature Facial');
  });
  it('leaves richer requests to the AI', () => {
    expect(p('make it less formal', 'description')).toBeNull();
    expect(p('change the font to serif', 'name')).toBeNull();
    expect(p('make this better', 'name')).toBeNull();
  });
});
