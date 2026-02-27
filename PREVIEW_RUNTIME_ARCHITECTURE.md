# Preview Runtime Architecture

## Overview

Unison Tasks now has a proper **Intent-Driven Preview Runtime Engine** that treats Sandpack as a runtime host rather than a raw HTML renderer. This architecture mirrors enterprise builders like Webflow and Wix.

## Core Philosophy

```
❌ OLD: AI generates loose HTML → Links behave randomly
✅ NEW: AI generates schema → Runtime interprets it → All actions are intent-driven
```

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    WebBuilder (Editor)                   │
│  - Generates SiteBundle schema                          │
│  - Manages draft assets in Supabase                     │
│  - Controls preview mode                                │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼ SiteBundle JSON
┌─────────────────────────────────────────────────────────┐
│                   PreviewRuntime                         │
│  - HashRouter for navigation (preview)                  │
│  - BrowserRouter for navigation (publish)               │
│  - Central click handler                                │
│  - Intent resolution system                             │
│  - CMS mock state (cart, auth, bookings)                │
│  - Overlay management                                   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼ Rendered React App
┌─────────────────────────────────────────────────────────┐
│                  Sandpack Iframe                         │
│  - Executes generated React code                        │
│  - All clicks intercepted by runtime                    │
│  - No raw anchor navigation                             │
└─────────────────────────────────────────────────────────┘
```

## Files Created

### Core Runtime

| File | Purpose |
|------|---------|
| `src/runtime/preview/PreviewRuntime.tsx` | Main provider with HashRouter, CMS state, overlays |
| `src/runtime/preview/IntentLink.tsx` | Intent-driven link/button component |
| `src/runtime/preview/PreviewOverlays.tsx` | Cart, Auth, Booking, Contact mock overlays |
| `src/runtime/preview/PreviewClickResolver.ts` | Global click handler for any element |
| `src/runtime/preview/SandpackRuntimeWrapper.ts` | Generates Sandpack files from SiteBundle |
| `src/runtime/preview/index.ts` | Barrel exports |

## Key Concepts

### 1. Intent-Driven Links

Instead of generating:
```html
<a href="/about">About</a>
```

Generate:
```tsx
<IntentLink intent="nav.goto" to="/about">About</IntentLink>
```

Or with data attributes for existing HTML:
```html
<a href="/about" data-ut-intent="nav.goto">About</a>
```

### 2. Central Click Resolution

The runtime intercepts ALL clicks and resolves intent by:

1. **Explicit intent**: `data-ut-intent` attribute
2. **Href analysis**: `/path` → nav.goto, `#anchor` → nav.anchor, `https://` → nav.external
3. **Text inference**: "Sign In" → auth.signin, "Add to Cart" → cart.add

### 3. CMS Mock State

In preview mode, features like cart/auth/booking are simulated:

```typescript
const runtime = usePreviewRuntime();

// Cart operations (no backend required)
runtime.addToCart({ productId: '123', name: 'Product', price: 29.99 });
runtime.cmsState.cart.items; // Current cart items
runtime.cmsState.cart.total; // Cart total

// Auth state (simulated)
runtime.cmsState.auth.isLoggedIn;
runtime.cmsState.auth.user;
```

### 4. Overlay System

Modal overlays are managed centrally:

```typescript
// Open overlay
runtime.openOverlay('cart');
runtime.openOverlay('auth', { mode: 'login' });
runtime.openOverlay('booking', { service: 'Consultation' });

// Close overlay
runtime.closeOverlay();
```

### 5. Navigation

All navigation goes through the runtime:

```typescript
// Route navigation (HashRouter in preview)
runtime.navigate('/about');

// Anchor scroll
runtime.scrollTo('features');

// External
window.open(url, '_blank');

// Back
runtime.goBack();
```

## Intent Vocabulary

| Intent | Payload | Action |
|--------|---------|--------|
| `nav.goto` | `{ path }` | Navigate to route |
| `nav.anchor` | `{ anchor }` | Scroll to section |
| `nav.external` | `{ url }` | Open in new tab |
| `nav.back` | - | Go back |
| `cart.add` | `{ productId, name, price, quantity }` | Add to cart + show overlay |
| `cart.view` | - | Open cart overlay |
| `auth.signin` | - | Open auth overlay (login mode) |
| `auth.signup` | - | Open auth overlay (register mode) |
| `booking.create` | `{ service? }` | Open booking overlay |
| `overlay.open` | `{ type, ...payload }` | Open generic overlay |
| `overlay.close` | - | Close current overlay |
| `contact.submit` | `{ name, email, message }` | Open contact overlay |

## Usage with SiteBundle

```typescript
import { generateSandpackFiles } from '@/runtime/preview';

const files = generateSandpackFiles({
  siteBundle: mySiteBundle,
  entryPath: '/',
  debug: true,
  typescript: true,
  assetBaseUrl: 'https://xxx.supabase.co/storage/v1/object/public/drafts',
});

// Use with Sandpack
<Sandpack files={files} template="react-ts" />
```

## Migration from Raw HTML

### Before (breaks in preview):
```html
<a href="/about">About Us</a>
<button onclick="openCart()">View Cart</button>
```

### After (works everywhere):
```html
<a href="/about" data-ut-intent="nav.goto">About Us</a>
<button data-ut-intent="cart.view">View Cart</button>
```

Or in React:
```tsx
<IntentLink intent="nav.goto" to="/about">About Us</IntentLink>
<IntentLink intent="cart.view" asButton>View Cart</IntentLink>
```

## Feature Toggle Simulation

Features like cart, booking, and forms are NOT real backend calls in preview:

| Feature | Preview Behavior | Production Behavior |
|---------|------------------|---------------------|
| Cart | In-memory state | Supabase `cart_items` |
| Auth | Mock login/signup | Supabase Auth |
| Booking | Mock confirmation | Supabase `bookings` |
| Forms | In-memory storage | Edge Function → CRM |

## Production Build

For production (Vercel publish):

```typescript
// Preview: HashRouter
<HashRouter>
  <App />
</HashRouter>

// Production: BrowserRouter
<BrowserRouter>
  <App />
</BrowserRouter>
```

The same runtime code works in both environments - only the router changes.

## Benefits

1. **No random link behavior** - All clicks route through intent system
2. **Works without server** - HashRouter + mock state = no 404s
3. **AI-friendly** - AI generates schema, not behavior
4. **Feature simulation** - Cart/auth/booking work in preview
5. **Easy publishing** - Same code, swap router
6. **Scalable** - Add new intents without rewriting templates

## Next Steps

1. **Integrate with WebBuilder**: Use `generateSandpackFiles()` in VFS preview
2. **AI Prompt Updates**: Train AI to generate `IntentLink` components
3. **Asset Management**: Wire Supabase draft storage to `resolveAssetUrl()`
4. **Real CMS Mode**: Toggle between mock and real backend in preview
