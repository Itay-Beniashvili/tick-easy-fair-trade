import { supabase } from './client';

export interface EventSales {
  ticketsSold: number;
  revenue: number;
}

/** Aggregate PRIMARY (manager) sales per event from the transactions ledger.
 *  Only `type = 'primary'` rows count toward manager revenue / tickets sold, so
 *  resale ('resale') transactions never inflate manager revenue or double-count
 *  seats. This is the single source of truth for both the dashboard and analytics. */
export async function getPrimarySalesByEvent(eventIds: string[]): Promise<Map<string, EventSales>> {
  const byEvent = new Map<string, EventSales>();
  if (eventIds.length === 0) return byEvent;
  const { data, error } = await supabase
    .from('transactions')
    .select('event_id, amount')
    .eq('type', 'primary')
    .in('event_id', eventIds);
  if (error) throw new Error(error.message);
  for (const t of data ?? []) {
    if (!t.event_id) continue;
    const cur = byEvent.get(t.event_id) ?? { ticketsSold: 0, revenue: 0 };
    cur.ticketsSold += 1;
    cur.revenue += Number(t.amount);
    byEvent.set(t.event_id, cur);
  }
  return byEvent;
}
