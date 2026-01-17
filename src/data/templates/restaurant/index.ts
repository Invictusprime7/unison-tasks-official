import { LayoutTemplate } from '../types';
import { wrapInHtmlDoc } from '../utils';

const restaurantExtras = (opts: {
  brand: string;
  accent: 'amber' | 'orange' | 'red' | 'rose';
  primaryCta: string;
}) => {
  const safeId = opts.brand.replace(/\s+/g, '-').toLowerCase();
  const stickyKey = `restaurant-${safeId}-${opts.accent}`;
  const gradient =
    opts.accent === 'amber'
      ? 'from-amber-500 to-orange-500'
      : opts.accent === 'orange'
        ? 'from-orange-500 to-rose-500'
        : opts.accent === 'red'
          ? 'from-red-600 to-orange-500'
          : 'from-rose-500 to-pink-500';

  const chip =
    opts.accent === 'amber'
      ? 'text-amber-300 border-amber-500/20 bg-amber-500/10'
      : opts.accent === 'orange'
        ? 'text-orange-300 border-orange-500/20 bg-orange-500/10'
        : opts.accent === 'red'
          ? 'text-red-300 border-red-500/20 bg-red-500/10'
          : 'text-rose-300 border-rose-500/20 bg-rose-500/10';

  return `
<section class="py-20 px-6 bg-white/5">
  <div class="max-w-6xl mx-auto">
    <div class="flex items-end justify-between gap-6 mb-10">
      <div>
        <h2 class="text-2xl md:text-3xl font-bold">Explore the menu</h2>
        <p class="text-slate-400 mt-2">Interactive tabs you can connect to live items.</p>
      </div>
      <span class="hidden md:inline-flex px-3 py-1 rounded-full border ${chip} text-xs tracking-wider">TABS</span>
    </div>

    <div class="rounded-3xl border border-white/10 bg-slate-900/40 p-6" data-tabs>
      <div class="flex flex-wrap gap-2">
        <button class="px-4 py-2 rounded-xl border border-white/10 bg-white/10 text-sm font-semibold tw-focus" data-tab="highlights">Highlights</button>
        <button class="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold tw-focus" data-tab="seasonal">Seasonal</button>
        <button class="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold tw-focus" data-tab="drinks">Drinks</button>
      </div>
      <div class="mt-6">
        <div data-tab-panel="highlights" class="grid md:grid-cols-3 gap-6">
          <div class="rounded-2xl border border-white/10 bg-white/5 p-6 md:-translate-y-1">
            <div class="text-xs text-slate-500">Signature</div>
            <div class="text-lg font-semibold mt-1">Chef’s Tasting</div>
            <div class="text-sm text-slate-400">A curated multi-course experience.</div>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div class="text-xs text-slate-500">Fan favorite</div>
            <div class="text-lg font-semibold mt-1">House Special</div>
            <div class="text-sm text-slate-400">Our most-ordered plate.</div>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/5 p-6 md:translate-y-1">
            <div class="text-xs text-slate-500">Dessert</div>
            <div class="text-lg font-semibold mt-1">Seasonal Finale</div>
            <div class="text-sm text-slate-400">Rotating weekly by the pastry chef.</div>
          </div>
        </div>
        <div data-tab-panel="seasonal" class="hidden">
          <div class="grid md:grid-cols-2 gap-6">
            <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 class="font-semibold">Weeknight Specials</h3>
              <p class="text-sm text-slate-400 mt-2">Rotate specials based on local availability: produce, seafood, and small-batch staples.</p>
              <ul class="mt-4 space-y-2 text-sm text-slate-300">
                <li>✓ Market vegetables</li>
                <li>✓ Fresh catch</li>
                <li>✓ Chef’s pasta</li>
              </ul>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 class="font-semibold">Join the list</h3>
              <p class="text-sm text-slate-400 mt-2">Demo form submit (shows a toast).</p>
              <div data-demo-form-host>
                <form class="mt-4 grid sm:grid-cols-3 gap-3" data-demo-form>
                  <input class="px-4 py-3 rounded-xl bg-slate-950/30 border border-white/10 outline-none" placeholder="Email" type="email" required />
                  <select class="px-4 py-3 rounded-xl bg-slate-950/30 border border-white/10 outline-none">
                    <option>Specials</option>
                    <option>Events</option>
                    <option>Both</option>
                  </select>
                  <button class="px-4 py-3 rounded-xl bg-gradient-to-r ${gradient} text-white font-bold">Subscribe</button>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div data-tab-panel="drinks" class="hidden">
          <div class="grid md:grid-cols-3 gap-6">
            <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div class="text-2xl">🍸</div>
              <div class="font-semibold mt-3">House cocktails</div>
              <div class="text-sm text-slate-400 mt-1">Balanced classics + seasonal twists.</div>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-6 md:translate-y-1">
              <div class="text-2xl">🍷</div>
              <div class="font-semibold mt-3">Wine pairings</div>
              <div class="text-sm text-slate-400 mt-1">Curated by the sommelier.</div>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div class="text-2xl">☕</div>
              <div class="font-semibold mt-3">Non-alcoholic</div>
              <div class="text-sm text-slate-400 mt-1">House-made sodas + zero-proof.</div>
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
        <h2 class="text-2xl md:text-3xl font-bold">FAQs</h2>
        <p class="text-slate-400 mt-2">Policies guests ask about most.</p>
      </div>
      <span class="hidden md:inline-flex px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs tracking-wider">ACCORDION</span>
    </div>
    <div class="space-y-3">
      <details class="group rounded-2xl border border-white/10 bg-slate-900/50 p-5">
        <summary class="flex items-center justify-between gap-4 tw-focus"><span class="font-semibold">Do you take walk-ins?</span><span class="text-slate-400 group-open:rotate-45 transition">+</span></summary>
        <div class="mt-3 text-sm text-slate-400">We save a limited number of tables for walk-ins. Reservations are recommended for peak hours.</div>
      </details>
      <details class="group rounded-2xl border border-white/10 bg-slate-900/50 p-5">
        <summary class="flex items-center justify-between gap-4 tw-focus"><span class="font-semibold">Can you accommodate allergies?</span><span class="text-slate-400 group-open:rotate-45 transition">+</span></summary>
        <div class="mt-3 text-sm text-slate-400">Yes—note allergies when booking. We’ll confirm options upon arrival.</div>
      </details>
      <details class="group rounded-2xl border border-white/10 bg-slate-900/50 p-5">
        <summary class="flex items-center justify-between gap-4 tw-focus"><span class="font-semibold">Is there a dress code?</span><span class="text-slate-400 group-open:rotate-45 transition">+</span></summary>
        <div class="mt-3 text-sm text-slate-400">Smart casual is perfect. Come comfortable, come hungry.</div>
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
        <div class="text-xs tracking-widest text-white/80">QUICK ACTION</div>
        <div class="text-lg font-semibold">${opts.brand}</div>
        <div class="text-sm text-white/80">Order, reserve, or ask a question.</div>
      </div>
      <div class="flex gap-3">
        <button class="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/20 border border-white/20 text-sm font-semibold tw-focus" data-toggle="#demo-restaurant-${safeId}">Hours</button>
        <button class="px-5 py-2 rounded-xl bg-white text-black text-sm font-bold tw-focus">${opts.primaryCta}</button>
      </div>
    </div>
    <div id="demo-restaurant-${safeId}" class="hidden mt-4 rounded-xl bg-black/15 border border-white/15 px-4 py-3 text-sm text-white/90" aria-hidden="true">
      Demo panel: show hours, location, or delivery radius here.
    </div>
  </div>
</div>
`;
};

