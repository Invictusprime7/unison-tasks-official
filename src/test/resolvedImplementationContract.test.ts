import { describe, expect, it } from 'vitest';
import {
  implementationContractsForSection,
  listImplementationContracts,
  resolveImplementationContract,
  type ResolvedImplementationContract,
} from '@/platform/core/resolvedImplementationContract';
import { listDesignImplementations } from '@/services/designImplementationRegistry';
import { getArtifact } from '@/platform/core/artifactRegistry';
import { getCatalogSurface } from '@/platform/core/catalogSurfaceRegistry';
import { getIntentDef } from '@/platform/core/intentSurfaceRegistry';

/**
 * M6 — Artifact / slot / prop closure.
 * Acceptance: every preferred implementation resolves a coherent
 * artifact + slot contract, derived from the canonical registries.
 */
describe('resolved implementation contract (M6)', () => {
  const preferred = listImplementationContracts({ preferredOnly: true });

  it('resolves a contract for every preferred implementation', () => {
    const preferredImplementations = listDesignImplementations().filter(
      (impl) => (impl.generationStatus ?? 'preferred') === 'preferred',
    );
    expect(preferred.length).toBe(preferredImplementations.length);
    expect(preferred.length).toBeGreaterThan(0);
  });

  it('every preferred implementation resolves a coherent artifact + slot contract', () => {
    for (const contract of preferred) {
      // Artifact owner exists and agrees on the section type.
      expect(contract.artifactId, `${contract.implementationId} has an artifact`).not.toBeNull();
      const artifact = getArtifact(contract.artifactId!);
      expect(artifact).not.toBeNull();
      expect(artifact!.sectionType).toBe(contract.sectionType);

      // Slots are unique, canonical and editable per the artifact's AI scope.
      const slotIds = contract.slots.map((slot) => slot.id);
      expect(new Set(slotIds).size, `${contract.implementationId} slot ids unique`).toBe(slotIds.length);
      for (const slot of contract.slots) {
        expect(slot.id).toMatch(/^[a-z][a-zA-Z]*\.[a-z][a-z-]*$/);
        expect(slot.editable).toBe(artifact!.aiEditScope !== 'locked');
      }
      // Slot identity matches the artifact owner's declared surface exactly.
      expect(slotIds).toEqual([...artifact!.supportedSlots]);

      // Catalog-backed artifacts resolve a real catalog surface.
      if (artifact!.dataSource.kind === 'catalog') {
        expect(contract.catalogSurfaceId, `${contract.implementationId} catalog surface`).toBe(
          artifact!.dataSource.surfaceId,
        );
        expect(getCatalogSurface(contract.catalogSurfaceId!)).not.toBeNull();
      } else {
        expect(contract.catalogSurfaceId).toBeUndefined();
      }

      // Every exposed intent is known to the intent registry.
      for (const intent of contract.intents) {
        expect(getIntentDef(intent), `${contract.implementationId} intent ${intent}`).not.toBeNull();
      }
    }
  });

  it('derives slot kinds from the canonical suffix convention', () => {
    const hero = resolveImplementationContract('hero:centered')!;
    const byId = Object.fromEntries(hero.slots.map((slot) => [slot.id, slot]));
    expect(byId['hero.headline'].kind).toBe('text');
    expect(byId['hero.headline'].required).toBe(true);
    expect(byId['hero.primary-cta'].kind).toBe('action');
    expect(byId['hero.image'].kind).toBe('asset');
    expect(byId['hero.subhead'].required).toBe(false);
  });

  it('marks catalog collection slots as catalog kind', () => {
    const catalogContract = preferred.find(
      (contract) => contract.catalogSurfaceId !== undefined,
    );
    expect(catalogContract).toBeDefined();
    const collection = catalogContract!.slots.find((slot) => /\.(list|grid)$/.test(slot.id));
    expect(collection?.kind).toBe('catalog');
  });

  it('derives runtime dependencies from radix facades and experience declarations', () => {
    for (const contract of preferred) {
      for (const dep of contract.runtimeDependencies) {
        expect(dep.startsWith('@radix-ui/react-') || dep === 'three' || dep.startsWith('@react-three/')).toBe(true);
      }
    }
    const withRadix = preferred.find((contract) =>
      contract.runtimeDependencies.some((dep) => dep.startsWith('@radix-ui/')),
    );
    expect(withRadix).toBeDefined();
  });

  it('resolves contracts per section and never throws on unknown ids', () => {
    expect(resolveImplementationContract('hero:not-a-variant')).toBeNull();
    const heroContracts = implementationContractsForSection('hero');
    expect(heroContracts.length).toBeGreaterThan(0);
    for (const contract of heroContracts) {
      expect(contract.sectionType).toBe('hero');
    }
  });

  it('carries generation status and source provenance through the projection', () => {
    for (const contract of preferred) {
      expect(['preferred', 'supported', 'legacy']).toContain(contract.generationStatus);
      if (contract.source) {
        expect(typeof contract.source).toBe('object');
      }
    }
  });

  it('is a pure projection: resolving twice returns identical contracts', () => {
    const sample = preferred[0] as ResolvedImplementationContract;
    expect(resolveImplementationContract(sample.implementationId)).toEqual(sample);
  });
});
