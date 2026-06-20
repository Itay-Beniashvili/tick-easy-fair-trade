import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Wallet, Users, User, RefreshCcw, Ticket } from 'lucide-react';
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator,
} from '@/components/ui/command';
import { listEvents } from '@/api/events';
import { formatILS } from '@/lib/currency';
import type { EventRow } from '@/api/client';

const pages = [
  { label: 'Home', to: '/home', icon: Home },
  { label: 'My Tickets', to: '/wallet', icon: Wallet },
  { label: 'Resale Marketplace', to: '/marketplace', icon: RefreshCcw },
  { label: 'Community', to: '/community', icon: Users },
  { label: 'Profile', to: '/profile', icon: User },
];

/** Global ⌘K / Ctrl+K command palette: fuzzy-search events and jump to any page.
 *  Also opens on a `tickeasy:command` window event (dispatched by search buttons). */
export function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<EventRow[]>([]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        const t = e.target;
        if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement ||
            (t instanceof HTMLElement && t.isContentEditable)) return;
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const openEvt = () => setOpen(true);
    document.addEventListener('keydown', down);
    window.addEventListener('tickeasy:command', openEvt);
    return () => {
      document.removeEventListener('keydown', down);
      window.removeEventListener('tickeasy:command', openEvt);
    };
  }, []);

  // Lazy-load the catalogue the first time the palette opens.
  useEffect(() => {
    if (open && events.length === 0) listEvents().then(setEvents).catch(() => {});
  }, [open, events.length]);

  const run = useCallback((fn: () => void) => { setOpen(false); fn(); }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search events or jump to a page…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {events.length > 0 && (
          <CommandGroup heading="Events">
            {events.map((ev) => (
              <CommandItem
                key={ev.id}
                value={`${ev.title} ${ev.artist ?? ''} ${ev.venue} ${ev.city} ${ev.genre}`}
                onSelect={() => run(() => navigate(`/event/${ev.id}`))}
              >
                <Ticket className="text-gel" />
                <span className="flex-1 truncate">{ev.title}</span>
                <span className="font-mono text-xs text-muted-foreground">{formatILS(ev.price)}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        <CommandSeparator />
        <CommandGroup heading="Go to">
          {pages.map((p) => (
            <CommandItem key={p.to} value={`go ${p.label}`} onSelect={() => run(() => navigate(p.to))}>
              <p.icon />
              {p.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
