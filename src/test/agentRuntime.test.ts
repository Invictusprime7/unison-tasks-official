import { describe, expect, it } from 'vitest';
import { findIntentRetargets } from '@/services/agent-runtime/intentInvariant';
import { agentOperations } from '@/services/agent-runtime/operations';
import { onAgentEvent, emitAgentEvent } from '@/services/agent-runtime/agentEvents';

const page = (cls: string, to: string) =>
  `export default function P(){return <a className="${cls}" data-ut-intent="nav.goto" href="${to}">Book</a>}`;

describe('agent runtime', () => {
  it('allows restyling a button that keeps its destination', () => {
    expect(findIntentRetargets({ '/src/pages/Home.tsx': page('a', '/book') }, { '/src/pages/Home.tsx': page('b gold', '/book') })).toEqual([]);
  });
  it('refuses an edit that retargets a button', () => {
    const v = findIntentRetargets({ '/src/pages/Home.tsx': page('a', '/book') }, { '/src/pages/Home.tsx': page('a', '/shop') });
    expect(v[0]?.intent).toBe('nav.goto');
  });
  it('proposes theme token changes without writing', () => {
    const ctx = { files: { '/src/index.css': ':root {\n  --primary: 0 0% 0%;\n}' } };
    const change = agentOperations.set_theme_tokens(ctx, { primary: '45 80% 50%' });
    expect(change?.files['/src/index.css']).toContain('--primary: 45 80% 50%;');
    expect(ctx.files['/src/index.css']).toContain('0 0% 0%');
  });
  it('streams events on the shared bus', () => {
    const seen: string[] = [];
    const off = onAgentEvent((e) => seen.push(e.kind));
    emitAgentEvent({ kind: 'plan', message: 'x' });
    off();
    expect(seen).toEqual(['plan']);
  });
  it('proposes a canonical binding operation without mutating preview source', () => {
    const ctx = {
      files: { '/src/pages/Home.tsx': '<button data-ut-binding-id="book" data-ut-intent="booking.create">Book</button>' },
      revisionId: 'revision-1',
      snapshot: {
        bindings: {
          book: { bindingId: 'book', sourcePageId: 'home', sourceLabel: 'Book', intent: 'calendar.open', coreIntent: 'booking.create', targetId: 'calendar', targetType: 'calendar' },
        },
      },
    } as never;
    const proposal = agentOperations.propose_bind_intent(ctx, {
      bindingId: 'book', primaryIntent: 'booking.create', revisionId: 'revision-1',
    }, 'booking.start', { campaign: 'fall' });
    expect(proposal.bindingOps).toEqual([{
      type: 'bindIntent', elementId: 'book', intent: 'booking.start', payload: { campaign: 'fall' },
    }]);
    expect((ctx as any).files['/src/pages/Home.tsx']).toContain('booking.create');
  });
  it('refuses a behavior proposal for an unbound control', () => {
    expect(() => agentOperations.propose_bind_intent({ files: {}, revisionId: 'revision-1' }, {
      bindingId: 'missing', primaryIntent: 'booking.create', revisionId: 'revision-1',
    }, 'booking.create')).toThrow('no canonical binding');
  });
  it('reads graph, schema, and backend metadata without changing the caller state', () => {
    const ctx = {
      files: {
        '/package.json': JSON.stringify({ dependencies: { zod: '4.0.0' } }),
        '/src/pages/Home.tsx': '<main><button data-ut-intent="booking.create">Book</button></main>',
      },
      revisionId: 'revision-42',
      schema: { tables: [{ name: 'bookings', columns: [{ name: 'user_id', type: 'uuid' }], policies: [{ name: 'own rows', command: 'select' }] }] },
      backendActions: [{ name: 'createBooking', capability: 'booking', writesTo: ['bookings'] }],
    };

    expect(agentOperations.inspect_system_graph(ctx).revision.id).toBe('revision-42');
    expect(agentOperations.inspect_table(ctx, 'bookings')).toMatchObject({ id: 'table:bookings' });
    expect(agentOperations.inspect_policies(ctx, 'bookings')).toEqual([expect.objectContaining({ id: 'policy:bookings:own rows' })]);
    expect(agentOperations.inspect_dependencies(ctx)).toEqual([expect.objectContaining({ id: 'dependency:zod' })]);
    expect(ctx.files['/src/pages/Home.tsx']).toContain('booking.create');
  });
});

