import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { ManagerSidebar } from '@/components/ManagerSidebar';
import { MobileManagerNav } from '@/components/MobileManagerNav';
import { salesData } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const genreData = [
  { name: 'מוזיקה', value: 55, color: 'hsl(var(--primary))' },
  { name: 'ספורט', value: 30, color: 'hsl(var(--accent))' },
  { name: 'תיאטרון', value: 15, color: 'hsl(var(--success))' },
];

const monthlyData = [
  { month: 'ינו', revenue: 45000 },
  { month: 'פבר', revenue: 52000 },
  { month: 'מרץ', revenue: 48000 },
  { month: 'אפר', revenue: 61000 },
  { month: 'מאי', revenue: 55000 },
  { month: 'יונ', revenue: 67000 },
  { month: 'יול', revenue: 72000 },
  { month: 'אוג', revenue: 85000 },
];

export default function ManagerAnalytics() {
  const totalRevenue = salesData.reduce((sum, d) => sum + d.revenue, 0);
  const totalSales = salesData.reduce((sum, d) => sum + d.sales, 0);
  const avgTicketPrice = Math.round(totalRevenue / totalSales);

  return (
    <div className="min-h-screen bg-background flex">
      <ManagerSidebar />
      
      <main className="flex-1 pb-20 lg:pb-0">
        {/* Header */}
        <div className="bg-card border-b border-border p-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">ניתוח נתונים</h1>
                <p className="text-muted-foreground">סטטיסטיקות ותובנות</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="card-elevated p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-xs text-success font-medium">+23%</span>
              </div>
              <p className="text-2xl font-bold text-foreground">₪{totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">הכנסות שבועיות</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="card-elevated p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-accent" />
                <span className="text-xs text-success font-medium">+12%</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{totalSales}</p>
              <p className="text-xs text-muted-foreground">כרטיסים נמכרו</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="card-elevated p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-warning" />
                <span className="text-xs text-warning font-medium">-3%</span>
              </div>
              <p className="text-2xl font-bold text-foreground">₪{avgTicketPrice}</p>
              <p className="text-xs text-muted-foreground">מחיר ממוצע</p>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="card-elevated p-6"
            >
              <h2 className="text-lg font-bold text-foreground mb-6">הכנסות חודשיות</h2>
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
                        borderRadius: '0.75rem',
                        direction: 'rtl',
                      }}
                      formatter={(value: number) => [`₪${value.toLocaleString()}`, 'הכנסות']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                    />
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
              <h2 className="text-lg font-bold text-foreground mb-6">התפלגות לפי קטגוריה</h2>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genreData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
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
                        borderRadius: '0.75rem',
                        direction: 'rtl',
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
            <h2 className="text-lg font-bold text-foreground mb-6">הכנסות שבועיות</h2>
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
                      borderRadius: '0.75rem',
                      direction: 'rtl',
                    }}
                    formatter={(value: number) => [`₪${value.toLocaleString()}`, 'הכנסות']}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="hsl(var(--success))" 
                    radius={[4, 4, 0, 0]}
                  />
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
