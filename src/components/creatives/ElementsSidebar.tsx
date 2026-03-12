/**
 * Elements Sidebar - Intent-Prewired Drag & Drop Component Library
 *
 * Every element maps to a Unison Tasks Core Intent so it arrives on the
 * preview surface fully wired end-to-end (data-ut-intent, payload attrs,
 * CTA labels).  Builders drag an element → it appears in the preview with
 * its intent already bound → inline editing lets them customise copy/style.
 *
 * Intent categories mirror coreIntents.ts:
 *   Navigation · Payment · Actions · Automation · Content · Media
 */

import React, { useState, useMemo } from 'react';
import {
  Menu,
  Layers,
  Type,
  Image,
  Video,
  Square,
  Grid3x3,
  Layout,
  Navigation,
  Users,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Star,
  Heart,
  ShoppingCart,
  CreditCard,
  Smartphone,
  Monitor,
  Globe,
  Zap,
  Award,
  Target,
  TrendingUp,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  ChevronDown,
  ChevronRight,
  Plus,
  GripVertical,
  Sparkles,
  LogIn,
  UserPlus,
  CalendarCheck,
  FileText,
  BellRing,
  ClipboardList,
  Workflow,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AIImageGeneratorDialog } from './AIImageGeneratorDialog';

// ============================================================================
// Types
// ============================================================================

export type IntentCategory =
  | 'navigation'
  | 'payment'
  | 'actions'
  | 'automation'
  | 'content'
  | 'media';

export interface WebElement {
  id: string;
  name: string;
  category: IntentCategory;
  icon: React.ReactNode;
  description: string;
  htmlTemplate: string;
  tags: string[];
  isPro?: boolean;
  /** The core intent this element is prewired to (matches coreIntents.ts) */
  intent?: string;
  /** CTA tracking label baked into the template */
  ctaLabel?: string;
  /** Human-readable intent label shown on the card badge */
  intentLabel?: string;
}

/** @deprecated kept for back-compat imports */
export type ElementCategory = IntentCategory;

interface ElementsSidebarProps {
  onElementDragStart?: (element: WebElement) => void;
  onElementDragEnd?: () => void;
  onElementClick?: (element: WebElement) => void;
  onAIImageGenerated?: (imageUrl: string, metadata?: Record<string, unknown>) => void;
}

// ============================================================================
// Intent-prewired Element Library
// ============================================================================

