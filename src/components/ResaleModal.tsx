import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Check, Tag, Shield } from 'lucide-react';
import { listForResale } from '@/api/resale';
import { formatILS } from '@/lib/currency';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ResaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  originalPrice: number;
  eventTitle: string;
  /** Called after the ticket is successfully listed, so the wallet can refresh. */
  onListed?: () => void;
}

export function ResaleModal({ isOpen, onClose, ticketId, originalPrice, eventTitle, onListed }: ResaleModalProps) {
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const numPrice = parseFloat(price);

    if (!price || isNaN(numPrice)) {
      setError('Please enter a valid price');
      return;
    }

    if (numPrice > originalPrice) {
      setError('Selling above face value is prohibited');
      return;
    }

    if (numPrice <= 0) {
      setError('Price must be greater than ₪0');
      return;
    }

    setSubmitting(true);
    try {
      // The RPC re-checks the cap server-side, so a tampered client can't bypass it.
      await listForResale(ticketId, numPrice, originalPrice);
      toast.success('Ticket listed for sale!', {
        description: `Listed at ${formatILS(numPrice)}`,
      });
      onListed?.();
      onClose();
      setPrice('');
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePriceChange = (value: string) => {
    setPrice(value);
    const numPrice = parseFloat(value);
    if (value && !isNaN(numPrice) && numPrice > originalPrice) {
      setError('Selling above face value is prohibited');
    } else {
      setError('');
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
          className="bg-card w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-elevated"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <h2 className="text-xl font-bold text-foreground">Resell Ticket</h2>
            <div className="w-9" />
          </div>

          {/* Event Info */}
          <div className="bg-muted/50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">Event:</p>
            <p className="font-semibold text-foreground">{eventTitle}</p>
            <div className="flex items-center gap-2 mt-2 text-sm">
              <Tag className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Original price:</span>
              <span className="font-bold text-primary">{formatILS(originalPrice)}</span>
            </div>
          </div>

          {/* Anti-Scalping Notice */}
          <div className="bg-gradient-to-r from-warning/10 to-amber-500/10 border border-warning/20 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  Anti-Scalping Protection
                </p>
                <p className="text-xs text-muted-foreground">
                  TickEasy prevents ticket scalping. You cannot sell tickets above the original face value.
                </p>
              </div>
            </div>
          </div>

          {/* Price Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Your selling price
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg font-bold">
                ₪
              </span>
              <input
                type="number"
                value={price}
                onChange={(e) => handlePriceChange(e.target.value)}
                placeholder="0"
                className={cn(
                  "w-full py-4 px-4 pl-10 rounded-2xl border text-2xl font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all",
                  error
                    ? 'border-destructive focus:ring-destructive/20 focus:border-destructive'
                    : 'border-border focus:ring-primary/20 focus:border-primary'
                )}
              />
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-destructive flex items-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4" />
                {error}
              </motion.p>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!!error || !price || submitting}
            className={cn(
              "w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all",
              error || !price || submitting
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'btn-success-gradient'
            )}
          >
            <Check className="w-5 h-5" />
            {submitting ? 'Listing…' : 'List for Sale'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
