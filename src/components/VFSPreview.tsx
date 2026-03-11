/**
 * VFSPreview - Multi-Backend Preview Component
 * 
 * A preview component supporting Docker-based Vite (local dev), Sandpack
 * (in-browser bundling for production), and static HTML (last resort).
 * 
 * Features:
 * - Docker-based Vite preview with true HMR (local dev)
 * - Sandpack in-browser bundling (production fallback, replaces deprecated CodeSandbox SSE)
 * - Static HTML fallback (no external dependencies)
 * - Automatic file sync from VFS
 * - Toolbar with status, controls, and logs
 * - Open in new tab
 */

import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { 
  RefreshCw, 
  ExternalLink, 
  Wifi, 
  WifiOff, 
  Loader2,
  Server,
  FileCode,
  Terminal,
  ChevronDown,
  AlertCircle,
  Play,
  Square,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SandpackProvider, SandpackPreview, SandpackLayout } from '@codesandbox/sandpack-react';
import { usePreviewService } from '@/hooks/usePreviewService';
import { getDependenciesForSandpack } from '@/utils/dependencyExtractor';
import { prepareSandpackFiles } from '@/utils/sandpackFilePrep';
import { getSelectedElementData, highlightElement, removeHighlight } from '@/utils/htmlElementSelector';
import type { VirtualNode, VirtualFile } from '@/hooks/useVirtualFileSystem';

// ============================================================================
// Types
// ============================================================================

type PreviewBackend = 'docker' | 'local' | 'sandpack' | 'html' | 'loading' | 'none';

// Local Vite server URL (for development without Docker)
const LOCAL_PREVIEW_URL = import.meta.env.VITE_LOCAL_PREVIEW_URL || '';

export interface VFSPreviewProps {
  /** VFS nodes for file content */
  nodes: VirtualNode[];
  /** Files map (alternative to nodes) */
  files?: Record<string, string>;
  /** Active file path */
  activeFile?: string;
  /** Additional CSS classes */
  className?: string;
  /** Show console panel */
  showConsole?: boolean;
  /** Show toolbar */
  showToolbar?: boolean;
  /** Auto-start Docker preview */
  autoStart?: boolean;
  /** Force a specific backend (kept for compatibility) */
  forceBackend?: 'docker' | 'sandpack';
  /** Callback when preview is ready */
  onReady?: () => void;
  /** Callback on error */
  onError?: (error: string) => void;
  /** Show backend indicator */
  showBackendIndicator?: boolean;
  /** Callback when navigation intent is triggered */
  onNavigate?: (path: string) => void;
  /** Callback when any intent is triggered */
  onIntentTrigger?: (intent: string, payload: Record<string, unknown>) => void;
  /** Business ID for intent context */
  businessId?: string;
  /** Site ID for intent context */
  siteId?: string;
  /** Device breakpoint for responsive preview */
  device?: 'desktop' | 'tablet' | 'mobile';
  /** Enable element selection (edit mode) */
  enableSelection?: boolean;
  /** Callback when an element is selected */
  onElementSelect?: (elementData: any) => void;
}

export interface VFSPreviewHandle {
  refresh: () => void;
  startDocker: () => Promise<void>;
  stopDocker: () => Promise<void>;
  getBackend: () => PreviewBackend;
  openInNewTab: () => void;
  getIframe: () => HTMLIFrameElement | null;
}

// ============================================================================
// Constants
// ============================================================================

const BASE_CSS = `:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.75rem;
}
* { border-color: hsl(var(--border)); }
body { 
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
  margin: 0; 
}`;

/**
 * Preview Navigation Script
 * Handles link clicks within the preview iframe:
 * 1. Intercepts data-ut-intent elements and posts to parent
 * 2. Intercepts regular /path.html links and posts to parent  
 * 3. Allows hash (#section) links to work normally
 * 4. Opens external links in new tab
 * 5. Handles cart, auth, booking, and other intents
 */
