import { describe, expect, it } from 'vitest';
import { routePrompt } from '@/unison/nlRouter';

describe('routePrompt', () => {
  it('keeps explicitly UI-only source edits out of route and capability lanes', () => {
    expect(routePrompt(
      'Change only the Home page hero eyebrow text. UI only; do not create routes or enable capabilities.',
    )).toMatchObject({ route: 'builder.edit', confidence: 0.98 });
  });

  it('still routes an affirmative route request to route.create', () => {
    expect(routePrompt('Create a new route for the case studies page.')).toMatchObject({ route: 'route.create' });
  });
});