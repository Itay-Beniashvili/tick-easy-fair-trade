import { supabase, unwrap, type ProfileRow } from './client';
import type { Genre } from '@/lib/recommend';

export async function getProfile(): Promise<ProfileRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function upsertPreferences(genres: Genre[], artists: string[]): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not authenticated');
  const { error } = await supabase
    .from('profiles')
    .update({ preferred_genres: genres, preferred_artists: artists })
    .eq('user_id', user.id);
  if (error) throw new Error(error.message);
}

/** How many tickets the current user has bought per genre — drives the hybrid recommender. */
export async function getPurchaseCountsByGenre(): Promise<Partial<Record<Genre, number>>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};
  const tickets = unwrap(await supabase.from('tickets').select('event_id').eq('user_id', user.id));
  if (!tickets.length) return {};
  const ids = [...new Set(tickets.map((t) => t.event_id))];
  const events = unwrap(await supabase.from('events').select('id,genre').in('id', ids));
  const genreById = new Map(events.map((e) => [e.id, e.genre as Genre]));
  const counts: Partial<Record<Genre, number>> = {};
  for (const t of tickets) {
    const g = genreById.get(t.event_id);
    if (g) counts[g] = (counts[g] ?? 0) + 1;
  }
  return counts;
}

/** Map preferred genres to a 0–5 preference score (selected = 5, else 0). */
export function preferenceScores(genres: string[] | null): Partial<Record<Genre, number>> {
  const out: Partial<Record<Genre, number>> = {};
  (genres ?? []).forEach((g) => { out[g as Genre] = 5; });
  return out;
}
