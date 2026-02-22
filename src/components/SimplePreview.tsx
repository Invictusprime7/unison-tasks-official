/**
 * SimplePreview - Direct HTML Preview Component
 * 
 * A simple, reliable preview that renders HTML/JSX directly in an iframe.
 * No complex VFS, Docker, or file system - just takes code and renders it.
 * 
 * Supports optional element selection mode for the web builder's Edit toggle.
 */

import React, { useMemo, useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { FileCode, RefreshCw, ExternalLink, AlertTriangle, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeployButton } from '@/components/DeployButton';
import { getSelectedElementData, highlightElement, removeHighlight } from '@/utils/htmlElementSelector';
import { toast } from 'sonner';
import { executeIntent, type IntentContext } from '@/runtime/intentExecutor';
import { supabase } from '@/integrations/supabase/client';
import { PreviewOverlayManager, type OverlayConfig, type OverlayType } from '@/components/preview/PreviewOverlayManager';
import { ENABLE_OVERLAYS } from '@/runtime/intentUx';

export interface SimplePreviewHandle {
  getIframe: () => HTMLIFrameElement | null;
  deleteElement: (selector: string) => boolean;
  duplicateElement: (selector: string) => boolean;
  updateElement: (selector: string, updates: any) => boolean;
  refresh: () => void;
  /** Sync multi-page manifest to iframe for instant navigation */
  syncPageManifest: (pages: Record<string, string>) => void;
}

export interface SimplePreviewProps {
  /** The code to preview - can be HTML, JSX, or React code */
  code: string;
  /** Additional CSS classes */
  className?: string;
  /** Show toolbar */
  showToolbar?: boolean;
  /** Device breakpoint for responsive preview */
  device?: 'desktop' | 'tablet' | 'mobile';
  /** Enable element selection (for Edit mode) */
  enableSelection?: boolean;
  /** Callback when an element is selected */
  onElementSelect?: (elementData: any) => void;
  /** Business ID for intent execution context */
  businessId?: string;
  /** Site/Project ID for intent execution context */
  siteId?: string;
  /** Callback when an intent is triggered (for external handling) */
  onIntentTrigger?: (intent: string, payload: Record<string, unknown>, result: unknown) => void;
  /** Multi-page manifest for async navigation (path -> html content) */
  pageManifest?: Record<string, string>;
  /** Enable deploy button in toolbar */
  showDeploy?: boolean;
  /** Default site name for deployments */
  deploySiteName?: string;
  /** Callback when deployment completes */
  onDeployComplete?: (url: string) => void;
}

/**
 * Detect if code is vanilla HTML (not React/JSX)
 */
function isVanillaHtml(code: string): boolean {
  const trimmed = code.trim();
  const trimmedLower = trimmed.toLowerCase();
  
  // Complete HTML document (case-insensitive because XMLSerializer may change casing)
  if (trimmedLower.startsWith('<!doctype') || trimmedLower.startsWith('<html')) {
    return true;
  }
  
  // Has <script> tags with vanilla JS (not JSX) - AI generates this format
  const lowerCode = code.toLowerCase();
  if (lowerCode.includes('<script>') || lowerCode.includes('<script ')) {
    // If it has script tags but NO React imports/JSX patterns, it's vanilla
    const hasReactImport = code.includes('import React') || code.includes("from 'react'") || code.includes('from "react"');
    const hasJsxSyntax = code.includes('className={') || code.includes('onClick={') || code.includes('useState(');
    if (!hasReactImport && !hasJsxSyntax) {
      return true;
    }
  }
  
  // Starts with HTML element and doesn't have React patterns
  if (trimmed.startsWith('<') && !trimmed.startsWith('<>')) {
    const hasReactPatterns = 
      code.includes('import React') ||
      code.includes('export default function') ||
      code.includes('export default const') ||
      code.includes('className={') ||
      (code.includes('useState') && code.includes('import'));
    
    if (!hasReactPatterns) {
      return true;
    }
  }
  
  return false;
}

/**
 * Escape special characters in CSS selectors (e.g., Tailwind brackets like `min-h-[85vh]`)
 */
function escapeCSSSelector(selector: string): string {
  return selector.replace(/(\.)([^.\s#>+~:[\]]+)/g, (match, dot, className) => {
    const escaped = className
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/:/g, '\\:')
      .replace(/\//g, '\\/');
    return dot + escaped;
  });
}

/**
 * Safely query a selector with escaping
 */
function safeQuerySelector(doc: Document, selector: string): Element | null {
  try {
    const escaped = escapeCSSSelector(selector);
    const el = doc.querySelector(escaped);
    if (el) return el;
    // Fallback to original selector
    if (escaped !== selector) {
      return doc.querySelector(selector);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Convert any code (HTML, JSX, React) to a renderable HTML document
 */
function codeToHtml(code: string): string {
  if (!code || code.trim().length === 0) {
    return getEmptyStateHtml();
  }
  
  const trimmedCode = code.trim();
  const trimmedLower = trimmedCode.toLowerCase();
  
  // Case 1: Already a complete HTML document - inject intent listener before </body>
  // Use case-insensitive check because XMLSerializer may change casing
  if (trimmedLower.startsWith('<!doctype') || trimmedLower.startsWith('<html')) {
    console.log('[SimplePreview] Code is complete HTML document - injecting intent listener');
    return injectIntentListener(code);
  }
  
  // Case 2: Vanilla HTML/JS (AI-generated format) - wrap without JSX conversion
  if (isVanillaHtml(code)) {
    console.log('[SimplePreview] Code is vanilla HTML/JS - wrapping directly');
    return wrapHtmlSnippet(code);
  }
  
  // Case 3: React/JSX code that needs conversion
  const isReactCode = 
    code.includes('import React') ||
    code.includes('export default') ||
    (code.includes('function ') && code.includes('return (') && code.includes('className=')) ||
    (code.includes('const ') && code.includes('=> (') && code.includes('className='));
  
  if (isReactCode) {
    console.log('[SimplePreview] Converting React/JSX to HTML');
    return jsxToHtml(code);
  }
  
  // Case 4: Plain HTML snippet - wrap it
  console.log('[SimplePreview] Wrapping HTML snippet');
  return wrapHtmlSnippet(code);
}

/**
 * Inject intent listener script into existing HTML document
 */
function injectIntentListener(html: string): string {
  // Enforce light color scheme to prevent browser dark mode inversion
  const colorSchemeEnforcement = `
  <meta name="color-scheme" content="light" />
  <style>
    :root { color-scheme: light; }
    html, body { background-color: inherit; }
  </style>`;
  
  // Failsafe: force-reveal any animate-on-scroll elements that stay invisible
  const animationFailsafe = `
  <style>
    /* Failsafe: auto-reveal animated sections after 1.5s even if IntersectionObserver fails */
    @keyframes forceReveal {
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .animate-on-scroll:not(.animate-visible) {
      animation: forceReveal 0.6s ease-out 1.5s forwards;
    }
    .animate-fadeIn, [class*="animate-fade"], [class*="animate-slide"] {
      animation-fill-mode: forwards;
    }
  </style>
  <script>
    // Force-reveal all hidden animated elements after DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() {
        document.querySelectorAll('.animate-on-scroll:not(.animate-visible)').forEach(function(el) {
          el.classList.add('animate-visible');
        });
        // Also catch elements with opacity:0 inline styles from animation delays
        document.querySelectorAll('[style*="opacity: 0"], [style*="opacity:0"]').forEach(function(el) {
          if (el.classList.contains('animate-on-scroll') || el.style.opacity === '0') {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }
        });
      }, 2000);
    });
  </script>`;

  // Error capture script - captures JS errors, unhandled rejections, and crashes
  const errorCaptureScript = `
  <script>
  (function(){
    var errors = [];
    var maxErrors = 50;
    
    function captureError(type, message, source, line, col, stack) {
      if (errors.length >= maxErrors) return;
      var err = {
        type: type,
        message: String(message || 'Unknown error'),
        source: source || '',
        line: line || 0,
        col: col || 0,
        stack: stack || '',
        timestamp: Date.now()
      };
      errors.push(err);
      console.log('[Preview iframe] Captured error:', message);
      try {
        window.parent.postMessage({ type: 'PREVIEW_ERROR', error: err }, '*');
      } catch(e) {}
    }
    
    window.onerror = function(msg, src, line, col, err) {
      captureError('error', msg, src, line, col, err ? err.stack : '');
      return false;
    };
    
    window.onunhandledrejection = function(e) {
      var reason = e.reason || {};
      captureError('unhandledrejection', reason.message || String(reason), '', 0, 0, reason.stack || '');
    };
    
    window.addEventListener('message', function(evt) {
      try {
        console.log('[Preview iframe] Received message:', evt.data?.type);
        if (evt.data && evt.data.type === 'GET_PREVIEW_ERRORS') {
          console.log('[Preview iframe] Responding with', errors.length, 'errors');
          window.parent.postMessage({ type: 'PREVIEW_ERRORS_RESPONSE', errors: errors, requestId: evt.data.requestId }, '*');
        }
        if (evt.data && evt.data.type === 'CLEAR_PREVIEW_ERRORS') {
          console.log('[Preview iframe] Clearing errors');
          errors = [];
        }
      } catch(e) { console.error('[Preview iframe] Message handler error:', e); }
    });
    
    // Capture initial load errors
    document.addEventListener('DOMContentLoaded', function() {
      console.log('[Preview iframe] Ready, error count:', errors.length);
      window.parent.postMessage({ type: 'PREVIEW_READY', errorCount: errors.length }, '*');
    });
  })();
  </script>`;

  const intentListenerScript = `
  <script>
  (function(){
    const LABEL_INTENTS = {
      // AUTH (CoreIntent: auth.login, auth.register)
      'sign in':'auth.login','log in':'auth.login','login':'auth.login','member login':'auth.login',
      'sign up':'auth.register','register':'auth.register','get started':'auth.register','create account':'auth.register',
      'join now':'auth.register','sign up free':'auth.register','start now':'auth.register','join free':'auth.register',
      'sign out':'auth.logout','log out':'auth.logout','logout':'auth.logout',
      // TRIALS & DEMOS (CoreIntent: lead.capture, booking.create)
      'start free trial':'lead.capture','free trial':'lead.capture','try free':'lead.capture','try it free':'lead.capture',
      'watch demo':'booking.create','request demo':'booking.create','book demo':'booking.create','schedule demo':'booking.create',
      'see demo':'booking.create','view demo':'booking.create',
      // NEWSLETTER & WAITLIST (CoreIntent: newsletter.subscribe)
      'subscribe':'newsletter.subscribe','get updates':'newsletter.subscribe','join newsletter':'newsletter.subscribe',
      'join waitlist':'newsletter.subscribe','join the waitlist':'newsletter.subscribe','get early access':'newsletter.subscribe',
      'sign me up':'newsletter.subscribe','notify me':'newsletter.subscribe','stay updated':'newsletter.subscribe',
      'keep me posted':'newsletter.subscribe','count me in':'newsletter.subscribe',
      // CONTACT (CoreIntent: contact.submit, lead.capture)
      'contact':'contact.submit','contact us':'contact.submit','get in touch':'contact.submit','send message':'contact.submit',
      'reach out':'contact.submit','talk to us':'contact.submit',"let's talk":'contact.submit',
      'contact sales':'lead.capture','talk to sales':'lead.capture',
      'send':'contact.submit','submit':'contact.submit','send inquiry':'contact.submit','enquire':'contact.submit',
      // E-COMMERCE (CoreIntent: cart.add, cart.checkout, pay.checkout)
      'add to cart':'cart.add','add to bag':'cart.add','buy now':'pay.checkout','purchase':'pay.checkout',
      'shop now':'lead.capture','checkout':'cart.checkout','view cart':'cart.checkout',
      'buy':'pay.checkout','order':'pay.checkout','proceed to checkout':'cart.checkout',
      // BOOKING (CoreIntent: booking.create)
      'book now':'booking.create','reserve':'booking.create','reserve table':'booking.create','book appointment':'booking.create',
      'make reservation':'booking.create','schedule now':'booking.create','book a table':'booking.create',
      'book a call':'booking.create','schedule call':'booking.create','book consultation':'booking.create',
      'book':'booking.create','schedule':'booking.create','reserve now':'booking.create',
      'book session':'booking.create','schedule appointment':'booking.create','make appointment':'booking.create',
      // QUOTES (CoreIntent: quote.request)
      'get quote':'quote.request','get free quote':'quote.request','request quote':'quote.request','free estimate':'quote.request',
      'get estimate':'quote.request','request estimate':'quote.request','get pricing':'quote.request',
      // PORTFOLIO / SERVICES (CoreIntent: lead.capture)
      'hire me':'lead.capture','work with me':'lead.capture','start a project':'lead.capture',
      'view work':'lead.capture','view portfolio':'lead.capture','see work':'lead.capture',
      'learn more':'lead.capture','read more':'lead.capture','explore':'lead.capture','discover':'lead.capture',
      // RESTAURANT (CoreIntent: order.created, lead.capture)
      'order online':'order.created','order now':'order.created','view menu':'lead.capture','call now':'lead.capture',
      'order pickup':'order.created','order delivery':'order.created',
      // GENERIC ACTIONS (CoreIntent: lead.capture)
      'download':'lead.capture','claim':'lead.capture','apply':'lead.capture','continue':'lead.capture',
      'next':'lead.capture','save':'lead.capture','confirm':'lead.capture','complete':'lead.capture'
    };
    
    function inferIntent(t){
      if(!t)return null;
      const l=t.toLowerCase().trim().replace(/[^a-z0-9\\s]/g,'');
      if(LABEL_INTENTS[l])return LABEL_INTENTS[l];
      for(const[k,v]of Object.entries(LABEL_INTENTS)){
        const ck=k.replace(/[^a-z0-9\\s]/g,'');
        if(l.includes(ck)||ck.includes(l))return v;
      }
      return null;
    }

    function shouldInferIntentFromElement(el){
      // Explicit wiring always wins; inference is only for true CTAs.
      if(el.getAttribute('data-ut-intent')||el.getAttribute('data-intent'))return false;
      if(el.hasAttribute('data-no-intent'))return false;
      if(el.hasAttribute('data-ut-cta'))return true;
      const tag=(el.tagName||'').toLowerCase();
      if(tag==='a')return true;
      if(tag==='button'){
        const type=(el.getAttribute('type')||'').toLowerCase();
        if(type==='submit')return true;
      }
      return false;
    }
    
     function collectPayload(el){
      const p={};
      Array.from(el.attributes).forEach(a=>{
         if(a.name.startsWith('data-')&&a.name!=='data-intent'&&a.name!=='data-ut-intent'){
          const k=a.name.replace('data-','').replace(/-([a-z])/g,(_,c)=>c.toUpperCase());
          try{p[k]=JSON.parse(a.value)}catch{p[k]=a.value}
        }
      });
      const f=el.closest('form');
      if(f)new FormData(f).forEach((v,k)=>{if(typeof v==='string')p[k]=v});
      return p;
    }

    function normalizeText(t){
      return (t||'').replace(/\\s+/g,' ').trim();
    }

    function shouldOpenResearch(el){
      // Context-intelligent research overlay:
      // - intercept real links with meaningful text
      // - avoid anchors/mailto/tel/javascript
      // - allow opt-out via data-intent=ignore/none
      try{
        const tag = (el.tagName||'').toLowerCase();
        const href = tag==='a' ? (el.getAttribute('href')||'') : '';
        const txt = normalizeText(el.textContent || el.getAttribute('aria-label') || '');
        if(!href) return false;
        if(!txt || txt.length < 12) return false;
        if(href.startsWith('#')) return false;
        if(href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return false;
        return true;
      }catch{return false;}
    }

    function postResearch(el){
      const href = el.getAttribute('href') || '';
      const query = normalizeText(el.textContent || el.getAttribute('aria-label') || href);
      const payload = {
        query,
        href,
        // extra context (helpful but optional)
        pageTitle: document.title,
        selection: query,
      };
      window.parent.postMessage({ type: 'RESEARCH_OPEN', payload }, '*');
    }

    // Navigation intent detection
    function detectNavIntent(el){
      const ia = el.getAttribute('data-ut-intent') || el.getAttribute('data-intent');
      
      // Explicit nav intent with payload attributes
      if(ia === 'nav.goto'){
        const path = el.getAttribute('data-ut-path') || el.getAttribute('href') || '/';
        return { intent: 'nav.goto', target: path };
      }
      if(ia === 'nav.external'){
        const url = el.getAttribute('data-ut-url') || el.getAttribute('href') || '';
        return { intent: 'nav.external', target: url };
      }
      if(ia === 'nav.anchor'){
        const anchor = el.getAttribute('data-ut-anchor') || el.getAttribute('href') || '';
        return { intent: 'nav.anchor', target: anchor };
      }
      
      // Infer from data attributes
      if(el.hasAttribute('data-ut-path')){
        return { intent: 'nav.goto', target: el.getAttribute('data-ut-path') };
      }
      if(el.hasAttribute('data-ut-url')){
        return { intent: 'nav.external', target: el.getAttribute('data-ut-url') };
      }
      if(el.hasAttribute('data-ut-anchor')){
        return { intent: 'nav.anchor', target: el.getAttribute('data-ut-anchor') };
      }
      
      // CATCH-ALL: Detect navigation from plain anchor tags with href
      const tag = (el.tagName || '').toLowerCase();
      if(tag === 'a'){
        const href = el.getAttribute('href') || '';
        if(!href) return null;
        
        // Skip non-navigation hrefs
        if(href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return null;
        
        // Anchor links (scroll within page)
        if(href.startsWith('#')){
          return { intent: 'nav.anchor', target: href };
        }
        
        // External links
        if(href.startsWith('http://') || href.startsWith('https://')){
          return { intent: 'nav.external', target: href };
        }
        
        // Internal page links (relative paths, absolute paths starting with /)
        // This is the catch-all that prevents 404 errors in Sandpack preview
        if(href.startsWith('/') || href.endsWith('.html') || !href.includes('://')){
          return { intent: 'nav.goto', target: href };
        }
      }
      
      return null;
    }

    // Store for dynamically generated pages
    // Page manifest cache for async multi-page navigation
    const dynamicPageCache = {};
    let isLoadingPage = false;
    let pendingNavigationQueue = [];
    let currentNavRequestId = null;
    
    // Safe page replacement using location.replace with blob URL
    function safeReplacePage(htmlContent, pageName) {
      try {
        // Notify parent about navigation (for editor sync)
        window.parent.postMessage({
          type: 'NAV_PAGE_SWITCH',
          pageName: pageName,
          pagePath: '/' + pageName + '.html'
        }, '*');
        
        // Create blob URL and navigate - this is safer than document.write
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.location.replace(url);
        
        // Clean up blob URL after navigation starts
        setTimeout(function() {
          URL.revokeObjectURL(url);
        }, 1000);
      } catch (err) {
        console.error('[Intent] Safe page replace failed, falling back:', err);
        // Fallback to document.write only if blob approach fails
        try {
          document.open();
          document.write(htmlContent);
          document.close();
        } catch (writeErr) {
          console.error('[Intent] Document write also failed:', writeErr);
          // Last resort: notify parent to reload preview
          window.parent.postMessage({
            type: 'NAV_PAGE_RELOAD_REQUIRED',
            pageName: pageName,
            pageContent: htmlContent
          }, '*');
        }
      }
    }
    
    // Process navigation queue
    function processNavigationQueue() {
      if (isLoadingPage || pendingNavigationQueue.length === 0) return;
      
      const nextNav = pendingNavigationQueue.shift();
      if (nextNav) {
        executeNavIntentInternal(nextNav.intent, nextNav.target);
      }
    }
    
    // Listen for page manifest sync from parent (async multi-page wiring)
    window.addEventListener('message', function(evt) {
      if (!evt.data || evt.data.type !== 'PAGE_MANIFEST_SYNC') return;
      const pages = evt.data.pages || {};
      console.log('[Intent] Page manifest received:', Object.keys(pages).length, 'pages');
      
      // Store all pages in cache for instant navigation
      Object.entries(pages).forEach(function(entry) {
        const path = entry[0];
        const content = entry[1];
        const pageName = path.replace(/^\\//, '').replace(/\\.html$/, '').replace(/\\/$/, '') || 'index';
        dynamicPageCache[pageName] = content;
        dynamicPageCache[path] = content; // Also store by full path
      });
    });

    function executeNavIntent(intent, target){
      // Queue navigation if another is in progress
      if (isLoadingPage) {
        console.log('[Intent] Navigation queued:', target);
        pendingNavigationQueue.push({ intent, target });
        return;
      }
      executeNavIntentInternal(intent, target);
    }
    
    function executeNavIntentInternal(intent, target){
      console.log('[Intent] Navigation:', intent, target);
      
      // Handle anchor links (scroll within page)
      if(intent === 'nav.anchor' || (target && target.startsWith('#'))){
        const anchor = target.replace('#', '');
        const targetEl = document.getElementById(anchor) || document.querySelector('[name="' + anchor + '"]');
        if(targetEl){
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }
      
      // Handle external links — treat as in-page navigation (generate page), never open new tabs
      if(intent === 'nav.external' || (target && (target.startsWith('http://') || target.startsWith('https://')))){
        // Route through nav.goto so the parent generates the page in-place
        window.parent.postMessage({
          type: 'INTENT_TRIGGER',
          intent: 'nav.goto',
          payload: { path: '/' + (target || 'external').replace(new RegExp('^https?://[^/]+/?'), '').replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '.html', buttonLabel: target, text: target, isExternal: true }
        }, '*');
        return;
      }
      
      // Handle internal page navigation - check cache first, then request generation
      if(intent === 'nav.goto' || target){
        // Extract page name from path (e.g., "/checkout.html" -> "checkout")
        const pagePath = target || '';
        const pageName = pagePath.replace(/^\\//, '').replace(/\\.html$/, '').replace(/\\/$/, '') || 'index';
        
        // Get nav label from clicked element
        const clickedEl = document.activeElement || document.querySelector('[data-ut-path="' + target + '"]');
        const navLabel = clickedEl ? (clickedEl.textContent || '').trim() : pageName;
        
        // CHECK CACHE FIRST - instant navigation if page already exists
        const cachedPage = dynamicPageCache[pageName] || dynamicPageCache[pagePath] || dynamicPageCache['/' + pageName + '.html'];
        if (cachedPage) {
          console.log('[Intent] Instant navigation from cache:', pageName);
          safeReplacePage(cachedPage, pageName);
          return;
        }
        
        // Show loading indicator (only if not cached)
        if(isLoadingPage) return;
        isLoadingPage = true;
        
        // Create loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'nav-loading-overlay';
        loadingOverlay.innerHTML = '<div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;"><div style="background:white;padding:24px 48px;border-radius:12px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,0.3);"><div style="width:40px;height:40px;border:3px solid #e5e7eb;border-top-color:#6366f1;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px;"></div><div style="font-weight:600;color:#111;">Generating ' + navLabel + ' page...</div><div style="font-size:12px;color:#666;margin-top:4px;">AI is creating your custom page</div></div></div><style>@keyframes spin{to{transform:rotate(360deg)}}</style>';
        document.body.appendChild(loadingOverlay);
        
        // Request dynamic page generation from parent
        const requestId = Date.now() + '-' + Math.random().toString(36).slice(2);
        currentNavRequestId = requestId;
        
        // Listen for page ready response
        const handlePageReady = function(evt){
          if(!evt.data) return;
          if(evt.data.type === 'NAV_PAGE_READY' && evt.data.requestId === requestId){
            window.removeEventListener('message', handlePageReady);
            isLoadingPage = false;
            currentNavRequestId = null;
            const overlay = document.getElementById('nav-loading-overlay');
            if(overlay) overlay.remove();
            
            // Replace current page content with new page using safe method
            if(evt.data.pageContent){
              // Cache the page for future navigation
              dynamicPageCache[pageName] = evt.data.pageContent;
              safeReplacePage(evt.data.pageContent, pageName);
            }
            
            // Process any queued navigation
            processNavigationQueue();
          }
          if(evt.data.type === 'NAV_PAGE_ERROR' && evt.data.requestId === requestId){
            window.removeEventListener('message', handlePageReady);
            isLoadingPage = false;
            currentNavRequestId = null;
            const overlay = document.getElementById('nav-loading-overlay');
            if(overlay) overlay.remove();
            console.error('[Intent] Page generation failed:', evt.data.error);
            
            // Show error message to user
            const errorDiv = document.createElement('div');
            errorDiv.id = 'nav-error-toast';
            errorDiv.innerHTML = '<div style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#ef4444;color:white;padding:12px 24px;border-radius:8px;font-size:14px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3);">Failed to generate page. Please try again.</div>';
            document.body.appendChild(errorDiv);
            setTimeout(function(){ var el = document.getElementById('nav-error-toast'); if(el) el.remove(); }, 4000);
            
            // Process any queued navigation
            processNavigationQueue();
          }
        };
        
        window.addEventListener('message', handlePageReady);
        
        // Send page generation request
        window.parent.postMessage({
          type: 'NAV_PAGE_GENERATE',
          requestId: requestId,
          pageName: pageName,
          navLabel: navLabel,
          pageContext: intent
        }, '*');
        
        // Timeout fallback with better cleanup
        setTimeout(function(){
          if(isLoadingPage && currentNavRequestId === requestId){
            window.removeEventListener('message', handlePageReady);
            isLoadingPage = false;
            currentNavRequestId = null;
            const overlay = document.getElementById('nav-loading-overlay');
            if(overlay) overlay.remove();
            console.error('[Intent] Page generation timed out');
            
            // Show timeout message
            const timeoutDiv = document.createElement('div');
            timeoutDiv.id = 'nav-timeout-toast';
            timeoutDiv.innerHTML = '<div style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#f59e0b;color:white;padding:12px 24px;border-radius:8px;font-size:14px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3);">Page generation timed out. Please try again.</div>';
            document.body.appendChild(timeoutDiv);
            setTimeout(function(){ var el = document.getElementById('nav-timeout-toast'); if(el) el.remove(); }, 4000);
            
            // Process any queued navigation
            processNavigationQueue();
          }
        }, 30000);
        
        return;
      }
      
      // Fallback: send to parent
      window.parent.postMessage({
        type: 'NAV_INTENT',
        intent: intent,
        target: target
      }, '*');
    }

    // -----------------------------------------------------------------------
    // Booking UX: if a booking form/section already exists on the page,
    // scroll to it inside the preview instead of notifying the parent app.
    // This prevents the WebBuilder from opening its pipeline overlay.
    // -----------------------------------------------------------------------

    function scrollToNode(node){
      try{
        if(!node) return;
        node.scrollIntoView({ behavior: 'auto', block: 'center' });
        setTimeout(function(){
          const input = node.querySelector && node.querySelector('input:not([type="hidden"]), textarea, select');
          if(input && input.focus) input.focus();
        }, 50);
      }catch{}
    }

    function findBookingTarget(){
      console.log('[Intent] Searching for booking form...');
      
      // Priority 1: Explicitly marked forms/sections
      const explicitSelectors = [
        'form[data-ut-intent="booking.create"]',
        'form[data-intent="booking.create"]',
        'form[data-booking]',
        '[data-booking-form]',
        '#booking-form',
        '#reservation-form',
        '#appointment-form',
        '.booking-form',
        '.reservation-form',
        '.appointment-form',
      ];

      for(const sel of explicitSelectors){
        try{
          const node = document.querySelector(sel);
          if(node){
            console.log('[Intent] Found explicit booking target:', sel);
            return node;
          }
        }catch{}
      }
      
      // Priority 2: Common booking section IDs/classes
      const sectionSelectors = [
        '#booking',
        '#book',
        '#schedule',
        '#appointment',
        '#reservation',
        '#contact-form',
        '#request-form',
        'section[id*="booking"]',
        'section[id*="book"]',
        'section[id*="reserv"]',
        'section[id*="appoint"]',
        'section[id*="schedule"]',
        '[id*="booking" i]',
        '[class*="booking" i]',
        '[id*="reservation" i]',
        '[class*="reservation" i]',
        '[id*="appointment" i]',
        '[class*="appointment" i]',
      ];

      for(const sel of sectionSelectors){
        try{
          const node = document.querySelector(sel);
          if(node && node.querySelector && node.querySelector('input,select,textarea')){
            console.log('[Intent] Found section booking target:', sel);
            return node;
          }
        }catch{}
      }

      // Priority 3: Heuristic - any form with booking-like fields
      try{
        const forms = Array.from(document.querySelectorAll('form'));
        console.log('[Intent] Checking', forms.length, 'forms for booking indicators');
        
        for(const f of forms){
          const hasDate = f.querySelector('input[type="date"], input[type="datetime-local"], [name*="date" i], [id*="date" i], select[id*="date" i]');
          const hasTime = f.querySelector('input[type="time"], [name*="time" i], [id*="time" i], select[id*="time" i]');
          const hasEmail = f.querySelector('input[type="email"], [name*="email" i], [id*="email" i]');
          const hasName = f.querySelector('input[name*="name" i], input[id*="name" i], input[placeholder*="name" i]');
          const hasPhone = f.querySelector('input[type="tel"], input[name*="phone" i], input[id*="phone" i]');
          const hasService = f.querySelector('[name*="service" i], [id*="service" i], select[id*="service" i]');
          
          // Booking if: (date AND time) OR (email AND date/time) OR (name AND phone AND any other field)
          if((hasDate && hasTime) || (hasEmail && (hasDate || hasTime)) || (hasName && hasPhone) || (hasService && (hasDate || hasTime || hasName))){
            console.log('[Intent] Found heuristic booking form');
            return f;
          }
        }
      }catch(e){console.error('[Intent] Form scan error:', e);}

      // Priority 4: Last resort - find ANY form with multiple inputs
      try{
        const forms = Array.from(document.querySelectorAll('form'));
        for(const f of forms){
          const inputs = f.querySelectorAll('input:not([type="hidden"]), select, textarea');
          if(inputs.length >= 2){
            console.log('[Intent] Using fallback - first form with inputs');
            return f;
          }
        }
      }catch{}

      console.log('[Intent] No booking form found');
      return null;
    }

    function tryHandleBookingScroll(sourceEl){
      try{
        // Only for CTAs outside forms; form submit should still run the intent.
        if(sourceEl && sourceEl.closest && sourceEl.closest('form')) return false;

        // If the CTA is an anchor pointing to an on-page hash, prefer that.
        const tag = (sourceEl.tagName || '').toLowerCase();
        if(tag === 'a'){
          const href = sourceEl.getAttribute('href') || '';
          if(href && href.startsWith('#') && href.length > 1){
            const hashTarget = document.querySelector(href);
            if(hashTarget){
              scrollToNode(hashTarget);
              return true;
            }
          }
        }

        const node = findBookingTarget();
        if(node){
          scrollToNode(node);
          return true;
        }
      }catch{}
      return false;
    }

    // Allow the parent (builder) to request an in-iframe booking scroll.
    function respondCommandResult(evt, command, requestId, handled){
      try{
        const msg = { type: 'INTENT_COMMAND_RESULT', command: command, requestId: requestId, handled: !!handled };
        if(evt && evt.source && evt.source.postMessage){
          evt.source.postMessage(msg, '*');
        } else {
          window.parent.postMessage(msg, '*');
        }
      }catch{}
    }

    window.addEventListener('message', function(evt){
      try{
        const d = evt && evt.data;
        if(!d || d.type !== 'INTENT_COMMAND') return;
        if(d.command === 'booking.scroll'){
          const handled = tryHandleBookingScroll(null);
          respondCommandResult(evt, 'booking.scroll', d.requestId, handled);
        }
      }catch{}
    });
    
     document.addEventListener('click',function(e){
       const el=e.target.closest('button,a,[role="button"],[data-ut-intent],[data-intent]');
      if(!el)return;
       const ia=el.getAttribute('data-ut-intent')||el.getAttribute('data-intent');
      if(ia==='none'||ia==='ignore')return;
      if(el.hasAttribute('data-no-intent'))return;
      
      // PRIORITY: Check for navigation intents first
      const navIntent = detectNavIntent(el);
      if(navIntent){
        e.preventDefault();e.stopPropagation();
        executeNavIntent(navIntent.intent, navIntent.target);
        return;
      }
      
      const intent=ia||(shouldInferIntentFromElement(el)?inferIntent(el.textContent||el.getAttribute('aria-label')):null);
      if(!intent){
        // If it's a meaningful link, open research overlay instead of navigating.
        if(shouldOpenResearch(el)){
          e.preventDefault();e.stopPropagation();
          postResearch(el);
        }
        return;
      }

       // Booking intent: scroll to the on-page booking form/section if present.
       // (This is the behavior you asked for: "If there is a form present on the page, redirect straight to the form".)
       if(intent === 'booking.create'){
         const handled = tryHandleBookingScroll(el);
         if(handled){
           e.preventDefault();e.stopPropagation();
           // quick success pulse for feedback
           el.classList.add('intent-success');
           setTimeout(()=>el.classList.remove('intent-success'),2000);
           return;
         }
       }

      // Handle nav intents inline (don't post to parent - it would scroll parent window)
      if(intent === 'nav.anchor'){
        e.preventDefault();e.stopPropagation();
        const anchor = (el.getAttribute('data-ut-anchor') || el.getAttribute('href') || '').replace('#', '');
        const targetEl = anchor ? (document.getElementById(anchor) || document.querySelector('[name="' + anchor + '"]')) : null;
        if(targetEl){
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        el.classList.add('intent-success');
        setTimeout(()=>el.classList.remove('intent-success'),2000);
        return;
      }
      
      if(intent === 'nav.external'){
        e.preventDefault();e.stopPropagation();
        var url = el.getAttribute('data-ut-url') || el.getAttribute('href') || '';
        // Instead of opening new tab, route as in-page navigation
        var pageName = url.replace(new RegExp('^https?://[^/]+/?'), '').replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'external';
        executeNavIntent('nav.goto', '/' + pageName);
        el.classList.add('intent-success');
        setTimeout(()=>el.classList.remove('intent-success'),2000);
        return;
      }
      
      if(intent === 'nav.goto'){
        e.preventDefault();e.stopPropagation();
        const path = el.getAttribute('data-ut-path') || el.getAttribute('href') || '/';
        executeNavIntent('nav.goto', path);
        return;
      }

      e.preventDefault();e.stopPropagation();
      el.classList.add('intent-loading');
      if(el.disabled!==undefined)el.disabled=true;
      console.log('[Intent] Triggering:',intent);
      window.parent.postMessage({type:'INTENT_TRIGGER',intent:intent,payload:collectPayload(el)},'*');
      setTimeout(()=>{
        el.classList.remove('intent-loading');
        el.classList.add('intent-success');
        if(el.disabled!==undefined)el.disabled=false;
        setTimeout(()=>el.classList.remove('intent-success'),2000);
      },300);
    },{capture:true});
    
     document.addEventListener('submit',function(e){
      const form=e.target;if(!form||form.tagName!=='FORM')return;
       let intent=form.getAttribute('data-ut-intent')||form.getAttribute('data-intent');
      if(!intent){
        const btn=form.querySelector('button[type="submit"],button:not([type])');
         if(btn)intent=btn.getAttribute('data-ut-intent')||btn.getAttribute('data-intent')||inferIntent(btn.textContent);
      }
      if(!intent){
        const id=(form.id||'').toLowerCase();
        if(id.includes('contact'))intent='contact.submit';
        else if(id.includes('newsletter')||id.includes('subscribe'))intent='newsletter.subscribe';
        else if(id.includes('waitlist'))intent='join.waitlist';
        else if(id.includes('booking')||id.includes('reservation'))intent='booking.create';
        else if(id.includes('quote'))intent='quote.request';
      }
      if(!intent)return;
      e.preventDefault();
      const p={};new FormData(form).forEach((v,k)=>{if(typeof v==='string')p[k]=v});
      console.log('[Intent] Form submit:',intent);
      window.parent.postMessage({type:'INTENT_TRIGGER',intent:intent,payload:p},'*');
      form.reset();
    },{capture:true});
    
    console.log('[Intent] Global listener active');
  })();
  </script>
  <style>
    .intent-loading{opacity:0.6;pointer-events:none;cursor:wait}
    .intent-success{animation:intent-pulse 0.3s}
    @keyframes intent-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}
  </style>`;
  
  // Inject color scheme enforcement early in head, animation failsafe before </head>,
  // and intent listener before </body>
  // Use case-insensitive matching because XMLSerializer may uppercase tags
  const lowerHtml = html.toLowerCase();
  
  if (lowerHtml.includes('<head>') || lowerHtml.includes('<head ')) {
    // Use regex for case-insensitive replacement
    html = html.replace(/<head(\s[^>]*)?>/i, '$&\n' + colorSchemeEnforcement + errorCaptureScript);
  }
  
  if (lowerHtml.includes('</head>')) {
    html = html.replace(/<\/head>/i, animationFailsafe + '\n</head>');
  }
  
  if (lowerHtml.includes('</body>')) {
    return html.replace(/<\/body>/i, intentListenerScript + '\n</body>');
  } else if (lowerHtml.includes('</html>')) {
    return html.replace(/<\/html>/i, intentListenerScript + '\n</html>');
  } else {
    return html + colorSchemeEnforcement + animationFailsafe + intentListenerScript;
  }
}

/**
 * Convert JSX/React code to static HTML
 */
function jsxToHtml(jsxCode: string): string {
  // Extract the return statement content
  let content = '';
  
  // Try to find the JSX in the return statement
  const returnMatch = jsxCode.match(/return\s*\(\s*([\s\S]*?)\s*\)\s*;?\s*\}(?:\s*;?\s*(?:export|$))?/);
  
  if (returnMatch && returnMatch[1]) {
    content = returnMatch[1];
  } else {
    // Try arrow function implicit return
    const arrowMatch = jsxCode.match(/=>\s*\(\s*([\s\S]*?)\s*\)\s*;?\s*$/m);
    if (arrowMatch && arrowMatch[1]) {
      content = arrowMatch[1];
    } else {
      // Just use whatever looks like JSX
      const jsxMatch = jsxCode.match(/<[a-zA-Z][^>]*>[\s\S]*<\/[a-zA-Z]+>/);
      if (jsxMatch) {
        content = jsxMatch[0];
      } else {
        content = jsxCode;
      }
    }
  }
  
  // Convert JSX to HTML
  const html = content
    // FIRST: Remove JSX comments {/* ... */} - must happen before other replacements
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    // Remove inline comments // ...
    .replace(/\/\/[^\n]*/g, '')
    // Convert JSX attributes to HTML
    .replace(/className=/g, 'class=')
    .replace(/htmlFor=/g, 'for=')
    // Remove React fragments
    .replace(/<>/g, '')
    .replace(/<\/>/g, '')
    .replace(/<React\.Fragment>/g, '')
    .replace(/<\/React\.Fragment>/g, '')
    // Remove event handlers
    .replace(/\s+onClick=\{[^}]*\}/g, '')
    .replace(/\s+onChange=\{[^}]*\}/g, '')
    .replace(/\s+onSubmit=\{[^}]*\}/g, '')
    .replace(/\s+onKeyDown=\{[^}]*\}/g, '')
    .replace(/\s+onKeyUp=\{[^}]*\}/g, '')
    .replace(/\s+onFocus=\{[^}]*\}/g, '')
    .replace(/\s+onBlur=\{[^}]*\}/g, '')
    .replace(/\s+onMouseEnter=\{[^}]*\}/g, '')
    .replace(/\s+onMouseLeave=\{[^}]*\}/g, '')
    .replace(/\s+on[A-Z][a-zA-Z]*=\{[^}]*\}/g, '')
    // Remove ref attributes
    .replace(/\s+ref=\{[^}]*\}/g, '')
    // Remove style objects like style={{ color: 'red' }}
    .replace(/\s+style=\{\{[^}]*\}\}/g, '')
    // Handle inline style with variables like style={{ animationDelay: '2s' }}
    .replace(/style="\{\{[^}]*\}\}"/g, '')
    // Remove simple variable interpolations like {title}
    .replace(/\{[a-zA-Z_][a-zA-Z0-9_]*\}/g, '')
    // Remove property access like {props.title}
    .replace(/\{[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z0-9_.]+\}/g, '')
    // Convert string expressions
    .replace(/\{"([^"]*?)"\}/g, '$1')
    .replace(/\{'([^']*?)'\}/g, '$1')
    // Convert template literals
    .replace(/\{`([^`]*)`\}/g, '$1')
    // Remove any remaining curly brace expressions with simple content
    .replace(/\{[^{}]*\}/g, '')
    // Convert self-closing custom components to divs (e.g., <ArrowRight /> -> <span></span>)
    .replace(/<([A-Z][a-zA-Z]*)\s*([^>]*)\s*\/>/g, '<span class="$2"></span>')
    // Convert custom component opening tags to spans
    .replace(/<([A-Z][a-zA-Z]*)\s*([^>]*)>/g, '<span class="icon-$1">')
    // Convert custom component closing tags to spans
    .replace(/<\/([A-Z][a-zA-Z]*)>/g, '</span>');
  
  return wrapHtmlSnippet(html);
}

/**
 * Wrap an HTML snippet in a complete document
 */
function wrapHtmlSnippet(html: string): string {
  // Error capture script - inject early to catch all errors
  const errorCaptureScriptInline = `
  <script>
  (function(){
    var errors = [];
    var maxErrors = 50;
    function captureError(type, msg, src, line, col, stack) {
      if (errors.length >= maxErrors) return;
      var err = { type: type, message: String(msg || 'Unknown'), source: src || '', line: line || 0, col: col || 0, stack: stack || '', timestamp: Date.now() };
      errors.push(err);
      console.log('[Preview iframe] Captured error:', msg);
      try { window.parent.postMessage({ type: 'PREVIEW_ERROR', error: err }, '*'); } catch(e) {}
    }
    window.onerror = function(m, s, l, c, e) { captureError('error', m, s, l, c, e ? e.stack : ''); return false; };
    window.onunhandledrejection = function(e) { var r = e.reason || {}; captureError('unhandledrejection', r.message || String(r), '', 0, 0, r.stack || ''); };
    window.addEventListener('message', function(evt) {
      try {
        console.log('[Preview iframe] Received message:', evt.data?.type);
        if (evt.data && evt.data.type === 'GET_PREVIEW_ERRORS') {
          console.log('[Preview iframe] Responding with', errors.length, 'errors');
          window.parent.postMessage({ type: 'PREVIEW_ERRORS_RESPONSE', errors: errors, requestId: evt.data.requestId }, '*');
        }
        if (evt.data && evt.data.type === 'CLEAR_PREVIEW_ERRORS') errors = [];
      } catch(e) { console.error('[Preview iframe] Message error:', e); }
    });
    document.addEventListener('DOMContentLoaded', function() {
      console.log('[Preview iframe] Ready, error count:', errors.length);
      window.parent.postMessage({ type: 'PREVIEW_READY', errorCount: errors.length }, '*');
    });
  })();
  </script>`;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>Preview</title>
  ${errorCaptureScriptInline}
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          animation: {
            'fade-in': 'fadeIn 0.5s ease-out',
            'bounce-slow': 'bounce 3s infinite',
            'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
          },
          keyframes: {
            fadeIn: {
              '0%': { opacity: '0', transform: 'translateY(10px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
            }
          }
        }
      }
    }
  </script>
  <style>
    :root {
      color-scheme: light;
      --background: 0 0% 100%;
      --foreground: 222.2 84% 4.9%;
      --primary: 221.2 83.2% 53.3%;
      --primary-foreground: 210 40% 98%;
      --secondary: 210 40% 96.1%;
      --muted: 210 40% 96.1%;
      --muted-foreground: 215.4 16.3% 46.9%;
      --border: 214.3 31.8% 91.4%;
      --radius: 0.75rem;
    }
    * { border-color: hsl(var(--border)); }
    body { 
      font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
      margin: 0;
      min-height: 100vh;
      background-color: white !important;
      color: #1a1a2e !important;
    }
    .icon-ArrowRight::before { content: '→'; }
    .icon-Play::before { content: '▶'; }
    .icon-Star::before { content: '★'; }
    .icon-ShieldCheck::before { content: '✓'; }
    .icon-Check::before { content: '✓'; }
    .icon-ChevronRight::before { content: '›'; }
    .icon-ChevronDown::before { content: '⌄'; }
    /* Intent feedback styles */
    .intent-loading { opacity: 0.7; pointer-events: none; }
    .intent-success { animation: intent-pulse 0.3s; }
    .intent-error { animation: intent-shake 0.3s; }
    @keyframes intent-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
    @keyframes intent-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
    /* Failsafe: auto-reveal animated sections */
    @keyframes forceReveal { to { opacity: 1; transform: translateY(0) scale(1); } }
    .animate-on-scroll:not(.animate-visible) { animation: forceReveal 0.6s ease-out 1.5s forwards; }
    .animate-fadeIn, [class*="animate-fade"], [class*="animate-slide"] { animation-fill-mode: forwards; }
  </style>
</head>
<body>
  ${html}
  <script>
  (function(){
    const LABEL_INTENTS = {
      'sign in':'auth.login','log in':'auth.login','login':'auth.login',
      'sign up':'auth.register','register':'auth.register','get started':'auth.register',
      'start free trial':'lead.capture','free trial':'lead.capture','try free':'lead.capture',
      'join waitlist':'newsletter.subscribe','subscribe':'newsletter.subscribe',
      'contact us':'contact.submit','get in touch':'contact.submit','send message':'contact.submit',
      'add to cart':'cart.add','buy now':'pay.checkout','shop now':'lead.capture',
      'book now':'booking.create','reserve':'booking.create','reserve table':'booking.create',
      'get quote':'quote.request','get free quote':'quote.request',
      'watch demo':'booking.create','hire me':'lead.capture',
      'order online':'order.created','view menu':'lead.capture','call now':'lead.capture'
    };
    function inferIntent(t){if(!t)return null;const l=t.toLowerCase().trim();if(LABEL_INTENTS[l])return LABEL_INTENTS[l];for(const[k,v]of Object.entries(LABEL_INTENTS))if(l.includes(k))return v;return null;}
    function shouldInferIntentFromElement(el){
      if(el.getAttribute('data-ut-intent')||el.getAttribute('data-intent'))return false;
      if(el.hasAttribute('data-no-intent'))return false;
      if(el.hasAttribute('data-ut-cta'))return true;
      const tag=(el.tagName||'').toLowerCase();
      if(tag==='a')return true;
      if(tag==='button'){
        const type=(el.getAttribute('type')||'').toLowerCase();
        if(type==='submit')return true;
      }
      return false;
    }
    function collectPayload(el){const p={};Array.from(el.attributes).forEach(a=>{if(a.name.startsWith('data-')&&a.name!=='data-intent'&&a.name!=='data-ut-intent'){const k=a.name.replace('data-','').replace(/-([a-z])/g,(_,c)=>c.toUpperCase());try{p[k]=JSON.parse(a.value)}catch{p[k]=a.value}}});const f=el.closest('form');if(f)new FormData(f).forEach((v,k)=>{if(typeof v==='string')p[k]=v});return p;}
    function normalizeText(t){return (t||'').replace(/\\s+/g,' ').trim();}
    function shouldOpenResearch(el){
      try{
        const tag=(el.tagName||'').toLowerCase();
        const href=tag==='a'?(el.getAttribute('href')||''):'';
        const txt=normalizeText(el.textContent||el.getAttribute('aria-label')||'');
        if(!href)return false;
        if(!txt||txt.length<12)return false;
        if(href.startsWith('#'))return false;
        if(href.startsWith('mailto:')||href.startsWith('tel:')||href.startsWith('javascript:'))return false;
        return true;
      }catch{return false;}
    }
    function postResearch(el){
      const href=el.getAttribute('href')||'';
      const query=normalizeText(el.textContent||el.getAttribute('aria-label')||href);
      window.parent.postMessage({type:'RESEARCH_OPEN',payload:{query,href,pageTitle:document.title,selection:query}},'*');
    }

    // Booking UX: if a booking form/section already exists on the page,
    // scroll to it inside the preview instead of notifying the parent.
    function scrollToNode(node){
      try{
        if(!node) return;
        node.scrollIntoView({ behavior: 'auto', block: 'center' });
        setTimeout(function(){
          const input = node.querySelector && node.querySelector('input:not([type="hidden"]), textarea, select');
          if(input && input.focus) input.focus();
        }, 50);
      }catch{}
    }

    function findBookingTarget(){
      const selectors=[
        'form[data-ut-intent="booking.create"]','form[data-intent="booking.create"]','form[data-booking]','[data-booking-form]',
        '#booking-form','#reservation-form','#appointment-form','.booking-form','.reservation-form','.appointment-form',
        '#booking','#book','#schedule','#appointment','#reservation',
        '[id*="booking" i]','[class*="booking" i]','[id*="reservation" i]','[class*="reservation" i]',
        '[id*="appointment" i]','[class*="appointment" i]','[id*="schedule" i]','[class*="schedule" i]',
      ];
      for(const sel of selectors){
        try{
          const node=document.querySelector(sel);
          if(node && node.querySelector && node.querySelector('input,select,textarea,button[type="submit"],button')) return node;
        }catch{}
      }
      try{
        const forms=Array.from(document.querySelectorAll('form'));
        for(const f of forms){
          const hasDate=f.querySelector('input[type="date"], [name*="date" i], [id*="date" i]');
          const hasTime=f.querySelector('input[type="time"], [name*="time" i], [id*="time" i]');
          const hasEmail=f.querySelector('input[type="email"], [name*="email" i], [id*="email" i]');
          const hasName=f.querySelector('[name*="name" i], [id*="name" i]');
          if((hasDate && hasTime) || (hasEmail && (hasDate || hasTime)) || (hasName && hasEmail)) return f;
        }
      }catch{}
      return null;
    }

    function tryHandleBookingScroll(sourceEl){
      try{
        if(sourceEl && sourceEl.closest && sourceEl.closest('form')) return false;
        const tag=(sourceEl && sourceEl.tagName ? sourceEl.tagName : '').toLowerCase();
        if(tag==='a'){
          const href=sourceEl.getAttribute('href')||'';
          if(href && href.startsWith('#') && href.length>1){
            const hashTarget=document.querySelector(href);
            if(hashTarget){scrollToNode(hashTarget);return true;}
          }
        }
        const node=findBookingTarget();
        if(node){scrollToNode(node);return true;}
      }catch{}
      return false;
    }

    function respondCommandResult(evt, command, requestId, handled){
      try{
        const msg={type:'INTENT_COMMAND_RESULT',command:command,requestId:requestId,handled:!!handled};
        if(evt && evt.source && evt.source.postMessage){
          evt.source.postMessage(msg,'*');
        } else {
          window.parent.postMessage(msg,'*');
        }
      }catch{}
    }

    window.addEventListener('message', function(evt){
      try{
        const d=evt && evt.data;
        if(!d || d.type!=='INTENT_COMMAND') return;
        if(d.command==='booking.scroll'){
          const handled=tryHandleBookingScroll(null);
          respondCommandResult(evt,'booking.scroll',d.requestId,handled);
        }
      }catch{}
    });
    document.addEventListener('click',function(e){
      const el=e.target.closest('button,a,[role="button"],[data-ut-intent],[data-intent]');if(!el)return;
      const ia=el.getAttribute('data-ut-intent')||el.getAttribute('data-intent');if(ia==='none'||ia==='ignore')return;
      if(el.hasAttribute('data-no-intent'))return;
      
      // PRIORITY: Handle anchor tag navigation to prevent 404 errors
      const tag=(el.tagName||'').toLowerCase();
      if(tag==='a'){
        const href=el.getAttribute('href')||'';
        // Skip non-navigation hrefs
        if(href && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:')){
          // Anchor links
          if(href.startsWith('#')){
            e.preventDefault();e.stopPropagation();
            const anchor=href.replace('#','');
            const targetEl=anchor?(document.getElementById(anchor)||document.querySelector('[name="'+anchor+'"]')):null;
            if(targetEl)targetEl.scrollIntoView({behavior:'smooth',block:'start'});
            return;
          }
          // External links - route through VFS instead of opening new tab
          if(href.startsWith('http://')||href.startsWith('https://')){
            e.preventDefault();e.stopPropagation();
            // Generate an in-place redirect page via parent
            var extPageName=href.replace(new RegExp('^https?://[^/]+/?'),'').replace(/[^a-zA-Z0-9]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')||'external';
            var extNavLabel=(el.textContent||'').trim()||href;
            window.parent.postMessage({type:'INTENT_TRIGGER',intent:'nav.external',payload:{url:href,path:'/'+extPageName+'.html',buttonLabel:extNavLabel,text:extNavLabel}},'*');
            el.classList.add('intent-success');setTimeout(function(){el.classList.remove('intent-success');},2000);
            return;
          }
          // Internal page links - intercept to prevent 404
          if(href.startsWith('/')||href.endsWith('.html')||!href.includes('://')){
            e.preventDefault();e.stopPropagation();
            const pagePath=href;
            const pageName=pagePath.replace(/^\\//, '').replace(/\\.html$/, '').replace(/\\/$/, '')||'index';
            const navLabel=(el.textContent||'').trim()||pageName;
            // Request dynamic page generation from parent
            const requestId=Date.now()+'-'+Math.random().toString(36).slice(2);
            // Show loading
            const loadingOverlay=document.createElement('div');
            loadingOverlay.id='nav-loading-overlay';
            loadingOverlay.innerHTML='<div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;"><div style="background:white;padding:24px 48px;border-radius:12px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,0.3);"><div style="width:40px;height:40px;border:3px solid #e5e7eb;border-top-color:#6366f1;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px;"></div><div style="font-weight:600;color:#111;">Generating '+navLabel+' page...</div></div></div><style>@keyframes spin{to{transform:rotate(360deg)}}</style>';
            document.body.appendChild(loadingOverlay);
            window.parent.postMessage({type:'NAV_PAGE_GENERATE',requestId:requestId,pageName:pageName,navLabel:navLabel},'*');
            window.addEventListener('message',function handler(evt){
              if(evt.data&&evt.data.type==='NAV_PAGE_READY'&&evt.data.requestId===requestId){
                window.removeEventListener('message',handler);
                const overlay=document.getElementById('nav-loading-overlay');if(overlay)overlay.remove();
                if(evt.data.pageContent){
                  try{
                    const blob=new Blob([evt.data.pageContent],{type:'text/html'});
                    const url=URL.createObjectURL(blob);
                    window.location.replace(url);
                    setTimeout(function(){URL.revokeObjectURL(url);},1000);
                  }catch(err){
                    console.error('[Intent] Navigation failed:',err);
                    try{document.open();document.write(evt.data.pageContent);document.close();}catch(e2){
                      window.parent.postMessage({type:'NAV_PAGE_RELOAD_REQUIRED',pageName:pageName,pageContent:evt.data.pageContent},'*');
                    }
                  }
                }
              }
              if(evt.data&&evt.data.type==='NAV_PAGE_ERROR'&&evt.data.requestId===requestId){
                window.removeEventListener('message',handler);
                const overlay=document.getElementById('nav-loading-overlay');if(overlay)overlay.remove();
                const errorDiv=document.createElement('div');
                errorDiv.id='nav-error-toast';
                errorDiv.innerHTML='<div style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#ef4444;color:white;padding:12px 24px;border-radius:8px;font-size:14px;z-index:9999;">Failed to generate page</div>';
                document.body.appendChild(errorDiv);
                setTimeout(function(){var el=document.getElementById('nav-error-toast');if(el)el.remove();},4000);
              }
            });
            return;
          }
        }
      }
      
      const intent=ia||(shouldInferIntentFromElement(el)?inferIntent(el.textContent||el.getAttribute('aria-label')):null);
      if(!intent){
        if(shouldOpenResearch(el)){
          e.preventDefault();e.stopPropagation();
          postResearch(el);
        }
        return;
      }

      if(intent==='booking.create'){
        const handled=tryHandleBookingScroll(el);
        if(handled){
          e.preventDefault();e.stopPropagation();
          el.classList.add('intent-success');
          setTimeout(()=>el.classList.remove('intent-success'),2000);
          return;
        }
      }

      // Handle nav intents inline (don't post to parent)
      if(intent==='nav.anchor'){
        e.preventDefault();e.stopPropagation();
        const anchor=(el.getAttribute('data-ut-anchor')||el.getAttribute('href')||'').replace('#','');
        const targetEl=anchor?(document.getElementById(anchor)||document.querySelector('[name="'+anchor+'"]')):null;
        if(targetEl)targetEl.scrollIntoView({behavior:'smooth',block:'start'});
        el.classList.add('intent-success');setTimeout(()=>el.classList.remove('intent-success'),2000);
        return;
      }
      if(intent==='nav.external'){
        e.preventDefault();e.stopPropagation();
        const url=el.getAttribute('data-ut-url')||el.getAttribute('href')||'';
        // Route through VFS - generate in-place redirect page instead of opening new tab
        if(url&&(url.startsWith('http://')||url.startsWith('https://'))){
          var pageName=url.replace(new RegExp('^https?://[^/]+/?'),'').replace(/[^a-zA-Z0-9]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')||'external';
          var navLabel=(el.textContent||'').trim()||url;
          window.parent.postMessage({type:'INTENT_TRIGGER',intent:'nav.external',payload:{url:url,path:'/'+pageName+'.html',buttonLabel:navLabel,text:navLabel}},'*');
        }
        el.classList.add('intent-success');setTimeout(()=>el.classList.remove('intent-success'),2000);
        return;
      }

      e.preventDefault();e.stopPropagation();
      el.classList.add('intent-loading');el.disabled=true;
      window.parent.postMessage({type:'INTENT_TRIGGER',intent:intent,payload:collectPayload(el)},'*');
      setTimeout(()=>{el.classList.remove('intent-loading');el.classList.add('intent-success');el.disabled=false;setTimeout(()=>el.classList.remove('intent-success'),2000);},500);
    },{capture:true});
    document.addEventListener('submit',function(e){
      const form=e.target;if(!form)return;
      let intent=form.getAttribute('data-ut-intent')||form.getAttribute('data-intent');
      if(!intent){const btn=form.querySelector('button[type="submit"]');if(btn)intent=btn.getAttribute('data-ut-intent')||btn.getAttribute('data-intent')||inferIntent(btn.textContent);}
      if(!intent){const id=(form.id||'').toLowerCase();if(id.includes('contact'))intent='contact.submit';else if(id.includes('newsletter'))intent='newsletter.subscribe';else if(id.includes('waitlist'))intent='join.waitlist';else if(id.includes('booking'))intent='booking.create';}
      if(!intent)return;
      e.preventDefault();const p={};new FormData(form).forEach((v,k)=>{if(typeof v==='string')p[k]=v});
      window.parent.postMessage({type:'INTENT_TRIGGER',intent:intent,payload:p},'*');
      form.reset();
    },{capture:true});
    console.log('[Intent] Global listener active');
    // Force-reveal animated elements after 2s (failsafe for IntersectionObserver failures)
    setTimeout(function(){
      document.querySelectorAll('.animate-on-scroll:not(.animate-visible)').forEach(function(el){
        el.classList.add('animate-visible');
      });
      document.querySelectorAll('[style*="opacity: 0"], [style*="opacity:0"]').forEach(function(el){
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    }, 2000);
  })();
  </script>
</body>
</html>`;
}

