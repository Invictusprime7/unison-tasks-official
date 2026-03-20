/**
 * Section Variant Registry
 * 
 * Central registry mapping each section type to its available layout variants.
 * Used by the TemplateCustomizerPanel to present variant thumbnails and
 * by the PageRenderer to resolve the correct component.
 */

import type { SectionType } from '../types';
import type { SectionVariant, VariantId, VariantRegistry, ActiveVariantMap } from './types';

// JSX layout templates for live preview swapping via VFS
import {
  heroCenteredJSX, heroSplitImageJSX, heroFullBleedJSX,
  ctaCenteredJSX, ctaGradientBannerJSX, ctaSplitCardJSX,
  navbarStandardJSX, navbarCenteredLogoJSX, navbarMinimalDarkJSX,
  featuresGridJSX, featuresIconLeftJSX, featuresMinimalCenteredJSX,
  servicesCardGridJSX, servicesAlternatingJSX, servicesCompactListJSX,
  contactCenteredJSX, contactSplitCardJSX, contactMinimalInlineJSX,
  footerColumnsJSX, footerCenteredMinimalJSX, footerDarkBandJSX,
  // Pricing
  pricingColumnsJSX, pricingTableJSX, pricingMinimalJSX,
  // Testimonials
  testimonialsGridJSX, testimonialsSpotlightJSX, testimonialsMinimalJSX,
  // Team
  teamGridJSX, teamCompactJSX, teamShowcaseJSX,
  // Gallery
  galleryMasonryJSX, galleryGridJSX, galleryMinimalJSX,
  // FAQ
  faqAccordionJSX, faqGridJSX, faqMinimalJSX,
  // Stats
  statsRowJSX, statsCardsJSX, statsMinimalJSX,
  // About
  aboutSplitJSX, aboutCenteredJSX, aboutTimelineJSX,
  // Logo Cloud
  logoCloudGridJSX, logoCloudScrollJSX, logoCloudMinimalJSX,
} from './jsxTemplates';

// Hero variants
import { HeroCentered } from './hero/HeroCentered';
import { HeroSplitImage } from './hero/HeroSplitImage';
import { HeroFullBleed } from './hero/HeroFullBleed';

// CTA variants
import { CTACentered } from './cta/CTACentered';
import { CTAGradientBanner } from './cta/CTAGradientBanner';
import { CTASplitCard } from './cta/CTASplitCard';

// Navbar variants
import { NavbarStandard } from './navbar/NavbarStandard';
import { NavbarCenteredLogo } from './navbar/NavbarCenteredLogo';
import { NavbarMinimalDark } from './navbar/NavbarMinimalDark';

// Features variants
import { FeaturesGrid } from './features/FeaturesGrid';
import { FeaturesIconLeft } from './features/FeaturesIconLeft';
import { FeaturesMinimalCentered } from './features/FeaturesMinimalCentered';

// Services variants
import { ServicesCardGrid } from './services/ServicesCardGrid';
import { ServicesAlternating } from './services/ServicesAlternating';
import { ServicesCompactList } from './services/ServicesCompactList';

// Contact variants
import { ContactCentered } from './contact/ContactCentered';
import { ContactSplitCard } from './contact/ContactSplitCard';
import { ContactMinimalInline } from './contact/ContactMinimalInline';

// Footer variants
import { FooterColumns } from './footer/FooterColumns';
import { FooterCenteredMinimal } from './footer/FooterCenteredMinimal';
import { FooterDarkBand } from './footer/FooterDarkBand';

// Pricing variants
import { PricingColumns } from './pricing/PricingColumns';
import { PricingTable } from './pricing/PricingTable';
import { PricingMinimal } from './pricing/PricingMinimal';

// Testimonials variants
import { TestimonialsGrid } from './testimonials/TestimonialsGrid';
import { TestimonialsSpotlight } from './testimonials/TestimonialsSpotlight';
import { TestimonialsMinimal } from './testimonials/TestimonialsMinimal';

// Team variants
import { TeamGrid } from './team/TeamGrid';
import { TeamCompact } from './team/TeamCompact';
import { TeamShowcase } from './team/TeamShowcase';

