/**
 * SiteBundle Zod Schema
 * 
 * Runtime validation for SiteBundle structure.
 * Use this for API boundaries and data integrity checks.
 */

import { z } from "zod";

// ============================================================================
// Core ID Schemas
// ============================================================================

export const SiteBundleVersionSchema = z.literal("1.0.0");
export const PageIdSchema = z.string().uuid();
export const AssetIdSchema = z.string().uuid();
export const IntentIdSchema = z.string().min(1);
export const ElementIdSchema = z.string().min(1);

// ============================================================================
// UTP (Unison Transport Protocol) Message Schema
// ============================================================================

export const UTPMessageSchema = <T extends z.ZodType<string>, P extends z.ZodType>(
  typeSchema: T,
  payloadSchema: P
) =>
  z.object({
    protocol: z.literal("UTP/1"),
    type: typeSchema,
    requestId: z.string().uuid(),
    siteId: z.string().min(1),
    pageId: z.string().optional(),
    ts: z.number(),
    payload: payloadSchema,
  });

// ============================================================================
// Site Identity Schema
// ============================================================================

export const SiteStatusSchema = z.enum(["draft", "preview", "published", "archived"]);

export const SiteIdentitySchema = z.object({
  siteId: z.string().uuid(),
  businessId: z.string().uuid(),
  ownerUserId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  status: SiteStatusSchema,
  slug: z.string().optional(),
  domain: z.string().optional(),
});

// ============================================================================
// Build Provenance Schemas
// ============================================================================

export const BuildModeSchema = z.enum(["systems_ai", "builder_ai", "manual"]);

export const BuildStageSchema = z.enum([
  "blueprint",
  "layout",
  "pages",
  "intents",
  "assets",
  "automations",
  "preview",
  "publish",
]);

export const BuildTraceEventSchema = z.object({
  ts: z.string(),
  stage: BuildStageSchema,
  level: z.enum(["info", "warn", "error"]),
  message: z.string().min(1),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const BuildWarningSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  data: z.unknown().optional(),
});

export const BuildErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  data: z.unknown().optional(),
});

export const BuildProvenanceSchema = z.object({
  buildId: z.string().uuid(),
  buildMode: BuildModeSchema,
  prompt: z.string().optional(),
  model: z.string().optional(),
  seed: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime().optional(),
  durationMs: z.number().nonnegative().optional(),
  trace: z.array(BuildTraceEventSchema).default([]),
  warnings: z.array(BuildWarningSchema).default([]),
  errors: z.array(BuildErrorSchema).default([]),
});

// ============================================================================
// Brand Primitive Schemas
// ============================================================================

export const BrandToneSchema = z.enum([
  "luxury",
  "minimal",
  "bold",
  "playful",
  "corporate",
  "editorial",
  "tech",
]);

export const BrandColorsSchema = z.object({
  primary: z.string().min(3),
  secondary: z.string().optional(),
  accent: z.string().optional(),
  background: z.string().optional(),
  foreground: z.string().optional(),
  muted: z.string().optional(),
  danger: z.string().optional(),
  success: z.string().optional(),
  warning: z.string().optional(),
});

export const BrandTypographySchema = z.object({
  headingFont: z.string().optional(),
  bodyFont: z.string().optional(),
});

export const AssetRefSchema = z.object({
  assetId: z.string().min(1),
});

export const BrandPrimitivesSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().optional(),
  logo: AssetRefSchema.optional(),
  colors: BrandColorsSchema,
  typography: BrandTypographySchema.optional(),
  tone: BrandToneSchema.optional(),
  locale: z.string().optional(),
});

// ============================================================================
// Navigation & Manifest Schemas
// ============================================================================

export const RouteDefSchema = z.object({
  path: z.string().min(1),
  pageId: z.string().min(1),
  isHome: z.boolean().optional(),
  requiresAuth: z.boolean().optional(),
});

