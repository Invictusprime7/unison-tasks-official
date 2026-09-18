/**
 * Hero Variant: Image Stream
 *
 * Source-adapted from the 21st.dev component "Image Stream Hero"
 * (21st:24377, @ruixen.ui). The corridor geometry is preserved while content,
 * media, colors, identity and actions are bound to Unison's canonical section
 * contract and Stage 4b theme tokens.
 */
import React from 'react';
import type { BaseSectionProps, GalleryItem } from '../../types';
import { hsl, hsla } from '../../themeUtils';

type CorridorPath = {
  perspective: number;
  cardWidth: number;
  cardHeight: number;
  cardRadius: number;
  birthHeight: number;
  exitHeight: number;
  railBirth: number;
  railExit: number;
  fan: number;
  turnBirth: number;
  turnExit: number;
  stops: number;
};

const PATH: CorridorPath = {
  perspective: 30,
  cardWidth: 18,
  cardHeight: 25,
  cardRadius: 0.4,
  birthHeight: 2.6,
  exitHeight: 46,
  railBirth: -11,
  railExit: 44,
  fan: 3.3,
  turnBirth: 6,
  turnExit: 28,
  stops: 24,
};

function corridorKeyframes(direction: 1 | -1, name: string): string {
  const steps: string[] = [];
  for (let step = 0; step <= PATH.stops; step += 1) {
    const progress = step / PATH.stops;
    const scale = (PATH.birthHeight / PATH.cardHeight)
      * Math.pow(PATH.exitHeight / PATH.birthHeight, progress);
    const depth = PATH.perspective * (1 - 1 / scale);
    const rail = PATH.railExit
      - (PATH.railExit - PATH.railBirth) * Math.pow(1 - progress, PATH.fan);
    const turn = PATH.turnBirth + (PATH.turnExit - PATH.turnBirth) * progress;
    steps.push(
      `${(progress * 100).toFixed(2)}%{transform:translate3d(${(direction * rail).toFixed(2)}cqw,0,${depth.toFixed(2)}cqw) rotateY(${(-direction * turn).toFixed(2)}deg)}`,
    );
  }
  return `@keyframes ${name}{${steps.join('')}}`;
}

function resolveImages(
  images: GalleryItem[] | undefined,
  image: string | undefined,
  backgroundImage: string | undefined,
  headline: string,
): GalleryItem[] {
  const supplied = Array.isArray(images)
    ? images.filter((item) => typeof item?.src === 'string' && item.src.trim())
    : [];
  if (supplied.length) return supplied;
  const fallback = backgroundImage || image;
  return fallback ? [{ src: fallback, alt: headline }] : [];
}

export const HeroImageStream: React.FC<BaseSectionProps<'hero'>> = ({ section, theme }) => {
  const { headline, subheadline, description, ctas = [], badge, image, backgroundImage, images } = section.props;
  const media = resolveImages(images, image, backgroundImage, headline);
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const right = `ut-ish-r-${id}`;
  const left = `ut-ish-l-${id}`;
  const card = `ut-ish-c-${id}`;
  const cards = 9;
  const speed = 18;
  const axis = 56;
  const css = React.useMemo(
    () => `${corridorKeyframes(1, right)}${corridorKeyframes(-1, left)}@media(prefers-reduced-motion:reduce){.${card}{animation-play-state:paused!important}}`,
    [right, left, card],
  );

  return (
    <section
      data-ut-variant="hero:image-stream"
      data-ut-slot="hero"
      className="relative w-full overflow-hidden"
      style={{
        minHeight: 'clamp(34rem, 82vh, 56rem)',
        containerType: 'inline-size',
        background: hsl(theme.colors.background),
      }}
    >
      <style>{css}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ perspective: `${PATH.perspective}cqw`, perspectiveOrigin: `50% ${axis}%` }}
      >
        <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
          {[right, left].map((animationName) =>
            Array.from({ length: cards }, (_, index) => {
              const item = media[index % Math.max(media.length, 1)];
              return (
                <div
                  key={`${animationName}-${index}`}
                  className={`${card} absolute overflow-hidden`}
                  style={{
                    left: '50%',
                    top: `${axis}%`,
                    width: `${PATH.cardWidth}cqw`,
                    height: `${PATH.cardHeight}cqw`,
                    marginLeft: `${-PATH.cardWidth / 2}cqw`,
                    marginTop: `${-PATH.cardHeight / 2}cqw`,
                    borderRadius: `max(${PATH.cardRadius}cqw, ${theme.radius})`,
                    animation: `${animationName} ${speed}s linear infinite`,
                    animationDelay: `${-(index * speed) / cards}s`,
                    backfaceVisibility: 'hidden',
                    background: hsl(theme.colors.muted),
                    boxShadow: `0 0 0 1px ${hsla(theme.colors.border, 0.5)}`,
                  }}
                >
                  {item ? (
                    <img
                      src={item.src}
                      alt=""
                      loading={index < 2 ? 'eager' : 'lazy'}
                      decoding="async"
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : null}
                </div>
              );
            }),
          )}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${hsla(theme.colors.background, 0.96)} 0%, ${hsla(theme.colors.background, 0.18)} 38%, ${hsla(theme.colors.background, 0.88)} 100%)`,
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[inherit] flex-col items-center justify-between px-6 py-12 text-center md:py-16" style={{ maxWidth: theme.containerWidth }}>
        <div className="max-w-4xl">
          {badge ? (
            <span
              data-ut-slot="hero.badge"
              className="mb-5 inline-flex border px-3 py-1 text-xs font-medium uppercase"
              style={{ borderColor: hsl(theme.colors.border), borderRadius: theme.radius, color: hsl(theme.colors.mutedForeground) }}
            >
              {badge}
            </span>
          ) : null}
          <h1
            data-ut-slot="hero.headline"
            className="text-balance text-5xl sm:text-6xl lg:text-8xl"
            style={{
              fontFamily: theme.typography.headingFont,
              fontWeight: theme.typography.headingWeight,
              letterSpacing: 0,
              lineHeight: 0.98,
              color: hsl(theme.colors.foreground),
            }}
          >
            {headline}
          </h1>
        </div>

        <div className="flex max-w-xl flex-col items-center gap-5">
          {(subheadline || description) ? (
            <p
              data-ut-slot="hero.subheadline"
              className="text-balance text-sm leading-relaxed md:text-base"
              style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
            >
              {subheadline || description}
            </p>
          ) : null}
          {ctas.length ? (
            <div className="flex flex-wrap items-center justify-center gap-3">
              {ctas.map((cta, index) => (
                <a
                  key={`${cta.label}-${index}`}
                  href={cta.href || '#'}
                  data-ut-intent={cta.intent}
                  data-ut-cta={index === 0 ? 'cta.hero' : 'cta.hero-secondary'}
                  className="inline-flex min-h-11 items-center justify-center border px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{
                    borderColor: hsl(index === 0 ? theme.colors.primary : theme.colors.border),
                    borderRadius: `calc(${theme.radius} * 4)`,
                    background: hsl(index === 0 ? theme.colors.primary : theme.colors.background),
                    color: hsl(index === 0 ? theme.colors.primaryForeground : theme.colors.foreground),
                  }}
                >
                  {cta.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default HeroImageStream;