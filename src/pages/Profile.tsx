import { motion } from 'framer-motion';
import { User, Settings, Shield, HelpCircle, LogOut, ChevronLeft, Bell, CreditCard } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Bell, label: 'התראות', description: 'נהל את ההודעות שלך' },
  { icon: CreditCard, label: 'אמצעי תשלום', description: 'כרטיסי אשראי וחיוב' },
  { icon: Shield, label: 'פרטיות ואבטחה', description: 'הגדרות חשבון' },
  { icon: HelpCircle, label: 'עזרה ותמיכה', description: 'שאלות נפוצות' },
  { icon: Settings, label: 'הגדרות', description: 'העדפות אפליקציה' },
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
      <div className="bg-gradient-to-b from-primary to-primary/90 pt-12 pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto text-center"
        >
          <div className="w-24 h-24 rounded-full bg-white/20 mx-auto mb-4 flex items-center justify-center">
            <User className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-primary-foreground mb-1">משתמש אורח</h1>
          <p className="text-primary-foreground/80 text-sm">demo@tickeasy.co.il</p>
        </motion.div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-8">
        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card-elevated p-4 mb-6"
        >
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">1</p>
              <p className="text-xs text-muted-foreground">כרטיסים</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-2xl font-bold text-primary">0</p>
              <p className="text-xs text-muted-foreground">מכירות</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{selectedGenres.length}</p>
              <p className="text-xs text-muted-foreground">תחומי עניין</p>
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="w-full card-elevated p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            );
          })}

          {/* Logout */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: menuItems.length * 0.05, duration: 0.3 }}
            onClick={handleLogout}
            className="w-full card-elevated p-4 flex items-center gap-4 hover:shadow-md transition-shadow mt-4"
          >
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1 text-right">
              <p className="font-medium text-destructive">יציאה</p>
              <p className="text-xs text-muted-foreground">התנתק מהחשבון</p>
            </div>
          </motion.button>
        </div>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          גרסה 1.0.0 - TickEasy
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
