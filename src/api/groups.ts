import { supabase, unwrap, type GroupRow, type GroupParticipantRow } from './client';

export async function createGroup(
  eventId: string, totalTickets: number, pricePerTicket: number, expiresInSec: number, organizerName: string,
): Promise<GroupRow> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not authenticated');
  const expires = new Date(Date.now() + expiresInSec * 1000).toISOString();
  const group = unwrap(await supabase.from('group_purchases').insert({
    organizer_id: user.id, event_id: eventId, total_tickets: totalTickets,
    price_per_ticket: pricePerTicket, expires_at: expires, status: 'active',
  }).select().single());
  await supabase.from('group_participants').insert({
    group_id: group.id, user_id: user.id, name: organizerName, ticket_count: 1, has_paid: false,
  });
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

export async function joinGroup(groupId: string, name: string): Promise<GroupParticipantRow> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not authenticated');
  return unwrap(await supabase.from('group_participants').insert({
    group_id: groupId, user_id: user.id, name, ticket_count: 1, has_paid: false,
  }).select().single());
}

/** Simulated payment for the caller's own participant row, then attempt group completion. */
export async function payParticipant(participantId: string, groupId: string): Promise<string> {
  const { error } = await supabase.from('group_participants')
    .update({ has_paid: true }).eq('id', participantId);
  if (error) throw new Error(error.message);
  const { data, error: rpcErr } = await supabase.rpc('complete_group_if_paid', { p_group_id: groupId });
  if (rpcErr) throw new Error(rpcErr.message);
  return data as string;
}

export async function cancelExpired(): Promise<number> {
  const { data, error } = await supabase.rpc('cancel_expired_groups');
  if (error) throw new Error(error.message);
  return (data as number) ?? 0;
}
