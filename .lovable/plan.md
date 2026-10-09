# Live Assets: one place to see and edit everything a site shows

## Goal
Every freshly launched site immediately has real, saved items (products, services, menu, forms, FAQs, testimonials, images, business details) that the AI and the Builder can read and edit live, per business and project. No duplicate editors.

## What the user will see
A single "Assets" panel in the Playground (replacing today's combined Products + Services tab), split into three groups:

```text
Assets
├─ Catalog      Live Products · Live Services · Live Menu · Live Pricing
├─ Content      Live Forms · Live FAQ · Live Testimonials · Live Images
└─ Business     Brand name · Logo · Tagline · Phone · Email · Address · Hours · Socials
```

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

## Order
1. Registry + storage gaps
2. Assets panel (replace old tab)
3. Launch seeding + marks
4. Remove duplicate editors, tests
