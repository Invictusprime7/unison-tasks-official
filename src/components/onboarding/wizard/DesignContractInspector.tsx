/**
 * Design Contract Inspector — AI-awareness, before a single token is spent.
 *
 * Resolves the deterministic design genome for the current wizard selections
 * (TemplateDesignContract V2) and shows exactly what the canonical compiler
 * will build: the seed, the plan signature, and per-section implementation IDs,
 * variants, geometry, media treatment and intent slots.
 *
 * Read-only projection. It never mutates selections and never calls AI.
 */

import { useMemo, useState } from "react";
import { ChevronDown, Fingerprint, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCompositionById } from "@/sections/templates";
import {
  buildTemplateLayoutContract,
  type TemplateLayoutContract,
} from "@/services/templateLayoutContract";
import { generateStyleVariation, designPlanSignature } from "@/utils/designVariation";

export interface DesignContractInspectorProps {
  /** Registered TemplateComposition id chosen in step 3. */
  templateId: string | null;
  /** Canonical generation seed derived from the wizard selections. */
  seed: string;
  /** Pages the user selected, used to label page coverage. */
  selectedPages: string[];
  className?: string;
}

function shorten(value: string, max = 44): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

export const DesignContractInspector = ({
  templateId,
  seed,
  selectedPages,
  className,
}: DesignContractInspectorProps) => {
  const [expanded, setExpanded] = useState(false);

  const contract: TemplateLayoutContract | null = useMemo(() => {
    if (!templateId) return null;
    const composition = getCompositionById(templateId);
    if (!composition) return null;
    try {
      return buildTemplateLayoutContract(composition, { seed, pageRole: "home" });
    } catch {
      return null;
    }
  }, [templateId, seed]);

  const style = useMemo(() => generateStyleVariation(seed), [seed]);
  const planSignature = useMemo(() => designPlanSignature(seed), [seed]);

  if (!contract) {
    return (
      <div
        className={cn(
          "rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-[11px] text-white/35",
          className,
        )}
      >
        Pick a template to see the design contract this launch will compile.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.06] bg-white/[0.02]",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2.5 px-4 py-3 text-left outline-none"
      >
        <Fingerprint className="h-3.5 w-3.5 shrink-0 text-cyan-400/70" />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold tracking-tight text-white/80">
            Design contract v{contract.version}
          </div>
          <div className="truncate text-[10px] text-white/30">
            {contract.sections.length} sections · {selectedPages.length + 1} pages ·
            deterministic from your selections
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-white/30 transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-white/[0.06] px-4 py-3">
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
            {[
              ["Template", contract.templateId],
              ["Industry", contract.industry],
              ["Plan signature", planSignature],
              ["Contract signature", (contract.contractSignature || "").slice(0, 16)],
              ["Hero posture", style.layout.hero_style],
              ["Density", style.content.density],
              ["Spacing", style.layout.section_spacing],
              ["Media", `${style.images.style} · ${style.images.aspect_ratio}`],
              ["Surfaces", `${style.effects.shadows} shadows`],
              ["Motion", style.effects.animations ? "component-aware" : "static"],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-white/25">{label}</dt>
                <dd className="truncate font-mono text-white/60">{String(value)}</dd>
              </div>
            ))}
          </dl>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-white/25">
              <Layers className="h-3 w-3" />
              Resolved implementations
            </div>
            <ul className="space-y-1">
              {contract.sections.map((section) => (
                <li
                  key={section.id}
                  className="flex items-center justify-between gap-2 rounded-md bg-white/[0.02] px-2 py-1"
                >
                  <span className="truncate text-[11px] text-white/70">
                    {section.type}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-cyan-300/60">
                    {shorten(section.implementationId || section.variantId || "generic", 28)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[10px] leading-relaxed text-white/25">
            Same answers and same seed always compile this exact contract. AI may
            only fill declared text, media, prop and SEO slots inside it.
          </p>
        </div>
      )}
    </div>
  );
};

export default DesignContractInspector;
