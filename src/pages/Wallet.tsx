import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { TicketCard } from '@/components/TicketCard';
import { EventCardSkeleton } from '@/components/Skeletons';
import { listMyTickets } from '@/api/tickets';
import type { TicketRow } from '@/api/client';
import { toast } from 'sonner';

export default function Wallet() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setTickets(await listMyTickets());
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen pb-24 lg:pb-10 lg:pt-16">
      {/* Header */}
      <div className="bg-gradient-hero pt-12 pb-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg lg:max-w-5xl mx-auto"
        >
          <h1 className="font-display font-extrabold text-4xl text-white mb-1">My <span className="font-serif-accent font-normal">tickets.</span></h1>
          <p className="text-white/70 font-mono text-xs uppercase tracking-[0.14em]">
            {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'} in your wallet
          </p>
        </motion.div>
      </div>

      <div className="max-w-lg lg:max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <EventCardSkeleton key={i} />)}
          </div>
        ) : tickets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-4 flex items-center justify-center">
              <Ticket className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">No tickets yet</h2>
            <p className="text-muted-foreground">
              Your purchased tickets will appear here
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map((ticket, index) => (
              <TicketCard key={ticket.id} ticket={ticket} index={index} onChanged={load} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
