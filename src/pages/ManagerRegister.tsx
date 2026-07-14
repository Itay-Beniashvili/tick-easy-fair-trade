 import { useState } from 'react';
 import { motion } from 'framer-motion';
 import { Mail, Lock, User, Building2, Settings, ArrowRight, Eye, EyeOff } from 'lucide-react';
 import { Link, useNavigate } from 'react-router-dom';
 import { useAuth } from '@/context/AuthContext';
 import { toast } from 'sonner';
 import { Input } from '@/components/ui/input';
 import { Button } from '@/components/ui/button';
 import { supabase } from '@/integrations/supabase/client';

 export default function ManagerRegister() {
   const [name, setName] = useState('');
   const [company, setCompany] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [submitting, setSubmitting] = useState(false);
   const [verificationSent, setVerificationSent] = useState(false);
   const { signUp } = useAuth();
   const navigate = useNavigate();

   const handleRegister = async (e: React.FormEvent) => {
     e.preventDefault();
     setSubmitting(true);
     try {
       const { needsVerification } = await signUp(email, password, name, 'manager');
       if (needsVerification) {
         setVerificationSent(true);
       } else {
         navigate('/manager');
       }
     } catch (err) {
       toast.error(err instanceof Error ? err.message : 'Sign up failed');
     } finally {
       setSubmitting(false);
     }
   };

   const handleResendEmail = async () => {
     try {
       await supabase.auth.resend({ type: 'signup', email });
       toast.success('Confirmation email resent');
     } catch (err) {
       toast.error(err instanceof Error ? err.message : 'Failed to resend email');
     }
   };
 
   return (
     <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-manager">
       {/* Decorative circles */}
       <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl" />
       <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-accent/10 blur-3xl" />
       
       {/* Logo */}
       <motion.div
         initial={{ opacity: 0, y: -30 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.6 }}
         className="text-center mb-8 relative z-10"
       >
         <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
           <Settings className="w-8 h-8 text-white" />
         </div>
         <h1 className="text-3xl font-bold text-white mb-1">Join as Event Manager</h1>
         <p className="text-white/70">Create an account and start managing events</p>
       </motion.div>
 
       {/* Register Form */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.2, duration: 0.5 }}
         className="w-full max-w-sm relative z-10"
       >
         <form onSubmit={handleRegister} className="space-y-4">
           <div className="relative">
             <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
             <Input
               type="text"
               placeholder="Full name"
               value={name}
               onChange={(e) => setName(e.target.value)}
               className="pl-10 h-12 bg-white/10 border-white/20 rounded-xl text-white placeholder:text-muted-foreground"
             />
           </div>
 
           <div className="relative">
             <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
             <Input
               type="text"
               placeholder="Company / Production name"
               value={company}
               onChange={(e) => setCompany(e.target.value)}
               className="pl-10 h-12 bg-white/10 border-white/20 rounded-xl text-white placeholder:text-muted-foreground"
             />
           </div>
 
           <div className="relative">
             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
             <Input
               type="email"
               placeholder="Email address"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               className="pl-10 h-12 bg-white/10 border-white/20 rounded-xl text-white placeholder:text-muted-foreground"
             />
           </div>
           
           <div className="relative">
             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
             <Input
               type={showPassword ? 'text' : 'password'}
               placeholder="Password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="pl-10 pr-10 h-12 bg-white/10 border-white/20 rounded-xl text-white placeholder:text-muted-foreground"
             />
             <button
               type="button"
               onClick={() => setShowPassword(!showPassword)}
               className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
             >
               {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
             </button>
           </div>
 
           <Button
             type="submit"
             disabled={submitting}
             className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-lg font-semibold"
           >
             {submitting ? 'Signing up...' : 'Sign Up'}
             <ArrowRight className="w-5 h-5 mr-2" />
           </Button>
         </form>

         {verificationSent && (
           <div className="mt-4 p-4 rounded-xl bg-white/10 border border-white/20 text-center text-white text-sm">
             <p>Check your email to confirm your account</p>
             <button
               onClick={handleResendEmail}
               className="mt-3 text-sm text-gel underline underline-offset-4 hover:opacity-80 transition-opacity"
             >
               Resend email
             </button>
           </div>
         )}
 
         <div className="mt-6 text-center">
           <p className="text-white/70">
             Already have an account?{' '}
             <Link to="/manager/login" className="text-white font-semibold underline">
               Sign In
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