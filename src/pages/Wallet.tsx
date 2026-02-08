import { motion } from 'framer-motion';
import { Ticket, Sparkles, Wallet as WalletIcon } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { TicketCard } from '@/components/TicketCard';
import { useApp } from '@/context/AppContext';

export default function Wallet() {
  const { userTickets } = useApp();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary" />
        <div className="absolute inset-0 bg-mesh opacity-40" />
        
        <div className="relative pt-12 pb-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-xl">
              <WalletIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">My Tickets</h1>
              <p className="text-white/70">
                {userTickets.length} {userTickets.length === 1 ? 'ticket' : 'tickets'} in your wallet
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {userTickets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-6 flex items-center justify-center shadow-xl"
            >
              <Ticket className="w-14 h-14 text-primary" />
            </motion.div>
            <h2 className="text-xl font-bold text-foreground mb-2">No tickets yet</h2>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Your purchased tickets will appear here. Start exploring events!
            </p>
            <motion.div 
              className="mt-6 flex items-center justify-center gap-2 text-primary"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Discover events</span>
            </motion.div>
          </motion.div>
        ) : (
          <div className="space-y-5">
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
