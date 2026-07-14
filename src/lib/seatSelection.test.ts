import { describe, it, expect } from 'vitest';
import {
  toggleSeatSelection,
  wouldStrandRow,
  clampSelectionToAvailable,
  allHeld,
  formatCountdown,
  MAX_SEATS,
  type SeatLike,
} from './seatSelection';

/** A single row 'A' of `n` seats, all available unless overridden. */
function row(n: number, overrides: Record<number, Partial<SeatLike>> = {}): SeatLike[] {
  return Array.from({ length: n }, (_, i) => {
    const seat_number = i + 1;
    return {
      id: `A${seat_number}`,
      row_label: 'A',
      seat_number,
      status: 'available',
      ...(overrides[seat_number] ?? {}),
    };
  });
}

describe('wouldStrandRow', () => {
  it('flags a claim that leaves a single available seat sandwiched between occupied neighbors', () => {
    const seats = row(5); // A1..A5, all available
    // Claiming A2 and A4 would strand A3 between two occupied seats.
    expect(wouldStrandRow(seats, new Set(['A2', 'A4']))).toBe(true);
  });
  it('does not flag a contiguous claim', () => {
    const seats = row(5);
    expect(wouldStrandRow(seats, new Set(['A1', 'A2', 'A3']))).toBe(false);
  });
  it('does not flag a claim that leaves a stranded seat at the row edge', () => {
    const seats = row(3); // A1 A2 A3
    // Claiming A2 leaves A1 (edge, only one neighbor A2) and A3 (edge) — neither
    // has two real neighbors, so neither can be "sandwiched".
    expect(wouldStrandRow(seats, new Set(['A2']))).toBe(false);
  });
  it('ignores seats already unavailable (sold/held) when checking for new orphans', () => {
    const seats = row(3, { 1: { status: 'sold' } }); // A1 sold, A2/A3 available
    // Claiming A3 leaves A2 with left=A1(sold, non-available) and right=A3(claimed) —
    // both non-available, so A2 becomes stranded.
    expect(wouldStrandRow(seats, new Set(['A3']))).toBe(true);
  });
  it('does not flag stranding an already-unavailable seat (it is not newly stranded)', () => {
    const seats = row(3, { 2: { status: 'sold' } }); // A2 sold; claiming A1 and A3 doesn't strand anything NEW
    expect(wouldStrandRow(seats, new Set(['A1', 'A3']))).toBe(false);
  });
});

describe('toggleSeatSelection', () => {
  it('adds an available seat not yet selected', () => {
    const seats = row(5);
    const result = toggleSeatSelection(seats, [], 'A1');
    expect(result).toEqual({ selected: ['A1'] });
  });
  it('removes an already-selected seat regardless of its current status', () => {
    const seats = row(5, { 1: { status: 'sold' } }); // gone stale, but still deselectable
    const result = toggleSeatSelection(seats, ['A1', 'A2'], 'A1');
    expect(result).toEqual({ selected: ['A2'] });
  });
  it('blocks adding a non-available seat', () => {
    const seats = row(5, { 2: { status: 'held' } });
    const result = toggleSeatSelection(seats, [], 'A2');
    expect(result).toEqual({ selected: [], blocked: 'unavailable' });
  });
  it('blocks adding a seat that does not exist', () => {
    const seats = row(3);
    const result = toggleSeatSelection(seats, [], 'ghost');
    expect(result).toEqual({ selected: [], blocked: 'unavailable' });
  });
  it('blocks adding beyond max selection', () => {
    const seats = row(10);
    const selected = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'];
    expect(selected.length).toBe(MAX_SEATS);
    const result = toggleSeatSelection(seats, selected, 'A7');
    expect(result).toEqual({ selected, blocked: 'max' });
  });
  it('respects a custom max', () => {
    const seats = row(5);
    const result = toggleSeatSelection(seats, ['A1'], 'A2', 1);
    expect(result).toEqual({ selected: ['A1'], blocked: 'max' });
  });
  it('blocks a selection that would strand a single seat', () => {
    const seats = row(5);
    const result = toggleSeatSelection(seats, ['A2'], 'A4');
    expect(result).toEqual({ selected: ['A2'], blocked: 'orphan' });
  });
  it('allows a selection that grows a contiguous block', () => {
    const seats = row(5);
    const result = toggleSeatSelection(seats, ['A1', 'A2'], 'A3');
    expect(result).toEqual({ selected: ['A1', 'A2', 'A3'] });
  });
});

describe('clampSelectionToAvailable', () => {
  it('drops selected ids no longer available server-side', () => {
    const seats = row(3, { 2: { status: 'held' } });
    expect(clampSelectionToAvailable(seats, ['A1', 'A2', 'A3'])).toEqual(['A1', 'A3']);
  });
  it('keeps a fully-available selection unchanged', () => {
    const seats = row(3);
    expect(clampSelectionToAvailable(seats, ['A1', 'A3'])).toEqual(['A1', 'A3']);
  });
  it('drops ids for seats no longer present at all', () => {
    const seats = row(2);
    expect(clampSelectionToAvailable(seats, ['A1', 'ghost'])).toEqual(['A1']);
  });
});

describe('allHeld', () => {
  it('is false for an empty selection', () => {
    expect(allHeld(row(3), [])).toBe(false);
  });
  it('is true when every selected seat is held', () => {
    const seats = row(3, { 1: { status: 'held' }, 2: { status: 'held' } });
    expect(allHeld(seats, ['A1', 'A2'])).toBe(true);
  });
  it('is false when any selected seat is no longer held (e.g. swept back to available)', () => {
    const seats = row(3, { 1: { status: 'held' }, 2: { status: 'available' } });
    expect(allHeld(seats, ['A1', 'A2'])).toBe(false);
  });
});

describe('formatCountdown', () => {
  it('formats whole minutes', () => {
    expect(formatCountdown(10 * 60 * 1000)).toBe('10:00');
  });
  it('pads seconds under 10', () => {
    expect(formatCountdown(61 * 1000)).toBe('1:01');
  });
  it('rounds up partial seconds so the badge never shows 0:00 before it truly expires', () => {
    expect(formatCountdown(500)).toBe('0:01');
  });
  it('clamps negative remaining time to 0:00', () => {
    expect(formatCountdown(-5000)).toBe('0:00');
  });
});
