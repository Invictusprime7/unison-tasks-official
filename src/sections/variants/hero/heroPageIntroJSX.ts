import type { ExtractedSectionContent } from '../types';

/**
 * Portable recipes for the page-title (21st:18129, @uiable) and
 * editorial-banner (21st:19077, @felipemenezes098) hero adaptations.
 * Token-only Tailwind, no foreign colour literals.
 */
function pageIntroJSX(content: ExtractedSectionContent, banner: boolean): string {
  const literal = (value: string) => `{${JSON.stringify(value)}}`;
  const buttons = (content.ctaButtons || [])
    .map((button, index) =>
      `<a href=${literal(button.href)} className="${
        index === 0
          ? 'inline-flex items-center rounded-[var(--radius)] bg-primary px-5 py-3 font-body text-primary-foreground motion-safe:transition-transform motion-safe:hover:-translate-y-0.5'
          : 'inline-flex items-center rounded-[var(--radius)] border border-border px-5 py-3 font-body text-foreground motion-safe:transition-colors hover:bg-muted'
      }">${literal(button.text)}</a>`,
    )
    .join('\n        ');

  if (banner) {
    const image = content.imageSrc
      ? `<img src=${literal(content.imageSrc)} alt=${literal(content.imageAlt || '')} className="aspect-[16/5] max-h-96 w-full object-cover" />`
      : '';
    return `<section data-variant="hero:editorial-banner" className="border-b border-border bg-background pt-20 text-foreground">
    ${image}
    <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-10">
      <p className="font-body text-sm uppercase tracking-[0.18em] text-muted-foreground">${literal(content.badge || '')}</p>
      <div className="lg:text-right">
        <h1 className="ml-auto max-w-3xl text-balance break-words font-heading text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl">${literal(content.heading || '')}</h1>
        ${content.subheading ? `<p className="ml-auto mt-5 max-w-2xl font-body text-lg text-muted-foreground">${literal(content.subheading)}</p>` : ''}
        <div className="mt-6 flex flex-wrap gap-3 lg:justify-end">${buttons}</div>
      </div>
    </div>
  </section>`;
  }

  return `<section data-variant="hero:page-title" className="bg-background pt-20 text-foreground">
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-col gap-2 rounded-[calc(var(--radius)+0.5rem)] border border-border bg-card p-6 text-card-foreground shadow-lg sm:p-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 font-body text-sm text-muted-foreground">
          <a href="#/" className="motion-safe:transition-colors hover:text-foreground">Home</a>
          <span aria-hidden="true">/</span>
          <span className="text-foreground">${literal(content.badge || content.heading || '')}</span>
        </nav>
        <h1 className="max-w-4xl break-words font-heading text-3xl leading-tight tracking-tight sm:text-4xl">${literal(content.heading || '')}</h1>
        ${content.subheading ? `<p className="mt-2 max-w-2xl font-body text-lg text-muted-foreground">${literal(content.subheading)}</p>` : ''}
        <div className="mt-6 flex flex-wrap gap-3">${buttons}</div>
      </div>
    </div>
  </section>`;
}

export const heroPageTitleJSX = (content: ExtractedSectionContent) => pageIntroJSX(content, false);
export const heroEditorialBannerJSX = (content: ExtractedSectionContent) => pageIntroJSX(content, true);
