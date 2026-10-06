/**
 * Agent Runtime — one registry of typed operations shared by the AI Builder
 * and the command menu. Inspect operations read live canonical state; mutate
 * operations only *propose* file changes, which callers hand to the existing
 * transaction (`runBuilderAiMutation` → `commitMutation`). No new writer.
 */
import { supabase } from '@/integrations/supabase/client';
import { collectIntentTargets } from './intentInvariant';
import {
  listCatalog, createCatalogItem, updateCatalogItemRow, deleteCatalogItem,
  type CatalogItem, type CatalogPatch,
} from './catalogOps';
import {
  buildSystemGraph,
  findGraphNode,
  graphEdgesFor,
  type GraphDiagnostic,
  type SystemGraphBackendActionInput,
  type SystemGraphInput,
  type SystemGraphSchemaInput,
} from './systemGraph';

export interface AgentContext {
  files: Record<string, string>;
  businessId?: string | null;
  projectId?: string | null;
  previewErrors?: string[];
  /** Canonical state made available by the Builder; inspection only. */
  revisionId?: string | null;
  snapshot?: SystemGraphInput['snapshot'];
  runtimeManifest?: SystemGraphInput['runtimeManifest'];
  schema?: SystemGraphSchemaInput | null;
  backendActions?: SystemGraphBackendActionInput[];
  diagnostics?: GraphDiagnostic[];
}

export type ProposedChange = { files: Record<string, string>; summary: string };

const CATALOG_TABLES = ['products', 'menu_items', 'services', 'pricing_plans', 'testimonials'] as const;
export type CatalogTable = (typeof CATALOG_TABLES)[number];

