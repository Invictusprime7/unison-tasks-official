/**
 * System Contracts
 * Defines what makes each business system "launchable" and production-ready
 * 
 * IMPORTANT: All intents MUST be from coreIntents.ts (ActionIntent subset):
 * - contact.submit
 * - newsletter.subscribe  
 * - booking.create
 * - quote.request
 * 
 * Nav/Pay intents are handled by the client-side router, not here.
 */

import type { BusinessSystemType } from './types';
import type { ActionIntent } from '@/coreIntents';

export interface SystemContract {
  systemType: BusinessSystemType;
  name: string;
  requiredIntents: ActionIntent[];
  /**
   * Required CTA slots that must exist in the template DOM for publish readiness.
   * Slots are enforced via data-ut-cta attributes (e.g. "cta.primary").
   */
  requiredSlots: string[];
  requiredData: string[];
  recommendedIntegrations: string[];
  publishChecks: PublishCheck[];
  /** Demo responses for ACTION intents only (nav/pay are client-side) */
  demoResponses: Record<ActionIntent, DemoResponse>;
}

export interface PublishCheck {
  id: string;
  label: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
}

export interface DemoResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Contract definitions for each business system
 * Currently only Booking System is supported
 * All use ONLY ActionIntents: contact.submit, newsletter.subscribe, booking.create, quote.request
 */
export const systemContracts: Record<BusinessSystemType, SystemContract> = {
  booking: {
    systemType: 'booking',
    name: 'Booking Business',
    requiredIntents: [
      'booking.create',
      'contact.submit',
    ],
    requiredSlots: ['cta.primary', 'cta.nav', 'cta.footer'],
    requiredData: [
      'business_name',
      'business_email',
      'services',
    ],
    recommendedIntegrations: ['calendar', 'email'],
    publishChecks: [
      {
        id: 'has_booking_form',
        label: 'Booking form configured',
        description: 'At least one booking form must be present',
        severity: 'error',
      },
      {
        id: 'has_services',
        label: 'Services defined',
        description: 'Define your services for customers to book',
        severity: 'error',
      },
      {
        id: 'has_contact_info',
        label: 'Contact information',
        description: 'Business contact details are visible',
        severity: 'warning',
      },
    ],
    demoResponses: {
      'booking.create': {
        success: true,
        message: '✅ Appointment booked for Tuesday at 2:00 PM',
        data: { confirmationId: 'DEMO-12345', date: '2024-01-15', time: '14:00' },
      },
      'contact.submit': {
        success: true,
        message: '✅ Message received! We\'ll respond within 24 hours',
        data: { ticketId: 'TKT-11111' },
      },
      'newsletter.subscribe': {
        success: true,
        message: '✅ Subscribed to updates!',
        data: { subscriberId: 'SUB-BOOK-1' },
      },
      'quote.request': {
        success: true,
        message: '✅ Quote request submitted',
        data: { quoteId: 'QT-BOOK-1' },
      },
      'lead.capture': {
        success: true,
        message: '✅ Thank you! We\'ll be in touch soon',
        data: { leadId: 'LEAD-BOOK-1' },
      },
    },
  },
};

/**
 * Get contract for a system type
 */
export const getSystemContract = (systemType: BusinessSystemType): SystemContract | undefined => {
  return systemContracts[systemType];
};

/**
 * Check if an intent is required for a system
 */
export const isRequiredIntent = (systemType: BusinessSystemType, intent: string): boolean => {
  const contract = systemContracts[systemType];
  return contract?.requiredIntents.includes(intent as ActionIntent) ?? false;
};

/**
 * Get demo response for an intent in demo mode
 */
export const getDemoResponse = (systemType: BusinessSystemType, intent: string): DemoResponse | undefined => {
  const contract = systemContracts[systemType];
  return contract?.demoResponses[intent as ActionIntent];
};
