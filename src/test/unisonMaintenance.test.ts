import { describe, expect, it } from 'vitest';
import { registryEntryRange } from '../../scripts/unison-lib';

describe('Unison registry maintenance', () => {
  it('selects a whole entry despite braces in copy, comments and nested metadata', () => {
    const entry = `{ id: 'hero:test', description: 'A } and { in copy', /* } */ source: { origin: 'unison' } }`;
    const source = `const variants = [${entry}, { id: 'hero:other' }];`;
    const [start, end] = registryEntryRange(source, 'hero:test');
    expect(source.slice(start, end)).toBe(entry);
    expect(source.slice(0, start) + '{ replacement: true }' + source.slice(end)).toContain(
      "{ replacement: true }, { id: 'hero:other' }",
    );
  });

  it('accepts double-quoted IDs and rejects absent IDs', () => {
    const source = 'const entry = { id: "hero:test", label: "example" };';
    const [start, end] = registryEntryRange(source, 'hero:test');
    expect(source.slice(start, end)).toBe('{ id: "hero:test", label: "example" }');
    expect(() => registryEntryRange(source, 'hero:missing')).toThrow('not found');
  });
});
