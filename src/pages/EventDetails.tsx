import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Clock, Users, Tag, Shield, CheckCircle, AlertCircle, MessageCircle, Sparkles, Zap } from 'lucide-react';
import { events } from '@/data/mockData';
import { useApp } from '@/context/AppContext';
import { GroupPurchaseTimer } from '@/components/GroupPurchaseTimer';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ContactManagerModal } from '@/components/ContactManagerModal';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addTicket } = useApp();
  const [showGroupPurchase, setShowGroupPurchase] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'primary' | 'resale'>('primary');
  const [showContactManager, setShowContactManager] = useState(false);

  const event = events.find(e => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    );
  }

  const formattedDate = format(new Date(event.date), 'EEEE, MMMM d, yyyy');

  const handlePurchase = () => {
    const newTicket = {
      id: `t${Date.now()}`,
      eventId: event.id,
      purchaseDate: new Date().toISOString().split('T')[0],
      originalPrice: event.price,
      section: 'A',
      row: String(Math.floor(Math.random() * 20) + 1),
      seat: String(Math.floor(Math.random() * 30) + 1),
      qrCode: `TICK-${Date.now()}-${event.id.toUpperCase()}`,
      isForSale: false,
    };
    addTicket(newTicket);
    toast.success('Ticket purchased successfully!', {
      description: 'Check your wallet to view your ticket',
    });
    navigate('/wallet');
  };

  const handleResalePurchase = (price: number) => {
    const newTicket = {
      id: `t${Date.now()}`,
      eventId: event.id,
      purchaseDate: new Date().toISOString().split('T')[0],
      originalPrice: price,
      section: 'B',
      row: String(Math.floor(Math.random() * 20) + 1),
      seat: String(Math.floor(Math.random() * 30) + 1),
      qrCode: `TICK-${Date.now()}-${event.id.toUpperCase()}-RS`,
      isForSale: false,
    };
    addTicket(newTicket);
    toast.success('Verified resale ticket purchased!', {
      description: 'Ticket is verified and guaranteed',
    });
    navigate('/wallet');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className="relative h-96">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl flex items-center justify-center hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>

        {/* Live badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-12 right-4"
        >
          <span className="px-4 py-2 rounded-full bg-accent/90 text-white text-sm font-bold backdrop-blur-sm flex items-center gap-2 shadow-xl">
            <Zap className="w-4 h-4" />
            On Sale
          </span>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative -mt-28 px-4 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto"
        >
          {/* Title Card */}
          <div className="card-elevated p-6 mb-5">
            <h1 className="text-2xl font-bold text-foreground mb-5">{event.title}</h1>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Venue</p>
                  <p className="font-medium text-foreground">{event.venue}, {event.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">{formattedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="w-10 h-10 rounded-xl bg-highlight/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-highlight" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium text-foreground">{event.time}</p>
                </div>
              </div>
            </div>

            <p className="mt-5 text-muted-foreground leading-relaxed border-t border-border pt-5">
              {event.description}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mb-5">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTab('primary')}
              className={cn(
                'flex-1 py-4 rounded-2xl font-semibold transition-all text-lg',
                selectedTab === 'primary'
                  ? 'btn-primary-gradient shadow-lg'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              Buy Now
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTab('resale')}
              className={cn(
                'flex-1 py-4 rounded-2xl font-semibold transition-all relative text-lg',
                selectedTab === 'resale'
                  ? 'btn-success-gradient shadow-lg'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              Resale
              {event.resaleTickets.length > 0 && (
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-success text-white text-xs flex items-center justify-center font-bold shadow-lg border-2 border-background">
                  {event.resaleTickets.length}
                </span>
              )}
            </motion.button>
          </div>

          {/* Primary Purchase */}
          {selectedTab === 'primary' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Price Card */}
              <div className="card-elevated p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Tag className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-muted-foreground font-medium">Ticket Price</span>
                  </div>
                  <span className="text-4xl font-bold text-gradient">${event.price}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-2.5 rounded-xl">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {event.availableTickets} tickets available
                </div>
              </div>

              {/* Purchase Buttons */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handlePurchase}
                className="w-full btn-primary-gradient py-5 text-lg shadow-xl"
              >
                🎟️ Buy Ticket
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowGroupPurchase(true)}
                className="w-full py-5 rounded-2xl border-2 border-primary text-primary font-semibold flex items-center justify-center gap-3 hover:bg-primary hover:text-white transition-all text-lg"
              >
                <Users className="w-6 h-6" />
                Group Purchase
              </motion.button>

              <button
                onClick={() => setShowContactManager(true)}
                className="w-full py-4 rounded-2xl bg-muted text-foreground font-medium flex items-center justify-center gap-2 hover:bg-muted/80 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                Contact Event Manager
              </button>
            </motion.div>
          )}

          {/* Resale Tickets */}
          {selectedTab === 'resale' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Trust Banner */}
              <div className="bg-gradient-to-r from-success/10 to-emerald-500/10 border border-success/30 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">
                      Verified & Protected Tickets
                    </p>
                    <p className="text-sm text-muted-foreground">
                      All resale tickets are verified. Prices cannot exceed the original face value.
                    </p>
                  </div>
                </div>
              </div>

              {event.resaleTickets.length === 0 ? (
                <div className="card-elevated p-12 text-center">
                  <AlertCircle className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No resale tickets available</p>
                </div>
              ) : (
                event.resaleTickets.map((ticket) => (
                  <motion.div 
                    key={ticket.id} 
                    whileHover={{ scale: 1.01 }}
                    className="card-elevated p-5"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="verified-badge">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Section {ticket.section} · Row {ticket.row} · Seat {ticket.seat}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-success">${ticket.resalePrice}</p>
                        {ticket.resalePrice < ticket.originalPrice && (
                          <p className="text-sm text-success font-medium">
                            Save ${ticket.originalPrice - ticket.resalePrice}
                          </p>
                        )}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleResalePurchase(ticket.resalePrice)}
                      className="w-full btn-success-gradient py-4 text-lg"
                    >
                      Buy Verified Ticket
                    </motion.button>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      <GroupPurchaseTimer
        isOpen={showGroupPurchase}
        onClose={() => setShowGroupPurchase(false)}
        eventTitle={event.title}
      />

      <ContactManagerModal
        isOpen={showContactManager}
        onClose={() => setShowContactManager(false)}
        eventTitle={event.title}
      />
    </div>
  );
}
