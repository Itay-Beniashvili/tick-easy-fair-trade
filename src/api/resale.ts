import { supabase, unwrap, type TicketRow } from './client';

/** Seller lists their own ticket for resale. Server still enforces the cap on purchase. */
export async function listForResale(ticketId: string, price: number, originalPrice: number): Promise<TicketRow> {
  if (price > originalPrice) throw new Error('Selling above face value is prohibited');
  return unwrap(await supabase.from('tickets')
    .update({ is_for_sale: true, sale_price: price }).eq('id', ticketId).select().single());
}

export async function unlistResale(ticketId: string): Promise<void> {
  const { error } = await supabase.from('tickets')
    .update({ is_for_sale: false, sale_price: null }).eq('id', ticketId);
  if (error) throw new Error(error.message);
}

/** Public marketplace listings (SECURITY DEFINER view of tickets for sale). */
export async function listForSaleMarketplace() {
  return unwrap(await supabase.rpc('get_tickets_for_sale'));
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
