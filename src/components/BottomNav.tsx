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
    <>
      {/* Desktop: sticky top nav bar */}
      <nav className="hidden lg:flex fixed top-0 inset-x-0 z-50 h-16 items-center
        glass-effect border-b border-white/[0.06]">
        <div className="w-full max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-extrabold text-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-gel shadow-[0_0_12px_2px_hsl(var(--gel))]" />
            TickEasy
          </div>
          <div className="flex items-center gap-1">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <NavLink
                  key={path}
                  to={path}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors',
                    isActive ? 'text-gel bg-gel/10' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  {label}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile: floating bottom pill nav */}
      <nav className="lg:hidden fixed bottom-3.5 left-1/2 -translate-x-1/2 z-50 w-[min(420px,calc(100%-28px))]
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
    </>
  );
}
