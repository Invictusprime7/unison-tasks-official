/**
 * Trigger.dev Configuration
 * 
 * Background job processing for heavy compute tasks.
 * Runs on Trigger.dev's managed infrastructure - no timeouts.
 */

// Trigger.dev v3+ uses a different API pattern
// The client is configured via environment variables automatically
export const triggerConfig = {
  id: "unison-tasks",
  // API key is set via TRIGGER_API_KEY environment variable
  // Get your key from: https://cloud.trigger.dev
};

// Re-export for convenience
export { triggerConfig as trigger };
