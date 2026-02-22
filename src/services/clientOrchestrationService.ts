/**
 * Client Orchestration Service
 *
 * Handles Builder UI → Preview communication:
 * - Engine selection (simple/vfs/worker)
 * - Boot sequence (HOST_INIT → PREVIEW_READY → NAV_COMMIT)
 * - Intent execution via UTP
 * - Navigation via UTP
 */

import { nanoid } from "nanoid";
import type {
  SiteBundle,
  PageBundle,
  EntitlementSystem,
  IntentDefinition,
  ClientAction,
  PreviewEngineConfig,
  ClientOrchestrationState,
  PreviewBootPayload,
  HostInitPayload,
  NavCommitPayload,
  // UTP Messages
  HostInit,
  PreviewReady,
  NavRequest,
  NavCommit,
  IntentExecute,
  IntentAck,
  IntentResult,
  OverlayOpen,
  OverlayClose,
  StatePatch,
  LogEvent,
  ProtocolError,
} from "../types/siteBundle";

import {
  createHostInit,
  createNavCommit,
  createIntentAck,
  createIntentResult,
  createOverlayOpen,
  createOverlayClose,
  createStatePatch,
  createLogEvent,
  createProtocolError,
} from "../utils/siteBundleUtils";

// ============================================================================
// Types
// ============================================================================

export type UTPMessageHandler<T> = (message: T) => void | Promise<void>;

export interface ClientOrchestrationConfig {
  /** The loaded SiteBundle */
  bundle: SiteBundle;
  /** Preview iframe element */
  iframeElement?: HTMLIFrameElement;
  /** Origin for postMessage */
  targetOrigin: string;
  /** Intent execution handler */
  onIntentExecute?: (
    intentId: string,
    params: Record<string, unknown>,
    context: { bindingId: string; pageId: string }
  ) => Promise<{ ok: boolean; clientActions: ClientAction[]; result: Record<string, unknown> }>;
  /** Log handler */
  onLog?: (event: LogEvent) => void;
  /** Error handler */
  onError?: (error: ProtocolError) => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the default/home page ID from a bundle
 */
function getDefaultPageId(bundle: SiteBundle): string {
  const homeRoute = bundle.manifest.routes.find(r => r.isHome);
  if (homeRoute) return homeRoute.pageId;
  if (bundle.manifest.routes.length > 0) return bundle.manifest.routes[0].pageId;
  return bundle.runtime.entry.pageId;
}

// ============================================================================
// Engine Selection
// ============================================================================

/**
 * Select the appropriate preview engine based on bundle characteristics
 */
export function selectPreviewEngine(bundle: SiteBundle): PreviewEngineConfig {
  const manifest = bundle.manifest;
  const pages = Object.values(bundle.pages);

  // Check for TSX/React pages
  const hasTsx = pages.some(p => p.source.kind === "react_tsx");

  // Check for multiple pages
  const hasMultiplePages = manifest.routes.length > 1;

  // Check for complex dependencies (simplified check)
  const hasComplexDeps = pages.some(p => {
    const content = p.source.content;
    return (
      content.includes("import ") ||
      content.includes("require(") ||
      content.includes("export ")
    );
  });

  // Decision tree
  if (hasTsx || hasComplexDeps) {
    return {
      engine: "worker",
      reason: "TSX/complex dependencies require worker-based build",
      capabilities: {
        multiPage: true,
        hotReload: true,
        tsxBuild: true,
        isolation: true,
      },
    };
  }

  if (hasMultiplePages) {
    return {
      engine: "vfs",
      reason: "Multi-page site benefits from VFS routing",
      capabilities: {
        multiPage: true,
        hotReload: true,
        tsxBuild: false,
        isolation: true,
      },
    };
  }

  return {
    engine: "simple",
    reason: "Simple single-page site",
    capabilities: {
      multiPage: false,
      hotReload: false,
      tsxBuild: false,
      isolation: false,
    },
  };
}

// ============================================================================
// Client Orchestration Service
// ============================================================================

export class ClientOrchestrationService {
  private config: ClientOrchestrationConfig;
  private state: ClientOrchestrationState;
  private messageHandlers: Map<string, UTPMessageHandler<any>>;
  private pendingIntents: Map<string, { resolve: (v: any) => void; reject: (e: any) => void }>;

