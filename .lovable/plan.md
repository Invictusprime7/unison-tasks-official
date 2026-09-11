# Unison: real per-page design, full component registries, all industries

## Root cause of the repeating heroes (confirmed by tracing the live path)

The pipeline already computes a different hero per route — a per-page variant id, rotated media, page-specific headline, badge, CTAs and proof stats. The variance is real and reachable. It is then **thrown away at the last step**:

- The generated `Hero.tsx` module written into the site's own file system takes no variant id at all. It branches only on a narrow `layout` prop that collapses to `centered | split | full-bleed`, so five registered hero designs render as two or three shapes, with `centered` as the near-universal default.
- Every other section family's generated module *does* receive the variant id and look it up. Hero is the single family that discards it.
- The in-app preview renderer uses the correct variant-registry lookup, so preview and shipped site disagree. Two hero authorities exist; the one that ships is the broken one.
- Home is explicitly excluded from any variant or media rotation, and no industry template ever authors a hero variant. So every business in the same industry gets a byte-identical home hero, and interior pages inherit that same collapsed shape.

That is the whole "why does this keep recurring". It was never fixed because each pass fixed the resolution layer, not the emitter.

Second, structural cause: `resolveActiveTemplate()` still falls back from the selected template to the first industry composition, then a layout category, then a system type, then a fuzzy match. Industries with no first-class composition silently borrow another industry's site.

## Plan

### Step 1 — Make the emitter variant-aware and delete the home-clone rules

- The generated hero module receives and honours the variant id exactly like every other family: registry lookup, real component per variant, no `layout`-only switch.
- Remove the home exclusion. Home resolves its hero from the same seeded, role-eligible pool as every other route, so two businesses in one industry no longer open identically.
- Remove the "interior page derives from Home's sections" derivation and the hardcoded per-role section pools. Each route composes from its own contract.
- Retire the fallback ladder in template resolution. A missing registered composition is a named failure, not another industry's template.
- Add assertions: sibling routes may not share a hero implementation + layout + media-treatment signature, and no interior page may reproduce Home's section sequence.

### Step 2 — Colour depth through HSL tokens

Art packs currently resolve a flat token set, which is why output reads bland. Extend the token contract each pack emits, all in HSL, all semantic:

- full ramps rather than single stops (surface levels 1–4, foreground levels, border/hairline, overlay/scrim),
- accent system: accent, accent-soft, accent-strong, accent-contrast, plus a declared accent policy per pack,
- state colours derived from the base ramp: hover, active, focus ring, selected, disabled,
- gradients and shadows composed *from* those tokens, so they retheme automatically,
- guaranteed contrast pairing for every foreground/background combination, asserted at compile time.

Components consume tokens only. No literal colour ever reaches a generated page.

### Step 3 — Write every component registry out in full

Today several families resolve to placeholders or a single shape. Each family gets a complete, registered, materialized inventory with real variants, declared page-role and industry eligibility, art-pack compatibility, intent slots and editable slots:

- Navbar: standard, centered-logo, minimal, split-utility, mega-menu, sticky-condensing, mobile drawer behaviour.
- Hero: all five existing plus statement, editorial split, offset media, proof-led, and (later) immersive.
- Buttons and pills: variants, sizes, icon placement, pill/rounded/square driven by pack geometry, loading and disabled states.
- Menus: dropdown, mega, sidebar, filter, sort, account, cart — each wired to canonical intents.
- CTA bands, services, features, pricing, testimonials, gallery, team, stats, FAQ, about, contact, footer, logo cloud, blog preview, before/after: real variants each, no placeholder aliases.
- Section positioning as first-class data: band rhythm, vertical density, alignment, container width, overlap/bleed, divider treatment, sticky and scroll behaviour — all token-driven.

### Step 4 — One industry list, enforced

The industry matrix becomes the single shipped list. The parity check is derived from it and fails the build when an industry lacks an anchor capability, conversion journey, profile fields, intent profile, recipe, compositions, or at least three registered art packs. `local-service` and `real-estate` join the enforced set.

### Step 5 — Per-industry completeness

For every industry: complete page contracts, capabilities and anchor capability, journey steps present in the intent profile, first-class page recipes instead of borrowed ones, and its own home plus interior compositions. Re-key `fitness` and `photography` as variations under coaching and portfolio. Distinctness is asserted so no two industries compile to the same experience.

### Step 6 — Replace strict geometry with bounded AI composition

Remove sealed per-route hero geometry as an authoring authority. Keep only semantic and safety constraints: required content slots, valid intents, accessibility, media focal metadata, responsive bounds, token-only styling.

AI then composes freely *inside* the registered envelope — choosing hero and section implementations, ordering, motion recipes, media treatment and supported layout props for that industry, role, pack and capability set. It returns a typed design proposal, never files. The proposal is validated against the registries, rejected on duplicate sibling signatures, and compiled deterministically. Launch still succeeds fully without AI.

### Step 7 — Certification

Walk all industries × allowed packs with AI off: complete routes, distinct hero signatures per sibling, no duplicate sections, no home cloning, every variant materialized, themed CSS present, contrast passing, no placeholder leakage, no legacy branch entered. Repeat with AI on and prove proposals stay inside the envelope.

### Step 8 — Then 3D and motion (guidebook Phase 6A)

Only after Step 7 is green. One complete immersive recipe end-to-end first, registered like any other variant, with reduced-motion and no-WebGL fallbacks, asset-failure recovery, bounded performance budget, and industry/page-role eligibility so ordinary sites never carry unused 3D. Advanced motion follows as declared, deterministic motion recipes.

## Senior-engineering additions I recommend

- **Signature-based duplication guard, not eyeballing.** Every emitted page carries a composition signature; the compiler refuses a site where two sibling routes match. This makes "identical pages" impossible to reintroduce rather than something we notice later.
- **Golden-output snapshots per industry.** Commit the generated composition descriptors for one seed per industry. Any pipeline change that flattens design shows up as a reviewable diff.
- **One emitter, no second authority.** The preview renderer and the generated module must resolve variants through the same registry call. The hero bug existed only because two paths were allowed.
- **Contrast and token lint at compile time.** A page fails the build on a literal colour or an unreadable pair, the same way a syntax error fails.
- **Capability-eligibility on every variant.** A variant declares which industries, page roles, packs and capabilities it is valid for, so eligibility is data the AI reads rather than prose in a prompt.

## Technical notes

- Authorities stay as they are: the industry matrix, intent profiles, page recipes, art-direction packs, the variant registry, and the derived design-implementation facade. No new parallel registry.
- The generated hero module gains the same variant-dispatch shape the other families already use; the narrow layout map is retired.
- The template fallback ladder and the sealed hero-geometry rewrite are removed from wizard authorship once their registered replacements are wired — not replaced by another standalone resolver.
- "AI composes freely" means freedom inside the registered eligibility envelope. Tokens still own colour, spacing and material; AI owns composition.
