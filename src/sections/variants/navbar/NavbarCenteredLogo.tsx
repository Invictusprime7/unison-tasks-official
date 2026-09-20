/**
 * Navbar Variant: Centered Logo
 *
 * Canonical adaptation of 21st:4003 "Navbar" by @designali-in. The source's
 * floating container with an absolutely centred menu island is preserved,
 * including the condensed rounded/blurred shell it adopts once the page
 * scrolls. Next.js links and the liquid-glass button dependency are replaced by
 * canonical anchors and theme tokens.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';
import { MobileNavbarNavigation } from './MobileNavbarNavigation';

export const NavbarCenteredLogo: React.FC<BaseSectionProps<'navbar'>> = ({ section, theme }) => {
  const { brand, links = [], cta } = section.props;
  const [condensed, setCondensed] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      data-ut-variant="navbar:centered-logo"
      data-ut-slot="navigation"
      data-state={condensed ? 'condensed' : 'top'}
      className="sticky top-0 z-50 w-full px-2 pt-2"
    >
      <MobileNavbarNavigation brand={brand} links={links} cta={cta} />
      <div
        className="mx-auto hidden px-6 motion-safe:transition-all motion-safe:duration-300 lg:block"
        style={{
          maxWidth: condensed ? `calc(${theme.containerWidth} * 0.82)` : theme.containerWidth,
          background: condensed ? hsla(theme.colors.background, 0.72) : 'transparent',
          border: condensed ? `1px solid ${hsla(theme.colors.border, 0.6)}` : '1px solid transparent',
          borderRadius: condensed ? '1rem' : theme.radius,
          backdropFilter: condensed ? 'blur(14px)' : undefined,
        }}
      >
        <div className="relative flex items-center justify-between py-3">
          <a
            href="#"
            data-ut-slot="brand"
            aria-label="Home"
            className="text-xl font-semibold tracking-tight"
            style={{ fontFamily: theme.typography.headingFont, color: hsl(theme.colors.foreground) }}
          >
            {brand}
          </a>

          <nav aria-label="Main navigation" className="absolute inset-0 m-auto hidden size-fit lg:block">
            <ul className="flex gap-8 text-sm">
              {links.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    data-ut-intent={link.intent}
                    className="block motion-safe:duration-150 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {cta && (
            <a
              href={cta.href || '#'}
              data-ut-intent={cta.intent}
              data-ut-cta="cta.nav"
              className="px-5 py-2 text-sm font-medium motion-safe:transition-transform motion-safe:hover:-translate-y-0.5"
              style={{
                background: hsl(theme.colors.primary),
                color: hsl(theme.colors.primaryForeground),
                borderRadius: '999px',
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
