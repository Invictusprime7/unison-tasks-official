/**
 * Navbar Variant: Minimal Dark
 * Dark background navbar with subtle styling and pill-shaped CTA.
 * Modern dark-mode-first navigation.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';
import { MobileNavbarNavigation } from './MobileNavbarNavigation';

export const NavbarMinimalDark: React.FC<BaseSectionProps<'navbar'>> = ({ section, theme }) => {
  const { brand, links = [], cta } = section.props;

  return (
    <header
      data-ut-variant="navbar:minimal-dark"
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: hsla(theme.colors.foreground, 0.95),
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${hsla(theme.colors.background, 0.06)}`,
      }}
    >
      <MobileNavbarNavigation brand={brand} links={links} cta={cta} tone="dark" />
      <div
        className="mx-auto hidden h-14 items-center justify-between px-6 lg:flex"
        style={{ maxWidth: theme.containerWidth }}
      >
        <a
          href="#"
          className="text-base font-bold tracking-tight"
          style={{
            fontFamily: theme.typography.headingFont,
            color: hsl(theme.colors.background),
          }}
        >
          {brand}
        </a>

        <nav className="flex items-center gap-6">
          {links.map((link, i) => (
            <a
              key={i}
              href={link.href}
              data-ut-intent={link.intent}
              className="text-sm transition-colors hover:text-background"
              style={{
                fontFamily: theme.typography.bodyFont,
                color: hsla(theme.colors.background, 0.6),
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
              className="text-sm px-5 py-1.5 transition-all hover:opacity-90"
              style={{
                background: hsl(theme.colors.primary),
                color: hsl(theme.colors.primaryForeground),
                borderRadius: theme.radius,
                fontFamily: theme.typography.bodyFont,
                fontWeight: '500',
                fontSize: '0.8125rem',
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
