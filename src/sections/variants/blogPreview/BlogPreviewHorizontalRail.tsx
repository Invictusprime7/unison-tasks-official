/**
 * Blog Preview Variant: Horizontal Rail
 * Scrollable rail of compact posts; keeps long archives shallow on mobile.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { BlogPreviewFrame, PostLink, PostMeta, normalizePosts } from './BlogPreviewFrame';
import { hsl } from '../../themeUtils';

export const BlogPreviewHorizontalRail: React.FC<BaseSectionProps<'blog-preview'>> = ({ section, theme }) => {
  const posts = normalizePosts(section.props.posts, (section.props as { items?: unknown }).items);

  return (
    <BlogPreviewFrame
      variantId="blog-preview:horizontal-rail"
      theme={theme}
      headline={section.props.headline}
      subheadline={(section.props as { subheadline?: string }).subheadline}
    >
      <div
        className="flex gap-6 overflow-x-auto pb-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {posts.map((post, i) => (
          <article
            key={i}
            className="flex shrink-0 flex-col"
            style={{
              width: 'min(20rem, 80vw)',
              scrollSnapAlign: 'start',
              borderRadius: theme.radius,
              border: `1px solid ${hsl(theme.colors.border)}`,
              background: hsl(theme.colors.card),
              color: hsl(theme.colors.cardForeground),
              overflow: 'hidden',
            }}
          >
            {post.image && (
              <img
                src={post.image}
                alt={post.title}
                loading="lazy"
                style={{ aspectRatio: '3 / 2', objectFit: 'cover', width: '100%' }}
              />
            )}
            <div className="flex flex-1 flex-col p-5">
              <PostMeta theme={theme} post={post} />
              <h3
                className="mb-2 text-base"
                style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight }}
              >
                {post.title}
              </h3>
              {post.excerpt && (
                <p
                  className="mb-4 text-sm leading-relaxed"
                  style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
                >
                  {post.excerpt}
                </p>
              )}
              <PostLink theme={theme} href={post.href} />
            </div>
          </article>
        ))}
      </div>
    </BlogPreviewFrame>
  );
};