export const agentOperations = {
  inspect_file(ctx: AgentContext, path: string): string | null {
    return ctx.files[path] ?? null;
  },
  inspect_routes(ctx: AgentContext): string[] {
    return Object.keys(ctx.files).filter((p) => /^\/src\/pages\/.+\.(t|j)sx$/.test(p)).sort();
  },
  inspect_errors(ctx: AgentContext): string[] {
    return ctx.previewErrors ?? [];
  },
  inspect_intents(ctx: AgentContext): Record<string, string[]> {
    const out: Record<string, string[]> = {};
    collectIntentTargets(ctx.files).forEach((v, k) => { out[k] = [...v]; });
    return out;
  },
  /** Rebuilds a fresh graph from the caller's canonical state; never caches or writes it. */
  inspect_system_graph(ctx: AgentContext) {
    return buildSystemGraph({
      files: ctx.files,
      revisionId: ctx.revisionId,
      snapshot: ctx.snapshot,
      runtimeManifest: ctx.runtimeManifest,
      schema: ctx.schema,
      backendActions: ctx.backendActions,
      diagnostics: ctx.diagnostics,
    });
  },
  inspect_graph_node(ctx: AgentContext, id: string): unknown | null {
    return findGraphNode(agentOperations.inspect_system_graph(ctx), id);
  },
  inspect_graph_edges(ctx: AgentContext, id: string) {
    return graphEdgesFor(agentOperations.inspect_system_graph(ctx), id);
  },
  inspect_route(ctx: AgentContext, route: string) {
    return agentOperations.inspect_system_graph(ctx).routes.find((candidate) => candidate.path === route) ?? null;
  },
  inspect_dependencies(ctx: AgentContext) {
    return agentOperations.inspect_system_graph(ctx).dependencies;
  },
  inspect_capabilities(ctx: AgentContext) {
    return agentOperations.inspect_system_graph(ctx).capabilities;
  },
  inspect_schema(ctx: AgentContext) {
    return agentOperations.inspect_system_graph(ctx).database;
  },
  inspect_table(ctx: AgentContext, table: string) {
    return agentOperations.inspect_system_graph(ctx).database.tables.find((candidate) => candidate.name === table || candidate.id === table) ?? null;
  },
  inspect_policies(ctx: AgentContext, table?: string) {
    const graph = agentOperations.inspect_system_graph(ctx);
    return table
      ? graph.database.policies.filter((policy) => policy.tableId === `table:${table}` || policy.tableId === table)
      : graph.database.policies;
  },
  inspect_backend_actions(ctx: AgentContext) {
    return agentOperations.inspect_system_graph(ctx).backendActions;
  },
  inspect_preview(ctx: AgentContext) {
    return ctx.previewErrors ?? [];
  },
  /** Project-scoped catalog read through the normal access rules. */
  async inspect_data(ctx: AgentContext, table: CatalogTable, limit = 20): Promise<unknown[]> {
    if (!ctx.businessId || !CATALOG_TABLES.includes(table)) return [];
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('business_id', ctx.businessId)
      .limit(limit);
    if (error) throw new Error(error.message);
    return data ?? [];
  },
  /** Propose CSS custom-property changes in the site stylesheet. */
  set_theme_tokens(ctx: AgentContext, tokens: Record<string, string>): ProposedChange | null {
    const path = '/src/index.css';
    let css = ctx.files[path];
    if (typeof css !== 'string') return null;
    for (const [name, value] of Object.entries(tokens)) {
      const key = name.startsWith('--') ? name : `--${name}`;
      const re = new RegExp(`(${key.replace(/[-]/g, '\\-')}\\s*:\\s*)[^;]+;`, 'g');
      css = re.test(css) ? css.replace(re, `$1${value};`) : css.replace(/:root\s*\{/, `:root {\n  ${key}: ${value};`);
    }
    return { files: { [path]: css }, summary: `Theme: ${Object.keys(tokens).join(', ')}` };
  },
  set_font(ctx: AgentContext, family: string, role: 'body' | 'display' = 'body'): ProposedChange | null {
    const change = agentOperations.set_theme_tokens(ctx, {
      [role === 'display' ? '--font-display' : '--font-sans']: `'${family}', system-ui, sans-serif`,
    });
    return change ? { ...change, summary: `Font (${role}): ${family}` } : null;
  },
  swap_image(ctx: AgentContext, path: string, fromUrl: string, toUrl: string): ProposedChange | null {
    const src = ctx.files[path];
    if (typeof src !== 'string' || !src.includes(fromUrl)) return null;
    return { files: { [path]: src.split(fromUrl).join(toUrl) }, summary: `Image swapped in ${path}` };
  },
  /** Live catalog (products, services, menu, plans) for this business. */
  async inspect_catalog(ctx: AgentContext): Promise<CatalogItem[]> {
    return ctx.businessId ? listCatalog(ctx.businessId) : [];
  },
  async create_catalog_item(ctx: AgentContext, surfaceId: string, patch: CatalogPatch): Promise<CatalogItem> {
    if (!ctx.businessId) throw new Error('No business is linked to this site.');
    return createCatalogItem(ctx.businessId, surfaceId, patch);
  },
  async hide_catalog_item(ctx: AgentContext, surfaceId: string, id: string, hidden = true) {
    return agentOperations.update_catalog_item(ctx, surfaceId, id, { active: !hidden });
  },
  async delete_catalog_item(ctx: AgentContext, surfaceId: string, id: string): Promise<void> {
    if (!ctx.businessId) throw new Error('No business is linked to this site.');
    await deleteCatalogItem(ctx.businessId, surfaceId, id);
  },
  /**
   * Write a catalog record (database first), then propose the matching
   * preview edit (old image URL / old price text → new) for the canonical
   * save path. Sections bound to live data need no file change.
   */
  async update_catalog_item(
    ctx: AgentContext, surfaceId: string, id: string, patch: CatalogPatch,
  ): Promise<{ change: ProposedChange | null; summary: string; item: CatalogItem }> {
    if (!ctx.businessId) throw new Error('No business is linked to this site.');
    const { before, after } = await updateCatalogItemRow(ctx.businessId, surfaceId, id, patch);
    const swaps: Array<[string, string]> = [];
    if (patch.image_url && before?.image && before.image !== patch.image_url) swaps.push([before.image, patch.image_url]);
    if (patch.price != null && before?.price) {
      const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));
      swaps.push([`$${fmt(before.price)}`, `$${fmt(patch.price)}`]);
    }
    const files: Record<string, string> = {};
    for (const [path, src] of Object.entries(ctx.files)) {
      if (!/^\/src\/.+\.(t|j)sx?$/.test(path)) continue;
      let next = src;
      for (const [x, y] of swaps) next = next.split(x).join(y);
      if (next !== src) files[path] = next;
    }
    const what = patch.price != null ? `price $${patch.price}` : patch.image_url ? 'new photo' : patch.active === false ? 'hidden' : 'updated';
    const summary = `${after.name}: ${what} saved`;
    return { change: Object.keys(files).length ? { files, summary } : null, summary, item: after };
  },
} as const;

export type AgentOperationName = keyof typeof agentOperations;
export const AGENT_OPERATION_NAMES = Object.keys(agentOperations) as AgentOperationName[];
