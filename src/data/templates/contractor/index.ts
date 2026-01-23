import { LayoutTemplate } from '../types';
import { wrapInHtmlDoc } from '../utils';

const contractorExtras = (opts: {
  brand: string;
  accent: 'amber' | 'blue' | 'yellow' | 'emerald' | 'orange';
  headline: string;
  cta: string;
}) => {
  const safeId = opts.brand.replace(/\s+/g, '-').toLowerCase();
  const stickyKey = `contractor-${safeId}-${opts.accent}`;
  const ctaGradient =
    opts.accent === 'blue'
      ? 'from-blue-600 to-indigo-600'
      : opts.accent === 'yellow'
        ? 'from-yellow-500 to-amber-500'
        : opts.accent === 'emerald'
          ? 'from-emerald-500 to-lime-500'
          : opts.accent === 'orange'
            ? 'from-orange-500 to-rose-500'
            : 'from-amber-500 to-orange-500';

  const icon =
    opts.accent === 'blue'
      ? '🛠️'
      : opts.accent === 'yellow'
        ? '⚡'
        : opts.accent === 'emerald'
          ? '🌿'
          : opts.accent === 'orange'
            ? '🔧'
            : '🏗️';

  return `
<section class="py-20 px-6 bg-white/5">
  <div class="max-w-6xl mx-auto">
    <div class="grid lg:grid-cols-3 gap-10 items-start">
      <div class="lg:col-span-2">
        <div class="flex items-end justify-between gap-6 mb-8">
          <div>
            <h2 class="text-2xl md:text-3xl font-bold">Questions, answered</h2>
            <p class="text-slate-400 mt-2">Everything clients ask before booking.</p>
          </div>
          <span class="hidden md:inline-flex px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-slate-300 tracking-wider">INTERACTIVE FAQ</span>
        </div>
        <div class="space-y-3">
          <details class="group rounded-2xl border border-white/10 bg-slate-900/50 p-5">
            <summary class="flex items-center justify-between gap-4 tw-focus">
              <span class="font-semibold">Are you licensed and insured?</span>
              <span class="text-slate-400 group-open:rotate-45 transition">+</span>
            </summary>
            <div class="mt-3 text-sm text-slate-400">Yes—fully licensed and insured. Proof available upon request for peace of mind.</div>
          </details>
          <details class="group rounded-2xl border border-white/10 bg-slate-900/50 p-5">
            <summary class="flex items-center justify-between gap-4 tw-focus">
              <span class="font-semibold">Do you offer warranties?</span>
              <span class="text-slate-400 group-open:rotate-45 transition">+</span>
            </summary>
            <div class="mt-3 text-sm text-slate-400">We stand behind our work with a workmanship warranty. Materials follow manufacturer warranties.</div>
          </details>
          <details class="group rounded-2xl border border-white/10 bg-slate-900/50 p-5">
            <summary class="flex items-center justify-between gap-4 tw-focus">
              <span class="font-semibold">How soon can you come out?</span>
              <span class="text-slate-400 group-open:rotate-45 transition">+</span>
            </summary>
            <div class="mt-3 text-sm text-slate-400">Many jobs can be scheduled within 24–72 hours. Emergency slots are available depending on the service.</div>
          </details>
          <details class="group rounded-2xl border border-white/10 bg-slate-900/50 p-5">
            <summary class="flex items-center justify-between gap-4 tw-focus">
              <span class="font-semibold">Do you provide written estimates?</span>
              <span class="text-slate-400 group-open:rotate-45 transition">+</span>
            </summary>
            <div class="mt-3 text-sm text-slate-400">Yes—clear, itemized estimates. If scope changes, we confirm before proceeding.</div>
          </details>
        </div>
      </div>

      <aside class="rounded-3xl border border-white/10 bg-slate-900/50 p-8" data-demo-form-host>
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-xs tracking-widest text-slate-500">FAST QUOTE</div>
            <h3 class="text-xl font-bold mt-2">${opts.headline}</h3>
            <p class="text-sm text-slate-400 mt-2">Tell us what you need—get a same-day callback.</p>
          </div>
          <div class="text-2xl">${icon}</div>
        </div>

        <form class="mt-6 space-y-3" data-demo-form data-demo-message="Request received! We'll reach out shortly with next steps.">
          <label class="block text-sm text-slate-400">Service type</label>
          <select class="w-full px-4 py-3 rounded-xl bg-slate-950/40 border border-white/10 outline-none tw-focus">
            <option>Estimate / Quote</option>
            <option>Emergency</option>
            <option>Maintenance</option>
            <option>Inspection</option>
          </select>
          <div class="grid grid-cols-2 gap-3">
            <input class="px-4 py-3 rounded-xl bg-slate-950/40 border border-white/10 outline-none tw-focus" placeholder="Name" required />
            <input class="px-4 py-3 rounded-xl bg-slate-950/40 border border-white/10 outline-none tw-focus" placeholder="Phone" required />
          </div>
          <button type="submit" class="w-full px-4 py-3 rounded-xl bg-gradient-to-r ${ctaGradient} text-black font-bold tw-focus" data-intent="quote.request">${opts.cta}</button>
          <p class="text-xs text-slate-500">Demo form — wire to your CRM in production.</p>
        </form>
      </aside>
    </div>
  </div>
</section>

<div class="fixed bottom-4 left-4 right-4 z-50" data-sticky data-sticky-key="${stickyKey}" aria-hidden="false">
  <div class="relative max-w-5xl mx-auto rounded-2xl border border-white/10 bg-gradient-to-r ${ctaGradient} px-5 py-4 shadow-2xl shadow-black/30">
    <button type="button" aria-label="Hide sticky bar" class="absolute top-1.5 right-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/10 text-black/90 hover:bg-black/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30" data-dismiss="closest" data-dismiss-key="${stickyKey}">
      <span aria-hidden="true" class="text-sm leading-none">✕</span>
    </button>
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div class="text-xs tracking-widest text-black/70">BOOK TODAY</div>
        <div class="text-lg font-extrabold text-black">${opts.brand}: ${opts.headline}</div>
        <div class="text-sm text-black/70">Fast scheduling • Clear pricing • Quality workmanship</div>
      </div>
      <div class="flex gap-3">
        <button class="px-4 py-2 rounded-xl bg-black/10 hover:bg-black/15 border border-black/10 text-sm font-semibold tw-focus" data-toggle="#demo-sticky-${safeId}" data-intent="none">Details</button>
        <button class="px-5 py-2 rounded-xl bg-black text-white text-sm font-bold tw-focus" data-intent="quote.request">${opts.cta}</button>
      </div>
    </div>
    <div id="demo-sticky-${safeId}" class="hidden mt-4 rounded-xl bg-black/10 border border-black/10 px-4 py-3 text-sm text-black/80" aria-hidden="true">
      Tip: connect this CTA to a booking flow, phone dialer, or quote form.
    </div>
  </div>
</div>
`;
};

