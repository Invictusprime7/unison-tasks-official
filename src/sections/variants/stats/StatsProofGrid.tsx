import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
import { EditorialSection } from '../shared/EditorialSection';

export function StatsProofGrid({ section, theme }: BaseSectionProps<'stats'>) {
  return (
    <EditorialSection variantId="stats:proof-grid" theme={theme} headline={section.props.headline}>
      <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
        {section.props.items.map((item, index) => (
          <div
            key={index}
            data-ut-slot={`metric-${index}`}
            data-ut-reveal
            className="flex min-w-0 flex-col-reverse gap-4 border-t py-8"
            style={
              {
                borderColor: hsl(theme.colors.border),
                '--ut-reveal-delay': `${Math.min(index, 5) * 70}ms`,
              } as React.CSSProperties
            }
          >
            <dt className="text-sm leading-relaxed" style={{ color: hsl(theme.colors.mutedForeground) }}>
              {item.label}
            </dt>
            <dd
              className="break-words text-5xl tracking-tight tabular-nums"
              style={{ fontFamily: theme.typography.headingFont }}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </EditorialSection>
  );
}
