/**
 * Inngest Workflow Functions
 * 
 * CRM automation workflows powered by Inngest's durable execution.
 * These run on your existing serverless infrastructure.
 */

import { inngest } from "./inngest";

/**
 * Deal Stage Change Workflow
 * 
 * Triggered when a deal moves to a new stage.
 * Handles notifications, follow-ups, and stage-specific automations.
 */
export const dealStageWorkflow = inngest.createFunction(
  { 
    id: "deal-stage-workflow",
    name: "Deal Stage Change Handler",
    retries: 3,
  },
  { event: "crm/deal.stage.changed" },
  async ({ event, step }) => {
    const { dealId, businessId, newStage, previousStage, contactEmail } = event.data;

    // Step 1: Log the stage change
    await step.run("log-stage-change", async () => {
      console.log(`Deal ${dealId} moved from ${previousStage} to ${newStage}`);
      // In production: log to automation_logs table
      return { logged: true };
    });

    // Step 2: Handle stage-specific actions
    if (newStage === "negotiation") {
      await step.run("negotiation-actions", async () => {
        // Send notification to sales team
        // Create follow-up task
        console.log(`Deal ${dealId} entered negotiation - notifying sales team`);
        return { notified: true };
      });

      // Wait 1 day, then send follow-up reminder
      await step.sleep("wait-for-follow-up", "1d");

      await step.run("send-follow-up-reminder", async () => {
        console.log(`Follow-up reminder for deal ${dealId}`);
        return { reminded: true };
      });
    }

    if (newStage === "closed_won") {
      await step.run("closed-won-actions", async () => {
        // Send congratulations email
        // Create onboarding tasks
        // Update revenue metrics
        console.log(`Deal ${dealId} closed! Processing win actions.`);
        return { processed: true };
      });

      // Wait 7 days, then request review
      if (contactEmail) {
        await step.sleep("wait-for-review-request", "7d");
        
        await step.run("request-review", async () => {
          console.log(`Requesting review from ${contactEmail} for deal ${dealId}`);
          return { reviewRequested: true };
        });
      }
    }

    if (newStage === "closed_lost") {
      await step.run("closed-lost-actions", async () => {
        // Log loss reason
        // Schedule follow-up for 30 days
        console.log(`Deal ${dealId} lost. Scheduling re-engagement.`);
        return { processed: true };
      });

      // Wait 30 days, then re-engage
      await step.sleep("wait-for-reengagement", "30d");

      await step.run("re-engage-contact", async () => {
        console.log(`Re-engaging contact for deal ${dealId}`);
        return { reengaged: true };
      });
    }

    return { 
      dealId, 
      newStage, 
      completed: true,
      timestamp: new Date().toISOString()
    };
  }
);

/**
 * Lead Follow-up Workflow
 * 
 * Automated follow-up sequence for new leads.
 */
export const leadFollowUpWorkflow = inngest.createFunction(
  {
    id: "lead-follow-up-workflow",
    name: "Lead Follow-up Sequence",
    retries: 3,
  },
  { event: "crm/lead.created" },
  async ({ event, step }) => {
    const { leadId, businessId, email, phone } = event.data;

    // Step 1: Immediate acknowledgment
    await step.run("acknowledge-lead", async () => {
      console.log(`New lead ${leadId} received - sending acknowledgment`);
      // Send immediate confirmation email/SMS
      return { acknowledged: true };
    });

    // Step 2: Wait 30 minutes, then send first follow-up
    await step.sleep("wait-first-follow-up", "30m");

    await step.run("first-follow-up", async () => {
      console.log(`First follow-up for lead ${leadId}`);
      return { firstFollowUp: true };
    });

    // Step 3: Wait 1 day, then second follow-up
    await step.sleep("wait-second-follow-up", "1d");

    await step.run("second-follow-up", async () => {
      console.log(`Second follow-up for lead ${leadId}`);
      return { secondFollowUp: true };
    });

    // Step 4: Wait 3 days, then final follow-up
    await step.sleep("wait-final-follow-up", "3d");

    await step.run("final-follow-up", async () => {
      console.log(`Final follow-up for lead ${leadId}`);
      return { finalFollowUp: true };
    });

    return {
      leadId,
      completed: true,
      sequence: ["acknowledge", "first", "second", "final"],
    };
  }
);

/**
 * Booking Reminder Workflow
 * 
 * Send reminders before scheduled bookings.
 */
