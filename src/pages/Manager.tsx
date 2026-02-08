import { motion } from 'framer-motion';
import { TrendingUp, Users, Repeat, DollarSign, Ticket, LayoutDashboard } from 'lucide-react';
import { ManagerSidebar } from '@/components/ManagerSidebar';
import { MobileManagerNav } from '@/components/MobileManagerNav';
import { salesData } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const stats = [
  { label: 'Total Revenue', value: '$155,400', change: '+12%', icon: DollarSign, color: 'primary' },
  { label: 'Tickets Sold', value: '444', change: '+8%', icon: Ticket, color: 'success' },
  { label: 'Resale Activity', value: '23', change: '+15%', icon: Repeat, color: 'highlight' },
  { label: 'Active Users', value: '1,234', change: '+5%', icon: Users, color: 'warning' },
];

const colorClasses: Record<string, string> = {
  primary: 'bg-primary/15 text-primary',
  success: 'bg-success/15 text-success',
  highlight: 'bg-highlight/15 text-highlight',
  warning: 'bg-warning/15 text-warning',
};

const iconBgClasses: Record<string, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  highlight: 'bg-highlight',
  warning: 'bg-warning',
};

export default function Manager() {
  return (
    <div className="min-h-screen bg-mesh flex">
      <ManagerSidebar />
      
      <main className="flex-1 pb-20 lg:pb-0">
        {/* Header */}
        <div className="bg-gradient-manager p-6 pt-12 lg:pt-8 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-highlight/10 blur-3xl" />
          </div>

          <div className="max-w-5xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <LayoutDashboard className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
                <p className="text-white/60 font-medium">Welcome back to your manager panel</p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-6">
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
                  className="card-elevated p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${iconBgClasses[stat.color]} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-xs font-bold flex items-center gap-1 ${colorClasses[stat.color]} px-2.5 py-1 rounded-full`}>
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-foreground mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
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
            <h2 className="text-lg font-bold text-foreground mb-6">Weekly Sales</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis 
                    dataKey="day" 
                    type="category" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '1rem',
                      boxShadow: 'var(--shadow-lg)',
                    }}
                    formatter={(value: number) => [`${value} tickets`, 'Sales']}
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
          </motion.div>
        </div>
      </main>

      <MobileManagerNav />
    </div>
  );
}