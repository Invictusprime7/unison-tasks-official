import React from 'react';
import type { BaseSectionProps } from '../types';
import { hsl, hsla } from '../themeUtils';

export const ContactSection: React.FC<BaseSectionProps<'contact'>> = ({ section, theme }) => {
  const { headline, description, submitLabel = 'Send Message', phone, email, address } = section.props;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: theme.radius,
    border: `1px solid ${hsla(theme.colors.border, 0.8)}`,
    background: hsl(theme.colors.background),
    color: hsl(theme.colors.foreground),
    fontFamily: theme.typography.bodyFont,
    fontSize: '0.875rem',
    outline: 'none',
  };

  return (
    <section style={{ padding: theme.sectionPadding, background: hsl(theme.colors.muted) }}>
      <div className="mx-auto px-6" style={{ maxWidth: '44rem' }}>
        {headline && (
          <div className="text-center mb-8">
            <h2
              className="text-3xl sm:text-4xl mb-3 font-semibold tracking-tight"
              style={{
                fontFamily: theme.typography.headingFont,
                fontWeight: theme.typography.headingWeight,
                color: hsl(theme.colors.foreground),
              }}
            >
              {headline}
            </h2>
            {description && (
              <p className="text-base max-w-lg mx-auto" style={{ color: hsl(theme.colors.mutedForeground) }}>
                {description}
              </p>
            )}
          </div>
        )}

        <div
          className="p-6 sm:p-10 shadow-sm transition-all"
          style={{
            background: hsl(theme.colors.card),
            borderRadius: theme.radius,
            border: `1px solid ${hsla(theme.colors.border, 0.6)}`,
          }}
        >
          <form data-demo-form="true" data-ut-intent="contact.submit" className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" placeholder="Your name" style={inputStyle} className="transition-all focus:ring-2 focus:ring-primary/20" />
              <input type="email" placeholder="your@email.com" style={inputStyle} className="transition-all focus:ring-2 focus:ring-primary/20" />
            </div>
            <textarea placeholder="How can we help?" rows={4} style={inputStyle} className="transition-all focus:ring-2 focus:ring-primary/20" />
            <button
              type="submit"
              className="w-full text-sm font-semibold py-3.5 transition-all hover:opacity-90 active:scale-[0.99] cursor-pointer shadow-sm"
              style={{
                background: hsl(theme.colors.primary),
                color: hsl(theme.colors.primaryForeground),
                borderRadius: theme.radius,
                border: 'none',
                fontFamily: theme.typography.bodyFont,
              }}
            >
              {submitLabel}
            </button>
          </form>

          {(phone || email || address) && (
            <div
              className="mt-8 pt-6 border-t flex flex-wrap gap-4 justify-center text-center text-sm"
              style={{ borderColor: hsla(theme.colors.border, 0.4), color: hsl(theme.colors.mutedForeground) }}
            >
              {phone && <p><a href={`tel:${phone}`} data-ut-cta="cta.phone" style={{ color: 'inherit', textDecoration: 'none' }}>{phone}</a></p>}
              {email && <p><a href={`mailto:${email}`} data-ut-cta="cta.email" style={{ color: 'inherit', textDecoration: 'none' }}>{email}</a></p>}
              {address && <p><a href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" data-ut-cta="cta.address" style={{ color: 'inherit', textDecoration: 'none' }}>{address}</a></p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
