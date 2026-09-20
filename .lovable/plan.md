# Homepage-led immersive site generation

## Goal
Make the Launch Wizard generate each user-selected page in two stages: the selected homepage establishes the holistic content and visual system, then every other selected route inherits that context while receiving a unique, need-specific composition. Never add fixed About, Services, Contact, or other routes unless the user selected them. Eligible launches may also receive one interactive 3D homepage scene and one separately routed immersive experience when the selected needs call for it, both guarded by Unison capability, accessibility, and performance rules.

## Implementation

1. **Keep Wizard-selected architecture authoritative**
   - Generate only the page routes users select in the Wizard; do not insert a fixed page set.
   - Carry each selected page's intended needs, role, industry context, goals, and required intents through PageRegistry, SiteTopology, composition, VFS files, navigation, and canonical descriptors.
   - Add an immersive route only when the user selected a need that resolves to it and the sealed experience capability is approved; keep it absent otherwise.

2. **Separate architecture inheritance from composition reuse**
   - Extend the homepage language record with its holistic content model and reusable architecture rules: shared chrome, token palette, typography tiers, spacing rhythm, surface treatment, contrast posture, messaging hierarchy, and media posture.
   - Preserve exact navbar/footer identity across pages.
   - Stop forcing repeated body families to reuse the homepage variant. Each selected route chooses certified, role-appropriate variants and section order from its own selected needs while inheriting the homepage system.
   - Encode this distinction in the same machine-rendered contracts used by both Wizard AI functions and their validators.

3. **Add the homepage 3D scene**
   - Promote the existing canonical experience layer from a decorative sphere into a deliberate, interactive procedural scene driven only by Stage 4b tokens.
   - Keep DOM copy and actions accessible above the scene.
   - Add pointer-responsive depth/orbit motion, frame-rate-independent animation, local lighting, stable framing, and a reduced-motion/WebGL fallback.
   - Mount it only when the homepage envelope, registered implementation requirement, approved capability, and canvas budget all pass.

4. **Wire the gated immersive page when selected**
   - Add a canonical immersive page composition using the existing experience facade rather than direct Three.js imports.
   - Create and link it only when the user's selected needs include the immersive experience and the page exists.
   - Stamp the route, page identity, experience instances, approved capability, and performance budget into the sealed snapshot.
   - Ensure unavailable WebGL, reduced motion, missing assets, or budget exhaustion fall back to accessible DOM/media without breaking navigation.

5. **Generate every selected route contextually**
   - Author the homepage alone first.
   - Generate the remaining selected pages in later batches from their own page-needs contracts, role contracts, and section inventories.
   - Derive each page's messaging, content hierarchy, proof, media, and actions from the homepage's holistic business context and the page's selected purpose.
   - Reuse shared architecture and visual tokens, not identical page compositions or static pre-made page bodies.
   - Preserve canonical section IDs, intents, data bindings, and industry-specific relevance.

6. **Review spacing and contrast across every page**
   - Add canonical source-level checks for section/container rhythm, token-only spacing, foreground/background contrast roles, one H1, and mobile overflow risk.
   - Record page-level findings in the existing visual-quality report and permit one focused AI repair without making launch availability depend on AI.
   - Verify the homepage, every selected route, and any gated immersive route at desktop and mobile sizes.

## Technical constraints
- Stage 4b remains the only theme authority; no hardcoded palette or spacing values in generated pages.
- Generated pages may access 3D only through `@/unison/ui/experience`.
- Preserve the existing React 19 generated-runtime pins, two-canvas page budget, six-scene site budget, reduced-motion fallback, and WebGL fallback.
- The canonical compiler remains authoritative for topology, router, shared files, capability approval, snapshot sealing, preview, and publish.
- AI composition and enrichment remain optional: invalid or unavailable AI output keeps the deterministic compiled pages.

## Acceptance
- A Wizard launch produces exactly the routes selected by the user, plus an immersive route only when explicitly need-derived and capability-approved.
- Home is authored first and establishes a recorded architecture signature.
- Shared chrome, tokens, spacing system, content context, and contrast posture match across pages, while body section order and certified variants differ by selected page need and role.
- No generated page body is copied from a static pre-made route body; every page is generated from the selected need, industry context, canonical registries, and homepage context.
- The homepage scene responds to pointer movement; the immersive page is interactive; both fall back cleanly for reduced motion and no WebGL.
- PageRegistry, SiteTopology, VFS, router, resolved compositions, experience manifest, preview, and publish agree byte-for-byte.
- Focused tests, full test suite, type checks, build, and desktop/mobile browser screenshots pass.
