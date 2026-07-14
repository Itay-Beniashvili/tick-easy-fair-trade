import { useEffect, useRef } from 'react';
import { supabase } from '@/api/client';

/** The columns the handler actually needs off a changed `seats` row — a
 *  narrower shape than the full Postgres Changes payload.new. */
export interface SeatChange {
  id: string;
  status: string;
}

/** Subscribes to live UPDATEs on `public.seats` for one expanded section
 *  (P2-B). Postgres Changes, not Broadcast-from-DB — this project has no
 *  realtime.messages/realtime.send(); `public.seats` UPDATEs are published
 *  automatically over the WAL via the `supabase_realtime` publication
 *  (011_seat_holds.sql), and ordinary RLS (public SELECT on seats) governs
 *  receipt, so no channel auth is required.
 *
 *  `onSeatChange` patches the caller's local seat state by id; `onSubscribed`
 *  fires once the channel status reports SUBSCRIBED, so the caller can
 *  refetch once to cover any changes that happened before the subscription
 *  went live (best-effort — this is the documented gap in Postgres Changes).
 *
 *  Pass `sectionId: null` to stay unsubscribed (e.g. section collapsed).
 *  Callbacks are read through refs so the effect never re-subscribes just
 *  because the caller passed a fresh inline function. */
export function useSeatChannel(
  sectionId: string | null,
  onSeatChange: (seat: SeatChange) => void,
  onSubscribed: () => void,
): void {
  const onSeatChangeRef = useRef(onSeatChange);
  const onSubscribedRef = useRef(onSubscribed);
  onSeatChangeRef.current = onSeatChange;
  onSubscribedRef.current = onSubscribed;

  useEffect(() => {
    if (!sectionId) return;

    const channel = supabase
      .channel(`seats:${sectionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'seats', filter: `section_id=eq.${sectionId}` },
        (payload) => {
          const row = payload.new as SeatChange;
          onSeatChangeRef.current(row);
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') onSubscribedRef.current();
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sectionId]);
}
