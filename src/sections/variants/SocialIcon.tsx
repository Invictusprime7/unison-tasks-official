import React from 'react';

export interface SocialIconProps {
  platform: string;
  size?: number;
  className?: string;
  color?: string;
}

const labels: Record<string, string> = {
  instagram: 'IG', facebook: 'f', twitter: 't', x: 'X', linkedin: 'in',
  youtube: '▶', github: 'GH', twitch: 'TW', dribbble: 'DR', figma: 'FI',
  tiktok: 'TT', pinterest: 'P',
};

export const SocialIcon: React.FC<SocialIconProps> = ({ platform, size = 18, className, color = 'currentColor' }) => {
  const key = (platform || '').toLowerCase().trim();
  return <span aria-hidden="true" className={className} style={{ color, width: size, height: size, fontSize: Math.max(9, size * 0.55), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{labels[key] ?? '•'}</span>;
};

export const socialAriaLabel = (platform: string): string => {
  const key = (platform || '').toLowerCase().trim();
  return key ? `Visit our ${key.charAt(0).toUpperCase()}${key.slice(1)} page` : 'Social link';
};

export default SocialIcon;
