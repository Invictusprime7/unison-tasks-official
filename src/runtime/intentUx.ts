import { z } from "zod";

export type IntentUxMode = "demo" | "pipeline" | "autorun";

export interface IntentUxDecision {
  mode: IntentUxMode;
  /** If mode === 'pipeline', you can override which intent the pipeline runs */
  pipelineIntent?: string;
  /** If mode === 'demo', iframe URL to load */
  demoUrl?: string;
  /** Human label for toasts */
  toastLabel?: string;
}

const isNonEmptyString = (v: unknown) => typeof v === "string" && v.trim().length > 0;

const newsletterPayloadSchema = z.object({
  email: z.string().trim().email(),
});

const waitlistPayloadSchema = newsletterPayloadSchema;

const pricingSelectSchema = z.object({}).passthrough();

const DEMO_INTENTS = new Set(["demo.request", "demo.watch"]);

/**
 * Hybrid decision:
 * - Per-intent defaults (demo/auth/etc)
 * - Auto-run if payload already has required fields (for automatable intents)
 */
export function decideIntentUx(intent: string, payload: Record<string, unknown> | null | undefined): IntentUxDecision {
  const p = payload ?? {};

  // 1) Demo intents always open a demo viewer.
  if (DEMO_INTENTS.has(intent)) {
    const demoUrl = isNonEmptyString(p.demoUrl)
      ? (p.demoUrl as string)
      : isNonEmptyString(p.supademoUrl)
        ? (p.supademoUrl as string)
        : undefined;

    return {
      mode: "demo",
      demoUrl,
      toastLabel: "Demo",
    };
  }

  // 2) Trial/start actions should drive an auth pipeline (sign in/up).
  if (intent === "trial.start") {
    return {
      mode: "pipeline",
      pipelineIntent: "auth.signup",
      toastLabel: "Trial",
    };
  }

  // 3) Automations that can run immediately if required fields exist.
  if (intent === "newsletter.subscribe") {
    const ok = newsletterPayloadSchema.safeParse(p).success;
    return { mode: ok ? "autorun" : "pipeline", toastLabel: "Subscription" };
  }

  if (intent === "join.waitlist") {
    const ok = waitlistPayloadSchema.safeParse(p).success;
    return { mode: ok ? "autorun" : "pipeline", toastLabel: "Waitlist" };
  }

  // 4) Navigation-like intents should just run.
  if (intent === "pricing.select") {
    const ok = pricingSelectSchema.safeParse(p).success;
    return { mode: ok ? "autorun" : "autorun", toastLabel: "Pricing" };
  }

  // Default: pipeline (collect missing data / show use-case UI)
  return { mode: "pipeline" };
}
