/**
 * Inngest API Route
 * 
 * Webhook endpoint for Inngest to invoke workflow functions.
 * Deploy to Vercel: /api/inngest
 */

import { Inngest } from "inngest";
import { serve } from "inngest/express";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Define event schemas
type Events = {
  "crm/deal.stage.changed": {
    data: {
      dealId: string;
      businessId: string;
      previousStage: string;
      newStage: string;
      contactId?: string;
      contactEmail?: string;
    };
  };
  "crm/lead.created": {
    data: {
      leadId: string;
      businessId: string;
      email?: string;
      phone?: string;
      source?: string;
    };
  };
  "booking/created": {
    data: {
      bookingId: string;
      businessId: string;
      contactId?: string;
      contactEmail?: string;
      service: string;
      scheduledAt: string;
    };
  };
  "booking/completed": {
    data: {
      bookingId: string;
      businessId: string;
      contactId?: string;
      contactEmail?: string;
    };
  };
  "booking/no.show": {
    data: {
      bookingId: string;
      businessId: string;
      contactId?: string;
      contactEmail?: string;
    };
  };
  "form/submitted": {
    data: {
      formId: string;
      businessId: string;
      submissionId: string;
      email?: string;
      data: Record<string, unknown>;
    };
  };
};

// Create Inngest client
const inngest = new Inngest({
  id: "unison-tasks",
  schemas: new EventSchemas().fromRecord<Events>(),
});

// Deal Stage Workflow
const dealStageWorkflow = inngest.createFunction(
  { id: "deal-stage-workflow", retries: 3 },
  { event: "crm/deal.stage.changed" },
  async ({ event, step }) => {
    const { dealId, newStage, previousStage } = event.data;

    await step.run("log-stage-change", async () => {
      console.log(`Deal ${dealId} moved from ${previousStage} to ${newStage}`);
      return { logged: true };
    });

    if (newStage === "negotiation") {
      await step.run("negotiation-actions", async () => {
        console.log(`Deal ${dealId} entered negotiation`);
        return { notified: true };
      });
    }

    if (newStage === "closed_won") {
      await step.run("closed-won-actions", async () => {
        console.log(`Deal ${dealId} closed won!`);
        return { processed: true };
      });
    }

    return { dealId, newStage, completed: true };
  }
);

// Lead Follow-up Workflow
const leadFollowUpWorkflow = inngest.createFunction(
  { id: "lead-follow-up-workflow", retries: 3 },
  { event: "crm/lead.created" },
  async ({ event, step }) => {
    const { leadId, businessId } = event.data;

    await step.run("acknowledge-lead", async () => {
      console.log(`New lead ${leadId} received`);
      return { acknowledged: true };
    });

    await step.sleep("wait-first-follow-up", "30m");

    await step.run("first-follow-up", async () => {
      console.log(`First follow-up for lead ${leadId}`);
      return { firstFollowUp: true };
    });

    return { leadId, completed: true };
  }
);

// Booking Reminder Workflow
const bookingReminderWorkflow = inngest.createFunction(
  { id: "booking-reminder-workflow", retries: 3 },
  { event: "booking/created" },
  async ({ event, step }) => {
    const { bookingId, scheduledAt, service } = event.data;

    await step.run("send-confirmation", async () => {
      console.log(`Booking ${bookingId} confirmed for ${service}`);
      return { confirmed: true };
    });

    return { bookingId, service, confirmed: true };
  }
);

// Review Request Workflow
const reviewRequestWorkflow = inngest.createFunction(
  { id: "review-request-workflow", retries: 2 },
  { event: "booking/completed" },
  async ({ event, step }) => {
    const { bookingId, contactEmail } = event.data;

    await step.sleep("wait-for-review-timing", "2h");

    await step.run("send-review-request", async () => {
      console.log(`Requesting review for booking ${bookingId}`);
      return { reviewRequested: true };
    });

    return { bookingId, reviewSequenceComplete: true };
  }
);

// Form Submission Workflow
const formSubmissionWorkflow = inngest.createFunction(
  { id: "form-submission-workflow", retries: 3 },
  { event: "form/submitted" },
  async ({ event, step }) => {
    const { formId, submissionId, email } = event.data;

    await step.run("process-submission", async () => {
      console.log(`Processing form submission ${submissionId}`);
      return { processed: true };
    });

    return { submissionId, processed: true };
  }
);

// All workflow functions
const inngestFunctions = [
  dealStageWorkflow,
  leadFollowUpWorkflow,
  bookingReminderWorkflow,
  reviewRequestWorkflow,
  formSubmissionWorkflow,
];

// Export handler for Vercel
export default serve({
  client: inngest,
  functions: inngestFunctions,
});
