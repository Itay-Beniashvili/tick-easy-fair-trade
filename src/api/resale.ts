import { supabase, unwrap, type TicketRow } from './client';

/** Seller lists their own ticket for resale via a SECURITY DEFINER RPC that
 *  enforces the price cap server-side against the ticket's true face value. */
export async function listForResale(ticketId: string, price: number, originalPrice: number): Promise<TicketRow> {
  if (price > originalPrice) throw new Error('Selling above face value is prohibited');
  const { data, error } = await supabase.rpc('list_ticket_for_resale', {
    p_ticket_id: ticketId, p_price: price,
  });
  if (error) throw new Error(error.message);
  return data as unknown as TicketRow;
}

export async function unlistResale(ticketId: string): Promise<void> {
  const { error } = await supabase.rpc('unlist_ticket', { p_ticket_id: ticketId });
  if (error) throw new Error(error.message);
}

/** A single resale listing returned by get_tickets_for_sale. `is_mine` is true when
 *  the listing belongs to the calling user (so the UI can hide their own tickets).
 *  The raw seller user_id is never exposed. */
export interface ResaleListing {
  id: string;
  event_id: string;
  event_title: string;
  event_venue: string;
  event_city: string;
  event_date: string;
  event_time: string;
  event_image: string | null;
  ticket_type: string;
  seat_info: string | null;
  sale_price: number;
  created_at: string;
  is_mine: boolean;
}

/** Public marketplace listings (SECURITY DEFINER view of tickets for sale). */
export async function listForSaleMarketplace(): Promise<ResaleListing[]> {
  return unwrap(await supabase.rpc('get_tickets_for_sale')) as unknown as ResaleListing[];
}

/** Buy a resale ticket. Ownership transfer + new barcode happen atomically server-side,
 *  with the buyer bound to the authenticated user. */
export async function buyResale(ticketId: string, buyerName: string): Promise<TicketRow> {
  const { data, error } = await supabase.rpc('transfer_ticket_ownership', {
    p_ticket_id: ticketId, p_buyer_name: buyerName,
  });
  if (error) throw new Error(error.message);
  return data as unknown as TicketRow;
}