export const NavItemSchema: z.ZodType<{
  label: string;
  path: string;
  pageId: string;
  type?: "link" | "dropdown";
  children?: unknown[];
}> = z.lazy(() =>
  z.object({
    label: z.string().min(1),
    path: z.string().min(1),
    pageId: z.string().min(1),
    type: z.enum(["link", "dropdown"]).optional(),
    children: z.array(NavItemSchema).optional(),
  })
);

export const LayoutHeaderStyleSchema = z.enum(["default", "minimal", "none"]);
export const LayoutFooterStyleSchema = z.enum(["default", "minimal", "none"]);

export const SiteLayoutSchema = z.object({
  header: LayoutHeaderStyleSchema.optional(),
  footer: LayoutFooterStyleSchema.optional(),
});

export const SiteMetadataSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  ogImage: AssetRefSchema.optional(),
});

export const SiteManifestSchema = z.object({
  routes: z.array(RouteDefSchema),
  nav: z.array(NavItemSchema),
  layout: SiteLayoutSchema,
  metadata: SiteMetadataSchema,
});

// ============================================================================
// Page Schemas
// ============================================================================

export const PageSourceKindSchema = z.enum(["template_ast", "html", "react_tsx"]);

export const PageSourceSchema = z.object({
  kind: PageSourceKindSchema,
  content: z.string(),
  contentHash: z.string().min(1),
});

export const PageOutputArtifactsSchema = z.object({
  type: z.literal("vite"),
  entryJs: z.string().min(1),
  assets: z.array(z.string()),
});

export const PageOutputSchema = z.object({
  html: z.string().optional(),
  css: z.string().optional(),
  js: z.string().optional(),
  artifacts: PageOutputArtifactsSchema.optional(),
});

export const PageBundleSchema = z.object({
  pageId: z.string().min(1),
  title: z.string().min(1),
  path: z.string().min(1),
  source: PageSourceSchema,
  output: PageOutputSchema,
  intentBindings: z.array(z.lazy(() => IntentBindingSchema)).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

// ============================================================================
// Asset Schemas
// ============================================================================

export const AssetTypeSchema = z.enum([
  "image",
  "video",
  "file",
  "font",
  "icon",
]);

export const AssetStorageKindSchema = z.enum(["supabase", "s3", "inline"]);

export const AssetStorageSchema = z.object({
  kind: AssetStorageKindSchema,
  bucket: z.string().optional(),
  path: z.string().optional(),
  url: z.string().optional(),
  inlineBase64: z.string().optional(),
});

export const AssetMetaSchema = z.object({
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  sizeBytes: z.number().nonnegative().optional(),
  alt: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const AssetBundleSchema = z.object({
  assetId: z.string().min(1),
  type: AssetTypeSchema,
  mimeType: z.string().min(1),
  name: z.string().min(1),
  storage: AssetStorageSchema,
  meta: AssetMetaSchema.optional(),
});

// ============================================================================
// Intent Schemas
// ============================================================================

export const IntentCategorySchema = z.enum([
  "nav",
  "overlay",
  "form",
  "commerce",
  "auth",
  "crm",
  "automation",
]);

export const JsonSchemaSchema = z.record(z.string(), z.unknown());

export const EdgeFunctionRefSchema = z.object({
  name: z.string().min(1),
  path: z.string().min(1),
  method: z.literal("POST"),
});

export const ClientActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("NAVIGATE"), to: z.string().min(1) }),
  z.object({ type: z.literal("OPEN_OVERLAY"), overlayId: z.string().min(1) }),
  z.object({ type: z.literal("CLOSE_OVERLAY"), overlayId: z.string().optional() }),
  z.object({ type: z.literal("SET_STATE"), key: z.string().min(1), value: z.unknown() }),
  z.object({
    type: z.literal("TOAST"),
    message: z.string().min(1),
    level: z.enum(["info", "success", "warning", "error"]).optional(),
  }),
]);

export const IntentHandlerSchema = z.object({
  kind: z.enum(["client", "edge", "both"]),
  clientAction: ClientActionSchema.optional(),
  edgeFunction: EdgeFunctionRefSchema.optional(),
});

