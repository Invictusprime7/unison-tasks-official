import { describe, expect, it } from 'vitest';
import { describeCompositionFailure } from '@/services/compositionFailure';
import { LaunchFatalError, createLaunchFailureReport } from '@/services/launch/launchRun';

describe('Wizard composition failure diagnostics', () => {
  it.each([401, 403])('identifies authentication failures (%s)', status => {
    expect(describeCompositionFailure({ context: { status } }).message).toContain('Sign in again');
  });
  it('retains safe schema diagnostics while dropping raw responses and secrets', () => {
    const details = describeCompositionFailure({ context: { status: 400, body: JSON.stringify({ fields: ['variants.3.pageRoles', 'Bearer secret'], error: 'private prompt', errorType: 'invalid_brief' }) } });
    expect(details).toMatchObject({ status: 400, errorType: 'invalid_brief', fields: ['variants.3.pageRoles'] });
    expect(JSON.stringify(details)).not.toMatch(/secret|private prompt/);
  });
  it('preserves the endpoint failure code in the saved launch report', () => {
    const details = describeCompositionFailure({ context: { status: 404 } });
    const report = createLaunchFailureReport(new LaunchFatalError(details.message, { stage: 'seed', code: 'composition.endpoint-unavailable' }), null);
    expect(report.code).toBe('composition.endpoint-unavailable');
    expect(report.message).toContain('not deployed');
  });
  it('identifies catalog and format rejection independently of provider errors', () => {
    expect(describeCompositionFailure({ context: { status: 502 } }, { errorType: 'composition_catalog' }).message).toContain('variant catalog');
    expect(describeCompositionFailure({ context: { status: 502 } }, { errorType: 'composition_contract' }).message).toContain('invalid composition format');
  });
});
