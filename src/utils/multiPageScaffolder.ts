/**
 * Multi-Page Scaffolder
 * 
 * Scans generated template HTML for all navigation targets (data-ut-path,
 * href, redirect-worthy CTAs) and creates matching page files in VFS.
 * 
 * This ensures every AI-generated template ships as a complete multi-page
 * project with all linked pages pre-initialized and navigation intents
 * pre-wired — no dead links, no on-demand generation needed.
 */

import { classifyLabel, type ElementContext } from '@/utils/redirectLabelClassifier';
import { suggestRedirectPages } from '@/utils/redirectPageGenerator';

// ============================================================================
// Types
// ============================================================================

export interface ScaffoldedPage {
  path: string;
  label: string;
  pageType: string;
  source: 'nav-link' | 'cta-redirect' | 'href' | 'data-ut-path';
}

export interface ScaffoldResult {
  /** Complete VFS file map including main page + all scaffolded pages */
  files: Record<string, string>;
  /** Pages that were scaffolded (created) */
  scaffoldedPages: ScaffoldedPage[];
  /** Total page count */
  pageCount: number;
}

// ============================================================================
// Core Scanner
// ============================================================================

/**
 * Extract all internal page targets from HTML content.
 * Scans for:
 * - data-ut-path attributes (explicit intent navigation)
 * - href attributes pointing to internal .html pages
 * - Redirect-worthy CTA labels (Shop Now, Learn More, etc.)
 */
