import React from 'react';
import type { BaseSectionProps } from '../types';
import { hsl, hsla, containerStyle, headingStyle, bodyStyle, primaryButtonStyle } from '../themeUtils';

export const FooterSection: React.FC<BaseSectionProps<'footer'>> = ({ section, theme }) => {
  const { brand, columns, socials, copyright, newsletter } = section.props;

  return (
    <footer style={{
      padding: '4rem 1rem 2rem',
      background: hsl(theme.colors.card),
      borderTop: `1px solid ${hsla(theme.colors.border, 1)}`,
    }}>
      <div style={containerStyle(theme)}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${(columns?.length || 0) + 1}, 1fr)`, gap: '3rem', marginBottom: '3rem' }}>
          {/* Brand column */}
          <div>
            <h3 style={{
              ...headingStyle(theme), fontSize: '1.25rem', marginBottom: '1rem',
              background: `linear-gradient(135deg, hsl(${theme.colors.primary}), hsl(${theme.colors.secondary}))`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {brand}
            </h3>
            {newsletter && (
              <form data-demo-form="true" data-intent="newsletter.subscribe" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  style={{
                    flex: 1, padding: '0.5rem 0.75rem', borderRadius: theme.radius,
                    border: `1px solid ${hsla(theme.colors.border, 1)}`,
                    background: hsl(theme.colors.background),
                    color: hsl(theme.colors.foreground),
                    fontSize: '0.85rem', fontFamily: theme.typography.bodyFont,
                  }}
                />
                <button type="submit" style={{ ...primaryButtonStyle(theme), padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  Subscribe
                </button>
              </form>
            )}
          </div>

          {/* Link columns */}
          {columns?.map((col, i) => (
            <div key={i}>
              <h4 style={{ ...headingStyle(theme), fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                {col.title}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a href={link.href} data-intent={link.intent} style={{ ...bodyStyle(theme), textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: `1px solid ${hsla(theme.colors.border, 0.5)}`,
          paddingTop: '1.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <p style={{ ...bodyStyle(theme), fontSize: '0.8rem' }}>
            {copyright || `© ${new Date().getFullYear()} ${brand}. All rights reserved.`}
          </p>
          {socials && socials.length > 0 && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              {socials.map((s, i) => (
                <a key={i} href={s.url} style={{ ...bodyStyle(theme), textDecoration: 'none', fontSize: '0.85rem' }} target="_blank" rel="noopener noreferrer">
                  {s.icon || s.platform}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
