import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Flame, RefreshCcw, Search } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { EventCard } from '@/components/EventCard';
import { BottomNav } from '@/components/BottomNav';
import { events, genreLabels } from '@/data/mockData';
import { useApp } from '@/context/AppContext';
import { Link } from 'react-router-dom';

export default function Home() {
  const [search, setSearch] = useState('');
  const { selectedGenres } = useApp();

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch =
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.venue.toLowerCase().includes(search.toLowerCase()) ||
        event.city.toLowerCase().includes(search.toLowerCase()) ||
        event.artist.toLowerCase().includes(search.toLowerCase());

      return matchesSearch;
    });
  }, [search]);

  const recommendedEvents = useMemo(() => {
    if (selectedGenres.length === 0) return [];
    return events.filter(event => selectedGenres.includes(event.genre));
  }, [selectedGenres]);

  const hotEvents = useMemo(() => {
    return events.filter(e => e.availableTickets < 100);
  }, []);

  return (
    <div className="min-h-screen bg-mesh pb-28">
      {/* Header */}
      <div className="bg-gradient-hero pt-14 pb-10 px-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg mx-auto relative z-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Hey there! 👋</h1>
          </div>
          <p className="text-white/70 mb-8 text-lg font-medium">Find your next unforgettable experience</p>
          <SearchBar value={search} onChange={setSearch} />
        </motion.div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-10">
        {/* Search Results */}
        {search && (
          <section>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2 mb-5"
            >
              <Search className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Search Results</h2>
            </motion.div>
            
            {filteredEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 card-elevated"
              >
                <p className="text-muted-foreground">No events found</p>
              </motion.div>
            ) : (
              <div className="space-y-5">
                {filteredEvents.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Side by Side: Recommended & Hot Events */}
        {!search && (
          <div className="grid grid-cols-2 gap-5">
            {/* Recommended Section */}
            <section>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2 mb-4"
              >
                <div className="w-8 h-8 rounded-lg bg-warning/15 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-warning" />
                </div>
                <h2 className="text-sm font-bold text-foreground">For You</h2>
              </motion.div>
              <div className="space-y-4">
                {recommendedEvents.length > 0 ? (
                  recommendedEvents.slice(0, 3).map((event, index) => (
                    <EventCard key={event.id} event={event} index={index} compact />
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card-elevated p-5 text-center"
                  >
                    <p className="text-xs text-muted-foreground mb-3">No preferences set yet</p>
                    <Link 
                      to="/onboarding" 
                      className="text-xs text-primary hover:underline font-semibold"
                    >
                      Set preferences →
                    </Link>
                  </motion.div>
                )}
              </div>
            </section>

            {/* Hot Events Section */}
            <section>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2 mb-4"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-accent" />
                </div>
                <h2 className="text-sm font-bold text-foreground">Hot Events</h2>
              </motion.div>
              <div className="space-y-4">
                {hotEvents.slice(0, 3).map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} compact />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* All Events */}
        {!search && (
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex items-center gap-2 mb-5"
            >
              <h2 className="text-xl font-bold text-foreground">All Events</h2>
            </motion.div>
            <div className="space-y-5">
              {events.map((event, index) => (
                <EventCard key={event.id} event={event} index={index + 6} />
              ))}
            </div>
          </section>
        )}

        {/* Resale Marketplace Link */}
        {!search && (
          <Link to="/marketplace" className="block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="group card-elevated p-5 flex items-center gap-5 hover:shadow-elevated transition-all duration-300 hover:scale-[1.01]"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-success flex items-center justify-center shrink-0 shadow-lg">
                <RefreshCcw className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground text-lg">Resale Marketplace</h3>
                <p className="text-sm text-muted-foreground">Browse verified second-hand tickets</p>
              </div>
            </motion.div>
          </Link>
        )}
      </div>

      <BottomNav />
    </div>
  );
}