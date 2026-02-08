import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
 import { ArrowLeft, MapPin, Calendar, Clock, Users, Tag, Shield, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';
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
      <div className="relative h-80">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="relative -mt-24 px-4 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto"
        >
          {/* Title Card */}
          <div className="card-elevated p-6 mb-4">
            <h1 className="text-2xl font-bold text-foreground mb-4">{event.title}</h1>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>{event.venue}, {event.city}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="w-5 h-5 text-accent" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="w-5 h-5 text-highlight" />
                <span>{event.time}</span>
              </div>
            </div>

            <p className="mt-4 text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSelectedTab('primary')}
              className={cn(
                'flex-1 py-3 rounded-2xl font-semibold transition-all',
                selectedTab === 'primary'
                  ? 'btn-primary-gradient'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              Buy Now
            </button>
            <button
              onClick={() => setSelectedTab('resale')}
              className={cn(
                'flex-1 py-3 rounded-2xl font-semibold transition-all relative',
                selectedTab === 'resale'
                  ? 'btn-primary-gradient'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              Resale
              {event.resaleTickets.length > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-success text-white text-xs flex items-center justify-center font-bold">
                  {event.resaleTickets.length}
                </span>
              )}
            </button>
          </div>

          {/* Primary Purchase */}
          {selectedTab === 'primary' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Price Card */}
              <div className="card-elevated p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">Ticket Price</span>
                  </div>
                  <span className="text-3xl font-bold text-gradient-warm">${event.price}</span>
                </div>
                <div className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-full inline-block">
                  {event.availableTickets} tickets available
                </div>
              </div>

              {/* Purchase Buttons */}
              <button
                onClick={handlePurchase}
                className="w-full btn-primary-gradient py-4 text-lg"
              >
                🎟️ Buy Ticket
              </button>

              <button
                onClick={() => setShowGroupPurchase(true)}
                className="w-full py-4 rounded-2xl border-2 border-primary text-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all"
              >
                <Users className="w-5 h-5" />
                Group Purchase
              </button>
 
             <button
               onClick={() => setShowContactManager(true)}
               className="w-full py-3 rounded-2xl bg-muted text-foreground font-medium flex items-center justify-center gap-2 hover:bg-muted/80 transition-all"
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
              <div className="bg-gradient-to-r from-success/10 to-teal-500/10 border border-success/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">
                      Verified & Protected Tickets
                    </p>
                    <p className="text-xs text-muted-foreground">
                      All resale tickets are verified. Prices cannot exceed the original face value.
                    </p>
                  </div>
                </div>
              </div>

              {event.resaleTickets.length === 0 ? (
                <div className="card-elevated p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No resale tickets available</p>
                </div>
              ) : (
                event.resaleTickets.map((ticket) => (
                  <div key={ticket.id} className="card-elevated p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
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
                        <p className="text-2xl font-bold text-gradient-warm">${ticket.resalePrice}</p>
                        {ticket.resalePrice < ticket.originalPrice && (
                          <p className="text-xs text-success font-semibold">
                            Save ${ticket.originalPrice - ticket.resalePrice}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleResalePurchase(ticket.resalePrice)}
                      className="w-full btn-success-gradient py-3"
                    >
                      Buy Verified Ticket
                    </button>
                  </div>
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
