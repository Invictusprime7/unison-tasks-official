import { LayoutTemplate } from '../types';
import { wrapInHtmlDoc } from '../utils';

const agencyExtras = (opts: {
  brand: string;
  accent: 'violet' | 'cyan' | 'blue' | 'rose' | 'slate';
  cta: string;
}) => {
  const safeId = opts.brand.replace(/\s+/g, '-').toLowerCase();
  const stickyKey = `agency-${safeId}-${opts.accent}`;
  const ctaGradient =
    opts.accent === 'cyan'
      ? 'from-cyan-500 to-blue-600'
      : opts.accent === 'blue'
        ? 'from-blue-600 to-indigo-600'
        : opts.accent === 'rose'
          ? 'from-rose-500 to-fuchsia-500'
          : opts.accent === 'slate'
            ? 'from-slate-900 to-slate-700'
            : 'from-violet-600 to-pink-600';

  const chip =
    opts.accent === 'cyan'
      ? 'text-cyan-300 border-cyan-500/20 bg-cyan-500/10'
      : opts.accent === 'blue'
        ? 'text-blue-300 border-blue-500/20 bg-blue-500/10'
        : opts.accent === 'rose'
          ? 'text-rose-300 border-rose-500/20 bg-rose-500/10'
          : opts.accent === 'slate'
            ? 'text-slate-300 border-slate-500/20 bg-white/5'
            : 'text-violet-300 border-violet-500/20 bg-violet-500/10';

  return `
<section class="py-20 px-6 bg-white/5">
  <div class="max-w-6xl mx-auto">
    <div class="flex items-end justify-between gap-6 mb-8">
      <div>
        <h2 class="text-2xl md:text-3xl font-bold">Client stories</h2>
        <p class="text-slate-400 mt-2">A quick look at outcomes we’re proud of.</p>
      </div>
      <span class="hidden md:inline-flex px-3 py-1 rounded-full border ${chip} text-xs tracking-wider">CAROUSEL</span>
    </div>

    <div class="rounded-3xl border border-white/10 bg-slate-900/40 p-6" data-carousel>
      <div class="grid lg:grid-cols-5 gap-6 items-stretch">
        <div class="lg:col-span-4">
          <div class="rounded-2xl border border-white/10 bg-slate-950/30 p-7" data-carousel-item>
            <div class="grid md:grid-cols-3 gap-6 items-start">
              <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div class="text-xs text-slate-500">Result</div>
                <div class="text-3xl font-extrabold mt-1">+42%</div>
                <div class="text-sm text-slate-400">conversion rate</div>
              </div>
              <div class="md:col-span-2">
                <blockquote class="text-lg text-slate-200 leading-relaxed">“${opts.brand} helped us clarify our positioning and ship a launch that finally clicked. The messaging is sharp, the funnel is clean, and the results speak.”</blockquote>
                <div class="mt-5 text-sm text-slate-400">— Head of Growth, B2B SaaS</div>
              </div>
            </div>
          </div>

          <div class="hidden rounded-2xl border border-white/10 bg-slate-950/30 p-7" data-carousel-item>
            <div class="grid md:grid-cols-3 gap-6 items-start">
              <div class="rounded-2xl border border-white/10 bg-white/5 p-5 md:translate-y-2">
                <div class="text-xs text-slate-500">Result</div>
                <div class="text-3xl font-extrabold mt-1">2.1×</div>
                <div class="text-sm text-slate-400">lead volume</div>
              </div>
              <div class="md:col-span-2">
                <blockquote class="text-lg text-slate-200 leading-relaxed">“They balanced brand + performance. We got a new identity that looks premium and a site that converts. It’s rare to get both.”</blockquote>
                <div class="mt-5 text-sm text-slate-400">— Founder, Services Business</div>
              </div>
            </div>
          </div>

          <div class="hidden rounded-2xl border border-white/10 bg-slate-950/30 p-7" data-carousel-item>
            <div class="grid md:grid-cols-3 gap-6 items-start">
              <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div class="text-xs text-slate-500">Result</div>
                <div class="text-3xl font-extrabold mt-1">-18%</div>
                <div class="text-sm text-slate-400">CAC</div>
              </div>
              <div class="md:col-span-2">
                <blockquote class="text-lg text-slate-200 leading-relaxed">“The deliverables were excellent, but the process was even better—clear milestones, proactive comms, and zero surprises.”</blockquote>
                <div class="mt-5 text-sm text-slate-400">— Marketing Director, DTC</div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1 flex flex-col gap-3">
          <button class="px-4 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-semibold tw-focus" data-carousel-prev>← Prev</button>
          <button class="px-4 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-semibold tw-focus" data-carousel-next>Next →</button>
          <div class="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-400">
            Tip: wire these cards to real case studies.
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
        <h2 class="text-2xl md:text-3xl font-bold">Engagement FAQ</h2>
        <p class="text-slate-400 mt-2">How we work (and what to expect).</p>
      </div>
      <span class="hidden md:inline-flex px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs tracking-wider">ACCORDION</span>
    </div>
    <div class="space-y-3">
      <details class="group rounded-2xl border border-white/10 bg-slate-900/50 p-5">
        <summary class="flex items-center justify-between gap-4 tw-focus">
          <span class="font-semibold">How do projects start?</span>
          <span class="text-slate-400 group-open:rotate-45 transition">+</span>
        </summary>
        <div class="mt-3 text-sm text-slate-400">We run a short discovery, align on goals + scope, then share a timeline with milestones and deliverables.</div>
      </details>
      <details class="group rounded-2xl border border-white/10 bg-slate-900/50 p-5">
        <summary class="flex items-center justify-between gap-4 tw-focus">
          <span class="font-semibold">What’s your typical timeline?</span>
          <span class="text-slate-400 group-open:rotate-45 transition">+</span>
        </summary>
        <div class="mt-3 text-sm text-slate-400">Brand + website projects are usually 2–6 weeks depending on complexity. Sprints keep things moving.</div>
      </details>
      <details class="group rounded-2xl border border-white/10 bg-slate-900/50 p-5">
        <summary class="flex items-center justify-between gap-4 tw-focus">
          <span class="font-semibold">Do you offer ongoing support?</span>
          <span class="text-slate-400 group-open:rotate-45 transition">+</span>
        </summary>
        <div class="mt-3 text-sm text-slate-400">Yes—retainership options for creative, performance, CRO, and maintenance. Cancel any time.</div>
      </details>
    </div>
  </div>
</section>

<div class="fixed bottom-4 left-4 right-4 z-50" data-sticky data-sticky-key="${stickyKey}" aria-hidden="false">
  <div class="relative max-w-5xl mx-auto rounded-2xl border border-white/10 bg-gradient-to-r ${ctaGradient} px-5 py-4 shadow-2xl shadow-black/30">
    <button type="button" aria-label="Hide sticky bar" class="absolute top-1.5 right-1.5 grid h-7 w-7 place-items-center rounded-full bg-white/15 text-white/90 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50" data-dismiss="closest" data-dismiss-key="${stickyKey}">
      <span aria-hidden="true" class="text-sm leading-none">✕</span>
    </button>
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div class="text-xs tracking-widest text-white/80">NEXT STEP</div>
        <div class="text-lg font-semibold">Talk to ${opts.brand}</div>
        <div class="text-sm text-white/80">We’ll reply with scope + a timeline.</div>
      </div>
      <div class="flex gap-3">
        <button class="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/20 border border-white/20 text-sm font-semibold tw-focus" data-toggle="#demo-agency-sticky-${safeId}" data-intent="none">How it works</button>
        <button class="px-5 py-2 rounded-xl bg-white text-black text-sm font-bold tw-focus" data-intent="project.start">${opts.cta}</button>
      </div>
    </div>
    <div id="demo-agency-sticky-${safeId}" class="hidden mt-4 rounded-xl bg-black/15 border border-white/15 px-4 py-3 text-sm text-white/90" aria-hidden="true">
      This is demo interactivity. In production you can connect this CTA to a calendar link, form, or live chat.
    </div>
  </div>
</div>
`;
};

