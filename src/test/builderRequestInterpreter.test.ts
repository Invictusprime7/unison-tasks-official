import { describe, expect, it } from 'vitest';
import {
  heuristicEnvelope,
  requiresRenderableUiPatch,
} from '@/types/builderRequestEnvelope';

describe('Builder request UI patch routing', () => {
  it('keeps cart wiring in the source path even when interpreted as backend-only', () => {
    const prompt = 'wire add to cart so items update live in bag, and at checkout';
    const envelope = heuristicEnvelope('Configure the commerce backend', { hasExistingTemplate: true });
    envelope.requestKinds = ['backend_configuration'];
    envelope.scope.level = 'backend';
    expect(requiresRenderableUiPatch(envelope, prompt)).toBe(true);
  });
  it('keeps an explicit checkout page request in the renderable UI path', () => {
    const prompt = 'Create the checkout page for confirmed bookings';
    const envelope = heuristicEnvelope(prompt, { hasExistingTemplate: true });

    expect(envelope.scope.level).toBe('page');
    expect(requiresRenderableUiPatch(envelope, prompt)).toBe(true);
  });

  it('does not treat a backend-only configuration request as a UI patch', () => {
    const prompt = 'Configure the booking backend and availability tables';
    const envelope = heuristicEnvelope(prompt, { hasExistingTemplate: true });

    expect(requiresRenderableUiPatch(envelope, prompt)).toBe(false);
  });
});
