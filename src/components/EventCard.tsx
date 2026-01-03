import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Tag } from 'lucide-react';
import { Event, genreLabels } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface EventCardProps {
  event: Event;
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const navigate = useNavigate();

  const formattedDate = format(new Date(event.date), 'EEEE, d בMMMM', { locale: he });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      onClick={() => navigate(`/event/${event.id}`)}
      className="card-elevated overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Genre Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 rounded-full bg-white/90 text-xs font-medium text-foreground">
            {genreLabels[event.genre]}
          </span>
        </div>

        {/* Resale Badge */}
        {event.resaleTickets.length > 0 && (
          <div className="absolute top-3 left-3">
            <span className="verified-badge">
              יד שנייה זמין
            </span>
          </div>
        )}

        {/* Title Overlay */}
        <div className="absolute bottom-3 right-3 left-3">
          <h3 className="text-white font-bold text-lg leading-tight">{event.title}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Location & Date */}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>{event.venue}, {event.city}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{event.time}</span>
          </div>
        </div>

        {/* Price & Tickets */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-primary" />
            <span className="font-bold text-primary text-lg">₪{event.price}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {event.availableTickets} כרטיסים זמינים
          </span>
        </div>
      </div>
    </motion.div>
  );
}
