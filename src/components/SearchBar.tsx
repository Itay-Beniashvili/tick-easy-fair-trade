import { Search, MapPin, Calendar, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search events, artists, venues..."
          className="w-full py-4 px-12 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-md"
        />
      </div>
      
      {/* Quick Filters */}
      <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
        <button className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-warm text-white text-sm font-medium shadow-md">
          <Flame className="w-4 h-4" />
          Trending
        </button>
        <button className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-card border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors">
          <MapPin className="w-4 h-4" />
          Near Me
        </button>
        <button className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-card border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors">
          <Calendar className="w-4 h-4" />
          This Week
        </button>
      </div>
    </motion.div>
  );
}
