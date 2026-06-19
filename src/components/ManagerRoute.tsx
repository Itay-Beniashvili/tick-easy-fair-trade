import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { toast } from '@/hooks/use-toast';

/**
 * Guards manager-only routes. Only users whose role is exactly 'manager'
 * may render the wrapped children. Anyone else is redirected to the
 * manager login screen with a toast explaining why.
 */
export function ManagerRoute({ children }: { children: ReactNode }) {
  const { role } = useApp();
  const location = useLocation();
  const isManager = role === 'manager';

  useEffect(() => {
    if (!isManager) {
      toast({
        title: 'Manager access required',
        description: 'You must be signed in as an Event Manager to view this page.',
        variant: 'destructive',
      });
    }
  }, [isManager]);

  if (!isManager) {
    return <Navigate to="/manager/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
