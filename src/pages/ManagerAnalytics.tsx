import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Activity, ChevronDown, Sparkles } from 'lucide-react';
import { ManagerSidebar } from '@/components/ManagerSidebar';
import { MobileManagerNav } from '@/components/MobileManagerNav';
import { salesData, events } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const genreData = [
  { name: 'Music', value: 55, color: 'hsl(262, 83%, 58%)' },
  { name: 'Sports', value: 30, color: 'hsl(160, 70%, 45%)' },
  { name: 'Theater', value: 15, color: 'hsl(350, 85%, 60%)' },
];

const monthlyData = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 },
  { month: 'Jun', revenue: 67000 },
  { month: 'Jul', revenue: 72000 },
  { month: 'Aug', revenue: 85000 },
];

const eventAnalytics = events.map(event => ({
  id: event.id,
  title: event.title,
  ticketsSold: Math.floor(Math.random() * 500) + 100,
  revenue: Math.floor(Math.random() * 50000) + 10000,
  resaleCount: event.resaleTickets.length,
  avgPrice: event.price,
  conversionRate: Math.floor(Math.random() * 30) + 50,
}));

export default function ManagerAnalytics() {
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [showEventDropdown, setShowEventDropdown] = useState(false);

  const totalRevenue = salesData.reduce((sum, d) => sum + d.revenue, 0);
  const totalSales = salesData.reduce((sum, d) => sum + d.sales, 0);
  const avgTicketPrice = Math.round(totalRevenue / totalSales);

  const selectedEventData = selectedEvent === 'all' 
    ? null 
    : eventAnalytics.find(e => e.id === selectedEvent);

  return (
    <div className="min-h-screen bg-background flex">
      <ManagerSidebar />
      
      <main className="flex-1 pb-20 lg:pb-0">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-success via-emerald-500 to-teal-500" />
          <div className="absolute inset-0 bg-mesh opacity-40" />
          
          <div className="relative p-6 pt-12 lg:pt-6">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-xl">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">Analytics</h1>
                  <p className="text-white/70 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Stats and insights
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* Event Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <button
              onClick={() => setShowEventDropdown(!showEventDropdown)}
              className="w-full sm:w-auto flex items-center justify-between gap-4 px-5 py-4 card-elevated hover:shadow-lg transition-all"
            >
              <span className="font-semibold text-foreground">
                {selectedEvent === 'all' ? 'All Events' : events.find(e => e.id === selectedEvent)?.title}
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
                className="absolute top-full left-0 right-0 sm:right-auto mt-2 card-elevated shadow-xl z-10 overflow-hidden min-w-[280px]"
              >
                <button
                  onClick={() => { setSelectedEvent('all'); setShowEventDropdown(false); }}
                  className={cn(
                    "w-full px-5 py-4 text-left hover:bg-muted transition-colors font-medium",
                    selectedEvent === 'all' && "bg-primary/10 text-primary"
                  )}
                >
                  All Events
                </button>
                {events.map(event => (
                  <button
                    key={event.id}
                    onClick={() => { setSelectedEvent(event.id); setShowEventDropdown(false); }}
                    className={cn(
                      "w-full px-5 py-3 text-left hover:bg-muted transition-colors",
                      selectedEvent === event.id && "bg-primary/10 text-primary"
                    )}
                  >
                    {event.title}
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
              <h2 className="text-xl font-bold text-foreground mb-5">{selectedEventData.title}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 bg-muted/50 rounded-2xl">
                  <p className="text-3xl font-bold text-gradient">{selectedEventData.ticketsSold}</p>
                  <p className="text-sm text-muted-foreground mt-1">Tickets Sold</p>
                </div>
                <div className="p-5 bg-muted/50 rounded-2xl">
                  <p className="text-3xl font-bold text-gradient">${selectedEventData.revenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">Revenue</p>
                </div>
                <div className="p-5 bg-muted/50 rounded-2xl">
                  <p className="text-3xl font-bold text-gradient">{selectedEventData.resaleCount}</p>
                  <p className="text-sm text-muted-foreground mt-1">Resale Listings</p>
                </div>
                <div className="p-5 bg-muted/50 rounded-2xl">
                  <p className="text-3xl font-bold text-gradient">{selectedEventData.conversionRate}%</p>
                  <p className="text-sm text-muted-foreground mt-1">Conversion Rate</p>
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
                className="card-elevated p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-success" />
                  </div>
                  <span className="text-sm text-success font-bold">+23%</span>
                </div>
                <p className="text-3xl font-bold text-gradient">${totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">Weekly Revenue</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="card-elevated p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm text-success font-bold">+12%</span>
                </div>
                <p className="text-3xl font-bold text-gradient">{totalSales}</p>
                <p className="text-sm text-muted-foreground mt-1">Tickets Sold</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="card-elevated p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-warning" />
                  </div>
                  <span className="text-sm text-warning font-bold">-3%</span>
                </div>
                <p className="text-3xl font-bold text-gradient">${avgTicketPrice}</p>
                <p className="text-sm text-muted-foreground mt-1">Avg Price</p>
              </motion.div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="card-elevated p-6"
            >
              <h2 className="text-lg font-bold text-foreground mb-6">Monthly Revenue</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '1rem',
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="url(#lineGradient)" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
                    />
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--accent))" />
                      </linearGradient>
                    </defs>
                  </LineChart>
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
              <h2 className="text-lg font-bold text-foreground mb-6">Category Distribution</h2>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genreData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
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
                      formatter={(value: number) => [`${value}%`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {genreData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground font-medium">{item.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Weekly Sales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="card-elevated p-6"
          >
            <h2 className="text-lg font-bold text-foreground mb-6">Weekly Revenue</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '1rem',
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="url(#revenueGradient)" 
                    radius={[10, 10, 0, 0]}
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
        </div>
      </main>

      <MobileManagerNav />
    </div>
  );
}
