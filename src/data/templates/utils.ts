/**
 * Layout Templates - Utility Functions
 * Shared helpers for template generation
 * 
 * REACT-ONLY: All templates output React component strings (.tsx)
 * Uses JSON.stringify for CSS/HTML strings to prevent Babel parsing crashes in Sandpack.
 */

/**
 * Extracts <style> block content from HTML body strings
 */
function extractStyles(body: string): { styles: string; cleanBody: string } {
  const styleBlocks: string[] = [];
  const cleanBody = body.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, css) => {
    styleBlocks.push(css.trim());
    return '';
  });
  return { styles: styleBlocks.join('\n\n'), cleanBody: cleanBody.trim() };
}

/**
 * Extracts <script> block content from HTML body strings
 */
function extractScripts(body: string): { scripts: string; cleanBody: string } {
  const scriptBlocks: string[] = [];
  const cleanBody = body.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (_, js) => {
    scriptBlocks.push(js.trim());
    return '';
  });
  return { scripts: scriptBlocks.join('\n\n'), cleanBody: cleanBody.trim() };
}

/**
 * Wraps body content into a React component with embedded styles and interactive behavior.
 * 
 * IMPORTANT: Uses JSON.stringify for all embedded strings to prevent
 * Babel/Sandpack crashes caused by CSS syntax inside template literals.
 * 
 * The component:
 * 1. Injects all <style> blocks via useEffect
 * 2. Runs interactive scripts (tabs, carousel, scroll-reveal) via useEffect
 * 3. Renders HTML content via dangerouslySetInnerHTML (preserves Tailwind classes)
 */
