# Universal Intent System

Active reference, source-reviewed 2026-10-08. Canonical definitions live in `src/platform/core/coreIntents.ts` and `intentSurfaceRegistry.ts`; older `actionCatalog.ts` and legacy annotation examples are not current integration APIs.

## Contracts before execution

```text
Business capabilities + page/slot contracts
  → canonical IntentDef and binding identity
  → SiteBundleSnapshot / RuntimeManifest
  → data-ut-intent interaction
  → intent router/executor → validated handler/backend action
```

Definitions declare `triggerType` (`user-action`, `system-event`, `workflow-event`) and capability requirements. Wizard binds user-action intents only. Multi-capability intents retain `requiredCapabilities`; visual labels cannot replace those declarations.

The canonical runtime uses the existing `src/runtime/intentRouter.ts` and `intentExecutor.ts`, backed by platform definitions and manifest. Do not implement a parallel label-based action catalog or infer behavior on a first click. Runtime dispatch is not a new AI authoring step.

## DOM vocabulary and identity

Use canonical `data-ut-intent` values such as `nav.goto`, `cart.add`, `cart.checkout`, `booking.create` and the defined contact/account/UI actions. Consult the registry for exact supported IDs, trigger type and payload requirements; examples are not a complete catalog.

Legacy names such as `nav.goto_page`, `calendar.open`, `form.open`, `popup.open`, `checkout.start` and `external.open` must not be emitted as current DOM intents. Normalizers can accept compatibility input without making legacy vocabulary legal output.

Labels are presentation, slots are identity and intents are behavior. Bindings resolve using canonical section/slot identities and target page IDs, not `sourceLabel` or nearby wording. Interactive icons use the existing `InteractiveIcon`/IconIntentRegistry integration. Resource marks identify saved data, not visitor actions.

## Editing behavior

Every AI source save runs the intent-retarget check. A spacing, font, image or wording request must not silently move an existing destination. `agentOperations.propose_bind_intent` returns typed binding operations for a canonically identified selected control, rather than replacing its source label/href to bypass identity.

Scoped toolbar AI goes through the same Builder path. Deterministic section moves retain markup/destinations; unsupported route moves are refused when they cannot preserve existing links.

## Readiness and verification

Preview readiness and publish readiness are distinct. Publishing additionally requires complete required connections and non-stubbed business-critical capabilities. User-driven Builder source saves and accepted-revision restore do not require all unfinished publish connections to be complete, while source/preview validation still applies.

Post-commit probes can check that previously visible action attributes remain painted on the current route. This does not prove the handler executed, navigation reached its intended target or a form persisted. Full verification must exercise the real control and read back its outcome with the required session/context.

## Integrating a new action

Extend canonical definitions, schemas, binding policy and existing handler surfaces. Retain server authorization, site/capability validation, workflow requirements and input limits. Do not create browser privileges, custom hook files, a parallel router, label-driven bindings or automatic legacy overlays.

See [Architecture](ARCHITECTURE.md), [Agentic IDE](AGENTIC_IDE.md), [Preview runtime](PREVIEW_RUNTIME_ARCHITECTURE.md) and `src/platform/core/README.md`. Site-specific unconnected buttons remain publish blockers until wired and verified; this documentation refresh does not connect them.
