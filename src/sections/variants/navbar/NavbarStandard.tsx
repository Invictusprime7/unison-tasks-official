/**
 * Navbar Variant: Standard
 *
 * Canonical adaptation of 21st:18258 "Header Navbar" by @karthikmudunuri
 * (eldoraui/header-02). The source's plus-grid header is reproduced with the
 * ruled row, hairline crosses at the row corners, full-height link cells and a
 * disclosure-style mobile menu. Next.js, Headless UI and Heroicons are replaced
 * by the canonical mobile navigation facade, and every colour comes from the
 * Stage 4b theme rather than the source palette.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';
import { MobileNavbarNavigation } from './MobileNavbarNavigation';

export const NavbarStandard: React.FC<BaseSectionProps<'navbar'>> = ({ section, theme }) => {
  const { brand, links = [], cta } = section.props;
  const rule = `1px solid ${hsla(theme.colors.border, 0.6)}`;

  return (
    <header
      data-ut-variant="navbar:standard"
      data-ut-slot="navigation"
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{ background: hsla(theme.colors.background, 0.92) }}
    >
      <MobileNavbarNavigation brand={brand} links={links} cta={cta} />
      <div className="mx-auto hidden px-6 lg:block" style={{ maxWidth: theme.containerWidth }}>
        <div
          className="relative flex items-stretch justify-between"
          style={{ borderTop: rule, borderBottom: rule }}
        >
          <span aria-hidden="true" className="absolute -left-px -top-px h-2 w-2" style={{ borderLeft: rule, borderTop: rule }} />
          <span aria-hidden="true" className="absolute -right-px -top-px h-2 w-2" style={{ borderRight: rule, borderTop: rule }} />

          <a
            href="#"
            data-ut-slot="brand"
            className="flex items-center py-4 text-lg font-semibold tracking-tight"
            style={{ fontFamily: theme.typography.headingFont, color: hsl(theme.colors.foreground) }}
          >
            {brand}
          </a>

          <nav aria-label="Main navigation" className="flex items-stretch">
            {links.map((link, i) => (
              <a
                key={i}
                href={link.href}
                data-ut-intent={link.intent}
                className="flex items-center px-4 text-sm font-medium motion-safe:transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.foreground), borderLeft: rule }}
              >
                {link.label}
              </a>
            ))}
            {cta && (
              <span className="flex items-center pl-4" style={{ borderLeft: rule }}>
                <a
                  href={cta.href || '#'}
                  data-ut-intent={cta.intent}
                  data-ut-cta="cta.nav"
                  className="px-4 py-2 text-sm font-medium motion-safe:transition-transform motion-safe:hover:-translate-y-0.5"
                  style={{
                    background: hsl(theme.colors.primary),
                    color: hsl(theme.colors.primaryForeground),
                    borderRadius: theme.radius,
                    fontFamily: theme.typography.bodyFont,
                  }}
                >
                  {cta.label}
                </a>
              </span>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
