/**
 * Contact Variant: Quote Request
 *
 * A qualifying intake form rather than a plain message box: what the visitor
 * needs, when they need it and how to reach them. Used by service industries
 * where the first conversion is a scoped enquiry, not a newsletter signup.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const ContactQuoteRequest: React.FC<BaseSectionProps<'contact'>> = ({ section, theme }) => {
  const { headline, description, submitLabel = 'Request a quote', phone, email } = section.props;

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.7rem 0.9rem',
    borderRadius: theme.radius,
    border: `1px solid ${hsla(theme.colors.border, 0.85)}`,
    background: hsl(theme.colors.background),
    color: hsl(theme.colors.foreground),
    fontFamily: theme.typography.bodyFont,
    fontSize: '0.875rem',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.35rem',
    fontSize: '0.75rem',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    fontFamily: theme.typography.bodyFont,
    color: hsl(theme.colors.mutedForeground),
  };

  return (
    <section
      data-variant="contact:quote-request"
      style={{ padding: theme.sectionPadding, background: hsla(theme.colors.primary, 0.04) }}
    >
      <div className="mx-auto px-6 grid gap-10 md:grid-cols-5" style={{ maxWidth: theme.containerWidth }}>
        <div className="md:col-span-2">
          {headline && (
            <h2
              className="text-3xl mb-3"
              style={{
                fontFamily: theme.typography.headingFont,
                fontWeight: theme.typography.headingWeight,
                color: hsl(theme.colors.foreground),
              }}
            >
              {headline}
            </h2>
          )}
          {description && (
            <p className="text-base mb-6" style={{ color: hsl(theme.colors.mutedForeground) }}>
              {description}
            </p>
          )}
          <div className="flex flex-col gap-2 text-sm" style={{ color: hsl(theme.colors.mutedForeground) }}>
            {phone && (
              <a href={`tel:${phone}`} data-ut-intent="contact.call">
                {phone}
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} data-ut-intent="contact.email">
                {email}
              </a>
            )}
          </div>
        </div>

        <form
          data-demo-form="true"
          data-ut-intent="quote.request"
          className="md:col-span-3 grid gap-4 sm:grid-cols-2 p-6"
          style={{
            background: hsl(theme.colors.card),
            border: `1px solid ${hsla(theme.colors.border, 0.7)}`,
            borderRadius: theme.radius,
          }}
        >
          <div>
            <label style={labelStyle} htmlFor="quote-name">Name</label>
            <input id="quote-name" name="name" type="text" style={fieldStyle} placeholder="Full name" />
          </div>
          <div>
            <label style={labelStyle} htmlFor="quote-email">Email</label>
            <input id="quote-email" name="email" type="email" style={fieldStyle} placeholder="you@example.com" />
          </div>
          <div>
            <label style={labelStyle} htmlFor="quote-service">What do you need?</label>
            <input id="quote-service" name="service" type="text" style={fieldStyle} placeholder="Describe the work" />
          </div>
          <div>
            <label style={labelStyle} htmlFor="quote-when">Preferred timing</label>
            <input id="quote-when" name="timing" type="text" style={fieldStyle} placeholder="e.g. within two weeks" />
          </div>
          <div className="sm:col-span-2">
            <label style={labelStyle} htmlFor="quote-detail">Anything else</label>
            <textarea id="quote-detail" name="detail" rows={4} style={fieldStyle} placeholder="Access, budget, site details" />
          </div>
          <button
            type="submit"
            className="sm:col-span-2 text-sm font-medium px-6 py-3 transition-all hover:opacity-90 cursor-pointer"
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
      </div>
    </section>
  );
};
