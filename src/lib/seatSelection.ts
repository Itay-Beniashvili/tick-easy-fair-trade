// Seating Phase 2 — pure helpers for the seat-level picker (SectionPicker.tsx's
// expanded-section grid). Kept separate from the component so selection/
// no-orphan/countdown logic is unit-testable without rendering anything (the
// repo has no jsdom).

export type SeatStatus = 'available' | 'held' | 'sold';

/** Narrow shape the pure helpers below need — lets tests build lightweight
 *  fixtures instead of full SeatRow objects. */
export interface SeatLike {
  id: string;
  row_label: string;
  seat_number: number;
  status: string;
}

export const MAX_SEATS = 6;

export type ToggleBlockReason = 'unavailable' | 'max' | 'orphan';

export interface ToggleResult {
  selected: string[];
  /** Present only when the toggle was rejected; `selected` is then unchanged. */
  blocked?: ToggleBlockReason;
}

/** True if claiming every seat in `occupiedIds` (in addition to whatever is
 *  already 'held'/'sold') would leave `seat` — an otherwise-available seat —
 *  stranded: both its numeric row-neighbors non-available while it alone
 *  stays available. Row edges (no neighbor at seat_number ± 1) are exempt,
 *  mirroring 011_seat_holds.sql's `hold_seats` no-orphan check exactly (same
 *  rule, client-side pre-check only — the server is authoritative). */
function isStrandedAfterClaim(seat: SeatLike, rowSeats: SeatLike[], occupiedIds: ReadonlySet<string>): boolean {
  const left = rowSeats.find((s) => s.seat_number === seat.seat_number - 1);
  const right = rowSeats.find((s) => s.seat_number === seat.seat_number + 1);
  if (!left || !right) return false; // row edge (or a physical gap) — exempt
  const isOccupied = (s: SeatLike) => occupiedIds.has(s.id) || s.status !== 'available';
  return isOccupied(left) && isOccupied(right);
}

/** True if claiming `occupiedIds` would strand any seat in `rowSeats` (a
 *  single row's seats). */
export function wouldStrandRow(rowSeats: SeatLike[], occupiedIds: ReadonlySet<string>): boolean {
  return rowSeats.some((seat) => {
    if (occupiedIds.has(seat.id)) return false; // this seat itself becomes occupied
    if (seat.status !== 'available') return false; // already unavailable — not a newly-stranded seat
    return isStrandedAfterClaim(seat, rowSeats, occupiedIds);
  });
}

/** Toggle a seat in/out of the current selection. Adding a seat is rejected
 *  (selection returned unchanged, with a `blocked` reason) when: the seat
 *  isn't available, the selection is already at `max`, or the addition would
 *  strand a single available seat in its row. Removing an already-selected
 *  seat always succeeds regardless of its current server status (so a seat
 *  that went stale — e.g. grabbed by someone else while browsing — can still
 *  be deselected). */
export function toggleSeatSelection(
  seats: SeatLike[],
  selected: readonly string[],
  seatId: string,
  max: number = MAX_SEATS,
): ToggleResult {
  if (selected.includes(seatId)) {
    return { selected: selected.filter((id) => id !== seatId) };
  }

  const seat = seats.find((s) => s.id === seatId);
  if (!seat || seat.status !== 'available') {
    return { selected: [...selected], blocked: 'unavailable' };
  }
  if (selected.length >= max) {
    return { selected: [...selected], blocked: 'max' };
  }

  const rowSeats = seats.filter((s) => s.row_label === seat.row_label);
  const occupied = new Set([...selected, seatId]);
  if (wouldStrandRow(rowSeats, occupied)) {
    return { selected: [...selected], blocked: 'orphan' };
  }

  return { selected: [...selected, seatId] };
}

/** Drop any selected ids that are no longer 'available' server-side — used
 *  when a realtime patch (or a fresh fetch) shows a browsed-but-unselected
 *  seat was grabbed by someone else while the local selection still names it. */
export function clampSelectionToAvailable(seats: SeatLike[], selected: readonly string[]): string[] {
  const availableIds = new Set(seats.filter((s) => s.status === 'available').map((s) => s.id));
  return selected.filter((id) => availableIds.has(id));
}

/** True if every id in `selected` is currently 'held' server-side — the
 *  expected shape once `hold_seats` has succeeded. Used to detect a broken
 *  hold (one of my held seats got swept back to 'available') from a live
 *  patch, so the UI can fall back to browsing instead of trusting a stale
 *  'holding' flow state. */
export function allHeld(seats: SeatLike[], selected: readonly string[]): boolean {
  if (selected.length === 0) return false;
  const statusById = new Map(seats.map((s) => [s.id, s.status]));
  return selected.every((id) => statusById.get(id) === 'held');
}

/** Format a countdown as `m:ss` (never negative). `remainingMs` should be
 *  `expiresAt - now`, both in epoch ms. */
export function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
