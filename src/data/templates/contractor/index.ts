/**
 * Contractor Templates
 * Construction and home services templates
 */

import { LayoutTemplate } from '../types';
import { wrapInHtmlDoc } from '../utils';

export const contractorTemplates: LayoutTemplate[] = [
  {
    id: "contractor-services",
    name: "Contractor Services",
    category: "contractor",
    description: "Complete contractor page with services, projects, testimonials, and contact.",
    tags: ["contractor", "services", "business", "construction", "full"],
    code: wrapInHtmlDoc(`
<!-- NAVIGATION -->
<header class="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-950/95 backdrop-blur-sm border-b border-white/5">
  <div class="max-w-7xl mx-auto flex justify-between items-center">
    <div class="flex items-center gap-2">
      <span class="text-2xl">🏗️</span>
      <span class="text-xl font-bold text-amber-500">BuildPro</span>
    </div>
    <nav class="hidden md:flex gap-8 text-sm font-medium text-slate-300">
      <a href="#services" class="hover:text-amber-500 transition">Services</a>
      <a href="#projects" class="hover:text-amber-500 transition">Projects</a>
      <a href="#about" class="hover:text-amber-500 transition">About Us</a>
      <a href="#testimonials" class="hover:text-amber-500 transition">Reviews</a>
      <a href="#contact" class="hover:text-amber-500 transition">Contact</a>
    </nav>
    <div class="flex items-center gap-4">
      <a href="tel:555-123-4567" class="hidden md:flex items-center gap-2 text-sm"><span>📞</span>(555) 123-4567</a>
      <button class="px-5 py-2 bg-amber-500 text-black rounded-lg font-semibold text-sm hover:bg-amber-400 transition">Free Quote</button>
    </div>
  </div>
</header>

<!-- HERO -->
<section class="relative min-h-screen flex items-center pt-20">
  <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80" alt="Construction" class="absolute inset-0 w-full h-full object-cover"/>
  <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
  <div class="relative z-10 px-6 max-w-3xl ml-8 md:ml-16 lg:ml-24">
    <span class="inline-block px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium mb-6">🏆 20+ Years of Excellence</span>
    <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">Quality Construction<br/><span class="text-amber-500">You Can Trust</span></h1>
    <p class="text-xl text-slate-300 mb-8 max-w-xl">From residential renovations to commercial projects, we deliver exceptional craftsmanship on time and within budget.</p>
    <div class="flex flex-col sm:flex-row gap-4 mb-12">
      <button class="px-8 py-4 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-400 transition text-lg">Get Free Estimate</button>
      <button class="px-8 py-4 border-2 border-white/30 rounded-lg font-semibold hover:bg-white/10 transition text-lg">View Our Work</button>
    </div>
    <div class="flex gap-12">
      <div><p class="text-3xl font-bold text-amber-500">500+</p><p class="text-sm text-slate-400">Projects Completed</p></div>
      <div><p class="text-3xl font-bold text-amber-500">98%</p><p class="text-sm text-slate-400">Client Satisfaction</p></div>
      <div><p class="text-3xl font-bold text-amber-500">50+</p><p class="text-sm text-slate-400">Expert Team</p></div>
    </div>
  </div>
</section>

<!-- SERVICES -->
<section id="services" class="py-24 px-6 bg-slate-900">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-16">
      <span class="text-amber-500 text-sm font-semibold tracking-wider uppercase">What We Do</span>
      <h2 class="text-4xl md:text-5xl font-bold mt-4 mb-6">Our Services</h2>
      <p class="text-xl text-slate-400 max-w-2xl mx-auto">Comprehensive construction solutions for every project</p>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      <div class="bg-slate-800/50 p-8 rounded-2xl border border-white/5 hover:border-amber-500/30 transition group">
        <div class="w-16 h-16 bg-amber-500/10 rounded-xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition">🏠</div>
        <h3 class="text-xl font-bold mb-3">Residential Construction</h3>
        <p class="text-slate-400 mb-4">Custom homes, additions, and complete renovations tailored to your vision.</p>
        <a href="#" class="text-amber-500 font-medium hover:underline">Learn More →</a>
      </div>
      <div class="bg-slate-800/50 p-8 rounded-2xl border border-white/5 hover:border-amber-500/30 transition group">
        <div class="w-16 h-16 bg-amber-500/10 rounded-xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition">🏢</div>
        <h3 class="text-xl font-bold mb-3">Commercial Projects</h3>
        <p class="text-slate-400 mb-4">Office buildings, retail spaces, warehouses, and industrial facilities.</p>
        <a href="#" class="text-amber-500 font-medium hover:underline">Learn More →</a>
      </div>
      <div class="bg-slate-800/50 p-8 rounded-2xl border border-white/5 hover:border-amber-500/30 transition group">
        <div class="w-16 h-16 bg-amber-500/10 rounded-xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition">🔨</div>
        <h3 class="text-xl font-bold mb-3">Remodeling</h3>
        <p class="text-slate-400 mb-4">Kitchen, bathroom, and whole-home remodeling with modern designs.</p>
        <a href="#" class="text-amber-500 font-medium hover:underline">Learn More →</a>
      </div>
    </div>
  </div>
</section>

<!-- PROJECTS GALLERY -->
<section id="projects" class="py-24 px-6">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-16">
      <span class="text-amber-500 text-sm font-semibold tracking-wider uppercase">Portfolio</span>
      <h2 class="text-4xl md:text-5xl font-bold mt-4 mb-6">Recent Projects</h2>
    </div>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="group relative aspect-[4/3] rounded-2xl overflow-hidden">
        <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80" alt="Project" class="w-full h-full object-cover group-hover:scale-110 transition duration-500"/>
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
        <div class="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition">
          <span class="text-amber-400 text-sm">Residential</span>
          <h4 class="text-xl font-bold">Modern Villa</h4>
        </div>
      </div>
      <div class="group relative aspect-[4/3] rounded-2xl overflow-hidden">
        <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80" alt="Project" class="w-full h-full object-cover group-hover:scale-110 transition duration-500"/>
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
        <div class="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition">
          <span class="text-amber-400 text-sm">Commercial</span>
          <h4 class="text-xl font-bold">Office Tower</h4>
        </div>
      </div>
      <div class="group relative aspect-[4/3] rounded-2xl overflow-hidden">
        <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80" alt="Project" class="w-full h-full object-cover group-hover:scale-110 transition duration-500"/>
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
        <div class="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition">
          <span class="text-amber-400 text-sm">Remodel</span>
          <h4 class="text-xl font-bold">Kitchen Renovation</h4>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- TESTIMONIALS -->
<section id="testimonials" class="py-24 px-6 bg-slate-900">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-16">
      <span class="text-amber-500 text-sm font-semibold tracking-wider uppercase">Testimonials</span>
      <h2 class="text-4xl font-bold mt-4">What Our Clients Say</h2>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      <div class="p-8 bg-slate-800/50 rounded-2xl border border-white/5">
        <div class="flex gap-1 text-amber-400 mb-4">★★★★★</div>
        <p class="text-slate-300 mb-6">"BuildPro transformed our outdated kitchen into a modern masterpiece. The team was professional and finished ahead of schedule!"</p>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center text-xl">👨</div>
          <div><p class="font-semibold">Michael R.</p><p class="text-sm text-slate-500">Kitchen Remodel</p></div>
        </div>
      </div>
      <div class="p-8 bg-slate-800/50 rounded-2xl border border-white/5">
        <div class="flex gap-1 text-amber-400 mb-4">★★★★★</div>
        <p class="text-slate-300 mb-6">"From the initial consultation to the final walkthrough, BuildPro exceeded our expectations. Our new home is everything we dreamed of."</p>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center text-xl">👩</div>
          <div><p class="font-semibold">Jennifer K.</p><p class="text-sm text-slate-500">Custom Home</p></div>
        </div>
      </div>
      <div class="p-8 bg-slate-800/50 rounded-2xl border border-white/5">
        <div class="flex gap-1 text-amber-400 mb-4">★★★★★</div>
        <p class="text-slate-300 mb-6">"Outstanding commercial work! They completed our office renovation while minimizing disruption to our business operations."</p>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center text-xl">👔</div>
          <div><p class="font-semibold">Robert T.</p><p class="text-sm text-slate-500">Office Renovation</p></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CONTACT CTA -->
<section id="contact" class="py-24 px-6 bg-amber-500">
  <div class="max-w-4xl mx-auto text-center text-black">
    <h2 class="text-4xl md:text-5xl font-bold mb-6">Ready to Start Your Project?</h2>
    <p class="text-xl text-black/70 mb-10">Get a free, no-obligation estimate today.</p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <button class="px-8 py-4 bg-black text-white rounded-lg font-semibold hover:bg-slate-800 transition text-lg">Get Free Estimate</button>
      <button class="px-8 py-4 border-2 border-black rounded-lg font-semibold hover:bg-black/10 transition text-lg">📞 (555) 123-4567</button>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="py-16 px-6 bg-slate-950 border-t border-white/5">
  <div class="max-w-6xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
    <div>
      <div class="flex items-center gap-2 mb-4">
        <span class="text-2xl">🏗️</span>
        <span class="text-xl font-bold text-amber-500">BuildPro</span>
      </div>
      <p class="text-slate-500 text-sm">Quality construction services since 2004.</p>
    </div>
    <div><h5 class="font-semibold mb-4">Services</h5><ul class="space-y-2 text-sm text-slate-400"><li><a href="#" class="hover:text-amber-500">Residential</a></li><li><a href="#" class="hover:text-amber-500">Commercial</a></li><li><a href="#" class="hover:text-amber-500">Remodeling</a></li></ul></div>
    <div><h5 class="font-semibold mb-4">Company</h5><ul class="space-y-2 text-sm text-slate-400"><li><a href="#" class="hover:text-amber-500">About Us</a></li><li><a href="#" class="hover:text-amber-500">Our Team</a></li><li><a href="#" class="hover:text-amber-500">Careers</a></li></ul></div>
    <div><h5 class="font-semibold mb-4">Contact</h5><ul class="space-y-2 text-sm text-slate-400"><li>📞 (555) 123-4567</li><li>✉️ info@buildpro.com</li></ul></div>
  </div>
  <div class="max-w-6xl mx-auto pt-8 border-t border-white/5 text-center text-sm text-slate-500">
    <p>© 2025 BuildPro Construction. All rights reserved.</p>
  </div>
</footer>
    `, "Contractor Services"),
  },
];
