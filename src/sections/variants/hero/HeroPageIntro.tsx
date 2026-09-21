/**
 * Hero Variants: Page Title / Editorial Banner
 *
 * page-title is a canonical adaptation of 21st:18129 "Page Header Breadcrumb"
 * by @uiable — a rounded card pairing a breadcrumb-style trail with the current
 * page title. editorial-banner is a canonical adaptation of 21st:19077
 * "Editorial Image Hero" by @felipemenezes098 — a full-width landscape image
 * above a top-aligned tagline paired with a right-aligned editorial headline,
 * description and actions.
 *
 * shadcn Breadcrumb, motion/react, react-wrap-balancer and the hero-07 CTA
 * utility are replaced by canonical markup, Stage 4b tokens and intent anchors;
 * the source reveal is expressed through `motion-safe` utilities only.
 */

import React from 'react';
import type { BaseSectionProps, SectionPropsMap } from '../../types';

function Actions({ ctas }: { ctas: SectionPropsMap['hero']['ctas'] }) {
  if (!ctas?.length) return null;
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {ctas.map((cta, index) => (
        <a
          key={index}
          href={cta.href || '#'}
          data-ut-intent={cta.intent}
          data-ut-cta={index === 0 ? 'cta.hero' : 'cta.hero-secondary'}
          className={
            cta.variant === 'outline'
              ? 'inline-flex items-center rounded-[var(--radius)] border border-border px-5 py-3 font-body text-foreground motion-safe:transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2'
              : 'inline-flex items-center rounded-[var(--radius)] bg-primary px-5 py-3 font-body text-primary-foreground motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2'
          }
        >
          {cta.label}
        </a>
      ))}
    </div>
  );
}

export function HeroPageIntro({ props }: { props: SectionPropsMap['hero'] }) {
  const { headline, subheadline, description, badge, ctas = [], image, backgroundImage, layout } = props;
  const banner = layout === 'editorial-banner';
  const media = image || backgroundImage;

  if (banner) {
    // 21st:19077 — landscape image above, tagline left, headline right.
    return (
      <section
        data-ut-variant="hero:editorial-banner"
        data-ut-slot="hero"
        className="border-b border-border bg-background text-foreground"
        style={{ paddingTop: 'var(--ut-nav-block, 5rem)' }}
      >
        {media && (
          <img
            src={media}
            alt=""
            loading="lazy"
            data-ut-slot="hero-media"
            className="aspect-[16/5] max-h-96 w-full object-cover motion-safe:transition-transform motion-safe:duration-700"
          />
        )}
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-10">
          <p className="font-body text-sm uppercase tracking-[0.18em] text-muted-foreground">{badge || ''}</p>
          <div className="lg:text-right">
            <h1 className="ml-auto max-w-3xl text-balance break-words font-heading text-3xl font-[number:var(--ut-weight-display)] leading-tight tracking-tight sm:text-4xl md:text-5xl">
              {headline}
            </h1>
            {subheadline && (
              <p className="ml-auto mt-5 max-w-2xl font-body text-lg text-muted-foreground">{subheadline}</p>
            )}
            {description && <p className="ml-auto mt-3 max-w-2xl font-body text-muted-foreground">{description}</p>}
            <div className="lg:flex lg:justify-end">
              <Actions ctas={ctas} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 21st:18129 — breadcrumb trail above the page title, inside a raised card.
  return (
    <section
      data-ut-variant="hero:page-title"
      data-ut-slot="hero"
      className="bg-background text-foreground"
      style={{ paddingTop: 'var(--ut-nav-block, 5rem)' }}
    >
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-col gap-2 rounded-[calc(var(--radius)+0.5rem)] border border-border bg-card p-6 text-card-foreground shadow-lg sm:p-8">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 font-body text-sm text-muted-foreground">
            <a href="#/" className="motion-safe:transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2">
              Home
            </a>
            <span aria-hidden="true">/</span>
            <span className="text-foreground">{badge || headline}</span>
          </nav>
          <h1 className="max-w-4xl break-words font-heading text-3xl font-[number:var(--ut-weight-display)] leading-tight tracking-tight sm:text-4xl">
            {headline}
          </h1>
          {subheadline && <p className="mt-2 max-w-2xl font-body text-lg text-muted-foreground">{subheadline}</p>}
          {description && <p className="mt-2 max-w-2xl font-body text-muted-foreground">{description}</p>}
          <Actions ctas={ctas} />
        </div>
      </div>
    </section>
  );
}

export function HeroPageTitle({ section }: BaseSectionProps<'hero'>) {
  return <HeroPageIntro props={{ ...section.props, layout: 'page-title' }} />;
}

export function HeroEditorialBanner({ section }: BaseSectionProps<'hero'>) {
  return <HeroPageIntro props={{ ...section.props, layout: 'editorial-banner' }} />;
}