import { buildSystemGraph, renderSystemGraphForPrompt } from '@/services/agent-runtime/systemGraph';
describe('system graph', () => {
  it('projects pages, sections and button destinations from source', () => {
    const files = { '/src/pages/Home.tsx': '<main><section id="hero"><a data-ut-intent="nav.goto" href="/book">Book now</a></section><section id="faq"></section></main>' };
    const g = buildSystemGraph(files);
    expect(g.pages[0].sections.map((s) => s.id)).toEqual(['hero', 'faq']);
    expect(g.pages[0].intents[0]).toMatchObject({ intent: 'nav.goto', target: '/book', label: 'Book now' });
    expect(renderSystemGraphForPrompt(g)).toContain('→ /book');
  });
  it('rebuilds stable frontend and backend relationships from canonical inputs', () => {
    const g = buildSystemGraph({
      revisionId: 'revision-42',
      files: {
        '/package.json': JSON.stringify({ dependencies: { '@supabase/supabase-js': '2.0.0' } }),
        '/src/pages/Home.tsx': 'import { BookingForm } from "@/components/BookingForm"; export default function Home(){return <main><section data-ut-section-id="hero"><BookingForm /><button data-ut-intent="booking.create">Book</button></section></main>}',
      },
      snapshot: {
        snapshotId: 'snapshot-42',
        pageRegistry: { pages: { home: { pageId: 'home', path: '/', filePath: '/src/pages/Home.tsx' } }, funnels: {}, homePageId: 'home', version: 1 },
        bindings: { booking: { bindingId: 'booking', sourcePageId: 'home', coreIntent: 'booking.create', targetId: 'createBooking', sourceLabel: 'Book' } },
        businessSystem: { capabilities: [{ id: 'booking', status: 'approved' }] },
      } as never,
      runtimeManifest: { routes: ['/'], dependencies: { 'lucide-react': '1.0.0' } },
      schema: { tables: [{ name: 'bookings', columns: [{ name: 'id', type: 'uuid' }], policies: [{ name: 'own rows', command: 'select' }] }] },
      backendActions: [{ name: 'createBooking', capability: 'booking', writesTo: ['bookings'] }],
      diagnostics: [{ id: 'diagnostic:preview', level: 'warning', message: 'Preview is stale' }],
    });

    expect(g.revision).toMatchObject({ id: 'revision-42', source: 'canonical-revision' });
    expect(g.pages).toEqual([expect.objectContaining({ id: 'home', route: '/', componentIds: ['component:BookingForm'] })]);
    expect(g.routes).toEqual([expect.objectContaining({ id: 'route:/', pageId: 'home' })]);
    expect(g.bindings).toEqual([expect.objectContaining({ id: 'binding:booking', intentId: 'intent:booking.create' })]);
    expect(g.database.tables[0]).toMatchObject({ id: 'table:bookings', policyIds: ['policy:bookings:own rows'] });
    expect(g.edges).toEqual(expect.arrayContaining([
      expect.objectContaining({ from: 'home', to: 'route:/', kind: 'has_route' }),
      expect.objectContaining({ from: 'action:createBooking', to: 'capability:booking', kind: 'requires' }),
      expect.objectContaining({ from: 'action:createBooking', to: 'table:bookings', kind: 'writes_to' }),
      expect.objectContaining({ from: 'table:bookings', to: 'policy:bookings:own rows', kind: 'has_policy' }),
    ]));
  });
});
