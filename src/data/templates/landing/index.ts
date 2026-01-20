/**
 * Landing Page Templates - Full Pages
 */

import { LayoutTemplate } from '../types';
import { wrapInHtmlDoc } from '../utils';

const landingExtras = (opts: {
  brand: string;
  accent: 'emerald' | 'blue' | 'cyan' | 'rose' | 'indigo' | 'slate';
  cta: string;
}) => {
  const safeId = opts.brand.replace(/\s+/g, '-').toLowerCase();
  const stickyKey = `landing-${safeId}-${opts.accent}`;
  const gradient =
    opts.accent === 'emerald'
      ? 'from-emerald-500 to-cyan-500'
      : opts.accent === 'cyan'
        ? 'from-cyan-500 to-blue-600'
        : opts.accent === 'blue'
          ? 'from-blue-600 to-indigo-600'
          : opts.accent === 'rose'
            ? 'from-rose-500 to-fuchsia-500'
            : opts.accent === 'indigo'
              ? 'from-indigo-500 to-purple-600'
              : 'from-slate-800 to-slate-600';

  const pill =
    opts.accent === 'emerald'
      ? 'text-emerald-300 border-emerald-500/20 bg-emerald-500/10'
      : opts.accent === 'cyan'
        ? 'text-cyan-300 border-cyan-500/20 bg-cyan-500/10'
        : opts.accent === 'blue'
          ? 'text-blue-300 border-blue-500/20 bg-blue-500/10'
          : opts.accent === 'rose'
            ? 'text-rose-300 border-rose-500/20 bg-rose-500/10'
            : opts.accent === 'indigo'
              ? 'text-indigo-300 border-indigo-500/20 bg-indigo-500/10'
              : 'text-slate-300 border-white/10 bg-white/5';

  return `
<section class="py-20 px-6 bg-white/5">
  <div class="max-w-6xl mx-auto">
    <div class="flex items-end justify-between gap-6 mb-10">
      <div>
        <h2 class="text-2xl md:text-3xl font-bold">Product tour</h2>
        <p class="text-slate-400 mt-2">Clickable tabs you can wire to real content.</p>
      </div>
      <span class="hidden md:inline-flex px-3 py-1 rounded-full border ${pill} text-xs tracking-wider">TABS</span>
    </div>

    <div class="rounded-3xl border border-white/10 bg-slate-900/40 p-6" data-tabs>
      <div class="flex flex-wrap gap-2">
        <button class="px-4 py-2 rounded-xl border border-white/10 bg-white/10 text-sm font-semibold tw-focus" data-tab="overview">Overview</button>
        <button class="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold tw-focus" data-tab="automation">Automation</button>
        <button class="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold tw-focus" data-tab="security">Security</button>
      </div>

      <div class="mt-6">
        <div data-tab-panel="overview" class="grid md:grid-cols-3 gap-6">
          <div class="rounded-2xl border border-white/10 bg-white/5 p-6 md:-translate-y-1">
            <div class="text-xs text-slate-500">Time-to-value</div>
            <div class="text-3xl font-extrabold mt-1">15m</div>
            <div class="text-sm text-slate-400">from signup to first win</div>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div class="text-xs text-slate-500">Teams</div>
            <div class="text-3xl font-extrabold mt-1">1–500</div>
            <div class="text-sm text-slate-400">scales with permissions</div>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/5 p-6 md:translate-y-1">
            <div class="text-xs text-slate-500">Support</div>
            <div class="text-3xl font-extrabold mt-1">24/7</div>
            <div class="text-sm text-slate-400">human help when needed</div>
          </div>
        </div>
        <div data-tab-panel="automation" class="hidden">
          <div class="grid md:grid-cols-2 gap-6">
            <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 class="font-semibold">Automations that feel native</h3>
              <p class="text-sm text-slate-400 mt-2">Trigger actions on events, schedule workflows, and route approvals without switching tools.</p>
              <ul class="mt-4 space-y-2 text-sm text-slate-300">
                <li>✓ Smart assignments</li>
                <li>✓ Slack/Email notifications</li>
                <li>✓ One-click runbooks</li>
              </ul>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 class="font-semibold">Live demo form</h3>
              <p class="text-sm text-slate-400 mt-2">This is a demo submit (no backend). It shows a toast.</p>
              <div data-demo-form-host>
                <form class="mt-4 grid sm:grid-cols-3 gap-3" data-demo-form>
                  <input class="px-4 py-3 rounded-xl bg-slate-950/30 border border-white/10 outline-none" placeholder="Work email" type="email" required />
                  <input class="px-4 py-3 rounded-xl bg-slate-950/30 border border-white/10 outline-none" placeholder="Company" type="text" />
                  <button class="px-4 py-3 rounded-xl bg-gradient-to-r ${gradient} text-white font-bold" data-intent="demo.request">Request demo</button>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div data-tab-panel="security" class="hidden">
          <div class="grid md:grid-cols-3 gap-6">
            <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div class="text-2xl">🔒</div>
              <div class="font-semibold mt-3">SSO & SCIM</div>
              <div class="text-sm text-slate-400 mt-1">Provision users automatically.</div>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-6 md:translate-y-1">
              <div class="text-2xl">🧾</div>
              <div class="font-semibold mt-3">Audit logs</div>
              <div class="text-sm text-slate-400 mt-1">Every action, searchable.</div>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div class="text-2xl">🛡️</div>
              <div class="font-semibold mt-3">SOC 2-ready</div>
              <div class="text-sm text-slate-400 mt-1">Policies + controls included.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="py-20 px-6">
  <div class="max-w-5xl mx-auto">
    <div class="flex items-end justify-between gap-6 mb-8">
      <div>
        <h2 class="text-2xl md:text-3xl font-bold">Billing options</h2>
        <p class="text-slate-400 mt-2">Toggle monthly vs annual pricing.</p>
      </div>
      <div class="inline-flex items-center gap-3 text-sm text-slate-300" data-pricing>
        <span>Monthly</span>
        <label class="inline-flex items-center gap-2 cursor-pointer">
          <input type="checkbox" class="accent-white" data-pricing-switch />
          <span class="text-slate-300">Annual</span>
        </label>
      </div>
    </div>
    <div class="grid md:grid-cols-3 gap-6" data-pricing>
      <div class="rounded-2xl border border-white/10 bg-slate-900/50 p-7">
        <div class="font-semibold">Starter</div>
        <div class="mt-3 text-4xl font-extrabold" data-price-monthly>$0</div>
        <div class="mt-3 text-4xl font-extrabold hidden" data-price-annual>$0</div>
        <div class="text-sm text-slate-400">Best for trying it out.</div>
      </div>
      <div class="rounded-2xl border border-white/10 bg-slate-900/50 p-7 md:-translate-y-1">
        <div class="font-semibold">Pro</div>
        <div class="mt-3 text-4xl font-extrabold" data-price-monthly>$29</div>
        <div class="mt-3 text-4xl font-extrabold hidden" data-price-annual>$290</div>
        <div class="text-sm text-slate-400">For teams that ship weekly.</div>
        <button class="mt-6 w-full px-4 py-3 rounded-xl bg-gradient-to-r ${gradient} font-bold" data-intent="trial.start">${opts.cta}</button>
      </div>
      <div class="rounded-2xl border border-white/10 bg-slate-900/50 p-7">
        <div class="font-semibold">Enterprise</div>
        <div class="mt-3 text-4xl font-extrabold">Custom</div>
        <div class="text-sm text-slate-400">Security + support at scale.</div>
      </div>
    </div>
  </div>
</section>

<section class="py-20 px-6 bg-white/5">
  <div class="max-w-5xl mx-auto">
    <div class="flex items-end justify-between gap-6 mb-8">
      <div>
        <h2 class="text-2xl md:text-3xl font-bold">FAQ</h2>
        <p class="text-slate-400 mt-2">Quick answers for common questions.</p>
      </div>
      <span class="hidden md:inline-flex px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs tracking-wider">ACCORDION</span>
    </div>
    <div class="space-y-3">
      <details class="group rounded-2xl border border-white/10 bg-slate-900/50 p-5">
        <summary class="flex items-center justify-between gap-4 tw-focus"><span class="font-semibold">Can I cancel anytime?</span><span class="text-slate-400 group-open:rotate-45 transition">+</span></summary>
        <div class="mt-3 text-sm text-slate-400">Yes—cancel from your dashboard. Your data stays available during your billing period.</div>
      </details>
      <details class="group rounded-2xl border border-white/10 bg-slate-900/50 p-5">
        <summary class="flex items-center justify-between gap-4 tw-focus"><span class="font-semibold">Do you support SSO?</span><span class="text-slate-400 group-open:rotate-45 transition">+</span></summary>
        <div class="mt-3 text-sm text-slate-400">SSO is available on Enterprise plans. SCIM provisioning is included.</div>
      </details>
      <details class="group rounded-2xl border border-white/10 bg-slate-900/50 p-5">
        <summary class="flex items-center justify-between gap-4 tw-focus"><span class="font-semibold">Is there a free tier?</span><span class="text-slate-400 group-open:rotate-45 transition">+</span></summary>
        <div class="mt-3 text-sm text-slate-400">Yes—use Starter for lightweight usage, or begin a trial on Pro.</div>
      </details>
    </div>
  </div>
</section>

<div class="fixed bottom-4 left-4 right-4 z-50" data-sticky data-sticky-key="${stickyKey}" aria-hidden="false">
  <div class="relative max-w-6xl mx-auto rounded-2xl border border-white/10 bg-gradient-to-r ${gradient} px-5 py-4 shadow-2xl shadow-black/30">
    <button type="button" aria-label="Hide sticky bar" class="absolute top-1.5 right-1.5 grid h-7 w-7 place-items-center rounded-full bg-white/15 text-white/90 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50" data-dismiss="closest" data-dismiss-key="${stickyKey}">
      <span aria-hidden="true" class="text-sm leading-none">✕</span>
    </button>
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div class="text-xs tracking-widest text-white/80">LIVE CTA</div>
        <div class="text-lg font-semibold">Try ${opts.brand} today</div>
        <div class="text-sm text-white/80">Interactive sticky bar + toggle panel.</div>
      </div>
      <div class="flex gap-3">
        <button class="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/20 border border-white/20 text-sm font-semibold tw-focus" data-toggle="#demo-landing-${safeId}" data-intent="none">Details</button>
        <button class="px-5 py-2 rounded-xl bg-white text-black text-sm font-bold tw-focus" data-intent="trial.start">${opts.cta}</button>
      </div>
    </div>
    <div id="demo-landing-${safeId}" class="hidden mt-4 rounded-xl bg-black/15 border border-white/15 px-4 py-3 text-sm text-white/90" aria-hidden="true">
      This panel is toggled via the shared template runtime. Hook it up to a calendar link, onboarding modal, or lead form.
    </div>
  </div>
</div>
`;
};

