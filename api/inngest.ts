/**
 * Inngest API Route
 * 
 * Webhook endpoint for Inngest to invoke workflow functions.
 * Deploy to Vercel: /api/inngest
 * 
 * This endpoint:
 * 1. Receives events from the Intent Executor via inngest-event-bridge
 * 2. Routes them to the appropriate workflow functions
 * 3. Handles durable execution with automatic retries
 */

import { serve } from "inngest/next";
import { inngest } from "../src/lib/inngest";
import { inngestFunctions } from "../src/lib/inngest-workflows";

// Export the serve handler for Vercel/Next.js API routes
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: inngestFunctions,
});

// Default export for compatibility
export default serve({
  client: inngest,
  functions: inngestFunctions,
});

/**
 * Configuration for Vercel Edge Runtime
 * Uncomment to use Edge Functions (faster cold starts)
 */
// export const config = {
//   runtime: 'edge',
// };

