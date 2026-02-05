 import { useState } from 'react';
 import { motion } from 'framer-motion';
 import { ArrowLeft, Users, Clock, CheckCircle, XCircle, Copy, Check, Share2 } from 'lucide-react';
 import { useNavigate, useParams } from 'react-router-dom';
 import { BottomNav } from '@/components/BottomNav';
 
 interface Participant {
   id: string;
   name: string;
   email: string;
   hasPaid: boolean;
   ticketCount: number;
 }
 
 // Mock data for group purchase
 const mockGroupPurchase = {
   id: 'gp-123',
   eventTitle: 'Taylor Swift - Eras Tour',
   eventDate: '2024-08-15',
   organizer: 'John Doe',
   pricePerTicket: 350,
   totalTickets: 5,
   expiresAt: new Date(Date.now() + 8 * 60 * 1000), // 8 minutes from now
   participants: [
     { id: '1', name: 'John Doe (You)', email: 'john@example.com', hasPaid: true, ticketCount: 2 },
     { id: '2', name: 'Sarah Smith', email: 'sarah@example.com', hasPaid: true, ticketCount: 1 },
     { id: '3', name: 'Mike Wilson', email: 'mike@example.com', hasPaid: false, ticketCount: 1 },
     { id: '4', name: 'Emily Brown', email: 'emily@example.com', hasPaid: false, ticketCount: 1 },
   ] as Participant[],
 };
 
 export default function GroupPurchaseStatus() {
   const { id } = useParams();
   const navigate = useNavigate();
   const [copied, setCopied] = useState(false);
 
   const groupLink = `https://tickeasy.com/join/${id}`;
   const paidCount = mockGroupPurchase.participants.filter(p => p.hasPaid).length;
   const totalParticipants = mockGroupPurchase.participants.length;
   const paidTickets = mockGroupPurchase.participants.filter(p => p.hasPaid).reduce((sum, p) => sum + p.ticketCount, 0);
 
   const copyLink = () => {
     navigator.clipboard.writeText(groupLink);
     setCopied(true);
     setTimeout(() => setCopied(false), 2000);
   };
 
   return (
     <div className="min-h-screen bg-background pb-24">
       {/* Header */}
       <div className="bg-gradient-hero pt-12 pb-6 px-4">
         <div className="max-w-lg mx-auto">
           <button
             onClick={() => navigate(-1)}
             className="mb-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
           >
             <ArrowLeft className="w-5 h-5" />
             <span>Back</span>
           </button>
           
           <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
             className="flex items-center gap-3"
           >
             <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
               <Users className="w-6 h-6 text-white" />
             </div>
             <div>
               <h1 className="text-2xl font-bold text-white">Group Purchase</h1>
               <p className="text-white/80 text-sm">Track payments & status</p>
             </div>
           </motion.div>
         </div>
       </div>
 
       <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
         {/* Event Info */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="card-elevated p-4"
         >
           <h2 className="font-bold text-foreground text-lg mb-2">{mockGroupPurchase.eventTitle}</h2>
           <p className="text-sm text-muted-foreground mb-3">{mockGroupPurchase.eventDate}</p>
           <div className="flex items-center justify-between text-sm">
             <span className="text-muted-foreground">Price per ticket:</span>
             <span className="font-bold text-primary">${mockGroupPurchase.pricePerTicket}</span>
           </div>
         </motion.div>
 
         {/* Progress */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="card-elevated p-4"
         >
           <div className="flex items-center justify-between mb-3">
             <span className="font-semibold text-foreground">Payment Progress</span>
             <span className="text-sm text-muted-foreground">{paidCount}/{totalParticipants} paid</span>
           </div>
           <div className="h-3 bg-muted rounded-full overflow-hidden">
             <motion.div
               initial={{ width: 0 }}
               animate={{ width: `${(paidCount / totalParticipants) * 100}%` }}
               transition={{ delay: 0.3, duration: 0.5 }}
               className="h-full bg-gradient-to-r from-success to-teal-400 rounded-full"
             />
           </div>
           <p className="text-xs text-muted-foreground mt-2">
             {paidTickets} of {mockGroupPurchase.totalTickets} tickets confirmed
           </p>
         </motion.div>
 
         {/* Share Link */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="card-elevated p-4"
         >
           <div className="flex items-center gap-2 mb-3">
             <Share2 className="w-5 h-5 text-primary" />
             <span className="font-semibold text-foreground">Invite Link</span>
           </div>
           <div className="flex items-center gap-2 p-3 bg-muted rounded-xl">
             <input
               type="text"
               value={groupLink}
               readOnly
               className="flex-1 bg-transparent text-sm text-foreground truncate"
             />
             <button
               onClick={copyLink}
               className="p-2 btn-primary-gradient rounded-xl"
             >
               {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
             </button>
           </div>
         </motion.div>
 
         {/* Participants List */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="card-elevated p-4"
         >
           <h3 className="font-semibold text-foreground mb-4">Participants</h3>
           <div className="space-y-3">
             {mockGroupPurchase.participants.map((participant, index) => (
               <motion.div
                 key={participant.id}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.4 + index * 0.1 }}
                 className="flex items-center justify-between p-3 bg-muted rounded-xl"
               >
                 <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                     participant.hasPaid ? 'bg-success' : 'bg-muted-foreground'
                   }`}>
                     {participant.name.charAt(0)}
                   </div>
                   <div>
                     <p className="font-medium text-foreground text-sm">{participant.name}</p>
                     <p className="text-xs text-muted-foreground">{participant.ticketCount} ticket{participant.ticketCount > 1 ? 's' : ''}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-2">
                   {participant.hasPaid ? (
                     <span className="flex items-center gap-1 text-success text-sm font-semibold">
                       <CheckCircle className="w-4 h-4" />
                       Paid
                     </span>
                   ) : (
                     <span className="flex items-center gap-1 text-warning text-sm font-semibold">
                       <Clock className="w-4 h-4" />
                       Pending
                     </span>
                   )}
                 </div>
               </motion.div>
             ))}
           </div>
         </motion.div>
 
         {/* Timer Warning */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
           className="bg-warning/10 border border-warning/20 rounded-2xl p-4 flex items-start gap-3"
         >
           <Clock className="w-5 h-5 text-warning shrink-0 mt-0.5" />
           <div>
             <p className="text-sm font-semibold text-foreground">Reservation expires soon</p>
             <p className="text-xs text-muted-foreground">
               All participants must complete payment before the timer expires or the reservation will be cancelled.
             </p>
           </div>
         </motion.div>
       </div>
 
       <BottomNav />
     </div>
   );
 }