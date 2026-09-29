import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('legacy HTML writer isolation', () => {
  it('does not mount the legacy SiteBuilder from the canonical TSX builder', () => {
    const canonicalBuilder = source('src/components/creatives/WebBuilder.tsx');
    expect(canonicalBuilder).not.toContain('useSiteBuilder');
    expect(canonicalBuilder).not.toContain('siteBuilderRef');
  });

  it('requires an explicit legacy-html project format before HTML VFS sync is available', () => {
    const siteBuilder = source('src/hooks/useSiteBuilder.ts');
    const sitePreview = source('src/hooks/useSitePreview.ts');
    expect(siteBuilder).toContain('projectFormat: "legacy-html"');
    expect(siteBuilder).toContain('projectFormat,');
    expect(sitePreview).toContain('projectFormat: "legacy-html"');
    expect(sitePreview).toContain("if (projectFormat !== 'legacy-html') return;");
  });
});
