import { describe, it, expect } from 'vitest';
import { agentOperations } from '@/services/agent-runtime/operations';

const files = { '/src/pages/Home.tsx': `export default function Home(){return (<main><section id="hero"><a data-ut-intent="nav.goto" href="#/contact">Go</a></section><section id="faq">Q</section></main>);}` };

describe('propose_section_action', () => {
  it('moves a section and keeps the button destination', () => {
    const out = agentOperations.propose_section_action({ files }, { op: 'move', address: 'section:/#faq', direction: 'up' });
    const src = Object.values(out.files)[0];
    expect(src.indexOf('id="faq"')).toBeLessThan(src.indexOf('id="hero"'));
    expect(src).toContain('href="#/contact"');
  });
  it('refuses unknown sections', () => {
    expect(() => agentOperations.propose_section_action({ files }, { op: 'remove', address: 'section:/#nope' })).toThrow();
  });
});
