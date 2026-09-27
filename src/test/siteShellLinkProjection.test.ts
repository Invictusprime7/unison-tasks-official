import { describe, it, expect } from 'vitest';
import { buildSiteShellTopology, projectSiteShellLinks } from '@/services/siteShellTopology';

const registry = {
  pages: {
    h: { pageId: 'h', path: '/', title: 'Home', isHome: true, navOrder: 0, filePath: '/src/pages/Home.tsx' },
    s: { pageId: 's', path: '/shop', title: 'Shop', isHome: false, navOrder: 1, filePath: '/src/pages/Shop.tsx' },
    a: { pageId: 'a', path: '/about', title: 'Our Story', isHome: false, navOrder: 2, filePath: '/src/pages/About.tsx' },
  },
} as never;

describe('projectSiteShellLinks', () => {
  it('rewrites navbar section links to registry order and is idempotent', () => {
    const src = `const SECTIONS = [\n  {\n    "type": "navbar",\n    "props": {\n      "links": [\n        { "label": "Sale", "href": "#sale" }\n      ],\n      "cta": { "label": "Go", "href": "#x" }\n    }\n  },\n  { "type": "hero", "props": { "links": [{ "label": "keep", "href": "#k" }] } }\n];`;
    const topo = buildSiteShellTopology(registry);
    const once = projectSiteShellLinks(topo, { '/src/pages/Home.tsx': src });
    const out = once.files['/src/pages/Home.tsx'];
    expect(out).toContain('"label": "Our Story", "href": "#/about"');
    expect(out).not.toContain('Sale');
    expect(out).toContain('"keep"');
    expect(JSON.parse(out.replace('const SECTIONS = ', '').replace(/;$/, ''))[0].props.links).toHaveLength(3);
    expect(projectSiteShellLinks(topo, once.files).changed).toEqual([]);
  });

  it('rewrites hand-authored nav arrays but leaves unrelated arrays', () => {
    const src = `const navLinks = [{ label: 'Home', href: '#/' }, { label: 'Shop', href: '#/shop' }];\nconst ctas = [{ label: 'Shop', href: '#/shop' }, { label: 'About', href: '#/about' }];`;
    const out = projectSiteShellLinks(buildSiteShellTopology(registry), { '/src/pages/Home.tsx': src }).files['/src/pages/Home.tsx'];
    expect(out).toContain('{ label: "Our Story", href: "#/about" }');
    expect(out).toContain("const ctas = [{ label: 'Shop'");
  });
});
