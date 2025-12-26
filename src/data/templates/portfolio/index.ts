/**
 * Portfolio Templates
 * Designer and creative portfolio templates
 */

import { LayoutTemplate } from '../types';
import { wrapInHtmlDoc } from '../utils';

export const portfolioTemplates: LayoutTemplate[] = [
  {
    id: "portfolio-minimal",
    name: "Portfolio (Full)",
    category: "portfolio",
    description: "Complete portfolio: Nav, Hero, Projects, About, Skills, Contact, Footer",
    tags: ["portfolio", "designer", "complete", "projects"],
    code: wrapInHtmlDoc(`
<!-- NAVIGATION -->
<nav class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-white/5">
  <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
    <a href="#" class="text-xl font-bold">Jane Doe</a>
    <div class="flex items-center gap-8">
      <a href="#work" class="text-sm text-slate-300 hover:text-white transition">Work</a>
      <a href="#about" class="text-sm text-slate-300 hover:text-white transition">About</a>
      <a href="#skills" class="text-sm text-slate-300 hover:text-white transition">Skills</a>
      <a href="#contact" class="text-sm text-slate-300 hover:text-white transition">Contact</a>
    </div>
  </div>
</nav>

<!-- HERO -->
<section class="pt-32 pb-20 px-6">
  <div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
    <div>
      <span class="text-purple-400 text-sm font-medium mb-4 block">Product Designer & Developer</span>
      <h1 class="text-5xl md:text-6xl font-bold leading-tight mb-6">I create digital experiences that <span class="text-purple-400">matter</span></h1>
      <p class="text-xl text-slate-400 mb-8">Crafting beautiful interfaces and seamless user experiences for startups and enterprises worldwide.</p>
      <div class="flex gap-4">
        <a href="#work" class="px-8 py-4 bg-purple-500 rounded-xl font-semibold hover:bg-purple-600 transition">View My Work</a>
        <a href="#contact" class="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition">Get In Touch</a>
      </div>
    </div>
    <div class="relative">
      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80" alt="Jane Doe" class="rounded-2xl shadow-2xl w-full aspect-square object-cover"/>
      <div class="absolute -bottom-4 -right-4 bg-slate-900 border border-white/10 rounded-xl p-4">
        <p class="text-2xl font-bold text-purple-400">8+</p><p class="text-sm text-slate-400">Years Experience</p>
      </div>
    </div>
  </div>
</section>

<!-- WORK/PROJECTS -->
<section id="work" class="py-24 px-6 bg-slate-900/30">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-16">
      <span class="text-purple-400 text-sm font-medium uppercase tracking-wider">Portfolio</span>
      <h2 class="text-4xl font-bold mt-4">Selected Works</h2>
    </div>
    <div class="grid md:grid-cols-2 gap-8">
      <div class="group relative aspect-[4/3] bg-slate-800 rounded-2xl overflow-hidden cursor-pointer">
        <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" alt="Project" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-8">
          <div><span class="text-purple-400 text-sm">UI/UX Design</span><h3 class="text-2xl font-bold mt-1">Fintech Dashboard</h3><p class="text-slate-300 mt-2">A complete redesign of a banking application</p></div>
        </div>
      </div>
      <div class="group relative aspect-[4/3] bg-slate-800 rounded-2xl overflow-hidden cursor-pointer">
        <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" alt="Project" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-8">
          <div><span class="text-purple-400 text-sm">Brand Identity</span><h3 class="text-2xl font-bold mt-1">TechCorp Rebrand</h3><p class="text-slate-300 mt-2">Complete brand identity and guidelines</p></div>
        </div>
      </div>
      <div class="group relative aspect-[4/3] bg-slate-800 rounded-2xl overflow-hidden cursor-pointer">
        <img src="https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80" alt="Project" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-8">
          <div><span class="text-purple-400 text-sm">Web Design</span><h3 class="text-2xl font-bold mt-1">E-Commerce Platform</h3><p class="text-slate-300 mt-2">Modern shopping experience design</p></div>
        </div>
      </div>
      <div class="group relative aspect-[4/3] bg-slate-800 rounded-2xl overflow-hidden cursor-pointer">
        <img src="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80" alt="Project" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-8">
          <div><span class="text-purple-400 text-sm">Mobile App</span><h3 class="text-2xl font-bold mt-1">Fitness Tracker</h3><p class="text-slate-300 mt-2">iOS and Android app design</p></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ABOUT -->
<section id="about" class="py-24 px-6">
  <div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
    <div>
      <span class="text-purple-400 text-sm font-medium uppercase tracking-wider">About Me</span>
      <h2 class="text-4xl font-bold mt-4 mb-6">Passionate about creating impactful digital experiences</h2>
      <p class="text-slate-400 mb-6">With over 8 years of experience in product design, I've helped startups and Fortune 500 companies bring their visions to life. My approach combines user-centered design with business strategy.</p>
      <p class="text-slate-400 mb-8">When I'm not designing, you'll find me exploring new technologies, mentoring junior designers, or hiking in the mountains.</p>
      <div class="grid grid-cols-3 gap-8">
        <div><p class="text-3xl font-bold text-purple-400">50+</p><p class="text-sm text-slate-500">Projects Completed</p></div>
        <div><p class="text-3xl font-bold text-purple-400">30+</p><p class="text-sm text-slate-500">Happy Clients</p></div>
        <div><p class="text-3xl font-bold text-purple-400">12</p><p class="text-sm text-slate-500">Awards Won</p></div>
      </div>
    </div>
    <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" alt="Working" class="rounded-2xl"/>
  </div>
</section>

<!-- SKILLS -->
<section id="skills" class="py-24 px-6 bg-slate-900/30">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-16">
      <span class="text-purple-400 text-sm font-medium uppercase tracking-wider">Expertise</span>
      <h2 class="text-4xl font-bold mt-4">Skills & Tools</h2>
    </div>
    <div class="grid md:grid-cols-4 gap-6">
      <div class="bg-slate-900 border border-white/5 rounded-xl p-6 text-center hover:border-purple-500/30 transition"><div class="text-3xl mb-3">🎨</div><h3 class="font-semibold">UI/UX Design</h3></div>
      <div class="bg-slate-900 border border-white/5 rounded-xl p-6 text-center hover:border-purple-500/30 transition"><div class="text-3xl mb-3">📱</div><h3 class="font-semibold">Mobile Design</h3></div>
      <div class="bg-slate-900 border border-white/5 rounded-xl p-6 text-center hover:border-purple-500/30 transition"><div class="text-3xl mb-3">🖥️</div><h3 class="font-semibold">Web Design</h3></div>
      <div class="bg-slate-900 border border-white/5 rounded-xl p-6 text-center hover:border-purple-500/30 transition"><div class="text-3xl mb-3">✏️</div><h3 class="font-semibold">Branding</h3></div>
      <div class="bg-slate-900 border border-white/5 rounded-xl p-6 text-center hover:border-purple-500/30 transition"><div class="text-3xl mb-3">⚡</div><h3 class="font-semibold">Figma</h3></div>
      <div class="bg-slate-900 border border-white/5 rounded-xl p-6 text-center hover:border-purple-500/30 transition"><div class="text-3xl mb-3">🔷</div><h3 class="font-semibold">Sketch</h3></div>
      <div class="bg-slate-900 border border-white/5 rounded-xl p-6 text-center hover:border-purple-500/30 transition"><div class="text-3xl mb-3">💻</div><h3 class="font-semibold">HTML/CSS</h3></div>
      <div class="bg-slate-900 border border-white/5 rounded-xl p-6 text-center hover:border-purple-500/30 transition"><div class="text-3xl mb-3">⚛️</div><h3 class="font-semibold">React</h3></div>
    </div>
  </div>
</section>

<!-- CONTACT -->
<section id="contact" class="py-24 px-6">
  <div class="max-w-4xl mx-auto text-center">
    <span class="text-purple-400 text-sm font-medium uppercase tracking-wider">Get In Touch</span>
    <h2 class="text-4xl font-bold mt-4 mb-6">Let's work together</h2>
    <p class="text-xl text-slate-400 mb-12">Have a project in mind? I'd love to hear about it.</p>
    <form class="grid md:grid-cols-2 gap-6 text-left">
      <input type="text" placeholder="Your Name" class="px-5 py-4 bg-slate-900 border border-white/10 rounded-xl focus:border-purple-500 outline-none"/>
      <input type="email" placeholder="Your Email" class="px-5 py-4 bg-slate-900 border border-white/10 rounded-xl focus:border-purple-500 outline-none"/>
      <textarea placeholder="Your Message" rows="4" class="md:col-span-2 px-5 py-4 bg-slate-900 border border-white/10 rounded-xl focus:border-purple-500 outline-none resize-none"></textarea>
      <button class="md:col-span-2 px-8 py-4 bg-purple-500 rounded-xl font-semibold hover:bg-purple-600 transition">Send Message</button>
    </form>
  </div>
</section>

<!-- FOOTER -->
<footer class="py-12 px-6 border-t border-white/5">
  <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
    <p class="text-slate-500">© 2025 Jane Doe. All rights reserved.</p>
    <div class="flex gap-6"><a href="#" class="text-slate-400 hover:text-white transition">Twitter</a><a href="#" class="text-slate-400 hover:text-white transition">LinkedIn</a><a href="#" class="text-slate-400 hover:text-white transition">Dribbble</a><a href="#" class="text-slate-400 hover:text-white transition">GitHub</a></div>
  </div>
</footer>
    `, "Portfolio"),
  },
];
