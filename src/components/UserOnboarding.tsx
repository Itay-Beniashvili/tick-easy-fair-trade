import { useState } from 'react';
import { motion } from 'framer-motion';
 import { Music, Trophy, Mic, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { upsertPreferences } from '@/api/profile';
import { toast } from 'sonner';
import type { Genre } from '@/lib/recommend';

 type Category = 'music' | 'sports' | 'standup';
 type Artist = string;

 interface CategoryOption {
   id: Category;
   label: string;
   icon: typeof Music;
   color: string;
   artists: { id: string; name: string }[];
 }
 
 const categories: CategoryOption[] = [
   { 
     id: 'music', 
     label: 'Music', 
     icon: Music, 
     color: 'from-primary to-accent',
     artists: [
       { id: 'taylor-swift', name: 'Taylor Swift' },
       { id: 'coldplay', name: 'Coldplay' },
       { id: 'ed-sheeran', name: 'Ed Sheeran' },
     ]
   },
   { 
     id: 'sports', 
     label: 'Sports', 
     icon: Trophy, 
     color: 'from-success to-teal-400',
     artists: [
       { id: 'basketball', name: 'Basketball' },
       { id: 'football', name: 'Football' },
       { id: 'tennis', name: 'Tennis' },
     ]
   },
   { 
     id: 'standup', 
     label: 'Stand-up', 
     icon: Mic, 
     color: 'from-highlight to-purple-400',
     artists: [
       { id: 'shahar-hasson', name: 'Shahar Hasson' },
       { id: 'adir-miller', name: 'Adir Miller' },
       { id: 'israel-katorza', name: 'Israel Katorza' },
     ]
   },
];

export function UserOnboarding() {
   const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
   const [selectedArtists, setSelectedArtists] = useState<Artist[]>([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

   const toggleArtist = (artistId: string) => {
     setSelectedArtists(prev =>
       prev.includes(artistId)
         ? prev.filter(a => a !== artistId)
         : [...prev, artistId]
    );
  };

  const handleContinue = async () => {
    // Map the chosen category to a genre: music/sports as-is, standup -> theater.
    const selectedGenres: Genre[] = selectedCategory
      ? [(selectedCategory === 'standup' ? 'theater' : selectedCategory) as Genre]
      : [];
    setSaving(true);
    try {
      await upsertPreferences(selectedGenres, selectedArtists);
      navigate('/home');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

   const currentCategory = categories.find(c => c.id === selectedCategory);
 
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
           {!selectedCategory ? (
             <>
               <h1 className="text-2xl font-bold text-foreground mb-2">
                 What do you love? 🎉
               </h1>
               <p className="text-muted-foreground">
                 Select a category to see your options
               </p>
             </>
           ) : (
             <>
               <button 
                 onClick={() => setSelectedCategory(null)}
                 className="text-primary text-sm mb-2 hover:underline"
               >
                 ← Back to categories
               </button>
               <h1 className="text-2xl font-bold text-foreground mb-2">
                 Choose your favorites 🌟
               </h1>
               <p className="text-muted-foreground">
                 Select the {currentCategory?.label.toLowerCase()} you're interested in
               </p>
             </>
           )}
        </motion.div>
      </div>

       {/* Category / Artist Selection */}
      <div className="flex-1 p-6 space-y-4">
         {!selectedCategory ? (
           // Category Selection
           categories.map((category, index) => {
             const Icon = category.icon;
             return (
               <motion.button
                 key={category.id}
                 initial={{ opacity: 0, x: -30 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: index * 0.1, duration: 0.4 }}
                 onClick={() => setSelectedCategory(category.id)}
                 className="w-full p-5 rounded-2xl border-2 border-border bg-card hover:border-primary/30 hover:shadow-md transition-all text-left"
               >
                 <div className="flex items-center gap-4">
                   <div
                     className={cn(
                       'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br text-white',
                       category.color
                     )}
                   >
                     <Icon className="w-7 h-7" />
                   </div>
                   <div className="flex-1">
                     <h3 className="font-bold text-foreground text-lg">{category.label}</h3>
                     <p className="text-sm text-muted-foreground">
                       {category.artists.map(a => a.name).join(', ')}
                     </p>
                   </div>
                   <ArrowRight className="w-5 h-5 text-muted-foreground" />
                 </div>
               </motion.button>
             );
           })
         ) : (
           // Artist Selection
           currentCategory?.artists.map((artist, index) => {
             const isSelected = selectedArtists.includes(artist.id);
             return (
               <motion.button
                 key={artist.id}
                 initial={{ opacity: 0, x: -30 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: index * 0.1, duration: 0.4 }}
                 onClick={() => toggleArtist(artist.id)}
                 className={cn(
                   'w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left',
                   isSelected
                     ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                     : 'border-border bg-card hover:border-primary/30 hover:shadow-md'
                 )}
               >
                 <div className="flex items-center gap-4">
                   <div
                     className={cn(
                       'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all bg-gradient-to-br',
                       isSelected ? currentCategory.color : 'from-muted to-muted',
                       isSelected ? 'text-white' : 'text-muted-foreground'
                     )}
                   >
                     <span className="text-xl font-bold">{artist.name.charAt(0)}</span>
                   </div>
                   <div className="flex-1">
                     <h3 className="font-bold text-foreground text-lg">{artist.name}</h3>
                   </div>
                   <div
                     className={cn(
                       'w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all',
                       isSelected
                         ? 'border-primary bg-primary text-white scale-110'
                         : 'border-muted-foreground/30'
                     )}
                   >
                     {isSelected && <Check className="w-4 h-4" />}
                   </div>
                 </div>
               </motion.button>
             );
           })
         )}
       </div>
 
       {/* Continue Button */}
       <div className="p-6 pb-8">
         {selectedCategory && (
           <motion.button
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4, duration: 0.4 }}
             onClick={handleContinue}
             disabled={selectedArtists.length === 0 || saving}
             className={cn(
               'w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all',
               selectedArtists.length > 0
                 ? 'btn-primary-gradient'
                 : 'bg-muted text-muted-foreground cursor-not-allowed'
             )}
           >
             <span>Continue</span>
             <ArrowRight className="w-5 h-5" />
           </motion.button>
         )}
 
         <button
           onClick={() => navigate('/home')}
           className="w-full mt-3 py-3 text-muted-foreground text-sm hover:text-foreground transition-colors"
         >
           Skip for now
         </button>
       </div>
     </div>
   );
  }
