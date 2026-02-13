/**
 * Trigger.dev Configuration
 * 
 * Background job processing for heavy compute tasks.
 * Runs on Trigger.dev's managed infrastructure - no timeouts.
 */

import { TriggerClient } from "@trigger.dev/sdk";

// Create the Trigger.dev client
export const triggerClient = new TriggerClient({
  id: "unison-tasks",
  // API key is set via TRIGGER_API_KEY environment variable
  // Get your key from: https://cloud.trigger.dev
});

// Re-export for convenience
export { triggerClient as trigger };
