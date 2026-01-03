import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, MoreVertical, Plus } from 'lucide-react';
import { ManagerSidebar } from '@/components/ManagerSidebar';
import { MobileManagerNav } from '@/components/MobileManagerNav';
import { events, genreLabels } from '@/data/mockData';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export default function ManagerEvents() {
  return (
    <div className="min-h-screen bg-background flex">
      <ManagerSidebar />
      
      <main className="flex-1 pb-20 lg:pb-0">
        {/* Header */}
        <div className="bg-card border-b border-border p-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">ניהול אירועים</h1>
                <p className="text-muted-foreground">{events.length} אירועים פעילים</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 btn-primary-gradient text-sm">
                <Plus className="w-4 h-4" />
                אירוע חדש
              </button>
            </motion.div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          <div className="space-y-4">
            {events.map((event, index) => {
              const formattedDate = format(new Date(event.date), 'd בMMMM yyyy', { locale: he });

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="card-elevated p-4 flex gap-4"
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-24 h-24 lg:w-32 lg:h-24 rounded-xl object-cover shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-foreground truncate">{event.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {genreLabels[event.genre]}
                        </span>
                      </div>
                      <button className="p-1 hover:bg-muted rounded-lg shrink-0">
                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{event.availableTickets} כרטיסים נותרו</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground">מחיר</span>
                        <p className="font-bold text-primary">₪{event.price}</p>
                      </div>
                      <div className="h-8 border-r border-border" />
                      <div>
                        <span className="text-xs text-muted-foreground">יד שנייה</span>
                        <p className="font-bold text-success">{event.resaleTickets.length}</p>
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