export function extractPageTargets(html: string): ScaffoldedPage[] {
  const targets = new Map<string, ScaffoldedPage>();

  // 1. Scan data-ut-path attributes
  const utPathRe = /data-ut-path=["']\/?([\w-]+(?:\.html)?)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = utPathRe.exec(html)) !== null) {
    const raw = match[1];
    const pageName = raw.replace(/\.html$/, '');
    if (pageName === 'index' || pageName === '') continue;
    const path = `/${pageName}.html`;
    if (!targets.has(path)) {
      targets.set(path, {
        path,
        label: pageNameToLabel(pageName),
        pageType: inferPageType(pageName),
        source: 'data-ut-path',
      });
    }
  }

  // 2. Scan href attributes for internal pages
  const hrefRe = /href=["']\/?([\w-]+)\.html["']/gi;
  while ((match = hrefRe.exec(html)) !== null) {
    const pageName = match[1];
    if (pageName === 'index') continue;
    const path = `/${pageName}.html`;
    if (!targets.has(path)) {
      targets.set(path, {
        path,
        label: pageNameToLabel(pageName),
        pageType: inferPageType(pageName),
        source: 'href',
      });
    }
  }

  // 3. Scan CTA buttons/links for redirect-worthy labels
  // Match elements with text content that classify as 'redirect'
  const ctaRe = /<(?:a|button)[^>]*>([^<]{2,50})<\/(?:a|button)>/gi;
  while ((match = ctaRe.exec(html)) !== null) {
    const label = match[0];
    const text = match[1].trim();
    
    // Check if this element already has a data-ut-path (already captured)
    if (/data-ut-path/i.test(label)) continue;
    
    // Classify the label
    const isInNav = /\bnav\b|<header/i.test(html.slice(Math.max(0, match.index - 500), match.index));
    const context: ElementContext = { isInNav };
    const classification = classifyLabel(text, context);
    
    if (classification.category === 'redirect' && classification.suggestedPageType) {
      const pageName = classification.suggestedPageType;
      const path = `/${pageName}.html`;
      if (!targets.has(path)) {
        targets.set(path, {
          path,
          label: text,
          pageType: pageName,
          source: 'cta-redirect',
        });
      }
    }
  }

  // 4. Also use the existing suggestRedirectPages utility
  const suggested = suggestRedirectPages(html);
  for (const pageName of suggested) {
    const path = `/${pageName}.html`;
    if (!targets.has(path)) {
      targets.set(path, {
        path,
        label: pageNameToLabel(pageName),
        pageType: inferPageType(pageName),
        source: 'href',
      });
    }
  }

  return Array.from(targets.values());
}

// ============================================================================
// Page Generator
// ============================================================================

/**
 * Generate a scaffold page that matches the main page's design.
 * Extracts colors, fonts, and navigation from the main page to ensure
 * visual consistency across all generated pages.
 */
function generateScaffoldPage(
  page: ScaffoldedPage,
  mainPageHtml: string,
  allPages: ScaffoldedPage[]
): string {
  // Extract design tokens from main page
  const design = extractDesignFromMain(mainPageHtml);
  
  // Build navigation links for all pages
  const navLinks = [
    `<a href="/index.html" data-ut-intent="nav.goto" data-ut-path="/index.html" class="${design.navLinkClass}">Home</a>`,
    ...allPages.map(p => 
      `<a href="${p.path}" data-ut-intent="nav.goto" data-ut-path="${p.path}" class="${design.navLinkClass}${p.path === page.path ? ' font-semibold text-white' : ''}">${p.label}</a>`
    ),
  ].join('\n          ');

  // Generate page-type-specific content
  const content = generatePageContent(page, design);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${page.label}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  ${design.tailwindConfig}
  <style>
    ${design.customStyles}
    @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    .fade-in { animation: fadeIn 0.5s ease-out; }
  </style>
  ${design.googleFonts}
</head>
<body class="${design.bodyClass}">
  <!-- Navigation -->
  <header class="${design.headerClass}">
    <div class="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
      <a href="/index.html" data-ut-intent="nav.goto" data-ut-path="/index.html" class="text-xl font-bold ${design.logoClass}">${design.brandName}</a>
      <nav class="hidden md:flex items-center gap-6">
        ${navLinks}
      </nav>
    </div>
  </header>

  <!-- Page Content -->
  <main class="fade-in">
    ${content}
  </main>

  <!-- Footer -->
  <footer class="${design.footerClass}">
    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="flex flex-col md:flex-row justify-between items-center gap-6">
        <p class="text-sm opacity-70">&copy; ${new Date().getFullYear()} ${design.brandName}. All rights reserved.</p>
        <div class="flex items-center gap-4">
          <a href="/index.html" data-ut-intent="nav.goto" data-ut-path="/index.html" class="text-sm opacity-70 hover:opacity-100 transition-opacity">Home</a>
          ${allPages.slice(0, 4).map(p => 
            `<a href="${p.path}" data-ut-intent="nav.goto" data-ut-path="${p.path}" class="text-sm opacity-70 hover:opacity-100 transition-opacity">${p.label}</a>`
          ).join('\n          ')}
        </div>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

// ============================================================================
// Design Extraction
// ============================================================================

interface DesignTokens {
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  textColor: string;
  bodyClass: string;
  headerClass: string;
  footerClass: string;
  navLinkClass: string;
  logoClass: string;
  brandName: string;
  tailwindConfig: string;
  customStyles: string;
  googleFonts: string;
}

function extractDesignFromMain(html: string): DesignTokens {
  // Extract brand name from title or logo
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const brandName = titleMatch ? titleMatch[1].trim().split('|')[0].trim().split('-')[0].trim() : 'Brand';

  // Extract Tailwind config if present
  const twConfigMatch = html.match(/<script[^>]*>\s*tailwind\.config\s*=\s*(\{[\\s\\S]*?\})\s*<\/script>/i);
  const tailwindConfig = twConfigMatch 
    ? `<script>tailwind.config = ${twConfigMatch[1]}</script>` 
    : '';

  // Extract custom styles
  const styleMatches: string[] = [];
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m: RegExpExecArray | null;
  while ((m = styleRe.exec(html)) !== null) {
    // Skip Tailwind-specific styles, keep custom ones
    if (!m[1].includes('tailwind')) {
      styleMatches.push(m[1].trim());
    }
  }
  const customStyles = styleMatches.join('\n');


  // Extract Google Fonts
  const fontLinks: string[] = [];
  const fontRe = /<link[^>]*fonts\.googleapis\.com[^>]*>/gi;
  while ((m = fontRe.exec(html)) !== null) {
    fontLinks.push(m[0]);
  }
  const googleFonts = fontLinks.join('\n  ');

  // Extract body class
  const bodyClassMatch = html.match(/<body[^>]*class=["']([^"']+)["']/i);
  const bodyClass = bodyClassMatch ? bodyClassMatch[1] : 'bg-slate-950 text-white min-h-screen';

  // Extract header styling
  const headerMatch = html.match(/<header[^>]*class=["']([^"']+)["']/i);
  const headerClass = headerMatch ? headerMatch[1] : 'border-b border-white/10 backdrop-blur-sm bg-black/20 sticky top-0 z-50';

  // Extract footer styling  
  const footerMatch = html.match(/<footer[^>]*class=["']([^"']+)["']/i);
  const footerClass = footerMatch ? footerMatch[1] : 'border-t border-white/10 bg-black/30';

  // Detect colors from the page
  const primaryMatch = html.match(/(?:bg|text|border)-(?:blue|indigo|violet|purple|cyan|teal|emerald|green|amber|orange|rose|pink|red)-(?:400|500|600)/);
  const primaryColor = primaryMatch ? primaryMatch[0] : 'text-blue-500';
  
  return {
    primaryColor,
    secondaryColor: 'text-cyan-400',
    bgColor: bodyClass.includes('bg-') ? '' : 'bg-slate-950',
    textColor: bodyClass.includes('text-') ? '' : 'text-white',
    bodyClass,
    headerClass,
    footerClass,
    navLinkClass: 'text-sm text-white/70 hover:text-white transition-colors',
    logoClass: 'text-white',
    brandName,
    tailwindConfig,
    customStyles,
    googleFonts,
  };
}

// ============================================================================
// Page Content Generators (by type)
// ============================================================================

function generatePageContent(page: ScaffoldedPage, design: DesignTokens): string {
  switch (page.pageType) {
    case 'products':
      return generateProductsContent(page, design);
    case 'checkout':
      return generateCheckoutContent(page, design);
    case 'cart':
      return generateCartContent(page, design);
    case 'details':
      return generateDetailsContent(page, design);
    case 'article':
      return generateArticleContent(page, design);
    case 'gallery':
      return generateGalleryContent(page, design);
    case 'signup':
      return generateAuthContent(page, design, 'signup');
    case 'login':
      return generateAuthContent(page, design, 'login');
    case 'pricing':
      return generatePricingContent(page, design);
    case 'about':
      return generateAboutContent(page, design);
    default:
      return generateGenericContent(page, design);
  }
}

function generateProductsContent(page: ScaffoldedPage, design: DesignTokens): string {
  return `
    <section class="py-20 px-6">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">${page.label}</h1>
        <p class="text-lg opacity-70 mb-12 max-w-2xl">Browse our complete collection of products and services.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${[1,2,3,4,5,6].map(i => `
          <div class="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-white/20 transition-all hover:-translate-y-1">
            <div class="aspect-[4/3] bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center">
              <span class="text-4xl opacity-30">📦</span>
            </div>
            <div class="p-6">
              <h3 class="text-lg font-semibold mb-2">Product ${i}</h3>
              <p class="text-sm opacity-60 mb-4">A brief description of this amazing product.</p>
              <div class="flex items-center justify-between">
                <span class="text-xl font-bold">$${(19.99 * i).toFixed(2)}</span>
                <button class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors" data-ut-intent="cart.add">Add to Cart</button>
              </div>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </section>`;
}

function generateCheckoutContent(page: ScaffoldedPage, design: DesignTokens): string {
  return `
    <section class="py-20 px-6">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold mb-8">${page.label}</h1>
        <div class="space-y-8">
          <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 class="text-lg font-semibold mb-4">Order Summary</h2>
            <div class="space-y-3 mb-6">
              <div class="flex justify-between text-sm"><span class="opacity-70">Subtotal</span><span>$0.00</span></div>
              <div class="flex justify-between text-sm"><span class="opacity-70">Shipping</span><span>Free</span></div>
              <div class="border-t border-white/10 pt-3 flex justify-between font-semibold"><span>Total</span><span>$0.00</span></div>
            </div>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 class="text-lg font-semibold mb-4">Payment Details</h2>
            <div class="space-y-4">
              <input type="email" placeholder="Email address" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30" />
              <input type="text" placeholder="Card number" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30" />
              <div class="grid grid-cols-2 gap-4">
                <input type="text" placeholder="MM/YY" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30" />
                <input type="text" placeholder="CVC" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30" />
              </div>
              <button class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors" data-ut-intent="pay.checkout">Complete Purchase</button>
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

function generateCartContent(page: ScaffoldedPage, design: DesignTokens): string {
  return `
    <section class="py-20 px-6">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl font-bold mb-8">${page.label}</h1>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <span class="text-5xl mb-4 block">🛒</span>
          <p class="text-lg opacity-70 mb-6">Your cart is empty</p>
          <a href="/products.html" data-ut-intent="nav.goto" data-ut-path="/products.html" class="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors">Browse Products</a>
        </div>
      </div>
    </section>`;
}

function generateDetailsContent(page: ScaffoldedPage, design: DesignTokens): string {
  return `
    <section class="py-20 px-6">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">${page.label}</h1>
        <div class="prose prose-invert max-w-none">
          <p class="text-lg opacity-80 leading-relaxed mb-8">Discover more about what we offer and how we can help you achieve your goals.</p>
          <div class="grid md:grid-cols-2 gap-8 mb-12">
            <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 class="text-xl font-semibold mb-3">Our Approach</h3>
              <p class="opacity-70">We take a comprehensive, client-first approach to every project, ensuring results that exceed expectations.</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 class="text-xl font-semibold mb-3">Why Choose Us</h3>
              <p class="opacity-70">With years of experience and a proven track record, we deliver excellence in everything we do.</p>
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

function generateArticleContent(page: ScaffoldedPage, design: DesignTokens): string {
  return `
    <section class="py-20 px-6">
      <div class="max-w-3xl mx-auto">
        <div class="mb-8">
          <span class="text-sm opacity-50">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <h1 class="text-4xl font-bold mt-2 mb-4">${page.label}</h1>
          <p class="text-lg opacity-70">An in-depth look at the topics that matter most.</p>
        </div>
        <article class="prose prose-invert max-w-none space-y-6">
          <p class="text-lg opacity-80 leading-relaxed">Content for this article will be displayed here. This page is pre-wired and ready for your content.</p>
          <blockquote class="border-l-4 border-blue-500 pl-6 italic opacity-80">"The best way to predict the future is to create it."</blockquote>
          <p class="opacity-80 leading-relaxed">Continue reading to discover insights and strategies that can transform your approach.</p>
        </article>
      </div>
    </section>`;
}

function generateGalleryContent(page: ScaffoldedPage, design: DesignTokens): string {
  return `
    <section class="py-20 px-6">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-4xl font-bold mb-4">${page.label}</h1>
        <p class="text-lg opacity-70 mb-12">Explore our portfolio of work and success stories.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${[1,2,3,4,5,6].map(i => `
          <div class="group relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-white/20 transition-all">
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-5xl opacity-20">🖼️</span>
            </div>
            <div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
              <h3 class="font-semibold">Project ${i}</h3>
              <p class="text-sm opacity-70">Category • ${2024 - i}</p>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </section>`;
}

function generateAuthContent(page: ScaffoldedPage, design: DesignTokens, type: 'signup' | 'login'): string {
  const isSignup = type === 'signup';
  return `
    <section class="py-20 px-6 min-h-[80vh] flex items-center justify-center">
      <div class="w-full max-w-md">
        <div class="rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 class="text-2xl font-bold mb-2 text-center">${isSignup ? 'Create Account' : 'Welcome Back'}</h1>
          <p class="text-sm opacity-60 text-center mb-8">${isSignup ? 'Get started with your free account' : 'Sign in to your account'}</p>
          <div class="space-y-4">
            ${isSignup ? '<input type="text" placeholder="Full name" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30" />' : ''}
            <input type="email" placeholder="Email address" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30" />
            <input type="password" placeholder="Password" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30" />
            <button class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors" data-ut-intent="${isSignup ? 'auth.signup' : 'auth.login'}">${isSignup ? 'Create Account' : 'Sign In'}</button>
          </div>
          <p class="text-sm text-center mt-6 opacity-60">
            ${isSignup 
              ? 'Already have an account? <a href="/login.html" data-ut-intent="nav.goto" data-ut-path="/login.html" class="text-blue-400 hover:text-blue-300">Sign in</a>'
              : 'Don\'t have an account? <a href="/signup.html" data-ut-intent="nav.goto" data-ut-path="/signup.html" class="text-blue-400 hover:text-blue-300">Create one</a>'
            }
          </p>
        </div>
      </div>
    </section>`;
}

function generatePricingContent(page: ScaffoldedPage, design: DesignTokens): string {
  return `
    <section class="py-20 px-6">
      <div class="max-w-5xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">${page.label}</h1>
        <p class="text-lg opacity-70 mb-12 max-w-2xl mx-auto">Choose the plan that works best for you.</p>
        <div class="grid md:grid-cols-3 gap-8">
          ${[
            { name: 'Starter', price: '9', features: ['Basic features', 'Email support', '1 user'] },
            { name: 'Professional', price: '29', features: ['All features', 'Priority support', '5 users', 'Analytics'] },
            { name: 'Enterprise', price: '99', features: ['Unlimited everything', '24/7 support', 'Custom integrations', 'SLA'] },
          ].map((plan, i) => `
          <div class="rounded-2xl border ${i === 1 ? 'border-blue-500 bg-blue-500/10 scale-105' : 'border-white/10 bg-white/5'} p-8 text-left">
            <h3 class="text-lg font-semibold mb-2">${plan.name}</h3>
            <div class="mb-6"><span class="text-4xl font-bold">$${plan.price}</span><span class="text-sm opacity-50">/mo</span></div>
            <ul class="space-y-3 mb-8">
              ${plan.features.map(f => `<li class="flex items-center gap-2 text-sm"><span class="text-green-400">✓</span> ${f}</li>`).join('\n              ')}
            </ul>
            <button class="w-full py-3 ${i === 1 ? 'bg-blue-600 hover:bg-blue-500' : 'bg-white/10 hover:bg-white/20'} text-white font-semibold rounded-xl transition-colors" data-ut-intent="pay.checkout">${i === 1 ? 'Get Started' : 'Choose Plan'}</button>
          </div>`).join('')}
        </div>
      </div>
    </section>`;
}

function generateAboutContent(page: ScaffoldedPage, design: DesignTokens): string {
  return `
    <section class="py-20 px-6">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">${page.label}</h1>
        <p class="text-xl opacity-80 leading-relaxed mb-12">We're on a mission to make the world a better place through innovation and dedication.</p>
        <div class="grid md:grid-cols-3 gap-8 mb-16">
          ${[
            { icon: '🎯', title: 'Our Mission', desc: 'Delivering exceptional value through innovative solutions.' },
            { icon: '👁️', title: 'Our Vision', desc: 'A world where technology empowers everyone.' },
            { icon: '💎', title: 'Our Values', desc: 'Integrity, excellence, and continuous improvement.' },
          ].map(item => `
          <div class="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <span class="text-3xl mb-3 block">${item.icon}</span>
            <h3 class="text-lg font-semibold mb-2">${item.title}</h3>
            <p class="text-sm opacity-70">${item.desc}</p>
          </div>`).join('')}
        </div>
      </div>
    </section>`;
}

function generateGenericContent(page: ScaffoldedPage, design: DesignTokens): string {
  return `
    <section class="py-20 px-6">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">${page.label}</h1>
        <p class="text-lg opacity-70 leading-relaxed mb-8">Welcome to the ${page.label} page. This page is pre-wired with navigation intents and ready for your content.</p>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-8">
          <p class="opacity-60">Start customizing this page with your content, images, and design.</p>
        </div>
      </div>
    </section>`;
}

// ============================================================================
// Main Scaffold Function
// ============================================================================

/**
 * Scaffold a complete multi-page VFS from a main page HTML.
 * 
 * 1. Scans main page for all nav targets and redirect CTAs
 * 2. Generates matching page files with consistent design
 * 3. Returns complete VFS file map ready for import
 * 
 * @param mainPageHtml - The generated main/index page HTML
 * @param existingFiles - Already existing VFS files (won't be overwritten)
 * @returns ScaffoldResult with all files and metadata
 */
export function scaffoldMultiPageVFS(
  mainPageHtml: string,
  existingFiles?: Record<string, string>
): ScaffoldResult {
  const targets = extractPageTargets(mainPageHtml);
  
  // Filter out pages that already exist
  const newTargets = existingFiles 
    ? targets.filter(t => !existingFiles[t.path])
    : targets;

  // Build complete file map
  const files: Record<string, string> = {
    '/index.html': mainPageHtml,
    ...(existingFiles || {}),
  };

  // Generate scaffold pages
  for (const target of newTargets) {
    files[target.path] = generateScaffoldPage(target, mainPageHtml, targets);
  }

  console.log(`[MultiPageScaffolder] Scaffolded ${newTargets.length} pages from ${targets.length} detected targets:`, 
    newTargets.map(t => `${t.path} (${t.source})`));

  return {
    files,
    scaffoldedPages: newTargets,
    pageCount: Object.keys(files).filter(k => k.endsWith('.html')).length,
  };
}

// ============================================================================
// Helpers
// ============================================================================

function pageNameToLabel(name: string): string {
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function inferPageType(name: string): string {
  const n = name.toLowerCase();
  if (/product|shop|store|catalog|collection/.test(n)) return 'products';
  if (/checkout|pay/.test(n)) return 'checkout';
  if (/cart|basket/.test(n)) return 'cart';
  if (/about|team|story/.test(n)) return 'about';
  if (/pric|plan/.test(n)) return 'pricing';
  if (/galler|portfolio|work|project/.test(n)) return 'gallery';
  if (/blog|article|news|post/.test(n)) return 'article';
  if (/login|signin|sign-in/.test(n)) return 'login';
  if (/signup|register|sign-up|join/.test(n)) return 'signup';
  if (/contact|support|help/.test(n)) return 'details';
  if (/faq|question/.test(n)) return 'details';
  if (/service|feature/.test(n)) return 'details';
  if (/menu|food|drink/.test(n)) return 'products';
  return 'details';
}
