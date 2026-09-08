import React from 'react';
import * as stylex from '@stylexjs/stylex';
import * as Dialog from '@/unison/ui/radix/dialog';
import { Menu, X } from '@/unison/ui/icons';

const styles = stylex.create({
  shell: { display: { default: 'flex', '@media (min-width: 64rem)': 'none' }, alignItems: 'center', gap: '1rem', minHeight: 'var(--ut-nav-block)', padding: '1rem', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' },
  brand: { flexGrow: 1, minWidth: 0, overflowWrap: 'anywhere', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.4, color: 'inherit', textDecoration: 'none' },
  button: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: '2.75rem', height: '2.75rem', border: '1px solid hsl(var(--border))', borderRadius: 'min(var(--radius), 8px)', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))', cursor: 'pointer', outline: { default: 'none', ':focus-visible': '2px solid hsl(var(--ring))' }, outlineOffset: '3px' },
  overlay: { position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'hsl(var(--foreground) / 0.45)' },
  panel: { position: 'fixed', insetBlock: 0, insetInlineEnd: 0, zIndex: 101, width: 'min(24rem, 100%)', boxSizing: 'border-box', overflowY: 'auto', padding: '1.5rem', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))', fontFamily: 'var(--font-body)' },
  headingRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' },
  title: { margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.5rem', overflowWrap: 'anywhere' },
  links: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  link: { display: 'flex', alignItems: 'center', minHeight: '2.75rem', padding: '0.75rem', overflowWrap: 'anywhere', textDecoration: 'none', color: 'hsl(var(--foreground))', borderRadius: 'min(var(--radius), 8px)', backgroundColor: { default: 'transparent', ':hover': 'hsl(var(--muted))' }, outline: { default: 'none', ':focus-visible': '2px solid hsl(var(--ring))' }, outlineOffset: '2px' },
  cta: { marginTop: '1rem', backgroundColor: { default: 'hsl(var(--primary))', ':hover': 'hsl(var(--primary) / 0.9)' }, color: 'hsl(var(--primary-foreground))', fontWeight: 600 },
});

export default function MobileNavigation({ brand, links = [], cta }) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia('(min-width: 64rem)');
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    closeOnDesktop();
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, [open]);
  return <div {...stylex.props(styles.shell)} data-ut-mobile-navigation="radix-stylex">
    <a href="#" {...stylex.props(styles.brand)}>{brand}</a>
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild><button type="button" aria-label="Open navigation" {...stylex.props(styles.button)}><Menu aria-hidden="true" size={20} /></button></Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay {...stylex.props(styles.overlay)} />
        <Dialog.Content aria-describedby={undefined} {...stylex.props(styles.panel)}>
          <div {...stylex.props(styles.headingRow)}>
            <Dialog.Title {...stylex.props(styles.title)}>Navigation</Dialog.Title>
            <Dialog.Close asChild><button type="button" aria-label="Close navigation" {...stylex.props(styles.button)}><X aria-hidden="true" size={20} /></button></Dialog.Close>
          </div>
          <nav aria-label="Mobile navigation" {...stylex.props(styles.links)}>
            {(Array.isArray(links) ? links : []).map((link, index) => <Dialog.Close asChild key={index}><a href={link.href || '#'} data-ut-intent={link.intent} {...stylex.props(styles.link)}>{link.label}</a></Dialog.Close>)}
            {cta && <Dialog.Close asChild><a href={cta.href || '#'} data-ut-intent={cta.intent} {...stylex.props(styles.link, styles.cta)}>{cta.label}</a></Dialog.Close>}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </div>;
}