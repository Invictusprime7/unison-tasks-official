/**
 * Layout Templates - Utility Functions
 * Shared helpers for template generation
 * 
 * REACT-ONLY: All templates output native React/JSX component strings (.tsx)
 * No dangerouslySetInnerHTML — uses htmlToJsx converter for HTML→JSX.
 */

import { getCompositionById } from '@/sections/templates';
import { compositionToReactCode } from '@/sections/PageRenderer';
import { ensureReactImports } from '@/utils/aiCodeCleaner';
import { htmlToJsx, htmlDocToReactComponent, isHtmlDocument } from '@/utils/htmlToJsx';

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
 * Wraps body content into a React component with native JSX — no dangerouslySetInnerHTML.
 * 
 * The component:
 * 1. Converts HTML to valid JSX (class→className, style strings→objects, etc.)
 * 2. Injects <style> blocks via useEffect
 * 3. Runs interactive scripts (tabs, carousel, scroll-reveal) via useEffect
 */
export const wrapInReactComponent = (body: string, title: string = "Template"): string => {
  // If it's a full HTML document, delegate to the document converter
  if (isHtmlDocument(body)) {
    return htmlDocToReactComponent(body, 'App');
  }

  // Strip AI reasoning blocks that may leak from LLM responses
  let cleanedBody = body.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
  cleanedBody = cleanedBody.replace(/^[\s\S]*?(?=<!DOCTYPE|<html|<header|<section|<nav|<div|<main)/i, (match) => {
    if (/\b(UNDERSTAND|ANALYSE|PLAN|CONSIDER|DECIDE|I will|I need|Let me)\b/i.test(match)) return '';
    return match;
  });
  
  // Extract styles and scripts from the body content
  const { styles: extractedStyles, cleanBody: bodyAfterStyles } = extractStyles(cleanedBody);
  const { cleanBody: finalBody } = extractScripts(bodyAfterStyles);

  const baseStyles = 'html { scroll-behavior: smooth; }\n@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }\ndetails > summary { list-style: none; cursor: pointer; }\ndetails > summary::-webkit-details-marker { display: none; }\n.tw-focus:focus-visible { outline: 2px solid rgba(56, 189, 248, 0.8); outline-offset: 3px; }';
  
  const fullStyles = baseStyles + '\n' + extractedStyles;

  // Convert HTML body to valid JSX
  const jsxBody = htmlToJsx(finalBody);
  
  // Use JSON.stringify for CSS string — Babel-safe
  const stylesJson = JSON.stringify(fullStyles);
  const titleJson = JSON.stringify(title);

  return `import React, { useEffect, useRef } from 'react';

/**
 * ${title}
 * Auto-generated React component from premium template
 */

const TEMPLATE_STYLES = ${stylesJson};

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

  // Run interactive scripts after JSX is mounted
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

    // Fallback: force-reveal ALL after 2s
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

    // Demo forms
    container.querySelectorAll('form[data-demo-form]').forEach(form => {
      if (!(form instanceof HTMLFormElement)) return;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = form.getAttribute('data-demo-message') || "Thanks! We'll be in touch shortly.";
        const host = form.closest('[data-demo-form-host]') || form;
        const existing = host.querySelector('[data-demo-toast]');
        if (existing) existing.remove();
        const toastEl = document.createElement('div');
        toastEl.setAttribute('data-demo-toast', '');
        toastEl.className = 'mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200';
        toastEl.textContent = msg;
        host.appendChild(toastEl);
      });
    });

    return () => {
      container.removeEventListener('click', handleClick);
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen">
      ${jsxBody}
    </div>
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
 * 
 * Priority:
 * 1. Check if there's a section-registry composition for this template ID
 * 2. If template already contains React imports, returns as-is
 * 3. Otherwise converts raw HTML into native JSX React component
 */
export const getTemplateReactCode = (template: { code: string; id?: string; title?: string; name?: string }): string => {
  // Check for section-registry composition first
  if (template.id) {
    const composition = getCompositionById(template.id);
    if (composition) {
      return compositionToReactCode(composition);
    }
  }

  // Strip AI reasoning blocks before any processing
  let code = template.code.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim();

  // If already React code, return with imports ensured
  if (code.includes('import React') || code.includes('from "react"') || code.includes("from 'react'")) {
    return code;
  }
  
  // Has React component but missing import — use shared utility
  if (code.includes('export default function') || code.includes('export default ')) {
    return ensureReactImports(code);
  }

  // Full HTML document → convert to native JSX component
  if (isHtmlDocument(code)) {
    return htmlDocToReactComponent(code, 'App');
  }

  // Raw HTML fragment → wrap in React component with native JSX
  return wrapInReactComponent(code, template.title || template.name || 'Template');
};