export const IntentRequiresSchema = z.object({
  featureFlag: z.string().optional(),
  minPlan: z.enum(["free", "starter", "pro", "agency", "enterprise"]).optional(),
  integrations: z.array(z.string()).optional(),
});

export const IntentDefinitionSchema = z.object({
  intentId: z.string().min(1),
  category: IntentCategorySchema,
  description: z.string().min(1),
  paramsSchema: JsonSchemaSchema,
  handler: IntentHandlerSchema,
  requires: IntentRequiresSchema.optional(),
});

export const BindingTargetStrategySchema = z.enum(["data-attr", "css", "xpath"]);

export const BindingTargetSchema = z.object({
  strategy: BindingTargetStrategySchema,
  selector: z.string().min(1),
});

export const IntentBindingSchema = z.object({
  bindingId: z.string().min(1),
  pageId: z.string().min(1),
  target: BindingTargetSchema,
  intentId: z.string().min(1),
  params: z.record(z.string(), z.unknown()),
  label: z.string().optional(),
});

export const IntentSystemSchema = z.object({
  catalogVersion: z.string().min(1),
  definitions: z.record(z.string(), IntentDefinitionSchema),
  bindings: z.array(IntentBindingSchema),
});

// ============================================================================
// Automation Schemas
// ============================================================================

export const AutomationTriggerSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("intent"), intentId: z.string().min(1) }),
  z.object({ type: z.literal("event"), eventName: z.string().min(1) }),
  z.object({ type: z.literal("schedule"), cron: z.string().min(1) }),
]);

export const AutomationRuntimeSchema = z.object({
  kind: z.enum(["inngest", "edge", "internal"]),
  entrypoint: z.string().min(1),
});

export const AutomationInstallSchema = z.object({
  installId: z.string().min(1),
  recipeId: z.string().min(1),
  enabled: z.boolean(),
  triggers: z.array(AutomationTriggerSchema),
  runtime: AutomationRuntimeSchema,
  config: z.record(z.string(), z.unknown()).optional(),
});

export const SecretRequirementSchema = z.object({
  provider: z.string().min(1),
  scopes: z.array(z.string()).optional(),
  reason: z.string().min(1),
});

export const AutomationSystemSchema = z.object({
  installed: z.array(AutomationInstallSchema),
  secretsRequired: z.array(SecretRequirementSchema),
});

// ============================================================================
// Integration Schemas
// ============================================================================

export const ProviderConfigSchema = z.object({
  provider: z.string().min(1),
  enabled: z.boolean(),
  publicConfig: z.record(z.string(), z.unknown()).optional(),
});

export const IntegrationSystemSchema = z.object({
  providers: z.array(ProviderConfigSchema),
});

// ============================================================================
// Entitlement Schemas
// ============================================================================

export const PlanTierSchema = z.enum([
  "free",
  "starter",
  "pro",
  "agency",
  "enterprise",
]);

export const EntitlementSystemSchema = z.object({
  plan: PlanTierSchema,
  features: z.record(z.string(), z.boolean()),
  limits: z.record(z.string(), z.number()),
});

// ============================================================================
// Runtime Schemas
// ============================================================================

export const PreviewEngineSchema = z.enum(["simple", "vfs", "worker"]);

export const RuntimeEntrySchema = z.object({
  type: z.enum(["html", "react"]),
  pageId: z.string().min(1),
});

export const RuntimeConfigSchema = z.object({
  preferredEngine: PreviewEngineSchema,
  enginesAllowed: z.array(PreviewEngineSchema),
  entry: RuntimeEntrySchema,
});

// ============================================================================
// Publishing Schemas
// ============================================================================

export const PublishArtifactSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("static"),
    indexHtml: AssetRefSchema,
    files: z.array(AssetRefSchema),
  }),
  z.object({
    type: z.literal("worker"),
    bundleId: z.string().min(1),
    entry: z.string().min(1),
    files: z.array(z.string()),
  }),
]);

