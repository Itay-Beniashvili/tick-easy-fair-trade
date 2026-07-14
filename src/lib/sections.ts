// Seating S4 — pure helpers for the buyer-facing zone picker (SectionPicker.tsx).
// Kept separate from the component so selection/geometry logic is unit-testable
// without rendering anything.
import type { VenueSectionRow } from '@/api/seats';
import type { Point } from '@/lib/venueTemplates';

/** Narrow shape the pure helpers below need — lets tests build lightweight
 *  fixtures instead of full VenueSectionRow objects. */
export type SectionLike = Pick<VenueSectionRow, 'id' | 'capacity' | 'sold' | 'price'>;

/** Seats left in a section — clamped at 0 even if `sold` somehow overshoots `capacity`. */
export function remaining(section: SectionLike): number {
  return Math.max(0, section.capacity - section.sold);
}

export function isSoldOut(section: SectionLike): boolean {
  return remaining(section) <= 0;
}

/** "Best available" — the cheapest section with at least one seat left.
 *  First cheapest wins on a tie, so the result is deterministic. */
export function pickBestAvailable<T extends SectionLike>(sections: T[]): T | null {
  let best: T | null = null;
  for (const section of sections) {
    if (isSoldOut(section)) continue;
    if (!best || section.price < best.price) best = section;
  }
  return best;
}

/** Clamp a requested quantity into the buyable range for a section: 1..min(6, remaining).
 *  Callers must not open the purchase sheet for a sold-out section in the first place;
 *  this still returns 1 rather than 0 so a stray call never yields an unbuyable quantity. */
export function clampQuantity(requested: number, section: SectionLike): number {
  const max = Math.min(6, remaining(section));
  if (max < 1) return 1;
  const rounded = Math.floor(requested) || 1;
  return Math.max(1, Math.min(max, rounded));
}

/** Parse a section's stored `geometry` JSON into the polygon points SVG needs.
 *  Defensive: malformed/missing geometry renders as an empty (invisible) polygon
 *  rather than throwing. */
export function sectionPoints(section: Pick<VenueSectionRow, 'geometry'>): Point[] {
  const geo = section.geometry as unknown as { points?: unknown } | null;
  const points = geo && Array.isArray(geo.points) ? geo.points : [];
  return points.filter(
    (p): p is Point => Array.isArray(p) && p.length === 2 && typeof p[0] === 'number' && typeof p[1] === 'number',
  );
}

export function pointsToStr(points: Point[]): string {
  return points.map(([x, y]) => `${x},${y}`).join(' ');
}