export const agencyTemplates: LayoutTemplate[] = [
  {
    id: "agency-marketing",
    name: "Marketing Agency",
    category: "agency",
    description: "Full-service marketing agency landing",
    tags: ["marketing", "agency", "full"],
    code: wrapInHtmlDoc(`
<nav class="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-950/90 backdrop-blur-lg"><div class="max-w-7xl mx-auto flex items-center justify-between"><a href="#" class="text-xl font-bold text-violet-500">Amplify</a><div class="hidden md:flex items-center gap-6"><a href="#" class="text-sm text-slate-300 hover:text-white">Services</a><a href="#" class="text-sm text-slate-300 hover:text-white">Work</a><a href="#" class="text-sm text-slate-300 hover:text-white">About</a><a href="#" class="text-sm text-slate-300 hover:text-white">Contact</a></div><button class="px-5 py-2 bg-violet-500 text-white text-sm font-medium rounded-full" data-intent="contact.schedule">Let's Talk</button></div></nav>
<section class="min-h-screen flex items-center px-6"><div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center"><div><span class="text-violet-400 font-medium">FULL-SERVICE MARKETING AGENCY</span><h1 class="text-5xl md:text-7xl font-bold mt-4 mb-6 leading-tight">Brands that <span class="text-violet-500">demand</span> attention</h1><p class="text-xl text-slate-400 mb-8">We craft strategies that turn audiences into advocates and clicks into customers.</p><div class="flex gap-4"><button class="px-8 py-4 bg-violet-500 text-white font-medium rounded-full" data-intent="project.start">Start a Project</button><button class="px-8 py-4 border border-white/20 rounded-full hover:bg-white/5" data-intent="portfolio.view">Our Work</button></div></div><div class="relative"><div class="absolute -inset-4 bg-gradient-to-r from-violet-500/20 to-pink-500/20 blur-3xl rounded-full"></div><img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&q=80" alt="" class="relative rounded-2xl"/></div></div></section>
<section class="py-24 px-6"><div class="max-w-7xl mx-auto"><h2 class="text-3xl font-bold text-center mb-4">Our Services</h2><p class="text-slate-400 text-center mb-16 max-w-2xl mx-auto">Full-spectrum marketing solutions tailored to your brand.</p><div class="grid md:grid-cols-3 gap-8"><div class="bg-slate-900 rounded-2xl p-8 border border-white/10 hover:border-violet-500/50 transition"><div class="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center text-xl mb-6">📊</div><h3 class="text-xl font-bold mb-3">Strategy</h3><p class="text-slate-400">Market research, brand positioning, and growth roadmaps.</p></div><div class="bg-slate-900 rounded-2xl p-8 border border-white/10 hover:border-violet-500/50 transition"><div class="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center text-xl mb-6">🎨</div><h3 class="text-xl font-bold mb-3">Creative</h3><p class="text-slate-400">Brand identity, visual design, and content creation.</p></div><div class="bg-slate-900 rounded-2xl p-8 border border-white/10 hover:border-violet-500/50 transition"><div class="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center text-xl mb-6">📱</div><h3 class="text-xl font-bold mb-3">Digital</h3><p class="text-slate-400">SEO, paid media, social, and email marketing.</p></div></div></div></section>
<section class="py-24 px-6 bg-white/5"><div class="max-w-7xl mx-auto"><h2 class="text-3xl font-bold text-center mb-16">Featured Work</h2><div class="grid md:grid-cols-2 gap-8"><div class="group cursor-pointer"><div class="aspect-video bg-slate-800 rounded-2xl overflow-hidden mb-4"><img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/></div><h3 class="font-bold text-lg">TechFlow Rebrand</h3><p class="text-slate-400">Brand Strategy, Design</p></div><div class="group cursor-pointer"><div class="aspect-video bg-slate-800 rounded-2xl overflow-hidden mb-4"><img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/></div><h3 class="font-bold text-lg">Growth Campaign</h3><p class="text-slate-400">Digital Marketing, Content</p></div></div></div></section>
<section class="py-24 px-6"><div class="max-w-5xl mx-auto text-center"><h2 class="text-3xl font-bold mb-16">The Results Speak</h2><div class="grid md:grid-cols-4 gap-8"><div><div class="text-5xl font-bold text-violet-500 mb-2">300%</div><p class="text-slate-400">Average ROI</p></div><div><div class="text-5xl font-bold text-violet-500 mb-2">150+</div><p class="text-slate-400">Clients Served</p></div><div><div class="text-5xl font-bold text-violet-500 mb-2">$50M+</div><p class="text-slate-400">Revenue Generated</p></div><div><div class="text-5xl font-bold text-violet-500 mb-2">12</div><p class="text-slate-400">Industry Awards</p></div></div></div></section>
<section class="py-24 px-6 bg-gradient-to-r from-violet-600 to-pink-600"><div class="max-w-4xl mx-auto text-center"><h2 class="text-4xl font-bold mb-6">Ready to Amplify Your Brand?</h2><p class="text-white/80 text-xl mb-8">Let's build something remarkable together.</p><button class="px-10 py-4 bg-white text-violet-600 font-bold rounded-full" data-intent="project.start">Start Your Project</button></div></section>
${agencyExtras({ brand: 'Amplify', accent: 'violet', cta: 'Start a Project' })}
<footer class="py-16 px-6 border-t border-white/5"><div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12"><div><span class="text-xl font-bold text-violet-500">Amplify</span><p class="text-sm text-slate-500 mt-4 max-w-xs">Full-service marketing agency helping brands stand out.</p></div><div class="flex gap-12 text-sm"><div><h5 class="font-bold mb-4">Services</h5><ul class="space-y-2 text-slate-400"><li>Strategy</li><li>Branding</li><li>Digital</li></ul></div><div><h5 class="font-bold mb-4">Company</h5><ul class="space-y-2 text-slate-400"><li>About</li><li>Careers</li><li>Contact</li></ul></div></div></div></footer>
    `, "Marketing Agency"),
  },
  {
    id: "agency-creative",
    name: "Creative Studio",
    category: "agency",
    description: "Bold creative studio landing",
    tags: ["creative", "studio", "full"],
    code: wrapInHtmlDoc(`
<nav class="fixed top-0 left-0 right-0 z-50 px-6 py-6"><div class="max-w-7xl mx-auto flex items-center justify-between"><a href="#" class="text-xl font-bold">STUDIO</a><div class="hidden md:flex items-center gap-8"><a href="#" class="text-sm text-slate-300 hover:text-white">Work</a><a href="#" class="text-sm text-slate-300 hover:text-white">About</a><a href="#" class="text-sm text-slate-300 hover:text-white">Contact</a></div><button class="px-5 py-2 border border-white text-sm font-medium">Hire Us</button></div></nav>
<section class="min-h-screen flex items-center px-6 relative overflow-hidden"><div class="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-cyan-500/10"></div><div class="relative z-10 max-w-6xl mx-auto"><h1 class="text-6xl md:text-[8rem] font-bold leading-none tracking-tighter">WE CREATE<br/><span class="bg-gradient-to-r from-rose-500 to-cyan-500 bg-clip-text text-transparent">BOLD</span> WORK</h1><p class="text-xl text-slate-400 mt-8 max-w-lg">A creative studio for brands that refuse to blend in. Design, Motion, Digital.</p><button class="mt-8 px-8 py-4 bg-white text-black font-bold">View Projects →</button></div></section>
<section class="py-32 px-6"><div class="max-w-7xl mx-auto"><h2 class="text-sm font-bold text-slate-500 mb-8">SELECTED WORK</h2><div class="space-y-24"><div class="grid md:grid-cols-2 gap-12 items-center"><img src="https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=600&q=80" alt="" class="rounded-2xl"/><div><span class="text-rose-500 text-sm font-bold">01</span><h3 class="text-4xl font-bold mt-2 mb-4">Neon Dreams</h3><p class="text-slate-400 mb-6">Brand identity and digital campaign for a music festival.</p><a href="#" class="text-sm font-bold border-b border-white pb-1">View Project</a></div></div><div class="grid md:grid-cols-2 gap-12 items-center"><div><span class="text-cyan-500 text-sm font-bold">02</span><h3 class="text-4xl font-bold mt-2 mb-4">Motion Flow</h3><p class="text-slate-400 mb-6">Motion design system for a fitness tech company.</p><a href="#" class="text-sm font-bold border-b border-white pb-1">View Project</a></div><img src="https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600&q=80" alt="" class="rounded-2xl"/></div></div></div></section>
<section class="py-24 px-6 bg-white/5"><div class="max-w-5xl mx-auto"><h2 class="text-3xl font-bold mb-12 text-center">What We Do</h2><div class="grid md:grid-cols-3 gap-12 text-center"><div><h3 class="text-6xl font-bold bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent mb-4">01</h3><h4 class="font-bold text-xl mb-2">Brand Identity</h4><p class="text-slate-400">Logos, guidelines, visual systems</p></div><div><h3 class="text-6xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent mb-4">02</h3><h4 class="font-bold text-xl mb-2">Motion Design</h4><p class="text-slate-400">Animation, video, 3D</p></div><div><h3 class="text-6xl font-bold bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent mb-4">03</h3><h4 class="font-bold text-xl mb-2">Digital</h4><p class="text-slate-400">Websites, apps, experiences</p></div></div></div></section>
<section class="py-32 px-6"><div class="max-w-4xl mx-auto text-center"><h2 class="text-5xl md:text-6xl font-bold mb-8">Let's make something incredible.</h2><button class="px-12 py-5 bg-gradient-to-r from-rose-500 to-cyan-500 text-white font-bold rounded-full text-lg">Start a Conversation</button></div></section>
${agencyExtras({ brand: 'STUDIO', accent: 'rose', cta: 'Hire Us' })}
<footer class="py-12 px-6 border-t border-white/5"><div class="max-w-7xl mx-auto flex justify-between items-center"><span class="font-bold">STUDIO</span><div class="flex gap-6 text-sm text-slate-500"><a href="#" class="hover:text-white">Instagram</a><a href="#" class="hover:text-white">Dribbble</a><a href="#" class="hover:text-white">LinkedIn</a></div></div></footer>
    `, "Creative Studio"),
  },
  {
    id: "agency-consulting",
    name: "Consulting Firm",
    category: "agency",
    description: "Professional consulting firm landing",
    tags: ["consulting", "business", "full"],
    code: wrapInHtmlDoc(`
<nav class="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-950/90 backdrop-blur-lg border-b border-white/5"><div class="max-w-6xl mx-auto flex items-center justify-between"><a href="#" class="text-xl font-bold">Stratix</a><div class="hidden md:flex items-center gap-6"><a href="#" class="text-sm text-slate-300 hover:text-white">Services</a><a href="#" class="text-sm text-slate-300 hover:text-white">Industries</a><a href="#" class="text-sm text-slate-300 hover:text-white">Insights</a><a href="#" class="text-sm text-slate-300 hover:text-white">About</a></div><button class="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded">Contact Us</button></div></nav>
<section class="pt-32 pb-24 px-6"><div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center"><div><span class="text-blue-400 font-medium text-sm">STRATEGIC CONSULTING</span><h1 class="text-5xl md:text-6xl font-bold mt-4 mb-6 leading-tight">Transforming vision into measurable results</h1><p class="text-xl text-slate-400 mb-8">We partner with organizations to solve complex challenges and drive sustainable growth.</p><button class="px-8 py-4 bg-blue-600 text-white font-medium rounded">Schedule Consultation</button></div><img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&q=80" alt="" class="rounded-xl"/></div></section>
<section class="py-24 px-6 bg-white/5"><div class="max-w-6xl mx-auto"><h2 class="text-3xl font-bold text-center mb-16">Our Practice Areas</h2><div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6"><div class="bg-slate-900 rounded-xl p-6 border border-white/10 hover:border-blue-500/50 transition"><h3 class="font-bold mb-3">Strategy</h3><p class="text-slate-400 text-sm">Corporate strategy, market entry, growth planning.</p></div><div class="bg-slate-900 rounded-xl p-6 border border-white/10 hover:border-blue-500/50 transition"><h3 class="font-bold mb-3">Operations</h3><p class="text-slate-400 text-sm">Process optimization, supply chain, efficiency.</p></div><div class="bg-slate-900 rounded-xl p-6 border border-white/10 hover:border-blue-500/50 transition"><h3 class="font-bold mb-3">Digital</h3><p class="text-slate-400 text-sm">Digital transformation, technology strategy.</p></div><div class="bg-slate-900 rounded-xl p-6 border border-white/10 hover:border-blue-500/50 transition"><h3 class="font-bold mb-3">M&A</h3><p class="text-slate-400 text-sm">Due diligence, integration, value creation.</p></div></div></div></section>
<section class="py-24 px-6"><div class="max-w-5xl mx-auto"><h2 class="text-3xl font-bold text-center mb-16">Proven Impact</h2><div class="grid md:grid-cols-3 gap-12 text-center"><div><div class="text-5xl font-bold text-blue-500 mb-2">$10B+</div><p class="text-slate-400">Value created for clients</p></div><div><div class="text-5xl font-bold text-blue-500 mb-2">500+</div><p class="text-slate-400">Engagements completed</p></div><div><div class="text-5xl font-bold text-blue-500 mb-2">40+</div><p class="text-slate-400">Countries served</p></div></div></div></section>
<section class="py-24 px-6 bg-white/5"><div class="max-w-4xl mx-auto"><h2 class="text-3xl font-bold text-center mb-12">Client Perspectives</h2><div class="bg-slate-900 rounded-2xl p-8 border border-white/10"><blockquote class="text-xl text-slate-300 mb-6 leading-relaxed">"Stratix helped us navigate a complex market entry strategy that exceeded our projections by 40%. Their team's expertise and dedication were invaluable."</blockquote><div class="flex items-center gap-4"><div class="w-12 h-12 bg-slate-700 rounded-full"></div><div><div class="font-bold">Michael Chen</div><div class="text-sm text-slate-400">CEO, TechVentures Inc</div></div></div></div></div></section>
<section class="py-16 px-6 bg-blue-600"><div class="max-w-4xl mx-auto text-center"><h2 class="text-3xl font-bold mb-6">Ready to Transform Your Business?</h2><p class="text-blue-100 mb-8">Let's discuss how we can help you achieve your goals.</p><button class="px-10 py-4 bg-white text-blue-600 font-bold rounded">Schedule a Call</button></div></section>
${agencyExtras({ brand: 'Stratix', accent: 'blue', cta: 'Schedule a Call' })}
<footer class="py-16 px-6 border-t border-white/5"><div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12"><div><span class="text-xl font-bold">Stratix</span><p class="text-sm text-slate-500 mt-4">Global consulting for ambitious organizations.</p></div><div class="flex gap-12 text-sm"><div><h5 class="font-bold mb-4">Practices</h5><ul class="space-y-2 text-slate-400"><li>Strategy</li><li>Operations</li><li>Digital</li></ul></div><div><h5 class="font-bold mb-4">Company</h5><ul class="space-y-2 text-slate-400"><li>About</li><li>Careers</li><li>Contact</li></ul></div></div></div></footer>
    `, "Consulting Firm"),
  },
  {
    id: "agency-digital",
    name: "Digital Agency",
    category: "agency",
    description: "Web and app development agency landing",
    tags: ["digital", "web", "full"],
    code: wrapInHtmlDoc(`
<nav class="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-950/90 backdrop-blur-lg"><div class="max-w-7xl mx-auto flex items-center justify-between"><a href="#" class="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Pixel Labs</a><div class="hidden md:flex items-center gap-6"><a href="#" class="text-sm text-slate-300 hover:text-white">Services</a><a href="#" class="text-sm text-slate-300 hover:text-white">Portfolio</a><a href="#" class="text-sm text-slate-300 hover:text-white">Process</a><a href="#" class="text-sm text-slate-300 hover:text-white">Contact</a></div><button class="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium rounded-full">Get Quote</button></div></nav>
<section class="min-h-screen flex items-center px-6 relative overflow-hidden"><div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl"></div><div class="relative z-10 max-w-4xl mx-auto text-center"><span class="text-cyan-400 font-medium">DIGITAL AGENCY</span><h1 class="text-5xl md:text-7xl font-bold mt-4 mb-6">We Build Digital Products That Matter</h1><p class="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">Websites, web apps, and mobile apps crafted with precision and purpose.</p><div class="flex gap-4 justify-center"><button class="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full">Start a Project</button><button class="px-8 py-4 border border-white/20 rounded-full">See Our Work</button></div></div></section>
<section class="py-24 px-6"><div class="max-w-6xl mx-auto"><h2 class="text-3xl font-bold text-center mb-16">Our Services</h2><div class="grid md:grid-cols-3 gap-8"><div class="bg-slate-900 rounded-2xl p-8 border border-white/10"><div class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-xl mb-6">🌐</div><h3 class="text-xl font-bold mb-3">Web Development</h3><p class="text-slate-400 mb-4">Custom websites and web applications built with modern technologies.</p><ul class="text-sm text-slate-500 space-y-1"><li>• React / Next.js</li><li>• Node.js / Python</li><li>• Headless CMS</li></ul></div><div class="bg-slate-900 rounded-2xl p-8 border border-white/10"><div class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-xl mb-6">📱</div><h3 class="text-xl font-bold mb-3">Mobile Apps</h3><p class="text-slate-400 mb-4">Native and cross-platform apps for iOS and Android.</p><ul class="text-sm text-slate-500 space-y-1"><li>• React Native</li><li>• Flutter</li><li>• Native iOS/Android</li></ul></div><div class="bg-slate-900 rounded-2xl p-8 border border-white/10"><div class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-xl mb-6">🎨</div><h3 class="text-xl font-bold mb-3">UI/UX Design</h3><p class="text-slate-400 mb-4">User-centered design that drives engagement.</p><ul class="text-sm text-slate-500 space-y-1"><li>• Wireframes</li><li>• Prototypes</li><li>• Design Systems</li></ul></div></div></div></section>
<section class="py-24 px-6 bg-white/5"><div class="max-w-6xl mx-auto"><h2 class="text-3xl font-bold text-center mb-16">Recent Projects</h2><div class="grid md:grid-cols-3 gap-6"><div class="group cursor-pointer"><div class="aspect-[4/3] bg-slate-800 rounded-xl overflow-hidden mb-4"><img src="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&q=80" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/></div><h3 class="font-bold">Fintech Dashboard</h3><p class="text-slate-400 text-sm">Web App</p></div><div class="group cursor-pointer"><div class="aspect-[4/3] bg-slate-800 rounded-xl overflow-hidden mb-4"><img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/></div><h3 class="font-bold">Fitness Mobile App</h3><p class="text-slate-400 text-sm">iOS & Android</p></div><div class="group cursor-pointer"><div class="aspect-[4/3] bg-slate-800 rounded-xl overflow-hidden mb-4"><img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/></div><h3 class="font-bold">E-commerce Platform</h3><p class="text-slate-400 text-sm">Web Development</p></div></div></div></section>
<section class="py-24 px-6"><div class="max-w-4xl mx-auto text-center"><h2 class="text-3xl font-bold mb-12">Our Process</h2><div class="grid md:grid-cols-4 gap-8"><div><div class="w-14 h-14 bg-cyan-500/20 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">💡</div><h3 class="font-bold">Discovery</h3></div><div><div class="w-14 h-14 bg-cyan-500/20 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">✏️</div><h3 class="font-bold">Design</h3></div><div><div class="w-14 h-14 bg-cyan-500/20 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">⚙️</div><h3 class="font-bold">Develop</h3></div><div><div class="w-14 h-14 bg-cyan-500/20 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">🚀</div><h3 class="font-bold">Launch</h3></div></div></div></section>
<section class="py-16 px-6 bg-gradient-to-r from-cyan-600 to-blue-600"><div class="max-w-4xl mx-auto text-center"><h2 class="text-3xl font-bold mb-6">Have a Project in Mind?</h2><p class="text-white/80 mb-8">Let's build something amazing together.</p><button class="px-10 py-4 bg-white text-blue-600 font-bold rounded-full">Get a Free Quote</button></div></section>
${agencyExtras({ brand: 'Pixel Labs', accent: 'cyan', cta: 'Get a Free Quote' })}
<footer class="py-12 px-6 border-t border-white/5"><div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6"><span class="font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Pixel Labs</span><div class="flex gap-6 text-sm text-slate-500"><a href="#">Twitter</a><a href="#">LinkedIn</a><a href="#">GitHub</a></div></div></footer>
    `, "Digital Agency"),
  },
  {
    id: "agency-design",
    name: "Design Collective",
    category: "agency",
    description: "Minimal design studio landing",
    tags: ["design", "minimal", "full"],
    code: wrapInHtmlDoc(`
<nav class="fixed top-0 left-0 right-0 z-50 px-8 py-6 bg-white/90 backdrop-blur-lg"><div class="max-w-6xl mx-auto flex items-center justify-between"><a href="#" class="text-xl font-bold text-slate-900">forma.</a><div class="hidden md:flex items-center gap-8"><a href="#" class="text-sm text-slate-600 hover:text-slate-900">Work</a><a href="#" class="text-sm text-slate-600 hover:text-slate-900">Services</a><a href="#" class="text-sm text-slate-600 hover:text-slate-900">Studio</a></div><button class="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-full">Contact</button></div></nav>
<section class="min-h-screen flex items-center px-8 bg-white"><div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center"><div><h1 class="text-5xl md:text-7xl font-bold text-slate-900 leading-tight">Design that speaks volumes.</h1><p class="text-xl text-slate-500 mt-6 mb-8">A collective of designers crafting timeless brand experiences.</p><button class="px-8 py-4 bg-slate-900 text-white font-medium rounded-full">Explore Our Work</button></div><img src="https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=500&q=80" alt="" class="rounded-2xl"/></div></section>
<section class="py-24 px-8 bg-slate-50"><div class="max-w-6xl mx-auto"><h2 class="text-sm font-bold text-slate-400 mb-12">SELECTED PROJECTS</h2><div class="space-y-16"><div class="grid md:grid-cols-2 gap-12 items-center"><img src="https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=500&q=80" alt="" class="rounded-xl aspect-[4/3] object-cover"/><div><span class="text-sm text-slate-400">Brand Identity</span><h3 class="text-3xl font-bold text-slate-900 mt-2 mb-4">Lumen Labs</h3><p class="text-slate-500">Complete brand identity for a sustainable lighting company.</p></div></div><div class="grid md:grid-cols-2 gap-12 items-center"><div class="md:order-2"><span class="text-sm text-slate-400">Editorial Design</span><h3 class="text-3xl font-bold text-slate-900 mt-2 mb-4">Arc Magazine</h3><p class="text-slate-500">Art direction and layout for a quarterly design publication.</p></div><img src="https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500&q=80" alt="" class="rounded-xl aspect-[4/3] object-cover md:order-1"/></div></div></div></section>
<section class="py-24 px-8 bg-white"><div class="max-w-4xl mx-auto"><h2 class="text-3xl font-bold text-slate-900 text-center mb-16">What We Do</h2><div class="grid md:grid-cols-2 gap-12"><div class="border-t-2 border-slate-900 pt-6"><h3 class="font-bold text-slate-900 text-xl mb-2">Brand Identity</h3><p class="text-slate-500">Logos, visual systems, and guidelines that define your brand.</p></div><div class="border-t-2 border-slate-900 pt-6"><h3 class="font-bold text-slate-900 text-xl mb-2">Editorial & Print</h3><p class="text-slate-500">Publications, packaging, and printed materials.</p></div><div class="border-t-2 border-slate-900 pt-6"><h3 class="font-bold text-slate-900 text-xl mb-2">Digital Design</h3><p class="text-slate-500">Websites, apps, and digital experiences.</p></div><div class="border-t-2 border-slate-900 pt-6"><h3 class="font-bold text-slate-900 text-xl mb-2">Art Direction</h3><p class="text-slate-500">Photography, campaigns, and creative direction.</p></div></div></div></section>
<section class="py-24 px-8 bg-slate-900 text-white"><div class="max-w-4xl mx-auto text-center"><h2 class="text-4xl font-bold mb-6">Let's create together.</h2><p class="text-slate-400 mb-8">We'd love to hear about your project.</p><button class="px-10 py-4 bg-white text-slate-900 font-medium rounded-full">Get in Touch</button></div></section>
${agencyExtras({ brand: 'forma', accent: 'slate', cta: 'Contact' })}
<footer class="py-12 px-8 bg-white border-t border-slate-100"><div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6"><span class="font-bold text-slate-900">forma.</span><p class="text-sm text-slate-400">© 2024 Forma Design Collective</p></div></footer>
    `, "Design Collective"),
  },
];
