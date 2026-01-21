/**
 * Template Runtime Manifest System
 * 
 * Every template declares what backend resources it requires.
 * Templates without manifests are "demos" - not production systems.
 * 
 * This is the key differentiator: templates ARE executable systems.
 */

import type { BusinessSystemType } from './types';

/**
 * Database table requirement
 */
export interface TableRequirement {
  name: string;
  description: string;
  columns: string[];
  /** If true, table must exist for template to function */
  critical: boolean;
}

/**
 * Workflow requirement
 */
export interface WorkflowRequirement {
  id: string;
  name: string;
  triggerType: string;
  description: string;
  /** Steps this workflow must perform */
  requiredSteps: string[];
}

/**
 * Intent binding requirement
 */
export interface IntentRequirement {
  intent: string;
  label: string;
  handler: string;
  /** What happens when this intent fires */
  outcome: string;
}

/**
 * Role/permission requirement
 */
export interface RoleRequirement {
  role: string;
  permissions: string[];
  description: string;
}

/**
 * Template Runtime Manifest
 * Every production template MUST have this
 */
export interface TemplateManifest {
  /** Unique template identifier */
  id: string;
  /** Version for migration support */
  version: string;
  /** Business system this belongs to */
  systemType: BusinessSystemType;
  
  /** Required database tables */
  tables: TableRequirement[];
  
  /** Required workflows */
  workflows: WorkflowRequirement[];
  
  /** Required intent bindings */
  intents: IntentRequirement[];
  
  /** Required roles/permissions */
  roles: RoleRequirement[];
  
  /** Default settings applied on provision */
  defaults: {
    workflowsEnabled: boolean;
    crmPipeline?: string;
    notificationsEnabled: boolean;
    analyticsEnabled: boolean;
  };
  
  /** CRM pipeline configuration */
  crmPipeline?: {
    name: string;
    stages: string[];
    defaultStage: string;
  };
  
  /** Revenue/business outcome this template enables */
  businessOutcome: string;
}

/**
 * Provisioning status for a template
 */
export interface ProvisioningStatus {
  templateId: string;
  businessId: string;
  status: 'pending' | 'provisioning' | 'ready' | 'failed';
  tablesProvisioned: string[];
  workflowsRegistered: string[];
  intentsBound: string[];
  errors: string[];
  provisionedAt?: string;
}

// ============================================================================
// TEMPLATE MANIFESTS - Each template declares its backend requirements
// ============================================================================

