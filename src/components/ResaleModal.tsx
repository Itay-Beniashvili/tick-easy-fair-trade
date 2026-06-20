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

  const numPrice = parseFloat(price) || 0;
  const hasPrice = price !== '' && !isNaN(parseFloat(price));
  const ratio = originalPrice > 0 ? numPrice / originalPrice : 0;
  const pctBelow = Math.max(0, Math.round((1 - ratio) * 100));
  // Live "fairness" feedback: green well below face value → amber near it → red over the cap.
  const { tone, status } =
    !hasPrice ? { tone: 'muted-foreground', status: 'Drag to set your price' }
    : ratio > 1 ? { tone: 'destructive', status: 'Above the cap — not allowed' }
    : ratio >= 0.9 ? { tone: 'warning', status: 'At face value' }
    : ratio >= 0.7 ? { tone: 'warning', status: `${pctBelow}% below face value` }
    : { tone: 'success', status: `Great deal · ${pctBelow}% below face value` };
  const toneColor = `hsl(var(--${tone}))`;

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
          className="bg-card w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-elevated max-h-[92vh] overflow-y-auto scrollbar-hide"
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
          <div className="bg-muted/50 rounded-2xl px-4 py-3 mb-5 flex items-center gap-2">
            <Tag className="w-4 h-4 text-gel shrink-0" />
            <p className="font-semibold text-foreground truncate">{eventTitle}</p>
          </div>

          {/* Price control with live anti-scalping feedback */}
          <div className="mb-6">
            <div className="flex items-baseline justify-between mb-1">
              <label className="text-sm font-medium text-foreground">Your selling price</label>
              <span className="font-mono text-xs text-muted-foreground flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Cap {formatILS(originalPrice)}
              </span>
            </div>

            {/* Big colour-shifting readout */}
            <div className="text-center py-3">
              <span
                className="font-mono font-bold text-5xl transition-colors duration-200"
                style={{ color: toneColor }}
              >
                {hasPrice ? formatILS(numPrice) : '₪0'}
              </span>
            </div>

            {/* Slider — physically capped at face value; colour tracks fairness */}
            <input
              type="range"
              min={0}
              max={originalPrice}
              step={1}
              value={hasPrice ? Math.min(numPrice, originalPrice) : 0}
              onChange={(e) => handlePriceChange(e.target.value)}
              style={{ accentColor: hasPrice ? toneColor : 'hsl(var(--gel))' }}
              className="w-full cursor-pointer accent-current"
            />

            {/* Status line */}
            <div
              className="flex items-center justify-center gap-2 mt-3 text-sm font-semibold transition-colors duration-200"
              style={{ color: toneColor }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: toneColor, boxShadow: `0 0 8px ${toneColor}` }} />
              {status}
            </div>

            {/* Exact entry */}
            <div className="relative mt-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg font-bold">₪</span>
              <input
                type="number"
                value={price}
                onChange={(e) => handlePriceChange(e.target.value)}
                placeholder="Enter exact amount"
                className={cn(
                  "w-full py-3.5 px-4 pl-10 rounded-2xl border bg-card text-xl font-bold text-foreground placeholder:text-muted-foreground/60 placeholder:text-base placeholder:font-normal focus:outline-none focus:ring-2 transition-all",
                  error
                    ? 'border-destructive focus:ring-destructive/20'
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
