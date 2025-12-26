/**
 * E-Commerce Templates
 * Online store and shopping templates
 */

import { LayoutTemplate } from '../types';
import { wrapInHtmlDoc } from '../utils';

export const ecommerceTemplates: LayoutTemplate[] = [
  {
    id: "ecommerce-store",
    name: "E-Commerce (Full)",
    category: "ecommerce",
    description: "Complete store: Nav, Hero, Products, Categories, Features, Newsletter, Footer",
    tags: ["ecommerce", "shop", "products", "complete"],
    code: wrapInHtmlDoc(`
<!-- ANNOUNCEMENT BAR -->
<div class="bg-amber-500 text-black text-center py-2 text-sm font-medium">Free shipping on orders over $100 | Use code SAVE20 for 20% off</div>

<!-- NAVIGATION -->
<nav class="sticky top-0 z-50 bg-slate-950 border-b border-white/10">
  <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
    <a href="#" class="text-2xl font-bold">LUXE</a>
    <div class="hidden md:flex items-center gap-8">
      <a href="#" class="text-sm text-slate-300 hover:text-white transition">New Arrivals</a>
      <a href="#" class="text-sm text-slate-300 hover:text-white transition">Men</a>
      <a href="#" class="text-sm text-slate-300 hover:text-white transition">Women</a>
      <a href="#" class="text-sm text-slate-300 hover:text-white transition">Accessories</a>
      <a href="#" class="text-sm text-slate-300 hover:text-white transition">Sale</a>
    </div>
    <div class="flex items-center gap-4">
      <button class="text-slate-300 hover:text-white">🔍</button>
      <button class="text-slate-300 hover:text-white">👤</button>
      <button class="relative text-slate-300 hover:text-white">🛒<span class="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 text-black text-xs rounded-full flex items-center justify-center">3</span></button>
    </div>
  </div>
</nav>

<!-- HERO -->
<section class="relative h-[80vh] flex items-center">
  <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80" alt="Store" class="absolute inset-0 w-full h-full object-cover"/>
  <div class="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent"></div>
  <div class="relative z-10 px-6 max-w-2xl ml-6 lg:ml-24">
    <span class="inline-block px-4 py-1 bg-amber-500 text-black text-sm font-semibold rounded mb-4">NEW COLLECTION</span>
    <h1 class="text-5xl md:text-7xl font-bold mb-4">Summer Essentials 2025</h1>
    <p class="text-xl text-slate-300 mb-8">Discover timeless pieces crafted for the modern lifestyle. Quality meets elegance.</p>
    <div class="flex gap-4">
      <button class="px-8 py-4 bg-white text-black rounded font-semibold hover:bg-slate-200 transition">Shop Collection</button>
      <button class="px-8 py-4 border border-white/30 rounded font-semibold hover:bg-white/10 transition">View Lookbook</button>
    </div>
  </div>
</section>

<!-- CATEGORIES -->
<section class="py-20 px-6">
  <div class="max-w-7xl mx-auto">
    <h2 class="text-3xl font-bold text-center mb-12">Shop by Category</h2>
    <div class="grid md:grid-cols-4 gap-6">
      <div class="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer">
        <img src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80" alt="Shirts" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
        <div class="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>
        <div class="absolute bottom-6 left-6"><h3 class="text-xl font-bold">Shirts</h3><p class="text-sm text-slate-300">120+ items</p></div>
      </div>
      <div class="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer">
        <img src="https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80" alt="Pants" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
        <div class="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>
        <div class="absolute bottom-6 left-6"><h3 class="text-xl font-bold">Pants</h3><p class="text-sm text-slate-300">85+ items</p></div>
      </div>
      <div class="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer">
        <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80" alt="Shoes" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
        <div class="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>
        <div class="absolute bottom-6 left-6"><h3 class="text-xl font-bold">Shoes</h3><p class="text-sm text-slate-300">200+ items</p></div>
      </div>
      <div class="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer">
        <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80" alt="Accessories" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
        <div class="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>
        <div class="absolute bottom-6 left-6"><h3 class="text-xl font-bold">Accessories</h3><p class="text-sm text-slate-300">150+ items</p></div>
      </div>
    </div>
  </div>
</section>

<!-- FEATURED PRODUCTS -->
<section class="py-20 px-6 bg-slate-900/50">
  <div class="max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-12">
      <h2 class="text-3xl font-bold">Featured Products</h2>
      <a href="#" class="text-amber-400 hover:underline">View All →</a>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div class="group">
        <div class="relative aspect-[3/4] bg-slate-800 rounded-xl mb-4 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80" alt="Product" class="w-full h-full object-cover group-hover:scale-105 transition"/>
          <span class="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-black text-xs font-semibold rounded">NEW</span>
          <button class="absolute bottom-3 right-3 w-10 h-10 bg-white text-black rounded-full opacity-0 group-hover:opacity-100 transition">+</button>
        </div>
        <h3 class="font-medium mb-1">Classic White Tee</h3>
        <p class="text-amber-400 font-semibold">$49.00</p>
      </div>
      <div class="group">
        <div class="relative aspect-[3/4] bg-slate-800 rounded-xl mb-4 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80" alt="Product" class="w-full h-full object-cover group-hover:scale-105 transition"/>
          <button class="absolute bottom-3 right-3 w-10 h-10 bg-white text-black rounded-full opacity-0 group-hover:opacity-100 transition">+</button>
        </div>
        <h3 class="font-medium mb-1">Leather Watch</h3>
        <div class="flex items-center gap-2"><span class="text-amber-400 font-semibold">$199.00</span><span class="text-slate-500 line-through text-sm">$249.00</span></div>
      </div>
      <div class="group">
        <div class="relative aspect-[3/4] bg-slate-800 rounded-xl mb-4 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80" alt="Product" class="w-full h-full object-cover group-hover:scale-105 transition"/>
          <span class="absolute top-3 left-3 px-2 py-1 bg-rose-500 text-white text-xs font-semibold rounded">SALE</span>
          <button class="absolute bottom-3 right-3 w-10 h-10 bg-white text-black rounded-full opacity-0 group-hover:opacity-100 transition">+</button>
        </div>
        <h3 class="font-medium mb-1">Designer Sunglasses</h3>
        <div class="flex items-center gap-2"><span class="text-amber-400 font-semibold">$89.00</span><span class="text-slate-500 line-through text-sm">$129.00</span></div>
      </div>
      <div class="group">
        <div class="relative aspect-[3/4] bg-slate-800 rounded-xl mb-4 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&q=80" alt="Product" class="w-full h-full object-cover group-hover:scale-105 transition"/>
          <button class="absolute bottom-3 right-3 w-10 h-10 bg-white text-black rounded-full opacity-0 group-hover:opacity-100 transition">+</button>
        </div>
        <h3 class="font-medium mb-1">Premium Sneakers</h3>
        <p class="text-amber-400 font-semibold">$159.00</p>
      </div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="py-16 px-6 border-y border-white/10">
  <div class="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 text-center">
    <div><div class="text-3xl mb-3">🚚</div><h3 class="font-semibold mb-1">Free Shipping</h3><p class="text-sm text-slate-400">On orders over $100</p></div>
    <div><div class="text-3xl mb-3">↩️</div><h3 class="font-semibold mb-1">Easy Returns</h3><p class="text-sm text-slate-400">30-day return policy</p></div>
    <div><div class="text-3xl mb-3">🔒</div><h3 class="font-semibold mb-1">Secure Payment</h3><p class="text-sm text-slate-400">256-bit SSL encryption</p></div>
    <div><div class="text-3xl mb-3">💬</div><h3 class="font-semibold mb-1">24/7 Support</h3><p class="text-sm text-slate-400">Always here to help</p></div>
  </div>
</section>

<!-- NEWSLETTER -->
<section class="py-24 px-6">
  <div class="max-w-4xl mx-auto text-center">
    <h2 class="text-4xl font-bold mb-4">Join Our Newsletter</h2>
    <p class="text-slate-400 mb-8">Subscribe and get 15% off your first order plus exclusive access to new arrivals.</p>
    <form class="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
      <input type="email" placeholder="Enter your email" class="flex-1 px-5 py-4 bg-slate-900 border border-white/10 rounded-lg focus:border-amber-500 outline-none"/>
      <button class="px-8 py-4 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition">Subscribe</button>
    </form>
  </div>
</section>

<!-- FOOTER -->
<footer class="py-16 px-6 bg-slate-900 border-t border-white/5">
  <div class="max-w-7xl mx-auto grid md:grid-cols-5 gap-12 mb-12">
    <div class="md:col-span-2"><h4 class="text-2xl font-bold mb-4">LUXE</h4><p class="text-sm text-slate-500 mb-4">Premium fashion for the modern lifestyle. Quality craftsmanship since 2010.</p><div class="flex gap-4"><a href="#" class="text-slate-400 hover:text-white">FB</a><a href="#" class="text-slate-400 hover:text-white">IG</a><a href="#" class="text-slate-400 hover:text-white">TW</a></div></div>
    <div><h5 class="font-semibold mb-4">Shop</h5><ul class="space-y-2 text-sm text-slate-400"><li><a href="#" class="hover:text-white">New Arrivals</a></li><li><a href="#" class="hover:text-white">Best Sellers</a></li><li><a href="#" class="hover:text-white">Sale</a></li></ul></div>
    <div><h5 class="font-semibold mb-4">Help</h5><ul class="space-y-2 text-sm text-slate-400"><li><a href="#" class="hover:text-white">FAQ</a></li><li><a href="#" class="hover:text-white">Shipping</a></li><li><a href="#" class="hover:text-white">Returns</a></li></ul></div>
    <div><h5 class="font-semibold mb-4">Company</h5><ul class="space-y-2 text-sm text-slate-400"><li><a href="#" class="hover:text-white">About</a></li><li><a href="#" class="hover:text-white">Careers</a></li><li><a href="#" class="hover:text-white">Contact</a></li></ul></div>
  </div>
  <div class="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
    <p class="text-sm text-slate-500">© 2025 LUXE. All rights reserved.</p>
    <div class="flex gap-4 text-sm text-slate-500"><a href="#" class="hover:text-white">Privacy</a><a href="#" class="hover:text-white">Terms</a></div>
  </div>
</footer>
    `, "E-Commerce Store"),
  },
];
