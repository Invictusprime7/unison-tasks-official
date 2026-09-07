/**
 * Wizard Catalog — the static vocabulary of the System Launcher wizard.
 *
 * Guidebook rule: the wizard UI is a *selection surface only*. Everything here
 * is presentation metadata plus the deterministic mappings the canonical
 * pipeline needs (business model, industry overlay, template composition
 * resolution). No generation logic, no VFS writes, no AI calls.
 */

import {
  type BusinessSystemType,
  type LayoutCategory,
} from "@/data/templates/types";
import { getCompositionsBySystemType } from "@/sections/templates";
import type { BusinessModel, IndustryOverlay } from "@/types/playground";

// ── Steps ───────────────────────────────────────────────────────────────────

export type WizardStep = "industry" | "questions" | "templates" | "aesthetic";

export const STEP_META: {
  key: WizardStep;
  num: number;
  label: string;
  sublabel: string;
}[] = [
  { key: "industry", num: 1, label: "Industry", sublabel: "What you do" },
  { key: "questions", num: 2, label: "Goals", sublabel: "Your needs" },
  { key: "templates", num: 3, label: "Templates", sublabel: "Pick a base" },
  { key: "aesthetic", num: 4, label: "Launch", sublabel: "Name & style" },
];

// ── Answer vocabulary ───────────────────────────────────────────────────────

export type PrimaryGoal =
  | "collect_leads"
  | "book_appointments"
  | "sell_offers"
  | "showcase_work"
  | "drive_calls"
  | "grow_email_list";

export type CustomerNeed =
  | "request_quote"
  | "book_service"
  | "buy_offer"
  | "fill_form"
  | "browse_services";

export type PageChoice =
  | "about"
  | "services"
  | "pricing"
  | "gallery"
  | "faq"
  | "contact"
  | "booking"
  | "checkout"
  | "blog";

export const PRIMARY_GOALS: {
  id: PrimaryGoal;
  label: string;
  icon: string;
  description: string;
}[] = [
  { id: "collect_leads", label: "Collect Leads", icon: "📩", description: "Capture contact info and grow your pipeline" },
  { id: "book_appointments", label: "Book Appointments", icon: "📅", description: "Let clients schedule sessions online" },
  { id: "sell_offers", label: "Sell Offers", icon: "💰", description: "Sell products, packages, or services" },
  { id: "showcase_work", label: "Showcase Work", icon: "🎨", description: "Display your portfolio and past projects" },
  { id: "drive_calls", label: "Drive Calls", icon: "📞", description: "Get prospects to call or message you" },
  { id: "grow_email_list", label: "Grow Email List", icon: "📧", description: "Build a subscriber list for marketing" },
];

export const CUSTOMER_NEEDS: { id: CustomerNeed; label: string; icon: string }[] = [
  { id: "request_quote", label: "Request a quote", icon: "📋" },
  { id: "book_service", label: "Book a service", icon: "🗓️" },
  { id: "buy_offer", label: "Buy an offer/package", icon: "🛒" },
  { id: "fill_form", label: "Fill out a form", icon: "📝" },
  { id: "browse_services", label: "Browse services/products", icon: "🔍" },
];

export const PAGE_CHOICES: { id: PageChoice; label: string; icon: string }[] = [
  { id: "about", label: "About", icon: "ℹ️" },
  { id: "services", label: "Services", icon: "⚙️" },
  { id: "pricing", label: "Pricing", icon: "💲" },
  { id: "gallery", label: "Gallery", icon: "🖼️" },
  { id: "faq", label: "FAQ", icon: "❓" },
  { id: "contact", label: "Contact", icon: "✉️" },
  { id: "booking", label: "Booking", icon: "📅" },
  { id: "checkout", label: "Checkout", icon: "🛍️" },
  { id: "blog", label: "Blog", icon: "📰" },
];

// ── Canonical pipeline mappings ─────────────────────────────────────────────

