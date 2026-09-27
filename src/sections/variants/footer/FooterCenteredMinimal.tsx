/**
 * Footer Variant: Centered Minimal
 * Simple centered footer with brand, inline links, and socials.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';
import { SocialIcon, socialAriaLabel } from '../../components/SocialIcon';

export const FooterCenteredMinimal: React.FC<BaseSectionProps<'footer'>> = ({ section, theme }) => {
  const { brand, columns = [], socials = [], copyright } = section.props;

  // Flatten all links from columns into a single list
  const allLinks = columns.flatMap(c => c.links);

  return (
    <footer
      data-ut-variant="footer:centered-minimal"
      style={{
        padding: '2.5rem 1rem',
        background: hsl(theme.colors.background),
        borderTop: `1px solid ${hsla(theme.colors.border, 0.4)}`,
        textAlign: 'center',
      }}
    >
      <div className="mx-auto px-5 sm:px-6" style={{ maxWidth: theme.containerWidth }}>
        <h3
          data-ut-slot="footer.brand"
          className="mb-4 text-lg md:text-xl"
          style={{
            fontFamily: theme.typography.headingFont,
            fontWeight: theme.typography.headingWeight,
            color: hsl(theme.colors.foreground),
          }}
        >
          {brand}
        </h3>

        {allLinks.length > 0 && (
          <nav aria-label="Footer" data-ut-slot="footer.links" className="mb-5 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-5">
            {allLinks.map((l, i) => (
              <a data-ut-intent="nav.goto"
                key={i}
                href={l.href}
                className="text-sm hover:opacity-80 transition-opacity"
                style={{ color: hsl(theme.colors.mutedForeground), textDecoration: 'none' }}
              >
                {l.label}
              </a>
            ))}
          </nav>
        )}

        {socials.length > 0 && (
          <div className="flex gap-4 justify-center mb-5 items-center">
            {socials.map((s, i) => {
              const hasUrl = s.url && s.url !== '#';
              return (
                <a data-ut-intent="nav.goto"
                  key={i}
                  href={hasUrl ? s.url : undefined}
                  target={hasUrl ? '_blank' : undefined}
                  rel={hasUrl ? 'noopener noreferrer' : undefined}
                  aria-label={socialAriaLabel(s.platform)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:opacity-80"
                  style={{ color: hsl(theme.colors.mutedForeground), textDecoration: 'none' }}
                >
                  <SocialIcon platform={s.platform} size={18} />
                </a>
              );
            })}
          </div>
        )}

        <p data-ut-slot="footer.copyright" className="text-xs" style={{ color: hsl(theme.colors.mutedForeground) }}>
          {copyright || `© ${new Date().getFullYear()} ${brand}. All rights reserved.`}
        </p>
      </div>
    </footer>
  );
};
