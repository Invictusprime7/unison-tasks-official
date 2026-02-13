/**
 * Inngest Client Configuration
 * 
 * Serverless workflow orchestration for CRM automations.
 * Works natively with Supabase Edge Functions and Vercel.
 */

import { Inngest, EventSchemas } from "inngest";

// Define event schemas for type safety
type Events = {
  // CRM Events
  "crm/deal.created": {
    data: {
      dealId: string;
      businessId: string;
      title: string;
      value?: number;
      contactId?: string;
      stage: string;
    };
  };
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
  "crm/lead.status.changed": {
    data: {
      leadId: string;
      businessId: string;
      previousStatus: string;
      newStatus: string;
    };
  };
  "crm/contact.created": {
    data: {
      contactId: string;
      businessId: string;
      email?: string;
      phone?: string;
      firstName?: string;
      lastName?: string;
    };
  };

  // Booking Events
  "booking/created": {
    data: {
      bookingId: string;
      businessId: string;
      contactId?: string;
      contactEmail?: string;
      contactPhone?: string;
      service: string;
      scheduledAt: string;
    };
  };
  "booking/reminded": {
    data: {
      bookingId: string;
      businessId: string;
      contactEmail?: string;
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

  // Form Events
  "form/submitted": {
    data: {
      formId: string;
      businessId: string;
      submissionId: string;
      email?: string;
      phone?: string;
      data: Record<string, unknown>;
    };
  };

  // Automation Events
  "automation/trigger": {
    data: {
      automationId: string;
      businessId: string;
      triggerId: string;
      triggerType: string;
      payload: Record<string, unknown>;
    };
  };
};

// Create the Inngest client
export const inngest = new Inngest({
  id: "unison-tasks",
  schemas: new EventSchemas().fromRecord<Events>(),
});

// Export event types for use in other files
export type InngestEvents = Events;