const ELEMENT_LIBRARY: WebElement[] = [
  // ── NAVIGATION ─────────────────────────────────────────────────────────
  {
    id: 'nav-floating',
    name: 'Floating Navigation',
    category: 'navigation',
    icon: <Navigation className="w-5 h-5" />,
    description: 'Fixed navbar with internal page links',
    tags: ['navbar', 'fixed', 'sticky', 'header'],
    intent: 'nav.goto',
    ctaLabel: 'cta.nav',
    intentLabel: 'Navigate',
    htmlTemplate: `<nav data-ut-intent="nav.goto" data-ut-cta="cta.nav" class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/90 shadow-lg">
  <div class="container mx-auto px-6 py-4 flex items-center justify-between">
    <a href="#" class="text-2xl font-bold">Logo</a>
    <div class="hidden md:flex space-x-8">
      <a href="#" data-ut-intent="nav.goto" data-ut-path="/home" class="hover:text-blue-600 transition">Home</a>
      <a href="#" data-ut-intent="nav.goto" data-ut-path="/about" class="hover:text-blue-600 transition">About</a>
      <a href="#" data-ut-intent="nav.goto" data-ut-path="/services" class="hover:text-blue-600 transition">Services</a>
      <a href="#" data-ut-intent="nav.goto" data-ut-path="/contact" class="hover:text-blue-600 transition">Contact</a>
    </div>
    <button data-ut-intent="nav.anchor" data-ut-anchor="#cta" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Get Started</button>
  </div>
</nav>`,
  },
  {
    id: 'nav-sidebar',
    name: 'Sidebar Menu',
    category: 'navigation',
    icon: <Menu className="w-5 h-5" />,
    description: 'Vertical sidebar with route links',
    tags: ['sidebar', 'vertical', 'menu'],
    intent: 'nav.goto',
    ctaLabel: 'cta.nav',
    intentLabel: 'Navigate',
    htmlTemplate: `<aside data-ut-intent="nav.goto" data-ut-cta="cta.nav" class="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-6">
  <div class="mb-8"><h2 class="text-2xl font-bold">Menu</h2></div>
  <nav class="space-y-2">
    <a href="#" data-ut-intent="nav.goto" data-ut-path="/dashboard" class="block py-3 px-4 rounded-lg hover:bg-gray-800 transition">Dashboard</a>
    <a href="#" data-ut-intent="nav.goto" data-ut-path="/projects" class="block py-3 px-4 rounded-lg hover:bg-gray-800 transition">Projects</a>
    <a href="#" data-ut-intent="nav.goto" data-ut-path="/team" class="block py-3 px-4 rounded-lg hover:bg-gray-800 transition">Team</a>
    <a href="#" data-ut-intent="nav.goto" data-ut-path="/settings" class="block py-3 px-4 rounded-lg hover:bg-gray-800 transition">Settings</a>
  </nav>
</aside>`,
  },
  {
    id: 'nav-tabs',
    name: 'Tab Navigation',
    category: 'navigation',
    icon: <Layers className="w-5 h-5" />,
    description: 'Horizontal tab navigation with anchor intents',
    tags: ['tabs', 'horizontal', 'switcher'],
    intent: 'nav.anchor',
    ctaLabel: 'cta.nav',
    intentLabel: 'Anchor',
    htmlTemplate: `<div data-ut-intent="nav.anchor" data-ut-cta="cta.nav" class="border-b border-gray-200">
  <nav class="flex space-x-8">
    <button data-ut-intent="nav.anchor" data-ut-anchor="#overview" class="py-4 px-1 border-b-2 border-blue-600 font-semibold text-blue-600">Overview</button>
    <button data-ut-intent="nav.anchor" data-ut-anchor="#analytics" class="py-4 px-1 border-b-2 border-transparent hover:border-gray-300 transition">Analytics</button>
    <button data-ut-intent="nav.anchor" data-ut-anchor="#reports" class="py-4 px-1 border-b-2 border-transparent hover:border-gray-300 transition">Reports</button>
    <button data-ut-intent="nav.anchor" data-ut-anchor="#settings" class="py-4 px-1 border-b-2 border-transparent hover:border-gray-300 transition">Settings</button>
  </nav>
</div>`,
  },
  {
    id: 'nav-external-links',
    name: 'External Links Bar',
    category: 'navigation',
    icon: <Globe className="w-5 h-5" />,
    description: 'External link buttons opening in new tabs',
    tags: ['external', 'links', 'outbound'],
    intent: 'nav.external',
    intentLabel: 'External Link',
    htmlTemplate: `<div data-ut-intent="nav.external" class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" data-ut-intent="nav.external" data-ut-url="https://twitter.com" class="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition">Twitter / X</a>
  <a href="https://github.com" target="_blank" rel="noopener noreferrer" data-ut-intent="nav.external" data-ut-url="https://github.com" class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-700 transition">GitHub</a>
  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" data-ut-intent="nav.external" data-ut-url="https://linkedin.com" class="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm hover:bg-blue-600 transition">LinkedIn</a>
</div>`,
  },

  // ── PAYMENT ────────────────────────────────────────────────────────────
  {
    id: 'pricing-3-tier',
    name: 'Pricing Table',
    category: 'payment',
    icon: <CreditCard className="w-5 h-5" />,
    description: '3-tier pricing with checkout intents',
    tags: ['pricing', 'plans', 'checkout', 'stripe'],
    intent: 'pay.checkout',
    ctaLabel: 'cta.primary',
    intentLabel: 'Checkout',
    isPro: true,
    htmlTemplate: `<section data-ut-intent="pay.checkout" class="py-24 bg-gray-50">
  <div class="container mx-auto px-6 max-w-6xl">
    <h2 class="text-5xl font-bold text-center mb-4">Simple Pricing</h2>
    <p class="text-xl text-gray-600 text-center mb-16">Choose the plan that fits your needs</p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition">
        <h3 class="text-lg font-bold mb-2">Starter</h3>
        <p class="text-4xl font-bold mb-6">$9<span class="text-lg text-gray-500">/mo</span></p>
        <ul class="space-y-3 mb-8 text-gray-600"><li>✓ 1 Project</li><li>✓ Basic Support</li><li>✓ 1GB Storage</li></ul>
        <button data-ut-intent="pay.checkout" data-ut-cta="cta.primary" data-plan="starter" data-price-id="price_starter" class="w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition">Get Started</button>
      </div>
      <div class="bg-blue-600 text-white rounded-2xl shadow-xl p-8 scale-105 border-2 border-blue-400">
        <div class="text-xs font-bold uppercase tracking-wider mb-4 text-blue-200">Most Popular</div>
        <h3 class="text-lg font-bold mb-2">Professional</h3>
        <p class="text-4xl font-bold mb-6">$29<span class="text-lg text-blue-200">/mo</span></p>
        <ul class="space-y-3 mb-8 text-blue-100"><li>✓ 10 Projects</li><li>✓ Priority Support</li><li>✓ 50GB Storage</li></ul>
        <button data-ut-intent="pay.checkout" data-ut-cta="cta.primary" data-plan="professional" data-price-id="price_pro" class="w-full py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition">Get Started</button>
      </div>
      <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition">
        <h3 class="text-lg font-bold mb-2">Enterprise</h3>
        <p class="text-4xl font-bold mb-6">$99<span class="text-lg text-gray-500">/mo</span></p>
        <ul class="space-y-3 mb-8 text-gray-600"><li>✓ Unlimited Projects</li><li>✓ 24/7 Support</li><li>✓ 500GB Storage</li></ul>
        <button data-ut-intent="pay.checkout" data-ut-cta="cta.primary" data-plan="enterprise" data-price-id="price_enterprise" class="w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition">Contact Sales</button>
      </div>
    </div>
  </div>
</section>`,
  },

  // ── ACTIONS ────────────────────────────────────────────────────────────
  {
    id: 'hero-cta',
    name: 'Hero Section',
    category: 'actions',
    icon: <Layout className="w-5 h-5" />,
    description: 'Full-screen hero with contact & anchor intents',
    tags: ['hero', 'fullscreen', 'landing', 'banner'],
    intent: 'contact.submit',
    ctaLabel: 'cta.hero',
    intentLabel: 'Contact',
    htmlTemplate: `<section data-ut-intent="contact.submit" class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white text-center">
  <div class="max-w-4xl px-6">
    <h1 class="text-6xl font-bold mb-6">Transform Your Digital Presence</h1>
    <p class="text-2xl mb-8 opacity-90">Professional solutions for modern businesses</p>
    <div class="flex gap-4 justify-center">
      <button data-ut-intent="contact.submit" data-ut-cta="cta.hero" class="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:scale-105 transition">Get Started</button>
      <button data-ut-intent="nav.anchor" data-ut-anchor="#features" data-ut-cta="cta.hero-secondary" class="px-8 py-4 border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition">Learn More</button>
    </div>
  </div>
</section>`,
  },
  {
    id: 'contact-form',
    name: 'Contact Form',
    category: 'actions',
    icon: <Mail className="w-5 h-5" />,
    description: 'Contact form wired to contact.submit',
    tags: ['form', 'contact', 'email', 'input'],
    intent: 'contact.submit',
    ctaLabel: 'cta.primary',
    intentLabel: 'Contact',
    htmlTemplate: `<form data-ut-intent="contact.submit" data-ut-cta="cta.primary" class="bg-white p-10 rounded-2xl shadow-xl max-w-2xl">
  <h3 class="text-3xl font-bold mb-8">Get In Touch</h3>
  <div class="space-y-6">
    <div><label class="block text-sm font-semibold mb-2">Name</label><input type="text" name="name" placeholder="John Doe" class="w-full px-4 py-3 bg-gray-100 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" required /></div>
    <div><label class="block text-sm font-semibold mb-2">Email</label><input type="email" name="email" placeholder="john@example.com" class="w-full px-4 py-3 bg-gray-100 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" required /></div>
    <div><label class="block text-sm font-semibold mb-2">Message</label><textarea name="message" rows="4" placeholder="Your message..." class="w-full px-4 py-3 bg-gray-100 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none" required></textarea></div>
    <button type="submit" data-ut-intent="contact.submit" class="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Send Message</button>
  </div>
</form>`,
  },
  {
    id: 'newsletter-signup',
    name: 'Newsletter Signup',
    category: 'actions',
    icon: <BellRing className="w-5 h-5" />,
    description: 'Email capture wired to newsletter.subscribe',
    tags: ['newsletter', 'email', 'subscribe', 'waitlist'],
    intent: 'newsletter.subscribe',
    ctaLabel: 'cta.primary',
    intentLabel: 'Subscribe',
    htmlTemplate: `<section data-ut-intent="newsletter.subscribe" data-ut-cta="cta.primary" class="py-16 bg-blue-50">
  <div class="container mx-auto px-6 max-w-xl text-center">
    <h3 class="text-3xl font-bold mb-4">Stay Updated</h3>
    <p class="text-gray-600 mb-6">Get the latest news and offers delivered to your inbox.</p>
    <form class="flex gap-2" data-ut-intent="newsletter.subscribe">
      <input type="email" name="email" placeholder="you@example.com" class="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 outline-none" required />
      <button type="submit" data-ut-intent="newsletter.subscribe" class="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Subscribe</button>
    </form>
  </div>
</section>`,
  },
  {
    id: 'booking-section',
    name: 'Booking Section',
    category: 'actions',
    icon: <CalendarCheck className="w-5 h-5" />,
    description: 'Appointment / service booking wired to booking.create',
    tags: ['booking', 'appointment', 'schedule', 'service'],
    intent: 'booking.create',
    ctaLabel: 'cta.primary',
    intentLabel: 'Book',
    isPro: true,
    htmlTemplate: `<section data-ut-intent="booking.create" data-ut-cta="cta.primary" class="py-24 bg-white">
  <div class="container mx-auto px-6 max-w-4xl">
    <h2 class="text-5xl font-bold text-center mb-4">Book an Appointment</h2>
    <p class="text-xl text-gray-600 text-center mb-12">Pick a service and choose your preferred date</p>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="border border-gray-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-lg transition cursor-pointer">
        <h3 class="text-xl font-bold mb-2">Consultation</h3>
        <p class="text-gray-500 mb-4">30 min · Free</p>
        <button data-ut-intent="booking.create" data-service="consultation" class="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Book Now</button>
      </div>
      <div class="border border-gray-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-lg transition cursor-pointer">
        <h3 class="text-xl font-bold mb-2">Strategy Session</h3>
        <p class="text-gray-500 mb-4">60 min · $99</p>
        <button data-ut-intent="booking.create" data-service="strategy" class="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Book Now</button>
      </div>
      <div class="border border-gray-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-lg transition cursor-pointer">
        <h3 class="text-xl font-bold mb-2">Full Workshop</h3>
        <p class="text-gray-500 mb-4">3 hrs · $299</p>
        <button data-ut-intent="booking.create" data-service="workshop" class="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Book Now</button>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: 'quote-request',
    name: 'Quote Request',
    category: 'actions',
    icon: <ClipboardList className="w-5 h-5" />,
    description: 'Quote / estimate form wired to quote.request',
    tags: ['quote', 'estimate', 'rfq', 'form'],
    intent: 'quote.request',
    ctaLabel: 'cta.primary',
    intentLabel: 'Quote',
    htmlTemplate: `<section data-ut-intent="quote.request" data-ut-cta="cta.primary" class="py-24 bg-gray-50">
  <div class="container mx-auto px-6 max-w-2xl">
    <h2 class="text-4xl font-bold text-center mb-8">Request a Quote</h2>
    <form data-ut-intent="quote.request" class="space-y-6 bg-white p-8 rounded-2xl shadow-lg">
      <div><label class="block text-sm font-semibold mb-2">Service Type</label>
        <select name="service" class="w-full px-4 py-3 bg-gray-100 rounded-lg border border-gray-300 outline-none">
          <option>Web Design</option><option>Mobile App</option><option>Branding</option><option>Consulting</option>
        </select>
      </div>
      <div><label class="block text-sm font-semibold mb-2">Budget Range</label>
        <select name="budget" class="w-full px-4 py-3 bg-gray-100 rounded-lg border border-gray-300 outline-none">
          <option>$1k – $5k</option><option>$5k – $15k</option><option>$15k – $50k</option><option>$50k+</option>
        </select>
      </div>
      <div><label class="block text-sm font-semibold mb-2">Details</label><textarea name="details" rows="3" class="w-full px-4 py-3 bg-gray-100 rounded-lg border border-gray-300 outline-none resize-none" placeholder="Tell us about your project…"></textarea></div>
      <button type="submit" data-ut-intent="quote.request" class="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Submit Request</button>
    </form>
  </div>
</section>`,
  },
  {
    id: 'lead-capture',
    name: 'Lead Capture',
    category: 'actions',
    icon: <Target className="w-5 h-5" />,
    description: 'Lead magnet / gated content wired to lead.capture',
    tags: ['lead', 'capture', 'magnet', 'gated'],
    intent: 'lead.capture',
    ctaLabel: 'cta.primary',
    intentLabel: 'Capture Lead',
    htmlTemplate: `<section data-ut-intent="lead.capture" data-ut-cta="cta.primary" class="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
  <div class="container mx-auto px-6 max-w-xl text-center">
    <h2 class="text-4xl font-bold mb-4">Download Free Guide</h2>
    <p class="text-lg mb-8 opacity-90">Enter your email to get instant access</p>
    <form data-ut-intent="lead.capture" class="flex gap-2">
      <input type="email" name="email" placeholder="you@company.com" class="flex-1 px-4 py-3 rounded-lg text-gray-900 outline-none" required />
      <button type="submit" data-ut-intent="lead.capture" class="px-6 py-3 bg-white text-indigo-700 rounded-lg font-bold hover:bg-gray-100 transition">Get It Free</button>
    </form>
  </div>
</section>`,
  },
  {
    id: 'cta-banner',
    name: 'CTA Banner',
    category: 'actions',
    icon: <Zap className="w-5 h-5" />,
    description: 'Conversion CTA section with contact intent',
    tags: ['cta', 'conversion', 'action', 'banner'],
    intent: 'contact.submit',
    ctaLabel: 'cta.primary',
    intentLabel: 'Contact',
    htmlTemplate: `<section data-ut-intent="contact.submit" data-ut-cta="cta.primary" class="py-24 bg-blue-600 text-white text-center">
  <div class="container mx-auto px-6 max-w-4xl">
    <h2 class="text-5xl font-bold mb-6">Ready to Get Started?</h2>
    <p class="text-2xl mb-8 opacity-90">Join thousands of satisfied customers</p>
    <button data-ut-intent="contact.submit" class="px-10 py-5 bg-white text-blue-600 rounded-lg font-bold text-lg hover:scale-105 transition shadow-xl">Start Free Trial</button>
  </div>
</section>`,
  },

  // ── AUTOMATION ─────────────────────────────────────────────────────────
  {
    id: 'auth-login',
    name: 'Login Form',
    category: 'automation',
    icon: <LogIn className="w-5 h-5" />,
    description: 'Login form wired to auth.login',
    tags: ['auth', 'login', 'sign-in', 'form'],
    intent: 'auth.login',
    intentLabel: 'Login',
    htmlTemplate: `<div data-ut-intent="auth.login" class="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
  <h2 class="text-2xl font-bold mb-6 text-center">Sign In</h2>
  <form data-ut-intent="auth.login" class="space-y-4">
    <div><label class="block text-sm font-semibold mb-1">Email</label><input type="email" name="email" class="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500" required /></div>
    <div><label class="block text-sm font-semibold mb-1">Password</label><input type="password" name="password" class="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500" required /></div>
    <button type="submit" data-ut-intent="auth.login" class="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Sign In</button>
  </form>
</div>`,
  },
  {
    id: 'auth-register',
    name: 'Register Form',
    category: 'automation',
    icon: <UserPlus className="w-5 h-5" />,
    description: 'Registration form wired to auth.register',
    tags: ['auth', 'register', 'sign-up', 'form'],
    intent: 'auth.register',
    intentLabel: 'Register',
    htmlTemplate: `<div data-ut-intent="auth.register" class="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
  <h2 class="text-2xl font-bold mb-6 text-center">Create Account</h2>
  <form data-ut-intent="auth.register" class="space-y-4">
    <div><label class="block text-sm font-semibold mb-1">Full Name</label><input type="text" name="name" class="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500" required /></div>
    <div><label class="block text-sm font-semibold mb-1">Email</label><input type="email" name="email" class="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500" required /></div>
    <div><label class="block text-sm font-semibold mb-1">Password</label><input type="password" name="password" class="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500" required /></div>
    <button type="submit" data-ut-intent="auth.register" class="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Create Account</button>
  </form>
</div>`,
  },
  {
    id: 'cart-add-grid',
    name: 'Product Cards',
    category: 'automation',
    icon: <ShoppingCart className="w-5 h-5" />,
    description: 'Product card grid with cart.add intent',
    tags: ['product', 'card', 'shop', 'ecommerce', 'cart'],
    intent: 'cart.add',
    ctaLabel: 'cta.primary',
    intentLabel: 'Add to Cart',
    isPro: true,
    htmlTemplate: `<section data-ut-intent="cart.add" class="py-24 bg-white">
  <div class="container mx-auto px-6 max-w-6xl">
    <h2 class="text-5xl font-bold text-center mb-16">Our Products</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition">
        <div class="aspect-square bg-gray-100 flex items-center justify-center"><span class="text-6xl">📦</span></div>
        <div class="p-6">
          <h3 class="text-xl font-bold mb-1">Starter Pack</h3>
          <p class="text-2xl font-bold text-blue-600 mb-4">$29</p>
          <button data-ut-intent="cart.add" data-ut-cta="cta.primary" data-product-id="prod_001" data-product-name="Starter Pack" data-price="29" class="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Add to Cart</button>
        </div>
      </div>
      <div class="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition">
        <div class="aspect-square bg-gray-100 flex items-center justify-center"><span class="text-6xl">🎁</span></div>
        <div class="p-6">
          <h3 class="text-xl font-bold mb-1">Pro Bundle</h3>
          <p class="text-2xl font-bold text-blue-600 mb-4">$79</p>
          <button data-ut-intent="cart.add" data-ut-cta="cta.primary" data-product-id="prod_002" data-product-name="Pro Bundle" data-price="79" class="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Add to Cart</button>
        </div>
      </div>
      <div class="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition">
        <div class="aspect-square bg-gray-100 flex items-center justify-center"><span class="text-6xl">💎</span></div>
        <div class="p-6">
          <h3 class="text-xl font-bold mb-1">Enterprise Suite</h3>
          <p class="text-2xl font-bold text-blue-600 mb-4">$199</p>
          <button data-ut-intent="cart.add" data-ut-cta="cta.primary" data-product-id="prod_003" data-product-name="Enterprise Suite" data-price="199" class="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Add to Cart</button>
        </div>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: 'button-click-trigger',
    name: 'Automation Button',
    category: 'automation',
    icon: <Workflow className="w-5 h-5" />,
    description: 'Generic button that fires button.click automation',
    tags: ['button', 'automation', 'trigger', 'workflow'],
    intent: 'button.click',
    intentLabel: 'Trigger',
    htmlTemplate: `<button data-ut-intent="button.click" data-ut-cta="cta.primary" class="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg font-semibold hover:scale-105 transition shadow-xl">Run Workflow</button>`,
  },

  // ── CONTENT (no intent — display-only) ─────────────────────────────────
  {
    id: 'content-heading',
    name: 'Heading',
    category: 'content',
    icon: <Type className="w-5 h-5" />,
    description: 'Large heading text',
    tags: ['text', 'heading', 'title', 'h1'],
    htmlTemplate: `<h1 class="text-6xl font-bold text-gray-900">Heading Text</h1>`,
  },
  {
    id: 'content-paragraph',
    name: 'Paragraph',
    category: 'content',
    icon: <Type className="w-5 h-5" />,
    description: 'Body text paragraph',
    tags: ['text', 'paragraph', 'content'],
    htmlTemplate: `<p class="text-lg text-gray-700 leading-relaxed">This is a paragraph of text. You can edit this content to match your needs.</p>`,
  },
  {
    id: 'features-grid',
    name: 'Features Grid',
    category: 'content',
    icon: <Grid3x3 className="w-5 h-5" />,
    description: '3-column feature cards',
    tags: ['features', 'grid', 'services', 'cards'],
    htmlTemplate: `<section class="py-24 bg-gray-50">
  <div class="container mx-auto px-6 max-w-7xl">
    <h2 class="text-5xl font-bold text-center mb-16">Powerful Features</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
        <div class="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6"><svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>
        <h3 class="text-2xl font-bold mb-4">Lightning Fast</h3>
        <p class="text-gray-600">Optimized performance for instant loading</p>
      </div>
      <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
        <div class="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6"><svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></div>
        <h3 class="text-2xl font-bold mb-4">Secure</h3>
        <p class="text-gray-600">Enterprise-grade security</p>
      </div>
      <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
        <div class="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-6"><svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg></div>
        <h3 class="text-2xl font-bold mb-4">Responsive</h3>
        <p class="text-gray-600">Perfect on any device</p>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    category: 'content',
    icon: <MessageSquare className="w-5 h-5" />,
    description: 'Customer testimonial cards',
    tags: ['testimonials', 'reviews', 'social proof'],
    htmlTemplate: `<section class="py-24 bg-white">
  <div class="container mx-auto px-6 max-w-7xl">
    <h2 class="text-5xl font-bold text-center mb-16">What Clients Say</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="bg-gray-50 p-8 rounded-2xl">
        <div class="flex mb-4"><svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg><svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg><svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg><svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg><svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg></div>
        <p class="text-gray-700 mb-6">"Outstanding service! Exceeded all expectations."</p>
        <div class="flex items-center"><div class="w-12 h-12 rounded-full bg-blue-600"></div><div class="ml-4"><p class="font-bold">Sarah Johnson</p><p class="text-sm text-gray-600">CEO, TechCorp</p></div></div>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: 'social-icon-row',
    name: 'Social Icons Row',
    category: 'content',
    icon: <Heart className="w-5 h-5" />,
    description: 'Horizontal row of social media icons',
    tags: ['social', 'icons', 'facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'github'],
    htmlTemplate: `<div class="flex items-center gap-3">
  <a href="#" data-ut-intent="nav.external" class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition"><svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
  <a href="#" data-ut-intent="nav.external" class="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition"><svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
  <a href="#" data-ut-intent="nav.external" class="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-full flex items-center justify-center hover:opacity-90 transition"><svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
  <a href="#" data-ut-intent="nav.external" class="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition"><svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
  <a href="#" data-ut-intent="nav.external" class="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition"><svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
  <a href="#" data-ut-intent="nav.external" class="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 transition"><svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>
</div>`,
  },

  // ── MEDIA ──────────────────────────────────────────────────────────────
  {
    id: 'content-image',
    name: 'Image',
    category: 'media',
    icon: <Image className="w-5 h-5" />,
    description: 'Responsive image',
    tags: ['image', 'photo', 'picture'],
    htmlTemplate: `<img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800" alt="Description" class="w-full h-auto rounded-2xl shadow-lg" />`,
  },
  {
    id: 'ai-image-placeholder',
    name: 'AI Image',
    category: 'media',
    icon: <Sparkles className="w-5 h-5" />,
    description: 'Generate image with AI (edge function)',
    tags: ['ai', 'image', 'generate', 'artificial intelligence'],
    isPro: true,
    htmlTemplate: `<div class="relative w-full aspect-video bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl shadow-lg flex items-center justify-center border-2 border-dashed border-purple-500/50">
  <div class="text-center p-8">
    <svg class="w-16 h-16 mx-auto mb-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
    <p class="text-lg font-semibold text-purple-600 mb-2">Click "Generate AI Image" to replace this</p>
    <p class="text-sm text-gray-600">Use the AI Image Generator button above to create custom images</p>
  </div>
</div>`,
  },
  {
    id: 'image-gallery-grid',
    name: 'Image Gallery',
    category: 'media',
    icon: <Grid3x3 className="w-5 h-5" />,
    description: 'Responsive image gallery with hover effects',
    tags: ['gallery', 'grid', 'images', 'portfolio'],
    htmlTemplate: `<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  <div class="relative group overflow-hidden rounded-lg shadow-lg cursor-pointer"><img src="https://picsum.photos/400/300?random=1" alt="Gallery 1" loading="lazy" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" /><div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"><span class="text-white text-lg font-semibold">View</span></div></div>
  <div class="relative group overflow-hidden rounded-lg shadow-lg cursor-pointer"><img src="https://picsum.photos/400/300?random=2" alt="Gallery 2" loading="lazy" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" /><div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"><span class="text-white text-lg font-semibold">View</span></div></div>
  <div class="relative group overflow-hidden rounded-lg shadow-lg cursor-pointer"><img src="https://picsum.photos/400/300?random=3" alt="Gallery 3" loading="lazy" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" /><div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"><span class="text-white text-lg font-semibold">View</span></div></div>
  <div class="relative group overflow-hidden rounded-lg shadow-lg cursor-pointer"><img src="https://picsum.photos/400/300?random=4" alt="Gallery 4" loading="lazy" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" /><div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"><span class="text-white text-lg font-semibold">View</span></div></div>
</div>`,
  },
  {
    id: 'content-video',
    name: 'Video Embed',
    category: 'media',
    icon: <Video className="w-5 h-5" />,
    description: 'Embedded video player',
    tags: ['video', 'media', 'youtube', 'embed'],
    htmlTemplate: `<div class="aspect-video rounded-2xl overflow-hidden shadow-lg"><iframe class="w-full h-full" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe></div>`,
  },

  // ── BUTTONS (standalone, generic intents) ──────────────────────────────
  {
    id: 'button-primary',
    name: 'Primary Button',
    category: 'actions',
    icon: <Square className="w-5 h-5" />,
    description: 'Primary action button (contact intent)',
    tags: ['button', 'cta', 'action', 'primary'],
    intent: 'contact.submit',
    ctaLabel: 'cta.primary',
    intentLabel: 'Contact',
    htmlTemplate: `<button data-ut-intent="contact.submit" data-ut-cta="cta.primary" class="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 hover:scale-105 transition shadow-lg">Click Me</button>`,
  },
  {
    id: 'button-secondary',
    name: 'Secondary Button',
    category: 'navigation',
    icon: <Square className="w-5 h-5" />,
    description: 'Secondary button (anchor intent)',
    tags: ['button', 'outline', 'secondary'],
    intent: 'nav.anchor',
    ctaLabel: 'cta.secondary',
    intentLabel: 'Anchor',
    htmlTemplate: `<button data-ut-intent="nav.anchor" data-ut-anchor="#details" data-ut-cta="cta.secondary" class="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition">Learn More</button>`,
  },
  {
    id: 'button-gradient',
    name: 'Gradient Button',
    category: 'actions',
    icon: <Square className="w-5 h-5" />,
    description: 'Gradient button (contact intent)',
    tags: ['button', 'gradient', 'colorful'],
    intent: 'contact.submit',
    ctaLabel: 'cta.primary',
    intentLabel: 'Contact',
    isPro: true,
    htmlTemplate: `<button data-ut-intent="contact.submit" data-ut-cta="cta.primary" class="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:scale-105 transition shadow-xl">Get Started</button>`,
  },
];

// ============================================================================
// Intent-badge colour map
// ============================================================================

const INTENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'nav':     { bg: 'bg-sky-500/15',    text: 'text-sky-400',    border: 'border-sky-500/30' },
  'pay':     { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'contact': { bg: 'bg-blue-500/15',   text: 'text-blue-400',   border: 'border-blue-500/30' },
  'newsletter': { bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/30' },
  'booking': { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
  'quote':   { bg: 'bg-amber-500/15',  text: 'text-amber-400',  border: 'border-amber-500/30' },
  'lead':    { bg: 'bg-pink-500/15',   text: 'text-pink-400',   border: 'border-pink-500/30' },
  'auth':    { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  'cart':    { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30' },
  'button':  { bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/30' },
};

function intentColor(intent?: string) {
  if (!intent) return null;
  const prefix = intent.split('.')[0];
  return INTENT_COLORS[prefix] ?? INTENT_COLORS['button'];
}

// ============================================================================
// Category metadata
// ============================================================================

const CATEGORY_META: Record<IntentCategory, { label: string; icon: React.ReactNode; accent: string }> = {
  navigation:  { label: 'Navigation',  icon: <Navigation className="w-3.5 h-3.5" />,   accent: 'text-sky-400' },
  payment:     { label: 'Payment',     icon: <CreditCard className="w-3.5 h-3.5" />,    accent: 'text-emerald-400' },
  actions:     { label: 'Actions',     icon: <Zap className="w-3.5 h-3.5" />,            accent: 'text-blue-400' },
  automation:  { label: 'Automation',  icon: <Workflow className="w-3.5 h-3.5" />,       accent: 'text-violet-400' },
  content:     { label: 'Content',     icon: <Type className="w-3.5 h-3.5" />,           accent: 'text-gray-400' },
  media:       { label: 'Media',       icon: <Image className="w-3.5 h-3.5" />,          accent: 'text-pink-400' },
};

// ============================================================================
// Component
// ============================================================================

const SIDE_TABS: { id: IntentCategory | 'all'; tip: string }[] = [
  { id: 'all',        tip: 'All' },
  { id: 'navigation', tip: 'Navigation' },
  { id: 'payment',    tip: 'Payment' },
  { id: 'actions',    tip: 'Actions' },
  { id: 'automation', tip: 'Automation' },
  { id: 'content',    tip: 'Content' },
  { id: 'media',      tip: 'Media' },
];

export const ElementsSidebar: React.FC<ElementsSidebarProps> = ({
  onElementDragStart,
  onElementDragEnd,
  onElementClick,
  onAIImageGenerated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<IntentCategory | 'all'>('all');
  const [showAIImageDialog, setShowAIImageDialog] = useState(false);

  // Elements filtered by the active side tab + search query
  const filteredElements = useMemo(() => {
    return ELEMENT_LIBRARY.filter((el) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        el.name.toLowerCase().includes(q) ||
        el.tags.some((t) => t.includes(q)) ||
        (el.intent && el.intent.includes(q)) ||
        (el.intentLabel && el.intentLabel.toLowerCase().includes(q));
      const matchesCategory = activeTab === 'all' || el.category === activeTab;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeTab]);

  // Group by category when "All" is active
  const groupedElements = useMemo(() => {
    return filteredElements.reduce(
      (acc, el) => {
        (acc[el.category] ??= []).push(el);
        return acc;
      },
      {} as Record<IntentCategory, WebElement[]>,
    );
  }, [filteredElements]);

  const handleDragStart = (e: React.DragEvent, element: WebElement) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify(element));
    e.dataTransfer.setData('text/html', element.htmlTemplate);
    onElementDragStart?.(element);
  };

  const handleDragEnd = () => onElementDragEnd?.();

  // Count elements per category (for badge)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: ELEMENT_LIBRARY.length };
    for (const el of ELEMENT_LIBRARY) {
      counts[el.category] = (counts[el.category] ?? 0) + 1;
    }
    return counts;
  }, []);

  return (
    <div className="h-full flex bg-card border-r border-border">
      {/* ── Left icon rail (side-menu tabs) ── */}
      <div className="w-11 flex-shrink-0 flex flex-col border-r border-border bg-secondary/60">
        {/* AI Image button at top of rail */}
        <button
          onClick={() => setShowAIImageDialog(true)}
          title="Generate AI Image"
          className="w-full aspect-square flex items-center justify-center text-primary hover:bg-primary/20 transition border-b border-border"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Category tabs */}
        {SIDE_TABS.map((tab) => {
          const isAll = tab.id === 'all';
          const meta = isAll ? null : CATEGORY_META[tab.id as IntentCategory];
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              title={tab.tip}
              className={cn(
                'relative w-full flex flex-col items-center justify-center gap-0.5 py-2.5 transition text-[9px] font-medium leading-none',
                isActive
                  ? 'bg-primary/15 text-primary after:absolute after:left-0 after:top-1 after:bottom-1 after:w-[2px] after:bg-primary after:rounded-r'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
              )}
            >
              {isAll ? <Layers className="w-4 h-4" /> : meta!.icon}
              <span className="truncate max-w-[38px]">{isAll ? 'All' : meta!.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Right content panel ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search + active category header */}
        <div className="p-2.5 border-b border-border space-y-2">
          <div className="flex items-center gap-1.5">
            {activeTab !== 'all' && (
              <span className={cn('flex-shrink-0', CATEGORY_META[activeTab as IntentCategory]?.accent)}>
                {CATEGORY_META[activeTab as IntentCategory]?.icon}
              </span>
            )}
            <h2 className="text-xs font-bold text-foreground truncate">
              {activeTab === 'all' ? 'All Elements' : CATEGORY_META[activeTab as IntentCategory].label}
            </h2>
            <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-border ml-auto">
              {filteredElements.length}
            </Badge>
          </div>
          <Input
            type="text"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 text-xs bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
          />
        </div>

        {/* Element cards */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1.5">
            {activeTab === 'all'
              ? Object.entries(groupedElements).map(([cat, elements]) => {
                  const meta = CATEGORY_META[cat as IntentCategory];
                  return (
                    <div key={cat} className="mb-2">
                      <div className="flex items-center gap-1.5 mb-1.5 px-1">
                        <span className={meta.accent}>{meta.icon}</span>
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex-1">{meta.label}</span>
                        <span className="text-[9px] text-muted-foreground">{elements.length}</span>
                      </div>
                      <div className="space-y-1">
                        {elements.map((el) => (
                          <IntentElementCard
                            key={el.id}
                            element={el}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onClick={onElementClick}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              : filteredElements.map((el) => (
                  <IntentElementCard
                    key={el.id}
                    element={el}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onClick={onElementClick}
                  />
                ))}

            {filteredElements.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-xs">No elements found</p>
                <p className="text-muted-foreground/60 text-[10px] mt-1">Try a different search</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-2.5 py-2 border-t border-border bg-secondary/40">
          <p className="text-[9px] text-muted-foreground flex items-center gap-1.5">
            <GripVertical className="w-3 h-3 flex-shrink-0" />
            Drag onto preview — intents prewired
          </p>
        </div>
      </div>

      {/* AI Image Generator Dialog */}
      <AIImageGeneratorDialog
        isOpen={showAIImageDialog}
        onClose={() => setShowAIImageDialog(false)}
        onImageGenerated={(imageUrl, metadata) => {
          onAIImageGenerated?.(imageUrl, { prompt: metadata });
        }}
      />
    </div>
  );
};

// ============================================================================
// Element Card with intent badge
// ============================================================================

interface IntentElementCardProps {
  element: WebElement;
  onDragStart: (e: React.DragEvent, element: WebElement) => void;
  onDragEnd: () => void;
  onClick?: (element: WebElement) => void;
}

const IntentElementCard: React.FC<IntentElementCardProps> = ({
  element,
  onDragStart,
  onDragEnd,
  onClick,
}) => {
  const color = intentColor(element.intent);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, element)}
      onDragEnd={onDragEnd}
      onClick={() => onClick?.(element)}
      className="group relative bg-card border border-border rounded-lg p-2.5 hover:border-primary transition cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start gap-2.5">
        {/* Icon */}
        <div className="w-9 h-9 rounded-md bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
          {element.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <h4 className="text-xs font-semibold text-foreground truncate">{element.name}</h4>
            {element.isPro && (
              <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5">PRO</Badge>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground line-clamp-1">{element.description}</p>

          {/* Intent label badge */}
          {element.intentLabel && color && (
            <div className={cn('inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold border', color.bg, color.text, color.border)}>
              <Zap className="w-2.5 h-2.5" />
              {element.intentLabel}
              {element.intent && (
                <span className="opacity-60 ml-0.5">· {element.intent}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Drag grip */}
      <div className="absolute top-2.5 right-2 opacity-0 group-hover:opacity-100 transition">
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
    </div>
  );
};

export default ElementsSidebar;
