/**
 * Wizard Prompt Classifier — Intelligent Lead-Gen & Intent Extraction.
 *
 * Parses a creator's natural language business vision or prompt into structured
 * canonical launcher selections:
 *   - Industry & BusinessSystemType
 *   - Extracted business name (if mentioned)
 *   - Primary business goal & customer needs
 *   - Recommended page selections
 *   - Aesthetic / theme preset recommendation
 *   - Match confidence score (0 to 1)
 */

import type { BusinessSystemType } from "@/data/templates/types";
import { THEME_PRESETS, type ThemePreset } from "@/components/onboarding/themePresets";
import {
  CUSTOMER_NEEDS,
  PRIMARY_GOALS,
  getIndustryCustomerNeeds,
  getIndustryDefaultPageChoices,
  getIndustryPrimaryGoal,
  type CustomerNeed,
  type PageChoice,
  type PrimaryGoal,
} from "./wizardCatalog";

export interface WizardPromptAnalysis {
  industry: string;
  systemId: BusinessSystemType;
  businessName: string | null;
  primaryGoal: PrimaryGoal;
  customerNeeds: CustomerNeed[];
  selectedPages: PageChoice[];
  themePresetId: string;
  confidence: number;
  matchedKeywords: string[];
  summary: string;
}

interface IndustryRule {
  industry: string;
  systemId: BusinessSystemType;
  keywords: string[];
  suggestedTheme: string;
  defaultGoal: PrimaryGoal;
}

const INDUSTRY_RULES: IndustryRule[] = [
  {
    industry: "saas",
    systemId: "saas",
    keywords: ["saas", "software", "api", "platform", "cloud", "developer", "tool", "analytics", "app", "dashboard", "b2b", "tech", "ai product"],
    suggestedTheme: "futuristic",
    defaultGoal: "collect_leads",
  },
  {
    industry: "salon",
    systemId: "booking",
    keywords: ["salon", "hair", "spa", "nails", "beauty", "massage", "barber", "skincare", "stylist", "lashes", "wellness", "aesthetics"],
    suggestedTheme: "organic",
    defaultGoal: "book_appointments",
  },
  {
    industry: "restaurant",
    systemId: "booking",
    keywords: ["restaurant", "food", "dining", "menu", "cafe", "bistro", "bakery", "bar", "cocktails", "chef", "catering", "kitchen", "brunch"],
    suggestedTheme: "warm",
    defaultGoal: "book_appointments",
  },
  {
    industry: "contractor",
    systemId: "booking",
    keywords: ["contractor", "construction", "roofing", "plumbing", "builder", "hvac", "electrician", "carpenter", "renovation", "remodel", "handyman", "trades"],
    suggestedTheme: "bold",
    defaultGoal: "collect_leads",
  },
  {
    industry: "local-service",
    systemId: "booking",
    keywords: ["local service", "cleaning", "landscaping", "pest control", "auto", "detailing", "moving", "security", "lawn", "maintenance"],
    suggestedTheme: "modern",
    defaultGoal: "collect_leads",
  },
  {
    industry: "real-estate",
    systemId: "agency",
    keywords: ["real estate", "realtor", "property", "listings", "broker", "homes", "apartments", "condos", "housing", "luxury estates", "mortgage"],
    suggestedTheme: "editorial",
    defaultGoal: "collect_leads",
  },
  {
    industry: "ecommerce",
    systemId: "store",
    keywords: ["store", "shop", "ecommerce", "e-commerce", "retail", "products", "apparel", "clothing", "merch", "cart", "checkout", "fashion", "goods"],
    suggestedTheme: "bold",
    defaultGoal: "sell_offers",
  },
  {
    industry: "portfolio",
    systemId: "portfolio",
    keywords: ["portfolio", "photographer", "photography", "artist", "designer", "creative director", "videographer", "freelance", "writer", "architect"],
    suggestedTheme: "minimalist",
    defaultGoal: "showcase_work",
  },
  {
    industry: "coaching",
    systemId: "booking",
    keywords: ["coaching", "consulting", "consultant", "coach", "mentor", "advisory", "trainer", "therapy", "counseling", "executive coach"],
    suggestedTheme: "editorial",
    defaultGoal: "book_appointments",
  },
  {
    industry: "agency",
    systemId: "agency",
    keywords: ["agency", "marketing", "creative agency", "pr", "advertising", "digital agency", "studio", "branding", "growth agency"],
    suggestedTheme: "editorial",
    defaultGoal: "collect_leads",
  },
  {
    industry: "nonprofit",
    systemId: "content",
    keywords: ["nonprofit", "charity", "ngo", "foundation", "donate", "cause", "community", "volunteer", "mission", "advocacy"],
    suggestedTheme: "warm",
    defaultGoal: "collect_leads",
  },
];

function extractBusinessName(prompt: string): string | null {
  // Explicit naming patterns: "named Apex Cloud", "called Bella Tavola", "branded as Horizon"
  const explicitPatterns = [
    /(?:called|named|branded as|startup named|business named|company named)\s+["']?([A-Z][A-Za-z0-9\s&'.-]{1,30}?)["']?(?:\s+with|\s+that|\s+for|\s+in|\s+at|[.,;]|$)/i,
    /["']([A-Z][A-Za-z0-9\s&'.-]{1,30})["']\s+(?:is a|is an|website|app|platform|studio|salon|shop)/i,
    /^([A-Z][A-Za-z0-9\s&'.-]{1,30})\s*[-–—:]\s*(?:a|an)\s+/i,
    /(?:for|by)\s+["']([A-Z][A-Za-z0-9\s&'.-]{1,30})["']/i,
  ];

  for (const re of explicitPatterns) {
    const match = prompt.match(re);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (!/^(a|an|the|my|our|website|platform|online|business|store|company|cloud|software)$/i.test(candidate)) {
        return candidate;
      }
    }
  }
  return null;
}

export function classifyPromptForWizard(rawPrompt: string): WizardPromptAnalysis | null {
  const text = String(rawPrompt || "").trim().toLowerCase();
  if (text.length < 3) return null;

  let bestRule = INDUSTRY_RULES[0];
  let maxScore = 0;
  let matched: string[] = [];

  for (const rule of INDUSTRY_RULES) {
    let score = 0;
    const ruleMatches: string[] = [];
    for (const kw of rule.keywords) {
      if (text.includes(kw)) {
        score += kw.length > 5 ? 2 : 1;
        ruleMatches.push(kw);
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestRule = rule;
      matched = ruleMatches;
    }
  }

  // Calculate confidence
  const confidence = maxScore >= 4 ? 0.96 : maxScore >= 2 ? 0.84 : maxScore === 1 ? 0.72 : 0.55;
  const businessName = extractBusinessName(rawPrompt);
  const primaryGoal = getIndustryPrimaryGoal(bestRule.industry) || bestRule.defaultGoal;
  const customerNeeds = getIndustryCustomerNeeds(bestRule.industry);
  const selectedPages = getIndustryDefaultPageChoices(bestRule.industry);

  return {
    industry: bestRule.industry,
    systemId: bestRule.systemId,
    businessName,
    primaryGoal,
    customerNeeds,
    selectedPages,
    themePresetId: bestRule.suggestedTheme,
    confidence,
    matchedKeywords: matched,
    summary: `Configured for ${bestRule.industry.toUpperCase()} with ${bestRule.systemId} system and ${selectedPages.length + 1} pages.`,
  };
}
