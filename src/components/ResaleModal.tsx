import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Check, Tag } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ResaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  originalPrice: number;
  eventTitle: string;
}

export function ResaleModal({ isOpen, onClose, ticketId, originalPrice, eventTitle }: ResaleModalProps) {
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const { updateTicketForSale } = useApp();

  const handleSubmit = () => {
    const numPrice = parseFloat(price);
    
    if (!price || isNaN(numPrice)) {
      setError('נא להזין מחיר תקין');
      return;
    }

    if (numPrice > originalPrice) {
      setError('מכירה מעל המחיר המקורי אסורה');
      return;
    }

    if (numPrice <= 0) {
      setError('המחיר חייב להיות גדול מ-0');
      return;
    }

    updateTicketForSale(ticketId, true, numPrice);
    toast.success('הכרטיס פורסם למכירה בהצלחה!', {
      description: `המחיר: ₪${numPrice}`,
    });
    onClose();
    setPrice('');
    setError('');
  };

  const handlePriceChange = (value: string) => {
    setPrice(value);
    const numPrice = parseFloat(value);
    if (value && !isNaN(numPrice) && numPrice > originalPrice) {
      setError('מכירה מעל המחיר המקורי אסורה');
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
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <h2 className="text-xl font-bold text-foreground">מכירה חוזרת</h2>
            <div className="w-9" />
          </div>

          {/* Event Info */}
          <div className="bg-muted/50 rounded-xl p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">אירוע:</p>
            <p className="font-semibold text-foreground">{eventTitle}</p>
            <div className="flex items-center gap-2 mt-2 text-sm">
              <Tag className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">מחיר מקורי:</span>
              <span className="font-bold text-primary">₪{originalPrice}</span>
            </div>
          </div>

          {/* Anti-Scalping Notice */}
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  הגנה מפני סחר בכרטיסים
                </p>
                <p className="text-xs text-muted-foreground">
                  במערכת TickEasy, אסור למכור כרטיסים במחיר גבוה מהמחיר המקורי.
                  זה מגן על כולם מפני סחרנים.
                </p>
              </div>
            </div>
          </div>

          {/* Price Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              מחיר המכירה
            </label>
            <div className="relative">
              <input
                type="number"
                value={price}
                onChange={(e) => handlePriceChange(e.target.value)}
                placeholder="0"
                className={cn(
                  "w-full py-4 px-4 pr-10 rounded-xl border text-lg font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all",
                  error
                    ? 'border-destructive focus:ring-destructive/20 focus:border-destructive'
                    : 'border-border focus:ring-primary/20 focus:border-primary'
                )}
                dir="ltr"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₪
              </span>
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
            disabled={!!error || !price}
            className={cn(
              "w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all",
              error || !price
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'btn-success-gradient'
            )}
          >
            <Check className="w-5 h-5" />
            פרסם למכירה
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