const PREVIEW_NAV_SCRIPT = `
<script>
(function() {
  'use strict';
  
  // Handle all click events on the document
  document.addEventListener('click', function(e) {
    // Find the clicked element with data-ut-intent (might be a child element)
    let target = e.target;
    let intentEl = null;
    
    // Walk up to find element with data-ut-intent or anchor
    while (target && target !== document.body) {
      if (target.getAttribute && target.getAttribute('data-ut-intent')) {
        intentEl = target;
        break;
      }
      if (target.tagName === 'A') {
        intentEl = target;
        break;
      }
      target = target.parentElement;
    }
    
    if (!intentEl) return;
    
    // Skip if element has data-no-intent (UI selectors like tabs, filters)
    if (intentEl.getAttribute('data-no-intent') !== null) {
      return; // Allow default behavior
    }
    
    const utIntent = intentEl.getAttribute('data-ut-intent') || intentEl.getAttribute('data-intent');
    const href = intentEl.getAttribute('href');
    
    // 1. Handle intent-wired elements
    if (utIntent) {
      e.preventDefault();
      e.stopPropagation();
      
      // Build payload from data attributes
      var payload = {};
      Array.from(intentEl.attributes).forEach(function(attr) {
        if (attr.name.startsWith('data-ut-') || attr.name.startsWith('data-')) {
          var key = attr.name.replace('data-ut-', '').replace('data-', '').replace(/-/g, '_');
          if (key !== 'intent' && key !== 'no_intent') {
            payload[key] = attr.value;
          }
        }
      });
      
      // Special handling for navigation intents
      if (utIntent === 'nav.goto') {
        var navPath = payload.path || href || '/';
        console.log('[Preview] nav.goto:', navPath);
        window.parent.postMessage({
          type: 'preview-nav',
          intent: 'nav.goto',
          path: navPath,
          label: intentEl.textContent?.trim() || ''
        }, '*');
        return;
      }
      
      if (utIntent === 'nav.anchor') {
        var anchor = payload.anchor || (href && href.startsWith('#') ? href.slice(1) : '');
        if (anchor) {
          var targetEl = document.getElementById(anchor) || document.querySelector('[name="' + anchor + '"]');
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
        return;
      }
      
      if (utIntent === 'nav.external') {
        window.open(href || payload.url, '_blank', 'noopener,noreferrer');
        return;
      }
      
      // All other intents - post to parent for handling
      console.log('[Preview] Intent triggered:', utIntent, payload);
      window.parent.postMessage({
        type: 'INTENT_TRIGGER',
        intent: utIntent,
        payload: payload
      }, '*');
      return;
    }
    
    // 2. Handle hash links - let them work normally
    if (href && href.startsWith('#')) {
      return;
    }
    
    // 3. Handle external links - open in new tab
    if (href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//'))) {
      e.preventDefault();
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // 4. Handle internal page links (e.g., /about.html, /contact)
    if (href && href.startsWith('/') && !href.startsWith('//')) {
      e.preventDefault();
      console.log('[Preview] Internal link clicked:', href);
      window.parent.postMessage({
        type: 'preview-nav',
        intent: 'nav.goto',
        path: href,
        label: intentEl.textContent?.trim() || ''
      }, '*');
      return;
    }
    
    // 5. Handle relative links (e.g., about.html)
    if (href && !href.includes('://') && !href.startsWith('#') && !href.startsWith('javascript:')) {
      e.preventDefault();
      var path = href.startsWith('/') ? href : '/' + href;
      console.log('[Preview] Relative link clicked:', path);
      window.parent.postMessage({
        type: 'preview-nav',
        intent: 'nav.goto',
        path: path,
        label: intentEl.textContent?.trim() || ''
      }, '*');
      return;
    }
  }, true);
  
  // Handle form submissions with intents
  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (form.tagName !== 'FORM') return;
    
    var utIntent = form.getAttribute('data-ut-intent') || form.getAttribute('data-intent');
    if (utIntent) {
      e.preventDefault();
      
      // Collect form data
      var formData = {};
      var inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(function(input) {
        if (input.name) {
          formData[input.name] = input.value;
        }
      });
      
      // Get business context from form data attributes
      var businessId = form.getAttribute('data-business-id');
      if (businessId) {
        formData.businessId = businessId;
      }
      
      console.log('[Preview] Form submitted with intent:', utIntent, formData);
      window.parent.postMessage({
        type: 'INTENT_TRIGGER',
        intent: utIntent,
        payload: formData
      }, '*');
    }
  }, true);
  
  // Listen for intent results from parent
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'INTENT_RESULT') {
      console.log('[Preview] Intent result received:', e.data.intent, e.data.result);
      // Could trigger visual feedback here if needed
    }
  });
  
  console.log('[Preview] Navigation & intent script initialized');
})();
</script>
`;

/**
 * Interactive Behaviors Script
 * Replicates the useEffect behaviors from wrapInReactComponent for static HTML preview.
 * Handles: tabs, carousel, scroll-reveal, pricing switch, data-toggle, sticky dismiss, demo forms.
 */
