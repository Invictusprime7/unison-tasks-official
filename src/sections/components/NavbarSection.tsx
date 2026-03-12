import React from 'react';
import type { BaseSectionProps } from '../types';
import { hsl, hsla, containerStyle, headingStyle, bodyStyle, primaryButtonStyle, outlineButtonStyle } from '../themeUtils';

export const NavbarSection: React.FC<BaseSectionProps<'navbar'>> = ({ section, theme }) => {
  const { brand, links, cta, sticky = true, transparent } = section.props;

  return (
    <header
      style={{
        position: sticky ? 'fixed' : 'relative',
        top: 0, left: 0, right: 0,
        zIndex: 50,
        background: transparent ? 'transparent' : hsla(theme.colors.background, 0.85),
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${hsla(theme.colors.border, 0.5)}`,
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ ...containerStyle(theme), display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '5rem' }}>
        <a
          href="#"
          style={{
            ...headingStyle(theme),
            fontSize: '1.5rem',
            textDecoration: 'none',
            background: `linear-gradient(135deg, hsl(${theme.colors.primary}), hsl(${theme.colors.secondary}))`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {brand}
        </a>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {links.map((link, i) => (
            <a
              key={i}
              href={link.href}
              data-intent={link.intent}
              style={{
                ...bodyStyle(theme),
                fontSize: '0.9rem',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              {link.label}
            </a>
          ))}
          {cta && (
            <a
              href={cta.href || '#'}
              data-intent={cta.intent}
              style={{
                ...primaryButtonStyle(theme),
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none',
                fontSize: '0.875rem',
                padding: '0.5rem 1.25rem',
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
