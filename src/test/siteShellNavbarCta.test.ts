import { describe, expect, it } from 'vitest';
import { buildSiteShellTopology, projectSiteShellLinks } from '@/services/siteShellTopology';
import type { PageRegistry } from '@/types/pageRegistry';

const registry = (paths: Array<[string, string]>) => ({
  homePageId: 'p0',
  pages: Object.fromEntries(paths.map(([path, title], i) => [`p${i}`, { pageId: `p${i}`, path, title, isHome: path === '/', navOrder: i }])),
}) as unknown as PageRegistry;

const page = (cta: string) => `export const SECTIONS = [{ "id": "nav", "type": "navbar", "props": { "links": [{ "label": "Contact", "href": "#contact" }, { "label": "About", "href": "#about" }], "cta": ${cta} } }, { "id": "hero", "type": "hero", "props": {} }];`;

describe('navbar CTA projection', () => {
  it('points the CTA at the selected booking page and uses only selected links', () => {
    const topology = buildSiteShellTopology(registry([['/', 'Home'], ['/services', 'Services'], ['/booking', 'Book']]));
    const { files } = projectSiteShellLinks(topology, {
      '/src/pages/Home.tsx': page('{ "label": "Book Appointment", "href": "#booking", "intent": "booking.create" }'),
    });
    const out = files['/src/pages/Home.tsx'];
    expect(out).toContain('"href": "#/booking"');
    expect(out).not.toContain('#contact');
    expect(out).toContain('"label": "Services"');
  });

  it('drops the CTA when the user did not select a matching page', () => {
    const topology = buildSiteShellTopology(registry([['/', 'Home'], ['/services', 'Services'], ['/gallery', 'Gallery']]));
    const { files } = projectSiteShellLinks(topology, {
      '/src/pages/Home.tsx': page('{ "label": "Book Appointment", "href": "#booking", "intent": "booking.create" }'),
    });
    expect(files['/src/pages/Home.tsx']).toContain('"cta": null');
  });
});
