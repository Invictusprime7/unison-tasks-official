import { describe, expect, it } from 'vitest';
import { validateSiteSyntax } from '@/services/siteSyntaxValidation';

describe('immutable site syntax validation', () => {
  it('reports a trailing token without rewriting authored source', () => {
    const source = 'export default function Home(){ return <main>Home</main>; }\n)';
    const result = validateSiteSyntax({ '/src/pages/Home.tsx': source });
    expect(result.reports[0].status).toBe('invalid');
    expect(result.files['/src/pages/Home.tsx']).toBe(source);
  });

  it('reports an unterminated block comment without closing it', () => {
    const source = 'export default function Faq(){ /* open';
    const result = validateSiteSyntax({ '/src/pages/Faq.tsx': source });
    expect(result.invalidCount).toBe(1);
    expect(result.files['/src/pages/Faq.tsx']).toBe(source);
  });

  it('accepts valid TSX byte-for-byte', () => {
    const source = 'export default function Home(){ return <main>Portfolio</main>; }';
    const result = validateSiteSyntax({ '/src/pages/Home.tsx': source });
    expect(result).toMatchObject({ cleanCount: 1, invalidCount: 0 });
    expect(result.files['/src/pages/Home.tsx']).toBe(source);
  });
});