export const contractorTemplates: LayoutTemplate[] = [
  {
    id: "contractor-construction",
    name: "Construction Company",
    category: "contractor",
    description: "Professional construction company landing",
    tags: ["construction", "builder", "full"],
    code: wrapInHtmlDoc(`
<nav class="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-950/90 backdrop-blur-lg"><div class="max-w-7xl mx-auto flex items-center justify-between"><a href="#" class="text-xl font-bold text-amber-500">BuildPro</a><div class="hidden md:flex items-center gap-6"><a href="#" class="text-sm text-slate-300 hover:text-white">Services</a><a href="#" class="text-sm text-slate-300 hover:text-white">Projects</a><a href="#" class="text-sm text-slate-300 hover:text-white">About</a><a href="#" class="text-sm text-slate-300 hover:text-white">Contact</a></div><button class="px-5 py-2 bg-amber-500 text-black text-sm font-bold rounded" data-intent="quote.request">Get Quote</button></div></nav>
<section class="min-h-screen flex items-center px-6 relative"><div class="absolute inset-0"><img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80" alt="" class="w-full h-full object-cover opacity-30"/></div><div class="relative z-10 max-w-3xl"><span class="text-amber-500 font-bold">SINCE 1985</span><h1 class="text-5xl md:text-7xl font-bold mt-4 mb-6">Building Excellence</h1><p class="text-xl text-slate-300 mb-8">Commercial & residential construction with over 35 years of trusted experience.</p><div class="flex gap-4"><button class="px-8 py-4 bg-amber-500 text-black font-bold rounded" data-intent="quote.request">Free Estimate</button><button class="px-8 py-4 border border-white/30 rounded" data-intent="portfolio.view">View Projects</button></div></div></section>
<section class="py-24 px-6"><div class="max-w-7xl mx-auto"><h2 class="text-3xl font-bold text-center mb-16">Our Services</h2><div class="grid md:grid-cols-3 gap-8"><div class="bg-slate-900 rounded-2xl p-8 border border-white/10"><div class="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center text-2xl mb-6">🏗️</div><h3 class="text-xl font-bold mb-3">Commercial Construction</h3><p class="text-slate-400">Office buildings, retail spaces, industrial facilities built to specification.</p></div><div class="bg-slate-900 rounded-2xl p-8 border border-white/10"><div class="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center text-2xl mb-6">🏠</div><h3 class="text-xl font-bold mb-3">Residential Building</h3><p class="text-slate-400">Custom homes and multi-family dwellings with quality craftsmanship.</p></div><div class="bg-slate-900 rounded-2xl p-8 border border-white/10"><div class="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center text-2xl mb-6">🔨</div><h3 class="text-xl font-bold mb-3">Renovations</h3><p class="text-slate-400">Complete remodeling and restoration services for any property.</p></div></div></div></section>
<section class="py-24 px-6 bg-white/5"><div class="max-w-7xl mx-auto"><h2 class="text-3xl font-bold text-center mb-16">Featured Projects</h2><div class="grid md:grid-cols-3 gap-8"><div class="group cursor-pointer"><div class="aspect-[4/3] rounded-xl overflow-hidden mb-4"><img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/></div><h3 class="font-bold">Downtown Office Tower</h3><p class="text-slate-400 text-sm">Commercial - 50 floors</p></div><div class="group cursor-pointer"><div class="aspect-[4/3] rounded-xl overflow-hidden mb-4"><img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/></div><h3 class="font-bold">Luxury Residence</h3><p class="text-slate-400 text-sm">Residential - 8,500 sq ft</p></div><div class="group cursor-pointer"><div class="aspect-[4/3] rounded-xl overflow-hidden mb-4"><img src="https://images.unsplash.com/photo-1554435493-93422e8d1e64?w=400&q=80" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/></div><h3 class="font-bold">Shopping Center</h3><p class="text-slate-400 text-sm">Retail - 120,000 sq ft</p></div></div></div></section>
<section class="py-24 px-6"><div class="max-w-5xl mx-auto grid md:grid-cols-4 gap-8 text-center"><div><div class="text-4xl font-bold text-amber-500">500+</div><p class="text-slate-400">Projects Completed</p></div><div><div class="text-4xl font-bold text-amber-500">35</div><p class="text-slate-400">Years Experience</p></div><div><div class="text-4xl font-bold text-amber-500">150</div><p class="text-slate-400">Team Members</p></div><div><div class="text-4xl font-bold text-amber-500">98%</div><p class="text-slate-400">Client Satisfaction</p></div></div></section>
<section class="py-24 px-6 bg-amber-500 text-black"><div class="max-w-4xl mx-auto text-center"><h2 class="text-3xl font-bold mb-6">Ready to Start Your Project?</h2><p class="text-black/70 text-xl mb-8">Get a free consultation and estimate from our experts.</p><form data-intent="quote.request" class="flex flex-col md:flex-row gap-4 justify-center"><input type="text" name="name" placeholder="Your name" class="px-6 py-4 rounded-lg outline-none"/><input type="tel" name="phone" placeholder="Phone number" class="px-6 py-4 rounded-lg outline-none"/><button class="px-8 py-4 bg-black text-white font-bold rounded-lg" data-intent="quote.request">Get Free Quote</button></form></div></section>
${contractorExtras({ brand: 'BuildPro', accent: 'amber', headline: 'Get a free estimate', cta: 'Request Quote' })}
<footer class="py-16 px-6 border-t border-white/5"><div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12"><div><span class="text-xl font-bold text-amber-500">BuildPro</span><p class="text-sm text-slate-500 mt-4">Quality construction since 1985.</p><p class="text-sm text-slate-400 mt-2">123 Construction Way, NY</p><p class="text-sm text-slate-400">(555) 123-4567</p></div><div class="flex gap-12 text-sm"><div><h5 class="font-bold mb-4">Services</h5><ul class="space-y-2 text-slate-400"><li>Commercial</li><li>Residential</li><li>Renovations</li></ul></div><div><h5 class="font-bold mb-4">Company</h5><ul class="space-y-2 text-slate-400"><li>About</li><li>Careers</li><li>Contact</li></ul></div></div></div></footer>
    `, "Construction Company"),
  },
  {
    id: "contractor-plumber",
    name: "Plumbing Services",
    category: "contractor",
    description: "Professional plumbing service landing",
    tags: ["plumber", "plumbing", "full"],
    code: wrapInHtmlDoc(`
<nav class="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-blue-900/95 backdrop-blur-lg"><div class="max-w-6xl mx-auto flex items-center justify-between"><a href="#" class="text-xl font-bold">FastFlow Plumbing</a><div class="hidden md:flex items-center gap-6"><a href="#" class="text-sm text-blue-200 hover:text-white">Services</a><a href="#" class="text-sm text-blue-200 hover:text-white">About</a><a href="#" class="text-sm text-blue-200 hover:text-white">Reviews</a></div><div class="flex items-center gap-3"><span class="text-sm text-blue-200">(555) 789-0123</span><button class="px-5 py-2 bg-white text-blue-900 text-sm font-bold rounded">Emergency</button></div></div></nav>
<section class="pt-24 pb-16 px-6 bg-gradient-to-b from-blue-900 to-slate-950"><div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center"><div><span class="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">24/7 EMERGENCY SERVICE</span><h1 class="text-5xl md:text-6xl font-bold mt-4 mb-6">Your Local Plumbing Experts</h1><p class="text-xl text-blue-100 mb-8">Fast, reliable service for all your plumbing needs. Licensed & insured professionals.</p><div class="flex gap-4"><button class="px-8 py-4 bg-white text-blue-900 font-bold rounded-xl">Book Now</button><button class="px-8 py-4 bg-blue-500 font-bold rounded-xl">Call Us</button></div><div class="mt-8 flex items-center gap-6"><div class="flex items-center gap-2"><span class="text-2xl">⭐</span><span class="font-bold">4.9/5</span></div><span class="text-blue-200">500+ Reviews</span></div></div><img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80" alt="Plumber" class="rounded-2xl"/></div></section>
<section class="py-24 px-6"><div class="max-w-6xl mx-auto"><h2 class="text-3xl font-bold text-center mb-16">Our Services</h2><div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6"><div class="bg-slate-900 rounded-2xl p-6 border border-white/10 text-center"><div class="text-4xl mb-4">🚿</div><h3 class="font-bold mb-2">Drain Cleaning</h3><p class="text-slate-400 text-sm">Clogged drains cleared fast</p></div><div class="bg-slate-900 rounded-2xl p-6 border border-white/10 text-center"><div class="text-4xl mb-4">🔧</div><h3 class="font-bold mb-2">Repairs</h3><p class="text-slate-400 text-sm">Fix any plumbing issue</p></div><div class="bg-slate-900 rounded-2xl p-6 border border-white/10 text-center"><div class="text-4xl mb-4">🚰</div><h3 class="font-bold mb-2">Installation</h3><p class="text-slate-400 text-sm">New fixtures & appliances</p></div><div class="bg-slate-900 rounded-2xl p-6 border border-white/10 text-center"><div class="text-4xl mb-4">🚨</div><h3 class="font-bold mb-2">Emergency</h3><p class="text-slate-400 text-sm">24/7 urgent response</p></div></div></div></section>
<section class="py-24 px-6 bg-white/5"><div class="max-w-5xl mx-auto"><h2 class="text-3xl font-bold text-center mb-16">Why Choose Us</h2><div class="grid md:grid-cols-3 gap-8"><div class="text-center"><div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">✓</div><h3 class="font-bold text-xl mb-2">Licensed & Insured</h3><p class="text-slate-400">Fully certified professionals you can trust.</p></div><div class="text-center"><div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">⚡</div><h3 class="font-bold text-xl mb-2">Same-Day Service</h3><p class="text-slate-400">Fast response, often within 1 hour.</p></div><div class="text-center"><div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">💰</div><h3 class="font-bold text-xl mb-2">Upfront Pricing</h3><p class="text-slate-400">No hidden fees or surprise charges.</p></div></div></div></section>
<section class="py-24 px-6"><div class="max-w-4xl mx-auto"><h2 class="text-3xl font-bold text-center mb-12">Customer Reviews</h2><div class="grid md:grid-cols-2 gap-8"><div class="bg-slate-900 rounded-2xl p-6 border border-white/10"><div class="flex gap-1 text-amber-400 mb-3">⭐⭐⭐⭐⭐</div><p class="text-slate-300 mb-4">"They came within 30 minutes and fixed our burst pipe. Excellent service!"</p><span class="text-sm text-slate-500">- Mike T.</span></div><div class="bg-slate-900 rounded-2xl p-6 border border-white/10"><div class="flex gap-1 text-amber-400 mb-3">⭐⭐⭐⭐⭐</div><p class="text-slate-300 mb-4">"Professional, clean, and affordable. Will definitely use again."</p><span class="text-sm text-slate-500">- Sarah K.</span></div></div></div></section>
<section class="py-16 px-6 bg-blue-600"><div class="max-w-4xl mx-auto text-center"><h2 class="text-3xl font-bold mb-4">Need a Plumber Now?</h2><p class="text-blue-100 mb-8">Call us 24/7 or book online for fast service.</p><div class="flex flex-col md:flex-row gap-4 justify-center"><button class="px-10 py-4 bg-white text-blue-600 font-bold rounded-xl text-lg">(555) 789-0123</button><button class="px-10 py-4 bg-black text-white font-bold rounded-xl text-lg">Book Online</button></div></div></section>
${contractorExtras({ brand: 'FastFlow Plumbing', accent: 'blue', headline: 'Schedule a service call', cta: 'Book Service' })}
<footer class="py-12 px-6 border-t border-white/5"><div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6"><span class="font-bold">FastFlow Plumbing</span><p class="text-sm text-slate-500">Licensed | Insured | Available 24/7</p></div></footer>
    `, "Plumbing Services"),
  },
  {
    id: "contractor-electrician",
    name: "Electrical Services",
    category: "contractor",
    description: "Professional electrician landing",
    tags: ["electrician", "electrical", "full"],
    code: wrapInHtmlDoc(`
<nav class="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-950/90 backdrop-blur-lg border-b border-yellow-500/20"><div class="max-w-6xl mx-auto flex items-center justify-between"><a href="#" class="text-xl font-bold text-yellow-500">PowerUp Electric</a><div class="hidden md:flex items-center gap-6"><a href="#" class="text-sm text-slate-300 hover:text-white">Services</a><a href="#" class="text-sm text-slate-300 hover:text-white">About</a><a href="#" class="text-sm text-slate-300 hover:text-white">Contact</a></div><button class="px-5 py-2 bg-yellow-500 text-black text-sm font-bold rounded">Get Quote</button></div></nav>
<section class="pt-24 pb-16 px-6"><div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center"><div><span class="text-yellow-500 font-bold text-sm">LICENSED ELECTRICIANS</span><h1 class="text-5xl md:text-6xl font-bold mt-2 mb-6">Safe & Reliable Electrical Work</h1><p class="text-xl text-slate-400 mb-8">Residential & commercial electrical services. 25+ years of trusted experience.</p><div class="flex gap-4 mb-8"><button class="px-8 py-4 bg-yellow-500 text-black font-bold rounded-lg">Free Estimate</button><button class="px-8 py-4 border border-white/20 rounded-lg">Our Services</button></div><div class="flex gap-8"><div><div class="text-3xl font-bold text-yellow-500">25+</div><p class="text-sm text-slate-400">Years Experience</p></div><div><div class="text-3xl font-bold text-yellow-500">5000+</div><p class="text-sm text-slate-400">Jobs Completed</p></div></div></div><img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80" alt="Electrician" class="rounded-2xl"/></div></section>
<section class="py-24 px-6 bg-white/5"><div class="max-w-6xl mx-auto"><h2 class="text-3xl font-bold text-center mb-16">Our Services</h2><div class="grid md:grid-cols-3 gap-8"><div class="bg-slate-900 rounded-2xl p-8 border border-white/10 hover:border-yellow-500/50 transition"><div class="w-14 h-14 bg-yellow-500/20 rounded-xl flex items-center justify-center text-2xl mb-6">🏠</div><h3 class="text-xl font-bold mb-3">Residential</h3><ul class="text-slate-400 space-y-2 text-sm"><li>Panel upgrades</li><li>Outlet installation</li><li>Lighting fixtures</li><li>Ceiling fans</li></ul></div><div class="bg-slate-900 rounded-2xl p-8 border border-white/10 hover:border-yellow-500/50 transition"><div class="w-14 h-14 bg-yellow-500/20 rounded-xl flex items-center justify-center text-2xl mb-6">🏢</div><h3 class="text-xl font-bold mb-3">Commercial</h3><ul class="text-slate-400 space-y-2 text-sm"><li>Office wiring</li><li>Emergency lighting</li><li>Data cabling</li><li>Code compliance</li></ul></div><div class="bg-slate-900 rounded-2xl p-8 border border-white/10 hover:border-yellow-500/50 transition"><div class="w-14 h-14 bg-yellow-500/20 rounded-xl flex items-center justify-center text-2xl mb-6">🔌</div><h3 class="text-xl font-bold mb-3">Specialty</h3><ul class="text-slate-400 space-y-2 text-sm"><li>EV charger install</li><li>Smart home setup</li><li>Generator hookup</li><li>Solar integration</li></ul></div></div></div></section>
<section class="py-24 px-6"><div class="max-w-4xl mx-auto text-center"><h2 class="text-3xl font-bold mb-12">Why Customers Trust Us</h2><div class="grid md:grid-cols-4 gap-6"><div><div class="text-4xl mb-3">✅</div><h3 class="font-bold">Licensed</h3></div><div><div class="text-4xl mb-3">🛡️</div><h3 class="font-bold">Insured</h3></div><div><div class="text-4xl mb-3">⏰</div><h3 class="font-bold">On-Time</h3></div><div><div class="text-4xl mb-3">💯</div><h3 class="font-bold">Guaranteed</h3></div></div></div></section>
<section class="py-16 px-6 bg-yellow-500 text-black"><div class="max-w-4xl mx-auto text-center"><h2 class="text-3xl font-bold mb-4">Ready for Safe, Quality Electrical Work?</h2><p class="text-black/70 mb-8">Call now or schedule your free estimate online.</p><div class="flex flex-col md:flex-row gap-4 justify-center"><button class="px-10 py-4 bg-black text-white font-bold rounded-lg">(555) 456-7890</button><button class="px-10 py-4 bg-white text-black font-bold rounded-lg">Schedule Online</button></div></div></section>
${contractorExtras({ brand: 'PowerUp Electric', accent: 'yellow', headline: 'Free safety inspection', cta: 'Book Inspection' })}
<footer class="py-12 px-6 border-t border-white/5"><div class="max-w-6xl mx-auto flex justify-between items-center"><span class="font-bold text-yellow-500">PowerUp Electric</span><p class="text-sm text-slate-500">License #12345 | Fully Insured</p></div></footer>
    `, "Electrical Services"),
  },
  {
    id: "contractor-landscaping",
    name: "Landscaping Company",
    category: "contractor",
    description: "Professional landscaping service landing",
    tags: ["landscaping", "lawn", "full"],
    code: wrapInHtmlDoc(`
<nav class="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-950/90 backdrop-blur-lg"><div class="max-w-6xl mx-auto flex items-center justify-between"><a href="#" class="text-xl font-bold text-emerald-500">GreenScape</a><div class="hidden md:flex items-center gap-6"><a href="#" class="text-sm text-slate-300 hover:text-white">Services</a><a href="#" class="text-sm text-slate-300 hover:text-white">Gallery</a><a href="#" class="text-sm text-slate-300 hover:text-white">About</a></div><button class="px-5 py-2 bg-emerald-500 text-black text-sm font-bold rounded">Free Quote</button></div></nav>
<section class="min-h-screen flex items-center px-6 relative"><div class="absolute inset-0"><img src="https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1600&q=80" alt="" class="w-full h-full object-cover opacity-40"/></div><div class="relative z-10 max-w-3xl"><h1 class="text-5xl md:text-7xl font-bold mb-6">Transform Your Outdoor Space</h1><p class="text-xl text-slate-300 mb-8">Professional landscaping, lawn care, and hardscape design for homes and businesses.</p><div class="flex gap-4"><button class="px-8 py-4 bg-emerald-500 text-black font-bold rounded-lg">Get Free Estimate</button><button class="px-8 py-4 border border-white/30 rounded-lg">View Portfolio</button></div></div></section>
<section class="py-24 px-6"><div class="max-w-6xl mx-auto"><h2 class="text-3xl font-bold text-center mb-16">Our Services</h2><div class="grid md:grid-cols-4 gap-6"><div class="bg-slate-900 rounded-2xl p-6 text-center border border-white/10"><div class="text-4xl mb-4">🌱</div><h3 class="font-bold mb-2">Lawn Care</h3><p class="text-slate-400 text-sm">Mowing, fertilizing, aeration</p></div><div class="bg-slate-900 rounded-2xl p-6 text-center border border-white/10"><div class="text-4xl mb-4">🌳</div><h3 class="font-bold mb-2">Tree Service</h3><p class="text-slate-400 text-sm">Trimming, removal, planting</p></div><div class="bg-slate-900 rounded-2xl p-6 text-center border border-white/10"><div class="text-4xl mb-4">🪨</div><h3 class="font-bold mb-2">Hardscaping</h3><p class="text-slate-400 text-sm">Patios, walkways, walls</p></div><div class="bg-slate-900 rounded-2xl p-6 text-center border border-white/10"><div class="text-4xl mb-4">💧</div><h3 class="font-bold mb-2">Irrigation</h3><p class="text-slate-400 text-sm">Sprinkler install & repair</p></div></div></div></section>
<section class="py-24 px-6 bg-white/5"><div class="max-w-6xl mx-auto"><h2 class="text-3xl font-bold text-center mb-16">Recent Projects</h2><div class="grid md:grid-cols-3 gap-6"><img src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&q=80" alt="" class="aspect-[4/3] object-cover rounded-xl"/><img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80" alt="" class="aspect-[4/3] object-cover rounded-xl"/><img src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&q=80" alt="" class="aspect-[4/3] object-cover rounded-xl"/></div></div></section>
<section class="py-24 px-6"><div class="max-w-4xl mx-auto text-center"><h2 class="text-3xl font-bold mb-8">Our Process</h2><div class="grid md:grid-cols-4 gap-8"><div><div class="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div><h3 class="font-bold">Consultation</h3></div><div><div class="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div><h3 class="font-bold">Design</h3></div><div><div class="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div><h3 class="font-bold">Install</h3></div><div><div class="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div><h3 class="font-bold">Maintain</h3></div></div></div></section>
<section class="py-16 px-6 bg-emerald-600"><div class="max-w-4xl mx-auto text-center"><h2 class="text-3xl font-bold mb-4">Ready for Your Dream Yard?</h2><p class="text-emerald-100 mb-8">Get a free quote within 24 hours.</p><button class="px-10 py-4 bg-black text-white font-bold rounded-lg">Get Free Quote</button></div></section>
${contractorExtras({ brand: 'GreenScape', accent: 'emerald', headline: 'Get a same-day estimate', cta: 'Request Estimate' })}
<footer class="py-12 px-6 border-t border-white/5"><div class="max-w-6xl mx-auto flex justify-between items-center"><span class="font-bold text-emerald-500">GreenScape</span><p class="text-sm text-slate-500">(555) 234-5678</p></div></footer>
    `, "Landscaping Company"),
  },
  {
    id: "contractor-handyman",
    name: "General Handyman",
    category: "contractor",
    description: "Multi-service handyman landing",
    tags: ["handyman", "repair", "full"],
    code: wrapInHtmlDoc(`
<nav class="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-950/90 backdrop-blur-lg"><div class="max-w-6xl mx-auto flex items-center justify-between"><a href="#" class="text-xl font-bold text-orange-500">FixIt Pro</a><div class="hidden md:flex items-center gap-6"><a href="#" class="text-sm text-slate-300 hover:text-white">Services</a><a href="#" class="text-sm text-slate-300 hover:text-white">About</a><a href="#" class="text-sm text-slate-300 hover:text-white">Reviews</a></div><button class="px-5 py-2 bg-orange-500 text-black text-sm font-bold rounded">Book Now</button></div></nav>
<section class="pt-24 pb-16 px-6"><div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center"><div><span class="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm">TRUSTED LOCAL HANDYMAN</span><h1 class="text-5xl md:text-6xl font-bold mt-4 mb-6">No Job Too Small</h1><p class="text-xl text-slate-400 mb-8">From leaky faucets to furniture assembly - we handle all your home repair needs.</p><div class="flex gap-4 mb-8"><button class="px-8 py-4 bg-orange-500 text-black font-bold rounded-lg">Book Service</button><button class="px-8 py-4 border border-white/20 rounded-lg">(555) 987-6543</button></div><div class="flex items-center gap-6"><div class="flex text-amber-400">⭐⭐⭐⭐⭐</div><span class="text-slate-400">4.9/5 from 300+ reviews</span></div></div><img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80" alt="Handyman" class="rounded-2xl"/></div></section>
<section class="py-24 px-6"><div class="max-w-6xl mx-auto"><h2 class="text-3xl font-bold text-center mb-16">What We Fix</h2><div class="grid grid-cols-2 md:grid-cols-4 gap-6"><div class="bg-slate-900 rounded-xl p-6 text-center border border-white/10"><span class="text-3xl">🪑</span><h3 class="font-bold mt-3">Furniture</h3></div><div class="bg-slate-900 rounded-xl p-6 text-center border border-white/10"><span class="text-3xl">🚪</span><h3 class="font-bold mt-3">Doors</h3></div><div class="bg-slate-900 rounded-xl p-6 text-center border border-white/10"><span class="text-3xl">🖼️</span><h3 class="font-bold mt-3">Mounting</h3></div><div class="bg-slate-900 rounded-xl p-6 text-center border border-white/10"><span class="text-3xl">🔩</span><h3 class="font-bold mt-3">Repairs</h3></div><div class="bg-slate-900 rounded-xl p-6 text-center border border-white/10"><span class="text-3xl">🧱</span><h3 class="font-bold mt-3">Drywall</h3></div><div class="bg-slate-900 rounded-xl p-6 text-center border border-white/10"><span class="text-3xl">🪟</span><h3 class="font-bold mt-3">Windows</h3></div><div class="bg-slate-900 rounded-xl p-6 text-center border border-white/10"><span class="text-3xl">💡</span><h3 class="font-bold mt-3">Lighting</h3></div><div class="bg-slate-900 rounded-xl p-6 text-center border border-white/10"><span class="text-3xl">🔌</span><h3 class="font-bold mt-3">Outlets</h3></div></div></div></section>
<section class="py-24 px-6 bg-white/5"><div class="max-w-5xl mx-auto"><h2 class="text-3xl font-bold text-center mb-12">Simple Pricing</h2><div class="grid md:grid-cols-3 gap-8 text-center"><div class="bg-slate-900 rounded-2xl p-8 border border-white/10"><h3 class="text-xl font-bold mb-2">Small Jobs</h3><div class="text-4xl font-bold text-orange-500 my-4">$75</div><p class="text-slate-400 text-sm mb-4">Per hour (1 hour min)</p><ul class="text-sm text-slate-400 space-y-2"><li>Minor repairs</li><li>Simple installations</li></ul></div><div class="bg-slate-900 rounded-2xl p-8 border-2 border-orange-500"><span class="text-xs text-orange-500 font-bold">MOST POPULAR</span><h3 class="text-xl font-bold mb-2 mt-2">Half Day</h3><div class="text-4xl font-bold text-orange-500 my-4">$250</div><p class="text-slate-400 text-sm mb-4">4 hours of work</p><ul class="text-sm text-slate-400 space-y-2"><li>Multiple tasks</li><li>Medium projects</li></ul></div><div class="bg-slate-900 rounded-2xl p-8 border border-white/10"><h3 class="text-xl font-bold mb-2">Full Day</h3><div class="text-4xl font-bold text-orange-500 my-4">$450</div><p class="text-slate-400 text-sm mb-4">8 hours of work</p><ul class="text-sm text-slate-400 space-y-2"><li>Large projects</li><li>Best value</li></ul></div></div></div></section>
<section class="py-16 px-6 bg-orange-500 text-black"><div class="max-w-4xl mx-auto text-center"><h2 class="text-3xl font-bold mb-4">Have a Honey-Do List?</h2><p class="text-black/70 mb-8">Let us knock it out for you. Book online or call now.</p><button class="px-10 py-4 bg-black text-white font-bold rounded-lg">Book Your Handyman</button></div></section>
${contractorExtras({ brand: 'FixIt Pro', accent: 'orange', headline: 'Book your first visit', cta: 'Book Now' })}
<footer class="py-12 px-6 border-t border-white/5"><div class="max-w-6xl mx-auto flex justify-between items-center"><span class="font-bold text-orange-500">FixIt Pro</span><p class="text-sm text-slate-500">Insured & Background Checked</p></div></footer>
    `, "General Handyman"),
  },

  // Contract-ready booking templates (appear in System Launcher)
  {
    id: "services-salon-appointments",
    name: "Salon Appointments",
    category: "contractor",
    description: "Service business template with appointment booking + lead capture wiring",
    tags: ["editorial", "booking", "services", "appointments"],
    code: wrapInHtmlDoc(`
<nav class="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-950/80 backdrop-blur-lg border-b border-white/10" data-ut-section="nav">
  <div class="max-w-6xl mx-auto flex items-center justify-between gap-4">
    <a href="#" class="text-lg font-semibold tracking-wide">Velvet Studio</a>
    <div class="hidden md:flex items-center gap-6 text-sm text-slate-300">
      <a href="#services" class="hover:text-white" data-ut-cta="cta.nav">Services</a>
      <a href="#team" class="hover:text-white" data-ut-cta="cta.nav">Team</a>
      <a href="#faq" class="hover:text-white" data-ut-cta="cta.nav">FAQ</a>
    </div>
    <button class="px-5 py-2 rounded-xl bg-white text-black font-semibold" data-ut-cta="cta.nav" data-ut-intent="booking.create" data-ut-label="Book appointment">Book</button>
  </div>
</nav>

<header class="pt-28 pb-16 px-6" data-ut-section="hero">
  <div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
    <div>
      <p class="text-xs tracking-[0.2em] text-slate-400">APPOINTMENTS • COLOR • CUT • STYLE</p>
      <h1 class="mt-3 text-5xl md:text-6xl font-bold">Book a look you’ll love.</h1>
      <p class="mt-6 text-lg text-slate-300 max-w-xl">A modern studio for hair, color, and event styling—appointments available 7 days a week.</p>
      <div class="mt-8 flex flex-col sm:flex-row gap-3">
        <button class="px-7 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-black font-extrabold" data-ut-cta="cta.primary" data-ut-intent="booking.create" data-ut-label="Book now">Book now</button>
        <button class="px-7 py-4 rounded-2xl border border-white/15 bg-white/5 text-white font-semibold" data-ut-cta="cta.secondary" data-ut-intent="contact.submit" data-ut-label="Ask a question">Ask a question</button>
      </div>
      <div class="mt-10 grid grid-cols-3 gap-4 text-sm">
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div class="text-slate-400">Avg. response</div>
          <div class="mt-1 font-semibold">Under 1 hour</div>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div class="text-slate-400">Rating</div>
          <div class="mt-1 font-semibold">4.9 / 5</div>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div class="text-slate-400">Walk-ins</div>
          <div class="mt-1 font-semibold">Limited</div>
        </div>
      </div>
    </div>
    <div class="relative">
      <div class="absolute -inset-6 bg-gradient-to-tr from-rose-500/20 to-purple-500/10 blur-2xl rounded-full"></div>
      <div class="relative rounded-3xl border border-white/10 bg-white/5 p-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-400 tracking-widest">NEXT AVAILABLE</div>
            <div class="mt-1 text-xl font-bold">Today • 3:30 PM</div>
          </div>
          <div class="text-2xl">✂️</div>
        </div>
        <div class="mt-5 grid grid-cols-2 gap-3">
          <button type="button" class="px-4 py-3 rounded-2xl border border-white/10 bg-white/10 text-sm font-semibold" data-no-intent data-service="haircut">Haircut</button>
          <button type="button" class="px-4 py-3 rounded-2xl border border-white/10 bg-white/10 text-sm font-semibold" data-no-intent data-service="color">Color</button>
          <button type="button" class="px-4 py-3 rounded-2xl border border-white/10 bg-white/10 text-sm font-semibold" data-no-intent data-service="blowout">Blowout</button>
          <button type="button" class="px-4 py-3 rounded-2xl border border-white/10 bg-white/10 text-sm font-semibold" data-no-intent data-service="event-style">Event Style</button>
        </div>
        <p class="mt-4 text-xs text-slate-400">Tip: these cards can map to real services and availability once connected.</p>
      </div>
    </div>
  </div>
</header>

<section class="py-16 px-6 bg-white/5" id="services" data-ut-section="services">
  <div class="max-w-6xl mx-auto">
    <div class="flex items-end justify-between gap-6">
      <div>
        <h2 class="text-3xl md:text-4xl font-bold">Signature services</h2>
        <p class="mt-2 text-slate-400">Clear pricing, quick booking, real-time confirmation.</p>
      </div>
      <button class="hidden md:inline-flex px-5 py-3 rounded-2xl bg-white text-black font-bold" data-ut-cta="cta.primary" data-ut-intent="booking.create" data-ut-label="Book a service">Book a service</button>
    </div>
    <div class="mt-10 grid md:grid-cols-3 gap-6">
      <div class="rounded-3xl border border-white/10 bg-slate-900/50 p-6">
        <div class="text-xs tracking-widest text-slate-500">POPULAR</div>
        <div class="mt-2 text-xl font-semibold">Cut + Style</div>
        <div class="mt-1 text-sm text-slate-400">45–60 min • from $75</div>
        <button class="mt-5 w-full px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold" data-ut-cta="cta.primary" data-ut-intent="booking.create" data-ut-label="Book Cut + Style">Book</button>
      </div>
      <div class="rounded-3xl border border-white/10 bg-slate-900/50 p-6">
        <div class="text-xs tracking-widest text-slate-500">COLOR</div>
        <div class="mt-2 text-xl font-semibold">Full Color</div>
        <div class="mt-1 text-sm text-slate-400">90–120 min • from $160</div>
        <button class="mt-5 w-full px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold" data-ut-cta="cta.primary" data-ut-intent="booking.create" data-ut-label="Book Full Color">Book</button>
      </div>
      <div class="rounded-3xl border border-white/10 bg-slate-900/50 p-6">
        <div class="text-xs tracking-widest text-slate-500">EVENTS</div>
        <div class="mt-2 text-xl font-semibold">Event Styling</div>
        <div class="mt-1 text-sm text-slate-400">60–75 min • from $120</div>
        <button class="mt-5 w-full px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold" data-ut-cta="cta.primary" data-ut-intent="booking.create" data-ut-label="Book Event Styling">Book</button>
      </div>
    </div>
  </div>
</section>

<section class="py-16 px-6" id="team" data-ut-section="team">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold">Meet the team</h2>
    <p class="mt-2 text-slate-400">Choose a stylist on booking (mapped in payload later).</p>
    <div class="mt-10 grid md:grid-cols-3 gap-6">
      <div class="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div class="text-2xl">🖤</div>
        <div class="mt-3 font-semibold">Ava</div>
        <div class="text-sm text-slate-400">Color + balayage</div>
      </div>
      <div class="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div class="text-2xl">✨</div>
        <div class="mt-3 font-semibold">Mina</div>
        <div class="text-sm text-slate-400">Cuts + styling</div>
      </div>
      <div class="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div class="text-2xl">🌙</div>
        <div class="mt-3 font-semibold">Noah</div>
        <div class="text-sm text-slate-400">Event looks</div>
      </div>
    </div>
  </div>
</section>

<section class="py-16 px-6 bg-white/5" id="faq" data-ut-section="faq">
  <div class="max-w-5xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold">FAQ</h2>
    <div class="mt-8 space-y-3">
      <details class="group rounded-2xl border border-white/10 bg-slate-900/50 p-5">
        <summary class="flex items-center justify-between gap-4 tw-focus"><span class="font-semibold">What’s your cancellation policy?</span><span class="text-slate-400 group-open:rotate-45 transition">+</span></summary>
        <div class="mt-3 text-sm text-slate-400">Reschedule up to 24 hours before your appointment.</div>
      </details>
      <details class="group rounded-2xl border border-white/10 bg-slate-900/50 p-5">
        <summary class="flex items-center justify-between gap-4 tw-focus"><span class="font-semibold">Do you take walk-ins?</span><span class="text-slate-400 group-open:rotate-45 transition">+</span></summary>
        <div class="mt-3 text-sm text-slate-400">Limited walk-ins. Booking online is the fastest way to secure a slot.</div>
      </details>
      <details class="group rounded-2xl border border-white/10 bg-slate-900/50 p-5">
        <summary class="flex items-center justify-between gap-4 tw-focus"><span class="font-semibold">Can I request a stylist?</span><span class="text-slate-400 group-open:rotate-45 transition">+</span></summary>
        <div class="mt-3 text-sm text-slate-400">Yes—leave a note and we’ll confirm availability.</div>
      </details>
    </div>
  </div>
</section>

<section class="py-16 px-6" data-ut-section="lead">
  <div class="max-w-6xl mx-auto rounded-3xl border border-white/10 bg-slate-900/50 p-8 md:p-10">
    <div class="grid lg:grid-cols-2 gap-10 items-start">
      <div>
        <h2 class="text-3xl font-bold">Get last-minute openings</h2>
        <p class="mt-2 text-slate-400">Join the list for cancellations and same-day slots.</p>
      </div>
      <form class="grid sm:grid-cols-3 gap-3" data-ut-intent="newsletter.subscribe">
        <input class="px-4 py-3 rounded-2xl bg-slate-950/40 border border-white/10 outline-none" placeholder="Email" type="email" name="email" required />
        <input class="px-4 py-3 rounded-2xl bg-slate-950/40 border border-white/10 outline-none" placeholder="Name" type="text" name="name" />
        <button class="px-5 py-3 rounded-2xl bg-white text-black font-bold" data-ut-cta="cta.footer" data-ut-intent="newsletter.subscribe" data-ut-label="Join newsletter">Join</button>
      </form>
    </div>
  </div>
</section>

<footer class="py-12 px-6 border-t border-white/5" data-ut-section="footer">
  <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
    <div>
      <div class="font-semibold">Velvet Studio</div>
      <div class="text-sm text-slate-500">Downtown • Open daily</div>
    </div>
    <div class="flex gap-3">
      <button class="px-5 py-2 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold" data-ut-cta="cta.footer" data-ut-intent="contact.submit" data-ut-label="Contact">Contact</button>
      <button class="px-5 py-2 rounded-xl bg-white text-black text-sm font-bold" data-ut-cta="cta.footer" data-ut-intent="booking.create" data-ut-label="Book">Book</button>
    </div>
  </div>
</footer>
    `, "Salon Appointments"),
  },

  {
    id: "services-consulting-booking",
    name: "Consulting Sessions",
    category: "contractor",
    description: "Service business template for 1:1 sessions with booking + newsletter wiring",
    tags: ["editorial", "booking", "services", "consulting"],
    code: wrapInHtmlDoc(`
<nav class="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-950/80 backdrop-blur-lg border-b border-white/10" data-ut-section="nav">
  <div class="max-w-6xl mx-auto flex items-center justify-between gap-4">
    <a href="#" class="text-lg font-semibold">Northstar Consulting</a>
    <div class="hidden md:flex items-center gap-6 text-sm text-slate-300">
      <a href="#offer" class="hover:text-white" data-ut-cta="cta.nav">Offer</a>
      <a href="#process" class="hover:text-white" data-ut-cta="cta.nav">Process</a>
      <a href="#proof" class="hover:text-white" data-ut-cta="cta.nav">Proof</a>
    </div>
    <button class="px-5 py-2 rounded-xl bg-white text-black font-semibold" data-ut-cta="cta.nav" data-ut-intent="booking.create" data-ut-label="Book a call">Book a call</button>
  </div>
</nav>

<header class="pt-28 pb-16 px-6" data-ut-section="hero">
  <div class="max-w-6xl mx-auto">
    <div class="max-w-3xl">
      <p class="text-xs tracking-[0.2em] text-slate-400">STRATEGY • OPERATIONS • SYSTEMS</p>
      <h1 class="mt-3 text-5xl md:text-6xl font-bold">Turn “busy” into a clean operating system.</h1>
      <p class="mt-6 text-lg text-slate-300">Book a session to map your funnel, fix handoffs, and implement a repeatable process in 14 days.</p>
      <div class="mt-8 flex flex-col sm:flex-row gap-3">
        <button class="px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-lime-400 text-black font-extrabold" data-ut-cta="cta.primary" data-ut-intent="booking.create" data-ut-label="Book strategy session">Book strategy session</button>
        <button class="px-7 py-4 rounded-2xl border border-white/15 bg-white/5 text-white font-semibold" data-ut-cta="cta.secondary" data-ut-intent="contact.submit" data-ut-label="Ask about fit">Ask about fit</button>
      </div>
    </div>
  </div>
</header>

<section class="py-16 px-6 bg-white/5" id="offer" data-ut-section="offer">
  <div class="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
    <div class="rounded-3xl border border-white/10 bg-slate-900/50 p-6">
      <div class="text-xs tracking-widest text-slate-500">SESSION</div>
      <div class="mt-2 text-xl font-semibold">90-min Strategy Call</div>
      <div class="mt-1 text-sm text-slate-400">Audit + plan + next steps.</div>
      <button class="mt-5 w-full px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold" data-ut-cta="cta.primary" data-ut-intent="booking.create" data-ut-label="Book 90-min Strategy Call">Book</button>
    </div>
    <div class="rounded-3xl border border-white/10 bg-slate-900/50 p-6">
      <div class="text-xs tracking-widest text-slate-500">SPRINT</div>
      <div class="mt-2 text-xl font-semibold">14-Day Implementation</div>
      <div class="mt-1 text-sm text-slate-400">Build & ship the workflow.</div>
      <button class="mt-5 w-full px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold" data-ut-cta="cta.primary" data-ut-intent="booking.create" data-ut-label="Book implementation kickoff">Book</button>
    </div>
    <div class="rounded-3xl border border-white/10 bg-slate-900/50 p-6">
      <div class="text-xs tracking-widest text-slate-500">SUPPORT</div>
      <div class="mt-2 text-xl font-semibold">Monthly Advisory</div>
      <div class="mt-1 text-sm text-slate-400">Ongoing optimization.</div>
      <button class="mt-5 w-full px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold" data-ut-cta="cta.primary" data-ut-intent="booking.create" data-ut-label="Book advisory intro">Book</button>
    </div>
  </div>
</section>

<section class="py-16 px-6" id="process" data-ut-section="process">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold">Process</h2>
    <div class="mt-10 grid md:grid-cols-3 gap-6">
      <div class="rounded-3xl border border-white/10 bg-white/5 p-6"><div class="text-xs tracking-widest text-slate-500">1</div><div class="mt-2 font-semibold">Diagnose</div><div class="text-sm text-slate-400">Find bottlenecks and wasted motion.</div></div>
      <div class="rounded-3xl border border-white/10 bg-white/5 p-6"><div class="text-xs tracking-widest text-slate-500">2</div><div class="mt-2 font-semibold">Design</div><div class="text-sm text-slate-400">Define a workflow your team will actually use.</div></div>
      <div class="rounded-3xl border border-white/10 bg-white/5 p-6"><div class="text-xs tracking-widest text-slate-500">3</div><div class="mt-2 font-semibold">Deploy</div><div class="text-sm text-slate-400">Implement with training + checklists.</div></div>
    </div>
  </div>
</section>

<section class="py-16 px-6 bg-white/5" id="proof" data-ut-section="proof">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold">Proof</h2>
    <div class="mt-10 grid md:grid-cols-2 gap-6">
      <div class="rounded-3xl border border-white/10 bg-slate-900/50 p-6">
        <div class="text-sm text-slate-300">“We cut lead response time from 2 days to under 2 hours.”</div>
        <div class="mt-4 text-xs text-slate-500">Ops Lead • B2B Services</div>
      </div>
      <div class="rounded-3xl border border-white/10 bg-slate-900/50 p-6">
        <div class="text-sm text-slate-300">“Our booking flow now converts and routes to the right inbox.”</div>
        <div class="mt-4 text-xs text-slate-500">Founder • Agency</div>
      </div>
    </div>
  </div>
</section>

<section class="py-16 px-6" data-ut-section="lead">
  <div class="max-w-6xl mx-auto rounded-3xl border border-white/10 bg-slate-900/50 p-8 md:p-10">
    <div class="grid lg:grid-cols-2 gap-10 items-start">
      <div>
        <h2 class="text-3xl font-bold">Get the weekly teardown</h2>
        <p class="mt-2 text-slate-400">Short emails. Real systems. No fluff.</p>
      </div>
      <form class="grid sm:grid-cols-3 gap-3" data-ut-intent="newsletter.subscribe">
        <input class="px-4 py-3 rounded-2xl bg-slate-950/40 border border-white/10 outline-none" placeholder="Email" type="email" name="email" required />
        <input class="px-4 py-3 rounded-2xl bg-slate-950/40 border border-white/10 outline-none" placeholder="Company" type="text" name="company" />
        <button class="px-5 py-3 rounded-2xl bg-white text-black font-bold" data-ut-cta="cta.footer" data-ut-intent="newsletter.subscribe" data-ut-label="Subscribe">Subscribe</button>
      </form>
    </div>
  </div>
</section>

<footer class="py-12 px-6 border-t border-white/5" data-ut-section="footer">
  <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
    <div>
      <div class="font-semibold">Northstar Consulting</div>
      <div class="text-sm text-slate-500">Systems for service businesses</div>
    </div>
    <div class="flex gap-3">
      <button class="px-5 py-2 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold" data-ut-cta="cta.footer" data-ut-intent="contact.submit" data-ut-label="Contact">Contact</button>
      <button class="px-5 py-2 rounded-xl bg-white text-black text-sm font-bold" data-ut-cta="cta.footer" data-ut-intent="booking.create" data-ut-label="Book">Book</button>
    </div>
  </div>
</footer>
    `, "Consulting Sessions"),
  },
];
