import { createContext, useContext, useState, ReactNode } from 'react';

type UserRole = 'user' | 'manager' | null;
type Genre = 'music' | 'sports' | 'theater';

// UI-only preferences. Authoritative ticket/auth state lives in Supabase
// (see AuthContext + the src/api data layer); this context holds only
// ephemeral client-side UI state not persisted to the database.
interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  selectedGenres: Genre[];
  setSelectedGenres: (genres: Genre[]) => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        selectedGenres,
        setSelectedGenres,
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
