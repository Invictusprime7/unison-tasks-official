import type { BaseSectionProps, SectionPropsMap } from '../../types';

export function HeroPageIntro({ props }: { props: SectionPropsMap['hero'] }) {
  const { headline, subheadline, description, badge, ctas = [], image, backgroundImage, layout } = props;
  const banner = layout === 'editorial-banner';
  const media = image || backgroundImage;
  return (
    <section data-ut-variant={banner ? 'hero:editorial-banner' : 'hero:page-title'} className="border-b border-border bg-background text-foreground" style={{ paddingTop: 'var(--ut-nav-block, 5rem)' }}>
      {banner && media && <img src={media} alt="" className="aspect-[16/5] max-h-80 w-full object-cover" />}
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        {badge && <p className="mb-3 font-body text-sm font-semibold text-primary">{badge}</p>}
        <h1 className="max-w-4xl break-words font-heading text-3xl font-semibold leading-tight sm:text-4xl">{headline}</h1>
        {subheadline && <p className="mt-4 max-w-2xl font-body text-lg text-muted-foreground">{subheadline}</p>}
        {description && <p className="mt-3 max-w-2xl font-body text-muted-foreground">{description}</p>}
        {ctas.length > 0 && <div className="mt-6 flex flex-wrap gap-3">{ctas.map((cta, index) => (
          <a key={index} href={cta.href || '#'} data-ut-intent={cta.intent} data-ut-cta={index === 0 ? 'cta.hero' : 'cta.hero-secondary'} className={cta.variant === 'outline' ? 'rounded-[var(--radius)] border border-border px-5 py-3 font-body text-foreground focus-visible:outline focus-visible:outline-2' : 'rounded-[var(--radius)] bg-primary px-5 py-3 font-body text-primary-foreground focus-visible:outline focus-visible:outline-2'}>{cta.label}</a>
        ))}</div>}
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