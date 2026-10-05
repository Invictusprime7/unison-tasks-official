# Easy business setup + one home for products & services

## What's wrong today
- **The "Business system change required" card stops non-technical users.** It lists table names, packs, bindings and raw database code, and it shows up even for simple visual edits. The AI misread "make this a calendar…" (49% confidence) as a request for a full booking system.
- **Products and services have no visible home.** There's already a single place in the code that knows where every kind of item lives (products, services, menu, pricing plans), plus a canonical way to edit them. But:
  - no screen lets the owner manage them
  - the command-menu price editor I added last turn writes to the database on its own path instead of using that canonical one
- **Site pages aren't linked to the data.** Pages show typed-in text, not live items. So changing a price can only update the preview by find-and-replace.
- **DREAM. Design. has no products, services or links to data yet.** A real price edit can't be tested there until items exist.

## 1. Conversational setup in the chat (replaces the technical card)
The AI asks for what it needs as part of the conversation, and does all the building itself:
- **No more blocking card.** When an edit needs something new on the business side (bookings, a service list, a contact form inbox), the AI replies in the chat with a short message and **answer controls right inside the message**:
  - "To take real bookings, I'll set up appointments for you. Which days are you open?" → day chips plus a time field
  - "Should new requests go to your email?" → **Yes / No** buttons, with an email box prefilled from your account
  - "Turn on Bookings?" → **Turn on** / **Just the design for now**
- **When the AI is unsure** (under 70% confidence), it asks one plain question with choice buttons ("A real booking system" / "Just a calendar look") instead of guessing.
- **After you answer,** the AI sets up the business side, builds the matching page changes, links the buttons, and reports each step in the activity list. You never see tables or code. A collapsed "Show details" stays available.
- **Saved with the conversation.** Questions, your answers, and where the setup got to are stored in the chat history. Reloading, or opening the site on another device, picks up exactly where it stopped, with any unanswered question still answerable.
- **Safety stays the same:**
  - pure design edits never trigger setup
  - item lists (services, products, menu) turn on automatically when your Backend permission allows it
  - bookings, payments and sign-in always need your "Turn on" answer first

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
- **Conversational setup:**
  - Chat messages gain an optional `ask` payload: question id, kind (`choice` | `confirm` | `text` | `days`), options, answer, status. It's stored inside the existing `builder_chat_history.messages` JSON, so no database change is needed.
  - `pendingCapabilityProposal` becomes derived from the latest unanswered setup message, not from in-memory-only state.
  - Answers feed `capabilityPlan` settings and then `onApproveCapabilityPlan`. After that, the AI's normal edit authors the page changes through `runBuilderAiMutation` → `commitMutation`.
  - Confidence gate sits in front of `capabilityPlan`. Auto-apply only for catalog packs when `canAutoApply('backend')`.
- **New file:** `CatalogPanel.tsx` under `src/components/creatives/web-builder/`, built from existing UI parts (no new design system).
- **No breaking database changes.** Only possible addition: the public image bucket.
