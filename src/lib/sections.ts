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

// ---------------------------------------------------------------------------
// Seat-level picker (P2-C) — maps a seat's section-local x/y (baked 0-100 by
// 010's generation, per-section grid space) into the section polygon's
// bounding box within the shared 0-100 viewBox, so seat dots render inside
// the expanded section wherever it sits on the venue map.
// ---------------------------------------------------------------------------
export interface BBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/** Axis-aligned bounding box of a polygon's points, in shared-viewBox units.
 *  Falls back to the full viewBox for an empty/malformed polygon so callers
 *  never divide by a degenerate (zero-area) box downstream without reason. */
export function boundingBox(points: Point[]): BBox {
  if (points.length === 0) return { minX: 0, maxX: 100, minY: 0, maxY: 100 };
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}

/** Linear-maps a seat's section-local x/y (0-100) into a bounding box in
 *  shared-viewBox units. A degenerate box (zero width/height) collapses every
 *  seat onto its single point rather than dividing by zero. */
export function seatPosition(x: number, y: number, bbox: BBox): Point {
  const w = bbox.maxX - bbox.minX;
  const h = bbox.maxY - bbox.minY;
  const cx = bbox.minX + (w === 0 ? 0 : (x / 100) * w);
  const cy = bbox.minY + (h === 0 ? 0 : (y / 100) * h);
  return [cx, cy];
}
