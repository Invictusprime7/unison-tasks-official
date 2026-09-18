import { describe, expect, it } from 'vitest';
import {
  decodeWizardLaneBProposal,
  mergeLaneBProposalWithSnapshot,
  validateWizardLaneBProposal,
  type WizardLaneBEnrichmentRequest,
} from '@/services/wizardLaneBEnrichment';

const request = {
  wizardSeedId: 'seed',
  snapshotId: 'snapshot',
  designRegistrySignature: 'registry',
  pageRegistry: [{
    id: 'home', filePath: '/src/pages/Home.tsx', route: '/',
    title: 'Home', requiredIntents: ['contact.submit'],
  }],
} as WizardLaneBEnrichmentRequest;

const validProposal = {
  version: '1.0',
  wizardSeedId: request.wizardSeedId,
  snapshotId: request.snapshotId,
  designRegistrySignature: request.designRegistrySignature,
  fileOps: [{
    type: 'replace',
    path: '/src/pages/Home.tsx',
    content: 'import React from "react"; export default function Home() { return <main><h1>Studio</h1><button data-ut-intent="contact.submit">Contact</button></main>; }',
  }],
};

const validate = (proposal: unknown) => validateWizardLaneBProposal({
  proposal, request,
  uiFoundationManifest: { primitiveImports: [], requirements: [] },
});

describe('Lane B proposal validation', () => {
  it.each([
    null, undefined, 'invalid', [], {},
    { ...validProposal, fileOps: null },
    { ...validProposal, fileOps: {} },
    { ...validProposal, fileOps: [] },
    { ...validProposal, fileOps: [null] },
    { ...validProposal, fileOps: [{ ...validProposal.fileOps[0], path: 123 }] },
    { ...validProposal, fileOps: [{ ...validProposal.fileOps[0], content: {} }] },
    { ...validProposal, fileOps: [{ ...validProposal.fileOps[0], type: 'delete' }] },
    { ...validProposal, metadata: { motionStrategy: 123 } },
  ])('rejects malformed provider output without throwing: %#', (proposal) => {
    const result = validate(proposal);
    expect(result.valid).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it('accepts a well-formed candidate with matching identity and required intent', () => {
    expect(validate(validProposal)).toMatchObject({ valid: true, violations: [] });
  });

  it('allows semantic typography hierarchy without changing the selected font family', () => {
    const proposal = {
      ...validProposal,
      fileOps: [{
        ...validProposal.fileOps[0],
        content: 'import React from "react"; export default function Home() { return <main><h1 className="font-heading text-5xl font-bold tracking-[var(--ut-heading-tracking)]">Studio</h1><button data-ut-intent="contact.submit">Contact</button></main>; }',
      }],
    };
    expect(validate(proposal)).toMatchObject({ valid: true, violations: [] });
  });

  it('accepts modern JSX, arrow functions, and local geometry', () => {
    const proposal = { ...validProposal, fileOps: [{ ...validProposal.fileOps[0], content: 'export default function Home(){ const label = () => "Contact"; return <main style={{minHeight:"70vh",padding:"1rem"}}><h1>Studio</h1><button data-ut-intent="contact.submit">{label()}</button></main>; }' }] };
    expect(validate(proposal)).toMatchObject({ valid: true, violations: [] });
  });
  it('rejects malformed JSX even when its bracket counts balance', () => {
    const proposal = { ...validProposal, fileOps: [{ ...validProposal.fileOps[0], content: 'export default function Home(){ return <main><h1>Studio</h1><button data-ut-intent="contact.submit">Contact</button></section>; }' }] };
    expect(validate(proposal).violations.some(value => value.includes('not valid TSX'))).toBe(true);
  });
  it.each(['#fff', 'rgb(20, 20, 20)', ':root { --primary: 0 0% 0%; }', 'body { padding: 0; }'])('rejects palette or global styles: %s', style => {
    const proposal = { ...validProposal, fileOps: [{ ...validProposal.fileOps[0], content: validProposal.fileOps[0].content.replace('<main>', '<main><style>{' + JSON.stringify(style) + '}</style>') }] };
    expect(validate(proposal).valid).toBe(false);
  });
  it('still rejects stale snapshot identity after schema validation', () => {
    expect(validate({ ...validProposal, snapshotId: 'stale' }).violations)
      .toContain('Snapshot mismatch: proposal has stale, expected snapshot.');
  });

  it('still rejects protected paths after schema validation', () => {
    const result = validate({ ...validProposal, fileOps: [{
      ...validProposal.fileOps[0], path: '/src/App.tsx',
    }] });
    expect(result.valid).toBe(false);
    expect(result.violations.some((violation) => violation.includes('protected path'))).toBe(true);
  });
});

 describe('Builder response to Lane B merge', () => {
  it('decodes the production content envelope and preserves accepted page bytes', () => {
    const proposal = decodeWizardLaneBProposal({ content: JSON.stringify(validProposal), model: 'test' });
    expect(proposal).not.toBeNull();
    expect(validate(proposal).valid).toBe(true);
    const base = { '/src/pages/Home.tsx': 'original', '/src/index.css': 'stage4b', '/src/App.tsx': 'router' };
    const merged = mergeLaneBProposalWithSnapshot(base, proposal!);
    expect(merged['/src/pages/Home.tsx']).toBe(validProposal.fileOps[0].content);
    expect(merged['/src/index.css']).toBe('stage4b');
    expect(merged['/src/App.tsx']).toBe('router');
    expect(base['/src/pages/Home.tsx']).toBe('original');
  });
  it('supports fenced JSON and rejects malformed envelopes', () => {
    expect(decodeWizardLaneBProposal({ content: '```json\n' + JSON.stringify(validProposal) + '\n```' })).toEqual(validProposal);
    for (const value of [null, { content: 'not JSON' }, { content: '{}' }, { content: null }]) expect(decodeWizardLaneBProposal(value)).toBeNull();
  });
});
