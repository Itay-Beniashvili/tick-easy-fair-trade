import { describe, it, expect } from 'vitest';
import {
  remaining,
  isSoldOut,
  pickBestAvailable,
  clampQuantity,
  sectionPoints,
  pointsToStr,
  boundingBox,
  seatPosition,
  type SectionLike,
} from './sections';

function section(overrides: Partial<SectionLike> & { id: string }): SectionLike {
  return { capacity: 100, sold: 0, price: 100, ...overrides };
}

describe('remaining', () => {
  it('is capacity minus sold', () => {
    expect(remaining(section({ id: 'a', capacity: 100, sold: 40 }))).toBe(60);
  });
  it('never goes negative even if sold overshoots capacity', () => {
    expect(remaining(section({ id: 'a', capacity: 10, sold: 15 }))).toBe(0);
  });
});

describe('isSoldOut', () => {
  it('true when remaining is 0', () => {
    expect(isSoldOut(section({ id: 'a', capacity: 10, sold: 10 }))).toBe(true);
  });
  it('false when at least one seat remains', () => {
    expect(isSoldOut(section({ id: 'a', capacity: 10, sold: 9 }))).toBe(false);
  });
});

describe('pickBestAvailable', () => {
  it('picks the cheapest section with remaining >= 1', () => {
    const sections = [
      section({ id: 'a', price: 300, capacity: 10, sold: 0 }),
      section({ id: 'b', price: 150, capacity: 10, sold: 0 }),
      section({ id: 'c', price: 200, capacity: 10, sold: 0 }),
    ];
    expect(pickBestAvailable(sections)?.id).toBe('b');
  });
  it('skips sold-out sections even if cheapest', () => {
    const sections = [
      section({ id: 'cheap-sold-out', price: 50, capacity: 10, sold: 10 }),
      section({ id: 'next-cheapest', price: 150, capacity: 10, sold: 5 }),
    ];
    expect(pickBestAvailable(sections)?.id).toBe('next-cheapest');
  });
  it('returns null when every section is sold out', () => {
    const sections = [section({ id: 'a', capacity: 10, sold: 10 }), section({ id: 'b', capacity: 5, sold: 5 })];
    expect(pickBestAvailable(sections)).toBeNull();
  });
  it('returns null for an empty list', () => {
    expect(pickBestAvailable([])).toBeNull();
  });
  it('breaks ties by first occurrence (deterministic)', () => {
    const sections = [
      section({ id: 'first', price: 100, capacity: 10, sold: 0 }),
      section({ id: 'second', price: 100, capacity: 10, sold: 0 }),
    ];
    expect(pickBestAvailable(sections)?.id).toBe('first');
  });
});

describe('clampQuantity', () => {
  it('clamps to remaining when remaining < 6', () => {
    expect(clampQuantity(6, section({ id: 'a', capacity: 10, sold: 7 }))).toBe(3);
  });
  it('caps at 6 even when remaining is large', () => {
    expect(clampQuantity(20, section({ id: 'a', capacity: 100, sold: 0 }))).toBe(6);
  });
  it('floors non-integer input and never returns below 1', () => {
    expect(clampQuantity(2.9, section({ id: 'a', capacity: 10, sold: 0 }))).toBe(2);
    expect(clampQuantity(0, section({ id: 'a', capacity: 10, sold: 0 }))).toBe(1);
    expect(clampQuantity(-5, section({ id: 'a', capacity: 10, sold: 0 }))).toBe(1);
  });
  it('returns 1 (not 0) when the section is sold out, so a stray call is still well-formed', () => {
    expect(clampQuantity(3, section({ id: 'a', capacity: 10, sold: 10 }))).toBe(1);
  });
});

describe('sectionPoints', () => {
  it('extracts points from well-formed geometry JSON', () => {
    const points = sectionPoints({ geometry: { points: [[0, 0], [10, 0], [10, 10]] } as never });
    expect(points).toEqual([[0, 0], [10, 0], [10, 10]]);
  });
  it('returns an empty array for null geometry', () => {
    expect(sectionPoints({ geometry: null as never })).toEqual([]);
  });
  it('returns an empty array for malformed geometry (missing points)', () => {
    expect(sectionPoints({ geometry: {} as never })).toEqual([]);
  });
  it('filters out malformed individual points', () => {
    const points = sectionPoints({ geometry: { points: [[1, 2], 'bad', [3], [4, 5]] } as never });
    expect(points).toEqual([[1, 2], [4, 5]]);
  });
});

describe('pointsToStr', () => {
  it('formats points as an SVG points attribute string', () => {
    expect(pointsToStr([[0, 0], [10, 5], [3.5, 2]])).toBe('0,0 10,5 3.5,2');
  });
  it('returns an empty string for no points', () => {
    expect(pointsToStr([])).toBe('');
  });
});

describe('boundingBox', () => {
  it('computes min/max extents of a polygon', () => {
    expect(boundingBox([[20, 14], [80, 14], [92, 45], [8, 45]])).toEqual({ minX: 8, maxX: 92, minY: 14, maxY: 45 });
  });
  it('falls back to the full viewBox for an empty polygon', () => {
    expect(boundingBox([])).toEqual({ minX: 0, maxX: 100, minY: 0, maxY: 100 });
  });
  it('collapses to a point for a single-vertex polygon', () => {
    expect(boundingBox([[40, 60]])).toEqual({ minX: 40, maxX: 40, minY: 60, maxY: 60 });
  });
});

describe('seatPosition', () => {
  it('maps section-local (0,0) to the bbox top-left corner', () => {
    expect(seatPosition(0, 0, { minX: 10, maxX: 90, minY: 20, maxY: 60 })).toEqual([10, 20]);
  });
  it('maps section-local (100,100) to the bbox bottom-right corner', () => {
    expect(seatPosition(100, 100, { minX: 10, maxX: 90, minY: 20, maxY: 60 })).toEqual([90, 60]);
  });
  it('maps section-local (50,50) to the bbox center', () => {
    expect(seatPosition(50, 50, { minX: 0, maxX: 100, minY: 0, maxY: 50 })).toEqual([50, 25]);
  });
  it('does not divide by zero for a degenerate (zero-area) bbox', () => {
    expect(seatPosition(50, 50, { minX: 40, maxX: 40, minY: 60, maxY: 60 })).toEqual([40, 60]);
  });
});
