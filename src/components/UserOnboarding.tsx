import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Trophy, Theater, ArrowLeft, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

type Genre = 'music' | 'sports' | 'theater';

const genres: { id: Genre; label: string; icon: typeof Music; description: string }[] = [
  { id: 'music', label: 'מוזיקה', icon: Music, description: 'הופעות, פסטיבלים וקונצרטים' },
  { id: 'sports', label: 'ספורט', icon: Trophy, description: 'כדורגל, כדורסל ועוד' },
  { id: 'theater', label: 'תיאטרון', icon: Theater, description: 'הצגות, מחזות ומופעים' },
];

export function UserOnboarding() {
  const [selected, setSelected] = useState<Genre[]>([]);
  const { setSelectedGenres, setHasCompletedOnboarding } = useApp();
  const navigate = useNavigate();

  const toggleGenre = (genre: Genre) => {
    setSelected(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleContinue = () => {
    setSelectedGenres(selected);
    setHasCompletedOnboarding(true);
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">
            בוא נכיר אותך טוב יותר
          </h1>
          <p className="text-muted-foreground">
            בחר את הקטגוריות שמעניינות אותך כדי לקבל המלצות מותאמות אישית
          </p>
        </motion.div>
      </div>

      {/* Genre Selection */}
      <div className="flex-1 p-6 space-y-4">
        {genres.map((genre, index) => {
          const isSelected = selected.includes(genre.id);
          const Icon = genre.icon;

          return (
            <motion.button
              key={genre.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              onClick={() => toggleGenre(genre.id)}
              className={cn(
                'w-full p-5 rounded-2xl border-2 transition-all duration-200 text-right',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border bg-card hover:border-primary/30'
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">{genre.label}</h3>
                  <p className="text-sm text-muted-foreground">{genre.description}</p>
                </div>
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/30'
                  )}
                >
                  {isSelected && <Check className="w-4 h-4" />}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Continue Button */}
      <div className="p-6 pb-8">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          onClick={handleContinue}
          disabled={selected.length === 0}
          className={cn(
            'w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all',
            selected.length > 0
              ? 'btn-primary-gradient'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          <span>המשך</span>
          <ArrowLeft className="w-5 h-5" />
        </motion.button>

        <button
          onClick={() => {
            setHasCompletedOnboarding(true);
            navigate('/home');
          }}
          className="w-full mt-3 py-3 text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          דלג לעכשיו
        </button>
      </div>
    </div>
  );
}