/**
 * Get HTML for empty state
 */
function getEmptyStateHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen flex items-center justify-center">
  <div class="text-center text-white p-8">
    <div class="text-6xl mb-4">🎨</div>
    <h1 class="text-2xl font-bold mb-2">AI Web Builder</h1>
    <p class="text-slate-400">Use the AI Assistant to generate code</p>
    <p class="text-slate-500 text-sm mt-4">Your preview will appear here</p>
  </div>
</body>
</html>`;
}

export const SimplePreview = forwardRef<SimplePreviewHandle, SimplePreviewProps>(({
  code,
  className,
  showToolbar = true,
  device = 'desktop',
  enableSelection = false,
  onElementSelect,
  businessId,
  siteId,
  onIntentTrigger,
  showDeploy = false,
  deploySiteName,
  onDeployComplete,
}, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const selectedElementRef = useRef<HTMLElement | null>(null);
  
  // Track whether iframe is initialized (first load)
  const isInitializedRef = useRef(false);
  const prevCodeRef = useRef<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  
  // Error tracking state
  const [previewErrors, setPreviewErrors] = useState<Array<{
    type: string;
    message: string;
    source?: string;
    line?: number;
    col?: number;
    stack?: string;
    timestamp: number;
  }>>([]);
  const [hasErrors, setHasErrors] = useState(false);
  
  // Overlay state for auth, booking, checkout modals
  const [activeOverlay, setActiveOverlay] = useState<OverlayConfig | null>(null);
  
  // Map intents to overlay types
  const intentToOverlayMap: Record<string, OverlayType> = {
    'auth.login': 'auth-login',
    'auth.register': 'auth-register',
    'booking.create': 'booking',
    'contact.submit': 'contact',
    'lead.capture': 'contact',
    'quote.request': 'contact',
    'newsletter.subscribe': 'contact',
    'pay.checkout': 'checkout',
    'cart.checkout': 'checkout',
  };
  
  // Listen for errors from the iframe
  useEffect(() => {
    const handlePreviewMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'PREVIEW_ERROR') {
        const error = event.data.error;
        setPreviewErrors(prev => [...prev.slice(-49), error]);
        setHasErrors(true);
        console.warn('[SimplePreview] Captured error:', error.message);
      }
      if (event.data?.type === 'PREVIEW_ERRORS_RESPONSE') {
        const errors = event.data.errors || [];
        if (errors.length > 0) {
          setPreviewErrors(errors);
          setHasErrors(true);
        }
      }
      if (event.data?.type === 'PREVIEW_READY') {
        if (event.data.errorCount > 0) {
          setHasErrors(true);
        }
      }
      
      // Handle intent triggers from preview iframe
      if (event.data?.type === 'INTENT_TRIGGER') {
        const { intent, payload } = event.data;
        console.log('[SimplePreview] Intent triggered:', intent, payload);
        
        try {
          // Check if this intent should open an overlay first (only when overlays are enabled)
          const overlayType = intentToOverlayMap[intent];
          if (ENABLE_OVERLAYS && overlayType) {
            console.log('[SimplePreview] Opening overlay for intent:', intent, overlayType);
            setActiveOverlay({
              type: overlayType,
              payload: payload || {},
              businessId: businessId,
              siteId: siteId,
              onSuccess: (result) => {
                console.log('[SimplePreview] Overlay success:', result);
                // Send success back to iframe
                const iframe = iframeRef.current;
                if (iframe?.contentWindow) {
                  iframe.contentWindow.postMessage({
                    type: 'INTENT_RESULT',
                    intent,
                    result: { ok: true, data: result },
                  }, '*');
                }
                onIntentTrigger?.(intent, payload || {}, result);
              },
              onCancel: () => {
                console.log('[SimplePreview] Overlay cancelled');
              },
            });
            return;
          }
          
          // Build context with business info
          const context: IntentContext = {
            payload: payload || {},
            businessId: businessId || payload?.businessId as string,
            siteId: siteId || payload?.siteId as string,
          };
          
          // Execute the intent
          const result = await executeIntent(intent, context);
          console.log('[SimplePreview] Intent result:', result);
          
          // Handle UI directives
          if (result.toast) {
            if (result.toast.type === 'success') {
              toast.success(result.toast.message);
            } else if (result.toast.type === 'error') {
              toast.error(result.toast.message);
            } else {
              toast(result.toast.message);
            }
          }
          
          // Handle navigation redirect (e.g., Stripe checkout)
          if (result.ui?.navigate) {
            const url = result.ui.navigate;
            if (url.startsWith('http')) {
              window.location.href = url;
            }
          }
          
          // Handle overlay directives from intent result (only when overlays are enabled)
          if (ENABLE_OVERLAYS && result.ui?.openModal) {
            const modalType = result.ui.openModal as string;
            if (modalType.startsWith('auth-') || modalType === 'booking' || modalType === 'contact' || modalType === 'checkout' || modalType === 'upgrade') {
              setActiveOverlay({
                type: modalType as OverlayType,
                payload: payload || {},
                businessId: businessId,
                siteId: siteId,
              });
            }
          }
          
          // Send result back to iframe
          const iframe = iframeRef.current;
          if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage({
              type: 'INTENT_RESULT',
              intent,
              result,
            }, '*');
          }
          
          // Call external handler if provided
          onIntentTrigger?.(intent, payload || {}, result);
          
        } catch (error) {
          console.error('[SimplePreview] Intent execution failed:', error);
          toast.error('Action failed. Please try again.');
        }
      }
    };
    
    window.addEventListener('message', handlePreviewMessage);
    return () => window.removeEventListener('message', handlePreviewMessage);
  }, [businessId, siteId, onIntentTrigger]);
  
  // Expose imperative handle for delete/duplicate/update from parent
  useImperativeHandle(ref, () => ({
    getIframe: () => iframeRef.current,
    deleteElement: (selector: string) => {
      const doc = iframeRef.current?.contentDocument;
      if (!doc) return false;
      try {
        const el = safeQuerySelector(doc, selector);
        if (el) { el.remove(); selectedElementRef.current = null; return true; }
      } catch (e) { console.error('[SimplePreview] Delete failed:', e); }
      return false;
    },
    duplicateElement: (selector: string) => {
      const doc = iframeRef.current?.contentDocument;
      if (!doc) return false;
      try {
        const el = safeQuerySelector(doc, selector);
        if (el && el.parentNode) {
          const clone = el.cloneNode(true) as HTMLElement;
          if (clone.id) clone.id = `${clone.id}-copy-${Date.now()}`;
          el.parentNode.insertBefore(clone, el.nextSibling);
          return true;
        }
      } catch (e) { console.error('[SimplePreview] Duplicate failed:', e); }
      return false;
    },
    updateElement: (selector: string, updates: any) => {
      const doc = iframeRef.current?.contentDocument;
      if (!doc) return false;
      try {
        const el = safeQuerySelector(doc, selector) as HTMLElement | null;
        if (!el) return false;
        if (updates.textContent !== undefined) el.textContent = updates.textContent;
        if (updates.innerHTML !== undefined) el.innerHTML = updates.innerHTML;
        if (updates.styles) {
          Object.entries(updates.styles).forEach(([k, v]) => {
            (el.style as any)[k] = v;
          });
        }
        return true;
      } catch (e) { console.error('[SimplePreview] Update failed:', e); }
      return false;
    },
    refresh: () => {
      // Force a full reload by regenerating the blob URL
      if (!iframeRef.current) return;
      console.log('[SimplePreview] Manual refresh triggered');
      const html = codeToHtml(code);
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      iframeRef.current.src = url;
    },
    syncPageManifest: (pages: Record<string, string>) => {
      // Send page manifest to iframe for instant multi-page navigation
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) return;
      console.log('[SimplePreview] Syncing page manifest:', Object.keys(pages).length, 'pages');
      iframe.contentWindow.postMessage({
        type: 'PAGE_MANIFEST_SYNC',
        pages,
      }, '*');
    },
  }), [code]);

  // Convert code to HTML
  const currentHtml = useMemo(() => {
    console.log('[SimplePreview] ===== GENERATING HTML =====');
    console.log('[SimplePreview] Input code length:', code?.length || 0);
    console.log('[SimplePreview] Input code preview:', code?.substring(0, 200) || 'EMPTY');
    return codeToHtml(code);
  }, [code]);

  // Update iframe content - use srcdoc for silent updates without full reload flicker
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !currentHtml) return;

    const prevCode = prevCodeRef.current;
    prevCodeRef.current = code;

    // Initial load: create blob URL and navigate (more reliable for first load)
    if (!isInitializedRef.current) {
      console.log('[SimplePreview] Initial load - using blob URL');
      const blob = new Blob([currentHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      iframe.src = url;
      isInitializedRef.current = true;
      return;
    }

    // Subsequent updates: use srcdoc for smooth, silent updates
    // This avoids full navigation and Tailwind re-initialization issues
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      // Save scroll position before update
      const scrollTop = iframeDoc?.documentElement?.scrollTop || iframeDoc?.body?.scrollTop || 0;
      const scrollLeft = iframeDoc?.documentElement?.scrollLeft || iframeDoc?.body?.scrollLeft || 0;
      
      console.log('[SimplePreview] Incremental update - using srcdoc');
      // Use srcdoc - more reliable than document.write and doesn't cause color inversion
      iframe.srcdoc = currentHtml;
      
      // Restore scroll position after iframe loads
      const restoreScroll = () => {
        const newDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (newDoc?.documentElement) {
          newDoc.documentElement.scrollTop = scrollTop;
          newDoc.documentElement.scrollLeft = scrollLeft;
        }
      };
      
      // Wait for iframe to load new content
      iframe.addEventListener('load', restoreScroll, { once: true });
    } catch (e) {
      console.error('[SimplePreview] srcdoc update failed, falling back to blob URL:', e);
      // Fallback: use blob URL if cross-origin issues
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      const blob = new Blob([currentHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      iframe.src = url;
    }

    return () => {
      // On unmount, revoke current URL
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, [currentHtml, code]);

  // ---- Element selection for Edit mode ----
  const attachSelectionListeners = useCallback(() => {
    if (!enableSelection || !iframeRef.current) return;
    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc || !iframeDoc.head || !iframeDoc.body) return;

    // Inject selection-mode styles: suppress intent scripts, add cursor
    const style = iframeDoc.createElement('style');
    style.id = 'simple-preview-selection-styles';
    style.textContent = `
      * { cursor: default !important; }
      button, a, [role="button"] { cursor: pointer !important; }
    `;
    if (!iframeDoc.getElementById('simple-preview-selection-styles')) {
      iframeDoc.head.appendChild(style);
    }

    let currentHovered: HTMLElement | null = null;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target === iframeDoc.body || target === iframeDoc.documentElement) return;
      if (currentHovered && currentHovered !== target) {
        removeHighlight(currentHovered);
      }
      highlightElement(target, '#3b82f6');
      currentHovered = target;
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && currentHovered === target) {
        removeHighlight(target);
        currentHovered = null;
      }
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const target = e.target as HTMLElement;
      if (!target || target === iframeDoc.body || target === iframeDoc.documentElement) return;

      // Remove previous selection highlight
      if (selectedElementRef.current && selectedElementRef.current !== target) {
        removeHighlight(selectedElementRef.current);
      }

      const elementData = getSelectedElementData(target);
      console.log('[SimplePreview] Element selected:', elementData);
      onElementSelect?.(elementData);

      selectedElementRef.current = target;
      highlightElement(target, '#10b981');
    };

    iframeDoc.addEventListener('mouseover', handleMouseOver);
    iframeDoc.addEventListener('mouseout', handleMouseOut);
    // Use capture phase so our handler fires before the intent listener can
    iframeDoc.addEventListener('click', handleClick, true);

    return () => {
      iframeDoc.removeEventListener('mouseover', handleMouseOver);
      iframeDoc.removeEventListener('mouseout', handleMouseOut);
      iframeDoc.removeEventListener('click', handleClick, true);
    };
  }, [enableSelection, onElementSelect]);

  // Re-attach selection listeners whenever iframe reloads; clean up when disabled
  const selectionCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Always clean up previous listeners first
    if (selectionCleanupRef.current) {
      selectionCleanupRef.current();
      selectionCleanupRef.current = null;
    }

    // Also strip leftover selection styles & highlights from the iframe
    const iframe = iframeRef.current;
    if (iframe) {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          const oldStyle = iframeDoc.getElementById('simple-preview-selection-styles');
          if (oldStyle) oldStyle.remove();
          // Remove any residual outlines
          iframeDoc.querySelectorAll('*').forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style.outline) htmlEl.style.outline = '';
            if (htmlEl.style.outlineOffset) htmlEl.style.outlineOffset = '';
          });
        }
      } catch { /* cross-origin safety */ }
    }

    if (!enableSelection || !iframe) return;

    const onLoad = () => {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        selectionCleanupRef.current = attachSelectionListeners() || null;
      }, 100);
    };

    iframe.addEventListener('load', onLoad);
    // Also try immediately in case iframe is already loaded
    selectionCleanupRef.current = attachSelectionListeners() || null;

    return () => {
      iframe.removeEventListener('load', onLoad);
      if (selectionCleanupRef.current) {
        selectionCleanupRef.current();
        selectionCleanupRef.current = null;
      }
    };
  }, [enableSelection, currentHtml, attachSelectionListeners]);
  
  const handleRefresh = () => {
    console.log('[SimplePreview] Refresh clicked - running diagnostics');
    
    // Helper to do the actual refresh
    const performRefresh = () => {
      setPreviewErrors([]);
      setHasErrors(false);
      
      if (iframeRef.current && blobUrlRef.current) {
        iframeRef.current.contentWindow?.postMessage({ type: 'CLEAR_PREVIEW_ERRORS' }, '*');
        iframeRef.current.src = blobUrlRef.current;
      }
    };
    
    // Request errors from iframe before refreshing
    if (iframeRef.current?.contentWindow) {
      const requestId = `diag-${Date.now()}`;
      let responseReceived = false;
      
      console.log('[SimplePreview] Sending GET_PREVIEW_ERRORS to iframe, requestId:', requestId);
      
      const handleErrorResponse = (event: MessageEvent) => {
        console.log('[SimplePreview] Received message:', event.data?.type);
        
        if (event.data?.type === 'PREVIEW_ERRORS_RESPONSE' && event.data?.requestId === requestId) {
          responseReceived = true;
          window.removeEventListener('message', handleErrorResponse);
          const errors = event.data.errors || [];
          
          console.log('[SimplePreview] Got errors response, count:', errors.length);
          
          if (errors.length === 0) {
            toast.success('Preview Diagnostics', {
              description: '✓ No JavaScript errors detected',
              duration: 3000,
            });
          } else {
            // Group errors by type
            const errorsByType = errors.reduce((acc: Record<string, number>, err: any) => {
              acc[err.type] = (acc[err.type] || 0) + 1;
              return acc;
            }, {});
            
            const summary = Object.entries(errorsByType)
              .map(([type, count]) => `${count} ${type}${(count as number) > 1 ? 's' : ''}`)
              .join(', ');
            
            // Log detailed errors to console
            console.group('[SimplePreview] Diagnostics - Errors Found');
            errors.forEach((err: any, i: number) => {
              console.error(`Error ${i + 1}:`, {
                type: err.type,
                message: err.message,
                source: err.source,
                line: err.line,
                stack: err.stack,
              });
            });
            console.groupEnd();
            
            toast.error('Preview Diagnostics', {
              description: `Found ${errors.length} issue(s): ${summary}. Check console for details.`,
              duration: 5000,
            });
          }
          
          // Perform refresh after showing diagnostics
          performRefresh();
        }
      };
      
      window.addEventListener('message', handleErrorResponse);
      iframeRef.current.contentWindow.postMessage({ type: 'GET_PREVIEW_ERRORS', requestId }, '*');
      
      // Timeout fallback - refresh anyway if no response received
      setTimeout(() => {
        window.removeEventListener('message', handleErrorResponse);
        if (!responseReceived) {
          console.log('[SimplePreview] No response from iframe - refreshing anyway');
          toast('Preview Refreshed', {
            description: 'Preview reloaded',
            duration: 2000,
          });
          performRefresh();
        }
      }, 1000);
    } else {
      console.log('[SimplePreview] No iframe contentWindow available - refreshing directly');
      toast('Preview Refreshed', {
        description: 'Preview reloaded',
        duration: 2000,
      });
      performRefresh();
    }
  };
  
  // Separate function to do the actual refresh (for external use)
  const doRefresh = useCallback(() => {
    setPreviewErrors([]);
    setHasErrors(false);
    
    if (iframeRef.current && blobUrlRef.current) {
      iframeRef.current.contentWindow?.postMessage({ type: 'CLEAR_PREVIEW_ERRORS' }, '*');
      iframeRef.current.src = blobUrlRef.current;
    }
  }, []);
  
  const handleOpenInNewTab = () => {
    if (blobUrlRef.current) {
      window.open(blobUrlRef.current, '_blank');
    }
  };
  
  return (
    <div className={cn('flex flex-col h-full bg-background rounded-lg overflow-hidden border border-white/10', className)}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
              <FileCode className="h-3 w-3" />
              Live Preview
            </div>
            <span className="text-xs text-muted-foreground">
              {code?.length || 0} chars
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              className={cn(
                "h-7 w-7 p-0 relative",
                hasErrors && "text-amber-500 hover:text-amber-400"
              )}
              title={hasErrors ? "Run diagnostics & refresh (errors detected)" : "Run diagnostics & refresh preview"}
            >
              {hasErrors ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {hasErrors && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleOpenInNewTab}
              className="h-7 w-7 p-0"
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            {showDeploy && (
              <DeployButton
                files={{ 'index.html': currentHtml }}
                defaultSiteName={deploySiteName}
                onDeployComplete={onDeployComplete}
                variant="ghost"
                size="sm"
                showProviderSelect={true}
              />
            )}
          </div>
        </div>
      )}
      
      {/* Preview Iframe - Device Responsive Container */}
      <div className="flex-1 relative min-h-0 flex items-start justify-center bg-zinc-100">
        <div 
          className="h-full bg-white shadow-lg transition-all duration-300"
          style={{
            width: device === 'mobile' ? '375px' : device === 'tablet' ? '768px' : '100%',
            maxWidth: '100%',
          }}
        >
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0 bg-white"
          title="Code Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
        </div>
      </div>
      
      {/* Overlay Manager for Auth/Booking/Checkout modals */}
      <PreviewOverlayManager
        activeOverlay={activeOverlay}
        onClose={() => setActiveOverlay(null)}
        businessId={businessId}
        siteId={siteId}
      />
    </div>
  );
});

SimplePreview.displayName = 'SimplePreview';

export default SimplePreview;
