/**
 * Landing Page Templates
 * SaaS landing pages and product marketing templates
 */

import { LayoutTemplate } from '../types';
import { wrapInHtmlDoc } from '../utils';

export const landingTemplates: LayoutTemplate[] = [
  // LANDING PAGE - FULL VERSION (SaaS A)
  {
    id: "landing-saas-a",
    name: "SaaS Landing (Full)",
    category: "landing",
    description: "Complete SaaS page: Nav, Hero, Features, Testimonials, Pricing, CTA, Footer",
    tags: ["saas", "hero", "features", "pricing", "complete"],
    code: wrapInHtmlDoc(`
<!-- NAVIGATION -->
<nav class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-white/5">
  <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
    <a href="#" class="text-xl font-bold text-emerald-400">SaaSify</a>
    <div class="hidden md:flex items-center gap-8">
      <a href="#features" class="text-sm text-slate-300 hover:text-white transition">Features</a>
      <a href="#pricing" class="text-sm text-slate-300 hover:text-white transition">Pricing</a>
      <a href="#testimonials" class="text-sm text-slate-300 hover:text-white transition">Testimonials</a>
      <a href="#contact" class="text-sm text-slate-300 hover:text-white transition">Contact</a>
    </div>
    <div class="flex items-center gap-3">
      <button class="text-sm text-slate-300 hover:text-white">Log in</button>
      <button class="px-4 py-2 bg-emerald-500 text-sm font-medium rounded-lg hover:bg-emerald-600 transition">Get Started</button>
    </div>
  </div>
</nav>

<!-- HERO SECTION -->
<section class="pt-32 pb-20 px-6 relative overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-transparent to-cyan-600/10"></div>
  <div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
    <div>
      <span class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-400 mb-6">✨ New: AI-powered automation</span>
      <h1 class="text-5xl md:text-6xl font-bold leading-tight mb-6">Launch your SaaS in <span class="text-emerald-400">minutes</span></h1>
      <p class="text-xl text-slate-400 mb-8 leading-relaxed">The all-in-one platform to build, launch, and scale your software business. No coding required.</p>
      <div class="flex flex-col sm:flex-row gap-4 mb-8">
        <button class="px-8 py-4 bg-emerald-500 text-lg font-semibold rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/25">Start Free Trial</button>
        <button class="px-8 py-4 border border-white/20 text-lg font-semibold rounded-xl hover:bg-white/5 transition flex items-center gap-2">▶ Watch Demo</button>
      </div>
      <div class="flex items-center gap-6 text-sm text-slate-500">
        <span class="flex items-center gap-1">✓ No credit card</span>
        <span class="flex items-center gap-1">✓ 14-day trial</span>
        <span class="flex items-center gap-1">✓ Cancel anytime</span>
      </div>
    </div>
    <div class="relative">
      <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" alt="Dashboard" class="rounded-2xl shadow-2xl border border-white/10"/>
      <div class="absolute -bottom-6 -left-6 bg-slate-900 border border-white/10 rounded-xl p-4 shadow-xl">
        <div class="flex items-center gap-3"><div class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-xl">📈</div><div><p class="text-2xl font-bold">+247%</p><p class="text-xs text-slate-400">Revenue growth</p></div></div>
      </div>
    </div>
  </div>
</section>

<!-- LOGOS SECTION -->
<section class="py-12 px-6 border-y border-white/5">
  <div class="max-w-6xl mx-auto">
    <p class="text-center text-sm text-slate-500 mb-8">Trusted by 10,000+ companies worldwide</p>
    <div class="flex flex-wrap justify-center items-center gap-12 opacity-50">
      <span class="text-2xl font-bold">Google</span><span class="text-2xl font-bold">Microsoft</span><span class="text-2xl font-bold">Stripe</span><span class="text-2xl font-bold">Shopify</span><span class="text-2xl font-bold">Slack</span>
    </div>
  </div>
</section>

<!-- FEATURES SECTION -->
<section id="features" class="py-24 px-6">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-16">
      <span class="text-emerald-400 text-sm font-medium uppercase tracking-wider">Features</span>
      <h2 class="text-4xl md:text-5xl font-bold mt-4 mb-6">Everything you need to succeed</h2>
      <p class="text-xl text-slate-400 max-w-2xl mx-auto">Powerful tools designed to help you build, launch, and grow your SaaS business faster than ever.</p>
    </div>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div class="bg-slate-900/50 border border-white/5 rounded-2xl p-8 hover:border-emerald-500/30 transition group">
        <div class="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-emerald-500/20 transition">⚡</div>
        <h3 class="text-xl font-bold mb-3">Lightning Fast</h3>
        <p class="text-slate-400">Optimized performance with global CDN. Your pages load in milliseconds.</p>
      </div>
      <div class="bg-slate-900/50 border border-white/5 rounded-2xl p-8 hover:border-emerald-500/30 transition group">
        <div class="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-blue-500/20 transition">🔒</div>
        <h3 class="text-xl font-bold mb-3">Enterprise Security</h3>
        <p class="text-slate-400">SOC2 compliant with end-to-end encryption. Your data is always safe.</p>
      </div>
      <div class="bg-slate-900/50 border border-white/5 rounded-2xl p-8 hover:border-emerald-500/30 transition group">
        <div class="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-purple-500/20 transition">🤖</div>
        <h3 class="text-xl font-bold mb-3">AI Powered</h3>
        <p class="text-slate-400">Smart automation handles repetitive tasks so you can focus on growth.</p>
      </div>
      <div class="bg-slate-900/50 border border-white/5 rounded-2xl p-8 hover:border-emerald-500/30 transition group">
        <div class="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-amber-500/20 transition">📊</div>
        <h3 class="text-xl font-bold mb-3">Analytics Dashboard</h3>
        <p class="text-slate-400">Real-time insights and reports to track your business performance.</p>
      </div>
      <div class="bg-slate-900/50 border border-white/5 rounded-2xl p-8 hover:border-emerald-500/30 transition group">
        <div class="w-14 h-14 bg-rose-500/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-rose-500/20 transition">🔗</div>
        <h3 class="text-xl font-bold mb-3">Integrations</h3>
        <p class="text-slate-400">Connect with 100+ tools including Slack, Stripe, Zapier, and more.</p>
      </div>
      <div class="bg-slate-900/50 border border-white/5 rounded-2xl p-8 hover:border-emerald-500/30 transition group">
        <div class="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-cyan-500/20 transition">🌍</div>
        <h3 class="text-xl font-bold mb-3">Global Scale</h3>
        <p class="text-slate-400">Multi-region deployment with 99.99% uptime SLA guaranteed.</p>
      </div>
    </div>
  </div>
</section>

<!-- TESTIMONIALS -->
<section id="testimonials" class="py-24 px-6 bg-slate-900/30">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-16">
      <span class="text-emerald-400 text-sm font-medium uppercase tracking-wider">Testimonials</span>
      <h2 class="text-4xl font-bold mt-4">Loved by thousands</h2>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      <div class="bg-slate-900 border border-white/5 rounded-2xl p-8">
        <div class="flex gap-1 mb-4 text-amber-400">★★★★★</div>
        <p class="text-slate-300 mb-6">"This platform transformed our business. We went from idea to launch in just 2 weeks!"</p>
        <div class="flex items-center gap-3"><div class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full"></div><div><p class="font-semibold">Sarah Johnson</p><p class="text-sm text-slate-500">CEO, TechStart</p></div></div>
      </div>
      <div class="bg-slate-900 border border-white/5 rounded-2xl p-8">
        <div class="flex gap-1 mb-4 text-amber-400">★★★★★</div>
        <p class="text-slate-300 mb-6">"The AI features are incredible. It feels like having an extra team member."</p>
        <div class="flex items-center gap-3"><div class="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div><div><p class="font-semibold">Mike Chen</p><p class="text-sm text-slate-500">Founder, Startup.io</p></div></div>
      </div>
      <div class="bg-slate-900 border border-white/5 rounded-2xl p-8">
        <div class="flex gap-1 mb-4 text-amber-400">★★★★★</div>
        <p class="text-slate-300 mb-6">"Best investment we made. ROI was visible within the first month."</p>
        <div class="flex items-center gap-3"><div class="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full"></div><div><p class="font-semibold">Emily Davis</p><p class="text-sm text-slate-500">CTO, GrowthCo</p></div></div>
      </div>
    </div>
  </div>
</section>

<!-- PRICING -->
<section id="pricing" class="py-24 px-6">
  <div class="max-w-5xl mx-auto">
    <div class="text-center mb-16">
      <span class="text-emerald-400 text-sm font-medium uppercase tracking-wider">Pricing</span>
      <h2 class="text-4xl font-bold mt-4 mb-4">Simple, transparent pricing</h2>
      <p class="text-slate-400">No hidden fees. Cancel anytime.</p>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      <div class="bg-slate-900/50 border border-white/10 rounded-2xl p-8">
        <h3 class="text-lg font-semibold mb-2">Starter</h3>
        <div class="mb-6"><span class="text-4xl font-bold">$29</span><span class="text-slate-500">/month</span></div>
        <ul class="space-y-3 mb-8 text-sm text-slate-400">
          <li class="flex items-center gap-2">✓ Up to 1,000 users</li><li class="flex items-center gap-2">✓ Basic analytics</li><li class="flex items-center gap-2">✓ Email support</li><li class="flex items-center gap-2">✓ 5 team members</li>
        </ul>
        <button class="w-full py-3 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition">Get Started</button>
      </div>
      <div class="bg-gradient-to-b from-emerald-500/10 to-transparent border-2 border-emerald-500/50 rounded-2xl p-8 relative">
        <span class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-xs font-bold rounded-full">POPULAR</span>
        <h3 class="text-lg font-semibold mb-2">Pro</h3>
        <div class="mb-6"><span class="text-4xl font-bold">$79</span><span class="text-slate-500">/month</span></div>
        <ul class="space-y-3 mb-8 text-sm text-slate-400">
          <li class="flex items-center gap-2">✓ Unlimited users</li><li class="flex items-center gap-2">✓ Advanced analytics</li><li class="flex items-center gap-2">✓ Priority support</li><li class="flex items-center gap-2">✓ 25 team members</li><li class="flex items-center gap-2">✓ API access</li>
        </ul>
        <button class="w-full py-3 bg-emerald-500 rounded-xl font-semibold hover:bg-emerald-600 transition">Get Started</button>
      </div>
      <div class="bg-slate-900/50 border border-white/10 rounded-2xl p-8">
        <h3 class="text-lg font-semibold mb-2">Enterprise</h3>
        <div class="mb-6"><span class="text-4xl font-bold">Custom</span></div>
        <ul class="space-y-3 mb-8 text-sm text-slate-400">
          <li class="flex items-center gap-2">✓ Everything in Pro</li><li class="flex items-center gap-2">✓ Dedicated support</li><li class="flex items-center gap-2">✓ Custom integrations</li><li class="flex items-center gap-2">✓ SLA guarantee</li>
        </ul>
        <button class="w-full py-3 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition">Contact Sales</button>
      </div>
    </div>
  </div>
</section>

<!-- CTA SECTION -->
<section class="py-24 px-6">
  <div class="max-w-4xl mx-auto text-center bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-3xl p-12">
    <h2 class="text-4xl font-bold mb-4">Ready to get started?</h2>
    <p class="text-xl text-white/80 mb-8">Join 10,000+ companies already using our platform.</p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <button class="px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition">Start Free Trial</button>
      <button class="px-8 py-4 border-2 border-white/30 rounded-xl font-semibold hover:bg-white/10 transition">Talk to Sales</button>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="py-16 px-6 border-t border-white/5">
  <div class="max-w-6xl mx-auto">
    <div class="grid md:grid-cols-4 gap-12 mb-12">
      <div>
        <h4 class="text-xl font-bold text-emerald-400 mb-4">SaaSify</h4>
        <p class="text-sm text-slate-500">The all-in-one platform for modern SaaS businesses.</p>
      </div>
      <div>
        <h5 class="font-semibold mb-4">Product</h5>
        <ul class="space-y-2 text-sm text-slate-400"><li><a href="#" class="hover:text-white">Features</a></li><li><a href="#" class="hover:text-white">Pricing</a></li><li><a href="#" class="hover:text-white">Integrations</a></li><li><a href="#" class="hover:text-white">Changelog</a></li></ul>
      </div>
      <div>
        <h5 class="font-semibold mb-4">Company</h5>
        <ul class="space-y-2 text-sm text-slate-400"><li><a href="#" class="hover:text-white">About</a></li><li><a href="#" class="hover:text-white">Blog</a></li><li><a href="#" class="hover:text-white">Careers</a></li><li><a href="#" class="hover:text-white">Contact</a></li></ul>
      </div>
      <div>
        <h5 class="font-semibold mb-4">Legal</h5>
        <ul class="space-y-2 text-sm text-slate-400"><li><a href="#" class="hover:text-white">Privacy</a></li><li><a href="#" class="hover:text-white">Terms</a></li><li><a href="#" class="hover:text-white">Security</a></li></ul>
      </div>
    </div>
    <div class="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
      <p class="text-sm text-slate-500">© 2025 SaaSify. All rights reserved.</p>
      <div class="flex gap-4"><a href="#" class="text-slate-400 hover:text-white">Twitter</a><a href="#" class="text-slate-400 hover:text-white">LinkedIn</a><a href="#" class="text-slate-400 hover:text-white">GitHub</a></div>
    </div>
  </div>
</footer>
    `, "SaaS Landing Page"),
  },
  // LANDING PAGE - VERSION B
  {
    id: "landing-saas-b",
    name: "SaaS Landing (B)",
    category: "landing",
    description: "Centered hero with gradient, stats, features, and full sections.",
    tags: ["saas", "centered", "stats", "gradient", "full"],
    code: wrapInHtmlDoc(`
<!-- NAVIGATION -->
<header class="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
  <div class="max-w-7xl mx-auto flex justify-between items-center">
    <span class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">DevFlow</span>
    <nav class="hidden md:flex gap-8 text-sm font-medium text-slate-300">
      <a href="#features" class="hover:text-white transition">Features</a>
      <a href="#integrations" class="hover:text-white transition">Integrations</a>
      <a href="#pricing" class="hover:text-white transition">Pricing</a>
      <a href="#testimonials" class="hover:text-white transition">Testimonials</a>
    </nav>
    <div class="flex items-center gap-4">
      <a href="#" class="text-sm font-medium text-slate-300 hover:text-white">Sign In</a>
      <button class="px-5 py-2 bg-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">Start Free</button>
    </div>
  </div>
</header>

<!-- HERO -->
<section class="relative pt-32 pb-20 px-6 text-center overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-b from-blue-600/20 via-purple-600/10 to-transparent"></div>
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-3xl"></div>
  <div class="relative max-w-4xl mx-auto">
    <div class="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-400 mb-8">
      <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
      Now with AI-powered code review
    </div>
    <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-slate-400 bg-clip-text text-transparent leading-tight">Build faster,<br/>ship smarter</h1>
    <p class="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">The all-in-one platform for modern development teams to collaborate, build, and deploy with confidence.</p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
      <button class="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition shadow-lg shadow-blue-500/25">Get Started Free</button>
      <button class="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition flex items-center justify-center gap-2">▶ Watch Demo</button>
    </div>
    <div class="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
      <div class="p-4 bg-slate-900/50 rounded-xl border border-white/5"><p class="text-3xl font-bold text-blue-400">10K+</p><p class="text-sm text-slate-400">Active Users</p></div>
      <div class="p-4 bg-slate-900/50 rounded-xl border border-white/5"><p class="text-3xl font-bold text-cyan-400">99.9%</p><p class="text-sm text-slate-400">Uptime SLA</p></div>
      <div class="p-4 bg-slate-900/50 rounded-xl border border-white/5"><p class="text-3xl font-bold text-purple-400">50M+</p><p class="text-sm text-slate-400">API Calls/Day</p></div>
    </div>
  </div>
</section>

<!-- LOGOS -->
<section class="py-12 px-6 border-y border-white/5">
  <div class="max-w-6xl mx-auto text-center">
    <p class="text-sm text-slate-500 mb-8">Trusted by leading engineering teams worldwide</p>
    <div class="flex flex-wrap justify-center items-center gap-12 opacity-50">
      <span class="text-2xl font-bold">Stripe</span>
      <span class="text-2xl font-bold">Vercel</span>
      <span class="text-2xl font-bold">Linear</span>
      <span class="text-2xl font-bold">Notion</span>
      <span class="text-2xl font-bold">Figma</span>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section id="features" class="py-24 px-6">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-16">
      <span class="text-blue-400 text-sm font-semibold tracking-wider uppercase">Features</span>
      <h2 class="text-4xl md:text-5xl font-bold mt-4 mb-6">Everything you need to ship</h2>
      <p class="text-xl text-slate-400 max-w-2xl mx-auto">Powerful tools designed for modern development workflows</p>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      <div class="p-8 bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-2xl border border-white/5 hover:border-blue-500/30 transition group">
        <div class="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">⚡</div>
        <h3 class="text-xl font-bold mb-3">Lightning Fast CI/CD</h3>
        <p class="text-slate-400">Deploy in seconds with our optimized build pipeline. Zero-config for most frameworks.</p>
      </div>
      <div class="p-8 bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition group">
        <div class="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">🔒</div>
        <h3 class="text-xl font-bold mb-3">Enterprise Security</h3>
        <p class="text-slate-400">SOC 2 compliant with SSO, RBAC, and audit logs. Your code is always protected.</p>
      </div>
      <div class="p-8 bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-2xl border border-white/5 hover:border-purple-500/30 transition group">
        <div class="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">🤖</div>
        <h3 class="text-xl font-bold mb-3">AI Code Review</h3>
        <p class="text-slate-400">Automated code reviews powered by AI. Catch bugs before they reach production.</p>
      </div>
      <div class="p-8 bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-2xl border border-white/5 hover:border-green-500/30 transition group">
        <div class="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">📊</div>
        <h3 class="text-xl font-bold mb-3">Real-time Analytics</h3>
        <p class="text-slate-400">Monitor deployments, track errors, and analyze performance in real-time.</p>
      </div>
      <div class="p-8 bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-2xl border border-white/5 hover:border-orange-500/30 transition group">
        <div class="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">🌍</div>
        <h3 class="text-xl font-bold mb-3">Global Edge Network</h3>
        <p class="text-slate-400">Deploy to 200+ edge locations worldwide for blazing fast load times.</p>
      </div>
      <div class="p-8 bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-2xl border border-white/5 hover:border-pink-500/30 transition group">
        <div class="w-14 h-14 bg-pink-500/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">🔗</div>
        <h3 class="text-xl font-bold mb-3">Seamless Integrations</h3>
        <p class="text-slate-400">Connect with GitHub, GitLab, Slack, Jira, and 100+ other tools.</p>
      </div>
    </div>
  </div>
</section>

<!-- INTEGRATIONS -->
<section id="integrations" class="py-24 px-6 bg-slate-900/50">
  <div class="max-w-6xl mx-auto">
    <div class="grid lg:grid-cols-2 gap-16 items-center">
      <div>
        <span class="text-cyan-400 text-sm font-semibold tracking-wider uppercase">Integrations</span>
        <h2 class="text-4xl font-bold mt-4 mb-6">Works with your stack</h2>
        <p class="text-xl text-slate-400 mb-8">Connect DevFlow with the tools you already use. One-click integrations, zero configuration.</p>
        <ul class="space-y-4">
          <li class="flex items-center gap-3"><span class="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">✓</span><span>GitHub, GitLab, Bitbucket sync</span></li>
          <li class="flex items-center gap-3"><span class="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">✓</span><span>Slack & Discord notifications</span></li>
          <li class="flex items-center gap-3"><span class="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">✓</span><span>Jira & Linear issue tracking</span></li>
          <li class="flex items-center gap-3"><span class="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">✓</span><span>Datadog & PagerDuty alerts</span></li>
        </ul>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div class="aspect-square bg-slate-800 rounded-2xl flex items-center justify-center text-3xl hover:bg-slate-700 transition cursor-pointer">🐙</div>
        <div class="aspect-square bg-slate-800 rounded-2xl flex items-center justify-center text-3xl hover:bg-slate-700 transition cursor-pointer">🦊</div>
        <div class="aspect-square bg-slate-800 rounded-2xl flex items-center justify-center text-3xl hover:bg-slate-700 transition cursor-pointer">💬</div>
        <div class="aspect-square bg-slate-800 rounded-2xl flex items-center justify-center text-3xl hover:bg-slate-700 transition cursor-pointer">📋</div>
        <div class="aspect-square bg-slate-800 rounded-2xl flex items-center justify-center text-3xl hover:bg-slate-700 transition cursor-pointer">📊</div>
        <div class="aspect-square bg-slate-800 rounded-2xl flex items-center justify-center text-3xl hover:bg-slate-700 transition cursor-pointer">🚨</div>
      </div>
    </div>
  </div>
</section>

<!-- TESTIMONIALS -->
<section id="testimonials" class="py-24 px-6">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-16">
      <span class="text-purple-400 text-sm font-semibold tracking-wider uppercase">Testimonials</span>
      <h2 class="text-4xl font-bold mt-4">Loved by developers</h2>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      <div class="p-8 bg-slate-900 rounded-2xl border border-white/5">
        <div class="flex gap-1 text-yellow-400 mb-4">★★★★★</div>
        <p class="text-slate-300 mb-6">"DevFlow cut our deployment time by 80%. The AI code review caught bugs we would have missed."</p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-500 rounded-full"></div>
          <div><p class="font-semibold">Sarah Chen</p><p class="text-sm text-slate-500">CTO at TechStartup</p></div>
        </div>
      </div>
      <div class="p-8 bg-slate-900 rounded-2xl border border-white/5">
        <div class="flex gap-1 text-yellow-400 mb-4">★★★★★</div>
        <p class="text-slate-300 mb-6">"Finally, a CI/CD tool that just works. Our team onboarded in minutes, not days."</p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-green-500 rounded-full"></div>
          <div><p class="font-semibold">Marcus Johnson</p><p class="text-sm text-slate-500">Lead Engineer at Scale</p></div>
        </div>
      </div>
      <div class="p-8 bg-slate-900 rounded-2xl border border-white/5">
        <div class="flex gap-1 text-yellow-400 mb-4">★★★★★</div>
        <p class="text-slate-300 mb-6">"The edge network is incredible. Our app loads in under 100ms globally."</p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-purple-500 rounded-full"></div>
          <div><p class="font-semibold">Emma Williams</p><p class="text-sm text-slate-500">Founder at AppCo</p></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- PRICING -->
<section id="pricing" class="py-24 px-6 bg-slate-900/50">
  <div class="max-w-5xl mx-auto">
    <div class="text-center mb-16">
      <span class="text-green-400 text-sm font-semibold tracking-wider uppercase">Pricing</span>
      <h2 class="text-4xl font-bold mt-4 mb-6">Simple, transparent pricing</h2>
      <p class="text-xl text-slate-400">Start free, scale as you grow</p>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      <div class="p-8 bg-slate-800/50 rounded-2xl border border-white/5">
        <h3 class="text-xl font-bold mb-2">Starter</h3>
        <p class="text-slate-400 mb-6">For side projects</p>
        <p class="text-4xl font-bold mb-6">$0<span class="text-lg font-normal text-slate-500">/mo</span></p>
        <ul class="space-y-3 mb-8 text-sm">
          <li class="flex items-center gap-2"><span class="text-green-400">✓</span>3 projects</li>
          <li class="flex items-center gap-2"><span class="text-green-400">✓</span>100 builds/mo</li>
          <li class="flex items-center gap-2"><span class="text-green-400">✓</span>Community support</li>
        </ul>
        <button class="w-full py-3 border border-white/20 rounded-lg font-semibold hover:bg-white/5 transition">Get Started</button>
      </div>
      <div class="p-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl relative">
        <span class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full">POPULAR</span>
        <h3 class="text-xl font-bold mb-2">Pro</h3>
        <p class="text-blue-200 mb-6">For growing teams</p>
        <p class="text-4xl font-bold mb-6">$29<span class="text-lg font-normal text-blue-200">/mo</span></p>
        <ul class="space-y-3 mb-8 text-sm">
          <li class="flex items-center gap-2"><span class="text-green-300">✓</span>Unlimited projects</li>
          <li class="flex items-center gap-2"><span class="text-green-300">✓</span>1000 builds/mo</li>
          <li class="flex items-center gap-2"><span class="text-green-300">✓</span>AI code review</li>
          <li class="flex items-center gap-2"><span class="text-green-300">✓</span>Priority support</li>
        </ul>
        <button class="w-full py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-slate-100 transition">Start Free Trial</button>
      </div>
      <div class="p-8 bg-slate-800/50 rounded-2xl border border-white/5">
        <h3 class="text-xl font-bold mb-2">Enterprise</h3>
        <p class="text-slate-400 mb-6">For large orgs</p>
        <p class="text-4xl font-bold mb-6">Custom</p>
        <ul class="space-y-3 mb-8 text-sm">
          <li class="flex items-center gap-2"><span class="text-green-400">✓</span>Everything in Pro</li>
          <li class="flex items-center gap-2"><span class="text-green-400">✓</span>SSO & SAML</li>
          <li class="flex items-center gap-2"><span class="text-green-400">✓</span>SLA guarantee</li>
          <li class="flex items-center gap-2"><span class="text-green-400">✓</span>Dedicated support</li>
        </ul>
        <button class="w-full py-3 border border-white/20 rounded-lg font-semibold hover:bg-white/5 transition">Contact Sales</button>
      </div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="py-24 px-6">
  <div class="max-w-3xl mx-auto">
    <h2 class="text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>
    <div class="space-y-4">
      <details class="p-6 bg-slate-900 rounded-xl border border-white/5 group">
        <summary class="font-semibold cursor-pointer list-none flex justify-between items-center">How does the free tier work?<span class="text-slate-500 group-open:rotate-180 transition">▼</span></summary>
        <p class="mt-4 text-slate-400">The free tier includes 3 projects and 100 builds per month. No credit card required to start.</p>
      </details>
      <details class="p-6 bg-slate-900 rounded-xl border border-white/5 group">
        <summary class="font-semibold cursor-pointer list-none flex justify-between items-center">Can I switch plans anytime?<span class="text-slate-500 group-open:rotate-180 transition">▼</span></summary>
        <p class="mt-4 text-slate-400">Yes! You can upgrade, downgrade, or cancel at any time. Changes take effect immediately.</p>
      </details>
      <details class="p-6 bg-slate-900 rounded-xl border border-white/5 group">
        <summary class="font-semibold cursor-pointer list-none flex justify-between items-center">What frameworks are supported?<span class="text-slate-500 group-open:rotate-180 transition">▼</span></summary>
        <p class="mt-4 text-slate-400">We support all major frameworks: React, Next.js, Vue, Nuxt, Svelte, Astro, and more. Custom Dockerfiles also supported.</p>
      </details>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="py-24 px-6">
  <div class="max-w-4xl mx-auto text-center p-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl">
    <h2 class="text-4xl md:text-5xl font-bold mb-6">Ready to ship faster?</h2>
    <p class="text-xl text-white/80 mb-10">Join 10,000+ developers who deploy with confidence.</p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <button class="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-slate-100 transition">Get Started Free</button>
      <button class="px-8 py-4 border-2 border-white rounded-xl font-semibold hover:bg-white/10 transition">Talk to Sales</button>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="py-16 px-6 border-t border-white/5">
  <div class="max-w-6xl mx-auto grid md:grid-cols-5 gap-12 mb-12">
    <div class="md:col-span-2">
      <span class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">DevFlow</span>
      <p class="text-slate-500 mt-4">The modern platform for development teams.</p>
    </div>
    <div><h5 class="font-semibold mb-4">Product</h5><ul class="space-y-2 text-sm text-slate-400"><li><a href="#">Features</a></li><li><a href="#">Pricing</a></li><li><a href="#">Changelog</a></li></ul></div>
    <div><h5 class="font-semibold mb-4">Company</h5><ul class="space-y-2 text-sm text-slate-400"><li><a href="#">About</a></li><li><a href="#">Blog</a></li><li><a href="#">Careers</a></li></ul></div>
    <div><h5 class="font-semibold mb-4">Legal</h5><ul class="space-y-2 text-sm text-slate-400"><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li></ul></div>
  </div>
  <div class="max-w-6xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
    <p>© 2025 DevFlow. All rights reserved.</p>
    <div class="flex gap-6"><a href="#">Twitter</a><a href="#">GitHub</a><a href="#">Discord</a></div>
  </div>
</footer>
    `, "SaaS Landing B"),
  },
];
