import { supabase, unwrap, type InquiryRow } from './client';

type InquiryType = 'refund' | 'question' | 'complaint';

export async function sendInquiry(
  eventId: string, subject: string, message: string, type: InquiryType, userName: string,
): Promise<InquiryRow> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not authenticated');
  return unwrap(await supabase.from('inquiries').insert({
    user_id: user.id, user_name: userName, event_id: eventId, subject, message, type, status: 'pending',
  }).select().single());
}

/** RLS scopes this to inquiries on the manager's own events. */
export async function listInquiriesForManager(): Promise<InquiryRow[]> {
  return unwrap(await supabase.from('inquiries').select('*').order('created_at', { ascending: false }));
}

export async function resolveInquiry(id: string): Promise<void> {
  const { error } = await supabase.from('inquiries').update({ status: 'resolved' }).eq('id', id);
  if (error) throw new Error(error.message);
}
