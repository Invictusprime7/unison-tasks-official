/**
 * Inngest Client Configuration
 * 
 * Serverless workflow orchestration for CRM automations.
 * Works natively with Supabase Edge Functions and Vercel.
 * 
 * ARCHITECTURE:
 * - Event-driven: Intent Executor emits events → Inngest picks them up
 * - Durable execution: Steps survive serverless timeouts
 * - Automatic retries: Built-in retry logic with backoff
 */

import { Inngest, EventSchemas } from "inngest";

// Define event schemas for type safety
type Events = {
  // ============ CRM EVENTS ============
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
      timestamp?: string;
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

  // ============ BOOKING EVENTS ============
  "booking/created": {
    data: {
      bookingId: string;
      businessId: string;
      contactId?: string;
      contactEmail?: string;
      contactPhone?: string;
      service: string;
      scheduledAt: string;
      timestamp?: string;
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

  // ============ FORM EVENTS ============
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

  // ============ AUTOMATION EVENTS (from Intent Executor) ============
  "automation/trigger": {
    data: {
      automationId: string;
      businessId: string;
      triggerId: string;
      triggerType: string;
      payload: Record<string, unknown>;
      timestamp?: string;
      source?: string;
    };
  };
  
  // ============ CHECKOUT/ORDER EVENTS ============
  "checkout/started": {
    data: {
      checkoutId: string;
      businessId: string;
      cartId?: string;
      items: Array<{ productId: string; quantity: number }>;
      total?: number;
      customerEmail?: string;
      timestamp?: string;
    };
  };
  "order/created": {
    data: {
      orderId: string;
      businessId: string;
      customerId?: string;
      customerEmail?: string;
      items: Array<{ productId: string; quantity: number; price: number }>;
      total: number;
      timestamp?: string;
    };
  };
  "order/shipped": {
    data: {
      orderId: string;
      businessId: string;
      customerEmail?: string;
      trackingNumber?: string;
      carrier?: string;
    };
  };
  "order/delivered": {
    data: {
      orderId: string;
      businessId: string;
      customerEmail?: string;
    };
  };

  // ============ CART EVENTS ============
  "cart/abandoned": {
    data: {
      cartId: string;
      businessId: string;
      customerEmail?: string;
      items: Array<{ productId: string; quantity: number }>;
      total?: number;
      lastActivityAt: string;
    };
  };

  // ============ NEWSLETTER EVENTS ============
  "newsletter/subscribed": {
    data: {
      subscriptionId: string;
      businessId: string;
      email: string;
      lists?: string[];
      source?: string;
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
