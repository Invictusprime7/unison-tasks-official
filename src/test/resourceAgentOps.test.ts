import { describe, it, expect } from 'vitest';
import { agentOperations } from '@/services/agent-runtime/operations';

describe('resource agent operations', () => {
  it('lists business details with editable fields', () => {
    const list = agentOperations.list_resources();
    const profile = list.find((r) => r.kind === 'business-profile');
    expect(profile?.fields.length).toBeGreaterThan(0);
  });
  it('refuses unknown record marks and missing business', async () => {
    await expect(agentOperations.update_resource_field({ files: {} }, 'nope#1.x', 'y')).rejects.toThrow(/No business/);
    await expect(agentOperations.update_resource_field({ files: {}, businessId: 'b' }, 'nope#1.x', 'y')).rejects.toThrow(/Unknown record mark/);
  });
});
