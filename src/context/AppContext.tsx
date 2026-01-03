import React, { createContext, useContext, useState, ReactNode } from 'react';
import { userTickets as initialUserTickets, UserTicket } from '@/data/mockData';

type UserRole = 'user' | 'manager' | null;
type Genre = 'music' | 'sports' | 'theater';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  selectedGenres: Genre[];
  setSelectedGenres: (genres: Genre[]) => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;
  userTickets: UserTicket[];
  setUserTickets: React.Dispatch<React.SetStateAction<UserTicket[]>>;
  addTicket: (ticket: UserTicket) => void;
  updateTicketForSale: (ticketId: string, isForSale: boolean, salePrice?: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [userTickets, setUserTickets] = useState<UserTicket[]>(initialUserTickets);

  const addTicket = (ticket: UserTicket) => {
    setUserTickets(prev => [...prev, ticket]);
  };

  const updateTicketForSale = (ticketId: string, isForSale: boolean, salePrice?: number) => {
    setUserTickets(prev =>
      prev.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, isForSale, salePrice }
          : ticket
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        selectedGenres,
        setSelectedGenres,
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
        userTickets,
        setUserTickets,
        addTicket,
        updateTicketForSale
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