export const restaurantTemplates: LayoutTemplate[] = [
  {
    id: "restaurant-fine-dining",
    name: "Fine Dining",
    category: "restaurant",
    description: "Elegant fine dining restaurant landing page",
    tags: ["fine-dining", "elegant", "full"],
    code: wrapInHtmlDoc(`
<nav class="fixed top-0 left-0 right-0 z-50 px-6 py-6"><div class="max-w-7xl mx-auto flex items-center justify-between"><a href="#" class="text-2xl font-light tracking-widest">AURELIA</a><div class="hidden md:flex items-center gap-8 text-sm tracking-wider"><a href="#menu" class="text-slate-400 hover:text-white">Menu</a><a href="#about" class="text-slate-400 hover:text-white">About</a><a href="#reserve" class="text-slate-400 hover:text-white">Reservations</a></div><button class="px-5 py-2 border border-amber-500 text-amber-500 text-sm tracking-wider">Reserve</button></div></nav>
<section class="min-h-screen flex items-center justify-center px-6 relative"><div class="absolute inset-0"><img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80" alt="" class="w-full h-full object-cover opacity-40"/></div><div class="relative z-10 text-center"><span class="text-amber-500 text-sm tracking-widest mb-4 block">MICHELIN STARRED</span><h1 class="text-5xl md:text-8xl font-light tracking-wider mb-6">Experience Culinary Excellence</h1><p class="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">Where artistry meets gastronomy. A journey through flavors crafted with passion.</p><button class="px-10 py-4 bg-amber-500 text-black text-sm tracking-widest font-medium">RESERVE YOUR TABLE</button></div></section>
<section class="py-24 px-6" id="menu"><div class="max-w-6xl mx-auto"><div class="text-center mb-16"><span class="text-amber-500 text-sm tracking-widest">OUR MENU</span><h2 class="text-4xl font-light tracking-wider mt-4">Seasonal Tasting Menu</h2></div><div class="grid md:grid-cols-2 gap-12"><div class="space-y-8"><h3 class="text-amber-500 text-sm tracking-widest mb-6">STARTERS</h3><div class="flex justify-between border-b border-white/10 pb-4"><div><h4 class="font-medium mb-1">Wagyu Tartare</h4><p class="text-sm text-slate-400">Black truffle, quail egg, brioche</p></div><span class="text-amber-500">$38</span></div><div class="flex justify-between border-b border-white/10 pb-4"><div><h4 class="font-medium mb-1">Hokkaido Scallop</h4><p class="text-sm text-slate-400">Cauliflower, caviar, brown butter</p></div><span class="text-amber-500">$42</span></div></div><div class="space-y-8"><h3 class="text-amber-500 text-sm tracking-widest mb-6">MAINS</h3><div class="flex justify-between border-b border-white/10 pb-4"><div><h4 class="font-medium mb-1">Aged Duck Breast</h4><p class="text-sm text-slate-400">Cherry, foie gras, jus</p></div><span class="text-amber-500">$68</span></div><div class="flex justify-between border-b border-white/10 pb-4"><div><h4 class="font-medium mb-1">A5 Wagyu Ribeye</h4><p class="text-sm text-slate-400">Bone marrow, seasonal vegetables</p></div><span class="text-amber-500">$145</span></div></div></div></div></section>
<section class="py-24 px-6 bg-white/5" id="about"><div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center"><div><img src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=600&q=80" alt="Chef" class="rounded-lg"/></div><div><span class="text-amber-500 text-sm tracking-widest">ABOUT</span><h2 class="text-4xl font-light tracking-wider mt-4 mb-6">Chef Marcus Chen</h2><p class="text-slate-400 mb-6 leading-relaxed">With over 20 years of culinary expertise and training at the world's finest restaurants, Chef Marcus brings innovation while honoring tradition.</p><p class="text-slate-400 leading-relaxed">Our philosophy is simple: source the finest ingredients and let them shine through precise technique and creative vision.</p></div></div></section>
<section class="py-24 px-6" id="reserve"><div class="max-w-3xl mx-auto text-center"><span class="text-amber-500 text-sm tracking-widest">RESERVATIONS</span><h2 class="text-4xl font-light tracking-wider mt-4 mb-6">Reserve Your Experience</h2><p class="text-slate-400 mb-10">Dinner service: Tuesday - Saturday, 6pm - 10pm</p><form class="space-y-6"><div class="grid md:grid-cols-2 gap-6"><input type="text" placeholder="Name" class="px-5 py-4 bg-white/5 border border-white/10 rounded-lg focus:border-amber-500 outline-none"/><input type="email" placeholder="Email" class="px-5 py-4 bg-white/5 border border-white/10 rounded-lg focus:border-amber-500 outline-none"/><input type="date" class="px-5 py-4 bg-white/5 border border-white/10 rounded-lg focus:border-amber-500 outline-none"/><select class="px-5 py-4 bg-white/5 border border-white/10 rounded-lg focus:border-amber-500 outline-none"><option>2 Guests</option><option>4 Guests</option><option>6 Guests</option></select></div><button class="w-full py-4 bg-amber-500 text-black font-medium tracking-wider rounded-lg">REQUEST RESERVATION</button></form></div></section>
${restaurantExtras({ brand: 'AURELIA', accent: 'amber', primaryCta: 'Reserve' })}
<footer class="py-12 px-6 border-t border-white/5"><div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6"><span class="text-xl font-light tracking-widest">AURELIA</span><div class="text-center md:text-right text-sm text-slate-400"><p>123 Culinary Avenue, New York</p><p>+1 (212) 555-0123</p></div></div></footer>
    `, "Fine Dining Restaurant"),
  },
  {
    id: "restaurant-casual",
    name: "Casual Bistro",
    category: "restaurant",
    description: "Warm casual bistro restaurant page",
    tags: ["casual", "bistro", "full"],
    code: wrapInHtmlDoc(`
<nav class="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-950/90 backdrop-blur-lg"><div class="max-w-6xl mx-auto flex items-center justify-between"><a href="#" class="text-2xl font-bold text-orange-500">The Local Kitchen</a><div class="hidden md:flex items-center gap-6"><a href="#menu" class="text-sm text-slate-300 hover:text-white">Menu</a><a href="#story" class="text-sm text-slate-300 hover:text-white">Our Story</a><a href="#location" class="text-sm text-slate-300 hover:text-white">Location</a></div><button class="px-5 py-2 bg-orange-500 text-black text-sm font-semibold rounded-full">Order Online</button></div></nav>
<section class="pt-24 pb-16 px-6"><div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center"><div><span class="text-orange-500 text-sm font-medium">FARM TO TABLE</span><h1 class="text-5xl md:text-6xl font-bold mt-2 mb-6">Good food, great company</h1><p class="text-xl text-slate-400 mb-8">Fresh, locally-sourced ingredients prepared with love. Come hungry, leave happy.</p><div class="flex gap-4"><button class="px-8 py-4 bg-orange-500 text-black font-semibold rounded-full">View Menu</button><button class="px-8 py-4 border border-white/20 rounded-full">Order Pickup</button></div><div class="mt-8 flex items-center gap-6 text-sm text-slate-400"><span>⭐ 4.9 (500+ reviews)</span><span>📍 Brooklyn, NY</span></div></div><div><img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80" alt="Pizza" class="rounded-2xl w-full"/></div></div></section>
<section class="py-20 px-6 bg-orange-500 text-black"><div class="max-w-4xl mx-auto text-center"><h2 class="text-3xl font-bold mb-4">Today's Special</h2><p class="text-xl mb-2">Wood-Fired Truffle Mushroom Pizza</p><p class="text-black/70">House-made mozzarella, wild mushrooms, truffle oil, arugula</p><p class="text-2xl font-bold mt-4">$22</p></div></section>
<section class="py-24 px-6" id="menu"><div class="max-w-6xl mx-auto"><h2 class="text-4xl font-bold text-center mb-16">Our Menu</h2><div class="grid md:grid-cols-3 gap-8"><div><h3 class="text-orange-500 font-semibold mb-6">Starters</h3><div class="space-y-4"><div class="flex justify-between"><span>Bruschetta</span><span class="text-orange-500">$12</span></div><div class="flex justify-between"><span>Burrata</span><span class="text-orange-500">$16</span></div><div class="flex justify-between"><span>Calamari</span><span class="text-orange-500">$14</span></div></div></div><div><h3 class="text-orange-500 font-semibold mb-6">Mains</h3><div class="space-y-4"><div class="flex justify-between"><span>Margherita Pizza</span><span class="text-orange-500">$18</span></div><div class="flex justify-between"><span>Pasta Carbonara</span><span class="text-orange-500">$22</span></div><div class="flex justify-between"><span>Grilled Salmon</span><span class="text-orange-500">$28</span></div></div></div><div><h3 class="text-orange-500 font-semibold mb-6">Desserts</h3><div class="space-y-4"><div class="flex justify-between"><span>Tiramisu</span><span class="text-orange-500">$10</span></div><div class="flex justify-between"><span>Panna Cotta</span><span class="text-orange-500">$9</span></div><div class="flex justify-between"><span>Gelato</span><span class="text-orange-500">$8</span></div></div></div></div></div></section>
<section class="py-24 px-6 bg-white/5" id="story"><div class="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center"><div><img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80" alt="Kitchen" class="rounded-2xl"/></div><div><h2 class="text-4xl font-bold mb-6">Our Story</h2><p class="text-slate-400 mb-6">Started in 2015 by two friends with a passion for good food and community. We believe in simple dishes made with the best ingredients from local farms.</p><p class="text-slate-400">Every morning we source fresh produce from Brooklyn Farmers Market. That's our promise to you.</p></div></div></section>
<section class="py-24 px-6" id="location"><div class="max-w-3xl mx-auto text-center"><h2 class="text-4xl font-bold mb-6">Visit Us</h2><p class="text-xl text-slate-400 mb-4">245 Atlantic Ave, Brooklyn, NY</p><p class="text-slate-400 mb-8">Mon-Thu: 11am-10pm | Fri-Sat: 11am-11pm | Sun: 10am-9pm</p><div class="flex justify-center gap-4"><button class="px-8 py-4 bg-orange-500 text-black font-semibold rounded-full">Get Directions</button><a href="tel:+12125550123" class="px-8 py-4 border border-white/20 rounded-full">Call (212) 555-0123</a></div></div></section>
${restaurantExtras({ brand: 'The Local Kitchen', accent: 'orange', primaryCta: 'Order Online' })}
<footer class="py-12 px-6 border-t border-white/5"><div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6"><span class="text-xl font-bold text-orange-500">The Local Kitchen</span><div class="flex gap-6 text-sm text-slate-400"><a href="#">Instagram</a><a href="#">Yelp</a></div><p class="text-sm text-slate-500">© 2025 The Local Kitchen</p></div></footer>
    `, "Casual Bistro"),
  },
  {
    id: "restaurant-coffee-shop",
    name: "Coffee Shop",
    category: "restaurant",
    description: "Cozy coffee shop landing page",
    tags: ["coffee", "cafe", "full"],
    code: wrapInHtmlDoc(`
<nav class="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-amber-950/90 backdrop-blur-lg"><div class="max-w-6xl mx-auto flex items-center justify-between"><a href="#" class="text-xl font-bold">☕ Brew & Bean</a><div class="hidden md:flex items-center gap-6"><a href="#menu" class="text-sm text-amber-200/70 hover:text-white">Menu</a><a href="#about" class="text-sm text-amber-200/70 hover:text-white">About</a><a href="#locations" class="text-sm text-amber-200/70 hover:text-white">Locations</a></div><button class="px-5 py-2 bg-amber-600 text-sm font-semibold rounded-full">Order Ahead</button></div></nav>
<section class="min-h-screen flex items-center px-6 bg-gradient-to-b from-amber-950 to-slate-950"><div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center"><div><h1 class="text-5xl md:text-7xl font-bold mb-6">Craft coffee, crafted with care</h1><p class="text-xl text-amber-200/70 mb-8">Specialty beans roasted in-house. Every cup tells a story.</p><div class="flex gap-4"><button class="px-8 py-4 bg-amber-600 font-semibold rounded-full">View Menu</button><button class="px-8 py-4 border border-amber-200/30 rounded-full">Find a Shop</button></div></div><div class="relative"><img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80" alt="Coffee" class="rounded-2xl"/><div class="absolute -bottom-4 -left-4 bg-amber-600 text-black p-4 rounded-xl font-bold">Est. 2010</div></div></div></section>
<section class="py-24 px-6" id="menu"><div class="max-w-6xl mx-auto"><h2 class="text-4xl font-bold text-center mb-4">Our Menu</h2><p class="text-center text-slate-400 mb-16">Crafted with single-origin beans and love</p><div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8"><div class="text-center"><div class="w-20 h-20 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">☕</div><h3 class="font-semibold mb-2">Espresso</h3><p class="text-sm text-slate-400 mb-2">Rich and bold</p><p class="text-amber-500 font-semibold">$3.50</p></div><div class="text-center"><div class="w-20 h-20 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🥛</div><h3 class="font-semibold mb-2">Latte</h3><p class="text-sm text-slate-400 mb-2">Smooth and creamy</p><p class="text-amber-500 font-semibold">$5.00</p></div><div class="text-center"><div class="w-20 h-20 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🧊</div><h3 class="font-semibold mb-2">Cold Brew</h3><p class="text-sm text-slate-400 mb-2">Smooth, 24hr steeped</p><p class="text-amber-500 font-semibold">$5.50</p></div><div class="text-center"><div class="w-20 h-20 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🍪</div><h3 class="font-semibold mb-2">Pastries</h3><p class="text-sm text-slate-400 mb-2">Fresh baked daily</p><p class="text-amber-500 font-semibold">From $4</p></div></div></div></section>
<section class="py-24 px-6 bg-amber-950/50" id="about"><div class="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center"><div><img src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&q=80" alt="Roasting" class="rounded-2xl"/></div><div><h2 class="text-4xl font-bold mb-6">Small batch. Big flavor.</h2><p class="text-amber-200/70 mb-6">We source beans directly from farmers in Ethiopia, Colombia, and Guatemala. Every batch is roasted on-site for peak freshness.</p><p class="text-amber-200/70">From farm to cup, we obsess over every detail so you get the perfect brew, every time.</p></div></div></section>
<section class="py-24 px-6" id="locations"><div class="max-w-4xl mx-auto text-center"><h2 class="text-4xl font-bold mb-12">Find Us</h2><div class="grid md:grid-cols-3 gap-8"><div class="p-6 bg-white/5 rounded-2xl"><h3 class="font-semibold mb-2">Downtown</h3><p class="text-sm text-slate-400">123 Main St</p><p class="text-sm text-amber-500">7am - 7pm</p></div><div class="p-6 bg-white/5 rounded-2xl"><h3 class="font-semibold mb-2">Midtown</h3><p class="text-sm text-slate-400">456 Oak Ave</p><p class="text-sm text-amber-500">6am - 8pm</p></div><div class="p-6 bg-white/5 rounded-2xl"><h3 class="font-semibold mb-2">Brooklyn</h3><p class="text-sm text-slate-400">789 Berry St</p><p class="text-sm text-amber-500">7am - 9pm</p></div></div></div></section>
${restaurantExtras({ brand: 'Brew & Bean', accent: 'amber', primaryCta: 'Order Ahead' })}
<footer class="py-12 px-6 border-t border-white/5"><div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6"><span class="text-xl font-bold">☕ Brew & Bean</span><div class="flex gap-6 text-sm text-slate-400"><a href="#">Instagram</a><a href="#">TikTok</a></div><p class="text-sm text-slate-500">© 2025 Brew & Bean Coffee Co.</p></div></footer>
    `, "Coffee Shop"),
  },
  {
    id: "restaurant-pizzeria",
    name: "Pizzeria",
    category: "restaurant",
    description: "Authentic pizzeria landing page",
    tags: ["pizza", "italian", "full"],
    code: wrapInHtmlDoc(`
<nav class="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-red-950/90 backdrop-blur-lg"><div class="max-w-6xl mx-auto flex items-center justify-between"><a href="#" class="text-2xl font-bold">🍕 Napoli's</a><div class="hidden md:flex items-center gap-6"><a href="#menu" class="text-sm text-slate-300 hover:text-white">Menu</a><a href="#about" class="text-sm text-slate-300 hover:text-white">Story</a><a href="#order" class="text-sm text-slate-300 hover:text-white">Order</a></div><button class="px-5 py-2 bg-red-600 text-sm font-bold rounded-full">Order Now</button></div></nav>
<section class="pt-24 pb-16 px-6 bg-gradient-to-b from-red-950/50 to-transparent"><div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center"><div><span class="text-red-500 text-sm font-bold">AUTHENTIC NEAPOLITAN</span><h1 class="text-5xl md:text-7xl font-bold mt-2 mb-6">Pizza like Nonna made</h1><p class="text-xl text-slate-400 mb-8">Wood-fired at 900°F. San Marzano tomatoes. Fresh mozzarella. Just like in Naples.</p><div class="flex gap-4"><button class="px-8 py-4 bg-red-600 font-bold rounded-full">Order Delivery</button><button class="px-8 py-4 border border-white/20 rounded-full">View Menu</button></div></div><div><img src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80" alt="Pizza" class="rounded-2xl"/></div></div></section>
<section class="py-20 px-6"><div class="max-w-6xl mx-auto"><div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"><div><div class="text-4xl font-bold text-red-500">35+</div><p class="text-slate-400">Years in Business</p></div><div><div class="text-4xl font-bold text-red-500">1M+</div><p class="text-slate-400">Pizzas Served</p></div><div><div class="text-4xl font-bold text-red-500">900°F</div><p class="text-slate-400">Wood-Fired Oven</p></div><div><div class="text-4xl font-bold text-red-500">4.9⭐</div><p class="text-slate-400">Customer Rating</p></div></div></div></section>
<section class="py-24 px-6 bg-white/5" id="menu"><div class="max-w-6xl mx-auto"><h2 class="text-4xl font-bold text-center mb-16">Our Pizzas</h2><div class="grid md:grid-cols-3 gap-8"><div class="bg-slate-900 rounded-2xl overflow-hidden"><img src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80" alt="Margherita" class="w-full aspect-square object-cover"/><div class="p-6"><h3 class="text-xl font-bold mb-2">Margherita</h3><p class="text-sm text-slate-400 mb-4">San Marzano, mozzarella, basil</p><div class="flex justify-between items-center"><span class="text-2xl font-bold text-red-500">$18</span><button class="px-4 py-2 bg-red-600 text-sm font-bold rounded-full">Add</button></div></div></div><div class="bg-slate-900 rounded-2xl overflow-hidden"><img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80" alt="Pepperoni" class="w-full aspect-square object-cover"/><div class="p-6"><h3 class="text-xl font-bold mb-2">Pepperoni</h3><p class="text-sm text-slate-400 mb-4">Pepperoni, mozzarella, oregano</p><div class="flex justify-between items-center"><span class="text-2xl font-bold text-red-500">$20</span><button class="px-4 py-2 bg-red-600 text-sm font-bold rounded-full">Add</button></div></div></div><div class="bg-slate-900 rounded-2xl overflow-hidden"><img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80" alt="Diavola" class="w-full aspect-square object-cover"/><div class="p-6"><h3 class="text-xl font-bold mb-2">Diavola</h3><p class="text-sm text-slate-400 mb-4">Spicy salami, chili, honey</p><div class="flex justify-between items-center"><span class="text-2xl font-bold text-red-500">$22</span><button class="px-4 py-2 bg-red-600 text-sm font-bold rounded-full">Add</button></div></div></div></div></div></section>
<section class="py-24 px-6" id="about"><div class="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center"><div><img src="https://images.unsplash.com/photo-1579751626657-72bc17010498?w=600&q=80" alt="Oven" class="rounded-2xl"/></div><div><h2 class="text-4xl font-bold mb-6">Family tradition since 1989</h2><p class="text-slate-400 mb-6">Started by Giuseppe and Maria, immigrants from Naples who brought their family recipes to Brooklyn.</p><p class="text-slate-400">Today, their grandchildren continue the tradition with the same imported ingredients and techniques.</p></div></div></section>
<section class="py-24 px-6 bg-red-600 text-black" id="order"><div class="max-w-3xl mx-auto text-center"><h2 class="text-4xl font-bold mb-6">Hungry? Order now!</h2><p class="text-xl mb-10 text-black/70">Free delivery on orders over $25</p><div class="flex flex-col sm:flex-row gap-4 justify-center"><button class="px-10 py-5 bg-black text-white font-bold rounded-full text-lg">Order Delivery</button><button class="px-10 py-5 bg-white text-black font-bold rounded-full text-lg">Order Pickup</button></div></div></section>
${restaurantExtras({ brand: "Napoli's", accent: 'red', primaryCta: 'Order Now' })}
<footer class="py-12 px-6 border-t border-white/5"><div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6"><span class="text-2xl font-bold">🍕 Napoli's</span><div class="text-sm text-slate-400"><p>456 Court St, Brooklyn, NY</p><p>(718) 555-0123</p></div></div></footer>
    `, "Pizzeria"),
  },
  {
    id: "restaurant-sushi",
    name: "Sushi Bar",
    category: "restaurant",
    description: "Modern sushi restaurant landing page",
    tags: ["sushi", "japanese", "full"],
    code: wrapInHtmlDoc(`
<nav class="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-950/90 backdrop-blur-lg border-b border-white/5"><div class="max-w-6xl mx-auto flex items-center justify-between"><a href="#" class="text-xl font-light tracking-widest">OMAKASE</a><div class="hidden md:flex items-center gap-8 text-sm"><a href="#menu" class="text-slate-400 hover:text-white">Menu</a><a href="#experience" class="text-slate-400 hover:text-white">Experience</a><a href="#reserve" class="text-slate-400 hover:text-white">Reserve</a></div><button class="px-5 py-2 border border-rose-500 text-rose-500 text-sm">Reserve</button></div></nav>
<section class="min-h-screen flex items-center px-6 relative"><div class="absolute inset-0"><img src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1600&q=80" alt="" class="w-full h-full object-cover opacity-30"/></div><div class="relative z-10 max-w-4xl mx-auto text-center"><span class="text-rose-500 text-sm tracking-widest">JAPANESE FINE DINING</span><h1 class="text-5xl md:text-7xl font-light tracking-wider mt-4 mb-6">The art of sushi</h1><p class="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">An intimate 12-seat omakase experience. Seasonal fish. Masterful technique.</p><button class="px-10 py-4 bg-rose-500 text-black text-sm font-medium tracking-wider">RESERVE YOUR SEAT</button></div></section>
<section class="py-24 px-6" id="menu"><div class="max-w-6xl mx-auto"><div class="text-center mb-16"><span class="text-rose-500 text-sm tracking-widest">THE MENU</span><h2 class="text-4xl font-light tracking-wider mt-4">Omakase Experience</h2><p class="text-slate-400 mt-4">Chef's selection of 15-18 courses</p></div><div class="grid md:grid-cols-3 gap-8"><div class="text-center p-8 border border-white/10 rounded-2xl"><img src="https://images.unsplash.com/photo-1617196034183-421b4917c92d?w=300&q=80" alt="Sashimi" class="w-32 h-32 object-cover rounded-full mx-auto mb-6"/><h3 class="font-semibold mb-2">Sashimi Course</h3><p class="text-sm text-slate-400">5 selections of today's freshest fish</p></div><div class="text-center p-8 border border-rose-500/50 rounded-2xl bg-rose-500/5"><img src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&q=80" alt="Nigiri" class="w-32 h-32 object-cover rounded-full mx-auto mb-6"/><h3 class="font-semibold mb-2">Nigiri Course</h3><p class="text-sm text-slate-400">8-10 pieces of signature nigiri</p></div><div class="text-center p-8 border border-white/10 rounded-2xl"><img src="https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=300&q=80" alt="Dessert" class="w-32 h-32 object-cover rounded-full mx-auto mb-6"/><h3 class="font-semibold mb-2">Finale</h3><p class="text-sm text-slate-400">Miso soup, tamago, seasonal dessert</p></div></div><div class="text-center mt-12"><p class="text-3xl font-light text-rose-500">$185 per person</p><p class="text-sm text-slate-500 mt-2">Sake pairing +$75</p></div></div></section>
<section class="py-24 px-6 bg-white/5" id="experience"><div class="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center"><div><img src="https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&q=80" alt="Chef" class="rounded-lg"/></div><div><span class="text-rose-500 text-sm tracking-widest">THE CHEF</span><h2 class="text-4xl font-light tracking-wider mt-4 mb-6">Master Takeshi Yamamoto</h2><p class="text-slate-400 mb-6 leading-relaxed">30 years of mastery. Trained in Tokyo's famed Sukiyabashi Jiro. Dedicated to perfection in every piece.</p><p class="text-slate-400 leading-relaxed">Each night, Chef Yamamoto selects the finest fish from Tsukiji Market, flown in daily.</p></div></div></section>
<section class="py-24 px-6" id="reserve"><div class="max-w-3xl mx-auto text-center"><span class="text-rose-500 text-sm tracking-widest">RESERVATIONS</span><h2 class="text-4xl font-light tracking-wider mt-4 mb-6">Reserve Your Experience</h2><p class="text-slate-400 mb-4">Two seatings nightly: 6:00pm & 8:30pm</p><p class="text-slate-400 mb-10">Reservations open 30 days in advance</p><button class="px-10 py-4 bg-rose-500 text-black font-medium tracking-wider rounded-lg">BOOK VIA RESY</button></div></section>
${restaurantExtras({ brand: 'OMAKASE', accent: 'rose', primaryCta: 'Reserve' })}
<footer class="py-12 px-6 border-t border-white/5"><div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6"><span class="text-xl font-light tracking-widest">OMAKASE</span><div class="text-center md:text-right text-sm text-slate-400"><p>88 East 10th St, New York</p><p>Reservations Only</p></div></div></footer>
    `, "Sushi Bar"),
  },
];
