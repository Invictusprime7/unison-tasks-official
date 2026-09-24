import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LAUNCHER_BASE_THEME as theme } from '@/sections/themes';
import type { SectionEntry } from '@/sections/types';
import { GalleryLightboxGrid } from '@/sections/variants/gallery/GalleryLightboxGrid';
import { GalleryCinematicGrid } from '@/sections/variants/gallery/GalleryCinematicGrid';
import { GalleryMasonry } from '@/sections/variants/gallery/GalleryMasonry';
import { BeforeAfterSlider } from '@/sections/variants/beforeAfter/BeforeAfterSlider';
import { BeforeAfterGrid } from '@/sections/variants/beforeAfter/BeforeAfterGrid';

afterEach(cleanup);

const gallery: SectionEntry<'gallery'> = {
  id: 'proof', type: 'gallery', props: {
    headline: 'Our work', filterable: true,
    items: [
      { src: '/cut.jpg', alt: 'Precision cut', caption: 'Cut result', category: 'Hair' },
      { src: '/room.jpg', alt: 'Restored room', caption: 'Room result', category: 'Rooms' },
    ],
  },
};
const comparison: SectionEntry<'before-after'> = {
  id: 'results', type: 'before-after', props: {
    items: [
      { before: '/old.jpg', after: '/new.jpg', label: 'Kitchen' },
      { before: '/roof-old.jpg', after: '/roof-new.jpg', label: 'Roof' },
    ],
  },
};

describe.each([GalleryLightboxGrid, GalleryCinematicGrid, GalleryMasonry])('gallery proof interactions (%s)', Component => {
  it('announces the image position and preserves category captions while navigating', () => {
    render(<Component section={gallery} theme={theme} />);
    fireEvent.click(screen.getByRole('button', { name: 'Precision cut' }));
    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByRole('status')).toHaveTextContent('Image 1 of 2: Precision cut');
    expect(dialog.getByText('Hair')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowRight' });
    expect(dialog.getByRole('status')).toHaveTextContent('Image 2 of 2: Restored room');
    expect(dialog.getByText('Rooms')).toBeInTheDocument();
  });
  it('filters the images and opens the corresponding result in the lightbox', () => {
    render(<Component section={gallery} theme={theme} />);
    fireEvent.click(screen.getByRole('button', { name: 'Rooms' }));
    expect(screen.queryByRole('img', { name: 'Precision cut' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Restored room' }));
    expect(within(screen.getByRole('dialog')).getByRole('img', { name: 'Restored room' })).toHaveAttribute('src', '/room.jpg');
    fireEvent.click(screen.getByRole('button', { name: 'Close gallery' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows new content when the selected category disappears or filtering is disabled', () => {
    const view = render(<Component section={gallery} theme={theme} />);
    fireEvent.click(screen.getByRole('button', { name: 'Rooms' }));
    view.rerender(<Component section={{ ...gallery, props: { ...gallery.props, filterable: false } }} theme={theme} />);
    expect(screen.getByRole('img', { name: 'Precision cut' })).toBeInTheDocument();
    view.rerender(<Component section={{ ...gallery, props: { ...gallery.props, items: [gallery.props.items[0]] } }} theme={theme} />);
    expect(screen.getByRole('img', { name: 'Precision cut' })).toBeInTheDocument();
  });
});

describe('before/after proof interactions', () => {
  it('drags the divider and clamps it to the image bounds', () => {
    render(<BeforeAfterSlider section={comparison} theme={theme} />);
    const surface = screen.getByRole('img', { name: 'Kitchen before' }).parentElement!;
    surface.getBoundingClientRect = () => ({ left: 100, width: 200 }) as DOMRect;
    surface.setPointerCapture = vi.fn();
    surface.hasPointerCapture = () => true;
    surface.releasePointerCapture = vi.fn();
    const pointer = (type: string, clientX: number) => {
      const event = new MouseEvent(type, { bubbles: true, clientX, button: 0 });
      Object.defineProperty(event, 'pointerId', { value: 1 });
      fireEvent(surface, event);
    };
    pointer('pointerdown', 150);
    expect(surface.setPointerCapture).toHaveBeenCalledWith(1);
    expect(screen.getByRole('slider')).toHaveValue('25');
    pointer('pointermove', 400);
    expect(screen.getByRole('slider')).toHaveValue('100');
    pointer('pointermove', 0);
    expect(screen.getByRole('slider')).toHaveValue('0');
    pointer('pointerup', 0);
    expect(surface.releasePointerCapture).toHaveBeenCalledWith(1);
  });

  it('changes the reveal amount and resets it when selecting another project', () => {
    render(<BeforeAfterSlider section={comparison} theme={theme} />);
    const slider = screen.getByRole('slider', { name: 'Reveal the finished result' });
    fireEvent.change(slider, { target: { value: '80' } });
    expect(slider).toHaveAttribute('aria-valuetext', '80% after');
    expect(screen.getByRole('img', { name: 'Kitchen after' }).parentElement).toHaveStyle({ clipPath: 'inset(0 20% 0 0)' });
    fireEvent.click(screen.getByRole('button', { name: 'Roof' }));
    expect(screen.getByRole('img', { name: 'Roof after' })).toHaveAttribute('src', '/roof-new.jpg');
    expect(slider).toHaveValue('50');
    expect(screen.getByRole('button', { name: 'Roof' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not render an incomplete transformation as a comparison', () => {
    const view = render(<BeforeAfterSlider section={{ ...comparison, props: { items: [{ before: '', after: '/new.jpg' }] } }} theme={theme} />);
    expect(screen.queryByRole('slider')).toBeNull();
    expect(view.container.querySelector('img')).toBeNull();
  });

  it('excludes incomplete grid pairs instead of requesting empty image URLs', () => {
    render(<BeforeAfterGrid section={{ ...comparison, props: { items: [...comparison.props.items, { before: '', after: '/new.jpg' }] } }} theme={theme} />);
    expect(screen.getAllByRole('img')).toHaveLength(4);
    expect(screen.getAllByText('Before')).toHaveLength(2);
    expect(screen.getAllByText('After')).toHaveLength(2);
  });
});
