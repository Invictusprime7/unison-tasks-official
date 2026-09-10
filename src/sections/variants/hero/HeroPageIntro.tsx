import type { BaseSectionProps, SectionPropsMap } from '../../types';

export function HeroPageIntro({ props }: { props: SectionPropsMap['hero'] }) {
  const { headline, subheadline, description, badge, ctas = [], stats, image, backgroundImage, layout } = props;
  const banner = layout === 'editorial-banner';
  const media = image || backgroundImage;
  return (
    <section data-ut-variant={banner ? 'hero:editorial-banner' : 'hero:page-title'} className="border-b border-border bg-background text-foreground" style={{ paddingTop: 'var(--ut-nav-block, 5rem)' }}>
      {banner && media && <div className="ut-hero-media flex min-h-[var(--ut-hero-media-block)] items-center justify-center overflow-hidden bg-muted"><img src={media} alt="" className="block max-h-[var(--ut-hero-media-block)] w-full object-contain" /></div>}
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        {badge && <p className="ut-eyebrow mb-3 font-body text-sm font-semibold text-primary">{badge}</p>}
        <h1 className="max-w-4xl break-words font-heading text-3xl font-semibold leading-tight sm:text-4xl">{headline}</h1>
        {subheadline && <p className="ut-lead mt-4 max-w-2xl font-body text-lg text-muted-foreground">{subheadline}</p>}
        {description && <p className="mt-3 max-w-2xl font-body text-muted-foreground">{description}</p>}
        {ctas.length > 0 && <div className="ut-hero-actions mt-6 flex flex-wrap gap-3">{ctas.map((cta, index) => (
          <a key={index} href={cta.href || '#'} data-ut-intent={cta.intent} data-ut-cta={index === 0 ? 'cta.hero' : 'cta.hero-secondary'} className={cta.variant === 'outline' ? 'rounded-[var(--radius)] border border-border px-5 py-3 font-body text-foreground focus-visible:outline focus-visible:outline-2' : 'rounded-[var(--radius)] bg-primary px-5 py-3 font-body text-primary-foreground focus-visible:outline focus-visible:outline-2'}>{cta.label}</a>
        ))}</div>}
        {stats && stats.length > 0 && <div className="ut-hero-stats mt-8 grid gap-4 sm:grid-cols-3">{stats.map((stat, index) => <div key={index}><div className="font-heading text-2xl font-semibold text-primary">{stat.value}</div><div className="font-body text-sm text-muted-foreground">{stat.label}</div></div>)}</div>}
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