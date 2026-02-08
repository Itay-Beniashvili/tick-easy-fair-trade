import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
 import { Sparkles, Flame, RefreshCcw } from 'lucide-react';
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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-hero pt-12 pb-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto"
        >
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">Hey there! 👋</h1>
          </div>
          <p className="text-white/80 mb-6">What amazing event awaits you today?</p>
          <SearchBar value={search} onChange={setSearch} />
        </motion.div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
         {/* Search Results */}
         {search && (
           <section>
             <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.4 }}
               className="flex items-center gap-2 mb-4"
             >
               <h2 className="text-lg font-bold text-foreground">Search Results</h2>
             </motion.div>
             
             {filteredEvents.length === 0 ? (
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="text-center py-12"
               >
                 <p className="text-muted-foreground">No events found</p>
               </motion.div>
             ) : (
               <div className="space-y-4">
                 {filteredEvents.map((event, index) => (
                   <EventCard key={event.id} event={event} index={index} />
                 ))}
               </div>
             )}
           </section>
          )}
 
         {/* Side by Side: Recommended & Hot Events */}
         {!search && (
           <div className="grid grid-cols-2 gap-4">
             {/* Recommended Section */}
             <section>
               <motion.div
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ duration: 0.4 }}
                 className="flex items-center gap-2 mb-4"
               >
                 <Sparkles className="w-4 h-4 text-warning" />
                 <h2 className="text-sm font-bold text-foreground">For You</h2>
               </motion.div>
               <div className="space-y-3">
                 {recommendedEvents.length > 0 ? (
                   recommendedEvents.slice(0, 3).map((event, index) => (
                     <EventCard key={event.id} event={event} index={index} compact />
                   ))
                 ) : (
                   <div className="card-elevated p-4 text-center">
                     <p className="text-xs text-muted-foreground mb-2">No preferences set</p>
                     <Link to="/onboarding" className="text-xs text-primary hover:underline">
                       Set preferences
                     </Link>
                   </div>
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
                 <Flame className="w-4 h-4 text-primary" />
                 <h2 className="text-sm font-bold text-foreground">Hot Events</h2>
               </motion.div>
               <div className="space-y-3">
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
               className="flex items-center gap-2 mb-4"
             >
               <h2 className="text-lg font-bold text-foreground">All Events</h2>
             </motion.div>
             <div className="space-y-4">
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
               className="card-elevated p-4 flex items-center gap-4 hover:shadow-lg transition-shadow"
             >
               <div className="w-12 h-12 rounded-2xl bg-gradient-success flex items-center justify-center shrink-0">
                 <RefreshCcw className="w-6 h-6 text-white" />
               </div>
               <div className="flex-1">
                 <h3 className="font-bold text-foreground">Resale Marketplace</h3>
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
