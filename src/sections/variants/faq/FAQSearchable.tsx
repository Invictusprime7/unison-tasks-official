import { editorialCardStyle } from '../shared/editorialStyles';
import React, { useId, useState } from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
import { EditorialSection } from '../shared/EditorialSection';
import { normalizeFaqItems } from './FAQFrame';

export function FAQSearchable({ section, theme }: BaseSectionProps<'faq'>) {
  const [query, setQuery] = useState('');
  const searchId = useId();
  const items = normalizeFaqItems(section.props.items);
  const term = query.trim().toLowerCase();
  const matches = items
    .map((item, index) => ({ ...item, index }))
    .filter((item) => `${item.question} ${item.answer}`.toLowerCase().includes(term));
  return (
    <EditorialSection
      variantId="faq:searchable"
      theme={theme}
      headline={section.props.headline}
      description={section.props.subheadline}
    >
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_2fr]">
        <div className="p-6" style={editorialCardStyle(theme)}>
          <label htmlFor={searchId} className="block text-sm font-medium">
            Search questions
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try a topic or keyword"
            className="mt-3 min-h-12 w-full border p-3 text-sm"
            style={{ ...editorialCardStyle(theme), background: hsl(theme.colors.background) }}
          />
          <p role="status" className="mt-4 text-sm" style={{ color: hsl(theme.colors.mutedForeground) }}>
            {matches.length} {matches.length === 1 ? 'answer' : 'answers'}
          </p>
        </div>
        <div className="space-y-3">
          {matches.length ? (
            matches.map((item) => (
              <details
                key={item.index}
                data-ut-slot={`question-${item.index}`}
                className="p-6"
                style={editorialCardStyle(theme)}
              >
                <summary className="cursor-pointer text-lg font-medium">{item.question}</summary>
                <p
                  className="mt-4 whitespace-pre-line leading-relaxed"
                  style={{ color: hsl(theme.colors.mutedForeground) }}
                >
                  {item.answer}
                </p>
              </details>
            ))
          ) : (
            <p className="py-6">No matching questions. Try a different search.</p>
          )}
        </div>
      </div>
    </EditorialSection>
  );
}
