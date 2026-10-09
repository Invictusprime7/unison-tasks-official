# Live Assets: one place to see and edit everything a site shows

## Goal
Every freshly launched site immediately has real, saved items (products, services, menu, forms, FAQs, testimonials, images, business details) that the AI and the Builder can read and edit live, per business and project. No duplicate editors.

## Playground layout
```text
Build   Pages · Layers · Design
Manage  Assets      Catalog · Content · Business · Media
        Operations  Bookings · Reservations · Calendar · Orders · Leads
```
Operations reuse the existing booking, order and lead views; nothing new is stored for them.

## Real appearance, not generic tiles
When an item already appears on the site, the Assets panel shows it the way the site draws it (a live snippet of that section from the preview), with its edit fields beside it. Items not yet placed show a simple row with "Place on page".

## What the user will see
A single "Assets" panel in the Playground (replacing today's combined Products + Services tab), split into three groups:

```text
Assets
├─ Catalog      Live Products · Live Services · Live Menu · Live Pricing
├─ Content      Live Forms · Live FAQ · Live Testimonials · Live Images
└─ Business     Brand name · Logo · Tagline · Phone · Email · Address · Hours · Socials
```

- Catalog and Content also include, when relevant: Portfolio Projects, Case Studies, Team, Gallery, Offers.
- **Relevant only:** the panel shows the asset types the generated site actually uses (from its pages' sections), ranked by its industry. A salon sees Services, Team, Gallery; an agency sees Case Studies, Portfolio, Testimonials; a restaurant sees Menu. Other types sit under a collapsed "Add more" list instead of cluttering the panel.
- Each list shows saved items with inline edit, add, remove, reorder and a "Live" dot when the item appears on a page.
- Clicking an item highlights where it shows in the preview; clicking a marked element in the preview opens it here.
- Edits save to the item itself and the preview refreshes only the sections using it.
- Content items show Draft / Published.

## Fresh launch = live assets
After a site is generated and its first version is saved, the launch step writes the items the AI put on the pages into the database (once, never overwriting existing items):
- Catalog items from the generated product/service/menu/pricing sections.
- Forms from the generated contact/quote/booking forms.
- FAQ and testimonials as published content.
- Generated and uploaded images as image assets.
- Business details from the wizard (name, logo, phone, email, address).
Pages then carry the item marks so click-to-edit and the AI find them.

## Storage (reuse, no parallel tables)
| Group | Asset | Home |
|---|---|---|
| Catalog | Products, Services, Menu, Pricing | existing catalog tables |
| Content | FAQ, Testimonials | existing content entries / testimonials (one chosen, the other retired) |
| Content | Forms | existing form definitions; submissions stay in leads |
| Content | Images | existing files store, tagged per project |
| Business | Name, logo, contact, hours, socials | existing business profile |

Only gap fixes are added (e.g. a project column or image tag where missing). Nothing is merged into one big table.

## Removing duplicates
- One editor per asset type: the Assets panel, the toolbar "Edit saved item" and Business Catalog page all use the same shared resource actions.
- The old Products/Services tab and any second catalog editor are removed.
- Testimonials: keep one source of truth and point the other path at it.

## Technical details
- Extend the resource registry with `form`, `image`, `faq`, `testimonial` definitions and an `group: 'catalog' | 'content' | 'business'` field; all reads/writes go through `resourceRuntime` (`queryResource` / `applyResourceOp`).
- New `AssetsPanel` composed from existing UI pieces, replacing the CONTENT tab in `CreatorPlaygroundPanel`; subscribes to resource invalidation for live updates.
- New launch step `seedLaunchAssets` in the orchestrator after the accepted revision: parses the committed candidate's section data, writes through resource actions (idempotent by business + project + slug), then annotates `data-ut-resource` marks via one follow-up commit through `commitMutation`.
- Migration only for missing scoping columns/indexes plus GRANTs and RLS via `is_business_member`.
- AI context: list_resources returns counts per group so the AI knows assets exist.
- Tests: registry covers all groups; seeding is idempotent; published mode hides drafts; panel edit invalidates only matching sections.

- Playground API: a thin facade over resourceRuntime, preview runtime and asset storage; it stores nothing itself.
- RenderedResourceIndex: built from `data-ut-resource` marks in the current preview, mapping record -> page/section/selector, used for the live snippet (rendered via the preview runtime in single-section mode) and the "Live" dot.

## Order
1. Registry + storage gaps
2. Assets panel (replace old tab)
3. Launch seeding + marks
4. Remove duplicate editors, tests
