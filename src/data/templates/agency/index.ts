/**
 * Agency Templates
 * Creative and marketing agency templates
 */

import { LayoutTemplate } from '../types';
import { wrapInHtmlDoc } from '../utils';

export const agencyTemplates: LayoutTemplate[] = [
  {
    id: "agency-creative",
    name: "Creative Agency",
    category: "agency",
    description: "Complete creative agency page with portfolio, services, team, and contact.",
    tags: ["agency", "creative", "marketing", "design", "full"],
    code: wrapInHtmlDoc(`
<!-- NAVIGATION -->
<header class="fixed top-0 left-0 right-0 z-50 px-6 py-6">
  <div class="max-w-7xl mx-auto flex justify-between items-center">
    <span class="text-2xl font-black tracking-tight">STUDIO</span>
    <nav class="hidden md:flex gap-10 text-sm font-medium">
      <a href="#work" class="hover:text-purple-400 transition">Work</a>
      <a href="#services" class="hover:text-purple-400 transition">Services</a>
      <a href="#about" class="hover:text-purple-400 transition">About</a>
      <a href="#contact" class="hover:text-purple-400 transition">Contact</a>
    </nav>
    <button class="px-6 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-slate-200 transition">Let's Talk</button>
  </div>
</header>

<!-- HERO -->
<section class="min-h-screen flex items-center px-6 pt-24 pb-20">
  <div class="max-w-7xl mx-auto w-full">
    <div class="max-w-4xl">
      <span class="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium mb-8">Award-Winning Creative Agency</span>
      <h1 class="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] mb-8">We create<br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">digital magic</span></h1>
      <p class="text-xl md:text-2xl text-slate-400 max-w-2xl mb-12">An award-winning creative agency helping brands stand out through bold design and innovative strategy.</p>
      <div class="flex flex-wrap gap-6 items-center">
        <button class="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-semibold hover:opacity-90 transition text-lg">Start a Project</button>
        <a href="#work" class="text-lg font-medium underline underline-offset-4 hover:text-purple-400 transition">View Our Work →</a>
      </div>
    </div>
    <div class="mt-20 flex flex-wrap gap-16">
      <div><p class="text-4xl font-black">150+</p><p class="text-slate-500">Projects Delivered</p></div>
      <div><p class="text-4xl font-black">50+</p><p class="text-slate-500">Happy Clients</p></div>
      <div><p class="text-4xl font-black">12</p><p class="text-slate-500">Industry Awards</p></div>
    </div>
  </div>
</section>

<!-- FEATURED WORK -->
<section id="work" class="py-24 px-6">
  <div class="max-w-7xl mx-auto">
    <div class="flex justify-between items-end mb-16">
      <div>
        <span class="text-purple-400 text-sm font-semibold tracking-wider uppercase">Portfolio</span>
        <h2 class="text-5xl font-black mt-4">Featured Work</h2>
      </div>
      <a href="#" class="hidden md:block text-lg font-medium underline underline-offset-4 hover:text-purple-400">View All Projects</a>
    </div>
    <div class="grid md:grid-cols-2 gap-8">
      <div class="group relative aspect-[4/3] bg-slate-800 rounded-3xl overflow-hidden">
        <img src="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80" alt="Project" class="w-full h-full object-cover group-hover:scale-105 transition duration-700"/>
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
        <div class="absolute bottom-8 left-8 right-8 opacity-0 group-hover:opacity-100 transition translate-y-4 group-hover:translate-y-0">
          <span class="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-sm">Branding</span>
          <h3 class="text-2xl font-bold mt-3">Luxe Fashion Rebrand</h3>
        </div>
      </div>
      <div class="group relative aspect-[4/3] bg-slate-800 rounded-3xl overflow-hidden">
        <img src="https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80" alt="Project" class="w-full h-full object-cover group-hover:scale-105 transition duration-700"/>
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
        <div class="absolute bottom-8 left-8 right-8 opacity-0 group-hover:opacity-100 transition translate-y-4 group-hover:translate-y-0">
          <span class="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-sm">Web Design</span>
          <h3 class="text-2xl font-bold mt-3">TechFlow Platform</h3>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- SERVICES -->
<section id="services" class="py-24 px-6 bg-slate-900">
  <div class="max-w-7xl mx-auto">
    <div class="grid lg:grid-cols-2 gap-16">
      <div>
        <span class="text-pink-400 text-sm font-semibold tracking-wider uppercase">What We Do</span>
        <h2 class="text-5xl font-black mt-4 mb-6">Services</h2>
        <p class="text-xl text-slate-400 mb-8">We offer end-to-end creative solutions that transform brands and drive results.</p>
        <button class="px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-slate-200 transition">Get a Quote</button>
      </div>
      <div class="space-y-6">
        <div class="p-8 bg-slate-800/50 rounded-2xl border border-white/5 hover:border-purple-500/30 transition group cursor-pointer">
          <h3 class="text-2xl font-bold mb-2 group-hover:text-purple-400 transition">Brand Strategy</h3>
          <p class="text-slate-400">Brand positioning, identity systems, and strategic guidelines.</p>
        </div>
        <div class="p-8 bg-slate-800/50 rounded-2xl border border-white/5 hover:border-pink-500/30 transition group cursor-pointer">
          <h3 class="text-2xl font-bold mb-2 group-hover:text-pink-400 transition">Web Design & Development</h3>
          <p class="text-slate-400">Responsive websites, e-commerce, and web applications.</p>
        </div>
        <div class="p-8 bg-slate-800/50 rounded-2xl border border-white/5 hover:border-orange-500/30 transition group cursor-pointer">
          <h3 class="text-2xl font-bold mb-2 group-hover:text-orange-400 transition">Digital Marketing</h3>
          <p class="text-slate-400">Social media, content strategy, and performance marketing.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ABOUT -->
<section id="about" class="py-24 px-6">
  <div class="max-w-7xl mx-auto">
    <div class="grid lg:grid-cols-2 gap-16 items-center">
      <div class="relative">
        <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" alt="Team" class="rounded-3xl"/>
        <div class="absolute -bottom-8 -right-8 p-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
          <p class="text-5xl font-black">12</p>
          <p class="font-semibold">Years of Excellence</p>
        </div>
      </div>
      <div>
        <span class="text-purple-400 text-sm font-semibold tracking-wider uppercase">About Us</span>
        <h2 class="text-5xl font-black mt-4 mb-6">Where creativity meets strategy</h2>
        <p class="text-lg text-slate-400 mb-6">Founded in 2013, STUDIO has grown from a small design shop to a full-service creative agency.</p>
        <p class="text-lg text-slate-400 mb-8">Our diverse team of designers, developers, and strategists work together to create meaningful experiences.</p>
        <div class="flex gap-8">
          <div><p class="text-3xl font-bold text-purple-400">25+</p><p class="text-slate-500">Team Members</p></div>
          <div><p class="text-3xl font-bold text-pink-400">4</p><p class="text-slate-500">Global Offices</p></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CONTACT CTA -->
<section id="contact" class="py-24 px-6">
  <div class="max-w-7xl mx-auto">
    <div class="p-12 md:p-20 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl text-center">
      <h2 class="text-4xl md:text-6xl font-black mb-6">Let's create something amazing</h2>
      <p class="text-xl text-white/80 mb-10 max-w-2xl mx-auto">Have a project in mind? We'd love to hear about it.</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button class="px-10 py-5 bg-white text-black rounded-full font-semibold text-lg hover:bg-slate-100 transition">Start a Project</button>
        <button class="px-10 py-5 border-2 border-white rounded-full font-semibold text-lg hover:bg-white/10 transition">hello@studio.com</button>
      </div>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="py-16 px-6 border-t border-white/5">
  <div class="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
    <div>
      <span class="text-2xl font-black">STUDIO</span>
      <p class="text-slate-500 mt-4">Award-winning creative agency based in New York.</p>
    </div>
    <div><h5 class="font-semibold mb-4">Services</h5><ul class="space-y-2 text-sm text-slate-400"><li><a href="#" class="hover:text-white">Branding</a></li><li><a href="#" class="hover:text-white">Web Design</a></li><li><a href="#" class="hover:text-white">Marketing</a></li></ul></div>
    <div><h5 class="font-semibold mb-4">Company</h5><ul class="space-y-2 text-sm text-slate-400"><li><a href="#" class="hover:text-white">About</a></li><li><a href="#" class="hover:text-white">Team</a></li><li><a href="#" class="hover:text-white">Careers</a></li></ul></div>
    <div><h5 class="font-semibold mb-4">Contact</h5><ul class="space-y-2 text-sm text-slate-400"><li>hello@studio.com</li><li>+1 (555) 123-4567</li></ul></div>
  </div>
  <div class="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center text-sm text-slate-500">
    <p>© 2025 STUDIO. All rights reserved.</p>
  </div>
</footer>
    `, "Creative Agency"),
  },
];
