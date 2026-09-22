import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import * as Babel from '@babel/standalone';
import { normalizeImageCompatibility } from '@/utils/imageCompatibility';
import { buildGeneratedUiFoundation } from '@/platform/core/generatedUiFoundation';
import { prepareSandpackFiles } from '@/utils/sandpackFilePrep';

afterEach(cleanup);
function mediaModule() {
  const source = buildGeneratedUiFoundation({ themePresetId: 'editorial' }).files['/src/unison/ui/media.tsx'];
  const code = Babel.transform(source, { filename: 'media.tsx', presets: ['typescript', 'react'], plugins: ['transform-modules-commonjs'] }).code!;
  const exports: Record<string, any> = {};
  new Function('require', 'exports', code)((name: string) => name === 'react' ? React : name === './cn' ? { cn: (...items: unknown[]) => items.filter(Boolean).join(' ') } : {}, exports);
  return exports;
}

describe('image compatibility', () => {
  it('normalizes default, aliased, namespace and type imports without rewriting other props', () => {
    for (const source of [
      "import Photo, { type StaticImageData } from 'next/image'; export default () => <Photo src={{src:'/hero.jpg',width:1200,height:800}} alt='Hero' fill />;",
      "import * as Photo from 'next/legacy/image'; export default () => <Photo.default src='/hero.jpg' alt='Hero' />;",
      "import { default as Photo } from 'next/image'; export default () => <Photo src='/hero.jpg' alt='Hero' />;",
    ]) {
      const normalized = normalizeImageCompatibility(source, '/src/pages/Home.tsx');
      expect(normalized.issues).toEqual([]);
      expect(normalized.code).not.toContain('next/');
      expect(normalized.code).toContain('@/unison/ui/media');
      expect(normalizeImageCompatibility(normalized.code, '/src/pages/Home.tsx').code).toBe(normalized.code);
    }
  });
  it('keeps JSX images separate from browser constructors and scoped component parameters', () => {
    const source = "const preload = new Image(); export default () => <Image src='/hero.jpg' alt='Hero' />;";
    const normalized = normalizeImageCompatibility(source, '/src/pages/Home.tsx').code;
    expect(normalized).toContain('new Image()');
    expect(normalized).toContain('Image as _UnisonImage');
    expect(normalized).toContain('<_UnisonImage');
    const scoped = 'export default function Section({ Image }) { return <Image />; }';
    expect(normalizeImageCompatibility(scoped, '/src/pages/Home.tsx').code).toBe(scoped);
    expect(normalizeImageCompatibility("import Image from 'next/image'; const preload = new Image(); export default () => <Image alt='x' />;", '/src/pages/Home.tsx').code).toContain('new globalThis.Image()');
  });
  it('rejects unsupported helpers with a file-specific diagnostic', () => {
    expect(normalizeImageCompatibility("import { getImageProps } from 'next/image';", '/src/pages/Gallery.tsx').issues[0]).toContain('/src/pages/Gallery.tsx: unsupported image import "getImageProps"');
  });
  it('renders static asset objects and local fallbacks without taking down navigation', () => {
    const { Image: SiteImage, default: DefaultImage } = mediaModule();
    expect(DefaultImage).toBe(SiteImage);
    const view = render(<main><a href='/contact'>Contact</a><h1>Editorial</h1><SiteImage src={{ default: { src: '/hero.jpg', width: 1200, height: 800 } }} alt='Studio' priority /></main>);
    const image = screen.getByAltText('Studio');
    expect(image.getAttribute('src')).toBe('/hero.jpg');
    expect(image.getAttribute('width')).toBe('1200');
    expect(image.style.aspectRatio).toBe('1200 / 800');
    fireEvent.error(image);
    expect(screen.getByRole('img', { name: 'Studio: image unavailable' }).style.aspectRatio).toBe('1200 / 800');
    expect(screen.getByRole('link', { name: 'Contact' })).toBeTruthy();
    view.rerender(<SiteImage src='/recovered.jpg' alt='Recovered' width={1200} height={800} />);
    expect(screen.getByAltText('Recovered').getAttribute('src')).toBe('/recovered.jpg');
  });
  it('handles missing sources and fill sizing locally', () => {
    const { Image: SiteImage } = mediaModule();
    render(<SiteImage src={null} alt='Missing portrait' fill />);
    const fallback = screen.getByRole('img', { name: 'Missing portrait: image unavailable' });
    expect(fallback.style.width).toBe('100%');
    expect(fallback.style.height).toBe('100%');
  });
  it('contains failed 3D textures inside the media fallback', async () => {
    const source = buildGeneratedUiFoundation({ themePresetId: 'editorial' }).files['/src/unison/ui/experience/media.tsx'];
    const code = Babel.transform(source, { filename: 'experience-media.tsx', presets: ['typescript', 'react'], plugins: ['transform-modules-commonjs'] }).code!;
    const passthrough = ({ children }: { children: React.ReactNode }) => <>{children}</>;
    const exports: Record<string, any> = {};
    const dependencies: Record<string, unknown> = {
      react: React,
      '@/unison/ui': { cn: (...items: unknown[]) => items.filter(Boolean).join(' ') },
      '../media': mediaModule(),
      './lazy': { WebglLayer: ({ fallback }: { fallback: React.ReactNode }) => <>{fallback}</> },
    };
    new Function('require', 'exports', code)((name: string) => dependencies[name], exports);
    const Gallery = exports.DepthGallery;
    await act(async () => { render(<main><a href='/contact'>Contact</a><Gallery items={[{ src: '/failed.jpg', alt: 'Portrait' }]} /></main>); });
    fireEvent.error(screen.getByAltText('Portrait'));
    expect(screen.getByRole('img', { name: 'Portrait: image unavailable' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Contact' })).toBeTruthy();
  });
  it('never crosses import boundaries when preparing the foundation', () => {
    const foundation = buildGeneratedUiFoundation({ themePresetId: 'editorial' });
    const files = prepareSandpackFiles({ ...foundation.files, '/src/App.tsx': 'export default function App(){return <main>Editorial</main>}' }, { strict: true });
    expect(files['/unison/ui/experience/webgl.tsx']).toContain("from '@react-three/drei'");
    expect(files['/unison/ui/experience/scene.tsx']).not.toContain("@react-three/drei");
    expect(files['/unison/ui/experience/scene.tsx']).not.toContain('ExperienceCanvas as Points');
    expect(files['/unison/ui/media.tsx']).toContain('export default Image;');
    expect(files['/unison/ui/media.tsx']).not.toContain('export default ImageLightbox');
  });
});
