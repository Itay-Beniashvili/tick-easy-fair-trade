 import { useState } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { X, Send, MessageCircle, CheckCircle } from 'lucide-react';
 import { Input } from '@/components/ui/input';
 import { Textarea } from '@/components/ui/textarea';
 import { Button } from '@/components/ui/button';
 import { toast } from 'sonner';
 
 interface ContactManagerModalProps {
   isOpen: boolean;
   onClose: () => void;
   eventTitle: string;
 }
 
 export function ContactManagerModal({ isOpen, onClose, eventTitle }: ContactManagerModalProps) {
   const [subject, setSubject] = useState('');
   const [message, setMessage] = useState('');
   const [submitted, setSubmitted] = useState(false);
 
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     // Mock submission
     setSubmitted(true);
     toast.success('Message sent to event manager!');
     setTimeout(() => {
       onClose();
       setSubmitted(false);
       setSubject('');
       setMessage('');
     }, 2000);
   };
 
   if (!isOpen) return null;
 
   return (
     <AnimatePresence>
       <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center"
         onClick={onClose}
       >
         <motion.div
           initial={{ y: 100, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           exit={{ y: 100, opacity: 0 }}
           onClick={(e) => e.stopPropagation()}
           className="bg-card w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-elevated"
         >
           {/* Header */}
           <div className="flex items-center justify-between mb-6">
             <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
               <X className="w-5 h-5 text-muted-foreground" />
             </button>
             <h2 className="text-xl font-bold text-foreground">Contact Manager</h2>
             <div className="w-9" />
           </div>
 
           {submitted ? (
             <motion.div
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="text-center py-8"
             >
               <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                 <CheckCircle className="w-8 h-8 text-success" />
               </div>
               <h3 className="text-lg font-bold text-foreground mb-2">Message Sent!</h3>
               <p className="text-muted-foreground text-sm">The event manager will respond soon.</p>
             </motion.div>
           ) : (
             <>
               {/* Event Info */}
               <div className="bg-muted rounded-xl p-3 mb-4">
                 <p className="text-sm text-muted-foreground">Regarding:</p>
                 <p className="font-semibold text-foreground">{eventTitle}</p>
               </div>
 
               {/* Form */}
               <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                   <label className="text-sm font-medium text-foreground mb-1 block">Subject</label>
                   <Input
                     value={subject}
                     onChange={(e) => setSubject(e.target.value)}
                     placeholder="e.g., Question about seating"
                     className="rounded-xl"
                   />
                 </div>
 
                 <div>
                   <label className="text-sm font-medium text-foreground mb-1 block">Message</label>
                   <Textarea
                     value={message}
                     onChange={(e) => setMessage(e.target.value)}
                     placeholder="Write your message here..."
                     rows={4}
                     className="rounded-xl resize-none"
                   />
                 </div>
 
                 <Button
                   type="submit"
                   disabled={!subject.trim() || !message.trim()}
                   className="w-full h-12 rounded-xl btn-primary-gradient text-lg font-semibold"
                 >
                   <Send className="w-5 h-5 mr-2" />
                   Send Message
                 </Button>
               </form>
             </>
           )}
         </motion.div>
       </motion.div>
     </AnimatePresence>
   );
 }