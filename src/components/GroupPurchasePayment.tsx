import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CreditCard, Ticket, X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { payParticipant } from '@/api/groups';
import { formatILS } from '@/lib/currency';
import { toast } from 'sonner';

interface GroupPurchasePaymentProps {
  isOpen: boolean;
  onClose: () => void;
  participantId: string;
  groupId: string;
  amount: number;
  onPaid: () => void;
}

export function GroupPurchasePayment({
  isOpen,
  onClose,
  participantId,
  groupId,
  amount,
  onPaid,
}: GroupPurchasePaymentProps) {
  const [isPaying, setIsPaying] = useState(false);
  const [isPaid, setPaid] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPaid(false);
      setIsPaying(false);
    }
  }, [isOpen]);

  const handlePayment = async () => {
    setIsPaying(true);
    try {
      // Simulated payment: changes real DB state (no real money).
      await payParticipant(participantId, groupId);
      setPaid(true);
      toast.success('Payment confirmed — your tickets are secured');
      onPaid();
      // Brief success state, then close.
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setIsPaying(false);
    }
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

            <h2 className="text-xl font-bold text-white text-center mb-1">Confirm Payment</h2>
            <p className="text-white/80 text-center text-sm">Complete your payment to confirm tickets</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Order Summary */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                Order Summary
              </h3>

              <div className="bg-muted rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Your tickets</span>
                  <span className="font-medium text-foreground">{formatILS(amount)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-gradient-warm">{formatILS(amount)}</span>
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
                disabled={isPaying}
                className={cn(
                  'w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all',
                  'btn-primary-gradient hover:scale-[1.02] active:scale-[0.98]',
                  isPaying && 'opacity-80 cursor-wait',
                )}
              >
                {isPaying ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Confirm payment — {formatILS(amount)}
                  </>
                )}
              </button>
            )}

            {/* Info */}
            {!isPaid && (
              <p className="text-xs text-center text-muted-foreground">
                This is a simulated payment for demo purposes. No real money will be charged.
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
