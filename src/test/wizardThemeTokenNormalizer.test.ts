import { describe, expect, it } from 'vitest';
import { compositionToReactFileSet } from '@/sections/compositionToFileSet';
import { ALL_COMPOSITIONS } from '@/sections/templates';
import { validateSiteSyntax } from '@/services/siteSyntaxValidation';
import { normalizeWizardThemeTokens } from '@/utils/wizardThemeTokenNormalizer';

describe('normalizeWizardThemeTokens', () => {
  it('preserves semantic JavaScript color helpers while replacing numeric CSS colors', () => {
    const source = [
      'const surface = hsla(theme.colors.foreground, 0.92);',
      'const ink = hsl(theme.colors.background);',
      'const token = (value) => `hsl(${value})`;',
      'const palette = "hsl(210deg 50% 40% / .5)";',
      'const semantic = "hsl( var(--foreground) / .8)";',
    ].join('\n');
    const result = normalizeWizardThemeTokens({ '/src/components/recipe.ts': source });
    const normalized = result.files['/src/components/recipe.ts'];
    expect(normalized).toContain('hsla(theme.colors.foreground, 0.92)');
    expect(normalized).toContain('hsl(theme.colors.background)');
    expect(normalized).toContain('`hsl(${value})`');
    expect(normalized).toContain('const palette = "hsl(var(--primary))"');
    expect(normalized).toContain('hsl( var(--foreground) / .8)');
    expect(validateSiteSyntax(result.files).invalidCount).toBe(0);
  });

  it('repairs Lane B visual literals without touching the authoritative Stage 4b stylesheet', () => {
    const result = normalizeWizardThemeTokens({
      '/src/pages/Home.tsx': [
        "export default function Home() {",
        "  return <main className=\"bg-[#112233] text-white border-slate-800 from-blue-500 via-purple-500 to-pink-500\" style={{ color: '#ffffff', background: 'rgb(12, 34, 56)' }}>Home</main>;",
        '}',
      ].join('\n'),
      '/src/index.css': ':root { --primary: 1 2% 3%; } .kept { color: #fff; }',
    });

    const home = result.files['/src/pages/Home.tsx'];
    expect(result.changedFiles).toEqual(['/src/pages/Home.tsx']);
    expect(home).toContain('bg-background');
    expect(home).toContain('text-foreground');
    expect(home).toContain('border-border');
    expect(home).toContain('from-primary via-secondary to-accent');
    expect(home).toContain("color: 'hsl(var(--primary))'");
    expect(home).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(/i);
    expect(result.files['/src/index.css']).toContain('color: #fff;');
  });

  it('preserves already tokenized source exactly', () => {
    const source = '<section className="bg-background text-foreground border-border">Ready</section>';
    const result = normalizeWizardThemeTokens({ '/src/pages/Home.tsx': source });

    expect(result.changedFiles).toEqual([]);
    expect(result.files['/src/pages/Home.tsx']).toBe(source);
  });

  it('keeps composition theme modules parseable through final preflight', () => {
    const composition = ALL_COMPOSITIONS[0];
    expect(composition).toBeDefined();
    const files = compositionToReactFileSet(composition, '/src/pages/Home.tsx');
    const normalized = normalizeWizardThemeTokens(files);
    const sharedThemeFiles = Object.fromEntries(
      Object.entries(normalized.files).filter(([path]) => path.startsWith('/src/components/')),
    );

    expect(normalized.changedFiles).not.toContain('/src/components/theme.ts');
    expect(normalized.changedFiles).not.toContain('/src/components/Navbar.tsx');
    expect(validateSiteSyntax(sharedThemeFiles).invalidCount).toBe(0);
  });
});