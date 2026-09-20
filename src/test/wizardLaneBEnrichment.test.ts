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

const validateWithFiles = (proposal: unknown, files: Record<string, string>) => validateWizardLaneBProposal({
  proposal, request, files,
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

describe('V5 renderable component import gate', () => {
  const pageWith = (statement: string, tag: string) => ({
    ...validProposal,
    fileOps: [{
      ...validProposal.fileOps[0],
      content: `${statement} export default function Home(){ return <main><h1>Studio</h1><${tag} /><button data-ut-intent="contact.submit">Contact</button></main>; }`,
    }],
  });

  it('accepts valid named and default component imports', () => {
    const files = {
      '/src/components/Hero.tsx': 'export function Hero(){ return <section />; }',
      '/src/components/Nav.tsx': 'export default function Nav(){ return <nav />; }',
    };
    expect(validateWithFiles(pageWith('import { Hero } from "@/components/Hero";', 'Hero'), files).valid).toBe(true);
    expect(validateWithFiles(pageWith('import Nav from "../components/Nav";', 'Nav'), files).valid).toBe(true);
  });

  it('rejects missing named exports and default/named mismatches', () => {
    const files = { '/src/components/Hero.tsx': 'export default function Hero(){ return <section />; }' };
    const missingNamed = validateWithFiles(pageWith('import { Hero } from "@/components/Hero";', 'Hero'), files);
    expect(missingNamed.violations.some(value => value.includes('does not export Hero'))).toBe(true);
    const missingDefault = validateWithFiles(pageWith('import Hero from "@/components/Missing";', 'Hero'), files);
    expect(missingDefault.violations.some(value => value.includes('does not resolve'))).toBe(true);
  });

  it('accepts namespace member expressions and ignores lowercase intrinsic elements', () => {
    const files = { '/src/components/Dialog.tsx': 'export const Content = () => <section />;' };
    const proposal = pageWith('import * as Dialog from "@/components/Dialog";', 'Dialog.Content');
    expect(validateWithFiles(proposal, files).valid).toBe(true);
    expect(validateWithFiles(validProposal, {}).valid).toBe(true);
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

describe('V4 M9: Lane B runtime dependency allow-list', () => {
  const scopedRequest = {
    ...request,
    runtimeDependencies: { 'framer-motion': '^11.0.0', 'lucide-react': '^0.462.0' },
  } as WizardLaneBEnrichmentRequest;
  const validateScoped = (proposal: unknown) => validateWizardLaneBProposal({
    proposal, request: scopedRequest,
    uiFoundationManifest: { primitiveImports: [], requirements: [] },
  });
  const withImports = (imports: string) => ({
    ...validProposal,
    fileOps: [{ ...validProposal.fileOps[0], content: imports + validProposal.fileOps[0].content }],
  });

  it('accepts certified packages, react, and relative or alias paths', () => {
    const result = validateScoped(withImports(
      'import { motion } from "framer-motion"; import { Star } from "lucide-react"; import { cn } from "@/lib/utils"; import x from "./local";',
    ));
    expect(result.violations.filter(v => v.includes('runtime dependency'))).toEqual([]);
  });

  it('rejects an uncertified package the launcher never installed', () => {
    const result = validateScoped(withImports('import gsap from "gsap";'));
    expect(result.valid).toBe(false);
    expect(result.violations.some(v => v.includes('"gsap"'))).toBe(true);
  });

  it('resolves scoped package names to their package root', () => {
    expect(validateScoped(withImports('import * as Dialog from "@radix-ui/react-dialog";')).violations
      .some(v => v.includes('"@radix-ui/react-dialog"'))).toBe(true);
  });

  it('stays silent when no allow-list is supplied (legacy contexts)', () => {
    expect(validate(withImports('import gsap from "gsap";')).violations
      .some(v => v.includes('runtime dependency'))).toBe(false);
  });
});

describe('M8: Lane B 21st identity contract', () => {
  const identityRequest = {
    ...request,
    designVocabularyReport: { executableIds: ['hero:image-stream'], unimplementedIds: [], selectedIds: ['hero:image-stream'] },
    currentPageSources: {
      home: {
        filePath: '/src/pages/Home.tsx',
        content: '<section data-ut-section-id="home-hero" data-ut-variant="hero:image-stream" />',
      },
    },
  } as unknown as WizardLaneBEnrichmentRequest;
  const validateIdentity = (content: string) => validateWizardLaneBProposal({
    proposal: { ...validProposal, fileOps: [{ ...validProposal.fileOps[0], content }] },
    request: identityRequest,
    uiFoundationManifest: { primitiveImports: [], requirements: [] },
  });
  const page = (attrs: string) =>
    `export default function Home(){ return <main><section ${attrs}><h1>Studio</h1></section><button data-ut-intent="contact.submit">Contact</button></main>; }`;

  it('accepts an enriched page that keeps the canonical section identity and a certified variant', () => {
    expect(validateIdentity(page('data-ut-section-id="home-hero" data-ut-variant="hero:image-stream"')))
      .toMatchObject({ valid: true, violations: [] });
  });

  it('rejects an invented variant identity outside the certified vocabulary', () => {
    const result = validateIdentity(page('data-ut-section-id="home-hero" data-ut-variant="hero:invented"'));
    expect(result.valid).toBe(false);
    expect(result.violations.some(v => v.includes('hero:invented'))).toBe(true);
  });

  it('rejects a proposal that drops a canonical section identity', () => {
    const result = validateIdentity(page('data-ut-variant="hero:image-stream"'));
    expect(result.valid).toBe(false);
    expect(result.violations.some(v => v.includes('home-hero'))).toBe(true);
  });

  it('stays silent for legacy requests without vocabulary or current sources', () => {
    const result = validateWizardLaneBProposal({
      proposal: { ...validProposal, fileOps: [{ ...validProposal.fileOps[0], content: page('data-ut-variant="hero:anything"') }] },
      request,
      uiFoundationManifest: { primitiveImports: [], requirements: [] },
    });
    expect(result).toMatchObject({ valid: true, violations: [] });
  });
});
