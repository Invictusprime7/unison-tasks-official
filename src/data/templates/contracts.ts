/**
 * System Contracts
 * Defines what makes each business system "launchable" and production-ready
 */

import type { BusinessSystemType } from './types';

export interface SystemContract {
  systemType: BusinessSystemType;
  name: string;
  requiredIntents: string[];
  /**
   * Required CTA slots that must exist in the template DOM for publish readiness.
   * Slots are enforced via data-ut-cta attributes (e.g. "cta.primary").
   */
  requiredSlots: string[];
  requiredData: string[];
  recommendedIntegrations: string[];
  publishChecks: PublishCheck[];
  demoResponses: Record<string, DemoResponse>;
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
 */
export const systemContracts: Record<BusinessSystemType, SystemContract> = {
  booking: {
    systemType: 'booking',
    name: 'Booking Business',
    requiredIntents: [
      'booking.create',
      'reservation.submit',
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
      'reservation.submit': {
        success: true,
        message: '✅ Reservation confirmed for 4 guests',
        data: { reservationId: 'RES-67890', partySize: 4 },
      },
      'contact.submit': {
        success: true,
        message: '✅ Message received! We\'ll respond within 24 hours',
        data: { ticketId: 'TKT-11111' },
      },
    },
  },

  portfolio: {
    systemType: 'portfolio',
    name: 'Portfolio + Clients',
    requiredIntents: [
      'contact.submit',
      'project.inquire',
      'quote.request',
    ],
    requiredSlots: ['cta.primary', 'cta.nav', 'cta.footer'],
    requiredData: [
      'creator_name',
      'portfolio_items',
      'contact_email',
    ],
    recommendedIntegrations: ['email', 'crm'],
    publishChecks: [
      {
        id: 'has_portfolio',
        label: 'Portfolio items added',
        description: 'Showcase at least 3 portfolio pieces',
        severity: 'error',
      },
      {
        id: 'has_contact_form',
        label: 'Contact form configured',
        description: 'Allow clients to reach out',
        severity: 'error',
      },
      {
        id: 'has_services_pricing',
        label: 'Services or pricing listed',
        description: 'Help clients understand your offerings',
        severity: 'warning',
      },
    ],
    demoResponses: {
      'contact.submit': {
        success: true,
        message: '✅ Inquiry sent! You\'ll hear back soon',
        data: { inquiryId: 'INQ-22222' },
      },
      'project.inquire': {
        success: true,
        message: '✅ Project inquiry received',
        data: { projectId: 'PRJ-33333' },
      },
      'quote.request': {
        success: true,
        message: '✅ Quote request submitted',
        data: { quoteId: 'QT-44444' },
      },
    },
  },

  store: {
    systemType: 'store',
    name: 'Online Store',
    requiredIntents: [
      'cart.add',
      'cart.view',
      'checkout.start',
    ],
    requiredSlots: ['cta.primary', 'cta.nav', 'cta.footer'],
    requiredData: [
      'store_name',
      'products',
      'payment_method',
    ],
    recommendedIntegrations: ['stripe', 'inventory'],
    publishChecks: [
      {
        id: 'has_products',
        label: 'Products added',
        description: 'Add at least one product to sell',
        severity: 'error',
      },
      {
        id: 'has_checkout',
        label: 'Checkout configured',
        description: 'Payment processing must be set up',
        severity: 'error',
      },
      {
        id: 'has_shipping',
        label: 'Shipping options',
        description: 'Define shipping methods and rates',
        severity: 'warning',
      },
    ],
    demoResponses: {
      'cart.add': {
        success: true,
        message: '✅ Added to cart',
        data: { cartItemCount: 1, cartTotal: 29.99 },
      },
      'cart.view': {
        success: true,
        message: 'Your cart (1 item)',
        data: { items: [{ name: 'Demo Product', price: 29.99, qty: 1 }] },
      },
      'checkout.start': {
        success: true,
        message: '✅ Checkout initiated',
        data: { checkoutUrl: '/checkout', orderId: 'ORD-55555' },
      },
    },
  },

  agency: {
    systemType: 'agency',
    name: 'Agency & Services',
    requiredIntents: [
      'contact.sales',
      'demo.request',
      'quote.request',
    ],
    requiredSlots: ['cta.primary', 'cta.nav', 'cta.footer'],
    requiredData: [
      'agency_name',
      'services',
      'contact_email',
    ],
    recommendedIntegrations: ['crm', 'calendar', 'email'],
    publishChecks: [
      {
        id: 'has_services',
        label: 'Services defined',
        description: 'List your agency services',
        severity: 'error',
      },
      {
        id: 'has_lead_capture',
        label: 'Lead capture form',
        description: 'Capture leads from your website',
        severity: 'error',
      },
      {
        id: 'has_case_studies',
        label: 'Case studies or portfolio',
        description: 'Showcase past work to build trust',
        severity: 'warning',
      },
    ],
    demoResponses: {
      'contact.sales': {
        success: true,
        message: '✅ Sales inquiry received! Our team will reach out',
        data: { leadId: 'LEAD-66666' },
      },
      'demo.request': {
        success: true,
        message: '✅ Demo scheduled for next week',
        data: { demoId: 'DEMO-77777' },
      },
      'quote.request': {
        success: true,
        message: '✅ Custom quote request submitted',
        data: { quoteId: 'QT-88888' },
      },
    },
  },

  content: {
    systemType: 'content',
    name: 'Content & Blog',
    requiredIntents: [
      'newsletter.subscribe',
      'contact.submit',
    ],
    requiredSlots: ['cta.primary', 'cta.footer'],
    requiredData: [
      'site_name',
      'author_name',
      'contact_email',
    ],
    recommendedIntegrations: ['email', 'analytics'],
    publishChecks: [
      {
        id: 'has_content',
        label: 'Content published',
        description: 'Publish at least one article or post',
        severity: 'error',
      },
      {
        id: 'has_newsletter',
        label: 'Newsletter signup',
        description: 'Capture subscribers for your content',
        severity: 'warning',
      },
      {
        id: 'has_seo',
        label: 'SEO configured',
        description: 'Meta tags and descriptions set',
        severity: 'info',
      },
    ],
    demoResponses: {
      'newsletter.subscribe': {
        success: true,
        message: '✅ Subscribed! Check your inbox for confirmation',
        data: { subscriberId: 'SUB-99999' },
      },
      'contact.submit': {
        success: true,
        message: '✅ Message received!',
        data: { ticketId: 'TKT-00000' },
      },
    },
  },

  saas: {
    systemType: 'saas',
    name: 'SaaS & Startup',
    requiredIntents: [
      'trial.start',
      'pricing.select',
      'demo.request',
      'newsletter.subscribe',
    ],
    requiredSlots: ['cta.primary', 'cta.secondary', 'cta.nav', 'cta.footer'],
    requiredData: [
      'product_name',
      'pricing_tiers',
      'contact_email',
    ],
    recommendedIntegrations: ['stripe', 'auth', 'email'],
    publishChecks: [
      {
        id: 'has_pricing',
        label: 'Pricing page',
        description: 'Display your pricing tiers',
        severity: 'error',
      },
      {
        id: 'has_signup',
        label: 'Signup flow',
        description: 'Users can create accounts or start trials',
        severity: 'error',
      },
      {
        id: 'has_features',
        label: 'Features listed',
        description: 'Clearly communicate product value',
        severity: 'warning',
      },
    ],
    demoResponses: {
      'trial.start': {
        success: true,
        message: '✅ 14-day free trial started!',
        data: { userId: 'USR-TRIAL-1', trialEnds: '2024-01-29' },
      },
      'pricing.select': {
        success: true,
        message: '✅ Pro plan selected',
        data: { plan: 'pro', price: 49 },
      },
      'demo.request': {
        success: true,
        message: '✅ Demo booked! Check your email',
        data: { demoId: 'DEMO-SAAS-1' },
      },
      'newsletter.subscribe': {
        success: true,
        message: '✅ You\'re on the list!',
        data: { subscriberId: 'SUB-SAAS-1' },
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
  return contract?.requiredIntents.includes(intent) ?? false;
};

/**
 * Get demo response for an intent in demo mode
 */
export const getDemoResponse = (systemType: BusinessSystemType, intent: string): DemoResponse | undefined => {
  const contract = systemContracts[systemType];
  return contract?.demoResponses[intent];
};