export const landingTemplates: LayoutTemplate[] = [
  {
    id: "landing-saas-modern",
    name: "SaaS Modern",
    category: "landing",
    description: "Modern SaaS landing with gradient hero, features, pricing, testimonials",
    tags: ["saas", "modern", "gradient", "full"],
    code: wrapInHtmlDoc(`
<nav class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-white/5"><div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between"><a href="#" class="text-xl font-bold text-emerald-400">SaaSify</a><div class="hidden md:flex items-center gap-8"><a href="#features" class="text-sm text-slate-300 hover:text-white">Features</a><a href="#pricing" class="text-sm text-slate-300 hover:text-white">Pricing</a><a href="#testimonials" class="text-sm text-slate-300 hover:text-white">Testimonials</a></div><div class="flex items-center gap-3"><button class="text-sm text-slate-300" data-intent="auth.login">Log in</button><button class="px-4 py-2 bg-emerald-500 text-sm font-medium rounded-lg" data-intent="trial.start">Get Started</button></div></div></nav>

<section class="pt-32 pb-20 px-6 relative overflow-hidden"><div class="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-transparent to-cyan-600/20"></div><div class="max-w-6xl mx-auto text-center relative z-10"><span class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-400 mb-6">✨ New: AI-powered features</span><h1 class="text-5xl md:text-7xl font-bold leading-tight mb-6">Scale your business <span class="text-emerald-400">effortlessly</span></h1><p class="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">The all-in-one platform for modern teams. Ship faster, collaborate better.</p><div class="flex flex-col sm:flex-row gap-4 justify-center mb-12"><button class="px-8 py-4 bg-emerald-500 font-semibold rounded-xl shadow-lg shadow-emerald-500/25" data-intent="trial.start">Start Free Trial</button><button class="px-8 py-4 border border-white/20 font-semibold rounded-xl" data-intent="demo.request">Watch Demo →</button></div><div class="flex justify-center gap-8 text-sm text-slate-500"><span>✓ No credit card</span><span>✓ 14-day trial</span><span>✓ Cancel anytime</span></div></div></section>

<section class="py-24 px-6" id="features"><div class="max-w-6xl mx-auto"><div class="text-center mb-16"><span class="text-emerald-400 text-sm font-semibold uppercase tracking-wider">Features</span><h2 class="text-4xl font-bold mt-4 mb-6">Everything you need</h2></div><div class="grid md:grid-cols-3 gap-8"><div class="p-8 rounded-2xl bg-white/5 border border-white/10"><div class="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">⚡</div><h3 class="text-xl font-semibold mb-3">Lightning Fast</h3><p class="text-slate-400">Built for speed with optimized infrastructure.</p></div><div class="p-8 rounded-2xl bg-white/5 border border-white/10"><div class="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">🔒</div><h3 class="text-xl font-semibold mb-3">Enterprise Security</h3><p class="text-slate-400">Bank-grade encryption for your data.</p></div><div class="p-8 rounded-2xl bg-white/5 border border-white/10"><div class="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">📊</div><h3 class="text-xl font-semibold mb-3">Analytics</h3><p class="text-slate-400">Real-time insights and dashboards.</p></div></div></div></section>

<section class="py-24 px-6 bg-white/5" id="pricing"><div class="max-w-5xl mx-auto"><div class="text-center mb-16"><h2 class="text-4xl font-bold mb-4">Simple pricing</h2></div><div class="grid md:grid-cols-3 gap-8"><div class="p-8 rounded-2xl bg-slate-900 border border-white/10"><h3 class="font-semibold mb-2">Starter</h3><div class="mb-6"><span class="text-4xl font-bold">$0</span><span class="text-slate-400">/mo</span></div><ul class="space-y-3 mb-8 text-sm text-slate-400"><li>✓ 3 projects</li><li>✓ 1GB storage</li></ul><button class="w-full py-3 border border-white/20 rounded-lg" data-intent="pricing.select" data-plan="starter">Get Started</button></div><div class="p-8 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-transparent border-2 border-emerald-500/50 relative"><span class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-black text-xs font-bold rounded-full">POPULAR</span><h3 class="font-semibold mb-2">Pro</h3><div class="mb-6"><span class="text-4xl font-bold">$29</span><span class="text-slate-400">/mo</span></div><ul class="space-y-3 mb-8 text-sm"><li>✓ Unlimited projects</li><li>✓ 100GB storage</li></ul><button class="w-full py-3 bg-emerald-500 text-black rounded-lg font-semibold" data-intent="pricing.select" data-plan="pro">Get Started</button></div><div class="p-8 rounded-2xl bg-slate-900 border border-white/10"><h3 class="font-semibold mb-2">Enterprise</h3><div class="mb-6"><span class="text-4xl font-bold">$99</span><span class="text-slate-400">/mo</span></div><ul class="space-y-3 mb-8 text-sm text-slate-400"><li>✓ Everything in Pro</li><li>✓ Unlimited storage</li></ul><button class="w-full py-3 border border-white/20 rounded-lg" data-intent="contact.sales" data-plan="enterprise">Contact Sales</button></div></div></div></section>

<section class="py-24 px-6" id="testimonials"><div class="max-w-6xl mx-auto"><h2 class="text-4xl font-bold text-center mb-16">Loved by thousands</h2><div class="grid md:grid-cols-3 gap-8"><div class="p-8 rounded-2xl bg-slate-900 border border-white/10"><div class="flex gap-1 mb-4 text-amber-400">★★★★★</div><p class="text-slate-300 mb-6">"This tool transformed how we work!"</p><div class="flex items-center gap-4"><img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" alt="" class="w-10 h-10 rounded-full object-cover"/><div><p class="font-semibold text-sm">Sarah Johnson</p><p class="text-xs text-slate-500">CEO, TechCorp</p></div></div></div><div class="p-8 rounded-2xl bg-slate-900 border border-white/10"><div class="flex gap-1 mb-4 text-amber-400">★★★★★</div><p class="text-slate-300 mb-6">"Best investment we've made this year."</p><div class="flex items-center gap-4"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" alt="" class="w-10 h-10 rounded-full object-cover"/><div><p class="font-semibold text-sm">Michael Chen</p><p class="text-xs text-slate-500">CTO, StartupXYZ</p></div></div></div><div class="p-8 rounded-2xl bg-slate-900 border border-white/10"><div class="flex gap-1 mb-4 text-amber-400">★★★★★</div><p class="text-slate-300 mb-6">"Amazing support. Highly recommend!"</p><div class="flex items-center gap-4"><img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80" alt="" class="w-10 h-10 rounded-full object-cover"/><div><p class="font-semibold text-sm">Emily Rodriguez</p><p class="text-xs text-slate-500">Product Lead</p></div></div></div></div></div></section>

<section class="py-24 px-6"><div class="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-emerald-600 to-cyan-600 p-12 text-center"><h2 class="text-4xl font-bold mb-6">Ready to get started?</h2><p class="text-xl text-white/80 mb-8">Join thousands of teams using our platform.</p><button class="px-8 py-4 bg-white text-emerald-600 font-semibold rounded-xl" data-intent="trial.start">Start Free Trial</button></div></section>

${landingExtras({ brand: 'SaaSify', accent: 'emerald', cta: 'Start Free Trial' })}

<footer class="py-16 px-6 border-t border-white/5"><div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8"><span class="text-xl font-bold text-emerald-400">SaaSify</span><div class="flex gap-8 text-sm text-slate-400"><a href="#">Features</a><a href="#">Pricing</a><a href="#">About</a></div><p class="text-sm text-slate-500">© 2025 SaaSify. All rights reserved.</p></div></footer>
    `, "SaaS Modern"),
  },

  {
    id: "landing-dark-elite",
    name: "Dark Elite",
    category: "landing",
    description: "Premium dark landing with glassmorphism and waitlist",
    tags: ["dark", "premium", "waitlist", "full"],
    code: wrapInHtmlDoc(`
<nav class="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5"><div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between"><a href="#" class="text-xl font-bold">Nexus<span class="text-blue-500">.</span></a><div class="hidden md:flex items-center gap-8"><a href="#" class="text-sm text-slate-400 hover:text-white">Product</a><a href="#" class="text-sm text-slate-400 hover:text-white">Pricing</a><a href="#" class="text-sm text-slate-400 hover:text-white">Resources</a></div><div class="flex items-center gap-4"><button class="text-sm text-slate-400">Sign in</button><button class="px-4 py-2 bg-blue-600 text-sm font-medium rounded-lg">Start Free</button></div></div></nav>

<section class="min-h-screen flex items-center justify-center px-6 pt-20 relative overflow-hidden"><div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px]"></div><div class="relative z-10 text-center max-w-4xl"><div class="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm mb-8"><span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>Now in public beta</div><h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight">The future of <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">productivity</span></h1><p class="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">AI-powered workspace that adapts to you. Automate the mundane.</p><div class="flex flex-col sm:flex-row gap-4 justify-center mb-8"><input type="email" placeholder="Enter your email" class="px-6 py-4 bg-white/5 border border-white/10 rounded-xl w-72 focus:border-blue-500 outline-none"/><button class="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 font-semibold rounded-xl">Join Waitlist</button></div><p class="text-sm text-slate-500">🎉 2,847 people already joined</p></div></section>

<section class="py-24 px-6"><div class="max-w-6xl mx-auto"><div class="text-center mb-16"><h2 class="text-4xl font-bold">Built for modern workflows</h2></div><div class="grid md:grid-cols-4 gap-6"><div class="p-6 rounded-2xl bg-white/5 border border-white/10"><div class="text-3xl mb-4">🚀</div><h3 class="font-semibold mb-2">10x Faster</h3><p class="text-sm text-slate-400">Ship at unprecedented speed.</p></div><div class="p-6 rounded-2xl bg-white/5 border border-white/10"><div class="text-3xl mb-4">🤖</div><h3 class="font-semibold mb-2">AI-Native</h3><p class="text-sm text-slate-400">AI built at its core.</p></div><div class="p-6 rounded-2xl bg-white/5 border border-white/10"><div class="text-3xl mb-4">🔗</div><h3 class="font-semibold mb-2">100+ Integrations</h3><p class="text-sm text-slate-400">Connect your tools.</p></div><div class="p-6 rounded-2xl bg-white/5 border border-white/10"><div class="text-3xl mb-4">🛡️</div><h3 class="font-semibold mb-2">SOC 2</h3><p class="text-sm text-slate-400">Enterprise security.</p></div></div></div></section>

<section class="py-24 px-6 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent"><div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center"><div><h2 class="text-4xl font-bold mb-6">Everything in <span class="text-blue-400">one place</span></h2><p class="text-xl text-slate-400 mb-8">Powerful features that help you work smarter.</p><div class="space-y-6"><div class="flex gap-4"><div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">✓</div><div><h4 class="font-semibold mb-1">Smart Automation</h4><p class="text-sm text-slate-400">Automate repetitive tasks.</p></div></div><div class="flex gap-4"><div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">✓</div><div><h4 class="font-semibold mb-1">Real-time Collaboration</h4><p class="text-sm text-slate-400">Work together seamlessly.</p></div></div><div class="flex gap-4"><div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">✓</div><div><h4 class="font-semibold mb-1">Advanced Analytics</h4><p class="text-sm text-slate-400">Insights that drive decisions.</p></div></div></div></div><div class="bg-slate-900 rounded-2xl border border-white/10 p-4"><img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" alt="Dashboard" class="rounded-lg w-full"/></div></div></section>

<section class="py-24 px-6"><div class="max-w-4xl mx-auto text-center"><h2 class="text-4xl font-bold mb-12">Trusted by leaders</h2><div class="flex flex-wrap justify-center gap-12 opacity-40 grayscale"><span class="text-2xl font-bold">VERCEL</span><span class="text-2xl font-bold">Stripe</span><span class="text-2xl font-bold">Linear</span><span class="text-2xl font-bold">Notion</span><span class="text-2xl font-bold">Figma</span></div></div></section>

<section class="py-24 px-6"><div class="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 md:p-16 text-center"><h2 class="text-4xl font-bold mb-6">Transform your workflow</h2><p class="text-xl text-white/80 mb-10">Start free. No credit card required.</p><div class="flex flex-col sm:flex-row gap-4 justify-center"><button class="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl">Start Free Trial</button><button class="px-8 py-4 border border-white/30 font-semibold rounded-xl">Book a Demo</button></div></div></section>

${landingExtras({ brand: 'Nexus', accent: 'blue', cta: 'Start Free' })}

<footer class="py-16 px-6 border-t border-white/5"><div class="max-w-6xl mx-auto grid md:grid-cols-4 gap-12"><div><span class="text-xl font-bold">Nexus<span class="text-blue-500">.</span></span><p class="text-sm text-slate-500 mt-4">The future of productivity.</p></div><div><h5 class="font-semibold mb-4 text-sm">Product</h5><ul class="space-y-2 text-sm text-slate-400"><li>Features</li><li>Pricing</li></ul></div><div><h5 class="font-semibold mb-4 text-sm">Company</h5><ul class="space-y-2 text-sm text-slate-400"><li>About</li><li>Blog</li></ul></div><div><h5 class="font-semibold mb-4 text-sm">Legal</h5><ul class="space-y-2 text-sm text-slate-400"><li>Privacy</li><li>Terms</li></ul></div></div></footer>
    `, "Dark Elite"),
  },

  {
    id: "landing-minimal-app",
    name: "Minimal App",
    category: "landing",
    description: "Clean minimal app landing with large typography",
    tags: ["app", "minimal", "clean", "full"],
    code: wrapInHtmlDoc(`
<nav class="fixed top-0 left-0 right-0 z-50 px-6 py-6"><div class="max-w-5xl mx-auto flex items-center justify-between"><a href="#" class="text-xl font-bold">Pulse</a><div class="hidden md:flex items-center gap-8"><a href="#" class="text-sm text-slate-400 hover:text-white">Features</a><a href="#" class="text-sm text-slate-400 hover:text-white">Pricing</a><a href="#" class="text-sm text-slate-400 hover:text-white">About</a></div><button class="px-5 py-2 bg-white text-black text-sm font-medium rounded-full">Download</button></div></nav>

<section class="min-h-screen flex items-center justify-center px-6"><div class="max-w-3xl text-center"><h1 class="text-6xl md:text-8xl font-bold mb-8 tracking-tight">Focus.<br/><span class="text-slate-500">Flow.</span><br/><span class="text-slate-700">Finish.</span></h1><p class="text-xl text-slate-400 mb-12 max-w-xl mx-auto">The minimalist productivity app. No clutter, no distractions.</p><div class="flex flex-col sm:flex-row gap-4 justify-center"><button class="px-8 py-4 bg-white text-black font-semibold rounded-full">Download for Mac</button><button class="px-8 py-4 border border-white/20 font-semibold rounded-full">View on Web</button></div><p class="text-sm text-slate-500 mt-8">Also on iOS and Windows</p></div></section>

<section class="py-32 px-6"><div class="max-w-5xl mx-auto"><div class="bg-slate-900 rounded-3xl border border-white/10 p-8"><img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80" alt="App" class="rounded-2xl w-full"/></div></div></section>

<section class="py-24 px-6"><div class="max-w-4xl mx-auto"><h2 class="text-4xl font-bold text-center mb-20">Why Pulse?</h2><div class="grid md:grid-cols-3 gap-16 text-center"><div><div class="text-5xl mb-6">🎯</div><h3 class="text-xl font-semibold mb-3">Stay Focused</h3><p class="text-slate-400">Block distractions and enter deep work mode.</p></div><div><div class="text-5xl mb-6">⚡</div><h3 class="text-xl font-semibold mb-3">Work Faster</h3><p class="text-slate-400">Keyboard-first design for flow state.</p></div><div><div class="text-5xl mb-6">📊</div><h3 class="text-xl font-semibold mb-3">Track Progress</h3><p class="text-slate-400">Beautiful productivity insights.</p></div></div></div></section>

<section class="py-24 px-6 bg-white/5"><div class="max-w-4xl mx-auto"><h2 class="text-4xl font-bold text-center mb-16">Simple pricing</h2><div class="grid md:grid-cols-2 gap-8"><div class="p-10 rounded-3xl bg-slate-900 border border-white/10"><h3 class="text-xl font-semibold mb-2">Free</h3><p class="text-slate-400 mb-6">For personal use</p><div class="text-5xl font-bold mb-8">$0</div><ul class="space-y-4 mb-10 text-slate-300"><li>✓ Unlimited tasks</li><li>✓ Basic analytics</li><li>✓ 1 device</li></ul><button class="w-full py-4 border border-white/20 rounded-full font-semibold">Get Started</button></div><div class="p-10 rounded-3xl bg-white text-black"><h3 class="text-xl font-semibold mb-2">Pro</h3><p class="text-slate-600 mb-6">For power users</p><div class="text-5xl font-bold mb-8">$8<span class="text-lg text-slate-500">/mo</span></div><ul class="space-y-4 mb-10 text-slate-700"><li>✓ Everything in Free</li><li>✓ Advanced analytics</li><li>✓ Unlimited devices</li></ul><button class="w-full py-4 bg-black text-white rounded-full font-semibold">Start Trial</button></div></div></div></section>

<section class="py-32 px-6"><div class="max-w-2xl mx-auto text-center"><h2 class="text-4xl font-bold mb-6">Ready to focus?</h2><p class="text-xl text-slate-400 mb-10">Join 50,000+ productive people.</p><button class="px-10 py-5 bg-white text-black font-semibold rounded-full text-lg">Download Free</button></div></section>

${landingExtras({ brand: 'Pulse', accent: 'slate', cta: 'Download' })}

<footer class="py-12 px-6 border-t border-white/5"><div class="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6"><span class="font-bold">Pulse</span><div class="flex gap-8 text-sm text-slate-400"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Twitter</a></div><p class="text-sm text-slate-500">© 2025 Pulse</p></div></footer>
    `, "Minimal App"),
  },

  {
    id: "landing-bold-startup",
    name: "Bold Startup",
    category: "landing",
    description: "Bold startup landing with vibrant accent colors",
    tags: ["startup", "bold", "vibrant", "full"],
    code: wrapInHtmlDoc(`
<nav class="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-950/90 backdrop-blur-lg"><div class="max-w-7xl mx-auto flex items-center justify-between"><a href="#" class="text-2xl font-black text-rose-500">BOLT</a><div class="hidden md:flex items-center gap-6"><a href="#" class="text-sm font-medium hover:text-rose-400">Product</a><a href="#" class="text-sm font-medium hover:text-rose-400">Pricing</a><a href="#" class="text-sm font-medium hover:text-rose-400">Company</a></div><button class="px-5 py-2.5 bg-rose-500 text-sm font-bold rounded-lg">Get Started →</button></div></nav>

<section class="pt-32 pb-20 px-6"><div class="max-w-7xl mx-auto"><div class="max-w-4xl"><span class="inline-block px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full text-sm text-rose-400 font-medium mb-8">🚀 Backed by Y Combinator</span><h1 class="text-6xl md:text-8xl font-black leading-[0.9] mb-8">Move fast.<br/>Break<br/><span class="text-rose-500">nothing.</span></h1><p class="text-xl text-slate-400 max-w-2xl mb-12">The deployment platform that makes shipping safe. Deploy with confidence.</p><div class="flex flex-wrap gap-4"><button class="px-8 py-4 bg-rose-500 text-lg font-bold rounded-xl">Start Deploying</button><button class="px-8 py-4 text-lg font-bold rounded-xl border-2 border-white/20">See it in action →</button></div></div></div></section>

<section class="py-16 px-6 border-y border-white/5"><div class="max-w-7xl mx-auto flex flex-wrap justify-center gap-16 opacity-40"><span class="text-xl font-bold">Stripe</span><span class="text-xl font-bold">Vercel</span><span class="text-xl font-bold">Linear</span><span class="text-xl font-bold">Notion</span><span class="text-xl font-bold">Supabase</span></div></section>

<section class="py-24 px-6"><div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center"><div><img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80" alt="Code" class="rounded-2xl"/></div><div><h2 class="text-4xl md:text-5xl font-black mb-6">Deploy in <span class="text-rose-500">seconds</span></h2><p class="text-xl text-slate-400 mb-8">Push to git. We handle the rest. Zero config.</p><div class="space-y-4"><div class="flex items-center gap-4"><div class="w-8 h-8 bg-rose-500/20 rounded-lg flex items-center justify-center text-rose-400">✓</div><span>Automatic previews for every PR</span></div><div class="flex items-center gap-4"><div class="w-8 h-8 bg-rose-500/20 rounded-lg flex items-center justify-center text-rose-400">✓</div><span>Instant rollbacks</span></div><div class="flex items-center gap-4"><div class="w-8 h-8 bg-rose-500/20 rounded-lg flex items-center justify-center text-rose-400">✓</div><span>Built-in CI/CD</span></div></div></div></div></section>

<section class="py-24 px-6 bg-rose-500 text-black"><div class="max-w-4xl mx-auto text-center"><h2 class="text-4xl md:text-6xl font-black mb-6">Deploy 10x faster</h2><p class="text-xl mb-12 text-black/70">Join thousands shipping with confidence.</p><div class="flex flex-col sm:flex-row gap-4 justify-center"><button class="px-8 py-4 bg-black text-white font-bold rounded-xl">Start Free Trial</button><button class="px-8 py-4 bg-white text-black font-bold rounded-xl">Talk to Sales</button></div></div></section>

<section class="py-24 px-6"><div class="max-w-5xl mx-auto"><h2 class="text-4xl font-black text-center mb-16">Pricing that scales</h2><div class="grid md:grid-cols-3 gap-8"><div class="p-8 rounded-2xl border border-white/10"><h3 class="font-bold text-lg mb-2">Hobby</h3><div class="text-4xl font-black mb-6">Free</div><ul class="space-y-3 text-sm text-slate-400 mb-8"><li>✓ 3 projects</li><li>✓ 100GB bandwidth</li></ul><button class="w-full py-3 border border-white/20 rounded-lg font-semibold">Get Started</button></div><div class="p-8 rounded-2xl bg-rose-500 text-black"><h3 class="font-bold text-lg mb-2">Pro</h3><div class="text-4xl font-black mb-6">$20<span class="text-lg font-normal">/mo</span></div><ul class="space-y-3 text-sm mb-8"><li>✓ Unlimited projects</li><li>✓ 1TB bandwidth</li></ul><button class="w-full py-3 bg-black text-white rounded-lg font-bold">Start Trial</button></div><div class="p-8 rounded-2xl border border-white/10"><h3 class="font-bold text-lg mb-2">Enterprise</h3><div class="text-4xl font-black mb-6">Custom</div><ul class="space-y-3 text-sm text-slate-400 mb-8"><li>✓ Unlimited everything</li><li>✓ SLA guarantee</li></ul><button class="w-full py-3 border border-white/20 rounded-lg font-semibold">Contact Us</button></div></div></div></section>

${landingExtras({ brand: 'BOLT', accent: 'rose', cta: 'Start Deploying' })}

<footer class="py-16 px-6 border-t border-white/5"><div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12"><div><span class="text-2xl font-black text-rose-500">BOLT</span><p class="text-sm text-slate-500 mt-2">Deploy with confidence.</p></div><div class="grid grid-cols-3 gap-16 text-sm"><div><h5 class="font-bold mb-4">Product</h5><ul class="space-y-2 text-slate-400"><li>Features</li><li>Pricing</li></ul></div><div><h5 class="font-bold mb-4">Company</h5><ul class="space-y-2 text-slate-400"><li>About</li><li>Blog</li></ul></div><div><h5 class="font-bold mb-4">Legal</h5><ul class="space-y-2 text-slate-400"><li>Privacy</li><li>Terms</li></ul></div></div></div></footer>
    `, "Bold Startup"),
  },

  {
    id: "landing-developer-api",
    name: "Developer API",
    category: "landing",
    description: "Technical landing for developer tools with code examples",
    tags: ["developer", "api", "technical", "full"],
    code: wrapInHtmlDoc(`
<nav class="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-950/90 backdrop-blur-lg border-b border-white/5"><div class="max-w-7xl mx-auto flex items-center justify-between"><a href="#" class="text-xl font-mono font-bold text-cyan-400">&lt;DevAPI/&gt;</a><div class="hidden md:flex items-center gap-6"><a href="#" class="text-sm text-slate-400 font-mono">docs</a><a href="#" class="text-sm text-slate-400 font-mono">pricing</a><a href="#" class="text-sm text-slate-400 font-mono">github</a></div><div class="flex gap-3"><button class="px-4 py-2 text-sm font-mono text-slate-400">login</button><button class="px-4 py-2 bg-cyan-500 text-black text-sm font-mono font-bold rounded-lg">get api key</button></div></div></nav>

<section class="pt-32 pb-24 px-6"><div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center"><div><span class="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-xs text-cyan-400 font-mono mb-6">v2.0 released</span><h1 class="text-4xl md:text-6xl font-bold mb-6">Build faster with our <span class="text-cyan-400">powerful API</span></h1><p class="text-lg text-slate-400 mb-8">RESTful APIs developers love. Ship in minutes. SDKs for every language.</p><div class="flex gap-4 mb-8"><button class="px-6 py-3 bg-cyan-500 text-black font-mono font-bold rounded-lg">Start Building</button><button class="px-6 py-3 border border-white/20 font-mono rounded-lg">Read Docs</button></div><div class="flex gap-6 text-sm text-slate-500 font-mono"><span>npm i devapi</span><span>pip install devapi</span></div></div><div class="bg-slate-900 rounded-xl border border-white/10 p-4 font-mono text-sm"><div class="flex gap-2 mb-4"><div class="w-3 h-3 rounded-full bg-red-500"></div><div class="w-3 h-3 rounded-full bg-yellow-500"></div><div class="w-3 h-3 rounded-full bg-green-500"></div></div><pre class="text-slate-300"><code><span class="text-cyan-400">import</span> { DevAPI } <span class="text-cyan-400">from</span> <span class="text-green-400">'devapi'</span>;

<span class="text-cyan-400">const</span> client = <span class="text-cyan-400">new</span> DevAPI({
  apiKey: process.env.API_KEY
});

<span class="text-cyan-400">const</span> result = <span class="text-cyan-400">await</span> client.analyze({
  data: myData
});

console.log(result);</code></pre></div></div></section>

<section class="py-20 px-6 border-y border-white/5 bg-white/[0.02]"><div class="max-w-6xl mx-auto"><p class="text-center text-sm text-slate-500 mb-8 font-mono">Trusted by</p><div class="flex flex-wrap justify-center gap-12 opacity-40"><span class="text-xl font-bold">Stripe</span><span class="text-xl font-bold">Vercel</span><span class="text-xl font-bold">Supabase</span><span class="text-xl font-bold">Clerk</span></div></div></section>

<section class="py-24 px-6"><div class="max-w-6xl mx-auto"><h2 class="text-3xl font-bold text-center mb-16">Everything you need</h2><div class="grid md:grid-cols-3 gap-8"><div class="p-6 rounded-xl border border-white/10"><div class="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4 text-cyan-400">⚡</div><h3 class="font-semibold mb-2">Blazing Fast</h3><p class="text-sm text-slate-400">P95 latency under 50ms.</p></div><div class="p-6 rounded-xl border border-white/10"><div class="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4 text-cyan-400">🔒</div><h3 class="font-semibold mb-2">Secure</h3><p class="text-sm text-slate-400">SOC 2 Type II compliant.</p></div><div class="p-6 rounded-xl border border-white/10"><div class="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4 text-cyan-400">📚</div><h3 class="font-semibold mb-2">Great Docs</h3><p class="text-sm text-slate-400">Comprehensive guides.</p></div><div class="p-6 rounded-xl border border-white/10"><div class="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4 text-cyan-400">🌍</div><h3 class="font-semibold mb-2">Global Edge</h3><p class="text-sm text-slate-400">50+ regions worldwide.</p></div><div class="p-6 rounded-xl border border-white/10"><div class="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4 text-cyan-400">📊</div><h3 class="font-semibold mb-2">Analytics</h3><p class="text-sm text-slate-400">Real-time usage dashboard.</p></div><div class="p-6 rounded-xl border border-white/10"><div class="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4 text-cyan-400">🔧</div><h3 class="font-semibold mb-2">SDKs</h3><p class="text-sm text-slate-400">JS, Python, Go, Ruby.</p></div></div></div></section>

<section class="py-24 px-6 bg-cyan-500 text-black"><div class="max-w-3xl mx-auto text-center"><h2 class="text-4xl font-bold mb-6">Start building today</h2><p class="text-xl mb-10 text-black/70">10,000 API calls free every month.</p><div class="flex flex-col sm:flex-row gap-4 justify-center"><button class="px-8 py-4 bg-black text-white font-bold rounded-xl">Get Free API Key</button><button class="px-8 py-4 bg-white text-black font-bold rounded-xl">View Docs</button></div></div></section>

${landingExtras({ brand: 'DevAPI', accent: 'cyan', cta: 'Get API Key' })}

<footer class="py-16 px-6 border-t border-white/5"><div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12"><div><span class="text-xl font-mono font-bold text-cyan-400">&lt;DevAPI/&gt;</span><p class="text-sm text-slate-500 mt-2">APIs developers love.</p></div><div class="grid grid-cols-3 gap-16 text-sm font-mono"><div><h5 class="font-bold mb-4 text-slate-300">product</h5><ul class="space-y-2 text-slate-500"><li>docs</li><li>pricing</li></ul></div><div><h5 class="font-bold mb-4 text-slate-300">company</h5><ul class="space-y-2 text-slate-500"><li>about</li><li>blog</li></ul></div><div><h5 class="font-bold mb-4 text-slate-300">connect</h5><ul class="space-y-2 text-slate-500"><li>github</li><li>discord</li></ul></div></div></div></footer>
    `, "Developer API"),
  },
];
