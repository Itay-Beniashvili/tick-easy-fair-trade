import { motion } from 'framer-motion';
import { User, Briefcase, Ticket, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RoleSelection() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-hero relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-accent/20 blur-3xl"
        />
        <motion.div
          animate={{ 
            y: [-20, 20, -20],
            x: [-10, 10, -10],
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-highlight/15 blur-3xl"
        />
      </div>
      
      {/* Logo & Title */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-10 relative z-10"
      >
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/15 backdrop-blur-xl border border-white/20 mb-8 shadow-xl"
        >
          <Ticket className="w-12 h-12 text-white drop-shadow-lg" />
        </motion.div>
        <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">
          TickEasy
        </h1>
        <p className="text-white/70 text-lg font-medium">
          The future of event ticketing
        </p>
      </motion.div>

      {/* Trust Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 mb-10"
      >
        <ShieldCheck className="w-5 h-5 text-success" />
        <span className="text-sm font-medium text-white">Verified & Protected Tickets</span>
      </motion.div>

      {/* Role Cards */}
      <div className="w-full max-w-md space-y-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            to="/login"
            className="group block w-full p-6 rounded-2xl bg-white shadow-xl text-left transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-lg group-hover:shadow-glow transition-shadow duration-300">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <h2 className="text-xl font-bold text-foreground">Ticket Buyer</h2>
                  <Sparkles className="w-4 h-4 text-warning" />
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Discover events & purchase secure tickets
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            to="/manager/login"
            className="group block w-full p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-left transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-1.5">Event Manager</h2>
                <p className="text-white/60 text-sm leading-relaxed">
                  Manage events & track analytics
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Bottom Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="mt-14 text-white/40 text-sm text-center relative z-10 font-medium"
      >
        Trusted by 100,000+ event-goers worldwide
      </motion.p>
    </div>
  );
}