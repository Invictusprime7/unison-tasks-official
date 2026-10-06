import { describe, expect, it } from 'vitest';
import { resolveCapabilityIntentBindings } from '@/services/capabilityIntentBindingResolver';

describe('resolveCapabilityIntentBindings', () => {
  it('resolves authored cart controls without requiring preset slot names', () => {
    const source = 'export default function Shop(){return <button onClick={() => count > 0 && add()} data-ut-intent={"cart.add"}>Add to bag</button>}';
    const result = resolveCapabilityIntentBindings([
      { target: 'product-card.primary-action', intent: 'cart.add' },
      { target: 'navbar.cart-action', intent: 'cart.checkout' },
    ], {
      '/src/pages/Shop.tsx': source,
      '/src/project-components/Nav.tsx': 'export default function Nav(){return <a href="/checkout" data-ut-intent="cart.checkout">Checkout</a>}',
    });
    expect(result.unresolved).toEqual([]);
    expect(result.resolved).toHaveLength(2);
    expect(result.files['/src/pages/Shop.tsx']).toContain('onClick={() => count > 0 && add()}');
    expect(result.files['/src/pages/Shop.tsx']).toContain('data-ut-slot="product-card.primary-action"');
  });

  it('does not hijack another intent or a decorative element to satisfy a missing slot', () => {
    const result = resolveCapabilityIntentBindings([{ target: 'navbar.cart-action', intent: 'cart.checkout' }], {
      '/src/pages/Home.tsx': '<><a data-ut-intent="cart.view">Bag</a><div data-ut-intent="cart.checkout">Example</div></>',
    });
    expect(result.unresolved).toHaveLength(1);
    expect(result.resolved).toEqual([]);
  });
  it('stamps a concrete service-card action slot and booking intent', () => {
    const result = resolveCapabilityIntentBindings([
      { target: 'service-card.primary-action', intent: 'booking.create' },
    ], {
      '/src/pages/Services.tsx': '<button className="cta primary">Book this service</button>',
    });

    expect(result.unresolved).toEqual([]);
    expect(result.resolved).toEqual([{
      symbolicTarget: 'service-card.primary-action',
      filePath: '/src/pages/Services.tsx',
      slot: 'service-card.primary-action',
      intent: 'booking.create',
    }]);
    expect(result.files['/src/pages/Services.tsx']).toContain('data-ut-slot="service-card.primary-action"');
    expect(result.files['/src/pages/Services.tsx']).toContain('data-ut-intent="booking.create"');
  });

  it('leaves a plan unresolved when no concrete target exists', () => {
    const result = resolveCapabilityIntentBindings([
      { target: 'service-card.primary-action', intent: 'booking.create' },
    ], { '/src/pages/Home.tsx': '<main>Welcome</main>' });

    expect(result.resolved).toEqual([]);
    expect(result.unresolved).toHaveLength(1);
  });
});
