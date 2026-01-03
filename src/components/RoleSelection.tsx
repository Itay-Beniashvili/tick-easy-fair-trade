import { motion } from 'framer-motion';
import { User, Settings, Ticket, Shield } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';

export function RoleSelection() {
  const { setRole } = useApp();
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'user' | 'manager') => {
    setRole(role);
    if (role === 'user') {
      navigate('/onboarding');
    } else {
      navigate('/manager');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary to-primary/80">
      {/* Logo & Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm mb-6">
          <Ticket className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">TickEasy</h1>
        <p className="text-white/80 text-lg">כרטיסים בטוחים. חוויה פשוטה.</p>
      </motion.div>

      {/* Trust Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/20 text-success mb-10"
      >
        <Shield className="w-4 h-4" />
        <span className="text-sm font-medium">מאובטח נגד סחר בכרטיסים</span>
      </motion.div>

      {/* Role Cards */}
      <div className="w-full max-w-md space-y-4">
        <motion.button
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onClick={() => handleRoleSelect('user')}
          className="w-full p-6 rounded-2xl bg-white shadow-elevated text-right transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground mb-1">משתמש קצה</h2>
              <p className="text-muted-foreground text-sm">
                גלה אירועים, רכוש כרטיסים ונהל את הארנק שלך
              </p>
            </div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          onClick={() => handleRoleSelect('manager')}
          className="w-full p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-right transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">מנהל אירוע</h2>
              <p className="text-white/70 text-sm">
                נהל אירועים, צפה בסטטיסטיקות וטפל בפניות
              </p>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Bottom Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-12 text-white/60 text-sm text-center"
      >
        הפלטפורמה המובילה לכרטיסים בישראל
      </motion.p>
    </div>
  );
}
