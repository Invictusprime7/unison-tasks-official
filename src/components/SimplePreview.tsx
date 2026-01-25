/**
 * SimplePreview - Direct HTML Preview Component
 * 
 * A simple, reliable preview that renders HTML/JSX directly in an iframe.
 * No complex VFS, Docker, or file system - just takes code and renders it.
 */

import React, { useMemo, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { FileCode, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SimplePreviewProps {
  /** The code to preview - can be HTML, JSX, or React code */
  code: string;
  /** Additional CSS classes */
  className?: string;
  /** Show toolbar */
  showToolbar?: boolean;
  /** Device breakpoint for responsive preview */
  device?: 'desktop' | 'tablet' | 'mobile';
}

/**
 * Detect if code is vanilla HTML (not React/JSX)
 */
function isVanillaHtml(code: string): boolean {
  const trimmed = code.trim();
  
  // Complete HTML document
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    return true;
  }
  
  // Has <script> tags with vanilla JS (not JSX) - AI generates this format
  if (code.includes('<script>') || code.includes('<script ')) {
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
 * Convert any code (HTML, JSX, React) to a renderable HTML document
 */
function codeToHtml(code: string): string {
  if (!code || code.trim().length === 0) {
    return getEmptyStateHtml();
  }
  
  const trimmedCode = code.trim();
  
  // Case 1: Already a complete HTML document - inject intent listener before </body>
  if (trimmedCode.startsWith('<!DOCTYPE') || trimmedCode.startsWith('<html')) {
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
  const intentListenerScript = `
  <script>
  (function(){
    const LABEL_INTENTS = {
      // AUTH
      'sign in':'auth.signin','log in':'auth.signin','login':'auth.signin','member login':'auth.signin',
      'sign up':'auth.signup','register':'auth.signup','get started':'auth.signup','create account':'auth.signup',
      'join now':'auth.signup','sign up free':'auth.signup','start now':'auth.signup','join free':'auth.signup',
      // TRIALS & DEMOS
      'start free trial':'trial.start','free trial':'trial.start','try free':'trial.start','try it free':'trial.start',
      'watch demo':'demo.request','request demo':'demo.request','book demo':'demo.request','schedule demo':'demo.request',
      // NEWSLETTER & WAITLIST
      'subscribe':'newsletter.subscribe','get updates':'newsletter.subscribe','join newsletter':'newsletter.subscribe',
      'join waitlist':'join.waitlist','join the waitlist':'join.waitlist','get early access':'join.waitlist',
      // CONTACT
      'contact':'contact.submit','contact us':'contact.submit','get in touch':'contact.submit','send message':'contact.submit',
      'reach out':'contact.submit','talk to us':'contact.submit',"let's talk":'contact.submit',
      'contact sales':'sales.contact','talk to sales':'sales.contact',
      // E-COMMERCE
      'add to cart':'cart.add','add to bag':'cart.add','buy now':'checkout.start','purchase':'checkout.start',
      'shop now':'shop.browse','checkout':'checkout.start','view cart':'cart.view',
      // BOOKING
      'book now':'booking.create','reserve':'booking.create','reserve table':'booking.create','book appointment':'booking.create',
      'make reservation':'booking.create','schedule now':'booking.create','book a table':'booking.create',
      'book a call':'calendar.book','schedule call':'calendar.book','book consultation':'consultation.book',
      // QUOTES
      'get quote':'quote.request','get free quote':'quote.request','request quote':'quote.request','free estimate':'quote.request',
      // PORTFOLIO
      'hire me':'project.inquire','work with me':'project.inquire','start a project':'project.start',
      'view work':'portfolio.view','view portfolio':'portfolio.view',
      // RESTAURANT
      'order online':'order.online','order now':'order.online','view menu':'menu.view','call now':'call.now',
      'order pickup':'order.pickup','order delivery':'order.delivery'
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
      return (t||'').replace(/\s+/g,' ').trim();
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
      
      return null;
    }

    function executeNavIntent(intent, target){
      console.log('[Intent] Navigation:', intent, target);
      window.parent.postMessage({
        type: 'NAV_INTENT',
        intent: intent,
        target: target
      }, '*');
    }
    
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
  
  // Try to inject before </body>, or before </html>, or at the end
  if (html.includes('</body>')) {
    return html.replace('</body>', intentListenerScript + '\n</body>');
  } else if (html.includes('</html>')) {
    return html.replace('</html>', intentListenerScript + '\n</html>');
  } else {
    return html + intentListenerScript;
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
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
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
  </style>
</head>
<body>
  ${html}
  <script>
  (function(){
    const LABEL_INTENTS = {
      'sign in':'auth.signin','log in':'auth.signin','login':'auth.signin',
      'sign up':'auth.signup','register':'auth.signup','get started':'auth.signup',
      'start free trial':'trial.start','free trial':'trial.start','try free':'trial.start',
      'join waitlist':'join.waitlist','subscribe':'newsletter.subscribe',
      'contact us':'contact.submit','get in touch':'contact.submit','send message':'contact.submit',
      'add to cart':'cart.add','buy now':'checkout.start','shop now':'shop.browse',
      'book now':'booking.create','reserve':'booking.create','reserve table':'booking.create',
      'get quote':'quote.request','get free quote':'quote.request',
      'watch demo':'demo.request','hire me':'project.inquire',
      'order online':'order.online','view menu':'menu.view','call now':'call.now'
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
    function normalizeText(t){return (t||'').replace(/\s+/g,' ').trim();}
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
    document.addEventListener('click',function(e){
      const el=e.target.closest('button,a,[role="button"],[data-ut-intent],[data-intent]');if(!el)return;
      const ia=el.getAttribute('data-ut-intent')||el.getAttribute('data-intent');if(ia==='none'||ia==='ignore')return;
      if(el.hasAttribute('data-no-intent'))return;
      const intent=ia||(shouldInferIntentFromElement(el)?inferIntent(el.textContent||el.getAttribute('aria-label')):null);
      if(!intent){
        if(shouldOpenResearch(el)){
          e.preventDefault();e.stopPropagation();
          postResearch(el);
        }
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

export const SimplePreview: React.FC<SimplePreviewProps> = ({
  code,
  className,
  showToolbar = true,
  device = 'desktop',
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Convert code to HTML and create blob URL
  const previewUrl = useMemo(() => {
    console.log('[SimplePreview] ===== GENERATING PREVIEW =====');
    console.log('[SimplePreview] Input code length:', code?.length || 0);
    console.log('[SimplePreview] Input code preview:', code?.substring(0, 200) || 'EMPTY');
    
    const html = codeToHtml(code);
    console.log('[SimplePreview] Generated HTML length:', html.length);
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    console.log('[SimplePreview] Blob URL created:', url);
    
    return url;
  }, [code]);
  
  // Cleanup blob URL on unmount or when URL changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = previewUrl;
    }
  };
  
  const handleOpenInNewTab = () => {
    window.open(previewUrl, '_blank');
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
              className="h-7 w-7 p-0"
              title="Refresh preview"
            >
              <RefreshCw className="h-4 w-4" />
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
          key={previewUrl}
          src={previewUrl}
          className="w-full h-full border-0 bg-white"
          title="Code Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
        </div>
      </div>
    </div>
  );
};

export default SimplePreview;
