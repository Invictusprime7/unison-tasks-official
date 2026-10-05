/**
 * catalogRowService — canonical CRUD over every catalog table.
 *
 * Milestone 4: the allowed-table set + payload shape now derive from the
 * `catalogSurfaceRegistry` instead of a hand-maintained list. Every table
 * declared as a `CatalogSourceTable` (services, products, menu_items,
 * pricing_plans, featured_offers, testimonials, portfolio_projects,
 * availability_slots) is supported automatically.
 *
 * Callers may still pass the generic `{ name, description, price, image_url }`
 * shape used by the classic inspector — we normalize that per-surface using
 * the registry's `fields` mapping so services/pricing_plans/menu_items land
 * in `price_cents` and products lands in `price`.
 */
import { supabase } from '@/integrations/supabase/client';
import { hydrateBinding, type CatalogRenderResult } from '@/services/catalogRuntime';
import {
  getCatalogSurface,
  getCatalogSurfaceByTable,
  type CatalogSourceTable,
  type CatalogSurface,
} from '@/platform/core/catalogSurfaceRegistry';
import {
  createCmsRecord,
  removeCmsRecord,
  updateCmsRecord,
} from '@/services/cmsRecordService';
import type { SectionDataBindingDTO } from '@/types/catalog';

/** Legacy "inspector" patch shape. */
export interface EditableRowPatch {
  name?: string | null;
  description?: string | null;
  /** Dollars (numeric). Written into the surface's price column, converting
   *  to cents when the surface uses a `priceCents` column. */
  price?: number | null;
  image_url?: string | null;
}

function normalizePatch(
  surface: CatalogSurface,
  patch: EditableRowPatch,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const f = surface.fields;

  if (patch.name !== undefined && f.title) {
    out[f.title] = patch.name ?? '';
  }
  if (patch.description !== undefined && f.description) {
    out[f.description] = patch.description ?? null;
  }
  if (patch.image_url !== undefined && f.image) {
    out[f.image] = patch.image_url ?? null;
  }
  if (patch.price !== undefined) {
    const dollars =
      patch.price == null || !Number.isFinite(patch.price) ? 0 : patch.price;
    if (f.priceCents) {
      out[f.priceCents] = Math.round(dollars * 100);
    } else if (f.price) {
      out[f.price] = dollars;
    }
  }
  return out;
}

function resolveTable(input: string): CatalogSurface | null {
  return getCatalogSurfaceByTable(input as CatalogSourceTable) ?? getCatalogSurface(input);
}

export async function loadRowsForBinding(
  binding: SectionDataBindingDTO,
): Promise<CatalogRenderResult> {
  return hydrateBinding(binding);
}

// Row create/update/delete live in agentOperations (src/services/agent-runtime).