export const wrapInReactComponent = (body: string, title: string = "Template"): string => {
  // Extract styles and scripts from the body content
  const { styles: extractedStyles, cleanBody: bodyAfterStyles } = extractStyles(body);
  const { scripts: extractedScripts, cleanBody: finalBody } = extractScripts(bodyAfterStyles);

  const baseStyles = 'html { scroll-behavior: smooth; }\n@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }\ndetails > summary { list-style: none; cursor: pointer; }\ndetails > summary::-webkit-details-marker { display: none; }\n.tw-focus:focus-visible { outline: 2px solid rgba(56, 189, 248, 0.8); outline-offset: 3px; }';
  
  const fullStyles = baseStyles + '\n' + extractedStyles;

  // Use JSON.stringify for CSS/HTML strings — Babel-safe, no template literal parsing issues
  const stylesJson = JSON.stringify(fullStyles);
  const bodyJson = JSON.stringify(finalBody);
  const titleJson = JSON.stringify(title);

  return `import React, { useEffect, useRef } from 'react';

/**
 * ${title}
 * Auto-generated React component from premium template
 */

const TEMPLATE_STYLES = ${stylesJson};

const TEMPLATE_HTML = ${bodyJson};

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Inject styles
  useEffect(() => {
    const style = document.createElement('style');
    style.setAttribute('data-template-styles', '');
    style.textContent = TEMPLATE_STYLES;
    document.head.appendChild(style);
    
    // Set body classes
    document.body.classList.add('bg-slate-950', 'text-white');
    document.title = ${titleJson};
    
    return () => {
      style.remove();
      document.body.classList.remove('bg-slate-950', 'text-white');
    };
  }, []);

  // Run interactive scripts after HTML is mounted
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // Smooth-scroll for in-page anchors
    const handleClick = (e: Event) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';
      if (href.length < 2) return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    };
    container.addEventListener('click', handleClick);

    // Data-toggle
    const handleToggle = (e: Event) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const btn = t.closest('[data-toggle]');
      if (!btn) return;
      const selector = btn.getAttribute('data-toggle');
      if (!selector) return;
      const panel = document.querySelector(selector);
      if (!(panel instanceof HTMLElement)) return;
      panel.classList.toggle('hidden');
      panel.setAttribute('aria-hidden', panel.classList.contains('hidden') ? 'true' : 'false');
    };
    container.addEventListener('click', handleToggle);

    // Scroll reveal with iframe-safe fallback
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });
    container.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));

    // Iframe-safe: force-reveal elements in viewport after 300ms
    setTimeout(() => {
      container.querySelectorAll('[data-reveal]:not(.revealed)').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < (window.innerHeight || document.documentElement.clientHeight) + 100) {
          el.classList.add('revealed');
        }
      });
    }, 300);

    // Fallback: force-reveal ALL after 2s (IntersectionObserver is unreliable in iframes)
    const fallbackTimer = setTimeout(() => {
      container.querySelectorAll('[data-reveal]:not(.revealed)').forEach(el => {
        el.classList.add('revealed');
      });
    }, 2000);

    // Tabs
    container.querySelectorAll('[data-tabs]').forEach((root) => {
      const buttons = Array.from(root.querySelectorAll('[data-tab]'));
      const panels = Array.from(root.querySelectorAll('[data-tab-panel]'));
      if (buttons.length === 0 || panels.length === 0) return;
      const theme = (root.getAttribute('data-tabs-theme') || 'dark').toLowerCase();

      const applyButtonStyles = (button: Element, isActive: boolean) => {
        if (!(button instanceof HTMLElement)) return;
        if (theme === 'light') {
          button.classList.toggle('bg-neutral-900', isActive);
          button.classList.toggle('text-white', isActive);
          button.classList.toggle('bg-white', !isActive);
          button.classList.toggle('text-neutral-900', !isActive);
        } else {
          button.classList.toggle('bg-white/10', isActive);
          button.classList.toggle('text-white', isActive);
          button.classList.toggle('bg-white/5', !isActive);
          button.classList.toggle('text-slate-300', !isActive);
        }
      };

      const activate = (key: string) => {
        buttons.forEach(b => {
          const isActive = b.getAttribute('data-tab') === key;
          applyButtonStyles(b, isActive);
          b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        panels.forEach(p => {
          const isActive = p.getAttribute('data-tab-panel') === key;
          p.classList.toggle('hidden', !isActive);
        });
      };

      const initial = root.getAttribute('data-tabs') || buttons[0]?.getAttribute('data-tab');
      if (initial) activate(initial);

      root.addEventListener('click', (e) => {
        const t = e.target;
        if (!(t instanceof Element)) return;
        const b = t.closest('[data-tab]');
        if (!(b instanceof HTMLElement)) return;
        const key = b.getAttribute('data-tab');
        if (key) activate(key);
      });
    });

    // Carousel
    container.querySelectorAll('[data-carousel]').forEach((root) => {
      const items = Array.from(root.querySelectorAll('[data-carousel-item]')).filter(x => x instanceof HTMLElement) as HTMLElement[];
      if (items.length === 0) return;
      let index = 0;
      const show = (i: number) => {
        index = (i + items.length) % items.length;
        items.forEach((it, idx) => it.classList.toggle('hidden', idx !== index));
      };
      show(0);
      root.addEventListener('click', (e) => {
        const t = e.target;
        if (!(t instanceof Element)) return;
        if (t.closest('[data-carousel-prev]')) show(index - 1);
        if (t.closest('[data-carousel-next]')) show(index + 1);
      });
    });

    // Pricing switch
    container.querySelectorAll('[data-pricing]').forEach((root) => {
      const checkbox = root.querySelector('[data-pricing-switch]') as HTMLInputElement | null;
      if (!checkbox) return;
      const apply = () => {
        const annual = checkbox.checked;
        root.querySelectorAll('[data-price-monthly]').forEach(el => el.classList.toggle('hidden', annual));
        root.querySelectorAll('[data-price-annual]').forEach(el => el.classList.toggle('hidden', !annual));
      };
      checkbox.addEventListener('change', apply);
      apply();
    });

    // Sticky dismiss
    const stickyStoragePrefix = 'stickyDismissed:';
    container.querySelectorAll('[data-sticky-key]').forEach(el => {
      if (!(el instanceof HTMLElement)) return;
      const key = el.getAttribute('data-sticky-key');
      if (!key) return;
      try {
        if (localStorage.getItem(stickyStoragePrefix + key) === '1') {
          el.classList.add('hidden');
          el.setAttribute('aria-hidden', 'true');
        }
      } catch { /* ignore */ }
    });

    const handleDismiss = (e: Event) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const btn = t.closest('[data-dismiss]');
      if (!btn) return;
      const selector = btn.getAttribute('data-dismiss') || '';
      const key = btn.getAttribute('data-dismiss-key') || undefined;
      const sticky = selector && selector !== 'closest'
        ? document.querySelector(selector)
        : btn.closest('[data-sticky]') || btn.closest('[data-sticky-key]');
      if (!sticky || !(sticky instanceof HTMLElement)) return;
      e.preventDefault();
      e.stopPropagation();
      sticky.classList.add('hidden');
      sticky.setAttribute('aria-hidden', 'true');
      if (key) {
        try { localStorage.setItem(stickyStoragePrefix + key, '1'); } catch { /* ignore */ }
      }
    };
    container.addEventListener('click', handleDismiss, true);

    // Demo forms
    container.querySelectorAll('form[data-demo-form]').forEach(form => {
      if (!(form instanceof HTMLFormElement)) return;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = form.getAttribute('data-demo-message') || "Thanks! We'll be in touch shortly.";
        const host = form.closest('[data-demo-form-host]') || form;
        const existing = host.querySelector('[data-demo-toast]');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.setAttribute('data-demo-toast', '');
        toast.className = 'mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200';
        toast.textContent = msg;
        host.appendChild(toast);
      });
    });

    return () => {
      container.removeEventListener('click', handleClick);
      container.removeEventListener('click', handleToggle);
      container.removeEventListener('click', handleDismiss, true);
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <div ref={containerRef} dangerouslySetInnerHTML={{ __html: TEMPLATE_HTML }} />
  );
}
`;
};

/**
 * @deprecated Use wrapInReactComponent instead. Kept for backward compatibility during migration.
 */
export const wrapInHtmlDoc = wrapInReactComponent;

/**
 * Gets the VFS-ready React code for a template.
 * If template already contains React imports, returns as-is.
 * Otherwise wraps raw HTML via wrapInReactComponent.
 */
export const getTemplateReactCode = (template: { code: string; title?: string; name?: string }): string => {
  // If already React code, return as-is
  if (template.code.includes('import React') || template.code.includes('export default function')) {
    return template.code;
  }
  // Wrap raw HTML into React component
  return wrapInReactComponent(template.code, template.title || template.name || 'Template');
};
