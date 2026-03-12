import React from 'react';
import type { BaseSectionProps } from '../types';
import { hsl, hsla, containerStyle, sectionStyle, headingStyle, bodyStyle, primaryButtonStyle } from '../themeUtils';

export const ContactSection: React.FC<BaseSectionProps<'contact'>> = ({ section, theme }) => {
  const { headline, description, fields, submitLabel = 'Send Message', submitIntent = 'contact.submit', phone, email, address } = section.props;

  const defaultFields = fields || [
    { name: 'name', type: 'text', placeholder: 'Your name', required: true },
    { name: 'email', type: 'email', placeholder: 'your@email.com', required: true },
    { name: 'message', type: 'textarea', placeholder: 'How can we help?', required: true },
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: theme.radius,
    border: `1px solid ${hsla(theme.colors.border, 1)}`,
    background: hsl(theme.colors.card),
    color: hsl(theme.colors.cardForeground),
    fontFamily: theme.typography.bodyFont,
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <section style={{ ...sectionStyle(theme), background: hsl(theme.colors.muted) }}>
      <div style={{ ...containerStyle(theme), maxWidth: '900px' }}>
        {(headline || description) && (
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            {headline && <h2 style={{ ...headingStyle(theme), fontSize: '2.25rem', marginBottom: '1rem' }}>{headline}</h2>}
            {description && <p style={{ ...bodyStyle(theme), fontSize: '1.1rem' }}>{description}</p>}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: (phone || email || address) ? '1fr 1fr' : '1fr', gap: '3rem' }}>
          <form data-demo-form="true" data-intent={submitIntent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {defaultFields.map((field, i) => (
              field.type === 'textarea' ? (
                <textarea key={i} name={field.name} placeholder={field.placeholder} required={field.required} rows={4} style={inputStyle} />
              ) : (
                <input key={i} type={field.type} name={field.name} placeholder={field.placeholder} required={field.required} style={inputStyle} />
              )
            ))}
            <button type="submit" style={{ ...primaryButtonStyle(theme), width: '100%' }}>
              {submitLabel}
            </button>
          </form>

          {(phone || email || address) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {address && (
                <div>
                  <h4 style={{ ...headingStyle(theme), fontSize: '0.9rem', marginBottom: '0.25rem' }}>Address</h4>
                  <p style={{ ...bodyStyle(theme), fontSize: '0.9rem' }}>{address}</p>
                </div>
              )}
              {phone && (
                <div>
                  <h4 style={{ ...headingStyle(theme), fontSize: '0.9rem', marginBottom: '0.25rem' }}>Phone</h4>
                  <p style={{ ...bodyStyle(theme), fontSize: '0.9rem' }}>{phone}</p>
                </div>
              )}
              {email && (
                <div>
                  <h4 style={{ ...headingStyle(theme), fontSize: '0.9rem', marginBottom: '0.25rem' }}>Email</h4>
                  <p style={{ ...bodyStyle(theme), fontSize: '0.9rem' }}>{email}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