export const templateManifests: Record<string, TemplateManifest> = {
  // ----- BOOKING SYSTEM TEMPLATES -----
  'salon-booking': {
    id: 'salon-booking',
    version: '1.0.0',
    systemType: 'booking',
    tables: [
      {
        name: 'services',
        description: 'Available services for booking',
        columns: ['id', 'business_id', 'name', 'duration_minutes', 'price_cents', 'description', 'is_active'],
        critical: true,
      },
      {
        name: 'availability_slots',
        description: 'Available time slots',
        columns: ['id', 'business_id', 'service_id', 'starts_at', 'ends_at', 'is_booked'],
        critical: true,
      },
      {
        name: 'bookings',
        description: 'Customer bookings',
        columns: ['id', 'business_id', 'service_id', 'customer_name', 'customer_email', 'booking_date', 'booking_time', 'status'],
        critical: true,
      },
      {
        name: 'leads',
        description: 'Contact form submissions',
        columns: ['id', 'business_id', 'name', 'email', 'phone', 'message', 'source'],
        critical: false,
      },
    ],
    workflows: [
      {
        id: 'booking-confirmation',
        name: 'Booking Confirmation',
        triggerType: 'booking_created',
        description: 'Send confirmation when booking is made',
        requiredSteps: ['create_activity', 'send_email'],
      },
      {
        id: 'booking-reminder',
        name: 'Booking Reminder',
        triggerType: 'scheduled',
        description: 'Send reminder 24h before appointment',
        requiredSteps: ['send_email'],
      },
    ],
    intents: [
      {
        intent: 'booking.create',
        label: 'Book Appointment',
        handler: 'create-booking',
        outcome: 'New booking in system + confirmation',
      },
      {
        intent: 'contact.submit',
        label: 'Contact Us',
        handler: 'create-lead',
        outcome: 'Lead captured in CRM',
      },
    ],
    roles: [
      {
        role: 'owner',
        permissions: ['manage_services', 'view_bookings', 'manage_availability', 'view_analytics'],
        description: 'Business owner with full access',
      },
      {
        role: 'staff',
        permissions: ['view_bookings', 'update_booking_status'],
        description: 'Staff member with limited access',
      },
    ],
    defaults: {
      workflowsEnabled: true,
      crmPipeline: 'salon_clients',
      notificationsEnabled: true,
      analyticsEnabled: true,
    },
    crmPipeline: {
      name: 'Salon Clients',
      stages: ['New Lead', 'Contacted', 'Booked', 'Completed', 'Repeat Client'],
      defaultStage: 'New Lead',
    },
    businessOutcome: 'Automated appointment booking with confirmation and reminders',
  },

  'restaurant-booking': {
    id: 'restaurant-booking',
    version: '1.0.0',
    systemType: 'booking',
    tables: [
      {
        name: 'services',
        description: 'Table/seating options',
        columns: ['id', 'business_id', 'name', 'duration_minutes', 'description', 'is_active'],
        critical: true,
      },
      {
        name: 'availability_slots',
        description: 'Available reservation times',
        columns: ['id', 'business_id', 'starts_at', 'ends_at', 'is_booked'],
        critical: true,
      },
      {
        name: 'bookings',
        description: 'Table reservations',
        columns: ['id', 'business_id', 'customer_name', 'customer_email', 'customer_phone', 'booking_date', 'booking_time', 'notes', 'status'],
        critical: true,
      },
    ],
    workflows: [
      {
        id: 'reservation-confirmation',
        name: 'Reservation Confirmation',
        triggerType: 'booking_created',
        description: 'Confirm reservation immediately',
        requiredSteps: ['send_email'],
      },
    ],
    intents: [
      {
        intent: 'reservation.submit',
        label: 'Reserve Table',
        handler: 'create-booking',
        outcome: 'Table reserved with confirmation',
      },
      {
        intent: 'contact.submit',
        label: 'Contact Restaurant',
        handler: 'create-lead',
        outcome: 'Inquiry captured',
      },
    ],
    roles: [
      {
        role: 'owner',
        permissions: ['manage_reservations', 'view_analytics'],
        description: 'Restaurant owner',
      },
    ],
    defaults: {
      workflowsEnabled: true,
      notificationsEnabled: true,
      analyticsEnabled: true,
    },
    businessOutcome: 'Online table reservations with instant confirmation',
  },

  // ----- PORTFOLIO SYSTEM TEMPLATES -----
  'creator-portfolio': {
    id: 'creator-portfolio',
    version: '1.0.0',
    systemType: 'portfolio',
    tables: [
      {
        name: 'leads',
        description: 'Client inquiries',
        columns: ['id', 'business_id', 'name', 'email', 'phone', 'message', 'source'],
        critical: true,
      },
      {
        name: 'crm_contacts',
        description: 'Client contact database',
        columns: ['id', 'user_id', 'first_name', 'last_name', 'email', 'phone', 'company', 'tags'],
        critical: false,
      },
    ],
    workflows: [
      {
        id: 'inquiry-response',
        name: 'Inquiry Auto-Response',
        triggerType: 'form_submit',
        description: 'Acknowledge client inquiry immediately',
        requiredSteps: ['send_email', 'create_activity'],
      },
    ],
    intents: [
      {
        intent: 'contact.submit',
        label: 'Get in Touch',
        handler: 'create-lead',
        outcome: 'Client inquiry captured',
      },
      {
        intent: 'project.inquire',
        label: 'Project Inquiry',
        handler: 'create-lead',
        outcome: 'Project request logged',
      },
      {
        intent: 'quote.request',
        label: 'Request Quote',
        handler: 'create-lead',
        outcome: 'Quote request in CRM',
      },
    ],
    roles: [
      {
        role: 'owner',
        permissions: ['view_inquiries', 'manage_portfolio', 'view_analytics'],
        description: 'Portfolio owner',
      },
    ],
    defaults: {
      workflowsEnabled: true,
      crmPipeline: 'client_pipeline',
      notificationsEnabled: true,
      analyticsEnabled: true,
    },
    crmPipeline: {
      name: 'Client Pipeline',
      stages: ['Inquiry', 'Proposal Sent', 'Negotiating', 'Won', 'Lost'],
      defaultStage: 'Inquiry',
    },
    businessOutcome: 'Client inquiry capture with CRM pipeline',
  },

  // ----- STORE SYSTEM TEMPLATES -----
  'ecommerce-store': {
    id: 'ecommerce-store',
    version: '1.0.0',
    systemType: 'store',
    tables: [
      {
        name: 'products',
        description: 'Product catalog',
        columns: ['id', 'business_id', 'name', 'description', 'price_cents', 'image_url', 'stock_quantity', 'is_active'],
        critical: true,
      },
      {
        name: 'cart_items',
        description: 'Shopping cart',
        columns: ['id', 'session_id', 'user_id', 'product_id', 'quantity'],
        critical: true,
      },
      {
        name: 'orders',
        description: 'Customer orders',
        columns: ['id', 'session_id', 'user_id', 'customer_email', 'items', 'subtotal', 'total', 'status'],
        critical: true,
      },
    ],
    workflows: [
      {
        id: 'order-confirmation',
        name: 'Order Confirmation',
        triggerType: 'payment_completed',
        description: 'Send order confirmation after payment',
        requiredSteps: ['send_email', 'create_activity'],
      },
      {
        id: 'abandoned-cart',
        name: 'Abandoned Cart Recovery',
        triggerType: 'scheduled',
        description: 'Email customers with abandoned carts',
        requiredSteps: ['send_email'],
      },
    ],
    intents: [
      {
        intent: 'cart.add',
        label: 'Add to Cart',
        handler: 'cart-add',
        outcome: 'Product added to cart',
      },
      {
        intent: 'cart.view',
        label: 'View Cart',
        handler: 'cart-view',
        outcome: 'Display cart contents',
      },
      {
        intent: 'checkout.start',
        label: 'Checkout',
        handler: 'checkout-start',
        outcome: 'Begin checkout flow',
      },
    ],
    roles: [
      {
        role: 'owner',
        permissions: ['manage_products', 'view_orders', 'manage_inventory', 'view_analytics'],
        description: 'Store owner',
      },
    ],
    defaults: {
      workflowsEnabled: true,
      notificationsEnabled: true,
      analyticsEnabled: true,
    },
    businessOutcome: 'Online store with cart, checkout, and order management',
  },

  // ----- AGENCY SYSTEM TEMPLATES -----
  'agency-services': {
    id: 'agency-services',
    version: '1.0.0',
    systemType: 'agency',
    tables: [
      {
        name: 'leads',
        description: 'Sales inquiries',
        columns: ['id', 'business_id', 'name', 'email', 'phone', 'message', 'source'],
        critical: true,
      },
      {
        name: 'crm_leads',
        description: 'Sales pipeline',
        columns: ['id', 'user_id', 'contact_id', 'title', 'status', 'value', 'source'],
        critical: true,
      },
      {
        name: 'crm_contacts',
        description: 'Client database',
        columns: ['id', 'user_id', 'first_name', 'last_name', 'email', 'phone', 'company'],
        critical: true,
      },
    ],
    workflows: [
      {
        id: 'lead-qualification',
        name: 'Lead Qualification',
        triggerType: 'form_submit',
        description: 'Score and route new leads',
        requiredSteps: ['create_contact', 'create_lead', 'create_activity'],
      },
      {
        id: 'demo-booked',
        name: 'Demo Scheduled',
        triggerType: 'booking_created',
        description: 'Prep for demo after booking',
        requiredSteps: ['send_email', 'create_activity'],
      },
    ],
    intents: [
      {
        intent: 'contact.sales',
        label: 'Contact Sales',
        handler: 'create-lead',
        outcome: 'Sales lead captured',
      },
      {
        intent: 'demo.request',
        label: 'Book Demo',
        handler: 'create-booking',
        outcome: 'Demo scheduled',
      },
      {
        intent: 'quote.request',
        label: 'Request Quote',
        handler: 'create-lead',
        outcome: 'Quote request in pipeline',
      },
    ],
    roles: [
      {
        role: 'owner',
        permissions: ['manage_leads', 'view_analytics', 'manage_team'],
        description: 'Agency owner',
      },
      {
        role: 'sales',
        permissions: ['view_leads', 'update_lead_status', 'create_activities'],
        description: 'Sales team member',
      },
    ],
    defaults: {
      workflowsEnabled: true,
      crmPipeline: 'agency_sales',
      notificationsEnabled: true,
      analyticsEnabled: true,
    },
    crmPipeline: {
      name: 'Agency Sales Pipeline',
      stages: ['New Lead', 'Qualified', 'Demo Scheduled', 'Proposal Sent', 'Negotiating', 'Closed Won', 'Closed Lost'],
      defaultStage: 'New Lead',
    },
    businessOutcome: 'Lead generation with sales pipeline and demo scheduling',
  },

  // ----- CONTENT/BLOG SYSTEM TEMPLATES -----
  'content-blog': {
    id: 'content-blog',
    version: '1.0.0',
    systemType: 'content',
    tables: [
      {
        name: 'leads',
        description: 'Newsletter subscribers',
        columns: ['id', 'business_id', 'name', 'email', 'source'],
        critical: true,
      },
    ],
    workflows: [
      {
        id: 'welcome-email',
        name: 'Welcome Email',
        triggerType: 'form_submit',
        description: 'Send welcome email to new subscribers',
        requiredSteps: ['send_email'],
      },
    ],
    intents: [
      {
        intent: 'newsletter.subscribe',
        label: 'Subscribe',
        handler: 'create-lead',
        outcome: 'Subscriber added to list',
      },
      {
        intent: 'contact.submit',
        label: 'Contact',
        handler: 'create-lead',
        outcome: 'Message received',
      },
    ],
    roles: [
      {
        role: 'owner',
        permissions: ['manage_content', 'view_subscribers', 'view_analytics'],
        description: 'Content owner',
      },
    ],
    defaults: {
      workflowsEnabled: true,
      notificationsEnabled: true,
      analyticsEnabled: true,
    },
    businessOutcome: 'Newsletter signup with automated welcome sequence',
  },

  // ----- SAAS SYSTEM TEMPLATES -----
  'saas-landing': {
    id: 'saas-landing',
    version: '1.0.0',
    systemType: 'saas',
    tables: [
      {
        name: 'leads',
        description: 'Trial signups and demo requests',
        columns: ['id', 'business_id', 'name', 'email', 'source', 'metadata'],
        critical: true,
      },
      {
        name: 'user_subscriptions',
        description: 'Subscription management',
        columns: ['id', 'user_id', 'plan', 'status', 'stripe_subscription_id'],
        critical: true,
      },
    ],
    workflows: [
      {
        id: 'trial-welcome',
        name: 'Trial Welcome Sequence',
        triggerType: 'form_submit',
        description: 'Onboard new trial users',
        requiredSteps: ['send_email', 'create_activity'],
      },
      {
        id: 'trial-expiring',
        name: 'Trial Expiring',
        triggerType: 'scheduled',
        description: 'Notify users before trial ends',
        requiredSteps: ['send_email'],
      },
    ],
    intents: [
      {
        intent: 'trial.start',
        label: 'Start Free Trial',
        handler: 'create-lead',
        outcome: 'Trial account created',
      },
      {
        intent: 'demo.request',
        label: 'Book Demo',
        handler: 'create-booking',
        outcome: 'Demo scheduled',
      },
      {
        intent: 'pricing.select',
        label: 'Select Plan',
        handler: 'checkout-start',
        outcome: 'Checkout initiated',
      },
      {
        intent: 'newsletter.subscribe',
        label: 'Subscribe',
        handler: 'create-lead',
        outcome: 'Added to mailing list',
      },
    ],
    roles: [
      {
        role: 'owner',
        permissions: ['manage_subscriptions', 'view_analytics', 'manage_team'],
        description: 'SaaS owner',
      },
    ],
    defaults: {
      workflowsEnabled: true,
      crmPipeline: 'saas_pipeline',
      notificationsEnabled: true,
      analyticsEnabled: true,
    },
    crmPipeline: {
      name: 'SaaS Pipeline',
      stages: ['Trial', 'Active', 'At Risk', 'Churned', 'Expansion'],
      defaultStage: 'Trial',
    },
    businessOutcome: 'SaaS landing with trial signups and subscription management',
  },
};

