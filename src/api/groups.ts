import { supabase, unwrap, type GroupRow, type GroupParticipantRow } from './client';

export async function createGroup(
  eventId: string, totalTickets: number, pricePerTicket: number, expiresInSec: number,
): Promise<GroupRow> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not authenticated');
  const expires = new Date(Date.now() + expiresInSec * 1000).toISOString();
  const group = unwrap(await supabase.from('group_purchases').insert({
    organizer_id: user.id, event_id: eventId, total_tickets: totalTickets,
    price_per_ticket: pricePerTicket, expires_at: expires, status: 'active',
  }).select().single());
  // Organizer joins their own group as the first participant. Routed through the
  // join_group RPC (direct participant inserts are blocked by RLS); its error is
  // surfaced, not swallowed.
  await joinGroup(group.id, 1);
  return group;
}

export async function getGroup(id: string): Promise<{ group: GroupRow; participants: GroupParticipantRow[] } | null> {
  const { data: group, error } = await supabase.from('group_purchases').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!group) return null;
  const participants = unwrap(await supabase.from('group_participants').select('*')
    .eq('group_id', id).order('created_at', { ascending: true }));
  return { group, participants };
}

/** Join a group via the join_group RPC, which enforces active/not-expired/capacity
 *  server-side. Replaces the old direct .insert() into group_participants (now RLS-locked). */
export async function joinGroup(groupId: string, ticketCount = 1): Promise<GroupParticipantRow> {
  const { data, error } = await supabase.rpc('join_group', {
    p_group_id: groupId, p_ticket_count: ticketCount,
  });
  if (error) throw new Error(error.message);
  return data as unknown as GroupParticipantRow;
}

/** Simulated payment for the caller's own participant row via the pay_participant RPC.
 *  Sets has_paid server-side and completes the group when paid tickets ≥ total.
 *  Returns the group's resulting status ('active' | 'completed'). */
export async function payParticipant(groupId: string): Promise<string> {
  const { data, error } = await supabase.rpc('pay_participant', { p_group_id: groupId });
  if (error) throw new Error(error.message);
  return data as string;
}

export async function cancelExpired(): Promise<number> {
  const { data, error } = await supabase.rpc('cancel_expired_groups');
  if (error) throw new Error(error.message);
  return (data as number) ?? 0;
}
