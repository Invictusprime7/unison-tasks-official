import type { CSSProperties, ReactNode } from 'react';

/**
 * Unison background layer — decorative page-wide effects (glows, dot
 * patterns, gradients) that render BEHIND any section. Backgrounds are
 * not sections: they carry no content slots and never appear in a page's
 * section vocabulary. A composed page may place at most one background
 * layer behind its sections.
 */

export type UnisonBackgroundVariant = 'glow' | 'dots' | 'gradient';

export interface UnisonBackgroundProps {
  /** Which decorative effect to render. */
  variant?: UnisonBackgroundVariant;
  /** Section content rendered on top of the effect. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function UnisonBackground({
  variant = 'glow',
  children,
  className,
  style,
}: UnisonBackgroundProps) {
  return (
    <div className={`relative isolate overflow-hidden ${className ?? ''}`} style={style}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {variant === 'glow' && (
          <>
            <div className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[hsl(var(--primary)/0.18)] blur-3xl" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[hsl(var(--accent)/0.35)] blur-3xl" />
          </>
        )}
        {variant === 'dots' && (
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(hsl(var(--foreground) / 0.18) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        )}
        {variant === 'gradient' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--muted))] via-transparent to-[hsl(var(--muted))]" />
        )}
      </div>
      {children}
    </div>
  );
}
