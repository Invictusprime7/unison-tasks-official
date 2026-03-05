/**
 * Inngest Client Service
 * 
 * Frontend service for sending events to Inngest via the API route.
 * Used by the intent executor and UI components to trigger workflows.
 */

import type { InngestEvents } from '@/lib/inngest';

const INNGEST_SEND_ENDPOINT = '/api/inngest-send';

export interface InngestSendResult {
  success: boolean;
  event?: string;
  ids?: string[];
  error?: string;
}

/**
 * Send an event to Inngest
 */
export async function sendInngestEvent<E extends keyof InngestEvents>(
  event: E,
  data: InngestEvents[E]['data']
): Promise<InngestSendResult> {
  try {
    const response = await fetch(INNGEST_SEND_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event, data }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to send event',
      };
    }

    return {
      success: true,
      event: result.event,
      ids: result.ids,
    };
  } catch (error) {
    console.error('[InngestService] Failed to send event:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Convenience functions for common events
 */

export async function triggerLeadCreated(data: {
  leadId?: string;
  businessId: string;
  email?: string;
  phone?: string;
  source?: string;
}): Promise<InngestSendResult> {
  return sendInngestEvent('crm/lead.created', {
    leadId: data.leadId || `lead_${Date.now()}`,
    businessId: data.businessId,
    email: data.email,
    phone: data.phone,
    source: data.source || 'website',
  });
}

export async function triggerDealStageChanged(data: {
  dealId: string;
  businessId: string;
  previousStage: string;
  newStage: string;
  contactEmail?: string;
}): Promise<InngestSendResult> {
  return sendInngestEvent('crm/deal.stage.changed', data);
}

export async function triggerBookingCreated(data: {
  bookingId?: string;
  businessId: string;
  contactEmail?: string;
  contactPhone?: string;
  service: string;
  scheduledAt: string;
}): Promise<InngestSendResult> {
  return sendInngestEvent('booking/created', {
    bookingId: data.bookingId || `booking_${Date.now()}`,
    businessId: data.businessId,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    service: data.service,
    scheduledAt: data.scheduledAt,
  });
}

export async function triggerFormSubmitted(data: {
  formId: string;
  businessId: string;
  email?: string;
  phone?: string;
  formData: Record<string, unknown>;
}): Promise<InngestSendResult> {
  return sendInngestEvent('form/submitted', {
    formId: data.formId,
    businessId: data.businessId,
    submissionId: `sub_${Date.now()}`,
    email: data.email,
    phone: data.phone,
    data: data.formData,
  });
}

export async function triggerCartAbandoned(data: {
  cartId: string;
  businessId: string;
  customerEmail?: string;
  items: Array<{ productId: string; quantity: number }>;
  total?: number;
}): Promise<InngestSendResult> {
  return sendInngestEvent('cart/abandoned', {
    cartId: data.cartId,
    businessId: data.businessId,
    customerEmail: data.customerEmail,
    items: data.items,
    total: data.total,
    lastActivityAt: new Date().toISOString(),
  });
}

export async function triggerOrderCreated(data: {
  orderId?: string;
  businessId: string;
  customerEmail?: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  total: number;
}): Promise<InngestSendResult> {
  return sendInngestEvent('order/created', {
    orderId: data.orderId || `order_${Date.now()}`,
    businessId: data.businessId,
    customerEmail: data.customerEmail,
    items: data.items,
    total: data.total,
  });
}

export async function triggerNewsletterSubscribed(data: {
  businessId: string;
  email: string;
  lists?: string[];
  source?: string;
}): Promise<InngestSendResult> {
  return sendInngestEvent('newsletter/subscribed', {
    subscriptionId: `sub_${Date.now()}`,
    businessId: data.businessId,
    email: data.email,
    lists: data.lists,
    source: data.source || 'website',
  });
}

/**
 * Generic automation trigger
 */
export async function triggerAutomation(data: {
  automationId: string;
  businessId: string;
  triggerType: string;
  payload: Record<string, unknown>;
}): Promise<InngestSendResult> {
  return sendInngestEvent('automation/trigger', {
    automationId: data.automationId,
    businessId: data.businessId,
    triggerId: `trigger_${Date.now()}`,
    triggerType: data.triggerType,
    payload: data.payload,
    source: 'intent-executor',
  });
}
