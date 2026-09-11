# Industry composition activation

New template projects resolve registered section variants and executable visual adapters in the canonical compiler. The policy is `maximum-compatible`: richer compatible variants, section reveals, decorative scene backdrops, and immersive galleries with a Radix photo-gallery tab. Theme tokens, section identity, authored content, and canonical action bindings remain authoritative.

The presence of a VFS library module does not activate it. Only reachable imports contribute runtime packages. The existing capability envelope and scene limits constrain selection. Unsupported vocabulary is reported without generating placeholder implementations. Model-backed recipes are not selected automatically without an executable adapter and assets.

## Existing projects

Open the builder's **Health** tab and choose **Review enhancements**. The dialog lists affected sections and custom pages requiring manual replacement, then loads the finalized candidate through the existing Sandpack preview component. **Apply enhancements** becomes available after preview readiness.

Review uses an isolated compiler dry run. The working VFS stays intact if generation, preflight, or preview fails. Acceptance validates project, business, user, draft, parent revision, original VFS hash, and candidate hash, then submits the exact reviewed files through `commitMutation` and the existing atomic revision RPC. Concurrent edits require a fresh review.

Compiler ownership is checked against source fingerprints that exclude serialized content data. Custom renderers and modified shared components are skipped conservatively. Upgrades patch the compiler's rendering seams; they do not replace shared custom code or content with samples. AI content edits cannot replace composition records or remove resolved adapters. Later variant changes update authored section data in place.

**Undo enhancement** restores the previous revision as a new revision. It refuses an immediate undo after later edits; revision history remains available to review older versions after reload. No database migration or backend automation activation is required.

## Coverage and verification

**Download coverage** separates available modules, selected implementations and provenance, reachable imports, exclusion reasons, and browser evidence. A report with no browser evidence says `not-run`; source reachability is never presented as a passed browser test.

Generate the complete compilation matrix and local browser fixtures in PowerShell:

```powershell
$env:COMPOSITION_ARTIFACTS='1'
npx vitest run src/test/compositionActivation.test.ts
Remove-Item Env:COMPOSITION_ARTIFACTS
```

The ignored `.artifacts/composition/coverage.json` contains every registered template. Browser fixtures use finalized canonical snapshots and the generated runtime package versions. Install the fixture-only renderer dependencies and start the harness:

```powershell
npm install --prefix .artifacts/composition/browser --no-save --package-lock=false react@19.2.0 react-dom@19.2.0 three@0.180.0 @react-three/fiber@9.3.0 @react-three/drei@10.7.0
npx vite --config scripts/composition-browser.config.mjs
```

In another terminal:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-composition-browser.ps1
```

The script records observed checks in `.artifacts/composition/browser-checks.json`: desktop/mobile layout, gallery dialog and keyboard navigation, focus restoration, mobile navigation, FAQ expansion, canonical action attributes, reduced motion, unavailable WebGL, and failed model loading. Remote image failures use the DOM fallback instead of unmounting the site.

The browser harness verifies the compiled site output. Review lifecycle and revision persistence have component tests and service integration tests; they do not substitute for an authenticated production acceptance test. Roll out only after the compilation matrix and representative browser flows pass.
