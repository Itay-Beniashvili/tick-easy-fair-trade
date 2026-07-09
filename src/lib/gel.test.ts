import { describe, it, expect } from 'vitest';
import { gelVar, gelStyle } from './gel';

describe('gelVar', () => {
  it('maps known genres to their gel tokens', () => {
    expect(gelVar('music')).toBe('var(--music)');
    expect(gelVar('sports')).toBe('var(--sports)');
    expect(gelVar('theater')).toBe('var(--theater)');
  });
  it('falls back to music for unknown genres', () => {
    expect(gelVar('opera')).toBe('var(--music)');
    expect(gelVar('')).toBe('var(--music)');
  });
});

describe('gelStyle', () => {
  it('exposes the gel as --c for card-scoped styling', () => {
    expect(gelStyle('sports')).toEqual({ '--c': 'var(--sports)' });
  });
});