export const PublishInfoSchema = z.object({
  publishedAt: z.string().datetime(),
  artifact: PublishArtifactSchema,
  version: z.string().optional(),
  changelog: z.string().optional(),
});

// ============================================================================
// Business Blueprint Schema (optional)
// ============================================================================

export const BlueprintPageSchema = z.object({
  title: z.string().min(1),
  path: z.string().min(1),
  purpose: z.string().min(1),
});

export const BlueprintCtaSchema = z.object({
  label: z.string().min(1),
  intentId: z.string().min(1),
  params: z.unknown().optional(),
});

export const BlueprintContactSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export const BusinessBlueprintSchema = z.object({
  industry: z.string().min(1),
  businessName: z.string().min(1),
  primaryGoal: z.enum(["leads", "bookings", "sales", "newsletter"]),
  pages: z.array(BlueprintPageSchema),
  ctas: z.array(BlueprintCtaSchema),
  offerings: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  contact: BlueprintContactSchema.optional(),
});

// ============================================================================
// UTP Message Schemas (Host <-> Preview)
// ============================================================================

export const HostInitPayloadSchema = z.object({
  engine: z.enum(["simple", "vfs", "worker"]),
  entryPageId: z.string().min(1),
  manifest: SiteManifestSchema,
  entitlements: EntitlementSystemSchema,
  clientIntents: z.record(z.string(), ClientActionSchema).optional(),
});

export const HostInitSchema = UTPMessageSchema(
  z.literal("UTP/HOST_INIT"),
  HostInitPayloadSchema
);

export const PreviewReadyPayloadSchema = z.object({
  capabilities: z.object({
    canNavigate: z.boolean(),
    canOverlay: z.boolean(),
    canState: z.boolean(),
  }),
});

export const PreviewReadySchema = UTPMessageSchema(
  z.literal("UTP/PREVIEW_READY"),
  PreviewReadyPayloadSchema
);

export const NavRequestPayloadSchema = z.object({
  to: z.string().min(1),
  reason: z.enum(["user", "intent", "system"]),
});

export const NavRequestSchema = UTPMessageSchema(
  z.literal("UTP/NAV_REQUEST"),
  NavRequestPayloadSchema
);

export const NavCommitRenderSchema = z.object({
  html: z.string().optional(),
  css: z.string().optional(),
  js: z.string().optional(),
  artifacts: z.unknown().optional(),
});

export const NavCommitPayloadSchema = z.object({
  to: z.string().min(1),
  pageId: z.string().min(1),
  render: NavCommitRenderSchema,
});

export const NavCommitSchema = UTPMessageSchema(
  z.literal("UTP/NAV_COMMIT"),
  NavCommitPayloadSchema
);

export const IntentExecuteContextSchema = z.object({
  label: z.string().optional(),
  elementId: z.string().optional(),
  pagePath: z.string().optional(),
});

export const IntentExecutePayloadSchema = z.object({
  bindingId: z.string().optional(),
  intentId: z.string().min(1),
  params: z.record(z.string(), z.unknown()),
  context: IntentExecuteContextSchema.optional(),
});

export const IntentExecuteSchema = UTPMessageSchema(
  z.literal("UTP/INTENT_EXECUTE"),
  IntentExecutePayloadSchema
);

export const IntentAckPayloadSchema = z.object({
  accepted: z.boolean(),
  reason: z.string().optional(),
});

export const IntentAckSchema = UTPMessageSchema(
  z.literal("UTP/INTENT_ACK"),
  IntentAckPayloadSchema
);

export const IntentResultErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
});

export const IntentResultPayloadSchema = z.object({
  ok: z.boolean(),
  intentId: z.string().min(1),
  result: z.unknown().optional(),
  clientActions: z.array(ClientActionSchema).optional(),
  error: IntentResultErrorSchema.optional(),
});

export const IntentResultSchema = UTPMessageSchema(
  z.literal("UTP/INTENT_RESULT"),
  IntentResultPayloadSchema
);

export const OverlayOpenPayloadSchema = z.object({
  overlayId: z.string().min(1),
  data: z.unknown().optional(),
});

