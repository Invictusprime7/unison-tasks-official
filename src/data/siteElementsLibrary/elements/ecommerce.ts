/**
 * Ecommerce Elements — AI Site Elements Library
 *
 * Product cards, cart, checkout flows, product detail layouts.
 * Patterns from successful ecommerce sites.
 */

import type { SiteElement } from '../types';

export const ecommerceElements: SiteElement[] = [
  // ========================================================================
  // PRODUCT CARD GRID
  // ========================================================================
  {
    id: 'product-card-grid',
    name: 'Product Card Grid',
    description: 'Grid of product cards with image, name, price, and Add to Cart. The core ecommerce element.',
    category: 'ecommerce',
    subCategory: 'product-grid',
    industryAffinity: ['ecommerce'],
    contentSlots: [
      { name: 'section_title', type: 'heading', required: false, description: 'Section heading', example: 'Featured Products' },
      { name: 'filter_bar', type: 'list', required: false, description: 'Category filters', example: 'All | Clothing | Accessories | Sale' },
      { name: 'product_cards', type: 'list', required: true, description: 'Product cards (image, name, price, badge, CTA)' },
    ],
    variations: [
      {
        id: 'product-cards-standard',
        name: 'Standard Product Cards',
        description: 'Clean product cards with image, name, price, Add to Cart — the ecommerce standard',
        layout: 'grid-4',
        style: 'minimal',
        cssHints: [
          'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6',
          'card: group rounded-xl overflow-hidden bg-card border border-border',
          'image: aspect-square object-cover group-hover:scale-105 transition-transform',
          'badge: absolute top-3 left-3 bg-red-500 text-white px-2 py-1 text-xs rounded-full',
        ],
        skeleton: `<section class="py-20 md:py-28 bg-background">
  <div class="max-w-7xl mx-auto px-4">
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-3xl font-bold text-foreground"><!-- TITLE --></h2>
      <div class="flex gap-2"><!-- FILTERS --></div>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div class="group rounded-xl overflow-hidden bg-card border border-border hover:shadow-lg transition-all">
        <div class="relative aspect-square overflow-hidden">
          <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="" alt="" />
          <span class="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded-full">Sale</span>
          <button class="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" data-no-intent>❤️</button>
        </div>
        <div class="p-4">
          <h3 class="font-semibold text-foreground mb-1 truncate"><!-- PRODUCT NAME --></h3>
          <div class="flex items-center gap-2 mb-3">
            <span class="text-lg font-bold text-foreground">$49.99</span>
            <span class="text-sm text-muted-foreground line-through">$69.99</span>
          </div>
          <button class="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity" data-ut-intent="cart.add" data-product-id="1" data-product-name="Product" data-price="49.99">Add to Cart</button>
        </div>
      </div>
    </div>
  </div>
</section>`,
        bestFor: ['Any ecommerce store', 'Product listing pages'],
        popularity: 95,
      },
    ],
    conversion: {
      goal: 'Drive product exploration and add-to-cart actions',
      recommendedIntent: 'cart.add',
      placementTips: [
        'Below hero or featured banner',
        'Include category filtering above the grid',
        'Show 8-12 products initially, with "Load More"',
      ],
      copyGuidelines: [
        'Product name: Descriptive but concise',
        'Show original price crossed out next to sale price',
        '"Add to Cart" is the strongest CTA — not "Buy Now" (too aggressive at browsing stage)',
        'Include "Sale", "New", "Best Seller" badges',
      ],
      abInsights: [
        'Quick-add button increases add-to-cart rate by 20%',
        'Sale badges increase click-through by 15%',
        'Hover-zoom on images increases engagement by 25%',
        '4-column grid outperforms 3 on desktop for browsing',
      ],
    },
    a11y: {
      ariaRequirements: ['Product name in heading', 'Price accessible to screen readers', 'Image alt text describes product'],
      keyboardNav: 'Tab through cards, Enter for add-to-cart',
    },
    seo: {
      semanticElements: ['<article>', '<h3>', '<img alt="...">'],
      schemaType: 'Product',
    },
    responsive: {
      mobile: '2-column grid',
      tablet: '3-column grid',
      desktop: '4-column grid',
    },
    tags: ['ecommerce', 'products', 'cards', 'grid', 'store', 'add-to-cart', 'shopping'],
    frequencyScore: 90,
  },

  // ========================================================================
  // SHOPPING CART OVERLAY
  // ========================================================================
  {
    id: 'cart-overlay',
    name: 'Shopping Cart Overlay',
    description: 'Slide-out cart drawer showing items, quantities, and checkout CTA.',
    category: 'ecommerce',
    subCategory: 'cart',
    industryAffinity: ['ecommerce'],
    contentSlots: [
      { name: 'cart_items', type: 'list', required: true, description: 'Cart item rows (image, name, price, quantity, remove)' },
      { name: 'subtotal', type: 'text', required: true, description: 'Order subtotal' },
      { name: 'checkout_button', type: 'button', required: true, description: 'Checkout CTA', example: 'Proceed to Checkout' },
      { name: 'continue_button', type: 'button', required: false, description: 'Continue shopping link' },
    ],
    variations: [
      {
        id: 'cart-slide-right',
        name: 'Right Slide Cart',
        description: 'Cart slides in from right with item list and totals',
        layout: 'sidebar',
        style: 'minimal',
        cssHints: [
          'fixed inset-y-0 right-0 w-96 z-50',
          'bg-background shadow-2xl',
          'flex flex-col h-full',
          'header + scrollable items + fixed footer',
        ],
        skeleton: `<div class="fixed inset-0 z-50 hidden" id="cart-overlay">
  <div class="fixed inset-0 bg-black/50"></div>
  <div class="fixed inset-y-0 right-0 w-full max-w-md bg-background shadow-2xl flex flex-col">
    <div class="flex items-center justify-between p-4 border-b border-border">
      <h3 class="text-lg font-bold text-foreground">Your Cart (3)</h3>
      <button data-no-intent>✕</button>
    </div>
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- CART ITEM -->
      <div class="flex items-center gap-4">
        <img class="w-16 h-16 rounded-lg object-cover" src="" alt="" />
        <div class="flex-1">
          <h4 class="font-medium text-foreground">Product Name</h4>
          <p class="text-sm text-muted-foreground">$49.99</p>
          <div class="flex items-center gap-2 mt-1">
            <button class="w-7 h-7 rounded border border-border text-sm" data-no-intent>−</button>
            <span class="text-sm">1</span>
            <button class="w-7 h-7 rounded border border-border text-sm" data-no-intent>+</button>
          </div>
        </div>
        <button class="text-muted-foreground hover:text-red-500" data-no-intent>🗑</button>
      </div>
    </div>
    <div class="p-4 border-t border-border">
      <div class="flex justify-between text-lg font-bold text-foreground mb-4">
        <span>Subtotal</span><span>$149.97</span>
      </div>
      <button class="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold" data-ut-intent="pay.checkout">Proceed to Checkout</button>
      <button class="w-full py-3 text-muted-foreground text-sm mt-2" data-no-intent>Continue Shopping</button>
    </div>
  </div>
</div>`,
        bestFor: ['Any ecommerce store'],
        popularity: 90,
      },
    ],
    conversion: {
      goal: 'Move users from cart to checkout',
      recommendedIntent: 'pay.checkout',
      placementTips: [
        'Triggered by cart icon in navbar or after add-to-cart',
        'Show item count badge on cart icon in navbar',
        'Keep checkout CTA sticky at bottom',
      ],
      copyGuidelines: [
        '"Proceed to Checkout" is the strongest CTA',
        'Show item count in header',
        'Display subtotal prominently',
      ],
    },
    a11y: {
      ariaRequirements: ['Focus trap when open', 'aria-label="Shopping cart"', 'Announce item count changes'],
      keyboardNav: 'Tab through items, Escape to close',
    },
    responsive: {
      mobile: 'Full-width takeover',
      desktop: 'Max-width sidebar overlay',
    },
    tags: ['cart', 'ecommerce', 'overlay', 'checkout', 'shopping'],
    frequencyScore: 85,
  },
];
