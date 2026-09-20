# Homepage-led immersive site generation

## Goal
Make the Launch Wizard generate a complete four-page site in two stages: a homepage establishes the visual system, then About, Services, and Contact inherit that system while receiving distinct, role-appropriate compositions. Eligible launches also receive one interactive 3D homepage scene and one separately routed immersive experience, both guarded by Unison capability, accessibility, and performance rules.

## Implementation

1. **Make the four-page architecture explicit**
   - Normalize Wizard topology to include Home, About, Services, and Contact for this generation flow.
   - Keep PageRegistry, SiteTopology, router, VFS files, navigation, and canonical descriptors synchronized.
   - Add an `immersive` route role that is created only when the sealed experience capability is approved; keep it out of ordinary launches and expose it in navigation only when enabled.

2. **Separate architecture inheritance from composition reuse**
   - Extend the homepage visual-language record with reusable architecture rules: shared chrome, token palette, typography tiers, spacing rhythm, surface treatment, and contrast posture.
   - Preserve exact navbar/footer identity across pages.
   - Stop forcing repeated body families to reuse the homepage variant. About, Services, and Contact will choose certified role-appropriate variants and section orders while inheriting the homepage architecture and tokens.
   - Encode this distinction in the same machine-rendered contracts used by both Wizard AI functions and their validators.

3. **Add the homepage 3D scene**
   - Promote the existing canonical experience layer from a decorative sphere into a deliberate, interactive procedural scene driven only by Stage 4b tokens.
   - Keep DOM copy and actions accessible above the scene.
   - Add pointer-responsive depth/orbit motion, frame-rate-independent animation, local lighting, stable framing, and a reduced-motion/WebGL fallback.
   - Mount it only when the homepage envelope, registered implementation requirement, approved capability, and canvas budget all pass.

4. **Wire the gated immersive page**
   - Add a canonical immersive page composition using the existing experience facade rather than direct Three.js imports.
   - Link the homepage to it with a canonical navigation intent only when the page exists.
   - Stamp the route, page identity, experience instances, approved capability, and performance budget into the sealed snapshot.
   - Ensure unavailable WebGL, reduced motion, missing assets, or budget exhaustion fall back to accessible DOM/media without breaking navigation.

5. **Generate distinct About, Services, and Contact pages**
   - Author the homepage alone first.
   - Generate the remaining pages in a later batch from their own role contracts and section inventories.
   - Reuse shared architecture and visual tokens, not identical page compositions.
   - Preserve business content, canonical section IDs, intents, and data bindings.

6. **Review spacing and contrast across every page**
   - Add canonical source-level checks for section/container rhythm, token-only spacing, foreground/background contrast roles, one H1, and mobile overflow risk.
   - Record page-level findings in the existing visual-quality report and permit one focused AI repair without making launch availability depend on AI.
   - Verify Home, About, Services, Contact, and the gated immersive route at desktop and mobile sizes.

## Technical constraints
- Stage 4b remains the only theme authority; no hardcoded palette or spacing values in generated pages.
- Generated pages may access 3D only through `@/unison/ui/experience`.
- Preserve the existing React 19 generated-runtime pins, two-canvas page budget, six-scene site budget, reduced-motion fallback, and WebGL fallback.
- The canonical compiler remains authoritative for topology, router, shared files, capability approval, snapshot sealing, preview, and publish.
- AI composition and enrichment remain optional: invalid or unavailable AI output keeps the deterministic compiled pages.

## Acceptance
- A new eligible Wizard launch produces routable Home, About, Services, Contact, and Immersive pages; an ineligible launch produces the four standard pages only.
- Home is authored first and establishes a recorded architecture signature.
- Shared chrome, tokens, spacing system, and contrast posture match across pages, while body section order and certified variants differ by page role.
- The homepage scene responds to pointer movement; the immersive page is interactive; both fall back cleanly for reduced motion and no WebGL.
- PageRegistry, SiteTopology, VFS, router, resolved compositions, experience manifest, preview, and publish agree byte-for-byte.
- Focused tests, full test suite, type checks, build, and desktop/mobile browser screenshots pass.
