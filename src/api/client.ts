import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export { supabase };

// Unwrap a Supabase result: throw on error, return data.
export function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export type EventRow = Tables<'events'>;
export type TicketRow = Tables<'tickets'>;
export type ProfileRow = Tables<'profiles'>;
export type InquiryRow = Tables<'inquiries'>;
export type GroupRow = Tables<'group_purchases'>;
export type GroupParticipantRow = Tables<'group_participants'>;
export type CommunityPostRow = Tables<'community_posts'>;
