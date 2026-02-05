 import { motion } from 'framer-motion';
 import { User, Settings, Ticket, Shield } from 'lucide-react';
 import { Link } from 'react-router-dom';

export function RoleSelection() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-hero">
      {/* Decorative circles */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-warning/20 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-accent/20 blur-3xl" />
      
      {/* Logo & Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 relative z-10"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm mb-6 animate-float">
          <Ticket className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">TickEasy</h1>
        <p className="text-white/80 text-lg">Safe tickets. Simple experience.</p>
      </motion.div>

      {/* Trust Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/20 text-success backdrop-blur-sm mb-10"
      >
        <Shield className="w-4 h-4" />
        <span className="text-sm font-medium">Protected against ticket scalping</span>
      </motion.div>

      {/* Role Cards */}
      <div className="w-full max-w-md space-y-4 relative z-10">
         <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
           <Link
             to="/login"
             className="block w-full p-6 rounded-3xl bg-white shadow-elevated text-left transition-all hover:scale-[1.02] hover:shadow-glow active:scale-[0.98]"
           >
             <div className="flex items-center gap-4">
               <div className="w-14 h-14 rounded-2xl bg-gradient-warm flex items-center justify-center shrink-0">
                 <User className="w-7 h-7 text-white" />
               </div>
               <div className="flex-1">
                 <h2 className="text-xl font-bold text-foreground mb-1">קונה כרטיסים</h2>
                 <p className="text-muted-foreground text-sm">
                   גלו אירועים, קנו כרטיסים ונהלו את הארנק שלכם
                 </p>
               </div>
            </div>
           </Link>
         </motion.div>

         <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
           <Link
             to="/manager/login"
             className="block w-full p-6 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 text-left transition-all hover:scale-[1.02] hover:bg-white/20 active:scale-[0.98]"
           >
             <div className="flex items-center gap-4">
               <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                 <Settings className="w-7 h-7 text-white" />
               </div>
               <div className="flex-1">
                 <h2 className="text-xl font-bold text-white mb-1">מנהל אירועים</h2>
                 <p className="text-white/70 text-sm">
                   נהלו אירועים, צפו בסטטיסטיקות וטפלו בפניות
                 </p>
               </div>
            </div>
           </Link>
         </motion.div>
      </div>

      {/* Bottom Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-12 text-white/60 text-sm text-center relative z-10"
      >
         הפלטפורמה #1 לכרטיסים מאובטחים
      </motion.p>
    </div>
  );
}