export const SYSTEM_TO_BUSINESS_MODEL: Record<BusinessSystemType, BusinessModel> = {
  booking: "appointment_service",
  saas: "saas_digital",
  agency: "quote_lead",
  portfolio: "portfolio_creator",
  store: "ecommerce",
  content: "general",
};

export const SYSTEM_TO_INDUSTRY_OVERLAY: Record<BusinessSystemType, IndustryOverlay> = {
  booking: "salon",
  saas: "saas" as IndustryOverlay,
  agency: "agency",
  portfolio: "portfolio" as IndustryOverlay,
  store: "ecommerce",
  content: "nonprofit",
};

export const GOAL_TO_NEEDS: Record<
  PrimaryGoal,
  { needsBooking?: boolean; sellsProducts?: boolean; wantsLeadCapture?: boolean }
> = {
  collect_leads: { wantsLeadCapture: true },
  book_appointments: { needsBooking: true },
  sell_offers: { sellsProducts: true },
  showcase_work: {},
  drive_calls: { wantsLeadCapture: true },
  grow_email_list: { wantsLeadCapture: true },
};

export const INDUSTRY_DISPLAY: Record<string, { label: string; icon: string }> = {
  salon: { label: "Salon & Beauty", icon: "💇" },
  "local-service": { label: "Local Service", icon: "🔧" },
  coaching: { label: "Coaching & Consulting", icon: "🎯" },
  restaurant: { label: "Restaurant & Food", icon: "🍽️" },
  ecommerce: { label: "E-Commerce", icon: "🛍️" },
  fitness: { label: "Fitness & Wellness", icon: "💪" },
  legal: { label: "Legal", icon: "⚖️" },
  realestate: { label: "Real Estate", icon: "🏠" },
  photography: { label: "Photography", icon: "📷" },
  universal: { label: "Universal", icon: "✦" },
  saas: { label: "SaaS & Software", icon: "🚀" },
  agency: { label: "Agency & Creative", icon: "🏢" },
  portfolio: { label: "Portfolio & Creative", icon: "🎨" },
  store: { label: "Store & E-Commerce", icon: "🛍️" },
};

export const TEMPLATE_INDUSTRY_TO_CATEGORY: Partial<Record<string, LayoutCategory>> = {
  salon: "salon",
  "local-service": "contractor",
  coaching: "coaching",
  restaurant: "restaurant",
  ecommerce: "store",
  realestate: "realestate",
  photography: "portfolio",
  legal: "agency",
  fitness: "coaching",
  saas: "saas",
  agency: "agency",
  portfolio: "portfolio",
  store: "store",
};

export const INDUSTRY_CARDS: {
  systemId: BusinessSystemType;
  icon: string;
  label: string;
  tagline: string;
  gradient: string;
  glowColor: string;
}[] = [
  {
    systemId: "booking",
    icon: "📅",
    label: "Booking & Services",
    tagline: "Salons, spas, restaurants, contractors",
    gradient: "from-pink-500/20 via-transparent to-transparent",
    glowColor: "rgba(236,72,153,0.15)",
  },
  {
    systemId: "saas",
    icon: "🚀",
    label: "SaaS & Software",
    tagline: "Products, platforms, developer tools",
    gradient: "from-blue-500/20 via-transparent to-transparent",
    glowColor: "rgba(59,130,246,0.15)",
  },
  {
    systemId: "agency",
    icon: "🏢",
    label: "Agency & Consulting",
    tagline: "Creative studios, legal, real estate",
    gradient: "from-purple-500/20 via-transparent to-transparent",
    glowColor: "rgba(168,85,247,0.15)",
  },
  {
    systemId: "portfolio",
    icon: "🎨",
    label: "Portfolio & Creative",
    tagline: "Designers, photographers, artists",
    gradient: "from-amber-500/20 via-transparent to-transparent",
    glowColor: "rgba(245,158,11,0.15)",
  },
  {
    systemId: "store",
    icon: "🛍️",
    label: "Store & E-Commerce",
    tagline: "Products, retail, marketplace",
    gradient: "from-emerald-500/20 via-transparent to-transparent",
    glowColor: "rgba(16,185,129,0.15)",
  },
  {
    systemId: "content",
    icon: "📝",
    label: "Content & Media",
    tagline: "Blogs, newsletters, nonprofits",
    gradient: "from-orange-500/20 via-transparent to-transparent",
    glowColor: "rgba(249,115,22,0.15)",
  },
];

