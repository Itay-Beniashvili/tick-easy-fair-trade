import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Flame, RefreshCcw } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { EventCard } from '@/components/EventCard';
import { BottomNav } from '@/components/BottomNav';
import { Link } from 'react-router-dom';
import { listEvents } from '@/api/events';
import { getProfile, getPurchaseCountsByGenre, preferenceScores } from '@/api/profile';
import { rankEvents } from '@/lib/recommend';
import type { EventRow } from '@/api/client';
import { toast } from 'sonner';

export default function Home() {
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState<EventRow[]>([]);
  const [recommended, setRecommended] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await listEvents();
        setEvents(all);
        const [profile, counts] = await Promise.all([getProfile(), getPurchaseCountsByGenre()]);
        const prefs = preferenceScores(profile?.preferred_genres ?? []);
        if (Object.keys(prefs).length > 0 || Object.keys(counts).length > 0) {
          setRecommended(rankEvents(all, prefs, counts).slice(0, 3));
        }
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredEvents = useMemo(() => {
    const q = search.toLowerCase();
    return events.filter((e) =>
      e.title.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      e.city.toLowerCase().includes(q) ||
      (e.artist ?? '').toLowerCase().includes(q),
    );
  }, [search, events]);

  const hotEvents = useMemo(() => events.filter((e) => e.available_tickets < 100).slice(0, 3), [events]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-hero pt-12 pb-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto"
        >
          <h1 className="text-2xl font-bold text-white mb-1">Hey there! 👋</h1>
          <p className="text-white/80 mb-6">What amazing event awaits you today?</p>
          <SearchBar value={search} onChange={setSearch} />
        </motion.div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading events…</p>
        ) : (
          <>
            {search && (
              <section>
                <h2 className="text-lg font-bold text-foreground mb-4">Search Results</h2>
                {filteredEvents.length === 0 ? (
                  <p className="text-center py-12 text-muted-foreground">No events found</p>
                ) : (
                  <div className="space-y-4">
                    {filteredEvents.map((event, i) => <EventCard key={event.id} event={event} index={i} />)}
                  </div>
                )}
              </section>
            )}

            {!search && (
              <div className="grid grid-cols-2 gap-4">
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-warning" />
                    <h2 className="text-sm font-bold text-foreground">For You</h2>
                  </div>
                  <div className="space-y-3">
                    {recommended.length > 0 ? (
                      recommended.map((event, i) => <EventCard key={event.id} event={event} index={i} compact />)
                    ) : (
                      <div className="card-elevated p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-2">No preferences set</p>
                        <Link to="/onboarding" className="text-xs text-primary hover:underline">Set preferences</Link>
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Flame className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-bold text-foreground">Hot Events</h2>
                  </div>
                  <div className="space-y-3">
                    {hotEvents.map((event, i) => <EventCard key={event.id} event={event} index={i} compact />)}
                  </div>
                </section>
              </div>
            )}

            {!search && (
              <section>
                <h2 className="text-lg font-bold text-foreground mb-4">All Events</h2>
                <div className="space-y-4">
                  {events.map((event, i) => <EventCard key={event.id} event={event} index={i} />)}
                </div>
              </section>
            )}

            {!search && (
              <Link to="/marketplace" className="block">
                <div className="card-elevated p-4 flex items-center gap-4 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-success flex items-center justify-center shrink-0">
                    <RefreshCcw className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">Resale Marketplace</h3>
                    <p className="text-sm text-muted-foreground">Browse verified second-hand tickets</p>
                  </div>
                </div>
              </Link>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
