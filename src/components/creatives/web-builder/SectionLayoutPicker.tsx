/**
 * SectionLayoutPicker — Section-level variant browser
 * 
 * Shows available layout variants grouped by section type (hero, navbar, cta).
 * When a variant is clicked, it swaps only that section in the current preview code
 * while preserving the theme and all other sections.
 */

import React, { useMemo } from 'react';
import { Layout, Layers, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { VARIANT_REGISTRY, getVariantsForSection, getSectionTypesWithVariants } from '@/sections/variants/registry';
import { detectSections, type DetectedSection } from '@/utils/sectionSwapper';
import type { SectionVariant } from '@/sections/variants/types';
import type { SectionType } from '@/sections/types';

interface SectionLayoutPickerProps {
  /** Current preview/editor code to detect sections from */
  currentCode: string;
  /** Called when user selects a variant to swap */
  onSwapSection: (sectionId: string, variantId: string) => void;
}

const sectionTypeLabels: Partial<Record<SectionType, string>> = {
  navbar: '🧭 Navigation',
  hero: '🦸 Hero',
  cta: '📢 Call to Action',
  services: '🛠️ Services',
  testimonials: '⭐ Testimonials',
  footer: '🔻 Footer',
  pricing: '💰 Pricing',
  contact: '✉️ Contact',
  faq: '❓ FAQ',
  team: '👥 Team',
  gallery: '🖼️ Gallery',
  stats: '📊 Stats',
  about: 'ℹ️ About',
  features: '✨ Features',
};

export const SectionLayoutPicker: React.FC<SectionLayoutPickerProps> = ({
  currentCode,
  onSwapSection,
}) => {
  // Detect sections from current code
  const detectedSections = useMemo(() => detectSections(currentCode), [currentCode]);

  // Get section types that have variants AND exist in the current code
  const swappableSections = useMemo(() => {
    const typesWithVariants = getSectionTypesWithVariants();
    return detectedSections.filter(s => typesWithVariants.includes(s.type));
  }, [detectedSections]);

  // All section types with variants (even if not in current code)
  const allVariantTypes = useMemo(() => getSectionTypesWithVariants(), []);

  if (detectedSections.length === 0) {
    return (
      <div className="p-6 text-center">
        <Layout className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Load a template first to swap section layouts
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Use the Templates tab to load a page, then come back here to customize individual sections.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <Layers className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Section Layouts</h3>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Click a variant to swap that section. Content & theme are preserved.
        </p>
      </div>

      {/* Detected sections info */}
      <div className="px-3 py-2 border-b border-border bg-muted/30">
        <p className="text-[10px] text-muted-foreground">
          {detectedSections.length} sections detected · {swappableSections.length} swappable
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          {detectedSections.map(s => (
            <Badge
              key={s.id}
              variant={swappableSections.includes(s) ? 'default' : 'secondary'}
              className="text-[9px] px-1.5 py-0"
            >
              {s.type}
            </Badge>
          ))}
        </div>
      </div>

      {/* Variant groups */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {swappableSections.map(section => {
            const variants = getVariantsForSection(section.type);
            if (variants.length < 2) return null;

            return (
              <div key={section.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground">
                    {sectionTypeLabels[section.type] || section.type}
                  </h4>
                  <Badge variant="outline" className="text-[9px] px-1.5">
                    {variants.length} layouts
                  </Badge>
                </div>

                <div className="grid gap-1.5">
                  {variants.map(variant => (
                    <VariantCard
                      key={variant.id}
                      variant={variant}
                      section={section}
                      onSelect={() => onSwapSection(section.id, variant.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Show section types without variants */}
          {detectedSections.filter(s => !swappableSections.includes(s)).length > 0 && (
            <div className="pt-2 border-t border-border">
              <p className="text-[10px] text-muted-foreground mb-2">
                More section variants coming soon:
              </p>
              <div className="flex flex-wrap gap-1">
                {detectedSections
                  .filter(s => !swappableSections.includes(s))
                  .map(s => (
                    <Badge key={s.id} variant="secondary" className="text-[9px] px-1.5 py-0 opacity-50">
                      {s.type}
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

/** Individual variant card */
const VariantCard: React.FC<{
  variant: SectionVariant;
  section: DetectedSection;
  onSelect: () => void;
}> = ({ variant, section, onSelect }) => {
  // Detect if this variant is currently active (by checking data-variant attribute in code)
  // This is a heuristic; could be improved with explicit state tracking
  
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200",
        "border-border/60 hover:border-primary/40 hover:bg-primary/5",
        "text-left group cursor-pointer",
        variant.isDefault && "border-primary/20 bg-primary/5"
      )}
    >
      {/* Thumbnail placeholder */}
      <div className="w-12 h-10 rounded-md bg-muted border border-border/50 flex items-center justify-center shrink-0 overflow-hidden">
        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">
          {variant.slug.slice(0, 6)}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-foreground truncate">{variant.name}</span>
          {variant.isDefault && (
            <Badge variant="secondary" className="text-[8px] px-1 py-0 shrink-0">
              default
            </Badge>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
          {variant.description}
        </p>
        {variant.tags && (
          <div className="flex gap-1 mt-1">
            {variant.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[8px] text-muted-foreground/60 bg-muted rounded px-1">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Arrow */}
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
    </button>
  );
};
