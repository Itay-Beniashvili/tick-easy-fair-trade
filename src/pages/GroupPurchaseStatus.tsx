import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Clock, CheckCircle, XCircle, Copy, Check, Share2, CreditCard, UserPlus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { GroupPurchasePayment } from '@/components/GroupPurchasePayment';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { getGroup, joinGroup, cancelExpired } from '@/api/groups';
import { getProfile } from '@/api/profile';
import { useAuth } from '@/context/AuthContext';
import { formatILS } from '@/lib/currency';
import { toast } from 'sonner';
import type { GroupRow, GroupParticipantRow } from '@/api/client';

function computeSecondsLeft(expiresAt: string): number {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.floor(diffMs / 1000));
}

export default function GroupPurchaseStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<GroupRow | null>(null);
  const [participants, setParticipants] = useState<GroupParticipantRow[]>([]);
  const [notFound, setNotFound] = useState(false);

  const [copied, setCopied] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [joining, setJoining] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Total window (seconds), used for the progress bar; derived from the group once loaded.
  const totalWindowRef = useRef(600);
  // Guard so the expiry side-effect runs only once per "reached zero".
  const expiredHandledRef = useRef(false);

  const load = useCallback(async () => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    try {
      const result = await getGroup(id);
      if (!result) {
        setNotFound(true);
        setGroup(null);
        setParticipants([]);
        return;
      }
      setNotFound(false);
      setGroup(result.group);
      setParticipants(result.participants);
      const created = new Date(result.group.created_at).getTime();
      const expires = new Date(result.group.expires_at).getTime();
      const window = Math.max(1, Math.floor((expires - created) / 1000));
      totalWindowRef.current = window;
      const remaining = computeSecondsLeft(result.group.expires_at);
      setTimeLeft(remaining);
      expiredHandledRef.current = remaining <= 0;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load group');
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  // Countdown tick (only while group is active).
  useEffect(() => {
    if (!group || group.status !== 'active') return;
    const timer = setInterval(() => {
      setTimeLeft(computeSecondsLeft(group.expires_at));
    }, 1000);
    return () => clearInterval(timer);
  }, [group]);

  // When the timer hits zero on an active group, cancel expired groups and reload.
  useEffect(() => {
    if (!group || group.status !== 'active') return;
    if (timeLeft > 0) return;
    if (expiredHandledRef.current) return;
    expiredHandledRef.current = true;
    (async () => {
      try {
        await cancelExpired();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to expire reservation');
      } finally {
        await load();
      }
    })();
  }, [timeLeft, group, load]);

  const inviteLink = id ? `${window.location.origin}/group-purchase/${id}` : '';

  const copyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = async () => {
    if (!id) return;
    setJoining(true);
    try {
      const profile = await getProfile();
      const name = profile?.full_name ?? user?.email ?? 'Guest';
      await joinGroup(id, name);
      toast.success('You joined the group');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to join group');
    } finally {
      setJoining(false);
    }
  };

  // --- Loading state ---
  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-muted border-t-primary rounded-full"
          />
          <span className="text-sm">Loading…</span>
        </div>
        <BottomNav />
      </div>
    );
  }

  // --- Not found state ---
  if (notFound || !group) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="bg-gradient-hero pt-12 pb-6 px-4">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <XCircle className="w-7 h-7 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Group not found</h1>
          <p className="text-sm text-muted-foreground">
            This group purchase doesn't exist or is no longer available.
          </p>
        </div>
        <BottomNav />
      </div>
    );
  }

  // --- Derived data ---
  const currentParticipant = user ? participants.find((p) => p.user_id === user.id) ?? null : null;
  const paidCount = participants.filter((p) => p.has_paid).length;
  const totalParticipants = participants.length;
  const paidTickets = participants.filter((p) => p.has_paid).reduce((sum, p) => sum + p.ticket_count, 0);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerProgress = Math.min(100, (timeLeft / totalWindowRef.current) * 100);

  const isCancelled = group.status === 'cancelled';
  const isCompleted = group.status === 'completed';
  const isActive = group.status === 'active';

  const myAmount = currentParticipant
    ? group.price_per_ticket * currentParticipant.ticket_count
    : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-hero pt-12 pb-6 px-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Group Purchase</h1>
              <p className="text-white/80 text-sm">Track payments & status</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Completed state */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-success/10 border border-success/20 rounded-2xl p-5 flex items-start gap-3"
          >
            <CheckCircle className="w-6 h-6 text-success shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-success">Group complete!</p>
              <p className="text-sm text-muted-foreground">
                Everyone has paid and all tickets are confirmed.
              </p>
            </div>
          </motion.div>
        )}

        {/* Cancelled / expired state */}
        {isCancelled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/20 rounded-2xl p-5 flex items-start gap-3"
          >
            <XCircle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-destructive">Reservation expired / cancelled</p>
              <p className="text-sm text-muted-foreground">
                The reservation timer ran out before all payments were completed.
              </p>
            </div>
          </motion.div>
        )}

        {/* Timer Card (active only) */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock
                  className={cn('w-5 h-5', timeLeft > 120 ? 'text-primary' : 'text-destructive animate-pulse')}
                />
                <span className="font-semibold text-foreground">Time Remaining</span>
              </div>
              <span
                className={cn('text-3xl font-bold', timeLeft > 120 ? 'text-gradient-warm' : 'text-destructive')}
              >
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
            <Progress value={timerProgress} className={cn('h-2', timeLeft <= 120 && '[&>div]:bg-destructive')} />
            <p className="text-xs text-muted-foreground mt-2">
              Complete all payments before the timer expires
            </p>
          </motion.div>
        )}

        {/* Group Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated p-4"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Price per ticket:</span>
            <span className="font-bold text-primary">{formatILS(group.price_per_ticket)}</span>
          </div>
        </motion.div>

        {/* Payment CTA for current participant who hasn't paid */}
        {isActive && currentParticipant && !currentParticipant.has_paid && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <button
              onClick={() => setShowPayment(true)}
              className="w-full btn-primary-gradient py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Pay for my tickets - {formatILS(myAmount)}
            </button>
          </motion.div>
        )}

        {/* Join CTA for users who are not yet participants */}
        {isActive && !currentParticipant && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <button
              onClick={handleJoin}
              disabled={joining}
              className={cn(
                'w-full btn-primary-gradient py-4 rounded-2xl font-bold flex items-center justify-center gap-2',
                joining && 'opacity-80 cursor-wait',
              )}
            >
              <UserPlus className="w-5 h-5" />
              {joining ? 'Joining…' : 'Join group'}
            </button>
          </motion.div>
        )}

        {/* Already paid confirmation */}
        {isActive && currentParticipant && currentParticipant.has_paid && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-success/10 border border-success/20 rounded-2xl p-4 flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-success shrink-0" />
            <p className="text-sm font-semibold text-foreground">You've paid for your tickets</p>
          </motion.div>
        )}

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-elevated p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-foreground">Payment Progress</span>
            <span className="text-sm text-muted-foreground">
              {paidCount}/{totalParticipants} paid
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${totalParticipants ? (paidCount / totalParticipants) * 100 : 0}%` }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="h-full bg-gradient-to-r from-success to-teal-400 rounded-full"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {paidTickets} of {group.total_tickets} tickets confirmed
          </p>
        </motion.div>

        {/* Share Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card-elevated p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Share2 className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Invite Link</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-xl">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="flex-1 bg-transparent text-sm text-foreground truncate"
            />
            <button onClick={copyLink} className="p-2 btn-primary-gradient rounded-xl">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>

        {/* Participants List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-elevated p-4"
        >
          <h3 className="font-semibold text-foreground mb-4">Participants</h3>
          <div className="space-y-3">
            {participants.map((participant, index) => (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center justify-between p-3 bg-muted rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      participant.has_paid ? 'bg-success' : 'bg-muted-foreground'
                    }`}
                  >
                    {participant.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{participant.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {participant.ticket_count} ticket{participant.ticket_count > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {participant.has_paid ? (
                    <span className="flex items-center gap-1 text-success text-sm font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      Paid
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-warning text-sm font-semibold">
                      <Clock className="w-4 h-4" />
                      Pending
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timer Warning (active only) */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-warning/10 border border-warning/20 rounded-2xl p-4 flex items-start gap-3"
          >
            <Clock className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Reservation expires soon</p>
              <p className="text-xs text-muted-foreground">
                All participants must complete payment before the timer expires or the reservation will be
                cancelled.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />

      {currentParticipant && (
        <GroupPurchasePayment
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          participantId={currentParticipant.id}
          groupId={group.id}
          amount={myAmount}
          onPaid={load}
        />
      )}
    </div>
  );
}
