import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { EventCard } from '@/components/EventCard';
import { BottomNav } from '@/components/BottomNav';
import { events, genreLabels } from '@/data/mockData';
import { useApp } from '@/context/AppContext';

export default function Home() {
  const [search, setSearch] = useState('');
  const { selectedGenres } = useApp();

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch =
        event.title.includes(search) ||
        event.venue.includes(search) ||
        event.city.includes(search) ||
        event.artist.includes(search);

      return matchesSearch;
    });
  }, [search]);

  const recommendedEvents = useMemo(() => {
    if (selectedGenres.length === 0) return [];
    return events.filter(event => selectedGenres.includes(event.genre));
  }, [selectedGenres]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-primary/90 pt-12 pb-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto"
        >
          <h1 className="text-2xl font-bold text-primary-foreground mb-1">שלום! 👋</h1>
          <p className="text-primary-foreground/80 mb-6">מה נחווה היום?</p>
          <SearchBar value={search} onChange={setSearch} />
        </motion.div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
        {/* Recommended Section */}
        {recommendedEvents.length > 0 && !search && (
          <section>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2 mb-4"
            >
              <Sparkles className="w-5 h-5 text-warning" />
              <h2 className="text-lg font-bold text-foreground">מומלץ עבורך</h2>
            </motion.div>
            <div className="space-y-4">
              {recommendedEvents.slice(0, 3).map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* All Events */}
        <section>
          <motion.h2
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-lg font-bold text-foreground mb-4"
          >
            {search ? `תוצאות חיפוש` : 'כל האירועים'}
          </motion.h2>
          
          {filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">לא נמצאו אירועים</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event, index) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  index={recommendedEvents.length > 0 && !search ? index + 3 : index} 
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
