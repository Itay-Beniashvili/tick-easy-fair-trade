import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Activity, ChevronDown, DollarSign } from 'lucide-react';
import { ManagerSidebar } from '@/components/ManagerSidebar';
import { MobileManagerNav } from '@/components/MobileManagerNav';
import { useAuth } from '@/context/AuthContext';
import { listEventsByManager } from '@/api/events';
import type { EventRow } from '@/api/client';
import { supabase } from '@/integrations/supabase/client';
import { formatILS } from '@/lib/currency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface EventStats {
  id: string;
  title: string;
  genre: string;
  ticketsSold: number;
  revenue: number;
}

const genreColorMap: Record<string, string> = {
  music: 'hsl(24, 95%, 53%)',
  sports: 'hsl(168, 75%, 42%)',
  theater: 'hsl(280, 70%, 55%)',
};

const genreLabelMap: Record<string, string> = {
  music: 'Music',
  sports: 'Sports',
  theater: 'Theater',
};

export default function ManagerAnalytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<EventStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [showEventDropdown, setShowEventDropdown] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);

    (async () => {
      const events: EventRow[] = await listEventsByManager(user.id);
      const eventIds = events.map((e) => e.id);

      // Aggregate real sales (count + revenue) per event from transactions.
      const revenueByEvent = new Map<string, number>();
      const countByEvent = new Map<string, number>();

      if (eventIds.length > 0) {
        const { data: txns, error } = await supabase
          .from('transactions')
          .select('event_id, amount')
          .in('event_id', eventIds);
        if (error) throw new Error(error.message);
        for (const t of txns ?? []) {
          if (!t.event_id) continue;
          revenueByEvent.set(t.event_id, (revenueByEvent.get(t.event_id) ?? 0) + Number(t.amount));
          countByEvent.set(t.event_id, (countByEvent.get(t.event_id) ?? 0) + 1);
        }
      }

      const computed: EventStats[] = events.map((e) => ({
        id: e.id,
        title: e.title,
        genre: e.genre,
        ticketsSold: countByEvent.get(e.id) ?? 0,
        revenue: revenueByEvent.get(e.id) ?? 0,
      }));

      if (active) setStats(computed);
    })()
      .catch(() => { if (active) setStats([]); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [user]);

  const totalRevenue = stats.reduce((sum, s) => sum + s.revenue, 0);
  const totalSales = stats.reduce((sum, s) => sum + s.ticketsSold, 0);
  const avgTicketPrice = totalSales > 0 ? Math.round(totalRevenue / totalSales) : 0;

  const selectedEventData = selectedEvent === 'all'
    ? null
    : stats.find((s) => s.id === selectedEvent);

  // Per-event revenue bar data.
  const revenueChartData = stats.map((s) => ({
    title: s.title.length > 16 ? `${s.title.slice(0, 16)}…` : s.title,
    revenue: s.revenue,
  }));

  // Genre distribution from real revenue.
  const genreTotals = new Map<string, number>();
  for (const s of stats) {
    genreTotals.set(s.genre, (genreTotals.get(s.genre) ?? 0) + s.revenue);
  }
  const genreData = Array.from(genreTotals.entries())
    .filter(([, value]) => value > 0)
    .map(([genre, value]) => ({
      name: genreLabelMap[genre] ?? genre,
      value,
      color: genreColorMap[genre] ?? 'hsl(var(--primary))',
    }));

  return (
    <div className="min-h-screen bg-background flex">
      <ManagerSidebar />

      <main className="flex-1 pb-20 lg:pb-0">
        {/* Header */}
        <div className="bg-gradient-hero p-6 pt-12 lg:pt-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Analytics</h1>
                <p className="text-white/80">Stats and insights</p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : (
            <>
              {/* Event Filter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <button
                  onClick={() => setShowEventDropdown(!showEventDropdown)}
                  className="w-full sm:w-auto flex items-center justify-between gap-4 px-4 py-3 bg-card border border-border rounded-2xl hover:border-primary/50 transition-colors"
                >
                  <span className="font-semibold text-foreground">
                    {selectedEvent === 'all' ? 'All Events' : stats.find((s) => s.id === selectedEvent)?.title}
                  </span>
                  <ChevronDown className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform",
                    showEventDropdown && "rotate-180"
                  )} />
                </button>

                {showEventDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 sm:right-auto mt-2 bg-card border border-border rounded-2xl shadow-elevated z-10 overflow-hidden"
                  >
                    <button
                      onClick={() => { setSelectedEvent('all'); setShowEventDropdown(false); }}
                      className={cn(
                        "w-full px-4 py-3 text-left hover:bg-muted transition-colors",
                        selectedEvent === 'all' && "bg-primary/10 text-primary"
                      )}
                    >
                      All Events
                    </button>
                    {stats.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { setSelectedEvent(s.id); setShowEventDropdown(false); }}
                        className={cn(
                          "w-full px-4 py-3 text-left hover:bg-muted transition-colors text-sm",
                          selectedEvent === s.id && "bg-primary/10 text-primary"
                        )}
                      >
                        {s.title}
                      </button>
                    ))}
                  </motion.div>
                )}
              </motion.div>

              {/* Event-specific stats */}
              {selectedEventData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-elevated p-6"
                >
                  <h2 className="text-lg font-bold text-foreground mb-4">{selectedEventData.title}</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-xl">
                      <p className="text-2xl font-bold text-gradient-warm">{selectedEventData.ticketsSold}</p>
                      <p className="text-xs text-muted-foreground">Tickets Sold</p>
                    </div>
                    <div className="p-4 bg-muted rounded-xl">
                      <p className="text-2xl font-bold text-gradient-warm">{formatILS(selectedEventData.revenue)}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Summary Stats */}
              {selectedEvent === 'all' && (
                <div className="grid grid-cols-3 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="card-elevated p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-success" />
                    </div>
                    <p className="text-2xl font-bold text-gradient-warm">{formatILS(totalRevenue)}</p>
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="card-elevated p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-2xl font-bold text-gradient-warm">{totalSales}</p>
                    <p className="text-xs text-muted-foreground">Tickets Sold</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="card-elevated p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-warning" />
                    </div>
                    <p className="text-2xl font-bold text-gradient-warm">{formatILS(avgTicketPrice)}</p>
                    <p className="text-xs text-muted-foreground">Avg Price</p>
                  </motion.div>
                </div>
              )}

              {stats.length === 0 ? (
                <div className="card-elevated p-12 text-center">
                  <p className="text-muted-foreground">No events yet</p>
                </div>
              ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Revenue per Event */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="card-elevated p-6"
                  >
                    <h2 className="text-lg font-bold text-foreground mb-6">Revenue by Event</h2>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="title" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '1rem',
                            }}
                            formatter={(value: number) => [formatILS(value), 'Revenue']}
                          />
                          <Bar
                            dataKey="revenue"
                            fill="url(#revenueGradient)"
                            radius={[8, 8, 0, 0]}
                          />
                          <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--success))" />
                              <stop offset="100%" stopColor="hsl(168, 75%, 50%)" />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  {/* Genre Distribution */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="card-elevated p-6"
                  >
                    <h2 className="text-lg font-bold text-foreground mb-6">Revenue by Category</h2>
                    {genreData.length === 0 ? (
                      <div className="h-64 flex items-center justify-center">
                        <p className="text-muted-foreground">No sales yet</p>
                      </div>
                    ) : (
                      <>
                        <div className="h-64 flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={genreData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {genreData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '1rem',
                                }}
                                formatter={(value: number) => [formatILS(value), '']}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-6 mt-4">
                          {genreData.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-sm text-muted-foreground">{item.name}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <MobileManagerNav />
    </div>
  );
}
