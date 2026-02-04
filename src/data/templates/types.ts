/**
 * Business Systems - Type Definitions
 * Templates are now "Systems" - ready-to-run business solutions
 * 
 * Currently only Booking System is active
 */

// Legacy category for backwards compatibility
export type LayoutCategory = "salon";  // Only salon booking is supported

// NEW: Business System Types
export type BusinessSystemType =
  | "booking";     // Booking Business (restaurant, salon, contractor)

export interface BusinessSystem {
  id: BusinessSystemType;
  name: string;
  tagline: string;
  description: string;
  icon: string;  // Emoji for quick visual
  color: string; // Tailwind color class
  templateCategories: LayoutCategory[];  // Maps to existing templates
  features: string[];
  intents: string[];  // Pre-wired intents for this system
}

export interface LayoutTemplate {
  id: string;
  name: string;
  category: LayoutCategory;
  description: string;
  thumbnail?: string;
  code: string;
  tags?: string[];
  // NEW: System-level metadata
  systemType?: BusinessSystemType;
  systemName?: string;  // e.g., "Restaurant Booking System"
}

// Business Systems Configuration
// All intents use ONLY CoreIntents: contact.submit, newsletter.subscribe, booking.create, quote.request
export const businessSystems: BusinessSystem[] = [
  {
    id: "booking",
    name: "Salon Booking",
    tagline: "Launch your salon booking system in minutes",
    description: "Perfect for salons, spas, and beauty businesses. Includes calendar, appointments, and client management.",
    icon: "💇",
    color: "bg-pink-500",
    templateCategories: ["salon"],
    features: ["Online booking", "Calendar sync", "Client management", "Email notifications", "Service menu"],
    intents: ["booking.create", "contact.submit", "newsletter.subscribe"]
  }
];

// Helper to get system by ID
export const getSystemById = (id: BusinessSystemType): BusinessSystem | undefined => {
  return businessSystems.find(s => s.id === id);
};

// Helper to get templates for a system
export const getTemplatesForSystem = (systemId: BusinessSystemType, allTemplates: LayoutTemplate[]): LayoutTemplate[] => {
  const system = getSystemById(systemId);
  if (!system) return [];
  return allTemplates.filter(t => system.templateCategories.includes(t.category));
};
