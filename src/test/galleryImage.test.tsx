import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GalleryImage } from '@/sections/variants/gallery/GalleryImage';
import type { ThemeTokens } from '@/sections/types';

const theme = { colors: { muted: '0 0% 95%', mutedForeground: '0 0% 30%' } } as ThemeTokens;

describe('Gallery image resilience', () => {
  it('replaces failed media with an accessible fallback and retries a changed source', () => {
    const view = render(<GalleryImage src="/missing.jpg" alt="Salon work" theme={theme} />);
    fireEvent.error(screen.getByRole('img', { name: 'Salon work' }));
    expect(screen.getByRole('img', { name: 'Salon work: image unavailable' }).tagName).toBe('SPAN');
    expect(view.container.querySelector('img')).toBeNull();
    view.rerender(<GalleryImage src="/repaired.jpg" alt="Salon work" theme={theme} />);
    expect(screen.getByRole('img', { name: 'Salon work' }).getAttribute('src')).toBe('/repaired.jpg');
  });

  it('does not request an empty source', () => {
    const view = render(<GalleryImage src="" alt="" theme={theme} />);
    expect(screen.getByRole('img', { name: 'Image unavailable' })).toBeTruthy();
    expect(view.container.querySelector('img')).toBeNull();
  });
});