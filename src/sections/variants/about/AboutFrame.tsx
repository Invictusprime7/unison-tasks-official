/**
 * About Frame
 *
 * Shared chrome for every about variant: section shell, editorial intro and the
 * canonical narrative body/CTA rendering. Variants supply only the arrangement.
 */

import React from 'react';
import type { ThemeTokens, CTAButton } from '../../types';
import { hsl } from '../../themeUtils';

export const aboutParagraphs = (description: unknown): string[] => {
  const text = typeof description === 'string' ? description.trim() : '';
  if (!text) return [];
  return text
    .split(/\n{2,}|\r\n\r\n/)
    .map((part) => part.trim())
    .filter(Boolean);
};

export const AboutHeading: React.FC<{ theme: ThemeTokens; headline?: string; align?: 'start' | 'center' }> = ({
  theme,
  headline,
  align = 'start',
}) => {
  if (!headline) return null;
  return (
    <h2
      className={`mb-5 text-3xl ${align === 'center' ? 'text-center' : ''}`}
      style={{
        fontFamily: theme.typography.headingFont,
        fontWeight: theme.typography.headingWeight,
        color: hsl(theme.colors.foreground),
      }}
    >
      {headline}
    </h2>
  );
};

export const AboutBody: React.FC<{ theme: ThemeTokens; paragraphs: string[]; align?: 'start' | 'center' }> = ({
  theme,
  paragraphs,
  align = 'start',
}) => (
  <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : ''}>
    {paragraphs.map((paragraph, i) => (
      <p
        key={i}
        className="mb-4 text-base leading-relaxed"
        style={{
          fontFamily: theme.typography.bodyFont,
          fontWeight: theme.typography.bodyWeight,
          color: hsl(theme.colors.mutedForeground),
        }}
      >
        {paragraph}
      </p>
    ))}
  </div>
);

export const AboutCta: React.FC<{ theme: ThemeTokens; cta?: CTAButton; className?: string }> = ({
  theme,
  cta,
  className = '',
}) => {
  if (!cta?.label) return null;
  return (
    <a
      href={cta.href || '#contact'}
      data-ut-intent={cta.intent}
      className={`mt-4 inline-block px-6 py-3 text-sm font-semibold ${className}`}
      style={{
        background: hsl(theme.colors.primary),
        color: hsl(theme.colors.primaryForeground),
        borderRadius: theme.radius,
        fontFamily: theme.typography.bodyFont,
      }}
    >
      {cta.label}
    </a>
  );
};

export const AboutFrame: React.FC<{
  variantId: string;
  theme: ThemeTokens;
  surface?: 'background' | 'muted' | 'card';
  children: React.ReactNode;
}> = ({ variantId, theme, surface = 'background', children }) => (
  <section
    data-ut-variant={variantId}
    style={{
      padding: theme.sectionPadding,
      background: hsl(
        surface === 'muted' ? theme.colors.muted : surface === 'card' ? theme.colors.card : theme.colors.background,
      ),
    }}
  >
    <div className="mx-auto px-6" style={{ maxWidth: theme.containerWidth }}>
      {children}
    </div>
  </section>
);
