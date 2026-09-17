import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';
import type { ThemeTokens } from '../../types';
import { hsl } from '../../themeUtils';

interface GalleryImageProps {
  src: string;
  alt: string;
  theme: ThemeTokens;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
}

const GalleryImageSource: React.FC<GalleryImageProps> = ({ src, alt, theme, className, style, loading }) => {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <span
        role="img"
        aria-label={alt ? `${alt}: image unavailable` : 'Image unavailable'}
        className="flex h-full min-h-48 w-full min-w-0 flex-col items-center justify-center gap-3 p-6 text-center"
        style={{ ...style, background: hsl(theme.colors.muted), color: hsl(theme.colors.mutedForeground) }}
      >
        <ImageOff aria-hidden="true" size={28} />
        <span className="text-sm">Image unavailable</span>
      </span>
    );
  }
  return <img src={src} alt={alt} loading={loading} className={className} style={style} onError={() => setFailed(true)} />;
};

export const GalleryImage: React.FC<GalleryImageProps> = props => <GalleryImageSource key={props.src} {...props} />;