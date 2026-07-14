import { supabase, unwrap, type CommunityPostRow } from './client';

type PostType = 'partner' | 'ride' | 'other';

export async function listPosts(eventId?: string): Promise<CommunityPostRow[]> {
  let q = supabase.from('community_posts').select('*').is('parent_post_id', null)
    .order('created_at', { ascending: false });
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

/** Replies for a set of top-level posts, one query for the whole visible board. */
export async function listReplies(postIds: string[]): Promise<CommunityPostRow[]> {
  if (postIds.length === 0) return [];
  return unwrap(await supabase.from('community_posts').select('*')
    .in('parent_post_id', postIds).order('created_at', { ascending: true }));
}

export async function createReply(
  parentId: string, content: string, userName: string,
): Promise<CommunityPostRow> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not authenticated');
  return unwrap(await supabase.from('community_posts').insert({
    event_id: null, user_id: user.id, user_name: userName, type: 'other', content,
    parent_post_id: parentId,
  }).select().single());
}
