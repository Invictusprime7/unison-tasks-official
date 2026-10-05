/**
 * Blog Preview Frame
 *
 * Shared chrome for every blog-preview variant: section shell, optional
 * headline block and post normalization. Variants supply only the arrangement.
 */

import React from 'react';
import type { ThemeTokens } from '../../types';
import { hsl } from '../../themeUtils';

export interface PostEntry {
  title: string;
  excerpt?: string;
  image?: string;
  date?: string;
  author?: string;
  href: string;
}

export const normalizePosts = (posts: unknown, items?: unknown): PostEntry[] => {
  const source = Array.isArray(posts) && posts.length ? posts : Array.isArray(items) ? items : [];
  return source
    .map((raw) => {
      const entry = (raw || {}) as Record<string, unknown>;
      const title = String(entry.title ?? entry.name ?? entry.headline ?? '').trim();
      if (!title) return null;
      return {
        title,
        excerpt: entry.excerpt ? String(entry.excerpt) : entry.description ? String(entry.description) : undefined,
        image: entry.image ? String(entry.image) : undefined,
        date: entry.date ? String(entry.date) : undefined,
        author: entry.author ? String(entry.author) : undefined,
        href: entry.href ? String(entry.href) : '#',
      } as PostEntry;
    })
    .filter(Boolean) as PostEntry[];
};

export const PostMeta: React.FC<{ theme: ThemeTokens; post: PostEntry }> = ({ theme, post }) => {
  const meta = [post.date, post.author].filter(Boolean).join(' · ');
  if (!meta) return null;
  return (
    <p
      className="mb-2 text-xs uppercase"
      style={{ fontFamily: theme.typography.bodyFont, letterSpacing: '0.12em', color: hsl(theme.colors.mutedForeground) }}
    >
      {meta}
    </p>
  );
};

export const PostLink: React.FC<{ theme: ThemeTokens; href: string; label?: string }> = ({ theme, href, label }) => (
  <a data-ut-intent="nav.goto"
    href={href}
    className="mt-auto inline-block text-sm"
    style={{ fontFamily: theme.typography.bodyFont, fontWeight: 600, color: hsl(theme.colors.primary), textDecoration: 'none' }}
  >
    {label || 'Read more'}
  </a>
);

export const BlogPreviewFrame: React.FC<{
  variantId: string;
  theme: ThemeTokens;
  headline?: string;
  subheadline?: string;
  surface?: 'background' | 'muted';
  children: React.ReactNode;
}> = ({ variantId, theme, headline, subheadline, surface = 'background', children }) => (
  <section
    data-ut-variant={variantId}
    style={{
      padding: theme.sectionPadding,
      background: hsl(surface === 'muted' ? theme.colors.muted : theme.colors.background),
    }}
  >
    <div className="mx-auto px-5 sm:px-6 lg:px-8" style={{ maxWidth: theme.containerWidth }}>
      {(headline || subheadline) && (
        <div className="mb-8 max-w-2xl md:mb-12">
          {headline && (
            <h2 data-ut-slot="blog-preview.headline"
              className="mb-3 text-2xl sm:text-3xl md:text-4xl"
              style={{
                fontFamily: theme.typography.headingFont,
                fontWeight: theme.typography.headingWeight,
                color: hsl(theme.colors.foreground),
              }}
            >
              {headline}
            </h2>
          )}
          {subheadline && (
            <p data-ut-slot="blog-preview.subheadline"
              className="text-lg"
              style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
            >
              {subheadline}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  </section>
);
