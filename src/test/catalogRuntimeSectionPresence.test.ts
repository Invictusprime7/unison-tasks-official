import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveHydrationRequest, resolveSectionData } from '@/services/catalogRuntime';
import { getBinding } from '@/services/sectionDataBindingService';
import type { SectionDataBindingDTO } from '@/types/catalog';

const { queryResult } = vi.hoisted(() => ({ queryResult: { data: [] as unknown[], error: null as unknown } }));

vi.mock('@/services/sectionDataBindingService', () => ({ getBinding: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => {
      const query = {
        select: () => query,
        eq: () => query,
        like: () => query,
        order: () => query,
        then: (resolve: (value: typeof queryResult) => unknown) => Promise.resolve(queryResult).then(resolve),
      };
      return query;
    },
  },
}));

beforeEach(() => {
  vi.mocked(getBinding).mockReset();
  vi.mocked(getBinding).mockResolvedValue(null);
  queryResult.data = [];
  queryResult.error = null;
});

describe('catalog hydration preserves unbound template sections', () => {
  it('retains authored content when the section has no binding', async () => {
    expect(await resolveSectionData('project', '/', 'services')).toMatchObject({
      binding: null, fallback: 'show_placeholder',
    });
  });

  it.each([
    { projectId: '', pagePath: '/', sectionType: 'services' },
    { projectId: 'project', pagePath: '/', sectionType: 'unknown' },
    { projectId: 'project', pagePath: '/', sectionId: 'services', sectionType: 'services' },
  ])('does not hide an unresolved section: %j', async (request) => {
    expect(await resolveHydrationRequest(request)).toMatchObject({
      binding: null, fallback: 'show_placeholder',
    });
  });

  it('retains authored content when binding lookup fails', async () => {
    queryResult.error = { message: 'lookup unavailable' };
    expect(await resolveHydrationRequest({ projectId: 'project', pagePath: '/', sectionType: 'services' }))
      .toMatchObject({ binding: null, fallback: 'show_placeholder' });
  });

  it('honors an actual binding that explicitly hides an empty section', async () => {
    vi.mocked(getBinding).mockResolvedValue({
      id: 'binding', businessId: 'business', projectId: 'project', pagePath: '/',
      sectionId: 'services', sourceTable: 'services', fallbackMode: 'hide_section',
      filters: {}, sort: {}, displayMapping: {},
    } as SectionDataBindingDTO);
    expect(await resolveSectionData('project', '/', 'services')).toMatchObject({
      binding: { id: 'binding' }, fallback: 'hide_section',
    });
  });
});