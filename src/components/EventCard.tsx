import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { formatILS } from '@/lib/currency';
import { navigateWithImageMorph } from '@/lib/viewTransition';
import { cn } from '@/lib/utils';
import type { EventRow } from '@/api/client';
import type { CSSProperties } from 'react';

interface EventCardProps {
  event: EventRow;
  index?: number;
  compact?: boolean;
}

const genreLabels: Record<string, string> = { music: 'Music', sports: 'Sports', theater: 'Theater' };

/** Each category is lit by its own stage gel; expose it as --c for the card. */
function gelStyle(genre: string): CSSProperties {
  const v = genre === 'sports' ? 'var(--sports)' : genre === 'theater' ? 'var(--theater)' : 'var(--music)';
  return { ['--c' as string]: v } as CSSProperties;
}

export function EventCard({ event, index = 0, compact = false }: EventCardProps) {
  const navigate = useNavigate();
  const imgRef = useRef<HTMLImageElement>(null);
  const shortDate = format(new Date(event.event_date), 'EEE, MMM d');
  const go = () => navigateWithImageMorph(navigate, `/event/${event.id}`, imgRef.current);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        onClick={go}
        style={gelStyle(event.genre)}
        className="group card-elevated overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:ring-1 hover:ring-[hsl(var(--c)/0.35)] hover:shadow-[0_18px_38px_-18px_hsl(var(--c)/0.5)]"
      >
        <div className="relative h-24 overflow-hidden">
          <img ref={imgRef} src={event.image ?? ''} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-[hsl(var(--c)/0.18)] to-transparent" />
          <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[hsl(var(--c))] shadow-[0_0_10px_1px_hsl(var(--c))]" />
        </div>
        <div className="p-3 stub-edge">
          <h3 className="font-display font-bold text-sm leading-tight truncate mb-1">{event.title}</h3>
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-sm">{formatILS(event.price)}</span>
            <span className="text-[10px] text-muted-foreground">{event.available_tickets} left</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      onClick={go}
      style={gelStyle(event.genre)}
      className="group card-elevated overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1.5 hover:ring-1 hover:ring-[hsl(var(--c)/0.35)] hover:shadow-[0_22px_46px_-20px_hsl(var(--c)/0.55)]"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          ref={imgRef}
          src={event.image ?? ''}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[hsl(var(--c)/0.2)] to-transparent" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] tracking-widest uppercase font-bold text-primary-foreground bg-[hsl(var(--c))]">
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
          {genreLabels[event.genre] ?? event.genre}
        </span>
      </div>

      <div className="p-4 stub-edge">
        <h3 className="font-display font-bold text-xl leading-tight mb-1">{event.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {shortDate} · {event.venue}, {event.city}
        </p>

        <div className="flex items-center justify-between">
          <div className="font-mono">
            <span className="text-[11px] text-muted-foreground block leading-none">from</span>
            <span className="font-bold text-xl">{formatILS(event.price)}</span>
          </div>
          <span className={cn(
            'text-xs px-3 py-1.5 rounded-full',
            event.available_tickets < 100
              ? 'text-warning bg-warning/10'
              : 'text-muted-foreground bg-muted',
          )}>
            {event.available_tickets} left
          </span>
        </div>
      </div>
    </motion.div>
  );
}
