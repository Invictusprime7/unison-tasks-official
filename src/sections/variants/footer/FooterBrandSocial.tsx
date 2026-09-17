/**
 * Footer Variant: Brand Social
 *
 * Brand block with social row on the left, link columns on the right and a
 * divided legal band underneath.
 *
 * Adapted from 21st.dev "Footer Columns" (21st:646). The shadcn button import
 * is replaced with theme-token anchors so generated sites carry no vendor deps.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const FooterBrandSocial: React.FC<BaseSectionProps<'footer'>> = ({ section, theme }) => {
  const { brand, columns = [], socials = [], copyright } = section.props;

  return (
    <footer
      data-ut-variant="footer:brand-social"
      style={{ background: hsl(theme.colors.card), borderTop: `1px solid ${hsla(theme.colors.border, 0.6)}` }}
    >
      <div className="mx-auto px-6 py-16" style={{ maxWidth: theme.containerWidth }}>
        <div className="grid gap-12 md:grid-cols-[1.4fr_2fr]">
          <div>
            <span
              className="block text-xl"
              style={{
                fontFamily: theme.typography.headingFont,
                fontWeight: theme.typography.headingWeight,
                color: hsl(theme.colors.foreground),
              }}
            >
              {brand}
            </span>
            {socials.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {socials.map((social, i) => (
                  <a
                    key={i}
                    href={social.url}
                    aria-label={social.platform}
                    data-ut-slot={`social-${social.platform}`}
                    className="inline-flex h-9 items-center justify-center px-3 text-xs font-medium no-underline transition-opacity hover:opacity-80"
                    style={{
                      borderRadius: '9999px',
                      border: `1px solid ${hsla(theme.colors.border, 0.7)}`,
                      color: hsl(theme.colors.mutedForeground),
                      fontFamily: theme.typography.bodyFont,
                    }}
                  >
                    {social.platform}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {columns.map((column, i) => (
              <div key={i}>
                <span
                  className="mb-3 block text-sm font-semibold"
                  style={{ fontFamily: theme.typography.headingFont, color: hsl(theme.colors.foreground) }}
                >
                  {column.title}
                </span>
                <ul className="m-0 flex flex-col gap-2 p-0" style={{ listStyle: 'none' }}>
                  {column.links.map((link, j) => (
                    <li key={j}>
                      <a
                        href={link.href}
                        data-ut-intent={link.intent}
                        className="text-sm no-underline transition-opacity hover:opacity-80"
                        style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-12 flex flex-col gap-2 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between"
          style={{ borderTop: `1px solid ${hsla(theme.colors.border, 0.5)}`, color: hsl(theme.colors.mutedForeground) }}
        >
          <span>{copyright || `© ${new Date().getFullYear()} ${brand}. All rights reserved.`}</span>
          <span style={{ fontFamily: theme.typography.bodyFont }}>Crafted with care.</span>
        </div>
      </div>
    </footer>
  );
};
