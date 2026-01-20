/**
 * Intent Test Template
 * 
 * A test template with various buttons to verify the global intent listener
 * is automatically wiring buttons to intents based on their labels.
 */

export const intentTestTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Global Intent Listener Test</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen p-8">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold text-white mb-2">🎯 Global Intent Listener Test</h1>
    <p class="text-slate-400 mb-8">Click any button below to test automatic intent wiring. Watch for toast notifications!</p>
    
    <!-- Section: E-commerce Intents -->
    <div class="bg-white/10 rounded-xl p-6 mb-6">
      <h2 class="text-xl font-semibold text-white mb-4">🛒 E-commerce Actions</h2>
      <div class="flex flex-wrap gap-3">
        <button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
          Add to Cart
        </button>
        <button class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
          Buy Now
        </button>
        <button class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
          Shop Now
        </button>
        <button class="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
          View Cart
        </button>
      </div>
    </div>
    
    <!-- Section: Lead Generation -->
    <div class="bg-white/10 rounded-xl p-6 mb-6">
      <h2 class="text-xl font-semibold text-white mb-4">📧 Lead Generation</h2>
      <div class="flex flex-wrap gap-3">
        <button class="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
          Subscribe
        </button>
        <button class="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
          Join Waitlist
        </button>
        <button class="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
          Get Started
        </button>
        <button class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
          Contact Us
        </button>
      </div>
    </div>
    
    <!-- Section: Booking & Services -->
    <div class="bg-white/10 rounded-xl p-6 mb-6">
      <h2 class="text-xl font-semibold text-white mb-4">📅 Booking & Services</h2>
      <div class="flex flex-wrap gap-3">
        <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
          Book Now
        </button>
        <button class="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
          Reserve Table
        </button>
        <button class="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
          Get Quote
        </button>
        <button class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
          Get Free Quote
        </button>
      </div>
    </div>
    
    <!-- Section: Auth -->
    <div class="bg-white/10 rounded-xl p-6 mb-6">
      <h2 class="text-xl font-semibold text-white mb-4">🔐 Authentication</h2>
      <div class="flex flex-wrap gap-3">
        <button class="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
          Sign In
        </button>
        <button class="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
          Sign Up
        </button>
        <button class="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
          Log In
        </button>
      </div>
    </div>
    
    <!-- Section: Explicit data-intent -->
    <div class="bg-white/10 rounded-xl p-6 mb-6">
      <h2 class="text-xl font-semibold text-white mb-4">🎯 Explicit data-intent Attributes</h2>
      <p class="text-slate-400 text-sm mb-4">These buttons use data-intent for explicit control</p>
      <div class="flex flex-wrap gap-3">
        <button data-intent="trial.start" class="bg-lime-600 hover:bg-lime-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
          Start Trial (data-intent)
        </button>
        <button data-intent="demo.request" class="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
          Request Demo (data-intent)
        </button>
        <button data-intent="none" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
          Ignored Button (data-intent="none")
        </button>
      </div>
    </div>
    
    <!-- Section: With payload data -->
    <div class="bg-white/10 rounded-xl p-6 mb-6">
      <h2 class="text-xl font-semibold text-white mb-4">📦 Buttons with Payload</h2>
      <p class="text-slate-400 text-sm mb-4">These buttons pass data via data-* attributes</p>
      <div class="flex flex-wrap gap-3">
        <button 
          data-intent="cart.add" 
          data-product-id="prod_123" 
          data-product-name="Awesome Widget"
          data-price="29.99"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
          Add Widget to Cart ($29.99)
        </button>
        <button 
          data-intent="booking.create"
          data-service-id="svc_456"
          data-service-name="Consultation"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
          Book Consultation
        </button>
      </div>
    </div>
    
    <!-- Section: Form Test -->
    <div class="bg-white/10 rounded-xl p-6 mb-6">
      <h2 class="text-xl font-semibold text-white mb-4">📝 Form Auto-Detection</h2>
      <p class="text-slate-400 text-sm mb-4">Forms auto-detect intent from id/class names</p>
      
      <form id="newsletter-form" class="flex gap-2 mb-4">
        <input type="email" name="email" placeholder="Enter your email" 
          class="flex-1 px-4 py-3 rounded-lg bg-white/20 text-white placeholder-slate-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <button type="submit" class="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
          Subscribe
        </button>
      </form>
      
      <form id="contact-form" class="space-y-3">
        <input type="text" name="name" placeholder="Your name" 
          class="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-slate-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <input type="email" name="email" placeholder="Your email" 
          class="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-slate-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <textarea name="message" placeholder="Your message" rows="3"
          class="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-slate-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        <button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
          Send Message
        </button>
      </form>
    </div>
    
    <!-- Info Panel -->
    <div class="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-6">
      <h3 class="text-lg font-semibold text-emerald-400 mb-2">✅ How It Works</h3>
      <ul class="text-slate-300 text-sm space-y-2">
        <li>• <strong>Auto-inference:</strong> Buttons infer intent from text (e.g., "Add to Cart" → cart.add)</li>
        <li>• <strong>Explicit control:</strong> Use data-intent="intent.name" for precise mapping</li>
        <li>• <strong>Ignore buttons:</strong> Set data-intent="none" to skip wiring</li>
        <li>• <strong>Payload collection:</strong> data-* attributes are collected and sent with intent</li>
        <li>• <strong>Form detection:</strong> Forms with id="contact-form", "newsletter-form", etc. auto-detect intent</li>
        <li>• <strong>Visual feedback:</strong> Loading, success, and error states shown automatically</li>
      </ul>
    </div>
  </div>
</body>
</html>
`;

export default intentTestTemplate;
