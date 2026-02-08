import { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, MapPin, Calendar, Clock, Tag, Repeat, Sparkles, Shield } from 'lucide-react';
import { UserTicket, events } from '@/data/mockData';
import { format } from 'date-fns';
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

  const formattedDate = format(new Date(event.date), 'EEEE, MMMM d');

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        whileHover={{ scale: 1.01 }}
        className="card-elevated overflow-hidden"
      >
        {/* Ticket Header */}
        <div className="relative">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-xl drop-shadow-lg">{event.title}</h3>
          </div>
          
          {/* Sale Badge */}
          {ticket.isForSale && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 left-3"
            >
              <span className="px-4 py-2 rounded-xl bg-success text-white text-sm font-bold shadow-xl flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Listed - ${ticket.salePrice}
              </span>
            </motion.div>
          )}

          {/* Verified Badge */}
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1.5 rounded-full bg-white/90 text-primary text-xs font-bold backdrop-blur-sm flex items-center gap-1.5 shadow-lg">
              <Shield className="w-3 h-3" />
              Verified
            </span>
          </div>
        </div>

        {/* Perforated Edge */}
        <div className="relative h-7 bg-card">
          <div className="absolute left-0 -top-3.5 w-7 h-7 bg-background rounded-full" />
          <div className="absolute right-0 -top-3.5 w-7 h-7 bg-background rounded-full" />
          <div className="absolute inset-x-8 top-1/2 border-t-2 border-dashed border-border" />
        </div>

        {/* Ticket Details */}
        <div className="p-5 pt-0 space-y-5">
          {/* Event Info */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <span>{event.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-accent" />
              </div>
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-highlight/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-highlight" />
              </div>
              <span>{event.time}</span>
            </div>
          </div>

          {/* Seat Info */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl border border-border/50">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Section</p>
              <p className="font-bold text-foreground text-2xl">{ticket.section}</p>
            </div>
            <div className="text-center border-x border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Row</p>
              <p className="font-bold text-foreground text-2xl">{ticket.row}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Seat</p>
              <p className="font-bold text-foreground text-2xl">{ticket.seat}</p>
            </div>
          </div>

          {/* QR Code Section */}
          <motion.div
            onClick={() => setShowQR(!showQR)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={cn(
              "cursor-pointer transition-all duration-300 overflow-hidden rounded-2xl border",
              showQR ? 'bg-white p-6 border-primary/30' : 'bg-muted/50 p-4 border-transparent hover:border-primary/20'
            )}
          >
            {showQR ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center"
              >
                {/* Simulated QR Code */}
                <div className="w-52 h-52 bg-white p-3 rounded-2xl shadow-inner mb-4 border">
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
                <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1.5 rounded-lg">{ticket.qrCode}</p>
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Tap to hide
                </p>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium text-foreground">Tap to show QR code</span>
              </div>
            )}
          </motion.div>

          {/* Actions */}
          {!ticket.isForSale && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowResaleModal(true)}
              className="w-full py-4 rounded-2xl border-2 border-primary text-primary font-semibold flex items-center justify-center gap-3 hover:bg-primary hover:text-white transition-all text-lg"
            >
              <Repeat className="w-5 h-5" />
              Resell Ticket
            </motion.button>
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
