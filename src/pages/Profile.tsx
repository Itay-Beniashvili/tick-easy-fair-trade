import { motion } from 'framer-motion';
import { User, Settings, Shield, HelpCircle, LogOut, ChevronRight, Bell, CreditCard, Star } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { icon: Bell, label: 'Notifications', description: 'Manage your alerts', color: 'from-primary to-accent' },
  { icon: CreditCard, label: 'Payment Methods', description: 'Cards & billing', color: 'from-success to-teal-400' },
  { icon: Shield, label: 'Privacy & Security', description: 'Account settings', color: 'from-highlight to-purple-400' },
  { icon: Star, label: 'Favorites', description: 'Saved events', color: 'from-warning to-amber-400' },
  { icon: HelpCircle, label: 'Help & Support', description: 'FAQs & contact', color: 'from-accent to-rose-400' },
  { icon: Settings, label: 'Settings', description: 'App preferences', color: 'from-muted-foreground to-slate-400' },
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
      <div className="bg-gradient-hero pt-12 pb-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto text-center"
        >
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm mx-auto mb-4 flex items-center justify-center ring-4 ring-white/30">
            <User className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white mb-1">Guest User</h1>
          <p className="text-white/80 text-sm">demo@tickeasy.com</p>
        </motion.div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-10">
        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card-elevated p-4 mb-6"
        >
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gradient-warm">1</p>
              <p className="text-xs text-muted-foreground">Tickets</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-2xl font-bold text-gradient-warm">0</p>
              <p className="text-xs text-muted-foreground">Sales</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gradient-warm">{selectedGenres.length}</p>
              <p className="text-xs text-muted-foreground">Interests</p>
            </div>
          </div>
        </motion.div>

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="w-full card-elevated p-4 flex items-center gap-4 hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            );
          })}

          {/* Logout */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: menuItems.length * 0.05, duration: 0.3 }}
            onClick={handleLogout}
            className="w-full card-elevated p-4 flex items-center gap-4 hover:shadow-lg transition-all mt-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-destructive to-rose-400 flex items-center justify-center shrink-0">
              <LogOut className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-destructive">Log Out</p>
              <p className="text-xs text-muted-foreground">Sign out of your account</p>
            </div>
          </motion.button>
        </div>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Version 1.0.0 · TickEasy
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
