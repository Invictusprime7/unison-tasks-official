import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Launcher Wizard action surface', () => {
  const source = readFileSync('src/components/onboarding/wizard/LauncherWizard.tsx', 'utf8');

  it('keeps project imports and business-scoped Unison restore available', () => {
    expect(source).toContain('<ImportProjectZipButton');
    expect(source).toContain('<ImportUnisonSiteZipButton');
    expect(source).toContain('businessId={prefill.businessId}');
  });

  it('passes editable social profiles into the launch orchestrator', () => {
    expect(source).toContain('const [socialLinks, setSocialLinks]');
    expect(source).toContain('socialLinks,');
    for (const platform of ['instagram', 'facebook', 'linkedin', 'youtube']) {
      expect(source).toContain(`"${platform}"`);
    }
  });

  it('surfaces and persists structured Generate Site failures', () => {
    expect(source).toContain('createLaunchFailureReport(error, latestProgressRef.current)');
    expect(source).toContain('persistLaunchFailureReport(report)');
    expect(source).toContain("toast.error(`Generate Site failed in ${report.stage}`");
    expect(source).toContain("console.error('[LauncherWizard] Generate Site failed'");
    expect(source).toContain('Technical details');
    expect(source).toContain("label: 'Copy details'");
  });
});