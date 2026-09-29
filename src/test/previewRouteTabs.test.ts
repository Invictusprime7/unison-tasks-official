import { describe, expect, it } from 'vitest';
import { buildPreviewRouteTabs, extractRenderedRoutes } from '@/components/creatives/web-builder/previewRouteTabs';

const app = `
<HashRouter><Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/book-now" element={<UnisonPendingPage title="Book" route="/book-now" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
</Routes></HashRouter>`;

describe('preview route tabs', () => {
  it('extracts rendered routes in order, excluding catch-all', () => {
    expect(extractRenderedRoutes(app)).toEqual(['/', '/services', '/book-now']);
  });

  it('shows exactly the rendered routes, hiding unrouted registry pages', () => {
    const tabs = buildPreviewRouteTabs([
      { pageId: 'home', path: '/', title: 'Home', isHome: true },
      { pageId: 'svc', path: '/services', title: 'Our Services' },
      { pageId: 'ghost', path: '/ghost', title: 'Ghost' },
    ], app);
    expect(tabs.map((t) => t.path)).toEqual(['home', 'svc', 'route:/book-now']);
    expect(tabs.map((t) => t.label)).toEqual(['Home', 'Our Services', 'Book Now']);
  });
});
