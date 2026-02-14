/**
 * Inngest Event Bridge
 * 
 * Connects the Intent Executor's event emission to Inngest workflows.
 * This is the glue that makes "buttons trigger automations" work.
 * 
 * Flow:
 * 1. User clicks button → executeIntent()
 * 2. IntentResult.events emitted
 * 3. This bridge sends events to Inngest
 * 4. Inngest workflows pick them up and run automations
 */

import { inngest, type InngestEvents } from './inngest';
import type { EmittedEvent, IntentManagers } from '@/runtime/intentExecutor';

// ============ EVENT MAPPING ============

/**
 * Maps intent executor events to Inngest event names
 */
const INTENT_TO_INNGEST_EVENT: Record<string, keyof InngestEvents> = {
  // Lead/Contact events
  'lead.submitted': 'crm/lead.created',
  'lead.captured': 'crm/lead.created',
  'contact.submitted': 'crm/contact.created',
  
  // Booking events
  'booking.requested': 'booking/created',
  'booking.confirmed': 'booking/created', // Will be updated once booking confirmed
  'booking.reminder': 'booking/reminded',
  'booking.noshow': 'booking/no.show',
  
  // Form events
  'form.submitted': 'form/submitted',
  
  // CRM pipeline events
  'deal.won': 'crm/deal.stage.changed',
  'deal.lost': 'crm/deal.stage.changed',
  
  // Order/checkout events  
  'checkout.started': 'automation/trigger',
  'order.created': 'automation/trigger',
  'order.shipped': 'automation/trigger',
  'order.delivered': 'automation/trigger',
  
  // Generic button events
  'button.clicked': 'automation/trigger',
  
  // Cart events
  'cart.item_added': 'automation/trigger',
  'cart.abandoned': 'automation/trigger',
};

/**
 * Transform intent event payload to Inngest event data format
 */
function transformPayload(
  eventName: string, 
  payload: Record<string, unknown>,
  context: EventBridgeContext
): Record<string, unknown> {
  const baseData = {
    businessId: context.businessId || 'default',
    timestamp: new Date().toISOString(),
    source: 'intent-executor',
  };

  switch (eventName) {
    case 'lead.submitted':
    case 'lead.captured':
      return {
        ...baseData,
        leadId: payload.leadId || `lead_${Date.now()}`,
        email: payload.email,
        phone: payload.phone,
        source: payload.source || 'website',
      };

    case 'booking.requested':
    case 'booking.confirmed':
      return {
        ...baseData,
        bookingId: payload.bookingId || `booking_${Date.now()}`,
        contactEmail: payload.customerEmail,
        contactPhone: payload.customerPhone,
        service: payload.serviceName || 'General Appointment',
        scheduledAt: payload.datetime || new Date().toISOString(),
      };

    case 'checkout.started':
      return {
        ...baseData,
        automationId: 'checkout-started',
        triggerId: `checkout_${Date.now()}`,
        triggerType: 'checkout',
        payload: {
          items: payload.items,
          total: payload.total,
        },
      };

    case 'deal.won':
      return {
        ...baseData,
        dealId: payload.dealId || `deal_${Date.now()}`,
        previousStage: payload.previousStage || 'negotiation',
        newStage: 'closed_won',
        contactEmail: payload.contactEmail,
      };

    case 'deal.lost':
      return {
        ...baseData,
        dealId: payload.dealId || `deal_${Date.now()}`,
        previousStage: payload.previousStage || 'negotiation',
        newStage: 'closed_lost',
        contactEmail: payload.contactEmail,
      };

    case 'cart.abandoned':
      return {
        ...baseData,
        automationId: 'cart-abandoned',
        triggerId: `cart_${Date.now()}`,
        triggerType: 'cart_abandoned',
        payload: {
          cartId: payload.cartId,
          items: payload.items,
          email: payload.email,
        },
      };

    default:
      return {
        ...baseData,
        automationId: eventName.replace('.', '-'),
        triggerId: `trigger_${Date.now()}`,
        triggerType: eventName,
        payload,
      };
  }
}

// ============ CONTEXT ============

export interface EventBridgeContext {
  businessId?: string;
  siteId?: string;
  userId?: string;
  sessionId?: string;
}

// ============ BRIDGE FUNCTIONS ============

/**
 * Send an intent event to Inngest
 */
export async function sendToInngest(
  event: EmittedEvent,
  context: EventBridgeContext = {}
): Promise<{ sent: boolean; inngestEventId?: string; error?: string }> {
  try {
    const inngestEventName = INTENT_TO_INNGEST_EVENT[event.name];
    
    if (!inngestEventName) {
      console.log(`[EventBridge] No Inngest mapping for event: ${event.name}`);
      return { sent: false, error: 'No event mapping' };
    }

    const transformedData = transformPayload(event.name, event.payload, context);
    
    console.log(`[EventBridge] Sending to Inngest: ${event.name} → ${inngestEventName}`);
    
    const result = await inngest.send({
      name: inngestEventName,
      data: transformedData,
    } as any);

    console.log(`[EventBridge] Event sent successfully:`, result);
    return { sent: true, inngestEventId: (result as { ids?: string[] }).ids?.[0] };
  } catch (error) {
    console.error(`[EventBridge] Failed to send event:`, error);
    return { sent: false, error: (error as Error).message };
  }
}

/**
 * Send multiple events to Inngest (batched)
 */
export async function sendBatchToInngest(
  events: EmittedEvent[],
  context: EventBridgeContext = {}
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const event of events) {
    const result = await sendToInngest(event, context);
    if (result.sent) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed };
}

/**
 * Create an Inngest-aware events manager for the Intent Executor
 * 
 * Use this when configuring the executor to automatically send
 * events to Inngest workflows.
 */
export function createInngestEventsManager(
  context: EventBridgeContext = {}
): IntentManagers['events'] {
  const subscribers = new Map<string, Set<(event: EmittedEvent) => void>>();

  return {
    emit: (event: EmittedEvent) => {
      console.log(`[EventBridge] Event emitted: ${event.name}`);
      
      // Send to Inngest (fire-and-forget for performance)
      sendToInngest(event, context).catch(err => {
        console.error('[EventBridge] Background send failed:', err);
      });

      // Also notify local subscribers
      const eventSubscribers = subscribers.get(event.name);
      if (eventSubscribers) {
        for (const handler of eventSubscribers) {
          try {
            handler(event);
          } catch (err) {
            console.error('[EventBridge] Local handler failed:', err);
          }
        }
      }
    },

    subscribe: (eventName: string, handler: (event: EmittedEvent) => void) => {
      if (!subscribers.has(eventName)) {
        subscribers.set(eventName, new Set());
      }
      subscribers.get(eventName)!.add(handler);

      // Return unsubscribe function
      return () => {
        subscribers.get(eventName)?.delete(handler);
      };
    },
  };
}

/**
 * Initialize the event bridge with the Intent Executor
 * 
 * Call this once at app startup:
 * ```ts
 * import { configureIntentExecutor } from '@/runtime';
 * import { setupEventBridge } from '@/lib/inngest-event-bridge';
 * 
 * setupEventBridge({ businessId: 'my-business' });
 * ```
 */
export function setupEventBridge(context: EventBridgeContext = {}): void {
  // Import lazily to avoid circular dependencies
  import('@/runtime/intentExecutor').then(({ configureIntentExecutor }) => {
    const eventsManager = createInngestEventsManager(context);
    
    configureIntentExecutor({
      events: eventsManager,
    });
    
    console.log('[EventBridge] Connected to Intent Executor');
  });
}
