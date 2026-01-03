import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Calendar, Clock, Users, Tag, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { events } from '@/data/mockData';
import { useApp } from '@/context/AppContext';
import { GroupPurchaseTimer } from '@/components/GroupPurchaseTimer';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addTicket } = useApp();
  const [showGroupPurchase, setShowGroupPurchase] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'primary' | 'resale'>('primary');

  const event = events.find(e => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">האירוע לא נמצא</p>
      </div>
    );
  }

  const formattedDate = format(new Date(event.date), 'EEEE, d בMMMM yyyy', { locale: he });

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
    toast.success('הכרטיס נרכש בהצלחה!', {
      description: 'ניתן לצפות בכרטיס בארנק שלך',
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
    toast.success('הכרטיס מיד שנייה נרכש בהצלחה!', {
      description: 'הכרטיס מאומת ומובטח',
    });
    navigate('/wallet');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className="relative h-72">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 right-4 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center"
        >
          <ArrowRight className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="relative -mt-20 px-4 pb-32">
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
                <Calendar className="w-5 h-5 text-primary" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="w-5 h-5 text-primary" />
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
                'flex-1 py-3 rounded-xl font-medium transition-all',
                selectedTab === 'primary'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              רכישה ראשית
            </button>
            <button
              onClick={() => setSelectedTab('resale')}
              className={cn(
                'flex-1 py-3 rounded-xl font-medium transition-all relative',
                selectedTab === 'resale'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              יד שנייה
              {event.resaleTickets.length > 0 && (
                <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-success text-success-foreground text-xs flex items-center justify-center font-bold">
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
                    <span className="text-muted-foreground">מחיר כרטיס</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">₪{event.price}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {event.availableTickets} כרטיסים זמינים
                </div>
              </div>

              {/* Purchase Buttons */}
              <button
                onClick={handlePurchase}
                className="w-full btn-primary-gradient py-4 text-lg"
              >
                רכוש כרטיס
              </button>

              <button
                onClick={() => setShowGroupPurchase(true)}
                className="w-full py-4 rounded-2xl border-2 border-primary text-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Users className="w-5 h-5" />
                רכישה קבוצתית
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
              <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      כרטיסים מאומתים ומאובטחים
                    </p>
                    <p className="text-xs text-muted-foreground">
                      כל הכרטיסים ביד שנייה עוברים אימות ומחירם לא יכול לעלות על המחיר המקורי
                    </p>
                  </div>
                </div>
              </div>

              {event.resaleTickets.length === 0 ? (
                <div className="card-elevated p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">אין כרטיסים זמינים ביד שנייה</p>
                </div>
              ) : (
                event.resaleTickets.map((ticket) => (
                  <div key={ticket.id} className="card-elevated p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="verified-badge">
                            <CheckCircle className="w-3 h-3" />
                            מאומת
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          אזור {ticket.section} | שורה {ticket.row} | מושב {ticket.seat}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-xl font-bold text-primary">₪{ticket.resalePrice}</p>
                        {ticket.resalePrice < ticket.originalPrice && (
                          <p className="text-xs text-success">
                            חיסכון של ₪{ticket.originalPrice - ticket.resalePrice}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleResalePurchase(ticket.resalePrice)}
                      className="w-full btn-success-gradient py-3"
                    >
                      רכוש כרטיס מאומת
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
    </div>
  );
}
