import React, { useState } from 'react';
import type { BaseSectionProps } from '../types';
import { hsl, hsla, containerStyle, sectionStyle, headingStyle, bodyStyle, cardStyle } from '../themeUtils';

export const FAQSection: React.FC<BaseSectionProps<'faq'>> = ({ section, theme }) => {
  const { headline, subheadline, items } = section.props;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section style={{ ...sectionStyle(theme), background: hsl(theme.colors.background) }}>
      <div style={{ ...containerStyle(theme), maxWidth: '800px' }}>
        {(headline || subheadline) && (
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            {headline && <h2 style={{ ...headingStyle(theme), fontSize: '2.25rem', marginBottom: '1rem' }}>{headline}</h2>}
            {subheadline && <p style={{ ...bodyStyle(theme), fontSize: '1.1rem' }}>{subheadline}</p>}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((item, i) => (
            <div key={i} style={{ ...cardStyle(theme), overflow: 'hidden' }}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '1.25rem 1.5rem', border: 'none', cursor: 'pointer',
                  background: 'transparent', textAlign: 'left',
                  ...headingStyle(theme), fontSize: '1rem',
                }}
              >
                {item.question}
                <span style={{ fontSize: '1.25rem', color: hsl(theme.colors.mutedForeground), transition: 'transform 0.2s', transform: openIndex === i ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              {openIndex === i && (
                <div style={{ ...bodyStyle(theme), padding: '0 1.5rem 1.25rem', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