const INTERACTIVE_BEHAVIORS_SCRIPT = `
<script>
(function() {
  'use strict';
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Smooth-scroll for in-page anchors
  document.addEventListener('click', function(e) {
    var t = e.target;
    if (!(t instanceof Element)) return;
    var anchor = t.closest('a[href^="#"]');
    if (!anchor) return;
    var href = anchor.getAttribute('href') || '';
    if (href.length < 2) return;
    var el = document.querySelector(href);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  });

  // Data-toggle
  document.addEventListener('click', function(e) {
    var t = e.target;
    if (!(t instanceof Element)) return;
    var btn = t.closest('[data-toggle]');
    if (!btn) return;
    var selector = btn.getAttribute('data-toggle');
    if (!selector) return;
    var panel = document.querySelector(selector);
    if (!panel) return;
    panel.classList.toggle('hidden');
    panel.setAttribute('aria-hidden', panel.classList.contains('hidden') ? 'true' : 'false');
  });

  // Scroll reveal
  if (window.IntersectionObserver) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(function(el) { observer.observe(el); });
  }

  // Tabs
  document.querySelectorAll('[data-tabs]').forEach(function(root) {
    var buttons = Array.from(root.querySelectorAll('[data-tab]'));
    var panels = Array.from(root.querySelectorAll('[data-tab-panel]'));
    if (buttons.length === 0 || panels.length === 0) return;
    var theme = (root.getAttribute('data-tabs-theme') || 'dark').toLowerCase();

    function applyButtonStyles(button, isActive) {
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
    }

    function activate(key) {
      buttons.forEach(function(b) {
        var isActive = b.getAttribute('data-tab') === key;
        applyButtonStyles(b, isActive);
        b.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      panels.forEach(function(p) {
        var isActive = p.getAttribute('data-tab-panel') === key;
        p.classList.toggle('hidden', !isActive);
      });
    }

    var initial = root.getAttribute('data-tabs') || (buttons[0] && buttons[0].getAttribute('data-tab'));
    if (initial) activate(initial);

    root.addEventListener('click', function(e) {
      var t = e.target;
      if (!(t instanceof Element)) return;
      var b = t.closest('[data-tab]');
      if (!b) return;
      var key = b.getAttribute('data-tab');
      if (key) activate(key);
    });
  });

  // Carousel
  document.querySelectorAll('[data-carousel]').forEach(function(root) {
    var items = Array.from(root.querySelectorAll('[data-carousel-item]'));
    if (items.length === 0) return;
    var index = 0;
    function show(i) {
      index = ((i % items.length) + items.length) % items.length;
      items.forEach(function(it, idx) { it.classList.toggle('hidden', idx !== index); });
    }
    show(0);
    root.addEventListener('click', function(e) {
      var t = e.target;
      if (!(t instanceof Element)) return;
      if (t.closest('[data-carousel-prev]')) show(index - 1);
      if (t.closest('[data-carousel-next]')) show(index + 1);
    });
  });

  // Pricing switch
  document.querySelectorAll('[data-pricing]').forEach(function(root) {
    var checkbox = root.querySelector('[data-pricing-switch]');
    if (!checkbox) return;
    function apply() {
      var annual = checkbox.checked;
      root.querySelectorAll('[data-price-monthly]').forEach(function(el) { el.classList.toggle('hidden', annual); });
      root.querySelectorAll('[data-price-annual]').forEach(function(el) { el.classList.toggle('hidden', !annual); });
    }
    checkbox.addEventListener('change', apply);
    apply();
  });

  // Sticky dismiss
  var stickyStoragePrefix = 'stickyDismissed:';
  document.querySelectorAll('[data-sticky-key]').forEach(function(el) {
    var key = el.getAttribute('data-sticky-key');
    if (!key) return;
    try {
      if (localStorage.getItem(stickyStoragePrefix + key) === '1') {
        el.classList.add('hidden');
        el.setAttribute('aria-hidden', 'true');
      }
    } catch(e) {}
  });

  document.addEventListener('click', function(e) {
    var t = e.target;
    if (!(t instanceof Element)) return;
    var btn = t.closest('[data-dismiss]');
    if (!btn) return;
    var selector = btn.getAttribute('data-dismiss') || '';
    var key = btn.getAttribute('data-dismiss-key') || undefined;
    var sticky = selector && selector !== 'closest'
      ? document.querySelector(selector)
      : btn.closest('[data-sticky]') || btn.closest('[data-sticky-key]');
    if (!sticky) return;
    e.preventDefault();
    e.stopPropagation();
    sticky.classList.add('hidden');
    sticky.setAttribute('aria-hidden', 'true');
    if (key) {
      try { localStorage.setItem(stickyStoragePrefix + key, '1'); } catch(e) {}
    }
  }, true);

  // Demo forms
  document.querySelectorAll('form[data-demo-form]').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var msg = form.getAttribute('data-demo-message') || "Thanks! We'll be in touch shortly.";
      var host = form.closest('[data-demo-form-host]') || form;
      var existing = host.querySelector('[data-demo-toast]');
      if (existing) existing.remove();
      var toast = document.createElement('div');
      toast.setAttribute('data-demo-toast', '');
      toast.className = 'mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200';
      toast.textContent = msg;
      host.appendChild(toast);
    });
  });

  console.log('[Preview] Interactive behaviors initialized');
})();
</script>
`;

// ============================================================================
// Helpers
// ============================================================================

function nodesToFileMap(nodes: VirtualNode[]): Record<string, string> {
  const files: Record<string, string> = {};
  console.log('[VFSPreview] nodesToFileMap called with', nodes.length, 'nodes');
  
  for (const node of nodes) {
    if (node.type === 'file') {
      const file = node as VirtualFile;
      const path = file.path || `/${file.name}`;
      files[path] = file.content;
      console.log('[VFSPreview] Added file:', path, 'content length:', file.content?.length || 0);
    }
  }
  
  console.log('[VFSPreview] nodesToFileMap result:', Object.keys(files));
  return files;
}

/**
 * Generate a static HTML preview from VFS files
 * Used when Docker is unavailable
 */
