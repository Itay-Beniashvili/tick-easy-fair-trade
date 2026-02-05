import { motion } from 'framer-motion';
 import { BarChart3, TrendingUp, TrendingDown, Activity, ChevronDown } from 'lucide-react';
import { ManagerSidebar } from '@/components/ManagerSidebar';
import { MobileManagerNav } from '@/components/MobileManagerNav';
 import { salesData, events } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
 import { useState } from 'react';
 import { cn } from '@/lib/utils';

const genreData = [
  { name: 'Music', value: 55, color: 'hsl(24, 95%, 53%)' },
  { name: 'Sports', value: 30, color: 'hsl(168, 75%, 42%)' },
  { name: 'Theater', value: 15, color: 'hsl(280, 70%, 55%)' },
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

 // Mock per-event analytics
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
                 {events.map(event => (
                   <button
                     key={event.id}
                     onClick={() => { setSelectedEvent(event.id); setShowEventDropdown(false); }}
                     className={cn(
                       "w-full px-4 py-3 text-left hover:bg-muted transition-colors text-sm",
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
               <h2 className="text-lg font-bold text-foreground mb-4">{selectedEventData.title}</h2>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                 <div className="p-4 bg-muted rounded-xl">
                   <p className="text-2xl font-bold text-gradient-warm">{selectedEventData.ticketsSold}</p>
                   <p className="text-xs text-muted-foreground">Tickets Sold</p>
                 </div>
                 <div className="p-4 bg-muted rounded-xl">
                   <p className="text-2xl font-bold text-gradient-warm">${selectedEventData.revenue.toLocaleString()}</p>
                   <p className="text-xs text-muted-foreground">Revenue</p>
                 </div>
                 <div className="p-4 bg-muted rounded-xl">
                   <p className="text-2xl font-bold text-gradient-warm">{selectedEventData.resaleCount}</p>
                   <p className="text-xs text-muted-foreground">Resale Listings</p>
                 </div>
                 <div className="p-4 bg-muted rounded-xl">
                   <p className="text-2xl font-bold text-gradient-warm">{selectedEventData.conversionRate}%</p>
                   <p className="text-xs text-muted-foreground">Conversion Rate</p>
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
                <span className="text-xs text-success font-bold">+23%</span>
              </div>
              <p className="text-2xl font-bold text-gradient-warm">${totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Weekly Revenue</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="card-elevated p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-accent" />
                <span className="text-xs text-success font-bold">+12%</span>
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
                <TrendingDown className="w-4 h-4 text-warning" />
                <span className="text-xs text-warning font-bold">-3%</span>
              </div>
              <p className="text-2xl font-bold text-gradient-warm">${avgTicketPrice}</p>
              <p className="text-xs text-muted-foreground">Avg Price</p>
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
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
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
                      formatter={(value: number) => [`${value}%`, '']}
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
        </div>
      </main>

      <MobileManagerNav />
    </div>
  );
}