export const bookingReminderWorkflow = inngest.createFunction(
  {
    id: "booking-reminder-workflow",
    name: "Booking Reminder Sequence",
    retries: 3,
  },
  { event: "booking/created" },
  async ({ event, step }) => {
    const { bookingId, businessId, contactEmail, scheduledAt, service } = event.data;
    
    const scheduledDate = new Date(scheduledAt);
    const now = new Date();
    
    // Calculate time until booking
    const msUntilBooking = scheduledDate.getTime() - now.getTime();
    const hoursUntilBooking = msUntilBooking / (1000 * 60 * 60);

    // Step 1: Immediate confirmation
    await step.run("send-confirmation", async () => {
      console.log(`Booking ${bookingId} confirmed for ${service} at ${scheduledAt}`);
      return { confirmed: true };
    });

    // Step 2: 24-hour reminder (if booking is >24h away)
    if (hoursUntilBooking > 24) {
      const reminderTime = new Date(scheduledDate.getTime() - 24 * 60 * 60 * 1000);
      await step.sleepUntil("wait-for-24h-reminder", reminderTime);
      
      await step.run("send-24h-reminder", async () => {
        console.log(`24h reminder for booking ${bookingId}`);
        return { reminded24h: true };
      });
    }

    // Step 3: 2-hour reminder
    if (hoursUntilBooking > 2) {
      const twoHourReminder = new Date(scheduledDate.getTime() - 2 * 60 * 60 * 1000);
      await step.sleepUntil("wait-for-2h-reminder", twoHourReminder);
      
      await step.run("send-2h-reminder", async () => {
        console.log(`2h reminder for booking ${bookingId}`);
        return { reminded2h: true };
      });
    }

    return {
      bookingId,
      service,
      scheduledAt,
      remindersComplete: true,
    };
  }
);

/**
 * Post-Booking Review Request Workflow
 * 
 * Request reviews after service completion.
 */
export const reviewRequestWorkflow = inngest.createFunction(
  {
    id: "review-request-workflow",
    name: "Post-Service Review Request",
    retries: 2,
  },
  { event: "booking/completed" },
  async ({ event, step }) => {
    const { bookingId, businessId, contactEmail } = event.data;

    // Wait 2 hours after completion
    await step.sleep("wait-for-review-timing", "2h");

    await step.run("send-review-request", async () => {
      console.log(`Requesting review for booking ${bookingId} from ${contactEmail}`);
      // Send email with review link
      return { reviewRequested: true };
    });

    // Wait 3 days, if no review, send gentle reminder
    await step.sleep("wait-for-review-reminder", "3d");

    await step.run("send-review-reminder", async () => {
      console.log(`Review reminder for booking ${bookingId}`);
      return { reminderSent: true };
    });

    return {
      bookingId,
      reviewSequenceComplete: true,
    };
  }
);

/**
 * No-Show Follow-up Workflow
 */
export const noShowFollowUpWorkflow = inngest.createFunction(
  {
    id: "no-show-follow-up-workflow",
    name: "No-Show Follow-up",
    retries: 2,
  },
  { event: "booking/no.show" },
  async ({ event, step }) => {
    const { bookingId, businessId, contactEmail } = event.data;

    // Wait 1 hour after no-show detection
    await step.sleep("wait-after-no-show", "1h");

    await step.run("send-no-show-follow-up", async () => {
      console.log(`No-show follow-up for booking ${bookingId}`);
      // Send message asking to reschedule
      return { followUpSent: true };
    });

    return {
      bookingId,
      noShowHandled: true,
    };
  }
);

/**
 * Form Submission Workflow
 * 
 * Process form submissions and create leads.
 */
export const formSubmissionWorkflow = inngest.createFunction(
  {
    id: "form-submission-workflow",
    name: "Form Submission Handler",
    retries: 3,
  },
  { event: "form/submitted" },
  async ({ event, step }) => {
    const { formId, businessId, submissionId, email, data } = event.data;

    // Step 1: Create or update contact/lead
    const lead = await step.run("create-lead", async () => {
      console.log(`Processing form submission ${submissionId}`);
      // Create lead in CRM
      return { leadId: `lead_${submissionId}` };
    });

    // Step 2: Send confirmation
    await step.run("send-confirmation", async () => {
      console.log(`Sending form confirmation to ${email}`);
      return { confirmed: true };
    });

    // Step 3: Notify business owner
    await step.run("notify-owner", async () => {
      console.log(`Notifying business ${businessId} of new submission`);
      return { notified: true };
    });

    // Step 4: Trigger lead follow-up sequence
    await step.sendEvent("trigger-lead-follow-up", {
      name: "crm/lead.created",
      data: {
        leadId: lead.leadId,
        businessId,
        email,
        source: "form",
      },
    });

    return {
      submissionId,
      leadCreated: lead.leadId,
      processed: true,
    };
  }
);

// Export all workflows
export const inngestFunctions = [
  dealStageWorkflow,
  leadFollowUpWorkflow,
  bookingReminderWorkflow,
  reviewRequestWorkflow,
  noShowFollowUpWorkflow,
  formSubmissionWorkflow,
];
