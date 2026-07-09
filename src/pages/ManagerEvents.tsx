import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, MoreVertical, Plus, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ManagerSidebar } from '@/components/ManagerSidebar';
import { MobileManagerNav } from '@/components/MobileManagerNav';
import { useAuth } from '@/context/AuthContext';
import { listEventsByManager } from '@/api/events';
import type { EventRow } from '@/api/client';
import { formatILS } from '@/lib/currency';
import { format } from 'date-fns';

const genreColors: Record<string, string> = {
  music: 'from-primary to-accent',
  sports: 'from-success to-teal-400',
  theater: 'from-highlight to-purple-400',
};

const genreLabels: Record<string, string> = {
  music: 'Music',
  sports: 'Sports',
  theater: 'Theater',
};

export default function ManagerEvents() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    listEventsByManager(user.id)
      .then((rows) => { if (active) setEvents(rows); })
      .catch(() => { if (active) setEvents([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);

  return (
    <div className="min-h-screen flex">
      <ManagerSidebar />

      <main className="flex-1 pb-20 lg:pb-0">
        {/* Header */}
        <div className="bg-gradient-hero p-6 pt-12 lg:pt-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">Events</h1>
                  <p className="text-white/80">{events.length} active events</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/manager/events/new')}
                className="flex items-center gap-2 px-4 py-2 bg-white text-primary font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                New Event
              </button>
            </motion.div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : events.length === 0 ? (
            <div className="card-elevated p-12 text-center">
              <p className="text-muted-foreground">No events yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event, index) => {
                const formattedDate = format(new Date(event.event_date), 'MMM d, yyyy');

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className="card-elevated p-4 flex gap-4"
                  >
                    <div className="relative">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-28 h-28 lg:w-36 lg:h-28 rounded-2xl object-cover shrink-0"
                      />
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg bg-gradient-to-r ${genreColors[event.genre]} text-white text-[10px] font-bold`}>
                        {genreLabels[event.genre]}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-foreground truncate pr-2">{event.title}</h3>
                        <button className="p-1.5 hover:bg-muted rounded-xl shrink-0 transition-colors">
                          <MoreVertical className="w-5 h-5 text-muted-foreground" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-accent" />
                          <span>{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-highlight" />
                          <span>{event.available_tickets} / {event.total_tickets}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-xs text-muted-foreground">Price</span>
                          <p className="font-bold text-gradient-warm text-lg">{formatILS(event.price)}</p>
                        </div>
                        <div className="h-8 border-r border-border" />
                        <div>
                          <span className="text-xs text-muted-foreground">Available</span>
                          <p className="font-bold text-success">{event.available_tickets}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <MobileManagerNav />
    </div>
  );
}
