import type { ExtractedSectionContent } from '../types';

function pageIntroJSX(content: ExtractedSectionContent, banner: boolean): string {
  const literal = (value: string) => `{${JSON.stringify(value)}}`;
  const image = banner && content.imageSrc
    ? `<img src=${literal(content.imageSrc)} alt=${literal(content.imageAlt || '')} className="aspect-[16/5] max-h-80 w-full object-cover" />`
    : '';
  const buttons = (content.ctaButtons || []).map(button => `<a href=${literal(button.href)} className="inline-flex rounded-[var(--radius)] border border-border px-5 py-3 font-body">${literal(button.text)}</a>`).join('\n');
  return `<section data-variant="hero:${banner ? 'editorial-banner' : 'page-title'}" className="border-b border-border bg-background pt-20 text-foreground">
    ${image}
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      ${content.badge ? `<p className="mb-3 font-body text-sm text-primary">${literal(content.badge)}</p>` : ''}
      <h1 className="max-w-4xl break-words font-heading text-3xl sm:text-4xl">${literal(content.heading || '')}</h1>
      ${content.subheading ? `<p className="mt-4 max-w-2xl font-body text-lg text-muted-foreground">${literal(content.subheading)}</p>` : ''}
      <div className="mt-6 flex flex-wrap gap-3">${buttons}</div>
    </div>
  </section>`;
}

export const heroPageTitleJSX = (content: ExtractedSectionContent) => pageIntroJSX(content, false);
export const heroEditorialBannerJSX = (content: ExtractedSectionContent) => pageIntroJSX(content, true);