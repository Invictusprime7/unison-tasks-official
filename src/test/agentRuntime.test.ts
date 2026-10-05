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
});