  constructor(config: ClientOrchestrationConfig) {
    this.config = config;
    this.messageHandlers = new Map();
    this.pendingIntents = new Map();

    this.state = {
      siteId: config.bundle.site.siteId,
      buildId: config.bundle.build.buildId,
      engine: selectPreviewEngine(config.bundle).engine,
      status: "loading",
      currentPage: getDefaultPageId(config.bundle),
    };

    this.setupMessageHandlers();
  }

  /**
   * Get current orchestration state
   */
  getState(): ClientOrchestrationState {
    return { ...this.state };
  }

  /**
   * Initialize the preview
   */
  async initialize(): Promise<void> {
    this.state.status = "initializing";

    // Setup message listener
    window.addEventListener("message", this.handleMessage.bind(this));

    // Wait for iframe to be ready
    if (this.config.iframeElement) {
      await this.waitForIframeLoad();
    }

    // Send HOST_INIT
    await this.sendHostInit();
  }

  /**
   * Wait for iframe to load
   */
  private waitForIframeLoad(): Promise<void> {
    return new Promise((resolve) => {
      const iframe = this.config.iframeElement;
      if (!iframe) {
        resolve();
        return;
      }

      if (iframe.contentDocument?.readyState === "complete") {
        resolve();
        return;
      }

      iframe.addEventListener("load", () => resolve(), { once: true });
    });
  }

  /**
   * Send HOST_INIT message to preview
   */
  private async sendHostInit(): Promise<void> {
    const bundle = this.config.bundle;
    const defaultPageId = getDefaultPageId(bundle);

    // Build client intents map
    const clientIntents: Record<string, ClientAction | undefined> = {};
    for (const [intentId, def] of Object.entries(bundle.intents.definitions)) {
      if (def.handler.kind === "client" && def.handler.clientAction) {
        clientIntents[intentId] = def.handler.clientAction;
      }
    }

    const hostInitPayload: HostInitPayload = {
      engine: this.state.engine,
      entryPageId: defaultPageId,
      manifest: bundle.manifest,
      entitlements: bundle.entitlements,
      clientIntents: Object.keys(clientIntents).length > 0 ? clientIntents : undefined,
    };

    const message = createHostInit(bundle.site.siteId, hostInitPayload);
    this.postMessage(message);
    this.log("info", "host.init.sent", { pageId: defaultPageId });
  }

  /**
   * Setup UTP message handlers
   */
  private setupMessageHandlers(): void {
    // Handle PREVIEW_READY
    this.messageHandlers.set("UTP/PREVIEW_READY", (msg: PreviewReady) => {
      this.state.status = "ready";
      this.log("info", "preview.ready", { capabilities: msg.payload.capabilities });

      // Send initial NAV_COMMIT
      this.sendNavCommit(this.state.currentPage);
    });

    // Handle NAV_REQUEST
    this.messageHandlers.set("UTP/NAV_REQUEST", async (msg: NavRequest) => {
      const { to } = msg.payload;
      await this.handleNavRequest(to);
    });

    // Handle INTENT_EXECUTE
    this.messageHandlers.set("UTP/INTENT_EXECUTE", async (msg: IntentExecute) => {
      await this.handleIntentExecute(msg);
    });

    // Handle LOG_EVENT
    this.messageHandlers.set("UTP/LOG_EVENT", (msg: LogEvent) => {
      if (this.config.onLog) {
        this.config.onLog(msg);
      }
    });

    // Handle ERROR
    this.messageHandlers.set("UTP/ERROR", (msg: ProtocolError) => {
      this.state.status = "error";
      this.state.error = msg.payload.message;
      if (this.config.onError) {
        this.config.onError(msg);
      }
    });
  }

