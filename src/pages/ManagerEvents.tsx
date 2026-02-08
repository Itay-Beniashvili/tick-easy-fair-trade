import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, MoreVertical, Plus, Flame, TrendingUp, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ManagerSidebar } from '@/components/ManagerSidebar';
import { MobileManagerNav } from '@/components/MobileManagerNav';
import { events, genreLabels } from '@/data/mockData';
import { format } from 'date-fns';

const genreGradients: Record<string, string> = {
  music: 'from-primary to-violet-400',
  sports: 'from-success to-emerald-400',
  theater: 'from-accent to-pink-400',
};

export default function ManagerEvents() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex">
      <ManagerSidebar />
      
      <main className="flex-1 pb-20 lg:pb-0">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent via-primary to-primary" />
          <div className="absolute inset-0 bg-mesh opacity-40" />
          
          <div className="relative p-6 pt-12 lg:pt-6">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-xl">
                    <Flame className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Events</h1>
                    <p className="text-white/70 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      {events.length} active events
                    </p>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/manager/events/new')}
                  className="flex items-center gap-2 px-5 py-3 bg-white text-primary font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                >
                  <Plus className="w-5 h-5" />
                  New Event
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          <div className="space-y-4">
            {events.map((event, index) => {
              const formattedDate = format(new Date(event.date), 'MMM d, yyyy');

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  whileHover={{ scale: 1.01 }}
                  className="card-elevated p-5 flex gap-5"
                >
                  <div className="relative shrink-0">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-32 h-32 lg:w-40 lg:h-32 rounded-2xl object-cover shadow-lg"
                    />
                    <div className={`absolute top-2 left-2 px-3 py-1.5 rounded-xl bg-gradient-to-r ${genreGradients[event.genre]} text-white text-xs font-bold shadow-lg`}>
                      {genreLabels[event.genre]}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-foreground text-lg truncate pr-4">{event.title}</h3>
                      <button className="p-2 hover:bg-muted rounded-xl shrink-0 transition-colors">
                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-accent" />
                        </div>
                        <span>{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-highlight/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-highlight" />
                        </div>
                        <span>{event.availableTickets} left</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-xs text-muted-foreground">Price</span>
                        <p className="font-bold text-gradient text-xl">${event.price}</p>
                      </div>
                      <div className="h-10 border-r border-border" />
                      <div>
                        <span className="text-xs text-muted-foreground">Resale</span>
                        <p className="font-bold text-success text-xl flex items-center gap-1">
                          {event.resaleTickets.length}
                          {event.resaleTickets.length > 0 && <Sparkles className="w-4 h-4" />}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      <MobileManagerNav />
    </div>
  );
}
