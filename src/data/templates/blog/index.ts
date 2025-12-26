/**
 * Blog Templates
 * Modern blog and content website templates
 */

import { LayoutTemplate } from '../types';
import { wrapInHtmlDoc } from '../utils';

export const blogTemplates: LayoutTemplate[] = [
  {
    id: "blog-modern",
    name: "Blog (Full)",
    category: "blog",
    description: "Complete blog: Nav, Featured, Articles, Categories, Newsletter, Footer",
    tags: ["blog", "articles", "news", "complete"],
    code: wrapInHtmlDoc(`
<!-- NAVIGATION -->
<nav class="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-white/5">
  <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
    <a href="#" class="text-xl font-bold text-blue-400">The Blog</a>
    <div class="hidden md:flex items-center gap-8">
      <a href="#" class="text-sm text-slate-300 hover:text-white transition">Articles</a>
      <a href="#" class="text-sm text-slate-300 hover:text-white transition">Categories</a>
      <a href="#" class="text-sm text-slate-300 hover:text-white transition">About</a>
      <a href="#" class="text-sm text-slate-300 hover:text-white transition">Contact</a>
    </div>
    <button class="px-4 py-2 bg-blue-500 text-sm font-semibold rounded-lg hover:bg-blue-600 transition">Subscribe</button>
  </div>
</nav>

<!-- FEATURED POST -->
<section class="py-16 px-6">
  <div class="max-w-6xl mx-auto">
    <article class="grid lg:grid-cols-2 gap-12 items-center">
      <div class="aspect-video bg-slate-800 rounded-2xl overflow-hidden">
        <img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80" alt="Featured" class="w-full h-full object-cover"/>
      </div>
      <div>
        <div class="flex items-center gap-3 mb-4">
          <span class="px-3 py-1 bg-blue-500/10 text-blue-400 text-sm font-medium rounded-full">Featured</span>
          <span class="text-slate-500 text-sm">Dec 20, 2025</span>
        </div>
        <h1 class="text-4xl font-bold mb-4">The Future of Web Development in 2025 and Beyond</h1>
        <p class="text-lg text-slate-400 mb-6">Exploring emerging trends, frameworks, and technologies that are reshaping how we build for the web.</p>
        <div class="flex items-center gap-4">
          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80" alt="Author" class="w-10 h-10 rounded-full"/>
          <div><p class="font-semibold">John Smith</p><p class="text-sm text-slate-500">10 min read</p></div>
        </div>
      </div>
    </article>
  </div>
</section>

<!-- CATEGORIES -->
<section class="py-8 px-6 border-y border-white/5">
  <div class="max-w-6xl mx-auto flex flex-wrap gap-3 justify-center">
    <button class="px-4 py-2 bg-blue-500 text-sm font-medium rounded-full">All</button>
    <button class="px-4 py-2 bg-slate-800 text-sm font-medium rounded-full hover:bg-slate-700 transition">Technology</button>
    <button class="px-4 py-2 bg-slate-800 text-sm font-medium rounded-full hover:bg-slate-700 transition">Design</button>
    <button class="px-4 py-2 bg-slate-800 text-sm font-medium rounded-full hover:bg-slate-700 transition">Development</button>
    <button class="px-4 py-2 bg-slate-800 text-sm font-medium rounded-full hover:bg-slate-700 transition">AI & ML</button>
    <button class="px-4 py-2 bg-slate-800 text-sm font-medium rounded-full hover:bg-slate-700 transition">Tutorials</button>
  </div>
</section>

<!-- LATEST ARTICLES -->
<section class="py-16 px-6">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-2xl font-bold mb-8">Latest Articles</h2>
    <div class="grid md:grid-cols-3 gap-8">
      <article class="group">
        <div class="aspect-video bg-slate-800 rounded-xl mb-4 overflow-hidden"><img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80" alt="Post" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"/></div>
        <div class="flex items-center gap-2 mb-2"><span class="text-blue-400 text-xs font-medium">Technology</span><span class="text-slate-500 text-xs">Dec 18, 2025</span></div>
        <h3 class="font-bold text-lg mb-2 group-hover:text-blue-400 transition">Getting Started with AI-Powered Development Tools</h3>
        <p class="text-sm text-slate-400 line-clamp-2">Learn how to integrate AI assistants into your development workflow for maximum productivity.</p>
      </article>
      <article class="group">
        <div class="aspect-video bg-slate-800 rounded-xl mb-4 overflow-hidden"><img src="https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&q=80" alt="Post" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"/></div>
        <div class="flex items-center gap-2 mb-2"><span class="text-blue-400 text-xs font-medium">Design</span><span class="text-slate-500 text-xs">Dec 15, 2025</span></div>
        <h3 class="font-bold text-lg mb-2 group-hover:text-blue-400 transition">Building Scalable Design Systems</h3>
        <p class="text-sm text-slate-400 line-clamp-2">A comprehensive guide to creating design systems that grow with your product.</p>
      </article>
      <article class="group">
        <div class="aspect-video bg-slate-800 rounded-xl mb-4 overflow-hidden"><img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80" alt="Post" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"/></div>
        <div class="flex items-center gap-2 mb-2"><span class="text-blue-400 text-xs font-medium">Development</span><span class="text-slate-500 text-xs">Dec 12, 2025</span></div>
        <h3 class="font-bold text-lg mb-2 group-hover:text-blue-400 transition">Modern CSS Techniques You Should Know</h3>
        <p class="text-sm text-slate-400 line-clamp-2">Explore the latest CSS features that make building layouts easier than ever.</p>
      </article>
      <article class="group">
        <div class="aspect-video bg-slate-800 rounded-xl mb-4 overflow-hidden"><img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80" alt="Post" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"/></div>
        <div class="flex items-center gap-2 mb-2"><span class="text-blue-400 text-xs font-medium">Tutorials</span><span class="text-slate-500 text-xs">Dec 10, 2025</span></div>
        <h3 class="font-bold text-lg mb-2 group-hover:text-blue-400 transition">Building a Full-Stack App with Next.js</h3>
        <p class="text-sm text-slate-400 line-clamp-2">Step-by-step guide to building a production-ready application.</p>
      </article>
      <article class="group">
        <div class="aspect-video bg-slate-800 rounded-xl mb-4 overflow-hidden"><img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80" alt="Post" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"/></div>
        <div class="flex items-center gap-2 mb-2"><span class="text-blue-400 text-xs font-medium">AI & ML</span><span class="text-slate-500 text-xs">Dec 8, 2025</span></div>
        <h3 class="font-bold text-lg mb-2 group-hover:text-blue-400 transition">Understanding Large Language Models</h3>
        <p class="text-sm text-slate-400 line-clamp-2">A deep dive into how LLMs work and their applications.</p>
      </article>
      <article class="group">
        <div class="aspect-video bg-slate-800 rounded-xl mb-4 overflow-hidden"><img src="https://images.unsplash.com/photo-1559028012-481c04fa702d?w=400&q=80" alt="Post" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"/></div>
        <div class="flex items-center gap-2 mb-2"><span class="text-blue-400 text-xs font-medium">Design</span><span class="text-slate-500 text-xs">Dec 5, 2025</span></div>
        <h3 class="font-bold text-lg mb-2 group-hover:text-blue-400 transition">Typography Best Practices for Web</h3>
        <p class="text-sm text-slate-400 line-clamp-2">Master the art of typography to create beautiful web experiences.</p>
      </article>
    </div>
    <div class="text-center mt-12">
      <button class="px-8 py-3 border border-white/20 rounded-lg font-semibold hover:bg-white/5 transition">Load More Articles</button>
    </div>
  </div>
</section>

<!-- NEWSLETTER -->
<section class="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
  <div class="max-w-4xl mx-auto text-center">
    <h2 class="text-4xl font-bold mb-4">Stay Updated</h2>
    <p class="text-xl text-white/80 mb-8">Get the latest articles delivered straight to your inbox. No spam, just quality content.</p>
    <form class="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
      <input type="email" placeholder="Enter your email" class="flex-1 px-5 py-4 bg-white/10 border border-white/20 rounded-lg focus:border-white outline-none placeholder:text-white/60"/>
      <button class="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-slate-100 transition">Subscribe</button>
    </form>
    <p class="text-sm text-white/60 mt-4">Join 10,000+ developers already subscribed</p>
  </div>
</section>

<!-- FOOTER -->
<footer class="py-16 px-6 border-t border-white/5">
  <div class="max-w-6xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
    <div><h4 class="text-xl font-bold text-blue-400 mb-4">The Blog</h4><p class="text-sm text-slate-500">Insights on technology, design, and development.</p></div>
    <div><h5 class="font-semibold mb-4">Categories</h5><ul class="space-y-2 text-sm text-slate-400"><li><a href="#" class="hover:text-white">Technology</a></li><li><a href="#" class="hover:text-white">Design</a></li><li><a href="#" class="hover:text-white">Development</a></li></ul></div>
    <div><h5 class="font-semibold mb-4">Links</h5><ul class="space-y-2 text-sm text-slate-400"><li><a href="#" class="hover:text-white">About</a></li><li><a href="#" class="hover:text-white">Contact</a></li><li><a href="#" class="hover:text-white">RSS Feed</a></li></ul></div>
    <div><h5 class="font-semibold mb-4">Follow Us</h5><div class="flex gap-4"><a href="#" class="text-slate-400 hover:text-white">Twitter</a><a href="#" class="text-slate-400 hover:text-white">GitHub</a></div></div>
  </div>
  <div class="max-w-6xl mx-auto pt-8 border-t border-white/5 text-center text-sm text-slate-500">© 2025 The Blog. All rights reserved.</div>
</footer>
    `, "Modern Blog"),
  },
];
