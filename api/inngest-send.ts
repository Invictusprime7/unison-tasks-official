/**
 * Inngest Event Send API
 * 
 * Endpoint for manually sending events to Inngest workflows.
 * Deploy to Vercel: /api/inngest-send
 * 
 * Usage:
 * POST /api/inngest-send
 * {
 *   "event": "crm/lead.created",
 *   "data": {
 *     "leadId": "lead_123",
 *     "businessId": "biz_456",
 *     "email": "test@example.com"
 *   }
 * }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { inngest, type InngestEvents } from '../src/lib/inngest';

// Allowed events that can be sent via this endpoint
const ALLOWED_EVENTS: Set<keyof InngestEvents> = new Set([
  // CRM events
  'crm/deal.created',
  'crm/deal.stage.changed',
  'crm/lead.created',
  'crm/lead.status.changed',
  'crm/contact.created',
  
  // Booking events
  'booking/created',
  'booking/reminded',
  'booking/reminder.24h',
  'booking/reminder.1h',
  'booking/completed',
  'booking/no.show',
  
  // Form events
  'form/submitted',
  
  // Automation events
  'automation/trigger',
  
  // Commerce events
  'checkout/started',
  'order/created',
  'order/shipped',
  'order/delivered',
  'cart/abandoned',
  
  // Newsletter
  'newsletter/subscribed',
]);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event, data } = req.body as {
      event: string;
      data: Record<string, unknown>;
    };

    if (!event || !data) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['event', 'data'],
      });
    }

    // Validate event name
    if (!ALLOWED_EVENTS.has(event as keyof InngestEvents)) {
      return res.status(400).json({
        error: `Invalid event: ${event}`,
        allowedEvents: Array.from(ALLOWED_EVENTS),
      });
    }

    // Add timestamp if not present
    const enrichedData = {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
      source: data.source || 'api',
    };

    console.log(`[inngest-send] Sending event: ${event}`, enrichedData);

    // Send to Inngest
    const result = await inngest.send({
      name: event,
      data: enrichedData,
    } as any);

    console.log(`[inngest-send] Event sent successfully:`, result);

    return res.status(200).json({
      success: true,
      event,
      ids: (result as { ids?: string[] }).ids,
    });
  } catch (error) {
    console.error('[inngest-send] Error:', error);
    return res.status(500).json({
      error: 'Failed to send event',
      message: (error as Error).message,
    });
  }
}
