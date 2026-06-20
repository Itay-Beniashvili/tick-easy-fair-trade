import { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, MapPin, Calendar, Clock, Repeat } from 'lucide-react';
import { format } from 'date-fns';
import { ResaleModal } from './ResaleModal';
import { cn } from '@/lib/utils';
import { formatILS } from '@/lib/currency';
import type { TicketRow } from '@/api/client';

interface TicketCardProps {
  ticket: TicketRow;
  index?: number;
  /** Called after a successful resale listing so the parent can refresh. */
  onChanged?: () => void;
}

/** Deterministic 8x8 "QR" pattern derived from the ticket's qr_code.
 *  Using a stable hash (not Math.random()) keeps the rendered code from
 *  flickering on every paint and makes each ticket's pattern unique & repeatable. */
function qrPattern(seed: string): boolean[] {
  return Array.from({ length: 64 }, (_, i) => {
    let h = 2166136261 ^ i; // FNV-1a-ish, mixed with the cell index
    for (let c = 0; c < seed.length; c++) {
      h ^= seed.charCodeAt(c);
      h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) & 1) === 1;
  });
}

export function TicketCard({ ticket, index = 0, onChanged }: TicketCardProps) {
  const [showQR, setShowQR] = useState(false);
  const [showResaleModal, setShowResaleModal] = useState(false);

  const formattedDate = (() => {
    const d = new Date(ticket.event_date);
    return isNaN(d.getTime()) ? ticket.event_date : format(d, 'EEEE, MMMM d');
  })();

  const cells = qrPattern(ticket.qr_code ?? ticket.id);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        className="card-elevated overflow-hidden"
      >
        {/* Ticket Header */}
        <div className="relative">
          {ticket.event_image && (
            <img
              src={ticket.event_image}
              alt={ticket.event_title}
              className="w-full h-36 object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-white font-bold text-lg drop-shadow-lg">{ticket.event_title}</h3>
          </div>

          {/* Sale Badge */}
          {ticket.is_for_sale && (
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1.5 rounded-full bg-success text-white text-xs font-bold shadow-lg">
                Listed - {formatILS(ticket.sale_price ?? ticket.price)}
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
              <MapPin className="w-4 h-4 text-primary" />
              <span>{ticket.event_venue}, {ticket.event_city}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-accent" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-highlight" />
              <span>{ticket.event_time}</span>
            </div>
          </div>

          {/* Seat Info */}
          <div className="p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Seat</p>
            <p className="font-bold text-foreground text-lg">{ticket.seat_info || 'General Admission'}</p>
          </div>

          {/* QR Code Section */}
          <div
            onClick={() => setShowQR(!showQR)}
            className={cn(
              "cursor-pointer transition-all duration-300 overflow-hidden rounded-2xl",
              showQR ? 'bg-white p-4' : 'bg-muted p-3'
            )}
          >
            {showQR ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center"
              >
                {/* Deterministic QR rendering (stable across renders) */}
                <div className="w-48 h-48 bg-white p-2 rounded-xl shadow-inner mb-3">
                  <div className="w-full h-full grid grid-cols-8 gap-0.5">
                    {cells.map((on, i) => (
                      <div
                        key={i}
                        className={cn(
                          "aspect-square rounded-sm",
                          on ? 'bg-foreground' : 'bg-white'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-mono">{ticket.qr_code}</p>
                <p className="text-xs text-muted-foreground mt-2">Tap to hide</p>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">Tap to show QR code</span>
              </div>
            )}
          </div>

          {/* Actions */}
          {!ticket.is_for_sale && (
            <button
              onClick={() => setShowResaleModal(true)}
              className="w-full py-3 rounded-2xl border-2 border-primary text-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all"
            >
              <Repeat className="w-5 h-5" />
              Resell Ticket
            </button>
          )}
        </div>
      </motion.div>

      <ResaleModal
        isOpen={showResaleModal}
        onClose={() => setShowResaleModal(false)}
        ticketId={ticket.id}
        originalPrice={ticket.price}
        eventTitle={ticket.event_title}
        onListed={onChanged}
      />
    </>
  );
}
