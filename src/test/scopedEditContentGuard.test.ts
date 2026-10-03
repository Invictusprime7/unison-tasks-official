import { describe, expect, it } from 'vitest';
import { findUnrequestedScopedSideEffects } from '@/services/builder/scopedEditContentGuard';

describe('scoped edit content guard', () => {
  it('rejects a form and new component added to a copy-only edit', () => {
    const original = `export default function Hero() { return <section><p>Hero eyebrow</p></section>; }`;
    const candidate = `import { Mail } from '@/unison/ui/icons';
function ContactForm() { return <form><input /></form>; }
export default function Hero() { return <section><p>Product designer</p><ContactForm /></section>; }`;

    expect(findUnrequestedScopedSideEffects(original, candidate, 'Change only the hero eyebrow copy.'))
      .toEqual(expect.arrayContaining([
        'new imports (1)',
        'new <form> element',
        'new <input> element',
        'new <ContactForm> element',
        'new ContactForm component',
      ]));
  });

  it('allows controls explicitly requested by the prompt', () => {
    const original = `export default function Hero() { return <section><p>Hero eyebrow</p></section>; }`;
    const candidate = `export default function Hero() { return <section><p>Contact us</p><form><input /></form></section>; }`;

    expect(findUnrequestedScopedSideEffects(original, candidate, 'Add a contact form to the hero.')).toEqual([]);
  });
});