// Gallery variants
import { GalleryMasonry } from './gallery/GalleryMasonry';
import { GalleryGrid } from './gallery/GalleryGrid';
import { GalleryMinimal } from './gallery/GalleryMinimal';

// FAQ variants
import { FAQAccordion } from './faq/FAQAccordion';
import { FAQGrid } from './faq/FAQGrid';
import { FAQMinimal } from './faq/FAQMinimal';

// Stats variants
import { StatsRow } from './stats/StatsRow';
import { StatsCards } from './stats/StatsCards';
import { StatsMinimal } from './stats/StatsMinimal';

// About variants
import { AboutSplit } from './about/AboutSplit';
import { AboutCentered } from './about/AboutCentered';
import { AboutTimeline } from './about/AboutTimeline';

// Logo Cloud variants
import { LogoCloudGrid } from './logo-cloud/LogoCloudGrid';
import { LogoCloudScroll } from './logo-cloud/LogoCloudScroll';
import { LogoCloudMinimal } from './logo-cloud/LogoCloudMinimal';

// ============================================================================
// Registry Definition
// ============================================================================

const VARIANT_REGISTRY: VariantRegistry = {
  hero: [
    {
      id: 'hero:centered',
      sectionType: 'hero',
      slug: 'centered',
      name: 'Centered',
      description: 'Classic centered headline with CTA buttons below',
      component: HeroCentered,
      thumbnail: '/variants/hero-centered.svg',
      tags: ['classic', 'clean', 'minimal'],
      isDefault: true,
      renderJSX: heroCenteredJSX,
    },
    {
      id: 'hero:split-image',
      sectionType: 'hero',
      slug: 'split-image',
      name: 'Split Image',
      description: 'Two-column layout with text and hero image side by side',
      component: HeroSplitImage,
      thumbnail: '/variants/hero-split-image.svg',
      tags: ['modern', 'saas', 'image'],
      renderJSX: heroSplitImageJSX,
    },
    {
      id: 'hero:full-bleed',
      sectionType: 'hero',
      slug: 'full-bleed',
      name: 'Full Bleed',
      description: 'Full-screen background with centered text overlay',
      component: HeroFullBleed,
      thumbnail: '/variants/hero-full-bleed.svg',
      tags: ['bold', 'immersive', 'dramatic'],
      renderJSX: heroFullBleedJSX,
    },
  ],

  cta: [
    {
      id: 'cta:centered',
      sectionType: 'cta',
      slug: 'centered',
      name: 'Centered',
      description: 'Clean centered layout with headline and buttons',
      component: CTACentered,
      thumbnail: '/variants/cta-centered.svg',
      tags: ['clean', 'minimal'],
      isDefault: true,
      renderJSX: ctaCenteredJSX,
    },
    {
      id: 'cta:gradient-banner',
      sectionType: 'cta',
      slug: 'gradient-banner',
      name: 'Gradient Banner',
      description: 'Bold gradient background with high-contrast text',
      component: CTAGradientBanner,
      thumbnail: '/variants/cta-gradient-banner.svg',
      tags: ['bold', 'colorful', 'immersive'],
      renderJSX: ctaGradientBannerJSX,
    },
    {
      id: 'cta:split-card',
      sectionType: 'cta',
      slug: 'split-card',
      name: 'Split Card',
      description: 'Asymmetric two-column card layout',
      component: CTASplitCard,
      thumbnail: '/variants/cta-split-card.svg',
      tags: ['modern', 'card', 'asymmetric'],
      renderJSX: ctaSplitCardJSX,
    },
  ],

  navbar: [
    {
      id: 'navbar:standard',
      sectionType: 'navbar',
      slug: 'standard',
      name: 'Standard',
      description: 'Classic horizontal navbar with brand and CTA',
      component: NavbarStandard,
      thumbnail: '/variants/navbar-standard.svg',
      tags: ['classic', 'clean'],
      isDefault: true,
      renderJSX: navbarStandardJSX,
    },
    {
      id: 'navbar:centered-logo',
      sectionType: 'navbar',
      slug: 'centered-logo',
      name: 'Centered Logo',
      description: 'Brand centered with links split on either side',
      component: NavbarCenteredLogo,
      thumbnail: '/variants/navbar-centered-logo.svg',
      tags: ['editorial', 'elegant'],
      renderJSX: navbarCenteredLogoJSX,
    },
    {
      id: 'navbar:minimal-dark',
      sectionType: 'navbar',
      slug: 'minimal-dark',
      name: 'Minimal Dark',
      description: 'Dark background with pill-shaped CTA',
      component: NavbarMinimalDark,
      thumbnail: '/variants/navbar-minimal-dark.svg',
      tags: ['dark', 'modern', 'minimal'],
      renderJSX: navbarMinimalDarkJSX,
    },
  ],

  features: [
    {
      id: 'features:grid',
      sectionType: 'features',
      slug: 'grid',
      name: 'Grid',
      description: 'Classic card grid with icons and descriptions',
      component: FeaturesGrid,
      thumbnail: '/variants/features-grid.svg',
      tags: ['classic', 'clean', 'cards'],
      isDefault: true,
      renderJSX: featuresGridJSX,
    },
    {
      id: 'features:icon-left',
      sectionType: 'features',
      slug: 'icon-left',
      name: 'Icon Left',
      description: 'Horizontal rows with icons on the left',
      component: FeaturesIconLeft,
      thumbnail: '/variants/features-icon-left.svg',
      tags: ['horizontal', 'list', 'compact'],
      renderJSX: featuresIconLeftJSX,
    },
    {
      id: 'features:minimal-centered',
      sectionType: 'features',
      slug: 'minimal-centered',
      name: 'Minimal Centered',
      description: 'Clean centered layout with icon circles',
      component: FeaturesMinimalCentered,
      thumbnail: '/variants/features-minimal-centered.svg',
      tags: ['minimal', 'centered', 'elegant'],
      renderJSX: featuresMinimalCenteredJSX,
    },
  ],

  services: [
    {
      id: 'services:card-grid',
      sectionType: 'services',
      slug: 'card-grid',
      name: 'Card Grid',
      description: 'Service cards with badge, price, and CTA',
      component: ServicesCardGrid,
      thumbnail: '/variants/services-card-grid.svg',
      tags: ['cards', 'pricing', 'detailed'],
      isDefault: true,
      renderJSX: servicesCardGridJSX,
    },
    {
      id: 'services:alternating',
      sectionType: 'services',
      slug: 'alternating',
      name: 'Alternating',
      description: 'Alternating left-right rows with images',
      component: ServicesAlternating,
      thumbnail: '/variants/services-alternating.svg',
      tags: ['alternating', 'showcase', 'image'],
      renderJSX: servicesAlternatingJSX,
    },
    {
      id: 'services:compact-list',
      sectionType: 'services',
      slug: 'compact-list',
      name: 'Compact List',
      description: 'Stacked list rows with icon and price',
      component: ServicesCompactList,
      thumbnail: '/variants/services-compact-list.svg',
      tags: ['list', 'compact', 'minimal'],
      renderJSX: servicesCompactListJSX,
    },
  ],

  contact: [
    {
      id: 'contact:centered',
      sectionType: 'contact',
      slug: 'centered',
      name: 'Centered',
      description: 'Classic centered contact form',
      component: ContactCentered,
      thumbnail: '/variants/contact-centered.svg',
      tags: ['classic', 'clean', 'form'],
      isDefault: true,
      renderJSX: contactCenteredJSX,
    },
    {
      id: 'contact:split-card',
      sectionType: 'contact',
      slug: 'split-card',
      name: 'Split Card',
      description: 'Form on the left, contact info card on the right',
      component: ContactSplitCard,
      thumbnail: '/variants/contact-split-card.svg',
      tags: ['split', 'card', 'modern'],
      renderJSX: contactSplitCardJSX,
    },
    {
      id: 'contact:minimal-inline',
      sectionType: 'contact',
      slug: 'minimal-inline',
      name: 'Minimal Inline',
      description: 'Compact inline form with contact pills',
      component: ContactMinimalInline,
      thumbnail: '/variants/contact-minimal-inline.svg',
      tags: ['minimal', 'inline', 'compact'],
      renderJSX: contactMinimalInlineJSX,
    },
  ],

  footer: [
    {
      id: 'footer:columns',
      sectionType: 'footer',
      slug: 'columns',
      name: 'Columns',
      description: 'Multi-column footer with brand and link groups',
      component: FooterColumns,
      thumbnail: '/variants/footer-columns.svg',
      tags: ['classic', 'multi-column'],
      isDefault: true,
      renderJSX: footerColumnsJSX,
    },
    {
      id: 'footer:centered-minimal',
      sectionType: 'footer',
      slug: 'centered-minimal',
      name: 'Centered Minimal',
      description: 'Simple centered footer with inline links',
      component: FooterCenteredMinimal,
      thumbnail: '/variants/footer-centered-minimal.svg',
      tags: ['minimal', 'centered', 'simple'],
      renderJSX: footerCenteredMinimalJSX,
    },
    {
      id: 'footer:dark-band',
      sectionType: 'footer',
      slug: 'dark-band',
      name: 'Dark Band',
      description: 'Full-width dark footer with newsletter',
      component: FooterDarkBand,
      thumbnail: '/variants/footer-dark-band.svg',
      tags: ['dark', 'bold', 'newsletter'],
      renderJSX: footerDarkBandJSX,
    },
  ],

  pricing: [
    {
      id: 'pricing:columns',
      sectionType: 'pricing',
      slug: 'columns',
      name: 'Columns',
      description: 'Side-by-side pricing cards with highlighted tier',
      component: PricingColumns as any,
      thumbnail: '/variants/pricing-columns.svg',
      tags: ['classic', 'cards', 'popular'],
      isDefault: true,
      renderJSX: pricingColumnsJSX,
    },
    {
      id: 'pricing:table',
      sectionType: 'pricing',
      slug: 'table',
      name: 'Comparison Table',
      description: 'Feature comparison table across tiers',
      component: PricingTable as any,
      thumbnail: '/variants/pricing-table.svg',
      tags: ['table', 'comparison', 'detailed'],
      renderJSX: pricingTableJSX,
    },
    {
      id: 'pricing:minimal',
      sectionType: 'pricing',
      slug: 'minimal',
      name: 'Minimal',
      description: 'Clean inline pricing rows',
      component: PricingMinimal as any,
      thumbnail: '/variants/pricing-minimal.svg',
      tags: ['minimal', 'clean', 'compact'],
      renderJSX: pricingMinimalJSX,
    },
  ],

  testimonials: [
    {
      id: 'testimonials:grid',
      sectionType: 'testimonials',
      slug: 'grid',
      name: 'Grid',
      description: 'Card grid with avatars and star ratings',
      component: TestimonialsGrid as any,
      thumbnail: '/variants/testimonials-grid.svg',
      tags: ['cards', 'ratings', 'popular'],
      isDefault: true,
      renderJSX: testimonialsGridJSX,
    },
    {
      id: 'testimonials:spotlight',
      sectionType: 'testimonials',
      slug: 'spotlight',
      name: 'Spotlight',
      description: 'Large single featured testimonial',
      component: TestimonialsSpotlight as any,
      thumbnail: '/variants/testimonials-spotlight.svg',
      tags: ['featured', 'single', 'dramatic'],
      renderJSX: testimonialsSpotlightJSX,
    },
    {
      id: 'testimonials:minimal',
      sectionType: 'testimonials',
      slug: 'minimal',
      name: 'Minimal',
      description: 'Simple quote list with left border',
      component: TestimonialsMinimal as any,
      thumbnail: '/variants/testimonials-minimal.svg',
      tags: ['minimal', 'editorial', 'clean'],
      renderJSX: testimonialsMinimalJSX,
    },
  ],

  team: [
    {
      id: 'team:grid',
      sectionType: 'team',
      slug: 'grid',
      name: 'Grid',
      description: 'Photo card grid with roles and bios',
      component: TeamGrid as any,
      thumbnail: '/variants/team-grid.svg',
      tags: ['cards', 'photos', 'popular'],
      isDefault: true,
      renderJSX: teamGridJSX,
    },
    {
      id: 'team:compact',
      sectionType: 'team',
      slug: 'compact',
      name: 'Compact',
      description: 'Avatar list layout for larger teams',
      component: TeamCompact as any,
      thumbnail: '/variants/team-compact.svg',
      tags: ['list', 'compact', 'minimal'],
      renderJSX: teamCompactJSX,
    },
    {
      id: 'team:showcase',
      sectionType: 'team',
      slug: 'showcase',
      name: 'Showcase',
      description: 'Featured member spotlight with supporting grid',
      component: TeamShowcase as any,
      thumbnail: '/variants/team-showcase.svg',
      tags: ['featured', 'showcase', 'split'],
      renderJSX: teamShowcaseJSX,
    },
  ],

  gallery: [
    {
      id: 'gallery:masonry',
      sectionType: 'gallery',
      slug: 'masonry',
      name: 'Masonry',
      description: 'Pinterest-style masonry grid with varying heights',
      component: GalleryMasonry as any,
      thumbnail: '/variants/gallery-masonry.svg',
      tags: ['masonry', 'creative', 'popular'],
      isDefault: true,
      renderJSX: galleryMasonryJSX,
    },
    {
      id: 'gallery:grid',
      sectionType: 'gallery',
      slug: 'grid',
      name: 'Grid',
      description: 'Uniform image grid with hover overlays',
      component: GalleryGrid as any,
      thumbnail: '/variants/gallery-grid.svg',
      tags: ['grid', 'uniform', 'overlay'],
      renderJSX: galleryGridJSX,
    },
    {
      id: 'gallery:minimal',
      sectionType: 'gallery',
      slug: 'minimal',
      name: 'Minimal',
      description: 'Clean stacked images with captions',
      component: GalleryMinimal as any,
      thumbnail: '/variants/gallery-minimal.svg',
      tags: ['minimal', 'clean', 'stacked'],
      renderJSX: galleryMinimalJSX,
    },
  ],

  faq: [
    {
      id: 'faq:accordion',
      sectionType: 'faq',
      slug: 'accordion',
      name: 'Accordion',
      description: 'Expandable accordion with details/summary',
      component: FAQAccordion as any,
      thumbnail: '/variants/faq-accordion.svg',
      tags: ['accordion', 'expandable', 'popular'],
      isDefault: true,
      renderJSX: faqAccordionJSX,
    },
    {
      id: 'faq:grid',
      sectionType: 'faq',
      slug: 'grid',
      name: 'Grid',
      description: 'Two-column Q&A card grid',
      component: FAQGrid as any,
      thumbnail: '/variants/faq-grid.svg',
      tags: ['grid', 'cards', 'two-column'],
      renderJSX: faqGridJSX,
    },
    {
      id: 'faq:minimal',
      sectionType: 'faq',
      slug: 'minimal',
      name: 'Minimal',
      description: 'Simple list with dividers',
      component: FAQMinimal as any,
      thumbnail: '/variants/faq-minimal.svg',
      tags: ['minimal', 'simple', 'clean'],
      renderJSX: faqMinimalJSX,
    },
  ],

  stats: [
    {
      id: 'stats:row',
      sectionType: 'stats',
      slug: 'row',
      name: 'Row',
      description: 'Horizontal row of stat counters',
      component: StatsRow as any,
      thumbnail: '/variants/stats-row.svg',
      tags: ['horizontal', 'counters', 'popular'],
      isDefault: true,
      renderJSX: statsRowJSX,
    },
    {
      id: 'stats:cards',
      sectionType: 'stats',
      slug: 'cards',
      name: 'Cards',
      description: 'Stat items in individual cards',
      component: StatsCards as any,
      thumbnail: '/variants/stats-cards.svg',
      tags: ['cards', 'grid', 'bold'],
      renderJSX: statsCardsJSX,
    },
    {
      id: 'stats:minimal',
      sectionType: 'stats',
      slug: 'minimal',
      name: 'Minimal',
      description: 'Compact inline stats with dividers',
      component: StatsMinimal as any,
      thumbnail: '/variants/stats-minimal.svg',
      tags: ['minimal', 'inline', 'compact'],
      renderJSX: statsMinimalJSX,
    },
  ],

  about: [
    {
      id: 'about:split',
      sectionType: 'about',
      slug: 'split',
      name: 'Split',
      description: 'Image and text side by side',
      component: AboutSplit as any,
      thumbnail: '/variants/about-split.svg',
      tags: ['split', 'image', 'popular'],
      isDefault: true,
      renderJSX: aboutSplitJSX,
    },
    {
      id: 'about:centered',
      sectionType: 'about',
      slug: 'centered',
      name: 'Centered',
      description: 'Centered text with optional image above',
      component: AboutCentered as any,
      thumbnail: '/variants/about-centered.svg',
      tags: ['centered', 'clean', 'simple'],
      renderJSX: aboutCenteredJSX,
    },
    {
      id: 'about:timeline',
      sectionType: 'about',
      slug: 'timeline',
      name: 'Timeline',
      description: 'Company milestones as vertical timeline',
      component: AboutTimeline as any,
      thumbnail: '/variants/about-timeline.svg',
      tags: ['timeline', 'history', 'milestones'],
      renderJSX: aboutTimelineJSX,
    },
  ],

  'logo-cloud': [
    {
      id: 'logo-cloud:grid',
      sectionType: 'logo-cloud',
      slug: 'grid',
      name: 'Grid',
      description: 'Grid of partner/brand logos',
      component: LogoCloudGrid as any,
      thumbnail: '/variants/logo-cloud-grid.svg',
      tags: ['grid', 'partners', 'popular'],
      isDefault: true,
      renderJSX: logoCloudGridJSX,
    },
    {
      id: 'logo-cloud:scroll',
      sectionType: 'logo-cloud',
      slug: 'scroll',
      name: 'Scroll',
      description: 'Infinite scrolling marquee of logos',
      component: LogoCloudScroll as any,
      thumbnail: '/variants/logo-cloud-scroll.svg',
      tags: ['marquee', 'animation', 'modern'],
      renderJSX: logoCloudScrollJSX,
    },
    {
      id: 'logo-cloud:minimal',
      sectionType: 'logo-cloud',
      slug: 'minimal',
      name: 'Minimal',
      description: 'Single horizontal row of logos',
      component: LogoCloudMinimal as any,
      thumbnail: '/variants/logo-cloud-minimal.svg',
      tags: ['minimal', 'clean', 'simple'],
      renderJSX: logoCloudMinimalJSX,
    },
  ],
};

