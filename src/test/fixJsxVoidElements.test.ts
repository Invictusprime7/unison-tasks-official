import { describe, expect, it } from 'vitest';
import { fixJsxVoidElements } from '@/utils/aiCodeCleaner';

describe('fixJsxVoidElements', () => {
  it('self-closes lowercase HTML void elements', () => {
    expect(fixJsxVoidElements('<div><br><img src="a.png" alt=""></div>'))
      .toBe('<div><br /><img src="a.png" alt="" /></div>');
  });

  it('leaves capitalised components with children untouched', () => {
    const code = '<Link to="/" className="brand">Home</Link><Input type="text">x</Input>';
    expect(fixJsxVoidElements(code)).toBe(code);
  });
});