export const OverlayOpenSchema = UTPMessageSchema(
  z.literal("UTP/OVERLAY_OPEN"),
  OverlayOpenPayloadSchema
);

export const OverlayClosePayloadSchema = z.object({
  overlayId: z.string().optional(),
});

export const OverlayCloseSchema = UTPMessageSchema(
  z.literal("UTP/OVERLAY_CLOSE"),
  OverlayClosePayloadSchema
);

export const StatePatchOpSchema = z.object({
  op: z.enum(["set", "merge", "delete"]),
  key: z.string().min(1),
  value: z.unknown().optional(),
});

export const StatePatchPayloadSchema = z.object({
  patch: z.array(StatePatchOpSchema),
});

export const StatePatchSchema = UTPMessageSchema(
  z.literal("UTP/STATE_PATCH"),
  StatePatchPayloadSchema
);

export const LogEventPayloadSchema = z.object({
  level: z.enum(["info", "warn", "error"]),
  event: z.string().min(1),
  data: z.unknown().optional(),
});

export const LogEventSchema = UTPMessageSchema(
  z.literal("UTP/LOG_EVENT"),
  LogEventPayloadSchema
);

export const ProtocolErrorPayloadSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  data: z.any().optional(),
});

export const ProtocolErrorSchema = UTPMessageSchema(
  z.literal("UTP/ERROR"),
  ProtocolErrorPayloadSchema
);

// ============================================================================
// Main SiteBundle Schema
// ============================================================================

export const SiteBundleSchema = z.object({
  version: SiteBundleVersionSchema,
  site: SiteIdentitySchema,
  build: BuildProvenanceSchema,
  blueprint: BusinessBlueprintSchema.optional(),
  brand: BrandPrimitivesSchema,
  manifest: SiteManifestSchema,
  pages: z.record(z.string(), PageBundleSchema),
  assets: z.record(z.string(), AssetBundleSchema),
  intents: IntentSystemSchema,
  automations: AutomationSystemSchema,
  integrations: IntegrationSystemSchema,
  entitlements: EntitlementSystemSchema,
  runtime: RuntimeConfigSchema,
  publish: PublishInfoSchema.optional(),
});

// ============================================================================
// API Contract Schemas
// ============================================================================

// A) POST /functions/v1/site-build
export const SiteBuildRequestSchema = z.object({
  businessId: z.string().uuid(),
  ownerUserId: z.string().uuid(),
  mode: BuildModeSchema,
  prompt: z.string().min(1),
  industry: z.string().optional(),
  constraints: z.object({
    pagesMax: z.number().int().positive().optional(),
    tone: z.string().optional(),
  }).passthrough().optional(),
  assets: z.array(z.object({ assetId: z.string().uuid() })).optional(),
});

export const SiteBuildResponseSchema = z.object({
  ok: z.literal(true),
  siteId: z.string().uuid(),
  buildId: z.string().uuid(),
  bundle: SiteBundleSchema,
});

// B) PATCH /functions/v1/site-bundle
export const BundleOpTypeSchema = z.enum([
  "page.create",
  "page.update",
  "page.updateSource",
  "page.delete",
  "intent.bind",
  "intent.unbind",
  "asset.add",
  "asset.remove",
  "manifest.update",
]);

export const BundleOpPageUpdateSourceSchema = z.object({
  op: z.literal("page.updateSource"),
  pageId: z.string().min(1),
  source: PageSourceSchema,
});

export const BundleOpIntentBindSchema = z.object({
  op: z.literal("intent.bind"),
  binding: IntentBindingSchema,
});

export const BundleOpIntentUnbindSchema = z.object({
  op: z.literal("intent.unbind"),
  bindingId: z.string().uuid(),
});

export const BundleOpPageCreateSchema = z.object({
  op: z.literal("page.create"),
  page: PageBundleSchema,
});

export const BundleOpPageUpdateSchema = z.object({
  op: z.literal("page.update"),
  pageId: z.string().min(1),
  updates: PageBundleSchema.partial(),
});

