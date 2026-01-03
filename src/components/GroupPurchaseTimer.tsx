import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, Copy, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GroupPurchaseTimerProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
}

export function GroupPurchaseTimer({ isOpen, onClose, eventTitle }: GroupPurchaseTimerProps) {
  const [timeLeft, setTimeLeft] = useState(600);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(600);
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

  const groupLink = `https://tickeasy.com/group/${Math.random().toString(36).substring(7)}`;

  const copyLink = () => {
    navigator.clipboard.writeText(groupLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <h2 className="text-xl font-bold text-foreground">Group Purchase</h2>
            <div className="w-9" />
          </div>

          {/* Event */}
          <div className="text-center mb-6">
            <p className="text-muted-foreground text-sm mb-1">Event:</p>
            <p className="font-semibold text-foreground">{eventTitle}</p>
          </div>

          {/* Timer Circle */}
          <div className="flex justify-center mb-6">
            <div className="relative w-44 h-44">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="78"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="10"
                />
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
                <Clock className={cn(
                  "w-6 h-6 mb-1",
                  timeLeft > 120 ? 'text-primary' : 'text-destructive animate-pulse'
                )} />
                <span className={cn(
                  "text-4xl font-bold",
                  timeLeft > 120 ? 'text-foreground' : 'text-destructive'
                )}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
                <span className="text-sm text-muted-foreground">minutes left</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-foreground font-medium mb-1">
                  Share with your friends
                </p>
                <p className="text-xs text-muted-foreground">
                  Tickets are reserved for 10 minutes. Share the link so everyone can join your group.
                </p>
              </div>
            </div>
          </div>

          {/* Link */}
          <div className="flex items-center gap-2 p-3 bg-secondary rounded-xl mb-4">
            <input
              type="text"
              value={groupLink}
              readOnly
              className="flex-1 bg-transparent text-sm text-foreground truncate"
            />
            <button
              onClick={copyLink}
              className="p-2 btn-primary-gradient rounded-xl"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Status */}
          <div className="text-center text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              3 tickets reserved
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
