import { supabase, unwrap, type TicketRow, type EventRow } from './client';

function newBarcode(): string {
  return 'TKT-' + crypto.randomUUID().replace(/-/g, '');
}

export async function listMyTickets(): Promise<TicketRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  return unwrap(await supabase.from('tickets').select('*').eq('user_id', user.id)
    .order('purchase_date', { ascending: false }));
}

/** Primary purchase: mints a ticket for the current user against an event. */
export async function purchaseTicket(event: EventRow, seatInfo: string): Promise<TicketRow> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not authenticated');
  const ticket = unwrap(await supabase.from('tickets').insert({
    user_id: user.id,
    event_id: event.id,
    event_title: event.title,
    event_venue: event.venue,
    event_city: event.city,
    event_date: String(event.event_date),
    event_time: event.event_time,
    event_image: event.image,
    ticket_type: 'standard',
    seat_info: seatInfo,
    price: event.price,
    qr_code: newBarcode(),
    is_for_sale: false,
  }).select().single());
  await supabase.from('transactions').insert({
    ticket_id: ticket.id, event_id: event.id, buyer_id: user.id, amount: event.price, type: 'primary',
  });
  if (event.available_tickets > 0) {
    await supabase.from('events').update({ available_tickets: event.available_tickets - 1 }).eq('id', event.id);
  }
  return ticket;
}
