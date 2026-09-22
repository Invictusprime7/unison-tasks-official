import { describe, expect, it } from 'vitest';
import {
  APPLIED_VERDICT_LINE,
  CANDIDATE_GENERATED_NOTICE,
  neutralizeModelSuccessClaim,
  transactionVerdictLine,
  withTransactionVerdict,
} from '@/services/builder/builderTransactionState';

describe('builderTransactionState (P0.5 verified-success state machine)', () => {
  it('strips model success badges but keeps the real description', () => {
    const out = neutralizeModelSuccessClaim('✅ Updated the hero heading and spacing.');
    expect(out).toBe('Updated the hero heading and spacing.');
  });

  it('removes authoritative apply claims from prose', () => {
    expect(neutralizeModelSuccessClaim('Multi-file project generated and applied.')).not.toMatch(/applied/i);
    expect(neutralizeModelSuccessClaim('The changes have been applied to your project.')).not.toMatch(/applied/i);
    expect(neutralizeModelSuccessClaim('Edit applied successfully.')).not.toMatch(/applied/i);
  });

  it('returns empty when the whole message was only a success claim', () => {
    expect(neutralizeModelSuccessClaim('✅ Applied successfully')).toBe('');
    expect(neutralizeModelSuccessClaim('')).toBe('');
  });

  it('emits the authoritative verdict only from the transaction layer', () => {
    expect(transactionVerdictLine('verified')).toBe(APPLIED_VERDICT_LINE);
    expect(transactionVerdictLine('failed', 'missing ./theme')).toContain('missing ./theme');
    expect(transactionVerdictLine('held-for-review')).toMatch(/held for review/i);
  });

  it('never lets AI prose claim success alongside a failed transaction', () => {
    const body = withTransactionVerdict('✅ Code generated and applied.', 'failed', 'broken import');
    expect(body).not.toMatch(/✅/);
    expect(body).toContain('✗ Changes were not applied');
    expect(body).toContain('broken import');
  });

  it('falls back to neutral candidate wording when nothing survives', () => {
    expect(withTransactionVerdict('✅', 'verified')).toBe(
      `${CANDIDATE_GENERATED_NOTICE}\n\n${APPLIED_VERDICT_LINE}`,
    );
  });

  it('does not duplicate an existing verdict line', () => {
    const once = withTransactionVerdict('Updated the nav.', 'verified');
    expect(withTransactionVerdict(once, 'verified')).toBe(once);
  });
});
