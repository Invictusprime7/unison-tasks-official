/**
 * FAQ Frame
 *
 * Shared chrome for every FAQ variant: section shell, editorial intro and
 * question normalization. Variants supply only the arrangement.
 */

import React from 'react';
import type { ThemeTokens, FAQItem } from '../../types';
import { hsl } from '../../themeUtils';

export const normalizeFaqItems = (items: unknown): FAQItem[] => {
  if (!Array.isArray(items)) return [];
  return items
    .map((raw) => {
      const item = (raw || {}) as Record<string, unknown>;
      const question = String(item.question ?? item.title ?? '').trim();
      const answer = String(item.answer ?? item.body ?? item.description ?? '').trim();
      if (!question) return null;
      return { question, answer } as FAQItem;
    })
    .filter(Boolean) as FAQItem[];
};

export const FAQFrame: React.FC<{
  variantId: string;
  theme: ThemeTokens;
  headline?: string;
  subheadline?: string;
  surface?: 'background' | 'muted';
  children: React.ReactNode;
}> = ({ variantId, theme, headline, subheadline, surface = 'background', children }) => (
  <section
    data-ut-variant={variantId}
    style={{
      padding: theme.sectionPadding,
      background: hsl(surface === 'muted' ? theme.colors.muted : theme.colors.background),
    }}
  >
    <div className="mx-auto px-6" style={{ maxWidth: theme.containerWidth }}>
      {(headline || subheadline) && (
        <div className="mb-12 text-center">
          {headline && (
            <h2
              className="mb-3 text-3xl"
              style={{
                fontFamily: theme.typography.headingFont,
                fontWeight: theme.typography.headingWeight,
                color: hsl(theme.colors.foreground),
              }}
            >
              {headline}
            </h2>
          )}
          {subheadline && (
            <p
              className="mx-auto max-w-2xl text-base"
              style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
            >
              {subheadline}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  </section>
);