// ============================================================================
// Public API
// ============================================================================

/** Get all variants for a given section type */
export const getVariantsForSection = (sectionType: SectionType): SectionVariant[] => {
  return VARIANT_REGISTRY[sectionType] || [];
};

/** Get a specific variant by its ID */
export const getVariantById = (variantId: VariantId): SectionVariant | undefined => {
  const [sectionType] = variantId.split(':') as [SectionType, string];
  const variants = VARIANT_REGISTRY[sectionType];
  return variants?.find(v => v.id === variantId);
};

/** Get the default variant for a section type */
export const getDefaultVariant = (sectionType: SectionType): SectionVariant | undefined => {
  const variants = VARIANT_REGISTRY[sectionType];
  return variants?.find(v => v.isDefault) || variants?.[0];
};

/** Check if a section type has variants available */
export const hasVariants = (sectionType: SectionType): boolean => {
  const variants = VARIANT_REGISTRY[sectionType];
  return !!variants && variants.length > 1;
};

/** Get all section types that have variants */
export const getSectionTypesWithVariants = (): SectionType[] => {
  return Object.entries(VARIANT_REGISTRY)
    .filter(([_, variants]) => variants && variants.length > 1)
    .map(([type]) => type as SectionType);
};

/**
 * Resolve the component to render for a section, considering active variant overrides.
 * Falls back to the default section component if no variant is active.
 */
export const resolveVariantComponent = (
  sectionType: SectionType,
  sectionId: string,
  activeVariants: ActiveVariantMap
): SectionVariant['component'] | undefined => {
  const activeVariantId = activeVariants[sectionId];
  if (activeVariantId) {
    const variant = getVariantById(activeVariantId);
    if (variant) return variant.component;
  }
  // No variant override — return undefined to fall back to registry default
  return undefined;
};

export { VARIANT_REGISTRY };
