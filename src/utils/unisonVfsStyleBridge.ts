/**
 * Token-consuming CSS shared by the snapshot UI foundation and preview
 * recovery paths. Stage 4b remains the sole owner of global layers and theme
 * values in /src/index.css.
 */
import stylexRecipes from '@/sections/recipes/stylexRecipes.generated.json';

export const RADIX_STYLE_RECIPE_VERSION = '1.0' as const;

export const UNISON_VFS_STYLE_BRIDGE = `/* UNISON VFS STYLE BRIDGE */
${stylexRecipes.css}
/*
 * Geometry token defaults. Stage 4b's themed /src/index.css overrides these
 * per style card; they exist only so a recovery-path VFS still has a complete
 * geometry scale. Generated sections must reference these tokens instead of
 * hardcoding heights, hero blocks, tile sizes or micro type sizes.
 */
:root {
  --ut-nav-block: 4.5rem;
  --ut-hero-block: 72vh;
  --ut-hero-space-top: clamp(5.5rem, 8vw, 6.5rem);
  --ut-hero-media-block: 20rem;
  --ut-hero-media-max: 33.75rem;
  --ut-media-block: 16.25rem;
  --ut-media-block-lg: 20rem;
  --ut-tile-block: 13.75rem;
  --ut-overlay-block: 78vh;
  --ut-eyebrow-size: 0.6875rem;
  --ut-content-width: 72rem;
  --ut-gutter: 1.25rem;
  --ut-touch-target: 2.75rem;
  --ut-shell-width: min(100% - (var(--ut-gutter) * 2), var(--ut-content-width));
  --ut-carousel-card: min(26.25rem, 85vw);
  --ut-panel-width: min(22rem, calc(100vw - (var(--ut-gutter) * 2)));
  --ut-control-radius: calc(var(--radius) - 0.125rem);
  --ut-media-radius: var(--radius);
}

/* UNISON RADIX STYLE RECIPES v${RADIX_STYLE_RECIPE_VERSION} */
@keyframes ut-radix-enter {
  from { opacity: 0; transform: translate3d(var(--ut-radix-enter-x, 0), var(--ut-radix-enter-y, 0), 0) scale(var(--ut-radix-enter-scale, 1)); }
  to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}

@keyframes ut-radix-exit {
  from { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
  to { opacity: 0; transform: translate3d(var(--ut-radix-exit-x, 0), var(--ut-radix-exit-y, 0), 0) scale(var(--ut-radix-exit-scale, 1)); }
}

@keyframes ut-radix-accordion-open {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}

@keyframes ut-radix-accordion-close {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}

@keyframes ut-radix-toast-swipe-out {
  from { transform: translateX(var(--radix-toast-swipe-end-x)); }
  to { transform: translateX(100%); }
}

@layer components {
  .unison-surface {
    border: 1px solid hsl(var(--border));
    border-radius: var(--radius);
    background: hsl(var(--card));
    color: hsl(var(--card-foreground));
    box-shadow: 0 10px 24px hsl(var(--foreground) / 0.12);
  }

  .unison-interactive-surface {
    transition: transform 300ms ease, border-color 300ms ease, box-shadow 300ms ease;
  }

  .unison-interactive-surface:hover {
    transform: translateY(-0.25rem);
    border-color: hsl(var(--primary) / 0.35);
    box-shadow: 0 18px 36px hsl(var(--foreground) / 0.14);
  }

  .unison-eyebrow {
    color: hsl(var(--primary));
    font-family: var(--font-body);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  [data-ut-radix] {
    --ut-radix-enter-x: 0;
    --ut-radix-enter-y: 0;
    --ut-radix-enter-scale: 0.98;
    --ut-radix-exit-x: 0;
    --ut-radix-exit-y: 0;
    --ut-radix-exit-scale: 0.98;
  }

  [data-ut-radix][data-state="open"] {
    animation: ut-radix-enter var(--ut-motion-duration, 180ms) var(--ut-motion-ease, ease-out);
  }

  [data-ut-radix][data-state="closed"] {
    animation: ut-radix-exit var(--ut-motion-duration, 140ms) var(--ut-motion-ease, ease-in);
  }

  [data-ut-radix][data-side="top"] { --ut-radix-enter-y: var(--ut-radix-offset, 0.5rem); }
  [data-ut-radix][data-side="right"] { --ut-radix-enter-x: calc(var(--ut-radix-offset, 0.5rem) * -1); }
  [data-ut-radix][data-side="bottom"] { --ut-radix-enter-y: calc(var(--ut-radix-offset, 0.5rem) * -1); }
  [data-ut-radix][data-side="left"] { --ut-radix-enter-x: var(--ut-radix-offset, 0.5rem); }

  [data-ut-radix]:focus-visible {
    outline: 2px solid hsl(var(--ring));
    outline-offset: 2px;
  }

  [data-ut-radix][data-disabled],
  [data-ut-radix][aria-disabled="true"] {
    cursor: not-allowed;
    opacity: 0.5;
  }

  [data-ut-radix="overlay"] {
    position: fixed;
    inset: 0;
    background: hsl(var(--foreground) / 0.48);
  }

  [data-ut-radix="content"] {
    border: 1px solid hsl(var(--border));
    border-radius: var(--ut-control-radius);
    background: hsl(var(--popover));
    color: hsl(var(--popover-foreground));
    box-shadow: 0 18px 48px hsl(var(--foreground) / 0.18);
  }

  [data-ut-radix="control"][data-state="checked"],
  [data-ut-radix="control"][data-state="on"] {
    border-color: hsl(var(--primary));
    background: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
  }

  [data-ut-radix="item"][data-highlighted] {
    outline: none;
    background: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
  }

  [data-ut-radix="accordion-content"] {
    overflow: hidden;
  }

  [data-ut-radix="accordion-content"][data-state="open"] {
    animation-name: ut-radix-accordion-open;
  }

  [data-ut-radix="accordion-content"][data-state="closed"] {
    animation-name: ut-radix-accordion-close;
  }

  [data-ut-radix="toast"][data-swipe="move"] {
    transform: translateX(var(--radix-toast-swipe-move-x));
  }

  [data-ut-radix="toast"][data-swipe="cancel"] {
    transform: translateX(0);
    transition: transform var(--ut-motion-duration, 180ms) var(--ut-motion-ease, ease-out);
  }

  [data-ut-radix="toast"][data-swipe="end"] {
    animation: ut-radix-toast-swipe-out var(--ut-motion-duration, 140ms) var(--ut-motion-ease, ease-in);
  }
}

@layer utilities {
  .unison-text-display { font-family: var(--font-heading); }
  .unison-text-body { font-family: var(--font-body); }
  .unison-motion-lift { transition: transform 300ms ease; }
  .unison-motion-lift:hover { transform: translateY(-0.25rem); }

  @media (prefers-reduced-motion: reduce) {
    .unison-interactive-surface,
    .unison-motion-lift,
    [data-ut-radix] {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
    .unison-interactive-surface:hover,
    .unison-motion-lift:hover { transform: none; }
  }
}
`;