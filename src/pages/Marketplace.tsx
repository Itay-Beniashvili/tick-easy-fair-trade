import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCcw, Shield, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { EventCardSkeleton } from '@/components/Skeletons';
import { listForSaleMarketplace, buyResale } from '@/api/resale';
import { getProfile } from '@/api/profile';
import { useAuth } from '@/context/AuthContext';
import { formatILS } from '@/lib/currency';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Listing {
  id: string;
  event_id: string;
  event_title: string;
  event_venue: string;
  event_city: string;
  event_date: string;
  event_time: string;
  event_image: string | null;
  ticket_type: string;
  seat_info: string | null;
  sale_price: number;
  created_at: string;
}

export default function Marketplace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [buyerName, setBuyerName] = useState('You');

  const load = async () => {
    setLoading(true);
    try {
      const data = await listForSaleMarketplace();
      setListings((data ?? []) as Listing[]);
      const p = await getProfile();
      if (p?.full_name) setBuyerName(p.full_name);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const handleBuy = async (listing: Listing) => {
    setBuyingId(listing.id);
    try {
      await buyResale(listing.id, buyerName);
      toast.success('Verified resale ticket purchased!', { description: 'A new barcode was issued to you.' });
      await load();
      navigate('/wallet');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBuyingId(null);
    }
  };

  // Hide the current user's own listings (they can't buy their own ticket).
  const visible = listings;

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-10 lg:pt-16">
      <div className="bg-gradient-success pt-12 pb-6 px-4">
        <div className="max-w-lg lg:max-w-6xl mx-auto">
          <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" /> <span>Back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <RefreshCcw className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Resale Marketplace</h1>
              <p className="text-white/80 text-sm">Verified second-hand tickets</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg lg:max-w-6xl mx-auto px-4 -mt-3">
        <div className="bg-success/10 border border-success/20 rounded-2xl p-3 flex items-center gap-3">
          <Shield className="w-5 h-5 text-success shrink-0" />
          <p className="text-xs text-foreground">All tickets are verified. Prices cannot exceed the original face value.</p>
        </div>
      </div>

      <div className="max-w-lg lg:max-w-6xl mx-auto px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="card-elevated p-8 text-center">
            <p className="text-muted-foreground">No resale tickets available right now</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((listing, i) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card-elevated overflow-hidden"
            >
              <div className="relative h-28 overflow-hidden">
                <img src={listing.event_image ?? ''} alt={listing.event_title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3">
                  <h3 className="text-white font-bold">{listing.event_title}</h3>
                  <p className="text-white/70 text-xs">
                    {listing.event_venue}, {listing.event_city} · {format(new Date(listing.event_date), 'MMM d')}
                  </p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="verified-badge"><CheckCircle className="w-3 h-3" /> Verified</span>
                  {listing.seat_info && <span className="text-xs text-muted-foreground">{listing.seat_info}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-success">{formatILS(listing.sale_price)}</span>
                  <button
                    onClick={() => handleBuy(listing)}
                    disabled={buyingId === listing.id}
                    className="px-4 py-1.5 bg-success text-white text-sm font-semibold rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50"
                  >
                    {buyingId === listing.id ? 'Buying…' : 'Buy'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
