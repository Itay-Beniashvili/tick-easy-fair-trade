import { supabase, unwrap, type TicketRow } from './client';
import type { Tables, Json } from '@/integrations/supabase/types';
import type { SeatingSection } from '@/lib/venueTemplates';

export type VenueSectionRow = Tables<'venue_sections'>;

/** Seat row shape the buyer-facing map needs — no `ticket_id` (private
 *  ownership detail; the public `seats` table never exposes who holds a seat,
 *  only its status). */
export type SeatRow = Pick<Tables<'seats'>, 'id' | 'section_id' | 'row_label' | 'seat_number' | 'x' | 'y' | 'status'>;

export async function getSections(eventId: string): Promise<VenueSectionRow[]> {
  return unwrap(await supabase.from('venue_sections').select('*').eq('event_id', eventId)
    .order('sort', { ascending: true }));
}

/** Seats for one expanded section only — the perf bound from the P2 design
 *  decisions (bounds the DOM to ≤ ~300 nodes; never fetched for a collapsed
 *  section). Ordered so index-based keyboard roving matches the row/seat grid. */
export async function getSeats(sectionId: string): Promise<SeatRow[]> {
  return unwrap(
    await supabase
      .from('seats')
      .select('id,section_id,row_label,seat_number,x,y,status')
      .eq('section_id', sectionId)
      .order('row_label', { ascending: true })
      .order('seat_number', { ascending: true }),
  );
}

/** Places (or replaces) a 10-minute session hold on the given seats within an
 *  event. All-or-nothing, server-authoritative (cap, no-orphan) — this is a
 *  thin wrapper; see 011_seat_holds.sql's `hold_seats` for the real contract.
 *  Returns the hold's expiry timestamp (ISO string). */
export async function holdSeats(eventId: string, seatIds: string[]): Promise<string> {
  const { data, error } = await supabase.rpc('hold_seats', { p_event_id: eventId, p_seat_ids: seatIds });
  if (error) throw new Error(error.message);
  return data as string;
}

/** Releases the caller's active holds for this event (change-seats / cancel /
 *  leaving mid-hold). Returns the count of seats released; safe to call when
 *  there is nothing to release (returns 0). Intended to be called fire-and-forget
 *  from unmount/navigation-away paths. */
export async function releaseMyHolds(eventId: string): Promise<number> {
  const { data, error } = await supabase.rpc('release_my_holds', { p_event_id: eventId });
  if (error) throw new Error(error.message);
  return data as number;
}

/** Converts the caller's currently-active holds for this event into real
 *  ticket rows. Raises if the hold has expired (client should refetch seats
 *  and fall back to the browsing state on error). */
export async function purchaseHeldSeats(eventId: string): Promise<TicketRow[]> {
  const { data, error } = await supabase.rpc('purchase_held_seats', { p_event_id: eventId });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as TicketRow[];
}

/** Buyer purchase within a section — server picks the actual seats (no-orphan
 *  contiguous block when possible) and mints real ticket rows. */
export async function purchaseSectionSeats(eventId: string, sectionId: string, quantity: number): Promise<TicketRow[]> {
  const { data, error } = await supabase.rpc('purchase_section_seats', {
    p_event_id: eventId, p_section_id: sectionId, p_quantity: quantity,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as TicketRow[];
}

/** Manager-only, one-time section+seat generation for an event. Caller must be the
 *  event's manager — enforced server-side by the RPC. */
export async function createEventSections(eventId: string, sections: SeatingSection[]): Promise<number> {
  const { data, error } = await supabase.rpc('create_event_sections', {
    p_event_id: eventId, p_sections: sections as unknown as Json,
  });
  if (error) throw new Error(error.message);
  return data as number;
}
