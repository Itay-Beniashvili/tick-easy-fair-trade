import { describe, it, expect } from 'vitest';
import { finalScore, normalizedPurchaseScore, rankEvents } from './recommend';

describe('finalScore (report §4.2.3)', () => {
  it('matches the report worked example: pref 5, 3 purchases -> 3.88', () => {
    expect(finalScore(5, 3)).toBeCloseTo(3.88, 2);
  });

  it('matches the report example: pref 3, 1 purchase -> 2.36', () => {
    expect(finalScore(3, 1)).toBeCloseTo(2.36, 2);
  });

  it('caps the normalized purchase score at 5', () => {
    expect(normalizedPurchaseScore(1000)).toBe(5);
    expect(finalScore(0, 1000, 0, 1)).toBe(5);
  });
});

describe('rankEvents', () => {
  it('orders events by hybrid score of their genre, descending', () => {
    const events = [
      { id: 'a', genre: 'sports' as const },
      { id: 'b', genre: 'music' as const },
      { id: 'c', genre: 'theater' as const },
    ];
    const ranked = rankEvents(
      events,
      { music: 5, theater: 3, sports: 2 },
      { music: 3, theater: 1, sports: 0 },
    );
    expect(ranked.map((e) => e.id)).toEqual(['b', 'c', 'a']);
  });
});
