import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Repeat, DollarSign, Ticket, CalendarDays, Sparkles } from 'lucide-react';
import { ManagerSidebar } from '@/components/ManagerSidebar';
import { MobileManagerNav } from '@/components/MobileManagerNav';
import { useAuth } from '@/context/AuthContext';
import { listEventsByManager } from '@/api/events';
import { getPrimarySalesByEvent, type EventSales } from '@/api/analytics';
import type { EventRow } from '@/api/client';
import { formatILS } from '@/lib/currency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CountUp } from '@/components/CountUp';

export default function Manager() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [sales, setSales] = useState<Map<string, EventSales>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    listEventsByManager(user.id)
      .then(async (rows) => {
        if (!active) return;
        setEvents(rows);
        setSales(await getPrimarySalesByEvent(rows.map((e) => e.id)));
      })
      .catch(() => { if (active) { setEvents([]); setSales(new Map()); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);

  const totalEvents = events.length;
  // Revenue and tickets sold come from PRIMARY transactions (single source of truth),
  // so resales don't inflate manager revenue or double-count seats.
  const ticketsSold = events.reduce((sum, e) => sum + (sales.get(e.id)?.ticketsSold ?? 0), 0);
  const totalRevenue = events.reduce((sum, e) => sum + (sales.get(e.id)?.revenue ?? 0), 0);
  const availableTickets = events.reduce((sum, e) => sum + e.available_tickets, 0);

  const stats = [
    { label: 'Total Revenue', num: totalRevenue, format: formatILS, icon: DollarSign, gradient: 'from-primary to-accent' },
    { label: 'Tickets Sold', num: ticketsSold, icon: Ticket, gradient: 'from-success to-teal-400' },
    { label: 'Active Events', num: totalEvents, icon: CalendarDays, gradient: 'from-highlight to-purple-400' },
    { label: 'Tickets Available', num: availableTickets, icon: Repeat, gradient: 'from-warning to-amber-400' },
  ];

  // Per-event sales derived from PRIMARY transactions for the overview chart.
  const chartData = events.map((e) => ({
    title: e.title.length > 16 ? `${e.title.slice(0, 16)}…` : e.title,
    sales: sales.get(e.id)?.ticketsSold ?? 0,
  }));

  return (
    <div className="min-h-screen flex">
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
              <Sparkles className="w-8 h-8 text-warning" />
              <div>
                <h1 className="font-display font-extrabold text-4xl text-white mb-1">The <span className="font-serif-accent font-normal">house.</span></h1>
                <p className="text-white/80">Welcome back to your manager panel</p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-6">
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 -mt-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      className="card-elevated p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <p className="font-display text-3xl font-extrabold text-foreground mb-0.5">
                        <CountUp value={stat.num} format={stat.format} />
                      </p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="card-elevated p-6"
              >
                <h2 className="text-lg font-bold text-foreground mb-6">Tickets Sold by Event</h2>
                {chartData.length === 0 ? (
                  <p className="text-muted-foreground">No events yet</p>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis
                          dataKey="title"
                          type="category"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          width={120}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '1rem',
                          }}
                          formatter={(value: number) => [`${value} tickets`, 'Sold']}
                        />
                        <Bar
                          dataKey="sales"
                          fill="hsl(var(--gel))"
                          radius={[0, 8, 8, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>
      </main>

      <MobileManagerNav />
    </div>
  );
}
