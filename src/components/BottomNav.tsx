import { Home, Wallet, User, Users, Search } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const openCommand = () => window.dispatchEvent(new Event('tickeasy:command'));

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
        <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-12 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-extrabold text-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-gel shadow-[0_0_12px_2px_hsl(var(--gel))]" />
            TickEasy
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openCommand}
              aria-label="Search"
              className="group flex items-center gap-2.5 w-52 xl:w-60 pl-3.5 pr-2 py-2 rounded-full text-sm text-muted-foreground bg-card/60 border border-white/[0.06] hover:border-gel/40 transition-colors"
            >
              <Search className="w-[18px] h-[18px] text-muted-foreground group-hover:text-gel transition-colors" />
              <span className="flex-1 text-left">Search shows…</span>
              <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-muted/80 text-muted-foreground/80">⌘K</kbd>
            </button>
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
