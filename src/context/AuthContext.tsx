import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type Role = 'user' | 'manager';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: Role | null;
  loading: boolean;
  needsEmailVerification: boolean;
  signUp: (email: string, password: string, fullName: string, role: Role) => Promise<{ needsVerification: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchRole(userId: string): Promise<Role | null> {
  const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId);
  const roles = (data ?? []).map((r) => r.role);
  if (roles.includes('manager')) return 'manager';
  if (roles.includes('user')) return 'user';
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Synchronous listener first (no async work inside the callback — Supabase guidance).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        // Keep loading=true while the role resolves, so role-gated routes never see
        // a (loading=false, role=null) window right after sign-in and misfire.
        setLoading(true);
        setTimeout(() => {
          fetchRole(s.user.id).then((r) => { setRole(r); setLoading(false); });
        }, 0);
      } else {
        setRole(null);
        setLoading(false);
      }
    });
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      // Resolve the role BEFORE clearing loading, so role-gated routes don't
      // briefly see (loading=false, role=null) on reload and bounce to login.
      if (s?.user) setRole(await fetchRole(s.user.id));
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signUp: AuthContextType['signUp'] = async (email, password, fullName, role) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: redirectUrl, data: { full_name: fullName, role } },
    });
    if (error) throw new Error(error.message);
    // If email confirmation is required, there is no active session yet.
    return { needsVerification: !data.session };
  };

  const signIn: AuthContextType['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
  };

  const needsEmailVerification = !!user && !user.email_confirmed_at && !session;

  return (
    <AuthContext.Provider value={{ session, user, role, loading, needsEmailVerification, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
