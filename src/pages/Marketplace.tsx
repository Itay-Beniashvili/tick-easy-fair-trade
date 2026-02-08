import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCcw, Shield, CheckCircle, Music, Trophy, Mic, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { events, genreLabels } from '@/data/mockData';
import { BottomNav } from '@/components/BottomNav';
import { cn } from '@/lib/utils';

type Category = 'all' | 'music' | 'sports' | 'standup';

const categoryConfig = {
  all: { label: 'All', icon: RefreshCcw },
  music: { label: 'Music', icon: Music },
  sports: { label: 'Sports', icon: Trophy },
  standup: { label: 'Stand-up', icon: Mic },
};

export default function Marketplace() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  const resaleEvents = useMemo(() => {
    return events.filter(e => e.resaleTickets.length > 0);
  }, []);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'all') return resaleEvents;
    const genreMap: Record<string, string> = { music: 'music', sports: 'sports', standup: 'theater' };
    return resaleEvents.filter(e => e.genre === genreMap[selectedCategory]);
  }, [resaleEvents, selectedCategory]);

  const totalListings = resaleEvents.reduce((sum, e) => sum + e.resaleTickets.length, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-success via-emerald-500 to-teal-500" />
        <div className="absolute inset-0 bg-mesh opacity-40" />
        
        <div className="relative pt-12 pb-8 px-4">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="mb-5 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-xl">
                <RefreshCcw className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Resale Marketplace</h1>
                <p className="text-white/70 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {totalListings} verified listings
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Trust Banner */}
      <div className="max-w-lg mx-auto px-4 -mt-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-success/10 border border-success/30 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">100% Verified Tickets</p>
            <p className="text-xs text-muted-foreground">
              All tickets are verified. Prices cannot exceed the original face value.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Category Filter */}
      <div className="max-w-lg mx-auto px-4 py-5">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {(Object.keys(categoryConfig) as Category[]).map((cat) => {
            const config = categoryConfig[cat];
            const Icon = config.icon;
            const isActive = selectedCategory === cat;
            return (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm whitespace-nowrap transition-all shadow-sm',
                  isActive
                    ? 'bg-success text-white shadow-lg'
                    : 'bg-card border border-border text-muted-foreground hover:border-success/50'
                )}
              >
                <Icon className="w-4 h-4" />
                {config.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Resale Listings */}
      <div className="max-w-lg mx-auto px-4 space-y-5">
        {filteredEvents.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-elevated p-12 text-center"
          >
            <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No resale tickets available in this category</p>
          </motion.div>
        ) : (
          filteredEvents.map((event, eventIndex) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: eventIndex * 0.1, duration: 0.4 }}
              className="card-elevated overflow-hidden"
            >
              {/* Event Header */}
              <div className="relative h-36 overflow-hidden">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-xl drop-shadow-lg">{event.title}</h3>
                  <p className="text-white/70 text-sm mt-1">{event.venue}, {event.city}</p>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1.5 rounded-full bg-success/90 text-white text-xs font-bold backdrop-blur-sm">
                    {event.resaleTickets.length} available
                  </span>
                </div>
              </div>

              {/* Tickets */}
              <div className="p-4 space-y-3">
                {event.resaleTickets.map((ticket) => (
                  <motion.div 
                    key={ticket.id} 
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl border border-border/50 hover:border-success/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="verified-badge">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Sec {ticket.section} · Row {ticket.row}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-success text-lg">${ticket.resalePrice}</p>
                        {ticket.resalePrice < ticket.originalPrice && (
                          <p className="text-xs text-muted-foreground line-through">${ticket.originalPrice}</p>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/event/${event.id}`)}
                        className="px-5 py-2.5 bg-success text-white font-semibold rounded-xl hover:bg-success/90 transition-colors shadow-lg"
                      >
                        Buy
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