export const BundleOpPageDeleteSchema = z.object({
  op: z.literal("page.delete"),
  pageId: z.string().min(1),
});

export const BundleOpAssetAddSchema = z.object({
  op: z.literal("asset.add"),
  asset: AssetBundleSchema,
});

export const BundleOpAssetRemoveSchema = z.object({
  op: z.literal("asset.remove"),
  assetId: z.string().uuid(),
});

export const BundleOpManifestUpdateSchema = z.object({
  op: z.literal("manifest.update"),
  updates: SiteManifestSchema.partial(),
});

export const BundleOpSchema = z.discriminatedUnion("op", [
  BundleOpPageCreateSchema,
  BundleOpPageUpdateSchema,
  BundleOpPageUpdateSourceSchema,
  BundleOpPageDeleteSchema,
  BundleOpIntentBindSchema,
  BundleOpIntentUnbindSchema,
  BundleOpAssetAddSchema,
  BundleOpAssetRemoveSchema,
  BundleOpManifestUpdateSchema,
]);

export const SiteBundlePatchRequestSchema = z.object({
  siteId: z.string().uuid(),
  buildId: z.string().uuid(),
  ops: z.array(BundleOpSchema).min(1),
});

export const SiteBundlePatchResponseSchema = z.object({
  ok: z.literal(true),
  bundle: SiteBundleSchema,
});

// C) POST /functions/v1/intent-execute
export const IntentExecuteRequestSchema = z.object({
  siteId: z.string().uuid(),
  pageId: z.string().min(1),
  intentId: z.string().min(1),
  params: z.record(z.string(), z.unknown()),
  context: z.object({
    bindingId: z.string().uuid(),
  }).passthrough(),
});

export const IntentExecuteResponseSchema = z.object({
  ok: z.literal(true),
  clientActions: z.array(ClientActionSchema),
  result: z.record(z.string(), z.unknown()),
});

// D) POST /functions/v1/site-publish
export const PublishModeSchema = z.enum(["static", "ssr", "hybrid"]);

export const SitePublishRequestSchema = z.object({
  siteId: z.string().uuid(),
  buildId: z.string().uuid(),
  publishMode: PublishModeSchema,
});

export const SitePublishResponseSchema = z.object({
  ok: z.literal(true),
  publishedAt: z.string().datetime(),
  artifact: PublishArtifactSchema,
});

// Generic API error response
export const ApiErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    data: z.unknown().optional(),
  }),
});

// ============================================================================
// Database Row Schemas
// ============================================================================

