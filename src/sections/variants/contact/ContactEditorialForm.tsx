import { editorialCardStyle } from '../shared/editorialStyles';
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
import { EditorialSection } from '../shared/EditorialSection';
import { EditorialContactForm, EditorialContactDetails } from './EditorialContactForm';

export function ContactEditorialForm({ section, theme }: BaseSectionProps<'contact'>) {
  return (
    <EditorialSection
      variantId="contact:editorial-form"
      theme={theme}
      headline={section.props.headline}
      description={section.props.description}
    >
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.6fr]">
        <aside className="border-t pt-6" style={{ borderColor: hsl(theme.colors.border) }}>
          <EditorialContactDetails props={section.props} />
        </aside>
        <div className="p-6 sm:p-9" style={editorialCardStyle(theme)}>
          <EditorialContactForm props={section.props} theme={theme} />
        </div>
      </div>
    </EditorialSection>
  );
}
