import { supabase, unwrap, type TicketRow } from './client';
import type { Tables, Json } from '@/integrations/supabase/types';
import type { SeatingSection } from '@/lib/venueTemplates';

export type VenueSectionRow = Tables<'venue_sections'>;

export async function getSections(eventId: string): Promise<VenueSectionRow[]> {
  return unwrap(await supabase.from('venue_sections').select('*').eq('event_id', eventId)
    .order('sort', { ascending: true }));
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
