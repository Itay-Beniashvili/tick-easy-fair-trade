import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Tag } from 'lucide-react';
import { Event, genreLabels } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
  index?: number;
}

const genreColors: Record<string, string> = {
  music: 'bg-gradient-to-r from-primary to-accent',
  sports: 'bg-gradient-to-r from-success to-teal-400',
  theater: 'bg-gradient-to-r from-highlight to-purple-400',
};

export function EventCard({ event, index = 0 }: EventCardProps) {
  const navigate = useNavigate();

  const formattedDate = format(new Date(event.date), 'EEEE, MMMM d');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      onClick={() => navigate(`/event/${event.id}`)}
      className="card-elevated overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-elevated hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Genre Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold text-white ${genreColors[event.genre]}`}>
            {genreLabels[event.genre]}
          </span>
        </div>

        {/* Resale Badge */}
        {event.resaleTickets.length > 0 && (
          <div className="absolute top-3 right-3">
            <span className="verified-badge">
              ✓ Resale Available
            </span>
          </div>
        )}

        {/* Title Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg">{event.title}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Location & Date */}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{event.venue}, {event.city}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-accent" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-highlight" />
            <span>{event.time}</span>
          </div>
        </div>

        {/* Price & Tickets */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-primary" />
            <span className="font-bold text-primary text-xl">${event.price}</span>
          </div>
          <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {event.availableTickets} available
          </span>
        </div>
      </div>
    </motion.div>
  );
}
