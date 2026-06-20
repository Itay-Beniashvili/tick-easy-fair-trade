import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Repeat, DollarSign, Ticket, CalendarDays, Sparkles } from 'lucide-react';
import { ManagerSidebar } from '@/components/ManagerSidebar';
import { MobileManagerNav } from '@/components/MobileManagerNav';
import { useAuth } from '@/context/AuthContext';
import { listEventsByManager } from '@/api/events';
import type { EventRow } from '@/api/client';
import { formatILS } from '@/lib/currency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Manager() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    listEventsByManager(user.id)
      .then((rows) => { if (active) setEvents(rows); })
      .catch(() => { if (active) setEvents([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);

  const totalEvents = events.length;
  const ticketsSold = events.reduce((sum, e) => sum + (e.total_tickets - e.available_tickets), 0);
  const totalRevenue = events.reduce((sum, e) => sum + (e.total_tickets - e.available_tickets) * e.price, 0);
  const availableTickets = events.reduce((sum, e) => sum + e.available_tickets, 0);

  const stats = [
    { label: 'Total Revenue', value: formatILS(totalRevenue), icon: DollarSign, gradient: 'from-primary to-accent' },
    { label: 'Tickets Sold', value: String(ticketsSold), icon: Ticket, gradient: 'from-success to-teal-400' },
    { label: 'Active Events', value: String(totalEvents), icon: CalendarDays, gradient: 'from-highlight to-purple-400' },
    { label: 'Tickets Available', value: String(availableTickets), icon: Repeat, gradient: 'from-warning to-amber-400' },
  ];

  // Per-event sales derived from real data for the overview chart.
  const chartData = events.map((e) => ({
    title: e.title.length > 16 ? `${e.title.slice(0, 16)}…` : e.title,
    sales: e.total_tickets - e.available_tickets,
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
              <Sparkles className="w-8 h-8 text-warning" />
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
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
                      <p className="text-2xl font-bold text-foreground mb-0.5">{stat.value}</p>
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
                          fill="url(#barGradient)"
                          radius={[0, 8, 8, 0]}
                        />
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="hsl(var(--primary))" />
                            <stop offset="100%" stopColor="hsl(var(--accent))" />
                          </linearGradient>
                        </defs>
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