/**
 * Get manifest for a template ID
 */
export function getTemplateManifest(templateId: string): TemplateManifest | undefined {
  return templateManifests[templateId];
}

/**
 * Get default manifest for a system type (when no specific template manifest exists)
 */
export function getDefaultManifestForSystem(systemType: BusinessSystemType): TemplateManifest {
  const defaults: Record<BusinessSystemType, string> = {
    booking: 'salon-booking',
    portfolio: 'creator-portfolio',
    store: 'ecommerce-store',
    agency: 'agency-services',
    content: 'content-blog',
    saas: 'saas-landing',
  };
  
  return templateManifests[defaults[systemType]] || templateManifests['salon-booking'];
}

/**
 * Validate that a manifest has all required fields
 */
export function validateManifest(manifest: TemplateManifest): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!manifest.id) errors.push('Missing manifest ID');
  if (!manifest.version) errors.push('Missing version');
  if (!manifest.systemType) errors.push('Missing system type');
  if (!manifest.tables.length) errors.push('No tables defined');
  if (!manifest.intents.length) errors.push('No intents defined');
  if (!manifest.businessOutcome) errors.push('No business outcome defined');
  
  // Check critical tables have required columns
  manifest.tables.filter(t => t.critical).forEach(table => {
    if (!table.columns.includes('id')) {
      errors.push(`Critical table ${table.name} missing 'id' column`);
    }
  });
  
  // Check intents have handlers
  manifest.intents.forEach(intent => {
    if (!intent.handler) {
      errors.push(`Intent ${intent.intent} missing handler`);
    }
  });
  
  return { valid: errors.length === 0, errors };
}

/**
 * Check if all required tables exist for a manifest
 * This would query Supabase to verify table existence
 */
export function getRequiredTables(manifest: TemplateManifest): string[] {
  return manifest.tables.filter(t => t.critical).map(t => t.name);
}

/**
 * Get all intents required by a manifest
 */
export function getRequiredIntents(manifest: TemplateManifest): string[] {
  return manifest.intents.map(i => i.intent);
}
