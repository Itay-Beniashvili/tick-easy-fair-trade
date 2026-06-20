import { supabase, unwrap, type CommunityPostRow } from './client';

type PostType = 'partner' | 'ride' | 'other';

export async function listPosts(eventId?: string): Promise<CommunityPostRow[]> {
  let q = supabase.from('community_posts').select('*').order('created_at', { ascending: false });
  if (eventId) q = q.eq('event_id', eventId);
  return unwrap(await q);
}

export async function createPost(
  eventId: string | null, type: PostType, content: string, userName: string,
): Promise<CommunityPostRow> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not authenticated');
  return unwrap(await supabase.from('community_posts').insert({
    event_id: eventId, user_id: user.id, user_name: userName, type, content,
  }).select().single());
}
