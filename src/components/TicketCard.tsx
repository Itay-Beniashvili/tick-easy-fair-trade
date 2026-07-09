import { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, MapPin, Calendar, Clock, Repeat, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ResaleModal } from './ResaleModal';
import { unlistResale } from '@/api/resale';
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
  const [unlisting, setUnlisting] = useState(false);

  const handleUnlist = async () => {
    setUnlisting(true);
    try {
      await unlistResale(ticket.id);
      toast.success('Listing removed', { description: 'Your ticket is no longer for sale.' });
      onChanged?.();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUnlisting(false);
    }
  };

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
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="font-display font-bold text-xl drop-shadow-lg">{ticket.event_title}</h3>
          </div>

          {/* Sale Badge */}
          {ticket.is_for_sale && (
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1.5 rounded-full bg-success text-success-foreground text-xs font-bold shadow-lg">
                Listed · {formatILS(ticket.sale_price ?? ticket.price)}
              </span>
            </div>
          )}
        </div>

        {/* Ticket Details */}
        <div className="p-4 pt-5 space-y-4 stub-edge">
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
          <div className="p-3 bg-gel/[0.06] border border-gel/10 rounded-2xl text-center">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-0.5">Seat</p>
            <p className="font-bold text-foreground text-lg">{ticket.seat_info || 'General Admission'}</p>
          </div>

          {/* QR Code Section — glows under the "scanner" light */}
          <button
            type="button"
            onClick={() => setShowQR(!showQR)}
            aria-expanded={showQR}
            aria-label={showQR ? 'Hide QR code' : 'Show QR code'}
            className={cn(
              "w-full block cursor-pointer transition-all duration-300 overflow-hidden rounded-2xl focus-ring",
              showQR ? 'bg-white p-4 shadow-glow' : 'bg-muted p-3'
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
                          on ? 'bg-[#0E0D12]' : 'bg-white'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[#0E0D12]/70 font-mono">{ticket.qr_code}</p>
                <p className="text-xs text-[#0E0D12]/50 mt-2">Tap to hide</p>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5 text-gel" />
                <span className="text-sm font-medium text-foreground">Tap to show QR code</span>
              </div>
            )}
          </button>

          {/* Actions */}
          {!ticket.is_for_sale ? (
            <button
              onClick={() => setShowResaleModal(true)}
              className="w-full py-3 rounded-2xl border border-gel/40 text-gel font-semibold flex items-center justify-center gap-2 hover:bg-gel hover:text-primary-foreground transition-all focus-ring"
            >
              <Repeat className="w-5 h-5" />
              Resell Ticket
            </button>
          ) : (
            <button
              onClick={handleUnlist}
              disabled={unlisting}
              className="w-full py-3 rounded-2xl border border-destructive/40 text-destructive font-semibold flex items-center justify-center gap-2 hover:bg-destructive hover:text-destructive-foreground transition-all disabled:opacity-60 disabled:cursor-not-allowed focus-ring"
            >
              <XCircle className="w-5 h-5" />
              {unlisting ? 'Removing…' : 'Remove listing'}
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
