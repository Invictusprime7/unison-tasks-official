import { editorialCardStyle } from '../shared/editorialStyles';
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
import { EditorialSection } from '../shared/EditorialSection';
import { EditorialContactForm, EditorialContactDetails } from './EditorialContactForm';

export function ContactMapStudio({ section, theme }: BaseSectionProps<'contact'>) {
  const { address, showMap } = section.props;
  return (
    <EditorialSection
      variantId="contact:map-studio"
      theme={theme}
      headline={section.props.headline}
      description={section.props.description}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden" style={editorialCardStyle(theme)}>
          {showMap && address && (
            <iframe
              title={`Map of ${address}`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-72 w-full border-0"
            />
          )}
          <div className="p-7 sm:p-9" style={{ background: hsl(theme.colors.muted) }}>
            <EditorialContactDetails props={section.props} />
          </div>
        </div>
        <div className="p-6 sm:p-9" style={editorialCardStyle(theme)}>
          <EditorialContactForm props={section.props} theme={theme} />
        </div>
      </div>
    </EditorialSection>
  );
}