  /**
   * Handle incoming postMessage
   */
  private handleMessage(event: MessageEvent): void {
    // Validate origin
    if (event.origin !== this.config.targetOrigin) {
      return;
    }

    const data = event.data;
    if (!data || typeof data.type !== "string" || !data.type.startsWith("UTP/")) {
      return;
    }

    const handler = this.messageHandlers.get(data.type);
    if (handler) {
      handler(data);
    } else {
      this.log("warn", "unhandled.message", { type: data.type });
    }
  }

  /**
   * Handle NAV_REQUEST from preview
   */
  private async handleNavRequest(path: string): Promise<void> {
    const bundle = this.config.bundle;
    const route = bundle.manifest.routes.find(r => r.path === path);

    if (!route) {
      this.sendError("NAV_NOT_FOUND", `Route not found: ${path}`);
      return;
    }

    const page = bundle.pages[route.pageId];
    if (!page) {
      this.sendError("PAGE_NOT_FOUND", `Page not found: ${route.pageId}`);
      return;
    }

    this.state.currentPage = route.pageId;
    await this.sendNavCommit(route.pageId);
  }

  /**
   * Send NAV_COMMIT to preview
   */
  private async sendNavCommit(pageId: string): Promise<void> {
    const bundle = this.config.bundle;
    const page = bundle.pages[pageId];
    const route = bundle.manifest.routes.find(r => r.pageId === pageId);

    if (!page || !route) {
      this.sendError("PAGE_NOT_FOUND", `Page not found: ${pageId}`);
      return;
    }

    const navCommitPayload: NavCommitPayload = {
      to: route.path,
      pageId,
      render: {
        html: page.output?.html,
        css: page.output?.css,
        js: page.output?.js,
        artifacts: page.output?.artifacts,
      },
    };

    const message = createNavCommit(bundle.site.siteId, navCommitPayload);
    this.postMessage(message);
    this.log("info", "nav.commit", { pageId, path: route.path });
  }

