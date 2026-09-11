# Rebuild page composition, colour and component registries across every industry

## What the audit found

**1. Subpages are still derived from Home.** In the active scaffolder, Home keeps the selected template's sections, and every interior route is then built by filtering and rewriting that same Home inventory. Even with a seeded hero variant, each route is pushed back through one small geometry vocabulary and one shared hero-completion routine, so pages structurally converge again.

**2. Legacy substitution is live, not dead code.** When an industry has no first-class composition, template resolution silently falls through to the first composition of that industry, then the first layout-category match, then the first system-type match, then a fuzzy scan. Industries without their own composition therefore inherit another industry's site.

**3. Geometry is decided before design.** The generation brief seals a per-route hero geometry contract and the scaffolder applies it. AI can only decorate a hero someone else already shaped.

**4. Industry coverage is incomplete and inconsistent.** The matrix ships 11 industries; parity only enforces 9 (local-service and real-estate are unchecked). Recipes use a different vocabulary and are bridged by a hand map, so saas, agency, contractor and portfolio borrow another industry's recipes. Compositions exist for the wrong 9 — `fitness` and `photography` exist while local-service, real-estate, contractor and portfolio have none.

**5. Colour is flat.** Themes emit a base token set, but there is no per-industry, per-pack HSL system with tonal ranges, so every site reads bland regardless of the pack chosen.

**6. Component vocabulary is thin.** Sections have variants, but the smaller surfaces the eye actually reads — pills/badges, nav patterns, CTA blocks, menus, form layouts, booking surfaces, section positioning and rhythm — are not fully registered, so the compiler and AI both have very little to choose from.

## Plan

### Step 1 — Delete Home-derivation for subpages

Remove the "filter Home's sections" path entirely. Every non-home route resolves from its own page contract: role, purpose, narrative arc, eligible section families and eligible hero families. Home becomes just another route with its own contract, not the source others copy.

Add compile-time assertions: no interior route may share Home's section sequence, and no two sibling routes may share the same hero implementation + layout + media-treatment signature.

### Step 2 — Remove active legacy substitutions

Delete the template/category/system/fuzzy fallback ladder. A missing registered composition for a selected industry becomes a named build failure, not a silent swap. Isolate every remaining minimal-scaffold, default-CSS, router-derivation and preview-renormalization branch behind one explicit legacy-draft boundary, and add a test proving a sealed Wizard launch never touches it.

### Step 3 — Full HSL colour system per industry and pack

Extend the theme token layer so each art-direction pack emits a complete HSL scale rather than a handful of flat values:

- tonal ramps for background, surface, elevated surface, border and foreground,
- primary/secondary/accent each with hover, muted, subtle and contrast pairs,
- semantic state colours, and gradient/shadow/glow tokens derived from those hues,
- per-industry hue and saturation intent (for example: restaurant warm and saturated, saas cool and restrained, salon deep and luxurious, nonprofit humane and mid-saturation).

All values stay HSL in the global stylesheet and are consumed only through semantic tokens — no literal colour utilities anywhere in generated output. Contrast is asserted for every pack in both modes.

### Step 4 — Write the component registries in full

Register real, named implementations (not placeholders) for every interactive and structural surface, each with variants, eligible page roles, industry affinity, required intents and token-only styling:

- **Pills / badges** — status, category, price, availability, promo, rating.
- **Navbars** — standard, centred logo, split, transparent-over-hero, sticky compact, mega menu, mobile drawer.
- **Menus** — dropdown, mega, sidebar, filter, sort, account, cart.
- **CTAs** — inline band, split card, gradient banner, sticky bar, floating action, closing block.
- **Forms** — contact, quote request, lead capture, newsletter, multi-step intake, with layout and validation variants.
- **Booking** — calendar picker, service-and-time selector, staff selector, request-a-slot, confirmation surface.
- **Commerce** — product card, collection grid, cart drawer, checkout summary.
- **Section positioning** — a rhythm/spacing/alignment vocabulary (full-bleed, contained, offset, split, overlap, stacked band) so pages differ in structure and not only in copy.

Each entry declares its intents so wiring stays canonical, and each is materialized into the preview as a real recipe so nothing exists in the registry that cannot render.

### Step 5 — One industry list and complete per-industry coverage

Derive the shipped-industry list from the matrix so all 11 are enforced. For each: complete page contracts, capabilities and anchor capability, conversion journey declared in the intent profile, at least three allowed art packs, a first-class recipe set, and its own composition. Re-key `fitness` and `photography` as variations under coaching and portfolio. Parity fails the build on any gap, and a distinctness assertion prevents two industries compiling to the same experience.

### Step 6 — Replace strict geometry with bounded AI composition

Retire sealed hero geometry as an authoring authority. Keep only semantic and safety constraints: required content slots, valid intents, accessibility, media focal metadata, responsive bounds and token-only styling.

AI then composes freely inside the registered envelope — choosing hero and section implementations, section order and positioning rhythm, motion recipes, media treatment and copy for that industry, page role, pack and capability set. It emits a typed design proposal, never files. The proposal is validated against the registries, rejected on duplicate sibling signatures, and handed to the deterministic compiler. Stage 4b remains the sole materializer, and launch still completes deterministically if AI is unavailable.

### Step 7 — Certification

Run the certification matrix across all 11 industries × allowed packs, twice — AI off, then AI on:

- every route complete, distinct hero signature per sibling, no Home cloning, no duplicate sections,
- every registered component variant materialized and renderable,
- HSL token set complete with passing contrast,
- no placeholder leakage, no legacy branch activation,
- AI-on results stay inside the deterministic envelope.

### Step 8 — Then 3D and advanced motion

With certification green, add immersive and advanced-motion recipes one at a time through the existing variant registry and experience foundation, with reduced-motion and no-WebGL fallbacks, asset-failure recovery, bounded runtime budget, and industry/page-role eligibility so ordinary sites never install unused 3D.

## Senior-engineer additions

- **Signed page contracts.** Each route carries a signature of its resolved decisions so drift between compile, preview and commit is detectable rather than assumed.
- **Eligibility envelopes as data.** Industry × page role × pack × capability resolves to an explicit set of allowed implementations. AI and the deterministic compiler read the same envelope, which is what keeps them aligned.
- **Sibling-diversity budget.** A per-site budget over hero families, rhythms and media treatments, so variety is enforced numerically instead of hoped for.
- **Registry completeness gate.** CI fails if any registered implementation has no renderable recipe, or any renderable recipe is unregistered.
- **Contrast and motion budgets in CI.** Colour contrast and animation cost are checked per pack, not per page.
- **One boundary for legacy.** All migration behaviour lives behind a single explicit entry point that sealed Wizard drafts can never reach.

## Technical notes

- Authorities stay as-is: `industryMatrix.ts`, `industryIntentProfiles.ts`, `pageRecipes.ts`, `artDirectionPacks.ts`, `designImplementationRegistry.ts` as the derived facade, and the variant registry. No parallel registry is introduced.
- The template fallback ladder and the per-route hero geometry rewrite are retired from Wizard authorship once their registered replacements are wired.
- "AI composes freely" means freedom inside the registered eligibility envelope; tokens still own colour, spacing and materials.
- 3D and motion recipes register through the existing variant registry and snapshot-owned experience foundation; no alternate scene authoring pipeline.
