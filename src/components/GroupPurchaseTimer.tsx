import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, Copy, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PresentationalProps {
  /** ISO string for when the reservation expires. Used if secondsLeft is not provided. */
  expiresAt?: string;
  /** Remaining seconds. Takes precedence over expiresAt when provided. */
  secondsLeft?: number;
  /** Total seconds for the reservation window, used to draw the progress ring. */
  totalSeconds?: number;
}

// Legacy modal props still used by EventDetails (owned elsewhere, mid-migration).
interface LegacyModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  eventTitle?: string;
  pricePerTicket?: number;
}

type GroupPurchaseTimerProps = PresentationalProps & LegacyModalProps;

function computeSecondsLeft(expiresAt?: string): number {
  if (!expiresAt) return 0;
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.floor(diffMs / 1000));
}

/**
 * Countdown ring for a group reservation.
 *
 * Two modes:
 * - Presentational (default for the migrated flow): pass `expiresAt` or
 *   `secondsLeft`. Renders just the ring; it performs no data mutations.
 * - Legacy modal: when `isOpen`/`onClose` are provided (EventDetails), it
 *   renders the original share-and-countdown modal so that file keeps working
 *   unchanged. This mode self-ticks a local 10-minute timer.
 */
export function GroupPurchaseTimer(props: GroupPurchaseTimerProps) {
  const { isOpen, onClose } = props;
  const isModal = isOpen !== undefined || onClose !== undefined;

  if (isModal) return <LegacyTimerModal {...props} />;
  return <TimerRing {...props} />;
}

function TimerRing({ expiresAt, secondsLeft, totalSeconds = 600 }: PresentationalProps) {
  const controlled = secondsLeft !== undefined;
  const [internalLeft, setInternalLeft] = useState(() => computeSecondsLeft(expiresAt));

  useEffect(() => {
    if (controlled) return;
    setInternalLeft(computeSecondsLeft(expiresAt));
    const timer = setInterval(() => {
      setInternalLeft(computeSecondsLeft(expiresAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [controlled, expiresAt]);

  const timeLeft = controlled ? Math.max(0, secondsLeft as number) : internalLeft;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = totalSeconds > 0 ? Math.min(100, (timeLeft / totalSeconds) * 100) : 0;

  return (
    <div className="flex justify-center">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="88" cy="88" r="78" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
          <circle
            cx="88"
            cy="88"
            r="78"
            fill="none"
            stroke={timeLeft > 120 ? 'url(#timerGradient)' : 'hsl(var(--destructive))'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={490}
            strokeDashoffset={490 - (490 * progress) / 100}
            className="transition-all duration-1000"
          />
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Clock
            className={cn('w-6 h-6 mb-1', timeLeft > 120 ? 'text-primary' : 'text-destructive animate-pulse')}
          />
          <span className={cn('text-4xl font-bold', timeLeft > 120 ? 'text-foreground' : 'text-destructive')}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-sm text-muted-foreground">minutes left</span>
        </div>
      </div>
    </div>
  );
}

function LegacyTimerModal({ isOpen, onClose, eventTitle }: LegacyModalProps) {
  const [timeLeft, setTimeLeft] = useState(600);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(600);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const groupLink = `${window.location.origin}/group-purchase/new`;

  const copyLink = () => {
    navigator.clipboard.writeText(groupLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <div className="flex items-center justify-between mb-6">
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <h2 className="text-xl font-bold text-foreground">Group Purchase</h2>
            <div className="w-9" />
          </div>

          <div className="text-center mb-6">
            <p className="text-muted-foreground text-sm mb-1">Event:</p>
            <p className="font-semibold text-foreground">{eventTitle}</p>
          </div>

          <div className="mb-6">
            <TimerRing secondsLeft={timeLeft} totalSeconds={600} />
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-foreground font-medium mb-1">Share with your friends</p>
                <p className="text-xs text-muted-foreground">
                  Tickets are reserved for 10 minutes. Share the link so everyone can join your group.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-secondary rounded-xl">
            <input
              type="text"
              value={groupLink}
              readOnly
              className="flex-1 bg-transparent text-sm text-foreground truncate"
            />
            <button onClick={copyLink} className="p-2 btn-primary-gradient rounded-xl">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
