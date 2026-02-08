import { LayoutDashboard, Inbox, BarChart3, Calendar, LogOut, Ticket, Sparkles } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/manager', icon: LayoutDashboard, label: 'Overview', end: true },
  { path: '/manager/inbox', icon: Inbox, label: 'Inquiries' },
  { path: '/manager/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/manager/events', icon: Calendar, label: 'Events' },
];

export function ManagerSidebar() {
  const navigate = useNavigate();
  const { setRole } = useApp();

  const handleLogout = () => {
    setRole(null);
    navigate('/');
  };

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-sidebar text-sidebar-foreground h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-sidebar-foreground">TickEasy</h1>
            <p className="text-xs text-sidebar-foreground/50 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Manager Panel
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(({ path, icon: Icon, label, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group',
                isActive
                  ? 'bg-sidebar-primary text-white font-semibold shadow-lg'
                  : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  isActive ? "bg-white/20" : "bg-sidebar-accent group-hover:bg-sidebar-border"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-base">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="flex items-center gap-4 w-full px-4 py-4 rounded-2xl text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-sidebar-accent group-hover:bg-destructive/20 flex items-center justify-center transition-all">
            <LogOut className="w-5 h-5 group-hover:text-destructive" />
          </div>
          <span className="text-base">Log Out</span>
        </motion.button>
      </div>
    </aside>
  );
}
