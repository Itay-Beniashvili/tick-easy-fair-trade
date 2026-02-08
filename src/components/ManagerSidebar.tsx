import { LayoutDashboard, Inbox, BarChart3, Calendar, LogOut, Ticket } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

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
    <aside className="hidden lg:flex flex-col w-64 bg-sidebar text-sidebar-foreground h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-warm flex items-center justify-center">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">TickEasy</h1>
            <p className="text-xs text-sidebar-foreground/60">Manager Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                isActive
                  ? 'bg-sidebar-primary text-white font-medium'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
