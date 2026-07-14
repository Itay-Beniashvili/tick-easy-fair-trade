import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Ticket, ArrowRight, Eye, EyeOff, Users } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getProfile } from '@/api/profile';
import { saveReturnPath, peekReturnPath, consumeReturnPath } from '@/lib/returnPath';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
  const isGroupInvite = !!(fromPath ?? peekReturnPath())?.startsWith('/group-purchase/');

  // Persist the return path so it survives a detour to /register and back
  // (email verification breaks the direct navigation chain).
  useEffect(() => {
    saveReturnPath(fromPath);
  }, [fromPath]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn(email, password);

      const returnTo = fromPath ?? consumeReturnPath();

      if (returnTo && returnTo.startsWith('/')) {
        navigate(returnTo, { replace: true });
        return;
      }

      // Auth already succeeded at this point — a profile-fetch failure here
      // is not a sign-in failure and must not surface a sign-in error toast.
      try {
        const profile = await getProfile();
        const hasPrefs =
          !!profile &&
          ((profile.preferred_genres?.length ?? 0) > 0 || (profile.preferred_artists?.length ?? 0) > 0);
        navigate(hasPrefs ? '/home' : '/onboarding', { replace: true });
      } catch {
        navigate('/home', { replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-hero">
      {/* Decorative circles */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-warning/20 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-accent/20 blur-3xl" />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 relative z-10"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-4">
          <Ticket className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold text-white mb-1">Welcome Back!</h1>
        <p className="text-white/70">Sign in to your account</p>
      </motion.div>

      {isGroupInvite && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="w-full max-w-sm relative z-10 mb-4 flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-4"
        >
          <Users className="w-5 h-5 text-white shrink-0" />
          <p className="text-sm text-white/90">
            You've been invited to a group purchase — sign in to join and pay your share.
          </p>
        </motion.div>
      )}

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 bg-card/70 border border-white/10 text-foreground placeholder:text-muted-foreground rounded-xl"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-12 bg-card/70 border border-white/10 text-foreground placeholder:text-muted-foreground rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 grid place-items-center rounded-lg text-muted-foreground hover:text-foreground focus-ring"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-xl btn-primary-gradient text-lg font-semibold"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-5 h-5 mr-2" />
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/70">
            Don't have an account?{' '}
            <Link to="/register" className="text-white font-semibold underline">
              Sign Up
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-white/50 text-sm hover:text-white/70 transition-colors">
            Back to role selection
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
