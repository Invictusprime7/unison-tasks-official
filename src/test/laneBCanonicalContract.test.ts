import { describe, it, expect } from 'vitest';
import {
  LANE_B_GLOBAL_STYLE_PATTERN,
  LANE_B_LITERAL_STYLE_PATTERN,
  LANE_B_PALETTE_LITERAL_PATTERN,
  normalizeLaneBProposal,
  renderLaneBCanonicalContract,
} from '@/services/launch/laneBCanonicalContract';
import {
  WIZARD_LANE_B_PROTECTED_PATHS,
  validateWizardLaneBProposal,
  type WizardLaneBEnrichmentProposal,
  type WizardLaneBEnrichmentRequest,
} from '@/services/wizardLaneBEnrichment';

const PAGE = '/src/pages/home.tsx';
const currentSource = `export default function Home() {
  return (
    <main data-ut-section-id="hero-1">
      <h1>Welcome</h1>
      <button data-ut-intent="booking.start">Book</button>
    </main>
  );
}`;

const request = {
  version: '1.0',
  wizardSeedId: 'seed-1',
  snapshotId: 'snap-1',
  designRegistrySignature: 'sig-1',
  businessName: 'Aurora',
  industryOverlay: 'salon',
  primaryGoal: 'bookings',
  selectedPages: ['home'],
  selectedTemplateId: 'salon-premium',
  selectedThemeId: 'aurora',
  designIntervention: {} as WizardLaneBEnrichmentRequest['designIntervention'],
  pageRegistry: [{ id: 'home', filePath: PAGE, route: '/', title: 'Home', requiredIntents: ['booking.start'] }],
  currentPageSources: { home: { filePath: PAGE, content: currentSource } },
  uiFoundationDirective: '',
  designVocabularyReport: { executableIds: ['hero:image-stream'], unimplementedIds: [] },
  runtimeDependencies: { 'framer-motion': '^11.0.0' },
  intentBindingGuide: '',
} satisfies WizardLaneBEnrichmentRequest;

const manifest = { primitiveImports: ['@/unison/ui/layout', '@/unison/ui/motion'], requirements: [] as string[] };

const proposal = (fileOps: WizardLaneBEnrichmentProposal['fileOps'], overrides: Partial<WizardLaneBEnrichmentProposal> = {}): WizardLaneBEnrichmentProposal => ({
  version: '1.0',
  wizardSeedId: request.wizardSeedId,
  snapshotId: request.snapshotId,
  designRegistrySignature: request.designRegistrySignature,
  fileOps,
  ...overrides,
});

describe('Lane B canonical contract', () => {
  it('publishes every machine-checked rule with its concrete values', () => {
    const contract = renderLaneBCanonicalContract({
      request,
      uiFoundationManifest: manifest,
      protectedPaths: WIZARD_LANE_B_PROTECTED_PATHS,
    });
    expect(contract).toContain('seed-1');
    expect(contract).toContain('snap-1');
    expect(contract).toContain('sig-1');
    expect(contract).toContain(PAGE);
    expect(contract).toContain('/src/App.tsx');
    expect(contract).toContain('@/unison/ui/layout');
    expect(contract).toContain('framer-motion');
    expect(contract).toContain('hero:image-stream');
    expect(contract).toContain('hero-1');
    expect(contract).toContain('booking.start');
    expect(contract).toContain('Exactly one <h1>');
  });

  it('states the exact forbidden patterns the validator asserts', () => {
    const contract = renderLaneBCanonicalContract({
      request,
      uiFoundationManifest: manifest,
      protectedPaths: WIZARD_LANE_B_PROTECTED_PATHS,
    });
    expect(contract).toContain(LANE_B_LITERAL_STYLE_PATTERN.source);
    expect(contract).toContain(LANE_B_PALETTE_LITERAL_PATTERN.source);
    expect(contract).toContain(LANE_B_GLOBAL_STYLE_PATTERN.source);
  });

  it('repairs mechanical envelope defects instead of losing the page', () => {
    const normalized = normalizeLaneBProposal(
      proposal(
        [
          { type: 'replace', path: PAGE, content: '```tsx\n' + currentSource + '\n```' },
          { type: 'replace', path: PAGE, content: currentSource },
          { type: 'replace', path: '/src/App.tsx', content: currentSource },
          { type: 'replace', path: '/src/pages/unknown.tsx', content: currentSource },
        ],
        { wizardSeedId: 'echoed-wrong', snapshotId: 'wrong', designRegistrySignature: 'wrong' },
      ),
      request,
      WIZARD_LANE_B_PROTECTED_PATHS,
    );
    expect(normalized.wizardSeedId).toBe('seed-1');
    expect(normalized.snapshotId).toBe('snap-1');
    expect(normalized.designRegistrySignature).toBe('sig-1');
    expect(normalized.fileOps).toHaveLength(1);
    expect(normalized.fileOps[0].path).toBe(PAGE);
    expect(normalized.fileOps[0].content.startsWith('export default')).toBe(true);
  });

  it('accepts a normalized proposal that follows the published contract', () => {
    const normalized = normalizeLaneBProposal(
      proposal([{ type: 'replace', path: PAGE, content: '```tsx\n' + currentSource + '\n```' }], { snapshotId: 'wrong' }),
      request,
      WIZARD_LANE_B_PROTECTED_PATHS,
    );
    const verdict = validateWizardLaneBProposal({ proposal: normalized, request, uiFoundationManifest: manifest });
    expect(verdict.violations).toEqual([]);
    expect(verdict.valid).toBe(true);
  });

  it('still rejects genuine design violations', () => {
    const bad = currentSource.replace('<h1>Welcome</h1>', '<h1 className="text-blue-500">Welcome</h1><h1>Twice</h1>');
    const verdict = validateWizardLaneBProposal({
      proposal: proposal([{ type: 'replace', path: PAGE, content: bad }]),
      request,
      uiFoundationManifest: manifest,
    });
    expect(verdict.valid).toBe(false);
    expect(verdict.violations.join(' ')).toMatch(/literal color|<h1>/);
  });
});
