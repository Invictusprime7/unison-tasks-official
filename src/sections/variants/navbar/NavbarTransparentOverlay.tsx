/**
 * Navbar Variant: Transparent Overlay
 *
 * Sits over an immersive hero with no background fill, so full-bleed imagery
 * runs edge to edge behind the navigation. Falls back to a legible scrim so
 * link contrast never depends on the photograph.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const NavbarTransparentOverlay: React.FC<BaseSectionProps<'navbar'>> = ({ section, theme }) => {
  const { brand, links = [], cta } = section.props;

  return (
    <header
      className="absolute top-0 left-0 right-0 z-50"
      data-variant="navbar:transparent-overlay"
      style={{
        backgroundImage: `linear-gradient(180deg, ${hsla(theme.colors.foreground, 0.42)}, ${hsla(theme.colors.foreground, 0)})`,
      }}
    >
      <div
        className="mx-auto flex items-center justify-between h-20 px-6"
        style={{ maxWidth: theme.containerWidth }}
      >
        <a
          href="#"
          className="text-lg font-semibold tracking-tight"
          style={{ fontFamily: theme.typography.headingFont, color: hsl(theme.colors.primaryForeground) }}
        >
          {brand}
        </a>

        <nav className="flex items-center gap-8">
          {links.map((link, i) => (
            <a
              key={i}
              href={link.href}
              data-ut-intent={link.intent}
              className="text-sm transition-opacity hover:opacity-80"
              style={{
                fontFamily: theme.typography.bodyFont,
                color: hsla(theme.colors.primaryForeground, 0.88),
              }}
            >
              {link.label}
            </a>
          ))}
          {cta && (
            <a
              href={cta.href || '#'}
              data-ut-intent={cta.intent}
              data-ut-cta="cta.nav"
              className="text-sm px-4 py-2 transition-all hover:opacity-90"
              style={{
                background: hsla(theme.colors.primaryForeground, 0.14),
                border: `1px solid ${hsla(theme.colors.primaryForeground, 0.45)}`,
                color: hsl(theme.colors.primaryForeground),
                borderRadius: theme.radius,
                fontFamily: theme.typography.bodyFont,
                fontWeight: '500',
              }}
            >
              {cta.label}
            </a>
          )}
        </nav>
      </div>
    </header>
  );
};
