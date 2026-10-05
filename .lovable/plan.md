# Easy business setup + one home for products & services

## What's wrong today
- **The "Business system change required" card stops non-technical users.** It lists table names, packs, bindings and raw database code, and it shows up even for simple visual edits. The AI misread "make this a calendar…" (49% confidence) as a request for a full booking system.
- **Products and services have no visible home.** There's already a single place in the code that knows where every kind of item lives (products, services, menu, pricing plans), plus a canonical way to edit them. But:
  - no screen lets the owner manage them
  - the command-menu price editor I added last turn writes to the database on its own path instead of using that canonical one
- **Site pages aren't linked to the data.** Pages show typed-in text, not live items. So changing a price can only update the preview by find-and-replace.
- **DREAM. Design. has no products, services or links to data yet.** A real price edit can't be tested there until items exist.

## 1. Plain-language setup card (AI chat)
Replace the technical card with a short, friendly one:
- **Title:** "Turn on Bookings for your site?" (named after the feature, not the system)
- **One sentence on what the visitor gets:** "Visitors can pick a time and you'll get the request in your Leads."
- **Two buttons:** **Turn on** and **Not now**.
- **"Show details"** (collapsed) keeps the current table/database list for advanced users.
- When the AI is unsure (under 70% confidence), don't show the card. Ask one quick question instead: "Do you want a real booking system, or just a calendar-style design?"
- Pure design edits never trigger the card.
- Safe item-list setups (services, products, menu) turn on automatically when your Backend permission allows it. Bookings, payments and sign-in always ask first.

## 2. Products & Services panel (GoHighLevel-style)
A new **Catalog** button in the Builder top bar opens a side panel:
- **Tabs, shown only for the kinds this business uses:** Products, Services, Menu, Plans.
- **Each item is a row:** photo, name, price, visible on/off.
- **Click a price** to edit it in place, then press Enter to save.
- **Click the photo** to upload a new one (stored in your files) or paste a link.
- **"+ Add item"** creates a new row.
- **When the list is empty:** "No services yet. Add your first, or import the ones already on your site". Import reads the names and prices from the current page.
- Every save goes through the existing canonical catalog writer and is logged in the session Changes list.
- The command-menu price editor is rewired to the same writer. The parallel path I added last turn goes away.

## 3. Live preview reads the real data
- When items are imported or created, link the page's product/service section to that list, using the existing data-linking system.
- Linked sections show the live items, so a price or photo change appears in the preview without rewriting page code.
- Unlinked sections keep the current find-and-replace fallback, and the panel says "This page isn't linked yet — Link it".

## 4. End-to-end check
On DREAM. Design.:
1. Import its services.
2. Change one price and one photo.
3. Confirm the database record changed and the preview updated.
4. Reload the page and confirm both stay.

## Technical details
- **Single source for where items live:** `src/platform/core/catalogSurfaceRegistry.ts`. **Single writer:** `catalogOperations.updateCatalogItem` / `createCatalogRow`. Linking uses `sectionDataBindingService`.
- **Remove the parallel path:**
  - delete `agentOperations.update_catalog_item`, keeping a thin wrapper that calls `catalogOperations`
  - update the AGENTS.md rule
- **Photo uploads:** the existing private `user-files` bucket with signed URLs, or a new public `catalog-images` bucket so live sites can show photos. Images on a published site must be public, so this needs a bucket with a public-read policy.
- **Setup card:**
  - rewrite the `pendingCapabilityProposal` block in `AIBuilderPanel.tsx`
  - add a confidence threshold in front of `capabilityPlan`
  - auto-apply only for catalog packs when `canAutoApply('backend')`
- **New file:** `CatalogPanel.tsx` under `src/components/creatives/web-builder/`, built from existing UI parts (no new design system).
- **No breaking database changes.** Only possible addition: the public image bucket.
