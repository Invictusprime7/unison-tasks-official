# Unison documentation

Reviewed 2026-10-08. Start here rather than applying old launch or provider instructions. “Implemented” describes source availability; it does not certify a full live workflow or current hosted deployment.

## Current architecture and integration guides

| Guide | Scope |
| --- | --- |
| [Architecture](ARCHITECTURE.md) | Ownership, launch candidate, revision spine, design, editing and open gates |
| [Agentic IDE](AGENTIC_IDE.md) | AI/toolbar/terminal/command menu, node actions, activity and browser limitations |
| [Resource Runtime](RESOURCE_RUNTIME.md) | Catalog, content and Business Profile Resource, marks, invalidation and Undo |
| [Preview runtime](PREVIEW_RUNTIME_ARCHITECTURE.md) | Current Sandpack projection, status and verification boundaries |
| [VFS preview](VFS_PREVIEW_ARCHITECTURE.md) | File preparation and accepted-source authority |
| [Build to Canvas](BUILD_TO_CANVAS_WORKFLOW.md) | Canvas/Split workflow and editing boundaries |
| [Integration guide](INTEGRATION_GUIDE.md) | Existing integration seams; no parallel authors/writers |
| [Universal intents](UNIVERSAL_INTENT_SYSTEM.md) | Canonical DOM vocabulary, identity, execution and readiness |
| [AI providers](ai-providers.md) | Task-specific routing, model configuration, deadlines and quota limits |
| [AI setup](AI_SETUP_GUIDE.md) | Managed/local setup and failure diagnosis |
| [Frontend configuration](vercel-env-setup.md) | Public configuration and server-secret boundaries |
| [Affinity](UNISON_AFFINITY.md) | Internal deterministic planning reference; not byte-identical AI generation |

See the [product README](../README.md) and [roadmap](../roadmap.md). Directory READMEs and `AGENTS.md` rules document their local contracts; actual invoked source remains the implementation evidence.

## Historical plans, reports and evidence

Dated launch plans, migrations, recovery reports, milestone audits and provider restoration reports record decisions/results at a particular revision. They must not override current ownership or certify today's deployment, provider credit, access settings or end-to-end behavior. Their commands may target removed paths or an older environment; confirm the current source before use.

Explicitly superseded setup/incident pages include [OpenAI validation](OPENAI_PRIMARY_VALIDATION.md), [OpenAI restoration](OPENAI_PRIMARY_RESTORATION.md), [old function deployment](DEPLOY_FUNCTION_NOW.md), [template generation incident](AI_TEMPLATE_GENERATION_FIXES.md) and [old gateway-key instructions](LOVABLE_API_KEY_SETUP.md).

[Architectural consolidation](ARCHITECTURAL_CONSOLIDATION.md), [Wizard continuation](WIZARD_UI_CONTINUATION.md), [session recovery](COPILOT_1130_CONTINUATION.md) and [App Builder restoration](APP_BUILDER_RESTORE_2026-10-04.md) retain dated evidence with freshness notices. Other legacy reports are not current setup guidance unless reconciled with the active guides above.

The `milestones/` directory and `.lovable/plan/` records preserve implementation scope and evidence, not automatic completion. Knowledge/reference packages under `knowledge/` are inspected reference material, not deployable applications or new runtime authorities. Managed design-system documentation belongs to the attached library and is not rewritten here.

## Still unverified or incomplete

- Real-site click targeting, saved-record load/edit/save/preview read-back/Undo and reopening need full authenticated checks.
- Broader typed change sets and shared edge activity streaming remain milestone work.
- Hosted Playwright worker and candidate preview require hosting approval and implementation; local tooling does not supply them.
- Provider availability/funded usage and site-specific publish connections require live checks. A saved revision or a loaded preview is not proof of successful checkout, booking or form persistence.

This refresh updates documentation only: no runtime, database, deployment or publishing change is implied.
