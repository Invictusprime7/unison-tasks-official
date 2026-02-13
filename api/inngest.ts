/**
 * Inngest API Route
 * 
 * Webhook endpoint for Inngest to invoke workflow functions.
 * Deploy to Vercel: /api/inngest
 */

import { serve } from "inngest/vercel";
import { inngest } from "../src/lib/inngest";
import { inngestFunctions } from "../src/lib/inngest-workflows";

// Create the serve handler with all functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: inngestFunctions,
  // Landing page shows registered functions
  landingPage: true,
});

// Export default for Vercel
export default serve({
  client: inngest,
  functions: inngestFunctions,
  landingPage: true,
});
