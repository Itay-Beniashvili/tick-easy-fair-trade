import { Home, Wallet, User } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/wallet', icon: Wallet, label: 'My Tickets' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-4 mb-4">
        <div className="glass-effect bg-white/90 rounded-2xl shadow-xl border border-border/50">
          <div className="flex items-center justify-around py-2 px-2 max-w-md mx-auto">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;

              return (
                <NavLink
                  key={path}
                  to={path}
                  className="flex flex-col items-center py-2.5 px-6 relative rounded-xl transition-colors duration-200"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-primary rounded-xl opacity-10"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-all duration-200 relative z-10',
                      isActive ? 'text-primary scale-110' : 'text-muted-foreground'
                    )}
                  />
                  <span
                    className={cn(
                      'text-xs mt-1.5 font-semibold transition-colors relative z-10',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}