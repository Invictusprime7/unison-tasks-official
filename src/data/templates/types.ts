/**
 * Business Systems - Type Definitions
 * Templates are now "Systems" - ready-to-run business solutions
 */

// Legacy category for backwards compatibility
export type LayoutCategory =
  | "landing"
  | "portfolio"
  | "restaurant"
  | "ecommerce"
  | "blog"
  | "contractor"
  | "agency"
  | "startup"
  | "salon";  // Added for beauty/spa industry

// NEW: Business System Types
export type BusinessSystemType =
  | "booking"      // Booking Business (restaurant, salon, contractor)
  | "portfolio"    // Portfolio + Clients (creative, agency)
  | "store"        // Online Store (ecommerce)
  | "agency"       // Agency/Services (agency, startup)
  | "content"      // Content/Blog (blog, landing)
  | "saas";        // SaaS/Startup (landing, startup)

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
    name: "Booking Business",
    tagline: "Launch your booking system in minutes",
    description: "Perfect for restaurants, salons, contractors, and service businesses. Includes calendar, appointments, and lead capture.",
    icon: "📅",
    color: "bg-blue-500",
    templateCategories: ["restaurant", "contractor", "salon"],
    features: ["Online booking", "Calendar sync", "Lead capture", "Email notifications", "Payment collection"],
    intents: ["booking.create", "contact.submit", "quote.request", "newsletter.subscribe"]
  },
  {
    id: "portfolio",
    name: "Portfolio + Clients",
    tagline: "Showcase work, capture clients",
    description: "For creatives, designers, photographers, and freelancers. Display portfolio, collect inquiries, manage projects.",
    icon: "🎨",
    color: "bg-purple-500",
    templateCategories: ["portfolio", "agency"],
    features: ["Project gallery", "Client inquiries", "Testimonials", "Case studies", "Contact forms"],
    intents: ["contact.submit", "quote.request", "newsletter.subscribe"]
  },
  {
    id: "store",
    name: "Online Store",
    tagline: "Start selling today",
    description: "Launch your ecommerce store with products, cart, and checkout. Connected to payment processing.",
    icon: "🛍️",
    color: "bg-green-500",
    templateCategories: ["ecommerce"],
    features: ["Product catalog", "Shopping cart", "Checkout flow", "Order management", "Inventory tracking"],
    intents: ["newsletter.subscribe", "contact.submit"]
  },
  {
    id: "agency",
    name: "Agency & Services",
    tagline: "Win clients, close deals",
    description: "For marketing agencies, consultants, and B2B services. Lead generation, case studies, and sales pipelines.",
    icon: "💼",
    color: "bg-orange-500",
    templateCategories: ["agency", "startup"],
    features: ["Service pages", "Lead capture", "Case studies", "Team profiles", "CRM integration"],
    intents: ["contact.submit", "quote.request", "booking.create"]
  },
  {
    id: "content",
    name: "Content & Blog",
    tagline: "Build your audience",
    description: "For writers, influencers, and content creators. Blog, newsletter, and audience growth tools.",
    icon: "✍️",
    color: "bg-pink-500",
    templateCategories: ["blog", "landing"],
    features: ["Blog posts", "Newsletter signup", "Content categories", "Social sharing", "SEO optimized"],
    intents: ["newsletter.subscribe", "contact.submit"]
  },
  {
    id: "saas",
    name: "SaaS & Startup",
    tagline: "Launch your product",
    description: "For tech startups and SaaS products. Landing pages, pricing tables, and user acquisition.",
    icon: "🚀",
    color: "bg-indigo-500",
    templateCategories: ["landing", "startup"],
    features: ["Hero sections", "Feature grids", "Pricing tables", "Testimonials", "CTA optimization"],
    intents: ["newsletter.subscribe", "contact.submit", "booking.create"]
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
