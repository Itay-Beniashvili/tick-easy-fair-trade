import { Home, Wallet, User, Users } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/wallet', icon: Wallet, label: 'Tickets' },
  { path: '/community', icon: Users, label: 'Community' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-3.5 left-1/2 -translate-x-1/2 z-50 w-[min(420px,calc(100%-28px))]
      glass-effect rounded-[22px] shadow-lg">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              className="relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gel/10 rounded-2xl"
                  transition={{ type: 'spring', duration: 0.4 }}
                />
              )}
              <Icon
                className={cn(
                  'w-[22px] h-[22px] transition-colors relative z-10',
                  isActive ? 'text-gel drop-shadow-[0_0_8px_hsl(var(--gel))]' : 'text-muted-foreground',
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-semibold transition-colors relative z-10',
                  isActive ? 'text-gel' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
