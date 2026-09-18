import { LogoCloudRevealTiles } from './logoCloud/LogoCloudRevealTiles';
import { BeforeAfterRevealPanel } from './beforeAfter/BeforeAfterRevealPanel';
import { BlogPreviewFourColumns } from './blogPreview/BlogPreviewFourColumns';
import { TeamProfileCards } from './team/TeamProfileCards';
import { CTAInsetPanel } from './cta/CTAInsetPanel';
import { NavbarCatalogBar } from './navbar/NavbarCatalogBar';
import { HeroLaunchShowcase } from './hero/HeroLaunchShowcase';
import { FeaturesSpotlightCards } from './features/FeaturesSpotlightCards';
import { TestimonialsColumns } from './testimonials/TestimonialsColumns';
import { ServicesBentoSpotlight } from './services/ServicesBentoSpotlight';
import { ServicesEditorialRows } from './services/ServicesEditorialRows';
import { ServicesExpandable } from './services/ServicesExpandable';
import { FAQEditorial } from './faq/FAQEditorial';
import { FAQSearchable } from './faq/FAQSearchable';
import { ContactEditorialForm } from './contact/ContactEditorialForm';
import { ContactMapStudio } from './contact/ContactMapStudio';
import { ContactCheckoutPanel } from './contact/ContactCheckoutPanel';
import { AboutImageStory } from './about/AboutImageStory';
import { StatsProofGrid } from './stats/StatsProofGrid';
import { PricingSpotlight } from './pricing/PricingSpotlight';
import { GalleryCaseStudy } from './gallery/GalleryCaseStudy';
import { portableRecipeOnly } from './portableRecipeOnly';
/**
 * Section Variant Registry
 * 
 * Central registry mapping each section type to its available layout variants.
 * Used by the TemplateCustomizerPanel to present variant thumbnails and
 * by the PageRenderer to resolve the correct component.
 */

import type { SectionType } from '../types';
import type { SectionVariant, VariantId, VariantRegistry, ActiveVariantMap } from './types';
import {
  RADIX_VFS_PRIMITIVES,
  type RadixPrimitiveId,
} from '@/platform/core/generatedUiFoundation';
import {
  EXPERIENCE_PRIMITIVES,
  type ExperiencePrimitive,
} from '@/platform/core/experiencePrimitives';
import { getVocabularyEntry } from '@/platform/core/designVocabulary';
import { EXPERIENCE_CAPABILITY_ID } from '@/platform/core/generatedRuntimeCapabilities';

// JSX layout templates for live preview swapping via VFS
import {
  heroCenteredJSX, heroSplitImageJSX, heroFullBleedJSX,
  ctaCenteredJSX, ctaGradientBannerJSX, ctaSplitCardJSX,
  navbarStandardJSX, navbarCenteredLogoJSX, navbarMinimalDarkJSX,
  featuresGridJSX, featuresIconLeftJSX, featuresMinimalCenteredJSX,
  servicesCardGridJSX, servicesAlternatingJSX, servicesCompactListJSX,
  contactCenteredJSX, contactSplitCardJSX, contactMinimalInlineJSX,
  footerColumnsJSX, footerCenteredMinimalJSX, footerDarkBandJSX,
  galleryEditorialMosaicJSX, galleryMasonryJSX, galleryCinematicGridJSX,
  galleryLightboxGridJSX, galleryFeatureSplitJSX, galleryHorizontalReelJSX,
  galleryCollectionTilesJSX, heroCommerceGradientJSX,
  heroShowcasePanelJSX, logoCloudWordmarkRowJSX, featuresBentoGridJSX,
  testimonialsGridJSX, testimonialsRailJSX, testimonialsSpotlightJSX,
  pricingTiersJSX, pricingComparisonJSX, pricingAccordionJSX,
  aboutEditorialSplitJSX, aboutStatementJSX, aboutStoryPanelJSX,
  faqAccordionJSX, faqTwoColumnJSX, faqCardsJSX,
  statsRowJSX, statsBandedGridJSX, statsHighlightJSX,
  teamPortraitGridJSX, teamRosterRailJSX, teamLeadSpotlightJSX,
  logoCloudGridJSX, logoCloudMarqueeJSX, logoCloudBrandLockupJSX,
  blogPreviewEditorialJSX, blogPreviewFeaturedGridJSX, blogPreviewHorizontalRailJSX,
  beforeAfterSliderJSX, beforeAfterGridJSX, beforeAfterCaseStudyJSX,
  footerBrandSocialJSX,
  pricingFeatureTableJSX,
  navbarFloatingPillJSX,
  testimonialsMarqueeJSX,
  statsMetricCardsJSX,
  servicesProductCardsJSX,
  ctaSignalBannerJSX,
  heroPrismaCinematicJSX,
  heroImageStreamJSX,
} from './jsxTemplates';

// 21st.dev certified variant: hero:image-stream
import { HeroImageStream } from './hero/HeroImageStream';

// 21st.dev certified variant: hero:prisma-cinematic
import { HeroPrismaCinematic } from './hero/HeroPrismaCinematic';

// 21st.dev certified variant: cta:signal-banner
import { CTASignalBanner } from './cta/CTASignalBanner';

// 21st.dev certified variant: services:product-cards
import { ServicesProductCards } from './services/ServicesProductCards';

// 21st.dev certified variant: stats:metric-cards
import { StatsMetricCards } from './stats/StatsMetricCards';

// 21st.dev certified variant: testimonials:marquee
import { TestimonialsMarquee } from './testimonials/TestimonialsMarquee';

// 21st.dev certified variant: navbar:floating-pill
import { NavbarFloatingPill } from './navbar/NavbarFloatingPill';

// 21st.dev certified variant: pricing:feature-table
import { PricingFeatureTable } from './pricing/PricingFeatureTable';

// 21st.dev certified variant: footer:brand-social
import { FooterBrandSocial } from './footer/FooterBrandSocial';

// Logo cloud variants
import { LogoCloudGrid } from './logoCloud/LogoCloudGrid';
import { LogoCloudMarquee } from './logoCloud/LogoCloudMarquee';
import { LogoCloudBrandLockup } from './logoCloud/LogoCloudBrandLockup';

// Blog preview variants
import { BlogPreviewEditorial } from './blogPreview/BlogPreviewEditorial';
import { BlogPreviewFeaturedGrid } from './blogPreview/BlogPreviewFeaturedGrid';
import { BlogPreviewHorizontalRail } from './blogPreview/BlogPreviewHorizontalRail';

// Before / after variants
import { BeforeAfterSlider } from './beforeAfter/BeforeAfterSlider';
import { BeforeAfterGrid } from './beforeAfter/BeforeAfterGrid';
import { BeforeAfterCaseStudy } from './beforeAfter/BeforeAfterCaseStudy';


// Hero variants
import { HeroCentered } from './hero/HeroCentered';
import { HeroSplitImage } from './hero/HeroSplitImage';
import { HeroFullBleed } from './hero/HeroFullBleed';
import { HeroCommerceGradient } from './hero/HeroCommerceGradient';
import { HeroShowcasePanel } from './hero/HeroShowcasePanel';
import { FeaturesBentoGrid } from './features/FeaturesBentoGrid';
import { LogoCloudWordmarkRow } from './logoCloud/LogoCloudWordmarkRow';
import { HeroPageTitle, HeroEditorialBanner } from './hero/HeroPageIntro';
import { heroPageTitleJSX, heroEditorialBannerJSX } from './hero/heroPageIntroJSX';

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

// Gallery variants (premium proof family)
import { GalleryEditorialMosaic } from './gallery/GalleryEditorialMosaic';
import { GalleryMasonry } from './gallery/GalleryMasonry';
import { GalleryCinematicGrid } from './gallery/GalleryCinematicGrid';
import { GalleryLightboxGrid } from './gallery/GalleryLightboxGrid';
import { GalleryFeatureSplit } from './gallery/GalleryFeatureSplit';
import { GalleryCollectionTiles } from './gallery/GalleryCollectionTiles';
import { GalleryHorizontalReel } from './gallery/GalleryHorizontalReel';

// Testimonials variants (Phase 3 — first-class proof family)
import { TestimonialsGrid } from './testimonials/TestimonialsGrid';
import { TestimonialsRail } from './testimonials/TestimonialsRail';
import { TestimonialsSpotlight } from './testimonials/TestimonialsSpotlight';

// Pricing variants (Phase 3 — first-class offer family)
import { PricingTiers } from './pricing/PricingTiers';
import { PricingComparison } from './pricing/PricingComparison';
import { PricingAccordion } from './pricing/PricingAccordion';

