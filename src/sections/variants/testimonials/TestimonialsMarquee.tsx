/**
 * Testimonials Variant: Marquee
 *
 * Two continuously scrolling rows of proof cards, edge-faded into the surface.
 *
 * Adapted from 21st.dev "Testimonials Marquee" (21st:822). The vendor
 * testimonial-card dependency is replaced with the canonical TestimonialCard,
 * and the scroll halts entirely under prefers-reduced-motion.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
import { TestimonialsFrame, TestimonialCard, normalizeTestimonials } from './TestimonialsFrame';

const MARQUEE_CSS = `
@keyframes utMarqueeLeft { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes utMarqueeRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
[data-ut-variant="testimonials:marquee"] .ut-marquee-a { animation: utMarqueeLeft 42s linear infinite; }
[data-ut-variant="testimonials:marquee"] .ut-marquee-b { animation: utMarqueeRight 52s linear infinite; }
[data-ut-variant="testimonials:marquee"] .ut-marquee-track:hover { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  [data-ut-variant="testimonials:marquee"] .ut-marquee-track { animation: none; transform: none; }
  [data-ut-variant="testimonials:marquee"] .ut-marquee-row { overflow-x: auto; }
}
`;

export const TestimonialsMarquee: React.FC<BaseSectionProps<'testimonials'>> = ({ section, theme }) => {
  const { headline, subheadline, items } = section.props;
  const testimonials = normalizeTestimonials(items);
  if (!testimonials.length) return null;

  const half = Math.ceil(testimonials.length / 2);
  const rows = [testimonials.slice(0, half), testimonials.slice(half).length ? testimonials.slice(half) : testimonials];

  return (
    <TestimonialsFrame
      variantId="testimonials:marquee"
      theme={theme}
      headline={headline}
      subheadline={subheadline}
      surface="muted"
    >
      <style>{MARQUEE_CSS}</style>
      <div className="relative flex flex-col gap-6 overflow-hidden">
        {rows.map((row, r) => (
          <div key={r} className="ut-marquee-row overflow-hidden">
            <div className={`ut-marquee-track flex w-max gap-6 ${r === 0 ? 'ut-marquee-a' : 'ut-marquee-b'}`}>
              {[...row, ...row].map((item, i) => (
                <div key={i} className="w-[320px] shrink-0">
                  <TestimonialCard item={item} theme={theme} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-24"
          style={{ background: `linear-gradient(to right, ${hsl(theme.colors.muted)}, transparent)` }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-24"
          style={{ background: `linear-gradient(to left, ${hsl(theme.colors.muted)}, transparent)` }}
        />
      </div>
    </TestimonialsFrame>
  );
};
