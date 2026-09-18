import type { BusinessSystemType } from '@/data/templates/types';
import { describe, it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { ALL_COMPOSITIONS } from '@/sections/templates';
import { buildCompositionCards } from '@/components/onboarding/wizard/wizardCatalog';
import { TemplateLivePreview } from '@/components/onboarding/TemplateLivePreview';
import { resolveSectionLayout } from '@/sections/resolveSectionLayout';
import type { SectionEntry } from '@/sections/types';

describe('Wizard layout presentation', () => {
  it('preserves registered identities and visible section order, with valid diagram assets', () => {
    for (const composition of ALL_COMPOSITIONS) {
      if (!composition.systemType) continue;
      const card = buildCompositionCards(composition.systemType as BusinessSystemType).find(entry => entry.id === composition.id)!;
      expect(card).toBeDefined();
      expect(card.sections.map(section => section.id)).toEqual(composition.sections.filter(section => !section.hidden).map(section => section.id));
      for (const section of card.sections) {
        expect(section.variantId).toBeTruthy();
        expect(existsSync(resolve('public', section.thumbnail!.replace(/^\//, ''))), section.thumbnail).toBe(true);
      }
    }
  });

  it('uses canonical legacy aliases and defaults rather than guessing from style names', () => {
    const section = (type: SectionEntry['type'], layout: string): SectionEntry => ({ id: 'example', type, props: { layout } } as SectionEntry);
    expect(resolveSectionLayout(section('hero', 'split'))?.id).toBe('hero:split-image');
    expect(resolveSectionLayout(section('testimonials', 'carousel'))?.id).toBe('testimonials:rail');
    expect(resolveSectionLayout(section('services', 'unknown'))?.id).toBe('services:card-grid');
    expect(resolveSectionLayout({ ...section('hero', 'split'), variantId: 'hero:centered' })?.id).toBe('hero:centered');
  });

  it('shows the selected sections without inventing navigation or footer content', () => {
    const card = buildCompositionCards('booking')[0];
    render(<TemplateLivePreview template={{ ...card, sections: card.sections.filter(section => section.type === 'hero') }} businessName="Studio" />);
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('Studio')).toBeInTheDocument();
    expect(screen.queryByText('navbar')).not.toBeInTheDocument();
    cleanup();
  });
});
