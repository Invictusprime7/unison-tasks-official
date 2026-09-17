/**
 * Blog Preview Variant: Featured Grid
 * Equal-weight card grid for a steady publishing cadence.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { BlogPreviewFrame, PostLink, PostMeta, normalizePosts } from './BlogPreviewFrame';
import { hsl } from '../../themeUtils';

export const BlogPreviewFeaturedGrid: React.FC<BaseSectionProps<'blog-preview'>> = ({ section, theme }) => {
  const posts = normalizePosts(section.props.posts, (section.props as { items?: unknown }).items);

  return (
    <BlogPreviewFrame
      variantId="blog-preview:featured-grid"
      theme={theme}
      headline={section.props.headline}
      subheadline={(section.props as { subheadline?: string }).subheadline}
      surface="muted"
    >
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <article
            key={i}
            className="flex flex-col overflow-hidden"
            style={{
              borderRadius: theme.radius,
              border: `1px solid ${hsl(theme.colors.border)}`,
              background: hsl(theme.colors.card),
              color: hsl(theme.colors.cardForeground),
            }}
          >
            {post.image && (
              <img
                src={post.image}
                alt={post.title}
                loading="lazy"
                style={{ aspectRatio: '16 / 10', objectFit: 'cover', width: '100%' }}
              />
            )}
            <div className="flex flex-1 flex-col p-6">
              <PostMeta theme={theme} post={post} />
              <h3
                className="mb-2 text-lg"
                style={{
                  fontFamily: theme.typography.headingFont,
                  fontWeight: theme.typography.headingWeight,
                }}
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