// ── Template cards ──────────────────────────────────────────────────────────

export interface TemplateCardData {
  id: string;
  label: string;
  description: string;
  /** Covers both IndustryTag and composition industry values. */
  industry: string;
  sectionTypes: string[];
  traits: string[];
  themeColors?: { primary: string; secondary: string };
}

/**
 * Authority rule #2: every wizard template card must resolve to a registered
 * TemplateComposition. No synthetic fallback cards, ever.
 */
export function buildCompositionCards(systemId: BusinessSystemType): TemplateCardData[] {
  return getCompositionsBySystemType(systemId).map((c) => ({
    id: c.id,
    label: c.name,
    description: c.description,
    industry: c.industry,
    sectionTypes: c.sections.map((s) => s.type),
    traits: c.tags && c.tags.length > 0 ? c.tags : [c.category],
    themeColors: c.theme
      ? { primary: c.theme.colors.primary, secondary: c.theme.colors.secondary }
      : undefined,
  }));
}

// ── Deterministic per-system preselects ─────────────────────────────────────

export interface LauncherPreselect {
  primaryGoal: PrimaryGoal;
  customerNeeds: CustomerNeed[];
  pages: PageChoice[];
}

export function uniqueValues<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values));
}

/**
 * Every business system gets a complete, industry-faithful preselection so the
 * launcher journey ends in a coherent first preview. These mirror the contracts
 * in `src/platform/core/industryIntentProfiles.ts`.
 */
export const LAUNCHER_PRESELECTS: Record<
  BusinessSystemType,
  LauncherPreselect & { preferredIndustry?: string }
> = {
  booking: {
    primaryGoal: "book_appointments",
    customerNeeds: ["book_service", "browse_services", "fill_form"],
    pages: ["about", "services", "pricing", "gallery", "booking", "contact", "faq"],
    preferredIndustry: "salon",
  },
  saas: {
    primaryGoal: "collect_leads",
    customerNeeds: ["fill_form", "browse_services"],
    pages: ["about", "services", "pricing", "faq", "contact", "blog"],
    preferredIndustry: "saas",
  },
  agency: {
    primaryGoal: "collect_leads",
    customerNeeds: ["request_quote", "fill_form", "browse_services"],
    pages: ["about", "services", "pricing", "gallery", "contact", "faq"],
    preferredIndustry: "agency",
  },
  portfolio: {
    primaryGoal: "showcase_work",
    customerNeeds: ["request_quote", "fill_form"],
    pages: ["about", "gallery", "services", "contact"],
    preferredIndustry: "portfolio",
  },
  store: {
    primaryGoal: "sell_offers",
    customerNeeds: ["buy_offer", "browse_services"],
    pages: ["about", "services", "pricing", "gallery", "checkout", "contact", "faq"],
    preferredIndustry: "ecommerce",
  },
  content: {
    primaryGoal: "grow_email_list",
    customerNeeds: ["fill_form", "browse_services"],
    pages: ["about", "blog", "services", "contact"],
    preferredIndustry: "nonprofit",
  },
};

export function getDefaultTemplateCardFor(
  systemId: BusinessSystemType | null,
): TemplateCardData | null {
  if (!systemId) return null;
  const cards = buildCompositionCards(systemId);
  if (cards.length === 0) return null;
  const preferred = LAUNCHER_PRESELECTS[systemId]?.preferredIndustry;
  if (preferred) {
    const match =
      cards.find((card) => card.id === `${preferred}-premium`) ||
      cards.find((card) => card.industry === preferred);
    if (match) return match;
  }
  return cards[0];
}
