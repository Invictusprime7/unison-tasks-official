/**
 * Startup Templates
 * Product launch and startup website templates
 */

import { LayoutTemplate } from '../types';
import { wrapInHtmlDoc } from '../utils';

export const startupTemplates: LayoutTemplate[] = [
  {
    id: "startup-launch",
    name: "Startup Launch",
    category: "startup",
    description: "Complete product launch page with features, social proof, and waitlist.",
    tags: ["startup", "launch", "product", "waitlist", "full"],
    code: wrapInHtmlDoc(`
<!-- NAVIGATION -->
<header class="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
  <div class="max-w-6xl mx-auto flex justify-between items-center">
    <div class="flex items-center gap-2">
      <span class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg"></span>
      <span class="text-xl font-bold">Nexus</span>
    </div>
    <nav class="hidden md:flex gap-8 text-sm font-medium text-slate-300">
      <a href="#features" class="hover:text-white transition">Features</a>
      <a href="#how-it-works" class="hover:text-white transition">How It Works</a>
      <a href="#testimonials" class="hover:text-white transition">Testimonials</a>
      <a href="#faq" class="hover:text-white transition">FAQ</a>
    </nav>
    <button class="px-5 py-2 bg-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">Join Waitlist</button>
  </div>
</header>

<!-- HERO -->
<section class="relative min-h-screen flex items-center justify-center px-6 pt-20 pb-12 overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-purple-600/20"></div>
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-3xl"></div>
  <div class="relative z-10 max-w-3xl text-center">
    <div class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-sm text-indigo-400 mb-8">
      <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
      Launching Q1 2026
    </div>
    <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">The future of<br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">productivity</span></h1>
    <p class="text-xl md:text-2xl text-slate-400 mb-10 max-w-xl mx-auto">An AI-powered workspace that adapts to how you work. Automate the mundane, focus on what matters.</p>
    <form class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
      <input type="email" placeholder="Enter your email" class="flex-1 px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500 outline-none text-lg"/>
      <button class="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold hover:opacity-90 transition text-lg">Join Waitlist</button>
    </form>
    <p class="text-sm text-slate-500">🎉 <span class="text-indigo-400 font-medium">2,847</span> people already joined • No spam, ever</p>
    <div class="mt-16 flex justify-center gap-8">
      <div class="text-center"><p class="text-3xl font-bold text-indigo-400">10x</p><p class="text-sm text-slate-500">Faster workflows</p></div>
      <div class="text-center"><p class="text-3xl font-bold text-purple-400">50%</p><p class="text-sm text-slate-500">Less meetings</p></div>
      <div class="text-center"><p class="text-3xl font-bold text-cyan-400">3hrs</p><p class="text-sm text-slate-500">Saved daily</p></div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section id="features" class="py-24 px-6 bg-slate-900/50">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-16">
      <span class="text-indigo-400 text-sm font-semibold tracking-wider uppercase">Features</span>
      <h2 class="text-4xl md:text-5xl font-bold mt-4 mb-6">Built for the future</h2>
      <p class="text-xl text-slate-400 max-w-2xl mx-auto">Everything you need to supercharge your productivity</p>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      <div class="p-8 bg-slate-800/50 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition">
        <div class="w-14 h-14 bg-indigo-500/10 rounded-xl flex items-center justify-center text-2xl mb-6">🧠</div>
        <h3 class="text-xl font-bold mb-3">AI Assistant</h3>
        <p class="text-slate-400">Your personal AI that learns your work patterns and automates repetitive tasks.</p>
      </div>
      <div class="p-8 bg-slate-800/50 rounded-2xl border border-white/5 hover:border-purple-500/30 transition">
        <div class="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center text-2xl mb-6">⚡</div>
        <h3 class="text-xl font-bold mb-3">Instant Sync</h3>
        <p class="text-slate-400">Real-time collaboration with zero lag. Work together, anywhere in the world.</p>
      </div>
      <div class="p-8 bg-slate-800/50 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition">
        <div class="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center text-2xl mb-6">🔗</div>
        <h3 class="text-xl font-bold mb-3">100+ Integrations</h3>
        <p class="text-slate-400">Connect with all your favorite tools. Slack, Notion, GitHub, and more.</p>
      </div>
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section id="how-it-works" class="py-24 px-6">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-16">
      <span class="text-purple-400 text-sm font-semibold tracking-wider uppercase">How It Works</span>
      <h2 class="text-4xl md:text-5xl font-bold mt-4">Simple as 1-2-3</h2>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      <div class="text-center">
        <div class="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
        <h3 class="text-xl font-bold mb-3">Sign Up</h3>
        <p class="text-slate-400">Join the waitlist and get early access when we launch.</p>
      </div>
      <div class="text-center">
        <div class="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
        <h3 class="text-xl font-bold mb-3">Connect Tools</h3>
        <p class="text-slate-400">Link your existing apps in one click. Our AI learns automatically.</p>
      </div>
      <div class="text-center">
        <div class="w-16 h-16 bg-cyan-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
        <h3 class="text-xl font-bold mb-3">Get Productive</h3>
        <p class="text-slate-400">Let Nexus handle the busywork while you focus on what matters.</p>
      </div>
    </div>
  </div>
</section>

<!-- TESTIMONIALS -->
<section id="testimonials" class="py-24 px-6 bg-slate-900/50">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-16">
      <span class="text-green-400 text-sm font-semibold tracking-wider uppercase">Social Proof</span>
      <h2 class="text-4xl font-bold mt-4">Beta testers love us</h2>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      <div class="p-8 bg-slate-800/50 rounded-2xl border border-white/5">
        <div class="flex gap-1 text-yellow-400 mb-4">★★★★★</div>
        <p class="text-slate-300 mb-6">"Nexus has completely transformed how our team works. We've cut meeting time in half!"</p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-indigo-500 rounded-full"></div>
          <div><p class="font-semibold">Sarah Kim</p><p class="text-sm text-slate-500">Product Manager</p></div>
        </div>
      </div>
      <div class="p-8 bg-slate-800/50 rounded-2xl border border-white/5">
        <div class="flex gap-1 text-yellow-400 mb-4">★★★★★</div>
        <p class="text-slate-300 mb-6">"The AI assistant is incredibly intuitive. It felt like it could read my mind!"</p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-purple-500 rounded-full"></div>
          <div><p class="font-semibold">Jake Morrison</p><p class="text-sm text-slate-500">Freelance Designer</p></div>
        </div>
      </div>
      <div class="p-8 bg-slate-800/50 rounded-2xl border border-white/5">
        <div class="flex gap-1 text-yellow-400 mb-4">★★★★★</div>
        <p class="text-slate-300 mb-6">"Finally, a productivity tool that actually delivers on its promises!"</p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-cyan-500 rounded-full"></div>
          <div><p class="font-semibold">Emily Chen</p><p class="text-sm text-slate-500">Startup Founder</p></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section id="faq" class="py-24 px-6">
  <div class="max-w-3xl mx-auto">
    <div class="text-center mb-16">
      <span class="text-orange-400 text-sm font-semibold tracking-wider uppercase">FAQ</span>
      <h2 class="text-4xl font-bold mt-4">Got questions?</h2>
    </div>
    <div class="space-y-4">
      <details class="p-6 bg-slate-800/50 rounded-xl border border-white/5 group" open>
        <summary class="font-semibold cursor-pointer list-none flex justify-between items-center">When will Nexus launch?<span class="text-slate-500 group-open:rotate-180 transition">▼</span></summary>
        <p class="mt-4 text-slate-400">We're targeting Q1 2026 for our public launch. Waitlist members will get early access.</p>
      </details>
      <details class="p-6 bg-slate-800/50 rounded-xl border border-white/5 group">
        <summary class="font-semibold cursor-pointer list-none flex justify-between items-center">Is there a free plan?<span class="text-slate-500 group-open:rotate-180 transition">▼</span></summary>
        <p class="mt-4 text-slate-400">Yes! We'll have a generous free tier for individuals and small teams.</p>
      </details>
      <details class="p-6 bg-slate-800/50 rounded-xl border border-white/5 group">
        <summary class="font-semibold cursor-pointer list-none flex justify-between items-center">What platforms do you support?<span class="text-slate-500 group-open:rotate-180 transition">▼</span></summary>
        <p class="mt-4 text-slate-400">Nexus works on web, Mac, Windows, iOS, and Android.</p>
      </details>
    </div>
  </div>
</section>

<!-- FINAL CTA -->
<section class="py-24 px-6">
  <div class="max-w-4xl mx-auto text-center">
    <h2 class="text-4xl md:text-5xl font-bold mb-6">Ready to transform your workflow?</h2>
    <p class="text-xl text-slate-400 mb-10">Join 2,847+ early adopters and be first in line when we launch.</p>
    <form class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
      <input type="email" placeholder="Enter your email" class="flex-1 px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500 outline-none"/>
      <button class="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold hover:opacity-90 transition">Join Waitlist</button>
    </form>
    <p class="text-sm text-slate-500">Free forever plan available • No credit card required</p>
  </div>
</section>

<!-- FOOTER -->
<footer class="py-12 px-6 border-t border-white/5">
  <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
    <div class="flex items-center gap-2">
      <span class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg"></span>
      <span class="text-xl font-bold">Nexus</span>
    </div>
    <div class="flex gap-8 text-sm text-slate-500">
      <a href="#" class="hover:text-white">Privacy</a>
      <a href="#" class="hover:text-white">Terms</a>
      <a href="#" class="hover:text-white">Twitter</a>
    </div>
    <p class="text-sm text-slate-500">© 2025 Nexus. All rights reserved.</p>
  </div>
</footer>
    `, "Startup Launch"),
  },
];
