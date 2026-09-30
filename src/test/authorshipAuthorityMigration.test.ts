import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260930045635_persist_authorship_authority_handoff.sql'),
  'utf8',
);

describe('authorship authority migration', () => {
  it('persists the one-way Wizard to Builder handoff on the revision ledger', () => {
    expect(migration).toContain('ADD COLUMN IF NOT EXISTS authorship_phase text');
    expect(migration).toContain('ADD COLUMN IF NOT EXISTS creative_authority text');
    expect(migration).toContain('ADD COLUMN IF NOT EXISTS launch_revision_id uuid');
    expect(migration).toContain("NEW.source = 'wizard-launch'");
    expect(migration).toContain('NEW.launch_revision_id := NEW.id');
    expect(migration).toContain('parent.launch_revision_id');
  });

  it('backfills existing lineage and stamps canonical snapshot metadata', () => {
    expect(migration).toContain('WITH RECURSIVE launch_lineage AS');
    expect(migration).toContain("child.source <> 'wizard-launch'");
    expect(migration).toContain("'authorshipAuthority'");
    expect(migration).toContain("'commitAuthority', 'vfs-commit-service'");
    expect(migration).toContain('ALTER COLUMN authorship_phase SET NOT NULL');
    expect(migration).toContain('ALTER COLUMN creative_authority SET NOT NULL');
  });
});
