/**
 * Navbar Variant: Floating Pill
 *
 * Sticky, blurred pill bar that detaches from the top edge on scroll.
 *
 * Adapted from 21st.dev "Sticky Navbar" (21st:8137). The lucide menu icon is
 * replaced with an inline SVG and mobile navigation reuses the canonical
 * MobileNavbarNavigation contract.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';
import { MobileNavbarNavigation } from './MobileNavbarNavigation';

export const NavbarFloatingPill: React.FC<BaseSectionProps<'navbar'>> = ({ section, theme }) => {
  const { brand, links = [], cta } = section.props;
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      data-ut-variant="navbar:floating-pill"
      className="fixed left-0 right-0 top-0 z-50 backdrop-blur-md lg:bg-transparent"
      style={{ background: hsla(theme.colors.background, 0.92) }}
    >
      <MobileNavbarNavigation brand={brand} links={links} cta={cta} />

      <div className={`mx-auto hidden px-6 transition-all duration-300 lg:block ${scrolled ? 'pt-3' : 'pt-6'} motion-reduce:transition-none`}>
        <div
          className="mx-auto flex h-14 items-center justify-between px-6 transition-all duration-300 motion-reduce:transition-none"
          style={{
            maxWidth: theme.containerWidth,
            borderRadius: '9999px',
            background: hsla(theme.colors.background, scrolled ? 0.95 : 0.7),
            border: `1px solid ${hsla(theme.colors.border, scrolled ? 0.7 : 0.35)}`,
            boxShadow: scrolled ? `0 16px 40px -28px ${hsla(theme.colors.foreground, 0.7)}` : 'none',
          }}
        >
          <a
            href="#"
            className="text-base font-semibold tracking-tight no-underline"
            style={{ fontFamily: theme.typography.headingFont, color: hsl(theme.colors.foreground) }}
          >
            {brand}
          </a>

          <nav className="flex items-center gap-7">
            {links.map((link, i) => (
              <a
                key={i}
                href={link.href}
                data-ut-intent={link.intent}
                className="text-sm no-underline transition-opacity hover:opacity-80"
                style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {cta && (
            <a
              href={cta.href || '#'}
              data-ut-intent={cta.intent}
              data-ut-cta="cta.nav"
              className="px-4 py-2 text-sm font-medium no-underline transition-opacity hover:opacity-90"
              style={{
                background: hsl(theme.colors.primary),
                color: hsl(theme.colors.primaryForeground),
                borderRadius: '9999px',
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