// About variants (Phase 4 — premium inventory)
import { AboutEditorialSplit } from './about/AboutEditorialSplit';
import { AboutStatement } from './about/AboutStatement';
import { AboutStoryPanel } from './about/AboutStoryPanel';

// FAQ variants (Phase 4 — premium inventory)
import { FAQAccordion } from './faq/FAQAccordion';
import { FAQTwoColumn } from './faq/FAQTwoColumn';
import { FAQCards } from './faq/FAQCards';

// Stats variants (Phase 4 — premium inventory)
import { StatsRow } from './stats/StatsRow';
import { StatsBandedGrid } from './stats/StatsBandedGrid';
import { StatsHighlight } from './stats/StatsHighlight';

// Team variants (Phase 4 — premium inventory)
import { TeamPortraitGrid } from './team/TeamPortraitGrid';
import { TeamRosterRail } from './team/TeamRosterRail';
import { TeamLeadSpotlight } from './team/TeamLeadSpotlight';

// Footer variants
import { FooterColumns } from './footer/FooterColumns';
import { FooterCenteredMinimal } from './footer/FooterCenteredMinimal';
import { FooterDarkBand } from './footer/FooterDarkBand';

// ============================================================================
// Registry Definition
// ============================================================================

const VARIANT_REGISTRY: VariantRegistry = {
  testimonials: [
    { id: 'testimonials:columns', sectionType: 'testimonials', slug: 'columns', name: 'Testimonial Columns',
      description: 'Testimonial columns with opt-in vertical motion, pause control and accessible static proof', component: TestimonialsColumns,
      vfs: { mode: 'portable-recipe', certification: 'approved' },
      source: { origin: '21st', sourceId: '21st:1965', sourceUrl: 'https://21st.dev/@efferd/components/testimonials-columns-1', author: 'efferd', derivation: 'visual-reference', adaptationVersion: '1' },
      generationStatus: 'preferred', thumbnail: '/variants/testimonials-columns.svg',
      tags: ['premium', 'popular-source'], pageRoles: ['home', 'about', 'services', 'pricing', 'shop'], renderJSX: portableRecipeOnly,
    },
    {
      id: 'testimonials:marquee',
      sectionType: 'testimonials',
      slug: 'marquee',
      name: 'Proof Marquee',
      description: 'Two continuously scrolling rows of proof cards with edge fades',
      component: TestimonialsMarquee,
      vfs: {"mode":"portable-recipe","certification":"approved"},
      source: {"origin":"21st","sourceId":"21st:822","sourceUrl":"https://21st.dev/@serafimcloud/components/testimonials-with-marquee","author":"serafimcloud","derivation":"source-adaptation","license":"MIT","adaptationVersion":"2"},
      generationStatus: "preferred",
      thumbnail: '/variants/testimonials-marquee.svg',
      tags: ['testimonials', 'marquee', 'social-proof', 'motion'],
      pageRoles: ['home', 'about', 'services'],
      renderJSX: testimonialsMarqueeJSX,
    },
    {
      id: 'testimonials:grid',
      sectionType: 'testimonials',
      slug: 'grid',
      name: 'Proof Grid',
      description: 'Balanced multi-column grid of client quotes',
      component: TestimonialsGrid,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/testimonials-grid.svg',
      tags: ['balanced', 'default'],
      isDefault: true,
      renderJSX: testimonialsGridJSX,
    },
    {
      id: 'testimonials:rail',
      sectionType: 'testimonials',
      slug: 'rail',
      name: 'Proof Rail',
      description: 'Horizontal snap rail with scroll controls',
      component: TestimonialsRail,
      vfs: { mode: 'portable-recipe' },
      vocabulary: { category: 'content', id: 'horizontal-scroll' },
      thumbnail: '/variants/testimonials-rail.svg',
      tags: ['rail', 'carousel', 'premium'],
      renderJSX: testimonialsRailJSX,
    },
    {
      id: 'testimonials:spotlight',
      sectionType: 'testimonials',
      slug: 'spotlight',
      name: 'Spotlight',
      description: 'One dominant quote with supporting proof beneath',
      component: TestimonialsSpotlight,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/testimonials-spotlight.svg',
      tags: ['editorial', 'featured'],
      renderJSX: testimonialsSpotlightJSX,
    },
  ],
  pricing: [
    {
      id: 'pricing:spotlight',
      sectionType: 'pricing',
      slug: 'spotlight',
      name: 'Pricing Spotlight',
      description: 'Highlighted plan spans the grid while every price and action remains data-owned',
      vfs: {
        mode: 'portable-recipe',
        certification: 'approved',
      },
      source: {
        origin: '21st',
        sourceId: '21st:vaib215/bento-pricing-component',
        sourceUrl: 'https://21st.dev/community/components/vaib215/bento-pricing-component',
        author: 'Vaibhav Kumar Singh',
        adaptationVersion: '1',
        derivation: 'visual-reference',
      },
      generationStatus: 'preferred',
      thumbnail: '/variants/pricing-spotlight.svg',
      tags: ['premium', 'route-design', 'page-design:editorial', 'page-design:showcase'],
      pageRoles: ['pricing', 'services', 'home'],
      component: PricingSpotlight,
      renderJSX: portableRecipeOnly,
    },
    {
      id: 'pricing:feature-table',
      sectionType: 'pricing',
      slug: 'feature-table',
      name: 'Feature Table',
      description: 'Plan columns over a shared feature checklist with a lifted popular tier',
      component: PricingFeatureTable,
      vfs: {"mode":"portable-recipe"},
      source: {"origin":"21st","sourceId":"21st:8374","sourceUrl":"https://21st.dev/@dgearsonu1/components/pricing-table","author":"dgearsonu1","derivation":"source-adaptation","adaptationVersion":"2"},
      generationStatus: "legacy",
      thumbnail: '/variants/pricing-feature-table.svg',
      tags: ['pricing', 'table', 'plans', 'commerce'],
      pageRoles: ['home', 'pricing', 'services'],
      renderJSX: pricingFeatureTableJSX,
    },
    {
      id: 'pricing:tiers',
      sectionType: 'pricing',
      slug: 'tiers',
      name: 'Plan Tiers',
      description: 'Side-by-side plan cards with a highlighted recommendation',
      component: PricingTiers,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/pricing-tiers.svg',
      tags: ['classic', 'default'],
      isDefault: true,
      renderJSX: pricingTiersJSX,
    },
    {
      id: 'pricing:comparison',
      sectionType: 'pricing',
      slug: 'comparison',
      name: 'Comparison Matrix',
      description: 'Feature matrix comparing every plan on one axis',
      component: PricingComparison,
      vfs: { mode: 'portable-recipe' },
      vocabulary: { category: 'content', id: 'comparison' },
      thumbnail: '/variants/pricing-comparison.svg',
      tags: ['matrix', 'detailed'],
      renderJSX: pricingComparisonJSX,
    },
    {
      id: 'pricing:accordion',
      sectionType: 'pricing',
      slug: 'accordion',
      name: 'Plan Accordion',
      description: 'Stacked disclosure rows for dense plan detail',
      component: PricingAccordion,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/pricing-accordion.svg',
      tags: ['accordion', 'compact', 'premium'],
      renderJSX: pricingAccordionJSX,
    },
  ],
  gallery: [
    {
      id: 'gallery:case-study',
      radixPrimitives: ['dialog'],
      sectionType: 'gallery',
      slug: 'case-study',
      name: 'Case Study Gallery',
      description: 'Editorial project rows with category filters and accessible lightbox',
      vfs: {
        mode: 'portable-recipe',
        certification: 'approved',
      },
      source: {
        origin: '21st',
        sourceId: '21st:reference/image-gallery',
        sourceUrl: 'https://news.21st.dev/blog/react-image-gallery-components',
        author: '21st.dev',
        adaptationVersion: '1',
        derivation: 'visual-reference',
      },
      generationStatus: 'preferred',
      thumbnail: '/variants/gallery-case-study.svg',
      tags: ['premium', 'route-design', 'page-design:editorial', 'page-design:showcase'],
      pageRoles: ['home', 'gallery', 'about', 'shop'],
      component: GalleryCaseStudy,
      renderJSX: portableRecipeOnly,
    },
    {
      id: 'gallery:editorial-mosaic',
      sectionType: 'gallery',
      slug: 'editorial-mosaic',
      name: 'Editorial Mosaic',
      description: 'Asymmetric mosaic with dominant hero tiles and controlled gutters',
      component: GalleryEditorialMosaic,
      vfs: { mode: 'portable-recipe' },
      radixPrimitives: ['dialog'],
      thumbnail: '/variants/gallery-editorial-mosaic.svg',
      tags: ['editorial', 'asymmetric', 'premium'],
      isDefault: true,
      renderJSX: galleryEditorialMosaicJSX,
    },
    {
      id: 'gallery:masonry',
      sectionType: 'gallery',
      slug: 'masonry',
      name: 'Masonry',
      description: 'Column-flow masonry with natural image proportions',
      component: GalleryMasonry,
      vfs: { mode: 'portable-recipe' },
      radixPrimitives: ['dialog'],
      vocabulary: { category: 'media', id: 'masonry' },
      thumbnail: '/variants/gallery-masonry.svg',
      tags: ['masonry', 'organic'],
      renderJSX: galleryMasonryJSX,
    },
    {
      id: 'gallery:cinematic-grid',
      sectionType: 'gallery',
      slug: 'cinematic-grid',
      name: 'Cinematic Grid',
      description: 'Wide 16:9 frames on a calm, even grid',
      component: GalleryCinematicGrid,
      vfs: { mode: 'portable-recipe' },
      radixPrimitives: ['dialog'],
      // Phase 4 declaration only: records the Phase 6A dependency, grants no
      // capability, and leaves this variant's DOM implementation unchanged.
      experience: { status: 'declared', vocabulary: { category: 'media', id: 'depth-gallery' } },
      thumbnail: '/variants/gallery-cinematic-grid.svg',
      tags: ['cinematic', 'wide'],
      renderJSX: galleryCinematicGridJSX,
    },
    {
      id: 'gallery:lightbox-grid',
      sectionType: 'gallery',
      slug: 'lightbox-grid',
      name: 'Lightbox Grid',
      description: 'Square inspection grid with prominent zoom affordance',
      component: GalleryLightboxGrid,
      vfs: { mode: 'portable-recipe' },
      radixPrimitives: ['dialog'],
      vocabulary: { category: 'media', id: 'lightbox' },
      thumbnail: '/variants/gallery-lightbox-grid.svg',
      tags: ['lightbox', 'inspection'],
      renderJSX: galleryLightboxGridJSX,
    },
    {
      id: 'gallery:feature-split',
      sectionType: 'gallery',
      slug: 'feature-split',
      name: 'Feature Split',
      description: 'One dominant feature image beside a stacked supporting grid',
      component: GalleryFeatureSplit,
      vfs: { mode: 'portable-recipe' },
      radixPrimitives: ['dialog'],
      thumbnail: '/variants/gallery-feature-split.svg',
      tags: ['split', 'feature'],
      renderJSX: galleryFeatureSplitJSX,
    },
    {
      id: 'gallery:horizontal-reel',
      sectionType: 'gallery',
      slug: 'horizontal-reel',
      name: 'Horizontal Reel',
      description: 'Scroll-snapped filmstrip for sequential, story-led image sets',
      component: GalleryHorizontalReel,
      vfs: { mode: 'portable-recipe' },
      radixPrimitives: ['dialog'],
      vocabulary: { category: 'media', id: 'filmstrip' },
      thumbnail: '/variants/gallery-horizontal-reel.svg',
      tags: ['reel', 'filmstrip', 'sequential'],
      renderJSX: galleryHorizontalReelJSX,
    },
    {
      id: 'gallery:collection-tiles',
      sectionType: 'gallery',
      slug: 'collection-tiles',
      name: 'Collection Tiles',
      description: 'Commerce collection tiles with centered product art and corner arrow affordance',
      component: GalleryCollectionTiles,
      vfs: { mode: 'portable-recipe' },
      radixPrimitives: ['dialog'],
      source: {
        origin: '21st',
        sourceId: '21st:4927',
        sourceUrl: 'https://21st.dev/bankkroll',
        author: '@bankkroll',
        license: 'MIT (21st.dev community default)',
        adaptationVersion: '1',
      },
      generationStatus: 'preferred',
      thumbnail: '/variants/gallery-collection-tiles.svg',
      tags: ['commerce', 'collections', 'tiles', 'shop'],
      pageRoles: ['shop', 'gallery'],
      renderJSX: galleryCollectionTilesJSX,
    },
  ],
  hero: [
    {
      id: 'hero:image-stream',
      sectionType: 'hero',
      slug: 'image-stream',
      name: 'Image Stream',
      description: 'A perspective corridor of industry imagery framing centered headline and actions',
      component: HeroImageStream,
      vfs: { mode: 'portable-recipe', certification: 'approved' },
      source: {
        origin: '21st',
        derivation: 'source-adaptation',
        sourceId: '21st:24377',
        sourceUrl: 'https://21st.dev/c/24377',
        author: 'ruixen.ui',
        license: 'Owner-authorized source adaptation (supplied directly for canonical use)',
        adaptationVersion: '1',
      },
      generationStatus: 'preferred',
      thumbnail: '/variants/hero-image-stream.svg',
      tags: ['hero', 'image-stream', 'perspective', 'motion', 'gallery'],
      pageRoles: ['home'],
      renderJSX: heroImageStreamJSX,
    },
    { id: 'hero:launch-showcase', sectionType: 'hero', slug: 'launch-showcase', name: 'Centered headline and actions above a framed media showcase', description: 'Centered headline and actions above a framed media showcase', component: HeroLaunchShowcase, vfs: { mode: 'portable-recipe', certification: 'approved' }, source: {"origin":"21st","sourceId":"21st:1526","sourceUrl":"https://21st.dev/@mikolajdobrucki/components/hero-section","author":"mikolajdobrucki","derivation":"source-adaptation","license":"MIT","adaptationVersion":"2"}, generationStatus: 'preferred', thumbnail: '/variants/hero-launch-showcase.svg', renderJSX: portableRecipeOnly },
    {
      id: 'hero:prisma-cinematic',
      sectionType: 'hero',
      slug: 'prisma-cinematic',
      name: 'Prisma Cinematic',
      description: 'Full-bleed cinematic hero with oversized display headline, gradient scrim and side copy',
      component: HeroPrismaCinematic,
      vfs: {"mode":"portable-recipe","certification":"approved"},
      source: {"origin":"21st","sourceId":"21st:12200","sourceUrl":"https://21st.dev/@rahil1202/components/prisma-hero","author":"rahil1202","derivation":"source-adaptation","license":"Owner-authorized adaptation (21st.dev publication by @rahil1202 declares no upstream license)","adaptationVersion":"2"},
      generationStatus: "preferred",
      thumbnail: '/variants/hero-prisma-cinematic.svg',
      tags: ['hero', 'cinematic', 'editorial', 'full-bleed', 'media'],
      pageRoles: ['home'],
      renderJSX: heroPrismaCinematicJSX,
    },
    {
      id: 'hero:centered',
      sectionType: 'hero',
      slug: 'centered',
      name: 'Centered',
      description: 'Classic centered headline with CTA buttons below',
      component: HeroCentered,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/hero-centered.svg',
      tags: ['classic', 'clean', 'minimal'],
      isDefault: true,
      renderJSX: heroCenteredJSX,
    },
    {
      id: 'hero:split-image',
      pageRoles: ['home', 'services', 'about'],
      sectionType: 'hero',
      slug: 'split-image',
      name: 'Split Image',
      description: 'Two-column layout with text and hero image side by side',
      component: HeroSplitImage,
      vfs: { mode: 'portable-recipe' },
      vocabulary: { category: 'hero', id: 'split-cinematic' },
      thumbnail: '/variants/hero-split-image.svg',
      tags: ['modern', 'saas', 'image'],
      renderJSX: heroSplitImageJSX,
    },
    {
      id: 'hero:full-bleed',
      pageRoles: ['home', 'gallery', 'shop'],
      sectionType: 'hero',
      slug: 'full-bleed',
      name: 'Full Bleed',
      description: 'Full-screen background with centered text overlay',
      component: HeroFullBleed,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/hero-full-bleed.svg',
      tags: ['bold', 'immersive', 'dramatic'],
      renderJSX: heroFullBleedJSX,
    },
    {
      id: 'hero:page-title', sectionType: 'hero', slug: 'page-title',
      name: 'Page Title', description: 'Compact left-aligned introduction for task-focused pages',
      component: HeroPageTitle, vfs: { mode: 'portable-recipe' }, thumbnail: '/variants/hero-centered.svg',
      tags: ['compact', 'subpage'], pageRoles: ['pricing', 'faq', 'checkout', 'thank_you'],
      renderJSX: heroPageTitleJSX,
    },
    {
      id: 'hero:editorial-banner', sectionType: 'hero', slug: 'editorial-banner',
      name: 'Editorial Banner', description: 'Wide image band above a restrained page introduction',
      component: HeroEditorialBanner, vfs: { mode: 'portable-recipe' }, thumbnail: '/variants/hero-full-bleed.svg',
      vocabulary: { category: 'hero', id: 'oversized-editorial' },
      tags: ['editorial', 'subpage', 'image', 'premium'], pageRoles: ['booking', 'contact', 'blog', 'custom'],
      renderJSX: heroEditorialBannerJSX,
    },
    {
      id: 'hero:commerce-gradient',
      sectionType: 'hero',
      slug: 'commerce-gradient',
      name: 'Commerce Gradient',
      description: 'Rounded accent band with gradient-clipped headline for storefront landings',
      component: HeroCommerceGradient,
      vfs: { mode: 'portable-recipe' },
      source: {
        origin: '21st',
        sourceId: '21st:4927',
        sourceUrl: 'https://21st.dev/bankkroll',
        author: '@bankkroll',
        license: 'MIT (21st.dev community default)',
        adaptationVersion: '1',
      },
      generationStatus: 'preferred',
      thumbnail: '/variants/hero-commerce-gradient.svg',
      tags: ['commerce', 'gradient', 'bold', 'shop'],
      pageRoles: ['home', 'shop'],
      renderJSX: heroCommerceGradientJSX,
    },
    {
      id: 'hero:showcase-panel',
      sectionType: 'hero',
      slug: 'showcase-panel',
      name: 'Showcase Panel',
      description: 'Centered copy above a framed product panel with a trust row',
      component: HeroShowcasePanel,
      vfs: { mode: 'portable-recipe' },
      source: {
        origin: '21st',
        sourceId: '21st:26630',
        sourceUrl: 'https://21st.dev',
        author: '21st.dev community',
        license: 'MIT (21st.dev community default)',
        adaptationVersion: '1',
      },
      generationStatus: 'preferred',
      thumbnail: '/variants/hero-showcase-panel.svg',
      tags: ['product', 'showcase', 'centered', 'saas'],
      pageRoles: ['home', 'shop', 'custom'],
      renderJSX: heroShowcasePanelJSX,
    },
  ],

  cta: [
    { id: 'cta:inset-panel', sectionType: 'cta', slug: 'inset-panel', name: 'Centered conversion message and actions inside a muted inset panel', description: 'Centered conversion message and actions inside a muted inset panel', component: CTAInsetPanel, vfs: { mode: 'portable-recipe', certification: 'approved' }, source: {"origin":"21st","sourceId":"21st:1414","sourceUrl":"https://21st.dev/@tommyjepsen/components/call-to-action","author":"tommyjepsen","derivation":"source-adaptation","license":"MIT","adaptationVersion":"2"}, generationStatus: 'preferred', thumbnail: '/variants/cta-inset-panel.svg', renderJSX: portableRecipeOnly },
    {
      id: 'cta:signal-banner',
      sectionType: 'cta',
      slug: 'signal-banner',
      name: 'Signal Banner',
      description: 'Bracketed banner card with a sweeping accent line and uppercase CTAs',
      component: CTASignalBanner,
      vfs: {"mode":"portable-recipe"},
      source: {"origin":"21st","sourceId":"21st:19341","sourceUrl":"https://21st.dev/@thegridcn/components/cta-banner","author":"thegridcn","derivation":"source-adaptation","adaptationVersion":"2"},
      generationStatus: "legacy",
      thumbnail: '/variants/cta-signal-banner.svg',
      tags: ['cta', 'banner', 'bold', 'conversion'],
      pageRoles: ['home', 'shop', 'services', 'contact'],
      renderJSX: ctaSignalBannerJSX,
    },
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
        vfs: { mode: 'portable-recipe' },
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
        vfs: { mode: 'portable-recipe' },
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
        vfs: { mode: 'portable-recipe' },
    },
  ],

  navbar: [
    { id: 'navbar:catalog-bar', sectionType: 'navbar', slug: 'catalog-bar', name: 'Brand, desktop navigation and action with an accessible mobile drawer', description: 'Brand, desktop navigation and action with an accessible mobile drawer', component: NavbarCatalogBar, radixPrimitives: ['dialog'], vfs: { mode: 'portable-recipe', certification: 'approved' }, source: {"origin":"21st","sourceId":"21st:606","sourceUrl":"https://21st.dev/@shadcnblockscom/components/shadcnblocks-com-navbar1","author":"shadcnblockscom","derivation":"visual-reference","adaptationVersion":"2"}, generationStatus: 'preferred', thumbnail: '/variants/navbar-catalog-bar.svg', renderJSX: portableRecipeOnly },
    {
      id: 'navbar:floating-pill',
      sectionType: 'navbar',
      slug: 'floating-pill',
      name: 'Floating Pill',
      description: 'Sticky blurred pill bar that detaches from the top edge on scroll',
      component: NavbarFloatingPill,
      vfs: {"mode":"portable-recipe"},
      source: {"origin":"21st","sourceId":"21st:8137","sourceUrl":"https://21st.dev/@efferd/components/floating-header","author":"efferd","derivation":"source-adaptation","adaptationVersion":"2"},
      generationStatus: "legacy",
      thumbnail: '/variants/navbar-floating-pill.svg',
      tags: ['navbar', 'sticky', 'pill', 'modern'],
      pageRoles: ['home', 'shop', 'services', 'contact', 'about'],
      radixPrimitives: ['dialog'],
      renderJSX: navbarFloatingPillJSX,
    },
    {
      id: 'navbar:standard',
      radixPrimitives: ['dialog'],
      sectionType: 'navbar',
      slug: 'standard',
      name: 'Standard',
      description: 'Classic horizontal navbar with brand and CTA',
      component: NavbarStandard,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/navbar-standard.svg',
      tags: ['classic', 'clean'],
      isDefault: true,
      renderJSX: navbarStandardJSX,
    },
    {
      id: 'navbar:centered-logo',
      radixPrimitives: ['dialog'],
      sectionType: 'navbar',
      slug: 'centered-logo',
      name: 'Centered Logo',
      description: 'Brand centered with links split on either side',
      component: NavbarCenteredLogo,
      vfs: { mode: 'portable-recipe' },
      vocabulary: { category: 'navigation', id: 'split' },
      thumbnail: '/variants/navbar-centered-logo.svg',
      tags: ['editorial', 'elegant'],
      renderJSX: navbarCenteredLogoJSX,
    },
    {
      id: 'navbar:minimal-dark',
      radixPrimitives: ['dialog'],
      sectionType: 'navbar',
      slug: 'minimal-dark',
      name: 'Minimal Dark',
      description: 'Dark background with pill-shaped CTA',
      component: NavbarMinimalDark,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/navbar-minimal-dark.svg',
      tags: ['dark', 'modern', 'minimal'],
      renderJSX: navbarMinimalDarkJSX,
    },
  ],

  features: [
    { id: 'features:spotlight-cards', sectionType: 'features', slug: 'spotlight-cards', name: 'Spotlight Cards',
      description: 'Responsive feature cards with a pointer spotlight and static reduced-motion presentation', component: FeaturesSpotlightCards,
      vfs: { mode: 'portable-recipe', certification: 'approved' },
      source: { origin: '21st', sourceId: '21st:2220', sourceUrl: 'https://21st.dev/@preetsuthar17/components/spotlight-card', author: 'preetsuthar17', derivation: 'visual-reference', adaptationVersion: '1' },
      generationStatus: 'preferred', thumbnail: '/variants/features-spotlight-cards.svg',
      tags: ['premium', 'popular-source'], pageRoles: ['home', 'about', 'services', 'pricing', 'shop'], renderJSX: portableRecipeOnly,
    },
    {
      id: 'features:grid',
      sectionType: 'features',
      slug: 'grid',
      name: 'Grid',
      description: 'Classic card grid with icons and descriptions',
      component: FeaturesGrid,
      vfs: { mode: 'portable-recipe' },
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
      vfs: { mode: 'portable-recipe' },
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
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/features-minimal-centered.svg',
      tags: ['minimal', 'centered', 'elegant'],
      renderJSX: featuresMinimalCenteredJSX,
    },
    {
      id: 'features:bento-grid',
      sectionType: 'features',
      slug: 'bento-grid',
      name: 'Bento Grid',
      description: 'Asymmetric bento tiles with a tall lead card and wide closer',
      component: FeaturesBentoGrid,
      vfs: { mode: 'portable-recipe' },
      source: {
        origin: '21st',
        sourceId: '21st:9206',
        sourceUrl: 'https://21st.dev',
        author: '21st.dev community',
        license: 'MIT (21st.dev community default)',
        adaptationVersion: '1',
      },
      generationStatus: 'preferred',
      thumbnail: '/variants/features-bento-grid.svg',
      tags: ['bento', 'asymmetric', 'product', 'modern'],
      renderJSX: featuresBentoGridJSX,
    },
  ],

  services: [
    {
      id: 'services:expandable',
      sectionType: 'services',
      slug: 'expandable',
      name: 'Expandable Services',
      description: 'Keyboard-accessible service disclosures with media and actions',
      vfs: {
        mode: 'portable-recipe',
        certification: 'approved',
      },
      source: {
        origin: '21st',
        sourceId: '21st:684',
        sourceUrl: 'https://21st.dev/@shadcnblockscom/components/faq3',
        author: 'shadcnblockscom',
        adaptationVersion: '1',
        derivation: 'visual-reference',
      },
      generationStatus: 'preferred',
      thumbnail: '/variants/services-expandable.svg',
      tags: ['premium', 'route-design', 'page-design:showcase'],
      pageRoles: ['home', 'services', 'pricing', 'booking'],
      component: ServicesExpandable,
      renderJSX: portableRecipeOnly,
    },
    {
      id: 'services:editorial-rows',
      sectionType: 'services',
      slug: 'editorial-rows',
      name: 'Editorial Rows',
      description: 'Numbered service chapters with image, description and action',
      vfs: {
        mode: 'portable-recipe',
        certification: 'approved',
      },
      source: {
        origin: '21st',
        sourceId: '21st:9206',
        sourceUrl: 'https://21st.dev/c/9206',
        author: '21st.dev community',
        adaptationVersion: '1',
        derivation: 'visual-reference',
      },
      generationStatus: 'preferred',
      thumbnail: '/variants/services-editorial-rows.svg',
      tags: ['premium', 'route-design', 'page-design:editorial'],
      pageRoles: ['home', 'services', 'about', 'booking'],
      component: ServicesEditorialRows,
      renderJSX: portableRecipeOnly,
    },
    {
      id: 'services:bento-spotlight',
      sectionType: 'services',
      slug: 'bento-spotlight',
      name: 'Bento Spotlight',
      description: 'Asymmetric service cards with a lead image, pricing and intent-bound actions',
      vfs: {
        mode: 'portable-recipe',
        certification: 'approved',
      },
      source: {
        origin: '21st',
        sourceId: '21st:9206',
        sourceUrl: 'https://21st.dev/c/9206',
        author: '21st.dev community',
        adaptationVersion: '1',
        derivation: 'visual-reference',
      },
      generationStatus: 'preferred',
      thumbnail: '/variants/services-bento-spotlight.svg',
      tags: ['premium', 'route-design', 'page-design:showcase'],
      pageRoles: ['home', 'services', 'booking'],
      component: ServicesBentoSpotlight,
      renderJSX: portableRecipeOnly,
    },
    {
      id: 'services:product-cards',
      sectionType: 'services',
      slug: 'product-cards',
      name: 'Product Cards',
      description: 'Retail product grid with contained art, price and add-to-bag intent',
      component: ServicesProductCards,
      vfs: {"mode":"portable-recipe"},
      source: {"origin":"21st","sourceId":"21st:8286","sourceUrl":"https://21st.dev/@ravikatiyar162/components/product-card-2","author":"ravikatiyar162","derivation":"source-adaptation","adaptationVersion":"2"},
      generationStatus: "legacy",
      thumbnail: '/variants/services-product-cards.svg',
      tags: ['commerce', 'products', 'grid', 'shop'],
      pageRoles: ['home', 'shop', 'services'],
      renderJSX: servicesProductCardsJSX,
    },
    {
      id: 'services:card-grid',
      sectionType: 'services',
      slug: 'card-grid',
      name: 'Card Grid',
      description: 'Service cards with badge, price, and CTA',
      component: ServicesCardGrid,
      vfs: { mode: 'portable-recipe' },
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
      vfs: { mode: 'portable-recipe' },
      vocabulary: { category: 'content', id: 'split-feature' },
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
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/services-compact-list.svg',
      tags: ['list', 'compact', 'minimal'],
      renderJSX: servicesCompactListJSX,
    },
  ],

  contact: [
    {
      id: 'contact:checkout-panel',
      sectionType: 'contact',
      slug: 'checkout-panel',
      name: 'Checkout Support',
      description: 'Order inquiry form and canonical cart checkout handoff',
      vfs: {
        mode: 'portable-recipe',
        certification: 'approved',
      },
      source: {
        origin: '21st',
        sourceId: '21st:7053',
        sourceUrl: 'https://21st.dev/@ruixen.ui/components/checkout-form',
        author: 'ruixen.ui',
        adaptationVersion: '1',
        derivation: 'visual-reference',
      },
      generationStatus: 'preferred',
      thumbnail: '/variants/contact-checkout-panel.svg',
      tags: ['premium', 'route-design', 'page-design:editorial', 'page-design:showcase'],
      pageRoles: ['checkout'],
      component: ContactCheckoutPanel,
      renderJSX: portableRecipeOnly,
    },
    {
      id: 'contact:map-studio',
      sectionType: 'contact',
      slug: 'map-studio',
      name: 'Map Studio',
      description: 'Optional lazy map, visible directions and a labelled inquiry form',
      vfs: {
        mode: 'portable-recipe',
        certification: 'approved',
      },
      source: {
        origin: '21st',
        sourceId: '21st:4741',
        sourceUrl: 'https://21st.dev/@meschacirung/components/contact-form',
        author: 'meschacirung',
        adaptationVersion: '1',
        derivation: 'visual-reference',
      },
      generationStatus: 'preferred',
      thumbnail: '/variants/contact-map-studio.svg',
      tags: ['premium', 'route-design', 'page-design:showcase'],
      pageRoles: ['home', 'contact', 'about', 'booking'],
      component: ContactMapStudio,
      renderJSX: portableRecipeOnly,
    },
    {
      id: 'contact:editorial-form',
      sectionType: 'contact',
      slug: 'editorial-form',
      name: 'Editorial Form',
      description: 'Labelled contact form beside a direct-contact information rail',
      vfs: {
        mode: 'portable-recipe',
        certification: 'approved',
      },
      source: {
        origin: '21st',
        sourceId: '21st:4741',
        sourceUrl: 'https://21st.dev/@meschacirung/components/contact-form',
        author: 'meschacirung',
        adaptationVersion: '1',
        derivation: 'visual-reference',
      },
      generationStatus: 'preferred',
      thumbnail: '/variants/contact-editorial-form.svg',
      tags: ['premium', 'route-design', 'page-design:editorial'],
      pageRoles: ['home', 'contact', 'booking', 'services'],
      component: ContactEditorialForm,
      renderJSX: portableRecipeOnly,
    },
    {
      id: 'contact:centered',
      sectionType: 'contact',
      slug: 'centered',
      name: 'Centered',
      description: 'Classic centered contact form',
      component: ContactCentered,
      vfs: { mode: 'portable-recipe' },
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
      vfs: { mode: 'portable-recipe' },
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
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/contact-minimal-inline.svg',
      tags: ['minimal', 'inline', 'compact'],
      renderJSX: contactMinimalInlineJSX,
    },
  ],

  footer: [
    {
      id: 'footer:brand-social',
      sectionType: 'footer',
      slug: 'brand-social',
      name: 'Brand & Social',
      description: 'Brand block with social row beside link columns and a legal band',
      component: FooterBrandSocial,
      vfs: {"mode":"portable-recipe","certification":"approved"},
      source: {"origin":"21st","sourceId":"21st:646","sourceUrl":"https://21st.dev/@nevsky118/components/footer","author":"nevsky118","derivation":"source-adaptation","license":"MIT","adaptationVersion":"2"},
      generationStatus: "preferred",
      thumbnail: '/variants/footer-brand-social.svg',
      tags: ['footer', 'social', 'columns', 'brand'],
      pageRoles: ['home', 'shop', 'services', 'contact', 'about'],
      renderJSX: footerBrandSocialJSX,
    },
    {
      id: 'footer:columns',
      sectionType: 'footer',
      slug: 'columns',
      name: 'Columns',
      description: 'Multi-column footer with brand and link groups',
      component: FooterColumns,
      vfs: { mode: 'portable-recipe' },
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
      vfs: { mode: 'portable-recipe' },
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
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/footer-dark-band.svg',
      tags: ['dark', 'bold', 'newsletter'],
      renderJSX: footerDarkBandJSX,
    },
  ],

  about: [
    {
      id: 'about:image-story',
      sectionType: 'about',
      slug: 'image-story',
      name: 'Image Story',
      description: 'Large editorial image paired with a story panel and action',
      vfs: {
        mode: 'portable-recipe',
        certification: 'approved',
      },
      source: {
        origin: '21st',
        sourceId: '21st:ruixen.ui/about-page',
        sourceUrl: 'https://21st.dev/@ruixen.ui/components/about-page',
        author: 'Ruixen UI',
        adaptationVersion: '1',
        derivation: 'visual-reference',
      },
      generationStatus: 'preferred',
      thumbnail: '/variants/about-image-story.svg',
      tags: ['premium', 'route-design', 'page-design:editorial', 'page-design:showcase'],
      pageRoles: ['about', 'home'],
      component: AboutImageStory,
      renderJSX: portableRecipeOnly,
    },
    {
      id: 'about:editorial-split',
      sectionType: 'about',
      slug: 'editorial-split',
      name: 'Editorial Split',
      description: 'Narrative column beside a supporting portrait',
      component: AboutEditorialSplit,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/about-editorial-split.svg',
      tags: ['editorial', 'default'],
      isDefault: true,
      renderJSX: aboutEditorialSplitJSX,
    },
    {
      id: 'about:statement',
      sectionType: 'about',
      slug: 'statement',
      name: 'Statement',
      description: 'Centered manifesto column, type-led with no media',
      component: AboutStatement,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/about-statement.svg',
      tags: ['minimal', 'centered', 'type-led'],
      renderJSX: aboutStatementJSX,
    },
    {
      id: 'about:story-panel',
      sectionType: 'about',
      slug: 'story-panel',
      name: 'Story Panel',
      description: 'Overlapping media band with a raised narrative card',
      component: AboutStoryPanel,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/about-story-panel.svg',
      tags: ['premium', 'overlap', 'editorial'],
      renderJSX: aboutStoryPanelJSX,
    },
  ],

  faq: [
    {
      id: 'faq:searchable',
      sectionType: 'faq',
      slug: 'searchable',
      name: 'Searchable FAQ',
      description: 'Search questions and answers with live result counts and disclosures',
      vfs: {
        mode: 'portable-recipe',
        certification: 'approved',
      },
      source: {
        origin: '21st',
        sourceId: '21st:24932',
        sourceUrl: 'https://21st.dev/@cnippet-dev/components/v-accordion-11',
        author: 'cnippet-dev',
        adaptationVersion: '1',
        derivation: 'visual-reference',
      },
      generationStatus: 'preferred',
      thumbnail: '/variants/faq-searchable.svg',
      tags: ['premium', 'route-design', 'page-design:showcase'],
      pageRoles: ['home', 'faq', 'services', 'contact', 'checkout'],
      component: FAQSearchable,
      renderJSX: portableRecipeOnly,
    },
    {
      id: 'faq:editorial',
      sectionType: 'faq',
      slug: 'editorial',
      name: 'Editorial FAQ',
      description: 'Numbered questions in a two-column disclosure layout',
      vfs: {
        mode: 'portable-recipe',
        certification: 'approved',
      },
      source: {
        origin: '21st',
        sourceId: '21st:684',
        sourceUrl: 'https://21st.dev/@shadcnblockscom/components/faq3',
        author: 'shadcnblockscom',
        adaptationVersion: '1',
        derivation: 'visual-reference',
      },
      generationStatus: 'preferred',
      thumbnail: '/variants/faq-editorial.svg',
      tags: ['premium', 'route-design', 'page-design:editorial'],
      pageRoles: ['home', 'faq', 'services', 'pricing', 'contact', 'checkout'],
      component: FAQEditorial,
      renderJSX: portableRecipeOnly,
    },
    {
      id: 'faq:accordion',
      sectionType: 'faq',
      slug: 'accordion',
      name: 'Accordion',
      description: 'Disclosure list revealing one answer at a time',
      component: FAQAccordion,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/faq-accordion.svg',
      radixPrimitives: ['accordion'],
      tags: ['classic', 'default'],
      isDefault: true,
      renderJSX: faqAccordionJSX,
    },
    {
      id: 'faq:two-column',
      sectionType: 'faq',
      slug: 'two-column',
      name: 'Two Column',
      description: 'Open reference sheet with all answers visible',
      component: FAQTwoColumn,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/faq-two-column.svg',
      tags: ['editorial', 'open'],
      renderJSX: faqTwoColumnJSX,
    },
    {
      id: 'faq:cards',
      sectionType: 'faq',
      slug: 'cards',
      name: 'Answer Cards',
      description: 'Scannable card grid for short, high-volume questions',
      component: FAQCards,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/faq-cards.svg',
      tags: ['cards', 'scannable'],
      renderJSX: faqCardsJSX,
    },
  ],

  stats: [
    {
      id: 'stats:proof-grid',
      sectionType: 'stats',
      slug: 'proof-grid',
      name: 'Proof Grid',
      description: 'Oversized supplied metrics with restrained staggered entrance',
      vfs: {
        mode: 'portable-recipe',
        certification: 'approved',
      },
      source: {
        origin: '21st',
        sourceId: '21st:9206',
        sourceUrl: 'https://21st.dev/c/9206',
        author: '21st.dev community',
        adaptationVersion: '1',
        derivation: 'visual-reference',
      },
      generationStatus: 'preferred',
      thumbnail: '/variants/stats-proof-grid.svg',
      tags: ['premium', 'route-design', 'page-design:editorial', 'page-design:showcase'],
      pageRoles: ['about', 'home', 'services', 'thank_you'],
      component: StatsProofGrid,
      renderJSX: portableRecipeOnly,
    },
    {
      id: 'stats:metric-cards',
      sectionType: 'stats',
      slug: 'metric-cards',
      name: 'Metric Cards',
      description: 'Bordered metric tiles with accent rules and optional glyphs',
      component: StatsMetricCards,
      vfs: {"mode":"portable-recipe","certification":"approved"},
      source: {"origin":"21st","sourceId":"21st:1195","sourceUrl":"https://21st.dev/@tommyjepsen/components/stats-section-with-text","author":"tommyjepsen","derivation":"source-adaptation","license":"MIT","adaptationVersion":"2"},
      generationStatus: "preferred",
      thumbnail: '/variants/stats-metric-cards.svg',
      tags: ['stats', 'metrics', 'cards', 'proof'],
      pageRoles: ['home', 'about', 'services'],
      renderJSX: statsMetricCardsJSX,
    },
    {
      id: 'stats:row',
      sectionType: 'stats',
      slug: 'row',
      name: 'Proof Row',
      description: 'Single measured row of figures split by hairlines',
      component: StatsRow,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/stats-row.svg',
      tags: ['minimal', 'default'],
      isDefault: true,
      renderJSX: statsRowJSX,
    },
    {
      id: 'stats:banded-grid',
      sectionType: 'stats',
      slug: 'banded-grid',
      name: 'Banded Grid',
      description: 'Figures held in tinted cards on a contrasting band',
      component: StatsBandedGrid,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/stats-banded-grid.svg',
      tags: ['cards', 'banded'],
      renderJSX: statsBandedGridJSX,
    },
    {
      id: 'stats:highlight',
      sectionType: 'stats',
      slug: 'highlight',
      name: 'Highlight',
      description: 'One dominant figure anchored by supporting metrics',
      component: StatsHighlight,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/stats-highlight.svg',
      tags: ['editorial', 'featured'],
      renderJSX: statsHighlightJSX,
    },
  ],

  team: [
    { id: 'team:profile-cards', sectionType: 'team', slug: 'profile-cards', name: 'Portrait cards with name, role and biography', description: 'Portrait cards with name, role and biography', component: TeamProfileCards, vfs: { mode: 'portable-recipe', certification: 'approved' }, source: {"origin":"21st","sourceId":"21st:8757","sourceUrl":"https://21st.dev/@ravikatiyar162/components/team-section-1","author":"ravikatiyar162","derivation":"visual-reference","adaptationVersion":"2"}, generationStatus: 'preferred', thumbnail: '/variants/team-profile-cards.svg', renderJSX: portableRecipeOnly },
    {
      id: 'team:portrait-grid',
      sectionType: 'team',
      slug: 'portrait-grid',
      name: 'Portrait Grid',
      description: 'Editorial portrait grid with name and role captions',
      component: TeamPortraitGrid,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/team-portrait-grid.svg',
      tags: ['classic', 'default'],
      isDefault: true,
      renderJSX: teamPortraitGridJSX,
    },
    {
      id: 'team:roster-rail',
      sectionType: 'team',
      slug: 'roster-rail',
      name: 'Roster Rail',
      description: 'Horizontal snap rail of circular portraits',
      component: TeamRosterRail,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/team-roster-rail.svg',
      tags: ['rail', 'compact'],
      renderJSX: teamRosterRailJSX,
    },
    {
      id: 'team:lead-spotlight',
      sectionType: 'team',
      slug: 'lead-spotlight',
      name: 'Lead Spotlight',
      description: 'Founder bio panel with the rest of the roster beneath',
      component: TeamLeadSpotlight,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/team-lead-spotlight.svg',
      tags: ['featured', 'premium'],
      renderJSX: teamLeadSpotlightJSX,
    },
  ],

  'logo-cloud': [
    { id: 'logo-cloud:reveal-tiles', sectionType: 'logo-cloud', slug: 'reveal-tiles', name: 'Responsive logo tiles with restrained hover emphasis', description: 'Responsive logo tiles with restrained hover emphasis', component: LogoCloudRevealTiles, vfs: { mode: 'portable-recipe', certification: 'approved' }, source: {"origin":"21st","sourceId":"21st:18216","sourceUrl":"https://21st.dev/@nexus-ui/components/logo-clouds","author":"nexus-ui","derivation":"visual-reference","adaptationVersion":"2"}, generationStatus: 'preferred', thumbnail: '/variants/logo-cloud-reveal-tiles.svg', renderJSX: portableRecipeOnly },
    {
      id: 'logo-cloud:grid',
      sectionType: 'logo-cloud',
      slug: 'grid',
      name: 'Logo Grid',
      description: 'Evenly spaced bordered grid of partner marks',
      component: LogoCloudGrid,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/logo-cloud-grid.svg',
      tags: ['grid', 'classic'],
      renderJSX: logoCloudGridJSX,
    },
    {
      id: 'logo-cloud:marquee',
      sectionType: 'logo-cloud',
      slug: 'marquee',
      name: 'Logo Marquee',
      description: 'Continuous single-line rail of client logos',
      component: LogoCloudMarquee,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/logo-cloud-marquee.svg',
      tags: ['rail', 'motion'],
      renderJSX: logoCloudMarqueeJSX,
    },
    {
      id: 'logo-cloud:brand-lockup',
      sectionType: 'logo-cloud',
      slug: 'brand-lockup',
      name: 'Brand Lockup',
      description: 'Statement copy paired with a trust list of brands',
      component: LogoCloudBrandLockup,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/logo-cloud-brand-lockup.svg',
      tags: ['split', 'editorial'],
      renderJSX: logoCloudBrandLockupJSX,
    },
    {
      id: 'logo-cloud:wordmark-row',
      sectionType: 'logo-cloud',
      slug: 'wordmark-row',
      name: 'Wordmark Row',
      description: 'Quiet rule-topped band of centred client wordmarks',
      component: LogoCloudWordmarkRow,
      vfs: { mode: 'portable-recipe' },
      source: {
        origin: '21st',
        sourceId: '21st:26630',
        sourceUrl: 'https://21st.dev',
        author: '21st.dev community',
        license: 'MIT (21st.dev community default)',
        adaptationVersion: '1',
      },
      thumbnail: '/variants/logo-cloud-wordmark-row.svg',
      tags: ['row', 'quiet', 'trust'],
      renderJSX: logoCloudWordmarkRowJSX,
    },
  ],

  'blog-preview': [
    { id: 'blog-preview:four-columns', sectionType: 'blog-preview', slug: 'four-columns', name: 'Four-column article grid with image, metadata and linked title', description: 'Four-column article grid with image, metadata and linked title', component: BlogPreviewFourColumns, vfs: { mode: 'portable-recipe', certification: 'approved' }, source: {"origin":"21st","sourceId":"21st:1421","sourceUrl":"https://21st.dev/@tommyjepsen/components/blog-section","author":"tommyjepsen","derivation":"source-adaptation","license":"MIT","adaptationVersion":"2"}, generationStatus: 'preferred', thumbnail: '/variants/blog-preview-four-columns.svg', renderJSX: portableRecipeOnly },
    {
      id: 'blog-preview:editorial',
      sectionType: 'blog-preview',
      slug: 'editorial',
      name: 'Editorial Lead',
      description: 'Lead story beside a stacked list of recent posts',
      component: BlogPreviewEditorial,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/blog-preview-editorial.svg',
      tags: ['editorial', 'featured'],
      renderJSX: blogPreviewEditorialJSX,
    },
    {
      id: 'blog-preview:featured-grid',
      sectionType: 'blog-preview',
      slug: 'featured-grid',
      name: 'Featured Grid',
      description: 'Equal-weight card grid of latest articles',
      component: BlogPreviewFeaturedGrid,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/blog-preview-featured-grid.svg',
      tags: ['grid', 'cards'],
      renderJSX: blogPreviewFeaturedGridJSX,
    },
    {
      id: 'blog-preview:horizontal-rail',
      sectionType: 'blog-preview',
      slug: 'horizontal-rail',
      name: 'Horizontal Rail',
      description: 'Scrollable rail of compact post cards',
      component: BlogPreviewHorizontalRail,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/blog-preview-horizontal-rail.svg',
      tags: ['rail', 'compact'],
      renderJSX: blogPreviewHorizontalRailJSX,
    },
  ],

  'before-after': [
    { id: 'before-after:reveal-panel', sectionType: 'before-after', slug: 'reveal-panel', name: 'Keyboard-operable image comparison with selectable results', description: 'Keyboard-operable image comparison with selectable results', component: BeforeAfterRevealPanel, vfs: { mode: 'portable-recipe', certification: 'approved' }, source: {"origin":"21st","sourceId":"21st:24683","sourceUrl":"https://21st.dev/@motiondotdev/components/motion-image-reveal-slider","author":"motiondotdev","derivation":"visual-reference","adaptationVersion":"2"}, generationStatus: 'preferred', thumbnail: '/variants/before-after-reveal-panel.svg', renderJSX: portableRecipeOnly },
    {
      id: 'before-after:slider',
      sectionType: 'before-after',
      slug: 'slider',
      name: 'Reveal Slider',
      description: 'Draggable comparison of one hero transformation',
      component: BeforeAfterSlider,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/before-after-slider.svg',
      tags: ['interactive', 'featured'],
      renderJSX: beforeAfterSliderJSX,
    },
    {
      id: 'before-after:grid',
      sectionType: 'before-after',
      slug: 'grid',
      name: 'Paired Grid',
      description: 'Side-by-side pairs for multiple transformations',
      component: BeforeAfterGrid,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/before-after-grid.svg',
      tags: ['grid', 'volume'],
      renderJSX: beforeAfterGridJSX,
    },
    {
      id: 'before-after:case-study',
      sectionType: 'before-after',
      slug: 'case-study',
      name: 'Case Study',
      description: 'Narrative blocks pairing imagery with written detail',
      component: BeforeAfterCaseStudy,
      vfs: { mode: 'portable-recipe' },
      thumbnail: '/variants/before-after-case-study.svg',
      tags: ['editorial', 'premium'],
      renderJSX: beforeAfterCaseStudyJSX,
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

/** Resolve the canonical, deduplicated Radix dependency order for variants. */
export const getRequiredRadixPrimitives = (
  variantIds: Iterable<VariantId>,
): RadixPrimitiveId[] => {
  const required = new Set<RadixPrimitiveId>();
  for (const variantId of variantIds) {
    for (const primitive of getVariantById(variantId)?.radixPrimitives || []) {
      required.add(primitive);
    }
  }
  return RADIX_VFS_PRIMITIVES.filter((primitive) => required.has(primitive));
};

/** What the resolved composition needs from the experience (WebGL) layer. */
export interface ExperienceRequirement {
  /** Primitives belonging to variants that render live WebGL today. */
  enabledPrimitives: ExperiencePrimitive[];
  /** Primitives declared for a future phase; these grant no capability. */
  declaredPrimitives: ExperiencePrimitive[];
  /** Runtime capability ids the composition actually reaches today. */
  capabilities: string[];
}

/**
 * Resolve the experience dependency a set of active variants declares.
 * A declaration is inventory metadata, never an approval: only `enabled`
 * variants contribute a capability the launch may approve. Primitives come
 * from the design vocabulary entry each declaration names.
 */
export const resolveExperienceRequirement = (
  variantIds: Iterable<VariantId>,
): ExperienceRequirement => {
  const enabled = new Set<ExperiencePrimitive>();
  const declared = new Set<ExperiencePrimitive>();
  for (const variantId of variantIds) {
    const experience = getVariantById(variantId)?.experience;
    if (!experience) continue;
    const entry = getVocabularyEntry(experience.vocabulary.category, experience.vocabulary.id);
    if (!entry) continue;
    const target = experience.status === 'enabled' ? enabled : declared;
    for (const primitive of entry.primitives) target.add(primitive);
  }
  return {
    enabledPrimitives: EXPERIENCE_PRIMITIVES.filter((primitive) => enabled.has(primitive)),
    declaredPrimitives: EXPERIENCE_PRIMITIVES.filter(
      (primitive) => declared.has(primitive) && !enabled.has(primitive),
    ),
    capabilities: enabled.size > 0 ? [EXPERIENCE_CAPABILITY_ID] : [],
  };
};

const VARIANT_LAYOUT_ALIASES: Partial<Record<VariantId, readonly string[]>> = {
  'hero:image-stream': ['image-stream', 'stream', 'corridor'],
  'hero:prisma-cinematic': ['prisma-cinematic', 'cinematic'],
  'cta:signal-banner': ['signal-banner', 'signal'],
  'services:product-cards': ['product-cards', 'products'],
  'stats:metric-cards': ['metric-cards', 'cards'],
  'testimonials:marquee': ['marquee', 'scrolling'],
  'navbar:floating-pill': ['floating-pill', 'floating'],
  'pricing:feature-table': ['feature-table', 'table'],
  'footer:brand-social': ['brand-social', 'social'],
  'navbar:standard': ['standard'],
  'navbar:centered-logo': ['centered-logo'],
  'navbar:minimal-dark': ['minimal-dark'],
  'hero:centered': ['centered'],
  'hero:split-image': ['split', 'split-image'],
  'hero:full-bleed': ['full-bleed'],
  'hero:page-title': ['page-title'],
  'hero:editorial-banner': ['editorial-banner'],
  'hero:commerce-gradient': ['commerce-gradient'],
  'hero:showcase-panel': ['showcase-panel', 'showcase'],
  'features:bento-grid': ['bento', 'bento-grid'],
  'logo-cloud:wordmark-row': ['wordmark-row', 'wordmarks'],
  'services:card-grid': ['grid', 'card-grid'],
  'services:alternating': ['alternating'],
  'services:compact-list': ['list', 'compact-list'],
  'cta:centered': ['centered'],
  'cta:gradient-banner': ['gradient-banner'],
  'cta:split-card': ['split-card'],
  'contact:centered': ['centered'],
  'contact:split-card': ['split-card'],
  'contact:minimal-inline': ['minimal-inline'],
  'footer:columns': ['columns'],
  'footer:centered-minimal': ['centered-minimal'],
  'footer:dark-band': ['dark-band'],
  'gallery:collection-tiles': ['collection-tiles', 'tiles'],
  'gallery:editorial-mosaic': ['mosaic', 'editorial-mosaic'],
  'gallery:masonry': ['masonry'],
  'gallery:cinematic-grid': ['grid', 'cinematic-grid'],
  'gallery:lightbox-grid': ['lightbox', 'lightbox-grid'],
  'gallery:feature-split': ['feature-split', 'split'],
  'gallery:horizontal-reel': ['reel', 'horizontal-reel', 'filmstrip'],
  'testimonials:grid': ['grid'],
  'testimonials:rail': ['carousel', 'rail'],
  'testimonials:spotlight': ['single', 'spotlight'],
  'pricing:tiers': ['tiers', 'grid'],
  'pricing:comparison': ['comparison', 'matrix'],
  'pricing:accordion': ['accordion'],
};

export const getVariantIdForLayout = (
  sectionType: SectionType,
  layout?: string | null,
): VariantId | undefined => {
  if (!layout) return undefined;
  return getVariantsForSection(sectionType).find((variant) => (
    variant.slug === layout || VARIANT_LAYOUT_ALIASES[variant.id]?.includes(layout)
  ))?.id;
};

export const getLayoutForVariantId = (variantId: VariantId): string | undefined => (
  VARIANT_LAYOUT_ALIASES[variantId]?.[0] ?? getVariantById(variantId)?.slug
);

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

// ============================================================================
// Art Direction Packs
//
// A pack is the cohesion contract above theme tokens: per section type it
// declares the ordered family of variants it may use, AND the full aesthetic
// contract (type scale, rhythm, radius, border, surface, accent, media,
// motion) emitted as `--ut-*` tokens.
//
// The pack DATA lives in ./artDirectionPacks (React-free) so the Stage 4b CSS
// builder and the wizard worker can import it without pulling variant
// components into their bundles. It is re-exported here so
// `@/sections/variants` remains the single public entry point.
// ============================================================================

export type {
  ArtDirectionPackId,
  MotionProfileId,
  InteractionProfileId,
  SurfaceTreatment,
  AccentPolicy,
  MediaTreatment,
  RhythmId,
  ArtDirectionDesignContract,
  ArtDirectionSignature,
  GradientProfileId,
  DensityId,
  HeroLayoutId,
  PillStyleId,
  EntranceId,
  ArtDirectionPack,
  ArtDirectionResolutionInput,
} from './artDirectionPacks';

export {
  ART_DIRECTION_PACKS,
  ART_DIRECTION_PACK_IDS,
  DEFAULT_ART_DIRECTION_PACK_ID,
  resolveArtDirectionPackId,
  resolveArtDirectionPack,
  getArtDirectionPack,
  isArtDirectionPackId,
  buildArtDirectionTokens,
  buildArtDirectionCssDeclarations,
  buildEntranceKeyframes,
  resolveHeroPresentation,
} from './artDirectionPacks';

import type { ArtDirectionPack } from './artDirectionPacks';


/** Variants the pack allows for a section type, filtered to registered ids. */
export function familyForSection(pack: ArtDirectionPack, sectionType: SectionType): VariantId[] {
  const declared =
    sectionType === 'navbar' ? pack.navbarFamily
    : sectionType === 'footer' ? pack.footerFamily
    : pack.sectionFamilies[sectionType];
  if (!declared?.length) return [];
  return declared.filter((id) => id.split(':')[0] === sectionType && Boolean(getVariantById(id)));
}

/** The pack's first-choice variant for a section type, if it owns that family. */
export function preferredVariantForSection(
  pack: ArtDirectionPack,
  sectionType: SectionType,
): VariantId | undefined {
  return familyForSection(pack, sectionType)[0];
}

export function isVariantInFamily(
  pack: ArtDirectionPack,
  sectionType: SectionType,
  variantId: VariantId | undefined,
): boolean {
  if (!variantId) return false;
  return familyForSection(pack, sectionType).includes(variantId);
}

/**
 * Clamp a derived variant into the pack's compatible family.
 * Returns the original id when the pack declares no family for the section.
 */
export function clampVariantToPack(
  pack: ArtDirectionPack,
  sectionType: SectionType,
  variantId: VariantId | undefined,
): VariantId | undefined {
  const family = familyForSection(pack, sectionType);
  if (!family.length) return variantId;
  if (variantId && family.includes(variantId)) return variantId;
  return family[0];
}

/** New AI compositions use only executable 21st implementations. Saved IDs remain resolvable. */
export function getGenerationVariantsForSection(sectionType: SectionType, pack?: ArtDirectionPack, role?: string): SectionVariant[] {
  const eligible = getVariantsForSection(sectionType).filter(variant =>
    variant.source?.origin === '21st' && variant.vfs?.mode === 'portable-recipe' &&
    variant.vfs.certification === 'approved' && variant.generationStatus !== 'legacy' &&
    (!role || !variant.pageRoles?.length || variant.pageRoles.some(candidate => candidate === role)));
  const declared = pack ? familyForSection(pack, sectionType) : [];
  const compatible = eligible.filter(variant => declared.includes(variant.id));
  return compatible.length ? compatible : eligible;
}
