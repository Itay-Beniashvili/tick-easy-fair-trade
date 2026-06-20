import { supabase, unwrap, type TicketRow, type EventRow } from './client';

export async function listMyTickets(): Promise<TicketRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  return unwrap(await supabase.from('tickets').select('*').eq('user_id', user.id)
    .order('purchase_date', { ascending: false }));
}

/** Primary purchase. Server-authoritative: price + event fields are copied from
 *  public.events inside a SECURITY DEFINER function (clients cannot set the price). */
export async function purchaseTicket(event: EventRow, seatInfo: string): Promise<TicketRow> {
  const { data, error } = await supabase.rpc('purchase_ticket', {
    p_event_id: event.id, p_seat_info: seatInfo,
  });
  if (error) throw new Error(error.message);
  return data as unknown as TicketRow;
}
