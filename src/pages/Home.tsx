import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCcw, ArrowRight } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { EventCard } from '@/components/EventCard';
import { BottomNav } from '@/components/BottomNav';
import { Link, useNavigate } from 'react-router-dom';
import { listEvents } from '@/api/events';
import { getProfile, getPurchaseCountsByGenre, preferenceScores } from '@/api/profile';
import { rankEvents } from '@/lib/recommend';
import { formatILS } from '@/lib/currency';
import type { EventRow } from '@/api/client';
import { toast } from 'sonner';

type Category = 'all' | 'music' | 'sports' | 'theater';
const categories: Category[] = ['all', 'music', 'sports', 'theater'];
const gelFor: Record<Category, string> = {
  all: 'var(--music)', music: 'var(--music)', sports: 'var(--sports)', theater: 'var(--theater)',
};

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [category, setCategory] = useState<Category>('all');
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
          setRecommended(rankEvents(all, prefs, counts).slice(0, 6));
        }
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // The signature: relight the whole app in the selected category's stage gel.
  useEffect(() => {
    document.documentElement.style.setProperty('--gel', gelFor[category]);
    return () => { document.documentElement.style.setProperty('--gel', 'var(--music)'); };
  }, [category]);

  const visible = useMemo(() => {
    const q = search.toLowerCase();
    return events.filter((e) => {
      const matchesCat = category === 'all' || e.genre === category;
      const matchesQ = !q ||
        e.title.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        (e.artist ?? '').toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });
  }, [search, category, events]);

  const forYou = (recommended.length ? recommended : events).filter(
    (e) => category === 'all' || e.genre === category,
  );
  const featured = forYou[0] ?? visible[0];

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Hero */}
      <header className="bg-gradient-hero px-5 pt-12 pb-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-2 font-display font-extrabold text-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-gel shadow-[0_0_12px_2px_hsl(var(--gel))]" />
              TickEasy
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSearch((s) => !s)}
                aria-label="Search"
                className="w-9 h-9 grid place-items-center rounded-full bg-card border border-white/[0.06] text-foreground"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>
              <Link to="/profile" className="w-9 h-9 rounded-full grid place-items-center font-bold text-sm text-primary-foreground bg-gradient-to-br from-gel to-accent">
                Me
              </Link>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground mb-2">
              Tonight · <span className="text-gel">{events.length} shows live</span>
            </p>
            <h1 className="font-display font-extrabold text-[2.6rem] leading-[0.95] mb-1">
              The lights<br /><span className="text-muted-foreground">are going</span> down.
            </h1>
          </motion.div>

          {showSearch && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5">
              <SearchBar value={search} onChange={setSearch} />
            </motion.div>
          )}
        </div>
      </header>

      {/* Category chips */}
      <div className="max-w-lg mx-auto">
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide px-5 py-4">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              style={{ ['--c' as string]: gelFor[c] }}
              className={
                'flex-none px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all ' +
                (category === c
                  ? 'text-primary-foreground bg-[hsl(var(--c))] shadow-[0_0_18px_-2px_hsl(var(--c))]'
                  : 'text-muted-foreground bg-card border border-white/[0.06]')
              }
            >
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 space-y-7">
        {loading ? (
          <p className="text-center text-muted-foreground py-16">Loading the lineup…</p>
        ) : (
          <>
            {/* Featured — lit poster + stub */}
            {featured && !search && (
              <motion.div
                key={featured.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/event/${featured.id}`)}
                style={{ ['--c' as string]: gelFor[(featured.genre as Category)] ?? 'var(--music)' }}
                className="relative rounded-3xl overflow-hidden cursor-pointer card-elevated"
              >
                <div className="relative h-72">
                  <img src={featured.image ?? ''} alt={featured.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div
                    className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-md animate-breathe pointer-events-none"
                    style={{ background: 'radial-gradient(closest-side, hsl(var(--c)/0.45), transparent 70%)' }}
                  />
                  <div className="absolute inset-0" style={{
                    background:
                      'linear-gradient(180deg, hsl(var(--c)/0.5) 0%, transparent 42%), linear-gradient(0deg, hsl(var(--card)) 6%, hsl(var(--card)/0.2) 55%, transparent 80%)',
                  }} />
                  <div className="absolute left-5 right-5 bottom-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] tracking-widest uppercase font-bold text-primary-foreground bg-[hsl(var(--c))]">
                      ✦ Featured
                    </span>
                    <h2 className="font-display font-extrabold text-3xl leading-none mt-3">{featured.title}</h2>
                    <p className="text-sm text-foreground/85 mt-1">
                      {featured.artist ? `${featured.artist} · ` : ''}{featured.venue}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-5 py-4 stub-edge">
                  <div className="font-mono">
                    <span className="text-[11px] text-muted-foreground block leading-none">from</span>
                    <span className="font-bold text-xl">{formatILS(featured.price)}</span>
                  </div>
                  <span className="btn-primary-gradient text-[15px] inline-flex items-center gap-1.5 py-3">
                    Get tickets <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </motion.div>
            )}

            {/* For you rail */}
            {forYou.length > 1 && !search && (
              <section>
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="font-display font-bold text-xl">For you</h3>
                  <Link to="/marketplace" className="text-[13px] text-muted-foreground">See all</Link>
                </div>
                <div className="flex gap-3.5 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-1">
                  {forYou.slice(1, 7).map((event, i) => (
                    <div key={event.id} className="flex-none w-44">
                      <EventCard event={event} index={i} compact />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Full list (also the search results surface) */}
            <section>
              <h3 className="font-display font-bold text-xl mb-3">
                {search ? 'Results' : category === 'all' ? 'All events' : `${category} tonight`}
              </h3>
              {visible.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">Nothing here yet.</p>
              ) : (
                <div className="space-y-4">
                  {visible.map((event, i) => <EventCard key={event.id} event={event} index={i} />)}
                </div>
              )}
            </section>

            {!search && (
              <Link to="/marketplace" className="block">
                <div className="card-elevated p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-success grid place-items-center shrink-0">
                    <RefreshCcw className="w-6 h-6 text-success-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold">Resale Marketplace</h3>
                    <p className="text-sm text-muted-foreground">Verified second-hand tickets, capped at face value</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
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
