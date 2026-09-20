/**
 * Navbar Variant: Minimal Dark
 *
 * Canonical adaptation of 21st:841 "Header" by @tommyjepsen. The source's
 * three-column bar — navigation cluster, brand lockup, then a divided action
 * group — is preserved on an inverted surface, with the source's ghost/solid
 * button pair expressed through theme tokens. The shadcn navigation-menu and
 * Next.js link dependencies are replaced by canonical anchors and the shared
 * mobile navigation facade.
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
      data-ut-slot="navigation"
      className="sticky top-0 z-50"
      style={{
        background: hsla(theme.colors.foreground, 0.95),
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${hsla(theme.colors.background, 0.08)}`,
      }}
    >
      <MobileNavbarNavigation brand={brand} links={links} cta={cta} tone="dark" />
      <div
        className="mx-auto hidden min-h-16 grid-cols-3 items-center gap-4 px-6 lg:grid"
        style={{ maxWidth: theme.containerWidth }}
      >
        <nav aria-label="Main navigation" className="flex items-center justify-start gap-6">
          {links.map((link, i) => (
            <a
              key={i}
              href={link.href}
              data-ut-intent={link.intent}
              className="text-sm motion-safe:transition-colors hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ fontFamily: theme.typography.bodyFont, color: hsla(theme.colors.background, 0.66) }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#"
          data-ut-slot="brand"
          className="justify-self-center text-base font-semibold tracking-tight"
          style={{ fontFamily: theme.typography.headingFont, color: hsl(theme.colors.background) }}
        >
          {brand}
        </a>

        <div
          className="flex items-center justify-end gap-4 py-3 pl-6"
          style={{ borderLeft: `1px solid ${hsla(theme.colors.background, 0.12)}` }}
        >
          <a
            href="#contact"
            className="hidden text-sm motion-safe:transition-colors xl:inline"
            style={{ fontFamily: theme.typography.bodyFont, color: hsla(theme.colors.background, 0.66) }}
          >
            Contact
          </a>
          {cta && (
            <a
              href={cta.href || '#'}
              data-ut-intent={cta.intent}
              data-ut-cta="cta.nav"
              className="px-5 py-1.5 text-sm font-medium motion-safe:transition-transform motion-safe:hover:-translate-y-0.5"
              style={{
                background: hsl(theme.colors.primary),
                color: hsl(theme.colors.primaryForeground),
                borderRadius: theme.radius,
                fontFamily: theme.typography.bodyFont,
              }}
            >
              {cta.label}
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