export const SiteRowSchema = z.object({
  siteId: z.string().uuid(),
  businessId: z.string().uuid(),
  ownerUserId: z.string().uuid(),
  status: SiteStatusSchema,
  slug: z.string().optional(),
  domain: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const SiteBuildRowSchema = z.object({
  buildId: z.string().uuid(),
  siteId: z.string().uuid(),
  mode: BuildModeSchema,
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime().optional(),
  warningsCount: z.number().int().min(0),
  errorsCount: z.number().int().min(0),
});

export const SiteBundleRowSchema = z.object({
  siteId: z.string().uuid(),
  buildId: z.string().uuid(),
  version: SiteBundleVersionSchema,
  bundleJson: z.string().min(2), // Must be valid JSON string
  createdAt: z.string().datetime(),
});

export const IntentEventRowSchema = z.object({
  eventId: z.string().uuid(),
  siteId: z.string().uuid(),
  pageId: z.string().min(1),
  intentId: z.string().min(1),
  bindingId: z.string().min(1),
  ok: z.boolean(),
  createdAt: z.string().datetime(),
  metaJson: z.string().optional(),
});

export const WorkflowRunRowSchema = z.object({
  runId: z.string().uuid(),
  siteId: z.string().uuid(),
  recipeId: z.string().min(1),
  ok: z.boolean(),
  createdAt: z.string().datetime(),
  metaJson: z.string().optional(),
});

export const PublishArtifactRowSchema = z.object({
  siteId: z.string().uuid(),
  buildId: z.string().uuid(),
  artifactJson: z.string().min(2),
  publishedAt: z.string().datetime(),
});

// ============================================================================
// Preview Engine Schemas
// ============================================================================

export const PreviewEngineCapabilitiesSchema = z.object({
  multiPage: z.boolean(),
  hotReload: z.boolean(),
  tsxBuild: z.boolean(),
  isolation: z.boolean(),
});

export const PreviewEngineConfigSchema = z.object({
  engine: PreviewEngineSchema,
  reason: z.string().min(1),
  capabilities: PreviewEngineCapabilitiesSchema,
});

// ============================================================================
// Build Pipeline Schemas
// ============================================================================

export const BuildPipelineStageSchema = z.enum([
  "init",
  "blueprint",
  "brand",
  "pages",
  "intents",
  "automations",
  "entitlements",
  "persist",
]);

export const BuildPipelineStatusSchema = z.enum([
  "pending",
  "running",
  "completed",
  "failed",
  "skipped",
]);

export const BuildStageResultSchema = z.object({
  stage: BuildPipelineStageSchema,
  status: BuildPipelineStatusSchema,
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  error: BuildErrorSchema.optional(),
  warnings: z.array(BuildWarningSchema).optional(),
});

export const BuildPipelineStateSchema = z.object({
  buildId: z.string().uuid(),
  siteId: z.string().uuid(),
  mode: BuildModeSchema,
  currentStage: BuildPipelineStageSchema,
  stages: z.record(BuildPipelineStageSchema, BuildStageResultSchema),
  bundle: SiteBundleSchema,
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
});

export const BuildPipelineContextSchema = z.object({
  businessId: z.string().uuid(),
  ownerUserId: z.string().uuid(),
  prompt: z.string().optional(),
  industry: z.string().optional(),
  constraints: z.record(z.string(), z.unknown()).optional(),
  existingAssets: z.array(z.object({ assetId: z.string() })).optional(),
});

// ============================================================================
// Intent Wiring Schemas
// ============================================================================

export const IntentWiringRuleSchema = z.object({
  pattern: z.union([z.string(), z.instanceof(RegExp)]),
  intentId: z.string().min(1),
  priority: z.number().int(),
  source: z.enum(["deterministic", "ai"]),
});

export const IntentWiringResultSchema = z.object({
  elementId: z.string().min(1),
  intentId: z.string().min(1),
  params: z.record(z.string(), z.unknown()),
  source: z.enum(["deterministic", "ai"]),
  confidence: z.number().min(0).max(1).optional(),
});

// ============================================================================
// Client Orchestration Schemas
// ============================================================================

export const ClientOrchestrationStatusSchema = z.enum([
  "loading",
  "initializing",
  "ready",
  "error",
]);

export const ClientOrchestrationStateSchema = z.object({
  siteId: z.string().uuid(),
  buildId: z.string().uuid(),
  engine: PreviewEngineSchema,
  status: ClientOrchestrationStatusSchema,
  currentPage: z.string().min(1),
  error: z.string().optional(),
});

export const PreviewBootPayloadSchema = z.object({
  manifest: SiteManifestSchema,
  entitlements: EntitlementSystemSchema,
});

// ============================================================================
// Inferred Types
// ============================================================================

export type SiteBundleSchemaType = z.infer<typeof SiteBundleSchema>;
export type SiteIdentitySchemaType = z.infer<typeof SiteIdentitySchema>;
export type BuildProvenanceSchemaType = z.infer<typeof BuildProvenanceSchema>;
export type BrandPrimitivesSchemaType = z.infer<typeof BrandPrimitivesSchema>;
export type SiteManifestSchemaType = z.infer<typeof SiteManifestSchema>;
export type PageBundleSchemaType = z.infer<typeof PageBundleSchema>;
export type AssetBundleSchemaType = z.infer<typeof AssetBundleSchema>;
export type IntentSystemSchemaType = z.infer<typeof IntentSystemSchema>;
export type AutomationSystemSchemaType = z.infer<typeof AutomationSystemSchema>;
export type IntegrationSystemSchemaType = z.infer<typeof IntegrationSystemSchema>;
export type EntitlementSystemSchemaType = z.infer<typeof EntitlementSystemSchema>;
export type RuntimeConfigSchemaType = z.infer<typeof RuntimeConfigSchema>;
export type PublishInfoSchemaType = z.infer<typeof PublishInfoSchema>;

// API Contract Types
export type SiteBuildRequestSchemaType = z.infer<typeof SiteBuildRequestSchema>;
export type SiteBuildResponseSchemaType = z.infer<typeof SiteBuildResponseSchema>;
export type BundleOpSchemaType = z.infer<typeof BundleOpSchema>;
export type SiteBundlePatchRequestSchemaType = z.infer<typeof SiteBundlePatchRequestSchema>;
export type SiteBundlePatchResponseSchemaType = z.infer<typeof SiteBundlePatchResponseSchema>;
export type IntentExecuteRequestSchemaType = z.infer<typeof IntentExecuteRequestSchema>;
export type IntentExecuteResponseSchemaType = z.infer<typeof IntentExecuteResponseSchema>;
export type SitePublishRequestSchemaType = z.infer<typeof SitePublishRequestSchema>;
export type SitePublishResponseSchemaType = z.infer<typeof SitePublishResponseSchema>;
export type ApiErrorResponseSchemaType = z.infer<typeof ApiErrorResponseSchema>;

// Database Row Types
export type SiteRowSchemaType = z.infer<typeof SiteRowSchema>;
export type SiteBuildRowSchemaType = z.infer<typeof SiteBuildRowSchema>;
export type SiteBundleRowSchemaType = z.infer<typeof SiteBundleRowSchema>;
export type IntentEventRowSchemaType = z.infer<typeof IntentEventRowSchema>;
export type WorkflowRunRowSchemaType = z.infer<typeof WorkflowRunRowSchema>;
export type PublishArtifactRowSchemaType = z.infer<typeof PublishArtifactRowSchema>;

// Preview Engine Types
export type PreviewEngineCapabilitiesSchemaType = z.infer<typeof PreviewEngineCapabilitiesSchema>;
export type PreviewEngineConfigSchemaType = z.infer<typeof PreviewEngineConfigSchema>;

// Build Pipeline Types
export type BuildPipelineStageSchemaType = z.infer<typeof BuildPipelineStageSchema>;
export type BuildPipelineStatusSchemaType = z.infer<typeof BuildPipelineStatusSchema>;
export type BuildStageResultSchemaType = z.infer<typeof BuildStageResultSchema>;
export type BuildPipelineStateSchemaType = z.infer<typeof BuildPipelineStateSchema>;
export type BuildPipelineContextSchemaType = z.infer<typeof BuildPipelineContextSchema>;

// Intent Wiring Types
export type IntentWiringRuleSchemaType = z.infer<typeof IntentWiringRuleSchema>;
export type IntentWiringResultSchemaType = z.infer<typeof IntentWiringResultSchema>;

// Client Orchestration Types
export type ClientOrchestrationStatusSchemaType = z.infer<typeof ClientOrchestrationStatusSchema>;
export type ClientOrchestrationStateSchemaType = z.infer<typeof ClientOrchestrationStateSchema>;
export type PreviewBootPayloadSchemaType = z.infer<typeof PreviewBootPayloadSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateSiteBundle(data: unknown): {
  success: boolean;
  data?: SiteBundleSchemaType;
  errors?: z.ZodError;
} {
  const result = SiteBundleSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function validatePartialSiteBundle(data: unknown): {
  success: boolean;
  data?: Partial<SiteBundleSchemaType>;
  errors?: z.ZodError;
} {
  const PartialSchema = SiteBundleSchema.partial().extend({
    version: SiteBundleVersionSchema,
    site: SiteIdentitySchema,
  });
  const result = PartialSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
