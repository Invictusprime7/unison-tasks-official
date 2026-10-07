import { describe, expect, it } from 'vitest';
import { compileCatalogToolCalls } from '@/services/catalogToolExecutor';
import { buildSystemGraph } from '@/services/agent-runtime/systemGraph';
import { resolveEditableEntity } from '@/services/agent-runtime/editableOwnershipResolver';
import { verifyEditableEntityChange } from '@/services/agent-runtime/semanticVerification';

describe('canonical editable entity runtime', () => {
  it('compiles catalog tools into a data proposal without executing it', () => {
    const proposal = compileCatalogToolCalls([{
      id: 'call-1', name: 'updateCatalogRow',
      arguments: { surfaceId: 'products', rowId: 'product-1', patch: { price: 42 } },
    }]);
    expect(proposal.rejected).toEqual([]);
    expect(proposal.dataOps).toEqual([{
      type: 'updateRow', operationId: 'call-1', surfaceId: 'products', rowId: 'product-1', patch: { price: 42 },
    }]);
  });

  it('resolves a stamped catalog property before source ownership', () => {
    const graph = buildSystemGraph({ '/src/pages/Home.tsx': 'export default function Home(){ return <main /> }' });
    const entity = resolveEditableEntity({
      graph,
      selectedElement: { sourceTable: 'products', rowId: 'product-1', field: 'price', componentPath: '/src/pages/Home.tsx' },
    });
    expect(entity.owners.price).toMatchObject({ kind: 'catalog-row', table: 'products', rowId: 'product-1' });
    expect(entity.owners.source).toBeUndefined();
  });

  it('requires the requested property value after a change', () => {
    const entity = { id: 'entity:product-1', revisionId: 'r1', intents: [], owners: {} };
    expect(verifyEditableEntityChange({
      beforeEntity: entity, afterEntity: entity,
      expectedChanges: { price: 42 }, actualValues: { price: 42 },
    }).ok).toBe(true);
  });
});
