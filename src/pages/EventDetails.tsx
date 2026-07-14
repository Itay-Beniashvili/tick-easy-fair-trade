import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Clock, Users, Tag, Shield, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getEvent } from '@/api/events';
import { purchaseTicket } from '@/api/tickets';
import { listForSaleMarketplace, buyResale } from '@/api/resale';
import { createGroup } from '@/api/groups';
import { getSections, purchaseSectionSeats, type VenueSectionRow } from '@/api/seats';
import { getProfile } from '@/api/profile';
import { useAuth } from '@/context/AuthContext';
import { formatILS } from '@/lib/currency';
import { ContactManagerModal } from '@/components/ContactManagerModal';
import { PurchaseSuccess } from '@/components/PurchaseSuccess';
import { SectionPicker } from '@/components/SectionPicker';
import { Skeleton } from '@/components/Skeletons';
import type { EventRow } from '@/api/client';
import { setGel, resetGel } from '@/lib/gel';
import { easeOutExpo } from '@/lib/motion';

interface Listing {
  id: string; event_id: string; seat_info: string | null; sale_price: number; is_mine: boolean;
}

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [resale, setResale] = useState<Listing[]>([]);
  const [selectedTab, setSelectedTab] = useState<'primary' | 'resale'>('primary');
  const [showContactManager, setShowContactManager] = useState(false);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [groupSize, setGroupSize] = useState(2);
  // Buyer/sender label: real full name, else the user's email (never a UI pronoun).
  const [name, setName] = useState(user?.email ?? '');
  // Seated events have venue_sections rows — S4's zone picker replaces the flat
  // price card/Buy button for these; GA/flat events (empty array) are unaffected.
  const [sections, setSections] = useState<VenueSectionRow[]>([]);

  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        const ev = await getEvent(id);
        setEvent(ev);
        const all = (await listForSaleMarketplace()) as Listing[];
        // Only this event's listings, and never the caller's own tickets.
        setResale((all ?? []).filter((t) => t.event_id === id && !t.is_mine));
        const p = await getProfile();
        if (p?.full_name) setName(p.full_name);
        setSections(await getSections(id));
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Relight the whole venue (StageAmbience, buttons, nav) in this event's gel.
  // resetGel on unmount mirrors Home's convention of restoring the brand gel.
  useEffect(() => {
    if (event) setGel(event.genre);
    return () => resetGel();
  }, [event]);

  if (loading) return (
    <div className="min-h-screen lg:pt-16">
      <Skeleton className="h-80 lg:h-96 rounded-none" />
      <div className="relative -mt-24 px-4 lg:px-8 max-w-lg lg:max-w-6xl mx-auto lg:grid lg:grid-cols-[1.5fr_1fr] lg:gap-8">
        <div className="card-elevated p-6 space-y-4">
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-2/5" /><Skeleton className="h-4 w-1/3" />
        </div>
        <div className="hidden lg:block card-elevated p-5 space-y-4 mt-0">
          <Skeleton className="h-8 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
  if (!event) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Event not found</p></div>;

  const formattedDate = format(new Date(event.event_date), 'EEEE, MMMM d, yyyy');
  const titleWords = event.title.split(' ');
  const eventPassed = new Date(`${event.event_date}T23:59:59`).getTime() < Date.now();
  const soldOut = event.available_tickets <= 0;
  const purchasable = !eventPassed && !soldOut;
  const buyLabel = eventPassed ? 'Event Ended' : soldOut ? 'Sold Out' : '🎟️ Buy Ticket';
  const hasSections = sections.length > 0;

  const handlePurchase = async () => {
    setBusy(true);
    try {
      const seat = `Sec A · Row ${Math.floor(Math.random() * 20) + 1} · Seat ${Math.floor(Math.random() * 30) + 1}`;
      await purchaseTicket(event, seat);
      setSuccess(true);
      setTimeout(() => navigate('/wallet'), 2000);
    } catch (e) { toast.error((e as Error).message); setBusy(false); }
  };

  const handleSectionPurchase = async (sectionId: string, quantity: number) => {
    setBusy(true);
    try {
      await purchaseSectionSeats(event.id, sectionId, quantity);
      setSuccess(true);
      setTimeout(() => navigate('/wallet'), 2000);
      // Refresh counts in the background; a failure here shouldn't block the
      // success flow that already fired above.
      getSections(event.id).then(setSections).catch(() => {});
    } catch (e) {
      setBusy(false);
      throw e; // let SectionPicker's sheet catch it, toast, and stay open
    }
  };

  const handleResaleBuy = async (listing: Listing) => {
    setBusy(true);
    try {
      await buyResale(listing.id, name);
      setSuccess(true);
      setTimeout(() => navigate('/wallet'), 2000);
    } catch (e) { toast.error((e as Error).message); setBusy(false); }
  };

  const handleCreateGroup = async () => {
    setBusy(true);
    try {
      // 30-minute reservation window — friends need time to receive the link,
      // sign in (or register + verify email), join, and pay.
      const group = await createGroup(event.id, groupSize, event.price, 1800);
      toast.success('Group created — share the link to invite friends!');
      navigate(`/group-purchase/${group.id}`);
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen lg:pt-16">
      <div className="relative h-80 lg:h-96 overflow-hidden">
        <img src={event.image ?? ''} alt={event.title} className="w-full h-full object-cover hero-parallax" style={{ viewTransitionName: 'event-hero' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <button onClick={() => navigate(-1)} aria-label="Go back" className="absolute top-12 lg:top-20 left-4 lg:left-8 w-11 h-11 rounded-full glass-effect flex items-center justify-center hover:bg-popover transition-colors focus-ring">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <div className="relative -mt-24 px-4 lg:px-8 pb-32 lg:pb-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-lg lg:max-w-6xl mx-auto lg:grid lg:grid-cols-[1.5fr_1fr] lg:gap-8 lg:items-start">
          <div className="card-elevated p-6 lg:p-8 mb-4 lg:mb-0">
            <h1 aria-label={event.title} className="font-display font-extrabold text-3xl lg:text-4xl text-foreground mb-5">
              {titleWords.map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block whitespace-pre"
                  initial={{ opacity: 0, y: '0.5em' }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.5, ease: easeOutExpo }}
                >
                  {word}{i < titleWords.length - 1 ? ' ' : ''}
                </motion.span>
              ))}
            </h1>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground"><MapPin className="w-5 h-5 text-primary" /><span>{event.venue}, {event.city}</span></div>
              <div className="flex items-center gap-3 text-muted-foreground"><Calendar className="w-5 h-5 text-accent" /><span>{formattedDate}</span></div>
              <div className="flex items-center gap-3 text-muted-foreground"><Clock className="w-5 h-5 text-highlight" /><span>{event.event_time}</span></div>
            </div>
            {event.description && <p className="mt-5 text-muted-foreground leading-relaxed">{event.description}</p>}
          </div>

          <div className="lg:sticky lg:top-24">
          <div className="flex gap-2 mb-4">
            {(['primary', 'resale'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className="relative flex-1 py-3 rounded-2xl font-semibold bg-muted focus-ring"
              >
                {selectedTab === tab && (
                  <motion.span
                    layoutId="buyResaleIndicator"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    className="absolute inset-0 rounded-2xl bg-gel shadow-[0_8px_24px_-10px_hsl(var(--gel))]"
                  />
                )}
                <span className={cn('relative z-10 transition-colors', selectedTab === tab ? 'text-primary-foreground' : 'text-muted-foreground')}>
                  {tab === 'primary' ? 'Buy Now' : 'Resale'}
                </span>
                {tab === 'resale' && resale.length > 0 && (
                  <span className="absolute -top-1 -right-1 z-20 w-6 h-6 rounded-full bg-success text-success-foreground text-xs flex items-center justify-center font-bold">{resale.length}</span>
                )}
              </button>
            ))}
          </div>

          {selectedTab === 'primary' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              {hasSections ? (
                <>
                  <SectionPicker sections={sections} busy={busy} onPurchase={handleSectionPurchase} disabled={eventPassed} disabledLabel="Event Ended" />
                  <p className="text-xs text-muted-foreground text-center px-2">Group buying coming soon for seated events</p>
                </>
              ) : (
                <>
                  <div className="card-elevated p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2"><Tag className="w-5 h-5 text-primary" /><span className="text-muted-foreground">Ticket Price</span></div>
                      <span className="text-3xl font-bold text-gradient-warm">{formatILS(event.price)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-full inline-block">{event.available_tickets} tickets available</div>
                  </div>
                  <button onClick={handlePurchase} disabled={busy || !purchasable} className="w-full btn-primary-gradient py-4 text-lg disabled:opacity-60 disabled:cursor-not-allowed">{buyLabel}</button>
                  {purchasable && (
                    <div className="card-elevated p-4 flex items-center justify-between">
                      <label htmlFor="group-size" className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" /> Group size
                      </label>
                      <input
                        id="group-size"
                        type="number"
                        min={2}
                        max={Math.max(2, event.available_tickets)}
                        step={1}
                        value={groupSize}
                        onChange={(e) => setGroupSize(Math.max(2, Math.floor(Number(e.target.value) || 2)))}
                        className="w-20 py-2 px-3 rounded-xl border border-border bg-card text-center font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  )}
                  <button onClick={handleCreateGroup} disabled={busy || !purchasable} className="w-full py-4 rounded-2xl border-2 border-primary text-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-60 disabled:cursor-not-allowed focus-ring">
                    <Users className="w-5 h-5" /> Start Group Purchase
                  </button>
                </>
              )}
              <button onClick={() => setShowContactManager(true)} className="w-full py-3 rounded-2xl bg-muted text-foreground font-medium flex items-center justify-center gap-2 hover:bg-muted/80 transition-all focus-ring">
                <MessageCircle className="w-5 h-5" /> Contact Event Manager
              </button>
            </motion.div>
          )}

          {selectedTab === 'resale' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="bg-gradient-to-r from-success/10 to-teal-500/10 border border-success/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Verified & Protected Tickets</p>
                    <p className="text-xs text-muted-foreground">All resale tickets are verified. Prices cannot exceed the original face value.</p>
                  </div>
                </div>
              </div>
              {resale.length === 0 ? (
                <div className="card-elevated p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No resale tickets available</p>
                </div>
              ) : (
                resale.map((ticket) => (
                  <div key={ticket.id} className="card-elevated p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="verified-badge"><CheckCircle className="w-3 h-3" /> Verified</span>
                        {ticket.seat_info && <p className="text-sm text-muted-foreground mt-1">{ticket.seat_info}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gradient-warm">{formatILS(ticket.sale_price)}</p>
                        {ticket.sale_price < event.price && <p className="text-xs text-success font-semibold">Save {formatILS(event.price - ticket.sale_price)}</p>}
                      </div>
                    </div>
                    <button onClick={() => handleResaleBuy(ticket)} disabled={busy} className="w-full btn-success-gradient py-3 disabled:opacity-60">Buy Verified Ticket</button>
                  </div>
                ))
              )}
            </motion.div>
          )}
          </div>
        </motion.div>
      </div>

      <ContactManagerModal isOpen={showContactManager} onClose={() => setShowContactManager(false)} eventId={event.id} eventTitle={event.title} senderName={name} />
      <AnimatePresence>{success && <PurchaseSuccess title={event.title} />}</AnimatePresence>
    </div>
  );
}
