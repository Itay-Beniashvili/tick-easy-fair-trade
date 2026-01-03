import { motion } from 'framer-motion';
import { Ticket } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { TicketCard } from '@/components/TicketCard';
import { useApp } from '@/context/AppContext';

export default function Wallet() {
  const { userTickets } = useApp();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-hero pt-12 pb-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto"
        >
          <h1 className="text-2xl font-bold text-white mb-1">My Tickets</h1>
          <p className="text-white/80">
            {userTickets.length} {userTickets.length === 1 ? 'ticket' : 'tickets'} in your wallet
          </p>
        </motion.div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {userTickets.length === 0 ? (
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
          <div className="space-y-4">
            {userTickets.map((ticket, index) => (
              <TicketCard key={ticket.id} ticket={ticket} index={index} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
