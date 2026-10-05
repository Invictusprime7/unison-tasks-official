/**
 * Testimonials Variant: Grid
 * Balanced two/three column proof grid.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { TestimonialsFrame, TestimonialCard, normalizeTestimonials } from './TestimonialsFrame';

export const TestimonialsGrid: React.FC<BaseSectionProps<'testimonials'>> = ({ section, theme }) => {
  const items = normalizeTestimonials(section.props.items);
  const cols = items.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';

  return (
    <TestimonialsFrame
      variantId="testimonials:grid"
      theme={theme}
      headline={section.props.headline}
      subheadline={section.props.subheadline}
    >
      <div className={`grid gap-6 ${cols}`}>
        {items.map((item, i) => (
          <div key={i} data-ut-slot={`testimonial-${i}`}><TestimonialCard item={item} theme={theme} /></div>
        ))}
      </div>
    </TestimonialsFrame>
  );
};
