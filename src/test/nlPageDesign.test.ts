import { describe, expect, it } from 'vitest';
import { routePrompt } from '@/unison/nlRouter';
import { parseIntent } from '@/unison/intentParser';

describe('remaining navigation page design', () => {
  it.each([
    'home is complete. design the other nav pages.',
    'finish the remaining pages',
    'build all navigation pages',
  ])('recognizes %s without asking for clarification', prompt => {
    const route = routePrompt(prompt);
    expect(route.route).toBe('page.edit');
    expect(parseIntent(prompt, route).requiresClarification).toBe(false);
  });
});
