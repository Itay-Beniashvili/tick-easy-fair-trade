import { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, MapPin, Calendar, Clock, Tag, Repeat } from 'lucide-react';
import { UserTicket, events } from '@/data/mockData';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { ResaleModal } from './ResaleModal';
import { cn } from '@/lib/utils';

interface TicketCardProps {
  ticket: UserTicket;
  index?: number;
}

export function TicketCard({ ticket, index = 0 }: TicketCardProps) {
  const [showQR, setShowQR] = useState(false);
  const [showResaleModal, setShowResaleModal] = useState(false);

  const event = events.find(e => e.id === ticket.eventId);
  if (!event) return null;

  const formattedDate = format(new Date(event.date), 'EEEE, d בMMMM', { locale: he });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        className="card-elevated overflow-hidden"
      >
        {/* Ticket Header with perforated edge effect */}
        <div className="relative">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-32 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-3 right-4 left-4">
            <h3 className="text-white font-bold text-lg">{event.title}</h3>
          </div>
          
          {/* Sale Badge */}
          {ticket.isForSale && (
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 rounded-full bg-success text-success-foreground text-xs font-bold">
                מוצע למכירה - ₪{ticket.salePrice}
              </span>
            </div>
          )}
        </div>

        {/* Perforated Edge */}
        <div className="relative h-6 bg-card">
          <div className="absolute left-0 -top-3 w-6 h-6 bg-background rounded-full" />
          <div className="absolute right-0 -top-3 w-6 h-6 bg-background rounded-full" />
          <div className="absolute inset-x-6 top-1/2 border-t-2 border-dashed border-border" />
        </div>

        {/* Ticket Details */}
        <div className="p-4 pt-0 space-y-4">
          {/* Event Info */}
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{event.venue}</span>
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

          {/* Seat Info */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-muted/50 rounded-xl">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-0.5">אזור</p>
              <p className="font-bold text-foreground">{ticket.section}</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-xs text-muted-foreground mb-0.5">שורה</p>
              <p className="font-bold text-foreground">{ticket.row}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-0.5">מושב</p>
              <p className="font-bold text-foreground">{ticket.seat}</p>
            </div>
          </div>

          {/* QR Code Section */}
          <div
            onClick={() => setShowQR(!showQR)}
            className={cn(
              "cursor-pointer transition-all duration-300 overflow-hidden rounded-xl",
              showQR ? 'bg-white p-4' : 'bg-muted p-3'
            )}
          >
            {showQR ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center"
              >
                {/* Simulated QR Code */}
                <div className="w-48 h-48 bg-white p-2 rounded-lg shadow-inner mb-3">
                  <div className="w-full h-full grid grid-cols-8 gap-0.5">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "aspect-square rounded-sm",
                          Math.random() > 0.5 ? 'bg-foreground' : 'bg-white'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-mono">{ticket.qrCode}</p>
                <p className="text-xs text-muted-foreground mt-2">לחץ להסתרה</p>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">לחץ להצגת QR</span>
              </div>
            )}
          </div>

          {/* Actions */}
          {!ticket.isForSale && (
            <button
              onClick={() => setShowResaleModal(true)}
              className="w-full py-3 rounded-xl border-2 border-primary text-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Repeat className="w-5 h-5" />
              מכירה חוזרת
            </button>
          )}
        </div>
      </motion.div>

      <ResaleModal
        isOpen={showResaleModal}
        onClose={() => setShowResaleModal(false)}
        ticketId={ticket.id}
        originalPrice={ticket.originalPrice}
        eventTitle={event.title}
      />
    </>
  );
}
