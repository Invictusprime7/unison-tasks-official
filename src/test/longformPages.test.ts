import { describe, it, expect } from 'vitest';
import { planLongformPage, longformBase, filePathForRoute } from '@/services/resources/longformPages';

const home = `import React from 'react';
import SiteNav from '../project-components/site/SiteNav';
import SiteFooter from '../project-components/site/SiteFooter';
export const Home = () => <div/>;`;

const insights = `export const Insights = () => (
  <section>
    <article><h3>The Sovereign Brand</h3><p>Why...</p><a href="#" className="link">Read Essay</a></article>
    <article><h3>Quiet Luxury</h3><a href="/other" className="link">Read Essay</a></article>
  </section>
);`;

describe('longform pages', () => {
  const files = { '/src/pages/Home.tsx': home, '/src/pages/Insights.tsx': insights };

  it('uses the site listing route, else an industry default', () => {
    expect(longformBase('articles', ['/', '/insights'], 'salon')).toBe('/insights');
    expect(longformBase('articles', ['/'], 'salon')).toBe('/blog');
    expect(longformBase('articles', ['/'], 'agency')).toBe('/insights');
    expect(longformBase('case-studies', ['/case-studies'], 'law')).toBe('/case-studies');
    expect(filePathForRoute('/insights/the-sovereign-brand')).toBe('/src/pages/InsightstheSovereignBrand.tsx');
  });

  it('builds the page with site chrome and links only that read button', () => {
    const plan = planLongformPage({
      record: { id: 'r1', name: 'The Sovereign Brand', body: '## Intro\n\nText.', author: 'A' },
      kind: 'articles', resourceKey: 'content:articles', files, existingPaths: ['/', '/insights'], industry: 'agency',
    });
    expect(plan.path).toBe('/insights/the-sovereign-brand');
    const page = plan.files[plan.filePath];
    expect(page).toContain("import SiteNav from '../project-components/site/SiteNav'");
    expect(page).toContain('data-ut-resource="content:articles#r1.body"');
    const listing = plan.files['/src/pages/Insights.tsx'];
    expect(listing).toContain('data-ut-path="/insights/the-sovereign-brand"');
    expect(listing).toContain('href="/other"');
    expect(listing.match(/data-ut-intent="nav.goto"/g)?.length).toBe(1);
  });

  it('case studies go under the work route', () => {
    const plan = planLongformPage({ record: { id: 'c1', name: 'Atlas Rebrand' }, kind: 'case-studies', resourceKey: 'content:case-studies', files, existingPaths: ['/'], industry: 'restaurant' });
    expect(plan.path).toBe('/work/atlas-rebrand');
    expect(plan.linkedFiles).toEqual([]);
  });
});

import { extractLongformFromSource } from '@/services/resources/longformPages';
describe('extractLongformFromSource', () => {
  it('finds essays by their read control', () => {
    const src = `<article><span>Brand Identity</span><time>March 24, 2026</time><span>7 min read</span>
      <h2 className="x">The Sovereign Brand: Why Commodity Templates Silently Destroy Enterprise Trust</h2>
      <p className="y">In an era dominated by ubiquitous web patterns and interchangeable tech components.</p>
      <a href="#">Read Essay</a></article>`;
    const [f] = extractLongformFromSource({ '/src/pages/Insights.tsx': src });
    expect(f.kind).toBe('articles');
    expect(f.title).toMatch(/^The Sovereign Brand/);
    expect(f.date).toBe('March 24, 2026');
    expect(f.readTime).toBe('7 min read');
    expect(f.excerpt).toMatch(/^In an era/);
  });
});
