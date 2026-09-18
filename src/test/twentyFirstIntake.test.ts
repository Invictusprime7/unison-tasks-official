import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { createIntakeRecord, assertProvenance } from '@/design/21st-intake/provenance';
import { auditDependencies, classifyDependency } from '@/design/21st-intake/dependencyResolver';
import { auditSource } from '@/design/21st-intake/compatibilityAudit';
import { normalizeTokens } from '@/design/21st-intake/tokenAdapter';
import { normalizeSource } from '@/design/21st-intake/sourceNormalizer';
import { runIntake, planPromotion, INTAKE_STEPS } from '@/design/21st-intake/componentIntake';
import { activeDuplicates } from '@/design/21st-intake/manifest';

const SRC = path.resolve(__dirname, '..');

function baseRecord(overrides: Record<string, unknown> = {}) {
  return createIntakeRecord({
    sourceId: 'kinetic-hero',
    name: 'Kinetic Hero',
    sourceType: 'block',
    sourceUrl: 'https://21st.dev/kinetic-hero',
    license: 'MIT',
    licenseReview: { status: 'verified', license: 'MIT', source: 'fixture:LICENSE', verifiedAt: '2026-09-17T00:00:00Z' },
    dependencies: ['react', 'framer-motion', 'lucide-react'],
    ...overrides,
  });
}

const CLEAN_SOURCE = `
export function KineticHero() {
  return (
    <section className="bg-background px-6 md:px-12 motion-reduce:transition-none">
      <h1 className="text-foreground text-4xl md:text-6xl">Ship faster</h1>
      <img src="/hero.jpg" alt="Product screenshot" className="rounded-lg" />
      <button data-ut-intent="lead.submit" className="bg-primary text-primary-foreground">Start</button>
    </section>
  );
}
`;

describe('M3 — 21st intake / certification infrastructure', () => {
  it('requires complete provenance', () => {
    expect(assertProvenance(baseRecord())).toEqual([]);
    const issues = assertProvenance(baseRecord({ sourceUrl: undefined, license: undefined }));
    expect(issues).toContain('sourceUrl is required for 21st provenance');
    expect(issues).toContain('license must be reviewed and recorded');
  });

  it.each([undefined, { status: 'unverified' }, { status: 'rejected' },
    { status: 'verified', license: 'MIT' },
    { status: 'verified', license: 'Apache-2.0', source: 'fixture:LICENSE', verifiedAt: '2026-09-17' },
    { status: 'verified', license: 'MIT', source: 'fixture:LICENSE', verifiedAt: 'invalid' },
  ])('blocks source certification without complete license evidence: %#', licenseReview => {
    expect(runIntake({ record: baseRecord({ licenseReview }), source: CLEAN_SOURCE }).certified).toBe(false);
  });

  it('rechecks provenance at promotion even if a certification result is stale', () => {
    const result = runIntake({ record: baseRecord(), source: CLEAN_SOURCE });
    result.record.licenseReview = { status: 'rejected' };
    expect(() => planPromotion(result, { sectionType: 'hero', slug: 'x', componentName: 'X' })).toThrow('license review');
  });

  it('detects disallowed dependencies and gates 3D', () => {
    const audit = auditDependencies(['next', 'swiper', 'react', '@radix-ui/react-dialog']);
    expect(audit.approved).toBe(false);
    expect(audit.rejected).toEqual(['next', 'swiper']);
    expect(classifyDependency('three').verdict).toBe('rejected');
    expect(classifyDependency('three', ['threeD']).verdict).toBe('capability-gated');
    expect(classifyDependency('some-random-lib').verdict).toBe('unknown');
  });

  it('flags Next-only imports and Tailwind v4-only syntax', () => {
    const report = auditSource(
      `import Image from 'next/image';\n@theme { --x: 1 }\n<div className="md:flex" data-ut-slot="x" />`,
      baseRecord({ dependencies: ['next'] }),
    );
    expect(report.passed).toBe(false);
    const codes = report.issues.map((i) => i.code);
    expect(codes).toContain('next-only-import');
    expect(codes).toContain('tailwind-v4-only');
  });

  it('requires reduced-motion handling for animated sources', () => {
    const report = auditSource('<div className="md:flex animate-pulse" data-ut-slot="x" />', baseRecord());
    expect(report.issues.map((i) => i.code)).toContain('missing-reduced-motion');
  });

  it('normalizes foreign tokens onto Stage 4b semantics', () => {
    const result = normalizeTokens('<div className="bg-white text-gray-500 bg-[#ff00aa]" />');
    expect(result.source).toContain('bg-background');
    expect(result.source).toContain('text-muted-foreground');
    expect(result.remainingLiterals).toEqual(['bg-[#ff00aa]']);
  });

  it('normalizes imports and stamps canonical identity', () => {
    const out = normalizeSource(
      `'use client';\nimport Image from 'next/image';\nexport const A = () => (<section className="bg-white md:p-8"><Image src="/a.png" alt="a" /></section>);`,
      { sectionId: 'hero-1', implementation: 'hero:kinetic-tech' },
    );
    expect(out.source).not.toContain('next/image');
    expect(out.source).not.toContain('use client');
    expect(out.source).toContain('data-ut-section-id="hero-1"');
    expect(out.source).toContain('data-ut-implementation="hero:kinetic-tech"');
    expect(out.source).toContain('<img');
  });

  it('certifies a clean source and plans promotion', () => {
    const result = runIntake({
      record: baseRecord(),
      source: CLEAN_SOURCE,
      identity: { sectionId: 'hero-1', implementation: 'hero:kinetic-tech' },
    });
    expect(result.blockers).toEqual([]);
    expect(result.certified).toBe(true);
    expect(result.record.adaptation.portableRecipeCertified).toBe(true);
    expect(result.visualSource?.origin).toBe('21st');

    const plan = planPromotion(result, { sectionType: 'hero', slug: 'kinetic-tech', componentName: 'HeroKineticTech' });
    expect(plan.implementationId).toBe('hero:kinetic-tech');
    expect(plan.vfs).toEqual({ mode: 'portable-recipe', certification: 'approved' });
    expect(plan.deleteIntakePath).toContain('imported/kinetic-hero');
  });

  it('refuses promotion for an uncertified source', () => {
    const result = runIntake({ record: baseRecord({ license: undefined }), source: CLEAN_SOURCE });
    expect(result.certified).toBe(false);
    expect(() => planPromotion(result, { sectionType: 'hero', slug: 'x', componentName: 'X' })).toThrow();
  });

  it('exposes the full ten-step lifecycle and no active duplicates', () => {
    expect(INTAKE_STEPS).toHaveLength(10);
    expect(activeDuplicates()).toEqual([]);
  });

  it('keeps intake out of runtime code', () => {
    const runtimeDirs = ['sections', 'services', 'platform', 'utils', 'runtime'];
    const offenders: string[] = [];
    const walk = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.tsx?$/.test(entry.name)) {
          const text = fs.readFileSync(full, 'utf8');
          if (/from\s+['"][^'"]*21st-intake\/(?!provenance)/.test(text)) offenders.push(full);
        }
      }
    };
    runtimeDirs.forEach((d) => walk(path.join(SRC, d)));
    expect(offenders).toEqual([]);
  });
});
