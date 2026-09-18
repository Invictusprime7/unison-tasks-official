/** Layout guide derived from the same variant resolution as the compiler. */
import { cn } from '@/lib/utils';
import type { TemplateCardData } from './wizard/wizardCatalog';

interface TemplateLivePreviewProps {
  template: TemplateCardData | null;
  businessName?: string;
  className?: string;
}

export function TemplateLivePreview({ template, businessName, className }: TemplateLivePreviewProps) {
  if (!template) return <p className="text-sm text-slate-400">Choose a layout to explore its sections.</p>;
  return (
    <div className={cn('space-y-3', className)} aria-label="Home page layout guide">
      <div className="text-sm font-semibold text-white">{businessName?.trim() || 'Your business'}</div>
      <ol className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
        {template.sections.map((section, index) => (
          <li key={section.id} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
            <div className="flex items-start gap-3 p-3">
              <span className="mt-0.5 text-xs tabular-nums text-cyan-300">{String(index + 1).padStart(2, '0')}</span>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">{section.type.replace(/-/g, ' ')}</div>
                <div className="text-sm font-medium text-white">{section.label}</div>
                <p className="mt-1 text-xs leading-5 text-slate-400">{section.description}</p>
              </div>
            </div>
            {section.thumbnail && <img src={section.thumbnail} alt={section.label + ' layout diagram'} loading="lazy" className="aspect-[16/9] w-full object-contain bg-slate-950" />}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default TemplateLivePreview;
