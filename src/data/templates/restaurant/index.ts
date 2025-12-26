/**
 * Restaurant Templates
 * Fine dining and restaurant website templates
 */

import { LayoutTemplate } from '../types';
import { wrapInHtmlDoc } from '../utils';

export const restaurantTemplates: LayoutTemplate[] = [
  {
    id: "restaurant-modern",
    name: "Restaurant (Full)",
    category: "restaurant",
    description: "Complete restaurant: Nav, Hero, Menu, About, Gallery, Reservations, Footer",
    tags: ["restaurant", "food", "menu", "complete"],
    code: wrapInHtmlDoc(`
<!-- NAVIGATION -->
<nav class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-white/5">
  <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
    <a href="#" class="text-2xl font-serif text-amber-400">La Maison</a>
    <div class="hidden md:flex items-center gap-8">
      <a href="#menu" class="text-sm text-slate-300 hover:text-amber-400 transition">Menu</a>
      <a href="#about" class="text-sm text-slate-300 hover:text-amber-400 transition">About</a>
      <a href="#gallery" class="text-sm text-slate-300 hover:text-amber-400 transition">Gallery</a>
      <a href="#contact" class="text-sm text-slate-300 hover:text-amber-400 transition">Contact</a>
    </div>
    <button class="px-5 py-2 bg-amber-500 text-black text-sm font-semibold rounded hover:bg-amber-400 transition">Reserve Table</button>
  </div>
</nav>

<!-- HERO -->
<section class="relative h-screen flex items-center justify-center text-center">
  <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80" alt="Restaurant" class="absolute inset-0 w-full h-full object-cover"/>
  <div class="absolute inset-0 bg-black/60"></div>
  <div class="relative z-10 px-6 max-w-4xl">
    <span class="text-amber-400 text-sm uppercase tracking-widest mb-4 block">Est. 1985</span>
    <h1 class="text-5xl md:text-7xl font-serif mb-6">Fine Dining Experience</h1>
    <p class="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">Where culinary artistry meets exceptional service in an unforgettable atmosphere</p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="#menu" class="px-8 py-4 bg-amber-500 text-black rounded font-semibold hover:bg-amber-400 transition">View Menu</a>
      <a href="#reserve" class="px-8 py-4 border-2 border-white/30 rounded font-semibold hover:bg-white/10 transition">Make Reservation</a>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="py-20 px-6 bg-slate-900">
  <div class="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
    <div class="p-8"><div class="text-4xl mb-4">🍽️</div><h3 class="text-xl font-serif mb-2">Exquisite Cuisine</h3><p class="text-slate-400">Award-winning dishes crafted by world-class chefs</p></div>
    <div class="p-8"><div class="text-4xl mb-4">🍷</div><h3 class="text-xl font-serif mb-2">Fine Wines</h3><p class="text-slate-400">Curated selection of 500+ wines from around the world</p></div>
    <div class="p-8"><div class="text-4xl mb-4">⭐</div><h3 class="text-xl font-serif mb-2">Michelin Starred</h3><p class="text-slate-400">Recognized for culinary excellence since 2010</p></div>
  </div>
</section>

<!-- MENU -->
<section id="menu" class="py-24 px-6">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-16">
      <span class="text-amber-400 text-sm uppercase tracking-widest">Our Menu</span>
      <h2 class="text-4xl font-serif mt-4">Signature Dishes</h2>
    </div>
    <div class="grid md:grid-cols-2 gap-12">
      <div>
        <h3 class="text-2xl font-serif text-amber-400 mb-8 border-b border-white/10 pb-4">Starters</h3>
        <div class="space-y-6">
          <div class="flex justify-between items-start"><div><h4 class="font-semibold mb-1">Truffle Soup</h4><p class="text-sm text-slate-400">Black truffle, cream, herbs</p></div><span class="text-amber-400 font-semibold">$24</span></div>
          <div class="flex justify-between items-start"><div><h4 class="font-semibold mb-1">Oysters Royale</h4><p class="text-sm text-slate-400">Fresh oysters, champagne mignonette</p></div><span class="text-amber-400 font-semibold">$32</span></div>
          <div class="flex justify-between items-start"><div><h4 class="font-semibold mb-1">Foie Gras Torchon</h4><p class="text-sm text-slate-400">Brioche, fig compote</p></div><span class="text-amber-400 font-semibold">$38</span></div>
        </div>
      </div>
      <div>
        <h3 class="text-2xl font-serif text-amber-400 mb-8 border-b border-white/10 pb-4">Main Courses</h3>
        <div class="space-y-6">
          <div class="flex justify-between items-start"><div><h4 class="font-semibold mb-1">Wagyu Ribeye</h4><p class="text-sm text-slate-400">A5 Japanese wagyu, truffle jus</p></div><span class="text-amber-400 font-semibold">$120</span></div>
          <div class="flex justify-between items-start"><div><h4 class="font-semibold mb-1">Dover Sole</h4><p class="text-sm text-slate-400">Butter, capers, lemon</p></div><span class="text-amber-400 font-semibold">$68</span></div>
          <div class="flex justify-between items-start"><div><h4 class="font-semibold mb-1">Lamb Rack</h4><p class="text-sm text-slate-400">Herb crust, seasonal vegetables</p></div><span class="text-amber-400 font-semibold">$72</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ABOUT -->
<section id="about" class="py-24 px-6 bg-slate-900/50">
  <div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
    <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80" alt="Chef" class="rounded-2xl"/>
    <div>
      <span class="text-amber-400 text-sm uppercase tracking-widest">Our Story</span>
      <h2 class="text-4xl font-serif mt-4 mb-6">A Legacy of Excellence</h2>
      <p class="text-slate-400 mb-6">Founded in 1985 by Chef Pierre Laurent, La Maison has been serving extraordinary French cuisine for over three decades. Our commitment to quality and innovation has earned us recognition from critics and food lovers worldwide.</p>
      <p class="text-slate-400 mb-8">Every dish tells a story of tradition, craftsmanship, and passion for culinary arts.</p>
      <div class="flex gap-8">
        <div><p class="text-3xl font-bold text-amber-400">40+</p><p class="text-sm text-slate-500">Years Experience</p></div>
        <div><p class="text-3xl font-bold text-amber-400">3</p><p class="text-sm text-slate-500">Michelin Stars</p></div>
        <div><p class="text-3xl font-bold text-amber-400">50K+</p><p class="text-sm text-slate-500">Happy Guests</p></div>
      </div>
    </div>
  </div>
</section>

<!-- GALLERY -->
<section id="gallery" class="py-24 px-6">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-16">
      <span class="text-amber-400 text-sm uppercase tracking-widest">Gallery</span>
      <h2 class="text-4xl font-serif mt-4">Culinary Art</h2>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80" alt="Dish" class="rounded-xl aspect-square object-cover hover:opacity-80 transition"/>
      <img src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80" alt="Dish" class="rounded-xl aspect-square object-cover hover:opacity-80 transition"/>
      <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80" alt="Dish" class="rounded-xl aspect-square object-cover hover:opacity-80 transition"/>
      <img src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80" alt="Dish" class="rounded-xl aspect-square object-cover hover:opacity-80 transition"/>
    </div>
  </div>
</section>

<!-- RESERVATION -->
<section id="reserve" class="py-24 px-6 bg-amber-500 text-black">
  <div class="max-w-4xl mx-auto text-center">
    <h2 class="text-4xl font-serif mb-6">Make a Reservation</h2>
    <p class="text-lg mb-8 opacity-80">Book your table for an unforgettable dining experience</p>
    <form class="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
      <input type="text" placeholder="Your Name" class="px-5 py-4 bg-white rounded text-black"/>
      <input type="date" class="px-5 py-4 bg-white rounded text-black"/>
      <select class="px-5 py-4 bg-white rounded text-black"><option>2 Guests</option><option>4 Guests</option><option>6 Guests</option><option>8+ Guests</option></select>
    </form>
    <button class="mt-6 px-8 py-4 bg-black text-white rounded font-semibold hover:bg-slate-800 transition">Reserve Now</button>
  </div>
</section>

<!-- FOOTER -->
<footer class="py-16 px-6 border-t border-white/5">
  <div class="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
    <div><h4 class="text-2xl font-serif text-amber-400 mb-4">La Maison</h4><p class="text-sm text-slate-500">Fine dining since 1985</p></div>
    <div><h5 class="font-semibold mb-4">Hours</h5><p class="text-sm text-slate-400">Tue-Thu: 6PM - 10PM</p><p class="text-sm text-slate-400">Fri-Sat: 6PM - 11PM</p><p class="text-sm text-slate-400">Sun-Mon: Closed</p></div>
    <div><h5 class="font-semibold mb-4">Contact</h5><p class="text-sm text-slate-400">123 Gourmet Street</p><p class="text-sm text-slate-400">New York, NY 10001</p><p class="text-sm text-slate-400">(555) 123-4567</p></div>
  </div>
</footer>
    `, "Restaurant"),
  },
];
