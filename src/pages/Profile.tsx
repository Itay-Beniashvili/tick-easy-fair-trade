import { motion } from 'framer-motion';
import { User, Settings, Shield, HelpCircle, LogOut, ChevronRight, Bell, CreditCard, Star, Sparkles, Edit3 } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { icon: Bell, label: 'Notifications', description: 'Manage your alerts', gradient: 'from-primary to-violet-400' },
  { icon: CreditCard, label: 'Payment Methods', description: 'Cards & billing', gradient: 'from-success to-emerald-400' },
  { icon: Shield, label: 'Privacy & Security', description: 'Account settings', gradient: 'from-highlight to-cyan-400' },
  { icon: Star, label: 'Favorites', description: 'Saved events', gradient: 'from-warning to-orange-400' },
  { icon: HelpCircle, label: 'Help & Support', description: 'FAQs & contact', gradient: 'from-accent to-pink-400' },
  { icon: Settings, label: 'Settings', description: 'App preferences', gradient: 'from-muted-foreground to-slate-400' },
];

export default function Profile() {
  const { setRole, selectedGenres } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    setRole(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent" />
        <div className="absolute inset-0 bg-mesh opacity-40" />
        
        <div className="relative pt-12 pb-24 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="relative inline-block mb-4">
              <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center ring-4 ring-white/30 shadow-2xl">
                <User className="w-14 h-14 text-white" />
              </div>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center"
              >
                <Edit3 className="w-5 h-5 text-primary" />
              </motion.button>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Guest User</h1>
            <p className="text-white/70 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              demo@tickeasy.com
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-14">
        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card-elevated p-6 mb-6"
        >
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-gradient">1</p>
              <p className="text-sm text-muted-foreground mt-1">Tickets</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-3xl font-bold text-gradient">0</p>
              <p className="text-sm text-muted-foreground mt-1">Sales</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gradient">{selectedGenres.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Interests</p>
            </div>
          </div>
        </motion.div>

        {/* Menu */}
        <div className="space-y-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.99 }}
                className="w-full card-elevated p-4 flex items-center gap-4 hover:shadow-lg transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0 shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground text-lg">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.button>
            );
          })}

          {/* Logout */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: menuItems.length * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleLogout}
            className="w-full card-elevated p-4 flex items-center gap-4 hover:shadow-lg transition-all mt-6 border-2 border-destructive/20 hover:border-destructive/40"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-destructive to-red-400 flex items-center justify-center shrink-0 shadow-lg">
              <LogOut className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-destructive text-lg">Log Out</p>
              <p className="text-sm text-muted-foreground">Sign out of your account</p>
            </div>
          </motion.button>
        </div>

        {/* Version */}
        <p className="text-center text-sm text-muted-foreground mt-10">
          Version 2.0.0 · TickEasy
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