function generateStaticHtmlPreview(files: Record<string, string>, activeFile?: string): string {
  // Debug: Log all available file keys
  const fileKeys = Object.keys(files);
  console.log('[VFSPreview] Static preview files available:', fileKeys, 'activeFile:', activeFile);
  
  // Helper to inject the navigation script into HTML
  const injectNavScript = (html: string): string => {
    // If already has our script, don't inject again
    if (html.includes('preview-nav') || html.includes('preview-intent')) {
      return html;
    }
    // Inject before </body>
    if (html.includes('</body>')) {
      return html.replace('</body>', `${PREVIEW_NAV_SCRIPT}\n${INTERACTIVE_BEHAVIORS_SCRIPT}\n</body>`);
    }
    // Fallback: append to end
    return html + PREVIEW_NAV_SCRIPT + INTERACTIVE_BEHAVIORS_SCRIPT;
  };
  
  // FIRST: Check for active file (for multi-page navigation)
  if (activeFile) {
    const normalizedActive = activeFile.startsWith('/') ? activeFile : `/${activeFile}`;
    const activeContent = files[normalizedActive] || files[activeFile];
    if (activeContent && (activeContent.includes('<!DOCTYPE') || activeContent.includes('<html') || activeContent.includes('<body'))) {
      console.log('[VFSPreview] Using active file:', activeFile);
      return injectNavScript(activeContent);
    }
  }
  
  // SECOND: Check for standalone HTML files that can be rendered directly
  // Check /preview.html first (stored by WebBuilder for AI-generated HTML)
  const previewHtml = files['/preview.html'] || files['preview.html'];
  if (previewHtml && (previewHtml.includes('<!DOCTYPE') || previewHtml.includes('<html') || previewHtml.includes('<body'))) {
    console.log('[VFSPreview] Using preview.html directly');
    return injectNavScript(previewHtml);
  }
  
  // Then check index.html - use if it's a complete HTML document (not a Vite entry point)
  const indexHtml = files['/index.html'] || files['index.html'];
  if (indexHtml) {
    if (!indexHtml.includes('src="/src/main.tsx"') && 
        (indexHtml.includes('<!DOCTYPE') || indexHtml.includes('<html') || indexHtml.includes('<body'))) {
      console.log('[VFSPreview] Using index.html directly');
      return injectNavScript(indexHtml);
    }
  }
  
  // Find main component file - try multiple common patterns
  let appContent = '';
  let foundPath = '';
  const possibleMainFiles = [
    '/src/App.tsx', '/App.tsx', 'src/App.tsx', 'App.tsx',
    '/src/App.jsx', '/App.jsx', 'src/App.jsx', 'App.jsx',
    '/src/Page.tsx', '/Page.tsx', 'src/Page.tsx', 'Page.tsx',
    '/src/index.tsx', '/index.tsx', 'src/index.tsx', 'index.tsx',
    '/src/Component.tsx', '/Component.tsx', 'Component.tsx',
  ];
  
  for (const path of possibleMainFiles) {
    if (files[path]) {
      appContent = files[path];
      foundPath = path;
      console.log('[VFSPreview] Found main file:', path);
      break;
    }
  }
  
  // If no main file found, try to find any .tsx or .jsx file
  if (!appContent) {
    for (const [path, content] of Object.entries(files)) {
      if ((path.endsWith('.tsx') || path.endsWith('.jsx')) && content.includes('return')) {
        appContent = content;
        foundPath = path;
        console.log('[VFSPreview] Using first component file:', path);
        break;
      }
    }
  }
  
  // Extract content from React component
  let bodyContent = '';
  let templateStyles = '';
  let templateBodyClasses = '';
  
  console.log('[VFSPreview] Attempting to extract JSX from content, length:', appContent.length);
  
  // Look for TEMPLATE_HTML const pattern (from wrapInReactComponent)
  // This matches: const TEMPLATE_HTML = `...`;
  const templateHtmlMatch = appContent.match(/const\s+TEMPLATE_HTML\s*=\s*`([\s\S]*?)`;/);
  const templateStylesMatch = appContent.match(/const\s+TEMPLATE_STYLES\s*=\s*`([\s\S]*?)`;/);
  
  if (templateHtmlMatch) {
    // Unescape template literal escapes that wrapInReactComponent added
    bodyContent = templateHtmlMatch[1]
      .replace(/\\`/g, '`')
      .replace(/\\\$/g, '$')
      .replace(/\\\\/g, '\\');
    if (templateStylesMatch) {
      templateStyles = templateStylesMatch[1]
        .replace(/\\`/g, '`')
        .replace(/\\\$/g, '$')
        .replace(/\\\\/g, '\\');
    }
    
    // Extract body classes set by the React component's useEffect
    // Pattern: document.body.classList.add('bg-slate-950', 'text-white')
    const bodyClassMatch = appContent.match(/document\.body\.classList\.add\(([^)]+)\)/);
    if (bodyClassMatch) {
      const classes = bodyClassMatch[1]
        .replace(/['"]/g, '')
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);
      templateBodyClasses = classes.join(' ');
    }
    
    console.log('[VFSPreview] Found TEMPLATE_HTML const, content length:', bodyContent.length, 'bodyClasses:', templateBodyClasses);
  }
  
  // Also try inline dangerouslySetInnerHTML pattern
  if (!bodyContent) {
    const dangerousMatch = appContent.match(/dangerouslySetInnerHTML=\{\{\s*__html:\s*`([\s\S]*?)`\s*\}\}/s);
    if (dangerousMatch) {
      bodyContent = dangerousMatch[1];
      console.log('[VFSPreview] Found inline dangerouslySetInnerHTML content');
    }
  }
  
  if (!bodyContent) {
    // Try multiple patterns to extract JSX return content
    // Pattern 1: Arrow function component with return
    let returnMatch = appContent.match(/=>\s*\{\s*return\s*\(\s*([\s\S]*?)\s*\)\s*;?\s*\}/s);
    
    // Pattern 2: Regular function with return
    if (!returnMatch || returnMatch[1].trim().length < 20) {
      returnMatch = appContent.match(/function\s+\w+[^{]*\{\s*return\s*\(\s*([\s\S]*?)\s*\)\s*;?\s*\}/s);
    }
    
    // Pattern 3: Arrow function with implicit return (no braces)
    if (!returnMatch || returnMatch[1].trim().length < 20) {
      returnMatch = appContent.match(/=>\s*\(\s*([\s\S]*?)\s*\)\s*;?\s*$/ms);
    }
    
    // Pattern 4: Generic return statement
    if (!returnMatch || returnMatch[1].trim().length < 20) {
      returnMatch = appContent.match(/return\s*\(\s*([\s\S]*?)\s*\)\s*;?\s*\}/s);
    }
    
    // Pattern 5: Look for the main JSX block with multiline content (more greedy)
    if (!returnMatch || returnMatch[1].trim().length < 20) {
      returnMatch = appContent.match(/return\s*\(([\s\S]+)\)\s*;?\s*\}/s);
    }
    
    console.log('[VFSPreview] Return match found:', !!returnMatch, 'content length:', returnMatch?.[1]?.length || 0);
    
    if (returnMatch && returnMatch[1]) {
      bodyContent = returnMatch[1]
        .replace(/className=/g, 'class=')
        .replace(/htmlFor=/g, 'for=')
        .replace(/\{'\/\*.*?\*\/\}/gs, '') // Remove JSX comments
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, '') // Remove multiline JSX comments
        .replace(/\{`([^`]*)`\}/g, '$1') // Convert template literals
        .replace(/\{"([^"]*?)"\}/g, '$1') // Convert string expressions
        .replace(/\{'([^']*?)'\}/g, '$1') // Convert single-quoted string expressions
        .replace(/<>([\s\S]*?)<\/>/g, '$1') // Remove React fragments
        .replace(/<React\.Fragment>([\s\S]*?)<\/React\.Fragment>/g, '$1') // Remove React.Fragment
        .replace(/onClick=\{[^}]*\}/g, '') // Remove onClick handlers
        .replace(/onChange=\{[^}]*\}/g, '') // Remove onChange handlers
        .replace(/onSubmit=\{[^}]*\}/g, '') // Remove onSubmit handlers
        .replace(/\{[a-zA-Z_][a-zA-Z0-9_]*\}/g, '') // Remove simple variable interpolations
        .replace(/\{[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z0-9_.]+\}/g, ''); // Remove property access
        
      console.log('[VFSPreview] Processed body content length:', bodyContent.length);
    }
  }
  
  // If we still don't have content, show a helpful preview placeholder
  if (!bodyContent || bodyContent.trim().length < 20) {
    const fileList = fileKeys.length > 0 
      ? fileKeys.map(f => `<div style="color: #38bdf8; font-size: 11px; padding: 2px 0;">${f}</div>`).join('')
      : '<div style="color: #f87171;">No files in VFS</div>';
    
    bodyContent = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white;">
        <div style="text-align: center; max-width: 600px; padding: 40px;">
          <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
          <h2 style="margin: 0 0 12px 0; font-size: 24px;">Static Preview Mode</h2>
          <p style="margin: 0 0 20px 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
            ${appContent ? 'Template content detected but requires React to render properly.' : 'No component files found in the VFS.'}
          </p>
          <div style="background: #1e293b; padding: 16px; border-radius: 8px; text-align: left; max-height: 200px; overflow-y: auto;">
            <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px;">Files in VFS (${fileKeys.length}):</p>
            ${fileList}
          </div>
        </div>
      </div>
    `;
  }
  
  // Inject scroll-reveal fallback when extracted content uses [data-reveal] or .animate-on-scroll
  // The reveal script lives in the React useEffect and is NOT in TEMPLATE_HTML, so we must add it.
  const needsRevealFallback = bodyContent.includes('data-reveal') || bodyContent.includes('animate-on-scroll');
  const revealFallback = needsRevealFallback ? `
<script>
(function(){
  var els = document.querySelectorAll('[data-reveal]');
  var scrollEls = document.querySelectorAll('.animate-on-scroll');
  if (!els.length && !scrollEls.length) return;
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) { if (e.isIntersecting) { e.target.classList.add('revealed','visible','animate-visible'); observer.unobserve(e.target); } });
    }, { threshold: 0.05 });
    els.forEach(function(el) { observer.observe(el); });
    scrollEls.forEach(function(el) { observer.observe(el); });
  }
  setTimeout(function() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    els.forEach(function(el) {
      if (!el.classList.contains('revealed')) {
        var r = el.getBoundingClientRect();
        if (r.top < vh + 100) el.classList.add('revealed');
      }
    });
    scrollEls.forEach(function(el) {
      if (!el.classList.contains('visible')) {
        var r = el.getBoundingClientRect();
        if (r.top < vh + 100) { el.classList.add('visible'); el.classList.add('animate-visible'); }
      }
    });
  }, 300);
  setTimeout(function() {
    document.querySelectorAll('[data-reveal]:not(.revealed)').forEach(function(el) { el.classList.add('revealed'); });
    document.querySelectorAll('.animate-on-scroll:not(.visible)').forEach(function(el) { el.classList.add('visible'); el.classList.add('animate-visible'); });
  }, 2000);
})();
</script>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VFS Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>${BASE_CSS}</style>
  ${templateStyles ? `<style>${templateStyles}</style>` : ''}
</head>
<body class="${templateBodyClasses || 'bg-white'}">
  ${bodyContent}
  ${revealFallback}
  ${PREVIEW_NAV_SCRIPT}
  ${INTERACTIVE_BEHAVIORS_SCRIPT}
</body>
</html>`;
}

// ============================================================================
// Main Component
// ============================================================================

export const VFSPreview = forwardRef<VFSPreviewHandle, VFSPreviewProps>(({
  nodes,
  files: propFiles,
  activeFile,
  className,
  showConsole = false,
  showToolbar = true,
  autoStart = true,
  forceBackend,
  onReady,
  onError,
  showBackendIndicator = true,
  onNavigate,
  onIntentTrigger,
  businessId,
  siteId,
  device = 'desktop',
  enableSelection = false,
  onElementSelect,
}, ref) => {
  // State - default to 'html' so preview works immediately
  const [backend, setBackend] = useState<PreviewBackend>('html');
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [htmlPreviewSrc, setHtmlPreviewSrc] = useState<string | null>(null);
  const startAttemptedRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeReady, setIframeReady] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const selectedElementRef = useRef<HTMLElement | null>(null);
  
  // Docker preview service
  const dockerService = usePreviewService();
  
  // Check if Docker gateway is explicitly configured (local dev only)
  const dockerGatewayConfigured = !!import.meta.env.VITE_PREVIEW_GATEWAY_URL;
  
  // Check if local Vite server is configured
  const localViteConfigured = !!LOCAL_PREVIEW_URL;
  
  // Convert nodes to files - ALWAYS recompute to ensure we have latest
  const files = useMemo(() => {
    const nodeFiles = nodesToFileMap(nodes);
    const result = { ...nodeFiles, ...propFiles }; // Merge both sources
    console.log('[VFSPreview] Files computed:', Object.keys(result), 'nodeFiles:', Object.keys(nodeFiles), 'propFiles:', Object.keys(propFiles || {}));
    return result;
  }, [nodes, propFiles]);
  
  // Determine if we have React/TS files that benefit from Sandpack bundling
  const hasReactFiles = useMemo(() => {
    return Object.keys(files).some(p => /\.(tsx?|jsx?)$/.test(p));
  }, [files]);
  
  // Prepare Sandpack files and dependencies (only computed when needed)
  const sandpackDeps = useMemo(() => {
    if (!hasReactFiles) return { react: '^18.3.1', 'react-dom': '^18.3.1' };
    const baseDeps: Record<string, string> = {
      react: '^18.3.1',
      'react-dom': '^18.3.1',
      'react-router-dom': '^6.20.0',
      'lucide-react': 'latest',
      'clsx': 'latest',
      'tailwind-merge': 'latest',
      'framer-motion': 'latest',
    };
    const { dependencies } = getDependenciesForSandpack(files, baseDeps);
    return dependencies;
  }, [files, hasReactFiles]);
  
  // Prepare Sandpack files: flatten /src/ paths, process imports, add shims
  const sandpackFiles = useMemo(() => {
    if (!hasReactFiles) return files;
    return prepareSandpackFiles(files);
  }, [files, hasReactFiles]);
  
  // Determine Sandpack entry file (from prepared/flattened files)
  const sandpackEntryFile = useMemo(() => {
    const candidates = ['/App.tsx', '/App.jsx'];
    for (const candidate of candidates) {
      if (sandpackFiles[candidate]) return candidate;
    }
    const firstCode = Object.keys(sandpackFiles).find(p => /\.(tsx?|jsx?)$/.test(p) && p !== '/hooks-shim.ts' && p !== '/main.tsx' && p !== '/index.tsx');
    return firstCode || '/App.tsx';
  }, [sandpackFiles]);
  
  // Handle messages from preview iframe
  useEffect(() => {
    const handlePreviewMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data?.type) return;
      
      // Handle navigation
      if (data.type === 'preview-nav' && data.intent === 'nav.goto') {
        console.log('[VFSPreview] Navigation:', data.path);
        onNavigate?.(data.path);
      }
      
      // Handle intent triggers
      if (data.type === 'INTENT_TRIGGER') {
        const { intent, payload } = data;
        console.log('[VFSPreview] Intent triggered:', intent, payload);
        
        // Enrich payload with context
        const enrichedPayload = {
          ...payload,
          businessId: businessId || payload.businessId,
          siteId: siteId || payload.siteId,
        };
        
        onIntentTrigger?.(intent, enrichedPayload);
        
        // Send acknowledgment back to iframe
        const iframe = iframeRef.current;
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'INTENT_RESULT',
            intent,
            result: { ok: true },
          }, '*');
        }
      }
    };
    
    window.addEventListener('message', handlePreviewMessage);
    return () => window.removeEventListener('message', handlePreviewMessage);
  }, [onNavigate, onIntentTrigger, businessId, siteId]);
  
  // Debug effect to log when files change
  useEffect(() => {
    console.log('[VFSPreview] ========== FILES UPDATED ==========');
    console.log('[VFSPreview] File count:', Object.keys(files).length);
    Object.entries(files).forEach(([path, content]) => {
      console.log(`[VFSPreview] File: ${path} (${content?.length || 0} chars)`);
    });
  }, [files]);
  
  // Generate HTML preview for fallback — intentionally excludes activeFile
  // so that clicking a VFS tab doesn't regenerate the preview.
  const htmlPreview = useMemo(() => {
    console.log('[VFSPreview] ========== GENERATING HTML ==========');
    console.log('[VFSPreview] Input files:', Object.keys(files));
    const html = generateStaticHtmlPreview(files);
    console.log('[VFSPreview] Generated HTML length:', html.length);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    return url;
  }, [files]);
  
  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (htmlPreviewSrc) URL.revokeObjectURL(htmlPreviewSrc);
    };
  }, [htmlPreviewSrc]);
  
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(htmlPreview);
    };
  }, [htmlPreview]);
  
  // Initialize backend — try Docker/CodeSandbox first, fall back to HTML
  useEffect(() => {
    if (startAttemptedRef.current) return;
    startAttemptedRef.current = true;

    // If forceBackend is specified, use it
    if (forceBackend === 'sandpack') {
      console.log('[VFSPreview] Force backend: sandpack');
      setBackend('sandpack');
      onReady?.();
      return;
    }

    // If local Vite dev server is configured, use it immediately
    if (localViteConfigured) {
      console.log('[VFSPreview] Using local Vite server:', LOCAL_PREVIEW_URL);
      setBackend('local');
      onReady?.();
      return;
    }

    // Auto-start Docker gateway if explicitly configured (local dev with VITE_PREVIEW_GATEWAY_URL)
    if (dockerGatewayConfigured && autoStart) {
      console.log('[VFSPreview] Auto-starting Docker preview...');
      setBackend('loading');
      dockerService.startSession(nodes).then((session) => {
        if (session) {
          console.log('[VFSPreview] Docker started:', session.id);
          setBackend('docker');
          onReady?.();
        } else {
          // Docker failed — fall back to Sandpack if we have React files, else HTML
          console.warn('[VFSPreview] Docker failed, falling back to', hasReactFiles ? 'Sandpack' : 'HTML');
          setBackend(hasReactFiles ? 'sandpack' : 'html');
          onReady?.();
        }
      }).catch((err) => {
        console.error('[VFSPreview] Docker start error:', err);
        setBackend(hasReactFiles ? 'sandpack' : 'html');
        onReady?.();
      });
      return;
    }

    // Production or no Docker gateway — use Sandpack for React/TS, HTML for static content
    if (hasReactFiles) {
      console.log('[VFSPreview] Using Sandpack in-browser bundler (production)');
      setBackend('sandpack');
      onReady?.();
      return;
    }

    // No preview service available — use static HTML
    console.log('[VFSPreview] No preview service configured, using HTML backend');
    setBackend('html');
    onReady?.();
  }, []);
  
  // Sync file changes to Docker when running
  useEffect(() => {
    if (backend !== 'docker' || !dockerService.session || dockerService.session.status !== 'running') return;
    
    for (const [path, content] of Object.entries(files)) {
      dockerService.patchFile(path, content);
    }
  }, [files, backend, dockerService.session]);
  
  // Handlers
  const handleStartDocker = useCallback(async () => {
    if (!dockerGatewayConfigured) {
      onError?.('Docker gateway not configured');
      return;
    }
    
    setBackend('loading');
    try {
      await dockerService.startSession(nodes);
      setBackend('docker');
      onReady?.();
    } catch (err) {
      console.error('[VFSPreview] Failed to start Docker:', err);
      setBackend('html');
      onError?.('Failed to start Docker preview');
    }
  }, [dockerGatewayConfigured, dockerService, nodes, onReady, onError]);
  
  const handleStopDocker = useCallback(async () => {
    await dockerService.stopSession();
    setBackend('html');
  }, [dockerService]);
  
  const handleRestart = useCallback(() => {
    if (backend === 'docker') {
      dockerService.patchFile('/src/App.tsx', files['/src/App.tsx'] || '');
    } else {
      // Regenerate HTML preview
      const html = generateStaticHtmlPreview(files);
      const blob = new Blob([html], { type: 'text/html' });
      if (htmlPreviewSrc) URL.revokeObjectURL(htmlPreviewSrc);
      setHtmlPreviewSrc(URL.createObjectURL(blob));
    }
  }, [backend, dockerService, files, htmlPreviewSrc]);
  
  const handleOpenInNewTab = useCallback(() => {
    if (backend === 'docker' && dockerService.session?.iframeUrl) {
      window.open(dockerService.session.iframeUrl, '_blank');
    } else if (backend === 'local' && LOCAL_PREVIEW_URL) {
      window.open(LOCAL_PREVIEW_URL, '_blank');
    } else {
      window.open(htmlPreview, '_blank');
    }
  }, [backend, dockerService.session, htmlPreview]);
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    refresh: handleRestart,
    startDocker: handleStartDocker,
    stopDocker: handleStopDocker,
    getBackend: () => backend,
    openInNewTab: handleOpenInNewTab,
  }), [handleRestart, handleStartDocker, handleStopDocker, backend, handleOpenInNewTab]);
  
  // Determine preview URL based on active backend
  const previewUrl = useMemo(() => {
    let url: string;
    if (backend === 'docker' && dockerService.session?.iframeUrl) {
      url = dockerService.session.iframeUrl;
    } else if (backend === 'local' && LOCAL_PREVIEW_URL) {
      url = LOCAL_PREVIEW_URL;
    } else {
      url = htmlPreview;
    }
    console.log('[VFSPreview] Preview URL:', url ? url.substring(0, 50) + '...' : 'NONE', 'backend:', backend);
    return url;
  }, [backend, dockerService.session, htmlPreview]);
  
  return (
    <div className={cn('flex flex-col h-full bg-background rounded-lg overflow-hidden border border-white/10', className)}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-white/10">
          <div className="flex items-center gap-2">
            {/* Backend Badge */}
            {showBackendIndicator && (
              <div className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
                backend === 'docker' && 'bg-green-500/20 text-green-400',
                backend === 'local' && 'bg-blue-500/20 text-blue-400',
                backend === 'sandpack' && 'bg-purple-500/20 text-purple-400',
                backend === 'html' && 'bg-amber-500/20 text-amber-400',
                backend === 'loading' && 'bg-blue-500/20 text-blue-400',
              )}>
                {backend === 'docker' && <><Server className="h-3 w-3" /> Docker HMR</>}
                {backend === 'local' && <><Server className="h-3 w-3" /> Local Vite</>}
                {backend === 'sandpack' && <><Zap className="h-3 w-3" /> Sandpack</>}
                {backend === 'html' && <><FileCode className="h-3 w-3" /> Static</>}
                {backend === 'loading' && <><Loader2 className="h-3 w-3 animate-spin" /> Starting...</>}
              </div>
            )}
            
            {/* Connection Status */}
            {backend === 'docker' && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {dockerService.connected ? (
                  <><Wifi className="h-3 w-3 text-green-500" /> Connected</>
                ) : (
                  <><WifiOff className="h-3 w-3 text-yellow-500" /> Connecting...</>
                )}
              </div>
            )}
            {backend === 'local' && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Wifi className="h-3 w-3 text-green-500" /> {LOCAL_PREVIEW_URL}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {/* Start/Stop Docker */}
            {dockerGatewayConfigured && (
              <>
                {backend === 'docker' ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleStopDocker}
                    className="h-7 px-2 gap-1 text-xs"
                    title="Stop Docker preview"
                  >
                    <Square className="h-3 w-3" />
                    Stop
                  </Button>
                ) : backend !== 'loading' && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleStartDocker}
                    className="h-7 px-2 gap-1 text-xs bg-green-600 hover:bg-green-700"
                    title="Start Docker preview with HMR"
                  >
                    <Play className="h-3 w-3" />
                    Start Docker
                  </Button>
                )}
              </>
            )}
            
            {/* Refresh */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRestart}
              disabled={backend === 'loading'}
              className="h-7 w-7 p-0"
              title="Refresh preview"
            >
              <RefreshCw className={cn('h-4 w-4', backend === 'loading' && 'animate-spin')} />
            </Button>
            
            {/* Logs Toggle (Docker only) */}
            {backend === 'docker' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowLogs(!showLogs)}
                className={cn('h-7 px-2 gap-1 text-xs', showLogs && 'bg-white/10')}
              >
                <Terminal className="h-3 w-3" />
                Logs
              </Button>
            )}
            
            {/* Open in new tab */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleOpenInNewTab}
              className="h-7 w-7 p-0"
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Error display */}
      {dockerService.error && (
        <div className="px-3 py-2 bg-destructive/10 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {dockerService.error}
        </div>
      )}
      
      {/* Preview Content */}
      <div className="flex-1 relative min-h-0">
        {/* Loading State */}
        {backend === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">Starting Docker preview...</p>
            </div>
          </div>
        )}
        
        {/* Preview Iframe - removed key={previewUrl} to prevent infinite remount on blob URL changes */}
        {(backend === 'docker' || backend === 'html' || backend === 'local') && previewUrl && (
          <div 
            className="w-full h-full flex justify-center overflow-hidden bg-slate-100"
            style={{
              padding: device !== 'desktop' ? '16px' : 0,
            }}
          >
            <iframe
              ref={iframeRef}
              src={previewUrl}
              className="h-full border-0 bg-white transition-all duration-300"
              style={{
                width: device === 'mobile' ? '375px' : device === 'tablet' ? '768px' : '100%',
                maxWidth: '100%',
                boxShadow: device !== 'desktop' ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
                borderRadius: device !== 'desktop' ? '12px' : '0',
              }}
              title="VFS Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          </div>
        )}
        
        {/* Sandpack In-Browser Preview */}
        {backend === 'sandpack' && (
          <SandpackProvider
            template="react-ts"
            files={sandpackFiles}
            theme="light"
            options={{
              externalResources: ['https://cdn.tailwindcss.com'],
              activeFile: sandpackEntryFile,
              visibleFiles: [sandpackEntryFile],
              autorun: true,
              autoReload: true,
              recompileMode: 'delayed',
              recompileDelay: 300,
            }}
            customSetup={{
              dependencies: sandpackDeps,
            }}
          >
            <SandpackLayout className="!flex-1 !min-h-0 !border-0 !rounded-none !bg-transparent" style={{ height: '100%' }}>
              <SandpackPreview
                showNavigator={false}
                showRefreshButton={false}
                showOpenInCodeSandbox={false}
                style={{ height: '100%', minHeight: 0 }}
              />
            </SandpackLayout>
          </SandpackProvider>
        )}
        
        {/* Logs Panel */}
        {showLogs && backend === 'docker' && (
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-black/95 text-green-400 font-mono text-xs overflow-hidden flex flex-col border-t border-white/10">
            <div className="flex items-center justify-between px-3 py-1.5 bg-white/5">
              <span className="text-white/70">Container Logs</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowLogs(false)}
                className="h-5 w-5 p-0"
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {logs.length === 0 ? (
                <span className="text-gray-500">No logs yet...</span>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="whitespace-pre-wrap">{log}</div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

VFSPreview.displayName = 'VFSPreview';

export default VFSPreview;
