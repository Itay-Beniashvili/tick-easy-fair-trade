import { supabase, unwrap, type EventRow } from './client';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export async function listEvents(): Promise<EventRow[]> {
  return unwrap(await supabase.from('events').select('*').order('event_date', { ascending: true }));
}

export async function getEvent(id: string): Promise<EventRow | null> {
  const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function listEventsByManager(managerId: string): Promise<EventRow[]> {
  return unwrap(await supabase.from('events').select('*').eq('manager_id', managerId)
    .order('event_date', { ascending: true }));
}

export async function createEvent(input: Omit<TablesInsert<'events'>, 'manager_id'>): Promise<EventRow> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not authenticated');
  return unwrap(await supabase.from('events')
    .insert({ ...input, manager_id: user.id }).select().single());
}

export async function updateEvent(id: string, patch: TablesUpdate<'events'>): Promise<EventRow> {
  return unwrap(await supabase.from('events').update(patch).eq('id', id).select().single());
}