  /**
   * Handle INTENT_EXECUTE from preview
   */
  private async handleIntentExecute(msg: IntentExecute): Promise<void> {
    const { intentId, params, bindingId } = msg.payload;
    const bundle = this.config.bundle;

    // Send ACK immediately
    const ack = createIntentAck(bundle.site.siteId, true);
    this.postMessage(ack);

    try {
      // Validate intent exists
      const definition = bundle.intents.definitions[intentId];
      if (!definition) {
        this.sendIntentError(intentId, "INTENT_NOT_FOUND", `Intent not found: ${intentId}`);
        return;
      }

      // Check entitlements
      const entitlementCheck = this.checkEntitlement(intentId, bundle.entitlements);
      if (!entitlementCheck.allowed) {
        this.sendIntentError(intentId, "ENTITLEMENT_DENIED", entitlementCheck.reason || "Feature not available");
        return;
      }

      // Execute intent
      let result: { ok: boolean; clientActions: ClientAction[]; result: Record<string, unknown> };

      if (this.config.onIntentExecute) {
        result = await this.config.onIntentExecute(intentId, params, {
          bindingId: bindingId || "",
          pageId: this.state.currentPage,
        });
      } else {
        // Default execution based on handler type
        result = await this.executeDefaultHandler(definition, params);
      }

      // Send result
      const resultMsg = createIntentResult(
        bundle.site.siteId,
        intentId,
        result.ok,
        {
          clientActions: result.clientActions,
          result: result.result,
        }
      );
      this.postMessage(resultMsg);

      this.log("info", "intent.executed", {
        intentId,
        bindingId,
        ok: result.ok,
        actionsCount: result.clientActions.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.sendIntentError(intentId, "EXECUTION_ERROR", errorMessage);
    }
  }

  /**
   * Check if intent is allowed by entitlements
   */
  private checkEntitlement(
    intentId: string,
    entitlements: EntitlementSystem
  ): { allowed: boolean; reason?: string } {
    // Check form submission limits
    if (intentId.startsWith("lead.") || intentId.startsWith("subscribe.")) {
      const limit = entitlements.limits.submissionsPerMonth;
      if (limit !== undefined && limit <= 0) {
        return { allowed: false, reason: "Monthly submission limit reached" };
      }
    }

    // Check automation features
    if (intentId.startsWith("automation.")) {
      if (!entitlements.features.automations) {
        return { allowed: false, reason: "Automations not available on current plan" };
      }
    }

    return { allowed: true };
  }

  /**
   * Execute default intent handler
   */
  private async executeDefaultHandler(
    definition: IntentDefinition,
    _params: Record<string, unknown>
  ): Promise<{ ok: boolean; clientActions: ClientAction[]; result: Record<string, unknown> }> {
    const handler = definition.handler;

    if (handler.kind === "client" || handler.kind === "both") {
      // Return client action if defined
      if (handler.clientAction) {
        return { ok: true, clientActions: [handler.clientAction], result: {} };
      }
    }

    if (handler.kind === "edge" || handler.kind === "both") {
      // Would call edge function - for now return success
      if (handler.edgeFunction) {
        return {
          ok: true,
          clientActions: [{ type: "TOAST", message: "Submitted successfully!", level: "success" }],
          result: { submitted: true },
        };
      }
    }

    return { ok: true, clientActions: [], result: {} };
  }

  /**
   * Send intent error result
   */
  private sendIntentError(
    intentId: string,
    code: string,
    message: string
  ): void {
    const bundle = this.config.bundle;
    const result = createIntentResult(
      bundle.site.siteId,
      intentId,
      false,
      {
        clientActions: [{ type: "TOAST", message, level: "error" }],
        error: { code, message },
      }
    );
    this.postMessage(result);
    this.log("error", "intent.error", { intentId, code, message });
  }

  /**
   * Send error message to preview
   */
  private sendError(code: string, message: string, data?: any): void {
    const error = createProtocolError(this.config.bundle.site.siteId, code, message, data);
    this.postMessage(error);
    this.log("error", "protocol.error", { code, message });
  }

  /**
   * Navigate to a page
   */
  async navigateTo(path: string): Promise<void> {
    await this.handleNavRequest(path);
  }

  /**
   * Open an overlay
   */
  openOverlay(overlayId: string, data?: unknown): void {
    const message = createOverlayOpen(this.config.bundle.site.siteId, overlayId, data);
    this.postMessage(message);
    this.log("info", "overlay.open", { overlayId });
  }

  /**
   * Close an overlay
   */
  closeOverlay(overlayId?: string): void {
    const message = createOverlayClose(this.config.bundle.site.siteId, overlayId);
    this.postMessage(message);
    this.log("info", "overlay.close", { overlayId });
  }

  /**
   * Patch preview state
   */
  patchState(ops: Array<{ op: "set" | "merge" | "delete"; key: string; value?: unknown }>): void {
    const message = createStatePatch(this.config.bundle.site.siteId, ops);
    this.postMessage(message);
    this.log("info", "state.patch", { opsCount: ops.length });
  }

  /**
   * Post message to preview
   */
  private postMessage(message: any): void {
    if (this.config.iframeElement?.contentWindow) {
      this.config.iframeElement.contentWindow.postMessage(message, this.config.targetOrigin);
    }
  }

  /**
   * Log an event
   */
  private log(
    level: "info" | "warn" | "error",
    event: string,
    data?: unknown
  ): void {
    const logMsg = createLogEvent(this.config.bundle.site.siteId, level, event, data);
    if (this.config.onLog) {
      this.config.onLog(logMsg);
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    window.removeEventListener("message", this.handleMessage.bind(this));
    this.messageHandlers.clear();
    this.pendingIntents.clear();
  }
}

// ============================================================================
// Export
// ============================================================================

// ClientOrchestrationConfig is export inline above
// ClientOrchestrationState is exported from types/siteBundle.ts
