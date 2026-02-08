import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Ticket, BadgeCheck } from 'lucide-react';
import { Event, genreLabels } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  index?: number;
  compact?: boolean;
}

const genreColors: Record<string, string> = {
  music: 'bg-primary',
  sports: 'bg-success',
  theater: 'bg-highlight',
};

export function EventCard({ event, index = 0, compact = false }: EventCardProps) {
  const navigate = useNavigate();

  const formattedDate = format(new Date(event.date), 'EEE, MMM d');
  const shortDate = format(new Date(event.date), 'MMM d');

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        onClick={() => navigate(`/event/${event.id}`)}
        className="group card-elevated overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-elevated hover:scale-[1.02] active:scale-[0.98]"
      >
        <div className="relative h-28 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          {/* Genre pill */}
          <div className={cn(
            "absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white",
            genreColors[event.genre]
          )}>
            {genreLabels[event.genre]}
          </div>

          <div className="absolute bottom-2 left-2 right-2">
            <h3 className="text-white font-bold text-sm leading-tight truncate mb-0.5">{event.title}</h3>
            <p className="text-white/60 text-xs font-medium">{shortDate}</p>
          </div>
        </div>
        <div className="p-3 flex items-center justify-between bg-gradient-to-r from-card to-secondary/30">
          <span className="font-bold text-primary text-base">${event.price}</span>
          {event.resaleTickets.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-success font-semibold bg-success/10 px-2 py-0.5 rounded-full">
              <BadgeCheck className="w-3 h-3" />
              Resale
            </span>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      onClick={() => navigate(`/event/${event.id}`)}
      className="group card-elevated overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-elevated hover:scale-[1.01] active:scale-[0.99]"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Genre Badge */}
        <div className="absolute top-4 left-4">
          <span className={cn(
            "px-3 py-1.5 rounded-full text-xs font-bold text-white backdrop-blur-sm",
            genreColors[event.genre]
          )}>
            {genreLabels[event.genre]}
          </span>
        </div>

        {/* Resale Badge */}
        {event.resaleTickets.length > 0 && (
          <div className="absolute top-4 right-4">
            <span className="verified-badge">
              <BadgeCheck className="w-3.5 h-3.5" />
              Resale Available
            </span>
          </div>
        )}

        {/* Title Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-bold text-xl leading-tight tracking-tight">{event.title}</h3>
          <p className="text-white/70 text-sm font-medium mt-1">{event.artist}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Location & Date */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium">{event.venue}, {event.city}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-accent" />
            </div>
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-8 rounded-lg bg-highlight/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-highlight" />
            </div>
            <span className="font-medium">{event.time}</span>
          </div>
        </div>

        {/* Price & Tickets */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-2xl text-gradient">${event.price}</span>
          </div>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary px-4 py-2 rounded-full font-medium">
            <Ticket className="w-4 h-4" />
            {event.availableTickets} left
          </span>
        </div>
      </div>
    </motion.div>
  );
}