

# Premium Industry Template Library for System Launcher

## Problem
Currently, only **1 actual HTML template** exists (Salon Luxury Premium). The System Launcher shows template cards for dozens of categories (Restaurant, E-commerce, Portfolio, etc.), but they all lack real HTML code. When users select them, the system either falls back to AI generation (inconsistent quality) or shows empty previews. There is no "gold standard" reference for AI to learn from.

## Solution
Build **3 premium, handcrafted HTML templates per industry** (8 industries x 3 = **24 total templates**) that:
- Follow the exact same structure as the existing `salon-luxury-premium` template
- Use the `ADVANCED_CSS`, `SCROLL_REVEAL_SCRIPT`, and `INTERACTIVE_SCRIPT` systems already in place
- Wire all CTAs with `data-ut-intent` and `data-ut-cta` attributes
- Include Lucide CDN icons, real Unsplash imagery, and industry-specific content
- Serve as both selectable starter templates AND reference material for AI generation

## Industry x Template Matrix

Each industry gets 3 distinct visual/structural variants:

| Industry | Template 1 (Dark Luxury) | Template 2 (Light Modern) | Template 3 (Bold Editorial) |
|---|---|---|---|
| **Salon/Spa** | Already exists | Light airy wellness | Bold magazine editorial |
| **Restaurant** | Dark fine dining | Bright casual bistro | Rustic farm-to-table |
| **Local Service** | Professional contractor | Friendly neighborhood | Emergency/urgent CTA |
| **E-commerce** | Dark fashion store | Clean product showcase | Bold lifestyle brand |
| **Coaching** | Premium executive | Warm approachable | Bold motivational |
| **Real Estate** | Luxury properties | Modern listings | Bold investment |
| **Portfolio/Creator** | Minimal dark showcase | Light gallery | Bold experimental |
| **Nonprofit** | Warm mission-driven | Clean institutional | Bold impact-focused |

## Architecture

### File Structure

```text
src/data/templates/
  salon/index.ts          (existing - add 2 more templates)
  restaurant/index.ts     (NEW - 3 templates)
  local-service/index.ts  (NEW - 3 templates)
  ecommerce/index.ts      (NEW - 3 templates)
  coaching/index.ts       (NEW - 3 templates)
  real-estate/index.ts    (NEW - 3 templates)
  portfolio/index.ts      (NEW - 3 templates)
  nonprofit/index.ts      (NEW - 3 templates)
  index.ts                (updated to aggregate all)
  types.ts                (updated with new categories)
```

### Template Structure Per File

Each industry file follows the proven `salon/index.ts` pattern:

1. **Industry-specific CSS overrides** (gradient colors, accent hues)
2. **3 complete HTML templates** with 8-12 sections each:
   - Navigation (sticky, with mobile menu)
   - Hero (industry-specific imagery + CTA)
   - Services/Features/Products grid
   - About/Trust section with stats
   - Gallery/Portfolio/Menu section (industry-specific)
   - Testimonials
   - Pricing/Packages (where applicable)
   - Contact/Booking form (wired with `data-ut-intent`)
   - Newsletter signup
   - Footer with hours, links, social
3. **Export as `LayoutTemplate[]`** with proper `id`, `category`, `systemType`, `tags`

### What Each Template Includes

Every template will have:
- Full `<!DOCTYPE html>` document via `wrapInHtmlDoc()`
- `ADVANCED_CSS` for glassmorphism, shadows, animations
- `SCROLL_REVEAL_SCRIPT` for IntersectionObserver animations
- `INTERACTIVE_SCRIPT` for tabs, carousels, accordion, smooth scroll
- Lucide CDN (`<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js">`) with `lucide.createIcons()` init
- Industry-specific Unsplash photo IDs (not generic placeholders)
- Realistic business content (names, prices, descriptions, testimonials)
- Proper `data-ut-intent` wiring on all conversion CTAs
- `data-no-intent` on UI controls (tabs, filters, accordions)
- `data-ut-section` labels for AI editing context
- Responsive design (mobile-first with `md:` and `lg:` breakpoints)

## Implementation Steps

### Step 1: Update `types.ts`
Add missing `LayoutCategory` values for the new industries so the type system covers all template folders.

### Step 2: Create Industry Template Files (7 new files)
Each file contains 3 complete HTML templates following the salon pattern. Templates are premium quality with:
- Dark/Light/Bold visual variants
- Industry-appropriate color schemes from `extendedIndustryProfiles.ts` palettes
- Real Unsplash images tagged to each industry
- Complete interactive functionality (forms, accordions, tabs, carousels)

### Step 3: Add 2 More Salon Templates
The existing salon file has 1 template. Add 2 more variants (Light Wellness + Bold Editorial) to match the 3-per-industry standard.

### Step 4: Update `index.ts` Aggregation
Import all new industry template arrays and merge them into `layoutTemplates`. Update `getTemplatesByCategory` and `getTemplatesBySystem` to correctly resolve the new templates.

### Step 5: Ensure Manifest Coverage
Verify every new template ID has a corresponding entry in `manifest.ts`. Add any missing manifest entries so the System Launcher correctly provisions backend resources.

### Step 6: Update System Launcher Integration
Ensure `SystemLauncher.tsx` properly surfaces the new templates when a user selects each business system type. The category filter and template count should reflect the expanded library.

### Step 7: Feed Templates to AI Generation
Update `systems-build` edge function to optionally load the closest matching template HTML from the frontend template library as a "reference example" in its prompt, giving AI a concrete quality baseline to match or exceed.

## Technical Details

### Template ID Convention
```text
{industry}-{variant}-{descriptor}
Examples:
  restaurant-dark-fine-dining
  restaurant-light-casual-bistro
  restaurant-bold-farm-table
  ecommerce-dark-fashion
  coaching-premium-executive
```

### Intent Wiring Per Industry

| Industry | Primary Intent | Secondary Intents |
|---|---|---|
| Salon/Spa | `booking.create` | `contact.submit`, `newsletter.subscribe` |
| Restaurant | `booking.create` | `contact.submit`, `newsletter.subscribe` |
| Local Service | `quote.request` | `contact.submit`, `booking.create` |
| E-commerce | `newsletter.subscribe` | `contact.submit` |
| Coaching | `booking.create` | `contact.submit`, `newsletter.subscribe`, `quote.request` |
| Real Estate | `contact.submit` | `quote.request`, `newsletter.subscribe` |
| Portfolio | `contact.submit` | `quote.request` |
| Nonprofit | `contact.submit` | `newsletter.subscribe` |

### Image Strategy

Each industry uses curated Unsplash photo IDs for consistent, high-quality imagery:
- Restaurant: Food plating, dining ambiance, chef action shots
- Local Service: Workers on-site, tools, before/after transformations
- E-commerce: Product flat-lays, lifestyle shots, packaging
- Coaching: Professional headshots, workshop settings, success imagery
- Real Estate: Property exteriors, interiors, aerial views
- Portfolio: Creative work samples, studio shots, process imagery
- Nonprofit: Community impact, volunteers, beneficiary stories

## Expected Outcome

- **24 total production-ready templates** available in System Launcher
- Each industry has 3 visually distinct options (dark luxury, light modern, bold editorial)
- AI systems can reference these templates as quality baselines
- Users see real previews instead of empty placeholders
- All templates are backend-wired and ready for production deployment

