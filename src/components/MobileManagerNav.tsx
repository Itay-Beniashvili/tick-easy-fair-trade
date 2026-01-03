import { LayoutDashboard, Inbox, BarChart3, Calendar } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/manager', icon: LayoutDashboard, label: 'סקירה' },
  { path: '/manager/inbox', icon: Inbox, label: 'פניות' },
  { path: '/manager/analytics', icon: BarChart3, label: 'נתונים' },
  { path: '/manager/events', icon: Calendar, label: 'אירועים' },
];

export function MobileManagerNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/manager') {
      return location.pathname === '/manager';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border glass-effect z-50">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = isActive(path);

          return (
            <NavLink
              key={path}
              to={path}
              end={path === '/manager'}
              className="flex flex-col items-center py-2 px-3 relative"
            >
              {active && (
                <motion.div
                  layoutId="managerActiveTab"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: 'spring', duration: 0.4 }}
                />
              )}
              <Icon
                className={cn(
                  'w-5 h-5 transition-colors relative z-10',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span
                className={cn(
                  'text-[10px] mt-1 font-medium transition-colors relative z-10',
                  active ? 'text-primary' : 'text-muted-foreground'
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
