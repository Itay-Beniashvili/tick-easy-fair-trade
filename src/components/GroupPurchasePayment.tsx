import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, CreditCard, Ticket, X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface GroupPurchasePaymentProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  pricePerTicket: number;
  ticketCount: number;
}

export function GroupPurchasePayment({ 
  isOpen, 
  onClose, 
  eventTitle, 
  pricePerTicket = 350,
  ticketCount = 1 
}: GroupPurchasePaymentProps) {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isPaying, setIsPaying] = useState(false);
  const [isPaid, setPaid] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(600);
      setPaid(false);
      setIsPaying(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (timeLeft / 600) * 100;
  const totalPrice = pricePerTicket * ticketCount;

  const handlePayment = () => {
    setIsPaying(true);
    // Simulate payment
    setTimeout(() => {
      setIsPaying(false);
      setPaid(true);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-elevated overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-hero p-6">
            <div className="flex items-center justify-between mb-4">
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                <Users className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">Group Purchase</span>
              </div>
              <div className="w-9" />
            </div>
            
            <h2 className="text-xl font-bold text-white text-center mb-1">{eventTitle}</h2>
            <p className="text-white/80 text-center text-sm">Complete your payment to confirm tickets</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Timer */}
            <div className="bg-muted rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className={cn(
                    "w-5 h-5",
                    timeLeft > 120 ? 'text-primary' : 'text-destructive animate-pulse'
                  )} />
                  <span className="text-sm font-semibold text-foreground">Time Remaining</span>
                </div>
                <span className={cn(
                  "text-2xl font-bold",
                  timeLeft > 120 ? 'text-foreground' : 'text-destructive'
                )}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>
              <Progress 
                value={progress} 
                className={cn(
                  "h-2",
                  timeLeft <= 120 && "[&>div]:bg-destructive"
                )}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Tickets are reserved until the timer expires
              </p>
            </div>

            {/* Order Summary */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                Order Summary
              </h3>
              
              <div className="bg-muted rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tickets</span>
                  <span className="font-medium text-foreground">{ticketCount} × ${pricePerTicket}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span className="font-medium text-foreground">$15.00</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-gradient-warm">${(totalPrice + 15).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Status / Button */}
            {isPaid ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-success/10 border border-success/20 rounded-2xl p-4 flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="font-bold text-success">Payment Complete!</p>
                  <p className="text-sm text-muted-foreground">Your tickets are confirmed</p>
                </div>
              </motion.div>
            ) : (
              <button
                onClick={handlePayment}
                disabled={isPaying || timeLeft === 0}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all",
                  timeLeft === 0 
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "btn-primary-gradient hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                {isPaying ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Processing...
                  </>
                ) : timeLeft === 0 ? (
                  'Reservation Expired'
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay ${(totalPrice + 15).toFixed(2)}
                  </>
                )}
              </button>
            )}

            {/* Info */}
            {!isPaid && timeLeft > 0 && (
              <p className="text-xs text-center text-muted-foreground">
                Secure payment powered by Stripe. Your payment information is encrypted.
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
