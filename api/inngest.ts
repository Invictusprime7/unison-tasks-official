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

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Inngest } from "inngest";
import { serve } from "inngest/express";

// Create a simple Inngest client for the API route
const inngest = new Inngest({ 
  id: "unison-tasks",
  // In production, set INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY
});

// Import workflow functions dynamically to avoid bundling issues
// For now, register functions inline
const dealStageWorkflow = inngest.createFunction(
  { id: "deal-stage-workflow", name: "Deal Stage Change Handler", retries: 3 },
  { event: "crm/deal.stage.changed" },
  async ({ event, step }) => {
    const { dealId, newStage, previousStage } = event.data;
    await step.run("log-stage-change", async () => {
      console.log(`Deal ${dealId} moved from ${previousStage} to ${newStage}`);
      return { logged: true };
    });
    return { success: true, dealId, stage: newStage };
  }
);

const leadCreatedWorkflow = inngest.createFunction(
  { id: "lead-created-workflow", name: "Lead Created Handler", retries: 3 },
  { event: "crm/lead.created" },
  async ({ event, step }) => {
    const { leadId, businessId } = event.data;
    await step.run("process-lead", async () => {
      console.log(`New lead ${leadId} created for business ${businessId}`);
      return { processed: true };
    });
    return { success: true, leadId };
  }
);

const bookingReminderWorkflow = inngest.createFunction(
  { id: "booking-reminder-24h", name: "24h Booking Reminder", retries: 3 },
  { event: "booking/reminder.24h" },
  async ({ event, step }) => {
    const { bookingId, contactEmail, service, scheduledAt } = event.data;
    await step.run("send-reminder", async () => {
      console.log(`24h reminder: ${contactEmail} for ${service} at ${scheduledAt}`);
      // TODO: Integrate with email service
      return { sent: true };
    });
    return { success: true, bookingId };
  }
);

// Create the Inngest serve handler
const handler = serve({
  client: inngest,
  functions: [dealStageWorkflow, leadCreatedWorkflow, bookingReminderWorkflow],
});

// Export default handler for @vercel/node runtime
export default async function inngestHandler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Inngest-Signature, X-Inngest-Env, X-Inngest-Framework, X-Inngest-Req-Version, X-Inngest-SDK, X-Inngest-Server-Kind');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Create a mock next() function for Express compatibility
  const next = (err?: unknown) => {
    if (err) {
      console.error('Inngest handler error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // Call the Express-style handler
  return handler(req as any, res as any, next);
}

