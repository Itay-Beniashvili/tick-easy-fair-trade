import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

/**
 * Guards manager-only routes. Only authenticated users whose role is exactly
 * 'manager' may render the wrapped children. Anyone else is redirected to the
 * manager login screen with a toast explaining why.
 */
export function ManagerRoute({ children }: { children: ReactNode }) {
  const { role, loading } = useAuth();
  const location = useLocation();
  const isManager = role === 'manager';

  useEffect(() => {
    if (!loading && !isManager) {
      toast({
        title: 'Manager access required',
        description: 'You must be signed in as an Event Manager to view this page.',
        variant: 'destructive',
      });
    }
  }, [isManager, loading]);

  if (loading) return null;
  if (!isManager) {
    return <Navigate to="/manager/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
