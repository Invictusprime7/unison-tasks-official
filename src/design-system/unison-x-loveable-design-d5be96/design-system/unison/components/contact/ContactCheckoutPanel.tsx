import { editorialCardStyle } from '../shared/editorialStyles';
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
import { EditorialSection } from '../shared/EditorialSection';
import { EditorialContactDetails, EditorialContactForm } from './EditorialContactForm';

/** A checkout support surface. Cart totals and payment remain runtime-owned. */
export function ContactCheckoutPanel({ section, theme }: BaseSectionProps<'contact'>) {
  return (
    <EditorialSection
      variantId="contact:checkout-panel"
      theme={theme}
      headline={section.props.headline}
      description={section.props.description}
    >
      <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="p-6 sm:p-9" style={editorialCardStyle(theme)}>
          <h3 className="mb-6 text-xl" style={{ fontFamily: theme.typography.headingFont }}>
            Questions about your order?
          </h3>
          <EditorialContactForm props={section.props} theme={theme} />
        </div>
        <aside className="p-6 sm:p-9" style={editorialCardStyle(theme)}>
          <h3 className="text-2xl" style={{ fontFamily: theme.typography.headingFont }}>
            Ready to continue?
          </h3>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: hsl(theme.colors.mutedForeground) }}>
            Review your cart and continue to checkout.
          </p>
          <button
            type="button"
            data-ut-intent="cart.checkout"
            data-ut-slot="checkout"
            className="mb-8 mt-6 min-h-12 w-full px-5 py-3 text-sm font-semibold"
            style={{
              background: hsl(theme.colors.primary),
              color: hsl(theme.colors.primaryForeground),
              borderRadius: theme.radius,
            }}
          >
            Continue to checkout ↗
          </button>
          <EditorialContactDetails props={section.props} />
        </aside>
      </div>
    </EditorialSection>
  );
}
