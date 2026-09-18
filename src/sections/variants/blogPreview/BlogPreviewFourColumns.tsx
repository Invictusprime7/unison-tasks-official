import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
import { BlogPreviewFrame, PostMeta, normalizePosts } from './BlogPreviewFrame';
/** Adapted from 21st:1421 by Tommy Jepsen (MIT); all posts come from canonical props. */
export const BlogPreviewFourColumns: React.FC<BaseSectionProps<'blog-preview'>> = ({section,theme}) => <BlogPreviewFrame variantId="blog-preview:four-columns" theme={theme} headline={section.props.headline}>
 <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{normalizePosts(section.props.posts,(section.props as {items?:unknown}).items).map((post,i)=><article key={i} className="flex flex-col gap-3">
 {post.image && <a href={post.href} tabIndex={-1} aria-hidden="true"><img src={post.image} alt="" loading="lazy" className="aspect-video w-full object-cover" style={{borderRadius:theme.radius}}/></a>}
 <PostMeta post={post} theme={theme}/><h3 className="text-xl" style={{fontFamily:theme.typography.headingFont,color:hsl(theme.colors.foreground)}}><a href={post.href} className="underline-offset-4 hover:underline">{post.title}</a></h3>
 {post.excerpt && <p className="text-sm leading-relaxed" style={{color:hsl(theme.colors.mutedForeground)}}>{post.excerpt}</p>}
 </article>)}</div></BlogPreviewFrame>;
