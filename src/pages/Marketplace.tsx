 import { useState, useMemo } from 'react';
 import { motion } from 'framer-motion';
 import { ArrowLeft, RefreshCcw, Shield, CheckCircle, Music, Trophy, Mic } from 'lucide-react';
 import { useNavigate } from 'react-router-dom';
 import { events, genreLabels } from '@/data/mockData';
 import { BottomNav } from '@/components/BottomNav';
 import { cn } from '@/lib/utils';
 
 type Category = 'all' | 'music' | 'sports' | 'standup';
 
 const categoryConfig = {
   all: { label: 'All', icon: RefreshCcw },
   music: { label: 'Music', icon: Music },
   sports: { label: 'Sports', icon: Trophy },
   standup: { label: 'Stand-up', icon: Mic },
 };
 
 export default function Marketplace() {
   const navigate = useNavigate();
   const [selectedCategory, setSelectedCategory] = useState<Category>('all');
 
   const resaleEvents = useMemo(() => {
     return events.filter(e => e.resaleTickets.length > 0);
   }, []);
 
   const filteredEvents = useMemo(() => {
     if (selectedCategory === 'all') return resaleEvents;
     const genreMap: Record<string, string> = { music: 'music', sports: 'sports', standup: 'theater' };
     return resaleEvents.filter(e => e.genre === genreMap[selectedCategory]);
   }, [resaleEvents, selectedCategory]);
 
   return (
     <div className="min-h-screen bg-background pb-24">
       {/* Header */}
       <div className="bg-gradient-success pt-12 pb-6 px-4">
         <div className="max-w-lg mx-auto">
           <button
             onClick={() => navigate(-1)}
             className="mb-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
           >
             <ArrowLeft className="w-5 h-5" />
             <span>Back</span>
           </button>
           
           <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
             className="flex items-center gap-3"
           >
             <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
               <RefreshCcw className="w-6 h-6 text-white" />
             </div>
             <div>
               <h1 className="text-2xl font-bold text-white">Resale Marketplace</h1>
               <p className="text-white/80 text-sm">Verified second-hand tickets</p>
             </div>
           </motion.div>
         </div>
       </div>
 
       {/* Trust Banner */}
       <div className="max-w-lg mx-auto px-4 -mt-3">
         <div className="bg-success/10 border border-success/20 rounded-2xl p-3 flex items-center gap-3">
           <Shield className="w-5 h-5 text-success shrink-0" />
           <p className="text-xs text-foreground">
             All tickets are verified. Prices cannot exceed the original face value.
           </p>
         </div>
       </div>
 
       {/* Category Filter */}
       <div className="max-w-lg mx-auto px-4 py-4">
         <div className="flex gap-2 overflow-x-auto scrollbar-hide">
           {(Object.keys(categoryConfig) as Category[]).map((cat) => {
             const config = categoryConfig[cat];
             const Icon = config.icon;
             const isActive = selectedCategory === cat;
             return (
               <button
                 key={cat}
                 onClick={() => setSelectedCategory(cat)}
                 className={cn(
                   'flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all',
                   isActive
                     ? 'bg-success text-white'
                     : 'bg-muted text-muted-foreground hover:bg-muted/80'
                 )}
               >
                 <Icon className="w-4 h-4" />
                 {config.label}
               </button>
             );
           })}
         </div>
       </div>
 
       {/* Resale Listings */}
       <div className="max-w-lg mx-auto px-4 space-y-4">
         {filteredEvents.length === 0 ? (
           <div className="card-elevated p-8 text-center">
             <p className="text-muted-foreground">No resale tickets available in this category</p>
           </div>
         ) : (
           filteredEvents.map((event, eventIndex) => (
             <motion.div
               key={event.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: eventIndex * 0.1, duration: 0.4 }}
               className="card-elevated overflow-hidden"
             >
               {/* Event Header */}
               <div className="relative h-32 overflow-hidden">
                 <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                 <div className="absolute bottom-3 left-3 right-3">
                   <h3 className="text-white font-bold text-lg">{event.title}</h3>
                   <p className="text-white/70 text-sm">{event.venue}, {event.city}</p>
                 </div>
               </div>
 
               {/* Tickets */}
               <div className="p-4 space-y-3">
                 {event.resaleTickets.map((ticket) => (
                   <div key={ticket.id} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                     <div className="flex items-center gap-3">
                       <div className="verified-badge">
                         <CheckCircle className="w-3 h-3" />
                         Verified
                       </div>
                       <span className="text-sm text-muted-foreground">
                         Sec {ticket.section} · Row {ticket.row}
                       </span>
                     </div>
                     <div className="flex items-center gap-3">
                       <div className="text-right">
                         <p className="font-bold text-success">${ticket.resalePrice}</p>
                         {ticket.resalePrice < ticket.originalPrice && (
                           <p className="text-[10px] text-muted-foreground line-through">${ticket.originalPrice}</p>
                         )}
                       </div>
                       <button
                         onClick={() => navigate(`/event/${event.id}`)}
                         className="px-3 py-1.5 bg-success text-white text-sm font-semibold rounded-lg hover:bg-success/90 transition-colors"
                       >
                         Buy
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             </motion.div>
           ))
         )}
       </div>
 
       <BottomNav />
     </div>
   );
 }