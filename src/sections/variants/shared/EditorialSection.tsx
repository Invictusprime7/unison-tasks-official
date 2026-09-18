import React from 'react';
import type { CTAButton, ThemeTokens } from '../../types';
import { hsl } from '../../themeUtils';

/** Shared presentation only: section data, identity and intents stay with the family. */
export function EditorialSection({
  variantId,
  theme,
  headline,
  description,
  children,
}: {
  variantId: string;
  theme: ThemeTokens;
  headline?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      data-ut-variant={variantId}
      className="ut-editorial"
      style={{
        padding: theme.sectionPadding,
        background: hsl(theme.colors.background),
        color: hsl(theme.colors.foreground),
        fontFamily: theme.typography.bodyFont,
      }}
    >
      <style>{`@keyframes ut-editorial-enter{from{transform:translateY(12px)}to{transform:translateY(0)}}
      @media(prefers-reduced-motion:no-preference){.ut-editorial [data-ut-reveal]{animation:ut-editorial-enter .5s ease-out both;animation-delay:var(--ut-reveal-delay,0ms)}}
      .ut-editorial :is(a,button,input,textarea,summary):focus-visible{outline:2px solid currentColor;outline-offset:4px}
      .ut-editorial summary::marker{color:inherit}`}</style>
      <div className="mx-auto min-w-0 px-5 sm:px-8" style={{ maxWidth: theme.containerWidth }}>
        {(headline || description) && (
          <header className="mb-10 max-w-3xl sm:mb-14">
            {headline && (
              <h2
                data-ut-slot="headline"
                className="text-3xl font-semibold tracking-tight sm:text-5xl"
                style={{
                  fontFamily: theme.typography.headingFont,
                  fontWeight: theme.typography.headingWeight,
                }}
              >
                {headline}
              </h2>
            )}
            {description && (
              <p
                data-ut-slot="description"
                className="mt-5 max-w-2xl text-base leading-relaxed sm:text-lg"
                style={{ color: hsl(theme.colors.mutedForeground) }}
              >
                {description}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}

export function EditorialCTA({ cta, theme }: { cta?: CTAButton; theme: ThemeTokens }) {
  if (!cta) return null;
  return (
    <a
      href={cta.href || '#contact'}
      data-ut-intent={cta.intent}
      data-ut-slot="cta"
      className="mt-6 inline-flex min-h-11 items-center justify-center gap-5 px-5 py-3 text-sm font-semibold motion-safe:transition-transform motion-safe:hover:-translate-y-0.5"
      style={{
        borderRadius: theme.radius,
        background: hsl(theme.colors.primary),
        color: hsl(theme.colors.primaryForeground),
      }}
    >
      {cta.label}
      <span aria-hidden="true">↗</span>
    </a>
  );
}

