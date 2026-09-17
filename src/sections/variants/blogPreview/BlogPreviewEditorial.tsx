/**
 * Blog Preview Variant: Editorial
 * Lead story with a stacked reading list beside it.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { BlogPreviewFrame, PostLink, PostMeta, normalizePosts } from './BlogPreviewFrame';
import { hsl } from '../../themeUtils';

export const BlogPreviewEditorial: React.FC<BaseSectionProps<'blog-preview'>> = ({ section, theme }) => {
  const posts = normalizePosts(section.props.posts, (section.props as { items?: unknown }).items);
  const [lead, ...rest] = posts;

  return (
    <BlogPreviewFrame
      variantId="blog-preview:editorial"
      theme={theme}
      headline={section.props.headline}
      subheadline={(section.props as { subheadline?: string }).subheadline}
    >
      <div className="grid gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        {lead && (
          <article className="flex flex-col">
            {lead.image && (
              <img
                src={lead.image}
                alt={lead.title}
                loading="lazy"
                style={{ borderRadius: theme.radius, aspectRatio: '16 / 10', objectFit: 'cover', width: '100%' }}
              />
            )}
            <div className="mt-6 flex flex-1 flex-col">
              <PostMeta theme={theme} post={lead} />
              <h3
                className="mb-3 text-2xl"
                style={{
                  fontFamily: theme.typography.headingFont,
                  fontWeight: theme.typography.headingWeight,
                  color: hsl(theme.colors.foreground),
                }}
              >
                {lead.title}
              </h3>
              {lead.excerpt && (
                <p
                  className="mb-5 text-base leading-relaxed"
                  style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
                >
                  {lead.excerpt}
                </p>
              )}
              <PostLink theme={theme} href={lead.href} label="Read the story" />
            </div>
          </article>
        )}
        <div className="flex flex-col">
          {rest.map((post, i) => (
            <article
              key={i}
              className="flex flex-col py-6"
              style={{ borderTop: i === 0 ? 'none' : `1px solid ${hsl(theme.colors.border)}` }}
            >
              <PostMeta theme={theme} post={post} />
              <h3
                className="mb-2 text-lg"
                style={{
                  fontFamily: theme.typography.headingFont,
                  fontWeight: theme.typography.headingWeight,
                  color: hsl(theme.colors.foreground),
                }}
              >
                {post.title}
              </h3>
              {post.excerpt && (
                <p
                  className="mb-3 text-sm leading-relaxed"
                  style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
                >
                  {post.excerpt}
                </p>
              )}
              <PostLink theme={theme} href={post.href} />
            </article>
          ))}
        </div>
      </div>
    </BlogPreviewFrame>
  );
};
